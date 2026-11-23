import { Link } from 'react-router'
import { FINALES, formatearFecha } from '../etapas.js'

// Qué pasó con una orden cerrada, en palabras del taller.
const CIERRES = {
  entregada: 'Entregada al cliente',
  rechazada: 'Cerrada sin reparar: el cliente rechazó el presupuesto',
  cancelada: 'Cancelada a petición del cliente, antes de la revisión',
}

function DatosOrden({ orden, ultimoEvento }) {
  // expand=cliente trae el registro completo del cliente dentro de orden.expand
  const cliente = orden.expand.cliente

  return (
    <section className="tarjeta ticket">
      <h2 className="ticket-cabecera">
        Orden de trabajo
        <code className="ticket-codigo">N.º {orden.id}</code>
      </h2>

      <dl className="datos">
        <dt>Cliente</dt>
        <dd>
          {cliente ? (
            <Link to={`/ordenes?cliente=${cliente.id}`} title="Ver todas sus órdenes">
              {cliente.nombre}
            </Link>
          ) : (
            '—'
          )}
        </dd>
        <dt>Teléfono</dt>
        <dd>{cliente ? <a href={`tel:${cliente.telefono}`}>{cliente.telefono}</a> : '—'}</dd>
        <dt>Recibida</dt>
        <dd>{formatearFecha(orden.created)}</dd>
        <dt>Problema</dt>
        <dd className="texto-largo">{orden.problema}</dd>
      </dl>

      {/* Talón de cierre: qué pasó y cuándo, separado por la línea perforada */}
      {FINALES.includes(orden.estado) && (
        <p className={`talon talon-${orden.estado}`}>
          <strong>{CIERRES[orden.estado]}</strong>
          {ultimoEvento && <span> el {formatearFecha(ultimoEvento.created)}</span>}
        </p>
      )}
    </section>
  )
}

export default DatosOrden
