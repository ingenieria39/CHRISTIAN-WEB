import { supabase } from '../supabaseClient.js'

export async function getInteractions(clientId) {
  const { data, error } = await supabase
    .from('interactions')
    .select(`
      *,
      user : users_profiles!user_id (full_name, email)
    `)
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function addInteraction({ clientId, type, description }) {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('interactions')
    .insert({
      client_id:   clientId,
      user_id:     user.id,
      type,
      description,
    })
    .select(`*, user : users_profiles!user_id (full_name, email)`)
    .single()

  if (error) throw error
  return data
}

export async function deleteInteraction(id) {
  const { error } = await supabase.from('interactions').delete().eq('id', id)
  if (error) throw error
}

export const INTERACTION_TYPES = [
  { value: 'llamada',   label: '📞 Llamada'   },
  { value: 'email',     label: '📧 Email'     },
  { value: 'reunion',   label: '🤝 Reunión'   },
  { value: 'nota',      label: '📝 Nota'      },
  { value: 'whatsapp',  label: '💬 WhatsApp'  },
]
