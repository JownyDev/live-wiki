# Reporte de Cobertura Estratégica (100/80/0)

**Fecha:** 2026-01-26
**Proyecto:** live-wiki
**Arquitecto:** Agente Gemini

## Metodología
Este informe aplica la metodología de **Cobertura Estratégica 100/80/0**. Los objetivos de cobertura se establecen en función del riesgo de negocio, no de métricas genéricas.

* **CORE (100%)**: "Crítico para el Negocio". Lógica que maneja la integridad de datos, parseo, validación de esquemas o indexación de búsqueda. Un fallo aquí rompe la build o sirve contenido corrupto.
* **IMPORTANTE (80%)**: "Experiencia de Usuario". Componentes de UI, interacciones del lado del cliente y renderizado de páginas. Un fallo aquí frustra al usuario (errores visuales, interacciones rotas) pero los datos permanecen intactos.
* **INFRAESTRUCTURA (0%)**: "Plantilla/Configuración". Archivos de configuración, definiciones de tipos y wrappers de librería estándar validados por el compilador (TypeScript).

---

## 1. NIVEL CORE (Objetivo: 100%)
**Definición:** Lógica crítica donde los bugs causan fallos en todo el sistema, roturas de build o corrupción de datos.

### `packages/lore-linter/`
El "cerebro" de la validación de datos. Si esto falla, contenido inválido entra en la wiki, rompiendo referencias y la coherencia.
* **Módulos:** `src/index.ts`, `src/rules/*`, `src/schema.ts`
* **Análisis:**
    * **Maneja datos críticos:** SÍ (Valida la integridad de todo el contenido Markdown).
    * **Bug causa pérdida:** SÍ (Permite contenido roto que crashea el sitio en producción).
    * **Crítico para negocio:** SÍ (Es el mecanismo de garantía de calidad del contenido).
* **Justificación:** Requiere 100% de cobertura para asegurar que no haya falsos negativos (contenido malo pasando) o falsos positivos (bloqueando contenido válido).

### `src/lib/content/`
La capa "ETL" (Extract, Transform, Load). Analiza (parsea) Markdown/Frontmatter en objetos estructurados TypeSafe.
* **Módulos:** `characters.ts`, `places.ts`, `events.ts`, `planets.ts`, `mechanics.ts`, `elements.ts`, `cards.ts`.
* **Análisis:**
    * **Maneja datos críticos:** SÍ (Transforma texto crudo en objetos de dominio).
    * **Bug causa pérdida:** SÍ (Si el parser falla, la página devuelve error 500 o datos vacíos).
    * **Crítico para negocio:** SÍ (Sin esto, no hay wiki visualizable).
* **Justificación:** La lógica de parseo contiene muchos casos límite (campos faltantes, valores opcionales). El 100% de cobertura es obligatorio para prevenir caídas en tiempo de ejecución.

### `src/lib/content/search.ts` & `src/pages/search.json.ts`
Lógica de generación del índice de búsqueda.
* **Análisis:**
    * **Maneja datos críticos:** SÍ (Genera el índice de búsqueda).
    * **Crítico para negocio:** SÍ (La navegabilidad depende de esto).
* **Justificación:** Si la generación del índice tiene un bug, los usuarios no pueden encontrar contenido.

---

## 2. NIVEL IMPORTANTE (Objetivo: 80%)
**Definición:** Capas de presentación e interacción de usuario de alto valor. Los bugs aquí son visibles y molestos, pero usualmente no bloquean todo el backend/build.

### `src/components/`
Componentes de UI usados para renderizar datos.
* **Módulos:** `CharacterHero.astro`, `DataPanel.astro`, `RelationList.astro`, `Persona*.astro`.
* **Análisis:**
    * **Usuario interactúa:** SÍ (Es lo que el usuario ve).
    * **Bug causa pérdida:** NO (Causa "glitches" visuales o mala información puntual).
* **Justificación:** Necesitamos verificar que los componentes rendericen correctamente dados unos props válidos. Pruebas de Snapshot o pruebas básicas de renderizado son suficientes (80%). No necesitamos probar cada clase CSS.

### `src/scripts/`
JavaScript del lado del cliente (Islands).
* **Módulos:** `search-island.ts`.
* **Análisis:**
    * **Usuario interactúa:** SÍ (Búsqueda en vivo, filtrado).
    * **Bug causa pérdida:** SÍ (Pérdida de funcionalidad, usuario frustrado).
* **Justificación:** Crítico para la UX. Necesita tests E2E (Playwright) para verificar la interacción en el navegador. El objetivo es 80% de cobertura vía unit+E2E para asegurar que los "Happy Paths" y los estados de error principales funcionen.

### `packages/wiki-cli/`
Herramientas de desarrollador (andamiaje/scaffolding).
* **Módulos:** `src/commands/*`.
* **Análisis:**
    * **Usuario interactúa:** SÍ (Developers creando contenido).
    * **Bug causa pérdida:** NO (Molestia para el developer, pero no afecta al usuario final del sitio).
* **Justificación:** Debería funcionar de manera fiable, pero si un comando de scaffolding falla, no rompe la producción.

---

## 3. NIVEL INFRAESTRUCTURA (Objetivo: 0% / Validado por Compilador)
**Definición:** Configuración, definiciones de tipos y código repetitivo (boilerplate) protegido por el compilador de TypeScript.

* **Configuración:** `astro.config.ts`, `playwright.config.ts`, `vitest.config.ts`, `eslint.config.js`.
    * **Justificación:** Configuración del framework. Si está mal, la aplicación usualmente no iniciará (fallo rápido / fail fast). No se necesitan tests unitarios.
* **Definiciones de Tipos:** `src/env.d.ts`, `**/*.d.ts`.
    * **Justificación:** Validado por `tsc`.
* **Layouts (Wrappers Puros):** `src/layouts/BaseLayout.astro`.
    * **Justificación:** Principalmente etiquetas HTML/Head estructurales. Baja densidad lógica.

---

## Resumen de Acciones
1.  **Mantener 100%** en `src/lib/content/*` y `packages/lore-linter`. (Actualmente forzado por Vitest).
2.  **Monitorear** `src/components` vía Snapshots/Tests de Integración (apuntar al 80%).
3.  **Ignorar** métricas de cobertura para archivos de configuración.