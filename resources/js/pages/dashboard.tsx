import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/personnel/dashboard' },
];

interface Props {
    stats: { total_staff: number; total_accounts: number };
}

export default function Dashboard({ stats }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Personnel Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h2 className="text-xl font-semibold">Personnel Dashboard</h2>
                <div className="grid gap-4 md:grid-cols-2">
                    <StatCard label="Total Staff" value={stats.total_staff} />
                    <StatCard label="User Accounts" value={stats.total_accounts} />
                </div>
            </div>
        </AppLayout>
    );
}

function StatCard({ label, value }: { label: string; value: number }) {
    return (
        <div className="border-sidebar-border/70 rounded-xl border p-6">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-3xl font-semibold mt-1">{value}</p>
        </div>
    );
}