import prisma from '../src/utils/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Iniciando seed de base de datos...');

  // Asegurar roles básicos (Nombres exactos de Laravel)
  const roles = ['Admin', 'Juez', 'Participante'];
  for (const nombre of roles) {
    const r = await prisma.roles.findFirst({ where: { nombre } });
    if (!r) {
      await prisma.roles.create({ data: { nombre, created_at: new Date(), updated_at: new Date() } });
    }
  }

  // Asegurar perfiles básicos (Nombres exactos de Laravel)
  const nombresPerfiles = ['Programador', 'Diseñador', 'Líder de Proyecto', 'Tester'];
  for (let i = 0; i < nombresPerfiles.length; i++) {
    const id = BigInt(i + 1);
    const p = await prisma.perfiles.findUnique({ where: { id }});
    if (!p) {
      await prisma.perfiles.create({ data: { id, nombre: nombresPerfiles[i], created_at: new Date(), updated_at: new Date() }});
    }
  }

  // Crear o verificar usuario administrador (Credenciales exactas de Laravel)
  const adminEmail = 'admin@test.com';
  let admin = await prisma.users.findFirst({ where: { email: adminEmail } });

  if (!admin) {
    admin = await prisma.users.create({
      data: {
        name: 'Admin User',
        email: adminEmail,
        password: await bcrypt.hash('password', 10),
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    const roleAdmin = await prisma.roles.findFirst({ where: { nombre: 'Admin' } });
    if (roleAdmin) {
      await prisma.user_rol.create({
        data: {
          user_id: admin.id,
          rol_id: roleAdmin.id
        }
      });
    }

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
