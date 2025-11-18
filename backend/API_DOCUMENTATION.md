# Documentación de la API - CRUD de Candidatos

## Base URL
```
http://localhost:3010
```

## Endpoints

### 1. Obtener todos los candidatos
**GET** `/api/candidates`

**Respuesta exitosa (200):**
```json
[
  {
    "id": 1,
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan@example.com",
    "phone": "+1234567890",
    "address": "Calle Principal 123",
    "education": "Ingeniería en Sistemas",
    "experience": "5 años como desarrollador",
    "cvPath": "/path/to/cv.pdf",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

---

### 2. Obtener un candidato por ID
**GET** `/api/candidates/:id`

**Parámetros:**
- `id` (path): ID del candidato (número entero)

**Respuesta exitosa (200):**
```json
{
  "id": 1,
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan@example.com",
  "phone": "+1234567890",
  "address": "Calle Principal 123",
  "education": "Ingeniería en Sistemas",
  "experience": "5 años como desarrollador",
  "cvPath": "/path/to/cv.pdf",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Errores:**
- `400`: ID inválido
- `404`: Candidato no encontrado
- `500`: Error del servidor

---

### 3. Crear un nuevo candidato
**POST** `/api/candidates`

**Content-Type:** `multipart/form-data`

**Campos del formulario:**
- `firstName` (string, requerido): Nombre del candidato
- `lastName` (string, requerido): Apellido del candidato
- `email` (string, requerido): Correo electrónico (debe ser único)
- `phone` (string, opcional): Teléfono
- `address` (string, opcional): Dirección
- `education` (string, opcional): Educación
- `experience` (string, opcional): Experiencia laboral
- `cv` (file, opcional): Archivo CV (PDF, DOC, DOCX, máximo 10MB)

**Ejemplo de uso con curl:**
```bash
curl -X POST http://localhost:3010/api/candidates \
  -F "firstName=Juan" \
  -F "lastName=Pérez" \
  -F "email=juan@example.com" \
  -F "phone=+1234567890" \
  -F "address=Calle Principal 123" \
  -F "education=Ingeniería en Sistemas" \
  -F "experience=5 años como desarrollador" \
  -F "cv=@/path/to/cv.pdf"
```

**Respuesta exitosa (201):**
```json
{
  "message": "Candidato añadido exitosamente",
  "candidate": {
    "id": 1,
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan@example.com",
    "phone": "+1234567890",
    "address": "Calle Principal 123",
    "education": "Ingeniería en Sistemas",
    "experience": "5 años como desarrollador",
    "cvPath": "/path/to/cv.pdf",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Errores:**
- `400`: Datos inválidos o email duplicado
- `500`: Error del servidor

---

### 4. Actualizar un candidato
**PUT** `/api/candidates/:id`

**Content-Type:** `multipart/form-data`

**Parámetros:**
- `id` (path): ID del candidato (número entero)

**Campos del formulario:**
- `firstName` (string, requerido): Nombre del candidato
- `lastName` (string, requerido): Apellido del candidato
- `email` (string, requerido): Correo electrónico (debe ser único si cambia)
- `phone` (string, opcional): Teléfono
- `address` (string, opcional): Dirección
- `education` (string, opcional): Educación
- `experience` (string, opcional): Experiencia laboral
- `cv` (file, opcional): Nuevo archivo CV (si se envía, reemplaza el anterior)

**Nota:** Si se envía un nuevo CV, el CV anterior se elimina automáticamente.

**Ejemplo de uso con curl:**
```bash
curl -X PUT http://localhost:3010/api/candidates/1 \
  -F "firstName=Juan Carlos" \
  -F "lastName=Pérez" \
  -F "email=juan@example.com" \
  -F "phone=+1234567890" \
  -F "cv=@/path/to/new-cv.pdf"
```

**Respuesta exitosa (200):**
```json
{
  "message": "Candidato actualizado exitosamente",
  "candidate": {
    "id": 1,
    "firstName": "Juan Carlos",
    "lastName": "Pérez",
    "email": "juan@example.com",
    "phone": "+1234567890",
    "address": "Calle Principal 123",
    "education": "Ingeniería en Sistemas",
    "experience": "5 años como desarrollador",
    "cvPath": "/path/to/new-cv.pdf",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

**Errores:**
- `400`: ID inválido, datos inválidos o email duplicado
- `404`: Candidato no encontrado
- `500`: Error del servidor

---

### 5. Eliminar un candidato
**DELETE** `/api/candidates/:id`

**Parámetros:**
- `id` (path): ID del candidato (número entero)

**Ejemplo de uso con curl:**
```bash
curl -X DELETE http://localhost:3010/api/candidates/1
```

**Respuesta exitosa (200):**
```json
{
  "message": "Candidato eliminado exitosamente"
}
```

**Nota:** Si el candidato tiene un CV asociado, el archivo se elimina automáticamente del servidor.

**Errores:**
- `400`: ID inválido
- `404`: Candidato no encontrado
- `500`: Error del servidor

---

## Validaciones

### Campos obligatorios:
- `firstName`: No puede estar vacío
- `lastName`: No puede estar vacío
- `email`: 
  - No puede estar vacío
  - Debe tener formato de email válido
  - Debe ser único en la base de datos

### Campos opcionales:
- `phone`: Si se proporciona, debe tener formato válido
- `address`: Texto libre
- `education`: Texto libre
- `experience`: Texto libre
- `cv`: 
  - Formatos permitidos: PDF, DOC, DOCX
  - Tamaño máximo: 10MB

---

## Códigos de Estado HTTP

- `200`: Operación exitosa
- `201`: Recurso creado exitosamente
- `400`: Solicitud inválida (validación fallida, datos incorrectos)
- `404`: Recurso no encontrado
- `500`: Error interno del servidor

---

## Manejo de Archivos CV

- Los archivos CV se almacenan en el directorio `backend/uploads/`
- Los nombres de archivo se generan automáticamente con formato: `cv-{timestamp}-{random}.{ext}`
- Al actualizar un candidato con un nuevo CV, el CV anterior se elimina automáticamente
- Al eliminar un candidato, su CV también se elimina del servidor
- Si ocurre un error durante la creación o actualización, cualquier archivo subido se elimina automáticamente

---

## Ejemplos de Uso

### JavaScript/Fetch
```javascript
// Crear candidato
const formData = new FormData();
formData.append('firstName', 'Juan');
formData.append('lastName', 'Pérez');
formData.append('email', 'juan@example.com');
formData.append('cv', fileInput.files[0]);

const response = await fetch('http://localhost:3010/api/candidates', {
  method: 'POST',
  body: formData
});

const data = await response.json();
```

### Actualizar candidato
```javascript
const formData = new FormData();
formData.append('firstName', 'Juan Carlos');
formData.append('lastName', 'Pérez');
formData.append('email', 'juan@example.com');

const response = await fetch('http://localhost:3010/api/candidates/1', {
  method: 'PUT',
  body: formData
});
```

### Eliminar candidato
```javascript
const response = await fetch('http://localhost:3010/api/candidates/1', {
  method: 'DELETE'
});
```

