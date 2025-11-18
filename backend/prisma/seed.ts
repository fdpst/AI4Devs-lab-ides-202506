import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de base de datos...');

  // Verificar si ya existe un usuario admin
  const existingAdmin = await prisma.user.findFirst({
    where: {
      email: 'admin@lti.com'
    }
  });

  if (existingAdmin) {
    console.log('✅ El usuario admin ya existe. Saltando creación...');
    return;
  }

  // Crear usuario administrador inicial
  const adminPassword = 'Admin123!'; // Contraseña inicial
  const hashedPassword = await hashPassword(adminPassword);

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
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

