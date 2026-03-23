// ─── ROLES ────────────────────────────────────────────────────────────────────
export const ROLES = {
  PERSONNEL_OFFICER: "personnel_officer",
  CHARGE_NURSE:      "charge_nurse",
  MEDICAL_DIRECTOR:  "medical_director",
}

// ─── ACCESS CONTROL ───────────────────────────────────────────────────────────
// "full"  = can read, insert, edit, delete
// "view"  = read only
// false   = hidden and blocked

export const ACCESS = {
  [ROLES.PERSONNEL_OFFICER]: {
    dashboard:  "full",
    wards:      "view",
    staff:      "full",       // full staff record management
    patients:   "view",
    medication: false,
    supplies:   false,
    accounts:   "full",       // also manages login accounts
  },
  [ROLES.CHARGE_NURSE]: {
    dashboard:  "full",
    wards:      "full",
    staff:      "view",
    patients:   "full",
    medication: "full",
    supplies:   "full",
    accounts:   false,
  },
  [ROLES.MEDICAL_DIRECTOR]: {
    dashboard:  "full",
    wards:      "view",
    staff:      "view",
    patients:   "full",
    medication: "view",
    supplies:   "full",
    accounts:   false,
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

// ─── DISPLAY INFO ─────────────────────────────────────────────────────────────
export const ROLE_LABELS = {
  [ROLES.PERSONNEL_OFFICER]: "Personnel Officer",
  [ROLES.CHARGE_NURSE]:      "Charge Nurse",
  [ROLES.MEDICAL_DIRECTOR]:  "Medical Director",
}

export const ROLE_COLORS = {
  [ROLES.PERSONNEL_OFFICER]: "var(--blue-600)",
  [ROLES.CHARGE_NURSE]:      "var(--teal-600)",
  [ROLES.MEDICAL_DIRECTOR]:  "var(--purple-600)",
}

export const ROLE_BADGE = {
  [ROLES.PERSONNEL_OFFICER]: "badge--blue",
  [ROLES.CHARGE_NURSE]:      "badge--teal",
  [ROLES.MEDICAL_DIRECTOR]:  "badge--purple",
}