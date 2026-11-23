import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { cambiarEtapa, listarEventos, obtenerOrden } from '../api.js'
import { FINALES } from '../etapas.js'
import Aviso from '../componentes/Aviso.jsx'
import EtiquetaEstado from '../componentes/EtiquetaEstado.jsx'
import LineaEtapas from '../componentes/LineaEtapas.jsx'
import BotonVolver from '../componentes/BotonVolver.jsx'
import DatosOrden from '../componentes/DatosOrden.jsx'
import GaleriaFotos from '../componentes/GaleriaFotos.jsx'
import TablaPresupuesto from '../componentes/TablaPresupuesto.jsx'
import FormularioPresupuesto from '../componentes/FormularioPresupuesto.jsx'
import AccionesOrden from '../componentes/AccionesOrden.jsx'
import Historial from '../componentes/Historial.jsx'

function DetalleOrden() {
  const { id } = useParams() // el :id de la ruta /ordenes/:id

  const [orden, setOrden] = useState(null)
  const [eventos, setEventos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState(null)
  const [errorAccion, setErrorAccion] = useState('')
  const [guardando, setGuardando] = useState(false)
  // Cada vez que cambia "version" se vuelven a pedir los datos al servidor.
  const [version, setVersion] = useState(0)

  // Pide la orden y su historial al aparecer, al cambiar de orden (id) y
  // después de cada cambio de etapa (version).
  useEffect(() => {
    const controlador = new AbortController()

    // El efecto no puede ser async, así que se define una función async dentro.
    async function cargar() {
      try {
        const datosOrden = await obtenerOrden(id, controlador.signal)
        const datosEventos = await listarEventos(id, controlador.signal)
        setOrden(datosOrden)
        setEventos(datosEventos)
        setErrorCarga(null)
        setCargando(false)
      } catch (err) {
        if (err.name === 'AbortError') return // la página ya no necesita esta respuesta
        setErrorCarga(err)
        setCargando(false)
      }
    }

    cargar()
    // Limpieza: si cambia el id o se sale de la página, se cancela la petición.
    return () => controlador.abort()
  }, [id, version])

  // Pide al servidor el cambio de etapa. Si el servidor lo rechaza (por
  // ejemplo, porque alguien la cambió desde otro navegador), se muestra el
  // motivo. En los dos casos se vuelve a leer la orden guardada.
  async function cambiar(nuevoEstado, extra) {
    setGuardando(true)
    setErrorAccion('')
    try {
      await cambiarEtapa(id, nuevoEstado, extra)
      return true
    } catch (err) {
      setErrorAccion(err.message)
      return false
    } finally {
      setGuardando(false)
      setVersion(version + 1) // volver a leer lo que quedó guardado
    }
  }

  if (cargando) return <Aviso />

  if (errorCarga && errorCarga.status === 404) {
    return (
      <section className="tarjeta vacio">
        <h1>Orden no encontrada</h1>
        <p>No existe ninguna orden con el código {id}.</p>
        <Link className="boton" to="/ordenes">
          Ver todas las órdenes
        </Link>
      </section>
    )
  }

  if (errorCarga && !orden) return <Aviso tipo="error">{errorCarga.message}</Aviso>

  const cerrada = FINALES.includes(orden.estado)
  const tienePresupuesto = !['solicitada', 'en_diagnostico', 'cancelada'].includes(orden.estado)

  return (
    <>
      <BotonVolver alternativa="/ordenes" />

      <div className="titulo-pagina">
        <h1>{orden.equipo}</h1>
        <EtiquetaEstado estado={orden.estado} />
      </div>

      {errorCarga && <Aviso tipo="error">No se pudo actualizar: {errorCarga.message}</Aviso>}

      <LineaEtapas estado={orden.estado} eventos={eventos} />

      <div className="detalle">
        <div className="detalle-principal">
          <DatosOrden orden={orden} ultimoEvento={eventos[eventos.length - 1]} />
          <GaleriaFotos orden={orden} />

          {orden.estado === 'en_diagnostico' && (
            <FormularioPresupuesto
              guardando={guardando}
              onGuardar={(presupuesto) => cambiar('presupuestada', presupuesto)}
            />
          )}
          {tienePresupuesto && <TablaPresupuesto orden={orden} />}
        </div>

        <aside className="detalle-lateral">
          <section className="tarjeta">
            <h2>Siguiente paso</h2>
            {errorAccion && <Aviso tipo="error">{errorAccion}</Aviso>}
            {cerrada ? (
              <p>La orden está cerrada y ya no cambia.</p>
            ) : (
              <AccionesOrden estado={orden.estado} guardando={guardando} onCambiar={(a) => cambiar(a)} />
            )}
          </section>
          <Historial eventos={eventos} />
        </aside>
      </div>
    </>
  )
}

export default DetalleOrden
