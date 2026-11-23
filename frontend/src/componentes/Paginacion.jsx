function Paginacion({ pagina, totalPaginas, onIr }) {
  if (totalPaginas <= 1) return null

  return (
    <nav className="paginacion" aria-label="Paginación">
      <button type="button" className="boton secundario" disabled={pagina <= 1} onClick={() => onIr(pagina - 1)}>
        ← Anterior
      </button>
      <span>
        Página {pagina} de {totalPaginas}
      </span>
      <button
        type="button"
        className="boton secundario"
        disabled={pagina >= totalPaginas}
        onClick={() => onIr(pagina + 1)}
      >
        Siguiente →
      </button>
    </nav>
  )
}

export default Paginacion
