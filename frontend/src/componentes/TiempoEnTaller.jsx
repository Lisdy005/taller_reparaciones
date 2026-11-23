import { DIAS_ATRASO, diasEnTaller, tiempoEnTaller } from '../etapas.js'

// Cuánto lleva una orden abierta en el taller. Si pasa de DIAS_ATRASO días,
// se marca como atrasada para que el taller la vea.
function TiempoEnTaller({ orden }) {
  const atrasada = diasEnTaller(orden.created) >= DIAS_ATRASO
  return (
    <span className={atrasada ? 'tiempo atrasada' : 'tiempo'}>
      {tiempoEnTaller(orden.created)}
      {atrasada && ', atrasada'}
    </span>
  )
}

export default TiempoEnTaller
