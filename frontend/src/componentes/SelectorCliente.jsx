import { useState } from 'react'

// Elegir un cliente ya registrado (con búsqueda) o escribir uno nuevo.
// Los datos viven en el padre (NuevaOrden); este componente solo los muestra
// y avisa de los cambios con las funciones que recibe por props.
function SelectorCliente({ clientes, modo, onCambiarModo, clienteId, onElegir, nuevoCliente, onCambiarNuevo }) {
  const [busqueda, setBusqueda] = useState('')

  // Al elegir una sugerencia (o escribir el nombre o teléfono exacto), el
  // cliente queda elegido solo, sin tener que abrir también el select.
  function buscar(valor) {
    setBusqueda(valor)
    const exacto = clientes.find((c) => c.nombre === valor || c.telefono === valor)
    if (exacto) onElegir(exacto.id)
  }

  // Se calcula al dibujar: es un filtro sencillo sobre una lista corta.
  const texto = busqueda.trim().toLowerCase()
  const visibles = clientes.filter(
    (c) => c.id === clienteId || c.nombre.toLowerCase().includes(texto) || c.telefono.includes(texto),
  )

  return (
    <fieldset>
      <legend>Cliente</legend>

      <div className="opciones">
        <label>
          <input
            type="radio"
            name="modo-cliente"
            value="existente"
            checked={modo === 'existente'}
            disabled={clientes.length === 0}
            onChange={() => onCambiarModo('existente')}
          />
          Cliente registrado
        </label>
        <label>
          <input
            type="radio"
            name="modo-cliente"
            value="nuevo"
            checked={modo === 'nuevo'}
            onChange={() => onCambiarModo('nuevo')}
          />
          Cliente nuevo
        </label>
      </div>

      {modo === 'existente' ? (
        <div className="fila">
          <div className="campo">
            <label htmlFor="buscar-cliente">Buscar</label>
            <input
              id="buscar-cliente"
              type="search"
              placeholder="Nombre o teléfono"
              list="sugerencias-clientes"
              value={busqueda}
              onChange={(e) => buscar(e.target.value)}
            />
            <datalist id="sugerencias-clientes">
              {clientes.map((c) => (
                <option key={c.id} value={c.nombre}>
                  {c.telefono}
                </option>
              ))}
            </datalist>
          </div>
          <div className="campo campo-crece">
            <label htmlFor="cliente">Cliente</label>
            <select id="cliente" value={clienteId} onChange={(e) => onElegir(e.target.value)}>
              <option value="">— Elige un cliente ({visibles.length}) —</option>
              {visibles.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} · {c.telefono}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        <div className="fila">
          <div className="campo campo-crece">
            <label htmlFor="cliente-nombre">Nombre</label>
            <input
              id="cliente-nombre"
              value={nuevoCliente.nombre}
              maxLength={100}
              onChange={(e) => onCambiarNuevo({ ...nuevoCliente, nombre: e.target.value })}
            />
          </div>
          <div className="campo">
            <label htmlFor="cliente-telefono">Teléfono</label>
            <input
              id="cliente-telefono"
              type="tel"
              value={nuevoCliente.telefono}
              maxLength={30}
              onChange={(e) => onCambiarNuevo({ ...nuevoCliente, telefono: e.target.value })}
            />
          </div>
        </div>
      )}
    </fieldset>
  )
}

export default SelectorCliente
