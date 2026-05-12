import AppLayout from '@/layouts/app-layout';
import { useState, useEffect, useCallback } from 'react';
import { type BreadcrumbItem } from '@/types';
import axios from 'axios';
import { useFetch } from '@/hooks/useFetch';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Account Management', href: '/modules/account-management' },
];

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

const blankCreate = { name: '', email: '', password: '', role: 'charge_nurse', staff_number: '' };
const blankEdit   = { name: '', email: '', password: '', role: 'charge_nurse', staff_number: '' };

const initialData = {
    accounts: [] as Account[],
    staff:    [] as StaffOption[],
};

export default function AccountsIndex() {
    const { data, loading } = useFetch('/api/modules/account-management', initialData);

    const [accounts, setAccounts] = useState<Account[]>([]);
    const [staff, setStaff]       = useState<StaffOption[]>([]);
    const [modal, setModal]       = useState<null | 'create' | 'edit'>(null);
    const [selected, setSelected] = useState<Account | null>(null);
    const [search, setSearch]     = useState('');

    const [createFormData, setCreateFormData]             = useState({ ...blankCreate });
    const [createFormErrors, setCreateFormErrors]         = useState<Record<string, string>>({});
    const [createFormProcessing, setCreateFormProcessing] = useState(false);

    const [editFormData, setEditFormData]             = useState({ ...blankEdit });
    const [editFormErrors, setEditFormErrors]         = useState<Record<string, string>>({});
    const [editFormProcessing, setEditFormProcessing] = useState(false);

    useEffect(() => {
        if (data.accounts) setAccounts(data.accounts);
        if (data.staff)    setStaff(data.staff);
    }, [data]);

    const reloadData = useCallback(() => {
        axios.get('/api/modules/account-management').then(r => {
            if (r.data.accounts !== undefined) setAccounts(r.data.accounts);
            if (r.data.staff !== undefined)    setStaff(r.data.staff);
        });
    }, []);

    const filtered = accounts.filter(a =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.email.toLowerCase().includes(search.toLowerCase()) ||
        ROLE_LABELS[a.role]?.toLowerCase().includes(search.toLowerCase())
    );

    function openCreate() {
        setCreateFormData({ ...blankCreate });
        setCreateFormErrors({});
        setSelected(null);
        setModal('create');
    }

    function openEdit(a: Account) {
        setEditFormData({
            name: a.name, email: a.email, password: '', role: a.role, staff_number: a.staff_number ?? '',
        });
        setEditFormErrors({});
        setSelected(a);
        setModal('edit');
    }

    async function submitCreate(e: React.FormEvent) {
        e.preventDefault();
        setCreateFormProcessing(true);
        setCreateFormErrors({});
        try {
            await axios.post('/api/modules/account-management', createFormData);
            setModal(null);
            setCreateFormData({ ...blankCreate });
            reloadData();
        } catch (err: any) {
            const d = err?.response?.data?.errors ?? {};
            const f: Record<string, string> = {};
            Object.entries(d).forEach(([k, v]) => f[k] = (v as string[])[0]);
            setCreateFormErrors(f);
        } finally {
            setCreateFormProcessing(false);
        }
    }

    async function submitEdit(e: React.FormEvent) {
        e.preventDefault();
        setEditFormProcessing(true);
        setEditFormErrors({});
        try {
            await axios.put(`/api/modules/account-management/${selected!.id}`, editFormData);
            setModal(null);
            reloadData();
        } catch (err: any) {
            const d = err?.response?.data?.errors ?? {};
            const f: Record<string, string> = {};
            Object.entries(d).forEach(([k, v]) => f[k] = (v as string[])[0]);
            setEditFormErrors(f);
        } finally {
            setEditFormProcessing(false);
        }
    }

    async function destroy(id: number) {
        if (!confirm('Delete this account?')) return;
        await axios.delete(`/api/modules/account-management/${id}`);
        reloadData();
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col gap-4 p-4">

                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Account Management</h2>
                    <button onClick={openCreate}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                        + New Account
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="rounded-xl p-4 border border-gray-100 bg-gray-50">
                                <div className="h-3 w-24 rounded bg-gray-200 animate-pulse mb-2" />
                                <div className="h-7 w-12 rounded bg-gray-200 animate-pulse" />
                            </div>
                        ))
                    ) : (
                        <>
                            <StatCard label="Total Accounts"  value={accounts.length} color="blue" />
                            <StatCard label="Charge Nurses"   value={accounts.filter(a => a.role === 'charge_nurse').length} color="teal" />
                            <StatCard label="Linked to Staff" value={accounts.filter(a => a.staff_number).length} color="purple" />
                        </>
                    )}
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Accounts ({filtered.length})</p>
                        <input
                            type="text"
                            placeholder="Search…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-56 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                        />
                    </div>
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3 text-left">Name</th>
                                <th className="px-4 py-3 text-left">Email</th>
                                <th className="px-4 py-3 text-left">Role</th>
                                <th className="px-4 py-3 text-left">Staff Linked</th>
                                <th className="px-4 py-3 text-left">Created</th>
                                <th className="px-4 py-3 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        {Array.from({ length: 6 }).map((_, j) => (
                                            <td key={j} className="px-4 py-3">
                                                <div className="h-4 rounded bg-gray-100 animate-pulse" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <>
                                    {filtered.map(a => (
                                        <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{a.name}</td>
                                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{a.email}</td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${ROLE_COLORS[a.role] ?? 'bg-gray-100 text-gray-600'}`}>
                                                    {ROLE_LABELS[a.role] ?? a.role}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {a.staff
                                                    ? <span className="text-xs text-gray-700 dark:text-gray-300">{a.staff.first_name} {a.staff.last_name} <span className="text-gray-400">({a.staff_number})</span></span>
                                                    : <span className="text-gray-400 text-xs">—</span>
                                                }
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{a.created_at}</td>
                                            <td className="px-4 py-3 space-x-3">
                                                <button onClick={() => openEdit(a)} className="text-blue-600 hover:underline text-xs">Edit</button>
                                                <button onClick={() => destroy(a.id)} className="text-red-500 hover:underline text-xs">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filtered.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">No accounts found.</td>
                                        </tr>
                                    )}
                                </>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {modal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setModal(null)}>
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                {modal === 'create' ? 'New Account' : `Edit — ${selected?.name}`}
                            </h3>
                            <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
                        </div>

                        <form onSubmit={modal === 'create' ? submitCreate : submitEdit} className="space-y-4">
                            {modal === 'create' ? (
                                <>
                                    <Field label="Full Name" error={createFormErrors.name}>
                                        <input value={createFormData.name}
                                            onChange={e => setCreateFormData(p => ({ ...p, name: e.target.value }))}
                                            className={inp} placeholder="e.g. Moira Samuel" />
                                    </Field>
                                    <Field label="Email" error={createFormErrors.email}>
                                        <input type="email" value={createFormData.email}
                                            onChange={e => setCreateFormData(p => ({ ...p, email: e.target.value }))}
                                            className={inp} placeholder="e.g. moira@wellmeadows.com" />
                                    </Field>
                                    <Field label="Password" error={createFormErrors.password}>
                                        <input type="password" value={createFormData.password}
                                            onChange={e => setCreateFormData(p => ({ ...p, password: e.target.value }))}
                                            className={inp} placeholder="Min. 8 characters" />
                                    </Field>
                                    <Field label="Role" error={createFormErrors.role}>
                                        <select value={createFormData.role}
                                            onChange={e => setCreateFormData(p => ({ ...p, role: e.target.value }))}
                                            className={inp}>
                                            {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                        </select>
                                    </Field>
                                    <Field label="Link to Staff (optional)" error={createFormErrors.staff_number}>
                                        <select value={createFormData.staff_number}
                                            onChange={e => setCreateFormData(p => ({ ...p, staff_number: e.target.value }))}
                                            className={inp}>
                                            <option value="">— Not linked —</option>
                                            {staff.map(s => <option key={s.staff_number} value={s.staff_number}>{s.first_name} {s.last_name} ({s.staff_number})</option>)}
                                        </select>
                                    </Field>
                                </>
                            ) : (
                                <>
                                    <Field label="Full Name" error={editFormErrors.name}>
                                        <input value={editFormData.name}
                                            onChange={e => setEditFormData(p => ({ ...p, name: e.target.value }))}
                                            className={inp} />
                                    </Field>
                                    <Field label="Email" error={editFormErrors.email}>
                                        <input type="email" value={editFormData.email}
                                            onChange={e => setEditFormData(p => ({ ...p, email: e.target.value }))}
                                            className={inp} />
                                    </Field>
                                    <Field label="New Password (leave blank to keep)" error={editFormErrors.password}>
                                        <input type="password" value={editFormData.password}
                                            onChange={e => setEditFormData(p => ({ ...p, password: e.target.value }))}
                                            className={inp} placeholder="Leave blank to keep current" />
                                    </Field>
                                    <Field label="Role" error={editFormErrors.role}>
                                        <select value={editFormData.role}
                                            onChange={e => setEditFormData(p => ({ ...p, role: e.target.value }))}
                                            className={inp}>
                                            {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                        </select>
                                    </Field>
                                    <Field label="Link to Staff (optional)" error={editFormErrors.staff_number}>
                                        <select value={editFormData.staff_number}
                                            onChange={e => setEditFormData(p => ({ ...p, staff_number: e.target.value }))}
                                            className={inp}>
                                            <option value="">— Not linked —</option>
                                            {staff.map(s => <option key={s.staff_number} value={s.staff_number}>{s.first_name} {s.last_name} ({s.staff_number})</option>)}
                                        </select>
                                    </Field>
                                </>
                            )}

                            <div className="flex gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                                <button type="submit"
                                    disabled={modal === 'create' ? createFormProcessing : editFormProcessing}
                                    className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                    {modal === 'create'
                                        ? (createFormProcessing ? 'Creating…' : 'Create Account')
                                        : (editFormProcessing   ? 'Saving…'   : 'Save Changes')}
                                </button>
                                <button type="button" onClick={() => setModal(null)}
                                    className="px-5 py-2 text-sm text-gray-600 dark:text-gray-400 hover:underline">Cancel</button>
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
        <div className={`rounded-xl p-4 border ${colors[color]}`}>
            <p className="text-xs opacity-70">{label}</p>
            <p className="text-2xl font-semibold mt-1">{value}</p>
        </div>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
            {children}
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}

const inp = 'w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100';