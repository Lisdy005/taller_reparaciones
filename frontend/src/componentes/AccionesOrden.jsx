import { ACCIONES } from '../etapas.js'

// Botones con los cambios de etapa posibles desde la etapa actual.
function AccionesOrden({ estado, guardando, onCambiar }) {
  const acciones = ACCIONES[estado] || []

  if (estado === 'en_diagnostico') {
    return <p>Registra el diagnóstico y el presupuesto en el formulario para continuar.</p>
  }

  function elegir(accion) {
    if (accion.confirmar && !window.confirm(accion.confirmar)) return
    onCambiar(accion.a)
  }

  return (
    <div className="botones">
      {acciones.map((accion) => (
        <button
          key={accion.a}
          type="button"
          className={accion.peligro ? 'boton peligro' : 'boton boton-principal'}
          disabled={guardando}
          onClick={() => elegir(accion)}
        >
          {accion.texto}
        </button>
      ))}
    </div>
  )
}

export default AccionesOrden
