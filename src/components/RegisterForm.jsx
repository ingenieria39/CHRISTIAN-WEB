import { useState } from 'react'
import { supabase } from '../supabaseClient.js'

export default function RegisterForm() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [msg,      setMsg]      = useState(null)
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setMsg(null)

    if (password.length < 6) {
      setMsg({ ok: false, text: 'La contraseña debe tener al menos 6 caracteres.' })
      return
    }

    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role: 'cliente' } },   // rol asignado automáticamente
    })

    if (error) {
      setMsg({ ok: false, text: error.message })
    } else if (data.session) {
      // Sesión inmediata (confirmación de email desactivada)
    } else {
      setMsg({ ok: true, text: '¡Cuenta creada! Revisa tu email para confirmarla.' })
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 style={s.title}>Crear cuenta</h2>
      <p style={s.note}>El registro es exclusivo para <strong style={{ color: '#3b82f6' }}>clientes</strong>.</p>

      <div style={s.field}>
        <label style={s.label}>Email</label>
        <input style={s.input} type="email" placeholder="tu@email.com"
          value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required />
      </div>

      <div style={s.field}>
        <label style={s.label}>Contraseña</label>
        <input style={s.input} type="password" placeholder="Mínimo 6 caracteres"
          value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" required />
      </div>

      {msg && <div style={msg.ok ? s.success : s.error}>{msg.ok ? '✓' : '⚠'} {msg.text}</div>}

      <button style={{ ...s.btn, opacity: loading ? 0.6 : 1 }} disabled={loading}>
        {loading ? 'Creando cuenta...' : 'Crear cuenta de cliente'}
      </button>
    </form>
  )
}

const s = {
  title:   { color: '#f1f5f9', fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' },
  note:    { color: '#6b7280', fontSize: '0.82rem', marginBottom: '20px' },
  field:   { marginBottom: '16px' },
  label:   { display: 'block', color: '#6b7280', fontSize: '0.75rem', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.6px' },
  input:   { width: '100%', padding: '11px 14px', background: '#0d1117', border: '1.5px solid #21262d', borderRadius: '8px', color: '#f1f5f9', fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit' },
  error:   { background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)', borderRadius: '8px', padding: '10px 14px', color: '#f87171', fontSize: '0.85rem', marginBottom: '14px' },
  success: { background: 'rgba(34,197,94,.1)',  border: '1px solid rgba(34,197,94,.25)',  borderRadius: '8px', padding: '10px 14px', color: '#86efac', fontSize: '0.85rem', marginBottom: '14px' },
  btn:     { width: '100%', padding: '13px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginTop: '6px' },
}
