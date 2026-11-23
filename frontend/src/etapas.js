// Etapas de una orden, en el orden del proceso, con su nombre para mostrar.
export const ETAPAS = [
  { valor: 'solicitada', nombre: 'Solicitada' },
  { valor: 'en_diagnostico', nombre: 'En diagnóstico' },
  { valor: 'presupuestada', nombre: 'Presupuestada' },
  { valor: 'aprobada', nombre: 'Aprobada' },
  { valor: 'en_reparacion', nombre: 'En reparación' },
  { valor: 'lista', nombre: 'Lista' },
  { valor: 'entregada', nombre: 'Entregada' },
]

// Las dos salidas del proceso.
export const SALIDAS = [
  { valor: 'rechazada', nombre: 'Rechazada' },
  { valor: 'cancelada', nombre: 'Cancelada' },
]

export const FINALES = ['entregada', 'rechazada', 'cancelada']

export function nombreEtapa(valor) {
  const etapa = [...ETAPAS, ...SALIDAS].find((e) => e.valor === valor)
  return etapa ? etapa.nombre : valor
}

// Qué botones ofrece la interfaz en cada etapa. Es solo para mostrar opciones:
// quien garantiza los cambios permitidos es el hook del servidor.
export const ACCIONES = {
  solicitada: [
    { a: 'en_diagnostico', texto: 'Empezar revisión' },
    { a: 'cancelada', texto: 'Cancelar orden', peligro: true, confirmar: '¿Cancelar la orden a petición del cliente? No se puede deshacer.' },
  ],
  // en_diagnostico -> presupuestada se hace con el formulario de presupuesto
  presupuestada: [
    { a: 'aprobada', texto: 'El cliente aprueba' },
    { a: 'rechazada', texto: 'El cliente rechaza', peligro: true, confirmar: '¿El cliente rechaza el presupuesto? La orden se cerrará sin reparar.' },
  ],
  aprobada: [{ a: 'en_reparacion', texto: 'Empezar reparación' }],
  en_reparacion: [{ a: 'lista', texto: 'Terminar reparación' }],
  lista: [{ a: 'entregada', texto: 'Entregar al cliente', confirmar: '¿Confirmas que el equipo se entregó al cliente?' }],
}

// Total del presupuesto: mano de obra + cantidad × precio de cada pieza.
// Se calcula siempre a partir de los datos; no se guarda en el servidor.
export function calcularTotal(manoObra, piezas) {
  let total = Number(manoObra || 0)
  for (const pieza of piezas || []) {
    total += Number(pieza.cantidad) * Number(pieza.precio)
  }
  return total
}

export function formatearDinero(valor) {
  return '$' + Number(valor || 0).toFixed(2)
}

// PocketBase guarda las fechas en UTC con el formato "2026-11-18 10:30:00.000Z".
export function formatearFecha(texto) {
  if (!texto) return ''
  return new Date(texto.replace(' ', 'T')).toLocaleString('es', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

// Días completos desde que se recibió una orden.
export function diasEnTaller(texto) {
  const recibida = new Date(texto.replace(' ', 'T'))
  return Math.floor((Date.now() - recibida.getTime()) / (24 * 60 * 60 * 1000))
}

// A partir de estos días una orden abierta se marca como atrasada.
export const DIAS_ATRASO = 7

// Cuánto tiempo lleva una orden en el taller, en palabras.
export function tiempoEnTaller(texto) {
  const dias = diasEnTaller(texto)
  if (dias <= 0) return 'Hoy'
  if (dias === 1) return 'Hace 1 día'
  return `Hace ${dias} días`
}

// Fecha corta para el recorrido de etapas: "20 nov".
export function formatearDia(texto) {
  return new Date(texto.replace(' ', 'T')).toLocaleDateString('es', { day: 'numeric', month: 'short' })
}
