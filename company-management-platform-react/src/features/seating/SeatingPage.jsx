import { useState, useEffect, useRef } from "react";
import Header from "../../components/layout/Header";
import Avatar from "../../components/ui/Avatar";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { supabase } from "../../lib/supabase";

export default function SeatingPage() {
  const [view, setView] = useState("zone");

  return (
    <>
      <Header title="Seating Plan" />
      <div className="page-content">
        {/* View Switcher */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "var(--gray-100)", borderRadius: 10, padding: 4, width: "fit-content" }}>
          <button onClick={() => setView("zone")} style={{ padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, transition: "all 0.2s", background: view === "zone" ? "#fff" : "transparent", color: view === "zone" ? "var(--primary)" : "var(--gray-500)", boxShadow: view === "zone" ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}>
            <i className="fas fa-th-list" style={{ marginRight: 6 }} />Zone & Desk View
          </button>
          <button onClick={() => setView("floor")} style={{ padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, transition: "all 0.2s", background: view === "floor" ? "#fff" : "transparent", color: view === "floor" ? "var(--primary)" : "var(--gray-500)", boxShadow: view === "floor" ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}>
            <i className="fas fa-map" style={{ marginRight: 6 }} />Floor Plan View
          </button>
        </div>

        {view === "zone" ? <ZoneDeskView /> : <FloorPlanView />}
      </div>
    </>
  );
}

// ============ ZONE & DESK VIEW ============
function ZoneDeskView() {
  const { employees } = useData();
  const { user } = useAuth();
  const isAdmin = user?.isAdmin;
  const [zones, setZones] = useState([]);
  const [desks, setDesks] = useState([]);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [showDeskModal, setShowDeskModal] = useState(false);
  const [zoneForm, setZoneForm] = useState({ name: "", floor: "", description: "", capacity: 10 });
  const [deskForm, setDeskForm] = useState({ zone_id: "", desk_number: "", employee_id: "" });
  const [editingZone, setEditingZone] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    const { data: z } = await supabase.from("office_zones").select("*").order("name");
    const { data: d } = await supabase.from("office_desks").select("*").order("desk_number");
    if (z) setZones(z);
    if (d) setDesks(d);
  }

  async function saveZone(e) {
    e.preventDefault();
    if (editingZone) { await supabase.from("office_zones").update(zoneForm).eq("id", editingZone); }
    else { await supabase.from("office_zones").insert(zoneForm); }
    setShowZoneModal(false); setEditingZone(null); fetchAll();
  }

  async function deleteZone(id) { await supabase.from("office_desks").delete().eq("zone_id", id); await supabase.from("office_zones").delete().eq("id", id); fetchAll(); }

  async function saveDesk(e) {
    e.preventDefault();
    await supabase.from("office_desks").insert({ zone_id: Number(deskForm.zone_id), desk_number: deskForm.desk_number, employee_id: deskForm.employee_id ? Number(deskForm.employee_id) : null, status: deskForm.employee_id ? "occupied" : "available" });
    setShowDeskModal(false); setDeskForm({ zone_id: "", desk_number: "", employee_id: "" }); fetchAll();
  }

  async function assignDesk(deskId, empId) {
    await supabase.from("office_desks").update({ employee_id: empId ? Number(empId) : null, status: empId ? "occupied" : "available" }).eq("id", deskId);
    fetchAll();
  }

  async function deleteDesk(id) { await supabase.from("office_desks").delete().eq("id", id); fetchAll(); }

  const myDesk = desks.find((d) => d.employee_id === user?.id);
  const myZone = myDesk ? zones.find((z) => z.id === myDesk.zone_id) : null;

  return (
    <>
      {/* My Seat */}
      <div className="card" style={{ marginBottom: 20, padding: 20, background: myDesk ? "var(--primary-bg)" : "var(--gray-50)", border: myDesk ? "1px solid var(--primary)" : "1px solid var(--gray-200)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: myDesk ? "var(--primary)" : "var(--gray-200)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="fas fa-chair" style={{ color: "#fff", fontSize: "1.2rem" }} />
          </div>
          <div>
            <div style={{ fontSize: "0.78rem", color: "var(--gray-500)" }}>Your Seat</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--gray-900)" }}>{myDesk ? `${myZone?.name || "Zone"} — Desk ${myDesk.desk_number}` : "No seat assigned yet"}</div>
            {myZone && <div style={{ fontSize: "0.78rem", color: "var(--gray-500)" }}>{myZone.floor || ""} {myZone.description ? `· ${myZone.description}` : ""}</div>}
          </div>
        </div>
      </div>

      {/* Zones */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Office Zones</h2>
        {isAdmin && (
          <div className="flex gap-2">
            <button className="btn btn-outline btn-sm" onClick={() => { setDeskForm({ zone_id: zones[0]?.id ? String(zones[0].id) : "", desk_number: "", employee_id: "" }); setShowDeskModal(true); }}><i className="fas fa-plus" /> Add Desk</button>
            <button className="btn btn-primary btn-sm" onClick={() => { setEditingZone(null); setZoneForm({ name: "", floor: "", description: "", capacity: 10 }); setShowZoneModal(true); }}><i className="fas fa-plus" /> Add Zone</button>
          </div>
        )}
      </div>

      {zones.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 40 }}><i className="fas fa-map-marker-alt" style={{ fontSize: "2.5rem", color: "var(--gray-300)", marginBottom: 12 }} /><p style={{ color: "var(--gray-500)" }}>No zones created yet. {isAdmin ? "Create your first zone to start." : "Contact admin."}</p></div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {zones.map((zone) => {
            const zoneDesks = desks.filter((d) => d.zone_id === zone.id);
            const occupied = zoneDesks.filter((d) => d.employee_id).length;
            return (
              <div key={zone.id} className="card">
                <div className="card-header">
                  <div>
                    <h2 style={{ margin: 0 }}><i className="fas fa-map-pin" style={{ marginRight: 8, color: "var(--primary)" }} />{zone.name}</h2>
                    <div style={{ fontSize: "0.78rem", color: "var(--gray-500)", marginTop: 2 }}>{zone.floor}{zone.description ? ` · ${zone.description}` : ""} · {occupied}/{zoneDesks.length} occupied</div>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-1">
                      <button className="btn btn-outline btn-sm" onClick={() => { setEditingZone(zone.id); setZoneForm({ name: zone.name, floor: zone.floor || "", description: zone.description || "", capacity: zone.capacity }); setShowZoneModal(true); }}><i className="fas fa-edit" /></button>
                      <button className="btn btn-outline btn-sm" style={{ color: "var(--danger)", borderColor: "var(--danger)" }} onClick={() => deleteZone(zone.id)}><i className="fas fa-trash" /></button>
                    </div>
                  )}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10, padding: "0 20px 20px" }}>
                  {zoneDesks.map((desk) => {
                    const emp = employees.find((e) => e.id === desk.employee_id);
                    const isMine = desk.employee_id === user?.id;
                    return (
                      <div key={desk.id} style={{ padding: 14, borderRadius: 10, border: `2px solid ${isMine ? "var(--primary)" : emp ? "var(--success)" : "var(--gray-200)"}`, background: isMine ? "var(--primary-bg)" : emp ? "var(--success-bg)" : "#fff", position: "relative" }}>
                        <div style={{ fontSize: "0.72rem", color: "var(--gray-500)", marginBottom: 6 }}>Desk {desk.desk_number}</div>
                        {emp ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <Avatar name={emp.name} initials={emp.avatar} avatarUrl={emp.avatarUrl} size="sm" />
                            <div>
                              <div style={{ fontSize: "0.82rem", fontWeight: 600 }}>{emp.name}</div>
                              <div style={{ fontSize: "0.68rem", color: "var(--gray-500)" }}>{emp.designation}</div>
                            </div>
                          </div>
                        ) : (
                          <div style={{ fontSize: "0.82rem", color: "var(--gray-400)", fontStyle: "italic" }}>Available</div>
                        )}
                        {isAdmin && (
                          <div style={{ marginTop: 8, display: "flex", gap: 4 }}>
                            <select value={desk.employee_id || ""} onChange={(e) => assignDesk(desk.id, e.target.value)} style={{ flex: 1, padding: "4px 6px", borderRadius: 6, border: "1px solid var(--gray-200)", fontSize: "0.72rem" }}>
                              <option value="">Unassigned</option>
                              {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                            </select>
                            <button style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: "0.72rem" }} onClick={() => deleteDesk(desk.id)}><i className="fas fa-times" /></button>
                          </div>
                        )}
                        {isMine && <span style={{ position: "absolute", top: 6, right: 8, fontSize: "0.6rem", fontWeight: 700, background: "var(--primary)", color: "#fff", padding: "2px 6px", borderRadius: 4 }}>YOU</span>}
                      </div>
                    );
                  })}
                  {zoneDesks.length === 0 && <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 20, color: "var(--gray-400)" }}>No desks in this zone</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Zone Modal */}
      {showZoneModal && (
        <div className="modal-overlay" onClick={() => setShowZoneModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editingZone ? "Edit Zone" : "Add Zone"}</h3>
            <form onSubmit={saveZone}>
              <div className="form-group"><label>Zone Name</label><input type="text" value={zoneForm.name} onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })} placeholder="e.g. Design Bay" required /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group"><label>Floor</label><input type="text" value={zoneForm.floor} onChange={(e) => setZoneForm({ ...zoneForm, floor: e.target.value })} placeholder="e.g. Floor 1" /></div>
                <div className="form-group"><label>Capacity</label><input type="number" min="1" value={zoneForm.capacity} onChange={(e) => setZoneForm({ ...zoneForm, capacity: Number(e.target.value) })} /></div>
              </div>
              <div className="form-group"><label>Description</label><input type="text" value={zoneForm.description} onChange={(e) => setZoneForm({ ...zoneForm, description: e.target.value })} placeholder="e.g. Left wing near window" /></div>
              <div className="flex gap-2" style={{ justifyContent: "flex-end", marginTop: 16 }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowZoneModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">{editingZone ? "Save" : "Add Zone"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Desk Modal */}
      {showDeskModal && (
        <div className="modal-overlay" onClick={() => setShowDeskModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add Desk</h3>
            <form onSubmit={saveDesk}>
              <div className="form-group"><label>Zone</label><select value={deskForm.zone_id} onChange={(e) => setDeskForm({ ...deskForm, zone_id: e.target.value })} required><option value="">Select Zone</option>{zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}</select></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group"><label>Desk Number</label><input type="text" value={deskForm.desk_number} onChange={(e) => setDeskForm({ ...deskForm, desk_number: e.target.value })} placeholder="e.g. A1, B2" required /></div>
                <div className="form-group"><label>Assign To</label><select value={deskForm.employee_id} onChange={(e) => setDeskForm({ ...deskForm, employee_id: e.target.value })}><option value="">Unassigned</option>{employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</select></div>
              </div>
              <div className="flex gap-2" style={{ justifyContent: "flex-end", marginTop: 16 }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowDeskModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Add Desk</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// ============ FLOOR PLAN VIEW ============
function FloorPlanView() {
  const { employees } = useData();
  const { user } = useAuth();
  const isAdmin = user?.isAdmin;
  const [plans, setPlans] = useState([]);
  const [pins, setPins] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [planForm, setPlanForm] = useState({ name: "", image_url: "" });
  const [placingPin, setPlacingPin] = useState(false);
  const [selectedPin, setSelectedPin] = useState(null);
  const imgRef = useRef(null);

  useEffect(() => { fetchPlans(); }, []);

  async function fetchPlans() {
    const { data: p } = await supabase.from("floor_plans").select("*").order("created_at");
    const { data: pi } = await supabase.from("floor_plan_pins").select("*");
    if (p) { setPlans(p); if (p.length > 0 && !activePlan) setActivePlan(p[0].id); }
    if (pi) setPins(pi);
  }

  async function addPlan(e) {
    e.preventDefault();
    await supabase.from("floor_plans").insert(planForm);
    setShowAddPlan(false); setPlanForm({ name: "", image_url: "" }); fetchPlans();
  }

  async function deletePlan(id) {
    await supabase.from("floor_plan_pins").delete().eq("floor_plan_id", id);
    await supabase.from("floor_plans").delete().eq("id", id);
    setActivePlan(null); fetchPlans();
  }

  function handleImageClick(e) {
    if (!placingPin || !isAdmin || !imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(2);
    const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(2);
    placePin(x, y);
  }

  async function placePin(x, y) {
    await supabase.from("floor_plan_pins").insert({ floor_plan_id: activePlan, x: Number(x), y: Number(y), label: `Seat` });
    setPlacingPin(false); fetchPlans();
  }

  async function assignPin(pinId, empId) {
    await supabase.from("floor_plan_pins").update({ employee_id: empId ? Number(empId) : null }).eq("id", pinId);
    setSelectedPin(null); fetchPlans();
  }

  async function deletePin(id) {
    await supabase.from("floor_plan_pins").delete().eq("id", id);
    setSelectedPin(null); fetchPlans();
  }

  const currentPlan = plans.find((p) => p.id === activePlan);
  const currentPins = pins.filter((p) => p.floor_plan_id === activePlan);

  return (
    <>
      {/* Plan selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }}>
        {plans.map((p) => (
          <button key={p.id} className={`btn ${activePlan === p.id ? "btn-primary" : "btn-outline"} btn-sm`} onClick={() => setActivePlan(p.id)}>{p.name}</button>
        ))}
        {isAdmin && <button className="btn btn-outline btn-sm" onClick={() => setShowAddPlan(true)}><i className="fas fa-plus" /> Add Floor Plan</button>}
      </div>

      {!currentPlan ? (
        <div className="card" style={{ textAlign: "center", padding: 40 }}>
          <i className="fas fa-map" style={{ fontSize: "2.5rem", color: "var(--gray-300)", marginBottom: 12 }} />
          <p style={{ color: "var(--gray-500)" }}>No floor plans yet. {isAdmin ? "Upload your office floor plan to get started." : "Contact admin."}</p>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <h2>{currentPlan.name}</h2>
            {isAdmin && (
              <div className="flex gap-2">
                <button className={`btn ${placingPin ? "btn-primary" : "btn-outline"} btn-sm`} onClick={() => setPlacingPin(!placingPin)}>
                  <i className="fas fa-map-pin" /> {placingPin ? "Click on map to place seat" : "Add Seat Pin"}
                </button>
                <button className="btn btn-outline btn-sm" style={{ color: "var(--danger)", borderColor: "var(--danger)" }} onClick={() => deletePlan(currentPlan.id)}><i className="fas fa-trash" /></button>
              </div>
            )}
          </div>
          <div style={{ position: "relative", padding: "0 20px 20px" }}>
            {placingPin && <div style={{ padding: 8, background: "var(--warning-bg)", borderRadius: 8, fontSize: "0.82rem", color: "var(--warning)", marginBottom: 12, textAlign: "center" }}><i className="fas fa-info-circle" /> Click anywhere on the floor plan to place a seat pin</div>}
            <div style={{ position: "relative", display: "inline-block", width: "100%" }}>
              <img ref={imgRef} src={currentPlan.image_url} alt={currentPlan.name} style={{ width: "100%", borderRadius: 10, cursor: placingPin ? "crosshair" : "default" }} onClick={handleImageClick} />
              {/* Pins */}
              {currentPins.map((pin) => {
                const emp = employees.find((e) => e.id === pin.employee_id);
                const isMine = pin.employee_id === user?.id;
                return (
                  <div key={pin.id} onClick={(e) => { e.stopPropagation(); setSelectedPin(selectedPin === pin.id ? null : pin.id); }}
                    style={{ position: "absolute", left: `${pin.x}%`, top: `${pin.y}%`, transform: "translate(-50%, -100%)", cursor: "pointer", zIndex: 10 }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.2)", border: isMine ? "3px solid var(--primary)" : "2px solid #fff", overflow: "hidden", background: emp ? "var(--success)" : "var(--gray-300)" }}>
                        {emp?.avatarUrl ? <img src={emp.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} referrerPolicy="no-referrer" /> : <i className="fas fa-chair" style={{ color: "#fff", fontSize: "0.6rem" }} />}
                      </div>
                      {isMine && <span style={{ fontSize: "0.55rem", fontWeight: 700, background: "var(--primary)", color: "#fff", padding: "1px 4px", borderRadius: 3, marginTop: 2 }}>YOU</span>}
                    </div>

                    {/* Popup */}
                    {selectedPin === pin.id && (
                      <div onClick={(e) => e.stopPropagation()} style={{ position: "absolute", bottom: "110%", left: "50%", transform: "translateX(-50%)", background: "#fff", borderRadius: 10, padding: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.15)", width: 200, zIndex: 20 }}>
                        {emp ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                            <Avatar name={emp.name} initials={emp.avatar} avatarUrl={emp.avatarUrl} size="sm" />
                            <div><div style={{ fontSize: "0.82rem", fontWeight: 600 }}>{emp.name}</div><div style={{ fontSize: "0.68rem", color: "var(--gray-500)" }}>{emp.designation}</div></div>
                          </div>
                        ) : (
                          <div style={{ fontSize: "0.82rem", color: "var(--gray-400)", marginBottom: 8 }}>Empty seat</div>
                        )}
                        {isAdmin && (
                          <>
                            <select value={pin.employee_id || ""} onChange={(e) => assignPin(pin.id, e.target.value)} style={{ width: "100%", padding: "5px 8px", borderRadius: 6, border: "1px solid var(--gray-200)", fontSize: "0.78rem", marginBottom: 6 }}>
                              <option value="">Unassigned</option>
                              {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                            </select>
                            <button style={{ width: "100%", background: "none", border: "1px solid var(--danger)", color: "var(--danger)", padding: "4px", borderRadius: 6, fontSize: "0.72rem", cursor: "pointer" }} onClick={() => deletePin(pin.id)}>Remove Pin</button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Add Plan Modal */}
      {showAddPlan && (
        <div className="modal-overlay" onClick={() => setShowAddPlan(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3><i className="fas fa-map" style={{ marginRight: 8, color: "var(--primary)" }} />Add Floor Plan</h3>
            <form onSubmit={addPlan}>
              <div className="form-group"><label>Plan Name</label><input type="text" value={planForm.name} onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })} placeholder="e.g. Floor 1 - Main Office" required /></div>
              <div className="form-group"><label>Floor Plan Image URL</label><input type="url" value={planForm.image_url} onChange={(e) => setPlanForm({ ...planForm, image_url: e.target.value })} placeholder="Paste image URL (Google Drive, Imgur, etc.)" required /><span style={{ fontSize: "0.7rem", color: "var(--gray-400)", marginTop: 4, display: "block" }}>Upload your office layout image and paste the link here</span></div>
              {planForm.image_url && <img src={planForm.image_url} alt="Preview" style={{ width: "100%", borderRadius: 8, marginTop: 8, maxHeight: 200, objectFit: "contain", background: "var(--gray-50)" }} />}
              <div className="flex gap-2" style={{ justifyContent: "flex-end", marginTop: 16 }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowAddPlan(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Add Floor Plan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
