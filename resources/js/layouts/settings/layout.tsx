import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { type NavItem } from '@/types';

const sidebarNavItems: NavItem[] = [
    { title: 'Profile',    url: '/settings/profile',    icon: null },
    { title: 'Password',   url: '/settings/password',   icon: null },
    { title: 'Appearance', url: '/settings/appearance', icon: null },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const { pathname } = useLocation();

    return (
        <div className="space-y-6 p-6 w-full">
            <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0 w-full">
                <aside className="lg:w-48 shrink-0">
                    <nav className="flex flex-col space-y-1">
                        {sidebarNavItems.map((item) => (
                            <Button key={item.url} size="sm" variant="ghost" asChild
                                className={cn('w-full justify-start', { 'bg-muted': pathname === item.url })}>
                                <Link to={item.url}>{item.title}</Link>
                            </Button>
                        ))}
                    </nav>
                </aside>
                <Separator className="my-6 md:hidden" />
                <div className="flex-1 min-w-0">
                    {children}
                </div>
            </div>
        </div>
    );
}
