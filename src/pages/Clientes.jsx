import { useState, useEffect, useCallback } from 'react'
import { getClients } from '../services/clients.js'

const STATUS_META = {
  activo:      { label: 'Activo',      color: '#22c55e' },
  negociacion: { label: 'Negociación', color: '#f59e0b' },
  cerrado:     { label: 'Cerrado',     color: '#6b7280' },
  pausado:     { label: 'Pausado',     color: '#ef4444' },
}

export default function Clientes() {
  const [clients,  setClients]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [search,   setSearch]   = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setClients(await getClients())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = clients.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.company?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>

      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Clientes</h1>
          <p style={s.sub}>{clients.length} cliente{clients.length !== 1 ? 's' : ''} en total</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={s.btnRefresh} onClick={load} disabled={loading} title="Actualizar">
            {loading ? '⟳' : '↻'} Actualizar
          </button>
          <button style={s.btnNew} disabled title="Próximamente">
            + Nuevo cliente
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div style={s.toolbar}>
        <div style={s.searchWrap}>
          <svg style={s.searchIcon} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            style={s.search}
            placeholder="Buscar por nombre, email o empresa..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div style={s.badges}>
          {Object.entries(STATUS_META).map(([k, v]) => (
            <span key={k} style={{ ...s.badge, background: `${v.color}18`, border: `1px solid ${v.color}30`, color: v.color }}>
              {v.label}: {clients.filter(c => c.status === k).length}
            </span>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={s.errorBox}>
          ⚠ {error}
          <button style={s.retryBtn} onClick={load}>Reintentar</button>
        </div>
      )}

      {/* Table */}
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              {['Cliente', 'Empresa', 'Email', 'Teléfono', 'Estado', 'Etapa pipeline', 'Asignado a', 'Creado'].map(h => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={s.center}><div style={s.spinner} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} style={s.center}>
                {search ? (
                  <EmptyState icon="🔍" title="Sin resultados" desc={`No se encontraron clientes para "${search}"`} />
                ) : (
                  <EmptyState
                    icon="👥"
                    title="No hay clientes aún"
                    desc={<>Ejecuta la migración SQL en Supabase para comenzar a registrar clientes.<br/>La tabla <code style={s.code}>clients</code> debe existir.</>}
                  />
                )}
              </td></tr>
            ) : (
              filtered.map(client => (
                <tr key={client.id} style={s.tr}>
                  <td style={s.td}>
                    <div style={s.clientName}>{client.name}</div>
                  </td>
                  <td style={s.td}><span style={s.muted}>{client.company || '—'}</span></td>
                  <td style={s.td}><span style={s.muted}>{client.email || '—'}</span></td>
                  <td style={s.td}><span style={s.muted}>{client.phone || '—'}</span></td>
                  <td style={s.td}>
                    <StatusBadge status={client.status} />
                  </td>
                  <td style={s.td}>
                    <PipelineBadge stage={client.pipeline?.[0]?.stage} />
                  </td>
                  <td style={s.td}>
                    <span style={s.muted}>
                      {client.assigned_profile?.full_name || client.assigned_profile?.email || '—'}
                    </span>
                  </td>
                  <td style={s.td}>
                    <span style={s.muted}>{new Date(client.created_at).toLocaleDateString('es-PE')}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* SQL hint */}
      {!loading && !error && clients.length === 0 && !search && (
        <div style={s.hint}>
          <span style={s.hintDot} />
          <p style={s.hintText}>
            Ejecuta <code style={s.code}>supabase/migrations/001_crm_schema.sql</code> en el SQL Editor de Supabase para crear las tablas y comenzar.
          </p>
        </div>
      )}

    </div>
  )
}

function StatusBadge({ status }) {
  const m = STATUS_META[status] ?? { label: status, color: '#6b7280' }
  return (
    <span style={{ background: `${m.color}18`, border: `1px solid ${m.color}30`, color: m.color, borderRadius: '20px', padding: '3px 10px', fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
      {m.label}
    </span>
  )
}

function PipelineBadge({ stage }) {
  if (!stage) return <span style={{ color: '#374151', fontSize: '0.78rem' }}>Sin etapa</span>
  return (
    <span style={{ background: `${stage.color}18`, border: `1px solid ${stage.color}30`, color: stage.color, borderRadius: '20px', padding: '3px 10px', fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
      {stage.name}
    </span>
  )
}

function EmptyState({ icon, title, desc }) {
  return (
    <div style={{ padding: '50px 20px', maxWidth: '380px', margin: '0 auto' }}>
      <div style={{ fontSize: '2.2rem', marginBottom: '12px' }}>{icon}</div>
      <p style={{ color: '#6b7280', fontWeight: 600, marginBottom: '8px' }}>{title}</p>
      <p style={{ color: '#374151', fontSize: '0.85rem', lineHeight: 1.6 }}>{desc}</p>
    </div>
  )
}

const s = {
  header:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px', flexWrap: 'wrap', gap: '12px' },
  title:      { color: '#f1f5f9', fontSize: '1.5rem', fontWeight: 700, marginBottom: '2px' },
  sub:        { color: '#4b5563', fontSize: '0.85rem' },
  btnNew:     { background: '#e94560', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 16px', fontSize: '0.85rem', fontWeight: 600, cursor: 'not-allowed', fontFamily: 'inherit', opacity: 0.4 },
  btnRefresh: { background: 'transparent', color: '#6b7280', border: '1px solid rgba(255,255,255,.08)', borderRadius: '8px', padding: '9px 14px', fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit' },
  toolbar:    { display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap', alignItems: 'center' },
  searchWrap: { position: 'relative', flex: 1, minWidth: '200px' },
  searchIcon: { position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' },
  search:     { width: '100%', padding: '9px 12px 9px 34px', background: '#161b22', border: '1px solid rgba(255,255,255,.08)', borderRadius: '8px', color: '#f1f5f9', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' },
  badges:     { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  badge:      { borderRadius: '20px', padding: '4px 10px', fontSize: '0.72rem', fontWeight: 600 },
  errorBox:   { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', borderRadius: '8px', padding: '12px 16px', color: '#f87171', fontSize: '0.85rem', marginBottom: '14px' },
  retryBtn:   { background: 'rgba(239,68,68,.15)', color: '#f87171', border: 'none', borderRadius: '6px', padding: '5px 12px', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 },
  tableWrap:  { background: '#161b22', border: '1px solid rgba(255,255,255,.06)', borderRadius: '12px', overflow: 'auto', marginBottom: '14px' },
  table:      { width: '100%', borderCollapse: 'collapse', minWidth: '900px' },
  th:         { padding: '11px 16px', textAlign: 'left', color: '#4b5563', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid rgba(255,255,255,.06)', background: '#0d1117', whiteSpace: 'nowrap' },
  tr:         { borderBottom: '1px solid rgba(255,255,255,.04)' },
  td:         { padding: '12px 16px', verticalAlign: 'middle' },
  clientName: { color: '#e2e8f0', fontSize: '0.875rem', fontWeight: 500 },
  muted:      { color: '#6b7280', fontSize: '0.82rem' },
  center:     { padding: '40px', textAlign: 'center' },
  spinner:    { width: '28px', height: '28px', border: '2px solid #1e2d45', borderTop: '2px solid #e94560', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto' },
  hint:       { display: 'flex', alignItems: 'flex-start', gap: '8px', background: 'rgba(59,130,246,.05)', border: '1px solid rgba(59,130,246,.12)', borderRadius: '8px', padding: '11px 14px' },
  hintDot:    { width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6', marginTop: '5px', flexShrink: 0 },
  hintText:   { color: '#4b5563', fontSize: '0.8rem', lineHeight: 1.6, margin: 0 },
  code:       { background: 'rgba(255,255,255,.06)', color: '#9ca3af', padding: '1px 5px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.9em' },
}
