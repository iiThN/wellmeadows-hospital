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

const EMPTY_SUPPLIER = { supplier_no: "", supplier_name: "", address: "", tel_no: "", fax_no: "" }
const EMPTY_REQ_ITEM = { item_type: "Pharmaceutical", drug_no: "", item_no: "", qty_required: "", cost_per_unit: "" }

function Supplies({ accessLevel = "full" }) {
  const { currentUser } = useAuth()

  const [surgicalSupplies, setSurgical] = useState([])
  const [pharmaSupplies, setPharma]     = useState([])
  const [suppliers, setSuppliers]       = useState([])
  const [requisitions, setRequisitions] = useState([])
  const [requisitionItems, setReqItems] = useState([])
  const [staff, setStaff]               = useState([])
  const [wards, setWards]               = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)

  // UI state
  const [tab, setTab]            = useState("surgical")
  const [search, setSearch]      = useState("")
  const [selectedReq, setSelReq] = useState(null)

  // Report filter
  const [reportWard, setReportWard] = useState("")

  // Supplier modal
  const [supplierModal, setSupplierModal]   = useState(null) // null | "add" | "edit"
  const [supplierForm, setSupplierForm]     = useState(EMPTY_SUPPLIER)
  const [supplierTarget, setSupplierTarget] = useState(null)

  // Requisition modal
  const [showReqModal, setShowReqModal] = useState(false)
  const [reqWard, setReqWard]           = useState("")
  const [reqItems, setReqItems_]        = useState([{ ...EMPTY_REQ_ITEM }])

  const [saving, setSaving]       = useState(false)
  const [formError, setFormError] = useState("")

  const isViewOnly = accessLevel === "view"
  const isMedDir   = currentUser?.role === "medical_director"
  const isChNurse  = currentUser?.role === "charge_nurse"

  // ── Load ──────────────────────────────────────────────────────────────────
  async function loadData() {
    try {
      const results = await Promise.all([
        supabase.from("surgical_supply").select("*"),
        supabase.from("pharmaceutical_supply").select("*"),
        supabase.from("supplier").select("*").order("supplier_no"),
        supabase.from("requisition").select("*").order("requisition_no", { ascending: false }),
        supabase.from("requisition_item").select("*"),
        supabase.from("staff").select("staff_no, first_name, last_name, ward_no"),
        supabase.from("ward").select("*"),
      ])

      const err = results.find(r => r.error)?.error
      if (err) throw err

      const [surg, pharma, supp, reqs, reqIt, stff, wrd] = results.map(r => r.data)

      setSurgical(surg)
      setPharma(pharma)
      setSuppliers(supp)
      setRequisitions(reqs)
      setReqItems(reqIt)
      setStaff(stff)
      setWards(wrd)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  // ── Derived ───────────────────────────────────────────────────────────────
  const selectedReqData  = requisitions.find(r => r.requisition_no === selectedReq)
  const selectedReqItems = requisitionItems.filter(i => i.requisition_no === selectedReq)
  const selectedReqTotal = selectedReqItems.reduce((a, i) => a + i.qty_required * i.cost_per_unit, 0)
  const pendingCount     = requisitions.filter(r => !r.delivered_date).length

  // Ward supply report summary
  const wardRequisitions = reportWard
    ? requisitions.filter(r => r.ward_no === parseInt(reportWard))
    : []

  const wardItems = wardRequisitions.flatMap(r =>
    requisitionItems.filter(i => i.requisition_no === r.requisition_no)
  )

  const totalItems = wardItems.reduce((sum, i) => sum + (Number(i.qty_required) || 0), 0)

  const totalCost = wardItems.reduce(
    (sum, i) => sum + ((Number(i.qty_required) || 0) * (Number(i.cost_per_unit) || 0)),
    0
  )

  const deliveredCountWard = wardRequisitions.filter(r => r.delivered_date).length
  const pendingCountWard   = wardRequisitions.length - deliveredCountWard

  const filteredSurgical = surgicalSupplies.filter(
    s =>
      s.item_name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
  )

  const filteredSuppliers = suppliers.filter(
    s => s.supplier_name.toLowerCase().includes(search.toLowerCase())
  )

  const filteredReqs = requisitions.filter(r => {
    const s = staff.find(st => st.staff_no === r.staff_no)
    const w = wards.find(wd => wd.ward_no === r.ward_no)

    return (
      String(r.requisition_no).includes(search) ||
      (s && `${s.first_name} ${s.last_name}`.toLowerCase().includes(search.toLowerCase())) ||
      (w && w.ward_name.toLowerCase().includes(search.toLowerCase()))
    )
  })

  // ── Supplier CRUD (l) ─────────────────────────────────────────────────────
  const openAddSupplier = () => {
    setSupplierForm(EMPTY_SUPPLIER)
    setSupplierTarget(null)
    setFormError("")
    setSupplierModal("add")
  }

  const openEditSupplier = (s) => {
    setSupplierForm({
      supplier_no: s.supplier_no,
      supplier_name: s.supplier_name,
      address: s.address,
      tel_no: s.tel_no,
      fax_no: s.fax_no,
    })
    setSupplierTarget(s)
    setFormError("")
    setSupplierModal("edit")
  }

  const handleSaveSupplier = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError("")

    try {
      if (!supplierForm.supplier_name.trim()) throw new Error("Supplier name is required.")

      if (supplierModal === "add") {
        if (!supplierForm.supplier_no) throw new Error("Supplier number is required.")

        const { error } = await supabase.from("supplier").insert({
          supplier_no:   parseInt(supplierForm.supplier_no),
          supplier_name: supplierForm.supplier_name.trim(),
          address:       supplierForm.address.trim(),
          tel_no:        supplierForm.tel_no.trim(),
          fax_no:        supplierForm.fax_no.trim(),
        })
        if (error) throw error
      } else {
        const { error } = await supabase.from("supplier").update({
          supplier_name: supplierForm.supplier_name.trim(),
          address:       supplierForm.address.trim(),
          tel_no:        supplierForm.tel_no.trim(),
          fax_no:        supplierForm.fax_no.trim(),
        }).eq("supplier_no", supplierTarget.supplier_no)

        if (error) throw error
      }

      setSupplierModal(null)
      await loadData()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // ── Requisition CRUD (m) ──────────────────────────────────────────────────
  const openAddReq = () => {
    setReqWard(currentUser?.ward_no ? String(currentUser.ward_no) : "")
    setReqItems_([{ ...EMPTY_REQ_ITEM }])
    setFormError("")
    setShowReqModal(true)
  }

  const addReqItem = () => setReqItems_(items => [...items, { ...EMPTY_REQ_ITEM }])

  const removeReqItem = (i) =>
    setReqItems_(items => items.filter((_, idx) => idx !== i))

  const updateReqItem = (i, field, val) =>
    setReqItems_(items =>
      items.map((row, idx) => idx === i ? { ...row, [field]: val } : row)
    )

  // Auto-fill cost when drug/item selected
  const autoFillCost = (i, type, id) => {
    if (type === "Pharmaceutical") {
      const drug = pharmaSupplies.find(d => d.drug_no === parseInt(id))
      if (drug) updateReqItem(i, "cost_per_unit", drug.cost_per_unit)
    } else {
      const item = surgicalSupplies.find(s => s.item_no === parseInt(id))
      if (item) updateReqItem(i, "cost_per_unit", item.cost_per_unit)
    }
  }

  const handleSaveReq = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError("")

    try {
      if (!reqWard) throw new Error("Ward is required.")

      const validItems = reqItems.filter(i => i.qty_required && (i.drug_no || i.item_no))
      if (validItems.length === 0) throw new Error("Add at least one item.")

      const reqNo = Date.now()

      const { error: reqErr } = await supabase.from("requisition").insert({
        requisition_no: reqNo,
        ward_no:        parseInt(reqWard),
        staff_no:       currentUser.staff_no,
        order_date:     new Date().toISOString().split("T")[0],
        delivered_date: null,
        signed_by:      currentUser.staff_no,
      })
      if (reqErr) throw reqErr

      const { error: itemsErr } = await supabase.from("requisition_item").insert(
        validItems.map(item => ({
          requisition_no: reqNo,
          item_type:      item.item_type,
          drug_no:        item.item_type === "Pharmaceutical" ? parseInt(item.drug_no) : null,
          item_no:        item.item_type === "Surgical" ? parseInt(item.item_no) : null,
          qty_required:   parseInt(item.qty_required),
          cost_per_unit:  parseFloat(item.cost_per_unit),
        }))
      )
      if (itemsErr) throw itemsErr

      setShowReqModal(false)
      await loadData()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // ── Mark delivered ────────────────────────────────────────────────────────
  const markDelivered = async (reqNo) => {
    await supabase
      .from("requisition")
      .update({ delivered_date: new Date().toISOString().split("T")[0] })
      .eq("requisition_no", reqNo)

    await loadData()
  }

  if (loading) {
    return (
      <div className="page">
        <div className="empty">
          <div className="empty__icon">⏳</div>
          <div className="empty__text">Loading supplies data…</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page">
        <div className="alert alert--red">
          <span>⚠️</span>
          <span><strong>Error: </strong>{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page__head">
        <div>
          <div className="page__title">Supplies & Requisitions</div>
          <div className="page__subtitle">
            {surgicalSupplies.length} surgical · {pharmaSupplies.length} pharmaceutical · {suppliers.length} suppliers
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {isChNurse && <button className="btn btn--primary" onClick={openAddReq}>+ New requisition</button>}
          {isMedDir && <button className="btn btn--primary" onClick={openAddSupplier}>+ Add supplier</button>}
        </div>
      </div>

      {/* Stats */}
      <div className="stats" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <div className="stat stat--teal">
          <div className="stat__label">Surgical items</div>
          <div className="stat__value">{surgicalSupplies.length}</div>
        </div>
        <div className="stat stat--blue">
          <div className="stat__label">Pharmaceutical</div>
          <div className="stat__value">{pharmaSupplies.length}</div>
        </div>
        <div className="stat stat--purple">
          <div className="stat__label">Suppliers</div>
          <div className="stat__value">{suppliers.length}</div>
        </div>
        <div className="stat stat--amber">
          <div className="stat__label">Pending delivery</div>
          <div className="stat__value">{pendingCount}</div>
        </div>
      </div>

      {/* ── Ward supply report ── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card__header">
          <div>
            <div className="card__title">Supplies by ward report</div>
            <div className="card__subtitle">Ward-based summary of supplied requisitions</div>
          </div>
        </div>

        <div className="card__body" style={{ paddingBottom: reportWard ? 0 : 20 }}>
          <div className="toolbar">
            <select
              style={{ ...selectStyle, maxWidth: 280 }}
              value={reportWard}
              onChange={e => setReportWard(e.target.value)}
            >
              <option value="">— Select a ward —</option>
              {wards.map(w => (
                <option key={w.ward_no} value={w.ward_no}>
                  Ward {w.ward_no} — {w.ward_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {reportWard && (
          <>
            <div
              style={{
                padding: "14px 20px",
                background: "var(--blue-50)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <strong>
                Ward {reportWard} — {wards.find(w => w.ward_no === parseInt(reportWard))?.ward_name}
              </strong>
            </div>

            <div className="stats" style={{ gridTemplateColumns: "repeat(4, 1fr)", padding: 20 }}>
              <div className="stat stat--blue">
                <div className="stat__label">Requisitions</div>
                <div className="stat__value">{wardRequisitions.length}</div>
              </div>

              <div className="stat stat--purple">
                <div className="stat__label">Items requested</div>
                <div className="stat__value">{totalItems}</div>
              </div>

              <div className="stat stat--amber">
                <div className="stat__label">Pending</div>
                <div className="stat__value">{pendingCountWard}</div>
              </div>

              <div className="stat stat--green">
                <div className="stat__label">Delivered</div>
                <div className="stat__value">{deliveredCountWard}</div>
              </div>
            </div>

            <div
              style={{
                padding: "0 20px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ fontSize: 13, color: "var(--text-2)" }}>
                Estimated total: <strong>£{totalCost.toFixed(2)}</strong>
              </div>

              <button
                className="btn btn--primary btn--sm"
                onClick={() => {
                  setTab("requisitions")
                  setSearch("")
                }}
              >
                View requisitions →
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── Main tabs ── */}
      <div className={tab === "requisitions" ? "grid-2" : ""} style={{ alignItems: "start" }}>
        <div className="card">
          <div className="card__header">
            <div className="tabs" style={{ borderBottom: "none", marginBottom: 0 }}>
              {[
                { id: "surgical", label: "Surgical" },
                { id: "suppliers", label: "Suppliers" },
                { id: "requisitions", label: "Requisitions" },
              ].map(t => (
                <button
                  key={t.id}
                  className={`tabs__btn${tab === t.id ? " active" : ""}`}
                  onClick={() => {
                    setTab(t.id)
                    setSearch("")
                    setSelReq(null)
                  }}
                >
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

          {/* Surgical */}
          {tab === "surgical" && (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Item no.</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>In stock</th>
                    <th>Reorder</th>
                    <th>Cost / unit</th>
                  </tr>
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
                      <td>£{Number(s.cost_per_unit).toFixed(2)}</td>
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
                  <tr>
                    <th>No.</th>
                    <th>Name</th>
                    <th>Address</th>
                    <th>Tel.</th>
                    <th>Fax</th>
                    {isMedDir && <th></th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredSuppliers.map(s => (
                    <tr key={s.supplier_no}>
                      <td className="mono">{s.supplier_no}</td>
                      <td className="name">{s.supplier_name}</td>
                      <td style={{ fontSize: 12 }}>{s.address}</td>
                      <td className="mono">{s.tel_no}</td>
                      <td className="mono">{s.fax_no}</td>
                      {isMedDir && (
                        <td>
                          <button className="btn btn--ghost btn--sm" onClick={() => openEditSupplier(s)}>
                            Edit
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                  {filteredSuppliers.length === 0 && (
                    <tr>
                      <td colSpan={isMedDir ? 6 : 5}>
                        <div className="empty">
                          <div className="empty__text">No suppliers found.</div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Requisitions list */}
          {tab === "requisitions" && (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Req. no.</th>
                    <th>Ward</th>
                    <th>Placed by</th>
                    <th>Order date</th>
                    <th>Delivered</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReqs.map(r => {
                    const s = staff.find(st => st.staff_no === r.staff_no)
                    const w = wards.find(wd => wd.ward_no === r.ward_no)

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
                  {filteredReqs.length === 0 && (
                    <tr>
                      <td colSpan={6}>
                        <div className="empty">
                          <div className="empty__text">No requisitions found.</div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Requisition detail */}
        {tab === "requisitions" && (
          selectedReq && selectedReqData ? (
            <div className="card">
              <div className="card__header">
                <div>
                  <div className="card__title">Requisition #{selectedReqData.requisition_no}</div>
                  <div className="card__subtitle">
                    Ward {selectedReqData.ward_no} · {selectedReqData.order_date}
                    {selectedReqData.signed_by && ` · Signed: ${selectedReqData.signed_by}`}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span className={`badge badge--${selectedReqData.delivered_date ? "green" : "amber"}`}>
                    {selectedReqData.delivered_date ? "Delivered" : "Pending"}
                  </span>
                  {!selectedReqData.delivered_date && isChNurse && (
                    <button
                      className="btn btn--ghost btn--sm"
                      style={{ color: "var(--green-600)" }}
                      onClick={() => markDelivered(selectedReqData.requisition_no)}
                    >
                      ✓ Mark delivered
                    </button>
                  )}
                </div>
              </div>

              <div
                style={{
                  padding: "10px 20px 4px",
                  fontSize: 10.5,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.7px",
                  color: "var(--text-3)",
                }}
              >
                Items ordered
              </div>

              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Item / Drug</th>
                      <th>Qty</th>
                      <th>Cost / unit</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedReqItems.map(item => {
                      const drug = pharmaSupplies.find(d => d.drug_no === item.drug_no)
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
                          <td>£{Number(item.cost_per_unit).toFixed(2)}</td>
                          <td>£{(item.qty_required * item.cost_per_unit).toFixed(2)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div
                style={{
                  padding: "12px 20px",
                  borderTop: "1px solid var(--border)",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 13, color: "var(--text-3)" }}>Total:</span>
                <span style={{ fontWeight: 600, fontSize: 15, fontFamily: "var(--font-mono)" }}>
                  £{selectedReqTotal.toFixed(2)}
                </span>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="empty">
                <div className="empty__icon">📦</div>
                <div className="empty__text">Select a requisition to view its items.</div>
              </div>
            </div>
          )
        )}
      </div>

      {/* ══ SUPPLIER MODAL (l) ══ */}
      {supplierModal && (
        <div className="modal-overlay" onClick={() => setSupplierModal(null)}>
          <div className="modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <div className="modal__title">
                {supplierModal === "add" ? "Add supplier" : `Edit — ${supplierTarget?.supplier_name}`}
              </div>
              <button className="modal__close" onClick={() => setSupplierModal(null)}>×</button>
            </div>

            <form className="modal__body" onSubmit={handleSaveSupplier}>
              {formError && (
                <div className="alert alert--red" style={{ marginBottom: 16 }}>
                  <span>⚠️</span>
                  <span>{formError}</span>
                </div>
              )}

              {supplierModal === "add" && (
                <Field label="Supplier number" required>
                  <input
                    type="number"
                    style={inputStyle}
                    placeholder="e.g. 3004"
                    value={supplierForm.supplier_no}
                    onChange={e => setSupplierForm(f => ({ ...f, supplier_no: e.target.value }))}
                  />
                </Field>
              )}

              <Field label="Supplier name" required>
                <input
                  style={inputStyle}
                  placeholder="Company name"
                  value={supplierForm.supplier_name}
                  onChange={e => setSupplierForm(f => ({ ...f, supplier_name: e.target.value }))}
                />
              </Field>

              <Field label="Address">
                <input
                  style={inputStyle}
                  placeholder="Full address"
                  value={supplierForm.address}
                  onChange={e => setSupplierForm(f => ({ ...f, address: e.target.value }))}
                />
              </Field>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                <Field label="Tel. no.">
                  <input
                    style={inputStyle}
                    placeholder="Telephone"
                    value={supplierForm.tel_no}
                    onChange={e => setSupplierForm(f => ({ ...f, tel_no: e.target.value }))}
                  />
                </Field>
                <Field label="Fax no.">
                  <input
                    style={inputStyle}
                    placeholder="Fax"
                    value={supplierForm.fax_no}
                    onChange={e => setSupplierForm(f => ({ ...f, fax_no: e.target.value }))}
                  />
                </Field>
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                <button type="button" className="btn btn--ghost" onClick={() => setSupplierModal(null)}>Cancel</button>
                <button type="submit" className="btn btn--primary" disabled={saving}>
                  {saving ? "Saving…" : supplierModal === "add" ? "Add supplier" : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ REQUISITION MODAL (m) ══ */}
      {showReqModal && (
        <div className="modal-overlay" onClick={() => setShowReqModal(false)}>
          <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <div className="modal__title">New requisition</div>
              <button className="modal__close" onClick={() => setShowReqModal(false)}>×</button>
            </div>

            <form className="modal__body" onSubmit={handleSaveReq}>
              {formError && (
                <div className="alert alert--red" style={{ marginBottom: 16 }}>
                  <span>⚠️</span>
                  <span>{formError}</span>
                </div>
              )}

              <Field label="Ward" required>
                <select style={selectStyle} value={reqWard} onChange={e => setReqWard(e.target.value)}>
                  <option value="">— Select ward —</option>
                  {wards.map(w => (
                    <option key={w.ward_no} value={w.ward_no}>
                      Ward {w.ward_no} — {w.ward_name}
                    </option>
                  ))}
                </select>
              </Field>

              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  color: "var(--text-2)",
                  marginBottom: 10,
                }}
              >
                Items to order
              </div>

              {reqItems.map((item, i) => (
                <div
                  key={i}
                  style={{
                    padding: 12,
                    background: "var(--gray-50)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border)",
                    marginBottom: 10,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)" }}>
                      Item {i + 1}
                    </div>
                    {reqItems.length > 1 && (
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        style={{ color: "var(--red-600)" }}
                        onClick={() => removeReqItem(i)}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-2)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.4px" }}>
                        Type
                      </div>
                      <select
                        style={selectStyle}
                        value={item.item_type}
                        onChange={e => {
                          updateReqItem(i, "item_type", e.target.value)
                          updateReqItem(i, "drug_no", "")
                          updateReqItem(i, "item_no", "")
                        }}
                      >
                        <option value="Pharmaceutical">Pharma</option>
                        <option value="Surgical">Surgical</option>
                      </select>
                    </div>

                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-2)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.4px" }}>
                        {item.item_type === "Pharmaceutical" ? "Drug" : "Item"}
                      </div>

                      {item.item_type === "Pharmaceutical" ? (
                        <select
                          style={selectStyle}
                          value={item.drug_no}
                          onChange={e => {
                            updateReqItem(i, "drug_no", e.target.value)
                            autoFillCost(i, "Pharmaceutical", e.target.value)
                          }}
                        >
                          <option value="">— Select —</option>
                          {pharmaSupplies.map(d => (
                            <option key={d.drug_no} value={d.drug_no}>
                              {d.drug_name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <select
                          style={selectStyle}
                          value={item.item_no}
                          onChange={e => {
                            updateReqItem(i, "item_no", e.target.value)
                            autoFillCost(i, "Surgical", e.target.value)
                          }}
                        >
                          <option value="">— Select —</option>
                          {surgicalSupplies.map(s => (
                            <option key={s.item_no} value={s.item_no}>
                              {s.item_name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-2)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.4px" }}>
                        Qty
                      </div>
                      <input
                        type="number"
                        style={inputStyle}
                        placeholder="0"
                        value={item.qty_required}
                        onChange={e => updateReqItem(i, "qty_required", e.target.value)}
                      />
                    </div>

                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-2)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.4px" }}>
                        Cost/unit
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        style={inputStyle}
                        placeholder="0.00"
                        value={item.cost_per_unit}
                        onChange={e => updateReqItem(i, "cost_per_unit", e.target.value)}
                      />
                    </div>
                  </div>

                  {item.qty_required && item.cost_per_unit && (
                    <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 6, textAlign: "right" }}>
                      Subtotal: <strong>£{(item.qty_required * item.cost_per_unit).toFixed(2)}</strong>
                    </div>
                  )}
                </div>
              ))}

              <button type="button" className="btn btn--ghost btn--sm" onClick={addReqItem}>
                + Add item
              </button>

              <div
                style={{
                  marginTop: 12,
                  padding: "10px 14px",
                  background: "var(--blue-50)",
                  borderRadius: "var(--radius-sm)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 13, color: "var(--text-2)" }}>Order total:</span>
                <span style={{ fontWeight: 600, fontFamily: "var(--font-mono)" }}>
                  £{reqItems.reduce((a, i) => a + (parseFloat(i.qty_required) || 0) * (parseFloat(i.cost_per_unit) || 0), 0).toFixed(2)}
                </span>
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                <button type="button" className="btn btn--ghost" onClick={() => setShowReqModal(false)}>Cancel</button>
                <button type="submit" className="btn btn--primary" disabled={saving}>
                  {saving ? "Submitting…" : "✓ Submit requisition"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Supplies