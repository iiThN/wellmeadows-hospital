import AppLayout from '@/layouts/app-layout';
import { useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import axios from 'axios';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Staff Management', href: '/modules/staff-management' },
];

interface Staff {
    staff_number: string;
    first_name: string;
    last_name: string;
    telephone: string;
    sex: string;
    contract_type: string;
    current_salary: number;
    address: string;
    date_of_birth: string;
    nin: string;
    salary_scale: string;
    pay_type: string;
    hours_per_week: number;
    qualifications: { id: number; qual_type: string; date_obtained: string; institution: string }[];
    workExperiences: { id: number; position: string; organization: string; start_date: string; finish_date: string }[];
    rotas: { rota_id: number; week_beginning: string; shift: string; ward_number: number }[];
}

type Tab   = 'details' | 'qualifications' | 'experience' | 'shifts';
type Modal = null | 'create' | 'edit';

export default function StaffManagement({ staff }: { staff: Staff[] }) {
    const [selected, setSelected]     = useState<Staff | null>(null);
    const [tab, setTab]               = useState<Tab>('details');
    const [modal, setModal]           = useState<Modal>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [search, setSearch]         = useState('');

    useEffect(() => { setModal(null); }, []);

    const createForm = useForm({
        staff_number:  '',
        first_name:    '',
        last_name:     '',
        address:       '',
        telephone:     '',
        date_of_birth: '',
        sex:           'Male',
        nin:           '',
        current_salary:  '',
        salary_scale:    '',
        pay_type:        'Monthly',
        hours_per_week:  '',
        contract_type:   'Permanent',
    });

    const editForm = useForm({
        first_name:    '',
        last_name:     '',
        address:       '',
        telephone:     '',
        date_of_birth: '',
        sex:           'Male',
        nin:           '',
        current_salary:  '',
        salary_scale:    '',
        pay_type:        'Monthly',
        hours_per_week:  '',
        contract_type:   'Permanent',
    });

    async function selectStaff(s: Staff) {
        if (selected?.staff_number === s.staff_number) return;
        setLoadingDetail(true);
        setTab('details');
        try {
            const res = await axios.get(`/modules/staff-management/${s.staff_number}/details`);
            setSelected(res.data);
        } catch {
            setSelected(s);
        } finally {
            setLoadingDetail(false);
        }
    }

    function openCreate() {
        createForm.reset();
        setModal('create');
    }

    function openEdit(s: Staff) {
        editForm.setData({
            first_name:    s.first_name,
            last_name:     s.last_name,
            address:       s.address ?? '',
            telephone:     s.telephone ?? '',
            date_of_birth: s.date_of_birth,
            sex:           s.sex,
            nin:           s.nin ?? '',
            current_salary:  String(s.current_salary),
            salary_scale:    s.salary_scale ?? '',
            pay_type:        s.pay_type,
            hours_per_week:  String(s.hours_per_week),
            contract_type:   s.contract_type,
        });
        setModal('edit');
    }

    function submitCreate(e: React.FormEvent) {
        e.preventDefault();
        createForm.post('/modules/staff-management', {
            preserveScroll: true,
            onSuccess: () => { setModal(null); createForm.reset(); },
        });
    }

    function submitEdit(e: React.FormEvent) {
        e.preventDefault();
        editForm.put(`/modules/staff-management/${selected!.staff_number}`, {
            preserveScroll: true,
            onSuccess: () => { setModal(null); },
        });
    }

    function destroy(id: string, e: React.MouseEvent) {
        e.stopPropagation();
        if (confirm('Delete this staff member?')) {
            router.delete(`/modules/staff-management/${id}`, { preserveScroll: true });
        }
    }

    const filtered = staff.filter(s => {
        const name = `${s.first_name} ${s.last_name}`.toLowerCase();
        return name.includes(search.toLowerCase()) || s.staff_number.toLowerCase().includes(search.toLowerCase());
    });

    const tabs: { id: Tab; label: string }[] = [
        { id: 'details',        label: 'Details' },
        { id: 'qualifications', label: 'Qualifications' },
        { id: 'experience',     label: 'Experience' },
        { id: 'shifts',         label: 'Shifts' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Staff Management" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">

                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Staff Management</h2>
                    <button onClick={openCreate}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                        + Add Staff
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                    <StatCard label="Total Staff"  value={staff.length} color="blue" />
                    <StatCard label="Permanent"    value={staff.filter(s => s.contract_type === 'Permanent').length}  color="teal" />
                    <StatCard label="Temporary"    value={staff.filter(s => s.contract_type === 'Temporary').length}  color="amber" />
                    <StatCard label="Full-Time"    value={staff.filter(s => s.hours_per_week >= 35).length} color="purple" />
                </div>

                <div className="grid grid-cols-2 gap-6 items-start">
                    {/* Staff list */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Staff ({filtered.length})</p>
                            <input
                                placeholder="Search…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-40 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                            />
                        </div>
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3 text-left">ID</th>
                                    <th className="px-4 py-3 text-left">Name</th>
                                    <th className="px-4 py-3 text-left">Contract</th>
                                    <th className="px-4 py-3 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filtered.map(s => (
                                    <tr
                                        key={s.staff_number}
                                        onClick={() => selectStaff(s)}
                                        className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${selected?.staff_number === s.staff_number ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}
                                    >
                                        <td className="px-4 py-3 font-mono text-xs">{s.staff_number}</td>
                                        <td className="px-4 py-3 font-medium">{s.first_name} {s.last_name}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${s.contract_type === 'Permanent' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {s.contract_type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 space-x-2" onClick={e => e.stopPropagation()}>
                                            <button
                                                onClick={() => { selectStaff(s); openEdit(s); }}
                                                className="text-blue-600 hover:underline text-xs"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={e => destroy(s.staff_number, e)}
                                                className="text-red-500 hover:underline text-xs"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-sm">No staff records found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Detail panel */}
                    {selected ? (
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-start justify-between">
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-gray-100">{selected.first_name} {selected.last_name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{selected.staff_number}</p>
                                </div>
                                <button
                                    onClick={() => openEdit(selected)}
                                    className="text-xs text-blue-600 hover:underline"
                                >
                                    Edit
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="flex border-b border-gray-200 dark:border-gray-700">
                                {tabs.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setTab(t.id)}
                                        className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${tab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>

                            {loadingDetail ? (
                                <div className="p-8 text-center text-gray-400 text-sm">Loading…</div>
                            ) : (
                                <>
                                    {tab === 'details' && (
                                        <div className="p-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                                            <Detail label="Sex"          value={selected.sex} />
                                            <Detail label="Date of Birth" value={selected.date_of_birth} />
                                            <Detail label="NIN"          value={selected.nin} />
                                            <Detail label="Telephone"    value={selected.telephone} />
                                            <Detail label="Salary"       value={`£${Number(selected.current_salary).toLocaleString()}`} />
                                            <Detail label="Salary Scale" value={selected.salary_scale} />
                                            <Detail label="Pay Type"     value={selected.pay_type} />
                                            <Detail label="Hours/Week"   value={String(selected.hours_per_week)} />
                                            <Detail label="Contract"     value={selected.contract_type} />
                                            <div className="col-span-2">
                                                <Detail label="Address" value={selected.address} />
                                            </div>
                                        </div>
                                    )}

                                    {tab === 'qualifications' && (
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase text-xs">
                                                <tr>
                                                    <th className="px-4 py-3 text-left">Type</th>
                                                    <th className="px-4 py-3 text-left">Date</th>
                                                    <th className="px-4 py-3 text-left">Institution</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                {selected.qualifications?.length > 0 ? selected.qualifications.map(q => (
                                                    <tr key={q.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                        <td className="px-4 py-3 font-medium">{q.qual_type}</td>
                                                        <td className="px-4 py-3 font-mono text-xs">{q.date_obtained}</td>
                                                        <td className="px-4 py-3">{q.institution}</td>
                                                    </tr>
                                                )) : <EmptyRow cols={3} message="No qualifications recorded." />}
                                            </tbody>
                                        </table>
                                    )}

                                    {tab === 'experience' && (
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase text-xs">
                                                <tr>
                                                    <th className="px-4 py-3 text-left">Position</th>
                                                    <th className="px-4 py-3 text-left">Organization</th>
                                                    <th className="px-4 py-3 text-left">Start</th>
                                                    <th className="px-4 py-3 text-left">Finish</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                {selected.workExperiences?.length > 0 ? selected.workExperiences.map(e => (
                                                    <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                        <td className="px-4 py-3 font-medium">{e.position}</td>
                                                        <td className="px-4 py-3">{e.organization}</td>
                                                        <td className="px-4 py-3 font-mono text-xs">{e.start_date}</td>
                                                        <td className="px-4 py-3 font-mono text-xs">{e.finish_date}</td>
                                                    </tr>
                                                )) : <EmptyRow cols={4} message="No experience recorded." />}
                                            </tbody>
                                        </table>
                                    )}

                                    {tab === 'shifts' && (
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase text-xs">
                                                <tr>
                                                    <th className="px-4 py-3 text-left">Ward</th>
                                                    <th className="px-4 py-3 text-left">Week Beginning</th>
                                                    <th className="px-4 py-3 text-left">Shift</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                {selected.rotas?.length > 0 ? selected.rotas.map(r => (
                                                    <tr key={r.rota_id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                        <td className="px-4 py-3">Ward {r.ward_number}</td>
                                                        <td className="px-4 py-3 font-mono text-xs">{r.week_beginning}</td>
                                                        <td className="px-4 py-3">
                                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                                                r.shift === 'Early' ? 'bg-teal-100 text-teal-700' :
                                                                r.shift === 'Late'  ? 'bg-amber-100 text-amber-700' :
                                                                'bg-purple-100 text-purple-700'
                                                            }`}>
                                                                {r.shift}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                )) : <EmptyRow cols={3} message="No shift data." />}
                                            </tbody>
                                        </table>
                                    )}
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center h-64">
                            <p className="text-gray-400 text-sm">Select a staff member to view their profile.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── MODALS ── */}
            {modal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setModal(null)}>
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                {modal === 'create' ? 'Add Staff Member' : `Edit Staff — ${selected?.staff_number}`}
                            </h3>
                            <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
                        </div>

                        {/* CREATE */}
                        {modal === 'create' && (
                            <form onSubmit={submitCreate} className="space-y-4">
                                <Field label="Staff Number" error={createForm.errors.staff_number}>
                                    <input value={createForm.data.staff_number} onChange={e => createForm.setData('staff_number', e.target.value)} className={inp} placeholder="e.g. S1001" />
                                </Field>
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="First Name" error={createForm.errors.first_name}>
                                        <input value={createForm.data.first_name} onChange={e => createForm.setData('first_name', e.target.value)} className={inp} />
                                    </Field>
                                    <Field label="Last Name" error={createForm.errors.last_name}>
                                        <input value={createForm.data.last_name} onChange={e => createForm.setData('last_name', e.target.value)} className={inp} />
                                    </Field>
                                </div>
                                <Field label="Address" error={createForm.errors.address}>
                                    <textarea value={createForm.data.address} onChange={e => createForm.setData('address', e.target.value)} className={inp} rows={2} />
                                </Field>
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Telephone" error={createForm.errors.telephone}>
                                        <input value={createForm.data.telephone} onChange={e => createForm.setData('telephone', e.target.value)} className={inp} />
                                    </Field>
                                    <Field label="Date of Birth" error={createForm.errors.date_of_birth}>
                                        <input type="date" value={createForm.data.date_of_birth} onChange={e => createForm.setData('date_of_birth', e.target.value)} className={inp} />
                                    </Field>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Sex" error={createForm.errors.sex}>
                                        <select value={createForm.data.sex} onChange={e => createForm.setData('sex', e.target.value)} className={inp}>
                                            <option>Male</option>
                                            <option>Female</option>
                                        </select>
                                    </Field>
                                    <Field label="NIN" error={createForm.errors.nin}>
                                        <input value={createForm.data.nin} onChange={e => createForm.setData('nin', e.target.value)} className={inp} />
                                    </Field>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Current Salary" error={createForm.errors.current_salary}>
                                        <input type="number" value={createForm.data.current_salary} onChange={e => createForm.setData('current_salary', e.target.value)} className={inp} />
                                    </Field>
                                    <Field label="Salary Scale" error={createForm.errors.salary_scale}>
                                        <input value={createForm.data.salary_scale} onChange={e => createForm.setData('salary_scale', e.target.value)} className={inp} />
                                    </Field>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <Field label="Pay Type" error={createForm.errors.pay_type}>
                                        <select value={createForm.data.pay_type} onChange={e => createForm.setData('pay_type', e.target.value)} className={inp}>
                                            <option>Monthly</option>
                                            <option>Weekly</option>
                                        </select>
                                    </Field>
                                    <Field label="Hours/Week" error={createForm.errors.hours_per_week}>
                                        <input type="number" value={createForm.data.hours_per_week} onChange={e => createForm.setData('hours_per_week', e.target.value)} className={inp} />
                                    </Field>
                                    <Field label="Contract Type" error={createForm.errors.contract_type}>
                                        <select value={createForm.data.contract_type} onChange={e => createForm.setData('contract_type', e.target.value)} className={inp}>
                                            <option>Permanent</option>
                                            <option>Temporary</option>
                                        </select>
                                    </Field>
                                </div>
                                <div className="flex gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <button type="submit" disabled={createForm.processing}
                                        className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                        {createForm.processing ? 'Saving…' : '✓ Add Staff'}
                                    </button>
                                    <button type="button" onClick={() => setModal(null)} className="px-5 py-2 text-sm text-gray-600 dark:text-gray-400 hover:underline">Cancel</button>
                                </div>
                            </form>
                        )}

                        {/* EDIT */}
                        {modal === 'edit' && (
                            <form onSubmit={submitEdit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="First Name" error={editForm.errors.first_name}>
                                        <input value={editForm.data.first_name} onChange={e => editForm.setData('first_name', e.target.value)} className={inp} />
                                    </Field>
                                    <Field label="Last Name" error={editForm.errors.last_name}>
                                        <input value={editForm.data.last_name} onChange={e => editForm.setData('last_name', e.target.value)} className={inp} />
                                    </Field>
                                </div>
                                <Field label="Address" error={editForm.errors.address}>
                                    <textarea value={editForm.data.address} onChange={e => editForm.setData('address', e.target.value)} className={inp} rows={2} />
                                </Field>
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Telephone" error={editForm.errors.telephone}>
                                        <input value={editForm.data.telephone} onChange={e => editForm.setData('telephone', e.target.value)} className={inp} />
                                    </Field>
                                    <Field label="Date of Birth" error={editForm.errors.date_of_birth}>
                                        <input type="date" value={editForm.data.date_of_birth} onChange={e => editForm.setData('date_of_birth', e.target.value)} className={inp} />
                                    </Field>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Sex" error={editForm.errors.sex}>
                                        <select value={editForm.data.sex} onChange={e => editForm.setData('sex', e.target.value)} className={inp}>
                                            <option>Male</option>
                                            <option>Female</option>
                                        </select>
                                    </Field>
                                    <Field label="NIN" error={editForm.errors.nin}>
                                        <input value={editForm.data.nin} onChange={e => editForm.setData('nin', e.target.value)} className={inp} />
                                    </Field>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Current Salary" error={editForm.errors.current_salary}>
                                        <input type="number" value={editForm.data.current_salary} onChange={e => editForm.setData('current_salary', e.target.value)} className={inp} />
                                    </Field>
                                    <Field label="Salary Scale" error={editForm.errors.salary_scale}>
                                        <input value={editForm.data.salary_scale} onChange={e => editForm.setData('salary_scale', e.target.value)} className={inp} />
                                    </Field>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <Field label="Pay Type" error={editForm.errors.pay_type}>
                                        <select value={editForm.data.pay_type} onChange={e => editForm.setData('pay_type', e.target.value)} className={inp}>
                                            <option>Monthly</option>
                                            <option>Weekly</option>
                                        </select>
                                    </Field>
                                    <Field label="Hours/Week" error={editForm.errors.hours_per_week}>
                                        <input type="number" value={editForm.data.hours_per_week} onChange={e => editForm.setData('hours_per_week', e.target.value)} className={inp} />
                                    </Field>
                                    <Field label="Contract Type" error={editForm.errors.contract_type}>
                                        <select value={editForm.data.contract_type} onChange={e => editForm.setData('contract_type', e.target.value)} className={inp}>
                                            <option>Permanent</option>
                                            <option>Temporary</option>
                                        </select>
                                    </Field>
                                </div>
                                <div className="flex gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <button type="submit" disabled={editForm.processing}
                                        className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                        {editForm.processing ? 'Saving…' : 'Save Changes'}
                                    </button>
                                    <button type="button" onClick={() => setModal(null)} className="px-5 py-2 text-sm text-gray-600 dark:text-gray-400 hover:underline">Cancel</button>
                                </div>
                            </form>
                        )}
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
        amber:  'bg-amber-50 text-amber-700 border-amber-100',
        purple: 'bg-purple-50 text-purple-700 border-purple-100',
    };
    return (
        <div className={`rounded-xl p-4 border ${colors[color]}`}>
            <p className="text-xs opacity-70">{label}</p>
            <p className="text-2xl font-semibold mt-1">{value}</p>
        </div>
    );
}

function Detail({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
            <p className="text-gray-800 dark:text-gray-100 font-medium mt-0.5">{value || '—'}</p>
        </div>
    );
}

function EmptyRow({ cols, message }: { cols: number; message: string }) {
    return (
        <tr>
            <td colSpan={cols} className="px-4 py-8 text-center text-gray-400 text-sm">{message}</td>
        </tr>
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