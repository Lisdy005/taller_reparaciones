import { formatearDinero } from '../etapas.js'

// Una fila del formulario de piezas: descripción, cantidad y precio.
function FilaPieza({ numero, pieza, onCambiar, onQuitar }) {
  const importe = Number(pieza.cantidad) * Number(pieza.precio) || 0
  const id = `pieza-${pieza.clave}`

  return (
    <div className="fila fila-pieza">
      <div className="campo campo-crece">
        <label htmlFor={`${id}-descripcion`}>Pieza {numero}</label>
        <input
          id={`${id}-descripcion`}
          list="piezas-comunes"
          placeholder="Descripción"
          value={pieza.descripcion}
          maxLength={200}
          onChange={(e) => onCambiar('descripcion', e.target.value)}
        />
      </div>
      <div className="campo campo-corto">
        <label htmlFor={`${id}-cantidad`}>Cantidad</label>
        <input
          id={`${id}-cantidad`}
          type="number"
          min="1"
          step="1"
          value={pieza.cantidad}
          onChange={(e) => onCambiar('cantidad', e.target.value)}
        />
      </div>
      <div className="campo campo-corto">
        <label htmlFor={`${id}-precio`}>Precio ($)</label>
        <input
          id={`${id}-precio`}
          type="number"
          min="0"
          step="0.01"
          value={pieza.precio}
          onChange={(e) => onCambiar('precio', e.target.value)}
        />
      </div>
      <p className="importe" aria-label={`Importe de la pieza ${numero}`}>
        {formatearDinero(importe)}
      </p>
      <button type="button" className="boton-texto" onClick={onQuitar} aria-label={`Quitar la pieza ${numero}`}>
        Quitar
      </button>
    </div>
  )
}

export default FilaPieza
