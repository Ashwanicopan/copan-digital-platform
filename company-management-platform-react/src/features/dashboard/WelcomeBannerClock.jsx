import { useClock } from "../../hooks/useClock";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";

export default function WelcomeBannerClock({ greeting, userName, today, pending, presentCount }) {
  const time = useClock();
  const { user } = useAuth();
  const { attendance, clockIn, clockOut } = useData();

  const todayStr = new Date().toISOString().split("T")[0];
  const myAttendance = attendance.find((a) => a.employeeId === user?.id && a.date === todayStr);
  const isClockedIn = myAttendance?.clockIn && !myAttendance?.clockOut;
  const hasClockedOut = myAttendance?.clockIn && myAttendance?.clockOut;

  async function handleClockIn(workMode = "office") {
    if (!user?.id) return;
    await clockIn(user.id, workMode);
  }

  async function handleClockOut() {
    if (!user?.id) return;
    await clockOut(user.id);
  }

  function getElapsed() {
    if (!myAttendance?.clockIn) return null;
    const now = new Date();
    const [h, m] = myAttendance.clockIn.split(":").map(Number);
    const start = new Date();
    start.setHours(h, m, 0);
    const diff = Math.floor((now - start) / 60000);
    if (diff < 0) return "0h 0m";
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
          {isClockedIn ? (
            <>
              <span className="welcome-clock-badge clocked-in">
                <i className="fas fa-circle" /> Clocked In {myAttendance.workMode === "wfh" ? "(WFH)" : "(Office)"}
              </span>
              <span className="welcome-clock-detail">Since {myAttendance.clockIn} ({getElapsed()})</span>
            </>
          ) : hasClockedOut ? (
            <>
              <span className="welcome-clock-badge clocked-out">
                <i className="fas fa-circle" /> Clocked Out
              </span>
              <span className="welcome-clock-detail">In: {myAttendance.clockIn} &middot; Out: {myAttendance.clockOut}</span>
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

        {!isClockedIn && !hasClockedOut ? (
          <div style={{ display: "flex", gap: 8 }}>
            <button className="welcome-clock-btn clock-in" onClick={() => handleClockIn("office")}>
              <i className="fas fa-building" /> Office
            </button>
            <button className="welcome-clock-btn clock-in" style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)" }} onClick={() => handleClockIn("wfh")}>
              <i className="fas fa-home" /> WFH
            </button>
          </div>
        ) : isClockedIn ? (
          <button className="welcome-clock-btn clock-out" onClick={handleClockOut}>
            <i className="fas fa-sign-out-alt" /> Clock Out
          </button>
        ) : (
          <span className="welcome-clock-detail" style={{ marginTop: 8, opacity: 0.8 }}>
            <i className="fas fa-check-double" /> Done for today
          </span>
        )}
      </div>

      {/* Decorative circles */}
      <div className="welcome-circle welcome-circle-1" />
      <div className="welcome-circle welcome-circle-2" />
      <div className="welcome-circle welcome-circle-3" />
    </div>
  );
}
