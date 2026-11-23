import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { crearCliente, crearOrden, listarClientes } from '../api.js'
import Aviso from '../componentes/Aviso.jsx'
import SelectorCliente from '../componentes/SelectorCliente.jsx'
import CampoFotos from '../componentes/CampoFotos.jsx'
import BotonVolver from '../componentes/BotonVolver.jsx'
import { EQUIPOS_COMUNES } from '../sugerencias.js'

const MAX_FOTOS = 3

// Recepción de un equipo: datos del cliente, del equipo, el problema y fotos.
// Todos los campos son controlados: su valor vive en el estado.
function NuevaOrden() {
  const navigate = useNavigate()
  const equipoRef = useRef(null)

  const [clientes, setClientes] = useState([])
  const [modoCliente, setModoCliente] = useState('existente') // 'existente' | 'nuevo'
  const [clienteId, setClienteId] = useState('')
  const [nuevoCliente, setNuevoCliente] = useState({ nombre: '', telefono: '' })
  const [equipo, setEquipo] = useState('')
  const [problema, setProblema] = useState('')
  const [fotos, setFotos] = useState([])
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  // Lista de clientes para el selector, una sola vez al aparecer.
  useEffect(() => {
    const controlador = new AbortController()
    listarClientes(controlador.signal)
      .then((lista) => {
        setClientes(lista)
        if (lista.length === 0) setModoCliente('nuevo')
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message)
      })
    return () => controlador.abort()
  }, [])

  function validar() {
    if (modoCliente === 'existente' && !clienteId) return 'Elige el cliente.'
    if (modoCliente === 'nuevo') {
      if (nuevoCliente.nombre.trim().length < 2) return 'Escribe el nombre del cliente.'
      if (nuevoCliente.telefono.trim().length < 3) return 'Escribe el teléfono del cliente.'
    }
    if (equipo.trim().length < 2) return 'Describe el equipo (por ejemplo, "Laptop HP 15").'
    if (problema.trim().length < 3) return 'Describe el problema que trae el equipo.'
    if (fotos.length > MAX_FOTOS) return `Se admiten hasta ${MAX_FOTOS} fotos.`
    return ''
  }

  async function enviar(evento) {
    evento.preventDefault()
    const mensaje = validar()
    if (mensaje) {
      setError(mensaje)
      return
    }

    setGuardando(true)
    setError('')
    try {
      let idCliente = clienteId
      if (modoCliente === 'nuevo') {
        const creado = await crearCliente({
          nombre: nuevoCliente.nombre.trim(),
          telefono: nuevoCliente.telefono.trim(),
        })
        idCliente = creado.id
        // Si la orden falla después, el cliente ya existe: se deja elegido
        // para no crearlo dos veces al reintentar.
        setClientes([...clientes, creado])
        setClienteId(creado.id)
        setModoCliente('existente')
        setNuevoCliente({ nombre: '', telefono: '' })
      }

      // FormData arma el multipart: los textos y las fotos en una sola petición.
      const datos = new FormData()
      datos.append('cliente', idCliente)
      datos.append('equipo', equipo.trim())
      datos.append('problema', problema.trim())
      for (const foto of fotos) {
        datos.append('fotos', foto)
      }
      const orden = await crearOrden(datos)
      navigate(`/ordenes/${orden.id}`)
    } catch (err) {
      setError(err.message)
      setGuardando(false)
    }
  }

  return (
    <>
      <BotonVolver />
      <h1>Recibir equipo</h1>

      <form className="tarjeta formulario" onSubmit={enviar} noValidate>
        <SelectorCliente
          clientes={clientes}
          modo={modoCliente}
          onCambiarModo={setModoCliente}
          clienteId={clienteId}
          onElegir={(id) => {
            setClienteId(id)
            // Al elegir el cliente, el cursor pasa directo al equipo.
            if (id) equipoRef.current.focus()
          }}
          nuevoCliente={nuevoCliente}
          onCambiarNuevo={setNuevoCliente}
        />

        <fieldset>
          <legend>Equipo</legend>
          <div className="campo">
            <label htmlFor="equipo">Equipo</label>
            <input
              id="equipo"
              ref={equipoRef}
              list="equipos-comunes"
              placeholder="Tipo, marca y modelo. Ej.: Laptop HP Pavilion 15"
              value={equipo}
              maxLength={150}
              onChange={(e) => setEquipo(e.target.value)}
            />
            {/* Sugerencias: el navegador las muestra mientras se escribe */}
            <datalist id="equipos-comunes">
              {EQUIPOS_COMUNES.map((texto) => (
                <option key={texto} value={texto} />
              ))}
            </datalist>
          </div>
          <div className="campo">
            <label htmlFor="problema">Problema que describe el cliente</label>
            <textarea
              id="problema"
              rows={4}
              value={problema}
              maxLength={2000}
              onChange={(e) => setProblema(e.target.value)}
            />
          </div>
          <CampoFotos fotos={fotos} onCambiar={setFotos} maximo={MAX_FOTOS} />
        </fieldset>

        {error && <Aviso tipo="error">{error}</Aviso>}

        <div className="acciones">
          <button className="boton boton-principal" type="submit" disabled={guardando}>
            {guardando ? 'Guardando…' : 'Registrar orden'}
          </button>
        </div>
      </form>
    </>
  )
}

export default NuevaOrden
