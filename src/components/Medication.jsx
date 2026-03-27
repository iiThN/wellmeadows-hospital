import { useState, useEffect } from "react"
import { supabase } from "../data/supabaseClient"

const inputStyle = {
  width: "100%", padding: "8px 12px",
  border: "1px solid var(--border-dark)",
  borderRadius: "var(--radius-sm)",
  fontSize: 13, fontFamily: "var(--font-main)",
  color: "var(--text-1)", background: "var(--surface)", outline: "none",
}
const selectStyle = { ...inputStyle, cursor: "pointer" }

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

const EMPTY_RX = {
  patient_no: "", drug_no: "", units_per_day: "",
  admin_method: "Oral", start_date: "", finish_date: "",
}

function Medication({ accessLevel = "full" }) {
  const [pharmaSupplies, setPharma]   = useState([])
  const [medications, setMeds]        = useState([])
  const [patients, setPatients]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)

  // Tabs & search
  const [tab, setTab]                 = useState("drugs")
  const [search, setSearch]           = useState("")

  // Prescription report — (k) medication for a particular patient
  const [reportPatient, setReportPatient] = useState("")

  // Add prescription modal — (j)
  const [showModal, setShowModal]     = useState(false)
  const [rxForm, setRxForm]           = useState(EMPTY_RX)
  const [saving, setSaving]           = useState(false)
  const [formError, setFormError]     = useState("")

  const isViewOnly = accessLevel === "view"

  // ── Load ──────────────────────────────────────────────────────────────────
  async function loadData() {
    try {
      const [
        { data: pharmaData, error: e1 },
        { data: medsData,   error: e2 },
        { data: patientsData, error: e3 },
      ] = await Promise.all([
        supabase.from("pharmaceutical_supply").select("*"),
        supabase.from("patient_medication").select("*").order("medication_id"),
        supabase.from("patient").select("patient_no, first_name, last_name"),
      ])
      const err = e1 || e2 || e3
      if (err) throw err
      setPharma(pharmaData)
      setMeds(medsData)
      setPatients(patientsData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  // ── Derived ───────────────────────────────────────────────────────────────
  const lowStock = pharmaSupplies.filter(d => d.qty_in_stock <= d.reorder_level)

  const filteredDrugs = pharmaSupplies.filter(d =>
    d.drug_name.toLowerCase().includes(search.toLowerCase()) ||
    d.description.toLowerCase().includes(search.toLowerCase())
  )

  const filteredRx = medications.filter(m => {
    const p = patients.find(pt => pt.patient_no === m.patient_no)
    const d = pharmaSupplies.find(dr => dr.drug_no === m.drug_no)
    const name = p ? `${p.first_name} ${p.last_name}`.toLowerCase() : ""
    return (
      name.includes(search.toLowerCase()) ||
      (d && d.drug_name.toLowerCase().includes(search.toLowerCase())) ||
      String(m.patient_no).includes(search)
    )
  })

  // (k) Per-patient medication report
  const patientRxReport = reportPatient
    ? medications.filter(m => m.patient_no === parseInt(reportPatient))
    : []

  const reportPatientName = reportPatient
    ? patients.find(p => p.patient_no === parseInt(reportPatient))
    : null

  const stockBadge = (drug) => {
    if (drug.qty_in_stock <= drug.reorder_level)       return "badge--red"
    if (drug.qty_in_stock <= drug.reorder_level * 1.5) return "badge--amber"
    return "badge--green"
  }

  // ── Add prescription ──────────────────────────────────────────────────────
  const openAddRx = () => {
    setRxForm(EMPTY_RX)
    setFormError("")
    setShowModal(true)
  }

  const handleAddRx = async (e) => {
    e.preventDefault()
    setFormError("")
    if (!rxForm.patient_no)   return setFormError("Patient is required.")
    if (!rxForm.drug_no)      return setFormError("Drug is required.")
    if (!rxForm.units_per_day)return setFormError("Units per day is required.")
    if (!rxForm.start_date)   return setFormError("Start date is required.")

    setSaving(true)
    try {
      const { error } = await supabase.from("patient_medication").insert({
        patient_no:   parseInt(rxForm.patient_no),
        drug_no:      parseInt(rxForm.drug_no),
        units_per_day:parseInt(rxForm.units_per_day),
        admin_method: rxForm.admin_method,
        start_date:   rxForm.start_date,
        finish_date:  rxForm.finish_date || null,
      })
      if (error) throw error
      setShowModal(false)
      await loadData()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // ── Delete prescription ───────────────────────────────────────────────────
  const handleDeleteRx = async (id) => {
    if (!window.confirm("Remove this prescription?")) return
    await supabase.from("patient_medication").delete().eq("medication_id", id)
    await loadData()
  }

  if (loading) return <div className="page"><div className="empty"><div className="empty__icon">⏳</div><div className="empty__text">Loading medication data…</div></div></div>
  if (error)   return <div className="page"><div className="alert alert--red"><span>⚠️</span><span><strong>Error: </strong>{error}</span></div></div>

  return (
    <div className="page">
      <div className="page__head">
        <div>
          <div className="page__title">Medication & Prescriptions</div>
          <div className="page__subtitle">{pharmaSupplies.length} drugs · {medications.length} prescriptions</div>
        </div>
        {!isViewOnly && (
          <button className="btn btn--primary" onClick={openAddRx}>+ Add prescription</button>
        )}
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="alert alert--red">
          <span>🚨</span>
          <span><strong>Reorder alert: </strong>{lowStock.map(d => d.drug_name).join(", ")} are at or below reorder level.</span>
        </div>
      )}

      {/* Stats */}
      <div className="stats" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <div className="stat stat--blue"><div className="stat__label">Total drugs</div><div className="stat__value">{pharmaSupplies.length}</div></div>
        <div className="stat stat--red"><div className="stat__label">Low stock</div><div className="stat__value">{lowStock.length}</div></div>
        <div className="stat stat--teal"><div className="stat__label">Prescriptions</div><div className="stat__value">{medications.length}</div></div>
        <div className="stat stat--purple"><div className="stat__label">Patients medicated</div><div className="stat__value">{[...new Set(medications.map(m => m.patient_no))].length}</div></div>
      </div>

      {/* ── (k) Per-patient medication report ── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card__header">
          <div>
            <div className="card__title">Patient medication report</div>
            <div className="card__subtitle">Operations (k) — view all medication for a specific patient</div>
          </div>
        </div>
        <div className="card__body" style={{ paddingBottom: 0 }}>
          <div className="toolbar mb-16">
            <select
              style={{ ...selectStyle, maxWidth: 300 }}
              value={reportPatient}
              onChange={e => setReportPatient(e.target.value)}
            >
              <option value="">— Select a patient —</option>
              {patients.map(p => (
                <option key={p.patient_no} value={p.patient_no}>
                  P{p.patient_no} — {p.first_name} {p.last_name}
                </option>
              ))}
            </select>
          </div>
        </div>
        {reportPatient && (
          <>
            <div style={{ padding: "8px 20px", background: "var(--blue-50)", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
              <strong>Patient:</strong> P{reportPatientName?.patient_no} — {reportPatientName?.first_name} {reportPatientName?.last_name} · <strong>{patientRxReport.length}</strong> prescription(s) on record
            </div>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr><th>Rx ID</th><th>Drug</th><th>Dosage</th><th>Units/day</th><th>Admin method</th><th>Start date</th><th>Finish date</th>{!isViewOnly && <th></th>}</tr>
                </thead>
                <tbody>
                  {patientRxReport.length > 0 ? patientRxReport.map(m => {
                    const d = pharmaSupplies.find(dr => dr.drug_no === m.drug_no)
                    return (
                      <tr key={m.medication_id}>
                        <td className="mono">Rx{m.medication_id}</td>
                        <td className="name">{d ? d.drug_name : `Drug ${m.drug_no}`}</td>
                        <td className="mono">{d?.dosage ?? "—"}</td>
                        <td>{m.units_per_day}</td>
                        <td><span className="badge badge--blue">{m.admin_method}</span></td>
                        <td className="mono">{m.start_date}</td>
                        <td className="mono">{m.finish_date ?? "Ongoing"}</td>
                        {!isViewOnly && (
                          <td>
                            <button className="btn btn--ghost btn--sm" style={{ color: "var(--red-600)" }} onClick={() => handleDeleteRx(m.medication_id)}>Remove</button>
                          </td>
                        )}
                      </tr>
                    )
                  }) : (
                    <tr><td colSpan={isViewOnly ? 7 : 8}><div className="empty"><div className="empty__text">No prescriptions for this patient.</div></div></td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* ── Drug catalog & all prescriptions ── */}
      <div className="card">
        <div className="card__header">
          <div className="tabs" style={{ borderBottom: "none", marginBottom: 0 }}>
            {[
              { id: "drugs",         label: "Drug catalog" },
              { id: "prescriptions", label: "All prescriptions" },
            ].map(t => (
              <button key={t.id} className={`tabs__btn${tab === t.id ? " active" : ""}`} onClick={() => { setTab(t.id); setSearch("") }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="card__body" style={{ paddingBottom: 0 }}>
          <div className="toolbar mb-16">
            <input
              className="input-search"
              placeholder={tab === "drugs" ? "Search drug name or description…" : "Search patient name or drug…"}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {tab === "drugs" && (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Drug no.</th><th>Name</th><th>Description</th><th>Dosage</th><th>Admin method</th><th>In stock</th><th>Reorder level</th><th>Cost / unit</th></tr>
              </thead>
              <tbody>
                {filteredDrugs.map(d => (
                  <tr key={d.drug_no}>
                    <td className="mono">{d.drug_no}</td>
                    <td className="name">{d.drug_name}</td>
                    <td>{d.description}</td>
                    <td className="mono">{d.dosage}</td>
                    <td><span className="badge badge--blue">{d.admin_method}</span></td>
                    <td><span className={`badge ${stockBadge(d)}`}>{d.qty_in_stock}</span></td>
                    <td className="mono">{d.reorder_level}</td>
                    <td>£{Number(d.cost_per_unit).toFixed(2)}</td>
                  </tr>
                ))}
                {filteredDrugs.length === 0 && <tr><td colSpan={8}><div className="empty"><div className="empty__text">No drugs found.</div></div></td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {tab === "prescriptions" && (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Rx ID</th><th>Patient</th><th>Drug</th><th>Units/day</th><th>Admin method</th><th>Start date</th><th>Finish date</th>{!isViewOnly && <th></th>}</tr>
              </thead>
              <tbody>
                {filteredRx.map(m => {
                  const p = patients.find(pt => pt.patient_no === m.patient_no)
                  const d = pharmaSupplies.find(dr => dr.drug_no === m.drug_no)
                  return (
                    <tr key={m.medication_id}>
                      <td className="mono">Rx{m.medication_id}</td>
                      <td className="name">{p ? `${p.first_name} ${p.last_name}` : `P${m.patient_no}`}</td>
                      <td className="name">{d ? d.drug_name : `Drug ${m.drug_no}`}</td>
                      <td>{m.units_per_day}</td>
                      <td><span className="badge badge--blue">{m.admin_method}</span></td>
                      <td className="mono">{m.start_date}</td>
                      <td className="mono">{m.finish_date ?? "Ongoing"}</td>
                      {!isViewOnly && (
                        <td>
                          <button className="btn btn--ghost btn--sm" style={{ color: "var(--red-600)" }} onClick={() => handleDeleteRx(m.medication_id)}>Remove</button>
                        </td>
                      )}
                    </tr>
                  )
                })}
                {filteredRx.length === 0 && <tr><td colSpan={isViewOnly ? 7 : 8}><div className="empty"><div className="empty__text">No prescriptions found.</div></div></td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── ADD PRESCRIPTION MODAL (j) ── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <div className="modal__title">Add prescription</div>
              <button className="modal__close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form className="modal__body" onSubmit={handleAddRx}>
              {formError && <div className="alert alert--red" style={{ marginBottom: 16 }}><span>⚠️</span><span>{formError}</span></div>}

              <Field label="Patient" required>
                <select style={selectStyle} value={rxForm.patient_no} onChange={e => setRxForm(f => ({ ...f, patient_no: e.target.value }))}>
                  <option value="">— Select patient —</option>
                  {patients.map(p => <option key={p.patient_no} value={p.patient_no}>P{p.patient_no} — {p.first_name} {p.last_name}</option>)}
                </select>
              </Field>

              <Field label="Drug" required>
                <select style={selectStyle} value={rxForm.drug_no} onChange={e => setRxForm(f => ({ ...f, drug_no: e.target.value }))}>
                  <option value="">— Select drug —</option>
                  {pharmaSupplies.map(d => <option key={d.drug_no} value={d.drug_no}>{d.drug_name} ({d.dosage})</option>)}
                </select>
              </Field>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                <Field label="Units per day" required>
                  <input type="number" style={inputStyle} placeholder="e.g. 3" value={rxForm.units_per_day} onChange={e => setRxForm(f => ({ ...f, units_per_day: e.target.value }))} />
                </Field>
                <Field label="Admin method">
                  <select style={selectStyle} value={rxForm.admin_method} onChange={e => setRxForm(f => ({ ...f, admin_method: e.target.value }))}>
                    <option>Oral</option>
                    <option>IV</option>
                    <option>Topical</option>
                    <option>Injection</option>
                    <option>Inhaled</option>
                  </select>
                </Field>
                <Field label="Start date" required>
                  <input type="date" style={inputStyle} value={rxForm.start_date} onChange={e => setRxForm(f => ({ ...f, start_date: e.target.value }))} />
                </Field>
                <Field label="Finish date">
                  <input type="date" style={inputStyle} value={rxForm.finish_date} onChange={e => setRxForm(f => ({ ...f, finish_date: e.target.value }))} />
                </Field>
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                <button type="button" className="btn btn--ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn--primary" disabled={saving}>{saving ? "Saving…" : "✓ Add prescription"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Medication
