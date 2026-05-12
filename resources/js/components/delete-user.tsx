import { useState, useRef, FormEvent } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import HeadingSmall from '@/components/heading-small';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function DeleteUser() {
    const { logout } = useAuth();
    const passwordInput = useRef<HTMLInputElement>(null);
    const [password, setPassword]   = useState('');
    const [error, setError]         = useState('');
    const [processing, setProcessing] = useState(false);
    const [open, setOpen]           = useState(false);

    const deleteUser = async (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true); setError('');
        try {
            await axios.delete('/settings/profile', { data: { password } });
            await logout();
        } catch (err: any) {
            setError(err?.response?.data?.errors?.password?.[0] ?? 'Failed to delete account.');
            passwordInput.current?.focus();
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4 rounded-lg border border-red-100 bg-red-50 p-4 dark:border-red-200/10 dark:bg-red-700/10">
                <div className="relative space-y-0.5 text-red-600 dark:text-red-100">
                    <p className="font-medium">Warning</p>
                    <p className="text-sm">Please proceed with caution, this cannot be undone.</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button variant="destructive">Delete account</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogTitle>Are you sure you want to delete your account?</DialogTitle>
                        <DialogDescription>
                            Once your account is deleted, all of its resources and data will be permanently deleted. Enter your password to confirm.
                        </DialogDescription>
                        <form className="space-y-6" onSubmit={deleteUser}>
                            <div className="grid gap-2">
                                <Label htmlFor="password" className="sr-only">Password</Label>
                                <Input id="password" type="password" ref={passwordInput} value={password}
                                    onChange={e => setPassword(e.target.value)} placeholder="Password" autoComplete="current-password" />
                                <InputError message={error} />
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="secondary" onClick={() => { setPassword(''); setError(''); }}>Cancel</Button>
                                </DialogClose>
                                <Button variant="destructive" disabled={processing} asChild>
                                    <button type="submit">Delete account</button>
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
