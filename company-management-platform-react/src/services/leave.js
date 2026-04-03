import { supabase } from "../lib/supabase";

export async function getLeaveRequests(filters = {}) {
  let query = supabase
    .from("leave_requests")
    .select(`
      *,
      employee:employees(id, name, employee_id, avatar),
      leave_type:leave_policies(id, type),
      reviewer:employees!reviewed_by(id, name)
    `)
    .order("applied_on", { ascending: false });

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.employeeId) query = query.eq("employee_id", filters.employeeId);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createLeaveRequest(request) {
  const { data, error } = await supabase
    .from("leave_requests")
    .insert(request)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateLeaveStatus(id, status, reviewerId) {
  const { data, error } = await supabase
    .from("leave_requests")
    .update({
      status,
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getLeaveBalances(employeeId, year) {
  const { data, error } = await supabase
    .from("leave_balances")
    .select(`
      *,
      leave_type:leave_policies(id, type)
    `)
    .eq("employee_id", employeeId)
    .eq("year", year);
  if (error) throw error;
  return data;
}

export async function getLeavePolicies() {
  const { data, error } = await supabase
    .from("leave_policies")
    .select("*")
    .order("id");
  if (error) throw error;
  return data;
}

export async function updateLeavePolicy(id, updates) {
  const { data, error } = await supabase
    .from("leave_policies")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function createLeavePolicy(policy) {
  const { data, error } = await supabase
    .from("leave_policies")
    .insert(policy)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteLeavePolicy(id) {
  const { error } = await supabase
    .from("leave_policies")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
