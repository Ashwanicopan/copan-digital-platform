import { supabase } from "../lib/supabase";

// --- Roles ---
export async function getRoles() {
  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .order("id");
  if (error) throw error;
  return data;
}

export async function createRole(role) {
  const { data, error } = await supabase
    .from("roles")
    .insert(role)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateRole(id, updates) {
  const { data, error } = await supabase
    .from("roles")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteRole(id) {
  const { error } = await supabase
    .from("roles")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// --- Company Settings ---
export async function getCompanySettings() {
  const { data, error } = await supabase
    .from("company_settings")
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updateCompanySettings(updates) {
  const { data, error } = await supabase
    .from("company_settings")
    .update(updates)
    .eq("id", 1)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// --- Departments ---
export async function getDepartments() {
  const { data, error } = await supabase
    .from("departments")
    .select("*")
    .order("name");
  if (error) throw error;
  return data;
}

// --- Locations ---
export async function getLocations() {
  const { data, error } = await supabase
    .from("locations")
    .select("*")
    .order("name");
  if (error) throw error;
  return data;
}

// --- Holidays ---
export async function getHolidays(year) {
  let query = supabase.from("holidays").select("*").order("date");
  if (year) {
    query = query.gte("date", `${year}-01-01`).lte("date", `${year}-12-31`);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// --- Notifications ---
export async function getNotifications(employeeId) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("employee_id", employeeId)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return data;
}

export async function markNotificationRead(id) {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id);
  if (error) throw error;
}

export async function getNotificationPreferences(employeeId) {
  const { data, error } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("employee_id", employeeId);
  if (error) throw error;
  return data;
}

export async function upsertNotificationPreference(pref) {
  const { data, error } = await supabase
    .from("notification_preferences")
    .upsert(pref, { onConflict: "employee_id,event_type" })
    .select()
    .single();
  if (error) throw error;
  return data;
}
