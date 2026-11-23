/// <reference path="../pb_data/types.d.ts" />

// Esquema del taller: clientes, ordenes y eventos.
// Los nombres de colecciones y campos son los del enunciado, sin cambios.
//
// Reglas de acceso (no hay autenticación, así que no distinguen quién pide):
//   ""   -> pública (cualquiera puede)
//   null -> bloqueada (solo superusuarios desde el panel)
// Lo que nunca debe ocurrir queda bloqueado aquí; el resto lo validan los hooks.

migrate((app) => {
  // ---------------------------------------------------------------- clientes
  const clientes = new Collection({
    type: "base",
    name: "clientes",
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "",
    deleteRule: null, // un cliente con órdenes no debe desaparecer
    fields: [
      { name: "nombre", type: "text", required: true, min: 2, max: 100 },
      { name: "telefono", type: "text", required: true, min: 3, max: 30 },
      { name: "created", type: "autodate", onCreate: true, onUpdate: false },
      { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
    ],
  });
  app.save(clientes);

  // ----------------------------------------------------------------- ordenes
  const ordenes = new Collection({
    type: "base",
    name: "ordenes",
    listRule: "",
    viewRule: "",
    createRule: "", // el hook obliga a nacer en "solicitada"
    updateRule: "", // el hook valida cada cambio de etapa
    deleteRule: null, // las órdenes no se borran nunca
    fields: [
      {
        name: "cliente",
        type: "relation",
        required: true,
        collectionId: clientes.id,
        maxSelect: 1,
        cascadeDelete: false,
      },
      { name: "equipo", type: "text", required: true, min: 2, max: 150 },
      { name: "problema", type: "text", required: true, min: 3, max: 2000 },
      {
        name: "estado",
        type: "select",
        required: true,
        maxSelect: 1,
        values: [
          "solicitada",
          "en_diagnostico",
          "presupuestada",
          "aprobada",
          "rechazada",
          "en_reparacion",
          "lista",
          "entregada",
          "cancelada",
        ],
      },
      { name: "diagnostico", type: "text", max: 2000 },
      { name: "manoObra", type: "number", min: 0 },
      // Lista de piezas: [{ "descripcion": "...", "cantidad": 1, "precio": 10 }]
      { name: "piezas", type: "json", maxSize: 100000 },
      {
        name: "fotos",
        type: "file",
        maxSelect: 3,
        maxSize: 5 * 1024 * 1024,
        mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
        thumbs: ["100x100", "300x0"],
      },
      { name: "created", type: "autodate", onCreate: true, onUpdate: false },
      { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
    ],
    indexes: ["CREATE INDEX idx_ordenes_estado ON ordenes (estado)"],
  });
  app.save(ordenes);

  // ----------------------------------------------------------------- eventos
  // Historial de cambios de etapa. Los escribe el servidor (hook) en la misma
  // transacción que el cambio de la orden, así no puede faltar ni inventarse.
  const eventos = new Collection({
    type: "base",
    name: "eventos",
    listRule: "",
    viewRule: "",
    createRule: null, // solo el servidor crea eventos
    updateRule: null, // nadie los edita
    deleteRule: null, // nadie los borra
    fields: [
      {
        name: "orden",
        type: "relation",
        required: true,
        collectionId: ordenes.id,
        maxSelect: 1,
        cascadeDelete: false,
      },
      { name: "de", type: "text", max: 30 }, // vacío en el evento de creación
      { name: "a", type: "text", required: true, max: 30 },
      { name: "created", type: "autodate", onCreate: true, onUpdate: false },
    ],
    indexes: ["CREATE INDEX idx_eventos_orden ON eventos (orden)"],
  });
  app.save(eventos);
}, (app) => {
  for (const nombre of ["eventos", "ordenes", "clientes"]) {
    app.delete(app.findCollectionByNameOrId(nombre));
  }
});
