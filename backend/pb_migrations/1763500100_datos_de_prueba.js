/// <reference path="../pb_data/types.d.ts" />

// Datos de prueba: 4 clientes y 9 órdenes, una en cada etapa, cada una con su
// historial de eventos. Se cargan solos la primera vez que arranca PocketBase.
//
// Cada orden recorre el proceso real: se crea en "solicitada" y se guarda una
// vez por cada etapa. Los hooks onRecordAfterCreateSuccess y
// onRecordAfterUpdateSuccess (pb_hooks/ordenes.pb.js) escriben los eventos,
// igual que cuando se usa la aplicación.
// Los ids son fijos para poder deshacer la migración.

const CLIENTES = [
  { id: "cliente00000ana", nombre: "Ana Pérez", telefono: "5551 2345" },
  { id: "cliente0000luis", nombre: "Luis Gómez", telefono: "5552 6789" },
  { id: "cliente000marta", nombre: "Marta Rodríguez", telefono: "5553 4410" },
  { id: "cliente0000jose", nombre: "José Hernández", telefono: "5554 7821" },
];

// 9 órdenes, una en cada etapa (incluidas las dos salidas).
// Cada orden lleva la lista de etapas por las que ya pasó, en orden.
const ORDENES = [
  {
    id: "orden0000000001",
    cliente: "cliente00000ana",
    equipo: "Teléfono Samsung A54",
    problema: "La pantalla se quedó en negro después de una caída.",
    etapas: ["solicitada"],
  },
  {
    id: "orden0000000002",
    cliente: "cliente0000luis",
    equipo: "Televisor LG 43 pulgadas",
    problema: "Hay sonido pero no hay imagen.",
    diagnostico: "Tira de LEDs de la retroiluminación quemada.",
    manoObra: 35,
    piezas: [{ descripcion: "Kit de tiras LED 43\"", cantidad: 1, precio: 48 }],
    etapas: ["solicitada", "en_diagnostico", "presupuestada"],
  },
  {
    id: "orden0000000003",
    cliente: "cliente00000ana",
    equipo: "Laptop HP Pavilion 15",
    problema: "No carga la batería y se apaga sola.",
    diagnostico: "Conector de carga flojo y batería agotada.",
    manoObra: 25,
    piezas: [
      { descripcion: "Conector DC de carga", cantidad: 1, precio: 12 },
      { descripcion: "Batería 3 celdas", cantidad: 1, precio: 55 },
    ],
    etapas: ["solicitada", "en_diagnostico", "presupuestada", "aprobada", "en_reparacion"],
  },
  {
    id: "orden0000000004",
    cliente: "cliente0000luis",
    equipo: "Tablet Lenovo Tab M10",
    problema: "El botón de encendido no responde.",
    diagnostico: "Flex del botón de encendido roto.",
    manoObra: 15,
    piezas: [{ descripcion: "Flex de encendido", cantidad: 1, precio: 8.5 }],
    etapas: ["solicitada", "en_diagnostico", "presupuestada", "aprobada", "en_reparacion", "lista", "entregada"],
  },
  {
    id: "orden0000000005",
    cliente: "cliente000marta",
    equipo: "Impresora Epson L3250",
    problema: "Mancha las hojas con tinta negra.",
    etapas: ["solicitada", "en_diagnostico"],
  },
  {
    id: "orden0000000006",
    cliente: "cliente0000jose",
    equipo: "Consola PlayStation 5",
    problema: "Se apaga sola a los pocos minutos de iniciar un juego.",
    diagnostico: "Pasta térmica seca y ventilador con polvo.",
    manoObra: 30,
    piezas: [{ descripcion: "Pasta térmica", cantidad: 1, precio: 6 }],
    etapas: ["solicitada", "en_diagnostico", "presupuestada", "aprobada"],
  },
  {
    id: "orden0000000007",
    cliente: "cliente000marta",
    equipo: "Teléfono iPhone 12",
    problema: "La batería dura menos de dos horas.",
    diagnostico: "Batería degradada al 71 %.",
    manoObra: 20,
    piezas: [{ descripcion: "Batería iPhone 12", cantidad: 1, precio: 42 }],
    etapas: ["solicitada", "en_diagnostico", "presupuestada", "aprobada", "en_reparacion", "lista"],
  },
  {
    id: "orden0000000008",
    cliente: "cliente0000jose",
    equipo: "Monitor Dell 24 pulgadas",
    problema: "Tiene una línea vertical en el centro de la pantalla.",
    diagnostico: "Panel LCD dañado; sale más caro repararlo que comprar otro.",
    manoObra: 25,
    piezas: [{ descripcion: "Panel LCD 24\"", cantidad: 1, precio: 110 }],
    etapas: ["solicitada", "en_diagnostico", "presupuestada", "rechazada"],
  },
  {
    id: "orden0000000009",
    cliente: "cliente00000ana",
    equipo: "Laptop Lenovo IdeaPad 3",
    problema: "El teclado tiene varias teclas que no responden.",
    etapas: ["solicitada", "cancelada"],
  },
];

migrate((app) => {
  for (const datos of CLIENTES) {
    const cliente = new Record(app.findCollectionByNameOrId("clientes"));
    cliente.set("id", datos.id);
    cliente.set("nombre", datos.nombre);
    cliente.set("telefono", datos.telefono);
    app.save(cliente);
  }

  for (const datos of ORDENES) {
    // 1. Se crea en "solicitada".
    const nueva = new Record(app.findCollectionByNameOrId("ordenes"));
    nueva.set("id", datos.id);
    nueva.set("cliente", datos.cliente);
    nueva.set("equipo", datos.equipo);
    nueva.set("problema", datos.problema);
    nueva.set("estado", "solicitada");
    app.save(nueva);

    // 2. Avanza etapa por etapa; el presupuesto se registra al presupuestar.
    for (const etapa of datos.etapas.slice(1)) {
      const orden = app.findRecordById("ordenes", datos.id);
      orden.set("estado", etapa);
      if (etapa === "presupuestada") {
        orden.set("diagnostico", datos.diagnostico);
        orden.set("manoObra", datos.manoObra);
        orden.set("piezas", datos.piezas);
      }
      app.save(orden);
    }
  }
}, (app) => {
  // Deshacer: borra los datos de prueba (los eventos primero, por la relación).
  for (const datos of ORDENES) {
    for (const evento of app.findRecordsByFilter("eventos", "orden = {:id}", "", 0, 0, { id: datos.id })) {
      app.delete(evento);
    }
    app.delete(app.findRecordById("ordenes", datos.id));
  }
  for (const datos of CLIENTES) {
    app.delete(app.findRecordById("clientes", datos.id));
  }
});
