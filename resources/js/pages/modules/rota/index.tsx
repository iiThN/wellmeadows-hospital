import AppLayout from '@/layouts/app-layout';
import { useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Staff Rota', href: '/modules/rota' },
];

interface Rota {
    rota_id: number;
    staff_number: string;
    ward_number: number;
    week_beginning: string;
    shift: string;
}

interface Staff {
    staff_number: string;
    first_name: string;
    last_name: string;
}

interface Ward {
    ward_number: number;
    ward_name: string;
}

export default function RotaPage({
    rotas, staff, wards
}: {
    rotas: Rota[];
    staff: Staff[];
    wards: Ward[];
}) {
    const [modal, setModal]       = useState(false);
    const [search, setSearch]     = useState('');
    const [filterWard, setFilterWard] = useState('');
    const [filterWeek, setFilterWeek] = useState('');

    useEffect(() => { setModal(false); }, []);

    const form = useForm({
        staff_number:   '',
        ward_number:    '',
        week_beginning: '',
        shift:          'Early',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.post('/modules/rota', {
            preserveScroll: true,
            onSuccess: () => { setModal(false); form.reset(); },
        });
    }

    function destroy(id: number) {
        if (confirm('Remove this rota entry?')) {
            router.delete(`/modules/rota/${id}`, { preserveScroll: true });
        }
    }

    // Get unique weeks for filter
    const weeks = [...new Set(rotas.map(r => r.week_beginning))].sort().reverse();

    const filtered = rotas.filter(r => {
        const s = staff.find(st => st.staff_number === r.staff_number);
        const name = s ? `${s.first_name} ${s.last_name}`.toLowerCase() : '';
        const matchSearch = name.includes(search.toLowerCase()) || r.staff_number.toLowerCase().includes(search.toLowerCase());
        const matchWard   = !filterWard || String(r.ward_number) === filterWard;
        const matchWeek   = !filterWeek || r.week_beginning === filterWeek;
        return matchSearch && matchWard && matchWeek;
    });

    const shiftColor = (shift: string) => {
        if (shift === 'Early') return 'bg-teal-100 text-teal-700';
        if (shift === 'Late')  return 'bg-amber-100 text-amber-700';
        return 'bg-purple-100 text-purple-700';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Staff Rota" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">

                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Staff Rota</h2>
                    <button onClick={() => setModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                        + Add Rota Entry
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                    <StatCard label="Total Entries" value={rotas.length} color="blue" />
                    <StatCard label="Early Shifts" value={rotas.filter(r => r.shift === 'Early').length} color="teal" />
                    <StatCard label="Late Shifts" value={rotas.filter(r => r.shift === 'Late').length} color="amber" />
                    <StatCard label="Night Shifts" value={rotas.filter(r => r.shift === 'Night').length} color="purple" />
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3 flex-wrap">
                        <input
                            placeholder="Search staff…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
                        />
                        <select
                            value={filterWard}
                            onChange={e => setFilterWard(e.target.value)}
                            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Wards</option>
                            {wards.map(w => (
                                <option key={w.ward_number} value={w.ward_number}>
                                    Ward {w.ward_number} — {w.ward_name}
                                </option>
                            ))}
                        </select>
                        <select
                            value={filterWeek}
                            onChange={e => setFilterWeek(e.target.value)}
                            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Weeks</option>
                            {weeks.map(w => (
                                <option key={w} value={w}>{w}</option>
                            ))}
                        </select>
                        {(search || filterWard || filterWeek) && (
                            <button
                                onClick={() => { setSearch(''); setFilterWard(''); setFilterWeek(''); }}
                                className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:text-gray-300 hover:underline"
                            >
                                Clear filters
                            </button>
                        )}
                        <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">{filtered.length} entries</span>
                    </div>

                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3 text-left">Staff No.</th>
                                <th className="px-4 py-3 text-left">Name</th>
                                <th className="px-4 py-3 text-left">Ward</th>
                                <th className="px-4 py-3 text-left">Week Beginning</th>
                                <th className="px-4 py-3 text-left">Shift</th>
                                <th className="px-4 py-3 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filtered.map(r => {
                                const s = staff.find(st => st.staff_number === r.staff_number);
                                const w = wards.find(wd => wd.ward_number === r.ward_number);
                                return (
                                    <tr key={r.rota_id} className="hover:bg-gray-50 dark:bg-gray-800/50">
                                        <td className="px-4 py-3 font-mono text-xs">{r.staff_number}</td>
                                        <td className="px-4 py-3 font-medium">
                                            {s ? `${s.first_name} ${s.last_name}` : r.staff_number}
                                        </td>
                                        <td className="px-4 py-3">
                                            {w ? (
                                                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 dark:text-gray-500">
                                                    Ward {w.ward_number} — {w.ward_name}
                                                </span>
                                            ) : `Ward ${r.ward_number}`}
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs">{r.week_beginning}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${shiftColor(r.shift)}`}>
                                                {r.shift}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => destroy(r.rota_id)}
                                                className="text-red-500 hover:underline text-xs"
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500 text-sm">
                                        No rota entries found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {modal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setModal(false)}>
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Add Rota Entry</h3>
                            <button onClick={() => setModal(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:text-gray-500 text-xl">×</button>
                        </div>

                        <form onSubmit={submit} className="space-y-4">
                            <Field label="Staff Member" error={form.errors.staff_number}>
                                <select
                                    value={form.data.staff_number}
                                    onChange={e => form.setData('staff_number', e.target.value)}
                                    className={inp}
                                >
                                    <option value="">— Select staff —</option>
                                    {staff.map(s => (
                                        <option key={s.staff_number} value={s.staff_number}>
                                            {s.first_name} {s.last_name} ({s.staff_number})
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            <Field label="Ward" error={form.errors.ward_number}>
                                <select
                                    value={form.data.ward_number}
                                    onChange={e => form.setData('ward_number', e.target.value)}
                                    className={inp}
                                >
                                    <option value="">— Select ward —</option>
                                    {wards.map(w => (
                                        <option key={w.ward_number} value={w.ward_number}>
                                            Ward {w.ward_number} — {w.ward_name}
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            <Field label="Week Beginning" error={form.errors.week_beginning}>
                                <input
                                    type="date"
                                    value={form.data.week_beginning}
                                    onChange={e => form.setData('week_beginning', e.target.value)}
                                    className={inp}
                                />
                            </Field>

                            <Field label="Shift" error={form.errors.shift}>
                                <select
                                    value={form.data.shift}
                                    onChange={e => form.setData('shift', e.target.value)}
                                    className={inp}
                                >
                                    <option value="Early">Early</option>
                                    <option value="Late">Late</option>
                                    <option value="Night">Night</option>
                                </select>
                            </Field>

                            <div className="flex gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {form.processing ? 'Saving…' : '✓ Add Entry'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setModal(false)}
                                    className="px-5 py-2 text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 hover:underline"
                                >
                                    Cancel
                                </button>
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
        blue:   'bg-blue-50 dark:bg-blue-950/50 text-blue-700 border-blue-100 dark:border-blue-900',
        teal:   'bg-teal-50 dark:bg-teal-950/50 text-teal-700 border-teal-100 dark:border-teal-900',
        amber:  'bg-amber-50 dark:bg-amber-950/50 text-amber-700 border-amber-100 dark:border-amber-900',
        purple: 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 border-purple-100',
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

const inp = 'w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';