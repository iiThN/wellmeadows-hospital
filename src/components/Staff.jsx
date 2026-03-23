import { useState, useEffect } from "react"
import { supabase } from "../data/supabaseClient"

function Staff({ accessLevel = "full" }) {
  const [staff, setStaff]     = useState([])
  const [wards, setWards]     = useState([])
  const [quals, setQuals]     = useState([])
  const [exp, setExp]         = useState([])
  const [rota, setRota]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [search, setSearch]   = useState("")
  const [filterPos, setPos]   = useState("all")
  const [selected, setSelect] = useState(null)
  const [tab, setTab]         = useState("details")
  const isViewOnly             = accessLevel === "view"

  // Load staff + wards on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [
          { data: staffData, error: e1 },
          { data: wardsData, error: e2 },
        ] = await Promise.all([
          supabase.from("staff").select("*"),
          supabase.from("ward").select("*"),
        ])

        const err = e1 || e2
        if (err) throw err

        setStaff(staffData)
        setWards(wardsData)
      } catch (err) {
        console.error("Failed to load staff data:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Load qualifications, experience, rota when a staff member is selected
  useEffect(() => {
    if (!selected) return

    async function loadDetails() {
      try {
        const [
          { data: qualsData, error: e1 },
          { data: expData,   error: e2 },
          { data: rotaData,  error: e3 },
        ] = await Promise.all([
          supabase.from("staff_qualification").select("*").eq("staff_no", selected),
          supabase.from("staff_experience").select("*").eq("staff_no", selected),
          supabase.from("staff_rota").select("*").eq("staff_no", selected),
        ])

        const err = e1 || e2 || e3
        if (err) throw err

        setQuals(qualsData)
        setExp(expData)
        setRota(rotaData)
      } catch (err) {
        console.error("Failed to load staff details:", err)
      }
    }
    loadDetails()
  }, [selected])

  const positions = [...new Set(staff.map(s => s.position))]

  const filtered = staff.filter(s => {
    const name        = `${s.first_name} ${s.last_name}`.toLowerCase()
    const matchSearch = name.includes(search.toLowerCase()) || s.staff_no.toLowerCase().includes(search.toLowerCase())
    const matchPos    = filterPos === "all" || s.position === filterPos
    return matchSearch && matchPos
  })

  const s    = staff.find(st => st.staff_no === selected)
  const ward = s ? wards.find(w => w.ward_no === s.ward_no) : null

  if (loading) {
    return (
      <div className="page">
        <div className="empty">
          <div className="empty__icon">⏳</div>
          <div className="empty__text">Loading staff data from database…</div>
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

  return (
    <div className="page">
      <div className="page__head">
        <div>
          <div className="page__title">Staff Management</div>
          <div className="page__subtitle">
            {staff.length} staff members · {staff.filter(s => s.contract_type === "Permanent").length} permanent
          </div>
        </div>
      </div>

      {isViewOnly && (
        <div className="alert alert--amber">
          <span>👁️</span>
          <span><strong>View only — </strong>Salary and NIN details are hidden. Contact the Personnel Officer to make changes.</span>
        </div>
      )}

      <div className="grid-2">

        <div className="card">
          <div className="card__header">
            <div className="card__title">Staff Directory</div>
          </div>
          <div className="card__body" style={{ paddingBottom: 0 }}>
            <div className="toolbar mb-16">
              <input
                className="input-search"
                placeholder="Search name or staff no…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <select className="input-select" value={filterPos} onChange={e => setPos(e.target.value)}>
                <option value="all">All positions</option>
                {positions.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>No.</th><th>Name</th><th>Position</th><th>Ward</th><th>Contract</th></tr>
              </thead>
              <tbody>
                {filtered.map(st => {
                  const w = wards.find(w => w.ward_no === st.ward_no)
                  return (
                    <tr
                      key={st.staff_no}
                      className={selected === st.staff_no ? "selected" : ""}
                      style={{ cursor: "pointer" }}
                      onClick={() => { setSelect(st.staff_no); setTab("details") }}
                    >
                      <td className="mono">{st.staff_no}</td>
                      <td className="name">{st.first_name} {st.last_name}</td>
                      <td>{st.position}</td>
                      <td>{w ? <span className="badge badge--gray">{w.ward_name}</span> : <span style={{ color: "var(--text-3)" }}>—</span>}</td>
                      <td>
                        <span className={`badge badge--${st.contract_type === "Permanent" ? "green" : "amber"}`}>
                          {st.contract_type}
                        </span>
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={5}><div className="empty"><div className="empty__text">No staff found.</div></div></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {s ? (
          <div className="card">
            <div className="card__header">
              <div>
                <div className="card__title">{s.first_name} {s.last_name}</div>
                <div className="card__subtitle">{s.staff_no} · {s.position}</div>
              </div>
              <span className={`badge badge--${s.contract_type === "Permanent" ? "green" : "amber"}`}>
                {s.contract_type}
              </span>
            </div>

            <div style={{ padding: "0 20px" }}>
              <div className="tabs">
                {[
                  { id: "details",    label: "Details" },
                  { id: "quals",      label: "Qualifications" },
                  { id: "experience", label: "Experience" },
                  { id: "shifts",     label: "Shifts" },
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
                  <div><div className="detail__label">Staff no.</div><div className="detail__value mono">{s.staff_no}</div></div>
                  <div><div className="detail__label">Sex</div><div className="detail__value">{s.sex}</div></div>
                  <div><div className="detail__label">Date of birth</div><div className="detail__value">{s.date_of_birth}</div></div>
                  <div><div className="detail__label">NIN</div><div className="detail__value mono">{isViewOnly ? "••••••••••" : s.nin}</div></div>
                  <div className="span-2"><div className="detail__label">Address</div><div className="detail__value">{s.address}</div></div>
                  <div><div className="detail__label">Telephone</div><div className="detail__value">{s.tel_no}</div></div>
                  <div><div className="detail__label">Ward</div><div className="detail__value">{ward ? `Ward ${ward.ward_no} — ${ward.ward_name}` : "Not assigned"}</div></div>
                  <div><div className="detail__label">Current salary</div><div className="detail__value">{isViewOnly ? <span style={{ color: "var(--gray-400)" }}>Hidden</span> : `£${Number(s.current_salary).toLocaleString()}`}</div></div>
                  <div><div className="detail__label">Salary scale</div><div className="detail__value">{isViewOnly ? <span style={{ color: "var(--gray-400)" }}>Hidden</span> : s.salary_scale}</div></div>
                  <div><div className="detail__label">Hours / week</div><div className="detail__value">{s.hrs_per_week}</div></div>
                  <div><div className="detail__label">Payment type</div><div className="detail__value">{s.payment_type}</div></div>
                </div>
              </div>
            )}

            {tab === "quals" && (
              <div className="table-wrap">
                <table className="table">
                  <thead><tr><th>Type</th><th>Date</th><th>Institution</th></tr></thead>
                  <tbody>
                    {quals.length > 0 ? quals.map(q => (
                      <tr key={q.qual_id}>
                        <td className="name">{q.qual_type}</td>
                        <td className="mono">{q.qual_date}</td>
                        <td>{q.institution}</td>
                      </tr>
                    )) : <tr><td colSpan={3}><div className="empty"><div className="empty__text">No qualifications recorded.</div></div></td></tr>}
                  </tbody>
                </table>
              </div>
            )}

            {tab === "experience" && (
              <div className="table-wrap">
                <table className="table">
                  <thead><tr><th>Position</th><th>Organization</th><th>Start</th><th>Finish</th></tr></thead>
                  <tbody>
                    {exp.length > 0 ? exp.map(e => (
                      <tr key={e.exp_id}>
                        <td className="name">{e.position}</td>
                        <td>{e.organization}</td>
                        <td className="mono">{e.start_date}</td>
                        <td className="mono">{e.finish_date}</td>
                      </tr>
                    )) : <tr><td colSpan={4}><div className="empty"><div className="empty__text">No experience recorded.</div></div></td></tr>}
                  </tbody>
                </table>
              </div>
            )}

            {tab === "shifts" && (
              <div className="table-wrap">
                <table className="table">
                  <thead><tr><th>Ward</th><th>Week beginning</th><th>Shift</th></tr></thead>
                  <tbody>
                    {rota.length > 0 ? rota.map(r => (
                      <tr key={r.rota_id}>
                        <td>Ward {r.ward_no}</td>
                        <td className="mono">{r.week_beginning}</td>
                        <td>
                          <span className={`badge badge--${r.shift_type === "Early" ? "teal" : r.shift_type === "Late" ? "amber" : "purple"}`}>
                            {r.shift_type}
                          </span>
                        </td>
                      </tr>
                    )) : <tr><td colSpan={3}><div className="empty"><div className="empty__text">No shift data.</div></div></td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="card">
            <div className="empty">
              <div className="empty__icon">👥</div>
              <div className="empty__text">Select a staff member to view their full profile.</div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default Staff
