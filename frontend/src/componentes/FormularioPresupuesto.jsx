import { useRef, useState } from 'react'
import { calcularTotal, formatearDinero } from '../etapas.js'
import Aviso from './Aviso.jsx'
import FilaPieza from './FilaPieza.jsx'
import { PIEZAS_COMUNES } from '../sugerencias.js'

// Formulario controlado para registrar diagnóstico, mano de obra y piezas.
// Al guardar, la orden pasa de "en_diagnostico" a "presupuestada"; después el
// presupuesto ya no se puede cambiar (lo garantiza el servidor).
function FormularioPresupuesto({ guardando, onGuardar }) {
  // Contador para dar a cada fila de pieza una key estable. Va en un ref y no
  // en el estado porque no se dibuja y cambiarlo no debe redibujar nada.
  const siguienteClave = useRef(1)

  const [diagnostico, setDiagnostico] = useState('')
  const [manoObra, setManoObra] = useState('')
  const [piezas, setPiezas] = useState([])
  const [error, setError] = useState('')

  function agregarPieza() {
    const clave = siguienteClave.current++
    setPiezas([...piezas, { clave, descripcion: '', cantidad: '1', precio: '' }])
  }

  function cambiarPieza(clave, campo, valor) {
    setPiezas(piezas.map((p) => (p.clave === clave ? { ...p, [campo]: valor } : p)))
  }

  function quitarPieza(clave) {
    setPiezas(piezas.filter((p) => p.clave !== clave))
  }

  function validar() {
    if (diagnostico.trim() === '') return 'Escribe el diagnóstico.'
    if (manoObra === '' || Number(manoObra) < 0) return 'La mano de obra debe ser un número mayor o igual que 0.'
    for (const [i, p] of piezas.entries()) {
      if (p.descripcion.trim() === '') return `Falta la descripción de la pieza ${i + 1}.`
      if (!Number.isInteger(Number(p.cantidad)) || Number(p.cantidad) < 1)
        return `La cantidad de la pieza ${i + 1} debe ser un entero mayor que 0.`
      if (p.precio === '' || Number(p.precio) < 0) return `El precio de la pieza ${i + 1} no es válido.`
    }
    return ''
  }

  async function enviar(evento) {
    evento.preventDefault()
    const mensaje = validar()
    if (mensaje) {
      setError(mensaje)
      return
    }
    const total = formatearDinero(calcularTotal(manoObra, piezas))
    if (!window.confirm(`¿Registrar el presupuesto por ${total}? Después no se podrá modificar.`)) return

    setError('')
    // Se envían números, no textos, y sin la "clave" que solo usa la interfaz.
    await onGuardar({
      diagnostico: diagnostico.trim(),
      manoObra: Number(manoObra),
      piezas: piezas.map((p) => ({
        descripcion: p.descripcion.trim(),
        cantidad: Number(p.cantidad),
        precio: Number(p.precio),
      })),
    })
  }

  return (
    <form className="tarjeta formulario" onSubmit={enviar} noValidate>
      <h2>Diagnóstico y presupuesto</h2>

      <div className="campo">
        <label htmlFor="diagnostico">Diagnóstico</label>
        <textarea
          id="diagnostico"
          rows={3}
          value={diagnostico}
          maxLength={2000}
          onChange={(e) => setDiagnostico(e.target.value)}
        />
      </div>

      <div className="campo campo-corto">
        <label htmlFor="mano-obra">Mano de obra ($)</label>
        <input
          id="mano-obra"
          type="number"
          min="0"
          step="0.01"
          value={manoObra}
          onChange={(e) => setManoObra(e.target.value)}
        />
      </div>

      <fieldset>
        <legend>Piezas</legend>
        {piezas.length === 0 && <p className="ayuda">Sin piezas: solo mano de obra.</p>}
        {piezas.map((pieza, i) => (
          <FilaPieza
            key={pieza.clave}
            numero={i + 1}
            pieza={pieza}
            onCambiar={(campo, valor) => cambiarPieza(pieza.clave, campo, valor)}
            onQuitar={() => quitarPieza(pieza.clave)}
          />
        ))}
        {/* Una sola lista de sugerencias para todas las filas de piezas */}
        <datalist id="piezas-comunes">
          {PIEZAS_COMUNES.map((texto) => (
            <option key={texto} value={texto} />
          ))}
        </datalist>
        <button type="button" className="boton secundario" onClick={agregarPieza}>
          + Agregar pieza
        </button>
      </fieldset>

      <p className="total-presupuesto">
        Total: <strong>{formatearDinero(calcularTotal(manoObra, piezas))}</strong>
      </p>

      {error && <Aviso tipo="error">{error}</Aviso>}

      <div className="acciones">
        <button className="boton boton-principal" type="submit" disabled={guardando}>
          {guardando ? 'Guardando…' : 'Registrar presupuesto'}
        </button>
      </div>
    </form>
  )
}

export default FormularioPresupuesto
