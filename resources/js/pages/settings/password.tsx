import { useState, FormEvent } from 'react';
import axios from 'axios';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type BreadcrumbItem } from '@/types';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Settings', href: '/settings' },
    { title: 'Password', href: '/settings/password' },
];

export default function PasswordSettings() {
    const [current, setCurrent]   = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm]   = useState('');
    const [status, setStatus]     = useState('');
    const [errors, setErrors]     = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true); setErrors({}); setStatus('');
        try {
            await axios.put('/settings/password', {
                current_password: current,
                password,
                password_confirmation: confirm,
            });
            setStatus('Password updated.');
            setCurrent(''); setPassword(''); setConfirm('');
        } catch (err: any) {
            const d = err?.response?.data?.errors ?? {};
            const f: Record<string, string> = {};
            Object.entries(d).forEach(([k, v]) => f[k] = (v as string[])[0]);
            setErrors(f);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <SettingsLayout>
            <div className="max-w-md">
                <h2 className="text-xl font-semibold mb-6">Change Password</h2>
                {status && <div className="mb-4 text-sm text-green-600">{status}</div>}
                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="current_password">Current Password</Label>
                        <Input id="current_password" type="password" value={current} onChange={e => setCurrent(e.target.value)} required />
                        {errors.current_password && <p className="text-xs text-red-500">{errors.current_password}</p>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">New Password</Label>
                        <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                        {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Confirm New Password</Label>
                        <Input id="password_confirmation" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
                    </div>
                    <Button type="submit" disabled={processing}>
                        {processing ? 'Saving…' : 'Update password'}
                    </Button>
                </form>
            </div>
            </SettingsLayout>
        </AppLayout>
    );
}
