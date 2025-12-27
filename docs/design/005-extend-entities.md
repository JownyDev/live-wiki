# Roadmap de mejoras inmediatas (Post-MVP) — Live-Wiki

> Objetivo: enriquecer las entidades existentes sin complicar el sistema ni romper el flujo Markdown+Git.
> Enfoque: cambios incrementales al schema + linter + UI, manteniendo compatibilidad y dejando campos opcionales.

## ✅ Mejoras que vamos a hacer ahora (con motivo)

### Character
- [x] **Relaciones con otros characters (etiquetadas)**  
  **Por qué:** permite mostrar redes sociales (amigos/enemigos/familia) y mejora la lectura del lore sin imponer un sistema rígido.  
  **Modelo definido:** `related_characters` como lista de objetos con `type` (etiqueta) + ref a `character:*`.  
- [x] **Elemento afín (relación a Element)**  
  **Por qué:** conecta lore/personajes con el “sistema elemental” y habilita UI de navegación por afinidades.
- [x] **Fecha de nacimiento (opcional)**  
  **Por qué:** habilita orden cronológico y timeline futura.
- [x] **Fecha de muerte (opcional)**  
  **Por qué:** coherencia temporal y soporte a arcos narrativos.
- [x] **Imagen (opcional)**  
  **Por qué:** mejora UX/escaneo visual y da identidad al personaje.

### Element
- [ ] **Origen (relación a Place) (opcional)**  
  **Por qué:** ancla elementos al mundo y permite navegación “de dónde viene este elemento”.
- [x] **Imagen (opcional)**  
  **Por qué:** lectura visual rápida del elemento.

### Event
- [x] **Imagen (opcional)**  
  **Por qué:** lectura visual + “poster” de evento; útil en timeline.

### Place
- [x] **Imagen (opcional)**  
  **Por qué:** mejora UX en navegación de localizaciones.

### Planet
- [x] **Imagen (opcional)**  
  **Por qué:** mejora UX; ayuda a diferenciar mundos.

### Mechanics
- [x] **Sin cambios**  
  **Por qué:** no aporta valor inmediato y ya cumple su rol en el MVP.

### Cards
- [x] **Sin cambios (por ahora)**  
  **Por qué:** es la clase más compleja (subtipos/atributos) y no aporta valor inmediato al lore base.

---

## ✅ Qué implica “implementado” para cada mejora (Definition of Done)
- [x] **Schema**: campos añadidos como opcionales donde aplique (sin romper contenido existente).
- [x] **Lore-linter**: validación de formato y refs rotas para los nuevos campos.
- [x] **UI**: mostrar el campo en detail (y enlaces cuando sean refs).
- [ ] **CLI `wiki new`**: actualizar plantillas para incluir placeholders (vacíos/omitidos) cuando tenga sentido.
- [x] **Ejemplos en content**: al menos 1 doc actualizado por tipo afectado para validar end-to-end.

---

## 📌 Detalle de campos propuestos (para implementación inmediata)

### Character — nuevos campos (frontmatter)
- [x] `related_characters`: lista de relaciones etiquetadas (modelo definido)
  - formato:
    - lista de objetos
    - cada objeto: `type` (string) + `character` (ref a `character:*`)
  - reglas:
    - `type` es libre, con **lista sugerida** (si no coincide → warning)
    - **no** se permite repetir el mismo `character:*` más de una vez (aunque cambie `type`)
    - no hay reciprocidad automática
  - nota: se valida que `character` sea `character:*` y no haya duplicados; no se exige reciprocidad.
  - ejemplo:
    ```yaml
    related_characters:
      - type: friend
        character: character:kade-vox
      - type: enemy
        character: character:nyx-ashen
    ```
- [x] `affinity`: referencia a `element:*`
- nota: se valida como ref tipada (`element:*`), y refs inexistentes son reportadas como rotas.
- [x] `born`: fecha (formato consistente con el proyecto)
- [x] `died`: fecha (formato consistente con el proyecto)
- nota: formato validado `YYYY-MM-DD`; si ambos existen, `died >= born`.
- [x] `image`: string (opcional, no vacío; ruta o identificador)

### Element — nuevos campos
- [ ] `origin`: referencia a `place:*`
- [ ] `image`: string (opcional, no vacío)

### Event / Place / Planet — nuevos campos
- [ ] `image`: string (opcional, no vacío)

---

## 🔁 Orden recomendado de implementación
- [x] 1) Añadir `image` (opcional) a todos los tipos definidos (simple, desbloquea UI)
- [x] 2) Character: `born`/`died` (formato + UI)
- [x] 3) Character: `affinity` → Element (refs + UI)
- [ ] 4) Element: `origin` → Place (refs + UI)
- [x] 5) Character: `related_characters` etiquetado (schema + linter + UI reusable)
