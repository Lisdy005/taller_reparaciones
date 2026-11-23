import { useEffect, useRef } from 'react'

// Vista previa de un archivo de imagen elegido en el navegador (aún no subido).
// URL.createObjectURL crea una URL temporal que ocupa memoria hasta que se
// libera: el efecto la crea, la pone en el <img> por medio del ref y la
// libera en la limpieza (al quitar la foto o al salir de la página).
function VistaPrevia({ archivo, alt }) {
  const imagenRef = useRef(null)

  useEffect(() => {
    const url = URL.createObjectURL(archivo)
    imagenRef.current.src = url
    return () => URL.revokeObjectURL(url)
  }, [archivo])

  return <img ref={imagenRef} alt={alt} />
}

export default VistaPrevia
