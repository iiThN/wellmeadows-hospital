import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { useAppearance } from '@/hooks/use-appearance';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Settings', href: '/settings' },
    { title: 'Appearance', href: '/settings/appearance' },
];

export default function AppearanceSettings() {
    const { appearance, updateAppearance } = useAppearance();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <SettingsLayout>
                <div className="max-w-md">
                    <h2 className="text-xl font-semibold mb-6">Appearance</h2>

                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Choose your preferred colour scheme.
                        </p>

                        <div className="flex gap-3">
                            {(['light', 'dark', 'system'] as const).map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => updateAppearance(mode)}
                                    className={`px-4 py-2 rounded-lg border text-sm font-medium capitalize transition ${
                                        appearance === mode
                                            ? 'border-blue-600 text-blue-600 bg-blue-50 dark:bg-blue-900/30'
                                            : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400'
                                    }`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
