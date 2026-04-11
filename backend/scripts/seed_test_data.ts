import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- INICIANDO RESET Y SEEDING DE DATOS (CARRERAS REALES + EQUIPOS 5) ---');

  // 1. LIMPIEZA TOTAL
  console.log('Limpiando tablas...');
  await prisma.evaluaciones.deleteMany({});
  await prisma.proyecto_avances.deleteMany({});
  await prisma.certificados.deleteMany({});
  await prisma.equipo_interacciones.deleteMany({});
  await prisma.equipo_miembros.deleteMany({});
  await prisma.proyectos.deleteMany({});
  await prisma.evento_jueces.deleteMany({});
  await prisma.evaluacion_criterios.deleteMany({});
  await prisma.eventos.deleteMany({});
  await prisma.equipos.deleteMany({});

  await prisma.users.deleteMany({
    where: { role: { not: 'ADMIN' } }
  });

  const passwordHashed = await bcrypt.hash('password', 12);

  // LISTA OFICIAL DE CARRERAS
  const carrerasOficiales = [
    'Ingeniería en Sistemas Computacionales',
    'Ingeniería Mecánica',
    'Ingeniería Eléctrica',
    'Ingeniería Electrónica',
    'Ingeniería Química',
    'Ingeniería Industrial',
    'Ingeniería Civil',
    'Ingeniería en Gestión Empresarial',
    'Licenciatura en Administración',
    'Contador Público'
  ];

  // 2. CREAR JUECES
  console.log('Creando jueces...');
  const judges = [];
  for (let i = 1; i <= 10; i++) {
    const judge = await prisma.users.create({
      data: {
        name: `Juez ${i}`,
        email: `juez${i}@prueba.com`,
        password: passwordHashed,
        role: 'JUEZ',
        updated_at: new Date()
      }
    });
    judges.push(judge);
  }

  // 3. CREAR 3 EQUIPOS CON 5 INTEGRANTES CADA UNO
  console.log('Creando 3 equipos de 5 integrantes...');
  const equiposNombres = ['Alfas', 'Betas', 'Gammas'];
  const createdEquipos = [];

  let carreraIndex = 0;
  for (let i = 0; i < equiposNombres.length; i++) {
    const team = await prisma.equipos.create({
      data: { nombre: equiposNombres[i], updated_at: new Date() }
    });
    createdEquipos.push(team);

    for (let j = 1; j <= 5; j++) {
      const name = `${equiposNombres[i]} Participante ${j}`;
      const email = `${equiposNombres[i].toLowerCase()}${j}@prueba.com`;
      
      // Rotar carreras oficiales
      const carrera = carrerasOficiales[carreraIndex % carrerasOficiales.length];
      carreraIndex++;

      const participant = await prisma.users.create({
        data: {
          name,
          email,
          password: passwordHashed,
          role: 'PARTICIPANTE',
          carrera: carrera,
          no_control: `22000${i + 1}${j}`,
          telefono: `555${i + 1}00${j}`,
          updated_at: new Date()
        }
      });

      await prisma.equipo_miembros.create({
        data: {
          equipo_id: team.id,
          user_id: participant.id,
          rol: j === 1 ? 'LIDER' : 'PROGRAMADOR'
        }
      });
    }
  }

  // 4. CREAR 3 EVENTOS
  console.log('Creando eventos...');
  const now = new Date();
  
  const event1 = await prisma.eventos.create({
    data: {
      nombre: 'Hackathon Finalizado 2023',
      descripcion: 'Resultados históricos.',
      fecha_inicio: new Date(now.getFullYear() - 1, 0, 1),
      fecha_fin: new Date(now.getFullYear() - 1, 0, 3),
      max_jueces: 5,
      updated_at: new Date()
    }
  });

  const event2 = await prisma.eventos.create({
    data: {
      nombre: 'Hackathon Regional Active 2026',
      descripcion: 'Evento en curso.',
      fecha_inicio: new Date(now.getTime() - (24 * 60 * 60 * 1000)),
      fecha_fin: new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000)),
      max_jueces: 5,
      updated_at: new Date()
    }
  });

  const event3 = await prisma.eventos.create({
    data: {
      nombre: 'Reto Futuro 2026',
      descripcion: 'Próximamente.',
      fecha_inicio: new Date(now.getTime() + (2 * 24 * 60 * 60 * 1000)),
      fecha_fin: new Date(now.getTime() + (5 * 24 * 60 * 60 * 1000)),
      max_jueces: 5,
      updated_at: new Date()
    }
  });

  // 5. CONFIGURAR RÚBRICAS Y JUECES
  const criteriosData = [
    { nombre: 'Funcionalidad', ponderacion: 40 },
    { nombre: 'Innovación', ponderacion: 30 },
    { nombre: 'Diseño UX/UI', ponderacion: 30 }
  ];

  for (const ev of [event1, event2, event3]) {
    for (const crit of criteriosData) {
      await prisma.evaluacion_criterios.create({
        data: { evento_id: ev.id, nombre: crit.nombre, ponderacion: crit.ponderacion }
      });
    }
    for (let i = 0; i < 5; i++) {
        await prisma.evento_jueces.create({
            data: { evento_id: ev.id, user_id: judges[i].id }
        });
    }
    for (const eq of createdEquipos) {
      const proyecto = await prisma.proyectos.create({
        data: {
          nombre: `Proyecto ${eq.nombre} - ${ev.nombre.substring(0, 5)}`,
          descripcion: 'Propuesta técnica completa.',
          equipo_id: eq.id,
          evento_id: ev.id,
          updated_at: new Date()
        }
      });
      if (ev.id === event1.id) {
          const criterios = await prisma.evaluacion_criterios.findMany({ where: { evento_id: ev.id } });
          for (let i = 0; i < 5; i++) {
              for (const crit of criterios) {
                  const nota = Math.floor(Math.random() * (10 - 8 + 1) + 8);
                  await prisma.evaluaciones.create({
                      data: {
                          proyecto_id: proyecto.id,
                          juez_id: judges[i].id,
                          criterio_id: crit.id,
                          puntuacion: nota,
                          comentario: 'Excelente trabajo.'
                      }
                  });
              }
          }
      }
    }
  }

  console.log('--- SEEDING COMPLETADO CON CARRERAS OFICIALES ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
