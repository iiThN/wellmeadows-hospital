import { useState, useEffect } from "react"
import { supabase } from "../data/supabaseClient"
import { useAuth } from "../AuthContext"

const inputStyle = {
  width: "100%", padding: "8px 12px",
  border: "1px solid var(--border-dark)",
  borderRadius: "var(--radius-sm)",
  fontSize: 13, fontFamily: "var(--font-main)",
  color: "var(--text-1)", background: "var(--surface)", outline: "none",
}
const readonlyStyle = {
  ...inputStyle,
  background: "var(--gray-100)",
  color: "var(--text-2)",
  cursor: "not-allowed",
}

function Field({ label, required, hint, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: "block", fontSize: 11.5, fontWeight: 600,
        textTransform: "uppercase", letterSpacing: "0.5px",
        color: "var(--text-2)", marginBottom: 5,
      }}>
        {label} {required && <span style={{ color: "var(--red-600)" }}>*</span>}
      </label>
      {children}
      {hint && <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 3 }}>{hint}</div>}
    </div>
  )
}

function SuccessAlert({ msg }) {
  if (!msg) return null
  return (
    <div style={{
      background: "var(--green-50)", border: "1px solid var(--green-500)",
      borderRadius: "var(--radius-sm)", padding: "10px 14px",
      fontSize: 13, color: "var(--green-600)",
      marginBottom: 16, display: "flex", alignItems: "center", gap: 8,
    }}>
      ✅ {msg}
    </div>
  )
}

function ErrorAlert({ msg }) {
  if (!msg) return null
  return (
    <div className="alert alert--red" style={{ marginBottom: 16 }}>
      <span>⚠️</span><span>{msg}</span>
    </div>
  )
}

function AccountSettings() {
  const { currentUser } = useAuth()

  // Staff info state
  const [staffData, setStaffData]     = useState(null)
  const [loading, setLoading]         = useState(true)

  // Personal info form
  const [personalForm, setPersonal]   = useState({
    first_name: "", last_name: "", address: "",
    tel_no: "", date_of_birth: "", sex: "", marital_status: "",
  })
  const [savingPersonal, setSavingPersonal] = useState(false)
  const [personalSuccess, setPersonalSuccess] = useState("")
  const [personalError, setPersonalError]     = useState("")

  // Password form
  const [passwordForm, setPassword]   = useState({
    current_password: "", new_password: "", confirm_password: "",
  })
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState("")
  const [passwordError, setPasswordError]     = useState("")
  const [showPasswords, setShowPasswords]     = useState({
    current: false, new: false, confirm: false,
  })

  // ── Load staff record ────────────────────────────────────────────────────
  useEffect(() => {
    async function loadStaff() {
      if (!currentUser?.staff_no) {
        setLoading(false)
        return
      }
      try {
        const { data, error } = await supabase
          .from("staff")
          .select("*")
          .eq("staff_no", currentUser.staff_no)
          .single()

        if (error) throw error

        setStaffData(data)
        setPersonal({
          first_name:     data.first_name     ?? "",
          last_name:      data.last_name      ?? "",
          address:        data.address        ?? "",
          tel_no:         data.tel_no         ?? "",
          date_of_birth:  data.date_of_birth  ?? "",
          sex:            data.sex            ?? "",
          marital_status: data.marital_status ?? "",
        })
      } catch (err) {
        console.error("Failed to load staff data:", err)
      } finally {
        setLoading(false)
      }
    }
    loadStaff()
  }, [currentUser])

  // ── Save personal info ───────────────────────────────────────────────────
  const handleSavePersonal = async (e) => {
    e.preventDefault()
    setPersonalError(""); setPersonalSuccess("")

    if (!personalForm.first_name.trim()) return setPersonalError("First name is required.")
    if (!personalForm.last_name.trim())  return setPersonalError("Last name is required.")

    setSavingPersonal(true)
    try {
      const { error } = await supabase
        .from("staff")
        .update({
          first_name:    personalForm.first_name.trim(),
          last_name:     personalForm.last_name.trim(),
          address:       personalForm.address.trim(),
          tel_no:        personalForm.tel_no.trim(),
          date_of_birth: personalForm.date_of_birth || null,
          sex:           personalForm.sex,
        })
        .eq("staff_no", currentUser.staff_no)

      if (error) throw error
      setPersonalSuccess("Personal information updated successfully.")
    } catch (err) {
      setPersonalError(err.message)
    } finally {
      setSavingPersonal(false)
    }
  }

  // ── Save password ────────────────────────────────────────────────────────
  const handleSavePassword = async (e) => {
    e.preventDefault()
    setPasswordError(""); setPasswordSuccess("")

    if (!passwordForm.current_password) return setPasswordError("Current password is required.")
    if (!passwordForm.new_password)     return setPasswordError("New password is required.")
    if (passwordForm.new_password.length < 8) return setPasswordError("New password must be at least 8 characters.")
    if (passwordForm.new_password !== passwordForm.confirm_password) return setPasswordError("New passwords do not match.")
    if (passwordForm.new_password === passwordForm.current_password) return setPasswordError("New password must be different from current password.")

    setSavingPassword(true)
    try {
      // Verify current password first
      const { data: account, error: verifyErr } = await supabase
        .from("staff_account")
        .select("account_id")
        .eq("account_id", currentUser.account_id)
        .eq("password", passwordForm.current_password)
        .single()

      if (verifyErr || !account) throw new Error("Current password is incorrect.")

      // Update password
      const { error: updateErr } = await supabase.rpc("update_account_credentials", {
        p_account_id: currentUser.account_id,
        p_changed_by: currentUser?.username,
        p_password: passwordForm.new_password?.trim() ? passwordForm.new_password.trim() : NULL,
      })
      if (updateErr) throw updateErr

      setPasswordSuccess("Password changed successfully.")
      setPassword({ current_password: "", new_password: "", confirm_password: "" })
    } catch (err) {
      setPasswordError(err.message)
    } finally {
      setSavingPassword(false)
    }
  }

  const toggleShow = (field) => setShowPasswords(s => ({ ...s, [field]: !s[field] }))

  // ── Password strength indicator ──────────────────────────────────────────
  const getPasswordStrength = (pass) => {
    if (!pass) return null
    if (pass.length < 6)  return { label: "Too short", color: "var(--red-600)", width: "20%" }
    if (pass.length < 8)  return { label: "Weak",      color: "var(--amber-600)", width: "40%" }
    if (!/[0-9]/.test(pass) || !/[A-Z]/.test(pass))
                          return { label: "Fair",       color: "var(--amber-500)", width: "60%" }
    if (pass.length >= 10)return { label: "Strong",     color: "var(--green-600)", width: "100%" }
    return { label: "Good", color: "var(--teal-600)", width: "80%" }
  }

  const strength = getPasswordStrength(passwordForm.new_password)

  if (loading) return (
    <div className="page">
      <div className="empty"><div className="empty__icon">⏳</div><div className="empty__text">Loading your account…</div></div>
    </div>
  )

  return (
    <div className="page">
      <div className="page__head">
        <div>
          <div className="page__title">Account Settings</div>
          <div className="page__subtitle">Update your personal information and password.</div>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: "start" }}>

        {/* ── Left: Personal info ── */}
        <div>

          {/* Account info card (read-only) */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card__header">
              <div className="card__title">Account info</div>
              <span className="badge badge--gray">{currentUser.role?.replace(/_/g, " ")}</span>
            </div>
            <div className="card__body">
              <div className="detail-grid">
                <div>
                  <div className="detail__label">Username</div>
                  <div className="detail__value mono">{currentUser.username}</div>
                </div>
                <div>
                  <div className="detail__label">Staff no.</div>
                  <div className="detail__value mono">{currentUser.staff_no ?? "—"}</div>
                </div>
                <div>
                  <div className="detail__label">Role</div>
                  <div className="detail__value">{currentUser.role?.replace(/_/g, " ")}</div>
                </div>
                <div>
                  <div className="detail__label">Position</div>
                  <div className="detail__value">{staffData?.position ?? "—"}</div>
                </div>
              </div>
              <div style={{ marginTop: 12, padding: "10px 12px", background: "var(--amber-50)", borderRadius: "var(--radius-sm)", border: "1px solid var(--amber-500)", fontSize: 12, color: "var(--amber-600)" }}>
                ⚠️ Username, role, and staff number can only be changed by the Personnel Officer.
              </div>
            </div>
          </div>

          {/* Personal info form */}
          {currentUser.staff_no ? (
            <div className="card">
              <div className="card__header">
                <div className="card__title">Personal information</div>
              </div>
              <form className="card__body" onSubmit={handleSavePersonal}>
                <ErrorAlert   msg={personalError} />
                <SuccessAlert msg={personalSuccess} />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                  <Field label="First name" required>
                    <input style={inputStyle} value={personalForm.first_name} onChange={e => setPersonal(f => ({ ...f, first_name: e.target.value }))} />
                  </Field>
                  <Field label="Last name" required>
                    <input style={inputStyle} value={personalForm.last_name} onChange={e => setPersonal(f => ({ ...f, last_name: e.target.value }))} />
                  </Field>
                  <Field label="Sex">
                    <select style={inputStyle} value={personalForm.sex} onChange={e => setPersonal(f => ({ ...f, sex: e.target.value }))}>
                      <option>Female</option>
                      <option>Male</option>
                    </select>
                  </Field>
                  <Field label="Date of birth">
                    <input type="date" style={inputStyle} value={personalForm.date_of_birth} onChange={e => setPersonal(f => ({ ...f, date_of_birth: e.target.value }))} />
                  </Field>
                  <Field label="Telephone">
                    <input style={inputStyle} placeholder="Phone number" value={personalForm.tel_no} onChange={e => setPersonal(f => ({ ...f, tel_no: e.target.value }))} />
                  </Field>
                </div>

                <Field label="Address" hint="Your home address for hospital records.">
                  <input style={inputStyle} placeholder="Full address" value={personalForm.address} onChange={e => setPersonal(f => ({ ...f, address: e.target.value }))} />
                </Field>

                {/* Read-only employment fields */}
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, marginTop: 4 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-3)", marginBottom: 12 }}>
                    Employment details (read-only)
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                    <Field label="NIN">
                      <input style={readonlyStyle} value={staffData?.nin ?? "—"} readOnly />
                    </Field>
                    <Field label="Position">
                      <input style={readonlyStyle} value={staffData?.position ?? "—"} readOnly />
                    </Field>
                    <Field label="Current salary">
                      <input style={readonlyStyle} value={staffData?.current_salary ? `£${Number(staffData.current_salary).toLocaleString()}` : "—"} readOnly />
                    </Field>
                    <Field label="Contract type">
                      <input style={readonlyStyle} value={staffData?.contract_type === "P" ? "Permanent" : staffData?.contract_type === "T" ? "Temporary" : "—"} readOnly />
                    </Field>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                  <button type="submit" className="btn btn--primary" disabled={savingPersonal}>
                    {savingPersonal ? "Saving…" : "Save personal info"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="card">
              <div className="card__body">
                <div className="empty">
                  <div className="empty__icon">👤</div>
                  <div className="empty__text">No staff record linked to this account. Contact the Personnel Officer to link your staff record.</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Change password ── */}
        <div className="card">
          <div className="card__header">
            <div className="card__title">Change password</div>
          </div>
          <form className="card__body" onSubmit={handleSavePassword}>
            <ErrorAlert   msg={passwordError} />
            <SuccessAlert msg={passwordSuccess} />

            {/* Current password */}
            <Field label="Current password" required>
              <div style={{ position: "relative" }}>
                <input
                  type={showPasswords.current ? "text" : "password"}
                  style={{ ...inputStyle, paddingRight: 40 }}
                  placeholder="Enter current password"
                  value={passwordForm.current_password}
                  onChange={e => setPassword(f => ({ ...f, current_password: e.target.value }))}
                />
                <button type="button" onClick={() => toggleShow("current")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--gray-400)", fontSize: 14 }}>
                  {showPasswords.current ? "🙈" : "👁️"}
                </button>
              </div>
            </Field>

            {/* New password */}
            <Field label="New password" required hint="Minimum 8 characters.">
              <div style={{ position: "relative" }}>
                <input
                  type={showPasswords.new ? "text" : "password"}
                  style={{ ...inputStyle, paddingRight: 40 }}
                  placeholder="Enter new password"
                  value={passwordForm.new_password}
                  onChange={e => setPassword(f => ({ ...f, new_password: e.target.value }))}
                />
                <button type="button" onClick={() => toggleShow("new")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--gray-400)", fontSize: 14 }}>
                  {showPasswords.new ? "🙈" : "👁️"}
                </button>
              </div>
              {/* Password strength bar */}
              {strength && (
                <div style={{ marginTop: 6 }}>
                  <div style={{ height: 4, background: "var(--gray-200)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: strength.width, background: strength.color, borderRadius: 2, transition: "width 0.2s, background 0.2s" }} />
                  </div>
                  <div style={{ fontSize: 11, color: strength.color, marginTop: 3 }}>{strength.label}</div>
                </div>
              )}
            </Field>

            {/* Confirm password */}
            <Field label="Confirm new password" required>
              <div style={{ position: "relative" }}>
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  style={{
                    ...inputStyle, paddingRight: 40,
                    borderColor: passwordForm.confirm_password && passwordForm.new_password !== passwordForm.confirm_password ? "var(--red-500)" : undefined,
                  }}
                  placeholder="Confirm new password"
                  value={passwordForm.confirm_password}
                  onChange={e => setPassword(f => ({ ...f, confirm_password: e.target.value }))}
                />
                <button type="button" onClick={() => toggleShow("confirm")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--gray-400)", fontSize: 14 }}>
                  {showPasswords.confirm ? "🙈" : "👁️"}
                </button>
              </div>
              {passwordForm.confirm_password && passwordForm.new_password !== passwordForm.confirm_password && (
                <div style={{ fontSize: 11, color: "var(--red-600)", marginTop: 3 }}>Passwords do not match.</div>
              )}
              {passwordForm.confirm_password && passwordForm.new_password === passwordForm.confirm_password && (
                <div style={{ fontSize: 11, color: "var(--green-600)", marginTop: 3 }}>✓ Passwords match.</div>
              )}
            </Field>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
              <button type="submit" className="btn btn--primary" disabled={savingPassword}>
                {savingPassword ? "Changing…" : "Change password"}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  )
}

export default AccountSettings
