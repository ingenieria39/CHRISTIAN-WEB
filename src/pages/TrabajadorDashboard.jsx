import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getClientStats } from '../services/clients.js'

const ACTIONS = [
  { label: 'Ver clientes',    desc: 'Listado completo de clientes',    href: '/trabajador/clientes', color: '#10b981', ready: true  },
  { label: 'Nueva solicitud', desc: 'Registrar manualmente',            href: '#',             color: '#3b82f6', ready: false },
  { label: 'Generar reporte', desc: 'Exportar datos del sistema',       href: '#',             color: '#8b5cf6', ready: false },
]

export default function TrabajadorDashboard() {
  const { user } = useAuth()
  const name  = user?.email?.split('@')[0] ?? 'Trabajador'
  const today = new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  const [stats,  setStats]  = useState({ total: 0, activos: 0, negociacion: 0, cerrados: 0 })
  const [loadSt, setLoadSt] = useState(true)

  useEffect(() => {
    getClientStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoadSt(false))
  }, [])

  const STAT_CARDS = [
    { label: 'Total clientes',    value: stats.total,       color: '#10b981' },
    { label: 'Activos',           value: stats.activos,     color: '#3b82f6' },
    { label: 'En negociación',    value: stats.negociacion, color: '#f59e0b' },
    { label: 'Cerrados',          value: stats.cerrados,    color: '#8b5cf6' },
  ]

  return (
    <div>

      {/* Header */}
      <div style={s.header}>
        <div>
          <div style={s.rolePill}>🛠️ Panel de Trabajador</div>
          <h1 style={s.title}>Hola, <span style={{ color: '#10b981' }}>{name}</span> 👋</h1>
          <p style={s.sub}>{today}</p>
        </div>
        <div style={s.statusBadge}>
          <span style={s.statusDot} />
          Sistema operativo
        </div>
      </div>

      {/* Stats */}
      <div style={s.grid4}>
        {STAT_CARDS.map(st => (
          <div key={st.label} style={s.statCard}>
            <div style={{ ...s.statBar, background: st.color }} />
            <p style={{ ...s.statVal, color: st.color }}>
              {loadSt ? <span style={s.skeleton} /> : st.value}
            </p>
            <p style={s.statLabel}>{st.label}</p>
          </div>
        ))}
      </div>

      <div style={s.grid2}>

        {/* Acciones rápidas */}
        <div style={s.section}>
          <h2 style={s.sectionTitle}>Acciones rápidas</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {ACTIONS.map(a => (
              a.ready
                ? <Link key={a.label} to={a.href} style={s.actionLink}>
                    <div style={{ ...s.actionDot, background: a.color }} />
                    <div>
                      <p style={s.actionLabel}>{a.label}</p>
                      <p style={s.actionDesc}>{a.desc}</p>
                    </div>
                    <span style={s.actionArrow}>→</span>
                  </Link>
                : <div key={a.label} style={{ ...s.actionLink, opacity: 0.4, cursor: 'not-allowed' }}>
                    <div style={{ ...s.actionDot, background: a.color }} />
                    <div>
                      <p style={s.actionLabel}>{a.label}</p>
                      <p style={s.actionDesc}>{a.desc} · Próximamente</p>
                    </div>
                  </div>
            ))}
          </div>
        </div>

        {/* Estado del sistema */}
        <div style={s.section}>
          <h2 style={s.sectionTitle}>Estado del sistema</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <StatusRow label="Supabase Auth"   status="Conectado"      ok />
            <StatusRow label="Base de datos"   status="Operativa"      ok />
            <StatusRow label="Módulo Clientes" status="Disponible"     ok />
            <StatusRow label="Reportes"        status="En desarrollo"     />
            <StatusRow label="Notificaciones"  status="En desarrollo"     />
          </div>
          <div style={s.sysNote}>
            <p style={s.sysNoteText}>
              Acceso completo de trabajador verificado. Rol: <strong style={{ color: '#10b981' }}>trabajador</strong>
            </p>
          </div>
        </div>

      </div>

    </div>
  )
}

function StatusRow({ label, status, ok }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>{label}</span>
      <span style={{ background: ok ? 'rgba(16,185,129,.1)' : 'rgba(107,114,128,.1)', border: `1px solid ${ok ? 'rgba(16,185,129,.25)' : 'rgba(107,114,128,.2)'}`, color: ok ? '#10b981' : '#6b7280', borderRadius: '20px', padding: '2px 10px', fontSize: '0.72rem', fontWeight: 600 }}>
        {ok ? '● ' : '○ '}{status}
      </span>
    </div>
  )
}

const s = {
  header:      { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' },
  rolePill:    { display: 'inline-block', background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.25)', color: '#10b981', borderRadius: '20px', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '10px' },
  title:       { color: '#f1f5f9', fontSize: '1.6rem', fontWeight: 700, marginBottom: '4px' },
  sub:         { color: '#4b5563', fontSize: '0.85rem', textTransform: 'capitalize' },
  statusBadge: { display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.2)', color: '#10b981', borderRadius: '8px', padding: '8px 14px', fontSize: '0.82rem', fontWeight: 600, alignSelf: 'flex-start' },
  statusDot:   { width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' },
  grid4:       { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '14px', marginBottom: '20px' },
  statCard:    { background: '#161b22', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '18px', position: 'relative', overflow: 'hidden' },
  statBar:     { position: 'absolute', top: 0, left: 0, right: 0, height: '3px' },
  statVal:     { fontSize: '1.8rem', fontWeight: 800, margin: '6px 0 4px', minHeight: '2.2rem', display: 'flex', alignItems: 'center' },
  statLabel:   { color: '#6b7280', fontSize: '0.82rem', fontWeight: 500, margin: 0 },
  skeleton:    { display: 'inline-block', width: '40px', height: '1.6rem', background: 'rgba(255,255,255,.06)', borderRadius: '6px' },
  grid2:       { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '16px' },
  section:     { background: '#161b22', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '20px' },
  sectionTitle:{ color: '#f1f5f9', fontSize: '0.95rem', fontWeight: 600, marginBottom: '16px' },
  actionLink:  { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.05)', borderRadius: '8px', textDecoration: 'none', cursor: 'pointer' },
  actionDot:   { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0 },
  actionLabel: { color: '#e2e8f0', fontSize: '0.875rem', fontWeight: 500, margin: '0 0 2px' },
  actionDesc:  { color: '#4b5563', fontSize: '0.78rem', margin: 0 },
  actionArrow: { color: '#374151', marginLeft: 'auto', fontSize: '0.9rem' },
  sysNote:     { marginTop: '14px', padding: '10px 12px', background: 'rgba(16,185,129,.05)', borderRadius: '7px', border: '1px solid rgba(16,185,129,.12)' },
  sysNoteText: { color: '#4b5563', fontSize: '0.8rem', margin: 0 },
}
