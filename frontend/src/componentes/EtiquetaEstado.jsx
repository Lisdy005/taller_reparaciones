import { nombreEtapa } from '../etapas.js'

function EtiquetaEstado({ estado }) {
  return <span className={`etiqueta etiqueta-${estado}`}>{nombreEtapa(estado)}</span>
}

export default EtiquetaEstado
