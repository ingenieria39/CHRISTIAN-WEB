import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Layout           from './components/Layout.jsx'
import Home             from './pages/Home.jsx'
import Login            from './pages/Login.jsx'
import ClienteDashboard from './pages/ClienteDashboard.jsx'
import WorkerDashboard  from './pages/WorkerDashboard.jsx'
import Clientes         from './pages/Clientes.jsx'

/** Ruta base según rol */
const ROLE_HOME = {
  cliente:    '/cliente',
  trabajador: '/trabajador',
  admin:      '/admin',
}

export default function App() {
  const { loading } = useAuth()
  if (loading) return <Spinner />

  return (
    <BrowserRouter>
      <Routes>

        {/* ── Públicas ── */}
        <Route path="/"      element={<Home />} />
        <Route path="/login" element={<LoginRoute />} />

        {/* ── Redirecciones legacy ── */}
        <Route path="/app"          element={<AppRedirect />} />
        <Route path="/app/clientes" element={<Navigate to="/trabajador/clientes" replace />} />

        {/* ── Cliente ── */}
        <Route element={<AuthGuard />}>
          <Route element={<RoleGuard allowed={['cliente']} />}>
            <Route element={<Layout />}>
              <Route path="/cliente" element={<ClienteDashboard />} />
            </Route>
          </Route>
        </Route>

        {/* ── Trabajador ── */}
        <Route element={<AuthGuard />}>
          <Route element={<RoleGuard allowed={['trabajador', 'admin']} />}>
            <Route element={<Layout />}>
              <Route path="/trabajador"          element={<WorkerDashboard />} />
              <Route path="/trabajador/clientes" element={<Clientes />} />
            </Route>
          </Route>
        </Route>

        {/* ── Admin ── */}
        <Route element={<AuthGuard />}>
          <Route element={<RoleGuard allowed={['admin']} />}>
            <Route element={<Layout />}>
              <Route path="/admin" element={<AdminPlaceholder />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

/* ── Guards ──────────────────────────────────────── */

/** Exige sesión activa */
function AuthGuard() {
  const { session } = useAuth()
  if (!session) return <Navigate to="/login" replace />
  return <Outlet />
}

/** Exige que el rol del usuario esté en `allowed` */
function RoleGuard({ allowed }) {
  const { role } = useAuth()
  if (allowed.includes(role)) return <Outlet />
  return <Navigate to={ROLE_HOME[role] ?? '/login'} replace />
}

/* ── Rutas especiales ─────────────────────────────── */

/** /login → redirige al panel correcto si ya tiene sesión Y rol resuelto */
function LoginRoute() {
  const { session, role, loading } = useAuth()
  if (loading) return null  // spinner ya está en App, no hacer nada aquí
  if (session && role) return <Navigate to={ROLE_HOME[role] ?? '/cliente'} replace />
  return <Login />
}

/** /app → redirige según rol (compatibilidad legacy) */
function AppRedirect() {
  const { session, role } = useAuth()
  if (!session) return <Navigate to="/login" replace />
  return <Navigate to={ROLE_HOME[role] ?? '/cliente'} replace />
}

/* ── Placeholder Admin ────────────────────────────── */

function AdminPlaceholder() {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⚙️</div>
      <h2 style={{ color: '#f1f5f9', marginBottom: '8px' }}>Panel de Administrador</h2>
      <p style={{ color: '#6b7280' }}>Módulo en desarrollo</p>
    </div>
  )
}

/* ── Spinner global ───────────────────────────────── */

function Spinner() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d1117' }}>
      <div style={{ width: '36px', height: '36px', border: '3px solid #1e2d45', borderTop: '3px solid #e94560', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
