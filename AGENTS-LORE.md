# AGENTS-LORE.md — Guía para redactar y mantener el Lore (Characters / Events / Places / Elements / etc.)

## 🎯 Propósito

Este documento define **cómo crear y modificar lore** en la live-wiki de forma:

- **coherente** (sin contradicciones internas)
- **consistente** (mismos formatos, tono y reglas)
- **creativa pero plausible** (fantasía con lógica interna)
- **verificable** (cada cambio pasa checks y revisión de impacto)

> Este archivo está pensado para agentes y humanos.
> 

---

## 📌 Alcance

Aplicar estas reglas cuando se cree o modifique cualquier entidad del lore:

- `type: character`
- `type: event`
- `type: place`
- `type: planet`
- `type: element`
- `type: mechanic`
- `type: card`
- relaciones (`related_*`, refs)
- cualquier otro `type:*` del universo

---

## 🧭 Principios editoriales

### Coherencia > detalle

Mejor 5 datos sólidos que 50 que se contradicen.

### Consistencia > originalidad

La creatividad es bienvenida, pero debe respetar:

- reglas del mundo
- cronología
- relaciones ya establecidas
- tono y nivel tecnológico/mágico del universo

### Plausibilidad interna

Aunque sea fantasía, el lector debe pensar: “esto podría pasar aquí”.

---

## 🧱 Estructura y estilo (reglas generales)

- **Frontmatter**:
    - Es la **ficha técnica** (datos exportables, UI, validación).
    - Evita “párrafos de novela” en YAML.
    - [Ver referencia completa de campos](./packages/lore-linter/LORE_SCHEMA.md).
- **Body (markdown)**:
    - Es la **descripción humana**.
    - Formato libre mientras sea Markdown; mejor si aprovecha recursos del formato (listas, énfasis, etc.).
- **Campos opcionales**:
    - Ningún bloque es obligatorio salvo lo mínimo que exija el linter.
    - Cada proyecto/juego puede usar diferentes secciones.

---

## ✅ Reglas de coherencia por tipo

### 👤 Characters (`type: character`)

**Obligatorio:** `id`, `name`.

- Mantén la descripción **breve y accionable**:
    - “Lo que eres”: rasgos + voz + valores + tabúes + bullets de historia si aportan.
    - “Lo que sabes”: texto plano (por ahora) y puntos ciegos.
    - “Lo que recuerdas ahora”: **solo perfiles/tags** (no eventos).
    - “Lo que sientes”: disposición base + manipulabilidad (si aplica).
    - “Lo que quieres”: objetivos y prioridades (si aplica).
    - `capabilities`: si el personaje usa acciones, que cada acción tenga `action + triggers`.
- Si se añade/edita una relación:
    - añade la relación “espejo” si el proyecto lo usa (o documenta por qué no).
    - evita relaciones ambiguas (“amigo”) sin una frase de justificación.

### 🗓️ Events (`type: event`)

**Obligatorio:** `id`, `title`, `date`, `who`.

- Un evento debe responder:
    - qué pasó, dónde, quién participó, consecuencias.
- Si un evento implica cambios de estado del mundo:
    - crea/actualiza refs necesarias (lugares, personajes, facciones...).

### 🗺️ Places (`type: place`) / 🪐 Planets (`type: planet`)

**Obligatorio:** `id`, `name`.

- Define una identidad clara:
    - propósito del lugar, ambiente, qué lo hace único, peligros.
- Si el lugar aparece en eventos, asegúrate de que:
    - el tono y escala coinciden con lo descrito.
- **Planets:**
    - Usar para cuerpos celestes o mundos enteros.
    - Definir si son habitables o no.

### 🧩 Elements (`type: element`) / ⚙️ Mechanics (`type: mechanic`)

**Obligatorio:** `id`, `name`.

- **Elements:**
    - Elementos fundamentales del sistema mágico/físico (fuego, vacío, eco, etc.).
    - Define claramente su origen (`origin`) si aplica.
- **Mechanics:**
    - Explicación de reglas del juego o leyes físicas específicas.
    - Si hay mecánicas, deben ser:
        - consistentes con lo ya establecido
        - comprensibles en 1 lectura
    - Si no aplica a este juego/prototipo, manténlo en lore “soft”.

### 🃏 Cards (`type: card`)

**Obligatorio:** `id`, `name`, `elements`.

- Representan cartas jugables o habilidades encapsuladas.
- Requiere `elements` (array de 2 refs a `element:*`) y `represents` (refs a character, place, event, etc.).
- Descripción clara del efecto o la representación simbólica.

---

## 🔍 Checklist de revisión de coherencia (obligatoria por cambio)

Cada vez que se crea/modifica una entidad:

### 1) Impacto y referencias

- [ ]  ¿Estoy introduciendo un concepto nuevo que afecta a otros textos?
- [ ]  ¿He actualizado entidades relacionadas (personajes, eventos, lugares...)?
- [ ]  ¿Hay referencias rotas o inconsistentes (ids, slugs, prefijos)?

### 2) Cronología

- [ ]  ¿Fechas/orden temporal tienen sentido?
- [ ]  ¿No contradice eventos existentes?
- [ ]  Si hay “primera vez que ocurre”, ¿es realmente la primera?

### 3) Relaciones

- [ ]  ¿Las relaciones son plausibles (motivo, contexto)?
- [ ]  ¿Hay simetría si el proyecto la usa?
- [ ]  ¿No estoy creando conexiones “porque sí”?

### 4) Tono y plausibilidad

- [ ]  ¿El personaje/lugar/evento encaja en el tono del universo?
- [ ]  ¿Hay una lógica interna que justifique acciones y consecuencias?

### 5) Consistencia de formato

- [ ]  Frontmatter limpio (sin texto largo).
- [ ]  Body en Markdown y legible (usa estructura si aporta).
- [ ]  Campos opcionales solo si aportan.

---

## 🧯 Protocolo de inconsistencias (OBLIGATORIO)

Si durante la creación/modificación detectas una posible inconsistencia (lore, cronología, relaciones, tono, formato) o algo que “no cuadra”:

1. **NO apliques el cambio de forma silenciosa.**
2. Haz un **output explícito** explicando:
    - qué inconsistencia has detectado
    - por qué crees que es un problema (impacto)
    - qué archivos/entidades están afectados
3. Propón **1–3 opciones** para resolverlo (mínimo):
    - opción conservadora (la que menos cambia)
    - opción creativa pero plausible
    - (opcional) opción “retcon” si es necesario
4. **Pide confirmación** antes de:
    - introducir un cambio que altere lore ya establecido
    - reescribir relaciones existentes
    - mover fechas/cronología
    - cambiar el tono o reglas del mundo
5. Tras confirmación, aplica el cambio y vuelve a pasar checklist + validación técnica.

> Ejemplos típicos donde debes parar y pedir confirmación:
> 
> - Un personaje “sabía” algo antes de que existiera el evento que lo revela.
> - Un lugar cambia de biome/ubicación sin explicación.
> - Una relación pasa de aliado a enemigo sin evento puente.
> - Un poder/artefacto rompe el equilibrio del mundo.

---

## 🧪 Validación técnica (siempre)

Después de cualquier cambio de lore:

- Ejecuta el comando estándar del repo para validar:
    - `pnpm wiki:check` y `pnpm verify`
- Corrige:
    - errores de frontmatter
    - refs rotas
    - warnings de consistencia si existen

---

## 🧠 Reglas para creatividad “controlada”

- Si introduces algo potente (un poder, un evento masivo, un secreto global):
    - añade **limitaciones** (coste, riesgo, rareza, consecuencias).
- Evita “Mary Sue / Deus ex machina”:
    - si resuelve demasiadas cosas, es demasiado fuerte o está mal acotado.
- Cada NPC debe tener:
    - una motivación comprensible
    - una contradicción humana (miedo, defecto, sesgo)
    - una forma de fallar

---

## 🧷 Convenciones recomendadas

- IDs en `kebab-case` sin prefijos; los prefijos (`character:`, `event:`, etc.) se usan en refs.
- Tags con prefijos claros (`zone:*`, `faction:*`, etc.) si el sistema los usa.
- Nombres: coherentes con cultura/idioma del mundo (no mezclar estilos sin motivo).

---

## 📎 Flujo de trabajo recomendado

1. Crear/editar entidad.
2. Revisar coherencia con checklist.
3. Revisar impacto (entidades relacionadas).
4. Ejecutar validación técnica.
5. Ajustar y dejar “listo para leer”.

---

## 🧩 Nota sobre “revisión global”

Si un cambio afecta a muchas entidades (ej. una guerra, un cambio de era, un retcon):

- agrupa el trabajo en una mini-iteración:
    - “cambio base” + “actualización de afectados” + “validación”
- evita dejar el repo en un estado intermedio incoherente.

---

## 🏷️ Estándar de Tags

Para mantener la consistencia en `memory_profile` y sistemas de búsqueda, usa estos tags estándar. Si necesitas nuevos, intenta seguir el patrón `categoria:subcategoria.*`.

### Interest Tags (Temas de memoria)
- `zona:atrio.mapa.*` (Eventos en zona mapa)
- `zona:atrio.brasero.*` (Eventos en zona brasero)
- `zona:atrio.puerta.*` (Eventos en zona puerta)
- `mapa.*` / `agua.*` / `fuego.*`
- `puerta.*` / `mecanismo.*`
- `ritual.*` / `divino.*`
- `todo.*` (Omnisciencia)

### Relationship Tags (Relación con jugador/NPCs)
- `jugador.*` (General con el jugador)
- `jugador.pide_ayuda`
- `jugador.amenaza`
- `jugador.confesion`

### Allowed/Blocked Tags (Filtros de memoria)
- `ayuda.*`
- `reparacion.*`
- `confesion.*`
- `violencia.*`
- `soborno.*`
- `mentira.*`

### Related Characters (Tipos de relación)
- `friend` / `ally`
- `enemy` / `rival`
- `family`
- `mentor` / `student`
- `superior` / `subordinate`

