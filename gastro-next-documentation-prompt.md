# Documentación Completa del Proyecto: GastroCocha (gastro-next)

A continuación, se detalla toda la información técnica, funcional y de arquitectura del proyecto **GastroCocha** (directorio `gastro-next`). Este documento está diseñado para que actúes como un Arquitecto de Software y Technical Writer experto, y generes la documentación oficial, manuales de usuario, y guías de desarrollo del sistema.

---

## 1. Visión General del Proyecto
**Nombre:** GastroCocha - Guía Gastronómica de Cochabamba
**Propósito:** Es una plataforma web moderna e interactiva diseñada para descubrir, explorar y calificar la gastronomía de las 16 provincias del departamento de Cochabamba, Bolivia. Permite a los usuarios encontrar platos típicos y restaurantes (lugares) según su ubicación y presupuesto, e integra un asistente virtual de Inteligencia Artificial (Chatbot) altamente interactivo.

## 2. Tecnologías Principales (Tech Stack)
El proyecto está construido con un stack moderno enfocado en rendimiento, SEO y experiencia de usuario (UX/UI).
- **Framework Core:** Next.js 16.2.6 (App Router)
- **UI Library:** React 19.2.4
- **Estilos:** TailwindCSS v4 (@tailwindcss/postcss) e íconos de `lucide-react`.
- **Base de Datos & Backend as a Service:** Supabase (PostgreSQL).
- **Autenticación:** NextAuth v5 (beta) para el manejo de sesiones (Admin/User).
- **Mapas:** Leaflet (react-leaflet) para mapas interactivos.
- **Inteligencia Artificial:**
  - Gemini 2.5 Flash / Flash Lite (Vía Google Generative AI) como motor principal.
  - DeepSeek API como fallback secundario.
  - Sistema de fallback local basado en expresiones regulares si no hay APIs disponibles.
- **Utilidades:** `date-fns` para fechas, `slugify` para URLs amigables, cálculo de distancias por fórmula Haversine.

## 3. Arquitectura de Base de Datos (Supabase / PostgreSQL)
El sistema utiliza un esquema relacional completo. Cuenta con una capa de datos "Mock" (`lib/data.ts`) para desarrollo local sin conexión, la cual replica esta misma estructura:
1. **provincias:** Las 16 provincias de Cochabamba (nombre, slug, centro_lat, centro_lng, zoom_mapa).
2. **users:** Usuarios del sistema con roles (`user`, `admin`).
3. **platos:** Platos típicos (silpancho, pique macho, etc.) con historia, ingredientes, precio referencial, promedio de rating. Relacionado con una provincia.
4. **lugares:** Restaurantes físicos o pensiones con coordenadas (lat, lng), estado de aprobación (para moderación) y datos de contacto.
5. **plato_lugar (Tabla Pivote):** Relación N:M entre platos y lugares. Permite definir el precio específico de un plato en un lugar y si es "especialidad" de la casa.
6. **resenas:** Calificaciones (1-5) y comentarios de usuarios sobre platos o lugares. Incluye un flag `is_approved` para moderación por parte del administrador.
7. **favoritos:** Platos guardados por los usuarios.
8. **fotos:** Galería de imágenes para lugares y platos.
9. **app_settings:** Configuraciones dinámicas del sistema (ej. `registro_publico_habilitado`, `chatbot_habilitado`).

## 4. Funcionalidades Core (Lo que hace)

### A. Exploración Gastronómica
- **Catálogo de Provincias:** Los usuarios pueden navegar por las 16 provincias y ver la historia y los platos nativos de cada una.
- **Vistas de Detalle:** Páginas específicas para Platos (con su historia e ingredientes) y Lugares (con mapa, contacto y menú).
- **Ranking Global:** Los platos y lugares se ordenan dinámicamente según el promedio de las reseñas (`promedio_rating`).

### B. Mapa Interactivo (Leaflet)
- Muestra pines con los lugares gastronómicos.
- Integrado con la ubicación del usuario (Geolocalización) para medir distancias.

### C. Chatbot Inteligente y Contextual (El Asistente)
Es una de las características más avanzadas. Funciona como un asistente conversacional que:
- Conoce el presupuesto del usuario y su ubicación GPS.
- Responde estrictamente basado en la base de datos de Cochabamba (Evita alucinaciones con Temperature 0.0).
- **Eventos Interactivos UI (Actions):** El LLM puede inyectar comandos JSON en sus respuestas (ej. `[[ACTION: {"action": "focus_map", ...}]]`) que el frontend intercepta para:
  - Centrar el mapa en un restaurante (`focus_map`).
  - Navegar a otras páginas (`navigate`).
  - Pre-rellenar formularios de registro de negocios (`fill_form`).
  - Filtrar listas por precio (`filter_list`).
  - Abrir el modal de reseñas (`add_review`).
- Tiene un limitador de uso (Rate Limiting) basado en cookies para usuarios no registrados (10 consultas diarias).

### D. Panel de Administración y Moderación
- Rutas protegidas (`/admin/*`) donde el rol `admin` puede:
  - Aprobar o rechazar nuevos "Lugares" sugeridos por el público.
  - Aprobar o moderar reseñas antes de que se vuelvan públicas (control de calidad).
  - Activar o desactivar configuraciones globales de la app.

### E. Registro de Negocios
- Formulario público para que dueños de restaurantes o comensales sugieran nuevos lugares. Los envíos entran en estado `aprobado: false` hasta que un administrador los revise.

## 5. Estructura del Código (App Router Next.js)
- `app/`: Contiene las páginas (rutas). Destacan `/admin`, `/login`, `/plato/[slug]`, `/provincia/[slug]`, `/ranking`, `/registrar-negocio`.
- `app/api/chatbot/route.ts`: Endpoint de la IA con lógica de proveedores, inyección de contexto y fallbacks.
- `components/`: Componentes reutilizables. Destacan `Chatbot.tsx` (manejo de la interfaz y las *Actions* del LLM), `InteractiveMap.tsx` (Leaflet), `NegocioDetailView.tsx`, `PlatoDetailView.tsx`.
- `lib/`: Lógica de negocio. `data.ts` (capa de abstracción de DB), `auth.ts` (NextAuth), `seed-data.ts` (datos iniciales).
- `supabase-setup.sql`: Script SQL completo para levantar la base de datos de producción desde cero en Supabase.

## 6. Futuro del Sistema (Lo que hará / Escalabilidad)
- **Migración Completa a Supabase:** Reemplazar las llamadas mock de `lib/data.ts` con `@supabase/supabase-js` para entorno de producción.
- **Autenticación Social:** Integrar Google/Facebook con NextAuth.
- **Rutas de Envío (Delivery):** Integración con APIs de mapas para trazar la ruta desde el usuario hasta el restaurante.
- **Soporte Multilingüe (i18n):** Traducir el contenido para turistas extranjeros (Quechua e Inglés).
- **Gamificación:** Otorgar medallas a los usuarios que más reseñas aprobadas aporten a la comunidad.

---
**Instrucción para Claude:**
Basado en esta información de reingeniería, por favor genera la documentación técnica completa del proyecto. Incluye un README extenso, guía de arquitectura, y explicación del flujo del Chatbot con eventos interactivos. Usa formato Markdown limpio y profesional.
