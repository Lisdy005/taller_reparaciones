/// <reference path="../pb_data/types.d.ts" />

// Hooks del taller (conferencia C9, "Extender PocketBase con JavaScript").
//
// Las reglas de acceso de la migración bloquean lo que nunca debe ocurrir
// (borrar órdenes, crear, editar o borrar eventos). Estos hooks validan el
// resto, aunque alguien se salte la interfaz y hable directo con la API.
//
// Cada handler corre aislado y no puede usar variables definidas fuera de él,
// por eso cada uno declara dentro lo que necesita.

// ------------------------------------------------- antes de crear una orden
onRecordCreateRequest((e) => {
  // Si no se indica la etapa, la orden nace en "solicitada".
  const estado = e.record.getString("estado");
  if (estado === "") {
    e.record.set("estado", "solicitada");
  } else if (estado !== "solicitada") {
    throw new BadRequestError("Una orden nueva siempre empieza en la etapa 'solicitada'.");
  }

  // El presupuesto no se registra al crear la orden.
  const piezas = e.record.getString("piezas");
  if (
    e.record.getString("diagnostico") !== "" ||
    e.record.getFloat("manoObra") !== 0 ||
    (piezas !== "" && piezas !== "null" && piezas !== "[]")
  ) {
    throw new BadRequestError(
      "El presupuesto (diagnóstico, mano de obra y piezas) se registra al pasar a 'presupuestada', no al crear la orden.",
    );
  }

  e.next(); // sin esta llamada el registro nunca se guarda
}, "ordenes");

// --------------------------------------------- antes de modificar una orden
onRecordUpdateRequest((e) => {
  // Cambios de etapa permitidos, y ninguno más (tabla del enunciado).
  const TRANSICIONES = {
    solicitada: ["en_diagnostico", "cancelada"],
    en_diagnostico: ["presupuestada"],
    presupuestada: ["aprobada", "rechazada"],
    aprobada: ["en_reparacion"],
    en_reparacion: ["lista"],
    lista: ["entregada"],
  };
  const FINALES = ["rechazada", "cancelada", "entregada"];

  // original() es el registro tal como está guardado, antes de esta petición.
  const original = e.record.original();
  const antes = original.getString("estado");
  const ahora = e.record.getString("estado");

  // 1. Una orden rechazada, cancelada o entregada no cambia más.
  if (FINALES.includes(antes)) {
    throw new BadRequestError(`La orden está '${antes}' y ya no admite cambios.`);
  }

  // 2. Solo se pasa a la etapa siguiente (o a una salida permitida).
  if (ahora !== antes) {
    const permitidas = TRANSICIONES[antes] || [];
    if (!permitidas.includes(ahora)) {
      throw new BadRequestError(`No se permite pasar de '${antes}' a '${ahora}'.`);
    }
  }

  // 3. El presupuesto se registra solo al pasar de en_diagnostico a presupuestada.
  if (antes === "en_diagnostico" && ahora === "presupuestada") {
    if (e.record.getString("diagnostico").trim() === "") {
      throw new BadRequestError("Para presupuestar hace falta el diagnóstico.");
    }

    let piezas;
    try {
      const texto = e.record.getString("piezas");
      piezas = texto === "" || texto === "null" ? [] : JSON.parse(texto);
    } catch (_) {
      throw new BadRequestError("piezas no es un JSON válido.");
    }
    if (!Array.isArray(piezas)) {
      throw new BadRequestError("piezas debe ser una lista.");
    }

    let n = 0;
    for (const pieza of piezas) {
      n++;
      if (pieza === null || typeof pieza !== "object") {
        throw new BadRequestError(`La pieza ${n} debe tener descripcion, cantidad y precio.`);
      }
      if (typeof pieza.descripcion !== "string" || pieza.descripcion.trim() === "") {
        throw new BadRequestError(`La pieza ${n} necesita una descripción.`);
      }
      if (!Number.isInteger(pieza.cantidad) || pieza.cantidad < 1) {
        throw new BadRequestError(`La cantidad de la pieza ${n} debe ser un entero mayor que 0.`);
      }
      if (typeof pieza.precio !== "number" || pieza.precio < 0) {
        throw new BadRequestError(`El precio de la pieza ${n} debe ser un número mayor o igual que 0.`);
      }
    }
    e.record.set("piezas", piezas); // se guarda siempre como lista
  } else {
    // 4. En cualquier otro momento el presupuesto no se puede tocar.
    if (
      e.record.getString("diagnostico") !== original.getString("diagnostico") ||
      e.record.getFloat("manoObra") !== original.getFloat("manoObra") ||
      e.record.getString("piezas") !== original.getString("piezas")
    ) {
      throw new BadRequestError(
        "El presupuesto solo se registra al pasar de 'en_diagnostico' a 'presupuestada' y después no se modifica.",
      );
    }
  }

  e.next();
}, "ordenes");

// --------------------------------------------------- historial de eventos
// Después de guardar con éxito, el servidor escribe el evento. Las reglas de
// la colección eventos están bloqueadas, así que nadie más puede crearlos.

// Al crear la orden: primer evento ("" -> "solicitada").
onRecordAfterCreateSuccess((e) => {
  const evento = new Record($app.findCollectionByNameOrId("eventos"));
  evento.set("orden", e.record.id);
  evento.set("de", "");
  evento.set("a", e.record.getString("estado"));
  $app.save(evento);

  e.next();
}, "ordenes");

// Al cambiar de etapa: un evento con la etapa anterior y la nueva.
onRecordAfterUpdateSuccess((e) => {
  const antes = e.record.original().getString("estado");
  const ahora = e.record.getString("estado");

  if (antes !== ahora) {
    const evento = new Record($app.findCollectionByNameOrId("eventos"));
    evento.set("orden", e.record.id);
    evento.set("de", antes);
    evento.set("a", ahora);
    $app.save(evento);
  }

  e.next();
}, "ordenes");
