# Instrucciones de Configuración - Sistema de Autenticación

## 📋 Resumen de Cambios

Se ha implementado un sistema completo de autenticación y autorización que protege todos los datos de candidatos. Solo usuarios autenticados pueden acceder a los datos, y solo los administradores pueden gestionar usuarios.

## 🚀 Pasos para Configurar

### 1. Actualizar Variables de Entorno

El archivo `.env` ha sido actualizado con `JWT_SECRET`. Si necesitas regenerarlo, asegúrate de incluir:

```env
JWT_SECRET="tu-clave-secreta-muy-segura"
JWT_EXPIRES_IN="24h"
```

### 2. Regenerar Cliente de Prisma

Después de las migraciones, regenera el cliente de Prisma:

```bash
cd backend
npx prisma generate
```

Si hay errores de permisos, cierra cualquier proceso que esté usando Prisma (servidor en ejecución) e inténtalo de nuevo.

### 3. Ejecutar Seed para Crear Usuario Inicial

```bash
cd backend
npm run prisma:seed
```

O:

```bash
npx prisma db seed
```

Esto creará el usuario administrador inicial.

### 4. Iniciar el Servidor

```bash
cd backend
npm run dev
```

## 👤 Credenciales del Usuario Inicial

Después de ejecutar el seed, puedes iniciar sesión con:

- **Email:** `admin@lti.com`
- **Contraseña:** `Admin123!`
- **Rol:** `admin`

⚠️ **IMPORTANTE:** Cambia esta contraseña después del primer inicio de sesión usando el endpoint de actualización de usuarios.

## 🔐 Endpoints Disponibles

### Públicos (No requieren autenticación)
- `POST /api/auth/login` - Iniciar sesión

### Protegidos (Requieren autenticación)
- `GET /api/auth/me` - Información del usuario actual
- `GET /api/candidates` - Listar candidatos
- `GET /api/candidates/:id` - Obtener candidato
- `POST /api/candidates` - Crear candidato
- `PUT /api/candidates/:id` - Actualizar candidato
- `DELETE /api/candidates/:id` - Eliminar candidato

### Solo Administrador (Requieren autenticación + rol admin)
- `POST /api/auth/register` - Crear nuevo usuario
- `GET /api/users` - Listar usuarios
- `GET /api/users/:id` - Obtener usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

## 📝 Ejemplo de Uso

### 1. Iniciar Sesión

```bash
curl -X POST http://localhost:3010/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@lti.com",
    "password": "Admin123!"
  }'
```

Respuesta:
```json
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

### 2. Usar el Token

```bash
# Obtener candidatos
curl -X GET http://localhost:3010/api/candidates \
  -H "Authorization: Bearer {tu-token-aqui}"

# Crear nuevo usuario (solo admin)
curl -X POST http://localhost:3010/api/auth/register \
  -H "Authorization: Bearer {tu-token-aqui}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "reclutador@lti.com",
    "password": "Password123!",
    "name": "Juan Pérez",
    "role": "recruiter"
  }'
```

## 🔒 Seguridad Implementada

1. ✅ Autenticación JWT
2. ✅ Hash de contraseñas con bcrypt
3. ✅ Validación de fortaleza de contraseñas
4. ✅ Protección de rutas con middleware
5. ✅ Control de acceso basado en roles
6. ✅ Validación de datos de entrada
7. ✅ Manejo seguro de errores
8. ✅ Tokens con expiración

## 📚 Documentación Adicional

- Ver `SECURITY_DOCUMENTATION.md` para detalles completos de seguridad
- Ver `API_DOCUMENTATION.md` para documentación de la API

## ⚠️ Notas Importantes

1. **JWT_SECRET**: En producción, genera una clave fuerte y única
2. **Contraseña inicial**: Cambia la contraseña del admin después del primer login
3. **HTTPS**: En producción, siempre usa HTTPS
4. **Usuarios inactivos**: Los usuarios con `isActive: false` no pueden iniciar sesión

## 🐛 Solución de Problemas

### Error: "Property 'candidate' does not exist"
**Solución:** Ejecuta `npx prisma generate` en el directorio backend

### Error: "Token inválido o expirado"
**Solución:** El token ha expirado (24h por defecto). Inicia sesión nuevamente

### Error: "Acceso denegado. Se requieren permisos de administrador"
**Solución:** Solo usuarios con rol `admin` pueden acceder a esa ruta

### Error al ejecutar seed
**Solución:** Asegúrate de que la base de datos esté corriendo (`docker-compose up -d`)

