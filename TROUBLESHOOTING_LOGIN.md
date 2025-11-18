# Solución de Problemas - Login

## ✅ Usuario Creado Correctamente

El usuario administrador ha sido creado exitosamente:
- **Email:** `admin@lti.com`
- **Contraseña:** `Admin123!`
- **Estado:** Activo y verificado

## 🔍 Pasos para Diagnosticar el Problema

### 1. Verificar que el Backend esté Corriendo

Abre una terminal y ejecuta:

```bash
cd backend
npm run dev
```

Deberías ver:
```
Server is running at http://localhost:3010
```

### 2. Verificar que el Backend Responda

Abre tu navegador o usa curl:

```bash
curl http://localhost:3010/
```

Deberías recibir una respuesta JSON.

### 3. Probar el Login Directamente

Prueba el endpoint de login directamente:

```bash
curl -X POST http://localhost:3010/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@lti.com\",\"password\":\"Admin123!\"}"
```

Si esto funciona, el problema está en el frontend. Si no funciona, el problema está en el backend.

### 4. Verificar la Consola del Navegador

1. Abre las herramientas de desarrollador (F12)
2. Ve a la pestaña "Console"
3. Intenta hacer login
4. Revisa si hay errores de CORS o de red

### 5. Verificar la Pestaña Network

1. Abre las herramientas de desarrollador (F12)
2. Ve a la pestaña "Network"
3. Intenta hacer login
4. Busca la petición a `/api/auth/login`
5. Revisa:
   - ¿Se está enviando la petición?
   - ¿Cuál es el código de respuesta?
   - ¿Cuál es el mensaje de error?

## 🛠️ Soluciones Comunes

### Error: "Network Error" o "Failed to fetch"

**Causa:** El backend no está corriendo o no es accesible.

**Solución:**
1. Asegúrate de que el backend esté corriendo en el puerto 3010
2. Verifica que no haya un firewall bloqueando la conexión
3. Verifica que la URL en el frontend sea correcta: `http://localhost:3010`

### Error: "CORS policy"

**Causa:** Problema de CORS entre frontend y backend.

**Solución:** El backend ya tiene CORS configurado. Si persiste el error:
1. Verifica que el backend esté usando `cors()` middleware
2. Reinicia el servidor backend

### Error: "Credenciales inválidas" pero el usuario existe

**Causa:** Posible problema con espacios o mayúsculas en el email.

**Solución:**
1. Asegúrate de escribir el email exactamente: `admin@lti.com`
2. Asegúrate de escribir la contraseña exactamente: `Admin123!` (con mayúscula A, minúsculas, números y el signo !)

### El Backend no Inicia

**Causa:** Posible problema con la base de datos o variables de entorno.

**Solución:**
1. Verifica que Docker esté corriendo: `docker-compose up -d`
2. Verifica que el archivo `.env` exista y tenga las variables correctas
3. Verifica que Prisma esté generado: `npx prisma generate`

## 📝 Verificación Rápida

Ejecuta estos comandos en orden:

```bash
# 1. Verificar Docker
docker-compose ps

# 2. Verificar usuario en BD
cd backend
node scripts/test-login.js

# 3. Iniciar backend
npm run dev

# 4. En otra terminal, probar login
curl -X POST http://localhost:3010/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@lti.com\",\"password\":\"Admin123!\"}"
```

Si todos estos pasos funcionan, el problema está en el frontend. Si alguno falla, ese es el problema a resolver.

## 🔄 Recrear Usuario (Si es Necesario)

Si necesitas recrear el usuario:

```bash
cd backend

# Eliminar usuario existente (si existe)
node -e "const {PrismaClient} = require('@prisma/client'); const prisma = new PrismaClient(); prisma.user.deleteMany({where: {email: 'admin@lti.com'}}).then(() => {console.log('Usuario eliminado'); prisma.\$disconnect();});"

# Crear usuario nuevamente
node scripts/create-admin.js
```

