import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { ESTADOS_ACTIVOS, listarOrdenes, obtenerResumen } from '../api.js'
import { ETAPAS, SALIDAS } from '../etapas.js'
import Aviso from '../componentes/Aviso.jsx'
import ColumnaEtapa from '../componentes/ColumnaEtapa.jsx'

// Etapas en las que el equipo sigue en el taller (columnas del tablero).
const EN_CURSO = ETAPAS.filter((e) => e.valor !== 'entregada')
const CERRADAS = [ETAPAS.find((e) => e.valor === 'entregada'), ...SALIDAS]

// Panel: el tablero del taller, como el de la pared, con una columna por
// etapa y los equipos que hay en cada una.
function Panel() {
  const [resumen, setResumen] = useState(null)
  const [ordenes, setOrdenes] = useState([])
  const [error, setError] = useState('')

  // Pide el resumen y las órdenes en curso una sola vez, al aparecer.
  useEffect(() => {
    const controlador = new AbortController()

    async function cargar() {
      try {
        const datosResumen = await obtenerResumen(controlador.signal)
        const enCurso = await listarOrdenes({ estado: ESTADOS_ACTIVOS, porPagina: 200 }, controlador.signal)
        setResumen(datosResumen)
        setOrdenes(enCurso.items)
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message)
      }
    }

    cargar()
    // Limpieza: si el componente desaparece, se cancela la petición.
    return () => controlador.abort()
  }, [])

  if (error) return <Aviso tipo="error">{error}</Aviso>
  if (!resumen) return <Aviso />

  let enTaller = 0
  for (const etapa of EN_CURSO) {
    enTaller += resumen.porEstado[etapa.valor]
  }

  const listas = resumen.porEstado.lista
  let frase = enTaller === 1 ? 'Hay 1 equipo en el taller' : `Hay ${enTaller} equipos en el taller`
  if (listas === 1) frase += ', 1 listo para entregar'
  if (listas > 1) frase += `, ${listas} listos para entregar`
  frase += '.'

  return (
    <>
      <section className="portada">
        <div>
          <h1>Tablero del taller</h1>
          <p className="portada-resumen">{frase}</p>
        </div>
        <Link className="boton boton-principal" to="/recepcion">
          Recibir equipo
        </Link>
      </section>

      <section className="tablero" aria-label="Equipos por etapa">
        {EN_CURSO.map((etapa) => (
          <ColumnaEtapa
            key={etapa.valor}
            etapa={etapa}
            cantidad={resumen.porEstado[etapa.valor]}
            ordenes={ordenes.filter((o) => o.estado === etapa.valor)}
          />
        ))}
      </section>

      <section className="cerradas">
        <h2>Órdenes cerradas</h2>
        <ul>
          {CERRADAS.map((etapa) => (
            <li key={etapa.valor}>
              <Link to={`/ordenes?estado=${etapa.valor}`}>
                <span className="cerradas-numero">{resumen.porEstado[etapa.valor]}</span>{' '}
                {etapa.nombre.toLowerCase()}
                {resumen.porEstado[etapa.valor] === 1 ? '' : 's'}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

export default Panel
