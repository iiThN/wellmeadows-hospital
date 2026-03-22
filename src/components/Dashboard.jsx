import { wards, staff, patients, inPatients, pharmaceuticalSupplies, requisitions } from "../data/mockData"

function Dashboard({ setActivePage }) {
  const totalBeds    = wards.reduce((a, w) => a + w.total_beds, 0)
  const occupied     = inPatients.filter(ip => !ip.actual_leave_date).length
  const lowStock     = pharmaceuticalSupplies.filter(d => d.qty_in_stock <= d.reorder_level)
  const pendingReqs  = requisitions.filter(r => !r.delivered_date).length

  return (
    <div className="page">
      <div className="page__head">
        <div>
          <div className="page__title">Good morning, Administrator</div>
          <div className="page__subtitle">Overview of Wellmeadows Hospital operations.</div>
        </div>
      </div>

      {/* ── Alert ── */}
      {lowStock.length > 0 && (
        <div className="alert alert--amber">
          <span>⚠️</span>
          <span>
            <strong>Low stock: </strong>
            {lowStock.map(d => d.drug_name).join(", ")} — below reorder level.
          </span>
        </div>
      )}

      {/* ── Stats ── */}
      <div className="stats">
        <div className="stat stat--blue" style={{ cursor: "pointer" }} onClick={() => setActivePage("wards")}>
          <div className="stat__label">Wards</div>
          <div className="stat__value">{wards.length}</div>
          <div className="stat__sub">{totalBeds} total beds</div>
        </div>
        <div className="stat stat--teal" style={{ cursor: "pointer" }} onClick={() => setActivePage("staff")}>
          <div className="stat__label">Staff</div>
          <div className="stat__value">{staff.length}</div>
          <div className="stat__sub">{staff.filter(s => s.contract_type === "Permanent").length} permanent</div>
        </div>
        <div className="stat stat--purple" style={{ cursor: "pointer" }} onClick={() => setActivePage("patients")}>
          <div className="stat__label">Patients</div>
          <div className="stat__value">{patients.length}</div>
          <div className="stat__sub">{occupied} currently admitted</div>
        </div>
        <div className="stat stat--amber">
          <div className="stat__label">Bed Occupancy</div>
          <div className="stat__value">{Math.round((occupied / totalBeds) * 100)}%</div>
          <div className="stat__sub">{occupied} of {totalBeds} beds in use</div>
        </div>
        <div className="stat stat--red" style={{ cursor: "pointer" }} onClick={() => setActivePage("medication")}>
          <div className="stat__label">Low Stock Drugs</div>
          <div className="stat__value">{lowStock.length}</div>
          <div className="stat__sub">need reordering</div>
        </div>
        <div className="stat stat--green" style={{ cursor: "pointer" }} onClick={() => setActivePage("supplies")}>
          <div className="stat__label">Pending Requisitions</div>
          <div className="stat__value">{pendingReqs}</div>
          <div className="stat__sub">awaiting delivery</div>
        </div>
      </div>

      {/* ── Bottom row ── */}
      <div className="grid-2">

        {/* Ward list */}
        <div className="card">
          <div className="card__header">
            <div className="card__title">Ward Overview</div>
            <button className="btn btn--ghost btn--sm" onClick={() => setActivePage("wards")}>View all</button>
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
                {wards.map(w => (
                  <tr key={w.ward_no}>
                    <td className="mono">{w.ward_no}</td>
                    <td className="name">{w.ward_name}</td>
                    <td><span className="badge badge--gray">{w.location}</span></td>
                    <td>{w.total_beds}</td>
                    <td className="mono">{w.tel_extensions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Current in-patients */}
        <div className="card">
          <div className="card__header">
            <div className="card__title">Current In-Patients</div>
            <button className="btn btn--ghost btn--sm" onClick={() => setActivePage("patients")}>View all</button>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Ward</th>
                  <th>Bed</th>
                  <th>Exp. leave</th>
                  <th>Stay</th>
                </tr>
              </thead>
              <tbody>
                {inPatients.filter(ip => !ip.actual_leave_date).map(ip => {
                  const p = patients.find(pt => pt.patient_no === ip.patient_no)
                  return (
                    <tr key={ip.inpatient_id}>
                      <td className="name">{p ? `${p.first_name} ${p.last_name}` : `P${ip.patient_no}`}</td>
                      <td><span className="badge badge--blue">Ward {ip.ward_no}</span></td>
                      <td className="mono">{ip.bed_no}</td>
                      <td className="mono">{ip.expected_leave_date}</td>
                      <td>{ip.expected_stay_date}d</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Dashboard
