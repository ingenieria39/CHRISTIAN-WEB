import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase } from '../supabaseClient.js'

const NAV_CLIENTE = [
  { to: '/cliente', label: 'Mi Panel', icon: <IconGrid />, end: true },
]

const NAV_TRABAJADOR = [
  { to: '/trabajador',          label: 'Dashboard', icon: <IconGrid />,  end: true },
  { to: '/trabajador/clientes', label: 'Clientes',  icon: <IconUsers />          },
]

const NAV_ADMIN = [
  { to: '/admin',               label: 'Admin',     icon: <IconGrid />,  end: true },
  { to: '/trabajador/clientes', label: 'Clientes',  icon: <IconUsers />          },
]

const ROLE_CONFIG = {
  trabajador: { nav: NAV_TRABAJADOR, color: '#10b981', label: 'Trabajador' },
  admin:      { nav: NAV_ADMIN,      color: '#e94560', label: 'Admin'      },
  cliente:    { nav: NAV_CLIENTE,    color: '#3b82f6', label: 'Cliente'    },
}

export default function Sidebar() {
  const { user, role } = useAuth()
  const { nav, color, label } = ROLE_CONFIG[role] ?? ROLE_CONFIG.cliente

  return (
    <aside style={s.sidebar}>

      {/* Logo */}
      <div style={s.logo}>
        <img src="/assets/Logo MIC 2024_3D (3).png" alt="Logo" style={s.logoImg} />
        <span style={s.logoText}>Christian CRM</span>
      </div>

      {/* Role badge */}
      <div style={{ padding: '0 16px 16px' }}>
        <span style={{ ...s.roleBadge, background: `${color}18`, border: `1px solid ${color}30`, color }}>
          ● {label}
        </span>
      </div>

      {/* Nav */}
      <nav style={s.nav}>
        <p style={s.navLabel}>MENÚ</p>
        {nav.map(({ to, label: lbl, icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end ?? false}
            style={({ isActive }) => ({ ...s.link, ...(isActive ? { background: `${color}12`, color } : {}) })}
          >
            <span style={s.icon}>{icon}</span>
            {lbl}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div style={s.user}>
        <div style={{ ...s.avatar, background: `linear-gradient(135deg, ${color}, ${color}99)` }}>
          {user?.email?.[0]?.toUpperCase()}
        </div>
        <div style={s.userInfo}>
          <p style={s.userEmail}>{user?.email}</p>
          <button style={s.logoutBtn} onClick={() => supabase.auth.signOut()}>
            <IconLogout /> Cerrar sesión
          </button>
        </div>
      </div>

    </aside>
  )
}

function IconGrid() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
}

function IconUsers() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
}

function IconLogout() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ marginRight: '5px' }}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
}

const s = {
  sidebar:   { width: '230px', minHeight: '100vh', background: '#111827', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 },
  logo:      { display: 'flex', alignItems: 'center', gap: '10px', padding: '20px 16px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '14px' },
  logoImg:   { width: '30px', height: '30px', objectFit: 'contain' },
  logoText:  { color: '#f1f5f9', fontWeight: 700, fontSize: '0.9rem' },
  roleBadge: { display: 'inline-block', padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.5px' },
  nav:       { padding: '0 10px', flex: 1 },
  navLabel:  { color: '#374151', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '1px', marginBottom: '6px', paddingLeft: '10px' },
  link:      { display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '7px', color: '#6b7280', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, marginBottom: '2px', transition: 'all .15s' },
  icon:      { display: 'flex', alignItems: 'center' },
  user:      { display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.05)' },
  avatar:    { width: '32px', height: '32px', borderRadius: '50%', color: '#fff', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  userInfo:  { minWidth: 0 },
  userEmail: { color: '#6b7280', fontSize: '0.72rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '4px' },
  logoutBtn: { display: 'flex', alignItems: 'center', background: 'none', border: 'none', color: '#4b5563', fontSize: '0.72rem', cursor: 'pointer', padding: 0, fontFamily: 'inherit' },
}
