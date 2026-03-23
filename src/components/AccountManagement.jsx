import { useState, useEffect } from "react"
import { supabase } from "../data/supabaseClient"
import { ROLE_LABELS, ROLE_BADGE, ROLES } from "../data/users"

const ROLE_OPTIONS = [
  { value: ROLES.PERSONNEL_OFFICER, label: "Personnel Officer" },
  { value: ROLES.CHARGE_NURSE,      label: "Charge Nurse" },
  { value: ROLES.MEDICAL_DIRECTOR,  label: "Medical Director" },
]

const EMPTY_ACCOUNT = {
  staff_no: "", username: "", password: "", role: ROLES.CHARGE_NURSE, is_active: true,
}

const EMPTY_STAFF = {
  staff_no: "", first_name: "", last_name: "", address: "", tel_no: "",
  date_of_birth: "", sex: "Female", nin: "",
  current_salary: "", salary_scale: "", hrs_per_week: "",
  contract_type: "P", payment_type: "M", ward_no: "",
}

// Maps role → position stored in staff table
const ROLE_TO_POSITION = {
  personnel_officer: "Personnel Officer",
  charge_nurse:      "Charge Nurse",
  medical_director:  "Medical Director",
}

const EMPTY_QUAL = { qual_type: "", qual_date: "", institution: "" }
const EMPTY_EXP  = { position: "", organization: "", start_date: "", finish_date: "" }

// ── TAB INDICATOR ─────────────────────────────────────────────────────────────
function StepIndicator({ step }) {
  const steps = ["Account", "Personal Info", "Qualifications", "Experience"]
  return (
    <div style={{ display: "flex", gap: 0, marginBottom: 24, borderBottom: "2px solid var(--border)" }}>
      {steps.map((s, i) => (
        <div key={s} style={{
          flex: 1, textAlign: "center", padding: "10px 4px",
          fontSize: 12, fontWeight: step === i ? 600 : 400,
          color: step === i ? "var(--blue-600)" : step > i ? "var(--green-600)" : "var(--text-3)",
          borderBottom: `2px solid ${step === i ? "var(--blue-600)" : step > i ? "var(--green-600)" : "transparent"}`,
          marginBottom: -2,
        }}>
          {step > i ? "✓ " : ""}{s}
        </div>
      ))}
    </div>
  )
}

// ── FIELD ─────────────────────────────────────────────────────────────────────
function Field({ label, required, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        display: "block", fontSize: 11.5, fontWeight: 600,
        textTransform: "uppercase", letterSpacing: "0.5px",
        color: "var(--text-2)", marginBottom: 5,
      }}>
        {label} {required && <span style={{ color: "var(--red-600)" }}>*</span>}
      </label>
      {children}
    </div>
  )
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
function AccountManagement() {
  const [accounts, setAccounts]   = useState([])
  const [wards, setWards]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [search, setSearch]       = useState("")

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setMode]      = useState("create")  // "create" | "edit" | "view"
  const [step, setStep]           = useState(0)         // 0-3 for create wizard
  const [saving, setSaving]       = useState(false)
  const [formError, setFormError] = useState("")
  const [showPass, setShowPass]   = useState(false)

  // Form data
  const [account, setAccount]     = useState(EMPTY_ACCOUNT)
  const [staffInfo, setStaffInfo] = useState(EMPTY_STAFF)
  const [quals, setQuals]         = useState([{ ...EMPTY_QUAL }])
  const [exps, setExps]           = useState([{ ...EMPTY_EXP }])

  // Selected account for edit/view
  const [selected, setSelected]   = useState(null)

  // ── Load ──────────────────────────────────────────────────────────────────
  async function loadData() {
    try {
      const [{ data: accData, error: e1 }, { data: wardData, error: e2 }] = await Promise.all([
        supabase
          .from("staff_account")
          .select("*, staff(staff_no, first_name, last_name, position, ward_no, nin, address, tel_no, date_of_birth, sex, current_salary, salary_scale, hrs_per_week, contract_type, payment_type)")
          .order("account_id"),
        supabase.from("ward").select("ward_no, ward_name"),
      ])
      if (e1 || e2) throw e1 || e2
      setAccounts(accData)
      setWards(wardData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  // ── Open create wizard ────────────────────────────────────────────────────
  const openCreate = () => {
    setMode("create")
    setStep(0)
    setAccount(EMPTY_ACCOUNT)
    setStaffInfo(EMPTY_STAFF)
    setQuals([{ ...EMPTY_QUAL }])
    setExps([{ ...EMPTY_EXP }])
    setFormError("")
    setShowPass(false)
    setShowModal(true)
  }

  // ── Open edit ─────────────────────────────────────────────────────────────
  const openEdit = (acc) => {
    setMode("edit")
    setSelected(acc)
    setAccount({
      staff_no:  acc.staff_no ?? "",
      username:  acc.username,
      password:  "",
      role:      acc.role,
      is_active: acc.is_active,
    })
    const s = acc.staff ?? {}
    setStaffInfo({
      staff_no:      s.staff_no ?? "",
      first_name:    s.first_name ?? "",
      last_name:     s.last_name ?? "",
      address:       s.address ?? "",
      tel_no:        s.tel_no ?? "",
      date_of_birth: s.date_of_birth ?? "",
      sex:           s.sex ?? "Female",
      nin:           s.nin ?? "",
      position:      s.position ?? "",
      current_salary:s.current_salary ?? "",
      salary_scale:  s.salary_scale ?? "",
      hrs_per_week:  s.hrs_per_week ?? "",
      contract_type: s.contract_type ?? "P",
      payment_type:  s.payment_type ?? "M",
      ward_no:       s.ward_no ?? "",
    })
    setFormError("")
    setShowModal(true)
  }

  // ── Open view ────────────────────────────────────────────────────────────
  const openView = async (acc) => {
    setMode("view")
    setSelected(acc)
    setShowModal(true)
    // Load quals and experience
    if (acc.staff_no) {
      const [{ data: qData }, { data: eData }] = await Promise.all([
        supabase.from("staff_qualification").select("*").eq("staff_no", acc.staff_no),
        supabase.from("staff_experience").select("*").eq("staff_no", acc.staff_no),
      ])
      setQuals(qData?.length ? qData : [])
      setExps(eData?.length ? eData : [])
    }
  }

  // ── Validate step ─────────────────────────────────────────────────────────
  const validateStep = () => {
    setFormError("")
    if (step === 0) {
      if (!account.username.trim()) return setFormError("Username is required."), false
      if (!account.password.trim()) return setFormError("Password is required."), false
      if (!account.role)            return setFormError("Role is required."), false
    }
    if (step === 1) {
      if (!staffInfo.staff_no.trim())   return setFormError("Staff number is required."), false
      if (!staffInfo.first_name.trim()) return setFormError("First name is required."), false
      if (!staffInfo.last_name.trim())  return setFormError("Last name is required."), false
      if (!staffInfo.nin.trim())        return setFormError("NIN is required."), false
      if (!staffInfo.date_of_birth)     return setFormError("Date of birth is required."), false
      if (!staffInfo.current_salary)    return setFormError("Current salary is required."), false
    }
    return true
  }

  const nextStep = () => { if (validateStep()) setStep(s => s + 1) }
  const prevStep = () => { setFormError(""); setStep(s => s - 1) }

  // ── Final save (create) ───────────────────────────────────────────────────
  const handleCreate = async () => {
    setSaving(true)
    setFormError("")
    try {
      // 1. Insert into staff table
      const { error: staffErr } = await supabase.from("staff").insert({
        staff_no:       staffInfo.staff_no.trim(),
        first_name:     staffInfo.first_name.trim(),
        last_name:      staffInfo.last_name.trim(),
        address:        staffInfo.address.trim(),
        tel_no:         staffInfo.tel_no.trim(),
        date_of_birth:  staffInfo.date_of_birth,
        sex:            staffInfo.sex,
        nin:            staffInfo.nin.trim(),
        position:       ROLE_TO_POSITION[account.role] ?? staffInfo.position ?? "",
        current_salary: parseFloat(staffInfo.current_salary),
        salary_scale:   staffInfo.salary_scale.trim(),
        hrs_per_week:   parseFloat(staffInfo.hrs_per_week) || null,
        contract_type:  staffInfo.contract_type,
        payment_type:   staffInfo.payment_type,
        ward_no:        staffInfo.ward_no ? parseInt(staffInfo.ward_no) : null,
      })
      if (staffErr) throw new Error("Staff record error: " + staffErr.message)

      // 2. Insert qualifications (skip empty rows)
      const validQuals = quals.filter(q => q.qual_type.trim())
      if (validQuals.length > 0) {
        const { error: qualErr } = await supabase.from("staff_qualification").insert(
          validQuals.map(q => ({ ...q, staff_no: staffInfo.staff_no.trim() }))
        )
        if (qualErr) throw new Error("Qualification error: " + qualErr.message)
      }

      // 3. Insert experience (skip empty rows)
      const validExps = exps.filter(e => e.organization.trim())
      if (validExps.length > 0) {
        const { error: expErr } = await supabase.from("staff_experience").insert(
          validExps.map(e => ({ ...e, staff_no: staffInfo.staff_no.trim() }))
        )
        if (expErr) throw new Error("Experience error: " + expErr.message)
      }

      // 4. Create the login account
      const { error: accErr } = await supabase.from("staff_account").insert({
        staff_no: staffInfo.staff_no.trim(),
        username: account.username.trim(),
        password: account.password.trim(),
        role:     account.role,
        is_active:true,
      })
      if (accErr) {
        if (accErr.message.includes("unique")) throw new Error("Username already exists.")
        throw new Error("Account error: " + accErr.message)
      }

      setShowModal(false)
      await loadData()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // ── Save edit ─────────────────────────────────────────────────────────────
  const handleEdit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError("")
    try {
      // Update account
      const accUpdates = { username: account.username.trim(), role: account.role, is_active: account.is_active }
      if (account.password.trim()) accUpdates.password = account.password.trim()
      const { error: accErr } = await supabase.from("staff_account").update(accUpdates).eq("account_id", selected.account_id)
      if (accErr) throw accErr

      // Update staff record if linked
      if (selected.staff_no) {
        const { error: staffErr } = await supabase.from("staff").update({
          first_name:     staffInfo.first_name,
          last_name:      staffInfo.last_name,
          address:        staffInfo.address,
          tel_no:         staffInfo.tel_no,
          date_of_birth:  staffInfo.date_of_birth,
          sex:            staffInfo.sex,
          nin:            staffInfo.nin,
          position:       ROLE_TO_POSITION[account.role] ?? staffInfo.position ?? "",
          current_salary: parseFloat(staffInfo.current_salary),
          salary_scale:   staffInfo.salary_scale,
          hrs_per_week:   parseFloat(staffInfo.hrs_per_week),
          contract_type:  staffInfo.contract_type,
          payment_type:   staffInfo.payment_type,
          ward_no:        staffInfo.ward_no ? parseInt(staffInfo.ward_no) : null,
        }).eq("staff_no", selected.staff_no)
        if (staffErr) throw staffErr
      }

      setShowModal(false)
      await loadData()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // ── Toggle active ─────────────────────────────────────────────────────────
  const toggleActive = async (acc) => {
    if (acc.role === "admin") return
    await supabase.from("staff_account").update({ is_active: !acc.is_active }).eq("account_id", acc.account_id)
    await loadData()
  }

  // ── Qual / Exp row helpers ────────────────────────────────────────────────
  const addQual = () => setQuals(q => [...q, { ...EMPTY_QUAL }])
  const removeQual = (i) => setQuals(q => q.filter((_, idx) => idx !== i))
  const updateQual = (i, field, val) => setQuals(q => q.map((row, idx) => idx === i ? { ...row, [field]: val } : row))

  const addExp  = () => setExps(e => [...e, { ...EMPTY_EXP }])
  const removeExp = (i) => setExps(e => e.filter((_, idx) => idx !== i))
  const updateExp = (i, field, val) => setExps(e => e.map((row, idx) => idx === i ? { ...row, [field]: val } : row))

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = accounts.filter(a => {
    const name = a.staff ? `${a.staff.first_name} ${a.staff.last_name}`.toLowerCase() : ""
    return (
      a.username.toLowerCase().includes(search.toLowerCase()) ||
      name.includes(search.toLowerCase()) ||
      ROLE_LABELS[a.role]?.toLowerCase().includes(search.toLowerCase())
    )
  })

  const inputStyle = { width: "100%", padding: "8px 12px", border: "1px solid var(--border-dark)", borderRadius: "var(--radius-sm)", fontSize: 13, fontFamily: "var(--font-main)", color: "var(--text-1)", background: "var(--surface)", outline: "none" }
  const selectStyle = { ...inputStyle, cursor: "pointer" }

  if (loading) return <div className="page"><div className="empty"><div className="empty__icon">⏳</div><div className="empty__text">Loading accounts…</div></div></div>
  if (error)   return <div className="page"><div className="alert alert--red"><span>⚠️</span><span><strong>Error: </strong>{error}</span></div></div>

  return (
    <div className="page">
      <div className="page__head">
        <div>
          <div className="page__title">Account Management</div>
          <div className="page__subtitle">Create and manage staff login accounts and records.</div>
        </div>
        <button className="btn btn--primary" onClick={openCreate}>+ New staff account</button>
      </div>

      <div className="stats" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 20 }}>
        <div className="stat stat--blue"><div className="stat__label">Total accounts</div><div className="stat__value">{accounts.length}</div></div>
        <div className="stat stat--green"><div className="stat__label">Active</div><div className="stat__value">{accounts.filter(a => a.is_active).length}</div></div>
        <div className="stat stat--red"><div className="stat__label">Inactive</div><div className="stat__value">{accounts.filter(a => !a.is_active).length}</div></div>
        <div className="stat stat--teal"><div className="stat__label">With staff record</div><div className="stat__value">{accounts.filter(a => a.staff_no).length}</div></div>
      </div>

      <div className="card">
        <div className="card__header">
          <div className="card__title">Staff accounts ({filtered.length})</div>
          <input className="input-search" style={{ maxWidth: 260 }} placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Username</th><th>Staff name</th><th>Position</th><th>Ward</th><th>Role</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(acc => {
                const s    = acc.staff
                const ward = s?.ward_no ? wards.find(w => w.ward_no === s.ward_no) : null
                return (
                  <tr key={acc.account_id}>
                    <td className="mono">{acc.username}</td>
                    <td className="name">{s ? `${s.first_name} ${s.last_name}` : <span style={{ color: "var(--text-3)" }}>No record linked</span>}</td>
                    <td>{s?.position ?? "—"}</td>
                    <td>{ward ? <span className="badge badge--gray">{ward.ward_name}</span> : "—"}</td>
                    <td><span className={`badge ${ROLE_BADGE[acc.role] ?? "badge--gray"}`}>{ROLE_LABELS[acc.role] ?? acc.role}</span></td>
                    <td><span className={`badge badge--${acc.is_active ? "green" : "red"}`}>{acc.is_active ? "Active" : "Inactive"}</span></td>
                    <td>
                      <div style={{ display: "flex", gap: 5 }}>
                        <button className="btn btn--ghost btn--sm" onClick={() => openView(acc)}>View</button>
                        <button className="btn btn--ghost btn--sm" onClick={() => openEdit(acc)}>Edit</button>
                        {acc.role !== "admin" && (
                          <button className={`btn btn--sm ${acc.is_active ? "btn--ghost" : "btn--primary"}`} onClick={() => toggleActive(acc)}>
                            {acc.is_active ? "Deactivate" : "Activate"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && <tr><td colSpan={7}><div className="empty"><div className="empty__text">No accounts found.</div></div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══ MODAL ══ */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="modal__header">
              <div className="modal__title">
                {modalMode === "create" ? "New staff account" : modalMode === "edit" ? `Edit — ${selected?.username}` : `View — ${selected?.username}`}
              </div>
              <button className="modal__close" onClick={() => setShowModal(false)}>×</button>
            </div>

            <div className="modal__body">

              {/* ══ CREATE WIZARD ══ */}
              {modalMode === "create" && (
                <>
                  <StepIndicator step={step} />

                  {formError && (
                    <div className="alert alert--red" style={{ marginBottom: 16 }}>
                      <span>⚠️</span><span>{formError}</span>
                    </div>
                  )}

                  {/* Step 0 — Account credentials */}
                  {step === 0 && (
                    <>
                      <Field label="Username" required>
                        <input style={inputStyle} placeholder="e.g. moira.samuel" value={account.username} onChange={e => setAccount(a => ({ ...a, username: e.target.value }))} />
                      </Field>
                      <Field label="Password" required>
                        <div style={{ position: "relative" }}>
                          <input type={showPass ? "text" : "password"} style={{ ...inputStyle, paddingRight: 40 }} placeholder="Set a strong password" value={account.password} onChange={e => setAccount(a => ({ ...a, password: e.target.value }))} />
                          <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--gray-400)", fontSize: 14 }}>{showPass ? "🙈" : "👁️"}</button>
                        </div>
                      </Field>
                      <Field label="Role" required>
                        <select style={selectStyle} value={account.role} onChange={e => setAccount(a => ({ ...a, role: e.target.value }))}>
                          {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                      </Field>
                    </>
                  )}

                  {/* Step 1 — Personal & employment info */}
                  {step === 1 && (
                    <>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                        <Field label="Staff number" required>
                          <input style={inputStyle} placeholder="e.g. S099" value={staffInfo.staff_no} onChange={e => setStaffInfo(s => ({ ...s, staff_no: e.target.value }))} />
                        </Field>
                        <Field label="NIN" required>
                          <input style={inputStyle} placeholder="e.g. AB123456C" value={staffInfo.nin} onChange={e => setStaffInfo(s => ({ ...s, nin: e.target.value }))} />
                        </Field>
                        <Field label="First name" required>
                          <input style={inputStyle} placeholder="First name" value={staffInfo.first_name} onChange={e => setStaffInfo(s => ({ ...s, first_name: e.target.value }))} />
                        </Field>
                        <Field label="Last name" required>
                          <input style={inputStyle} placeholder="Last name" value={staffInfo.last_name} onChange={e => setStaffInfo(s => ({ ...s, last_name: e.target.value }))} />
                        </Field>
                        <Field label="Sex">
                          <select style={selectStyle} value={staffInfo.sex} onChange={e => setStaffInfo(s => ({ ...s, sex: e.target.value }))}>
                            <option>Female</option><option>Male</option>
                          </select>
                        </Field>
                        <Field label="Date of birth" required>
                          <input type="date" style={inputStyle} value={staffInfo.date_of_birth} onChange={e => setStaffInfo(s => ({ ...s, date_of_birth: e.target.value }))} />
                        </Field>
                      </div>
                      <Field label="Address">
                        <input style={inputStyle} placeholder="Full address" value={staffInfo.address} onChange={e => setStaffInfo(s => ({ ...s, address: e.target.value }))} />
                      </Field>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                        <Field label="Telephone">
                          <input style={inputStyle} placeholder="Phone number" value={staffInfo.tel_no} onChange={e => setStaffInfo(s => ({ ...s, tel_no: e.target.value }))} />
                        </Field>
                        <Field label="Position">
                          <div style={{ ...inputStyle, background: "var(--gray-100)", color: "var(--text-2)", cursor: "not-allowed" }}>
                            {ROLE_TO_POSITION[account.role] ?? "—"}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 3 }}>Auto-set from role</div>
                        </Field>
                        <Field label="Current salary (£)" required>
                          <input type="number" style={inputStyle} placeholder="e.g. 18760" value={staffInfo.current_salary} onChange={e => setStaffInfo(s => ({ ...s, current_salary: e.target.value }))} />
                        </Field>
                        <Field label="Salary scale">
                          <input style={inputStyle} placeholder="e.g. 1C" value={staffInfo.salary_scale} onChange={e => setStaffInfo(s => ({ ...s, salary_scale: e.target.value }))} />
                        </Field>
                        <Field label="Hours per week">
                          <input type="number" style={inputStyle} placeholder="e.g. 37.5" value={staffInfo.hrs_per_week} onChange={e => setStaffInfo(s => ({ ...s, hrs_per_week: e.target.value }))} />
                        </Field>
                        <Field label="Ward">
                          <select style={selectStyle} value={staffInfo.ward_no} onChange={e => setStaffInfo(s => ({ ...s, ward_no: e.target.value }))}>
                            <option value="">— Not assigned —</option>
                            {wards.map(w => <option key={w.ward_no} value={w.ward_no}>Ward {w.ward_no} — {w.ward_name}</option>)}
                          </select>
                        </Field>
                        <Field label="Contract type">
                          <select style={selectStyle} value={staffInfo.contract_type} onChange={e => setStaffInfo(s => ({ ...s, contract_type: e.target.value }))}>
                            <option value="P">Permanent</option>
                            <option value="T">Temporary</option>
                          </select>
                        </Field>
                        <Field label="Payment type">
                          <select style={selectStyle} value={staffInfo.payment_type} onChange={e => setStaffInfo(s => ({ ...s, payment_type: e.target.value }))}>
                            <option value="M">Monthly</option>
                            <option value="W">Weekly</option>
                          </select>
                        </Field>
                      </div>
                    </>
                  )}

                  {/* Step 2 — Qualifications */}
                  {step === 2 && (
                    <>
                      <div style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 14 }}>
                        Add the staff member's qualifications. Leave empty rows blank — they will be skipped.
                      </div>
                      {quals.map((q, i) => (
                        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 8, marginBottom: 10, alignItems: "end" }}>
                          <Field label={i === 0 ? "Type" : ""}>
                            <input style={inputStyle} placeholder="e.g. BSc Nursing" value={q.qual_type} onChange={e => updateQual(i, "qual_type", e.target.value)} />
                          </Field>
                          <Field label={i === 0 ? "Date obtained" : ""}>
                            <input type="date" style={inputStyle} value={q.qual_date} onChange={e => updateQual(i, "qual_date", e.target.value)} />
                          </Field>
                          <Field label={i === 0 ? "Institution" : ""}>
                            <input style={inputStyle} placeholder="e.g. Edinburgh Uni" value={q.institution} onChange={e => updateQual(i, "institution", e.target.value)} />
                          </Field>
                          <div style={{ paddingBottom: 0 }}>
                            {quals.length > 1 && (
                              <button type="button" className="btn btn--ghost btn--sm" style={{ color: "var(--red-600)" }} onClick={() => removeQual(i)}>✕</button>
                            )}
                          </div>
                        </div>
                      ))}
                      <button type="button" className="btn btn--ghost btn--sm" onClick={addQual}>+ Add qualification</button>
                    </>
                  )}

                  {/* Step 3 — Experience */}
                  {step === 3 && (
                    <>
                      <div style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 14 }}>
                        Add previous work experience. Leave empty rows blank — they will be skipped.
                      </div>
                      {exps.map((e, i) => (
                        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto", gap: 8, marginBottom: 10, alignItems: "end" }}>
                          <Field label={i === 0 ? "Position" : ""}>
                            <input style={inputStyle} placeholder="e.g. Staff Nurse" value={e.position} onChange={v => updateExp(i, "position", v.target.value)} />
                          </Field>
                          <Field label={i === 0 ? "Organization" : ""}>
                            <input style={inputStyle} placeholder="e.g. Western Hospital" value={e.organization} onChange={v => updateExp(i, "organization", v.target.value)} />
                          </Field>
                          <Field label={i === 0 ? "Start date" : ""}>
                            <input type="date" style={inputStyle} value={e.start_date} onChange={v => updateExp(i, "start_date", v.target.value)} />
                          </Field>
                          <Field label={i === 0 ? "Finish date" : ""}>
                            <input type="date" style={inputStyle} value={e.finish_date} onChange={v => updateExp(i, "finish_date", v.target.value)} />
                          </Field>
                          <div>
                            {exps.length > 1 && (
                              <button type="button" className="btn btn--ghost btn--sm" style={{ color: "var(--red-600)" }} onClick={() => removeExp(i)}>✕</button>
                            )}
                          </div>
                        </div>
                      ))}
                      <button type="button" className="btn btn--ghost btn--sm" onClick={addExp}>+ Add experience</button>
                    </>
                  )}

                  {/* Wizard navigation */}
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                    <button type="button" className="btn btn--ghost" onClick={step === 0 ? () => setShowModal(false) : prevStep}>
                      {step === 0 ? "Cancel" : "← Back"}
                    </button>
                    {step < 3 ? (
                      <button type="button" className="btn btn--primary" onClick={nextStep}>
                        Next →
                      </button>
                    ) : (
                      <button type="button" className="btn btn--primary" onClick={handleCreate} disabled={saving}>
                        {saving ? "Creating…" : "✓ Create account & staff record"}
                      </button>
                    )}
                  </div>
                </>
              )}

              {/* ══ EDIT MODE ══ */}
              {modalMode === "edit" && (
                <form onSubmit={handleEdit}>
                  {formError && <div className="alert alert--red" style={{ marginBottom: 16 }}><span>⚠️</span><span>{formError}</span></div>}

                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-2)", marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
                    Account credentials
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                    <Field label="Username" required>
                      <input style={inputStyle} value={account.username} onChange={e => setAccount(a => ({ ...a, username: e.target.value }))} />
                    </Field>
                    <Field label="Password">
                      <input type="password" style={inputStyle} placeholder="Leave blank to keep current" value={account.password} onChange={e => setAccount(a => ({ ...a, password: e.target.value }))} />
                    </Field>
                    <Field label="Role" required>
                      <select style={selectStyle} value={account.role} onChange={e => setAccount(a => ({ ...a, role: e.target.value }))}>
                        {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                      </select>
                    </Field>
                    {selected?.role !== "admin" && (
                      <Field label="Status">
                        <div style={{ display: "flex", gap: 8, paddingTop: 4 }}>
                          {[true, false].map(val => (
                            <button key={String(val)} type="button" className={`btn btn--sm ${account.is_active === val ? "btn--primary" : "btn--ghost"}`} onClick={() => setAccount(a => ({ ...a, is_active: val }))}>
                              {val ? "Active" : "Inactive"}
                            </button>
                          ))}
                        </div>
                      </Field>
                    )}
                  </div>

                  {selected?.staff_no && (
                    <>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-2)", margin: "16px 0 14px", paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
                        Staff record — {selected.staff_no}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                        <Field label="First name"><input style={inputStyle} value={staffInfo.first_name} onChange={e => setStaffInfo(s => ({ ...s, first_name: e.target.value }))} /></Field>
                        <Field label="Last name"><input style={inputStyle} value={staffInfo.last_name} onChange={e => setStaffInfo(s => ({ ...s, last_name: e.target.value }))} /></Field>
                        <Field label="Position"><input style={inputStyle} value={staffInfo.position} onChange={e => setStaffInfo(s => ({ ...s, position: e.target.value }))} /></Field>
                        <Field label="Tel. no."><input style={inputStyle} value={staffInfo.tel_no} onChange={e => setStaffInfo(s => ({ ...s, tel_no: e.target.value }))} /></Field>
                        <Field label="Current salary (£)"><input type="number" style={inputStyle} value={staffInfo.current_salary} onChange={e => setStaffInfo(s => ({ ...s, current_salary: e.target.value }))} /></Field>
                        <Field label="Ward">
                          <select style={selectStyle} value={staffInfo.ward_no} onChange={e => setStaffInfo(s => ({ ...s, ward_no: e.target.value }))}>
                            <option value="">— Not assigned —</option>
                            {wards.map(w => <option key={w.ward_no} value={w.ward_no}>Ward {w.ward_no} — {w.ward_name}</option>)}
                          </select>
                        </Field>
                        <Field label="Contract type">
                          <select style={selectStyle} value={staffInfo.contract_type} onChange={e => setStaffInfo(s => ({ ...s, contract_type: e.target.value }))}>
                            <option value="P">Permanent</option>
                            <option value="T">Temporary</option>
                          </select>
                        </Field>
                        <Field label="Payment type">
                          <select style={selectStyle} value={staffInfo.payment_type} onChange={e => setStaffInfo(s => ({ ...s, payment_type: e.target.value }))}>
                            <option value="M">Monthly</option>
                            <option value="W">Weekly</option>
                          </select>
                        </Field>
                      </div>
                      <Field label="Address"><input style={inputStyle} value={staffInfo.address} onChange={e => setStaffInfo(s => ({ ...s, address: e.target.value }))} /></Field>
                    </>
                  )}

                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                    <button type="button" className="btn btn--ghost" onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn--primary" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
                  </div>
                </form>
              )}

              {/* ══ VIEW MODE ══ */}
              {modalMode === "view" && selected && (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px", marginBottom: 16 }}>
                    <div><div className="detail__label">Username</div><div className="detail__value mono">{selected.username}</div></div>
                    <div><div className="detail__label">Role</div><span className={`badge ${ROLE_BADGE[selected.role]}`}>{ROLE_LABELS[selected.role]}</span></div>
                    <div><div className="detail__label">Status</div><span className={`badge badge--${selected.is_active ? "green" : "red"}`}>{selected.is_active ? "Active" : "Inactive"}</span></div>
                    <div><div className="detail__label">Created</div><div className="detail__value">{new Date(selected.created_at).toLocaleDateString("en-GB")}</div></div>
                  </div>

                  {selected.staff && (
                    <>
                      <div style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.6px", color: "var(--text-3)", margin: "16px 0 12px", paddingTop: 16, borderTop: "1px solid var(--border)" }}>Staff record</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px", marginBottom: 16 }}>
                        {[
                          ["Staff no.", selected.staff.staff_no],
                          ["Full name", `${selected.staff.first_name} ${selected.staff.last_name}`],
                          ["Position", selected.staff.position],
                          ["Sex", selected.staff.sex],
                          ["Date of birth", selected.staff.date_of_birth],
                          ["NIN", selected.staff.nin],
                          ["Address", selected.staff.address],
                          ["Tel. no.", selected.staff.tel_no],
                          ["Salary", `£${Number(selected.staff.current_salary || 0).toLocaleString()}`],
                          ["Scale", selected.staff.salary_scale],
                          ["Hrs/week", selected.staff.hrs_per_week],
                          ["Contract", selected.staff.contract_type],
                        ].map(([label, val]) => (
                          <div key={label}><div className="detail__label">{label}</div><div className="detail__value">{val || "—"}</div></div>
                        ))}
                      </div>

                      {quals.length > 0 && (
                        <>
                          <div style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.6px", color: "var(--text-3)", margin: "16px 0 8px", paddingTop: 12, borderTop: "1px solid var(--border)" }}>Qualifications</div>
                          {quals.map((q, i) => (
                            <div key={i} style={{ fontSize: 13, padding: "6px 0", borderBottom: i < quals.length - 1 ? "1px solid var(--border)" : "none" }}>
                              <strong>{q.qual_type}</strong> · {q.institution} · {q.qual_date}
                            </div>
                          ))}
                        </>
                      )}

                      {exps.length > 0 && (
                        <>
                          <div style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.6px", color: "var(--text-3)", margin: "16px 0 8px", paddingTop: 12, borderTop: "1px solid var(--border)" }}>Work experience</div>
                          {exps.map((e, i) => (
                            <div key={i} style={{ fontSize: 13, padding: "6px 0", borderBottom: i < exps.length - 1 ? "1px solid var(--border)" : "none" }}>
                              <strong>{e.position}</strong> at {e.organization} · {e.start_date} → {e.finish_date}
                            </div>
                          ))}
                        </>
                      )}
                    </>
                  )}

                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                    <button className="btn btn--ghost" onClick={() => setShowModal(false)}>Close</button>
                  </div>
                </>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AccountManagement