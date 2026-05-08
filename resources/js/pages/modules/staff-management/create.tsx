import AppLayout from '@/layouts/app-layout';
import { useForm } from '@inertiajs/react';

export default function StaffCreate() {
    const { data, setData, post, processing, errors } = useForm({
        staff_number: '',
        first_name: '',
        last_name: '',
        address: '',
        telephone: '',
        date_of_birth: '',
        sex: 'Male',
        nin: '',
        current_salary: '',
        salary_scale: '',
        pay_type: 'Monthly',
        hours_per_week: '',
        contract_type: 'Permanent',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/personnel/staff');
    }

    return (
        <AppLayout>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Add Staff Member</h2>
            <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl">
                <form onSubmit={submit} className="space-y-4">
                    <Field label="Staff Number" error={errors.staff_number}>
                        <input value={data.staff_number} onChange={e => setData('staff_number', e.target.value)} className={input} />
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="First Name" error={errors.first_name}>
                            <input value={data.first_name} onChange={e => setData('first_name', e.target.value)} className={input} />
                        </Field>
                        <Field label="Last Name" error={errors.last_name}>
                            <input value={data.last_name} onChange={e => setData('last_name', e.target.value)} className={input} />
                        </Field>
                    </div>
                    <Field label="Address" error={errors.address}>
                        <textarea value={data.address} onChange={e => setData('address', e.target.value)} className={input} rows={2} />
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Telephone" error={errors.telephone}>
                            <input value={data.telephone} onChange={e => setData('telephone', e.target.value)} className={input} />
                        </Field>
                        <Field label="Date of Birth" error={errors.date_of_birth}>
                            <input type="date" value={data.date_of_birth} onChange={e => setData('date_of_birth', e.target.value)} className={input} />
                        </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Sex" error={errors.sex}>
                            <select value={data.sex} onChange={e => setData('sex', e.target.value)} className={input}>
                                <option>Male</option>
                                <option>Female</option>
                            </select>
                        </Field>
                        <Field label="NIN" error={errors.nin}>
                            <input value={data.nin} onChange={e => setData('nin', e.target.value)} className={input} />
                        </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Current Salary" error={errors.current_salary}>
                            <input type="number" value={data.current_salary} onChange={e => setData('current_salary', e.target.value)} className={input} />
                        </Field>
                        <Field label="Salary Scale" error={errors.salary_scale}>
                            <input value={data.salary_scale} onChange={e => setData('salary_scale', e.target.value)} className={input} />
                        </Field>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <Field label="Pay Type" error={errors.pay_type}>
                            <select value={data.pay_type} onChange={e => setData('pay_type', e.target.value)} className={input}>
                                <option>Monthly</option>
                                <option>Weekly</option>
                            </select>
                        </Field>
                        <Field label="Hours/Week" error={errors.hours_per_week}>
                            <input type="number" value={data.hours_per_week} onChange={e => setData('hours_per_week', e.target.value)} className={input} />
                        </Field>
                        <Field label="Contract Type" error={errors.contract_type}>
                            <select value={data.contract_type} onChange={e => setData('contract_type', e.target.value)} className={input}>
                                <option>Permanent</option>
                                <option>Temporary</option>
                            </select>
                        </Field>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={processing}
                            className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50">
                            Save Staff
                        </button>
                        <a href="/personnel/staff" className="px-5 py-2 text-sm text-gray-600 hover:underline">Cancel</a>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

const input = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            {children}
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}