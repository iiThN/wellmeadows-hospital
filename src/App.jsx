import { useState } from "react"

import { AuthProvider, useAuth } from "./AuthContext"
import { getAccessLevel }        from "./data/users"

import Login      from "./components/Login"
import Sidebar    from "./components/Sidebar"
import Topbar     from "./components/Topbar"
import Dashboard  from "./components/Dashboard"
import Wards      from "./components/Wards"
import Staff      from "./components/Staff"
import Patients   from "./components/Patients"
import Medication from "./components/Medication"
import Supplies   from "./components/Supplies"

// ─── ACCESS BLOCKED SCREEN ───────────────────────────────────────────────────
function AccessDenied() {
  return (
    <div className="page">
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", minHeight: 300, gap: 10, color: "var(--gray-400)",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 40 }}>🔒</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: "var(--gray-600)" }}>
          Access restricted
        </div>
        <div style={{ fontSize: 13 }}>
          Your role does not have permission to view this module.
        </div>
      </div>
    </div>
  )
}

// ─── INNER APP (runs after login) ────────────────────────────────────────────
function AppInner() {
  const { currentUser } = useAuth()
  const [activePage, setActivePage] = useState("dashboard")

  const access = getAccessLevel(currentUser.role, activePage)

  const renderPage = () => {
    // Dashboard always accessible
    if (activePage === "dashboard") return <Dashboard setActivePage={setActivePage} />

    // Block if role has no access to this module
    if (!access) return <AccessDenied />

    switch (activePage) {
      case "wards":      return <Wards      accessLevel={access} />
      case "staff":      return <Staff      accessLevel={access} />
      case "patients":   return <Patients   accessLevel={access} />
      case "medication": return <Medication accessLevel={access} />
      case "supplies":   return <Supplies   accessLevel={access} />
      default:           return <Dashboard  setActivePage={setActivePage} />
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

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
// Same pattern as your darkMode — one useState controls what the user sees.
// If not logged in → show Login page
// If logged in     → show the full app shell
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

function AppContent() {
  const { currentUser } = useAuth()

  // Not logged in → show login screen
  if (!currentUser) return <Login />

  // Logged in → show the app
  return <AppInner />
}

export default App
