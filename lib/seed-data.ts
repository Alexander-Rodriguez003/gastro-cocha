// =============================================
// Seed data: 16 provincias + platos típicos de Cochabamba
// =============================================

export const PROVINCIAS = [
  { nombre: 'Cercado', slug: 'cercado', descripcion: 'Capital del departamento, corazón gastronómico de Cochabamba.', centro_lat: -17.3895, centro_lng: -66.1568, zoom_mapa: 13 },
  { nombre: 'Quillacollo', slug: 'quillacollo', descripcion: 'Tierra del Señor de las Lagunas y la cocina tradicional.', centro_lat: -17.3940, centro_lng: -66.2770, zoom_mapa: 13 },
  { nombre: 'Chapare', slug: 'chapare', descripcion: 'Zona tropical con gastronomía de río y selva.', centro_lat: -16.9700, centro_lng: -65.4200, zoom_mapa: 10 },
  { nombre: 'Punata', slug: 'punata', descripcion: 'Valle alto, famosa por sus rosquetes y cuñapés.', centro_lat: -17.5442, centro_lng: -65.8356, zoom_mapa: 13 },
  { nombre: 'Germán Jordán (Cliza)', slug: 'german-jordan', descripcion: 'La capital del pichón de paloma.', centro_lat: -17.5886, centro_lng: -65.9328, zoom_mapa: 14 },
  { nombre: 'Esteban Arce (Tarata)', slug: 'esteban-arce', descripcion: 'Cuna del chorizo tarateño y la chicha.', centro_lat: -17.6094, centro_lng: -66.0233, zoom_mapa: 14 },
  { nombre: 'Arani', slug: 'arani', descripcion: 'Famosa por su pan artesanal horneado en leña.', centro_lat: -17.5672, centro_lng: -65.7700, zoom_mapa: 14 },
  { nombre: 'Carrasco (Totora)', slug: 'carrasco', descripcion: 'Zona de valles con el uchucu totoreño.', centro_lat: -17.7833, centro_lng: -65.1667, zoom_mapa: 11 },
  { nombre: 'Mizque', slug: 'mizque', descripcion: 'Valle cálido con gastronomía criolla y frutas.', centro_lat: -17.9372, centro_lng: -65.3394, zoom_mapa: 12 },
  { nombre: 'Capinota', slug: 'capinota', descripcion: 'Conocida por su chicha y platos del valle.', centro_lat: -17.7167, centro_lng: -66.2500, zoom_mapa: 13 },
  { nombre: 'Campero (Aiquile)', slug: 'campero', descripcion: 'Capital del charango, comida de valle seco.', centro_lat: -18.2028, centro_lng: -65.1750, zoom_mapa: 12 },
  { nombre: 'Ayopaya (Independencia)', slug: 'ayopaya', descripcion: 'Zona montañosa con cocina de altura.', centro_lat: -17.0833, centro_lng: -66.8167, zoom_mapa: 11 },
  { nombre: 'Arque', slug: 'arque', descripcion: 'Provincia rural con gastronomía ancestral.', centro_lat: -17.8500, centro_lng: -66.3167, zoom_mapa: 12 },
  { nombre: 'Tapacarí', slug: 'tapacari', descripcion: 'Altiplano cochabambino con platos de papa y chuño.', centro_lat: -17.5167, centro_lng: -66.5667, zoom_mapa: 12 },
  { nombre: 'Bolívar', slug: 'bolivar', descripcion: 'Pequeña provincia con tradiciones culinarias andinas.', centro_lat: -17.9833, centro_lng: -66.0667, zoom_mapa: 12 },
  { nombre: 'Tiraque', slug: 'tiraque', descripcion: 'Zona de producción agrícola y trucha de laguna.', centro_lat: -17.4167, centro_lng: -65.7167, zoom_mapa: 12 },
];

export const PLATOS = [
  // Cercado
  { provincia_slug: 'cercado', nombre: 'Silpancho', slug: 'silpancho', descripcion: 'Plato emblemático de Cochabamba: arroz, papa, carne apanada finamente golpeada, huevo frito y ensalada de tomate y cebolla.', historia: 'Creado en las pensiones cochabambinas a mediados del siglo XX. Su nombre proviene del quechua "sillp\'anchu" que significa aplanado.', ingredientes: 'Arroz, papa, carne de res apanada, huevo frito, tomate, cebolla, locoto.', precio_referencial: 25, destacado: true, imagen_url: '/images/silpancho.jpg' },
  { provincia_slug: 'cercado', nombre: 'Pique Macho', slug: 'pique-macho', descripcion: 'Montaña de carne, salchicha, papa frita, locoto y huevo duro. El plato más contundente para compartir.', historia: 'Nació en la chichería cochabambina como acompañamiento de la chicha. Su nombre alude a lo picante ("pique") y abundante ("macho").', ingredientes: 'Carne de res, salchicha, papa frita, locoto, cebolla, tomate, huevo duro.', precio_referencial: 45, destacado: true, imagen_url: '/images/pique-macho.jpg' },
  { provincia_slug: 'cercado', nombre: 'Chajchu', slug: 'chajchu', descripcion: 'Charque deshilachado con papa, chuño, queso, huevo y salsa de ají.', historia: 'Plato de origen minero que se popularizó en Cochabamba.', ingredientes: 'Charque, papa, chuño, queso fresco, huevo, ají colorado.', precio_referencial: 30, destacado: false, imagen_url: null },
  { provincia_slug: 'cercado', nombre: 'Chicharrón de Cerdo', slug: 'chicharron-cerdo', descripcion: 'Cerdo frito cocido en su propia grasa, servido con mote y llajwa.', historia: 'Tradición dominical en Cochabamba, servido en chicherías y picanterías.', ingredientes: 'Cerdo, mote de maíz, papa, llajwa.', precio_referencial: 35, destacado: true, imagen_url: null },
  // Quillacollo
  { provincia_slug: 'quillacollo', nombre: 'Fricasé', slug: 'fricase', descripcion: 'Sopa contundente de cerdo con chuño, papa y ají amarillo. Ideal para el frío.', historia: 'Adaptación boliviana del fricassée francés, transformado con ingredientes andinos.', ingredientes: 'Cerdo, chuño, papa, ají amarillo, comino, mote.', precio_referencial: 30, destacado: true, imagen_url: null },
  { provincia_slug: 'quillacollo', nombre: 'Pato al Horno', slug: 'pato-al-horno', descripcion: 'Pato horneado lentamente con especias locales, servido con ensalada.', historia: 'Plato festivo típico del valle cochabambino.', ingredientes: 'Pato, papa, ensalada, especias.', precio_referencial: 50, destacado: false, imagen_url: null },
  // Chapare
  { provincia_slug: 'chapare', nombre: 'Trucha del Chapare', slug: 'trucha-chapare', descripcion: 'Trucha fresca de los ríos tropicales, preparada frita o a la plancha.', historia: 'Introducida en los ríos chapareños, se convirtió en el plato estrella de la zona.', ingredientes: 'Trucha, limón, arroz, ensalada, yuca.', precio_referencial: 40, destacado: true, imagen_url: null },
  { provincia_slug: 'chapare', nombre: 'Tambaquí Frito', slug: 'tambaqui-frito', descripcion: 'Pescado amazónico de carne firme, frito y servido con yuca y arroz.', historia: 'Pez nativo de los ríos del trópico cochabambino.', ingredientes: 'Tambaquí, yuca, arroz, ensalada.', precio_referencial: 45, destacado: false, imagen_url: null },
  // Punata
  { provincia_slug: 'punata', nombre: 'Rosquetes de Punata', slug: 'rosquetes-punata', descripcion: 'Rosquillas dulces horneadas, crujientes por fuera y suaves por dentro.', historia: 'Tradición panadera del valle alto, cada familia tiene su receta secreta.', ingredientes: 'Harina, huevo, manteca, azúcar, anís.', precio_referencial: 5, destacado: true, imagen_url: null },
  { provincia_slug: 'punata', nombre: 'Cuñapé', slug: 'cuñape', descripcion: 'Bollito de almidón de yuca y queso, horneado hasta dorar.', historia: 'De origen oriental boliviano, adoptado en todo el valle cochabambino.', ingredientes: 'Almidón de yuca, queso, huevo, manteca.', precio_referencial: 3, destacado: false, imagen_url: null },
  // Cliza
  { provincia_slug: 'german-jordan', nombre: 'Pichón de Cliza', slug: 'pichon-cliza', descripcion: 'Pichón de paloma frito, servido con papa y ensalada. Delicadeza del valle.', historia: 'Cliza es reconocida como la capital del pichón en Bolivia. Cada año se celebra la feria del pichón.', ingredientes: 'Pichón de paloma, papa, ensalada, llajwa.', precio_referencial: 35, destacado: true, imagen_url: null },
  // Tarata
  { provincia_slug: 'esteban-arce', nombre: 'Chorizo Tarateño', slug: 'chorizo-tarateno', descripcion: 'Chorizo artesanal especiado, asado a la parrilla. Famoso en toda Bolivia.', historia: 'Los chorizos de Tarata son patrimonio gastronómico de Cochabamba, preparados con recetas centenarias.', ingredientes: 'Carne de cerdo, ají colorado, comino, pimienta.', precio_referencial: 20, destacado: true, imagen_url: null },
  // Arani
  { provincia_slug: 'arani', nombre: 'Pan de Arani', slug: 'pan-de-arani', descripcion: 'Pan grande horneado en horno de leña, con corteza crujiente y miga esponjosa.', historia: 'Arani es sinónimo de pan en Cochabamba. Los hornos de barro llevan generaciones encendidos.', ingredientes: 'Harina de trigo, levadura, manteca, sal.', precio_referencial: 5, destacado: true, imagen_url: null },
  // Totora/Carrasco
  { provincia_slug: 'carrasco', nombre: 'Uchucu Totoreño', slug: 'uchucu-totoreno', descripcion: 'Sopa espesa de ají con carne, papa y verduras del valle.', historia: 'Plato típico de Totora, preparado en fiestas y celebraciones patronales.', ingredientes: 'Ají colorado, carne, papa, verduras, maní.', precio_referencial: 20, destacado: false, imagen_url: null },
  // Mizque
  { provincia_slug: 'mizque', nombre: 'Lechón al Horno', slug: 'lechon-mizque', descripcion: 'Lechón entero horneado lentamente con hierbas del valle de Mizque.', historia: 'Preparado para fiestas patronales y bodas en el valle de Mizque.', ingredientes: 'Lechón, hierbas, papa, ensalada.', precio_referencial: 60, destacado: false, imagen_url: null },
  // Tiraque
  { provincia_slug: 'tiraque', nombre: 'Trucha de Laguna', slug: 'trucha-tiraque', descripcion: 'Trucha fresca de las lagunas de altura de Tiraque.', historia: 'Las lagunas de Tiraque proveen truchas de agua fría con sabor único.', ingredientes: 'Trucha, papa, chuño, ensalada.', precio_referencial: 35, destacado: false, imagen_url: null },
];

export const LUGARES = [
  // Cercado
  { provincia_slug: 'cercado', nombre: 'Pensión Doña Rosa', slug: 'pension-dona-rosa', direccion: 'Calle Esteban Arce #456, Cercado', lat: -17.3935, lng: -66.1570, telefono: '+591 4 4251234', aprobado: true, activo: true, platos_slugs: [{ slug: 'silpancho', precio: 25, especialidad: true }, { slug: 'pique-macho', precio: 45, especialidad: false }] },
  { provincia_slug: 'cercado', nombre: 'El Paladar Cochabambino', slug: 'el-paladar-cochabambino', direccion: 'Av. Heroínas #789, Cercado', lat: -17.3880, lng: -66.1590, telefono: '+591 4 4259876', aprobado: true, activo: true, platos_slugs: [{ slug: 'silpancho', precio: 28, especialidad: true }, { slug: 'chicharron-cerdo', precio: 35, especialidad: true }] },
  { provincia_slug: 'cercado', nombre: 'La Cancha Food Court', slug: 'la-cancha-food', direccion: 'Mercado La Cancha, Puesto 42', lat: -17.3950, lng: -66.1540, telefono: '+591 71234567', aprobado: true, activo: true, platos_slugs: [{ slug: 'silpancho', precio: 18, especialidad: true }, { slug: 'chajchu', precio: 25, especialidad: false }] },
  // Quillacollo
  { provincia_slug: 'quillacollo', nombre: 'Picantería La Quillacolleña', slug: 'picanteria-quillacollo', direccion: 'Calle Bolívar, Quillacollo', lat: -17.3945, lng: -66.2800, telefono: '+591 4 4361111', aprobado: true, activo: true, platos_slugs: [{ slug: 'fricase', precio: 30, especialidad: true }, { slug: 'pato-al-horno', precio: 50, especialidad: true }] },
  // Carretera Cochabamba-Quillacollo
  { provincia_slug: 'quillacollo', nombre: 'Parador Km 8 - Doña Petrona', slug: 'parador-km8', direccion: 'Carretera Cbba-Quillacollo Km 8', referencia: 'Frente a la gasolinera', lat: -17.3942, lng: -66.2200, telefono: '+591 71555888', aprobado: true, activo: true, platos_slugs: [{ slug: 'fricase', precio: 25, especialidad: true }, { slug: 'chicharron-cerdo', precio: 30, especialidad: false }] },
  // Chapare
  { provincia_slug: 'chapare', nombre: 'Restaurante El Trópico', slug: 'restaurante-el-tropico', direccion: 'Av. Principal, Villa Tunari', lat: -16.9730, lng: -65.4100, telefono: '+591 4 4136789', aprobado: true, activo: true, platos_slugs: [{ slug: 'trucha-chapare', precio: 40, especialidad: true }, { slug: 'tambaqui-frito', precio: 45, especialidad: true }] },
  // Cliza
  { provincia_slug: 'german-jordan', nombre: 'Feria del Pichón - Doña María', slug: 'feria-pichon-cliza', direccion: 'Plaza Principal, Cliza', lat: -17.5890, lng: -65.9330, telefono: '+591 71888999', aprobado: true, activo: true, platos_slugs: [{ slug: 'pichon-cliza', precio: 35, especialidad: true }] },
  // Tarata
  { provincia_slug: 'esteban-arce', nombre: 'Choricería Don Julio', slug: 'choriceria-don-julio', direccion: 'Calle Sucre, Tarata', lat: -17.6100, lng: -66.0240, telefono: '+591 71777666', aprobado: true, activo: true, platos_slugs: [{ slug: 'chorizo-tarateno', precio: 20, especialidad: true }] },
  // Arani
  { provincia_slug: 'arani', nombre: 'Panadería Tradición Araneña', slug: 'panaderia-arani', direccion: 'Plaza Principal, Arani', lat: -17.5675, lng: -65.7710, telefono: '+591 71666555', aprobado: true, activo: true, platos_slugs: [{ slug: 'pan-de-arani', precio: 5, especialidad: true }] },
  // Punata
  { provincia_slug: 'punata', nombre: 'Rosquetería La Punateña', slug: 'rosqueteria-punatena', direccion: 'Calle Comercio, Punata', lat: -17.5445, lng: -65.8360, telefono: '+591 71444333', aprobado: true, activo: true, platos_slugs: [{ slug: 'rosquetes-punata', precio: 5, especialidad: true }, { slug: 'cuñape', precio: 3, especialidad: true }] },
];

export const USERS_SEED = [
  { name: 'Admin GastroCocha', email: 'admin@gastrococha.bo', password: 'admin123', role: 'admin' as const },
  { name: 'Usuario Demo', email: 'demo@gastrococha.bo', password: 'demo123', role: 'user' as const },
];

export const RESENAS_SEED = [
  { user_email: 'demo@gastrococha.bo', plato_slug: 'silpancho', rating: 5, titulo: '¡El mejor silpancho!', comentario: 'La carne perfectamente apanada y el huevo en su punto. Cochabamba es otro nivel.', is_approved: true },
  { user_email: 'demo@gastrococha.bo', plato_slug: 'pique-macho', rating: 4, titulo: 'Picante como debe ser', comentario: 'Abundante y con bastante locoto. Para compartir entre 3 personas fácil.', is_approved: true },
  { user_email: 'demo@gastrococha.bo', plato_slug: 'pichon-cliza', rating: 5, titulo: 'Hay que ir a Cliza', comentario: 'No es lo mismo comer pichón en otro lado, en Cliza es especial.', is_approved: true },
  { user_email: 'demo@gastrococha.bo', plato_slug: 'chorizo-tarateno', rating: 5, titulo: 'Patrimonio', comentario: 'Los chorizos de Tarata son incomparables. Se nota la receta centenaria.', is_approved: true },
];
