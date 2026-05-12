import { useState, FormEvent } from 'react';
import axios from 'axios';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { LoaderCircle } from 'lucide-react';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [processing, setProcessing] = useState(false);
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setError('');
        try {
            const res = await axios.post('/forgot-password', { email });
            setStatus(res.data?.status ?? 'Reset link sent.');
        } catch (err: any) {
            setError(err?.response?.data?.errors?.email?.[0] ?? 'Something went wrong.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <AuthLayout title="Forgot password" description="Enter your email to receive a reset link">
            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                        id="email"
                        type="email"
                        required
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@example.com"
                    />
                    <InputError message={error} />
                </div>
                <Button type="submit" disabled={processing}>
                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    Send reset link
                </Button>
            </form>
        </AuthLayout>
    );
}
