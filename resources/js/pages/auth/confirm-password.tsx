import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LoaderCircle } from 'lucide-react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

export default function ConfirmPassword() {
    const navigate                    = useNavigate();
    const [password, setPassword]     = useState('');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors]         = useState<{ password?: string }>({});

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});
        try {
            await axios.post('/confirm-password', { password });
            navigate('/');
        } catch (err: any) {
            const data = err?.response?.data?.errors;
            if (data) {
                setErrors({ password: data.password?.[0] });
            } else {
                setErrors({ password: err?.response?.data?.message ?? 'Confirmation failed.' });
            }
            setPassword('');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <AuthLayout
            title="Confirm your password"
            description="This is a secure area. Please confirm your password before continuing."
        >
            <form onSubmit={submit} className="flex flex-col gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        required
                        autoFocus
                        tabIndex={1}
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={processing}
                        placeholder="Password"
                    />
                    <InputError message={errors.password} />
                </div>

                <Button type="submit" className="w-full" tabIndex={2} disabled={processing}>
                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    Confirm password
                </Button>
            </form>
        </AuthLayout>
    );
}