# Documentación de Seguridad y Autenticación

## 🔐 Sistema de Autenticación

El sistema utiliza **JWT (JSON Web Tokens)** para la autenticación de usuarios. Todas las rutas de candidatos requieren autenticación, y las rutas de gestión de usuarios requieren además permisos de administrador.

## 👤 Usuario Inicial

Después de ejecutar el seed, se crea un usuario administrador con las siguientes credenciales:

- **Email:** `admin@lti.com`
- **Contraseña:** `Admin123!`
- **Rol:** `admin`

⚠️ **IMPORTANTE:** Cambia esta contraseña después del primer inicio de sesión.

## 🚀 Configuración Inicial

### 1. Variables de Entorno

Asegúrate de tener estas variables en tu archivo `.env`:

```env
DATABASE_URL="postgresql://LTIdbUser:D1ymf8wyQEGthFR1E9xhCq@localhost:5432/LTIdb?schema=public"
PORT=3010
JWT_SECRET="tu-clave-secreta-muy-segura-cambiar-en-produccion"
JWT_EXPIRES_IN="24h"
```

**⚠️ IMPORTANTE:** En producción, usa una clave JWT_SECRET fuerte y única. Puedes generarla con:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Ejecutar Seed

Para crear el usuario inicial, ejecuta:

```bash
cd backend
npm run prisma:seed
```

O usando Prisma directamente:

```bash
npx prisma db seed
```

## 📡 Endpoints de Autenticación

### POST /api/auth/login

Iniciar sesión y obtener token JWT.

**Request:**
```json
{
  "email": "admin@lti.com",
  "password": "Admin123!"
}
```

**Response (200):**
```json
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@lti.com",
    "name": "Administrador",
    "role": "admin",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Errores:**
- `400`: Email o contraseña faltantes
- `401`: Credenciales inválidas o usuario inactivo

### POST /api/auth/register

Registrar nuevo usuario (solo administradores).

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "email": "reclutador@lti.com",
  "password": "Password123!",
  "name": "Juan Pérez",
  "role": "recruiter"
}
```

**Response (201):**
```json
{
  "message": "Usuario creado exitosamente",
  "user": {
    "id": 2,
    "email": "reclutador@lti.com",
    "name": "Juan Pérez",
    "role": "recruiter",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### GET /api/auth/me

Obtener información del usuario actualmente autenticado.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "id": 1,
  "email": "admin@lti.com",
  "name": "Administrador",
  "role": "admin",
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

## 👥 Gestión de Usuarios (Solo Admin)

### GET /api/users

Obtener todos los usuarios.

**Headers:**
```
Authorization: Bearer {token}
```

### GET /api/users/:id

Obtener un usuario por ID.

### PUT /api/users/:id

Actualizar un usuario.

**Request:**
```json
{
  "email": "reclutador@lti.com",
  "name": "Juan Carlos Pérez",
  "role": "recruiter",
  "isActive": true,
  "password": "NuevaPassword123!" // Opcional
}
```

### DELETE /api/users/:id

Eliminar un usuario (no se puede eliminar el propio usuario).

## 🔒 Requisitos de Contraseña

Las contraseñas deben cumplir:
- Mínimo 8 caracteres
- Al menos una letra minúscula
- Al menos una letra mayúscula
- Al menos un número

## 🛡️ Protección de Rutas

### Rutas Protegidas (Requieren Autenticación)

Todas las rutas de candidatos requieren autenticación:
- `GET /api/candidates`
- `GET /api/candidates/:id`
- `POST /api/candidates`
- `PUT /api/candidates/:id`
- `DELETE /api/candidates/:id`

### Rutas de Solo Administrador

Las siguientes rutas requieren autenticación Y rol de administrador:
- `POST /api/auth/register`
- `GET /api/users`
- `GET /api/users/:id`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

## 📝 Uso del Token

Una vez obtenido el token, inclúyelo en todas las peticiones protegidas:

```javascript
fetch('http://localhost:3010/api/candidates', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

## 🔐 Roles

- **admin**: Acceso completo, puede gestionar usuarios y candidatos
- **recruiter**: Puede gestionar candidatos, no puede gestionar usuarios

## ⚠️ Consideraciones de Seguridad

1. **JWT_SECRET**: Usa una clave fuerte y única en producción
2. **HTTPS**: En producción, siempre usa HTTPS
3. **Expiración de tokens**: Los tokens expiran después de 24 horas (configurable)
4. **Contraseñas**: Nunca se almacenan en texto plano, siempre hasheadas con bcrypt
5. **Validación**: Todas las entradas son validadas antes de procesarse
6. **Usuarios inactivos**: Los usuarios inactivos no pueden iniciar sesión

## 🧪 Ejemplo de Uso Completo

```javascript
// 1. Login
const loginResponse = await fetch('http://localhost:3010/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@lti.com',
    password: 'Admin123!'
  })
});

const { token, user } = await loginResponse.json();

// 2. Obtener candidatos (requiere autenticación)
const candidatesResponse = await fetch('http://localhost:3010/api/candidates', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const candidates = await candidatesResponse.json();

// 3. Crear nuevo usuario (requiere admin)
const newUserResponse = await fetch('http://localhost:3010/api/auth/register', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'nuevo@lti.com',
    password: 'Password123!',
    name: 'Nuevo Usuario',
    role: 'recruiter'
  })
});
```

