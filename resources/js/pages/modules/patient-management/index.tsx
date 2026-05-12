import AppLayout from '@/layouts/app-layout';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useFetch } from '@/hooks/useFetch';

interface Patient {
    patient_number: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    sex: string;
    marital_status: string;
    address: string;
    telephone: string;
    date_registered: string;
    clinic_number: string | null;
    inpatient: Inpatient | null;
    outpatient: Outpatient | null;
    next_of_kin: Kin[];
    appointments: Appointment[];
    local_doctor: Doctor | null;
}

interface Inpatient {
    id: number;
    ward_number: number;
    bed_number: number;
    date_on_waitlist: string | null;
    date_placed: string;
    expected_leave_date: string | null;
    expected_stay_days: number | null;
    actual_leave_date: string | null;
}

interface Outpatient {
    id: number;
    appointment_date: string;
    appointment_time: string;
}

interface Kin {
    id: number;
    full_name: string;
    relationship: string;
    address: string;
    telephone: string;
}

interface Appointment {
    appointment_number: string;
    appointment_date: string;
    appointment_time: string;
    examination_room: string;
    outcome: string;
    consultant_number: string;
}

interface Ward      { ward_number: number; ward_name: string }
interface Doctor    { clinic_number: string; full_name: string; telephone: string; }
interface Consultant { staff_number: string; first_name: string; last_name: string }

type Tab   = 'details' | 'admission' | 'nextofkin' | 'appointments';
type Modal = null | 'register' | 'edit' | 'admit' | 'outpatient' | 'appointment';

function getStatus(p: Patient) {
    if (p.inpatient && !p.inpatient.actual_leave_date) return { label: 'In-Patient',  color: 'bg-teal-100 text-teal-700' };
    if (p.outpatient)                                  return { label: 'Out-Patient', color: 'bg-amber-100 text-amber-700' };
    return { label: 'Registered', color: 'bg-gray-100 text-gray-600' };
}

const BLANK_REGISTER = {
    patient_number: '', first_name: '', last_name: '', address: '', telephone: '',
    date_of_birth: '', sex: 'Female', marital_status: 'Single',
    date_registered: new Date().toISOString().split('T')[0],
    clinic_number: '', doctor_full_name: '', doctor_address: '', doctor_telephone: '',
    kin: [{ full_name: '', relationship: '', address: '', telephone: '' }],
};

const initialData = { patients: [] as any[], wards: [] as any[], doctors: [] as any[], consultants: [] as any[] };

export default function PatientsPage() {
    const { data, loading } = useFetch('/api/modules/patient-management', initialData);

    const [patients,    setPatients]    = useState<any[]>([]);
    const [wards,       setWards]       = useState<any[]>([]);
    const [doctors,     setDoctors]     = useState<any[]>([]);
    const [consultants, setConsultants] = useState<any[]>([]);

    useEffect(() => {
        if (data.patients    !== undefined) setPatients(data.patients);
        if (data.wards       !== undefined) setWards(data.wards);
        if (data.doctors     !== undefined) setDoctors(data.doctors);
        if (data.consultants !== undefined) setConsultants(data.consultants);
    }, [data]);

    const loadData = useCallback(() => {
        axios.get('/api/modules/patient-management').then(r => {
            if (r.data.patients    !== undefined) setPatients(r.data.patients);
            if (r.data.wards       !== undefined) setWards(r.data.wards);
            if (r.data.doctors     !== undefined) setDoctors(r.data.doctors);
            if (r.data.consultants !== undefined) setConsultants(r.data.consultants);
        });
    }, []);

    const [selected, setSelected] = useState<Patient | null>(null);
    const [tab, setTab]           = useState<Tab>('details');
    const [modal, setModal]       = useState<Modal>(null);
    const [search, setSearch]     = useState('');
    const [view, setView]         = useState<'all' | 'in' | 'out'>('all');
    const [detailLoading, setDetailLoading] = useState(false);
    const [step, setStep]         = useState(0);

    // Register form
    const [registerFormData, setRegisterFormData]             = useState({ ...BLANK_REGISTER });
    const [registerFormErrors, setRegisterFormErrors]         = useState<Record<string, string>>({});
    const [registerFormProcessing, setRegisterFormProcessing] = useState(false);

    // Edit form
    const [editFormData, setEditFormData]             = useState({ first_name: '', last_name: '', address: '', telephone: '', date_of_birth: '', sex: 'Female', marital_status: 'Single' });
    const [editFormErrors, setEditFormErrors]         = useState<Record<string, string>>({});
    const [editFormProcessing, setEditFormProcessing] = useState(false);

    // Admit form
    const [admitFormData, setAdmitFormData]             = useState({ ward_number: '', bed_number: '', date_on_waitlist: '', date_placed: new Date().toISOString().split('T')[0], expected_leave_date: '', expected_stay_days: '' });
    const [admitFormErrors, setAdmitFormErrors]         = useState<Record<string, string>>({});
    const [admitFormProcessing, setAdmitFormProcessing] = useState(false);

    // Outpatient form
    const [outpatientFormData, setOutpatientFormData]             = useState({ appointment_date: '', appointment_time: '' });
    const [outpatientFormErrors, setOutpatientFormErrors]         = useState<Record<string, string>>({});
    const [outpatientFormProcessing, setOutpatientFormProcessing] = useState(false);

    // Appointment form
    const [appointmentFormData, setAppointmentFormData]             = useState({ appointment_number: '', consultant_number: '', appointment_date: new Date().toISOString().split('T')[0], appointment_time: '', examination_room: '', outcome: 'Waiting list' });
    const [appointmentFormErrors, setAppointmentFormErrors]         = useState<Record<string, string>>({});
    const [appointmentFormProcessing, setAppointmentFormProcessing] = useState(false);

    async function selectPatient(p: Patient) {
        // Show panel immediately with list data; enrich with full details in background
        setSelected({ ...p, next_of_kin: p.next_of_kin ?? [], appointments: p.appointments ?? [] });
        setTab('details');
        setDetailLoading(true);
        try {
            const res = await axios.get(`/api/modules/patient-management/${p.patient_number}/details`);
            setSelected(res.data);
        } catch {
            // leave list data as-is
        } finally {
            setDetailLoading(false);
        }
    }

    async function refreshSelected() {
        if (!selected) return;
        const res = await axios.get(`/api/modules/patient-management/${selected.patient_number}/details`);
        setSelected(res.data);
    }

    function flattenErrors(err: any): Record<string, string> {
        const d = err?.response?.data?.errors ?? {};
        const f: Record<string, string> = {};
        Object.entries(d).forEach(([k, v]) => f[k] = (v as string[])[0]);
        return f;
    }

    const filtered = patients.filter(p => {
        const name        = `${p.first_name} ${p.last_name}`.toLowerCase();
        const matchSearch = name.includes(search.toLowerCase()) || p.patient_number.includes(search);
        if (view === 'in')  return matchSearch && p.inpatient && !p.inpatient.actual_leave_date;
        if (view === 'out') return matchSearch && p.outpatient && !(p.inpatient && !p.inpatient.actual_leave_date);
        return matchSearch;
    });

    function openRegister() {
        setRegisterFormData({ ...BLANK_REGISTER });
        setRegisterFormErrors({});
        setStep(0);
        setModal('register');
    }

    function openEdit(p: Patient) {
        setEditFormData({ first_name: p.first_name, last_name: p.last_name, address: p.address ?? '', telephone: p.telephone ?? '', date_of_birth: p.date_of_birth, sex: p.sex, marital_status: p.marital_status });
        setEditFormErrors({});
        setModal('edit');
    }

    const tabs: { id: Tab; label: string }[] = [
        { id: 'details',      label: 'Details' },
        { id: 'admission',    label: 'Admission' },
        { id: 'nextofkin',    label: 'Next of Kin' },
        { id: 'appointments', label: 'Appointments' },
    ];

    const isAdmitted = selected?.inpatient && !selected.inpatient.actual_leave_date;

    return (
        <AppLayout>
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Patient Management</h2>
                    <button onClick={openRegister} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                        + Register Patient
                    </button>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    {loading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="rounded-xl p-4 border border-gray-100 bg-gray-50 dark:bg-gray-800">
                                <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700 animate-pulse mb-2" />
                                <div className="h-7 w-12 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                            </div>
                        ))
                    ) : (
                        <>
                            <StatCard label="Registered"   value={patients.length} color="blue" />
                            <StatCard label="In-Patients"  value={patients.filter(p => p.inpatient && !p.inpatient.actual_leave_date).length} color="teal" />
                            <StatCard label="Out-Patients" value={patients.filter(p => p.outpatient && !(p.inpatient && !p.inpatient.actual_leave_date)).length} color="amber" />
                            <StatCard label="Appointments" value={patients.reduce((a, p) => a + (p.appointments?.length ?? 0), 0)} color="purple" />
                        </>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-6 items-start">
                    {/* Patient list */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between gap-2">
                            <div className="flex gap-1">
                                {(['all', 'in', 'out'] as const).map(v => (
                                    <button key={v} onClick={() => setView(v)}
                                        className={`px-3 py-1 text-xs rounded-lg font-medium ${view === v ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                                        {v === 'all' ? 'All' : v === 'in' ? 'In-Patients' : 'Out-Patients'}
                                    </button>
                                ))}
                            </div>
                            <input placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)}
                                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-40 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100" />
                        </div>
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3 text-left">No.</th>
                                    <th className="px-4 py-3 text-left">Name</th>
                                    <th className="px-4 py-3 text-left">Sex</th>
                                    <th className="px-4 py-3 text-left">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i}>
                                            {Array.from({ length: 4 }).map((_, j) => (
                                                <td key={j} className="px-4 py-3">
                                                    <div className="h-4 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : (
                                    <>
                                        {filtered.map(p => {
                                            const status = getStatus(p);
                                            return (
                                                <tr key={p.patient_number} onClick={() => selectPatient(p)}
                                                    className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${selected?.patient_number === p.patient_number ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}>
                                                    <td className="px-4 py-3 font-mono text-xs">P{p.patient_number}</td>
                                                    <td className="px-4 py-3 font-medium">{p.first_name} {p.last_name}</td>
                                                    <td className="px-4 py-3 text-xs">{p.sex}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${status.color}`}>{status.label}</span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {filtered.length === 0 && (
                                            <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-sm">No patients found.</td></tr>
                                        )}
                                    </>
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
                                    <p className="text-xs text-gray-500 dark:text-gray-400">P{selected.patient_number} · Registered {selected.date_registered}</p>
                                </div>
                                <div className="flex gap-2 items-center">
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatus(selected).color}`}>{getStatus(selected).label}</span>
                                    <button onClick={() => openEdit(selected)} className="text-xs text-blue-600 hover:underline">Edit</button>
                                </div>
                            </div>

                            <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-700 flex gap-2 flex-wrap">
                                {!isAdmitted && (
                                    <button onClick={() => setModal('admit')} className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700">
                                        + Admit to Ward
                                    </button>
                                )}
                                {isAdmitted && (
                                    <button onClick={async () => {
                                        if (confirm('Discharge this patient?')) {
                                            await axios.post(`/api/modules/patient-management/${selected.patient_number}/discharge`, {});
                                            loadData();
                                            refreshSelected();
                                        }
                                    }} className="px-3 py-1.5 bg-teal-600 text-white text-xs rounded-lg hover:bg-teal-700">
                                        ✓ Discharge
                                    </button>
                                )}
                                <button onClick={() => setModal('outpatient')} className="px-3 py-1.5 bg-amber-500 text-white text-xs rounded-lg hover:bg-amber-600">
                                    + Out-Patient
                                </button>
                                <button onClick={() => setModal('appointment')} className="px-3 py-1.5 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700">
                                    + Appointment
                                </button>
                            </div>

                            <div className="flex border-b border-gray-200 dark:border-gray-700">
                                {tabs.map(t => (
                                    <button key={t.id} onClick={() => setTab(t.id)}
                                        className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${tab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
                                        {t.label}
                                    </button>
                                ))}
                            </div>

                            {detailLoading ? (
                                <div className="p-8 text-center text-gray-400 text-sm">Loading…</div>
                            ) : (
                                <>
                                    {tab === 'details' && (
                                        <div className="p-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                                            <Detail label="Sex"            value={selected.sex} />
                                            <Detail label="Date of Birth"  value={selected.date_of_birth} />
                                            <Detail label="Marital Status" value={selected.marital_status} />
                                            <Detail label="Telephone"      value={selected.telephone} />
                                            <div className="col-span-2"><Detail label="Address" value={selected.address} /></div>
                                            {selected.local_doctor && (
                                                <div className="col-span-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Local Doctor</p>
                                                    <p className="font-medium text-gray-800 dark:text-gray-100">{selected.local_doctor.full_name}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{selected.local_doctor?.telephone ?? '—'}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {tab === 'admission' && (
                                        <div className="p-5">
                                            {selected.inpatient ? (
                                                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                                                    <Detail label="Ward"          value={`Ward ${selected.inpatient.ward_number}`} />
                                                    <Detail label="Bed"           value={String(selected.inpatient.bed_number)} />
                                                    <Detail label="Date Placed"   value={selected.inpatient.date_placed} />
                                                    <Detail label="Expected Leave" value={selected.inpatient.expected_leave_date ?? '—'} />
                                                    <Detail label="Actual Leave"  value={selected.inpatient.actual_leave_date ?? 'Still admitted'} />
                                                    <Detail label="Expected Stay" value={selected.inpatient.expected_stay_days ? `${selected.inpatient.expected_stay_days} days` : '—'} />
                                                </div>
                                            ) : selected.outpatient ? (
                                                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                                                    <Detail label="Type"             value="Out-Patient" />
                                                    <Detail label="Appointment Date" value={selected.outpatient.appointment_date} />
                                                    <Detail label="Appointment Time" value={selected.outpatient.appointment_time} />
                                                </div>
                                            ) : (
                                                <p className="text-gray-400 text-sm text-center py-8">No admission record.</p>
                                            )}
                                        </div>
                                    )}

                                    {tab === 'nextofkin' && (
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase text-xs">
                                                <tr>
                                                    <th className="px-4 py-3 text-left">Name</th>
                                                    <th className="px-4 py-3 text-left">Relationship</th>
                                                    <th className="px-4 py-3 text-left">Telephone</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                {selected.next_of_kin?.length > 0 ? selected.next_of_kin.map(k => (
                                                    <tr key={k.id}>
                                                        <td className="px-4 py-3 font-medium">{k.full_name}</td>
                                                        <td className="px-4 py-3">{k.relationship}</td>
                                                        <td className="px-4 py-3 font-mono text-xs">{k.telephone}</td>
                                                    </tr>
                                                )) : <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-400 text-sm">No next of kin recorded.</td></tr>}
                                            </tbody>
                                        </table>
                                    )}

                                    {tab === 'appointments' && (
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase text-xs">
                                                <tr>
                                                    <th className="px-4 py-3 text-left">No.</th>
                                                    <th className="px-4 py-3 text-left">Date</th>
                                                    <th className="px-4 py-3 text-left">Room</th>
                                                    <th className="px-4 py-3 text-left">Outcome</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                {selected.appointments?.length > 0 ? selected.appointments.map(a => (
                                                    <tr key={a.appointment_number}>
                                                        <td className="px-4 py-3 font-mono text-xs">{a.appointment_number}</td>
                                                        <td className="px-4 py-3">{a.appointment_date}</td>
                                                        <td className="px-4 py-3">{a.examination_room}</td>
                                                        <td className="px-4 py-3">
                                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${a.outcome === 'Outpatient' ? 'bg-amber-100 text-amber-700' : 'bg-teal-100 text-teal-700'}`}>
                                                                {a.outcome}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                )) : <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-sm">No appointments recorded.</td></tr>}
                                            </tbody>
                                        </table>
                                    )}
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center h-64">
                            <p className="text-gray-400 text-sm">Select a patient to view their record.</p>
                        </div>
                    )}
                </div>

                {/* MODALS */}
                {modal && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setModal(null)}>
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                    {modal === 'register'   ? 'Register New Patient' :
                                    modal === 'edit'       ? 'Edit Patient' :
                                    modal === 'admit'      ? `Admit — P${selected?.patient_number}` :
                                    modal === 'outpatient' ? `Out-Patient — P${selected?.patient_number}` :
                                    'New Appointment'}
                                </h3>
                                <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
                            </div>

                            {/* REGISTER */}
                            {modal === 'register' && (
                                <>
                                    <div className="flex mb-5 border-b border-gray-200 dark:border-gray-700">
                                        {['Patient Info', 'Next of Kin', 'Local Doctor'].map((s, i) => (
                                            <div key={s} className={`flex-1 text-center pb-2 text-xs font-medium border-b-2 -mb-px ${step === i ? 'border-blue-600 text-blue-600' : step > i ? 'border-green-500 text-green-600' : 'border-transparent text-gray-400'}`}>
                                                {step > i ? '✓ ' : ''}{s}
                                            </div>
                                        ))}
                                    </div>

                                    {step === 0 && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <Field label="Patient Number" error={registerFormErrors.patient_number}>
                                                <input value={registerFormData.patient_number} onChange={e => setRegisterFormData(p => ({...p, patient_number: e.target.value}))} className={inp} placeholder="e.g. P10234" />
                                            </Field>
                                            <Field label="Date Registered">
                                                <input type="date" value={registerFormData.date_registered} onChange={e => setRegisterFormData(p => ({...p, date_registered: e.target.value}))} className={inp} />
                                            </Field>
                                            <Field label="First Name" error={registerFormErrors.first_name}>
                                                <input value={registerFormData.first_name} onChange={e => setRegisterFormData(p => ({...p, first_name: e.target.value}))} className={inp} />
                                            </Field>
                                            <Field label="Last Name" error={registerFormErrors.last_name}>
                                                <input value={registerFormData.last_name} onChange={e => setRegisterFormData(p => ({...p, last_name: e.target.value}))} className={inp} />
                                            </Field>
                                            <Field label="Sex">
                                                <select value={registerFormData.sex} onChange={e => setRegisterFormData(p => ({...p, sex: e.target.value}))} className={inp}>
                                                    <option>Female</option><option>Male</option>
                                                </select>
                                            </Field>
                                            <Field label="Date of Birth" error={registerFormErrors.date_of_birth}>
                                                <input type="date" value={registerFormData.date_of_birth} onChange={e => setRegisterFormData(p => ({...p, date_of_birth: e.target.value}))} className={inp} />
                                            </Field>
                                            <Field label="Marital Status">
                                                <select value={registerFormData.marital_status} onChange={e => setRegisterFormData(p => ({...p, marital_status: e.target.value}))} className={inp}>
                                                    <option>Single</option><option>Married</option><option>Widowed</option><option>Divorced</option>
                                                </select>
                                            </Field>
                                            <Field label="Telephone">
                                                <input value={registerFormData.telephone} onChange={e => setRegisterFormData(p => ({...p, telephone: e.target.value}))} className={inp} />
                                            </Field>
                                            <div className="col-span-2">
                                                <Field label="Address">
                                                    <input value={registerFormData.address} onChange={e => setRegisterFormData(p => ({...p, address: e.target.value}))} className={inp} />
                                                </Field>
                                            </div>
                                        </div>
                                    )}

                                    {step === 1 && (
                                        <div className="space-y-3">
                                            {(registerFormData.kin as any[]).map((k, i) => (
                                                <div key={i} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <Field label="Full Name">
                                                            <input value={k.full_name} onChange={e => { const kin = [...registerFormData.kin as any[]]; kin[i].full_name = e.target.value; setRegisterFormData(p => ({...p, kin})); }} className={inp} />
                                                        </Field>
                                                        <Field label="Relationship">
                                                            <input value={k.relationship} onChange={e => { const kin = [...registerFormData.kin as any[]]; kin[i].relationship = e.target.value; setRegisterFormData(p => ({...p, kin})); }} className={inp} />
                                                        </Field>
                                                        <Field label="Telephone">
                                                            <input value={k.telephone} onChange={e => { const kin = [...registerFormData.kin as any[]]; kin[i].telephone = e.target.value; setRegisterFormData(p => ({...p, kin})); }} className={inp} />
                                                        </Field>
                                                        <Field label="Address">
                                                            <input value={k.address} onChange={e => { const kin = [...registerFormData.kin as any[]]; kin[i].address = e.target.value; setRegisterFormData(p => ({...p, kin})); }} className={inp} />
                                                        </Field>
                                                    </div>
                                                </div>
                                            ))}
                                            <button type="button" onClick={() => setRegisterFormData(p => ({...p, kin: [...p.kin as any[], { full_name: '', relationship: '', address: '', telephone: '' }]}))}
                                                className="text-sm text-blue-600 hover:underline">+ Add another</button>
                                        </div>
                                    )}

                                    {step === 2 && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <Field label="Clinic Number">
                                                <input value={registerFormData.clinic_number} onChange={e => setRegisterFormData(p => ({...p, clinic_number: e.target.value}))} className={inp} placeholder="e.g. C001" />
                                            </Field>
                                            <Field label="Full Name">
                                                <input value={registerFormData.doctor_full_name} onChange={e => setRegisterFormData(p => ({...p, doctor_full_name: e.target.value}))} className={inp} placeholder="Dr. Name" />
                                            </Field>
                                            <Field label="Telephone">
                                                <input value={registerFormData.doctor_telephone} onChange={e => setRegisterFormData(p => ({...p, doctor_telephone: e.target.value}))} className={inp} />
                                            </Field>
                                            <div className="col-span-2">
                                                <Field label="Address">
                                                    <input value={registerFormData.doctor_address} onChange={e => setRegisterFormData(p => ({...p, doctor_address: e.target.value}))} className={inp} />
                                                </Field>
                                            </div>
                                            <p className="col-span-2 text-xs text-gray-400">Local doctor is optional — leave blank to skip.</p>
                                        </div>
                                    )}

                                    <div className="flex justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <button type="button" onClick={step === 0 ? () => setModal(null) : () => setStep(s => s - 1)}
                                            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:underline">
                                            {step === 0 ? 'Cancel' : '← Back'}
                                        </button>
                                        {step < 2 ? (
                                            <button type="button" onClick={() => setStep(s => s + 1)}
                                                className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                                                Next →
                                            </button>
                                        ) : (
                                            <button type="button" disabled={registerFormProcessing}
                                                onClick={async () => {
                                                    setRegisterFormProcessing(true);
                                                    setRegisterFormErrors({});
                                                    try {
                                                        await axios.post('/api/modules/patient-management', registerFormData);
                                                        setModal(null);
                                                        setRegisterFormData({ ...BLANK_REGISTER });
                                                        loadData();
                                                    } catch (err: any) {
                                                        setRegisterFormErrors(flattenErrors(err));
                                                    } finally {
                                                        setRegisterFormProcessing(false);
                                                    }
                                                }}
                                                className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                                {registerFormProcessing ? 'Registering…' : '✓ Register Patient'}
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* EDIT */}
                            {modal === 'edit' && (
                                <form onSubmit={async e => {
                                    e.preventDefault();
                                    setEditFormProcessing(true); setEditFormErrors({});
                                    try {
                                        await axios.put(`/api/modules/patient-management/${selected!.patient_number}`, editFormData);
                                        setModal(null); refreshSelected(); loadData();
                                    } catch (err: any) {
                                        setEditFormErrors(flattenErrors(err));
                                    } finally { setEditFormProcessing(false); }
                                }} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field label="First Name" error={editFormErrors.first_name}><input value={editFormData.first_name} onChange={e => setEditFormData(p => ({...p, first_name: e.target.value}))} className={inp} /></Field>
                                        <Field label="Last Name"  error={editFormErrors.last_name}><input value={editFormData.last_name}  onChange={e => setEditFormData(p => ({...p, last_name: e.target.value}))}  className={inp} /></Field>
                                        <Field label="Sex"><select value={editFormData.sex} onChange={e => setEditFormData(p => ({...p, sex: e.target.value}))} className={inp}><option>Female</option><option>Male</option></select></Field>
                                        <Field label="Date of Birth"><input type="date" value={editFormData.date_of_birth} onChange={e => setEditFormData(p => ({...p, date_of_birth: e.target.value}))} className={inp} /></Field>
                                        <Field label="Marital Status"><select value={editFormData.marital_status} onChange={e => setEditFormData(p => ({...p, marital_status: e.target.value}))} className={inp}><option>Single</option><option>Married</option><option>Widowed</option><option>Divorced</option></select></Field>
                                        <Field label="Telephone"><input value={editFormData.telephone} onChange={e => setEditFormData(p => ({...p, telephone: e.target.value}))} className={inp} /></Field>
                                        <div className="col-span-2"><Field label="Address"><input value={editFormData.address} onChange={e => setEditFormData(p => ({...p, address: e.target.value}))} className={inp} /></Field></div>
                                    </div>
                                    <div className="flex gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <button type="submit" disabled={editFormProcessing} className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50">{editFormProcessing ? 'Saving…' : 'Save Changes'}</button>
                                        <button type="button" onClick={() => setModal(null)} className="px-5 py-2 text-sm text-gray-600 dark:text-gray-400 hover:underline">Cancel</button>
                                    </div>
                                </form>
                            )}

                            {/* ADMIT */}
                            {modal === 'admit' && (
                                <form onSubmit={async e => {
                                    e.preventDefault();
                                    setAdmitFormProcessing(true); setAdmitFormErrors({});
                                    try {
                                        await axios.post(`/api/modules/patient-management/${selected!.patient_number}/admit`, admitFormData);
                                        setModal(null); refreshSelected(); loadData();
                                    } catch (err: any) {
                                        setAdmitFormErrors(flattenErrors(err));
                                    } finally { setAdmitFormProcessing(false); }
                                }} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field label="Ward" error={admitFormErrors.ward_number}>
                                            <select value={admitFormData.ward_number} onChange={e => setAdmitFormData(p => ({...p, ward_number: e.target.value}))} className={inp}>
                                                <option value="">— Select ward —</option>
                                                {wards.map(w => <option key={w.ward_number} value={w.ward_number}>Ward {w.ward_number} — {w.ward_name}</option>)}
                                            </select>
                                        </Field>
                                        <Field label="Bed Number" error={admitFormErrors.bed_number}>
                                            <input type="number" value={admitFormData.bed_number} onChange={e => setAdmitFormData(p => ({...p, bed_number: e.target.value}))} className={inp} placeholder="e.g. 84" />
                                        </Field>
                                        <Field label="Date on Waitlist">
                                            <input type="date" value={admitFormData.date_on_waitlist} onChange={e => setAdmitFormData(p => ({...p, date_on_waitlist: e.target.value}))} className={inp} />
                                        </Field>
                                        <Field label="Date Placed" error={admitFormErrors.date_placed}>
                                            <input type="date" value={admitFormData.date_placed} onChange={e => setAdmitFormData(p => ({...p, date_placed: e.target.value}))} className={inp} />
                                        </Field>
                                        <Field label="Expected Leave Date">
                                            <input type="date" value={admitFormData.expected_leave_date} onChange={e => setAdmitFormData(p => ({...p, expected_leave_date: e.target.value}))} className={inp} />
                                        </Field>
                                        <Field label="Expected Stay (days)">
                                            <input type="number" value={admitFormData.expected_stay_days} onChange={e => setAdmitFormData(p => ({...p, expected_stay_days: e.target.value}))} className={inp} placeholder="e.g. 5" />
                                        </Field>
                                    </div>
                                    <div className="flex gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <button type="submit" disabled={admitFormProcessing} className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50">{admitFormProcessing ? 'Admitting…' : '✓ Admit Patient'}</button>
                                        <button type="button" onClick={() => setModal(null)} className="px-5 py-2 text-sm text-gray-600 dark:text-gray-400 hover:underline">Cancel</button>
                                    </div>
                                </form>
                            )}

                            {/* OUTPATIENT */}
                            {modal === 'outpatient' && (
                                <form onSubmit={async e => {
                                    e.preventDefault();
                                    setOutpatientFormProcessing(true); setOutpatientFormErrors({});
                                    try {
                                        await axios.post(`/api/modules/patient-management/${selected!.patient_number}/outpatient`, outpatientFormData);
                                        setModal(null); refreshSelected(); loadData();
                                    } catch (err: any) {
                                        setOutpatientFormErrors(flattenErrors(err));
                                    } finally { setOutpatientFormProcessing(false); }
                                }} className="space-y-4">
                                    <Field label="Appointment Date" error={outpatientFormErrors.appointment_date}>
                                        <input type="date" value={outpatientFormData.appointment_date} onChange={e => setOutpatientFormData(p => ({...p, appointment_date: e.target.value}))} className={inp} />
                                    </Field>
                                    <Field label="Appointment Time" error={outpatientFormErrors.appointment_time}>
                                        <input type="time" value={outpatientFormData.appointment_time} onChange={e => setOutpatientFormData(p => ({...p, appointment_time: e.target.value}))} className={inp} />
                                    </Field>
                                    <div className="flex gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <button type="submit" disabled={outpatientFormProcessing} className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50">{outpatientFormProcessing ? 'Saving…' : '✓ Set Appointment'}</button>
                                        <button type="button" onClick={() => setModal(null)} className="px-5 py-2 text-sm text-gray-600 dark:text-gray-400 hover:underline">Cancel</button>
                                    </div>
                                </form>
                            )}

                            {/* APPOINTMENT */}
                            {modal === 'appointment' && (
                                <form onSubmit={async e => {
                                    e.preventDefault();
                                    setAppointmentFormProcessing(true); setAppointmentFormErrors({});
                                    try {
                                        await axios.post(`/api/modules/patient-management/${selected!.patient_number}/appointment`, appointmentFormData);
                                        setModal(null); refreshSelected(); loadData();
                                    } catch (err: any) {
                                        setAppointmentFormErrors(flattenErrors(err));
                                    } finally { setAppointmentFormProcessing(false); }
                                }} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field label="Appointment No." error={appointmentFormErrors.appointment_number}>
                                            <input value={appointmentFormData.appointment_number} onChange={e => setAppointmentFormData(p => ({...p, appointment_number: e.target.value}))} className={inp} placeholder="e.g. A1001" />
                                        </Field>
                                        <Field label="Consultant" error={appointmentFormErrors.consultant_number}>
                                            <select value={appointmentFormData.consultant_number} onChange={e => setAppointmentFormData(p => ({...p, consultant_number: e.target.value}))} className={inp}>
                                                <option value="">— Select —</option>
                                                {consultants.map(c => <option key={c.staff_number} value={c.staff_number}>{c.first_name} {c.last_name}</option>)}
                                            </select>
                                        </Field>
                                        <Field label="Date" error={appointmentFormErrors.appointment_date}>
                                            <input type="date" value={appointmentFormData.appointment_date} onChange={e => setAppointmentFormData(p => ({...p, appointment_date: e.target.value}))} className={inp} />
                                        </Field>
                                        <Field label="Time">
                                            <input type="time" value={appointmentFormData.appointment_time} onChange={e => setAppointmentFormData(p => ({...p, appointment_time: e.target.value}))} className={inp} />
                                        </Field>
                                        <Field label="Exam Room">
                                            <input value={appointmentFormData.examination_room} onChange={e => setAppointmentFormData(p => ({...p, examination_room: e.target.value}))} className={inp} placeholder="e.g. E252" />
                                        </Field>
                                    </div>
                                    <div className="flex gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <button type="submit" disabled={appointmentFormProcessing} className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50">{appointmentFormProcessing ? 'Saving…' : '✓ Record Appointment'}</button>
                                        <button type="button" onClick={() => setModal(null)} className="px-5 py-2 text-sm text-gray-600 dark:text-gray-400 hover:underline">Cancel</button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )}
            </div>
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