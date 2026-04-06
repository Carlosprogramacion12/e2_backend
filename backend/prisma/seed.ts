import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

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
  ])

  console.log(`✅ ${equipos.length} equipos creados`)

  // ─── PROYECTOS ───
  const proyectos = await Promise.all([
    prisma.proyectos.create({
      data: {
        equipo_id: equipos[0].id,
        evento_id: eventos[0].id,
        nombre: 'EcoTrack - Monitor Ambiental IoT',
        descripcion: 'Sistema de monitoreo ambiental en tiempo real usando sensores IoT. Mide temperatura, humedad, calidad del aire y niveles de ruido en campus universitarios.',
        repositorio_url: 'https://github.com/codebreakers/ecotrack',
        updated_at: new Date()
      }
    }),
    prisma.proyectos.create({
      data: {
        equipo_id: equipos[1].id,
        evento_id: eventos[0].id,
        nombre: 'MediConnect - Telemedicina Rural',
        descripcion: 'Plataforma de telemedicina enfocada en comunidades rurales con conectividad limitada. Incluye diagnóstico asistido por IA y expedientes digitales.',
        repositorio_url: 'https://github.com/byteforce/mediconnect',
        updated_at: new Date()
      }
    }),
    prisma.proyectos.create({
      data: {
        equipo_id: equipos[2].id,
        evento_id: eventos[1].id,
        nombre: 'SmartPark - Estacionamiento Inteligente',
        descripcion: 'App móvil y sistema de sensores para localizar espacios de estacionamiento disponibles en tiempo real dentro del campus.',
        repositorio_url: 'https://github.com/nexgendevs/smartpark',
        updated_at: new Date()
      }
    }),
    prisma.proyectos.create({
      data: {
        equipo_id: equipos[3].id,
        evento_id: eventos[1].id,
        nombre: 'LearnPath - Plataforma Educativa Adaptativa',
        descripcion: 'Sistema de aprendizaje adaptativo que personaliza el contenido educativo según el estilo de aprendizaje y progreso del estudiante usando ML.',
        repositorio_url: 'https://github.com/techwizards/learnpath',
        updated_at: new Date()
      }
    }),
    prisma.proyectos.create({
      data: {
        equipo_id: equipos[4].id,
        evento_id: eventos[2].id,
        nombre: 'AgroVision - Análisis de Cultivos por Drones',
        descripcion: 'Solución de agricultura de precisión que utiliza drones y visión computacional para analizar el estado de salud de los cultivos.',
        repositorio_url: 'https://github.com/innovatech/agrovision',
        updated_at: new Date()
      }
    }),
    prisma.proyectos.create({
      data: {
        equipo_id: equipos[0].id,
        evento_id: eventos[4].id,
        nombre: 'TaskFlow - Gestor de Tareas con IA',
        descripcion: 'Herramienta de gestión de proyectos que usa inteligencia artificial para priorizar tareas y predecir tiempos de entrega.',
        repositorio_url: 'https://github.com/codebreakers/taskflow',
        updated_at: new Date()
      }
    }),
    prisma.proyectos.create({
      data: {
        equipo_id: equipos[1].id,
        evento_id: eventos[2].id,
        nombre: 'WaterGuard - Monitoreo Hídrico',
        descripcion: 'Sistema de monitoreo de calidad del agua en tiempo real para comunidades con problemas de contaminación hídrica.',
        repositorio_url: 'https://github.com/byteforce/waterguard',
        updated_at: new Date()
      }
    }),
    prisma.proyectos.create({
      data: {
        equipo_id: equipos[2].id,
        evento_id: eventos[4].id,
        nombre: 'CyberShield - Seguridad en Redes',
        descripcion: 'Herramienta de análisis de vulnerabilidades y detección de intrusiones para redes empresariales pequeñas y medianas.',
        repositorio_url: 'https://github.com/nexgendevs/cybershield',
        updated_at: new Date()
      }
    }),
  ])

  console.log(`✅ ${proyectos.length} proyectos creados`)

  console.log('\n🎉 Seed completado exitosamente!')
  console.log(`   📅 ${eventos.length} eventos`)
  console.log(`   👥 ${equipos.length} equipos`)
  console.log(`   📁 ${proyectos.length} proyectos`)
}

main()
  .catch(e => { console.error('❌ Error:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
