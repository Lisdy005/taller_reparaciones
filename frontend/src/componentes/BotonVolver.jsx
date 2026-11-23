import { useNavigate } from 'react-router'

// Vuelve a la pantalla anterior con navigate(-1) (conferencia 11).
// Si la página se abrió directamente (no hay pantalla anterior en la app),
// va a la ruta "alternativa".
function BotonVolver({ alternativa = '/' }) {
  const navigate = useNavigate()

  function volver() {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate(alternativa)
    }
  }

  return (
    <button type="button" className="boton-volver" onClick={volver}>
      Volver
    </button>
  )
}

export default BotonVolver
