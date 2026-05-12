import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { useFetch } from '@/hooks/useFetch';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/director/dashboard' }];

export default function DirectorDashboard() {
    const { data, loading } = useFetch('/api/director/dashboard', { stats: { total_patients: 0, total_wards: 0, total_suppliers: 0 } });
    const stats = data.stats;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <h1 className="text-2xl font-semibold mb-4">Medical Director Dashboard</h1>
                <div className="grid gap-4 md:grid-cols-3">
                    {[
                        { label: 'Total Patients',  value: stats.total_patients },
                        { label: 'Total Wards',     value: stats.total_wards },
                        { label: 'Total Suppliers', value: stats.total_suppliers },
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