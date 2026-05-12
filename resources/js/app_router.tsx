import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Auth pages
import LoginPage from './pages/auth/login';
import ForgotPasswordPage from './pages/auth/forgot-password';
import ResetPasswordPage from './pages/auth/reset-password';

// Role dashboards
import PersonnelDashboard from './pages/personnel/dashboard';
import ChargeNurseDashboard from './pages/charge-nurse/dashboard';
import DirectorDashboard from './pages/director/dashboard';

// Modules
import StaffManagement from './pages/modules/staff-management/index';
import AccountManagement from './pages/modules/account-management/index';
import PatientManagement from './pages/modules/patient-management/index';
import Medication from './pages/modules/medication/index';
import Requisitions from './pages/modules/requisitions/index';
import Rota from './pages/modules/rota/index';
import WardManagement from './pages/modules/ward-management/index';
import AppointmentTreatment from './pages/modules/appointment-treatment/index';

// Settings
import ProfileSettings from './pages/settings/profile';
import PasswordSettings from './pages/settings/password';
import AppearanceSettings from './pages/settings/appearance';
import SettingsLayout from './layouts/settings/layout';

function RequireAuth({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    if (loading) return <div className="flex h-screen items-center justify-center">Loading…</div>;
    if (!user) return <Navigate to="/login" replace />;
    return <>{children}</>;
}

function RequireRole({ role, children }: { role: string | string[]; children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const roles = Array.isArray(role) ? role : [role];
    if (loading) return <div className="flex h-screen items-center justify-center">Loading…</div>;
    if (!user || !roles.includes(user.role)) return <Navigate to="/" replace />;
    return <>{children}</>;
}

function RootRedirect() {
    const { user, loading } = useAuth();
    if (loading) return <div className="flex h-screen items-center justify-center">Loading…</div>;
    if (!user) return <Navigate to="/login" replace />;
    if (user.role === 'personnel_officer') return <Navigate to="/personnel/dashboard" replace />;
    if (user.role === 'charge_nurse')      return <Navigate to="/charge-nurse/dashboard" replace />;
    if (user.role === 'medical_director')  return <Navigate to="/director/dashboard" replace />;
    return <Navigate to="/personnel/dashboard" replace />;
}

export default function App() {
    return (
        <Routes>
            {/* Root */}
            <Route path="/" element={<RootRedirect />} />

            {/* Guest routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

            {/* Authenticated routes */}
            <Route path="/personnel/dashboard" element={
                <RequireAuth><RequireRole role="personnel_officer"><PersonnelDashboard /></RequireRole></RequireAuth>
            } />
            <Route path="/charge-nurse/dashboard" element={
                <RequireAuth><RequireRole role="charge_nurse"><ChargeNurseDashboard /></RequireRole></RequireAuth>
            } />
            <Route path="/director/dashboard" element={
                <RequireAuth><RequireRole role="medical_director"><DirectorDashboard /></RequireRole></RequireAuth>
            } />

            {/* Modules - Personnel Officer */}
            <Route path="/modules/staff-management" element={
                <RequireAuth><RequireRole role="personnel_officer"><StaffManagement /></RequireRole></RequireAuth>
            } />
            <Route path="/modules/account-management" element={
                <RequireAuth><RequireRole role="personnel_officer"><AccountManagement /></RequireRole></RequireAuth>
            } />

            {/* Modules - Charge Nurse */}
            <Route path="/modules/patient-management" element={
                <RequireAuth><RequireRole role="charge_nurse"><PatientManagement /></RequireRole></RequireAuth>
            } />
            <Route path="/modules/medication" element={
                <RequireAuth><RequireRole role="charge_nurse"><Medication /></RequireRole></RequireAuth>
            } />
            <Route path="/modules/requisitions" element={
                <RequireAuth><RequireRole role="charge_nurse"><Requisitions /></RequireRole></RequireAuth>
            } />
            <Route path="/modules/rota" element={
                <RequireAuth><RequireRole role="charge_nurse"><Rota /></RequireRole></RequireAuth>
            } />

            {/* Modules - All roles */}
            <Route path="/modules/ward-management" element={
                <RequireAuth><WardManagement /></RequireAuth>
            } />
            <Route path="/modules/appointment-treatment" element={
                <RequireAuth><AppointmentTreatment /></RequireAuth>
            } />

            {/* Settings */}
            <Route path="/settings" element={<Navigate to="/settings/profile" replace />} />
            <Route path="/settings/profile" element={
                <RequireAuth><SettingsLayout><ProfileSettings /></SettingsLayout></RequireAuth>
            } />
            <Route path="/settings/password" element={
                <RequireAuth><SettingsLayout><PasswordSettings /></SettingsLayout></RequireAuth>
            } />
            <Route path="/settings/appearance" element={
                <RequireAuth><SettingsLayout><AppearanceSettings /></SettingsLayout></RequireAuth>
            } />
            {/* Catch-all — only redirect after auth is resolved */}
            <Route path="*" element={
                <RequireAuth>
                    <RootRedirect />
                </RequireAuth>
            } />
        </Routes>
    );
}