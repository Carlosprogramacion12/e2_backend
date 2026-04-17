import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  await prisma.proyectos.deleteMany()
  await prisma.equipos.deleteMany()
  await prisma.eventos.deleteMany()
  await prisma.carreras.deleteMany()
  await prisma.perfiles.deleteMany()
  await prisma.users.deleteMany()

  // ─── CARRERAS (Las 10 predeterminadas) ───
  const carrerasData = [
    { nombre: 'Ingeniería en Sistemas Computacionales', clave: 'ISC' },
    { nombre: 'Ingeniería Industrial', clave: 'II' },
    { nombre: 'Ingeniería Electrónica', clave: 'IE' },
    { nombre: 'Ingeniería Mecánica', clave: 'IM' },
    { nombre: 'Ingeniería Mecatrónica', clave: 'IMT' },
    { nombre: 'Ingeniería Eléctrica', clave: 'IEL' },
    { nombre: 'Ingeniería Civil', clave: 'IC' },
    { nombre: 'Ingeniería en Gestión Empresarial', clave: 'IGE' },
    { nombre: 'Contador Público', clave: 'CP' },
    { nombre: 'Licenciatura en Administración', clave: 'LA' },
  ]
  await prisma.carreras.createMany({ data: carrerasData })
  console.log(`✅ ${carrerasData.length} carreras creadas`)

  // ─── PERFILES (Roles para equipos) ───
  const perfilesData = [
    { nombre: 'Programador Backend' },
    { nombre: 'Programador Frontend' },
    { nombre: 'Diseñador UI/UX' },
    { nombre: 'Tester / QA' },
    { nombre: 'Líder de Proyecto' },
    { nombre: 'Analista de Datos' },
  ]
  await prisma.perfiles.createMany({ data: perfilesData })
  console.log(`✅ ${perfilesData.length} perfiles creados`)

  // ─── EVENTOS (3 Eventos) ───
  const now = new Date()
  
  const eventoFinalizado = await prisma.eventos.create({
    data: {
      nombre: 'Evento Finalizado 2025',
      descripcion: 'Este evento ya terminó.',
      fecha_inicio: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate() - 5),
      fecha_fin: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate() - 3),
      max_jueces: 5,
      updated_at: new Date()
    }
  })

  const eventoActivo = await prisma.eventos.create({
    data: {
      nombre: 'Evento Activo Actual',
      descripcion: 'Este evento está en curso.',
      fecha_inicio: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Ayer
      fecha_fin: new Date(now.getTime() + 24 * 60 * 60 * 1000),   // Mañana
      max_jueces: 5,
      updated_at: new Date()
    }
  })

  const eventoProximo = await prisma.eventos.create({
    data: {
      nombre: 'Evento Próximo',
      descripcion: 'Este evento aún no empieza.',
      fecha_inicio: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // En 5 días
      fecha_fin: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),   // En 7 días
      max_jueces: 5,
      updated_at: new Date()
    }
  })
  
  const eventos = [eventoFinalizado, eventoActivo, eventoProximo]
  console.log(`✅ 3 eventos creados (Uno Finalizado, Uno Activo, Uno Próximo)`)

  // ─── USUARIOS (Admin, Jueces, Participantes con `password`) ───
  const bcrypt = require('bcryptjs')
  const hashedPass = await bcrypt.hash('password', 10)

  // Admin
  await prisma.users.create({
    data: {
      name: 'Administrador Principal',
      email: 'admin@test.com',
      password: hashedPass,
      role: 'ADMIN',
      updated_at: new Date()
    }
  })
  console.log('✅ Administrador maestro creado (admin@test.com / password)')

  // 10 Jueces
  const juecesData = []
  for (let i = 1; i <= 10; i++) {
    juecesData.push({
      name: `Juez Número ${i}`,
      email: `juez${i}@test.com`,
      password: hashedPass,
      role: 'JUEZ',
      updated_at: new Date()
    })
  }
  await prisma.users.createMany({ data: juecesData })
  const jueces = await prisma.users.findMany({ where: { role: 'JUEZ' } })
  console.log(`✅ 10 jueces creados (password)`)

  // Asignar jueces y rúbricas a los eventos Activo y Finalizado
  for (const evento of [eventoFinalizado, eventoActivo]) {
    // 5 jueces por evento
    for (let i = 0; i < 5; i++) {
      await prisma.evento_jueces.create({
        data: { evento_id: evento.id, user_id: jueces[i].id }
      })
    }
    // Criterios
    await prisma.evaluacion_criterios.createMany({
      data: [
        { evento_id: evento.id, nombre: 'Innovación', ponderacion: 30 },
        { evento_id: evento.id, nombre: 'Implementación', ponderacion: 40 },
        { evento_id: evento.id, nombre: 'Presentación', ponderacion: 30 },
      ]
    })
  }
  console.log('✅ Jueces y Rúbricas (Criterios) asignados a Evento Finalizado y Evento Activo')

  // 15 Participantes
  const participantesData = []
  for (let i = 1; i <= 15; i++) {
    participantesData.push({
      name: `Participante Número ${i}`,
      email: `participante${i}@test.com`,
      password: hashedPass,
      carrera: 'Ingeniería en Sistemas Computacionales',
      no_control: `20260${i.toString().padStart(2, '0')}`,
      role: 'PARTICIPANTE',
      updated_at: new Date()
    })
  }
  await prisma.users.createMany({ data: participantesData })
  const participantes = await prisma.users.findMany({ where: { role: 'PARTICIPANTE' } })
  console.log(`✅ 15 participantes creados (password)`)

  // ─── EQUIPOS (3 Equipos con 5 participantes cada uno) ───
  const roles = ['LIDER', 'PROGRAMADOR', 'PROGRAMADOR', 'DISENADOR', 'TESTER']
  
  let teamCounter = 1;

  for (let e = 0; e < 3; e++) {
    // Para cada evento, los 15 participantes se organizan en 3 equipos nuevos
    for (let t = 0; t < 3; t++) {
      const equipo = await prisma.equipos.create({
        data: {
          nombre: `Equipo ${teamCounter} (${eventos[e].nombre})`,
          max_programadores: 2,
          max_disenadores: 1,
          max_testers: 1,
          updated_at: new Date()
        }
      })
      teamCounter++;

      // 5 miembros por equipo
      for (let m = 0; m < 5; m++) {
        await prisma.equipo_miembros.create({
          data: {
            equipo_id: equipo.id,
            user_id: participantes[t * 5 + m].id,
            rol: roles[m],
            created_at: new Date()
          }
        })
      }

      // El equipo se inscribe ÚNICAMENTE a su evento correspondiente
      const proyecto = await prisma.proyectos.create({
        data: {
          equipo_id: equipo.id,
          evento_id: eventos[e].id,
          nombre: `Proyecto ${equipo.nombre}`,
          descripcion: `Esta es la solución propuesta por el ${equipo.nombre}.`,
          repositorio_url: 'https://github.com/ejemplo',
          updated_at: new Date()
        }
      })

      // Evaluaciones automáticas si el evento está activo o finalizado
      if (e === 0 || e === 1) { // 0 = Finalizado, 1 = Activo
        const criteriosEventos = await prisma.evaluacion_criterios.findMany({ where: { evento_id: eventos[e].id } })
        const eventoJueces = await prisma.evento_jueces.findMany({ where: { evento_id: eventos[e].id } })
        
        for (const juez of eventoJueces) {
          for (const criterio of criteriosEventos) {
            await prisma.evaluaciones.create({
              data: {
                proyecto_id: proyecto.id,
                juez_id: juez.user_id,
                criterio_id: criterio.id,
                puntuacion: Math.floor(Math.random() * (100 - 70 + 1)) + 70, // 70 a 100
                comentario: 'Buen trabajo en equipo.',
                created_at: new Date()
              }
            })
          }
        }
      }
    }
  }
  
  console.log(`✅ 9 Equipos independientes creados (3 por cada evento), simulando con éxito un ciclo real.`)

  console.log('\n🎉 Seed completado exitosamente de acuerdo a tus peticiones perfectas!')
}

main()
  .catch(e => { console.error('🚫 Error:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
