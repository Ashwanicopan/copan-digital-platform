import { supabase } from "../lib/supabase";

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getCurrentEmployee() {
  const session = await getSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from("employees")
    .select(`
      *,
      department:departments(id, name),
      location:locations(id, name),
      role:roles(id, name, color, permissions)
    `)
    .eq("auth_user_id", session.user.id)
    .single();
  if (error) throw error;
  return data;
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback);
}
