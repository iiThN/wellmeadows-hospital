import { useAuth } from "../AuthContext"
import { canAccess, ROLES } from "../data/users"

const ALL_NAV = [
  { id: "dashboard",  label: "Dashboard",               icon: "⊞",  section: null },
  { id: "wards",      label: "Wards",                   icon: "🏥", section: "Hospital" },
  { id: "staff",      label: "Staff",                   icon: "👥", section: null },
  { id: "patients",   label: "Patients",                icon: "🩺", section: null },
  { id: "medication", label: "Medication",              icon: "💊", section: null },
  { id: "supplies",   label: "Supplies & Requisitions", icon: "📦", section: null },
]

const ROLE_LABELS = {
  [ROLES.PERSONNEL_OFFICER]: "Personnel Officer",
  [ROLES.CHARGE_NURSE]:      "Charge Nurse",
  [ROLES.MEDICAL_DIRECTOR]:  "Medical Director",
}

const ROLE_COLORS = {
  [ROLES.PERSONNEL_OFFICER]: "var(--blue-400)",
  [ROLES.CHARGE_NURSE]:      "var(--teal-500)",
  [ROLES.MEDICAL_DIRECTOR]:  "var(--purple-500)",
}

function Sidebar({ activePage, setActivePage }) {
  const { currentUser, logout } = useAuth()

  const visibleNav = ALL_NAV.filter(item =>
    item.id === "dashboard" || canAccess(currentUser.role, item.id)
  )

  let lastSection = ""

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__brand-name">Wellmeadows Hospital</div>
        <div className="sidebar__brand-tag">Edinburgh · HMIS</div>
      </div>

      <nav className="sidebar__nav">
        {visibleNav.map((item) => {
          const showSection = item.section && item.section !== lastSection
          if (item.section) lastSection = item.section

          return (
            <div key={item.id}>
              {showSection && (
                <div className="sidebar__section-label">{item.section}</div>
              )}
              <button
                className={`sidebar__link${activePage === item.id ? " active" : ""}`}
                onClick={() => setActivePage(item.id)}
              >
                <span className="sidebar__link-icon">{item.icon}</span>
                {item.label}
              </button>
            </div>
          )
        })}
      </nav>

      {/* User info + logout */}
      <div style={{ padding: "14px 16px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: ROLE_COLORS[currentUser.role],
            color: "#fff", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 10, fontWeight: 700,
            flexShrink: 0, letterSpacing: "0.5px",
          }}>
            {currentUser.avatar}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 500, color: "rgba(255,255,255,0.85)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {currentUser.full_name}
            </div>
            <div style={{ fontSize: 10.5, color: ROLE_COLORS[currentUser.role], marginTop: 1 }}>
              {ROLE_LABELS[currentUser.role]}
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          style={{
            width: "100%", padding: "7px 12px",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "var(--radius-sm)",
            color: "rgba(255,255,255,0.5)", fontSize: 12.5,
            cursor: "pointer", fontFamily: "var(--font-main)",
            display: "flex", alignItems: "center",
            justifyContent: "center", gap: 6, transition: "all 0.13s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(239,68,68,0.15)"
            e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)"
            e.currentTarget.style.color = "#fca5a5"
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "rgba(255,255,255,0.06)"
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"
            e.currentTarget.style.color = "rgba(255,255,255,0.5)"
          }}
        >
          ↩ Sign out
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
