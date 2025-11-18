const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function testLogin() {
  console.log('🔍 Verificando usuario y contraseña...\n');

  try {
    // Buscar usuario
    const user = await prisma.user.findFirst({
      where: {
        email: 'admin@lti.com'
      }
    });

    if (!user) {
      console.log('❌ Usuario no encontrado');
      console.log('💡 Ejecuta: node scripts/create-admin.js');
      return;
    }

    console.log('✅ Usuario encontrado:');
    console.log('   ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Nombre:', user.name);
    console.log('   Rol:', user.role);
    console.log('   Activo:', user.isActive);
    console.log('');

    // Probar contraseña
    const testPassword = 'Admin123!';
    const isValid = await bcrypt.compare(testPassword, user.password);

    if (isValid) {
      console.log('✅ Contraseña correcta!');
      console.log('');
      console.log('📝 Credenciales para login:');
      console.log('   Email: admin@lti.com');
      console.log('   Contraseña: Admin123!');
    } else {
      console.log('❌ La contraseña no coincide');
      console.log('💡 Puede que el usuario se haya creado con otra contraseña');
      console.log('💡 Elimina el usuario y vuelve a ejecutar: node scripts/create-admin.js');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();

