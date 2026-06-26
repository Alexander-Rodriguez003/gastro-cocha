# PROMPT DE GENERACIÓN DE DIAGRAMAS TÉCNICOS PARA GASTROCOCHA

Copia y pega el siguiente prompt en la herramienta de IA de tu elección (por ejemplo, Claude 3.5 Sonnet, ChatGPT-4o o un motor compatible con Mermaid.js) junto con el archivo completo `gastro_cocha_technical_documentation.md` para generar las representaciones visuales del sistema.

---

### INICIO DEL PROMPT PARA LA IA

```text
Actúa como un Arquitecto de Software Senior y Diseñador de UML Profesional.
A continuación te proporciono el documento técnico de la plataforma "GastroCocha". Tu tarea es generar el código fuente exacto para cinco (5) diagramas clave utilizando la sintaxis de Mermaid.js.

Sigue rigurosamente estas pautas para cada diagrama:
1. Entrega únicamente el bloque de código Mermaid.js limpio (dentro de bloques ```mermaid ... ```).
2. Asegúrate de que la sintaxis sea perfectamente válida, sin etiquetas HTML complejas ni caracteres especiales sin escapar que puedan romper la compilación de Mermaid.
3. Utiliza nombres de clases y relaciones claras basadas exactamente en la lógica del documento adjunto.

---

### DIAGRAMA 1: ARQUITECTURA FÍSICA Y LÓGICA (Nivel de Capas)
*   **Tipo**: diagrama de componentes o cajas agrupadas (`flowchart TB`).
*   **Requisito**: Debe ilustrar las tres capas básicas del sistema:
    1.  Capa Cliente (Frontend): React 19, Leaflet Map, Chatbot UI, Custom Event Bridge.
    2.  Capa Servidor (API de Next.js): Auth Handler (HMAC), Chatbot Router & Rate Limit, Map API.
    3.  Servicios Externos y Datos: API de Google Studio (Gemini 2.5 Flash / Lite), API de DeepSeek-Chat, Base de datos Supabase (PostgreSQL).

---

### DIAGRAMA 2: DIAGRAMA ENTIDAD-RELACIÓN COMPLETO (DER)
*   **Tipo**: diagrama de base de datos relacional (`erDiagram`).
*   **Requisito**: Representa las tablas del script SQL y sus restricciones exactas:
    *   `provincias` (id, nombre, slug, centro_lat, centro_lng, zoom_mapa)
    *   `users` (id, name, email, password_hash, role) con CHECK constraint de rol.
    *   `platos` (id, provincia_id, nombre, slug, precio_referencial, destacado, activo, promedio_rating)
    *   `lugares` (id, provincia_id, nombre, slug, lat, lng, aprobado, especialidades JSONB)
    *   `plato_lugar` (id, plato_id, lugar_id, precio_aproximado, especialidad)
    *   `resenas` (id, user_id, plato_id, lugar_id, rating, is_approved, especialidad_nombre)
    *   `solicitudes` (id, nombre, direccion, telefono, provincia, lat, lng, status)
    *   Define las relaciones usando notación de "pata de gallo" (Crow's Foot):
        *   `provincias` ||--o{ `platos` (1 a N)
        *   `provincias` ||--o{ `lugares` (1 a N)
        *   `platos` ||--o{ `plato_lugar` (1 a N)
        *   `lugares` ||--o{ `plato_lugar` (1 a N)
        *   `users` ||--o{ `resenas` (1 a N)
        *   `platos` ||--o{ `resenas` (0 a N)
        *   `lugares` ||--o{ `resenas` (0 a N)

---

### DIAGRAMA 3: FLUJO SECUENCIAL Conversacional e Inyección de Contexto
*   **Tipo**: diagrama de secuencia (`sequenceDiagram`).
*   **Requisito**: Muestra el flujo completo desde que el usuario realiza una consulta georreferenciada ("Silpancho cerca de mí con 30 Bs") en la caja del Chatbot:
    1.  El cliente captura la geolocalización.
    2.  Envía la petición POST a `/api/chatbot`.
    3.  El servidor verifica el Rate-Limit (cookies o sesión).
    4.  El servidor ejecuta `getChatbotContext` buscando en Supabase por cercanía (Haversine).
    5.  Supabase devuelve los registros.
    6.  El servidor concatena la base de datos en texto plano y la inyecta al LLM (Gemini 2.5 Flash).
    7.  El LLM responde con la acción estructurada `[[ACTION: {"action": "focus_map", ...}]]`.
    8.  El frontend parsea el token JSON y emite un CustomEvent.
    9.  El componente del mapa recibe el evento y reposiciona la cámara de Leaflet.

---

### DIAGRAMA 4: SECUENCIA MATEMÁTICA Y LÓGICA DE DISTANCIA (Haversine)
*   **Tipo**: diagrama de secuencia o flujo de cálculo (`flowchart TD`).
*   **Requisito**: Detalla cómo funciona el GPS y la validación de rango:
    1.  Inicio -> Obtener GPS (lat, lng).
    2.  ¿Está dentro de Cochabamba? (Caja espacial: lat entre -18.5 y -15.5; lng entre -67.5 y -64.5).
        *   Si es NO: Centrar mapa por defecto en Cercado y abortar búsqueda geolocalizada.
        *   Si es SÍ: Invocar endpoint `/api/map/provincia-por-coordenadas`.
    3.  El Servidor calcula la distancia euclidiana mínima a los centros de las provincias y detecta la provincia.
    4.  El Servidor ejecuta la ecuación de Haversine en base de datos para ordenar restaurantes locales y los retorna.
    5.  El Cliente aplica la fórmula de Haversine localmente para actualizar los 5 marcadores más cercanos y desplegarlos en el mapa Leaflet.

---

### DIAGRAMA 5: DIAGRAMA DE TRANSICIÓN DE ESTADOS DE MODERACIÓN Y REGISTRO
*   **Tipo**: diagrama de estado (`stateDiagram-v2`).
*   **Requisito**: Modela la vida de un local propuesto y una reseña escrita:
    *   Subir solicitud -> Estado `Pendiente`.
    *   Admin rechaza -> Estado `Rechazado` (Fin).
    *   Admin aprueba -> Estado `Aprobado` -> Desencadena la creación del registro en `lugares`, asocia especialidades JSONB e inserta platos en la tabla pivote `plato_lugar` -> Estado `Catálogo Activo`.
    *   Envío de reseña -> Estado `Reseña Pendiente` -> Admin aprueba -> Estado `Pública` (actualiza `promedio_rating` en el plato) / Admin rechaza -> Estado `Oculta`.
```

### FIN DEL PROMPT
