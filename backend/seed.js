/**
 * seed.js — Replica exacta del DatabaseSeeder.php de Laravel
 * Crea: Roles, Perfiles, Carreras, Eventos, Criterios, Admin, Jueces,
 *       Participantes, Equipos, Proyectos, Avances y Calificaciones.
 * 
 * Uso: node seed.js
 * 
 * Credenciales Admin: admin@test.com / password
 */
const bcrypt = require('bcryptjs');
const sequelize = require('./config/database');
const db = require('./models');

// ─── Datos de Carreras (mismos que CarreraFactory.php) ───
const CARRERAS = [
  'Ingeniería en Sistemas Computacionales',
  'Ingeniería Informática',
  'Ingeniería Industrial',
  'Ingeniería Mecatrónica',
  'Ingeniería Electrónica',
  'Ingeniería Eléctrica',
  'Ingeniería Mecánica',
  'Ingeniería Química',
  'Ingeniería Bioquímica',
  'Ingeniería en Gestión Empresarial',
  'Ingeniería en Logística',
  'Ingeniería Civil',
  'Licenciatura en Administración',
  'Licenciatura en Contaduría Pública',
  'Arquitectura',
  'Diseño Gráfico',
  'Derecho',
  'Medicina',
  'Nutrición',
  'Psicología',
  'Mercadotecnia',
  'Ciencias de la Comunicación',
  'Gastronomía',
  'Turismo',
  'Relaciones Internacionales',
  'Economía',
  'Finanzas',
  'Pedagogía',
  'Biología',
];

// ─── Criterios de Evaluación ───
const CRITERIOS = [
  'Innovación y Originalidad',
  'Funcionalidad del Prototipo',
  'Calidad del Código',
  'Presentación y Comunicación',
  'Impacto Social',
];

// ─── Nombres de equipos ───
const EQUIPOS = [
  'Byte Force', 'Code Wizards', 'Pixel Squad', 'Debug Masters', 'Data Storm',
  'Cyber Wolves', 'Stack Overflow', 'Binary Legends', 'Cloud Nine', 'Tech Titans'
];

// ─── Nombres de proyectos ───
const PROYECTOS = [
  'Sistema de Gestión Académica', 'Plataforma de E-Learning', 'App de Salud Mental',
  'Marketplace Local', 'IoT Smart Campus', 'Asistente Virtual Estudiantil',
  'Red Social Universitaria', 'Monitoreo Ambiental IoT', 'Fintech para Estudiantes',
  'Plataforma de Voluntariado'
];

function randomEl(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomDate(start, endD) {
  const s = start.getTime(); const e = endD.getTime();
  return new Date(s + Math.random() * (e - s));
}
function generateClave() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return letters[randomInt(0,25)] + letters[randomInt(0,25)] + randomInt(100,999);
}

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión establecida.\n');

    // ──────────── LIMPIAR TABLAS ────────────
    console.log('🧹 Limpiando tablas...');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    const tables = ['calificaciones', 'evaluacion_comentarios', 'avances', 'constancias',
      'invitaciones_equipo', 'solicitudes_equipo', 'equipo_participante',
      'dashboard_preferences', 'evento_user', 'proyectos', 'criterio_evaluacion',
      'equipos', 'participantes', 'user_rol', 'users', 'roles', 'perfiles', 'carreras', 'eventos'];
    for (const t of tables) {
      await sequelize.query(`TRUNCATE TABLE \`${t}\``).catch(() => {});
    }
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('   ✓ Tablas limpiadas\n');

    // ──────────── 1. ROLES ────────────
    console.log('📋 Creando Roles...');
    const rolAdmin = await db.Rol.create({ nombre: 'Admin' });
    const rolJuez = await db.Rol.create({ nombre: 'Juez' });
    const rolParticipante = await db.Rol.create({ nombre: 'Participante' });
    console.log('   ✓ 3 roles creados (Admin, Juez, Participante)\n');

    // ──────────── 2. PERFILES ────────────
    console.log('🎭 Creando Perfiles...');
    const perfilProg = await db.Perfil.create({ nombre: 'Programador' });
    const perfilDis = await db.Perfil.create({ nombre: 'Diseñador' });
    const perfilLider = await db.Perfil.create({ nombre: 'Líder de Proyecto' });
    const perfilTester = await db.Perfil.create({ nombre: 'Tester' });
    const perfiles = [perfilProg, perfilDis, perfilLider, perfilTester];
    console.log('   ✓ 4 perfiles creados\n');

    // ──────────── 3. CARRERAS ────────────
    console.log('🎓 Creando Carreras...');
    const carreras = [];
    for (const c of CARRERAS) {
      carreras.push(await db.Carrera.create({ nombre: c, clave: generateClave() }));
    }
    console.log(`   ✓ ${carreras.length} carreras creadas\n`);

    // ──────────── 4. EVENTOS ────────────
    console.log('📅 Creando Eventos...');
    const eventosData = [
      { nombre: 'Hackathon TecNM 2025', descripcion: 'Evento de innovación tecnológica donde equipos desarrollan soluciones en 48 horas.', fecha_inicio: '2025-06-15', fecha_fin: '2025-06-17' },
      { nombre: 'Expo Proyectos Integradores', descripcion: 'Exposición de proyectos integradores de todas las carreras del TecNM.', fecha_inicio: '2025-07-20', fecha_fin: '2025-07-22' },
      { nombre: 'Concurso de Innovación Digital', descripcion: 'Competencia de proyectos con impacto digital y social para el futuro.', fecha_inicio: '2025-09-10', fecha_fin: '2025-09-12' },
    ];
    const eventos = [];
    for (const e of eventosData) { eventos.push(await db.Evento.create(e)); }
    console.log(`   ✓ ${eventos.length} eventos creados\n`);

    // ──────────── 5. CRITERIOS DE EVALUACIÓN ────────────
    console.log('📝 Creando Criterios de Evaluación...');
    const allCriterios = {};
    for (const ev of eventos) {
      allCriterios[ev.id] = [];
      for (const c of CRITERIOS) {
        const criterio = await db.CriterioEvaluacion.create({
          evento_id: ev.id, nombre: c, ponderacion: 20
        });
        allCriterios[ev.id].push(criterio);
      }
    }
    console.log(`   ✓ ${CRITERIOS.length} criterios × ${eventos.length} eventos = ${CRITERIOS.length * eventos.length} criterios\n`);

    // ──────────── 6. ADMIN USER ────────────
    console.log('👤 Creando Admin...');
    const hashedPass = await bcrypt.hash('password', 10);
    const admin = await db.User.create({ name: 'Admin User', email: 'admin@test.com', password: hashedPass });
    await sequelize.query('INSERT INTO user_rol (user_id, rol_id) VALUES (?, ?)', { replacements: [admin.id, rolAdmin.id] });
    console.log('   ✓ Admin creado (admin@test.com / password)\n');

    // ──────────── 7. JUECES ────────────
    console.log('⚖️  Creando Jueces...');
    const jueces = [];
    const juezNames = [
      { name: 'Dr. Roberto García', email: 'juez1@test.com' },
      { name: 'Ing. María López', email: 'juez2@test.com' },
      { name: 'Mtro. Carlos Ruiz', email: 'juez3@test.com' },
      { name: 'Dra. Ana Martínez', email: 'juez4@test.com' },
      { name: 'Ing. Luis Hernández', email: 'juez5@test.com' },
    ];
    for (const j of juezNames) {
      const user = await db.User.create({ ...j, password: hashedPass });
      await sequelize.query('INSERT INTO user_rol (user_id, rol_id) VALUES (?, ?)', { replacements: [user.id, rolJuez.id] });
      jueces.push(user);
    }
    console.log(`   ✓ ${jueces.length} jueces creados\n`);

    // ──────────── 8. ASIGNAR JUECES A EVENTOS ────────────
    console.log('🔗 Asignando Jueces a Eventos...');
    for (const ev of eventos) {
      // Asignar 3 jueces aleatorios a cada evento
      const shuffled = [...jueces].sort(() => 0.5 - Math.random());
      for (const j of shuffled.slice(0, 3)) {
        await sequelize.query(
          'INSERT IGNORE INTO evento_user (evento_id, user_id) VALUES (?, ?)',
          { replacements: [ev.id, j.id] }
        );
      }
    }
    console.log('   ✓ Jueces asignados a eventos\n');

    // ──────────── 9. PARTICIPANTES ────────────
    console.log('🧑‍🎓 Creando Participantes...');
    const participantes = [];
    
    // Primero los usuarios específicos del UsuariosParticipantesSeeder
    const specificEmails = [
      'lepsgapi@gmail.com',
      'alejandrozzzxx@gmail.com',
      'lesslyaragon@gmail.com',
      'carlosdiazvasquez0406@gmail.com',
    ];
    for (const email of specificEmails) {
      const user = await db.User.create({ name: email.split('@')[0], email, password: hashedPass });
      await sequelize.query('INSERT INTO user_rol (user_id, rol_id) VALUES (?, ?)', { replacements: [user.id, rolParticipante.id] });
      const part = await db.Participante.create({
        user_id: user.id, carrera_id: randomEl(carreras).id,
        no_control: `C${randomInt(10000000, 99999999)}`
      });
      participantes.push(part);
    }

    // 46 participantes adicionales (total: 50)
    for (let i = 1; i <= 46; i++) {
      const user = await db.User.create({
        name: `Estudiante ${i}`, email: `estudiante${i}@test.com`, password: hashedPass
      });
      await sequelize.query('INSERT INTO user_rol (user_id, rol_id) VALUES (?, ?)', { replacements: [user.id, rolParticipante.id] });
      const part = await db.Participante.create({
        user_id: user.id, carrera_id: randomEl(carreras).id,
        no_control: `C${randomInt(10000000, 99999999)}`
      });
      participantes.push(part);
    }
    console.log(`   ✓ ${participantes.length} participantes creados\n`);

    // ──────────── 10. EQUIPOS + PROYECTOS + AVANCES ────────────
    console.log('👥 Creando Equipos, Proyectos y Avances...');
    const allProyectos = [];

    for (let i = 0; i < EQUIPOS.length; i++) {
      try {
        const equipo = await db.Equipo.create({ nombre: EQUIPOS[i], max_programadores: 2, max_disenadores: 2, max_testers: 1 });
        console.log(`   📦 Equipo: ${EQUIPOS[i]} (id=${equipo.id})`);

        // Asignar 3 participantes al equipo
        const shuffledParts = [...participantes].sort(() => 0.5 - Math.random()).slice(0, 3);
        for (const p of shuffledParts) {
          try {
            await sequelize.query(
              'INSERT IGNORE INTO equipo_participante (equipo_id, participante_id, perfil_id, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
              { replacements: [equipo.id, p.id, randomEl(perfiles).id] }
            );
          } catch (epErr) {
            console.error(`      ⚠️ Error equipo_participante: ${epErr.message}`);
          }
        }

        // Crear proyecto
        const eventoAsignado = randomEl(eventos);
        try {
          const proyecto = await db.Proyecto.create({
            equipo_id: equipo.id,
            evento_id: eventoAsignado.id,
            nombre: PROYECTOS[i],
            descripcion: `Proyecto desarrollado por el equipo ${EQUIPOS[i]} para el evento ${eventoAsignado.nombre}.`,
            repositorio_url: `https://github.com/${EQUIPOS[i].toLowerCase().replace(/\s+/g, '-')}/proyecto`,
          });
          allProyectos.push(proyecto);
          console.log(`      ✓ Proyecto: ${PROYECTOS[i]} (evento: ${eventoAsignado.nombre})`);

          // Crear 3 avances
          for (let a = 1; a <= 3; a++) {
            await db.Avance.create({
              proyecto_id: proyecto.id,
              descripcion: `Avance ${a}: Progreso del ${a * 33}% del proyecto ${PROYECTOS[i]}`,
              fecha: randomDate(new Date('2025-03-01'), new Date('2025-06-01')).toISOString().split('T')[0],
            });
          }
        } catch (projErr) {
          console.error(`      ❌ Error proyecto: ${projErr.message}`);
        }
      } catch (eqErr) {
        console.error(`   ❌ Error equipo ${EQUIPOS[i]}: ${eqErr.message}`);
      }
    }
    console.log(`   ✓ ${allProyectos.length} equipos con proyectos y avances\n`);

    // ──────────── 11. CALIFICACIONES ────────────
    console.log('⭐ Generando Calificaciones...');
    let calCount = 0;
    for (const proyecto of allProyectos) {
      const criterios = allCriterios[proyecto.evento_id] || [];
      const [juecesEvento] = await sequelize.query(
        'SELECT user_id FROM evento_user WHERE evento_id = ?',
        { replacements: [proyecto.evento_id] }
      );

      for (const { user_id: juezId } of juecesEvento) {
        for (const criterio of criterios) {
          try {
            await db.Calificacion.create({
              proyecto_id: proyecto.id,
              juez_user_id: juezId,
              criterio_id: criterio.id,
              puntuacion: randomInt(50, 100),
            });
            calCount++;
          } catch (calErr) {
            console.error(`      ⚠️ Cal error: ${calErr.message}`);
          }
        }
      }
    }
    console.log(`   ✓ ${calCount} calificaciones generadas\n`);

    // ──────────── RESUMEN ────────────
    console.log('═══════════════════════════════════════');
    console.log('  ✅ SEED COMPLETADO EXITOSAMENTE');
    console.log('═══════════════════════════════════════');
    console.log(`  • Roles:          3`);
    console.log(`  • Perfiles:       4`);
    console.log(`  • Carreras:       ${carreras.length}`);
    console.log(`  • Eventos:        ${eventos.length}`);
    console.log(`  • Criterios:      ${CRITERIOS.length * eventos.length}`);
    console.log(`  • Admin:          admin@test.com / password`);
    console.log(`  • Jueces:         ${jueces.length} (juez1-5@test.com)`);
    console.log(`  • Participantes:  ${participantes.length}`);
    console.log(`  • Equipos:        ${EQUIPOS.length}`);
    console.log(`  • Proyectos:      ${allProyectos.length}`);
    console.log(`  • Calificaciones: ${calCount}`);
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error en el seed:', error);
  } finally {
    await sequelize.close();
  }
}

seed();

