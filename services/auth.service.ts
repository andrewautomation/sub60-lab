import { supabase } from "@/lib/supabase";

export async function getSession() {
  return supabase.auth.getSession();
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUp(
  email: string,
  password: string,
  emailRedirectTo: string
) {
  return supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo },
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}
