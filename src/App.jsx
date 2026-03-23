import { useState } from "react"

import { AuthProvider, useAuth } from "./AuthContext"
import { getAccessLevel }        from "./data/users"

import Login             from "./components/Login"
import Sidebar           from "./components/Sidebar"
import Topbar            from "./components/Topbar"
import Dashboard         from "./components/Dashboard"
import Wards             from "./components/Wards"
import Staff             from "./components/Staff"
import Patients          from "./components/Patients"
import Medication        from "./components/Medication"
import Supplies          from "./components/Supplies"
import AccountManagement from "./components/AccountManagement"

// ── ACCESS BLOCKED ────────────────────────────────────────────────────────────
function AccessDenied() {
  return (
    <div className="page">
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", minHeight: 300, gap: 10,
        color: "var(--gray-400)", textAlign: "center",
      }}>
        <div style={{ fontSize: 40 }}>🔒</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: "var(--gray-600)" }}>Access restricted</div>
        <div style={{ fontSize: 13 }}>Your role does not have permission to view this module.</div>
      </div>
    </div>
  )
}

// ── INNER APP (after login) ───────────────────────────────────────────────────
function AppInner() {
  const { currentUser } = useAuth()
  const [activePage, setActivePage] = useState("dashboard")

  const access = getAccessLevel(currentUser.role, activePage)

  const renderPage = () => {
    if (activePage === "dashboard") return <Dashboard setActivePage={setActivePage} />
    if (!access) return <AccessDenied />

    switch (activePage) {
      case "wards":    return <Wards      accessLevel={access} />
      case "staff":    return <Staff      accessLevel={access} />
      case "patients": return <Patients   accessLevel={access} />
      case "medication":return <Medication accessLevel={access} />
      case "supplies": return <Supplies   accessLevel={access} />
      case "accounts": return <AccountManagement />
      default:         return <Dashboard  setActivePage={setActivePage} />
    }
  }

  return (
    <div className="app">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div className="main">
        <Topbar activePage={activePage} />
        {renderPage()}
      </div>
    </div>
  )
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

function AppContent() {
  const { currentUser } = useAuth()
  if (!currentUser) return <Login />
  return <AppInner />
}

export default App
