import { ETAPAS, SALIDAS, formatearDia } from '../etapas.js'

// Muestra en qué punto del proceso va la orden y, debajo de cada etapa ya
// recorrida, el día en que llegó a ella (sale del historial de eventos).
function LineaEtapas({ estado, eventos }) {
  const salida = SALIDAS.find((s) => s.valor === estado)
  // Una orden rechazada llegó hasta "presupuestada"; una cancelada, hasta "solicitada".
  const hasta = salida ? (estado === 'rechazada' ? 'presupuestada' : 'solicitada') : estado
  const posicion = ETAPAS.findIndex((e) => e.valor === hasta)

  // Fecha de llegada a cada etapa: { solicitada: "2026-11-20 ...", ... }
  const fechas = {}
  for (const evento of eventos) {
    fechas[evento.a] = evento.created
  }

  return (
    <ol className="linea-etapas" aria-label="Etapas de la orden">
      {ETAPAS.map((etapa, i) => {
        let clase = 'pendiente'
        if (i < posicion || (i === posicion && salida)) clase = 'hecha'
        else if (i === posicion) clase = 'actual'
        return (
          <li key={etapa.valor} className={clase} aria-current={clase === 'actual' ? 'step' : undefined}>
            <span className="linea-nombre">{etapa.nombre}</span>
            {fechas[etapa.valor] && <time className="linea-fecha">{formatearDia(fechas[etapa.valor])}</time>}
          </li>
        )
      })}
      {salida && (
        <li className="salida" aria-current="step">
          <span className="linea-nombre">{salida.nombre}</span>
          {fechas[salida.valor] && <time className="linea-fecha">{formatearDia(fechas[salida.valor])}</time>}
        </li>
      )}
    </ol>
  )
}

export default LineaEtapas
