import AppLayout from '@/layouts/app-layout';

interface Props {
    stats: { total_staff: number; total_accounts: number };
}

export default function Dashboard({ stats }: Props) {
    return (
        <AppLayout>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Personnel Dashboard</h2>
            <div className="grid grid-cols-2 gap-6">
                <StatCard label="Total Staff" value={stats.total_staff} />
                <StatCard label="User Accounts" value={stats.total_accounts} />
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