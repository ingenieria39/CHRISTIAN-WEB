import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getClients, getClientStats } from '../services/clients.js'

const STATUS_META = {
  activo:      { label: 'Activo',      color: '#22c55e' },
  negociacion: { label: 'Negociación', color: '#f59e0b' },
  cerrado:     { label: 'Cerrado',     color: '#6b7280' },
  pausado:     { label: 'Pausado',     color: '#ef4444' },
}

export default function WorkerDashboard() {
  const { user } = useAuth()
  const name  = user?.email?.split('@')[0] ?? 'Trabajador'
  const today = new Date().toLocaleDateString('es-PE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  const [stats,   setStats]   = useState({ total: 0, activos: 0, negociacion: 0, cerrados: 0 })
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    Promise.all([getClientStats(), getClients()])
      .then(([st, cl]) => {
        setStats(st)
        setClients(cl.slice(0, 8))
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const STAT_CARDS = [
    { label: 'Total clientes',  value: stats.total,       color: '#10b981' },
    { label: 'Activos',         value: stats.activos,     color: '#3b82f6' },
    { label: 'En negociación',  value: stats.negociacion, color: '#f59e0b' },
    { label: 'Cerrados',        value: stats.cerrados,    color: '#8b5cf6' },
  ]

  return (
    <div>

      {/* Header */}
      <div style={s.header}>
        <div>
          <div style={s.rolePill}>🛠️ Panel de Trabajador</div>
          <h1 style={s.title}>
            Hola, <span style={{ color: '#10b981' }}>{name}</span>
          </h1>
          <p style={s.sub}>{today}</p>
        </div>
        <Link to="/trabajador/clientes" style={s.linkBtn}>
          Ver todos los clientes →
        </Link>
      </div>

      {/* Stat cards */}
      <div style={s.grid4}>
        {STAT_CARDS.map(st => (
          <div key={st.label} style={s.statCard}>
            <div style={{ ...s.statBar, background: st.color }} />
            <p style={{ ...s.statVal, color: st.color }}>
              {loading ? <span style={s.skeleton} /> : st.value}
            </p>
            <p style={s.statLabel}>{st.label}</p>
          </div>
        ))}
      </div>

      {/* Clientes asignados */}
      <div style={s.section}>
        <div style={s.sectionHead}>
          <h2 style={s.sectionTitle}>Clientes asignados</h2>
          {!loading && clients.length > 0 && (
            <Link to="/trabajador/clientes" style={s.seeAll}>Ver todos →</Link>
          )}
        </div>

        {error && (
          <div style={s.errorBox}>⚠ {error}</div>
        )}

        {loading ? (
          <LoadingRows />
        ) : clients.length === 0 ? (
          <div style={s.empty}>
            <p style={{ fontSize: '1.8rem', marginBottom: '10px' }}>👥</p>
            <p style={s.emptyTitle}>Sin clientes asignados</p>
            <p style={s.emptyDesc}>
              Los clientes asignados a ti aparecerán aquí.
              {!error && (
                <> Asegúrate de ejecutar la migración SQL en Supabase si es la primera vez.</>
              )}
            </p>
            <Link to="/trabajador/clientes" style={{ ...s.linkBtn, display: 'inline-block', marginTop: '14px' }}>
              Ir a sección de clientes
            </Link>
          </div>
        ) : (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  {['Nombre', 'Empresa', 'Email', 'Estado', 'Etapa pipeline', 'Fecha'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clients.map(c => (
                  <tr key={c.id} style={s.tr}>
                    <td style={s.td}><span style={s.clientName}>{c.name}</span></td>
                    <td style={s.td}><span style={s.muted}>{c.company || '—'}</span></td>
                    <td style={s.td}><span style={s.muted}>{c.email   || '—'}</span></td>
                    <td style={s.td}><StatusBadge status={c.status} /></td>
                    <td style={s.td}><PipelineBadge stage={c.pipeline?.[0]?.stage} /></td>
                    <td style={s.td}><span style={s.muted}>{new Date(c.created_at).toLocaleDateString('es-PE')}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}

function StatusBadge({ status }) {
  const m = STATUS_META[status] ?? { label: status || '—', color: '#6b7280' }
  return (
    <span style={{ background: `${m.color}18`, border: `1px solid ${m.color}30`, color: m.color, borderRadius: '20px', padding: '3px 10px', fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
      {m.label}
    </span>
  )
}

function PipelineBadge({ stage }) {
  if (!stage) return <span style={{ color: '#374151', fontSize: '0.78rem' }}>—</span>
  return (
    <span style={{ background: `${stage.color}18`, border: `1px solid ${stage.color}30`, color: stage.color, borderRadius: '20px', padding: '3px 10px', fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
      {stage.name}
    </span>
  )
}

function LoadingRows() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px 0' }}>
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{ height: '42px', background: 'rgba(255,255,255,.03)', borderRadius: '6px', animation: 'pulse 1.5s ease-in-out infinite' }} />
      ))}
      <style>{`@keyframes pulse{0%,100%{opacity:.6}50%{opacity:1}}`}</style>
    </div>
  )
}

const s = {
  header:      { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' },
  rolePill:    { display: 'inline-block', background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.25)', color: '#10b981', borderRadius: '20px', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '10px' },
  title:       { color: '#f1f5f9', fontSize: '1.6rem', fontWeight: 700, marginBottom: '4px' },
  sub:         { color: '#4b5563', fontSize: '0.85rem', textTransform: 'capitalize' },
  linkBtn:     { background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.2)', color: '#10b981', borderRadius: '8px', padding: '8px 14px', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none', alignSelf: 'flex-start' },
  grid4:       { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '14px', marginBottom: '20px' },
  statCard:    { background: '#161b22', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '18px', position: 'relative', overflow: 'hidden' },
  statBar:     { position: 'absolute', top: 0, left: 0, right: 0, height: '3px' },
  statVal:     { fontSize: '1.8rem', fontWeight: 800, margin: '6px 0 4px', minHeight: '2.2rem', display: 'flex', alignItems: 'center' },
  statLabel:   { color: '#6b7280', fontSize: '0.82rem', fontWeight: 500, margin: 0 },
  skeleton:    { display: 'inline-block', width: '40px', height: '1.6rem', background: 'rgba(255,255,255,.06)', borderRadius: '6px' },
  section:     { background: '#161b22', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '20px' },
  sectionHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  sectionTitle:{ color: '#f1f5f9', fontSize: '0.95rem', fontWeight: 600, margin: 0 },
  seeAll:      { color: '#10b981', fontSize: '0.8rem', textDecoration: 'none' },
  errorBox:    { background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', color: '#f87171', borderRadius: '8px', padding: '10px 14px', fontSize: '0.82rem', marginBottom: '14px' },
  empty:       { textAlign: 'center', padding: '40px 20px' },
  emptyTitle:  { color: '#6b7280', fontWeight: 600, marginBottom: '8px', fontSize: '0.95rem' },
  emptyDesc:   { color: '#374151', fontSize: '0.82rem', lineHeight: 1.6, maxWidth: '340px', margin: '0 auto' },
  tableWrap:   { overflow: 'auto' },
  table:       { width: '100%', borderCollapse: 'collapse', minWidth: '620px' },
  th:          { padding: '10px 14px', textAlign: 'left', color: '#4b5563', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid rgba(255,255,255,.06)', whiteSpace: 'nowrap' },
  tr:          { borderBottom: '1px solid rgba(255,255,255,.04)' },
  td:          { padding: '11px 14px', verticalAlign: 'middle' },
  clientName:  { color: '#e2e8f0', fontSize: '0.875rem', fontWeight: 500 },
  muted:       { color: '#6b7280', fontSize: '0.82rem' },
}
