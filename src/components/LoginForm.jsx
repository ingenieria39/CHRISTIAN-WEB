import { useState } from 'react'
import { supabase } from '../supabaseClient.js'

export default function LoginForm() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 style={s.title}>Bienvenido de vuelta</h2>

      <div style={s.field}>
        <label style={s.label}>Email</label>
        <input
          style={s.input}
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
      </div>

      <div style={s.field}>
        <label style={s.label}>Contraseña</label>
        <input
          style={s.input}
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
      </div>

      {error && <div style={s.error}>⚠ {error}</div>}

      <button style={{ ...s.btn, opacity: loading ? 0.6 : 1 }} disabled={loading}>
        {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </button>
    </form>
  )
}

const s = {
  title:  { color: '#fff', fontSize: '1.2rem', fontWeight: 700, marginBottom: '22px' },
  field:  { marginBottom: '16px' },
  label:  { display: 'block', color: '#888', fontSize: '0.78rem', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.6px' },
  input:  { width: '100%', padding: '11px 14px', background: '#0a1628', border: '1.5px solid #1a3a60', borderRadius: '8px', color: '#fff', fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit' },
  error:  { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', padding: '10px 14px', color: '#f87171', fontSize: '0.85rem', marginBottom: '14px' },
  btn:    { width: '100%', padding: '13px', background: '#e94560', color: '#fff', border: 'none', borderRadius: '50px', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginTop: '6px' },
}
