import { calcularTotal, formatearDinero } from '../etapas.js'

// Presupuesto ya registrado (solo lectura). El total se calcula aquí.
function TablaPresupuesto({ orden }) {
  const piezas = orden.piezas || []
  const total = calcularTotal(orden.manoObra, piezas)

  return (
    <section className="tarjeta">
      <h2>Presupuesto</h2>
      <p>
        <strong>Diagnóstico:</strong> <span className="texto-largo">{orden.diagnostico}</span>
      </p>
      <div className="tabla-contenedor">
        <table className="tabla">
          <thead>
            <tr>
              <th>Concepto</th>
              <th className="numero">Cantidad</th>
              <th className="numero">Precio</th>
              <th className="numero">Importe</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Mano de obra</td>
              <td className="numero">—</td>
              <td className="numero">—</td>
              <td className="numero">{formatearDinero(orden.manoObra)}</td>
            </tr>
            {piezas.map((pieza, i) => (
              // Las piezas guardadas no tienen id y la lista ya no cambia,
              // así que la posición sirve como key.
              <tr key={i}>
                <td>{pieza.descripcion}</td>
                <td className="numero">{pieza.cantidad}</td>
                <td className="numero">{formatearDinero(pieza.precio)}</td>
                <td className="numero">{formatearDinero(pieza.cantidad * pieza.precio)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th colSpan={3}>Total</th>
              <th className="numero">{formatearDinero(total)}</th>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  )
}

export default TablaPresupuesto
