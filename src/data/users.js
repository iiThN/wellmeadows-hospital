// ─── MOCK USER ACCOUNTS ──────────────────────────────────────────────────────
// Each user maps to a real staff member from mockData.js
// Roles: "personnel_officer" | "charge_nurse" | "medical_director"
//
// Role-based access:
//   personnel_officer → dashboard, wards (view), staff (full)
//   charge_nurse      → dashboard, wards (full), patients (full), medication (full), supplies (full)
//   medical_director  → dashboard, wards (view), staff (view), patients (full), medication (view), supplies (full)

export const ROLES = {
  PERSONNEL_OFFICER: "personnel_officer",
  CHARGE_NURSE:      "charge_nurse",
  MEDICAL_DIRECTOR:  "medical_director",
}

export const users = [
  {
    id:         1,
    username:   "personnel",
    password:   "officer123",
    staff_no:   null,
    full_name:  "Personnel Officer",
    role:       ROLES.PERSONNEL_OFFICER,
    position:   "Personnel Officer",
    avatar:     "PO",
  },
  {
    id:         2,
    username:   "moira.samuel",
    password:   "nurse123",
    staff_no:   "S011",
    full_name:  "Moira Samuel",
    role:       ROLES.CHARGE_NURSE,
    position:   "Charge Nurse — Ward 11",
    avatar:     "MS",
  },
  {
    id:         3,
    username:   "diane.fletcher",
    password:   "nurse123",
    staff_no:   "S401",
    full_name:  "Diane Fletcher",
    role:       ROLES.CHARGE_NURSE,
    position:   "Charge Nurse — Ward 12",
    avatar:     "DF",
  },
  {
    id:         4,
    username:   "director",
    password:   "director123",
    staff_no:   null,
    full_name:  "Medical Director",
    role:       ROLES.MEDICAL_DIRECTOR,
    position:   "Medical Director",
    avatar:     "MD",
  },
]

// ─── ACCESS CONTROL ───────────────────────────────────────────────────────────
// "full"  = can see and interact with everything in the module
// "view"  = read-only, no sensitive fields (e.g. salary hidden for non-PO)
// false   = module is hidden from sidebar and blocked if accessed directly

export const ACCESS = {
  [ROLES.PERSONNEL_OFFICER]: {
    dashboard:  "full",
    wards:      "view",
    staff:      "full",
    patients:   "view",
    medication: false,
    supplies:   false,
  },
  [ROLES.CHARGE_NURSE]: {
    dashboard:  "full",
    wards:      "full",
    staff:      "view",
    patients:   "full",
    medication: "full",
    supplies:   "full",
  },
  [ROLES.MEDICAL_DIRECTOR]: {
    dashboard:  "full",
    wards:      "view",
    staff:      "view",
    patients:   "full",
    medication: "view",
    supplies:   "full",
  },
}

export function canAccess(role, module) {
  return ACCESS[role]?.[module] ?? false
}

export function getAccessLevel(role, module) {
  return ACCESS[role]?.[module] ?? false
}

export function getVisibleModules(role) {
  const access = ACCESS[role] ?? {}
  return Object.entries(access)
    .filter(([, level]) => level !== false)
    .map(([mod]) => mod)
}
