import prisma from '../src/utils/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Iniciando seed de base de datos...');

  // Crear o verificar usuario administrador
  const adminEmail = 'admin@test.com';
  let admin = await prisma.users.findFirst({ where: { email: adminEmail } });

  if (!admin) {
    admin = await prisma.users.create({
      data: {
        name: 'Admin User',
        email: adminEmail,
        password: await bcrypt.hash('password', 10),
        role: 'ADMIN',
        updated_at: new Date()
      }
    });

    console.log('Usuario administrador creado: admin@test.com / password');
  } else {
    console.log('El administrador ya existe.');
  }

  console.log('Seed ejecutado correctamente.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
