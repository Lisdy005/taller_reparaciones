// Sugerencias para los campos de texto (<datalist>), para que el personal
// no tenga que escribir ni recordar todo: el navegador muestra una flechita
// y una lista de opciones mientras se escribe.

export const EQUIPOS_COMUNES = [
  'Teléfono Samsung',
  'Teléfono iPhone',
  'Teléfono Xiaomi',
  'Teléfono Motorola',
  'Laptop HP',
  'Laptop Lenovo',
  'Laptop Dell',
  'Laptop Asus',
  'Computadora de escritorio',
  'Televisor Samsung',
  'Televisor LG',
  'Tablet Samsung',
  'Tablet Lenovo',
  'iPad',
  'Monitor',
  'Impresora',
  'Consola PlayStation',
  'Consola Xbox',
  'Bocina Bluetooth',
]

export const PIEZAS_COMUNES = [
  'Pantalla',
  'Batería',
  'Conector de carga',
  'Fuente de poder',
  'Flex de encendido',
  'Teclado',
  'Ventilador',
  'Pasta térmica',
  'Tira de LEDs',
  'Placa base',
  'Cámara',
  'Altavoz',
  'Micrófono',
  'Tornillos',
]

// Quita repetidos y vacíos de una lista de textos, manteniendo el orden.
export function sinRepetidos(textos) {
  const unicos = []
  for (const texto of textos) {
    if (texto && !unicos.includes(texto)) {
      unicos.push(texto)
    }
  }
  return unicos
}
