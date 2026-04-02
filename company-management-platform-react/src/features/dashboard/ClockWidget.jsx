import { useState } from "react";
import { useClock } from "../../hooks/useClock";
import { getCurrentDate } from "../../utils/helpers";

export default function ClockWidget() {
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

  function getElapsedTime() {
    if (!clockInTime) return null;
    const now = new Date();
    const [h, m] = clockInTime.split(":").map(Number);
    const start = new Date();
    start.setHours(h, m, 0);
    const diff = Math.floor((now - start) / 60000);
    const hrs = Math.floor(diff / 60);
    const mins = diff % 60;
    return `${hrs}h ${mins}m`;
  }

  return (
    <div className="dash-clock-widget">
      <div className="dash-clock-left">
        <div className="dash-clock-time">{time}</div>
        <div className="dash-clock-date">{getCurrentDate()}</div>
      </div>

      <div className="dash-clock-right">
        <div className="dash-clock-status">
          {clockedIn ? (
            <div className="dash-clock-info">
              <span className="dash-clock-badge clocked-in">
                <i className="fas fa-circle" /> Clocked In
              </span>
              <span className="dash-clock-detail">Since {clockInTime} ({getElapsedTime()})</span>
            </div>
          ) : clockOutTime ? (
            <div className="dash-clock-info">
              <span className="dash-clock-badge clocked-out">
                <i className="fas fa-circle" /> Clocked Out
              </span>
              <span className="dash-clock-detail">In: {clockInTime} &middot; Out: {clockOutTime}</span>
            </div>
          ) : (
            <div className="dash-clock-info">
              <span className="dash-clock-badge not-clocked">
                <i className="far fa-circle" /> Not clocked in
              </span>
              <span className="dash-clock-detail">Start your day</span>
            </div>
          )}
        </div>

        <div className="dash-clock-actions">
          {!clockedIn ? (
            <button className="btn-clock btn-clock-in" onClick={handleClockIn}>
              <i className="fas fa-sign-in-alt" /> Clock In
            </button>
          ) : (
            <button className="btn-clock btn-clock-out" onClick={handleClockOut}>
              <i className="fas fa-sign-out-alt" /> Clock Out
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
