import { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type BreadcrumbItem } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Settings', href: '/settings' },
    { title: 'Profile', href: '/settings/profile' },
];

export default function ProfileSettings() {
    const { user, refresh } = useAuth();
    const [name, setName]   = useState(user?.name ?? '');
    const [email, setEmail] = useState(user?.email ?? '');
    const [status, setStatus]     = useState('');
    const [errors, setErrors]     = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (user) { setName(user.name); setEmail(user.email ?? ''); }
    }, [user]);

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true); setErrors({}); setStatus('');
        try {
            await axios.patch('/settings/profile', { name, email });
            await refresh();
            setStatus('Profile updated.');
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
                <h2 className="text-xl font-semibold mb-6">Profile</h2>
                {status && <div className="mb-4 text-sm text-green-600">{status}</div>}
                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
                        {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                        {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                    </div>
                    <Button type="submit" disabled={processing}>
                        {processing ? 'Saving…' : 'Save changes'}
                    </Button>
                </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
