import { useAuth } from "../AuthContext"
import { ROLES } from "../data/users"

const TITLES = {
  dashboard:  "Dashboard",
  wards:      "Ward Management",
  staff:      "Staff Management",
  patients:   "Patient Management",
  medication: "Medication & Prescriptions",
  supplies:   "Supplies & Requisitions",
}

const ROLE_LABELS = {
  [ROLES.PERSONNEL_OFFICER]: "Personnel Officer",
  [ROLES.CHARGE_NURSE]:      "Charge Nurse",
  [ROLES.MEDICAL_DIRECTOR]:  "Medical Director",
}

const ROLE_BADGE = {
  [ROLES.PERSONNEL_OFFICER]: "badge--blue",
  [ROLES.CHARGE_NURSE]:      "badge--teal",
  [ROLES.MEDICAL_DIRECTOR]:  "badge--purple",
}

function Topbar({ activePage }) {
  const { currentUser } = useAuth()
  const now  = new Date()
  const date = now.toLocaleDateString("en-GB", {
    weekday: "short", day: "2-digit", month: "short", year: "numeric",
  })

  return (
    <header className="topbar">
      <div className="topbar__left">
        <span className="topbar__title">{TITLES[activePage] ?? "Dashboard"}</span>
      </div>
      <div className="topbar__right" style={{ gap: 12 }}>
        {currentUser && (
          <span className={`badge ${ROLE_BADGE[currentUser.role]}`}>
            {ROLE_LABELS[currentUser.role]}
          </span>
        )}
        <span className="topbar__date">{date}</span>
      </div>
    </header>
  )
}

export default Topbar
