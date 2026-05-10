import AppLayout from '@/layouts/app-layout';
import { useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import axios from 'axios';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Ward Management', href: '/modules/ward-management' },
];

interface Ward {
    ward_number: number;
    ward_name: string;
    location: string;
    total_beds: number;
    tel_extension: string;
    occupied_beds: number;
    vacant_beds: number;
}

interface WardDetail {
    ward: Ward;
    staff: StaffRow[];
    patients: PatientRow[];
    supplies: SupplyRow[];
}

interface StaffRow {
    staff_number: string;
    first_name: string;
    last_name: string;
    position_title: string;
    shift: string;
    week_beginning: string;
}

interface PatientRow {
    patient_number: string;
    first_name: string;
    last_name: string;
    bed_number: number;
    date_placed: string;
    expected_leave_date: string | null;
    expected_stay_days: number | null;
}

interface SupplyRow {
    requisition_number: string;
    requisition_date: string;
    item_name: string;
    type: string;
    quantity_required: number;
    cost_per_unit: number;
}

type Tab = 'staff' | 'patients' | 'supplies';
type Modal = null | 'create' | 'edit';

export default function WardManagement({ wards }: { wards: Ward[] }) {
    const [selected, setSelected]     = useState<WardDetail | null>(null);
    const [tab, setTab]               = useState<Tab>('patients');
    const [modal, setModal]           = useState<Modal>(null);
    const [editTarget, setEditTarget] = useState<Ward | null>(null);
    const [loading, setLoading]       = useState(false);
    const [search, setSearch]         = useState('');

    useEffect(() => { setModal(null); }, []);

    const createForm = useForm({
        ward_number: '', ward_name: '', location: '', total_beds: '', tel_extension: '',
    });

    const editForm = useForm({
        ward_name: '', location: '', total_beds: '', tel_extension: '',
    });

    async function selectWard(w: Ward) {
        setLoading(true);
        setTab('patients');
        try {
            const res = await axios.get(`/modules/ward-management/${w.ward_number}/details`);
            setSelected(res.data);
        } catch {
            setSelected(null);
        } finally {
            setLoading(false);
        }
    }

    function openEdit(w: Ward) {
        setEditTarget(w);
        editForm.setData({
            ward_name:     w.ward_name,
            location:      w.location,
            total_beds:    String(w.total_beds),
            tel_extension: w.tel_extension ?? '',
        });
        setModal('edit');
    }

    function submitCreate(e: React.FormEvent) {
        e.preventDefault();
        createForm.post('/modules/ward-management', {
            preserveScroll: true,
            onSuccess: () => { setModal(null); createForm.reset(); },
        });
    }

    function submitEdit(e: React.FormEvent) {
        e.preventDefault();
        editForm.put(`/modules/ward-management/${editTarget!.ward_number}`, {
            preserveScroll: true,
            onSuccess: () => { setModal(null); },
        });
    }

    function destroy(id: number) {
        if (confirm('Delete this ward?')) {
            editForm.delete(`/modules/ward-management/${id}`, {
                preserveScroll: true,
            });
        }
    }

    const filtered = wards.filter(w =>
        w.ward_name.toLowerCase().includes(search.toLowerCase()) ||
        w.location.toLowerCase().includes(search.toLowerCase()) ||
        String(w.ward_number).includes(search)
    );

    const totalBeds     = wards.reduce((a, w) => a + w.total_beds, 0);
    const totalOccupied = wards.reduce((a, w) => a + w.occupied_beds, 0);
    const totalVacant   = wards.reduce((a, w) => a + w.vacant_beds, 0);

    const tabs: { id: Tab; label: string }[] = [
        { id: 'patients', label: 'Patients (h)(i)' },
        { id: 'staff',    label: 'Staff (c)' },
        { id: 'supplies', label: 'Supplies (n)' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ward Management" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">

                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Ward & Bed Management</h2>
                    <button onClick={() => setModal('create')}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                        + Add Ward
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                    <StatCard label="Total Wards" value={wards.length} color="blue" />
                    <StatCard label="Total Beds" value={totalBeds} color="purple" />
                    <StatCard label="Occupied Beds" value={totalOccupied} color="red" />
                    <StatCard label="Vacant Beds" value={totalVacant} color="green" />
                </div>

                <div className="grid grid-cols-2 gap-6 items-start">
                    {/* Ward list */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Wards ({filtered.length})</p>
                            <input placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)}
                                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-40 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100" />
                        </div>
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3 text-left">No.</th>
                                    <th className="px-4 py-3 text-left">Name</th>
                                    <th className="px-4 py-3 text-left">Location</th>
                                    <th className="px-4 py-3 text-left">Beds</th>
                                    <th className="px-4 py-3 text-left">Occupancy</th>
                                    <th className="px-4 py-3 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filtered.map(w => {
                                    const pct = w.total_beds > 0 ? Math.round((w.occupied_beds / w.total_beds) * 100) : 0;
                                    return (
                                        <tr key={w.ward_number}
                                            onClick={() => selectWard(w)}
                                            className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${selected?.ward.ward_number === w.ward_number ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}>
                                            <td className="px-4 py-3 font-mono text-xs">{w.ward_number}</td>
                                            <td className="px-4 py-3 font-medium">{w.ward_name}</td>
                                            <td className="px-4 py-3">
                                                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">{w.location}</span>
                                            </td>
                                            <td className="px-4 py-3 text-xs">{w.occupied_beds}/{w.total_beds}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full ${pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-green-500'}`}
                                                            style={{ width: `${pct}%` }} />
                                                    </div>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">{pct}%</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 space-x-2" onClick={e => e.stopPropagation()}>
                                                <button onClick={() => openEdit(w)} className="text-blue-600 hover:underline text-xs">Edit</button>
                                                <button onClick={() => destroy(w.ward_number)} className="text-red-500 hover:underline text-xs">Delete</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filtered.length === 0 && (
                                    <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">No wards found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Ward detail panel */}
                    {selected ? (
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                                <p className="font-semibold text-gray-800 dark:text-gray-100">Ward {selected.ward.ward_number} — {selected.ward.ward_name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{selected.ward.location} · Ext. {selected.ward.tel_extension} · {selected.ward.occupied_beds}/{selected.ward.total_beds} beds occupied</p>
                            </div>

                            {/* Bed availability bar */}
                            <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                                    <span>Bed Availability</span>
                                    <span>{selected.ward.vacant_beds} vacant of {selected.ward.total_beds}</span>
                                </div>
                                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full transition-all ${
                                        (selected.ward.occupied_beds / selected.ward.total_beds) >= 0.9 ? 'bg-red-500' :
                                        (selected.ward.occupied_beds / selected.ward.total_beds) >= 0.7 ? 'bg-amber-500' : 'bg-green-500'
                                    }`} style={{ width: `${Math.round((selected.ward.occupied_beds / selected.ward.total_beds) * 100)}%` }} />
                                </div>
                                <div className="flex gap-4 mt-2 text-xs">
                                    <span className="text-green-600">● {selected.ward.vacant_beds} Vacant</span>
                                    <span className="text-red-600">● {selected.ward.occupied_beds} Occupied</span>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex border-b border-gray-200 dark:border-gray-700">
                                {tabs.map(t => (
                                    <button key={t.id} onClick={() => setTab(t.id)}
                                        className={`px-4 py-2 text-xs font-medium border-b-2 -mb-px transition ${tab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
                                        {t.label}
                                    </button>
                                ))}
                            </div>

                            {loading ? (
                                <div className="p-8 text-center text-gray-400 text-sm">Loading…</div>
                            ) : (
                                <>
                                    {/* (h)(i) Patients in ward */}
                                    {tab === 'patients' && (
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase text-xs">
                                                <tr>
                                                    <th className="px-4 py-3 text-left">Patient</th>
                                                    <th className="px-4 py-3 text-left">Bed</th>
                                                    <th className="px-4 py-3 text-left">Date Placed</th>
                                                    <th className="px-4 py-3 text-left">Exp. Leave</th>
                                                    <th className="px-4 py-3 text-left">Stay</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                {selected.patients.length > 0 ? selected.patients.map(p => (
                                                    <tr key={p.patient_number} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                        <td className="px-4 py-3 font-medium">P{p.patient_number} — {p.first_name} {p.last_name}</td>
                                                        <td className="px-4 py-3 font-mono text-xs">Bed {p.bed_number}</td>
                                                        <td className="px-4 py-3 font-mono text-xs">{p.date_placed}</td>
                                                        <td className="px-4 py-3 font-mono text-xs">{p.expected_leave_date ?? '—'}</td>
                                                        <td className="px-4 py-3 text-xs">{p.expected_stay_days ? `${p.expected_stay_days}d` : '—'}</td>
                                                    </tr>
                                                )) : <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">No patients currently admitted.</td></tr>}
                                            </tbody>
                                        </table>
                                    )}

                                    {/* (c) Staff in ward */}
                                    {tab === 'staff' && (
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase text-xs">
                                                <tr>
                                                    <th className="px-4 py-3 text-left">Staff No.</th>
                                                    <th className="px-4 py-3 text-left">Name</th>
                                                    <th className="px-4 py-3 text-left">Position</th>
                                                    <th className="px-4 py-3 text-left">Shift</th>
                                                    <th className="px-4 py-3 text-left">Week</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                {selected.staff.length > 0 ? selected.staff.map(s => (
                                                    <tr key={s.staff_number} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                        <td className="px-4 py-3 font-mono text-xs">{s.staff_number}</td>
                                                        <td className="px-4 py-3 font-medium">{s.first_name} {s.last_name}</td>
                                                        <td className="px-4 py-3 text-xs">{s.position_title}</td>
                                                        <td className="px-4 py-3">
                                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                                                s.shift === 'Early' ? 'bg-teal-100 text-teal-700' :
                                                                s.shift === 'Late'  ? 'bg-amber-100 text-amber-700' :
                                                                'bg-purple-100 text-purple-700'
                                                            }`}>{s.shift}</span>
                                                        </td>
                                                        <td className="px-4 py-3 font-mono text-xs">{s.week_beginning}</td>
                                                    </tr>
                                                )) : <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">No staff allocated to this ward.</td></tr>}
                                            </tbody>
                                        </table>
                                    )}

                                    {/* (n) Supplies for ward */}
                                    {tab === 'supplies' && (
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase text-xs">
                                                <tr>
                                                    <th className="px-4 py-3 text-left">Req. No.</th>
                                                    <th className="px-4 py-3 text-left">Date</th>
                                                    <th className="px-4 py-3 text-left">Item</th>
                                                    <th className="px-4 py-3 text-left">Type</th>
                                                    <th className="px-4 py-3 text-left">Qty</th>
                                                    <th className="px-4 py-3 text-left">Cost</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                {selected.supplies.length > 0 ? selected.supplies.map((s, i) => (
                                                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                        <td className="px-4 py-3 font-mono text-xs">{s.requisition_number}</td>
                                                        <td className="px-4 py-3 font-mono text-xs">{s.requisition_date}</td>
                                                        <td className="px-4 py-3 font-medium">{s.item_name}</td>
                                                        <td className="px-4 py-3">
                                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${s.type === 'Drug' ? 'bg-purple-100 text-purple-700' : 'bg-teal-100 text-teal-700'}`}>{s.type}</span>
                                                        </td>
                                                        <td className="px-4 py-3">{s.quantity_required}</td>
                                                        <td className="px-4 py-3">£{Number(s.cost_per_unit).toFixed(2)}</td>
                                                    </tr>
                                                )) : <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">No supplies recorded for this ward.</td></tr>}
                                            </tbody>
                                        </table>
                                    )}
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center h-64">
                            <p className="text-gray-400 text-sm">Select a ward to view details.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {modal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setModal(null)}>
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                {modal === 'create' ? 'Add New Ward' : `Edit — Ward ${editTarget?.ward_number}`}
                            </h3>
                            <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
                        </div>

                        <form onSubmit={modal === 'create' ? submitCreate : submitEdit} className="space-y-4">
                            {modal === 'create' && (
                                <Field label="Ward Number" error={createForm.errors.ward_number}>
                                    <input type="number" value={createForm.data.ward_number} onChange={e => createForm.setData('ward_number', e.target.value)} className={inp} placeholder="e.g. 12" />
                                </Field>
                            )}
                            <Field label="Ward Name" error={modal === 'create' ? createForm.errors.ward_name : editForm.errors.ward_name}>
                                <input
                                    value={modal === 'create' ? createForm.data.ward_name : editForm.data.ward_name}
                                    onChange={e => modal === 'create' ? createForm.setData('ward_name', e.target.value) : editForm.setData('ward_name', e.target.value)}
                                    className={inp} placeholder="e.g. Orthopaedic" />
                            </Field>
                            <Field label="Location" error={modal === 'create' ? createForm.errors.location : editForm.errors.location}>
                                <input
                                    value={modal === 'create' ? createForm.data.location : editForm.data.location}
                                    onChange={e => modal === 'create' ? createForm.setData('location', e.target.value) : editForm.setData('location', e.target.value)}
                                    className={inp} placeholder="e.g. Block E" />
                            </Field>
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Total Beds" error={modal === 'create' ? createForm.errors.total_beds : editForm.errors.total_beds}>
                                    <input type="number"
                                        value={modal === 'create' ? createForm.data.total_beds : editForm.data.total_beds}
                                        onChange={e => modal === 'create' ? createForm.setData('total_beds', e.target.value) : editForm.setData('total_beds', e.target.value)}
                                        className={inp} placeholder="e.g. 20" />
                                </Field>
                                <Field label="Tel. Extension">
                                    <input
                                        value={modal === 'create' ? createForm.data.tel_extension : editForm.data.tel_extension}
                                        onChange={e => modal === 'create' ? createForm.setData('tel_extension', e.target.value) : editForm.setData('tel_extension', e.target.value)}
                                        className={inp} placeholder="e.g. 7711" />
                                </Field>
                            </div>

                            <div className="flex gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                                <button type="submit"
                                    disabled={modal === 'create' ? createForm.processing : editForm.processing}
                                    className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                    {modal === 'create'
                                        ? (createForm.processing ? 'Creating…' : 'Create Ward')
                                        : (editForm.processing   ? 'Saving…'   : 'Save Changes')}
                                </button>
                                <button type="button" onClick={() => setModal(null)} className="px-5 py-2 text-sm text-gray-600 dark:text-gray-400 hover:underline">Cancel</button>
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
        purple: 'bg-purple-50 text-purple-700 border-purple-100',
        red:    'bg-red-50 text-red-700 border-red-100',
        green:  'bg-green-50 text-green-700 border-green-100',
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