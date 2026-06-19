import { supabase } from './supabaseClient.js'

function setDot(id, state) {
  document.getElementById(id).className = `dot ${state}`
}

function setResult(id, text, state) {
  const el = document.getElementById(id)
  el.textContent = text
  el.className   = `result-box ${state}`
}

function enableAuthButtons() {
  document.getElementById('btn-login').disabled    = false
  document.getElementById('btn-register').disabled = false
  document.getElementById('btn-logout').disabled   = false
}

/* ── 1. VERIFICAR CONFIG ── */
const url = import.meta.env.VITE_SUPABASE_URL      || ''
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

const urlOk = url.startsWith('https://') && !url.includes('SUPABASE_URL')
const keyOk = key.length > 20            && !key.includes('SUPABASE_ANON_KEY')

document.getElementById('cfg-url').textContent = urlOk ? url : '⚠ Variable VITE_SUPABASE_URL no configurada'
document.getElementById('cfg-url').className   = `val ${urlOk ? 'ok' : 'fail'}`

document.getElementById('cfg-key').textContent = keyOk
  ? key.slice(0, 24) + '…' + key.slice(-6)
  : '⚠ Variable VITE_SUPABASE_ANON_KEY no configurada'
document.getElementById('cfg-key').className   = `val ${keyOk ? 'ok' : 'fail'}`

if (urlOk && keyOk) {
  setDot('dot-config', 'ok')
  document.getElementById('cfg-status').textContent = 'Credenciales configuradas correctamente'
  document.getElementById('cfg-status').className   = 'val ok'
} else {
  setDot('dot-config', 'fail')
  document.getElementById('cfg-status').textContent = 'Crea el archivo .env con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY'
  document.getElementById('cfg-status').className   = 'val fail'
}

/* ── 2. TEST CONEXIÓN ── */
try {
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    setDot('dot-conn', 'fail')
    setResult('res-conn', `❌ Error: ${error.message}`, 'fail')
  } else {
    setDot('dot-conn', 'ok')
    const session = data.session
    if (session) {
      setResult('res-conn',
        `✅ Conexión a Supabase OK\n\nSesión activa:\n  Usuario : ${session.user.email}\n  ID      : ${session.user.id}\n  Expira  : ${new Date(session.expires_at * 1000).toLocaleString()}`,
        'ok'
      )
    } else {
      setResult('res-conn', '✅ Conexión a Supabase OK\n\nNo hay sesión activa.', 'ok')
    }
    enableAuthButtons()
  }
} catch (err) {
  setDot('dot-conn', 'fail')
  setResult('res-conn', `❌ Excepción: ${err.message}\n\nVerifica las credenciales en tu archivo .env`, 'fail')
}

/* ── 3. AUTH ── */
function getCredentials() {
  return {
    email:    document.getElementById('test-email').value.trim(),
    password: document.getElementById('test-pass').value,
  }
}

document.getElementById('btn-login').addEventListener('click', async () => {
  const { email, password } = getCredentials()
  setDot('dot-auth', 'pending')
  setResult('res-auth', 'Ejecutando login...', '')
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    setDot('dot-auth', 'ok')
    setResult('res-auth', `✅ Login exitoso\n\n  Usuario : ${data.user.email}\n  ID      : ${data.user.id}`, 'ok')
  } catch (err) {
    setDot('dot-auth', 'fail')
    setResult('res-auth', `❌ Login fallido: ${err.message}`, 'fail')
  }
})

document.getElementById('btn-register').addEventListener('click', async () => {
  const { email, password } = getCredentials()
  setDot('dot-auth', 'pending')
  setResult('res-auth', 'Registrando usuario...', '')
  try {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    const needsConfirm = !data.session
    setDot('dot-auth', needsConfirm ? 'warn' : 'ok')
    setResult('res-auth',
      needsConfirm
        ? `⚠ Usuario registrado. Revisa tu email para confirmar.\n\n  Email : ${data.user.email}`
        : `✅ Registro + login exitoso\n\n  Usuario : ${data.user.email}\n  ID      : ${data.user.id}`,
      needsConfirm ? 'warn' : 'ok'
    )
  } catch (err) {
    setDot('dot-auth', 'fail')
    setResult('res-auth', `❌ Registro fallido: ${err.message}`, 'fail')
  }
})

document.getElementById('btn-logout').addEventListener('click', async () => {
  setResult('res-auth', 'Cerrando sesión...', '')
  const { error } = await supabase.auth.signOut()
  if (error) {
    setDot('dot-auth', 'fail')
    setResult('res-auth', `❌ Logout fallido: ${error.message}`, 'fail')
  } else {
    setDot('dot-auth', 'ok')
    setResult('res-auth', '✅ Sesión cerrada correctamente.', 'ok')
  }
})
