import { useState } from "react";
import { useClock } from "../../hooks/useClock";

export default function WelcomeBannerClock({ greeting, userName, today, pending, presentCount }) {
  const time = useClock();
  const [clockedIn, setClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState(null);
  const [clockOutTime, setClockOutTime] = useState(null);

  function handleClockIn() {
    setClockedIn(true);
    setClockInTime(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
    setClockOutTime(null);
  }

  function handleClockOut() {
    setClockedIn(false);
    setClockOutTime(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
  }

  function getElapsed() {
    if (!clockInTime) return null;
    const now = new Date();
    const [h, m] = clockInTime.split(":").map(Number);
    const start = new Date();
    start.setHours(h, m, 0);
    const diff = Math.floor((now - start) / 60000);
    return `${Math.floor(diff / 60)}h ${diff % 60}m`;
  }

  return (
    <div className="welcome-banner">
      {/* Left side - greeting */}
      <div className="welcome-banner-content">
        <span className="welcome-greeting">{greeting},</span>
        <h1 className="welcome-name">{userName}</h1>
        <p className="welcome-subtitle">
          <i className="far fa-calendar-alt" /> {today}
        </p>
        <p className="welcome-summary">
          You have <strong>{pending} pending leave request{pending !== 1 ? "s" : ""}</strong> and <strong>{presentCount} employees present</strong> today.
        </p>
      </div>

      {/* Right side - clock */}
      <div className="welcome-clock">
        <div className="welcome-clock-time">{time}</div>

        <div className="welcome-clock-status">
          {clockedIn ? (
            <>
              <span className="welcome-clock-badge clocked-in">
                <i className="fas fa-circle" /> Clocked In
              </span>
              <span className="welcome-clock-detail">Since {clockInTime} ({getElapsed()})</span>
            </>
          ) : clockOutTime ? (
            <>
              <span className="welcome-clock-badge clocked-out">
                <i className="fas fa-circle" /> Clocked Out
              </span>
              <span className="welcome-clock-detail">In: {clockInTime} &middot; Out: {clockOutTime}</span>
            </>
          ) : (
            <>
              <span className="welcome-clock-badge not-clocked">
                <i className="far fa-circle" /> Not clocked in
              </span>
              <span className="welcome-clock-detail">Start your day</span>
            </>
          )}
        </div>

        {!clockedIn ? (
          <button className="welcome-clock-btn clock-in" onClick={handleClockIn}>
            <i className="fas fa-sign-in-alt" /> Clock In
          </button>
        ) : (
          <button className="welcome-clock-btn clock-out" onClick={handleClockOut}>
            <i className="fas fa-sign-out-alt" /> Clock Out
          </button>
        )}
      </div>

      {/* Decorative circles */}
      <div className="welcome-circle welcome-circle-1" />
      <div className="welcome-circle welcome-circle-2" />
      <div className="welcome-circle welcome-circle-3" />
    </div>
  );
}
