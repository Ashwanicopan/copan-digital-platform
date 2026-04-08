import { useState, useEffect } from "react";
import Header from "../../components/layout/Header";
import Avatar from "../../components/ui/Avatar";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { supabase } from "../../lib/supabase";

export default function SeatingPage() {
  const { employees } = useData();
  const { user } = useAuth();
  const isAdmin = user?.isAdmin;
  const [zones, setZones] = useState([]);
  const [desks, setDesks] = useState([]);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [showDeskModal, setShowDeskModal] = useState(false);
  const [zoneForm, setZoneForm] = useState({ name: "", floor: "", description: "", capacity: 10, image_url: "" });
  const [deskForm, setDeskForm] = useState({ zone_id: "", desk_number: "", employee_id: "" });
  const [editingZone, setEditingZone] = useState(null);
  const [expandedZone, setExpandedZone] = useState(null);

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
  const totalDesks = desks.length;
  const occupiedDesks = desks.filter((d) => d.employee_id).length;

  return (
    <>
      <Header title="Seating Plan" />
      <div className="page-content">
        {/* Stats */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          {[["Total Zones", zones.length, "var(--primary)"], ["Total Desks", totalDesks, "var(--info)"], ["Occupied", occupiedDesks, "var(--success)"], ["Available", totalDesks - occupiedDesks, "var(--warning)"]].map(([l, v, c]) => (
            <div key={l} className="stat-card" style={{ flex: 1, textAlign: "center" }}><div style={{ fontSize: "1.5rem", fontWeight: 700, color: c }}>{v}</div><div style={{ fontSize: "0.78rem", color: "var(--gray-500)" }}>{l}</div></div>
          ))}
        </div>

        {/* My Seat */}
        <div className="card" style={{ marginBottom: 20, padding: 20, background: myDesk ? "var(--primary-bg)" : "var(--gray-50)", border: myDesk ? "1px solid var(--primary)" : "1px solid var(--gray-200)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: myDesk ? "var(--primary)" : "var(--gray-200)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className="fas fa-chair" style={{ color: "#fff", fontSize: "1.2rem" }} />
            </div>
            <div>
              <div style={{ fontSize: "0.78rem", color: "var(--gray-500)" }}>Your Seat</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--gray-900)" }}>{myDesk ? `${myZone?.name || "Zone"} — Desk ${myDesk.desk_number}` : "No seat assigned yet"}</div>
              {myZone && <div style={{ fontSize: "0.78rem", color: "var(--gray-500)" }}>{myZone.floor || ""}{myZone.description ? ` · ${myZone.description}` : ""}</div>}
            </div>
          </div>
        </div>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Office Zones</h2>
          {isAdmin && (
            <div className="flex gap-2">
              <button className="btn btn-outline btn-sm" onClick={() => { setDeskForm({ zone_id: zones[0]?.id ? String(zones[0].id) : "", desk_number: "", employee_id: "" }); setShowDeskModal(true); }}><i className="fas fa-plus" /> Add Desk</button>
              <button className="btn btn-primary btn-sm" onClick={() => { setEditingZone(null); setZoneForm({ name: "", floor: "", description: "", capacity: 10, image_url: "" }); setShowZoneModal(true); }}><i className="fas fa-plus" /> Add Zone</button>
            </div>
          )}
        </div>

        {zones.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 40 }}><i className="fas fa-map-marker-alt" style={{ fontSize: "2.5rem", color: "var(--gray-300)", marginBottom: 12 }} /><p style={{ color: "var(--gray-500)" }}>No zones created yet.{isAdmin ? " Create your first zone to start." : " Contact admin."}</p></div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {zones.map((zone) => {
              const zoneDesks = desks.filter((d) => d.zone_id === zone.id);
              const occupied = zoneDesks.filter((d) => d.employee_id).length;
              const isExpanded = expandedZone === zone.id;
              return (
                <div key={zone.id} className="card" style={{ overflow: "hidden" }}>
                  {/* Zone Header with Image */}
                  <div style={{ display: "flex", gap: 0 }}>
                    {/* Zone Image */}
                    {zone.image_url && (
                      <div style={{ width: 200, minHeight: 140, flexShrink: 0, background: `url(${zone.image_url}) center/cover no-repeat`, borderRight: "1px solid var(--gray-100)" }} />
                    )}
                    {/* Zone Info */}
                    <div style={{ flex: 1, padding: "16px 20px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <h3 style={{ margin: "0 0 4px", fontSize: "1.05rem" }}><i className="fas fa-map-pin" style={{ marginRight: 8, color: "var(--primary)" }} />{zone.name}</h3>
                          <div style={{ fontSize: "0.78rem", color: "var(--gray-500)" }}>{zone.floor}{zone.description ? ` · ${zone.description}` : ""}</div>
                          <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
                            <span style={{ fontSize: "0.75rem", padding: "3px 10px", borderRadius: 6, background: "var(--gray-50)", border: "1px solid var(--gray-100)" }}><strong>{zoneDesks.length}</strong> desks</span>
                            <span style={{ fontSize: "0.75rem", padding: "3px 10px", borderRadius: 6, background: "var(--success-bg)", color: "var(--success)" }}><strong>{occupied}</strong> occupied</span>
                            <span style={{ fontSize: "0.75rem", padding: "3px 10px", borderRadius: 6, background: "var(--warning-bg)", color: "var(--warning)" }}><strong>{zoneDesks.length - occupied}</strong> available</span>
                          </div>
                        </div>
                        <div className="flex gap-1" style={{ alignItems: "center" }}>
                          {isAdmin && (
                            <>
                              <button className="btn btn-outline btn-sm" onClick={() => { setEditingZone(zone.id); setZoneForm({ name: zone.name, floor: zone.floor || "", description: zone.description || "", capacity: zone.capacity, image_url: zone.image_url || "" }); setShowZoneModal(true); }}><i className="fas fa-edit" /></button>
                              <button className="btn btn-outline btn-sm" style={{ color: "var(--danger)", borderColor: "var(--danger)" }} onClick={() => deleteZone(zone.id)}><i className="fas fa-trash" /></button>
                            </>
                          )}
                          <button className="btn btn-outline btn-sm" onClick={() => setExpandedZone(isExpanded ? null : zone.id)}>
                            <i className={`fas fa-chevron-${isExpanded ? "up" : "down"}`} />
                          </button>
                        </div>
                      </div>

                      {/* Mini avatars preview */}
                      {!isExpanded && zoneDesks.filter((d) => d.employee_id).length > 0 && (
                        <div style={{ display: "flex", marginTop: 12, gap: 0 }}>
                          {zoneDesks.filter((d) => d.employee_id).slice(0, 8).map((d, i) => {
                            const emp = employees.find((e) => e.id === d.employee_id);
                            return emp ? (
                              <div key={d.id} style={{ marginLeft: i > 0 ? -8 : 0, zIndex: 10 - i }} title={emp.name}>
                                <Avatar name={emp.name} initials={emp.avatar} avatarUrl={emp.avatarUrl} size="sm" />
                              </div>
                            ) : null;
                          })}
                          {zoneDesks.filter((d) => d.employee_id).length > 8 && (
                            <div style={{ marginLeft: -8, width: 32, height: 32, borderRadius: "50%", background: "var(--gray-200)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontWeight: 700, color: "var(--gray-600)" }}>+{zoneDesks.filter((d) => d.employee_id).length - 8}</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expanded Desks */}
                  {isExpanded && (
                    <div style={{ borderTop: "1px solid var(--gray-100)", padding: 20 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
                        {zoneDesks.map((desk) => {
                          const emp = employees.find((e) => e.id === desk.employee_id);
                          const isMine = desk.employee_id === user?.id;
                          return (
                            <div key={desk.id} style={{ padding: 14, borderRadius: 10, border: `2px solid ${isMine ? "var(--primary)" : emp ? "var(--success)" : "var(--gray-200)"}`, background: isMine ? "var(--primary-bg)" : emp ? "var(--success-bg)" : "#fff", position: "relative" }}>
                              <div style={{ fontSize: "0.72rem", color: "var(--gray-500)", marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
                                <span>Desk {desk.desk_number}</span>
                                {isMine && <span style={{ fontSize: "0.6rem", fontWeight: 700, background: "var(--primary)", color: "#fff", padding: "1px 6px", borderRadius: 4 }}>YOUR SEAT</span>}
                              </div>
                              {emp ? (
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <Avatar name={emp.name} initials={emp.avatar} avatarUrl={emp.avatarUrl} size="sm" />
                                  <div>
                                    <div style={{ fontSize: "0.82rem", fontWeight: 600 }}>{emp.name}</div>
                                    <div style={{ fontSize: "0.68rem", color: "var(--gray-500)" }}>{emp.designation}</div>
                                  </div>
                                </div>
                              ) : (
                                <div style={{ fontSize: "0.82rem", color: "var(--gray-400)", fontStyle: "italic" }}><i className="fas fa-chair" style={{ marginRight: 6 }} />Available</div>
                              )}
                              {isAdmin && (
                                <div style={{ marginTop: 10, display: "flex", gap: 4 }}>
                                  <select value={desk.employee_id || ""} onChange={(e) => assignDesk(desk.id, e.target.value)} style={{ flex: 1, padding: "4px 6px", borderRadius: 6, border: "1px solid var(--gray-200)", fontSize: "0.72rem" }}>
                                    <option value="">Unassigned</option>
                                    {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                                  </select>
                                  <button style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: "0.75rem" }} onClick={() => deleteDesk(desk.id)}><i className="fas fa-times" /></button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {zoneDesks.length === 0 && <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 20, color: "var(--gray-400)" }}>No desks in this zone yet</div>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Zone Modal */}
      {showZoneModal && (
        <div className="modal-overlay" onClick={() => setShowZoneModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <h3><i className={`fas ${editingZone ? "fa-edit" : "fa-plus-circle"}`} style={{ marginRight: 8, color: "var(--primary)" }} />{editingZone ? "Edit Zone" : "Add Zone"}</h3>
            <form onSubmit={saveZone}>
              <div className="form-group"><label>Zone Name</label><input type="text" value={zoneForm.name} onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })} placeholder="e.g. Design Bay, Dev Corner" required /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group"><label>Floor</label><input type="text" value={zoneForm.floor} onChange={(e) => setZoneForm({ ...zoneForm, floor: e.target.value })} placeholder="e.g. Floor 1" /></div>
                <div className="form-group"><label>Capacity</label><input type="number" min="1" value={zoneForm.capacity} onChange={(e) => setZoneForm({ ...zoneForm, capacity: Number(e.target.value) })} /></div>
              </div>
              <div className="form-group"><label>Description</label><input type="text" value={zoneForm.description} onChange={(e) => setZoneForm({ ...zoneForm, description: e.target.value })} placeholder="e.g. Left wing near window" /></div>
              <div className="form-group">
                <label>Zone Photo / Image URL</label>
                <input type="url" value={zoneForm.image_url} onChange={(e) => setZoneForm({ ...zoneForm, image_url: e.target.value })} placeholder="Paste image URL of this zone area" />
                <span style={{ fontSize: "0.7rem", color: "var(--gray-400)", marginTop: 4, display: "block" }}>Take a photo of this zone area and upload to Google Drive / Imgur</span>
              </div>
              {zoneForm.image_url && (
                <div style={{ marginBottom: 16 }}>
                  <img src={zoneForm.image_url} alt="Preview" style={{ width: "100%", borderRadius: 10, maxHeight: 160, objectFit: "cover", border: "1px solid var(--gray-200)" }} />
                </div>
              )}
              <div className="flex gap-2" style={{ justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowZoneModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">{editingZone ? "Save Changes" : "Add Zone"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Desk Modal */}
      {showDeskModal && (
        <div className="modal-overlay" onClick={() => setShowDeskModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3><i className="fas fa-chair" style={{ marginRight: 8, color: "var(--primary)" }} />Add Desk</h3>
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
