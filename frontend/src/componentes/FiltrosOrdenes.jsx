import { useEffect, useState } from 'react'
import { ESTADOS_ACTIVOS } from '../api.js'
import { ETAPAS, SALIDAS } from '../etapas.js'

// Filtros de la lista: etapa (select) y búsqueda de texto.
// La búsqueda espera 400 ms desde la última tecla antes de avisar al padre,
// para no hacer una petición al servidor por cada letra.
function FiltrosOrdenes({ estado, busqueda, onCambiarEstado, onBuscar, sugerencias }) {
  const [texto, setTexto] = useState(busqueda)
  const [busquedaAnterior, setBusquedaAnterior] = useState(busqueda)

  // Si la búsqueda de la URL cambia desde fuera (por ejemplo, con el botón
  // Atrás), se copia al input. Se ajusta durante el render, sin efecto, como
  // recomienda la documentación de React para "estado que depende de props".
  if (busqueda !== busquedaAnterior) {
    setBusquedaAnterior(busqueda)
    if (texto.trim() !== busqueda) setTexto(busqueda)
  }

  useEffect(() => {
    if (texto.trim() === busqueda) return
    const temporizador = setTimeout(() => onBuscar(texto.trim()), 400)
    // Limpieza: si se escribe otra letra antes de los 400 ms, se cancela.
    return () => clearTimeout(temporizador)
  }, [texto, busqueda, onBuscar])

  return (
    <form className="filtros" role="search" onSubmit={(e) => e.preventDefault()}>
      <div className="campo">
        <label htmlFor="filtro-estado">Etapa</label>
        <select id="filtro-estado" value={estado} onChange={(e) => onCambiarEstado(e.target.value)}>
          <option value="">Todas</option>
          <option value={ESTADOS_ACTIVOS}>En curso (sin cerrar)</option>
          <optgroup label="Etapas">
            {ETAPAS.map((etapa) => (
              <option key={etapa.valor} value={etapa.valor}>
                {etapa.nombre}
              </option>
            ))}
          </optgroup>
          <optgroup label="Salidas">
            {SALIDAS.map((etapa) => (
              <option key={etapa.valor} value={etapa.valor}>
                {etapa.nombre}
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      <div className="campo campo-crece">
        <label htmlFor="filtro-busqueda">Buscar</label>
        <input
          id="filtro-busqueda"
          type="search"
          placeholder="Cliente, teléfono, equipo o problema"
          list="sugerencias-busqueda"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <datalist id="sugerencias-busqueda">
          {sugerencias.map((texto) => (
            <option key={texto} value={texto} />
          ))}
        </datalist>
      </div>
    </form>
  )
}

export default FiltrosOrdenes
