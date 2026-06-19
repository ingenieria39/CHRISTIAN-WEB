import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../supabaseClient.js'

const AuthContext = createContext()

async function fetchRoleFromDB(user) {
  // Supabase JS v2 nunca lanza excepciones, devuelve { data, error }
  const { data, error } = await supabase
    .from('users_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Sin error y con rol → usar el rol de la BD (fuente de verdad)
  if (!error && data?.role) return data.role

  // Fallback: leer de user_metadata (seteado en signUp o via SQL)
  return user.user_metadata?.role ?? 'cliente'
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined)
  const [role,    setRole]    = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        fetchRoleFromDB(session.user).then(setRole)
      } else {
        setRole(null)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      // Resetear role a undefined ANTES del fetch para que loading=true
      // durante la transición y no haya un Navigate a destino undefined
      setRole(undefined)
      setSession(session)
      if (session?.user) {
        fetchRoleFromDB(session.user).then(setRole)
      } else {
        setRole(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const user    = session?.user ?? null
  const loading = session === undefined || role === undefined

  return (
    <AuthContext.Provider value={{ session, user, role, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
