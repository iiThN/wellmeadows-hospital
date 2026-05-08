import AppLayout from '@/layouts/app-layout';
import { router, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';

interface StaffOption {
    staff_number: string;
    first_name: string;
    last_name: string;
}

interface Account {
    id: number;
    name: string;
    email: string;
    role: string;
    staff_number: string | null;
    created_at: string;
    staff: StaffOption | null;
}

const ROLE_OPTIONS = [
    { value: 'personnel_officer', label: 'Personnel Officer' },
    { value: 'charge_nurse',      label: 'Charge Nurse' },
    { value: 'medical_director',  label: 'Medical Director' },
];

const ROLE_LABELS: Record<string, string> = {
    personnel_officer: 'Personnel Officer',
    charge_nurse:      'Charge Nurse',
    medical_director:  'Medical Director',
};

const ROLE_COLORS: Record<string, string> = {
    personnel_officer: 'bg-blue-100 text-blue-700',
    charge_nurse:      'bg-teal-100 text-teal-700',
    medical_director:  'bg-purple-100 text-purple-700',
};

export default function AccountsIndex({
    accounts,
    staff,
}: {
    accounts: Account[];
    staff: StaffOption[];
}) {
    const [modal, setModal]       = useState<null | 'create' | 'edit'>(null);
    const [selected, setSelected] = useState<Account | null>(null);
    const [search, setSearch]     = useState('');

    useEffect(() => {
        setModal(null);
    }, []);

    const createForm = useForm({
        name: '', email: '', password: '', role: 'charge_nurse', staff_number: '',
    });

    const editForm = useForm({
        name: '', email: '', password: '', role: 'charge_nurse', staff_number: '',
    });

    const filtered = accounts.filter(a =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.email.toLowerCase().includes(search.toLowerCase()) ||
        ROLE_LABELS[a.role]?.toLowerCase().includes(search.toLowerCase())
    );

    function openCreate() {
        createForm.reset();
        setSelected(null);
        setModal('create');
    }

    function openEdit(a: Account) {
        editForm.setData({
            name:         a.name,
            email:        a.email,
            password:     '',
            role:         a.role,
            staff_number: a.staff_number ?? '',
        });
        setSelected(a);
        setModal('edit');
    }

    function submitCreate(e: React.FormEvent) {
        e.preventDefault();
        createForm.post('/modules/account-management', {
            preserveState: false,
            preserveScroll: true,
            onSuccess: () => {
                setModal(null);
                createForm.reset();
            },
        });
    }

    function submitEdit(e: React.FormEvent) {
        e.preventDefault();
        editForm.put(`/modules/account-management/${selected!.id}`, {
            preserveState: false,
            preserveScroll: true,
            onSuccess: () => {
                setModal(null);
            },
        });
    }

    function destroy(id: number) {
        if (confirm('Delete this account?')) {
            router.delete(`/modules/account-management/${id}`);
        }
    }

    return (
        <AppLayout>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Account Management</h2>
                <button
                    onClick={openCreate}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                >
                    + New Account
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <StatCard label="Total Accounts" value={accounts.length} color="blue" />
                <StatCard label="Charge Nurses" value={accounts.filter(a => a.role === 'charge_nurse').length} color="teal" />
                <StatCard label="Linked to Staff" value={accounts.filter(a => a.staff_number).length} color="purple" />
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-700">Accounts ({filtered.length})</p>
                    <input
                        type="text"
                        placeholder="Search…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
                    />
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                        <tr>
                            <th className="px-4 py-3 text-left">Name</th>
                            <th className="px-4 py-3 text-left">Email</th>
                            <th className="px-4 py-3 text-left">Role</th>
                            <th className="px-4 py-3 text-left">Staff Linked</th>
                            <th className="px-4 py-3 text-left">Created</th>
                            <th className="px-4 py-3 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filtered.map(a => (
                            <tr key={a.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium">{a.name}</td>
                                <td className="px-4 py-3 text-gray-500">{a.email}</td>
                                <td className="px-4 py-3">
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${ROLE_COLORS[a.role] ?? 'bg-gray-100 text-gray-600'}`}>
                                        {ROLE_LABELS[a.role] ?? a.role}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    {a.staff
                                        ? <span className="text-xs text-gray-700">{a.staff.first_name} {a.staff.last_name} <span className="text-gray-400">({a.staff_number})</span></span>
                                        : <span className="text-gray-400 text-xs">—</span>
                                    }
                                </td>
                                <td className="px-4 py-3 text-gray-500 text-xs">{a.created_at}</td>
                                <td className="px-4 py-3 space-x-3">
                                    <button onClick={() => openEdit(a)} className="text-blue-600 hover:underline text-xs">Edit</button>
                                    <button onClick={() => destroy(a.id)} className="text-red-500 hover:underline text-xs">Delete</button>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                                    No accounts found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {modal && (
                <div
                    className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                    onClick={() => setModal(null)}
                >
                    <div
                        className="bg-white rounded-xl shadow-xl w-full max-w-md p-6"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-semibold text-gray-800">
                                {modal === 'create' ? 'New Account' : `Edit — ${selected?.name}`}
                            </h3>
                            <button
                                onClick={() => setModal(null)}
                                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                            >
                                ×
                            </button>
                        </div>

                        <form
                            onSubmit={modal === 'create' ? submitCreate : submitEdit}
                            className="space-y-4"
                        >
                            {modal === 'create' ? (
                                <>
                                    <Field label="Full Name" error={createForm.errors.name}>
                                        <input
                                            value={createForm.data.name}
                                            onChange={e => createForm.setData('name', e.target.value)}
                                            className={inp}
                                            placeholder="e.g. Moira Samuel"
                                        />
                                    </Field>
                                    <Field label="Email" error={createForm.errors.email}>
                                        <input
                                            type="email"
                                            value={createForm.data.email}
                                            onChange={e => createForm.setData('email', e.target.value)}
                                            className={inp}
                                            placeholder="e.g. moira@wellmeadows.com"
                                        />
                                    </Field>
                                    <Field label="Password" error={createForm.errors.password}>
                                        <input
                                            type="password"
                                            value={createForm.data.password}
                                            onChange={e => createForm.setData('password', e.target.value)}
                                            className={inp}
                                            placeholder="Min. 8 characters"
                                        />
                                    </Field>
                                    <Field label="Role" error={createForm.errors.role}>
                                        <select
                                            value={createForm.data.role}
                                            onChange={e => createForm.setData('role', e.target.value)}
                                            className={inp}
                                        >
                                            {ROLE_OPTIONS.map(r => (
                                                <option key={r.value} value={r.value}>{r.label}</option>
                                            ))}
                                        </select>
                                    </Field>
                                    <Field label="Link to Staff (optional)" error={createForm.errors.staff_number}>
                                        <select
                                            value={createForm.data.staff_number}
                                            onChange={e => createForm.setData('staff_number', e.target.value)}
                                            className={inp}
                                        >
                                            <option value="">— Not linked —</option>
                                            {staff.map(s => (
                                                <option key={s.staff_number} value={s.staff_number}>
                                                    {s.first_name} {s.last_name} ({s.staff_number})
                                                </option>
                                            ))}
                                        </select>
                                    </Field>
                                </>
                            ) : (
                                <>
                                    <Field label="Full Name" error={editForm.errors.name}>
                                        <input
                                            value={editForm.data.name}
                                            onChange={e => editForm.setData('name', e.target.value)}
                                            className={inp}
                                        />
                                    </Field>
                                    <Field label="Email" error={editForm.errors.email}>
                                        <input
                                            type="email"
                                            value={editForm.data.email}
                                            onChange={e => editForm.setData('email', e.target.value)}
                                            className={inp}
                                        />
                                    </Field>
                                    <Field label="New Password (leave blank to keep)" error={editForm.errors.password}>
                                        <input
                                            type="password"
                                            value={editForm.data.password}
                                            onChange={e => editForm.setData('password', e.target.value)}
                                            className={inp}
                                            placeholder="Leave blank to keep current"
                                        />
                                    </Field>
                                    <Field label="Role" error={editForm.errors.role}>
                                        <select
                                            value={editForm.data.role}
                                            onChange={e => editForm.setData('role', e.target.value)}
                                            className={inp}
                                        >
                                            {ROLE_OPTIONS.map(r => (
                                                <option key={r.value} value={r.value}>{r.label}</option>
                                            ))}
                                        </select>
                                    </Field>
                                    <Field label="Link to Staff (optional)" error={editForm.errors.staff_number}>
                                        <select
                                            value={editForm.data.staff_number}
                                            onChange={e => editForm.setData('staff_number', e.target.value)}
                                            className={inp}
                                        >
                                            <option value="">— Not linked —</option>
                                            {staff.map(s => (
                                                <option key={s.staff_number} value={s.staff_number}>
                                                    {s.first_name} {s.last_name} ({s.staff_number})
                                                </option>
                                            ))}
                                        </select>
                                    </Field>
                                </>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={modal === 'create' ? createForm.processing : editForm.processing}
                                    className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {modal === 'create'
                                        ? (createForm.processing ? 'Creating…' : 'Create Account')
                                        : (editForm.processing   ? 'Saving…'   : 'Save Changes')
                                    }
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setModal(null)}
                                    className="px-5 py-2 text-sm text-gray-600 hover:underline"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
    const colors: Record<string, string> = {
        blue:   'bg-blue-50 text-blue-700 border-blue-100',
        teal:   'bg-teal-50 text-teal-700 border-teal-100',
        purple: 'bg-purple-50 text-purple-700 border-purple-100',
    };
    return (
        <div className={`rounded-xl p-5 border ${colors[color]}`}>
            <p className="text-sm opacity-70">{label}</p>
            <p className="text-3xl font-semibold mt-1">{value}</p>
        </div>
    );
}

const inp = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            {children}
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}