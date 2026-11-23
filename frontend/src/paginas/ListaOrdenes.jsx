import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { ESTADOS_ACTIVOS, listarClientes, listarOrdenes, obtenerCliente } from '../api.js'
import { EQUIPOS_COMUNES, sinRepetidos } from '../sugerencias.js'
import Aviso from '../componentes/Aviso.jsx'
import FiltrosOrdenes from '../componentes/FiltrosOrdenes.jsx'
import TablaOrdenes from '../componentes/TablaOrdenes.jsx'
import Paginacion from '../componentes/Paginacion.jsx'

// Los filtros viven en la URL (?estado=...&q=...&cliente=...&pagina=...):
// así se conservan al recargar la página o al compartir el enlace.
function ListaOrdenes() {
  const [params, setParams] = useSearchParams()
  const estado = params.get('estado') || ''
  const busqueda = params.get('q') || ''
  const clienteId = params.get('cliente') || ''
  const pagina = Number(params.get('pagina') || 1)

  const [resultado, setResultado] = useState(null)
  const [cliente, setCliente] = useState(null)
  const [clientes, setClientes] = useState([])
  const [error, setError] = useState('')

  // Lista de clientes, una sola vez, para sugerir nombres y teléfonos en la búsqueda.
  useEffect(() => {
    const controlador = new AbortController()
    listarClientes(controlador.signal)
      .then(setClientes)
      .catch(() => setClientes([])) // sin sugerencias la búsqueda sigue funcionando
    return () => controlador.abort()
  }, [])

  // Pide las órdenes cada vez que cambia un filtro.
  useEffect(() => {
    const controlador = new AbortController()
    listarOrdenes({ estado, busqueda, cliente: clienteId, pagina }, controlador.signal)
      .then((datos) => {
        setResultado(datos)
        setError('')
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message)
      })
    return () => controlador.abort()
  }, [estado, busqueda, clienteId, pagina])

  // Si se filtra por cliente, se pide su nombre para mostrarlo.
  useEffect(() => {
    if (!clienteId) return
    const controlador = new AbortController()
    obtenerCliente(clienteId, controlador.signal)
      .then(setCliente)
      .catch(() => setCliente(null))
    return () => controlador.abort()
  }, [clienteId])

  // Cambia un filtro en la URL y vuelve a la primera página. Se usa la forma
  // con función para partir siempre de los parámetros más recientes.
  //
  // useCallback: FiltrosOrdenes usa onBuscar dentro de un useEffect (la espera
  // de 400 ms). Sin useCallback, cada render crearía una función nueva, el
  // efecto se repetiría y la espera volvería a empezar sin motivo.
  const cambiarFiltro = useCallback(
    (nombre, valor) => {
      setParams((anteriores) => {
        const nuevos = new URLSearchParams(anteriores)
        if (valor) nuevos.set(nombre, valor)
        else nuevos.delete(nombre)
        nuevos.delete('pagina')
        return nuevos
      })
    },
    [setParams],
  )

  const buscar = useCallback((valor) => cambiarFiltro('q', valor), [cambiarFiltro])

  // Sugerencias para la barra de búsqueda: clientes, teléfonos y equipos.
  const sugerencias = []
  for (const c of clientes) {
    sugerencias.push(c.nombre, c.telefono)
  }
  if (resultado) {
    for (const orden of resultado.items) {
      sugerencias.push(orden.equipo)
    }
  }
  sugerencias.push(...EQUIPOS_COMUNES)

  function irAPagina(numero) {
    const nuevos = new URLSearchParams(params)
    nuevos.set('pagina', numero)
    setParams(nuevos)
  }

  return (
    <>
      <div className="titulo-pagina">
        <h1>Órdenes</h1>
        <Link className="boton boton-principal" to="/recepcion">
          Recibir equipo
        </Link>
      </div>

      <FiltrosOrdenes
        estado={estado}
        busqueda={busqueda}
        onCambiarEstado={(valor) => cambiarFiltro('estado', valor)}
        onBuscar={buscar}
        sugerencias={sinRepetidos(sugerencias)}
      />

      {clienteId && (
        <p className="filtro-cliente">
          Órdenes de{' '}
          <strong>{cliente && cliente.id === clienteId ? `${cliente.nombre} (${cliente.telefono})` : 'un cliente'}</strong>
          <button type="button" className="boton-texto" onClick={() => cambiarFiltro('cliente', '')}>
            Quitar filtro
          </button>
        </p>
      )}

      {error && <Aviso tipo="error">{error}</Aviso>}
      {!error && !resultado && <Aviso />}
      {!error && resultado && (
        <>
          <p className="contador">
            {resultado.totalItems === 1 ? '1 orden' : `${resultado.totalItems} órdenes`}
            {estado === ESTADOS_ACTIVOS && ' en curso'}
          </p>
          <TablaOrdenes ordenes={resultado.items} />
          <Paginacion pagina={resultado.page} totalPaginas={resultado.totalPages} onIr={irAPagina} />
        </>
      )}
    </>
  )
}

export default ListaOrdenes
