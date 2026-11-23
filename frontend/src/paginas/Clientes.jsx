import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { crearCliente, listarClientes, listarOrdenes } from '../api.js'
import { FINALES } from '../etapas.js'
import BotonVolver from '../componentes/BotonVolver.jsx'
import Aviso from '../componentes/Aviso.jsx'

// Clientes del taller: buscar (por ejemplo, cuando llaman) y registrar nuevos.
function Clientes() {
  const nombreRef = useRef(null)
  const [clientes, setClientes] = useState(null)
  const [ordenes, setOrdenes] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [guardando, setGuardando] = useState(false)
  // Cada vez que cambia "version" se vuelve a pedir la lista al servidor.
  const [version, setVersion] = useState(0)

  // Pide los clientes y sus órdenes (para contar cuántas tiene cada uno).
  useEffect(() => {
    const controlador = new AbortController()

    async function cargar() {
      try {
        const datosClientes = await listarClientes(controlador.signal)
        const datosOrdenes = await listarOrdenes({ porPagina: 500 }, controlador.signal)
        setClientes(datosClientes)
        setOrdenes(datosOrdenes.items)
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message)
      }
    }

    cargar()
    return () => controlador.abort()
  }, [version])

  // Cuántas órdenes tiene un cliente y cuántas siguen abiertas.
  function contarOrdenes(clienteId) {
    let total = 0
    let enCurso = 0
    for (const orden of ordenes) {
      if (orden.cliente === clienteId) {
        total++
        if (!FINALES.includes(orden.estado)) enCurso++
      }
    }
    return { total, enCurso }
  }

  async function enviar(evento) {
    evento.preventDefault()
    if (nombre.trim().length < 2 || telefono.trim().length < 3) {
      setError('Escribe el nombre y el teléfono del cliente.')
      return
    }
    setGuardando(true)
    setError('')
    try {
      const creado = await crearCliente({ nombre: nombre.trim(), telefono: telefono.trim() })
      setExito(`Cliente ${creado.nombre} registrado.`)
      setNombre('')
      setTelefono('')
      setVersion(version + 1)
      nombreRef.current.focus() // listo para registrar otro
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  const texto = busqueda.trim().toLowerCase()
  const visibles = (clientes || []).filter(
    (c) => c.nombre.toLowerCase().includes(texto) || c.telefono.includes(texto),
  )

  return (
    <>
      <BotonVolver />
      <h1>Clientes</h1>

      <form className="tarjeta formulario" onSubmit={enviar} noValidate>
        <h2>Registrar cliente</h2>
        <div className="fila">
          <div className="campo campo-crece">
            <label htmlFor="nombre">Nombre</label>
            <input id="nombre" ref={nombreRef} value={nombre} maxLength={100} onChange={(e) => setNombre(e.target.value)} />
          </div>
          <div className="campo">
            <label htmlFor="telefono">Teléfono</label>
            <input
              id="telefono"
              type="tel"
              value={telefono}
              maxLength={30}
              onChange={(e) => setTelefono(e.target.value)}
            />
          </div>
          <div className="campo campo-boton">
            <button className="boton boton-principal" type="submit" disabled={guardando}>
              {guardando ? 'Guardando…' : 'Registrar'}
            </button>
          </div>
        </div>
        {error && <Aviso tipo="error">{error}</Aviso>}
        {exito && !error && <Aviso tipo="exito">{exito}</Aviso>}
      </form>

      <section>
        <div className="filtros">
          <div className="campo campo-crece">
            <label htmlFor="buscar">Buscar cliente</label>
            <input
              id="buscar"
              type="search"
              placeholder="Nombre o teléfono"
              list="sugerencias-clientes"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <datalist id="sugerencias-clientes">
              {(clientes || []).map((c) => (
                <option key={c.id} value={c.nombre}>
                  {c.telefono}
                </option>
              ))}
            </datalist>
          </div>
        </div>

        {!clientes && !error && <Aviso />}
        {clientes && visibles.length === 0 && <p className="tarjeta vacio">No hay clientes que coincidan.</p>}
        {visibles.length > 0 && (
          <div className="tabla-contenedor">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Teléfono</th>
                  <th className="numero">Órdenes</th>
                  <th>En curso</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((c) => {
                  const cuenta = contarOrdenes(c.id)
                  return (
                    <tr key={c.id}>
                      <td>{c.nombre}</td>
                      <td>
                        <a href={`tel:${c.telefono}`}>{c.telefono}</a>
                      </td>
                      <td className="numero">{cuenta.total}</td>
                      <td>
                        {cuenta.enCurso === 0
                          ? 'Ninguna'
                          : cuenta.enCurso === 1
                            ? '1 equipo en el taller'
                            : `${cuenta.enCurso} equipos en el taller`}
                      </td>
                      <td>{cuenta.total > 0 && <Link to={`/ordenes?cliente=${c.id}`}>Ver sus órdenes</Link>}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  )
}

export default Clientes
