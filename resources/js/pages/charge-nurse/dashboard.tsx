import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/charge-nurse/dashboard' },
];

interface Props {
    stats: {
        total_patients: number;
        inpatients: number;
        outpatients: number;
        appointments: number;
    };
}

export default function Dashboard({ stats }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Charge Nurse Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h2 className="text-xl font-semibold">Charge Nurse Dashboard</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard label="Total Patients" value={stats.total_patients} />
                    <StatCard label="In-Patients" value={stats.inpatients} />
                    <StatCard label="Out-Patients" value={stats.outpatients} />
                    <StatCard label="Appointments" value={stats.appointments} />
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