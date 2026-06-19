import { useState } from 'react'
import { Link } from 'react-router-dom'
import LoginForm    from '../components/LoginForm.jsx'
import RegisterForm from '../components/RegisterForm.jsx'

export default function Login() {
  const [tab, setTab] = useState('login')

  return (
    <div style={s.page}>

      <Link to="/" style={s.back}>← Volver al inicio</Link>

      <div style={s.header}>
        <img src="/assets/Logo MIC 2024_3D (3).png" alt="Logo" style={s.logo} />
        <h1 style={s.brand}>Christian CRM</h1>
        <p style={s.sub}>Sistema de gestión empresarial</p>
      </div>

      <div style={s.card}>
        <div style={s.tabs}>
          <Tab label="Iniciar sesión" active={tab === 'login'}    onClick={() => setTab('login')} />
          <Tab label="Registrarse"    active={tab === 'register'} onClick={() => setTab('register')} />
        </div>
        <div style={s.body}>
          {tab === 'login' ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>

      {tab === 'login' && (
        <p style={s.hint}>
          ¿Eres trabajador? Usa tus credenciales internas para acceder.
        </p>
      )}

    </div>
  )
}

function Tab({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, background: 'none', border: 'none',
      borderBottom: active ? '2px solid #e94560' : '2px solid transparent',
      color: active ? '#e94560' : '#4b5563',
      fontSize: '0.875rem', fontWeight: 600,
      padding: '14px 0', cursor: 'pointer',
      fontFamily: 'inherit', marginBottom: '-1px',
    }}>
      {label}
    </button>
  )
}

const s = {
  page:   { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0d1117 0%, #111827 100%)', padding: '24px', position: 'relative' },
  back:   { position: 'absolute', top: '24px', left: '24px', color: '#4b5563', fontSize: '0.82rem', textDecoration: 'none', fontWeight: 500 },
  header: { textAlign: 'center', marginBottom: '24px' },
  logo:   { width: '68px', marginBottom: '12px', filter: 'drop-shadow(0 4px 16px rgba(233,69,96,.3))' },
  brand:  { color: '#f1f5f9', fontSize: '1.4rem', fontWeight: 700, marginBottom: '4px' },
  sub:    { color: '#4b5563', fontSize: '0.82rem' },
  card:   { background: '#161b22', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', width: '100%', maxWidth: '400px', boxShadow: '0 8px 40px rgba(0,0,0,.5)', overflow: 'hidden' },
  tabs:   { display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)' },
  body:   { padding: '28px 30px 32px' },
  hint:   { color: '#374151', fontSize: '0.78rem', marginTop: '16px', textAlign: 'center' },
}
