import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { useFetch } from '@/hooks/useFetch';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/charge-nurse/dashboard' }];

export default function ChargeNurseDashboard() {
    const { data, loading } = useFetch('/api/charge-nurse/dashboard', { stats: { total_patients: 0, inpatients: 0, outpatients: 0, appointments: 0 } });
    const stats = data.stats;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <h1 className="text-2xl font-semibold mb-4">Charge Nurse Dashboard</h1>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[
                        { label: 'Total Patients', value: stats.total_patients },
                        { label: 'Inpatients',     value: stats.inpatients },
                        { label: 'Outpatients',    value: stats.outpatients },
                        { label: 'Appointments',   value: stats.appointments },
                    ].map(s => (
                        <div key={s.label} className="rounded-lg border p-6">
                            <div className="text-sm text-muted-foreground">{s.label}</div>
                            {loading
                                ? <div className="h-9 w-16 mt-1 rounded bg-muted animate-pulse" />
                                : <div className="text-3xl font-bold">{s.value}</div>
                            }
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}