import { Link } from 'react-router-dom'

const FEATURES = [
  { icon: '👥', title: 'Gestión de Clientes',   desc: 'Centraliza toda la información de tus clientes en un solo lugar.' },
  { icon: '📊', title: 'Panel de Control',       desc: 'Visualiza métricas y estadísticas de tu negocio en tiempo real.' },
  { icon: '🔐', title: 'Acceso por Roles',       desc: 'Control de acceso diferenciado para clientes y trabajadores.' },
  { icon: '☁️', title: 'Basado en la Nube',      desc: 'Sincronización automática con Supabase. Siempre actualizado.' },
]

export default function Home() {
  return (
    <div style={s.page}>

      {/* Navbar */}
      <nav style={s.nav}>
        <div style={s.navBrand}>
          <img src="/assets/Logo MIC 2024_3D (3).png" alt="Logo" style={s.navLogo} />
          <span style={s.navTitle}>Christian CRM</span>
        </div>
        <Link to="/login" style={s.navBtn}>Iniciar sesión →</Link>
      </nav>

      {/* Hero */}
      <section style={s.hero}>
        <div style={s.heroGlow} />
        <p style={s.heroEyebrow}>Sistema empresarial</p>
        <h1 style={s.heroTitle}>
          Gestiona tu negocio<br />
          <span style={s.heroAccent}>de forma inteligente</span>
        </h1>
        <p style={s.heroDesc}>
          Plataforma SaaS completa para gestionar clientes, equipos y procesos.<br />
          Acceso seguro con roles diferenciados.
        </p>
        <div style={s.heroCta}>
          <Link to="/login" style={s.btnPrimary}>Comenzar ahora</Link>
          <a href="#features" style={s.btnGhost}>Ver funciones ↓</a>
        </div>

        {/* Stats */}
        <div style={s.stats}>
          {[['Roles',  '2', 'Cliente · Trabajador'],
            ['Auth',   '✓', 'Supabase Auth'],
            ['Cloud',  '✓', 'Tiempo real']].map(([label, val, sub]) => (
            <div key={label} style={s.stat}>
              <p style={s.statVal}>{val}</p>
              <p style={s.statLabel}>{label}</p>
              <p style={s.statSub}>{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={s.features}>
        <p style={s.sectionEye}>FUNCIONALIDADES</p>
        <h2 style={s.sectionTitle}>Todo lo que necesitas</h2>
        <div style={s.grid}>
          {FEATURES.map(f => (
            <div key={f.title} style={s.card}>
              <div style={s.cardIcon}>{f.icon}</div>
              <h3 style={s.cardTitle}>{f.title}</h3>
              <p style={s.cardDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section style={s.roles}>
        <p style={s.sectionEye}>ACCESO</p>
        <h2 style={s.sectionTitle}>Dos tipos de acceso</h2>
        <div style={s.rolesGrid}>

          <div style={{ ...s.roleCard, borderColor: 'rgba(59,130,246,.3)' }}>
            <div style={{ ...s.roleIcon, background: 'rgba(59,130,246,.1)', color: '#3b82f6' }}>👤</div>
            <h3 style={s.roleTitle}>Cliente</h3>
            <ul style={s.roleList}>
              <li>✓ Registro público</li>
              <li>✓ Panel personal</li>
              <li>✓ Ver sus solicitudes</li>
              <li>✓ Historial de actividad</li>
            </ul>
            <Link to="/login" style={{ ...s.roleBtn, background: '#3b82f6' }}>Registrarme como cliente</Link>
          </div>

          <div style={{ ...s.roleCard, borderColor: 'rgba(16,185,129,.3)' }}>
            <div style={{ ...s.roleIcon, background: 'rgba(16,185,129,.1)', color: '#10b981' }}>🛠️</div>
            <h3 style={s.roleTitle}>Trabajador</h3>
            <ul style={s.roleList}>
              <li>✓ Acceso interno</li>
              <li>✓ Gestión de clientes</li>
              <li>✓ Panel de control</li>
              <li>✗ Registro público (interno)</li>
            </ul>
            <Link to="/login" style={{ ...s.roleBtn, background: '#10b981' }}>Ingresar como trabajador</Link>
          </div>

        </div>
      </section>

      {/* CTA final */}
      <section style={s.cta}>
        <h2 style={s.ctaTitle}>¿Listo para comenzar?</h2>
        <p style={s.ctaDesc}>Accede a tu panel o crea tu cuenta de cliente en segundos.</p>
        <Link to="/login" style={s.btnPrimary}>Ir al login →</Link>
      </section>

      {/* Footer */}
      <footer style={s.footer}>
        <span>© 2026 Christian CRM</span>
        <span style={{ color: '#374151' }}>·</span>
        <span>Construido con Supabase + Vite + React</span>
      </footer>

    </div>
  )
}

const s = {
  page:        { minHeight: '100vh', background: '#0d1117', color: '#f1f5f9', fontFamily: "'Segoe UI', sans-serif" },
  nav:         { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 6%', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'sticky', top: 0, background: 'rgba(13,17,23,.9)', backdropFilter: 'blur(10px)', zIndex: 10 },
  navBrand:    { display: 'flex', alignItems: 'center', gap: '10px' },
  navLogo:     { width: '32px', height: '32px', objectFit: 'contain' },
  navTitle:    { fontWeight: 700, fontSize: '1rem', color: '#f1f5f9' },
  navBtn:      { background: '#e94560', color: '#fff', padding: '8px 20px', borderRadius: '8px', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 },
  hero:        { textAlign: 'center', padding: '80px 6% 70px', position: 'relative', overflow: 'hidden' },
  heroGlow:    { position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '300px', background: 'radial-gradient(ellipse, rgba(233,69,96,.15) 0%, transparent 70%)', pointerEvents: 'none' },
  heroEyebrow: { color: '#e94560', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' },
  heroTitle:   { fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '20px' },
  heroAccent:  { color: '#e94560' },
  heroDesc:    { color: '#6b7280', fontSize: '1.05rem', lineHeight: 1.7, maxWidth: '560px', margin: '0 auto 32px' },
  heroCta:     { display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '56px' },
  btnPrimary:  { background: '#e94560', color: '#fff', padding: '12px 28px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '0.95rem', display: 'inline-block' },
  btnGhost:    { background: 'transparent', color: '#6b7280', padding: '12px 28px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem', border: '1px solid rgba(255,255,255,0.1)', display: 'inline-block' },
  stats:       { display: 'flex', justifyContent: 'center', gap: '48px', flexWrap: 'wrap' },
  stat:        { textAlign: 'center' },
  statVal:     { color: '#e94560', fontSize: '1.6rem', fontWeight: 800, margin: '0 0 2px' },
  statLabel:   { color: '#f1f5f9', fontSize: '0.9rem', fontWeight: 600, margin: '0 0 2px' },
  statSub:     { color: '#4b5563', fontSize: '0.75rem', margin: 0 },
  features:    { padding: '70px 6%', background: '#111827', textAlign: 'center' },
  sectionEye:  { color: '#e94560', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2px', marginBottom: '10px' },
  sectionTitle:{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '40px' },
  grid:        { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '20px', maxWidth: '900px', margin: '0 auto' },
  card:        { background: '#161b22', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '28px 24px', textAlign: 'left' },
  cardIcon:    { fontSize: '1.8rem', marginBottom: '14px' },
  cardTitle:   { color: '#f1f5f9', fontWeight: 600, fontSize: '1rem', marginBottom: '8px' },
  cardDesc:    { color: '#6b7280', fontSize: '0.85rem', lineHeight: 1.6 },
  roles:       { padding: '70px 6%', textAlign: 'center' },
  rolesGrid:   { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '24px', maxWidth: '700px', margin: '0 auto' },
  roleCard:    { background: '#111827', border: '1px solid', borderRadius: '14px', padding: '32px 28px', textAlign: 'left' },
  roleIcon:    { width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', marginBottom: '16px' },
  roleTitle:   { color: '#f1f5f9', fontWeight: 700, fontSize: '1.15rem', marginBottom: '16px' },
  roleList:    { color: '#6b7280', fontSize: '0.85rem', lineHeight: 2, paddingLeft: '0', listStyle: 'none', marginBottom: '24px' },
  roleBtn:     { display: 'block', textAlign: 'center', color: '#fff', padding: '11px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '0.875rem' },
  cta:         { padding: '70px 6%', textAlign: 'center', background: '#111827' },
  ctaTitle:    { fontSize: '1.8rem', fontWeight: 700, marginBottom: '12px' },
  ctaDesc:     { color: '#6b7280', marginBottom: '28px' },
  footer:      { display: 'flex', justifyContent: 'center', gap: '12px', padding: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', color: '#4b5563', fontSize: '0.8rem' },
}
