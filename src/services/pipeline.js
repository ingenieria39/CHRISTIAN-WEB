import { supabase } from '../supabaseClient.js'

export async function getPipelineStages() {
  const { data, error } = await supabase
    .from('pipeline_stages')
    .select('*')
    .order('order_index')

  if (error) throw error
  return data
}

export async function getPipelineBoard() {
  const { data: stages, error: stagesErr } = await supabase
    .from('pipeline_stages')
    .select('*')
    .order('order_index')

  if (stagesErr) throw stagesErr

  const { data: positions, error: posErr } = await supabase
    .from('client_pipeline')
    .select(`
      *,
      client : clients (id, name, company, email, status)
    `)

  if (posErr) throw posErr

  return stages.map(stage => ({
    ...stage,
    clients: positions
      .filter(p => p.stage_id === stage.id)
      .map(p => p.client),
  }))
}

export async function moveClientToStage(clientId, stageId) {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('client_pipeline')
    .upsert(
      { client_id: clientId, stage_id: stageId, updated_by: user.id },
      { onConflict: 'client_id' }
    )
    .select()
    .single()

  if (error) throw error
  return data
}
