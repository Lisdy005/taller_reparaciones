import { Link, useNavigate } from 'react-router'
import EtiquetaEstado from './EtiquetaEstado.jsx'
import TiempoEnTaller from './TiempoEnTaller.jsx'
import { FINALES, formatearFecha } from '../etapas.js'

function TablaOrdenes({ ordenes }) {
  const navigate = useNavigate()

  if (ordenes.length === 0) {
    return <p className="tarjeta vacio">No hay órdenes que coincidan con el filtro.</p>
  }

  return (
    <div className="tabla-contenedor">
      <table className="tabla tabla-clicable">
        <thead>
          <tr>
            <th>Equipo</th>
            <th>Cliente</th>
            <th>Teléfono</th>
            <th>Etapa</th>
            <th>Recibida</th>
            <th>En el taller</th>
          </tr>
        </thead>
        <tbody>
          {ordenes.map((orden) => (
            // Toda la fila abre la orden. El enlace del equipo se mantiene
            // para poder llegar con el teclado (Tab + Enter).
            <tr key={orden.id} onClick={() => navigate(`/ordenes/${orden.id}`)}>
              <td>
                <Link to={`/ordenes/${orden.id}`}>{orden.equipo}</Link>
              </td>
              <td>{orden.expand.cliente.nombre}</td>
              <td>{orden.expand.cliente.telefono}</td>
              <td>
                <EtiquetaEstado estado={orden.estado} />
              </td>
              <td>{formatearFecha(orden.created)}</td>
              <td>{FINALES.includes(orden.estado) ? '—' : <TiempoEnTaller orden={orden} />}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TablaOrdenes
