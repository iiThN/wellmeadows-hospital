import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { LayoutGrid, Users, UserCircle, Pill, Package, Building2, FileText, Stethoscope } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AppLogo from './app-logo';

const navByRole: Record<string, NavItem[]> = {
    personnel_officer: [
        { title: 'Dashboard',          url: '/personnel/dashboard',           icon: LayoutGrid },
        { title: 'Staff Management',   url: '/modules/staff-management',      icon: Users },
        { title: 'Account Management', url: '/modules/account-management',    icon: UserCircle },
        
    ],
    charge_nurse: [
        { title: 'Dashboard',          url: '/charge-nurse/dashboard',        icon: LayoutGrid },
        { title: 'Patient Management', url: '/modules/patient-management',    icon: UserCircle },
        { title: 'Medication',         url: '/modules/medication',            icon: Pill },
        { title: 'Requisitions',       url: '/modules/requisitions',          icon: Package },
        { title: 'Staff Rota',         url: '/modules/rota',                  icon: Users },
        { title: 'Ward Management',    url: '/modules/ward-management',       icon: Building2 },
        { title: 'Appointments & Treatment', url: '/modules/appointment-treatment', icon: Stethoscope },
    ],
    medical_director: [
        { title: 'Dashboard',          url: '/director/dashboard',            icon: LayoutGrid },
        { title: 'Ward Management',    url: '/modules/ward-management',       icon: Building2 },
        { title: 'Reports',            url: '/modules/reports',               icon: FileText },
        { title: 'Appointments & Treatment', url: '/modules/appointment-treatment', icon: Stethoscope },
    ],
};

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const { user } = useAuth();
    const role = user?.role ?? '';
    const mainNavItems = navByRole[role] ?? [];

    return (
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link to="/">
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
