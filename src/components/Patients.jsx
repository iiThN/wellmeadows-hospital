import { useState, useEffect } from "react"
import { supabase } from "../data/supabaseClient"
import { useAuth } from "../AuthContext"

// ── HELPERS ───────────────────────────────────────────────────────────────────
const inputStyle = {
  width: "100%", padding: "8px 12px",
  border: "1px solid var(--border-dark)",
  borderRadius: "var(--radius-sm)",
  fontSize: 13, fontFamily: "var(--font-main)",
  color: "var(--text-1)", background: "var(--surface)", outline: "none",
}
const selectStyle = { ...inputStyle, cursor: "pointer" }
const readonlyStyle = { ...inputStyle, background: "var(--gray-100)", color: "var(--text-2)", cursor: "not-allowed" }

function Field({ label, required, half, children, hint }) {
  return (
    <div style={{ marginBottom: 14, gridColumn: half ? "auto" : undefined }}>
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

function StepIndicator({ step, steps }) {
  return (
    <div style={{ display: "flex", gap: 0, marginBottom: 22, borderBottom: "2px solid var(--border)" }}>
      {steps.map((s, i) => (
        <div key={s} style={{
          flex: 1, textAlign: "center", padding: "9px 4px",
          fontSize: 11.5, fontWeight: step === i ? 600 : 400,
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

function ErrorAlert({ msg }) {
  if (!msg) return null
  return (
    <div className="alert alert--red" style={{ marginBottom: 16 }}>
      <span>⚠️</span><span>{msg}</span>
    </div>
  )
}

// ── EMPTY FORMS ───────────────────────────────────────────────────────────────
const EMPTY_PATIENT = {
  patient_no: "", first_name: "", last_name: "", address: "",
  tel_no: "", date_of_birth: "", sex: "Female",
  marital_status: "Single", date_registered: new Date().toISOString().split("T")[0],
}
const EMPTY_KIN = { full_name: "", relationship: "", address: "", tel_no: "" }
const EMPTY_DOCTOR = { clinic_no: "", full_name: "", address: "", tel_no: "" }
const EMPTY_ADMIT = {
  ward_no: "", bed_no: "", waiting_list_date: "", date_placed: "",
  expected_leave_date: "", expected_stay_date: "",
}
const EMPTY_OUTPATIENT = { appt_date: "", appt_time: "" }
const EMPTY_APPT = {
  appointment_no: "", consultant_staff_no: "", appt_date: "",
  appt_time: "", exam_room: "", outcome: "Waiting list",
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
function Patients({ accessLevel = "full" }) {
  const { currentUser } = useAuth()
  const isViewOnly = accessLevel === "view"

  // Data
  const [patients, setPatients]       = useState([])
  const [inPatients, setInPatients]   = useState([])
  const [outPatients, setOutPatients] = useState([])
  const [nextOfKin, setNextOfKin]     = useState([])
  const [appointments, setAppts]      = useState([])
  const [staff, setStaff]             = useState([])
  const [wards, setWards]             = useState([])
  const [beds, setBeds]               = useState([])
  const [localDoctors, setDoctors]    = useState([])
  const [referrals, setReferrals]     = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)

  // List state
  const [search, setSearch]   = useState("")
  const [view, setView]       = useState("all")
  const [selected, setSelect] = useState(null)
  const [detailTab, setDetailTab] = useState("details")

  // Modal state
  const [modal, setModal]         = useState(null) // "register"|"edit"|"admit"|"outpatient"|"appointment"
  const [saving, setSaving]       = useState(false)
  const [formError, setFormError] = useState("")
  const [step, setStep]           = useState(0)

  // Form data
  const [patientForm, setPatientForm]   = useState(EMPTY_PATIENT)
  const [kinForm, setKinForm]           = useState([{ ...EMPTY_KIN }])
  const [doctorForm, setDoctorForm]     = useState(EMPTY_DOCTOR)
  const [useExistingDoc, setUseExistDoc]= useState(false)
  const [selectedDocClinic, setSelDoc]  = useState("")
  const [admitForm, setAdmitForm]       = useState(EMPTY_ADMIT)
  const [outpatientForm, setOutpatientForm] = useState(EMPTY_OUTPATIENT)
  const [apptForm, setApptForm]         = useState(EMPTY_APPT)

  // ── Load ──────────────────────────────────────────────────────────────────
  async function loadData() {
    try {
      const results = await Promise.all([
        supabase.from("patient").select("*").order("patient_no"),
        supabase.from("inpatient").select("*"),
        supabase.from("outpatient").select("*"),
        supabase.from("next_of_kin").select("*"),
        supabase.from("appointment").select("*"),
        supabase.from("staff").select("staff_no, first_name, last_name, position"),
        supabase.from("ward").select("*"),
        supabase.from("bed").select("*"),
        supabase.from("local_doctor").select("*"),
        supabase.from("patient_referral").select("*"),
      ])
      const err = results.find(r => r.error)?.error
      if (err) throw err
      const [pData, ipData, opData, kinData, apptData, staffData, wardData, bedData, docData, refData] = results.map(r => r.data)
      setPatients(pData)
      setInPatients(ipData)
      setOutPatients(opData)
      setNextOfKin(kinData)
      setAppts(apptData)
      setStaff(staffData)
      setWards(wardData)
      setBeds(bedData)
      setDoctors(docData)
      setReferrals(refData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  // ── Derived ───────────────────────────────────────────────────────────────
  const getStatus = (pat) => {
    const isIn  = inPatients.some(ip => ip.patient_no === pat.patient_no && !ip.actual_leave_date)
    const isOut = outPatients.some(op => op.patient_no === pat.patient_no)
    if (isIn)  return { label: "In-Patient",  cls: "teal" }
    if (isOut) return { label: "Out-Patient", cls: "amber" }
    return { label: "Registered", cls: "gray" }
  }

  const selectedPatient   = patients.find(p => p.patient_no === selected)
  const selectedInPat     = inPatients.find(ip => ip.patient_no === selected)
  const selectedOutPat    = outPatients.find(op => op.patient_no === selected)
  const selectedKin       = nextOfKin.filter(k => k.patient_no === selected)
  const selectedAppts     = appointments.filter(a => a.patient_no === selected)
  const selectedRef       = referrals.find(r => r.patient_no === selected)
  const selectedDoctor    = selectedRef ? localDoctors.find(d => d.clinic_no === selectedRef.clinic_no) : null
  const consultants       = staff.filter(s => s.position === "Consultant")
  const availableBeds     = admitForm.ward_no
    ? beds.filter(b => b.ward_no === parseInt(admitForm.ward_no) && b.status === "Available")
    : []

  const filtered = patients.filter(p => {
    const name = `${p.first_name} ${p.last_name}`.toLowerCase()
    const matchSearch = name.includes(search.toLowerCase()) || String(p.patient_no).includes(search)
    const isIn  = inPatients.some(ip => ip.patient_no === p.patient_no && !ip.actual_leave_date)
    const isOut = outPatients.some(op => op.patient_no === p.patient_no)
    if (view === "in")  return matchSearch && isIn
    if (view === "out") return matchSearch && isOut
    return matchSearch
  })

  // ── Open modals ───────────────────────────────────────────────────────────
  const openRegister = () => {
    setPatientForm(EMPTY_PATIENT)
    setKinForm([{ ...EMPTY_KIN }])
    setDoctorForm(EMPTY_DOCTOR)
    setUseExistDoc(false)
    setSelDoc("")
    setStep(0); setFormError(""); setModal("register")
  }

  const openEdit = (p) => {
    setPatientForm({
      patient_no:     p.patient_no,
      first_name:     p.first_name,
      last_name:      p.last_name,
      address:        p.address ?? "",
      tel_no:         p.tel_no ?? "",
      date_of_birth:  p.date_of_birth ?? "",
      sex:            p.sex ?? "Female",
      marital_status: p.marital_status ?? "Single",
      date_registered:p.date_registered ?? "",
    })
    setFormError(""); setModal("edit")
  }

  const openAdmit = () => {
    setAdmitForm({
      ...EMPTY_ADMIT,
      waiting_list_date: new Date().toISOString().split("T")[0],
      date_placed:       new Date().toISOString().split("T")[0],
    })
    setFormError(""); setModal("admit")
  }

  const openOutpatient = () => {
    setOutpatientForm(EMPTY_OUTPATIENT)
    setFormError(""); setModal("outpatient")
  }

  const openAppointment = () => {
    setApptForm({ ...EMPTY_APPT, appt_date: new Date().toISOString().split("T")[0] })
    setFormError(""); setModal("appointment")
  }

  const closeModal = () => { setModal(null); setStep(0); setFormError("") }

  // ── Validate register steps ───────────────────────────────────────────────
  const validateRegisterStep = () => {
    setFormError("")
    if (step === 0) {
      if (!patientForm.patient_no) return setFormError("Patient number is required."), false
      if (!patientForm.first_name.trim()) return setFormError("First name is required."), false
      if (!patientForm.last_name.trim())  return setFormError("Last name is required."), false
      if (!patientForm.date_of_birth)     return setFormError("Date of birth is required."), false
    }
    return true
  }

  // ── Save: Register patient ────────────────────────────────────────────────
  const handleRegister = async () => {
    setSaving(true); setFormError("")
    try {
      // 1. Insert patient
      const { error: pErr } = await supabase.from("patient").insert({
        patient_no:     parseInt(patientForm.patient_no),
        first_name:     patientForm.first_name.trim(),
        last_name:      patientForm.last_name.trim(),
        address:        patientForm.address.trim(),
        tel_no:         patientForm.tel_no.trim(),
        date_of_birth:  patientForm.date_of_birth,
        sex:            patientForm.sex,
        marital_status: patientForm.marital_status,
        date_registered:patientForm.date_registered,
      })
      if (pErr) throw new Error("Patient error: " + pErr.message)

      // 2. Insert next of kin (skip blank rows)
      const validKin = kinForm.filter(k => k.full_name.trim())
      if (validKin.length > 0) {
        const { error: kErr } = await supabase.from("next_of_kin").insert(
          validKin.map(k => ({ ...k, patient_no: parseInt(patientForm.patient_no) }))
        )
        if (kErr) throw new Error("Next of kin error: " + kErr.message)
      }

      // 3. Insert local doctor + referral
      if (!useExistingDoc && doctorForm.clinic_no.trim()) {
        // Check if doctor exists first
        const { data: existDoc } = await supabase.from("local_doctor").select("clinic_no").eq("clinic_no", doctorForm.clinic_no).single()
        if (!existDoc) {
          const { error: dErr } = await supabase.from("local_doctor").insert({
            clinic_no: doctorForm.clinic_no.trim(),
            full_name: doctorForm.full_name.trim(),
            address:   doctorForm.address.trim(),
            tel_no:    doctorForm.tel_no.trim(),
          })
          if (dErr) throw new Error("Local doctor error: " + dErr.message)
        }
      }

      const clinicNo = useExistingDoc ? selectedDocClinic : doctorForm.clinic_no.trim()
      if (clinicNo) {
        const { error: rErr } = await supabase.from("patient_referral").insert({
          patient_no: parseInt(patientForm.patient_no),
          clinic_no:  clinicNo,
        })
        if (rErr) throw new Error("Referral error: " + rErr.message)
      }

      closeModal(); await loadData()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // ── Save: Edit patient ────────────────────────────────────────────────────
  const handleEdit = async (e) => {
    e.preventDefault(); setSaving(true); setFormError("")
    try {
      const { error } = await supabase.from("patient").update({
        first_name:     patientForm.first_name.trim(),
        last_name:      patientForm.last_name.trim(),
        address:        patientForm.address.trim(),
        tel_no:         patientForm.tel_no.trim(),
        date_of_birth:  patientForm.date_of_birth,
        sex:            patientForm.sex,
        marital_status: patientForm.marital_status,
      }).eq("patient_no", patientForm.patient_no)
      if (error) throw error
      closeModal(); await loadData()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // ── Save: Admit to ward ───────────────────────────────────────────────────
  const handleAdmit = async (e) => {
    e.preventDefault(); setSaving(true); setFormError("")
    try {
      if (!admitForm.ward_no)    throw new Error("Ward is required.")
      if (!admitForm.bed_no)     throw new Error("Bed is required.")
      if (!admitForm.date_placed)throw new Error("Date placed is required.")

      // Insert in-patient record
      const { error: ipErr } = await supabase.from("inpatient").insert({
        patient_no:          selected,
        ward_no:             parseInt(admitForm.ward_no),
        bed_no:              parseInt(admitForm.bed_no),
        waiting_list_date:   admitForm.waiting_list_date || null,
        date_placed:         admitForm.date_placed,
        expected_leave_date: admitForm.expected_leave_date || null,
        expected_stay_date:  admitForm.expected_stay_date ? parseInt(admitForm.expected_stay_date) : null,
        actual_leave_date:   null,
      })
      if (ipErr) throw ipErr

      // Mark bed as occupied
      await supabase.from("bed").update({ status: "Occupied" }).eq("bed_no", parseInt(admitForm.bed_no))

      closeModal(); await loadData()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // ── Save: Discharge patient ───────────────────────────────────────────────
  const handleDischarge = async () => {
    if (!selectedInPat) return
    const today = new Date().toISOString().split("T")[0]
    await supabase.from("inpatient").update({ actual_leave_date: today }).eq("inpatient_id", selectedInPat.inpatient_id)
    await supabase.from("bed").update({ status: "Available" }).eq("bed_no", selectedInPat.bed_no)
    await loadData()
  }

  // ── Save: Out-patient ─────────────────────────────────────────────────────
  const handleOutpatient = async (e) => {
    e.preventDefault(); setSaving(true); setFormError("")
    try {
      if (!outpatientForm.appt_date) throw new Error("Appointment date is required.")
      if (!outpatientForm.appt_time) throw new Error("Appointment time is required.")
      const { error } = await supabase.from("outpatient").insert({
        patient_no: selected,
        appt_date:  outpatientForm.appt_date,
        appt_time:  outpatientForm.appt_time,
      })
      if (error) throw error
      closeModal(); await loadData()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // ── Save: Appointment ─────────────────────────────────────────────────────
  const handleAppointment = async (e) => {
    e.preventDefault(); setSaving(true); setFormError("")
    try {
      if (!apptForm.appointment_no)       throw new Error("Appointment number is required.")
      if (!apptForm.consultant_staff_no)  throw new Error("Consultant is required.")
      if (!apptForm.appt_date)            throw new Error("Date is required.")
      const { error } = await supabase.from("appointment").insert({
        appointment_no:      parseInt(apptForm.appointment_no),
        patient_no:          selected,
        consultant_staff_no: apptForm.consultant_staff_no,
        appt_date:           apptForm.appt_date,
        appt_time:           apptForm.appt_time || null,
        exam_room:           apptForm.exam_room.trim(),
        outcome:             apptForm.outcome,
      })
      if (error) throw error
      closeModal(); await loadData()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // ── Kin row helpers ───────────────────────────────────────────────────────
  const addKin    = () => setKinForm(k => [...k, { ...EMPTY_KIN }])
  const removeKin = (i) => setKinForm(k => k.filter((_, idx) => idx !== i))
  const updateKin = (i, f, v) => setKinForm(k => k.map((r, idx) => idx === i ? { ...r, [f]: v } : r))

  if (loading) return <div className="page"><div className="empty"><div className="empty__icon">⏳</div><div className="empty__text">Loading patient data…</div></div></div>
  if (error)   return <div className="page"><div className="alert alert--red"><span>⚠️</span><span><strong>Error: </strong>{error}</span></div></div>

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="page">
      <div className="page__head">
        <div>
          <div className="page__title">Patient Management</div>
          <div className="page__subtitle">{patients.length} registered · {inPatients.filter(ip => !ip.actual_leave_date).length} currently admitted</div>
        </div>
        {!isViewOnly && (
          <button className="btn btn--primary" onClick={openRegister}>+ Register patient</button>
        )}
      </div>

      {/* Stats */}
      <div className="stats" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <div className="stat stat--blue"><div className="stat__label">Registered</div><div className="stat__value">{patients.length}</div></div>
        <div className="stat stat--teal"><div className="stat__label">In-Patients</div><div className="stat__value">{inPatients.filter(ip => !ip.actual_leave_date).length}</div></div>
        <div className="stat stat--amber"><div className="stat__label">Out-Patients</div><div className="stat__value">{outPatients.length}</div></div>
        <div className="stat stat--purple"><div className="stat__label">Appointments</div><div className="stat__value">{appointments.length}</div></div>
      </div>

      <div className="grid-2">

        {/* ── Patient list ── */}
        <div className="card">
          <div className="card__header">
            <div className="card__title">Patient Registry</div>
            <div style={{ display: "flex", gap: 6 }}>
              {["all", "in", "out"].map(v => (
                <button key={v} className={`btn btn--sm ${view === v ? "btn--primary" : "btn--ghost"}`} onClick={() => setView(v)}>
                  {v === "all" ? "All" : v === "in" ? "In-Patients" : "Out-Patients"}
                </button>
              ))}
            </div>
          </div>
          <div className="card__body" style={{ paddingBottom: 0 }}>
            <div className="toolbar mb-16">
              <input className="input-search" placeholder="Search name or patient no…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>No.</th><th>Name</th><th>Sex</th><th>DOB</th><th>Status</th></tr></thead>
              <tbody>
                {filtered.map(pt => {
                  const status = getStatus(pt)
                  return (
                    <tr key={pt.patient_no} className={selected === pt.patient_no ? "selected" : ""} style={{ cursor: "pointer" }} onClick={() => { setSelect(pt.patient_no); setDetailTab("details") }}>
                      <td className="mono">P{pt.patient_no}</td>
                      <td className="name">{pt.first_name} {pt.last_name}</td>
                      <td><span className={`badge badge--${pt.sex === "Female" ? "purple" : "blue"}`}>{pt.sex}</span></td>
                      <td className="mono">{pt.date_of_birth}</td>
                      <td><span className={`badge badge--${status.cls}`}>{status.label}</span></td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && <tr><td colSpan={5}><div className="empty"><div className="empty__text">No patients found.</div></div></td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Detail panel ── */}
        {selectedPatient ? (
          <div className="card">
            <div className="card__header">
              <div>
                <div className="card__title">{selectedPatient.first_name} {selectedPatient.last_name}</div>
                <div className="card__subtitle">P{selectedPatient.patient_no} · Registered {selectedPatient.date_registered}</div>
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span className={`badge badge--${getStatus(selectedPatient).cls}`}>{getStatus(selectedPatient).label}</span>
                {!isViewOnly && (
                  <button className="btn btn--ghost btn--sm" onClick={() => openEdit(selectedPatient)}>Edit</button>
                )}
              </div>
            </div>

            {/* Action buttons */}
            {!isViewOnly && (
              <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", display: "flex", gap: 8, flexWrap: "wrap" }}>
                {!selectedInPat?.actual_leave_date && !inPatients.some(ip => ip.patient_no === selected && !ip.actual_leave_date) && (
                  <button className="btn btn--primary btn--sm" onClick={openAdmit}>+ Admit to ward</button>
                )}
                {inPatients.some(ip => ip.patient_no === selected && !ip.actual_leave_date) && (
                  <button className="btn btn--ghost btn--sm" style={{ color: "var(--teal-600)" }} onClick={handleDischarge}>✓ Discharge</button>
                )}
                <button className="btn btn--ghost btn--sm" onClick={openOutpatient}>+ Out-patient</button>
                <button className="btn btn--ghost btn--sm" onClick={openAppointment}>+ Appointment</button>
              </div>
            )}

            {/* Tabs */}
            <div style={{ padding: "0 20px" }}>
              <div className="tabs">
                {["details", "admission", "nextofkin", "appointments"].map(t => (
                  <button key={t} className={`tabs__btn${detailTab === t ? " active" : ""}`} onClick={() => setDetailTab(t)}>
                    {t === "nextofkin" ? "Next of Kin" : t === "appointments" ? "Appointments" : t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Details tab */}
            {detailTab === "details" && (
              <div className="card__body">
                <div className="detail-grid">
                  <div><div className="detail__label">Patient no.</div><div className="detail__value mono">P{selectedPatient.patient_no}</div></div>
                  <div><div className="detail__label">Marital status</div><div className="detail__value">{selectedPatient.marital_status}</div></div>
                  <div><div className="detail__label">Sex</div><div className="detail__value">{selectedPatient.sex}</div></div>
                  <div><div className="detail__label">Date of birth</div><div className="detail__value">{selectedPatient.date_of_birth}</div></div>
                  <div className="span-2"><div className="detail__label">Address</div><div className="detail__value">{selectedPatient.address}</div></div>
                  <div><div className="detail__label">Telephone</div><div className="detail__value">{selectedPatient.tel_no}</div></div>
                  <div><div className="detail__label">Date registered</div><div className="detail__value">{selectedPatient.date_registered}</div></div>
                  {selectedDoctor && (
                    <div className="span-2" style={{ borderTop: "1px solid var(--border)", paddingTop: 14, marginTop: 4 }}>
                      <div className="detail__label">Local doctor</div>
                      <div className="detail__value">{selectedDoctor.full_name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>{selectedDoctor.address} · {selectedDoctor.tel_no}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Admission tab */}
            {detailTab === "admission" && (
              <div className="card__body">
                {selectedInPat ? (
                  <div className="detail-grid">
                    <div><div className="detail__label">Ward</div><div className="detail__value">Ward {selectedInPat.ward_no} — {wards.find(w => w.ward_no === selectedInPat.ward_no)?.ward_name}</div></div>
                    <div><div className="detail__label">Bed no.</div><div className="detail__value mono">{selectedInPat.bed_no}</div></div>
                    <div><div className="detail__label">Waiting list date</div><div className="detail__value">{selectedInPat.waiting_list_date ?? "—"}</div></div>
                    <div><div className="detail__label">Date placed</div><div className="detail__value">{selectedInPat.date_placed}</div></div>
                    <div><div className="detail__label">Expected leave</div><div className="detail__value">{selectedInPat.expected_leave_date ?? "—"}</div></div>
                    <div><div className="detail__label">Actual leave</div><div className="detail__value">{selectedInPat.actual_leave_date ?? "Still admitted"}</div></div>
                    <div><div className="detail__label">Expected stay</div><div className="detail__value">{selectedInPat.expected_stay_date ?? "—"} days</div></div>
                    <div><div className="detail__label">Status</div><span className={`badge badge--${selectedInPat.actual_leave_date ? "green" : "teal"}`}>{selectedInPat.actual_leave_date ? "Discharged" : "Admitted"}</span></div>
                  </div>
                ) : selectedOutPat ? (
                  <div className="detail-grid">
                    <div><div className="detail__label">Type</div><span className="badge badge--amber">Out-Patient</span></div>
                    <div><div className="detail__label">Appointment date</div><div className="detail__value">{selectedOutPat.appt_date}</div></div>
                    <div><div className="detail__label">Appointment time</div><div className="detail__value">{selectedOutPat.appt_time}</div></div>
                  </div>
                ) : (
                  <div className="empty"><div className="empty__text">No admission record for this patient.</div></div>
                )}
              </div>
            )}

            {/* Next of kin tab */}
            {detailTab === "nextofkin" && (
              <div className="table-wrap">
                <table className="table">
                  <thead><tr><th>Full name</th><th>Relationship</th><th>Address</th><th>Tel. no.</th></tr></thead>
                  <tbody>
                    {selectedKin.length > 0 ? selectedKin.map(k => (
                      <tr key={k.kin_id}>
                        <td className="name">{k.full_name}</td>
                        <td><span className="badge badge--blue">{k.relationship}</span></td>
                        <td style={{ fontSize: 12 }}>{k.address}</td>
                        <td className="mono">{k.tel_no}</td>
                      </tr>
                    )) : <tr><td colSpan={4}><div className="empty"><div className="empty__text">No next of kin recorded.</div></div></td></tr>}
                  </tbody>
                </table>
              </div>
            )}

            {/* Appointments tab */}
            {detailTab === "appointments" && (
              <div className="table-wrap">
                <table className="table">
                  <thead><tr><th>No.</th><th>Date</th><th>Time</th><th>Room</th><th>Consultant</th><th>Outcome</th></tr></thead>
                  <tbody>
                    {selectedAppts.length > 0 ? selectedAppts.map(a => {
                      const con = staff.find(s => s.staff_no === a.consultant_staff_no)
                      return (
                        <tr key={a.appointment_no}>
                          <td className="mono">{a.appointment_no}</td>
                          <td className="mono">{a.appt_date}</td>
                          <td className="mono">{a.appt_time}</td>
                          <td>{a.exam_room}</td>
                          <td>{con ? `${con.first_name} ${con.last_name}` : a.consultant_staff_no}</td>
                          <td><span className={`badge badge--${a.outcome === "Outpatient" ? "amber" : "teal"}`}>{a.outcome}</span></td>
                        </tr>
                      )
                    }) : <tr><td colSpan={6}><div className="empty"><div className="empty__text">No appointments recorded.</div></div></td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="card">
            <div className="empty">
              <div className="empty__icon">🩺</div>
              <div className="empty__text">Select a patient to view their full record.</div>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          MODALS
      ══════════════════════════════════════════════════════════════════════ */}
      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" style={{ maxWidth: modal === "register" ? 560 : 480 }} onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <div className="modal__title">
                {modal === "register"    ? "Register new patient" :
                 modal === "edit"        ? `Edit — ${selectedPatient?.first_name} ${selectedPatient?.last_name}` :
                 modal === "admit"       ? `Admit to ward — P${selected}` :
                 modal === "outpatient"  ? `Out-patient — P${selected}` :
                 modal === "appointment" ? `New appointment — P${selected}` : ""}
              </div>
              <button className="modal__close" onClick={closeModal}>×</button>
            </div>

            <div className="modal__body">
              <ErrorAlert msg={formError} />

              {/* ── REGISTER WIZARD ── */}
              {modal === "register" && (
                <>
                  <StepIndicator step={step} steps={["Patient Info", "Next of Kin", "Local Doctor"]} />

                  {/* Step 0 - Patient info */}
                  {step === 0 && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                      <Field label="Patient number" required>
                        <input style={inputStyle} type="number" placeholder="e.g. 10234" value={patientForm.patient_no} onChange={e => setPatientForm(f => ({ ...f, patient_no: e.target.value }))} />
                      </Field>
                      <Field label="Date registered">
                        <input type="date" style={inputStyle} value={patientForm.date_registered} onChange={e => setPatientForm(f => ({ ...f, date_registered: e.target.value }))} />
                      </Field>
                      <Field label="First name" required>
                        <input style={inputStyle} placeholder="First name" value={patientForm.first_name} onChange={e => setPatientForm(f => ({ ...f, first_name: e.target.value }))} />
                      </Field>
                      <Field label="Last name" required>
                        <input style={inputStyle} placeholder="Last name" value={patientForm.last_name} onChange={e => setPatientForm(f => ({ ...f, last_name: e.target.value }))} />
                      </Field>
                      <Field label="Sex">
                        <select style={selectStyle} value={patientForm.sex} onChange={e => setPatientForm(f => ({ ...f, sex: e.target.value }))}>
                          <option>Female</option><option>Male</option>
                        </select>
                      </Field>
                      <Field label="Date of birth" required>
                        <input type="date" style={inputStyle} value={patientForm.date_of_birth} onChange={e => setPatientForm(f => ({ ...f, date_of_birth: e.target.value }))} />
                      </Field>
                      <Field label="Marital status">
                        <select style={selectStyle} value={patientForm.marital_status} onChange={e => setPatientForm(f => ({ ...f, marital_status: e.target.value }))}>
                          <option>Single</option><option>Married</option><option>Widowed</option><option>Divorced</option>
                        </select>
                      </Field>
                      <Field label="Telephone">
                        <input style={inputStyle} placeholder="Phone number" value={patientForm.tel_no} onChange={e => setPatientForm(f => ({ ...f, tel_no: e.target.value }))} />
                      </Field>
                      <div style={{ gridColumn: "1/-1" }}>
                        <Field label="Address">
                          <input style={inputStyle} placeholder="Full address" value={patientForm.address} onChange={e => setPatientForm(f => ({ ...f, address: e.target.value }))} />
                        </Field>
                      </div>
                    </div>
                  )}

                  {/* Step 1 - Next of kin */}
                  {step === 1 && (
                    <>
                      <div style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 14 }}>
                        Add next of kin details. Leave blank rows — they will be skipped.
                      </div>
                      {kinForm.map((k, i) => (
                        <div key={i} style={{ padding: "12px", background: "var(--gray-50)", borderRadius: "var(--radius-sm)", marginBottom: 10, border: "1px solid var(--border)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)" }}>Next of kin {i + 1}</div>
                            {kinForm.length > 1 && <button type="button" className="btn btn--ghost btn--sm" style={{ color: "var(--red-600)" }} onClick={() => removeKin(i)}>Remove</button>}
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
                            <Field label="Full name"><input style={inputStyle} placeholder="Full name" value={k.full_name} onChange={e => updateKin(i, "full_name", e.target.value)} /></Field>
                            <Field label="Relationship"><input style={inputStyle} placeholder="e.g. Father" value={k.relationship} onChange={e => updateKin(i, "relationship", e.target.value)} /></Field>
                            <Field label="Address"><input style={inputStyle} placeholder="Address" value={k.address} onChange={e => updateKin(i, "address", e.target.value)} /></Field>
                            <Field label="Telephone"><input style={inputStyle} placeholder="Tel. no." value={k.tel_no} onChange={e => updateKin(i, "tel_no", e.target.value)} /></Field>
                          </div>
                        </div>
                      ))}
                      <button type="button" className="btn btn--ghost btn--sm" onClick={addKin}>+ Add another</button>
                    </>
                  )}

                  {/* Step 2 - Local doctor */}
                  {step === 2 && (
                    <>
                      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                        <button type="button" className={`btn btn--sm ${!useExistingDoc ? "btn--primary" : "btn--ghost"}`} onClick={() => setUseExistDoc(false)}>New doctor</button>
                        <button type="button" className={`btn btn--sm ${useExistingDoc ? "btn--primary" : "btn--ghost"}`} onClick={() => setUseExistDoc(true)}>Existing doctor</button>
                      </div>
                      {useExistingDoc ? (
                        <Field label="Select doctor">
                          <select style={selectStyle} value={selectedDocClinic} onChange={e => setSelDoc(e.target.value)}>
                            <option value="">— Select a doctor —</option>
                            {localDoctors.map(d => <option key={d.clinic_no} value={d.clinic_no}>{d.full_name} ({d.clinic_no})</option>)}
                          </select>
                        </Field>
                      ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                          <Field label="Clinic no."><input style={inputStyle} placeholder="e.g. C001" value={doctorForm.clinic_no} onChange={e => setDoctorForm(f => ({ ...f, clinic_no: e.target.value }))} /></Field>
                          <Field label="Full name"><input style={inputStyle} placeholder="Dr. Name" value={doctorForm.full_name} onChange={e => setDoctorForm(f => ({ ...f, full_name: e.target.value }))} /></Field>
                          <div style={{ gridColumn: "1/-1" }}><Field label="Address"><input style={inputStyle} placeholder="Clinic address" value={doctorForm.address} onChange={e => setDoctorForm(f => ({ ...f, address: e.target.value }))} /></Field></div>
                          <Field label="Telephone"><input style={inputStyle} placeholder="Tel. no." value={doctorForm.tel_no} onChange={e => setDoctorForm(f => ({ ...f, tel_no: e.target.value }))} /></Field>
                        </div>
                      )}
                      <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 8 }}>Local doctor is optional — leave blank if not applicable.</div>
                    </>
                  )}

                  {/* Wizard nav */}
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                    <button type="button" className="btn btn--ghost" onClick={step === 0 ? closeModal : () => { setFormError(""); setStep(s => s - 1) }}>
                      {step === 0 ? "Cancel" : "← Back"}
                    </button>
                    {step < 2 ? (
                      <button type="button" className="btn btn--primary" onClick={() => { if (validateRegisterStep()) setStep(s => s + 1) }}>Next →</button>
                    ) : (
                      <button type="button" className="btn btn--primary" onClick={handleRegister} disabled={saving}>
                        {saving ? "Registering…" : "✓ Register patient"}
                      </button>
                    )}
                  </div>
                </>
              )}

              {/* ── EDIT PATIENT ── */}
              {modal === "edit" && (
                <form onSubmit={handleEdit}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                    <Field label="First name" required><input style={inputStyle} value={patientForm.first_name} onChange={e => setPatientForm(f => ({ ...f, first_name: e.target.value }))} /></Field>
                    <Field label="Last name" required><input style={inputStyle} value={patientForm.last_name} onChange={e => setPatientForm(f => ({ ...f, last_name: e.target.value }))} /></Field>
                    <Field label="Sex">
                      <select style={selectStyle} value={patientForm.sex} onChange={e => setPatientForm(f => ({ ...f, sex: e.target.value }))}>
                        <option>Female</option><option>Male</option>
                      </select>
                    </Field>
                    <Field label="Date of birth"><input type="date" style={inputStyle} value={patientForm.date_of_birth} onChange={e => setPatientForm(f => ({ ...f, date_of_birth: e.target.value }))} /></Field>
                    <Field label="Marital status">
                      <select style={selectStyle} value={patientForm.marital_status} onChange={e => setPatientForm(f => ({ ...f, marital_status: e.target.value }))}>
                        <option>Single</option><option>Married</option><option>Widowed</option><option>Divorced</option>
                      </select>
                    </Field>
                    <Field label="Telephone"><input style={inputStyle} value={patientForm.tel_no} onChange={e => setPatientForm(f => ({ ...f, tel_no: e.target.value }))} /></Field>
                    <div style={{ gridColumn: "1/-1" }}><Field label="Address"><input style={inputStyle} value={patientForm.address} onChange={e => setPatientForm(f => ({ ...f, address: e.target.value }))} /></Field></div>
                  </div>
                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                    <button type="button" className="btn btn--ghost" onClick={closeModal}>Cancel</button>
                    <button type="submit" className="btn btn--primary" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
                  </div>
                </form>
              )}

              {/* ── ADMIT TO WARD ── */}
              {modal === "admit" && (
                <form onSubmit={handleAdmit}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                    <Field label="Ward" required>
                      <select style={selectStyle} value={admitForm.ward_no} onChange={e => setAdmitForm(f => ({ ...f, ward_no: e.target.value, bed_no: "" }))}>
                        <option value="">— Select ward —</option>
                        {wards.map(w => <option key={w.ward_no} value={w.ward_no}>Ward {w.ward_no} — {w.ward_name}</option>)}
                      </select>
                    </Field>
                    <Field label="Bed" required>
                      <select style={selectStyle} value={admitForm.bed_no} onChange={e => setAdmitForm(f => ({ ...f, bed_no: e.target.value }))} disabled={!admitForm.ward_no}>
                        <option value="">— Select bed —</option>
                        {availableBeds.map(b => <option key={b.bed_no} value={b.bed_no}>Bed {b.bed_no}</option>)}
                      </select>
                      {admitForm.ward_no && availableBeds.length === 0 && <div style={{ fontSize: 11, color: "var(--red-600)", marginTop: 3 }}>No available beds in this ward.</div>}
                    </Field>
                    <Field label="Waiting list date"><input type="date" style={inputStyle} value={admitForm.waiting_list_date} onChange={e => setAdmitForm(f => ({ ...f, waiting_list_date: e.target.value }))} /></Field>
                    <Field label="Date placed" required><input type="date" style={inputStyle} value={admitForm.date_placed} onChange={e => setAdmitForm(f => ({ ...f, date_placed: e.target.value }))} /></Field>
                    <Field label="Expected leave date"><input type="date" style={inputStyle} value={admitForm.expected_leave_date} onChange={e => setAdmitForm(f => ({ ...f, expected_leave_date: e.target.value }))} /></Field>
                    <Field label="Expected stay (days)"><input type="number" style={inputStyle} placeholder="e.g. 5" value={admitForm.expected_stay_date} onChange={e => setAdmitForm(f => ({ ...f, expected_stay_date: e.target.value }))} /></Field>
                  </div>
                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                    <button type="button" className="btn btn--ghost" onClick={closeModal}>Cancel</button>
                    <button type="submit" className="btn btn--primary" disabled={saving}>{saving ? "Admitting…" : "✓ Admit patient"}</button>
                  </div>
                </form>
              )}

              {/* ── OUT-PATIENT ── */}
              {modal === "outpatient" && (
                <form onSubmit={handleOutpatient}>
                  <Field label="Appointment date" required><input type="date" style={inputStyle} value={outpatientForm.appt_date} onChange={e => setOutpatientForm(f => ({ ...f, appt_date: e.target.value }))} /></Field>
                  <Field label="Appointment time" required><input type="time" style={inputStyle} value={outpatientForm.appt_time} onChange={e => setOutpatientForm(f => ({ ...f, appt_time: e.target.value }))} /></Field>
                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                    <button type="button" className="btn btn--ghost" onClick={closeModal}>Cancel</button>
                    <button type="submit" className="btn btn--primary" disabled={saving}>{saving ? "Saving…" : "✓ Assign out-patient"}</button>
                  </div>
                </form>
              )}

              {/* ── APPOINTMENT ── */}
              {modal === "appointment" && (
                <form onSubmit={handleAppointment}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                    <Field label="Appointment no." required><input type="number" style={inputStyle} placeholder="e.g. 1001" value={apptForm.appointment_no} onChange={e => setApptForm(f => ({ ...f, appointment_no: e.target.value }))} /></Field>
                    <Field label="Consultant" required>
                      <select style={selectStyle} value={apptForm.consultant_staff_no} onChange={e => setApptForm(f => ({ ...f, consultant_staff_no: e.target.value }))}>
                        <option value="">— Select consultant —</option>
                        {consultants.map(c => <option key={c.staff_no} value={c.staff_no}>{c.first_name} {c.last_name}</option>)}
                      </select>
                    </Field>
                    <Field label="Date" required><input type="date" style={inputStyle} value={apptForm.appt_date} onChange={e => setApptForm(f => ({ ...f, appt_date: e.target.value }))} /></Field>
                    <Field label="Time"><input type="time" style={inputStyle} value={apptForm.appt_time} onChange={e => setApptForm(f => ({ ...f, appt_time: e.target.value }))} /></Field>
                    <Field label="Exam room"><input style={inputStyle} placeholder="e.g. E252" value={apptForm.exam_room} onChange={e => setApptForm(f => ({ ...f, exam_room: e.target.value }))} /></Field>
                    <Field label="Outcome">
                      <select style={selectStyle} value={apptForm.outcome} onChange={e => setApptForm(f => ({ ...f, outcome: e.target.value }))}>
                        <option value="Waiting list">Waiting list</option>
                        <option value="Outpatient">Outpatient</option>
                      </select>
                    </Field>
                  </div>
                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                    <button type="button" className="btn btn--ghost" onClick={closeModal}>Cancel</button>
                    <button type="submit" className="btn btn--primary" disabled={saving}>{saving ? "Saving…" : "✓ Record appointment"}</button>
                  </div>
                </form>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Patients
