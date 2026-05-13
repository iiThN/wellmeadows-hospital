import { createPortal } from 'react-dom';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { useAuth } from '@/contexts/AuthContext';
import type { BreadcrumbItem } from '@/types';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    const { isLoggingOut } = useAuth();

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs}>
            {children}
            {isLoggingOut && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                        <p className="text-sm text-muted-foreground">Logging out…</p>
                    </div>
                </div>,
                document.body
            )}
        </AppLayoutTemplate>
    );
}