import { useState, useEffect } from "react"
import { supabase } from "../data/supabaseClient"

function Medication() {
  const [pharmaSupplies, setPharma] = useState([])
  const [medications, setMeds]      = useState([])
  const [patients, setPatients]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [tab, setTab]               = useState("drugs")
  const [search, setSearch]         = useState("")

  useEffect(() => {
    async function loadData() {
      try {
        const [
          { data: pharmaData, error: e1 },
          { data: medsData,   error: e2 },
          { data: patientsData, error: e3 },
        ] = await Promise.all([
          supabase.from("pharmaceutical_supply").select("*"),
          supabase.from("patient_medication").select("*"),
          supabase.from("patient").select("*"),
        ])

        const err = e1 || e2 || e3
        if (err) throw err

        setPharma(pharmaData)
        setMeds(medsData)
        setPatients(patientsData)
      } catch (err) {
        console.error("Failed to load medication data:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="page">
        <div className="empty">
          <div className="empty__icon">⏳</div>
          <div className="empty__text">Loading medication data from database…</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page">
        <div className="alert alert--red">
          <span>⚠️</span>
          <span><strong>Database error: </strong>{error}</span>
        </div>
      </div>
    )
  }

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

  const stockBadge = (drug) => {
    if (drug.qty_in_stock <= drug.reorder_level)       return "badge--red"
    if (drug.qty_in_stock <= drug.reorder_level * 1.5) return "badge--amber"
    return "badge--green"
  }

  return (
    <div className="page">
      <div className="page__head">
        <div>
          <div className="page__title">Medication & Prescriptions</div>
          <div className="page__subtitle">{pharmaSupplies.length} drugs · {medications.length} prescriptions</div>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="alert alert--red">
          <span>🚨</span>
          <span>
            <strong>Reorder alert: </strong>
            {lowStock.map(d => d.drug_name).join(", ")} are at or below reorder level.
          </span>
        </div>
      )}

      <div className="stats" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <div className="stat stat--blue"><div className="stat__label">Total drugs</div><div className="stat__value">{pharmaSupplies.length}</div></div>
        <div className="stat stat--red"><div className="stat__label">Low stock</div><div className="stat__value">{lowStock.length}</div></div>
        <div className="stat stat--teal"><div className="stat__label">Prescriptions</div><div className="stat__value">{medications.length}</div></div>
        <div className="stat stat--purple">
          <div className="stat__label">Patients medicated</div>
          <div className="stat__value">{[...new Set(medications.map(m => m.patient_no))].length}</div>
        </div>
      </div>

      <div className="card">
        <div className="card__header">
          <div className="tabs" style={{ borderBottom: "none", marginBottom: 0 }}>
            {[
              { id: "drugs",         label: "Drug catalog" },
              { id: "prescriptions", label: "Prescriptions" },
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
                {filteredDrugs.length === 0 && (
                  <tr><td colSpan={8}><div className="empty"><div className="empty__text">No drugs found.</div></div></td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === "prescriptions" && (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Rx ID</th><th>Patient</th><th>Drug</th><th>Units / day</th><th>Admin method</th><th>Start date</th><th>Finish date</th></tr>
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
                      <td className="mono">{m.finish_date}</td>
                    </tr>
                  )
                })}
                {filteredRx.length === 0 && (
                  <tr><td colSpan={7}><div className="empty"><div className="empty__text">No prescriptions found.</div></div></td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Medication
