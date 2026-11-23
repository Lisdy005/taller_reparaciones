import { useRef, useState } from 'react'
import VistaPrevia from './VistaPrevia.jsx'

// Identifica un archivo elegido (no tiene id): nombre + tamaño + fecha.
function claveArchivo(archivo) {
  return `${archivo.name}-${archivo.size}-${archivo.lastModified}`
}

// Selector de hasta "maximo" fotos con vista previa.
// Un <input type="file"> no puede ser controlado (su valor no se puede
// escribir desde React), así que las fotos se guardan en el estado del padre
// y el input se vacía con un ref después de cada selección.
function CampoFotos({ fotos, onCambiar, maximo }) {
  const inputRef = useRef(null)
  const [aviso, setAviso] = useState('')

  function agregar(evento) {
    const yaElegidas = fotos.map(claveArchivo)
    const elegidas = Array.from(evento.target.files).filter(
      (f) => f.type.startsWith('image/') && !yaElegidas.includes(claveArchivo(f)),
    )
    const todas = [...fotos, ...elegidas]
    setAviso(todas.length > maximo ? `Solo se guardan las primeras ${maximo} fotos.` : '')
    onCambiar(todas.slice(0, maximo))
    inputRef.current.value = '' // permite volver a elegir el mismo archivo
  }

  function quitar(indice) {
    onCambiar(fotos.filter((_, i) => i !== indice))
    setAviso('')
  }

  return (
    <div className="campo">
      <label htmlFor="fotos">
        Fotos del equipo ({fotos.length} de {maximo})
      </label>
      <input
        id="fotos"
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        multiple
        disabled={fotos.length >= maximo}
        onChange={agregar}
      />
      {aviso && <p className="ayuda">{aviso}</p>}
      {fotos.length > 0 && (
        <ul className="miniaturas">
          {fotos.map((foto, i) => (
            <li key={claveArchivo(foto)}>
              <VistaPrevia archivo={foto} alt={`Foto ${i + 1}: ${foto.name}`} />
              <button type="button" className="boton-texto" onClick={() => quitar(i)}>
                Quitar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default CampoFotos
