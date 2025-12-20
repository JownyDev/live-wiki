# Diseño — Relaciones de localización (Events / Places / Planets / Characters)

Fecha: 2025-12-20  
Proyecto: Live-Wiki  
Ámbito: MVP (modelado de relaciones + formato de datos en frontmatter)

---

## 1) Contexto

Queremos que la wiki sea **texto plano en Git**, fácil de editar con IA (Codex) y con un **modelo consistente** para poder:
- navegar y cruzar entidades (links),
- generar “relaciones inversas” (p. ej. “eventos en los que aparece X”),
- y preparar el terreno para el linter (referencias rotas, incoherencias).

En este paso definimos **cómo representar ubicaciones** y relaciones entre:
- **Event**
- **Place**
- **Planet**
- **Character**

---

## 2) Decisiones

### 2.1 Event → Location (flexible, múltiple y opcional)
**Decisión**
- Un evento puede tener **0, 1 o N ubicaciones**.
- La ubicación es **flexible**: puede ser un `place`, un `planet`, “espacio”, o desconocida.
- Por lo tanto:
  - `locations` puede faltar o ser lista vacía.
  - Puede incluir múltiples lugares (ej. guerra en varios frentes).

**Por qué**
- Permite eventos “abstractos” o “en tránsito” (sin lugar fijo).
- Soporta eventos multi-localización (guerras, operaciones simultáneas).
- Evita forzar a inventar un lugar falso para cuadrar el modelo.

---

### 2.2 Place → Planet (opcional) + tipo de localización
**Decisión**
- Un `Place` puede estar asociado a un planeta (`planetId`) **o no**.
- Si no tiene planeta, se clasifica con `locationType`:
  - `space` | `planet` | `unknown`

**Por qué**
- Soporta “lugares” que no pertenecen a un planeta (naves, estaciones, anomalías, planos).
- Mantiene el modelo simple para el MVP.
- Permite crecer sin romper los datos (un place puede migrar a planetId cuando se defina).

---

### 2.3 Character → Residence (NO en MVP, posible a futuro)
**Decisión**
- No modelamos residencia ahora.
- Queda registrado como decisión futura posible: `residences[]` con rangos de fechas.

**Por qué**
- Para el MVP, la residencia puede inferirse por eventos + texto.
- Un sistema temporal de residencias añade complejidad (cronología, rangos, consistencia) que no hace falta todavía.
- Pero lo dejamos “preparado” como evolución natural si lo necesitas.

---

### 2.4 Character → Origin (localización flexible)
**Decisión**
- `origin` (origen/nacimiento) será una **localización flexible**, no necesariamente un `Place`.
- Debe cubrir:
  - nacimiento en un lugar
  - nacimiento en una nave / espacio
  - nacimiento “mítico” (astro brillante, entidad divina, etc.)

**Por qué**
- Evita inconsistencias al forzar “place” cuando el origen no es geográfico.
- Permite historias raras sin romper el esquema.
- Mantiene el dato estructurado aunque sea “no tradicional”.

---

### 2.5 Event → Planet (flexible como origin; derivable si hay place)
**Decisión**
- El evento usa **la misma idea de localización flexible** que `origin`.
- Si un evento referencia un `place`, se puede **derivar** su `planet` desde el `place`.
- Pero no obligamos a que el evento tenga `planet` explícito.

**Por qué**
- Máxima flexibilidad: eventos “en órbita”, “en salto”, “entre planetas”.
- Si hay `place`, la relación con planet sale “gratis” sin redundancia.
- Evita duplicar datos y tener que mantenerlos sincronizados.

---

## 3) Decisión adicional: formato exacto de `who` (participantes)
**Decisión**
- `who` debe ser una **lista de objetos** de tipo `character` (no strings).

Ejemplo:
~~~yaml
who:
  - character: kael-nyx
  - character: nyara-astral
~~~

**Por qué**
- Es más explícito y extensible (en el futuro puedes añadir `role`, `notes`, etc. sin romper formato).
- Evita ambigüedades al mezclar distintos tipos de participantes.
- Facilita validación del linter y queries consistentes.

---

## 4) Convención propuesta para representar localizaciones en frontmatter (MVP)

Para mantenerlo fácil de editar y fácil de validar por linter, proponemos un formato **string tipado** en ubicaciones:

- `place:<id>`
- `planet:<id>`
- `space:<texto_libre>`
- `unknown`

### 4.1 Event
- Campo recomendado: `locations: []` (lista de strings)

Ejemplo:
~~~yaml
type: event
id: guerra-de-los-tres-frentes
title: Guerra de los Tres Frentes
date: 2217-04-03
who:
  - character: kael-nyx
locations:
  - place:puerto-ceniza
  - place:ciudad-anillo
  - space:Órbita de Aetherion (sector K-7)
~~~

### 4.2 Place
- Campos recomendados:
  - `planetId` opcional (si está en un planeta)
  - `locationType` cuando no hay planeta

Ejemplos:

Place “normal” en planeta:
~~~yaml
type: place
id: puerto-ceniza
name: Puerto Ceniza
planetId: planet:aetherion
~~~

Place “en el espacio”:
~~~yaml
type: place
id: estacion-nomad
name: Estación Nómad
locationType: space
~~~

Place “desconocido”:
~~~yaml
type: place
id: santuario-sin-coordenadas
name: Santuario sin Coordenadas
locationType: unknown
~~~

### 4.3 Character (origin)
Ejemplos:
~~~yaml
type: character
id: kael-nyx
name: Kael Nyx
origin: place:puerto-ceniza
~~~

~~~yaml
type: character
id: nyara-astral
name: Nyara Astral
origin: space:Nacida del pulso de un astro brillante
~~~

~~~yaml
type: character
id: el-primero
name: El Primero
origin: unknown
~~~

---

## 5) Nota técnica: normalización de referencias (parser único)
**Nota (no es un cabo suelto)**
- El linter y las queries deben compartir el mismo parser/normalizador de referencias (`place:`, `planet:`, `character:`).
- Esto evita que la UI y el linter interpreten distinto el mismo dato.

---

## 6) Implicaciones técnicas (para queries y linter)

### Queries
- “Eventos por personaje” usa `who` (lista de objetos `character`).
- Próximas queries naturales:
  - “Eventos por place” (si `locations` contiene `place:<id>`)
  - “Eventos por planet”
    - directos: `locations` contiene `planet:<id>`
    - derivados: `locations` contiene `place:<id>` → place.planetId == planet

### Linter (MVP cercano)
- Validar que:
  - `who[*].character` apunte a un character existente
  - `locations[*]` con `place:<id>` apunte a un place existente
  - `locations[*]` con `planet:<id>` apunte a un planet existente
  - `space:<texto>` no se valida (texto libre)
  - `unknown` permitido
- Esto evita “coladas” de referencias rotas en ubicaciones/origen.

---

## 7) No objetivos (por ahora)
- No implementar `residences[]` temporales.
- No implementar afiliaciones/facciones/roles de participantes (se excluyen en este ciclo).
- No forzar un solo lugar por evento.

---

## 8) Cabos sueltos (estado actual)
- No hay cabos sueltos críticos con estas decisiones; el modelo es consistente para continuar el MVP.

---
