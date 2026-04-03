import { supabase } from "../lib/supabase";

export async function getPayroll(month, year) {
  const { data, error } = await supabase
    .from("payroll")
    .select(`
      *,
      employee:employees(id, name, employee_id, avatar, designation, department:departments(name), bank_name, bank_account, pan, uan, payment_mode, location:locations(name), join_date)
    `)
    .eq("month", month)
    .eq("year", year)
    .order("employee_id");
  if (error) throw error;
  return data;
}

export async function getPayslip(employeeId, month, year) {
  const { data, error } = await supabase
    .from("payroll")
    .select(`
      *,
      employee:employees(id, name, employee_id, avatar, designation, department:departments(name), bank_name, bank_account, pan, uan, payment_mode, location:locations(name), join_date)
    `)
    .eq("employee_id", employeeId)
    .eq("month", month)
    .eq("year", year)
    .single();
  if (error) throw error;
  return data;
}

export async function processPayroll(entries) {
  const { data, error } = await supabase
    .from("payroll")
    .upsert(entries, { onConflict: "employee_id,month,year" })
    .select();
  if (error) throw error;
  return data;
}

export async function updatePayrollStatus(id, status, paidOn) {
  const { data, error } = await supabase
    .from("payroll")
    .update({ status, paid_on: paidOn })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
