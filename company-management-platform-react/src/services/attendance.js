import { supabase } from "../lib/supabase";

export async function getAttendanceByDate(date) {
  const { data, error } = await supabase
    .from("attendance")
    .select(`
      *,
      employee:employees(id, name, employee_id, avatar, designation)
    `)
    .eq("date", date)
    .order("employee_id");
  if (error) throw error;
  return data;
}

export async function getAttendanceByEmployee(employeeId, fromDate, toDate) {
  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .eq("employee_id", employeeId)
    .gte("date", fromDate)
    .lte("date", toDate)
    .order("date", { ascending: false });
  if (error) throw error;
  return data;
}

export async function clockIn(employeeId, date) {
  const now = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const { data, error } = await supabase
    .from("attendance")
    .upsert({
      employee_id: employeeId,
      date,
      clock_in: now,
      status: "present",
    }, { onConflict: "employee_id,date" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function clockOut(employeeId, date) {
  const now = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const record = await supabase
    .from("attendance")
    .select("clock_in")
    .eq("employee_id", employeeId)
    .eq("date", date)
    .single();

  let hours = null;
  if (record.data?.clock_in) {
    const [inH, inM] = record.data.clock_in.split(":").map(Number);
    const [outH, outM] = now.split(":").map(Number);
    hours = Math.round(((outH * 60 + outM) - (inH * 60 + inM)) / 60 * 10) / 10;
  }

  const { data, error } = await supabase
    .from("attendance")
    .update({ clock_out: now, hours })
    .eq("employee_id", employeeId)
    .eq("date", date)
    .select()
    .single();
  if (error) throw error;
  return data;
}
