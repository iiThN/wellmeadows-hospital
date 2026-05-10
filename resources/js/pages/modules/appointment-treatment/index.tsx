import AppLayout from '@/layouts/app-layout';
import { useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import axios from 'axios';

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

export default function AppointmentTreatmentPage({
    appointments, patients, consultants, outpatients
}: {
    appointments: Appointment[];
    patients: Patient[];
    consultants: Consultant[];
    outpatients: Outpatient[];
}) {
    const [modal, setModal]           = useState<Modal>(null);
    const [selected, setSelected]     = useState<Appointment | null>(null);
    const [tab, setTab]               = useState<Tab>('appointments');
    const [search, setSearch]         = useState('');
    const [outpatientReport, setOutpatientReport] = useState<Outpatient[]>([]);
    const [loadingReport, setLoadingReport]       = useState(false);

    useEffect(() => { setModal(null); }, []);

    const createForm = useForm({
        appointment_number: '',
        patient_number:     '',
        consultant_number:  '',
        appointment_date:   '',
        appointment_time:   '',
        examination_room:   '',
        outcome:            'Waiting list',
    });

    const editForm = useForm({
        consultant_number: '',
        appointment_date:  '',
        appointment_time:  '',
        examination_room:  '',
        outcome:           'Waiting list',
    });

    const treatmentForm = useForm({
        diagnosis:      '',
        procedure:      '',
        treatment_date: new Date().toISOString().split('T')[0],
        notes:          '',
    });

    function openEdit(a: Appointment) {
        setSelected(a);
        editForm.setData({
            consultant_number: a.consultant_number,
            appointment_date:  a.appointment_date,
            appointment_time:  a.appointment_time ?? '',
            examination_room:  a.examination_room ?? '',
            outcome:           a.outcome,
        });
        setModal('edit');
    }

    function openTreatment(a: Appointment) {
        setSelected(a);
        if (a.treatment) {
            treatmentForm.setData({
                diagnosis:      a.treatment.diagnosis ?? '',
                procedure:      a.treatment.procedure ?? '',
                treatment_date: a.treatment.treatment_date,
                notes:          a.treatment.notes ?? '',
            });
        } else {
            treatmentForm.reset();
        }
        setModal('treatment');
    }

    function submitCreate(e: React.FormEvent) {
        e.preventDefault();
        createForm.post('/modules/appointment-treatment/appointments', {
            preserveScroll: true,
            onSuccess: () => { setModal(null); createForm.reset(); },
        });
    }

    function submitEdit(e: React.FormEvent) {
        e.preventDefault();
        editForm.put(`/modules/appointment-treatment/appointments/${selected!.appointment_number}`, {
            preserveScroll: true,
            onSuccess: () => setModal(null),
        });
    }

    function submitTreatment(e: React.FormEvent) {
        e.preventDefault();
        treatmentForm.post(`/modules/appointment-treatment/appointments/${selected!.appointment_number}/treatment`, {
            preserveScroll: true,
            onSuccess: () => setModal(null),
        });
    }

    function destroy(id: string) {
        if (confirm('Delete this appointment?')) {
            router.delete(`/modules/appointment-treatment/appointments/${id}`, { preserveScroll: true });
        }
    }

    function deleteTreatment(appointmentNumber: string) {
        if (confirm('Delete this treatment record?')) {
            router.delete(`/modules/appointment-treatment/appointments/${appointmentNumber}/treatment`, { preserveScroll: true });
        }
    }

    async function loadOutpatientReport() {
        setLoadingReport(true);
        try {
            const res = await axios.get('/modules/appointment-treatment/outpatient-report');
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
            <Head title="Appointment & Treatment" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">

                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Appointment & Treatment</h2>
                    <button onClick={() => setModal('create')}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                        + New Appointment
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                    <StatCard label="Total Appointments"  value={appointments.length} color="blue" />
                    <StatCard label="Waiting List"        value={appointments.filter(a => a.outcome === 'Waiting list').length} color="amber" />
                    <StatCard label="Outpatients"         value={appointments.filter(a => a.outcome === 'Outpatient').length} color="teal" />
                    <StatCard label="Treatments Recorded" value={appointments.filter(a => a.treatment).length} color="purple" />
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
                                                {a.treatment ? (
                                                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">Recorded</span>
                                                ) : (
                                                    <span className="text-xs text-gray-400">None</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-2">
                                                    <button onClick={() => openTreatment(a)}
                                                        className="text-xs text-purple-600 hover:underline">
                                                        {a.treatment ? 'Edit Tx' : '+ Treatment'}
                                                    </button>
                                                    <button onClick={() => openEdit(a)}
                                                        className="text-xs text-blue-600 hover:underline">Edit</button>
                                                    <button onClick={() => destroy(a.appointment_number)}
                                                        className="text-xs text-red-500 hover:underline">Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filtered.length === 0 && (
                                    <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400 text-sm">No appointments found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}

                    {/* Outpatient report tab (f) */}
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

                        {/* Create Appointment */}
                        {modal === 'create' && (
                            <form onSubmit={submitCreate} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Appointment No." error={createForm.errors.appointment_number}>
                                        <input value={createForm.data.appointment_number}
                                            onChange={e => createForm.setData('appointment_number', e.target.value)}
                                            className={inp} placeholder="e.g. A1001" />
                                    </Field>
                                    <Field label="Patient" error={createForm.errors.patient_number}>
                                        <select value={createForm.data.patient_number}
                                            onChange={e => createForm.setData('patient_number', e.target.value)}
                                            className={inp}>
                                            <option value="">— Select patient —</option>
                                            {patients.map(p => (
                                                <option key={p.patient_number} value={p.patient_number}>
                                                    P{p.patient_number} — {p.first_name} {p.last_name}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>
                                    <Field label="Consultant" error={createForm.errors.consultant_number}>
                                        <select value={createForm.data.consultant_number}
                                            onChange={e => createForm.setData('consultant_number', e.target.value)}
                                            className={inp}>
                                            <option value="">— Select consultant —</option>
                                            {consultants.map(c => (
                                                <option key={c.staff_number} value={c.staff_number}>
                                                    {c.first_name} {c.last_name}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>
                                    <Field label="Date" error={createForm.errors.appointment_date}>
                                        <input type="date" value={createForm.data.appointment_date}
                                            onChange={e => createForm.setData('appointment_date', e.target.value)}
                                            className={inp} />
                                    </Field>
                                    <Field label="Time">
                                        <input type="time" value={createForm.data.appointment_time}
                                            onChange={e => createForm.setData('appointment_time', e.target.value)}
                                            className={inp} />
                                    </Field>
                                    <Field label="Examination Room">
                                        <input value={createForm.data.examination_room}
                                            onChange={e => createForm.setData('examination_room', e.target.value)}
                                            className={inp} placeholder="e.g. E252" />
                                    </Field>
                                </div>
                                <div className="flex gap-3 pt-2 border-t border-gray-200">
                                    <button type="submit" disabled={createForm.processing}
                                        className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                        {createForm.processing ? 'Saving…' : '✓ Create Appointment'}
                                    </button>
                                    <button type="button" onClick={() => setModal(null)}
                                        className="px-5 py-2 text-sm text-gray-600 hover:underline">Cancel</button>
                                </div>
                            </form>
                        )}

                        {/* Edit Appointment */}
                        {modal === 'edit' && (
                            <form onSubmit={submitEdit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Consultant" error={editForm.errors.consultant_number}>
                                        <select value={editForm.data.consultant_number}
                                            onChange={e => editForm.setData('consultant_number', e.target.value)}
                                            className={inp}>
                                            <option value="">— Select consultant —</option>
                                            {consultants.map(c => (
                                                <option key={c.staff_number} value={c.staff_number}>
                                                    {c.first_name} {c.last_name}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>
                                    <Field label="Outcome" error={editForm.errors.outcome}>
                                        <select value={editForm.data.outcome}
                                            onChange={e => editForm.setData('outcome', e.target.value)}
                                            className={inp}>
                                            <option value="Waiting list">Waiting list</option>
                                            <option value="Outpatient">Outpatient</option>
                                        </select>
                                    </Field>
                                    <Field label="Date" error={editForm.errors.appointment_date}>
                                        <input type="date" value={editForm.data.appointment_date}
                                            onChange={e => editForm.setData('appointment_date', e.target.value)}
                                            className={inp} />
                                    </Field>
                                    <Field label="Time">
                                        <input type="time" value={editForm.data.appointment_time}
                                            onChange={e => editForm.setData('appointment_time', e.target.value)}
                                            className={inp} />
                                    </Field>
                                    <div className="col-span-2">
                                        <Field label="Examination Room">
                                            <input value={editForm.data.examination_room}
                                                onChange={e => editForm.setData('examination_room', e.target.value)}
                                                className={inp} placeholder="e.g. E252" />
                                        </Field>
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <button type="submit" disabled={editForm.processing}
                                        className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                        {editForm.processing ? 'Saving…' : 'Save Changes'}
                                    </button>
                                    <button type="button" onClick={() => setModal(null)}
                                        className="px-5 py-2 text-sm text-gray-600 dark:text-gray-400 hover:underline">Cancel</button>
                                </div>
                            </form>
                        )}

                        {/* Treatment */}
                        {modal === 'treatment' && (
                            <form onSubmit={submitTreatment} className="space-y-4">
                                {selected?.treatment && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-xs text-amber-700">
                                        A treatment record exists — saving will update it.
                                    </div>
                                )}
                                <Field label="Treatment Date" error={treatmentForm.errors.treatment_date}>
                                    <input type="date" value={treatmentForm.data.treatment_date}
                                        onChange={e => treatmentForm.setData('treatment_date', e.target.value)}
                                        className={inp} />
                                </Field>
                                <Field label="Diagnosis" error={treatmentForm.errors.diagnosis}>
                                    <textarea value={treatmentForm.data.diagnosis}
                                        onChange={e => treatmentForm.setData('diagnosis', e.target.value)}
                                        className={inp} rows={2} placeholder="e.g. Fractured femur" />
                                </Field>
                                <Field label="Procedure" error={treatmentForm.errors.procedure}>
                                    <textarea value={treatmentForm.data.procedure}
                                        onChange={e => treatmentForm.setData('procedure', e.target.value)}
                                        className={inp} rows={2} placeholder="e.g. Surgical repair" />
                                </Field>
                                <Field label="Notes">
                                    <textarea value={treatmentForm.data.notes}
                                        onChange={e => treatmentForm.setData('notes', e.target.value)}
                                        className={inp} rows={2} placeholder="Additional notes…" />
                                </Field>
                                <div className="flex gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <button type="submit" disabled={treatmentForm.processing}
                                        className="px-5 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50">
                                        {treatmentForm.processing ? 'Saving…' : '✓ Save Treatment'}
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