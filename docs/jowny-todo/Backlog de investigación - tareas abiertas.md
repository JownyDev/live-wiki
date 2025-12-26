# Backlog de investigación / tareas abiertas (por especificar)

> Objetivo: capturar temas importantes sin bloquear el avance.
Estado: NO implementar hasta definir criterios claros.
> 

## 📊 Cobertura (testing/metrics) — investigación

- [ ]  Definir qué métricas de cobertura interesan en este repo (por paquete/capa):
    - statements / branches / functions / lines
    - umbrales mínimos (global vs por carpeta)
    - qué medir: lore-linter, parser, search, CLI, UI (si aplica)
- [ ]  Explorar reporting con Vitest coverage y su impacto (tiempo CI, configuración, exclusiones)
- [ ]  Decidir estrategia: “gate duro” vs “reporting informativo” al principio
- [ ]  Documentar la decisión en un ADR (o doc equivalente)

## ♿ Accesibilidad (a11y) — investigación

- [ ]  Definir checklist mínima a11y para la wiki:
    - headings semánticos, landmarks (header/nav/main/footer)
    - contraste y foco visible
    - navegación por teclado
    - labels en inputs (search)
    - texto alternativo en imágenes (cuando existan)
- [ ]  Decidir si se integra tooling (linters/audits) o solo guidelines manuales
- [ ]  Añadir sección de estándares a [AGENTS.md](http://agents.md/) / doc de frontend

## ✨ UX/UI mejoras — por concretar

- [ ]  Definir objetivos de “UI compacta” medibles:
    - densidad de información (qué se ve above-the-fold)
    - estilos de listas de relaciones (chips vs lista)
    - jerarquía tipográfica y spacing
- [ ]  Diseñar “patrones” para:
    - estados vacíos (no image / no relations)
    - refs rotas (cómo se ve y cómo se detecta)
    - navegación (breadcrumbs, sidebar, quick links)
- [ ]  Decidir si la búsqueda será 0-JS (query param) o island live-search (y por qué)

## 🧠 Sistema de acciones de personaje — diseño futuro

- [ ]  Definir qué es una “acción” (taxonomía):
    - social (hablar, intimidar, negociar)
    - combate (atacar, defender, huir)
    - exploración (investigar, rastrear, viajar)
    - economía (comprar, robar, intercambiar)
- [ ]  Decidir si las acciones son:
    - solo lore (documentación narrativa)
    - o base para un motor/simulación (implica reglas y validación)
- [ ]  Definir formato de datos (frontmatter vs tipo nuevo `action`)
- [ ]  Definir cómo se conectan con Mechanics (si aplica)
- [ ]  Decidir requisitos de UI (filtros, tags, vistas por personaje)

## 🃏 Cards (gran expansión) — pospuesto

- [ ]  Definir subtipos de card y atributos (sin tocar aún):
    - estructura de tipos
    - validaciones
    - rendering UI
    - relación con Mechanics/Elements/Characters
- [ ]  Definir estrategia incremental para no romper el repo (migraciones y compatibilidad)