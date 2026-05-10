import AppLayout from '@/layouts/app-layout';
import { useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Requisitions', href: '/modules/requisitions' },
];

interface Supply {
    item_number: string;
    item_name: string;
    item_description: string;
    supply_type: string;
    quantity_in_stock: number;
    reorder_level: number;
    cost_per_unit: number;
}

interface Drug {
    drug_number: string;
    drug_name: string;
    dosage: string;
    cost_per_unit: number;
}

interface ReqItem {
    req_item_id: number;
    item_number: string | null;
    drug_number: string | null;
    quantity_required: number;
    cost_per_unit: number;
}

interface Requisition {
    requisition_number: string;
    requisition_date: string;
    signed_date: string | null;
    signed_by: string;
    ward_number: number;
    staff_number: string;
    items: ReqItem[];
}
interface Ward { ward_number: number; ward_name: string }

const EMPTY_ITEM = { type: 'supply', item_number: '', drug_number: '', quantity: '', cost: '' };

export default function RequisitionsPage({
    requisitions, supplies, drugs, wards
}: {
    requisitions: Requisition[];
    supplies: Supply[];
    drugs: Drug[];
    wards: Ward[];
}) {
    const [modal, setModal]         = useState(false);
    const [selected, setSelected]   = useState<Requisition | null>(null);
    const [search, setSearch]       = useState('');
    const [items, setItems]         = useState([{ ...EMPTY_ITEM }]);

    useEffect(() => { setModal(false); }, []);

    const form = useForm({
        ward_number: '',
        items: [] as any[],
    });

    function addItem() { setItems(i => [...i, { ...EMPTY_ITEM }]); }
    function removeItem(i: number) { setItems(items => items.filter((_, idx) => idx !== i)); }
    function updateItem(i: number, field: string, val: string) {
        setItems(items => items.map((row, idx) => idx === i ? { ...row, [field]: val } : row));
    }
    function autofillCost(i: number, type: string, id: string) {
        if (type === 'drug') {
            const drug = drugs.find(d => d.drug_number === id);
            if (drug) updateItem(i, 'cost', String(drug.cost_per_unit));
        } else {
            const supply = supplies.find(s => s.item_number === id);
            if (supply) updateItem(i, 'cost', String(supply.cost_per_unit));
        }
    }

    function submitReq(e: React.FormEvent) {
        e.preventDefault();
        form.setData('items', items);
        form.post('/modules/requisitions', {
            preserveScroll: true,
            onSuccess: () => {
                setModal(false);
                form.reset();
                setItems([{ ...EMPTY_ITEM }]);
            },
        });
    }

    const filtered = requisitions.filter(r =>
        r.requisition_number.toLowerCase().includes(search.toLowerCase()) ||
        String(r.ward_number).includes(search)
    );

    const selectedItems = selected?.items ?? [];
    const selectedTotal = selectedItems.reduce((a, i) => a + i.quantity_required * Number(i.cost_per_unit), 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Requisitions" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">

                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Supplies & Requisitions</h2>
                    <button onClick={() => setModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                        + New Requisition
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                    <StatCard label="Surgical Items" value={supplies.filter(s => s.supply_type === 'Surgical').length} color="teal" />
                    <StatCard label="Pharmaceutical" value={drugs.length} color="blue" />
                    <StatCard label="Total Requisitions" value={requisitions.length} color="purple" />
                    <StatCard label="Pending" value={requisitions.filter(r => !r.signed_date).length} color="amber" />
                </div>

                <div className="grid grid-cols-2 gap-6 items-start">
                    {/* Requisitions list */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Requisitions ({filtered.length})</p>
                            <input placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)}
                                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-40 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100" />
                        </div>
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3 text-left">Req. No.</th>
                                    <th className="px-4 py-3 text-left">Ward</th>
                                    <th className="px-4 py-3 text-left">Date</th>
                                    <th className="px-4 py-3 text-left">Items</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filtered.map(r => (
                                    <tr key={r.requisition_number}
                                        onClick={() => setSelected(selected?.requisition_number === r.requisition_number ? null : r)}
                                        className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${selected?.requisition_number === r.requisition_number ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}>
                                        <td className="px-4 py-3 font-mono text-xs">{r.requisition_number}</td>
                                        <td className="px-4 py-3">Ward {r.ward_number}</td>
                                        <td className="px-4 py-3 font-mono text-xs">{r.requisition_date}</td>
                                        <td className="px-4 py-3">{r.items?.length ?? 0} items</td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-sm">No requisitions found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Requisition detail */}
                    {selected ? (
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                                <p className="font-semibold text-gray-800 dark:text-gray-100">Requisition #{selected.requisition_number}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Ward {selected.ward_number} · {selected.requisition_date} · Signed by: {selected.signed_by}</p>
                            </div>
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase text-xs">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Type</th>
                                        <th className="px-4 py-3 text-left">Item</th>
                                        <th className="px-4 py-3 text-left">Qty</th>
                                        <th className="px-4 py-3 text-left">Cost/Unit</th>
                                        <th className="px-4 py-3 text-left">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {selectedItems.map(item => {
                                        const drug   = drugs.find(d => d.drug_number === item.drug_number);
                                        const supply = supplies.find(s => s.item_number === item.item_number);
                                        const name   = drug ? drug.drug_name : supply ? supply.item_name : '—';
                                        const type   = drug ? 'Drug' : 'Supply';
                                        return (
                                            <tr key={item.req_item_id}>
                                                <td className="px-4 py-3">
                                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${type === 'Drug' ? 'bg-purple-100 text-purple-700' : 'bg-teal-100 text-teal-700'}`}>{type}</span>
                                                </td>
                                                <td className="px-4 py-3 font-medium">{name}</td>
                                                <td className="px-4 py-3">{item.quantity_required}</td>
                                                <td className="px-4 py-3">£{Number(item.cost_per_unit).toFixed(2)}</td>
                                                <td className="px-4 py-3">£{(item.quantity_required * Number(item.cost_per_unit)).toFixed(2)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                                <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Total:</span>
                                <span className="font-semibold">£{selectedTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center h-48">
                            <p className="text-gray-400 text-sm">Select a requisition to view its items.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {modal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setModal(false)}>
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">New Requisition</h3>
                            <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
                        </div>

                        <form onSubmit={submitReq} className="space-y-4">
                            <Field label="Ward" error={form.errors.ward_number}>
                                <select value={form.data.ward_number} onChange={e => form.setData('ward_number', e.target.value)} className={inp}>
                                    <option value="">— Select ward —</option>
                                    {wards.map(w => <option key={w.ward_number} value={w.ward_number}>Ward {w.ward_number} — {w.ward_name}</option>)}
                                </select>
                            </Field>

                            <div>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Items to Order</p>
                                {items.map((item, i) => (
                                    <div key={i} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-3">
                                        <div className="flex justify-between mb-2">
                                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Item {i + 1}</p>
                                            {items.length > 1 && (
                                                <button type="button" onClick={() => removeItem(i)} className="text-xs text-red-500 hover:underline">Remove</button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-4 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                                                <select value={item.type} onChange={e => { updateItem(i, 'type', e.target.value); updateItem(i, 'item_number', ''); updateItem(i, 'drug_number', ''); }} className={inp}>
                                                    <option value="supply">Surgical</option>
                                                    <option value="drug">Drug</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{item.type === 'drug' ? 'Drug' : 'Item'}</label>
                                                {item.type === 'drug' ? (
                                                    <select value={item.drug_number} onChange={e => { updateItem(i, 'drug_number', e.target.value); autofillCost(i, 'drug', e.target.value); }} className={inp}>
                                                        <option value="">— Select —</option>
                                                        {drugs.map(d => <option key={d.drug_number} value={d.drug_number}>{d.drug_name}</option>)}
                                                    </select>
                                                ) : (
                                                    <select value={item.item_number} onChange={e => { updateItem(i, 'item_number', e.target.value); autofillCost(i, 'supply', e.target.value); }} className={inp}>
                                                        <option value="">— Select —</option>
                                                        {supplies.map(s => <option key={s.item_number} value={s.item_number}>{s.item_name}</option>)}
                                                    </select>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Qty</label>
                                                <input type="number" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} className={inp} placeholder="0" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Cost/Unit</label>
                                                <input type="number" step="0.01" value={item.cost} onChange={e => updateItem(i, 'cost', e.target.value)} className={inp} placeholder="0.00" />
                                            </div>
                                        </div>
                                        {item.quantity && item.cost && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right">
                                                Subtotal: <strong>£{(parseFloat(item.quantity) * parseFloat(item.cost)).toFixed(2)}</strong>
                                            </p>
                                        )}
                                    </div>
                                ))}
                                <button type="button" onClick={addItem} className="text-sm text-blue-600 hover:underline">+ Add item</button>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg px-4 py-3 flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Order total:</span>
                                <span className="font-semibold font-mono">
                                    £{items.reduce((a, i) => a + (parseFloat(i.quantity) || 0) * (parseFloat(i.cost) || 0), 0).toFixed(2)}
                                </span>
                            </div>

                            <div className="flex gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                                <button type="submit" disabled={form.processing}
                                    className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                    {form.processing ? 'Submitting…' : '✓ Submit Requisition'}
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
        teal:   'bg-teal-50 text-teal-700 border-teal-100',
        blue:   'bg-blue-50 text-blue-700 border-blue-100',
        purple: 'bg-purple-50 text-purple-700 border-purple-100',
        amber:  'bg-amber-50 text-amber-700 border-amber-100',
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