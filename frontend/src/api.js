// Todas las peticiones al servidor PocketBase, con fetch como en clase.
// No se usa el SDK de PocketBase: cada función arma su URL y su petición.

export const BASE = import.meta.env.VITE_PB_URL || 'http://127.0.0.1:8090'
const API = `${BASE}/api/collections`

// Convierte la respuesta de error de PocketBase en un texto legible.
// Formato: { status, message, data: { campo: { code, message } } }
function describirError(cuerpo, status) {
  if (!cuerpo) return `Error HTTP ${status}`
  const campos = []
  for (const campo in cuerpo.data) {
    campos.push(`${campo}: ${cuerpo.data[campo].message}`)
  }
  const mensaje = cuerpo.message || `Error HTTP ${status}`
  return campos.length > 0 ? `${mensaje} (${campos.join(' · ')})` : mensaje
}

// fetch solo rechaza si falla la red. Un 400 o un 404 NO lanzan error:
// hay que revisar respuesta.ok nosotros (conferencia C8).
async function solicitar(url, opciones = {}) {
  const esFormulario = opciones.body instanceof FormData
  let respuesta
  try {
    respuesta = await fetch(url, {
      ...opciones,
      // Con FormData NO se pone Content-Type: el navegador lo calcula solo.
      headers: esFormulario ? {} : { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new Error('No se pudo conectar con el servidor. ¿Está PocketBase encendido?')
  }

  if (!respuesta.ok) {
    let cuerpo = null
    try {
      cuerpo = await respuesta.json()
    } catch {
      // la respuesta de error no traía JSON
    }
    const error = new Error(describirError(cuerpo, respuesta.status))
    error.status = respuesta.status
    throw error
  }

  // 204 No Content no trae cuerpo
  return respuesta.status === 204 ? null : respuesta.json()
}

// Escapa un texto para meterlo entre comillas dentro de un filtro de PocketBase.
function textoFiltro(valor) {
  return '"' + String(valor).replaceAll('\\', '\\\\').replaceAll('"', '\\"') + '"'
}

// ----------------------------------------------------------------- resumen

export function obtenerResumen(signal) {
  return solicitar(`${BASE}/api/resumen`, { signal })
}

// ----------------------------------------------------------------- ordenes

export const ESTADOS_ACTIVOS = 'activas'

// Lista órdenes con filtros opcionales. Devuelve { items, page, totalPages, totalItems }.
export function listarOrdenes({ estado, busqueda, cliente, pagina = 1, porPagina = 20 }, signal) {
  const condiciones = []
  if (estado === ESTADOS_ACTIVOS) {
    condiciones.push('estado != "entregada" && estado != "rechazada" && estado != "cancelada"')
  } else if (estado) {
    condiciones.push(`estado = ${textoFiltro(estado)}`)
  }
  if (cliente) {
    condiciones.push(`cliente = ${textoFiltro(cliente)}`)
  }
  if (busqueda) {
    const t = textoFiltro(busqueda)
    condiciones.push(`(equipo ~ ${t} || problema ~ ${t} || cliente.nombre ~ ${t} || cliente.telefono ~ ${t})`)
  }

  // URLSearchParams codifica los valores (espacios, comillas, &&) por nosotros.
  const params = new URLSearchParams({
    sort: '-created',
    expand: 'cliente',
    page: pagina,
    perPage: porPagina,
  })
  if (condiciones.length > 0) {
    params.set('filter', condiciones.join(' && '))
  }
  return solicitar(`${API}/ordenes/records?${params}`, { signal })
}

export function obtenerOrden(id, signal) {
  return solicitar(`${API}/ordenes/records/${encodeURIComponent(id)}?expand=cliente`, { signal })
}

// datos es un FormData porque la orden puede llevar fotos (multipart).
export function crearOrden(datos) {
  return solicitar(`${API}/ordenes/records`, { method: 'POST', body: datos })
}

// Cambia la etapa de una orden. "extra" lleva el presupuesto al presupuestar.
// El servidor decide si el cambio es válido; aquí no se confía en la interfaz.
export function cambiarEtapa(id, estado, extra = {}) {
  return solicitar(`${API}/ordenes/records/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ ...extra, estado }),
  })
}

// URL de una foto. thumb opcional: '100x100' o '300x0' (declarados en el campo).
export function urlFoto(orden, archivo, thumb) {
  const url = `${BASE}/api/files/${orden.collectionId}/${orden.id}/${encodeURIComponent(archivo)}`
  return thumb ? `${url}?thumb=${thumb}` : url
}

// ----------------------------------------------------------------- eventos

export async function listarEventos(ordenId, signal) {
  const params = new URLSearchParams({
    filter: `orden = ${textoFiltro(ordenId)}`,
    sort: 'created',
    perPage: 200,
  })
  const respuesta = await solicitar(`${API}/eventos/records?${params}`, { signal })
  return respuesta.items
}

// ---------------------------------------------------------------- clientes

export async function listarClientes(signal) {
  const params = new URLSearchParams({ sort: 'nombre', perPage: 500 })
  const respuesta = await solicitar(`${API}/clientes/records?${params}`, { signal })
  return respuesta.items
}

export function obtenerCliente(id, signal) {
  return solicitar(`${API}/clientes/records/${encodeURIComponent(id)}`, { signal })
}

export function crearCliente(datos) {
  return solicitar(`${API}/clientes/records`, { method: 'POST', body: JSON.stringify(datos) })
}
