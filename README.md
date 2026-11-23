# Taller de Reparaciones

Aplicación web para un taller que repara equipos electrónicos: registra los equipos que llegan, sigue cada orden por sus etapas (diagnóstico, presupuesto, reparación, entrega) y guarda el historial de cada cambio.

- **Interfaz:** React con Vite y React Router (`frontend/`).
- **Servidor:** PocketBase, con su esquema en `backend/pb_migrations` y la lógica propia en `backend/pb_hooks`.

Segundo Parcial de Programación Web.

---

## Cómo arrancarlo desde cero

### 1. Requisitos

| Herramienta | Para qué | Cómo comprobarlo |
|---|---|---|
| [Node.js](https://nodejs.org) LTS (20 o superior) | Ejecutar Vite y React | `node -v` |
| npm (viene con Node.js) | Instalar dependencias | `npm -v` |
| [PocketBase](https://github.com/pocketbase/pocketbase/releases) | El servidor (un solo ejecutable) | Se descarga en el paso 3 |
| Git | Clonar el repositorio | `git --version` |

### 2. Clonar el repositorio

```bash
git clone https://github.com/lisdy005/taller_reparaciones.git
```

```bash
cd taller_reparaciones
```

### 3. Descargar PocketBase

Descarga el zip de tu sistema desde la [página de releases](https://github.com/pocketbase/pocketbase/releases) (`windows_amd64`, `linux_amd64` o `darwin_arm64` / `darwin_amd64` en Mac) y **descomprime el ejecutable dentro de la carpeta `backend/`**, junto a `pb_migrations` y `pb_hooks`.

```
backend/
├── pocketbase        (o pocketbase.exe en Windows)
├── pb_hooks/
└── pb_migrations/
```

Linux o Mac, la primera vez:

```bash
chmod +x backend/pocketbase
```

> Probado con PocketBase v0.40.6. La versión 0.41.x usa la misma API de hooks y migraciones.

### 4. Arrancar el servidor

Linux o Mac:

```bash
cd backend
```

```bash
./pocketbase serve
```

Windows (PowerShell):

```powershell
cd backend
.\pocketbase.exe serve
```

La primera vez, PocketBase crea `backend/pb_data/` y aplica solo las migraciones:

1. **`1763500000_crear_colecciones.js`**: crea `clientes`, `ordenes` y `eventos` con sus reglas de acceso.
2. **`1763500100_datos_de_prueba.js`**: carga **4 clientes** y **9 órdenes, una en cada etapa**: `solicitada`, `en_diagnostico`, `presupuestada`, `aprobada`, `en_reparacion`, `lista`, `entregada`, `rechazada` y `cancelada`. Cada orden recorre sus etapas de verdad, así que los hooks escriben su historial igual que cuando se usa la aplicación.

El servidor queda en `http://127.0.0.1:8090`. Para entrar al panel de administración (`http://127.0.0.1:8090/_/`), crea antes un superusuario, en otra terminal dentro de `backend/`:

```bash
./pocketbase superuser upsert admin@ejemplo.cu 1234567890
```

(En Windows: `.\pocketbase.exe superuser upsert admin@ejemplo.cu 1234567890`.) La aplicación **no** necesita superusuario: es solo para mirar los datos.

### 5. Arrancar la interfaz

En otra terminal, desde la raíz del repositorio:

```bash
cd frontend
```

```bash
npm install
```

```bash
npm run dev
```

Abre `http://localhost:5173`.

Si PocketBase corre en otra dirección, crea `frontend/.env.local` con:

```
VITE_PB_URL=http://127.0.0.1:8090
```

### Volver a los datos iniciales

Detén PocketBase, borra la carpeta `backend/pb_data/` y vuelve a ejecutar `serve`: se recrean las colecciones y los datos de prueba.

---

## Qué hace la aplicación

| Ruta | Página |
|---|---|
| `/` | **Tablero del taller**: una columna por etapa con sus equipos (foto, cliente, tiempo en el taller y total del presupuesto). Las órdenes con 7 días o más se marcan como atrasadas |
| `/ordenes` | **Lista** de órdenes, con filtro por etapa y búsqueda por cliente, teléfono, equipo o problema. Acepta `?estado=`, `?q=` y `?cliente=` |
| `/ordenes/:id` | **Detalle**: recorrido de etapas con su fecha, orden de trabajo, fotos, presupuesto, botones de la siguiente etapa e historial |
| `/recepcion` | **Recibir equipo**: cliente (registrado o nuevo), equipo, problema y hasta 3 fotos |
| `/clientes` | **Clientes**: buscar, registrar y ver cuántas órdenes tiene cada uno y cuántas siguen en el taller |
| cualquier otra | Página **404** |

Todas las páginas se dibujan dentro de `Layout`, que tiene la cabecera, el menú y un `<Outlet />`.

**Para facilitar el trabajo del personal:**
- Las barras de búsqueda, el campo *Equipo* y la descripción de las piezas sugieren opciones mientras se escribe, con la etiqueta HTML `<datalist>`. Al elegir un cliente sugerido en *Recibir equipo*, queda seleccionado solo.
- Toda la fila de la lista de órdenes abre la orden.
- El botón *Volver* regresa a la pantalla anterior (`navigate(-1)`).
- Si el sistema está en modo oscuro, la aplicación también (`prefers-color-scheme`).

### Etapas de una orden

```
solicitada → en_diagnostico → presupuestada → aprobada → en_reparacion → lista → entregada
     │                              │
     └──→ cancelada                 └──→ rechazada
```

---

## Garantías del servidor

Todo esto se cumple aunque alguien se salte la interfaz y hable directo con la API. La interfaz **no** es una medida de seguridad.

| Garantía | Dónde se implementa |
|---|---|
| Una orden nueva nace siempre en `solicitada` y sin presupuesto | Hook `onRecordCreateRequest` (`pb_hooks/ordenes.pb.js`) |
| Solo se avanza a la etapa siguiente de la tabla; no se saltan etapas | Hook `onRecordUpdateRequest` + tabla `TRANSICIONES` (`pb_hooks/ordenes.pb.js`) |
| Solo se cancela desde `solicitada`; solo se rechaza desde `presupuestada` | Mismo hook y misma tabla |
| Una orden rechazada, cancelada o entregada no cambia más | Mismo hook (`FINALES`) |
| El presupuesto se registra solo al pasar de `en_diagnostico` a `presupuestada`, con diagnóstico y piezas válidas, y después no se modifica | Mismo hook |
| Cada cambio de etapa crea un evento con su fecha | Hooks `onRecordAfterCreateSuccess` y `onRecordAfterUpdateSuccess`, que comparan `e.record.original()` con el registro guardado |
| Los eventos no se crean a mano, ni se editan, ni se borran | Reglas `createRule`, `updateRule` y `deleteRule = null` en `eventos`: solo el servidor los escribe |
| Las órdenes no se borran | Regla `deleteRule = null` en `ordenes` |
| El total del presupuesto no se guarda: se calcula (mano de obra + cantidad × precio) | `calcularTotal` en `frontend/src/etapas.js` |
| Lo que se ve coincide con lo guardado | La interfaz no guarda datos por su cuenta: siempre los lee del servidor y los vuelve a pedir después de cada cambio. Si el servidor rechaza un cambio, se muestra el motivo y la pantalla se vuelve a sincronizar. Los filtros de la lista viven en la URL |

Ruta propia: `GET /api/resumen` devuelve `{ total, porEstado: { solicitada: 1, ... } }` (`pb_hooks/resumen.pb.js`).

### Comprobarlo con Bruno

La carpeta `pruebas/bruno/` es una colección de [Bruno](https://www.usebruno.com) (la herramienta de la conferencia C9) con **47 peticiones y 91 pruebas** que intentan romper las reglas hablando directo con la API.

1. Con PocketBase encendido, abre Bruno: **Collections → Open Collection** y elige la carpeta `pruebas/bruno`.
2. Arriba a la derecha, selecciona el entorno **local** (`baseUrl = http://127.0.0.1:8090`).
3. Clic derecho sobre la colección → **Run** para ejecutarla entera, en orden. También se puede ejecutar cada petición por separado, pero en orden, porque unas guardan ids (`bru.setVar`) que usan las siguientes.

| Carpeta | Qué demuestra |
|---|---|
| `00-Salud` | El servidor está encendido |
| `01-Clientes` | Crear y listar clientes; un cliente sin teléfono da 400; borrar da 403 |
| `02-Ordenes` | Una orden nace en `solicitada`; no se puede crear ya avanzada ni con presupuesto; `expand=cliente`; filtros; subir fotos (multipart) y miniaturas; más de 3 fotos da 400; borrar una orden da 403 |
| `03-Etapas` | No se saltan etapas; no se cancela después de empezar la revisión |
| `04-Presupuesto` | Validación del presupuesto; después de registrarlo no se modifica; el total se calcula y no se guarda |
| `05-Recorrido` | La orden llega a `entregada` y ya no cambia |
| `06-Salidas` | Rechazar y cancelar; las órdenes cerradas no cambian |
| `07-Historial` | Hay un evento por cada cambio, en orden; crear, editar o borrar eventos da 403 |
| `08-Resumen` | La ruta propia `/api/resumen` |

Cada ejecución crea datos nuevos. Para volver a los datos iniciales, borra `backend/pb_data/` y arranca PocketBase otra vez.

---

## Estructura del proyecto

```
backend/
  pb_migrations/
    1763500000_crear_colecciones.js   esquema: clientes, ordenes, eventos y reglas
    1763500100_datos_de_prueba.js     4 clientes y 9 órdenes (una por etapa) con su historial
  pb_hooks/
    ordenes.pb.js                     hooks de validación y creación de eventos
    resumen.pb.js                     ruta propia GET /api/resumen
frontend/
  src/
    main.jsx                          BrowserRouter + App
    App.jsx                           todas las rutas
    api.js                            peticiones a PocketBase con fetch
    etapas.js                         nombres de etapas, acciones, total, formatos
    styles.css                        estilos
    paginas/                          una página por ruta
    componentes/                      componentes pequeños reutilizables
pruebas/
  bruno/                              colección de Bruno: pruebas de la API
```

## Modelo de datos

| Colección | Campos |
|---|---|
| `clientes` | `nombre` (texto), `telefono` (texto) |
| `ordenes` | `cliente` (relación a clientes, requerida), `equipo` (texto), `problema` (texto), `estado` (select), `diagnostico` (texto), `manoObra` (número), `piezas` (json: `[{ descripcion, cantidad, precio }]`), `fotos` (archivos, hasta 3 imágenes) |
| `eventos` | `orden` (relación a ordenes), `de` (texto), `a` (texto), `created` (fecha automática) |

Las tres colecciones tienen además `created` (y `clientes`/`ordenes`, `updated`) como fechas automáticas. El evento con el que nace una orden tiene `de` vacío y `a = "solicitada"`.
