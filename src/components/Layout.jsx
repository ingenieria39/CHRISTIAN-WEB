import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'

export default function Layout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0d1117' }}>
      <Sidebar />
      <main style={{ flex: 1, overflow: 'auto', padding: '32px' }}>
        <Outlet />
      </main>
    </div>
  )
}
