# Project Documentation
> Generated: 2026-11-18 | Mode: FULL

## Tech Stack
- Runtime: Node.js 24.22.3 (local) · Next.js 16.2.6 (App Router, Turbopack)
- Language: TypeScript 5 (strict)
- Framework: Next.js App Router with Server Components + Client Components
- Database: Supabase PostgreSQL (`@supabase/supabase-js` 2.106.1), acceso server-side con Service Role
- Storage: Supabase Storage (bucket público `gastro-images`)
- Styling: CSS variables globales + estilos inline (`React.CSSProperties`) + Tailwind CSS 4 vía PostCSS
- State Management: hooks locales de React (sin store global); sesión por cookie `gastro_session`
- Mapas: Leaflet 1.9.4 (imperativo, sin react-leaflet)
- IA: Gemini (`GEMINI_API_KEY`) como primario, DeepSeek opcional, fallback mock determinista

## Dependencies
**Core**
- next 16.2.6 · react 19.2.4 · react-dom 19.2.4
- @supabase/supabase-js ^2.106.1
- leaflet ^1.9.4 · lucide-react ^1.16.0
- date-fns ^4.2.1 · slugify ^1.6.9
- next-auth ^5.0.0-beta.31 (instalado; el flujo activo usa JWT/HMAC propio, no NextAuth)
- openai ^6.39.0 (cliente compatible para endpoints alternativos)

**Dev**
- typescript ^5 · eslint ^9 · eslint-config-next 16.2.6
- tailwindcss ^4 · @tailwindcss/postcss ^4
- @types/leaflet · @types/node ^20 · @types/react ^19 · @types/react-dom ^19

**Testing**: sin framework instalado (no hay script `test`).

## Architecture Pattern
Arquitectura en capas sobre Next.js App Router:

1. **Presentación** — `app/**/page.tsx` (Server Components que consultan datos) y `components/*` (Client Components interactivos).
2. **API / Borde** — `app/api/**/route.ts` como handlers REST; aquí viven autenticación, autorización por rol, rate limiting y validación de entrada.
3. **Dominio / Acceso a datos** — `lib/data.ts` centraliza todas las consultas a Supabase; `lib/auth.ts` la sesión y contraseñas; `lib/validation.ts` la sanitización.
4. **Infraestructura** — `lib/supabase.ts` expone cliente anon (público) y `getServiceSupabase()` (Service Role, solo servidor).

Motivo: separar reglas y acceso a datos del render, permitir validación server-side obligatoria y evitar filtrar la Service Role al cliente.

## Folder Structure
```
gastro-next/
├── app/
│   ├── layout.tsx              # Layout raíz (Navbar, Footer, Chatbot)
│   ├── page.tsx                # Home con mapa y secciones
│   ├── login/                  # Login + registro
│   ├── provincias/             # Grilla de 16 provincias
│   ├── provincia/[slug]/       # Detalle de provincia + platos
│   ├── plato/[slug]/           # Ficha de plato + reseñas
│   ├── negocios/               # Listado/búsqueda de locales
│   ├── negocio/[slug]/         # Ficha de local
│   ├── ranking/                # Ranking global (hot score)
│   ├── registrar-negocio/      # Solicitud pública de registro
│   ├── owner/                  # Panel del propietario (rol owner)
│   ├── admin/                  # Panel admin + layout protegido
│   │   ├── platos/ · lugares/ · solicitudes/ · resenas/ · propietarios/
│   └── api/                    # auth, chatbot, owner, admin, map, solicitudes, upload
├── components/                 # Navbar, Chatbot, InteractiveMap, vistas, ImageUpload
├── lib/                        # auth, data, supabase, types, utils, validation, seed-data, schema
├── public/images/              # 16 PNG de platos
├── supabase-setup.sql          # Esquema + seed completo idempotente
└── gastro_cocha_technical_documentation.md  # Documentación técnica extensa previa
```

## Code Style Conventions
- Componentes y tipos en `PascalCase`; funciones/variables en `camelCase`; archivos de componentes en `PascalCase.tsx`.
- Nombres de dominio en español (`lugares`, `platos`, `resenas`, `solicitudes`, `provincias`) alineados con el esquema SQL.
- Componentes interactivos marcan `"use client"` en la primera línea; el resto son Server Components por defecto.
- Estilos: objetos `React.CSSProperties` inline con variables CSS (`var(--color-primary)`, `var(--radius)`, etc.); sin CSS modules.
- API routes: `try/catch` con `NextResponse.json({ error })` y códigos 400/401/403/404/409/429/500.
- Validación: toda entrada externa pasa por `lib/validation.ts` antes de tocar la base.

## Modularity Practices
- Un único punto de acceso a datos (`lib/data.ts`) evita queries dispersas.
- La sesión se resuelve solo en `lib/auth.ts` (`getSession`, `isAdmin`).
- Reglas de sanitización reutilizables en `lib/validation.ts` (texto, email, teléfono, nombre, URL, número).
- Componentes de presentación reciben props y no consultan Supabase directamente (excepto `InteractiveMap`, que consume `/api/map/*`).

## Data Architecture
Tablas (ver `supabase-setup.sql`):
- `provincias` 1—N `platos`, 1—N `lugares`
- `platos` N—M `lugares` mediante `plato_lugar` (precio aproximado, especialidad, imagen)
- `lugares` referencia al dueño por `email_propietario` (no FK; enlace lógico con `users.email`)
- `resenas` (usuario + plato/lugar, moderación con `is_approved`/`reviewed`)
- `solicitudes` (registro público de negocios; al aprobar se crea un `lugar`)
- `users` (roles `user` | `owner` | `admin`; hash SHA-256 + salt fija)
- `favoritos`, `fotos`, `app_settings`
- `lugares.especialidades` es JSONB con platos propios del local (id sintético, nombre, precio, imagen).

Patrón de acceso: Service Role client en servidor, mapeo estricto de filas a interfaces TS (`mapLugar`, `mapPlato`, etc.), sin ORM.

## Cross-Cutting Concerns
- **Autenticación**: cookie httpOnly `gastro_session` con payload Base64 + firma HMAC-SHA256 (`JWT_SECRET` fijo). Expiración 7 días. No se usa NextAuth en el flujo activo.
- **Autorización**: `app/admin/layout.tsx` redirige si el rol no es `admin`; `/api/owner` exige `role === "owner"` y resuelve el lugar por email; `/api/admin/*` usa `isAdmin()`.
- **Rate limiting**: login por IP (5 fallos → bloqueo 15 min); chatbot por IP (30/h), invitado por cookie (10/día), usuario (50/día).
- **Validación/sanitización**: `lib/validation.ts` (ASCII estricto en emails, rechazo de `ñ`/tildes/emoji, límites de longitud, normalización de teléfono y números).
- **Errores**: respuestas JSON con mensaje; validación server-side siempre repetida aunque exista validación cliente.
- **Logging**: `console.error` en handlers de error.

## Service Communication
- REST mediante Route Handlers de Next.js (`app/api/**`).
- Cliente → API con `fetch` + JSON; subida de imágenes con `FormData` a `/api/upload`.
- API → Supabase vía `@supabase/supabase-js` (PostgREST y Storage).
- Chatbot: API server-side que arma contexto desde Supabase y llama a Gemini/DeepSeek; devuelve texto + tokens `[[ACTION: {...}]]` que el cliente interpreta (mapa, navegación, autocompletar formulario, filtros).

## Test Coverage
- Overall coverage: 0% (sin framework ni suite configurada)
- Testing framework: ninguno
- Key untested areas: autenticación/roles, aprobación de solicitudes y creación de `lugares`, enlace `email_propietario` ↔ `owner`, validación de entradas, chatbot y sus fallbacks, subida de imágenes.
- Test patterns used: ninguno (verificación manual + `npm run build`).

## Entry Points
- `app/layout.tsx` — shell global (Navbar, Footer, Chatbot).
- `app/page.tsx` — home con mapa (`MapWrapper` → `InteractiveMap`).
- `app/api/auth/*`, `app/api/owner`, `app/api/admin/*`, `app/api/chatbot/route.ts`, `app/api/upload/route.ts`.
- `lib/supabase.ts` — clientes Supabase.
- `.env.local` — `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`, `JWT_SECRET`, `GEMINI_API_KEY`.
- `supabase-setup.sql` — inicialización/re-siembra de la base.

## Deployment & Accounts
- **GitHub**: `https://github.com/Alexander-Rodriguez003/gastro-cocha` (rama `main`).
- **Vercel**: proyecto `gastro-cocha`, `projectId prj_ogbua8f6WUxOr6NwO4L9qbSFATa5`, `orgId team_5VcvjjSOiPWg8UkW9ejr1HeG` (equipo; el nombre visible requiere `vercel login`).
- **Dominio producción**: `https://guiagastronomicacohala.dpdns.org` (DNS en Cloudflare, sirve Vercel, HTTP 200).
- **Dominio anterior**: `https://gastro-cocha.vercel.app` → 307 redirect al dominio nuevo.
- **Supabase**: proyecto `nwybxjkbyiawjgbjrylx` (`https://nwybxjkbyiawjgbjrylx.supabase.co`), bucket `gastro-images` público.

## Last Scanned
2026-11-18
