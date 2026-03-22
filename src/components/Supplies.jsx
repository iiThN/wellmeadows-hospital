import { useState } from "react"
import { surgicalSupplies, pharmaceuticalSupplies, suppliers, requisitions, requisitionItems, staff, wards } from "../data/mockData"

function Supplies() {
  const [tab, setTab]           = useState("surgical")
  const [search, setSearch]     = useState("")
  const [selectedReq, setSelReq]= useState(null)

  const req      = requisitions.find(r => r.requisition_no === selectedReq)
  const reqItems = requisitionItems.filter(i => i.requisition_no === selectedReq)
  const total    = reqItems.reduce((acc, i) => acc + i.qty_required * i.cost_per_unit, 0)

  const filteredSurgical = surgicalSupplies.filter(s =>
    s.item_name.toLowerCase().includes(search.toLowerCase()) ||
    s.description.toLowerCase().includes(search.toLowerCase())
  )

  const filteredSuppliers = suppliers.filter(s =>
    s.supplier_name.toLowerCase().includes(search.toLowerCase()) ||
    s.address.toLowerCase().includes(search.toLowerCase())
  )

  const filteredReqs = requisitions.filter(r => {
    const s = staff.find(st => st.staff_no === r.staff_no)
    const w = wards.find(w => w.ward_no === r.ward_no)
    return (
      String(r.requisition_no).includes(search) ||
      (s && `${s.first_name} ${s.last_name}`.toLowerCase().includes(search.toLowerCase())) ||
      (w && w.ward_name.toLowerCase().includes(search.toLowerCase()))
    )
  })

  const pendingCount = requisitions.filter(r => !r.delivered_date).length

  return (
    <div className="page">
      <div className="page__head">
        <div>
          <div className="page__title">Supplies & Requisitions</div>
          <div className="page__subtitle">{surgicalSupplies.length} surgical items · {suppliers.length} suppliers · {requisitions.length} requisitions</div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <div className="stat stat--teal"><div className="stat__label">Surgical items</div><div className="stat__value">{surgicalSupplies.length}</div></div>
        <div className="stat stat--blue"><div className="stat__label">Pharmaceutical</div><div className="stat__value">{pharmaceuticalSupplies.length}</div></div>
        <div className="stat stat--purple"><div className="stat__label">Suppliers</div><div className="stat__value">{suppliers.length}</div></div>
        <div className="stat stat--amber"><div className="stat__label">Pending delivery</div><div className="stat__value">{pendingCount}</div></div>
      </div>

      <div className={tab === "requisitions" ? "grid-2" : ""} style={{ alignItems: "start" }}>
        <div className="card">
          <div className="card__header">
            <div className="tabs" style={{ borderBottom: "none", marginBottom: 0 }}>
              {[
                { id: "surgical",     label: "Surgical supplies" },
                { id: "suppliers",    label: "Suppliers" },
                { id: "requisitions", label: "Requisitions" },
              ].map(t => (
                <button key={t.id} className={`tabs__btn${tab === t.id ? " active" : ""}`} onClick={() => { setTab(t.id); setSearch(""); setSelReq(null) }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="card__body" style={{ paddingBottom: 0 }}>
            <div className="toolbar mb-16">
              <input
                className="input-search"
                placeholder="Search…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Surgical supplies */}
          {tab === "surgical" && (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr><th>Item no.</th><th>Name</th><th>Description</th><th>In stock</th><th>Reorder level</th><th>Cost / unit</th></tr>
                </thead>
                <tbody>
                  {filteredSurgical.map(s => (
                    <tr key={s.item_no}>
                      <td className="mono">{s.item_no}</td>
                      <td className="name">{s.item_name}</td>
                      <td>{s.description}</td>
                      <td>
                        <span className={`badge badge--${s.qty_in_stock <= s.reorder_level ? "red" : "green"}`}>
                          {s.qty_in_stock}
                        </span>
                      </td>
                      <td className="mono">{s.reorder_level}</td>
                      <td>£{s.cost_per_unit.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Suppliers */}
          {tab === "suppliers" && (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr><th>Supplier no.</th><th>Name</th><th>Address</th><th>Tel. no.</th><th>Fax no.</th></tr>
                </thead>
                <tbody>
                  {filteredSuppliers.map(s => (
                    <tr key={s.supplier_no}>
                      <td className="mono">{s.supplier_no}</td>
                      <td className="name">{s.supplier_name}</td>
                      <td style={{ fontSize: 12 }}>{s.address}</td>
                      <td className="mono">{s.tel_no}</td>
                      <td className="mono">{s.fax_no}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Requisitions list */}
          {tab === "requisitions" && (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr><th>Req. no.</th><th>Ward</th><th>Placed by</th><th>Order date</th><th>Delivered</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {filteredReqs.map(r => {
                    const s = staff.find(st => st.staff_no === r.staff_no)
                    const w = wards.find(w => w.ward_no === r.ward_no)
                    return (
                      <tr
                        key={r.requisition_no}
                        className={selectedReq === r.requisition_no ? "selected" : ""}
                        style={{ cursor: "pointer" }}
                        onClick={() => setSelReq(selectedReq === r.requisition_no ? null : r.requisition_no)}
                      >
                        <td className="mono">{r.requisition_no}</td>
                        <td>{w ? w.ward_name : `Ward ${r.ward_no}`}</td>
                        <td className="name">{s ? `${s.first_name} ${s.last_name}` : r.staff_no}</td>
                        <td className="mono">{r.order_date}</td>
                        <td className="mono">{r.delivered_date ?? "—"}</td>
                        <td>
                          <span className={`badge badge--${r.delivered_date ? "green" : "amber"}`}>
                            {r.delivered_date ? "Delivered" : "Pending"}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Requisition detail panel */}
        {tab === "requisitions" && (
          selectedReq && req ? (
            <div className="card">
              <div className="card__header">
                <div>
                  <div className="card__title">Requisition #{req.requisition_no}</div>
                  <div className="card__subtitle">
                    Ward {req.ward_no} · {req.order_date}
                    {req.signed_by && ` · Signed: ${req.signed_by}`}
                  </div>
                </div>
                <span className={`badge badge--${req.delivered_date ? "green" : "amber"}`}>
                  {req.delivered_date ? "Delivered" : "Pending"}
                </span>
              </div>

              <div style={{ padding: "12px 20px 4px", fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.7px", color: "var(--text-3)" }}>
                Items ordered
              </div>

              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr><th>Type</th><th>Item / Drug</th><th>Qty</th><th>Cost / unit</th><th>Subtotal</th></tr>
                  </thead>
                  <tbody>
                    {reqItems.map(item => {
                      const drug = pharmaceuticalSupplies.find(d => d.drug_no === item.drug_no)
                      const surg = surgicalSupplies.find(s => s.item_no === item.item_no)
                      const name = drug ? drug.drug_name : surg ? surg.item_name : "Unknown"
                      return (
                        <tr key={item.req_item_id}>
                          <td>
                            <span className={`badge badge--${item.item_type === "Pharmaceutical" ? "purple" : "teal"}`}>
                              {item.item_type}
                            </span>
                          </td>
                          <td className="name">{name}</td>
                          <td>{item.qty_required}</td>
                          <td>£{item.cost_per_unit.toFixed(2)}</td>
                          <td>£{(item.qty_required * item.cost_per_unit).toFixed(2)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "var(--text-3)" }}>Total order cost:</span>
                <span style={{ fontWeight: 600, fontSize: 15, fontFamily: "var(--font-mono)" }}>£{total.toFixed(2)}</span>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="empty">
                <div className="empty__icon">📦</div>
                <div className="empty__text">Select a requisition to view its items and total cost.</div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  )
}

export default Supplies
