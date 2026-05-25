import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, Users, UserCircle, Pill, Package, Building2, FileText, Briefcase  } from 'lucide-react';
import AppLogo from './app-logo';

interface PageProps extends Record<string, unknown> {
    auth?: {
        user?: {
            name: string;
            role: string;
        };
    };
}

const navByRole: Record<string, NavItem[]> = {
    personnel_officer: [
        { title: 'Dashboard',          url: '/personnel/dashboard',           icon: LayoutGrid },
        { title: 'Staff Management',   url: '/modules/staff-management',      icon: Users },
        { title: 'Dept. & Ward Assignment', url: '/modules/staff-department', icon: Briefcase },
        { title: 'Account Management', url: '/modules/account-management',    icon: UserCircle },
        { title: 'Ward Management',    url: '/modules/ward-management',       icon: Building2 },
    ],
    charge_nurse: [
        { title: 'Dashboard',          url: '/charge-nurse/dashboard',        icon: LayoutGrid },
        { title: 'Patient Management', url: '/modules/patient-management',    icon: UserCircle },
        { title: 'Medication',         url: '/modules/medication',            icon: Pill },
        { title: 'Requisitions',       url: '/modules/requisitions',          icon: Package },
        { title: 'Staff Rota',         url: '/modules/rota',                  icon: Users },
        { title: 'Ward Management',    url: '/modules/ward-management',       icon: Building2 },
    ],
    medical_director: [
        { title: 'Dashboard',          url: '/director/dashboard',            icon: LayoutGrid },
        { title: 'Ward Management',    url: '/modules/ward-management',       icon: Building2 },
        { title: 'Suppliers',          url: '/modules/suppliers',             icon: Package },
        { title: 'Reports',            url: '/modules/reports',               icon: FileText },
    ],
};

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const { auth } = usePage<PageProps>().props;
    const role = auth?.user?.role ?? '';
    const mainNavItems = navByRole[role] ?? [];

    return (
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}