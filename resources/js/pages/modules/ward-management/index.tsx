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

type Tab = 'beds' | 'patients' | 'staff' | 'supplies';
type Modal = null | 'create' | 'edit' | 'delete';

export default function WardManagement({ wards }: { wards: Ward[] }) {
    const [selected, setSelected]         = useState<WardDetail | null>(null);
    const [tab, setTab]                   = useState<Tab>('beds');
    const [modal, setModal]               = useState<Modal>(null);
    const [editTarget, setEditTarget]     = useState<Ward | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Ward | null>(null);
    const [loading, setLoading]           = useState(false);
    const [search, setSearch]             = useState('');
    const [hoveredBed, setHoveredBed]     = useState<number | null>(null);

    useEffect(() => { setModal(null); }, []);

    const createForm = useForm({
        ward_number: '', ward_name: '', location: '', total_beds: '', tel_extension: '',
    });

    const editForm = useForm({
        ward_name: '', location: '', total_beds: '', tel_extension: '',
    });

    const deleteForm = useForm({});

    async function selectWard(w: Ward) {
        setSelected({ ward: w, staff: [], patients: [], supplies: [] });
        setLoading(true);
        setTab('beds');
        try {
            const res = await axios.get(`/modules/ward-management/${w.ward_number}/details`);
            setSelected(res.data);
        } catch {
            setSelected(null);
        } finally {
            setLoading(false);
        }
    }

    function openEdit(w: Ward, e?: React.MouseEvent) {
        e?.stopPropagation();
        setEditTarget(w);
        editForm.setData({
            ward_name:     w.ward_name,
            location:      w.location,
            total_beds:    String(w.total_beds),
            tel_extension: w.tel_extension ?? '',
        });
        setModal('edit');
    }

    function openDelete(w: Ward, e?: React.MouseEvent) {
        e?.stopPropagation();
        setDeleteTarget(w);
        setModal('delete');
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

    function confirmDelete() {
        deleteForm.delete(`/modules/ward-management/${deleteTarget!.ward_number}`, {
            preserveScroll: true,
            onSuccess: () => {
                setModal(null);
                if (selected?.ward.ward_number === deleteTarget!.ward_number) {
                    setSelected(null);
                }
            },
        });
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
        { id: 'beds',     label: 'Beds'     },
        { id: 'patients', label: 'Patients' },
        { id: 'staff',    label: 'Staff'    },
        { id: 'supplies', label: 'Supplies' },
    ];

    function buildBedMap(patients: PatientRow[], totalBeds: number) {
        const map = new Map<number, PatientRow | null>();
        for (let i = 1; i <= totalBeds; i++) map.set(i, null);
        for (const p of patients) {
            if (p.bed_number >= 1 && p.bed_number <= totalBeds) {
                map.set(p.bed_number, p);
            }
        }
        return map;
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ward Management" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">

                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Ward & Bed Management</h2>
                    <button onClick={() => setModal('create')}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                        + Add Ward
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatCard label="Total Wards"   value={wards.length}  color="blue"   />
                    <StatCard label="Total Beds"    value={totalBeds}     color="purple" />
                    <StatCard label="Occupied Beds" value={totalOccupied} color="red"    />
                    <StatCard label="Vacant Beds"   value={totalVacant}   color="green"  />
                </div>

                {/* Main layout — stacks on smaller screens, side-by-side on xl+ */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">

                    {/* Ward list */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden min-w-0">
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                Wards ({filtered.length})
                            </p>
                            <input
                                placeholder="Search..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-40 dark:bg-gray-800 dark:text-gray-100"
                            />
                        </div>

                        {/* Scrollable table wrapper so columns never get clipped */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm whitespace-nowrap">
                                <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 uppercase text-xs">
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
                                        const isSelected = selected?.ward.ward_number === w.ward_number;
                                        return (
                                            <tr
                                                key={w.ward_number}
                                                onClick={() => selectWard(w)}
                                                className={`cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 dark:bg-blue-950/40' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                                                <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">{w.ward_number}</td>
                                                <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{w.ward_name}</td>
                                                <td className="px-4 py-3">
                                                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                                        {w.location}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300">{w.occupied_beds}/{w.total_beds}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full ${pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-400' : 'bg-green-500'}`}
                                                                style={{ width: `${pct}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">{pct}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={(e) => openEdit(w, e)}
                                                            title="Edit Ward"
                                                            className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={(e) => openDelete(w, e)}
                                                            title="Delete Ward"
                                                            className="p-1.5 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <polyline points="3 6 5 6 21 6"/>
                                                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                                                <path d="M10 11v6"/><path d="M14 11v6"/>
                                                                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {filtered.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500 text-sm">
                                                No wards found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Ward detail panel */}
                    {selected ? (
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden min-w-0">
                            {/* Header */}
                            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">
                                        Ward {selected.ward.ward_number} — {selected.ward.ward_name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        {selected.ward.location} · Ext. {selected.ward.tel_extension}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={(e) => openEdit(selected.ward, e)}
                                        className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                        </svg>
                                        Edit
                                    </button>
                                    <button
                                        onClick={(e) => openDelete(selected.ward, e)}
                                        className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="3 6 5 6 21 6"/>
                                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                            <path d="M10 11v6"/><path d="M14 11v6"/>
                                        </svg>
                                        Remove
                                    </button>
                                </div>
                            </div>

                            {/* Occupancy bar */}
                            <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30">
                                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                                    <span className="font-medium">Bed Availability</span>
                                    <span>{selected.ward.vacant_beds} vacant of {selected.ward.total_beds} total</span>
                                </div>
                                <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full transition-all ${
                                        (selected.ward.occupied_beds / selected.ward.total_beds) >= 0.9 ? 'bg-red-500' :
                                        (selected.ward.occupied_beds / selected.ward.total_beds) >= 0.7 ? 'bg-amber-400' : 'bg-green-500'
                                    }`} style={{ width: `${Math.round((selected.ward.occupied_beds / selected.ward.total_beds) * 100)}%` }} />
                                </div>
                                <div className="flex gap-4 mt-2 text-xs">
                                    <span className="flex items-center gap-1.5 text-green-600">
                                        <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                                        {selected.ward.vacant_beds} Vacant
                                    </span>
                                    <span className="flex items-center gap-1.5 text-red-600">
                                        <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                                        {selected.ward.occupied_beds} Occupied
                                    </span>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex border-b border-gray-200 dark:border-gray-700">
                                {tabs.map(t => (
                                    <button key={t.id} onClick={() => setTab(t.id)}
                                        className={`px-4 py-2.5 text-xs font-medium border-b-2 -mb-px transition ${
                                            tab === t.id
                                                ? 'border-blue-600 text-blue-600'
                                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                        }`}>
                                        {t.label}
                                    </button>
                                ))}
                            </div>

                            {loading ? (
                                <div className="p-6 space-y-3">
                                    {[1,2,3,4,5].map(i => (
                                        <div key={i} className="h-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" style={{ width: `${60 + i * 7}%` }} />
                                    ))}
                                </div>
                            ) : (
                                <>
                                    {/* === BEDS TAB === */}
                                    {tab === 'beds' && (() => {
                                        const bedMap = buildBedMap(selected.patients, selected.ward.total_beds);
                                        return (
                                            <div className="p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                                        Bed Layout — {selected.ward.total_beds} beds total
                                                    </p>
                                                    <div className="flex items-center gap-3 text-xs">
                                                        <span className="flex items-center gap-1.5">
                                                            <span className="w-3 h-3 rounded bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-700 inline-block" />
                                                            Occupied
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            <span className="w-3 h-3 rounded bg-green-100 dark:bg-green-900/40 border border-green-300 dark:border-green-700 inline-block" />
                                                            Vacant
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {Array.from(bedMap.entries()).map(([bedNo, patient]) => (
                                                        <div
                                                            key={bedNo}
                                                            onMouseEnter={() => setHoveredBed(bedNo)}
                                                            onMouseLeave={() => setHoveredBed(null)}
                                                            className={`relative rounded-lg border p-2.5 transition-all cursor-default select-none ${
                                                                patient
                                                                    ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 hover:border-red-400 dark:hover:border-red-600'
                                                                    : 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-600'
                                                            }`}>
                                                            <div className={`text-[10px] font-bold mb-1.5 ${patient ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                                                Bed {bedNo}
                                                            </div>
                                                            {patient ? (
                                                                <>
                                                                    <div className="text-[10px] font-semibold text-gray-800 dark:text-gray-200 truncate leading-tight">
                                                                        {patient.first_name} {patient.last_name}
                                                                    </div>
                                                                    <div className="text-[9px] text-red-500 dark:text-red-400 font-medium mt-0.5">Occupied</div>
                                                                </>
                                                            ) : (
                                                                <div className="text-[10px] text-green-600 dark:text-green-400 font-medium">Vacant</div>
                                                            )}

                                                            {/* Tooltip */}
                                                            {hoveredBed === bedNo && patient && (
                                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 w-48 bg-gray-900 dark:bg-gray-700 text-white text-[10px] rounded-lg p-2.5 shadow-lg pointer-events-none">
                                                                    <p className="font-semibold">{patient.first_name} {patient.last_name}</p>
                                                                    <p className="text-gray-300 mt-0.5">Patient #{patient.patient_number}</p>
                                                                    <div className="mt-1.5 pt-1.5 border-t border-gray-600 space-y-0.5">
                                                                        <p><span className="text-gray-400">Admitted:</span> {patient.date_placed}</p>
                                                                        <p><span className="text-gray-400">Exp. Leave:</span> {patient.expected_leave_date ?? '—'}</p>
                                                                        {patient.expected_stay_days && (
                                                                            <p><span className="text-gray-400">Stay:</span> {patient.expected_stay_days} days</p>
                                                                        )}
                                                                    </div>
                                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* === PATIENTS TAB === */}
                                    {tab === 'patients' && (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm whitespace-nowrap">
                                                <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 uppercase text-xs">
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
                                                        <tr key={p.patient_number} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                                            <td className="px-4 py-3">
                                                                <div className="font-medium text-gray-800 dark:text-gray-100">{p.first_name} {p.last_name}</div>
                                                                <div className="text-xs text-gray-400 dark:text-gray-500">#{p.patient_number}</div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <span className="inline-flex items-center text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                                                                    Bed {p.bed_number}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">{p.date_placed}</td>
                                                            <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">{p.expected_leave_date ?? '—'}</td>
                                                            <td className="px-4 py-3 text-xs">{p.expected_stay_days ? `${p.expected_stay_days}d` : '—'}</td>
                                                        </tr>
                                                    )) : (
                                                        <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500 text-sm">No patients currently admitted.</td></tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {/* === STAFF TAB === */}
                                    {tab === 'staff' && (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm whitespace-nowrap">
                                                <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 uppercase text-xs">
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
                                                        <tr key={s.staff_number} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                                            <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">{s.staff_number}</td>
                                                            <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{s.first_name} {s.last_name}</td>
                                                            <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{s.position_title}</td>
                                                            <td className="px-4 py-3">
                                                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                                                    s.shift === 'Early' ? 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300' :
                                                                    s.shift === 'Late'  ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' :
                                                                    'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
                                                                }`}>{s.shift}</span>
                                                            </td>
                                                            <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">{s.week_beginning}</td>
                                                        </tr>
                                                    )) : (
                                                        <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500 text-sm">No staff allocated to this ward.</td></tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {/* === SUPPLIES TAB === */}
                                    {tab === 'supplies' && (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm whitespace-nowrap">
                                                <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 uppercase text-xs">
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
                                                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                                            <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">{s.requisition_number}</td>
                                                            <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">{s.requisition_date}</td>
                                                            <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{s.item_name}</td>
                                                            <td className="px-4 py-3">
                                                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                                                    s.type === 'Drug'
                                                                        ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
                                                                        : 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300'
                                                                }`}>{s.type}</span>
                                                            </td>
                                                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{s.quantity_required}</td>
                                                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">£{Number(s.cost_per_unit).toFixed(2)}</td>
                                                        </tr>
                                                    )) : (
                                                        <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500 text-sm">No supplies recorded for this ward.</td></tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center h-64">
                            <p className="text-gray-400 dark:text-gray-500 text-sm">Select a ward to view details.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ===== CREATE / EDIT MODAL ===== */}
            {(modal === 'create' || modal === 'edit') && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setModal(null)}>
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                    {modal === 'create' ? 'Add New Ward' : `Edit Ward ${editTarget?.ward_number}`}
                                </h3>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                    {modal === 'create' ? 'Create a new ward in the hospital.' : `Editing: ${editTarget?.ward_name}`}
                                </p>
                            </div>
                            <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none">×</button>
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
                                        ? (createForm.processing ? 'Creating...' : 'Create Ward')
                                        : (editForm.processing   ? 'Saving...'   : 'Save Changes')}
                                </button>
                                <button type="button" onClick={() => setModal(null)} className="px-5 py-2 text-sm text-gray-600 dark:text-gray-400 hover:underline">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ===== DELETE CONFIRM MODAL ===== */}
            {modal === 'delete' && deleteTarget && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setModal(null)}>
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex flex-col items-center text-center gap-3 mb-5">
                            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6"/>
                                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                    <path d="M10 11v6"/><path d="M14 11v6"/>
                                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Remove Ward</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Are you sure you want to remove <span className="font-semibold text-gray-700 dark:text-gray-200">Ward {deleteTarget.ward_number} — {deleteTarget.ward_name}</span>?
                                </p>
                                <p className="text-xs text-red-500 mt-2 bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2">
                                    This action cannot be undone. All associated patient and supply records will be affected.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={confirmDelete}
                                disabled={deleteForm.processing}
                                className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors">
                                {deleteForm.processing ? 'Removing...' : 'Yes, Remove Ward'}
                            </button>
                            <button onClick={() => setModal(null)} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
    const colors: Record<string, string> = {
        blue:   'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-900',
        purple: 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-100 dark:border-purple-900',
        red:    'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-100 dark:border-red-900',
        green:  'bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300 border-green-100 dark:border-green-900',
    };
    return (
        <div className={`rounded-xl p-4 border ${colors[color]}`}>
            <p className="text-xs opacity-70 font-medium">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
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

const inp = 'w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';