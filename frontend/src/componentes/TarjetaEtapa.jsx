import { Link } from 'react-router'

function TarjetaEtapa({ etapa, cantidad }) {
  return (
    <Link className={`tarjeta tarjeta-etapa borde-${etapa.valor}`} to={`/ordenes?estado=${etapa.valor}`}>
      <span className="tarjeta-etapa-numero">{cantidad}</span>
      <span>{etapa.nombre}</span>
    </Link>
  )
}

export default TarjetaEtapa
