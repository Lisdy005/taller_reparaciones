import { formatearFecha, nombreEtapa } from '../etapas.js'

// Historial de cambios de etapa (colección eventos), del más antiguo al más nuevo.
function Historial({ eventos }) {
  return (
    <section className="tarjeta">
      <h2>Historial</h2>
      {eventos.length === 0 ? (
        <p>Sin eventos registrados.</p>
      ) : (
        <ol className="historial">
          {eventos.map((evento) => (
            <li key={evento.id}>
              <time dateTime={evento.created.replace(' ', 'T')}>{formatearFecha(evento.created)}</time>
              <span>
                {evento.de ? (
                  <>
                    {nombreEtapa(evento.de)} → <strong>{nombreEtapa(evento.a)}</strong>
                  </>
                ) : (
                  <>
                    Orden registrada como <strong>{nombreEtapa(evento.a)}</strong>
                  </>
                )}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

export default Historial
