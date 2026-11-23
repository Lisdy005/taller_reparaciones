// Mensaje de carga, error o éxito. tipo: 'cargando' | 'error' | 'exito'
// Sin children muestra "Cargando…" (valor por defecto al desestructurar).
function Aviso({ tipo = 'cargando', children = 'Cargando…' }) {
  return (
    <p className={`aviso aviso-${tipo}`} role={tipo === 'error' ? 'alert' : 'status'}>
      {children}
    </p>
  )
}

export default Aviso
