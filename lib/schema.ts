// Supabase SQL schema for Gastro Cocha
// Run this in Supabase SQL Editor to create all tables

export const SCHEMA_SQL = `
-- =============================================
-- PROVINCIAS
-- =============================================
CREATE TABLE IF NOT EXISTS provincias (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  slug VARCHAR(120) UNIQUE NOT NULL,
  descripcion TEXT,
  centro_lat DECIMAL(10,8),
  centro_lng DECIMAL(11,8),
  zoom_mapa SMALLINT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- USERS
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  email_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PLATOS
-- =============================================
CREATE TABLE IF NOT EXISTS platos (
  id BIGSERIAL PRIMARY KEY,
  provincia_id BIGINT NOT NULL REFERENCES provincias(id) ON DELETE RESTRICT,
  nombre VARCHAR(150) NOT NULL,
  slug VARCHAR(180) UNIQUE NOT NULL,
  descripcion TEXT NOT NULL,
  historia TEXT,
  ingredientes TEXT,
  precio_referencial DECIMAL(8,2),
  destacado BOOLEAN DEFAULT FALSE,
  activo BOOLEAN DEFAULT TRUE,
  promedio_rating DECIMAL(3,2),
  total_resenas INT DEFAULT 0,
  imagen_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- LUGARES (with moderation fields for public registration)
-- =============================================
CREATE TABLE IF NOT EXISTS lugares (
  id BIGSERIAL PRIMARY KEY,
  provincia_id BIGINT NOT NULL REFERENCES provincias(id) ON DELETE RESTRICT,
  nombre VARCHAR(150) NOT NULL,
  slug VARCHAR(180) UNIQUE NOT NULL,
  direccion VARCHAR(255),
  referencia VARCHAR(255),
  telefono VARCHAR(50),
  sitio_web VARCHAR(255),
  lat DECIMAL(10,8) NOT NULL,
  lng DECIMAL(11,8) NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  aprobado BOOLEAN DEFAULT FALSE,
  contacto_propietario VARCHAR(100),
  nombre_propietario VARCHAR(150),
  email_propietario VARCHAR(255),
  descripcion TEXT,
  imagen_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lugares_coords ON lugares(lat, lng);
CREATE INDEX IF NOT EXISTS idx_lugares_aprobado ON lugares(aprobado, activo);

-- =============================================
-- PLATO_LUGAR (pivot)
-- =============================================
CREATE TABLE IF NOT EXISTS plato_lugar (
  id BIGSERIAL PRIMARY KEY,
  plato_id BIGINT NOT NULL REFERENCES platos(id) ON DELETE CASCADE,
  lugar_id BIGINT NOT NULL REFERENCES lugares(id) ON DELETE CASCADE,
  precio_aproximado DECIMAL(8,2),
  especialidad BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(plato_id, lugar_id)
);

-- =============================================
-- RESENAS (supports both platos AND lugares)
-- =============================================
CREATE TABLE IF NOT EXISTS resenas (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plato_id BIGINT REFERENCES platos(id) ON DELETE CASCADE,
  lugar_id BIGINT REFERENCES lugares(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  titulo VARCHAR(150),
  comentario TEXT NOT NULL,
  fecha_visita DATE,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT resena_target CHECK (plato_id IS NOT NULL OR lugar_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_resenas_plato ON resenas(plato_id);
CREATE INDEX IF NOT EXISTS idx_resenas_lugar ON resenas(lugar_id);
CREATE INDEX IF NOT EXISTS idx_resenas_approved ON resenas(is_approved);

-- =============================================
-- FAVORITOS
-- =============================================
CREATE TABLE IF NOT EXISTS favoritos (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plato_id BIGINT NOT NULL REFERENCES platos(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, plato_id)
);

-- =============================================
-- FOTOS
-- =============================================
CREATE TABLE IF NOT EXISTS fotos (
  id BIGSERIAL PRIMARY KEY,
  plato_id BIGINT REFERENCES platos(id) ON DELETE CASCADE,
  lugar_id BIGINT REFERENCES lugares(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt VARCHAR(255),
  orden INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- APP SETTINGS (for feature toggles like public registration)
-- =============================================
CREATE TABLE IF NOT EXISTS app_settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO app_settings (key, value) VALUES
  ('registro_publico_habilitado', 'false'),
  ('chatbot_habilitado', 'true')
ON CONFLICT (key) DO NOTHING;
`;
