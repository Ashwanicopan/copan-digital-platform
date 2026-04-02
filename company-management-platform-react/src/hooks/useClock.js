import { useState, useEffect } from "react";
import { getCurrentTime } from "../utils/helpers";

export function useClock() {
  const [time, setTime] = useState(getCurrentTime());

  useEffect(() => {
    const id = setInterval(() => setTime(getCurrentTime()), 1000);
    return () => clearInterval(id);
  }, []);

  return time;
}
