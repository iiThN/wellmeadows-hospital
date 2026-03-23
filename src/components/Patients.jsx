import { useState, useEffect } from "react"

const API = "http://localhost:5000/api"

function Patients() {
  const [patients, setPatients]       = useState([])
  const [inPatients, setInPatients]   = useState([])
  const [outPatients, setOutPatients] = useState([])
  const [nextOfKin, setNextOfKin]     = useState([])
  const [appointments, setAppts]      = useState([])
  const [staff, setStaff]             = useState([])
  const [wards, setWards]             = useState([])
  const [localDoctors, setDoctors]    = useState([])
  const [referrals, setReferrals]     = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState("")
  const [view, setView]               = useState("all")
  const [selected, setSelect]         = useState(null)
  const [tab, setTab]                 = useState("details")

  useEffect(() => {
    Promise.all([
      fetch(`${API}/patients`).then(r => r.json()),
      fetch(`${API}/inpatients`).then(r => r.json()),
      fetch(`${API}/outpatients`).then(r => r.json()),
      fetch(`${API}/next-of-kin`).then(r => r.json()),
      fetch(`${API}/appointments`).then(r => r.json()),
      fetch(`${API}/staff`).then(r => r.json()),
      fetch(`${API}/wards`).then(r => r.json()),
      fetch(`${API}/local-doctors`).then(r => r.json()),
      fetch(`${API}/patient-referrals`).then(r => r.json()),
    ])
      .then(([pData, ipData, opData, kinData, apptData, staffData, wardsData, docData, refData]) => {
        setPatients(pData)
        setInPatients(ipData)
        setOutPatients(opData)
        setNextOfKin(kinData)
        setAppts(apptData)
        setStaff(staffData)
        setWards(wardsData)
        setDoctors(docData)
        setReferrals(refData)
        setLoading(false)
      })
      .catch(err => {
        console.error("Failed to load patient data:", err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="page">
        <div className="empty">
          <div className="empty__icon">⏳</div>
          <div className="empty__text">Loading patient data from database…</div>
        </div>
      </div>
    )
  }

  const filtered = patients.filter(p => {
    const name        = `${p.first_name} ${p.last_name}`.toLowerCase()
    const matchSearch = name.includes(search.toLowerCase()) || String(p.patient_no).includes(search)
    const isIn        = inPatients.some(ip => ip.patient_no === p.patient_no && !ip.actual_leave_date)
    const isOut       = outPatients.some(op => op.patient_no === p.patient_no)
    if (view === "in")  return matchSearch && isIn
    if (view === "out") return matchSearch && isOut
    return matchSearch
  })

  const p       = patients.find(pt => pt.patient_no === selected)
  const inPat   = inPatients.find(ip => ip.patient_no === selected)
  const outPat  = outPatients.find(op => op.patient_no === selected)
  const kin     = nextOfKin.filter(k => k.patient_no === selected)
  const appts   = appointments.filter(a => a.patient_no === selected)
  const referal = referrals.find(r => r.patient_no === selected)
  const doctor  = referal ? localDoctors.find(d => d.clinic_no === referal.clinic_no) : null

  const getStatus = (pat) => {
    const isIn  = inPatients.some(ip => ip.patient_no === pat.patient_no && !ip.actual_leave_date)
    const isOut = outPatients.some(op => op.patient_no === pat.patient_no)
    if (isIn)  return { label: "In-Patient",  cls: "teal" }
    if (isOut) return { label: "Out-Patient", cls: "amber" }
    return { label: "Registered", cls: "gray" }
  }

  return (
    <div className="page">
      <div className="page__head">
        <div>
          <div className="page__title">Patient Management</div>
          <div className="page__subtitle">{patients.length} registered · {inPatients.filter(ip => !ip.actual_leave_date).length} currently admitted</div>
        </div>
      </div>

      <div className="stats" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <div className="stat stat--blue"><div className="stat__label">Registered</div><div className="stat__value">{patients.length}</div></div>
        <div className="stat stat--teal"><div className="stat__label">In-Patients</div><div className="stat__value">{inPatients.filter(ip => !ip.actual_leave_date).length}</div></div>
        <div className="stat stat--amber"><div className="stat__label">Out-Patients</div><div className="stat__value">{outPatients.length}</div></div>
        <div className="stat stat--purple"><div className="stat__label">Appointments</div><div className="stat__value">{appointments.length}</div></div>
      </div>

      <div className="grid-2">

        <div className="card">
          <div className="card__header">
            <div className="card__title">Patient Registry</div>
            <div style={{ display: "flex", gap: 6 }}>
              {[
                { id: "all", label: "All" },
                { id: "in",  label: "In-Patients" },
                { id: "out", label: "Out-Patients" },
              ].map(v => (
                <button key={v.id} className={`btn btn--sm ${view === v.id ? "btn--primary" : "btn--ghost"}`} onClick={() => setView(v.id)}>
                  {v.label}
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
                    <tr key={pt.patient_no} className={selected === pt.patient_no ? "selected" : ""} style={{ cursor: "pointer" }} onClick={() => { setSelect(pt.patient_no); setTab("details") }}>
                      <td className="mono">P{pt.patient_no}</td>
                      <td className="name">{pt.first_name} {pt.last_name}</td>
                      <td><span className={`badge badge--${pt.sex === "Female" ? "purple" : "blue"}`}>{pt.sex}</span></td>
                      <td className="mono">{pt.date_of_birth}</td>
                      <td><span className={`badge badge--${status.cls}`}>{status.label}</span></td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={5}><div className="empty"><div className="empty__text">No patients found.</div></div></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {p ? (
          <div className="card">
            <div className="card__header">
              <div>
                <div className="card__title">{p.first_name} {p.last_name}</div>
                <div className="card__subtitle">P{p.patient_no} · Registered {p.date_registered}</div>
              </div>
              <span className={`badge badge--${getStatus(p).cls}`}>{getStatus(p).label}</span>
            </div>

            <div style={{ padding: "0 20px" }}>
              <div className="tabs">
                {[
                  { id: "details",      label: "Details" },
                  { id: "admission",    label: "Admission" },
                  { id: "nextofkin",    label: "Next of Kin" },
                  { id: "appointments", label: "Appointments" },
                ].map(t => (
                  <button key={t.id} className={`tabs__btn${tab === t.id ? " active" : ""}`} onClick={() => setTab(t.id)}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {tab === "details" && (
              <div className="card__body">
                <div className="detail-grid">
                  <div><div className="detail__label">Patient no.</div><div className="detail__value mono">P{p.patient_no}</div></div>
                  <div><div className="detail__label">Marital status</div><div className="detail__value">{p.marital_status}</div></div>
                  <div><div className="detail__label">Sex</div><div className="detail__value">{p.sex}</div></div>
                  <div><div className="detail__label">Date of birth</div><div className="detail__value">{p.date_of_birth}</div></div>
                  <div className="span-2"><div className="detail__label">Address</div><div className="detail__value">{p.address}</div></div>
                  <div><div className="detail__label">Telephone</div><div className="detail__value">{p.tel_no}</div></div>
                  <div><div className="detail__label">Date registered</div><div className="detail__value">{p.date_registered}</div></div>
                  {doctor && (
                    <div className="span-2" style={{ borderTop: "1px solid var(--border)", paddingTop: 14, marginTop: 4 }}>
                      <div className="detail__label">Local doctor</div>
                      <div className="detail__value">{doctor.full_name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>{doctor.address} · {doctor.tel_no}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {tab === "admission" && (
              <div className="card__body">
                {inPat ? (
                  <div className="detail-grid">
                    <div><div className="detail__label">Ward</div><div className="detail__value">Ward {inPat.ward_no} — {wards.find(w => w.ward_no === inPat.ward_no)?.ward_name}</div></div>
                    <div><div className="detail__label">Bed no.</div><div className="detail__value mono">{inPat.bed_no}</div></div>
                    <div><div className="detail__label">Waiting list date</div><div className="detail__value">{inPat.waiting_list_date}</div></div>
                    <div><div className="detail__label">Date placed</div><div className="detail__value">{inPat.date_placed}</div></div>
                    <div><div className="detail__label">Expected leave</div><div className="detail__value">{inPat.expected_leave_date}</div></div>
                    <div><div className="detail__label">Actual leave</div><div className="detail__value">{inPat.actual_leave_date ?? "Still admitted"}</div></div>
                    <div><div className="detail__label">Expected stay</div><div className="detail__value">{inPat.expected_stay_date} days</div></div>
                    <div><div className="detail__label">Status</div>
                      <span className={`badge badge--${inPat.actual_leave_date ? "green" : "teal"}`}>
                        {inPat.actual_leave_date ? "Discharged" : "Admitted"}
                      </span>
                    </div>
                  </div>
                ) : outPat ? (
                  <div className="detail-grid">
                    <div><div className="detail__label">Type</div><span className="badge badge--amber">Out-Patient</span></div>
                    <div><div className="detail__label">Appointment date</div><div className="detail__value">{outPat.appt_date}</div></div>
                    <div><div className="detail__label">Appointment time</div><div className="detail__value">{outPat.appt_time}</div></div>
                  </div>
                ) : (
                  <div className="empty"><div className="empty__text">No admission record for this patient.</div></div>
                )}
              </div>
            )}

            {tab === "nextofkin" && (
              <div className="table-wrap">
                <table className="table">
                  <thead><tr><th>Full name</th><th>Relationship</th><th>Address</th><th>Tel. no.</th></tr></thead>
                  <tbody>
                    {kin.length > 0 ? kin.map(k => (
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

            {tab === "appointments" && (
              <div className="table-wrap">
                <table className="table">
                  <thead><tr><th>No.</th><th>Date</th><th>Time</th><th>Room</th><th>Consultant</th><th>Outcome</th></tr></thead>
                  <tbody>
                    {appts.length > 0 ? appts.map(a => {
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
    </div>
  )
}

export default Patients