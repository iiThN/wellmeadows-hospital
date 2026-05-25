import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import axios from 'axios';

interface QualRow { qual_type: string; date_obtained: string; institution: string; }
interface WorkRow { position: string; organization: string; start_date: string; finish_date: string; }

export default function StaffCreate() {
    const { data, setData, processing, errors } = useForm({
        staff_number:   '',
        first_name:     '',
        last_name:      '',
        address:        '',
        telephone:      '',
        date_of_birth:  '',
        sex:            'Male',
        nin:            '',
        current_salary: '',
        salary_scale:   '',
        pay_type:       'Monthly',
        hours_per_week: '',
        contract_type:  'Permanent',
    });

    const [quals, setQuals] = useState<QualRow[]>([]);
    const [works, setWorks] = useState<WorkRow[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    function addQual() { setQuals([...quals, { qual_type: '', date_obtained: '', institution: '' }]); }
    function removeQual(i: number) { setQuals(quals.filter((_, idx) => idx !== i)); }
    function updateQual(i: number, field: keyof QualRow, value: string) {
        const updated = [...quals]; updated[i] = { ...updated[i], [field]: value }; setQuals(updated);
    }

    function addWork() { setWorks([...works, { position: '', organization: '', start_date: '', finish_date: '' }]); }
    function removeWork(i: number) { setWorks(works.filter((_, idx) => idx !== i)); }
    function updateWork(i: number, field: keyof WorkRow, value: string) {
        const updated = [...works]; updated[i] = { ...updated[i], [field]: value }; setWorks(updated);
    }

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        setFormErrors({});
        try {
            await axios.post('/modules/staff-management', {
                ...data,
                qualifications:   quals,
                work_experiences: works,
            });
            window.location.href = '/modules/staff-management';
        } catch (err: any) {
            if (err.response?.status === 422) {
                setFormErrors(err.response.data.errors ?? {});
            }
        } finally {
            setSubmitting(false);
        }
    }

    const err = (field: string) => formErrors[field]?.[0];

    return (
        <AppLayout>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6">Add Staff Member</h2>
            <form onSubmit={submit} className="space-y-6 max-w-2xl">

                <Section title="Basic Information">
                    <Field label="Staff Number" error={err('staff_number')}>
                        <input value={data.staff_number} onChange={e => setData('staff_number', e.target.value)} className={inp} placeholder="e.g. S099" />
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="First Name" error={err('first_name')}>
                            <input value={data.first_name} onChange={e => setData('first_name', e.target.value)} className={inp} />
                        </Field>
                        <Field label="Last Name" error={err('last_name')}>
                            <input value={data.last_name} onChange={e => setData('last_name', e.target.value)} className={inp} />
                        </Field>
                    </div>
                    <Field label="Address" error={err('address')}>
                        <textarea value={data.address} onChange={e => setData('address', e.target.value)} className={inp} rows={2} />
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Telephone" error={err('telephone')}>
                            <input value={data.telephone} onChange={e => setData('telephone', e.target.value)} className={inp} />
                        </Field>
                        <Field label="Date of Birth" error={err('date_of_birth')}>
                            <input type="date" value={data.date_of_birth} onChange={e => setData('date_of_birth', e.target.value)} className={inp} />
                        </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Sex" error={err('sex')}>
                            <select value={data.sex} onChange={e => setData('sex', e.target.value)} className={inp}>
                                <option>Male</option><option>Female</option>
                            </select>
                        </Field>
                        <Field label="NIN" error={err('nin')}>
                            <input value={data.nin} onChange={e => setData('nin', e.target.value)} className={inp} />
                        </Field>
                    </div>
                </Section>

                <Section title="Employment Details">
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Current Salary (£)" error={err('current_salary')}>
                            <input type="number" value={data.current_salary} onChange={e => setData('current_salary', e.target.value)} className={inp} />
                        </Field>
                        <Field label="Salary Scale" error={err('salary_scale')}>
                            <input value={data.salary_scale} onChange={e => setData('salary_scale', e.target.value)} className={inp} placeholder="e.g. NHE/03" />
                        </Field>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <Field label="Pay Type" error={err('pay_type')}>
                            <select value={data.pay_type} onChange={e => setData('pay_type', e.target.value)} className={inp}>
                                <option>Monthly</option><option>Weekly</option>
                            </select>
                        </Field>
                        <Field label="Hours/Week" error={err('hours_per_week')}>
                            <input type="number" value={data.hours_per_week} onChange={e => setData('hours_per_week', e.target.value)} className={inp} />
                        </Field>
                        <Field label="Contract Type" error={err('contract_type')}>
                            <select value={data.contract_type} onChange={e => setData('contract_type', e.target.value)} className={inp}>
                                <option>Permanent</option><option>Temporary</option>
                            </select>
                        </Field>
                    </div>
                </Section>

                <Section title="Qualifications" optional>
                    {quals.map((q, i) => (
                        <div key={i} className="grid grid-cols-3 gap-3 items-end border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                            <Field label="Qualification Type">
                                <input value={q.qual_type} onChange={e => updateQual(i, 'qual_type', e.target.value)} className={inp} placeholder="e.g. BSc Nursing" />
                            </Field>
                            <Field label="Date Obtained">
                                <input type="date" value={q.date_obtained} onChange={e => updateQual(i, 'date_obtained', e.target.value)} className={inp} />
                            </Field>
                            <Field label="Institution">
                                <div className="flex gap-2">
                                    <input value={q.institution} onChange={e => updateQual(i, 'institution', e.target.value)} className={inp} placeholder="e.g. Edinburgh University" />
                                    <button type="button" onClick={() => removeQual(i)} className="text-red-500 hover:text-red-700 text-xl px-1">×</button>
                                </div>
                            </Field>
                        </div>
                    ))}
                    <button type="button" onClick={addQual} className="text-sm text-blue-600 hover:underline">+ Add Qualification</button>
                </Section>

                <Section title="Work Experience" optional>
                    {works.map((w, i) => (
                        <div key={i} className="grid grid-cols-2 gap-3 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                            <Field label="Position">
                                <input value={w.position} onChange={e => updateWork(i, 'position', e.target.value)} className={inp} placeholder="e.g. Staff Nurse" />
                            </Field>
                            <Field label="Organization">
                                <input value={w.organization} onChange={e => updateWork(i, 'organization', e.target.value)} className={inp} placeholder="e.g. Western Hospital" />
                            </Field>
                            <Field label="Start Date">
                                <input type="date" value={w.start_date} onChange={e => updateWork(i, 'start_date', e.target.value)} className={inp} />
                            </Field>
                            <Field label="Finish Date (optional)">
                                <div className="flex gap-2">
                                    <input type="date" value={w.finish_date} onChange={e => updateWork(i, 'finish_date', e.target.value)} className={inp} />
                                    <button type="button" onClick={() => removeWork(i)} className="text-red-500 hover:text-red-700 text-xl px-1">×</button>
                                </div>
                            </Field>
                        </div>
                    ))}
                    <button type="button" onClick={addWork} className="text-sm text-blue-600 hover:underline">+ Add Work Experience</button>
                </Section>

                <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={submitting}
                        className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50">
                        {submitting ? 'Saving…' : 'Save Staff'}
                    </button>
                    <a href="/modules/staff-management" className="px-5 py-2 text-sm text-gray-600 dark:text-gray-400 hover:underline">Cancel</a>
                </div>
            </form>
        </AppLayout>
    );
}

function Section({ title, optional, children }: { title: string; optional?: boolean; children: React.ReactNode }) {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">{title}</h3>
                {optional && <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">Optional</span>}
            </div>
            {children}
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

const inp = 'w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100';