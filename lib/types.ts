// =============================================
// Tipos principales del dominio Gastro Cocha
// =============================================

export interface Provincia {
  id: number;
  nombre: string;
  slug: string;
  descripcion: string | null;
  centro_lat: number | null;
  centro_lng: number | null;
  zoom_mapa: number | null;
  created_at?: string;
}

export interface Plato {
  id: number;
  provincia_id: number;
  nombre: string;
  slug: string;
  descripcion: string;
  historia: string | null;
  ingredientes: string | null;
  precio_referencial: number | null;
  destacado: boolean;
  activo: boolean;
  promedio_rating: number | null;
  total_resenas: number;
  imagen_url: string | null;
  created_at?: string;
  // Relaciones
  provincia?: Provincia;
  lugares?: LugarConPivot[];
  resenas?: Resena[];
  fotos?: Foto[];
}

export interface Especialidad {
  id: number;
  nombre: string;
  precio: number;
  imagen_url: string | null;
  total_resenas: number;
  promedio_rating: number | null;
}

export interface Lugar {
  id: number;
  provincia_id: number;
  nombre: string;
  slug: string;
  direccion: string | null;
  referencia: string | null;
  telefono: string | null;
  sitio_web: string | null;
  lat: number;
  lng: number;
  activo: boolean;
  aprobado: boolean;
  contacto_propietario: string | null;
  nombre_propietario: string | null;
  email_propietario: string | null;
  descripcion: string | null;
  imagen_url: string | null;
  created_at?: string;
  // Relaciones
  provincia?: Provincia;
  platos?: PlatoConPivot[];
  resenas?: Resena[];
  especialidades?: Especialidad[];
}

export interface LugarConPivot extends Lugar {
  pivot?: {
    precio_aproximado: number | null;
    especialidad: boolean;
    imagen_url?: string | null;
  };
}

export interface PlatoConPivot extends Plato {
  pivot?: {
    precio_aproximado: number | null;
    especialidad: boolean;
    imagen_url?: string | null;
  };
}

export interface Resena {
  id: number;
  user_id: number;
  plato_id: number | null;
  lugar_id: number | null;
  rating: number; // 1-5
  titulo: string | null;
  comentario: string;
  fecha_visita: string | null;
  is_approved: boolean;
  created_at?: string;
  // Relaciones
  user?: UserPublic;
  plato?: Plato;
  lugar?: Lugar;
  especialidad_nombre?: string | null; // For custom specialties reviews
}

export interface Favorito {
  id: number;
  user_id: number;
  plato_id: number;
  created_at?: string;
}

export interface Foto {
  id: number;
  plato_id: number | null;
  lugar_id: number | null;
  url: string;
  alt: string | null;
  orden: number;
  created_at?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'owner';
  password_hash?: string;
  created_at?: string;
}

export interface UserPublic {
  id: number;
  name: string;
}

// Para el formulario de registro de negocios
export interface PropuestaLugar {
  nombre: string;
  direccion: string;
  referencia?: string;
  telefono: string;
  sitio_web?: string;
  lat: number;
  lng: number;
  nombre_propietario: string;
  email_propietario?: string;
  descripcion?: string;
  platos_que_sirve?: string; // Texto libre, el admin lo parsea
  provincia_id: number;
}

// Para el chatbot
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  user_lat?: number;
  user_lng?: number;
  budget?: number;
}
