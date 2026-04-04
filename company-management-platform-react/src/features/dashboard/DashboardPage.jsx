import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import Header from "../../components/layout/Header";
import StatCard from "../../components/ui/StatCard";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import HolidayCard from "./HolidayCard";
import WelcomeBannerClock from "./WelcomeBannerClock";
import CelebrationCard from "./CelebrationCard";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { employees, leaveRequests } = useData();
  const total = employees.length;
  const active = employees.filter((e) => e.status === "active").length;
  const onLeave = employees.filter((e) => e.status === "on-leave").length;
  const pending = leaveRequests.filter((l) => l.status === "pending").length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <>
      <Header title="Dashboard" />
      <div className="page-content">
        <WelcomeBannerClock
          greeting={greeting}
          userName={user?.name}
          today={today}
          pending={pending}
          presentCount={active - 1}
        />

        <div className="stats-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
          <StatCard title="Employee Present Today" value={active - 1} subtitle={`${Math.round(((active - 1) / total) * 100)}% attendance`} icon="fa-user-check" color="green" />
          <StatCard title="Employee Absent Today" value={onLeave} subtitle={`${pending} pending requests`} icon="fa-calendar-times" color="orange" />
          <StatCard title="Employee Not Marked" value={total - (active - 1) - onLeave} subtitle="Attendance pending" icon="fa-user-clock" color="red" />
        </div>

        <div className="dashboard-grid">
          <div>
            <div className="card">
              <div className="card-header"><h2>Quick Actions</h2></div>
              <div className="quick-actions">
                {[
                  { icon: "fa-user-plus", label: "Add Employee", to: "/employees" },
                  { icon: "fa-clipboard-check", label: "Mark Attendance", to: "/attendance" },
                  { icon: "fa-calendar-plus", label: "Leave Requests", to: "/leave" },
                  { icon: "fa-file-invoice-dollar", label: "Run Payroll", to: "/payroll" },
                ].map((a) => (
                  <button key={a.label} className="quick-action-btn" onClick={() => navigate(a.to)}>
                    <i className={`fas ${a.icon}`} /> {a.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="card mt-4">
              <div className="card-header">
                <h2>Leave Requests Today</h2>
                <a href="#" className="text-sm" onClick={(e) => { e.preventDefault(); navigate("/leave"); }}>View All</a>
              </div>
              <div className="table-container">
                <table>
                  <thead><tr><th>Employee</th><th>Type</th><th>Duration</th><th>Status</th></tr></thead>
                  <tbody>
                    {(() => {
                      const todayStr = new Date().toISOString().split("T")[0];
                      const todayLeaves = leaveRequests.filter((l) => {
                        const isOnLeaveToday = l.from <= todayStr && l.to >= todayStr;
                        const isRequestedToday = l.appliedOn === todayStr;
                        return isOnLeaveToday || isRequestedToday || l.status === "pending";
                      });
                      if (todayLeaves.length === 0) {
                        return <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--gray-400)", padding: "24px" }}>No leave requests for today</td></tr>;
                      }
                      return todayLeaves.map((l) => {
                        const emp = employees.find((e) => e.id === l.employeeId);
                        return (
                          <tr key={l.id}>
                            <td>
                              <div className="employee-cell">
                                <Avatar name={l.employeeName} initials={emp?.avatar || "?"} avatarUrl={emp?.avatarUrl} />
                                <div><div className="name">{l.employeeName}</div></div>
                              </div>
                            </td>
                            <td>{l.type}</td>
                            <td>{l.days} day{l.days > 1 ? "s" : ""}</td>
                            <td><Badge status={l.status} /></td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div>
            <CelebrationCard />

            <div className="mt-4">
              <HolidayCard />
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
