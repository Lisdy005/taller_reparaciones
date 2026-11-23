import { Link } from 'react-router'
import { urlFoto } from '../api.js'
import { calcularTotal, formatearDinero } from '../etapas.js'
import TiempoEnTaller from './TiempoEnTaller.jsx'

// Etapas en las que la orden ya tiene presupuesto: la ficha muestra el total.
const CON_PRESUPUESTO = ['presupuestada', 'aprobada', 'en_reparacion', 'lista']

// Una columna del tablero: la etapa, cuántos equipos tiene y sus fichas.
function ColumnaEtapa({ etapa, cantidad, ordenes }) {
  return (
    <section className="columna">
      <h2 className="columna-titulo">
        <Link to={`/ordenes?estado=${etapa.valor}`}>{etapa.nombre}</Link>
        <span className="columna-cantidad">{cantidad}</span>
      </h2>

      {ordenes.length === 0 ? (
        <p className="columna-vacia">Sin equipos</p>
      ) : (
        <ul className="fichas">
          {ordenes.map((orden) => (
            <li key={orden.id}>
              <Link className="ficha" to={`/ordenes/${orden.id}`}>
                {orden.fotos.length > 0 && (
                  <img className="ficha-foto" src={urlFoto(orden, orden.fotos[0], '100x100')} alt="" />
                )}
                <span className="ficha-texto">
                  <span className="ficha-equipo">{orden.equipo}</span>
                  <span className="ficha-cliente">{orden.expand.cliente.nombre}</span>
                  <span className="ficha-pie">
                    <TiempoEnTaller orden={orden} />
                    {CON_PRESUPUESTO.includes(orden.estado) && (
                      <span className="ficha-total">{formatearDinero(calcularTotal(orden.manoObra, orden.piezas))}</span>
                    )}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default ColumnaEtapa
