import { Link } from 'react-router'

// Página para cualquier ruta que no existe (path="*" en App.jsx).
function NoEncontrada() {
  return (
    <section className="tarjeta vacio">
      <h1>Página no encontrada</h1>
      <p>La dirección que buscas no existe en la aplicación.</p>
      <Link className="boton" to="/">
        Volver al panel
      </Link>
    </section>
  )
}

export default NoEncontrada
