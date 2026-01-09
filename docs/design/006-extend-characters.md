# 📄 Propuesta de actualización — `type: character` (Documento de diseño)

## 🎯 Objetivo
Ampliar el frontmatter de `type: character` para soportar el **sistema contextual de NPCs** en un juego conversacional con IA, manteniendo:
- **Claridad** (secciones fáciles de entender)
- **Bajo ruido** (sin “paja”)
- **Separación fuerte** entre:
  - datos **estables** (live-wiki)
  - datos **dinámicos** (runtime: situación, historial, estado actual)

> Nota: La **memoria dinámica** (eventos/historial) NO se guarda dentro del personaje. El personaje solo guarda un **perfil de consulta** por tags.

---

## 🧱 Secciones de contexto del NPC (modelo final)

1) **Lo que eres** → Identidad / personalidad / voz  
2) **Lo que sabes** → Conocimiento estable (en texto plano, sin refs por ahora)  
3) **Situación actual** → Runtime (NO se guarda aquí) + posible mejora con presets por zona  
4) **Lo que recuerdas ahora** → Perfil de consulta (tags) + reglas de procedencia  
5) **Lo que sientes** → Disposición base + manipulabilidad (estado actual es runtime)  
6) **Lo que quieres** → Objetivos permanentes + prioridades típicas  
7) **Acciones / Capacidades** → Catálogo de acciones + triggers (para todas) + filtros opcionales

---

## ✅ Propuesta de frontmatter (nuevo contrato de datos)

### Ejemplo completo (plantilla)
```yaml
---
type: character
id: character:character-name
name: Character Name

# --- Meta / UI ---
status: draft # draft | canon
origin: unknown
image: /img/character.webp
tags:
  - npc
  - faction:unknown
  - zone:unknown

# --- Línea temporal (opcional) ---
born: 2999-01-01
died: 3005-01-01

# --- Afinidades / mecánicas (opcional, si aplica) ---
affinity:
  - element:tide-mist

# --- Relaciones (conocimiento estable) ---
related_characters:
  - type: ally # ally | enemy | family | mentor | rival | neutral | unknown
    character: character:arina-mora
    note: "Se conocen de la infancia."

# ======================================================
# 🧠 CONTEXTO NPC (ESTABLE) — lo que exporta al prompt
# ======================================================

# 1) LO QUE ERES (Identidad / personalidad / voz)
persona:
  archetype: "La protectora sarcástica"
  traits:
    - "reactiva"
    - "leal"
    - "desconfiada al inicio"
  voice:
    tone: "directo, irónico"
    style_notes:
      - "frases cortas"
      - "usa apodos si confía"
  values:
    - "proteger a los débiles"
    - "odio a los abusones"
  taboos:
    - "no tolera amenazas a niños"
  biography_bullets:
    - "Creció en la zona del puerto."
    - "Perdió a su hermana por culpa de una banda local."
    - "Ahora vigila el barrio y castiga a matones."

# 2) LO QUE SABES (Conocimiento estable — texto plano por ahora)
# ✅ Importante: aquí NO usamos refs tipo lore:* (eso queda para una futura iteración).
knowledge:
  summary: >
    Vive en el puerto y conoce bien a la gente del barrio.
    Sabe que hay una banda local moviéndose de noche.
    Desconfía de los forasteros hasta que demuestren buenas intenciones.
  knows_about:
    - "Rutas seguras por el puerto"
    - "Rumores del mercado"
    - "Quién suele meterse en problemas"
  blindspots:
    - "Política global y reinos lejanos"
    - "Tecnología/artefactos antiguos"
  can_reveal:
    - "Rumores del barrio"
    - "Pistas sobre la banda (si confía)"

# 3) SITUACIÓN ACTUAL → runtime (NO se guarda aquí)
# ✅ En runtime tu sistema construye:
#   - lugar actual, quién está presente, qué acaba de ocurrir, restricciones obvias, etc.
# 🔮 Mejora futura (preset por escena/zona):
#   - El mismo NPC puede aparecer en distintos sitios con distintos “presets”.
#   - Ej: 1ª vez en casa (normal), 2ª vez en cueva (cansado tras luchar).
#   - Estos presets se podrían definir aparte y el runtime selecciona uno.
# (No definimos aún el sistema, solo dejamos constancia.)

# 4) LO QUE RECUERDAS AHORA (perfil de consulta por tags)
memory_profile:
  # Tags de interés para consultar historial dinámico
  interest_tags:
    - "zone:old-docks.*"
    - "faction:unknown.*"
    - "rumor.*"
  # Tags de relaciones (amigos, enemigos, jugador, etc.)
  relationship_tags:
    - "character:arina-mora.*"
    - "player.*"
  # Restricciones de acceso al historial
  allowed_tags:
    - "violence.*"
    - "theft.*"
    - "help.*"
    - "insult.*"
    - "gift.*"
    - "quest.*"
  blocked_tags:
    - "divine.*"
    - "omniscient.*"

  # Procedencia preferida al presentar recuerdos al LLM
  provenance_policy:
    allowed:
      - seen      # lo presenció
      - heard     # se lo contaron
      - rumor     # rumor sin confirmar
      - inferred  # deducido por pistas
    default: heard

  # Límite recomendado de contexto recuperado (para no saturar al LLM)
  retrieval_limits:
    max_items: 8
    max_tokens_summary: 180

# 5) LO QUE SIENTES (base) + manipulabilidad
emotions_profile:
  baseline_mood:
    calm: 60
    trust: 40
    irritation: 20
  toward_player_default:
    stance: neutral # friendly | neutral | wary | hostile
    note: "No confía hasta ver acciones."
  sensitivities:
    angers_if:
      - "amenazan a alguien débil"
      - "se burlan del barrio"
    calms_if:
      - "muestran empatía"
      - "ayudan sin pedir recompensa"
  manipulability:
    # vías por las que el jugador puede influir
    by_empathy: high
    by_bribe: medium
    by_intimidation: low
    by_authority: medium
    notes:
      - "El soborno funciona solo si no pone en riesgo a inocentes."

# 6) LO QUE QUIERES (objetivos)
goals:
  long_term:
    - "mantener el barrio a salvo"
    - "desmantelar la banda local"
  typical_priorities:
    - "seguridad del barrio"
    - "lealtad a aliados"
    - "orgullo personal"

# 7) ACCIONES / CAPACIDADES (NO opcional)
# ✅ Todas las acciones deben tener triggers asociados.
# ✅ Algunas (opcionalmente) añaden filtros/condiciones extra (“doble filtro”).
capabilities:
  actions:
    - action:insult
      triggers:
        - "player.insult"
        - "player.mock"
      notes:
        - "Respuesta verbal agresiva; sube tensión."
    - action:give_hint
      triggers:
        - "player.ask_help"
        - "player.polite"
      notes:
        - "Da una pista pequeña; si confía, da una pista mayor."
    - action:attack_player
      triggers:
        - "player.threat"
        - "player.physical_aggression"
      notes:
        - "Escala a violencia. Deja rastro fuerte en historial."
      filters:
        - "Evita violencia si hay testigos inocentes."
        - "Más probable si está agotada o herida."
        - "Menos probable si el objetivo actual es mantener perfil bajo."

---

Describe the character here.

```

---

## 🧠 Contenido markdown del personaje (cuerpo del archivo)

El body sigue siendo la descripción “humana” para lectura en wiki. Recomendación:

- 1 párrafo corto de introducción

- 3–6 bullets de identidad/relación/curiosidades

- nada de lore redundante que ya esté en frontmatter

---

## 📌 Reglas de diseño (para no sobreingenierizar)

- Frontmatter = datos exportables (prompt + UI)

- Body = narrativa (lectura humana)

- Nada de eventos en el personaje: solo memory_profile para consultar el historial

- Runtime construye:

    - situación actual

    - recuerdos recuperados (+ procedencia)

    - estado emocional actual

    - objetivo actual

---

## ✅ Checklist de implementación (progreso)

> Todos los bloques/campos de esta propuesta son **opcionales**.
> Se permiten perfiles incompletos porque habrá personajes de distintos videojuegos
> con información variable, aunque compartan el mismo universo.

### Contrato de datos (frontmatter)
- [x] Definir schema y validaciones para `persona` (archetype, traits, voice, values, taboos, biography_bullets).
- [x] Definir schema y validaciones para `knowledge` (summary + listas).
- [x] Definir schema y validaciones para `memory_profile` (tags, provenance_policy, retrieval_limits).
- [x] Definir schema y validaciones para `emotions_profile` (baseline_mood, stance, sensitivities, manipulability).
- [x] Definir schema y validaciones para `goals` (long_term, typical_priorities).
- [x] Definir schema y validaciones para `capabilities` (actions, triggers, filters, notes).

### Linter y tests
- [x] Añadir validaciones en `lore-linter` para los nuevos bloques (tipos; rangos/enums pendientes).
- [x] Crear fixtures de tests válidos/ inválidos por bloque para cubrir edge cases.

### Tooling y contenido
- [x] Actualizar `templates/character.md` y la plantilla de CLI con placeholders del bloque NPC.
- [ ] Crear 1+ personajes de ejemplo con el bloque completo para validación end-to-end.

### UI + export a prompt
- [ ] Decidir qué secciones se muestran en la UI y con qué layout/components.
- [ ] Implementar helpers de export para el bloque estable del prompt.
- [ ] Documentar el runtime (situación actual y presets por zona) en un doc aparte.

---

## ✅ Beneficios esperados

- Contexto consistente para el LLM sin meter “ruido”

- Fácil de editar en live-wiki

- Exportable a prompt (stable blocks)

- Escalable: puedes añadir mecánicas sin romper la base
