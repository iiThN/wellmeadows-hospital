import AppLayout from '@/layouts/app-layout';
import { router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StaffSummary {
    staff_number: string;
    first_name: string;
    last_name: string;
    telephone: string;
    contract_type: string;
    position_title: string;
    position_start: string | null;
    assigned_wards: number[];
}

interface Position {
    id: number;
    position_title: string;
    start_date: string;
    end_date: string | null;
}

interface Rota {
    rota_id: number;
    ward_number: number;
    ward_name: string;
    week_beginning: string;
    shift: 'Early' | 'Late' | 'Night';
}

interface PatientResponsibility {
    patient_number: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    sex: string;
    ward_number: number;
    ward_name: string;
    bed_number: string;
    date_placed: string;
    expected_leave_date: string;
}

interface StaffDetail extends StaffSummary {
    positions: Position[];
    rotas: Rota[];
    patients: PatientResponsibility[];
}

interface Ward {
    ward_number: number;
    ward_name: string;
}

type Tab = 'positions' | 'wards' | 'patients';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const input =
    'w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500';

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
            {children}
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}

function EmptyRow({ cols, message }: { cols: number; message: string }) {
    return (
        <tr>
            <td colSpan={cols} className="px-4 py-6 text-center text-gray-400 dark:text-gray-500 text-sm">
                {message}
            </td>
        </tr>
    );
}

const shiftColors: Record<string, string> = {
    Early: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
    Late:  'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    Night: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function StaffDepartmentIndex({
    staff,
    wards,
}: {
    staff: StaffSummary[];
    wards: Ward[];
}) {
    const [selected, setSelected] = useState<StaffDetail | null>(null);
    const [loading, setLoading]   = useState(false);
    const [tab, setTab]           = useState<Tab>('positions');
    const [search, setSearch]     = useState('');

    const refetchFor = useRef<string | null>(null);

    // Position form
    const [posTitle, setPosTitle] = useState('');
    const [posStart, setPosStart] = useState('');
    const [posError, setPosError] = useState('');

    // Rota form
    const [rotaWard,  setRotaWard]  = useState('');
    const [rotaWeek,  setRotaWeek]  = useState('');
    const [rotaShift, setRotaShift] = useState('Early');
    const [rotaError, setRotaError] = useState('');

    useEffect(() => {
        if (!refetchFor.current) return;
        const staffNumber = refetchFor.current;
        refetchFor.current = null;
        axios.get(`/modules/staff-department/${staffNumber}/details`)
            .then(res => setSelected(res.data))
            .catch(() => {});
    }, [staff]);

    const filtered = staff.filter(
        (s) =>
            `${s.first_name} ${s.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
            s.staff_number.toLowerCase().includes(search.toLowerCase()) ||
            s.position_title.toLowerCase().includes(search.toLowerCase()),
    );

    async function selectStaff(s: StaffSummary) {
        if (selected?.staff_number === s.staff_number) return;
        setLoading(true);
        setTab('positions');
        setPosTitle(''); setPosStart(''); setPosError('');
        setRotaWard(''); setRotaWeek(''); setRotaError('');
        try {
            const res = await axios.get(`/modules/staff-department/${s.staff_number}/details`);
            setSelected(res.data);
        } catch {
            setSelected(s as StaffDetail);
        } finally {
            setLoading(false);
        }
    }

    function reloadAfter(staffNumber: string, resetFn?: () => void) {
        refetchFor.current = staffNumber;
        if (resetFn) resetFn();
        router.reload({ only: ['staff'] });
    }

    // ── Position actions ──────────────────────────────────────────────────────

    function assignPosition(e: React.FormEvent) {
        e.preventDefault();
        if (!selected) return;
        if (!posTitle.trim()) { setPosError('Position title is required.'); return; }
        if (!posStart)        { setPosError('Start date is required.'); return; }
        setPosError('');
        const staffNumber = selected.staff_number;
        router.post(
            `/modules/staff-department/${staffNumber}/positions`,
            { position_title: posTitle, start_date: posStart },
            { onSuccess: () => reloadAfter(staffNumber, () => { setPosTitle(''); setPosStart(''); }) },
        );
    }

    function endPosition(id: number) {
        if (!selected || !confirm('End this position now?')) return;
        const staffNumber = selected.staff_number;
        router.patch(
            `/modules/staff-department/positions/${id}/end`,
            {},
            { onSuccess: () => reloadAfter(staffNumber) },
        );
    }

    function deletePosition(id: number) {
        if (!selected || !confirm('Delete this position record?')) return;
        const staffNumber = selected.staff_number;
        router.delete(
            `/modules/staff-department/positions/${id}`,
            { onSuccess: () => reloadAfter(staffNumber) },
        );
    }

    // ── Rota actions ──────────────────────────────────────────────────────────

    function assignWard(e: React.FormEvent) {
        e.preventDefault();
        if (!selected) return;
        if (!rotaWard) { setRotaError('Please select a ward.'); return; }
        if (!rotaWeek) { setRotaError('Week beginning is required.'); return; }
        setRotaError('');
        const staffNumber = selected.staff_number;
        router.post(
            `/modules/staff-department/${staffNumber}/rotas`,
            { ward_number: Number(rotaWard), week_beginning: rotaWeek, shift: rotaShift },
            { onSuccess: () => reloadAfter(staffNumber, () => { setRotaWard(''); setRotaWeek(''); setRotaShift('Early'); }) },
        );
    }

    function deleteRota(id: number) {
        if (!selected || !confirm('Remove this ward assignment?')) return;
        const staffNumber = selected.staff_number;
        router.delete(
            `/modules/staff-department/rotas/${id}`,
            { onSuccess: () => reloadAfter(staffNumber) },
        );
    }

    // ─── Render ───────────────────────────────────────────────────────────────

    const tabs: { id: Tab; label: string }[] = [
        { id: 'positions', label: 'Roles & Positions' },
        { id: 'wards',     label: 'Ward Assignments' },
        { id: 'patients',  label: 'Patient Responsibilities' },
    ];

    return (
        <AppLayout>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                        Staff &amp; Department Management
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        Manage roles, department assignments, and ward schedules
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-5 gap-6 items-start">
                {/* ── Left: Staff List ───────────────────────────────────── */}
                <div className="col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search staff…"
                            className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[70vh] overflow-y-auto">
                        {filtered.length === 0 && (
                            <p className="px-4 py-8 text-center text-sm text-gray-400 dark:text-gray-500">No staff found.</p>
                        )}
                        {filtered.map((s) => (
                            <div
                                key={s.staff_number}
                                onClick={() => selectStaff(s)}
                                className={`px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition ${
                                    selected?.staff_number === s.staff_number
                                        ? 'bg-blue-50 dark:bg-blue-950/40 border-l-4 border-blue-500'
                                        : 'border-l-4 border-transparent'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                                            {s.first_name} {s.last_name}
                                        </p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">{s.staff_number}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                            s.contract_type === 'Permanent'
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                                        }`}>
                                            {s.contract_type}
                                        </span>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate max-w-[120px]">
                                            {s.position_title}
                                        </p>
                                    </div>
                                </div>
                                {s.assigned_wards.length > 0 && (
                                    <div className="flex gap-1 mt-1.5 flex-wrap">
                                        {s.assigned_wards.map((w) => (
                                            <span key={w} className="text-[10px] bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300 px-1.5 py-0.5 rounded">
                                                Ward {w}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Right: Detail Panel ───────────────────────────────── */}
                <div className="col-span-3">
                    {!selected ? (
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center h-64">
                            <p className="text-sm text-gray-400 dark:text-gray-500">
                                Select a staff member to manage their department &amp; ward assignments.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                            {/* Staff header */}
                            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-gray-100 text-lg">
                                        {selected.first_name} {selected.last_name}
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                                        {selected.staff_number} · {selected.telephone}
                                    </p>
                                </div>
                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                                    selected.contract_type === 'Permanent'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-amber-100 text-amber-700'
                                }`}>
                                    {selected.contract_type}
                                </span>
                            </div>

                            {/* Tabs */}
                            <div className="flex border-b border-gray-100 dark:border-gray-700">
                                {tabs.map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => setTab(t.id)}
                                        className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${
                                            tab === t.id
                                                ? 'border-blue-600 text-blue-600'
                                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                        }`}
                                    >
                                        {t.label}
                                        {t.id === 'patients' && selected.patients?.length > 0 && (
                                            <span className="ml-1.5 text-xs bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300 px-1.5 py-0.5 rounded-full">
                                                {selected.patients.length}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {loading ? (
                                <div className="p-6 space-y-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="h-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" style={{ width: `${60 + i * 10}%` }} />
                                    ))}
                                </div>
                            ) : (
                                <>
                                    {/* ── Positions Tab ────────────────────── */}
                                    {tab === 'positions' && (
                                        <div>
                                            <form onSubmit={assignPosition} className="px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                                                    Assign New Role / Position
                                                </p>
                                                <div className="grid grid-cols-3 gap-3">
                                                    <div className="col-span-2">
                                                        <Field label="Position Title">
                                                            <select value={posTitle} onChange={(e) => setPosTitle(e.target.value)} className={input}>
                                                                <option value="">— Select role —</option>
                                                                {['Consultant','Senior Nurse','Charge Nurse','Staff Nurse','Junior Nurse','Nurse Assistant','Doctor','Surgeon','Medical Director','Personnel Officer','Administrative Staff','Receptionist','Pharmacist','Radiographer','Physiotherapist'].map((r) => (
                                                                    <option key={r}>{r}</option>
                                                                ))}
                                                            </select>
                                                        </Field>
                                                    </div>
                                                    <Field label="Start Date">
                                                        <input type="date" value={posStart} onChange={(e) => setPosStart(e.target.value)} className={input} />
                                                    </Field>
                                                </div>
                                                {posError && <p className="text-xs text-red-500 mt-1">{posError}</p>}
                                                <button type="submit" className="mt-3 px-4 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700">
                                                    Assign Position
                                                </button>
                                            </form>

                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 uppercase text-xs">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left">Role / Position</th>
                                                        <th className="px-4 py-3 text-left">Start</th>
                                                        <th className="px-4 py-3 text-left">End</th>
                                                        <th className="px-4 py-3 text-left">Status</th>
                                                        <th className="px-4 py-3 text-left">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                    {selected.positions?.length > 0 ? selected.positions.map((p) => (
                                                        <tr key={p.id}>
                                                            <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{p.position_title}</td>
                                                            <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">{p.start_date}</td>
                                                            <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">{p.end_date ?? '—'}</td>
                                                            <td className="px-4 py-3">
                                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                                                    p.end_date
                                                                        ? 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                                                                        : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                                                                }`}>
                                                                    {p.end_date ? 'Ended' : 'Active'}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 space-x-2">
                                                                {!p.end_date && (
                                                                    <button onClick={() => endPosition(p.id)} className="text-amber-600 hover:underline text-xs">End</button>
                                                                )}
                                                                <button onClick={() => deletePosition(p.id)} className="text-red-500 hover:underline text-xs">Delete</button>
                                                            </td>
                                                        </tr>
                                                    )) : <EmptyRow cols={5} message="No positions assigned yet." />}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {/* ── Ward Assignments Tab ─────────────── */}
                                    {tab === 'wards' && (
                                        <div>
                                            <form onSubmit={assignWard} className="px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                                                    Assign to Ward
                                                </p>
                                                <div className="grid grid-cols-3 gap-3">
                                                    <Field label="Ward">
                                                        <select value={rotaWard} onChange={(e) => setRotaWard(e.target.value)} className={input}>
                                                            <option value="">— Select ward —</option>
                                                            {wards.map((w) => (
                                                                <option key={w.ward_number} value={w.ward_number}>
                                                                    {w.ward_number} — {w.ward_name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </Field>
                                                    <Field label="Week Beginning">
                                                        <input type="date" value={rotaWeek} onChange={(e) => setRotaWeek(e.target.value)} className={input} />
                                                    </Field>
                                                    <Field label="Shift">
                                                        <select value={rotaShift} onChange={(e) => setRotaShift(e.target.value)} className={input}>
                                                            <option>Early</option>
                                                            <option>Late</option>
                                                            <option>Night</option>
                                                        </select>
                                                    </Field>
                                                </div>
                                                {rotaError && <p className="text-xs text-red-500 mt-1">{rotaError}</p>}
                                                <button type="submit" className="mt-3 px-4 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700">
                                                    Assign to Ward
                                                </button>
                                            </form>

                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 uppercase text-xs">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left">Ward</th>
                                                        <th className="px-4 py-3 text-left">Week Beginning</th>
                                                        <th className="px-4 py-3 text-left">Shift</th>
                                                        <th className="px-4 py-3 text-left">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                    {selected.rotas?.length > 0 ? selected.rotas.map((r) => (
                                                        <tr key={r.rota_id}>
                                                            <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">
                                                                {r.ward_name}
                                                                <span className="ml-1 text-xs text-gray-400 dark:text-gray-500 font-mono">(#{r.ward_number})</span>
                                                            </td>
                                                            <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">{r.week_beginning}</td>
                                                            <td className="px-4 py-3">
                                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${shiftColors[r.shift]}`}>{r.shift}</span>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <button onClick={() => deleteRota(r.rota_id)} className="text-red-500 hover:underline text-xs">Remove</button>
                                                            </td>
                                                        </tr>
                                                    )) : <EmptyRow cols={4} message="No ward assignments yet." />}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {/* ── Patient Responsibilities Tab ──────── */}
                                    {tab === 'patients' && (
                                        <div>
                                            <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Current inpatients in wards where <span className="font-semibold text-gray-700 dark:text-gray-200">{selected.first_name} {selected.last_name}</span> is assigned.
                                                </p>
                                            </div>
                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 uppercase text-xs">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left">Patient</th>
                                                        <th className="px-4 py-3 text-left">Ward</th>
                                                        <th className="px-4 py-3 text-left">Bed</th>
                                                        <th className="px-4 py-3 text-left">Admitted</th>
                                                        <th className="px-4 py-3 text-left">Expected Discharge</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                    {selected.patients?.length > 0 ? selected.patients.map((p) => (
                                                        <tr key={`${p.patient_number}-${p.bed_number}`}>
                                                            <td className="px-4 py-3">
                                                                <p className="font-medium text-gray-800 dark:text-gray-100">{p.first_name} {p.last_name}</p>
                                                                <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">{p.patient_number} · {p.sex}</p>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <span className="text-xs bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300 px-2 py-0.5 rounded font-medium">
                                                                    {p.ward_name}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">{p.bed_number}</td>
                                                            <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">{p.date_placed}</td>
                                                            <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">{p.expected_leave_date ?? '—'}</td>
                                                        </tr>
                                                    )) : (
                                                        <EmptyRow cols={5} message={
                                                            selected.rotas?.length === 0
                                                                ? 'No ward assignments — assign this staff member to a ward first.'
                                                                : 'No current inpatients in the assigned wards.'
                                                        } />
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}