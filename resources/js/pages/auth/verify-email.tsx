import { useState, FormEvent } from 'react';
import { LoaderCircle } from 'lucide-react';
import axios from 'axios';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/auth-layout';

export default function VerifyEmail() {
    const { logout }                  = useAuth();
    const [processing, setProcessing] = useState(false);
    const [sent, setSent]             = useState(false);

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        try {
            await axios.post('/email/verification-notification');
            setSent(true);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <AuthLayout
            title="Verify email"
            description="Please verify your email address by clicking on the link we just emailed to you."
        >
            {sent && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    A new verification link has been sent to the email address you provided during registration.
                </div>
            )}

            <form onSubmit={submit} className="space-y-6 text-center">
                <Button type="submit" disabled={processing} variant="secondary">
                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    Resend verification email
                </Button>

                <button
                    type="button"
                    onClick={logout}
                    className="mx-auto block text-sm text-muted-foreground underline decoration-neutral-300 underline-offset-4 hover:decoration-current"
                >
                    Log out
                </button>
            </form>
        </AuthLayout>
    );
}