/// <reference path="../pb_data/types.d.ts" />

// Ruta propia: cuántas órdenes hay en cada etapa.
// GET /api/resumen  ->  { "total": 5, "porEstado": { "solicitada": 1, ... } }
routerAdd("GET", "/api/resumen", (e) => {
  const estados = [
    "solicitada",
    "en_diagnostico",
    "presupuestada",
    "aprobada",
    "en_reparacion",
    "lista",
    "entregada",
    "rechazada",
    "cancelada",
  ];

  const porEstado = {};
  let total = 0;
  for (const estado of estados) {
    // $dbx.hashExp arma el WHERE con valores seguros (sin concatenar texto)
    const cantidad = $app.countRecords("ordenes", $dbx.hashExp({ estado: estado }));
    porEstado[estado] = cantidad;
    total += cantidad;
  }

  return e.json(200, { total: total, porEstado: porEstado });
});
