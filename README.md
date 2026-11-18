# 🍽️ GastroCocha — Guía Gastronómica de Cochabamba

Guía web de los platos típicos y restaurantes de las 16 provincias de Cochabamba (Bolivia), con mapa interactivo y chatbot que recomienda por ubicación, provincia y presupuesto.

- **Producción:** https://guiagastronomicacohala.dpdns.org
- **Repositorio:** https://github.com/Alexander-Rodriguez003/gastro-cocha
- **Dominio anterior:** `gastro-cocha.vercel.app` (redirige al nuevo)

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16.2.6 (App Router, Turbopack) |
| Lenguaje | TypeScript 5 |
| UI | React 19 + CSS variables + estilos inline + Tailwind 4 (PostCSS) |
| Base de datos | Supabase (PostgreSQL) vía `@supabase/supabase-js` |
| Archivos | Supabase Storage (bucket público `gastro-images`) |
| Mapas | Leaflet 1.9.4 |
| IA | Gemini (principal), DeepSeek opcional, fallback mock |
| Deploy | Vercel (auto-deploy desde `main`) |

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # completar valores reales
npm run dev                  # http://localhost:3000
```

Scripts disponibles:

```bash
npm run dev      # servidor de desarrollo
npm run build    # build de producción (verificación)
npm run start    # servir build
npm run lint     # ESLint
```

No hay suite de tests configurada todavía.

## Variables de entorno

Definidas en `.env.local` (nunca se commitea):

| Variable | Obligatoria | Uso |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Sí | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sí | Clave pública (cliente) |
| `SUPABASE_SERVICE_KEY` | Sí | Service Role; **solo servidor** (consultas y Storage) |
| `JWT_SECRET` | Sí | Firma HMAC de la cookie de sesión (fijo para sobrevivir reinicios) |
| `GEMINI_API_KEY` | No | Chatbot con IA real; sin ella usa respuestas mock |

> ⚠️ Las credenciales de usuarios se gestionan fuera del repositorio. No agregar contraseñas al código ni al README.

## Base de datos

1. Crear proyecto en [supabase.com](https://supabase.com).
2. Ejecutar `supabase-setup.sql` completo en **SQL Editor** (crea tablas, índices y datos semilla).
3. Crear un bucket de Storage llamado **`gastro-images`** y marcarlo como público (para fotos de platos y locales).
4. Copiar `URL`, `anon key` y `service_role key` a `.env.local` y a Vercel.

Tablas principales: `provincias`, `platos`, `lugares`, `plato_lugar`, `resenas`, `solicitudes`, `users`, `favoritos`, `fotos`, `app_settings`.

## Roles y autenticación

Sesión propia con cookie httpOnly `gastro_session` (payload Base64 + firma HMAC-SHA256 con `JWT_SECRET`). Contraseñas con SHA-256 + sal fija.

| Rol | Acceso |
|---|---|
| `user` | Sitio público, reseñas |
| `owner` | `/owner` — su negocio, platos, precios, especialidades y fotos |
| `admin` | `/admin` — platos, lugares, solicitudes, reseñas y propietarios |

El dueño de un negocio se vincula por `lugares.email_propietario` ↔ `users.email`.

## Paneles

**Admin** (`/admin`)
- Platos y Lugares: CRUD completo persistido en Supabase (crear, editar, activar, destacar, eliminar, subir foto).
- Solicitudes: aprobar/rechazar registros públicos. Al aprobar se crea el local.
- Reseñas: moderación.
- Propietarios: crear cuenta `owner`, enlazarla al local y resetear contraseñas.

**Owner** (`/owner`)
- Editar datos del local, precios y fotos de platos, y especialidades propias.

## Estructura

```
app/
├── page.tsx                 # Home con mapa
├── provincias/ · provincia/[slug]/ · plato/[slug]/
├── negocios/ · negocio/[slug]/ · ranking/
├── registrar-negocio/       # Solicitud pública
├── login/                   # Login + registro
├── owner/                   # Panel del propietario
├── admin/                   # Panel admin (layout protegido)
└── api/                     # auth, chatbot, owner, admin, map, solicitudes, upload
components/                  # Navbar, Chatbot, InteractiveMap, vistas, ImageUpload
lib/
├── data.ts                  # Acceso a Supabase (incluye CRUD admin)
├── auth.ts                  # Sesión, login, roles, contraseñas
├── validation.ts            # Sanitización y validación de entradas
├── supabase.ts              # Clientes anon y Service Role
└── types.ts · utils.ts · seed-data.ts
supabase-setup.sql           # Esquema + datos semilla
```

## Deploy

Vercel está conectado al repositorio: cada push a `main` publica en producción. Las variables de entorno se configuran en **Vercel → Project → Settings → Environment Variables**.

## Estado y pendientes

- ✅ Datos migrados a Supabase; admin persistente; subida de imágenes; validación server-side.
- ⏳ Mejoras pendientes: diseño/UX, rendimiento (imágenes), accesibilidad y tests/CI.
- ⏳ `app/admin/platos` y `app/admin/lugares` ya no usan `localStorage`, pero conviene revisar que no queden restos de datos mock en otras vistas.
- ⏳ Sin tests automatizados.
