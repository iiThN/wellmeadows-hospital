import AppLayout from '@/layouts/app-layout';
import { useState, useEffect, useCallback } from 'react';
import { type BreadcrumbItem } from '@/types';
import axios from 'axios';
import { useFetch } from '@/hooks/useFetch';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Ward Management', href: '/modules/ward-management' },
];

interface Ward {
    ward_number: number; ward_name: string; location: string;
    total_beds: number; tel_extension: string; occupied_beds: number; vacant_beds: number;
}
interface WardDetail { ward: Ward; staff: any[]; patients: any[]; supplies: any[]; }

type Tab = 'staff' | 'patients' | 'supplies';
type Modal = null | 'create' | 'edit';

const blankCreate = { ward_number: '', ward_name: '', location: '', total_beds: '', tel_extension: '' };
const blankEdit   = { ward_name: '', location: '', total_beds: '', tel_extension: '' };
const initialData = { wards: [] as Ward[] };

export default function WardManagement() {
    const { data, loading } = useFetch('/api/modules/ward-management', initialData);

    const [wards, setWards]       = useState<Ward[]>([]);
    const [selected, setSelected] = useState<WardDetail | null>(null);
    const [tab, setTab]           = useState<Tab>('patients');
    const [modal, setModal]       = useState<Modal>(null);
    const [editTarget, setEditTarget] = useState<Ward | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [search, setSearch]     = useState('');

    const [createFormData, setCreateFormData]             = useState({ ...blankCreate });
    const [createFormErrors, setCreateFormErrors]         = useState<Record<string, string>>({});
    const [createFormProcessing, setCreateFormProcessing] = useState(false);

    const [editFormData, setEditFormData]             = useState({ ...blankEdit });
    const [editFormErrors, setEditFormErrors]         = useState<Record<string, string>>({});
    const [editFormProcessing, setEditFormProcessing] = useState(false);

    useEffect(() => {
        if (data.wards) setWards(data.wards);
    }, [data]);

    const reloadData = useCallback(() => {
        axios.get('/api/modules/ward-management').then(r => setWards(r.data.wards ?? r.data));
    }, []);

    async function selectWard(w: Ward) {
        // Show panel immediately with list data; enrich with full details in background
        setSelected({ ward: w, staff: [], patients: [], supplies: [] });
        setTab('patients');
        setLoadingDetail(true);
        try {
            const res = await axios.get(`/api/modules/ward-management/${w.ward_number}/details`);
            setSelected(res.data);
        } catch {
            // leave optimistic data as-is
        } finally {
            setLoadingDetail(false);
        }
    }

    function openEdit(w: Ward) {
        setEditTarget(w);
        setEditFormData({ ward_name: w.ward_name, location: w.location, total_beds: String(w.total_beds), tel_extension: w.tel_extension ?? '' });
        setEditFormErrors({});
        setModal('edit');
    }

    async function submitCreate(e: React.FormEvent) {
        e.preventDefault(); setCreateFormProcessing(true); setCreateFormErrors({});
        try {
            await axios.post('/api/modules/ward-management', createFormData);
            setModal(null); setCreateFormData({ ...blankCreate }); reloadData();
        } catch (err: any) {
            const d = err?.response?.data?.errors ?? {};
            const f: Record<string, string> = {};
            Object.entries(d).forEach(([k, v]) => f[k] = (v as string[])[0]);
            setCreateFormErrors(f);
        } finally { setCreateFormProcessing(false); }
    }

    async function submitEdit(e: React.FormEvent) {
        e.preventDefault(); setEditFormProcessing(true); setEditFormErrors({});
        try {
            await axios.put(`/api/modules/ward-management/${editTarget!.ward_number}`, editFormData);
            setModal(null); reloadData();
        } catch (err: any) {
            const d = err?.response?.data?.errors ?? {};
            const f: Record<string, string> = {};
            Object.entries(d).forEach(([k, v]) => f[k] = (v as string[])[0]);
            setEditFormErrors(f);
        } finally { setEditFormProcessing(false); }
    }

    async function destroy(id: number) {
        if (!confirm('Delete this ward?')) return;
        await axios.delete(`/api/modules/ward-management/${id}`);
        if (selected?.ward.ward_number === id) setSelected(null);
        reloadData();
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
        { id: 'patients', label: 'Patients' },
        { id: 'staff',    label: 'Staff' },
        { id: 'supplies', label: 'Supplies' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Ward & Bed Management</h2>
                    <button onClick={() => { setCreateFormData({ ...blankCreate }); setCreateFormErrors({}); setModal('create'); }}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">+ Add Ward</button>
                </div>

                <div className="grid grid-cols-4 gap-4">
                    {loading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="rounded-xl p-4 border border-gray-100 bg-gray-50">
                                <div className="h-3 w-24 rounded bg-gray-200 animate-pulse mb-2" />
                                <div className="h-7 w-12 rounded bg-gray-200 animate-pulse" />
                            </div>
                        ))
                    ) : (
                        <>
                            <StatCard label="Total Wards"   value={wards.length}  color="blue" />
                            <StatCard label="Total Beds"    value={totalBeds}     color="purple" />
                            <StatCard label="Occupied Beds" value={totalOccupied} color="red" />
                            <StatCard label="Vacant Beds"   value={totalVacant}   color="green" />
                        </>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-6 items-start">
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
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i}>
                                            {Array.from({ length: 6 }).map((_, j) => (
                                                <td key={j} className="px-4 py-3"><div className="h-4 rounded bg-gray-100 animate-pulse" /></td>
                                            ))}
                                        </tr>
                                    ))
                                ) : (
                                    <>
                                        {filtered.map(w => {
                                            const pct = w.total_beds > 0 ? Math.round((w.occupied_beds / w.total_beds) * 100) : 0;
                                            return (
                                                <tr key={w.ward_number} onClick={() => selectWard(w)}
                                                    className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${selected?.ward.ward_number === w.ward_number ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}>
                                                    <td className="px-4 py-3 font-mono text-xs">{w.ward_number}</td>
                                                    <td className="px-4 py-3 font-medium">{w.ward_name}</td>
                                                    <td className="px-4 py-3"><span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">{w.location}</span></td>
                                                    <td className="px-4 py-3 text-xs">{w.occupied_beds}/{w.total_beds}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                                <div className={`h-full rounded-full ${pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${pct}%` }} />
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
                                        {filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">No wards found.</td></tr>}
                                    </>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {selected ? (
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                                <p className="font-semibold text-gray-800 dark:text-gray-100">Ward {selected.ward.ward_number} — {selected.ward.ward_name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{selected.ward.location} · Ext. {selected.ward.tel_extension} · {selected.ward.occupied_beds}/{selected.ward.total_beds} beds occupied</p>
                            </div>
                            <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                                    <span>Bed Availability</span>
                                    <span>{selected.ward.vacant_beds} vacant of {selected.ward.total_beds}</span>
                                </div>
                                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full transition-all ${(selected.ward.occupied_beds / selected.ward.total_beds) >= 0.9 ? 'bg-red-500' : (selected.ward.occupied_beds / selected.ward.total_beds) >= 0.7 ? 'bg-amber-500' : 'bg-green-500'}`}
                                        style={{ width: `${Math.round((selected.ward.occupied_beds / selected.ward.total_beds) * 100)}%` }} />
                                </div>
                                <div className="flex gap-4 mt-2 text-xs">
                                    <span className="text-green-600">● {selected.ward.vacant_beds} Vacant</span>
                                    <span className="text-red-600">● {selected.ward.occupied_beds} Occupied</span>
                                </div>
                            </div>
                            <div className="flex border-b border-gray-200 dark:border-gray-700">
                                {tabs.map(t => (
                                    <button key={t.id} onClick={() => setTab(t.id)}
                                        className={`px-4 py-2 text-xs font-medium border-b-2 -mb-px transition ${tab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                            {loadingDetail ? (
                                <div className="p-4">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div key={i} className="flex gap-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                            {Array.from({ length: 5 }).map((_, j) => (
                                                <div key={j} className="h-4 flex-1 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <>
                                    {tab === 'patients' && (
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase text-xs">
                                                <tr><th className="px-4 py-3 text-left">Patient</th><th className="px-4 py-3 text-left">Bed</th><th className="px-4 py-3 text-left">Date Placed</th><th className="px-4 py-3 text-left">Exp. Leave</th><th className="px-4 py-3 text-left">Stay</th></tr>
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
                                    {tab === 'staff' && (
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase text-xs">
                                                <tr><th className="px-4 py-3 text-left">Staff No.</th><th className="px-4 py-3 text-left">Name</th><th className="px-4 py-3 text-left">Position</th><th className="px-4 py-3 text-left">Shift</th><th className="px-4 py-3 text-left">Week</th></tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                {selected.staff.length > 0 ? selected.staff.map(s => (
                                                    <tr key={s.staff_number} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                        <td className="px-4 py-3 font-mono text-xs">{s.staff_number}</td>
                                                        <td className="px-4 py-3 font-medium">{s.first_name} {s.last_name}</td>
                                                        <td className="px-4 py-3 text-xs">{s.position_title}</td>
                                                        <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium ${s.shift === 'Early' ? 'bg-teal-100 text-teal-700' : s.shift === 'Late' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'}`}>{s.shift}</span></td>
                                                        <td className="px-4 py-3 font-mono text-xs">{s.week_beginning}</td>
                                                    </tr>
                                                )) : <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">No staff allocated to this ward.</td></tr>}
                                            </tbody>
                                        </table>
                                    )}
                                    {tab === 'supplies' && (
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase text-xs">
                                                <tr><th className="px-4 py-3 text-left">Req. No.</th><th className="px-4 py-3 text-left">Date</th><th className="px-4 py-3 text-left">Item</th><th className="px-4 py-3 text-left">Type</th><th className="px-4 py-3 text-left">Qty</th><th className="px-4 py-3 text-left">Cost</th></tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                {selected.supplies.length > 0 ? selected.supplies.map((s, i) => (
                                                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                        <td className="px-4 py-3 font-mono text-xs">{s.requisition_number}</td>
                                                        <td className="px-4 py-3 font-mono text-xs">{s.requisition_date}</td>
                                                        <td className="px-4 py-3 font-medium">{s.item_name}</td>
                                                        <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium ${s.type === 'Drug' ? 'bg-purple-100 text-purple-700' : 'bg-teal-100 text-teal-700'}`}>{s.type}</span></td>
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
                                <Field label="Ward Number" error={createFormErrors.ward_number}>
                                    <input type="number" value={createFormData.ward_number} onChange={e => setCreateFormData(p => ({ ...p, ward_number: e.target.value }))} className={inp} placeholder="e.g. 12" />
                                </Field>
                            )}
                            <Field label="Ward Name" error={modal === 'create' ? createFormErrors.ward_name : editFormErrors.ward_name}>
                                <input value={modal === 'create' ? createFormData.ward_name : editFormData.ward_name}
                                    onChange={e => modal === 'create' ? setCreateFormData(p => ({ ...p, ward_name: e.target.value })) : setEditFormData(p => ({ ...p, ward_name: e.target.value }))}
                                    className={inp} placeholder="e.g. Orthopaedic" />
                            </Field>
                            <Field label="Location" error={modal === 'create' ? createFormErrors.location : editFormErrors.location}>
                                <input value={modal === 'create' ? createFormData.location : editFormData.location}
                                    onChange={e => modal === 'create' ? setCreateFormData(p => ({ ...p, location: e.target.value })) : setEditFormData(p => ({ ...p, location: e.target.value }))}
                                    className={inp} placeholder="e.g. Block E" />
                            </Field>
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Total Beds" error={modal === 'create' ? createFormErrors.total_beds : editFormErrors.total_beds}>
                                    <input type="number" value={modal === 'create' ? createFormData.total_beds : editFormData.total_beds}
                                        onChange={e => modal === 'create' ? setCreateFormData(p => ({ ...p, total_beds: e.target.value })) : setEditFormData(p => ({ ...p, total_beds: e.target.value }))}
                                        className={inp} placeholder="e.g. 20" />
                                </Field>
                                <Field label="Tel. Extension">
                                    <input value={modal === 'create' ? createFormData.tel_extension : editFormData.tel_extension}
                                        onChange={e => modal === 'create' ? setCreateFormData(p => ({ ...p, tel_extension: e.target.value })) : setEditFormData(p => ({ ...p, tel_extension: e.target.value }))}
                                        className={inp} placeholder="e.g. 7711" />
                                </Field>
                            </div>
                            <div className="flex gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                                <button type="submit" disabled={modal === 'create' ? createFormProcessing : editFormProcessing}
                                    className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                    {modal === 'create' ? (createFormProcessing ? 'Creating…' : 'Create Ward') : (editFormProcessing ? 'Saving…' : 'Save Changes')}
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