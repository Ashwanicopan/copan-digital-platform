import { useState } from "react";
import Header from "../../components/layout/Header";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import { ATTENDANCE_DATA, EMPLOYEES_DATA } from "../../data/mockData";
import { getCurrentDate } from "../../utils/helpers";
import { useClock } from "../../hooks/useClock";

export default function AttendancePage() {
  const time = useClock();
  const [dateFilter, setDateFilter] = useState("2026-04-01");

  const logs = ATTENDANCE_DATA.filter((a) => a.date === dateFilter);
  const present = logs.filter((a) => a.status === "present").length;
  const absent = logs.filter((a) => a.status === "absent").length;
  const leave = logs.filter((a) => a.status === "on-leave").length;
  const avgHours = present > 0
    ? (logs.filter((a) => a.hours > 0).reduce((s, a) => s + a.hours, 0) / present).toFixed(1)
    : "0";

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
            <button className="btn-clock btn-clock-in" onClick={() => alert("Clocked in at " + time)}>Clock In</button>
            <button className="btn-clock btn-clock-out" onClick={() => alert("Clocked out at " + time)}>Clock Out</button>
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
              <option value="2026-04-01">April 1, 2026</option>
              <option value="2026-04-02">April 2, 2026</option>
            </select>
          </div>
          <div className="table-container">
            <table>
              <thead><tr><th>Employee</th><th>Clock In</th><th>Clock Out</th><th>Hours</th><th>Status</th></tr></thead>
              <tbody>
                {logs.map((log) => {
                  const emp = EMPLOYEES_DATA.find((e) => e.id === log.employeeId);
                  if (!emp) return null;
                  return (
                    <tr key={log.employeeId}>
                      <td>
                        <div className="employee-cell">
                          <Avatar name={emp.name} initials={emp.avatar} />
                          <div><div className="name">{emp.name}</div><div className="sub">{emp.department}</div></div>
                        </div>
                      </td>
                      <td>{log.clockIn || "-"}</td>
                      <td>{log.clockOut || "-"}</td>
                      <td>{log.hours ? log.hours + " hrs" : "-"}</td>
                      <td><Badge status={log.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
