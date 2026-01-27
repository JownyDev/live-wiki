# Referencia del Schema de Lore y UI

> **Fuente de verdad:** La validación ocurre en `packages/lore-linter`.
> Este documento conecta los **Datos (Frontmatter)** con su **Validación** y su **Visualización (UI)**.

---

## 👤 Character (`type: character`)

### Campos Obligatorios
| Campo | UI Component / Visualización | Notas |
|-------|------------------------------|-------|
| `id` | URL slug `/characters/:id` | Debe ser kebab-case. |
| `name` | **Header** (Título principal) | Nombre visible del personaje. |

### Campos Opcionales
| Campo | UI Component / Visualización | Notas |
|-------|------------------------------|-------|
| `image` | **CharacterHero** | Imagen principal a la izquierda/fondo. |
| `born` | **InlineMetaList** (Metadatos) | Se muestra como "Nacimiento: YYYY-MM-DD". |
| `died` | **InlineMetaList** (Metadatos) | Se muestra como "Muerte: YYYY-MM-DD" + icono calavera. |
| `affinity` | **InlineMetaList** + Icono | Muestra el elemento afín con su icono y link. |
| `related_characters` | **RelationList** | Lista agrupada por etiquetas (ej. "Amigos", "Enemigos"). Links interactivos. |
| `persona` | **PersonaCard** | Tarjeta con arquetipo, rasgos (tags), valores y voz. |
| `goals` | **GoalList** | Lista visual de objetivos a largo y corto plazo. |
| `knowledge` | **KnowledgeSummary** | Bloque de texto con lo que sabe/ignora el personaje. |
| `capabilities` | **CapabilityCard** | Lista de acciones disponibles para el sistema de juego/diálogo. |

---

## 🗓️ Event (`type: event`)

### Campos Obligatorios
| Campo | UI Component / Visualización | Notas |
|-------|------------------------------|-------|
| `id` | URL slug `/events/:id` | |
| `title` | **Header** (Título) | |
| `date` | **EventSummaryCard** (Header) | Define el orden cronológico en listas. |
| `who` | **RelationList** ("Participantes") | Lista de personajes involucrados. |

### Campos Opcionales
| Campo | UI Component / Visualización | Notas |
|-------|------------------------------|-------|
| `image` | **EventSummaryCard** (Thumbnail) | Imagen visual del evento. |
| `locations` | **RelationList** ("Lugares") | Links a places/planets donde ocurrió. |

---

## 🗺️ Place (`type: place`) / 🪐 Planet (`type: planet`)

### Campos Obligatorios
| Campo | UI Component / Visualización | Notas |
|-------|------------------------------|-------|
| `id` | URL slug | |
| `name` | **Header** | |

### Campos Opcionales
| Campo | UI Component / Visualización | Notas |
|-------|------------------------------|-------|
| `planetId` | **Section** ("Planeta") | Link al planeta padre (ej. `planet:id`). Solo para `type: place`. |
| `locationType` | **Section** ("Planeta") | Texto fallback si no hay planeta (`space` | `planet` | `unknown`). |

---

## 🧩 Element (`type: element`)

### Campos Obligatorios
| Campo | UI Component / Visualización | Notas |
|-------|------------------------------|-------|
| `id` | URL slug | |
| `name` | **Header** + Icono (si hay imagen) | |

### Campos Opcionales
| Campo | UI Component / Visualización | Notas |
|-------|------------------------------|-------|
| `image` | Icono pequeño en referencias | Usado en badges de afinidad y cartas. |
| `origin` | **EntityLink** (Metadatos) | Link al lugar de origen del elemento. |

---

## ⚙️ Mechanic (`type: mechanic`)

### Campos Obligatorios
| Campo | UI Component / Visualización | Notas |
|-------|------------------------------|-------|
| `id` | URL slug | |
| `name` | **Header** | |

---

## 🃏 Card (`type: card`)

### Campos Obligatorios
| Campo | UI Component / Visualización | Notas |
|-------|------------------------------|-------|
| `id` | URL slug | |
| `name` | **Header** (Título de carta) | |
| `elements` | **Badge** (Esquina superior) | Muestra los 2 iconos de elementos que componen la carta. |

### Campos Opcionales
| Campo | UI Component / Visualización | Notas |
|-------|------------------------------|-------|
| `represents` | **EntityLink** ("Invocación") | Link a la entidad (personaje/evento) que la carta invoca. |