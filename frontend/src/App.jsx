import { Route, Routes } from 'react-router'
import Layout from './componentes/Layout.jsx'
import Panel from './paginas/Panel.jsx'
import ListaOrdenes from './paginas/ListaOrdenes.jsx'
import DetalleOrden from './paginas/DetalleOrden.jsx'
import NuevaOrden from './paginas/NuevaOrden.jsx'
import Clientes from './paginas/Clientes.jsx'
import NoEncontrada from './paginas/NoEncontrada.jsx'

// Todas las rutas en un solo lugar. Layout es el diseño común (cabecera y
// menú) y dibuja la página hija en su <Outlet />.
function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Panel />} />
        <Route path="ordenes" element={<ListaOrdenes />} />
        <Route path="ordenes/:id" element={<DetalleOrden />} />
        <Route path="recepcion" element={<NuevaOrden />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="*" element={<NoEncontrada />} />
      </Route>
    </Routes>
  )
}

export default App
