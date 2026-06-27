-- GastroCocha — Schema + Seed Data for Supabase
-- Paste this entire file in Supabase SQL Editor and click Run

-- 1. TABLES
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

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'owner')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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
  especialidades JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lugares_coords ON lugares(lat, lng);
CREATE INDEX IF NOT EXISTS idx_lugares_aprobado ON lugares(aprobado, activo);

CREATE TABLE IF NOT EXISTS plato_lugar (
  id BIGSERIAL PRIMARY KEY,
  plato_id BIGINT NOT NULL REFERENCES platos(id) ON DELETE CASCADE,
  lugar_id BIGINT NOT NULL REFERENCES lugares(id) ON DELETE CASCADE,
  precio_aproximado DECIMAL(8,2),
  especialidad BOOLEAN DEFAULT FALSE,
  imagen_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(plato_id, lugar_id)
);

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
  reviewed BOOLEAN DEFAULT FALSE,
  especialidad_nombre VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT resena_target CHECK (plato_id IS NOT NULL OR lugar_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_resenas_plato ON resenas(plato_id);
CREATE INDEX IF NOT EXISTS idx_resenas_lugar ON resenas(lugar_id);

CREATE TABLE IF NOT EXISTS favoritos (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plato_id BIGINT NOT NULL REFERENCES platos(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, plato_id)
);

CREATE TABLE IF NOT EXISTS fotos (
  id BIGSERIAL PRIMARY KEY,
  plato_id BIGINT REFERENCES platos(id) ON DELETE CASCADE,
  lugar_id BIGINT REFERENCES lugares(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt VARCHAR(255),
  orden INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS solicitudes (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  direccion VARCHAR(255) NOT NULL,
  telefono VARCHAR(50) NOT NULL,
  nombre_propietario VARCHAR(150) NOT NULL,
  email_propietario VARCHAR(255),
  provincia VARCHAR(100) NOT NULL,
  lat DECIMAL(10,8) NOT NULL,
  lng DECIMAL(11,8) NOT NULL,
  platos_que_sirve TEXT,
  especialidades TEXT,
  status VARCHAR(20) DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'aprobado', 'rechazado')),
  fecha DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SEED DATA
INSERT INTO app_settings (key, value) VALUES
  ('registro_publico_habilitado', 'true'),
  ('chatbot_habilitado', 'true')
ON CONFLICT (key) DO NOTHING;

-- Provincias
INSERT INTO provincias (nombre, slug, descripcion, centro_lat, centro_lng, zoom_mapa) VALUES
  ('Cercado', 'cercado', 'Capital del departamento, corazón gastronómico de Cochabamba.', -17.3895, -66.1568, 13),
  ('Quillacollo', 'quillacollo', 'Tierra del Señor de las Lagunas y la cocina tradicional.', -17.3940, -66.2770, 13),
  ('Chapare', 'chapare', 'Zona tropical con gastronomía de río y selva.', -16.9700, -65.4200, 10),
  ('Punata', 'punata', 'Valle alto, famosa por sus rosquetes y cuñapés.', -17.5442, -65.8356, 13),
  ('Germán Jordán (Cliza)', 'german-jordan', 'La capital del pichón de paloma.', -17.5886, -65.9328, 14),
  ('Esteban Arce (Tarata)', 'esteban-arce', 'Cuna del chorizo tarateño y la chicha.', -17.6094, -66.0233, 14),
  ('Arani', 'arani', 'Famosa por su pan artesanal horneado en leña.', -17.5672, -65.7700, 14),
  ('Carrasco (Totora)', 'carrasco', 'Zona de valles con el uchucu totoreño.', -17.7833, -65.1667, 11),
  ('Mizque', 'mizque', 'Valle cálido con gastronomía criolla y frutas.', -17.9372, -65.3394, 12),
  ('Capinota', 'capinota', 'Conocida por su chicha y platos del valle.', -17.7167, -66.2500, 13),
  ('Campero (Aiquile)', 'campero', 'Capital del charango, comida de valle seco.', -18.2028, -65.1750, 12),
  ('Ayopaya (Independencia)', 'ayopaya', 'Zona montañosa con cocina de altura.', -17.0833, -66.8167, 11),
  ('Arque', 'arque', 'Provincia rural con gastronomía ancestral.', -17.8500, -66.3167, 12),
  ('Tapacarí', 'tapacari', 'Altiplano cochabambino con platos de papa y chuño.', -17.5167, -66.5667, 12),
  ('Bolívar', 'bolivar', 'Pequeña provincia con tradiciones culinarias andinas.', -17.9833, -66.0667, 12),
  ('Tiraque', 'tiraque', 'Zona de producción agrícola y trucha de laguna.', -17.4167, -65.7167, 12);

-- Users (hashes generated with simpleHash: SHA-256(password + 'gastro-cocha-salt'))
INSERT INTO users (name, email, password_hash, role) VALUES
  ('Admin GastroCocha', 'admin@gastrococha.bo', '1e8c472db12f404b8dd9f676fdd85f208b01dd2a371bda0040d2d994605d1df2', 'admin'),
  ('Usuario Demo', 'demo@gastrococha.bo', '7d30c91406dcd3c34bc3d4f446eaffd607fb22c3aaf01b0b05fcd370f9421b52', 'user'),
  ('Juana Mamani', 'juana@comedordonajuana.com', '4cb069a42d8543606acd84f1b72fe7a4c71f00d7f58a9f9a23a6064761c938d2', 'owner'),
  ('Carlos Quispe', 'carlos@truchaselparaiso.com', '92db01ea4281fe8b3877e5476e67c2e40cdc5aa553bce4b33b1c6974b44db64a', 'owner'),
  ('Palacio Owner', 'silpancho@elpalaciodelsilpancho.com', '1b2678f6ff5ddee284399e2a2b1dd91454812929c66eac138da3e6c68e013b69', 'owner');

-- Platos
INSERT INTO platos (provincia_id, nombre, slug, descripcion, historia, ingredientes, precio_referencial, destacado, imagen_url) VALUES
  ((SELECT id FROM provincias WHERE slug='cercado'), 'Silpancho', 'silpancho', 'Plato emblemático de Cochabamba: arroz, papa, carne apanada, huevo frito y ensalada.', 'Creado en las pensiones cochabambinas. Su nombre proviene del quechua "sillp''anchu" que significa aplanado.', 'Arroz, papa, carne de res apanada, huevo frito, tomate, cebolla, locoto.', 25, true, '/images/silpancho.png'),
  ((SELECT id FROM provincias WHERE slug='cercado'), 'Pique Macho', 'pique-macho', 'Montaña de carne, salchicha, papa frita, locoto y huevo duro.', 'Nació en la chichería cochabambina como acompañamiento de la chicha.', 'Carne de res, salchicha, papa frita, locoto, cebolla, tomate, huevo duro.', 45, true, '/images/pique-macho.png'),
  ((SELECT id FROM provincias WHERE slug='cercado'), 'Chajchu', 'chajchu', 'Charque deshilachado con papa, chuño, queso, huevo y salsa de ají.', 'Plato de origen minero que se popularizó en Cochabamba.', 'Charque, papa, chuño, queso fresco, huevo, ají colorado.', 30, false, '/images/chajchu.png'),
  ((SELECT id FROM provincias WHERE slug='cercado'), 'Chicharrón de Cerdo', 'chicharron-cerdo', 'Cerdo frito cocido en su propia grasa, servido con mote y llajwa.', 'Tradición dominical en Cochabamba.', 'Cerdo, mote de maíz, papa, llajwa.', 35, true, '/images/chicharron-cerdo.png'),
  ((SELECT id FROM provincias WHERE slug='quillacollo'), 'Fricasé', 'fricase', 'Sopa contundente de cerdo con chuño, papa y ají amarillo.', 'Adaptación boliviana del fricassée francés.', 'Cerdo, chuño, papa, ají amarillo, comino, mote.', 30, true, '/images/fricase.png'),
  ((SELECT id FROM provincias WHERE slug='quillacollo'), 'Pato al Horno', 'pato-al-horno', 'Pato horneado lentamente con especias locales.', 'Plato festivo del valle cochabambino.', 'Pato, papa, ensalada, especias.', 50, false, '/images/pato-al-horno.png'),
  ((SELECT id FROM provincias WHERE slug='chapare'), 'Trucha del Chapare', 'trucha-chapare', 'Trucha fresca de los ríos tropicales, frita o a la plancha.', 'Introducida en los ríos chapareños.', 'Trucha, limón, arroz, ensalada, yuca.', 40, true, '/images/trucha-chapare.png'),
  ((SELECT id FROM provincias WHERE slug='chapare'), 'Tambaquí Frito', 'tambaqui-frito', 'Pescado amazónico de carne firme, frito con yuca y arroz.', 'Pez nativo del trópico cochabambino.', 'Tambaquí, yuca, arroz, ensalada.', 45, false, '/images/tambaqui-frito.png'),
  ((SELECT id FROM provincias WHERE slug='punata'), 'Rosquetes de Punata', 'rosquetes-punata', 'Rosquillas dulces horneadas, crujientes por fuera y suaves por dentro.', 'Tradición panadera del valle alto.', 'Harina, huevo, manteca, azúcar, anís.', 5, true, '/images/rosquetes-punata.png'),
  ((SELECT id FROM provincias WHERE slug='punata'), 'Cuñapé', 'cuñape', 'Bollito de almidón de yuca y queso, horneado hasta dorar.', 'De origen oriental boliviano.', 'Almidón de yuca, queso, huevo, manteca.', 3, false, '/images/cunape.png'),
  ((SELECT id FROM provincias WHERE slug='german-jordan'), 'Pichón de Cliza', 'pichon-cliza', 'Pichón de paloma frito, servido con papa y ensalada.', 'Cliza es la capital del pichón en Bolivia.', 'Pichón de paloma, papa, ensalada, llajwa.', 35, true, '/images/pichon-cliza.png'),
  ((SELECT id FROM provincias WHERE slug='esteban-arce'), 'Chorizo Tarateño', 'chorizo-tarateno', 'Chorizo artesanal especiado, asado a la parrilla.', 'Los chorizos de Tarata son patrimonio gastronómico.', 'Carne de cerdo, ají colorado, comino, pimienta.', 20, true, '/images/chorizo-tarateno.png'),
  ((SELECT id FROM provincias WHERE slug='arani'), 'Pan de Arani', 'pan-de-arani', 'Pan grande horneado en horno de leña, corteza crujiente y miga esponjosa.', 'Los hornos de barro llevan generaciones encendidos.', 'Harina de trigo, levadura, manteca, sal.', 5, true, '/images/pan-de-arani.png'),
  ((SELECT id FROM provincias WHERE slug='carrasco'), 'Uchucu Totoreño', 'uchucu-totoreno', 'Sopa espesa de ají con carne, papa y verduras del valle.', 'Plato típico de Totora.', 'Ají colorado, carne, papa, verduras, maní.', 20, false, '/images/uchucu-totoreno.png'),
  ((SELECT id FROM provincias WHERE slug='mizque'), 'Lechón al Horno', 'lechon-mizque', 'Lechón entero horneado con hierbas del valle de Mizque.', 'Preparado para fiestas patronales.', 'Lechón, hierbas, papa, ensalada.', 60, false, '/images/lechon-mizque.png'),
  ((SELECT id FROM provincias WHERE slug='tiraque'), 'Trucha de Laguna', 'trucha-tiraque', 'Trucha fresca de las lagunas de altura de Tiraque.', 'Las lagunas de Tiraque proveen truchas de agua fría.', 'Trucha, papa, chuño, ensalada.', 35, false, '/images/trucha-tiraque.png');

-- Lugares
INSERT INTO lugares (provincia_id, nombre, slug, direccion, telefono, lat, lng, aprobado, activo, email_propietario, nombre_propietario) VALUES
  ((SELECT id FROM provincias WHERE slug='cercado'), 'Pensión Doña Rosa', 'pension-dona-rosa', 'Calle Esteban Arce #456, Cercado', '+591 4 4251234', -17.3935, -66.1570, true, true, NULL, NULL),
  ((SELECT id FROM provincias WHERE slug='cercado'), 'El Paladar Cochabambino', 'el-paladar-cochabambino', 'Av. Heroínas #789, Cercado', '+591 4 4259876', -17.3880, -66.1590, true, true, 'silpancho@elpalaciodelsilpancho.com', 'Palacio Owner'),
  ((SELECT id FROM provincias WHERE slug='cercado'), 'La Cancha Food Court', 'la-cancha-food', 'Mercado La Cancha, Puesto 42', '+591 71234567', -17.3950, -66.1540, true, true, NULL, NULL),
  ((SELECT id FROM provincias WHERE slug='quillacollo'), 'Picantería La Quillacolleña', 'picanteria-quillacollo', 'Calle Bolívar, Quillacollo', '+591 4 4361111', -17.3945, -66.2800, true, true, NULL, NULL),
  ((SELECT id FROM provincias WHERE slug='quillacollo'), 'Parador Km 8 - Doña Petrona', 'parador-km8', 'Carretera Cbba-Quillacollo Km 8', '+591 71555888', -17.3942, -66.2200, true, true, NULL, NULL),
  ((SELECT id FROM provincias WHERE slug='quillacollo'), 'Comedor Doña Juana', 'comedor-dona-juana', 'Carretera Cbba-Oruro Km 15, al lado del puente', '+591 71222333', -17.41, -66.35, true, true, 'juana@comedordonajuana.com', 'Juana Mamani'),
  ((SELECT id FROM provincias WHERE slug='chapare'), 'Restaurante El Trópico', 'restaurante-el-tropico', 'Av. Principal, Villa Tunari', '+591 4 4136789', -16.9730, -65.4100, true, true, 'carlos@truchaselparaiso.com', 'Carlos Quispe'),
  ((SELECT id FROM provincias WHERE slug='german-jordan'), 'Feria del Pichón - Doña María', 'feria-pichon-cliza', 'Plaza Principal, Cliza', '+591 71888999', -17.5890, -65.9330, true, true, NULL, NULL),
  ((SELECT id FROM provincias WHERE slug='esteban-arce'), 'Choricería Don Julio', 'choriceria-don-julio', 'Calle Sucre, Tarata', '+591 71777666', -17.6100, -66.0240, true, true, NULL, NULL),
  ((SELECT id FROM provincias WHERE slug='arani'), 'Panadería Tradición Araneña', 'panaderia-arani', 'Plaza Principal, Arani', '+591 71666555', -17.5675, -65.7710, true, true, NULL, NULL),
  ((SELECT id FROM provincias WHERE slug='punata'), 'Rosquetería La Punateña', 'rosqueteria-punatena', 'Calle Comercio, Punata', '+591 71444333', -17.5445, -65.8360, true, true, NULL, NULL);

-- Relaciones plato-lugar
INSERT INTO plato_lugar (plato_id, lugar_id, precio_aproximado, especialidad) VALUES
  ((SELECT id FROM platos WHERE slug='silpancho'), (SELECT id FROM lugares WHERE slug='pension-dona-rosa'), 25, true),
  ((SELECT id FROM platos WHERE slug='pique-macho'), (SELECT id FROM lugares WHERE slug='pension-dona-rosa'), 45, false),
  ((SELECT id FROM platos WHERE slug='silpancho'), (SELECT id FROM lugares WHERE slug='el-paladar-cochabambino'), 28, true),
  ((SELECT id FROM platos WHERE slug='chicharron-cerdo'), (SELECT id FROM lugares WHERE slug='el-paladar-cochabambino'), 35, true),
  ((SELECT id FROM platos WHERE slug='silpancho'), (SELECT id FROM lugares WHERE slug='la-cancha-food'), 18, true),
  ((SELECT id FROM platos WHERE slug='chajchu'), (SELECT id FROM lugares WHERE slug='la-cancha-food'), 25, false),
  ((SELECT id FROM platos WHERE slug='fricase'), (SELECT id FROM lugares WHERE slug='picanteria-quillacollo'), 30, true),
  ((SELECT id FROM platos WHERE slug='pato-al-horno'), (SELECT id FROM lugares WHERE slug='picanteria-quillacollo'), 50, true),
  ((SELECT id FROM platos WHERE slug='fricase'), (SELECT id FROM lugares WHERE slug='parador-km8'), 25, true),
  ((SELECT id FROM platos WHERE slug='chicharron-cerdo'), (SELECT id FROM lugares WHERE slug='parador-km8'), 30, false),
  ((SELECT id FROM platos WHERE slug='trucha-chapare'), (SELECT id FROM lugares WHERE slug='restaurante-el-tropico'), 40, true),
  ((SELECT id FROM platos WHERE slug='tambaqui-frito'), (SELECT id FROM lugares WHERE slug='restaurante-el-tropico'), 45, true),
  ((SELECT id FROM platos WHERE slug='pichon-cliza'), (SELECT id FROM lugares WHERE slug='feria-pichon-cliza'), 35, true),
  ((SELECT id FROM platos WHERE slug='chorizo-tarateno'), (SELECT id FROM lugares WHERE slug='choriceria-don-julio'), 20, true),
  ((SELECT id FROM platos WHERE slug='pan-de-arani'), (SELECT id FROM lugares WHERE slug='panaderia-arani'), 5, true),
  ((SELECT id FROM platos WHERE slug='rosquetes-punata'), (SELECT id FROM lugares WHERE slug='rosqueteria-punatena'), 5, true),
  ((SELECT id FROM platos WHERE slug='cuñape'), (SELECT id FROM lugares WHERE slug='rosqueteria-punatena'), 3, true);

-- Reseñas de seed
INSERT INTO resenas (user_id, plato_id, rating, titulo, comentario, is_approved) VALUES
  ((SELECT id FROM users WHERE email='demo@gastrococha.bo'), (SELECT id FROM platos WHERE slug='silpancho'), 5, '¡El mejor silpancho!', 'La carne perfectamente apanada y el huevo en su punto. Cochabamba es otro nivel.', true),
  ((SELECT id FROM users WHERE email='demo@gastrococha.bo'), (SELECT id FROM platos WHERE slug='pique-macho'), 4, 'Picante como debe ser', 'Abundante y con bastante locoto. Para compartir entre 3 personas fácil.', true),
  ((SELECT id FROM users WHERE email='demo@gastrococha.bo'), (SELECT id FROM platos WHERE slug='pichon-cliza'), 5, 'Hay que ir a Cliza', 'No es lo mismo comer pichón en otro lado, en Cliza es especial.', true),
  ((SELECT id FROM users WHERE email='demo@gastrococha.bo'), (SELECT id FROM platos WHERE slug='chorizo-tarateno'), 5, 'Patrimonio', 'Los chorizos de Tarata son incomparables. Se nota la receta centenaria.', true);

-- Solicitudes de ejemplo
INSERT INTO solicitudes (nombre, direccion, telefono, nombre_propietario, email_propietario, provincia, lat, lng, platos_que_sirve, especialidades, status) VALUES
  ('Comedor Doña Juana', 'Carretera Cbba-Oruro Km 15, al lado del puente', '+591 71222333', 'Juana Mamani', 'juana@comedordonajuana.com', 'Quillacollo', -17.41, -66.35, 'Fricasé, Chicharrón, Trancapecho', 'Fricasé Especial de la Casa', 'pendiente'),
  ('Truchas El Paraíso', 'Entrada a Villa Tunari, curva del río', '+591 71444555', 'Carlos Quispe', 'carlos@truchaselparaiso.com', 'Chapare', -16.98, -65.42, 'Trucha frita, Tambaquí, Surubí', 'Tambaquí a la Leña', 'pendiente');
