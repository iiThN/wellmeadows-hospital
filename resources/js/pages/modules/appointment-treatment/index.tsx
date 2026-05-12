import AppLayout from '@/layouts/app-layout';
import { useState, useEffect, useCallback } from 'react';
import { type BreadcrumbItem } from '@/types';
import axios from 'axios';
import { useFetch } from '@/hooks/useFetch';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Appointment & Treatment', href: '/modules/appointment-treatment' },
];

interface Appointment {
    appointment_number: string;
    patient_number: string;
    consultant_number: string;
    appointment_date: string;
    appointment_time: string;
    examination_room: string;
    outcome: string;
    treatment: Treatment | null;
}

interface Treatment {
    treatment_id: number;
    appointment_number: string;
    diagnosis: string;
    procedure: string;
    treatment_date: string;
    notes: string;
}

interface Patient {
    patient_number: string;
    first_name: string;
    last_name: string;
}

interface Consultant {
    staff_number: string;
    first_name: string;
    last_name: string;
}

interface Outpatient {
    patient_number: string;
    first_name: string;
    last_name: string;
    telephone: string;
    appointment_date: string;
    appointment_time: string;
}

type Modal = null | 'create' | 'edit' | 'treatment';
type Tab = 'appointments' | 'outpatient-report';

const blankCreate = {
    appointment_number: '',
    patient_number:     '',
    consultant_number:  '',
    appointment_date:   '',
    appointment_time:   '',
    examination_room:   '',
    outcome:            'Waiting list',
};

const blankEdit = {
    consultant_number: '',
    appointment_date:  '',
    appointment_time:  '',
    examination_room:  '',
    outcome:           'Waiting list',
};

const blankTreatment = {
    diagnosis:      '',
    procedure:      '',
    treatment_date: new Date().toISOString().split('T')[0],
    notes:          '',
};

const initialData = {
    appointments: [] as Appointment[],
    patients:     [] as Patient[],
    consultants:  [] as Consultant[],
    outpatients:  [] as Outpatient[],
};

export default function AppointmentTreatmentPage() {
    const { data, loading } = useFetch('/api/modules/appointment-treatment', initialData);

    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [patients, setPatients]         = useState<Patient[]>([]);
    const [consultants, setConsultants]   = useState<Consultant[]>([]);

    const [modal, setModal]       = useState<Modal>(null);
    const [selected, setSelected] = useState<Appointment | null>(null);
    const [tab, setTab]           = useState<Tab>('appointments');
    const [search, setSearch]     = useState('');
    const [outpatientReport, setOutpatientReport] = useState<Outpatient[]>([]);
    const [loadingReport, setLoadingReport]       = useState(false);

    const [createFormData, setCreateFormData]             = useState({ ...blankCreate });
    const [createFormErrors, setCreateFormErrors]         = useState<Record<string, string>>({});
    const [createFormProcessing, setCreateFormProcessing] = useState(false);

    const [editFormData, setEditFormData]             = useState({ ...blankEdit });
    const [editFormErrors, setEditFormErrors]         = useState<Record<string, string>>({});
    const [editFormProcessing, setEditFormProcessing] = useState(false);

    const [treatmentFormData, setTreatmentFormData]             = useState({ ...blankTreatment });
    const [treatmentFormErrors, setTreatmentFormErrors]         = useState<Record<string, string>>({});
    const [treatmentFormProcessing, setTreatmentFormProcessing] = useState(false);

    // Sync useFetch data into local state so mutations can update them
    useEffect(() => {
        if (data.appointments) setAppointments(data.appointments);
        if (data.patients)     setPatients(data.patients);
        if (data.consultants)  setConsultants(data.consultants);
    }, [data]);

    const reloadData = useCallback(() => {
        axios.get('/api/modules/appointment-treatment').then(r => {
            if (r.data.appointments) setAppointments(r.data.appointments);
            if (r.data.patients)     setPatients(r.data.patients);
            if (r.data.consultants)  setConsultants(r.data.consultants);
        });
    }, []);

    function openEdit(a: Appointment) {
        setSelected(a);
        setEditFormData({
            consultant_number: a.consultant_number,
            appointment_date:  a.appointment_date,
            appointment_time:  a.appointment_time ?? '',
            examination_room:  a.examination_room ?? '',
            outcome:           a.outcome,
        });
        setEditFormErrors({});
        setModal('edit');
    }

    function openTreatment(a: Appointment) {
        setSelected(a);
        setTreatmentFormData(a.treatment ? {
            diagnosis:      a.treatment.diagnosis ?? '',
            procedure:      a.treatment.procedure ?? '',
            treatment_date: a.treatment.treatment_date,
            notes:          a.treatment.notes ?? '',
        } : { ...blankTreatment });
        setTreatmentFormErrors({});
        setModal('treatment');
    }

    async function submitCreate(e: React.FormEvent) {
        e.preventDefault();
        setCreateFormProcessing(true);
        setCreateFormErrors({});
        try {
            await axios.post('/modules/appointment-treatment/appointments', createFormData);
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
            await axios.put(`/modules/appointment-treatment/appointments/${selected!.appointment_number}`, editFormData);
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

    async function submitTreatment(e: React.FormEvent) {
        e.preventDefault();
        setTreatmentFormProcessing(true);
        setTreatmentFormErrors({});
        try {
            await axios.post(`/modules/appointment-treatment/appointments/${selected!.appointment_number}/treatment`, treatmentFormData);
            setModal(null);
            reloadData();
        } catch (err: any) {
            const d = err?.response?.data?.errors ?? {};
            const f: Record<string, string> = {};
            Object.entries(d).forEach(([k, v]) => f[k] = (v as string[])[0]);
            setTreatmentFormErrors(f);
        } finally {
            setTreatmentFormProcessing(false);
        }
    }

    function destroy(id: string) {
        if (!confirm('Delete this appointment?')) return;
        axios.delete(`/modules/appointment-treatment/appointments/${id}`).then(() => reloadData());
    }

    function deleteTreatment(appointmentNumber: string) {
        if (!confirm('Delete this treatment record?')) return;
        axios.delete(`/modules/appointment-treatment/appointments/${appointmentNumber}/treatment`).then(() => reloadData());
    }

    async function loadOutpatientReport() {
        setLoadingReport(true);
        try {
            const res = await axios.get('/api/modules/appointment-treatment/outpatient-report');
            setOutpatientReport(res.data);
        } finally {
            setLoadingReport(false);
        }
    }

    useEffect(() => {
        if (tab === 'outpatient-report') loadOutpatientReport();
    }, [tab]);

    const filtered = appointments.filter(a => {
        const p = patients.find(pt => pt.patient_number === a.patient_number);
        const name = p ? `${p.first_name} ${p.last_name}`.toLowerCase() : '';
        return name.includes(search.toLowerCase()) ||
            a.appointment_number.toLowerCase().includes(search.toLowerCase());
    });

    const outcomeBadge = (outcome: string) =>
        outcome === 'Outpatient' ? 'bg-amber-100 text-amber-700' : 'bg-teal-100 text-teal-700';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col gap-4 p-4">

                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Appointment & Treatment</h2>
                    <button onClick={() => { setCreateFormData({ ...blankCreate }); setCreateFormErrors({}); setModal('create'); }}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                        + New Appointment
                    </button>
                </div>

                {/* Stats */}
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
                            <StatCard label="Total Appointments"  value={appointments.length} color="blue" />
                            <StatCard label="Waiting List"        value={appointments.filter(a => a.outcome === 'Waiting list').length} color="amber" />
                            <StatCard label="Outpatients"         value={appointments.filter(a => a.outcome === 'Outpatient').length} color="teal" />
                            <StatCard label="Treatments Recorded" value={appointments.filter(a => a.treatment).length} color="purple" />
                        </>
                    )}
                </div>

                {/* Tabs */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <div className="flex gap-2">
                            {([
                                { id: 'appointments',      label: 'Appointments' },
                                { id: 'outpatient-report', label: 'Outpatient Clinic Report (f)' },
                            ] as { id: Tab; label: string }[]).map(t => (
                                <button key={t.id} onClick={() => setTab(t.id)}
                                    className={`px-4 py-1.5 text-sm rounded-lg font-medium ${tab === t.id ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                                    {t.label}
                                </button>
                            ))}
                        </div>
                        {tab === 'appointments' && (
                            <input placeholder="Search patient or appointment no…"
                                value={search} onChange={e => setSearch(e.target.value)}
                                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100" />
                        )}
                    </div>

                    {/* Appointments tab */}
                    {tab === 'appointments' && (
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3 text-left">Appt. No.</th>
                                    <th className="px-4 py-3 text-left">Patient</th>
                                    <th className="px-4 py-3 text-left">Consultant</th>
                                    <th className="px-4 py-3 text-left">Date</th>
                                    <th className="px-4 py-3 text-left">Room</th>
                                    <th className="px-4 py-3 text-left">Outcome</th>
                                    <th className="px-4 py-3 text-left">Treatment</th>
                                    <th className="px-4 py-3 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i}>
                                            {Array.from({ length: 8 }).map((_, j) => (
                                                <td key={j} className="px-4 py-3">
                                                    <div className="h-4 rounded bg-gray-100 animate-pulse" />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : (
                                    <>
                                        {filtered.map(a => {
                                            const p = patients.find(pt => pt.patient_number === a.patient_number);
                                            const c = consultants.find(ct => ct.staff_number === a.consultant_number);
                                            return (
                                                <tr key={a.appointment_number} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                    <td className="px-4 py-3 font-mono text-xs">{a.appointment_number}</td>
                                                    <td className="px-4 py-3 font-medium">
                                                        {p ? `${p.first_name} ${p.last_name}` : `P${a.patient_number}`}
                                                    </td>
                                                    <td className="px-4 py-3 text-xs">
                                                        {c ? `${c.first_name} ${c.last_name}` : a.consultant_number}
                                                    </td>
                                                    <td className="px-4 py-3 font-mono text-xs">{a.appointment_date}</td>
                                                    <td className="px-4 py-3 text-xs">{a.examination_room ?? '—'}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${outcomeBadge(a.outcome)}`}>
                                                            {a.outcome}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {a.treatment
                                                            ? <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">Recorded</span>
                                                            : <span className="text-xs text-gray-400">None</span>
                                                        }
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex gap-2">
                                                            <button onClick={() => openTreatment(a)} className="text-xs text-purple-600 hover:underline">
                                                                {a.treatment ? 'Edit Tx' : '+ Treatment'}
                                                            </button>
                                                            <button onClick={() => openEdit(a)} className="text-xs text-blue-600 hover:underline">Edit</button>
                                                            <button onClick={() => destroy(a.appointment_number)} className="text-xs text-red-500 hover:underline">Delete</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {filtered.length === 0 && (
                                            <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400 text-sm">No appointments found.</td></tr>
                                        )}
                                    </>
                                )}
                            </tbody>
                        </table>
                    )}

                    {/* Outpatient report tab */}
                    {tab === 'outpatient-report' && (
                        <>
                            <div className="px-5 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-100">
                                <strong>Operation (f)</strong> — Patients referred to the out-patients clinic · <strong>{outpatientReport.length}</strong> records
                            </div>
                            {loadingReport ? (
                                <div className="p-8 text-center text-gray-400 text-sm">Loading report…</div>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase text-xs">
                                        <tr>
                                            <th className="px-4 py-3 text-left">Patient No.</th>
                                            <th className="px-4 py-3 text-left">Name</th>
                                            <th className="px-4 py-3 text-left">Telephone</th>
                                            <th className="px-4 py-3 text-left">Appointment Date</th>
                                            <th className="px-4 py-3 text-left">Appointment Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {outpatientReport.length > 0 ? outpatientReport.map((op, i) => (
                                            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                <td className="px-4 py-3 font-mono text-xs">P{op.patient_number}</td>
                                                <td className="px-4 py-3 font-medium">{op.first_name} {op.last_name}</td>
                                                <td className="px-4 py-3 font-mono text-xs">{op.telephone}</td>
                                                <td className="px-4 py-3 font-mono text-xs">{op.appointment_date}</td>
                                                <td className="px-4 py-3 font-mono text-xs">{op.appointment_time}</td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">No outpatient records found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Modals */}
            {modal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setModal(null)}>
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                {modal === 'create'    ? 'New Appointment' :
                                 modal === 'edit'      ? `Edit — ${selected?.appointment_number}` :
                                 `Treatment — ${selected?.appointment_number}`}
                            </h3>
                            <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
                        </div>

                        {modal === 'create' && (
                            <form onSubmit={submitCreate} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Appointment No." error={createFormErrors.appointment_number}>
                                        <input value={createFormData.appointment_number}
                                            onChange={e => setCreateFormData(p => ({ ...p, appointment_number: e.target.value }))}
                                            className={inp} placeholder="e.g. A1001" />
                                    </Field>
                                    <Field label="Patient" error={createFormErrors.patient_number}>
                                        <select value={createFormData.patient_number}
                                            onChange={e => setCreateFormData(p => ({ ...p, patient_number: e.target.value }))}
                                            className={inp}>
                                            <option value="">— Select patient —</option>
                                            {patients.map(p => (
                                                <option key={p.patient_number} value={p.patient_number}>
                                                    P{p.patient_number} — {p.first_name} {p.last_name}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>
                                    <Field label="Consultant" error={createFormErrors.consultant_number}>
                                        <select value={createFormData.consultant_number}
                                            onChange={e => setCreateFormData(p => ({ ...p, consultant_number: e.target.value }))}
                                            className={inp}>
                                            <option value="">— Select consultant —</option>
                                            {consultants.map(c => (
                                                <option key={c.staff_number} value={c.staff_number}>
                                                    {c.first_name} {c.last_name}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>
                                    <Field label="Date" error={createFormErrors.appointment_date}>
                                        <input type="date" value={createFormData.appointment_date}
                                            onChange={e => setCreateFormData(p => ({ ...p, appointment_date: e.target.value }))}
                                            className={inp} />
                                    </Field>
                                    <Field label="Time">
                                        <input type="time" value={createFormData.appointment_time}
                                            onChange={e => setCreateFormData(p => ({ ...p, appointment_time: e.target.value }))}
                                            className={inp} />
                                    </Field>
                                    <Field label="Examination Room">
                                        <input value={createFormData.examination_room}
                                            onChange={e => setCreateFormData(p => ({ ...p, examination_room: e.target.value }))}
                                            className={inp} placeholder="e.g. E252" />
                                    </Field>
                                </div>
                                <div className="flex gap-3 pt-2 border-t border-gray-200">
                                    <button type="submit" disabled={createFormProcessing}
                                        className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                        {createFormProcessing ? 'Saving…' : '✓ Create Appointment'}
                                    </button>
                                    <button type="button" onClick={() => setModal(null)}
                                        className="px-5 py-2 text-sm text-gray-600 hover:underline">Cancel</button>
                                </div>
                            </form>
                        )}

                        {modal === 'edit' && (
                            <form onSubmit={submitEdit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Consultant" error={editFormErrors.consultant_number}>
                                        <select value={editFormData.consultant_number}
                                            onChange={e => setEditFormData(p => ({ ...p, consultant_number: e.target.value }))}
                                            className={inp}>
                                            <option value="">— Select consultant —</option>
                                            {consultants.map(c => (
                                                <option key={c.staff_number} value={c.staff_number}>
                                                    {c.first_name} {c.last_name}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>
                                    <Field label="Outcome" error={editFormErrors.outcome}>
                                        <select value={editFormData.outcome}
                                            onChange={e => setEditFormData(p => ({ ...p, outcome: e.target.value }))}
                                            className={inp}>
                                            <option value="Waiting list">Waiting list</option>
                                            <option value="Outpatient">Outpatient</option>
                                        </select>
                                    </Field>
                                    <Field label="Date" error={editFormErrors.appointment_date}>
                                        <input type="date" value={editFormData.appointment_date}
                                            onChange={e => setEditFormData(p => ({ ...p, appointment_date: e.target.value }))}
                                            className={inp} />
                                    </Field>
                                    <Field label="Time">
                                        <input type="time" value={editFormData.appointment_time}
                                            onChange={e => setEditFormData(p => ({ ...p, appointment_time: e.target.value }))}
                                            className={inp} />
                                    </Field>
                                    <div className="col-span-2">
                                        <Field label="Examination Room">
                                            <input value={editFormData.examination_room}
                                                onChange={e => setEditFormData(p => ({ ...p, examination_room: e.target.value }))}
                                                className={inp} placeholder="e.g. E252" />
                                        </Field>
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <button type="submit" disabled={editFormProcessing}
                                        className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                        {editFormProcessing ? 'Saving…' : 'Save Changes'}
                                    </button>
                                    <button type="button" onClick={() => setModal(null)}
                                        className="px-5 py-2 text-sm text-gray-600 dark:text-gray-400 hover:underline">Cancel</button>
                                </div>
                            </form>
                        )}

                        {modal === 'treatment' && (
                            <form onSubmit={submitTreatment} className="space-y-4">
                                {selected?.treatment && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-xs text-amber-700">
                                        A treatment record exists — saving will update it.
                                    </div>
                                )}
                                <Field label="Treatment Date" error={treatmentFormErrors.treatment_date}>
                                    <input type="date" value={treatmentFormData.treatment_date}
                                        onChange={e => setTreatmentFormData(p => ({ ...p, treatment_date: e.target.value }))}
                                        className={inp} />
                                </Field>
                                <Field label="Diagnosis" error={treatmentFormErrors.diagnosis}>
                                    <textarea value={treatmentFormData.diagnosis}
                                        onChange={e => setTreatmentFormData(p => ({ ...p, diagnosis: e.target.value }))}
                                        className={inp} rows={2} placeholder="e.g. Fractured femur" />
                                </Field>
                                <Field label="Procedure" error={treatmentFormErrors.procedure}>
                                    <textarea value={treatmentFormData.procedure}
                                        onChange={e => setTreatmentFormData(p => ({ ...p, procedure: e.target.value }))}
                                        className={inp} rows={2} placeholder="e.g. Surgical repair" />
                                </Field>
                                <Field label="Notes">
                                    <textarea value={treatmentFormData.notes}
                                        onChange={e => setTreatmentFormData(p => ({ ...p, notes: e.target.value }))}
                                        className={inp} rows={2} placeholder="Additional notes…" />
                                </Field>
                                <div className="flex gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <button type="submit" disabled={treatmentFormProcessing}
                                        className="px-5 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50">
                                        {treatmentFormProcessing ? 'Saving…' : '✓ Save Treatment'}
                                    </button>
                                    {selected?.treatment && (
                                        <button type="button"
                                            onClick={() => { deleteTreatment(selected.appointment_number); setModal(null); }}
                                            className="px-5 py-2 text-sm text-red-500 hover:underline">
                                            Delete Treatment
                                        </button>
                                    )}
                                    <button type="button" onClick={() => setModal(null)}
                                        className="px-5 py-2 text-sm text-gray-600 dark:text-gray-400 hover:underline">Cancel</button>
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
        amber:  'bg-amber-50 text-amber-700 border-amber-100',
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