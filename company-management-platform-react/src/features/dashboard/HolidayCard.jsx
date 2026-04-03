import { useData } from "../../context/DataContext";
import { formatDate } from "../../utils/helpers";

function getUpcomingHolidays(holidays) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return holidays
    .filter((h) => new Date(h.date) >= today)
    .slice(0, 5)
    .map((h) => {
      const hDate = new Date(h.date);
      const diff = Math.floor((hDate - today) / 86400000);
      const dayName = hDate.toLocaleDateString("en-IN", { weekday: "short" });
      return { ...h, diff, dayName };
    });
}

export default function HolidayCard() {
  const { holidays } = useData();
  const upcoming = getUpcomingHolidays(holidays);
  const next = upcoming[0];

  return (
    <div className="card">
      <div className="card-header">
        <h2><i className="fas fa-umbrella-beach" style={{ color: "var(--info)", marginRight: 8 }} />Upcoming Holidays</h2>
      </div>

      {next && (
        <div className="next-holiday-banner">
          <div className="next-holiday-icon">
            <i className={`fas ${next.type === "national" ? "fa-flag" : "fa-star"}`} />
          </div>
          <div className="next-holiday-info">
            <div className="next-holiday-label">Next Holiday</div>
            <div className="next-holiday-name">{next.name}</div>
            <div className="next-holiday-date">
              {formatDate(next.date)} ({next.dayName})
              <span className="next-holiday-countdown">
                {next.diff === 0 ? "Today!" : next.diff === 1 ? "Tomorrow" : `in ${next.diff} days`}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="holiday-list">
        {upcoming.slice(1).map((h) => (
          <div className="holiday-item" key={h.date}>
            <div className="holiday-date-box">
              <span className="holiday-date-day">{new Date(h.date).getDate()}</span>
              <span className="holiday-date-month">{new Date(h.date).toLocaleDateString("en-IN", { month: "short" })}</span>
            </div>
            <div className="holiday-detail">
              <div className="holiday-name">{h.name}</div>
              <div className="holiday-meta">{h.dayName} &middot; {h.diff === 0 ? "Today" : h.diff === 1 ? "Tomorrow" : `${h.diff} days away`}</div>
            </div>
            <span className={`badge ${h.type === "national" ? "badge-info" : "badge-warning"}`}>
              {h.type === "national" ? "National" : "Festival"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
