import { useAuth } from '../context/AuthContext.jsx'

const CARDS = [
  { label: 'Mis solicitudes',   value: '0', color: '#3b82f6', note: 'Sin solicitudes activas' },
  { label: 'Estado de cuenta',  value: '✓', color: '#10b981', note: 'Cuenta activa' },
  { label: 'Próximas citas',    value: '0', color: '#f59e0b', note: 'Sin citas programadas' },
]

export default function ClienteDashboard() {
  const { user } = useAuth()
  const name = user?.email?.split('@')[0] ?? 'Cliente'
  const since = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—'

  return (
    <div>

      {/* Header */}
      <div style={s.header}>
        <div>
          <div style={s.rolePill}>👤 Panel de Cliente</div>
          <h1 style={s.title}>Hola, <span style={{ color: '#3b82f6' }}>{name}</span> 👋</h1>
          <p style={s.sub}>Bienvenido a tu panel personal. Aquí verás toda tu actividad.</p>
        </div>
      </div>

      {/* Cards */}
      <div style={s.grid3}>
        {CARDS.map(c => (
          <div key={c.label} style={s.card}>
            <div style={{ ...s.cardBar, background: c.color }} />
            <p style={{ ...s.cardVal, color: c.color }}>{c.value}</p>
            <p style={s.cardLabel}>{c.label}</p>
            <p style={s.cardNote}>{c.note}</p>
          </div>
        ))}
      </div>

      {/* Info */}
      <div style={s.grid2}>

        <div style={s.section}>
          <h2 style={s.sectionTitle}>Mi información</h2>
          <div style={s.infoTable}>
            <InfoRow label="Email"         value={user?.email} />
            <InfoRow label="Rol"           value="Cliente" badge="#3b82f6" />
            <InfoRow label="Miembro desde" value={since} />
            <InfoRow label="ID de cuenta"  value={user?.id?.slice(0, 16) + '...'} mono last />
          </div>
        </div>

        <div style={s.section}>
          <h2 style={s.sectionTitle}>Actividad reciente</h2>
          <div style={s.emptyState}>
            <p style={s.emptyIcon}>📋</p>
            <p style={s.emptyTitle}>Sin actividad reciente</p>
            <p style={s.emptyDesc}>Aquí aparecerá tu historial de solicitudes y actividad.</p>
          </div>
        </div>

      </div>

      {/* Note */}
      <div style={s.note}>
        <span style={s.noteDot} />
        <p style={s.noteText}>
          Para hacer una solicitud o necesitar ayuda, comunícate con nuestro equipo interno.
          Las funciones adicionales estarán disponibles próximamente.
        </p>
      </div>

    </div>
  )
}

function InfoRow({ label, value, badge, mono, last }) {
  return (
    <div style={{ ...s.infoRow, ...(last ? { borderBottom: 'none' } : {}) }}>
      <span style={s.infoLabel}>{label}</span>
      {badge
        ? <span style={{ background: `${badge}18`, border: `1px solid ${badge}30`, color: badge, borderRadius: '20px', padding: '2px 10px', fontSize: '0.75rem', fontWeight: 600 }}>{value}</span>
        : <span style={{ ...s.infoValue, ...(mono ? { fontFamily: 'monospace', fontSize: '0.78rem' } : {}) }}>{value}</span>
      }
    </div>
  )
}

const s = {
  header:   { marginBottom: '24px' },
  rolePill: { display: 'inline-block', background: 'rgba(59,130,246,.1)', border: '1px solid rgba(59,130,246,.25)', color: '#3b82f6', borderRadius: '20px', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '10px' },
  title:    { color: '#f1f5f9', fontSize: '1.6rem', fontWeight: 700, marginBottom: '4px' },
  sub:      { color: '#4b5563', fontSize: '0.875rem' },
  grid3:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '16px', marginBottom: '24px' },
  card:     { background: '#161b22', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '20px', position: 'relative', overflow: 'hidden' },
  cardBar:  { position: 'absolute', top: 0, left: 0, right: 0, height: '3px' },
  cardVal:  { fontSize: '1.8rem', fontWeight: 800, margin: '6px 0 4px' },
  cardLabel:{ color: '#9ca3af', fontSize: '0.85rem', fontWeight: 500, margin: '0 0 3px' },
  cardNote: { color: '#374151', fontSize: '0.75rem', margin: 0 },
  grid2:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '16px', marginBottom: '16px' },
  section:  { background: '#161b22', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '20px' },
  sectionTitle: { color: '#f1f5f9', fontSize: '0.95rem', fontWeight: 600, marginBottom: '16px' },
  infoTable:{ display: 'flex', flexDirection: 'column' },
  infoRow:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', gap: '8px' },
  infoLabel:{ color: '#6b7280', fontSize: '0.8rem' },
  infoValue:{ color: '#d1d5db', fontSize: '0.85rem', textAlign: 'right', wordBreak: 'break-all' },
  emptyState:{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '30px 0', textAlign: 'center' },
  emptyIcon: { fontSize: '2rem', marginBottom: '10px' },
  emptyTitle:{ color: '#6b7280', fontSize: '0.9rem', fontWeight: 600, marginBottom: '6px' },
  emptyDesc: { color: '#374151', fontSize: '0.8rem', lineHeight: 1.5 },
  note:     { display: 'flex', alignItems: 'flex-start', gap: '8px', background: 'rgba(59,130,246,.05)', border: '1px solid rgba(59,130,246,.12)', borderRadius: '8px', padding: '12px 14px' },
  noteDot:  { width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6', marginTop: '5px', flexShrink: 0 },
  noteText: { color: '#4b5563', fontSize: '0.82rem', lineHeight: 1.6, margin: 0 },
}
