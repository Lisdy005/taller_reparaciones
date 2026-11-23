import { Link, NavLink, Outlet } from 'react-router'

const ENLACES = [
  { to: '/', texto: 'Panel', end: true },
  { to: '/ordenes', texto: 'Órdenes' },
  { to: '/recepcion', texto: 'Recibir equipo' },
  { to: '/clientes', texto: 'Clientes' },
]

function Layout() {
  return (
    <div className="app">
      <header className="cabecera">
        <div className="cabecera-contenido">
          <Link className="marca" to="/">
            <span className="marca-simbolo" aria-hidden="true"></span>
            Taller de Reparaciones
          </Link>
          <nav className="menu" aria-label="Principal">
            {ENLACES.map((enlace) => (
              <NavLink
                key={enlace.to}
                to={enlace.to}
                end={enlace.end}
                className={({ isActive }) => (isActive ? 'menu-enlace activo' : 'menu-enlace')}
              >
                {enlace.texto}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="contenido">
        <Outlet />
      </main>

      <footer className="pie">Taller de Reparaciones</footer>
    </div>
  )
}

export default Layout
