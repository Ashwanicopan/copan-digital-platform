export default function StatCard({ title, value, subtitle, icon, color = "blue" }) {
  return (
    <div className="stat-card">
      <div className="stat-info">
        <h3>{title}</h3>
        <div className="stat-value">{value}</div>
        {subtitle && <div className="stat-change">{subtitle}</div>}
      </div>
      <div className={`stat-icon ${color}`}>
        <i className={`fas ${icon}`} />
      </div>
    </div>
  );
}
