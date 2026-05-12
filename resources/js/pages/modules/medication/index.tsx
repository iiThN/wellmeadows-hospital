import AppLayout from '@/layouts/app-layout';
import { useState, useEffect, useCallback } from 'react';
import { type BreadcrumbItem } from '@/types';
import axios from 'axios';
import { useFetch } from '@/hooks/useFetch';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Medication', href: '/modules/medication' },
];

const initialData = {
    medications: [] as any[],
    drugs:       [] as any[],
    patients:    [] as any[],
};

export default function MedicationPage() {
    const { data, loading } = useFetch('/api/modules/medication', initialData);

    const [medications, setMedications] = useState<any[]>([]);
    const [drugs, setDrugs]             = useState<any[]>([]);
    const [patients, setPatients]       = useState<any[]>([]);

    useEffect(() => {
        if (data.medications) setMedications(data.medications);
        if (data.drugs)       setDrugs(data.drugs);
        if (data.patients)    setPatients(data.patients);
    }, [data]);

    const reloadData = useCallback(() => {
        axios.get('/api/modules/medication').then(r => {
            if (r.data.medications !== undefined) setMedications(r.data.medications);
            if (r.data.drugs !== undefined)       setDrugs(r.data.drugs);
            if (r.data.patients !== undefined)    setPatients(r.data.patients);
        });
    }, []);

    const [tab, setTab]                   = useState<'drugs' | 'prescriptions'>('drugs');
    const [modal, setModal]               = useState(false);
    const [search, setSearch]             = useState('');
    const [reportPatient, setReportPatient] = useState('');

    const [formData, setFormData] = useState({
        patient_number: '', drug_number: '', units_per_day: '',
        method_of_admin: 'Oral', start_date: '', finish_date: '', prescribed_by: '',
    });
    const [formErrors, setFormErrors]         = useState<Record<string, string>>({});
    const [formProcessing, setFormProcessing] = useState(false);

    async function submitRx(e: React.FormEvent) {
        e.preventDefault();
        setFormProcessing(true);
        setFormErrors({});
        try {
            await axios.post('/api/modules/medication', formData);
            setModal(false);
            setFormData({ patient_number: '', drug_number: '', units_per_day: '', method_of_admin: 'Oral', start_date: '', finish_date: '', prescribed_by: '' });
            reloadData();
        } catch (err: any) {
            const d = err?.response?.data?.errors ?? {};
            const f: Record<string, string> = {};
            Object.entries(d).forEach(([k, v]) => f[k] = (v as string[])[0]);
            setFormErrors(f);
        } finally {
            setFormProcessing(false);
        }
    }

    function destroy(id: number) {
        if (confirm('Remove this prescription?')) {
            axios.delete(`/api/modules/medication/${id}`).then(() => reloadData());
        }
    }

    const lowStock      = drugs.filter(d => d.quantity_in_stock <= d.reorder_level);
    const filteredDrugs = drugs.filter(d =>
        d.drug_name.toLowerCase().includes(search.toLowerCase()) ||
        d.description.toLowerCase().includes(search.toLowerCase())
    );
    const filteredRx = medications.filter(m => {
        const p    = patients.find(pt => pt.patient_number === m.patient_number);
        const d    = drugs.find(dr => dr.drug_number === m.drug_number);
        const name = p ? `${p.first_name} ${p.last_name}`.toLowerCase() : '';
        return name.includes(search.toLowerCase()) || (d && d.drug_name.toLowerCase().includes(search.toLowerCase()));
    });

    const patientRxReport   = reportPatient ? medications.filter(m => m.patient_number === reportPatient) : [];
    const reportPatientData = reportPatient ? patients.find(p => p.patient_number === reportPatient) : null;

    const stockBadge = (d: any) => {
        if (d.quantity_in_stock <= d.reorder_level)       return 'bg-red-100 text-red-700';
        if (d.quantity_in_stock <= d.reorder_level * 1.5) return 'bg-amber-100 text-amber-700';
        return 'bg-green-100 text-green-700';
    };

    const SkeletonRow = ({ cols }: { cols: number }) => (
        <>
            {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                    {Array.from({ length: cols }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                            <div className="h-4 rounded bg-gray-100 animate-pulse" />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col gap-4 p-4">

                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Medication & Prescriptions</h2>
                    <button onClick={() => setModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                        + Add Prescription
                    </button>
                </div>

                {!loading && lowStock.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                        🚨 <strong>Reorder alert:</strong> {lowStock.map(d => d.drug_name).join(', ')} are at or below reorder level.
                    </div>
                )}

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
                            <StatCard label="Total Drugs"        value={drugs.length} color="blue" />
                            <StatCard label="Low Stock"          value={lowStock.length} color="red" />
                            <StatCard label="Prescriptions"      value={medications.length} color="teal" />
                            <StatCard label="Patients Medicated" value={new Set(medications.map(m => m.patient_number)).size} color="purple" />
                        </>
                    )}
                </div>

                {/* Patient medication report */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                        <p className="font-medium text-gray-800 dark:text-gray-100">Patient Medication Report</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">View all medication for a specific patient</p>
                    </div>
                    <div className="px-5 py-4">
                        <select value={reportPatient} onChange={e => setReportPatient(e.target.value)} className={inp} style={{ maxWidth: 320 }}>
                            <option value="">— Select a patient —</option>
                            {patients.map(p => (
                                <option key={p.patient_number} value={p.patient_number}>
                                    P{p.patient_number} — {p.first_name} {p.last_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    {reportPatient && (
                        <>
                            <div className="px-5 py-2 bg-blue-50 dark:bg-blue-900/20 border-t border-gray-200 dark:border-gray-700 text-sm">
                                <strong>Patient:</strong> P{reportPatientData?.patient_number} — {reportPatientData?.first_name} {reportPatientData?.last_name} · <strong>{patientRxReport.length}</strong> prescription(s)
                            </div>
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase text-xs">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Rx ID</th>
                                        <th className="px-4 py-3 text-left">Drug</th>
                                        <th className="px-4 py-3 text-left">Units/Day</th>
                                        <th className="px-4 py-3 text-left">Method</th>
                                        <th className="px-4 py-3 text-left">Start</th>
                                        <th className="px-4 py-3 text-left">Finish</th>
                                        <th className="px-4 py-3 text-left"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {patientRxReport.length > 0 ? patientRxReport.map(m => {
                                        const d = drugs.find(dr => dr.drug_number === m.drug_number);
                                        return (
                                            <tr key={m.medication_id}>
                                                <td className="px-4 py-3 font-mono text-xs">Rx{m.medication_id}</td>
                                                <td className="px-4 py-3 font-medium">{d?.drug_name ?? m.drug_number}</td>
                                                <td className="px-4 py-3">{m.units_per_day}</td>
                                                <td className="px-4 py-3"><span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">{m.method_of_admin}</span></td>
                                                <td className="px-4 py-3 font-mono text-xs">{m.start_date}</td>
                                                <td className="px-4 py-3 font-mono text-xs">{m.finish_date ?? 'Ongoing'}</td>
                                                <td className="px-4 py-3">
                                                    <button onClick={() => destroy(m.medication_id)} className="text-red-500 hover:underline text-xs">Remove</button>
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-400 text-sm">No prescriptions for this patient.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </>
                    )}
                </div>

                {/* Drug catalog & all prescriptions */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <div className="flex gap-2">
                            {(['drugs', 'prescriptions'] as const).map(t => (
                                <button key={t} onClick={() => { setTab(t); setSearch(''); }}
                                    className={`px-4 py-1.5 text-sm rounded-lg font-medium ${tab === t ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                                    {t === 'drugs' ? 'Drug Catalog' : 'All Prescriptions'}
                                </button>
                            ))}
                        </div>
                        <input placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)}
                            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100" />
                    </div>

                    {tab === 'drugs' && (
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3 text-left">Drug No.</th>
                                    <th className="px-4 py-3 text-left">Name</th>
                                    <th className="px-4 py-3 text-left">Dosage</th>
                                    <th className="px-4 py-3 text-left">Method</th>
                                    <th className="px-4 py-3 text-left">In Stock</th>
                                    <th className="px-4 py-3 text-left">Reorder</th>
                                    <th className="px-4 py-3 text-left">Cost/Unit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {loading ? <SkeletonRow cols={7} /> : (
                                    <>
                                        {filteredDrugs.map(d => (
                                            <tr key={d.drug_number} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                <td className="px-4 py-3 font-mono text-xs">{d.drug_number}</td>
                                                <td className="px-4 py-3 font-medium">{d.drug_name}</td>
                                                <td className="px-4 py-3 font-mono text-xs">{d.dosage}</td>
                                                <td className="px-4 py-3"><span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">{d.method_of_admin}</span></td>
                                                <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium ${stockBadge(d)}`}>{d.quantity_in_stock}</span></td>
                                                <td className="px-4 py-3 font-mono text-xs">{d.reorder_level}</td>
                                                <td className="px-4 py-3">£{Number(d.cost_per_unit).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                        {filteredDrugs.length === 0 && <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-400 text-sm">No drugs found.</td></tr>}
                                    </>
                                )}
                            </tbody>
                        </table>
                    )}

                    {tab === 'prescriptions' && (
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3 text-left">Rx ID</th>
                                    <th className="px-4 py-3 text-left">Patient</th>
                                    <th className="px-4 py-3 text-left">Drug</th>
                                    <th className="px-4 py-3 text-left">Units/Day</th>
                                    <th className="px-4 py-3 text-left">Method</th>
                                    <th className="px-4 py-3 text-left">Start</th>
                                    <th className="px-4 py-3 text-left">Finish</th>
                                    <th className="px-4 py-3 text-left"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {loading ? <SkeletonRow cols={8} /> : (
                                    <>
                                        {filteredRx.map(m => {
                                            const p = patients.find(pt => pt.patient_number === m.patient_number);
                                            const d = drugs.find(dr => dr.drug_number === m.drug_number);
                                            return (
                                                <tr key={m.medication_id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                    <td className="px-4 py-3 font-mono text-xs">Rx{m.medication_id}</td>
                                                    <td className="px-4 py-3 font-medium">{p ? `${p.first_name} ${p.last_name}` : `P${m.patient_number}`}</td>
                                                    <td className="px-4 py-3">{d?.drug_name ?? m.drug_number}</td>
                                                    <td className="px-4 py-3">{m.units_per_day}</td>
                                                    <td className="px-4 py-3"><span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">{m.method_of_admin}</span></td>
                                                    <td className="px-4 py-3 font-mono text-xs">{m.start_date}</td>
                                                    <td className="px-4 py-3 font-mono text-xs">{m.finish_date ?? 'Ongoing'}</td>
                                                    <td className="px-4 py-3">
                                                        <button onClick={() => destroy(m.medication_id)} className="text-red-500 hover:underline text-xs">Remove</button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {filteredRx.length === 0 && <tr><td colSpan={8} className="px-4 py-6 text-center text-gray-400 text-sm">No prescriptions found.</td></tr>}
                                    </>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modal */}
            {modal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setModal(false)}>
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Add Prescription</h3>
                            <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
                        </div>
                        <form onSubmit={submitRx} className="space-y-4">
                            <Field label="Patient" error={formErrors.patient_number}>
                                <select value={formData.patient_number} onChange={e => setFormData(p => ({...p, patient_number: e.target.value}))} className={inp}>
                                    <option value="">— Select patient —</option>
                                    {patients.map(p => <option key={p.patient_number} value={p.patient_number}>P{p.patient_number} — {p.first_name} {p.last_name}</option>)}
                                </select>
                            </Field>
                            <Field label="Drug" error={formErrors.drug_number}>
                                <select value={formData.drug_number} onChange={e => setFormData(p => ({...p, drug_number: e.target.value}))} className={inp}>
                                    <option value="">— Select drug —</option>
                                    {drugs.map(d => <option key={d.drug_number} value={d.drug_number}>{d.drug_name} ({d.dosage})</option>)}
                                </select>
                            </Field>
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Units per Day" error={formErrors.units_per_day}>
                                    <input type="number" value={formData.units_per_day} onChange={e => setFormData(p => ({...p, units_per_day: e.target.value}))} className={inp} placeholder="e.g. 3" />
                                </Field>
                                <Field label="Method of Admin" error={formErrors.method_of_admin}>
                                    <select value={formData.method_of_admin} onChange={e => setFormData(p => ({...p, method_of_admin: e.target.value}))} className={inp}>
                                        <option>Oral</option>
                                        <option>IV</option>
                                        <option>Topical</option>
                                        <option>Injection</option>
                                        <option>Inhaled</option>
                                    </select>
                                </Field>
                                <Field label="Start Date" error={formErrors.start_date}>
                                    <input type="date" value={formData.start_date} onChange={e => setFormData(p => ({...p, start_date: e.target.value}))} className={inp} />
                                </Field>
                                <Field label="Finish Date">
                                    <input type="date" value={formData.finish_date} onChange={e => setFormData(p => ({...p, finish_date: e.target.value}))} className={inp} />
                                </Field>
                            </div>
                            <Field label="Prescribed By">
                                <input value={formData.prescribed_by} onChange={e => setFormData(p => ({...p, prescribed_by: e.target.value}))} className={inp} placeholder="Staff number or name" />
                            </Field>
                            <div className="flex gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                                <button type="submit" disabled={formProcessing}
                                    className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                    {formProcessing ? 'Saving…' : '✓ Add Prescription'}
                                </button>
                                <button type="button" onClick={() => setModal(false)} className="px-5 py-2 text-sm text-gray-600 dark:text-gray-400 hover:underline">Cancel</button>
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
        red:    'bg-red-50 text-red-700 border-red-100',
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