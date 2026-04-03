import Avatar from "../../components/ui/Avatar";
import { useData } from "../../context/DataContext";

function getUpcomingEvents(employees) {
  const today = new Date();
  const events = [];

  employees.forEach((emp) => {
    if (emp.dob) {
      const bday = new Date(emp.dob);
      const thisYearBday = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());
      const diff = Math.floor((thisYearBday - today) / 86400000);
      if (diff >= 0 && diff <= 7) {
        const age = today.getFullYear() - bday.getFullYear();
        events.push({
          id: `bday-${emp.id}`, type: "birthday", icon: "fa-birthday-cake", color: "#db2777", bg: "#fdf2f8", employee: emp,
          label: diff === 0 ? "Birthday Today!" : diff === 1 ? "Birthday Tomorrow" : `Birthday in ${diff} days`,
          detail: `Turning ${age}`, daysAway: diff, date: thisYearBday,
        });
      }
    }
    if (emp.joinDate) {
      const joinDt = new Date(emp.joinDate);
      const thisYearAnniv = new Date(today.getFullYear(), joinDt.getMonth(), joinDt.getDate());
      const diff = Math.floor((thisYearAnniv - today) / 86400000);
      const years = today.getFullYear() - joinDt.getFullYear();
      if (diff >= 0 && diff <= 7 && years > 0) {
        events.push({
          id: `anniv-${emp.id}`, type: "anniversary", icon: "fa-award", color: "#7c3aed", bg: "#f5f3ff", employee: emp,
          label: diff === 0 ? "Work Anniversary Today!" : diff === 1 ? "Work Anniversary Tomorrow" : `Anniversary in ${diff} days`,
          detail: `${years} year${years > 1 ? "s" : ""} at the company`, daysAway: diff, date: thisYearAnniv,
        });
      }
    }
    if (emp.joinDate) {
      const joinDt = new Date(emp.joinDate);
      const diff = Math.floor((today - joinDt) / 86400000);
      if (diff >= 0 && diff <= 30) {
        events.push({
          id: `newjoin-${emp.id}`, type: "new-joiner", icon: "fa-user-plus", color: "#0891b2", bg: "#ecfeff", employee: emp,
          label: diff === 0 ? "Joined Today!" : `Joined ${diff} day${diff > 1 ? "s" : ""} ago`,
          detail: `${emp.designation}, ${emp.department}`, daysAway: -diff, date: joinDt,
        });
      }
    }
  });

  events.sort((a, b) => a.daysAway - b.daysAway);
  return events;
}

export default function CelebrationCard() {
  const { employees } = useData();
  const events = getUpcomingEvents(employees);

  return (
    <div className="card">
      <div className="card-header">
        <h2><i className="fas fa-star" style={{ color: "var(--warning)", marginRight: 8 }} />Celebrations & Events</h2>
        <span className="badge badge-info">{events.length} this week</span>
      </div>

      {events.length === 0 ? (
        <div className="empty-state" style={{ padding: "24px 16px" }}>
          <i className="far fa-calendar-check" />
          <p>No upcoming celebrations this week</p>
        </div>
      ) : (
        <div className="celebration-list">
          {events.map((event) => (
            <div className="celebration-item" key={event.id}>
              <div className="celebration-icon" style={{ background: event.bg, color: event.color }}>
                <i className={`fas ${event.icon}`} />
              </div>
              <div className="celebration-info">
                <div className="celebration-top">
                  <div className="celebration-employee">
                    <Avatar name={event.employee.name} initials={event.employee.avatar} />
                    <div>
                      <div className="name">{event.employee.name}</div>
                      <div className="sub">{event.detail}</div>
                    </div>
                  </div>
                  <span className="celebration-tag" style={{ background: event.bg, color: event.color }}>
                    {event.type === "birthday" && "Birthday"}
                    {event.type === "anniversary" && "Anniversary"}
                    {event.type === "new-joiner" && "New Joiner"}
                  </span>
                </div>
                <div className="celebration-label">
                  <i className={`fas ${event.icon}`} style={{ color: event.color, marginRight: 6 }} />
                  {event.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
