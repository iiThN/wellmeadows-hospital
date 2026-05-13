import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { useFetch } from '@/hooks/useFetch';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/personnel/dashboard' }];

export default function PersonnelDashboard() {
    const { data, loading } = useFetch('/api/personnel/dashboard', { stats: { total_staff: 0, total_accounts: 0 } });
    const stats = data.stats;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <h1 className="text-2xl font-semibold mb-4">Personnel Dashboard</h1>
                <div className="grid gap-4 md:grid-cols-2">
                    {[
                        { label: 'Total Staff',    value: stats.total_staff },
                        { label: 'Total Accounts', value: stats.total_accounts },
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