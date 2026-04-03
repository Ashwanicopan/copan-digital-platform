import { supabase } from "../lib/supabase";

export async function getEmployees() {
  const { data, error } = await supabase
    .from("employees")
    .select(`
      *,
      department:departments(id, name),
      location:locations(id, name),
      role:roles(id, name, color),
      manager:employees!manager_id(id, name, employee_id)
    `)
    .order("name");
  if (error) throw error;
  return data;
}

export async function getEmployeeById(id) {
  const { data, error } = await supabase
    .from("employees")
    .select(`
      *,
      department:departments(id, name),
      location:locations(id, name),
      role:roles(id, name, color),
      manager:employees!manager_id(id, name, employee_id)
    `)
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function createEmployee(employee) {
  const { data, error } = await supabase
    .from("employees")
    .insert(employee)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateEmployee(id, updates) {
  const { data, error } = await supabase
    .from("employees")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteEmployee(id) {
  const { error } = await supabase
    .from("employees")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
