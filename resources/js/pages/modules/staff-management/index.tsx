import AppLayout from '@/layouts/app-layout';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';

interface Staff {
    staff_number: string;
    first_name: string;
    last_name: string;
    telephone: string;
    sex: string;
    contract_type: string;
    current_salary: number;
    address: string;
    date_of_birth: string;
    nin: string;
    salary_scale: string;
    pay_type: string;
    hours_per_week: number;
    qualifications: { id: number; qual_type: string; date_obtained: string; institution: string }[];
    workExperiences: { id: number; position: string; organization: string; start_date: string; finish_date: string }[];
    rotas: { rota_id: number; week_beginning: string; shift: string; ward_number: number }[];
}

type Tab = 'details' | 'qualifications' | 'experience' | 'shifts';

export default function StaffIndex({ staff }: { staff: Staff[] }) {
    const [selected, setSelected] = useState<Staff | null>(null);
    const [tab, setTab] = useState<Tab>('details');
    const [loadingDetail, setLoadingDetail] = useState(false);

    async function selectStaff(s: Staff) {
        if (selected?.staff_number === s.staff_number) return;
        setLoadingDetail(true);
        setTab('details');
        try {
            const res = await axios.get(`/personnel/staff/${s.staff_number}/details`);
            setSelected(res.data);
        } catch {
            setSelected(s);
        } finally {
            setLoadingDetail(false);
        }
    }

    function destroy(id: string, e: React.MouseEvent) {
        e.stopPropagation();
        if (confirm('Delete this staff member?')) {
            router.delete(`/personnel/staff/${id}`);
        }
    }

    const tabs: { id: Tab; label: string }[] = [
        { id: 'details', label: 'Details' },
        { id: 'qualifications', label: 'Qualifications' },
        { id: 'experience', label: 'Experience' },
        { id: 'shifts', label: 'Shifts' },
    ];

    return (
        <AppLayout>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Staff</h2>
                <Link
                    href="/modules/staff-management/create"
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                >
                    + Add Staff
                </Link>
            </div>

            <div className="grid grid-cols-2 gap-6 items-start">
                {/* Staff list */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3 text-left">ID</th>
                                <th className="px-4 py-3 text-left">Name</th>
                                <th className="px-4 py-3 text-left">Contract</th>
                                <th className="px-4 py-3 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {staff.map((s) => (
                                <tr
                                    key={s.staff_number}
                                    onClick={() => selectStaff(s)}
                                    className={`cursor-pointer hover:bg-gray-50 ${selected?.staff_number === s.staff_number ? 'bg-blue-50' : ''}`}
                                >
                                    <td className="px-4 py-3 font-mono text-xs">{s.staff_number}</td>
                                    <td className="px-4 py-3 font-medium">{s.first_name} {s.last_name}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${s.contract_type === 'Permanent' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {s.contract_type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 space-x-2">
                                        <Link
                                            href={`/modules/staff-management/${s.staff_number}/edit`}
                                            onClick={e => e.stopPropagation()}
                                            className="text-blue-600 hover:underline text-xs"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={(e) => destroy(s.staff_number, e)}
                                            className="text-red-500 hover:underline text-xs"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {staff.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                                        No staff records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Detail panel */}
                {selected ? (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-200">
                            <p className="font-semibold text-gray-800">{selected.first_name} {selected.last_name}</p>
                            <p className="text-xs text-gray-500">{selected.staff_number}</p>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-gray-200">
                            {tabs.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setTab(t.id)}
                                    className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${tab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        {loadingDetail ? (
                            <div className="p-8 text-center text-gray-400 text-sm">Loading…</div>
                        ) : (
                            <>
                                {tab === 'details' && (
                                    <div className="p-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                                        <Detail label="Sex" value={selected.sex} />
                                        <Detail label="Date of Birth" value={selected.date_of_birth} />
                                        <Detail label="NIN" value={selected.nin} />
                                        <Detail label="Telephone" value={selected.telephone} />
                                        <Detail label="Salary" value={`£${Number(selected.current_salary).toLocaleString()}`} />
                                        <Detail label="Salary Scale" value={selected.salary_scale} />
                                        <Detail label="Pay Type" value={selected.pay_type} />
                                        <Detail label="Hours/Week" value={String(selected.hours_per_week)} />
                                        <Detail label="Contract" value={selected.contract_type} />
                                        <div className="col-span-2">
                                            <Detail label="Address" value={selected.address} />
                                        </div>
                                    </div>
                                )}

                                {tab === 'qualifications' && (
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                                            <tr>
                                                <th className="px-4 py-3 text-left">Type</th>
                                                <th className="px-4 py-3 text-left">Date</th>
                                                <th className="px-4 py-3 text-left">Institution</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {selected.qualifications?.length > 0 ? selected.qualifications.map(q => (
                                                <tr key={q.id}>
                                                    <td className="px-4 py-3 font-medium">{q.qual_type}</td>
                                                    <td className="px-4 py-3 font-mono text-xs">{q.date_obtained}</td>
                                                    <td className="px-4 py-3">{q.institution}</td>
                                                </tr>
                                            )) : <EmptyRow cols={3} message="No qualifications recorded." />}
                                        </tbody>
                                    </table>
                                )}

                                {tab === 'experience' && (
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                                            <tr>
                                                <th className="px-4 py-3 text-left">Position</th>
                                                <th className="px-4 py-3 text-left">Organization</th>
                                                <th className="px-4 py-3 text-left">Start</th>
                                                <th className="px-4 py-3 text-left">Finish</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {selected.workExperiences?.length > 0 ? selected.workExperiences.map(e => (
                                                <tr key={e.id}>
                                                    <td className="px-4 py-3 font-medium">{e.position}</td>
                                                    <td className="px-4 py-3">{e.organization}</td>
                                                    <td className="px-4 py-3 font-mono text-xs">{e.start_date}</td>
                                                    <td className="px-4 py-3 font-mono text-xs">{e.finish_date}</td>
                                                </tr>
                                            )) : <EmptyRow cols={4} message="No experience recorded." />}
                                        </tbody>
                                    </table>
                                )}

                                {tab === 'shifts' && (
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                                            <tr>
                                                <th className="px-4 py-3 text-left">Ward</th>
                                                <th className="px-4 py-3 text-left">Week Beginning</th>
                                                <th className="px-4 py-3 text-left">Shift</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {selected.rotas?.length > 0 ? selected.rotas.map(r => (
                                                <tr key={r.rota_id}>
                                                    <td className="px-4 py-3">Ward {r.ward_number}</td>
                                                    <td className="px-4 py-3 font-mono text-xs">{r.week_beginning}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                                            r.shift === 'Early' ? 'bg-teal-100 text-teal-700' :
                                                            r.shift === 'Late'  ? 'bg-amber-100 text-amber-700' :
                                                            'bg-purple-100 text-purple-700'
                                                        }`}>
                                                            {r.shift}
                                                        </span>
                                                    </td>
                                                </tr>
                                            )) : <EmptyRow cols={3} message="No shift data." />}
                                        </tbody>
                                    </table>
                                )}
                            </>
                        )}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 flex items-center justify-center h-64">
                        <p className="text-gray-400 text-sm">Select a staff member to view their profile.</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

function Detail({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
            <p className="text-gray-800 font-medium mt-0.5">{value || '—'}</p>
        </div>
    );
}

function EmptyRow({ cols, message }: { cols: number; message: string }) {
    return (
        <tr>
            <td colSpan={cols} className="px-4 py-8 text-center text-gray-400 text-sm">{message}</td>
        </tr>
    );
}
