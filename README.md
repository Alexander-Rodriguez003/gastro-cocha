# 🍽️ GastroCocha — Guía Gastronómica de Cochabamba

Descubre los mejores platos típicos y restaurantes de las 16 provincias de Cochabamba, Bolivia. Con chatbot inteligente que recomienda por ubicación y presupuesto.

## 🚀 Deploy en 5 minutos

### 1. Supabase (Base de datos gratuita)
1. Ir a [supabase.com](https://supabase.com) → Create new project
2. Ir a **SQL Editor** → pegar el contenido de `supabase-setup.sql` → Run
3. Ir a **Settings → API** → copiar `URL` y `anon key`

### 2. Vercel (Hosting gratuito)
1. Subir este repo a GitHub
2. Ir a [vercel.com](https://vercel.com) → Import → seleccionar el repo
3. En **Environment Variables**, agregar:
   - `NEXT_PUBLIC_SUPABASE_URL` = tu URL de Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = tu anon key
4. Click **Deploy** ✅

### 3. DeepSeek (Chatbot IA — opcional)
1. Ir a [platform.deepseek.com](https://platform.deepseek.com)
2. Crear API key → agregar en Vercel como `DEEPSEEK_API_KEY`
3. Sin esta key, el chatbot funciona con respuestas inteligentes pre-programadas

## 🧑‍💻 Desarrollo local

```bash
npm install
npm run dev
# Abre http://localhost:3000
```

### Credenciales de prueba
- **Admin**: `admin@gastrococha.bo` / `admin123`
- **Usuario**: `demo@gastrococha.bo` / `demo123`

## 📁 Estructura
```
gastro-next/
├── app/                    # Páginas y API routes
│   ├── page.tsx           # Home
│   ├── login/             # Login/registro
│   ├── plato/[slug]/      # Detalle de plato
│   ├── provincia/[slug]/  # Detalle de provincia
│   ├── ranking/           # Ranking global
│   ├── registrar-negocio/ # Formulario público (preparado)
│   ├── admin/             # Panel admin (protegido)
│   └── api/               # Chatbot + Auth endpoints
├── components/            # Componentes reutilizables
├── lib/                   # Lógica de negocio
│   ├── data.ts           # Capa de datos (mock/Supabase)
│   ├── auth.ts           # Autenticación
│   ├── seed-data.ts      # 16 provincias + platos
│   └── utils.ts          # Haversine, formateo
└── supabase-setup.sql    # SQL listo para Supabase
```

## ✨ Funcionalidades
- 🗺️ **16 provincias** de Cochabamba con platos típicos
- 🤖 **Chatbot inteligente** por ubicación, presupuesto y provincia
- 🛡️ **Panel admin** con moderación de reseñas y solicitudes
- 📋 **Registro de negocios** preparado (activable por admin)
- ⭐ **Ranking** y reseñas de platos y restaurantes
- 📱 **Responsive** — funciona en móvil y desktop

## 💰 Costo
| Servicio | Costo |
|---|---|
| Vercel (hosting) | **$0** |
| Supabase (DB) | **$0** |
| DeepSeek (chatbot) | **~$0.50/mes** |
