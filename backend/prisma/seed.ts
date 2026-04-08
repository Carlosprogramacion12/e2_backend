import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  await prisma.proyectos.deleteMany()
  await prisma.equipos.deleteMany()
  await prisma.eventos.deleteMany()
  
  // ─── EVENTOS ───
  const eventos = await Promise.all([
    prisma.eventos.create({
      data: {
        nombre: 'Hackathon DELTOS 2026',
        descripcion: 'Competencia de desarrollo de software en equipos multidisciplinarios. Los participantes tendrán 48 horas para crear soluciones innovadoras.',
        fecha_inicio: new Date('2026-04-10T08:00:00'),
        fecha_fin: new Date('2026-04-12T20:00:00'),
        updated_at: new Date()
      }
    }),
    prisma.eventos.create({
      data: {
        nombre: 'Expo Tecnológica 2026',
        descripcion: 'Exhibición de proyectos tecnológicos desarrollados durante el semestre. Abierto al público general y evaluado por jueces externos.',
        fecha_inicio: new Date('2026-05-15T09:00:00'),
        fecha_fin: new Date('2026-05-17T18:00:00'),
        updated_at: new Date()
      }
    }),
    prisma.eventos.create({
      data: {
        nombre: 'Rally de Innovación 2026',
        descripcion: 'Competencia internacional de innovación donde equipos resuelven retos reales de la industria en 28 horas continuas.',
        fecha_inicio: new Date('2026-06-20T07:00:00'),
        fecha_fin: new Date('2026-06-21T11:00:00'),
        updated_at: new Date()
      }
    }),
    prisma.eventos.create({
      data: {
        nombre: 'Feria de Ciencias TecNM',
        descripcion: 'Presentación de proyectos de investigación y desarrollo tecnológico del Tecnológico Nacional de México.',
        fecha_inicio: new Date('2026-03-01T10:00:00'),
        fecha_fin: new Date('2026-03-03T17:00:00'),
        updated_at: new Date()
      }
    }),
    prisma.eventos.create({
      data: {
        nombre: 'Code Jam Primavera',
        descripcion: 'Competencia de programación competitiva con problemas de algoritmia y estructura de datos.',
        fecha_inicio: new Date('2026-04-01T14:00:00'),
        fecha_fin: new Date('2026-04-06T23:59:00'),
        updated_at: new Date()
      }
    }),
    prisma.eventos.create({
      data: {
        nombre: 'Feria de Emprendimiento 2026',
        descripcion: 'Exposición de proyectos de emprendimiento tecnológico para búsqueda de inversión.',
        fecha_inicio: new Date('2026-08-10T09:00:00'),
        fecha_fin: new Date('2026-08-11T16:00:00'),
        updated_at: new Date()
      }
    }),
    prisma.eventos.create({
      data: {
        nombre: 'Torneo de Robótica Educativa',
        descripcion: 'Competencia nacional de robots resuelve laberintos y seguidores de línea.',
        fecha_inicio: new Date('2026-09-05T08:00:00'),
        fecha_fin: new Date('2026-09-07T18:00:00'),
        updated_at: new Date()
      }
    }),
    prisma.eventos.create({
      data: {
        nombre: 'Simposio de Inteligencia Artificial',
        descripcion: 'Ciclo de conferencias y presentación de proyectos sobre aprendizaje profundo y redes neuronales.',
        fecha_inicio: new Date('2026-10-12T10:00:00'),
        fecha_fin: new Date('2026-10-14T17:00:00'),
        updated_at: new Date()
      }
    }),
    prisma.eventos.create({
      data: {
        nombre: 'Hackathon Ambiental GreenCode',
        descripcion: 'Desarrollo de software enfocado a la mejora y el cuidado del medio ambiente local.',
        fecha_inicio: new Date('2026-11-20T08:00:00'),
        fecha_fin: new Date('2026-11-22T20:00:00'),
        updated_at: new Date()
      }
    }),
    prisma.eventos.create({
      data: {
        nombre: 'Concurso de Ciberseguridad Defcon-T',
        descripcion: 'Retos de captura la bandera (CTF) y auditorías de seguridad web en tiempo real.',
        fecha_inicio: new Date('2026-12-01T09:00:00'),
        fecha_fin: new Date('2026-12-02T19:00:00'),
        updated_at: new Date()
      }
    }),
    prisma.eventos.create({
      data: {
        nombre: 'Expo Videojuegos 2027',
        descripcion: 'Competencia universitaria de desarrollo de motores gráficos y videojuegos indie.',
        fecha_inicio: new Date('2027-01-15T10:00:00'),
        fecha_fin: new Date('2027-01-17T18:00:00'),
        updated_at: new Date()
      }
    }),
    prisma.eventos.create({
      data: {
        nombre: 'Cumbre de Realidad Virtual Tec',
        descripcion: 'Presentación de experiencias y mundos virtuales creados por estudiantes de últimos semestres.',
        fecha_inicio: new Date('2027-02-20T08:00:00'),
        fecha_fin: new Date('2027-02-21T18:00:00'),
        updated_at: new Date()
      }
    }),
  ])

  console.log(`✅ ${eventos.length} eventos creados`)

  // ─── EQUIPOS ───
  const equipos = await Promise.all([
    prisma.equipos.create({
      data: {
        nombre: 'CodeBreakers',
        max_programadores: 2,
        max_disenadores: 1,
        max_testers: 1,
        updated_at: new Date()
      }
    }),
    prisma.equipos.create({
      data: {
        nombre: 'ByteForce',
        max_programadores: 2,
        max_disenadores: 1,
        max_testers: 1,
        updated_at: new Date()
      }
    }),
    prisma.equipos.create({
      data: {
        nombre: 'NexGen Devs',
        max_programadores: 2,
        max_disenadores: 1,
        max_testers: 1,
        updated_at: new Date()
      }
    }),
    prisma.equipos.create({
      data: {
        nombre: 'TechWizards',
        max_programadores: 2,
        max_disenadores: 1,
        max_testers: 1,
        updated_at: new Date()
      }
    }),
    prisma.equipos.create({
      data: {
        nombre: 'InnovaTech',
        max_programadores: 3,
        max_disenadores: 1,
        max_testers: 1,
        updated_at: new Date()
      }
    }),
    prisma.equipos.create({
      data: {
        nombre: 'Alpha Dynamics',
        max_programadores: 2,
        max_disenadores: 2,
        max_testers: 1,
        updated_at: new Date()
      }
    }),
    prisma.equipos.create({
      data: {
        nombre: 'Cyber Punks',
        max_programadores: 3,
        max_disenadores: 0,
        max_testers: 2,
        updated_at: new Date()
      }
    }),
    prisma.equipos.create({
      data: {
        nombre: 'Quantum Coders',
        max_programadores: 2,
        max_disenadores: 1,
        max_testers: 1,
        updated_at: new Date()
      }
    }),
    prisma.equipos.create({
      data: {
        nombre: 'Data Miners',
        max_programadores: 2,
        max_disenadores: 1,
        max_testers: 0,
        updated_at: new Date()
      }
    }),
    prisma.equipos.create({
      data: {
        nombre: 'Cloud Surfers',
        max_programadores: 2,
        max_disenadores: 1,
        max_testers: 1,
        updated_at: new Date()
      }
    }),
    prisma.equipos.create({
      data: {
        nombre: 'Pixel Perfect',
        max_programadores: 1,
        max_disenadores: 3,
        max_testers: 1,
        updated_at: new Date()
      }
    }),
    prisma.equipos.create({
      data: {
        nombre: 'Bug Smashers',
        max_programadores: 1,
        max_disenadores: 0,
        max_testers: 4,
        updated_at: new Date()
      }
    }),
  ])

  console.log(`✅ ${equipos.length} equipos creados`)

  // ─── PROYECTOS ───
  // Generaremos 4 proyectos programáticamente para cada evento usando diferentes equipos
  const proyectosData = []
  
  const nombresBase = [
    'EcoTrack IoT', 'MediConnect AI', 'SmartPark', 'LearnPath ML', 'AgroVision', 'TaskFlow',
    'WaterGuard', 'CyberShield', 'AlphaTrader', 'Neon City VR', 'Q-Sim Quant', 'GeoPredict',
    'BioAnalyzer', 'AutoDrive', 'FinTech Hub', 'BlockChain ID'
  ]

  for (let eIdx = 0; eIdx < eventos.length; eIdx++) {
    const evento = eventos[eIdx]
    
    // Elegimos 4 equipos distintos para este evento rotando el índice
    for (let pIdx = 0; pIdx < 4; pIdx++) {
      const equipoIdx = (eIdx * 4 + pIdx) % equipos.length
      const equipo = equipos[equipoIdx]
      const nombreIndex = (eIdx * 4 + pIdx) % nombresBase.length
      
      proyectosData.push({
        equipo_id: equipo.id,
        evento_id: evento.id,
        nombre: nombresBase[nombreIndex] + ` - Edición ${evento.nombre.substring(0, 5)}`,
        descripcion: `Descripción generada automáticamente para evaluar el desempeño del equipo dentro del evento seleccionado. Innovación, tecnología y diseño aplicados en ${nombresBase[nombreIndex]}.`,
        repositorio_url: `https://github.com/equipos/${nombresBase[nombreIndex].toLowerCase().replace(/\s/g, '-')}`,
        updated_at: new Date()
      })
    }
  }

  // Insertar todos y luego leerlos de vuelta para mantener la variable `proyectos`
  await prisma.proyectos.createMany({ data: proyectosData })
  const proyectos = await prisma.proyectos.findMany()

  console.log(`✅ ${proyectos.length} proyectos creados programáticamente (4 por evento)`)

  // ─── PARTICIPANTES (20 alumnos) ───
  const bcrypt = require('bcryptjs')
  const hashedPass = await bcrypt.hash('password123', 10)

  const participantesData = [
    { name: 'Carlos Hernández López', email: 'carlos.hernandez@tecmx.edu', carrera: 'Ingeniería en Sistemas Computacionales', no_control: '20260101' },
    { name: 'María Fernanda Ríos', email: 'maria.rios@tecmx.edu', carrera: 'Ingeniería en Sistemas Computacionales', no_control: '20260102' },
    { name: 'José Antonio Ramírez', email: 'jose.ramirez@tecmx.edu', carrera: 'Contador Público', no_control: '20260103' },
    { name: 'Ana Sofía Martínez', email: 'ana.martinez@tecmx.edu', carrera: 'Ingeniería en Sistemas Computacionales', no_control: '20260104' },
    { name: 'Diego Alejandro Torres', email: 'diego.torres@tecmx.edu', carrera: 'Ingeniería Industrial', no_control: '20260105' },
    { name: 'Valentina Cruz Morales', email: 'valentina.cruz@tecmx.edu', carrera: 'Ingeniería Civil', no_control: '20260106' },
    { name: 'Luis Enrique Guzmán', email: 'luis.guzman@tecmx.edu', carrera: 'Ingeniería en Sistemas Computacionales', no_control: '20260107' },
    { name: 'Camila Ortega Díaz', email: 'camila.ortega@tecmx.edu', carrera: 'Ingeniería Industrial', no_control: '20260108' },
    { name: 'Fernando Castillo Ruiz', email: 'fernando.castillo@tecmx.edu', carrera: 'Ingeniería Eléctrica', no_control: '20260109' },
    { name: 'Daniela Moreno Vargas', email: 'daniela.moreno@tecmx.edu', carrera: 'Ingeniería en Sistemas Computacionales', no_control: '20260110' },
    { name: 'Andrés Felipe Juárez', email: 'andres.juarez@tecmx.edu', carrera: 'Ingeniería Electrónica', no_control: '20260111' },
    { name: 'Paola Reyes Sánchez', email: 'paola.reyes@tecmx.edu', carrera: 'Ingeniería en Sistemas Computacionales', no_control: '20260112' },
    { name: 'Ricardo Navarro Ibarra', email: 'ricardo.navarro@tecmx.edu', carrera: 'Ingeniería Mecánica', no_control: '20260113' },
    { name: 'Isabella Rojas Peña', email: 'isabella.rojas@tecmx.edu', carrera: 'Ingeniería Industrial', no_control: '20260114' },
    { name: 'Miguel Ángel Flores', email: 'miguel.flores@tecmx.edu', carrera: 'Ingeniería en Sistemas Computacionales', no_control: '20260115' },
    { name: 'Sofía Alejandra Vega', email: 'sofia.vega@tecmx.edu', carrera: 'Ingeniería Electrónica', no_control: '20260116' },
    { name: 'Emiliano García Luna', email: 'emiliano.garcia@tecmx.edu', carrera: 'Ingeniería en Sistemas Computacionales', no_control: '20260117' },
    { name: 'Renata Méndez Castro', email: 'renata.mendez@tecmx.edu', carrera: 'Ingeniería Química', no_control: '20260118' },
    { name: 'Sebastián Aguilar Mora', email: 'sebastian.aguilar@tecmx.edu', carrera: 'Ingeniería Industrial', no_control: '20260119' },
    { name: 'Ximena Pacheco Rivera', email: 'ximena.pacheco@tecmx.edu', carrera: 'Ingeniería en Sistemas Computacionales', no_control: '20260120' },
  ]

  // Delete old seeded participants (won't touch admin/juez)
  await prisma.equipo_miembros.deleteMany({})

  const createdParticipantes = []
  for (const p of participantesData) {
    const existing = await prisma.users.findUnique({ where: { email: p.email } })
    if (existing) {
      // Update existing
      const updated = await prisma.users.update({
        where: { email: p.email },
        data: { name: p.name, carrera: p.carrera, no_control: p.no_control, role: 'PARTICIPANTE', updated_at: new Date() }
      })
      createdParticipantes.push(updated)
    } else {
      const user = await prisma.users.create({
        data: {
          name: p.name,
          email: p.email,
          password: hashedPass,
          carrera: p.carrera,
          no_control: p.no_control,
          role: 'PARTICIPANTE',
          updated_at: new Date()
        }
      })
      createdParticipantes.push(user)
    }
  }

  console.log(`✅ ${createdParticipantes.length} participantes creados`)

  // ─── ASIGNAR MIEMBROS A EQUIPOS ───
  // Roles: LIDER, PROGRAMADOR, DISENADOR, TESTER
  // 5 teams × 4 members = 20 participants, 1 leader per team
  const roles: ('LIDER' | 'PROGRAMADOR' | 'DISENADOR' | 'TESTER')[] = ['LIDER', 'PROGRAMADOR', 'DISENADOR', 'TESTER']

  for (let t = 0; t < 5; t++) {
    const equipo = equipos[t]
    for (let m = 0; m < 4; m++) {
      const participante = createdParticipantes[t * 4 + m]
      const rol = roles[m] // First member = LIDER, then PROGRAMADOR, DISENADOR, TESTER
      await prisma.equipo_miembros.create({
        data: {
          equipo_id: equipo.id,
          user_id: participante.id,
          rol: rol,
          created_at: new Date()
        }
      })
    }
  }

  console.log(`✅ 20 miembros asignados a 5 equipos (1 líder por equipo)`)

  // ─── CRITERIOS y CALIFICACIONES PARA TODOS LOS EVENTOS Y PROYECTOS ───
  let juez = await prisma.users.findFirst({ where: { role: 'JUEZ' } })
  if (!juez) {
    juez = await prisma.users.findFirst({ where: { role: 'ADMIN' } })
  }

  if (juez) {
    // 1. Asegurar que todos los eventos tengan criterios de evaluación
    for (const evento of eventos) {
      let criterios = await prisma.evaluacion_criterios.findMany({ where: { evento_id: evento.id } })
      if (criterios.length === 0) {
        await prisma.evaluacion_criterios.createMany({
          data: [
            { evento_id: evento.id, nombre: 'Innovación', ponderacion: 30 },
            { evento_id: evento.id, nombre: 'Implementación', ponderacion: 40 },
            { evento_id: evento.id, nombre: 'Presentación', ponderacion: 30 },
          ]
        })
      }
    }

    // 2. Calificar todos los proyectos
    const puntuaciones = [98, 92, 85, 78, 65, 88, 75, 96, 89, 70, 82, 90]
    
    for (let i = 0; i < proyectos.length; i++) {
      const proyecto = proyectos[i]
      const baseScore = puntuaciones[i % puntuaciones.length]
      
      const criteriosEvento = await prisma.evaluacion_criterios.findMany({ where: { evento_id: proyecto.evento_id } })
      
      for (const criterio of criteriosEvento) {
        const score = Math.min(100, Math.max(0, baseScore + (Math.random() * 6 - 3)))
        await prisma.evaluaciones.create({
          data: {
            proyecto_id: proyecto.id,
            juez_id: juez.id,
            criterio_id: criterio.id,
            puntuacion: parseFloat(score.toFixed(2)),
            comentario: 'Proyecto calificado general.',
            created_at: new Date()
          }
        })
      }
    }
    console.log(`✅ Evaluaciones creadas para los ${proyectos.length} proyectos de la BD`)
  }

  console.log('\n🎉 Seed completado exitosamente!')
  console.log(`   📅 ${eventos.length} eventos`)
  console.log(`   👥 ${equipos.length} equipos`)
  console.log(`   📁 ${proyectos.length} proyectos`)
  console.log(`   🧑‍🎓 ${createdParticipantes.length} participantes`)
}

main()
  .catch(e => { console.error('❌ Error:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())

