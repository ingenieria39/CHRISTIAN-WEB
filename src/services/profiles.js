import { supabase } from '../supabaseClient.js'

export async function getMyProfile() {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('users_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) throw error
  return data
}

export async function updateMyProfile(payload) {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('users_profiles')
    .update(payload)
    .eq('id', user.id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getAllProfiles() {
  const { data, error } = await supabase
    .from('users_profiles')
    .select('id, email, full_name, role, created_at')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getWorkers() {
  const { data, error } = await supabase
    .from('users_profiles')
    .select('id, email, full_name')
    .eq('role', 'trabajador')
    .order('full_name')

  if (error) throw error
  return data
}
