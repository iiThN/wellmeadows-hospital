import AppLayout from '@/layouts/app-layout';

interface Props {
    stats: { total_patients: number; total_wards: number; total_suppliers: number };
}

export default function Dashboard({ stats }: Props) {
    return (
        <AppLayout>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Medical Director Dashboard</h2>
            <div className="grid grid-cols-3 gap-6">
                <StatCard label="Total Patients" value={stats.total_patients} />
                <StatCard label="Wards" value={stats.total_wards} />
                <StatCard label="Suppliers" value={stats.total_suppliers} />
            </div>
        </AppLayout>
    );
}

function StatCard({ label, value }: { label: string; value: number }) {
    return (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-3xl font-semibold text-gray-800 mt-1">{value}</p>
        </div>
    );
}