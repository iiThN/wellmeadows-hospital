import { useState } from "react"
import { wards, staff, inPatients, staffRota } from "../data/mockData"

function Wards() {
  const [selected, setSelected]   = useState(null)
  const [tab, setTab]             = useState("staff")

  const ward        = wards.find(w => w.ward_no === selected)
  const wardStaff   = staff.filter(s => s.ward_no === selected)
  const wardInPats  = inPatients.filter(ip => ip.ward_no === selected && !ip.actual_leave_date)
  const wardRota    = staffRota.filter(r => r.ward_no === selected)
  const chargeNurse = wardStaff.find(s => s.position === "Charge Nurse")

  return (
    <div className="page">
      <div className="page__head">
        <div>
          <div className="page__title">Ward Management</div>
          <div className="page__subtitle">Select a ward to view its staff, patients, and rota.</div>
        </div>
      </div>

      <div className="grid-2">

        {/* Left — ward list */}
        <div className="card">
          <div className="card__header">
            <div className="card__title">All Wards ({wards.length})</div>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Ward name</th>
                  <th>Location</th>
                  <th>Beds</th>
                  <th>Ext.</th>
                </tr>
              </thead>
              <tbody>
                {wards.map(w => {
                  const occupied = inPatients.filter(ip => ip.ward_no === w.ward_no && !ip.actual_leave_date).length
                  return (
                    <tr
                      key={w.ward_no}
                      className={selected === w.ward_no ? "selected" : ""}
                      style={{ cursor: "pointer" }}
                      onClick={() => { setSelected(w.ward_no); setTab("staff") }}
                    >
                      <td className="mono">{w.ward_no}</td>
                      <td className="name">{w.ward_name}</td>
                      <td><span className="badge badge--gray">{w.location}</span></td>
                      <td>
                        <span style={{ fontSize: 12, color: "var(--text-3)" }}>
                          {occupied}/{w.total_beds}
                        </span>
                      </td>
                      <td className="mono">{w.tel_extensions}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right — detail panel */}
        {ward ? (
          <div className="card">
            <div className="card__header">
              <div>
                <div className="card__title">Ward {ward.ward_no} — {ward.ward_name}</div>
                <div className="card__subtitle">
                  {ward.location} · Ext. {ward.tel_extensions} · {ward.total_beds} beds
                  {chargeNurse && ` · CN: ${chargeNurse.first_name} ${chargeNurse.last_name}`}
                </div>
              </div>
              <span className="badge badge--teal">{wardInPats.length} admitted</span>
            </div>

            <div style={{ padding: "0 20px" }}>
              <div className="tabs">
                {[
                  { id: "staff",    label: "Staff" },
                  { id: "patients", label: "In-patients" },
                  { id: "rota",     label: "Rota" },
                ].map(t => (
                  <button
                    key={t.id}
                    className={`tabs__btn${tab === t.id ? " active" : ""}`}
                    onClick={() => setTab(t.id)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Staff tab */}
            {tab === "staff" && (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr><th>No.</th><th>Name</th><th>Position</th><th>Contract</th><th>Hrs/wk</th></tr>
                  </thead>
                  <tbody>
                    {wardStaff.length > 0 ? wardStaff.map(s => (
                      <tr key={s.staff_no}>
                        <td className="mono">{s.staff_no}</td>
                        <td className="name">{s.first_name} {s.last_name}</td>
                        <td>{s.position}</td>
                        <td>
                          <span className={`badge badge--${s.contract_type === "Permanent" ? "green" : "amber"}`}>
                            {s.contract_type}
                          </span>
                        </td>
                        <td>{s.hrs_per_week}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={5}><div className="empty"><div className="empty__text">No staff allocated to this ward.</div></div></td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Patients tab */}
            {tab === "patients" && (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr><th>Patient no.</th><th>Bed</th><th>Date placed</th><th>Exp. leave</th><th>Stay</th></tr>
                  </thead>
                  <tbody>
                    {wardInPats.length > 0 ? wardInPats.map(ip => (
                      <tr key={ip.inpatient_id}>
                        <td className="mono">P{ip.patient_no}</td>
                        <td className="mono">{ip.bed_no}</td>
                        <td className="mono">{ip.date_placed}</td>
                        <td className="mono">{ip.expected_leave_date}</td>
                        <td>{ip.expected_stay_date} days</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={5}><div className="empty"><div className="empty__text">No current in-patients.</div></div></td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Rota tab */}
            {tab === "rota" && (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr><th>Staff no.</th><th>Name</th><th>Week beginning</th><th>Shift</th></tr>
                  </thead>
                  <tbody>
                    {wardRota.length > 0 ? wardRota.map(r => {
                      const s = staff.find(st => st.staff_no === r.staff_no)
                      return (
                        <tr key={r.rota_id}>
                          <td className="mono">{r.staff_no}</td>
                          <td className="name">{s ? `${s.first_name} ${s.last_name}` : r.staff_no}</td>
                          <td className="mono">{r.week_beginning}</td>
                          <td>
                            <span className={`badge badge--${r.shift_type === "Early" ? "teal" : r.shift_type === "Late" ? "amber" : "purple"}`}>
                              {r.shift_type}
                            </span>
                          </td>
                        </tr>
                      )
                    }) : (
                      <tr><td colSpan={4}><div className="empty"><div className="empty__text">No rota data for this ward.</div></div></td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="card">
            <div className="empty">
              <div className="empty__icon">🏥</div>
              <div className="empty__text">Select a ward from the list to view its details.</div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default Wards
