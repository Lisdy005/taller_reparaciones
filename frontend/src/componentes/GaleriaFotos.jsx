import { urlFoto } from '../api.js'

function GaleriaFotos({ orden }) {
  if (!orden.fotos || orden.fotos.length === 0) return null

  return (
    <section className="tarjeta">
      <h2>Fotos</h2>
      <ul className="galeria">
        {orden.fotos.map((archivo, i) => (
          <li key={archivo}>
            {/* La miniatura 300x0 la genera PocketBase; el enlace abre la original. */}
            <a href={urlFoto(orden, archivo)} target="_blank" rel="noreferrer">
              <img src={urlFoto(orden, archivo, '300x0')} alt={`Foto ${i + 1} de ${orden.equipo}`} loading="lazy" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default GaleriaFotos
