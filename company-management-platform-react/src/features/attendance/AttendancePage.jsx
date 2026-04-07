import { useState, useEffect } from "react";
import Header from "../../components/layout/Header";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { getCurrentDate } from "../../utils/helpers";
import { useClock } from "../../hooks/useClock";

export default function AttendancePage() {
  const time = useClock();
  const { user } = useAuth();
  const { attendance, employees, clockIn, clockOut, refreshAttendance } = useData();
  const todayStr = new Date().toISOString().split("T")[0];

  // Refresh attendance on mount and every 30 seconds
  useEffect(() => {
    refreshAttendance();
    const interval = setInterval(refreshAttendance, 30000);
    return () => clearInterval(interval);
  }, []);
  const [dateFilter, setDateFilter] = useState(todayStr);

  const logs = attendance.filter((a) => a.date === dateFilter);
  const present = logs.filter((a) => a.status === "present").length;
  const absent = logs.filter((a) => a.status === "absent").length;
  const leave = logs.filter((a) => a.status === "on-leave").length;
  const avgHours = present > 0
    ? (logs.filter((a) => a.hours > 0).reduce((s, a) => s + a.hours, 0) / present).toFixed(1)
    : "0";

  // Check if current user has clocked in today
  const myAttendance = attendance.find((a) => a.employeeId === user?.id && a.date === todayStr);
  const isClockedIn = myAttendance && myAttendance.clockIn && !myAttendance.clockOut;
  const hasClockedOut = myAttendance && myAttendance.clockOut;

  async function handleClockIn(workMode) {
    if (!user?.id) return;
    const t = await clockIn(user.id, workMode);
    alert(`Clocked in at ${t}${workMode === "wfh" ? " (WFH)" : ""}`);
  }

  async function handleClockOut() {
    if (!user?.id) return;
    const t = await clockOut(user.id);
    alert("Clocked out at " + t);
  }

  // Generate last 7 days for date filter
  const dateOptions = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const val = d.toISOString().split("T")[0];
    const label = d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    dateOptions.push({ val, label: i === 0 ? `Today (${label})` : label });
  }

  return (
    <>
      <Header title="Attendance" />
      <div className="page-content">
        <div className="clock-widget">
          <div>
            <div className="time">{time}</div>
            <div className="date">{getCurrentDate()}</div>
          </div>
          <div className="clock-actions">
            {!myAttendance || (!myAttendance.clockIn) ? (
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-clock btn-clock-in" onClick={() => handleClockIn("office")}><i className="fas fa-building" style={{ marginRight: 6 }} />Clock In (Office)</button>
                <button className="btn-clock btn-clock-in" style={{ background: "var(--info)", color: "#fff" }} onClick={() => handleClockIn("wfh")}><i className="fas fa-home" style={{ marginRight: 6 }} />Clock In (WFH)</button>
              </div>
            ) : isClockedIn ? (
              <>
                <span style={{ fontSize: "0.82rem", color: "var(--success)", fontWeight: 600 }}>
                  <i className="fas fa-check-circle" /> Clocked in at {myAttendance.clockIn}
                </span>
                <button className="btn-clock btn-clock-out" onClick={handleClockOut}>Clock Out</button>
              </>
            ) : hasClockedOut ? (
              <span style={{ fontSize: "0.82rem", color: "var(--gray-500)", fontWeight: 600 }}>
                <i className="fas fa-check-double" /> Done for today ({myAttendance.clockIn} - {myAttendance.clockOut})
              </span>
            ) : (
              <button className="btn-clock btn-clock-in" onClick={handleClockIn}>Clock In</button>
            )}
          </div>
        </div>

        <div className="attendance-summary">
          {[
            { count: present, label: "Present", color: "var(--success)" },
            { count: absent, label: "Absent", color: "var(--danger)" },
            { count: leave, label: "On Leave", color: "var(--warning)" },
            { count: avgHours, label: "Avg Hours", color: "var(--gray-900)" },
          ].map((s) => (
            <div className="attendance-stat" key={s.label}>
              <div className="count" style={{ color: s.color }}>{s.count}</div>
              <div className="label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Attendance Log</h2>
            <select className="filter-select" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
              {dateOptions.map((d) => <option key={d.val} value={d.val}>{d.label}</option>)}
            </select>
          </div>
          <div className="table-container">
            <table>
              <thead><tr><th>Employee</th><th>Clock In</th><th>Clock Out</th><th>Hours</th><th>Status</th></tr></thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--gray-400)", padding: 32 }}>No attendance records for this date</td></tr>
                ) : (
                  logs.map((log, i) => {
                    const emp = employees.find((e) => e.id === log.employeeId);
                    if (!emp) return null;
                    return (
                      <tr key={`${log.employeeId}-${i}`}>
                        <td>
                          <div className="employee-cell">
                            <Avatar name={emp.name} initials={emp.avatar} avatarUrl={emp.avatarUrl} />
                            <div><div className="name">{emp.name}</div><div className="sub">{emp.department}</div></div>
                          </div>
                        </td>
                        <td>{log.clockIn || "-"}</td>
                        <td>{log.clockOut || "-"}</td>
                        <td>{log.hours ? log.hours + " hrs" : "-"}</td>
                        <td><Badge status={log.status} /></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
