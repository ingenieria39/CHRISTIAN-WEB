import { supabase } from '../supabaseClient.js'

export async function getClients() {
  const { data, error } = await supabase
    .from('clients')
    .select(`
      *,
      assigned_profile : users_profiles!assigned_to (full_name, email),
      pipeline         : client_pipeline (
        stage : pipeline_stages (id, name, color, order_index)
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getClientById(id) {
  const { data, error } = await supabase
    .from('clients')
    .select(`
      *,
      assigned_profile : users_profiles!assigned_to (full_name, email),
      pipeline         : client_pipeline (
        stage : pipeline_stages (id, name, color)
      ),
      interactions (
        id, type, description, created_at,
        user : users_profiles!user_id (full_name, email)
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createClient(payload) {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('clients')
    .insert({ ...payload, created_by: user.id })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateClient(id, payload) {
  const { data, error } = await supabase
    .from('clients')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteClient(id) {
  const { error } = await supabase.from('clients').delete().eq('id', id)
  if (error) throw error
}

export async function getClientStats() {
  const { data, error } = await supabase
    .from('clients')
    .select('status')

  if (error) throw error

  return {
    total:       data.length,
    activos:     data.filter(c => c.status === 'activo').length,
    negociacion: data.filter(c => c.status === 'negociacion').length,
    cerrados:    data.filter(c => c.status === 'cerrado').length,
  }
}
