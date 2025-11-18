const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Creando usuario administrador...');

  // Verificar si ya existe un usuario admin
  const existingAdmin = await prisma.user.findFirst({
    where: {
      email: 'admin@lti.com'
    }
  });

  if (existingAdmin) {
    console.log('✅ El usuario admin ya existe.');
    console.log('📧 Email: admin@lti.com');
    console.log('⚠️  Si olvidaste la contraseña, elimina el usuario y vuelve a ejecutar este script.');
    return;
  }

  // Crear usuario administrador inicial
  const adminPassword = 'Admin123!';
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@lti.com',
      name: 'Administrador',
      password: hashedPassword,
      role: 'admin',
      isActive: true
    }
  });

  console.log('✅ Usuario administrador creado exitosamente!');
  console.log('📧 Email: admin@lti.com');
  console.log('🔑 Contraseña: Admin123!');
  console.log('⚠️  IMPORTANTE: Cambia esta contraseña después del primer inicio de sesión');
  console.log('');
  console.log('Usuario creado:', {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role
  });
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

