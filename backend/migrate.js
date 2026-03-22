/**
 * migrate.js — Sincroniza todos los modelos Sequelize con la base de datos MySQL.
 * Equivalente a: php artisan migrate
 * 
 * Uso: node migrate.js
 * Con --force: DROP y recrea todas las tablas
 */
const sequelize = require('./config/database');
const db = require('./models');

async function migrate() {
  const force = process.argv.includes('--force');
  
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a MySQL establecida.');

    if (force) {
      console.log('⚠️  Modo --force: Se eliminarán y recrearán TODAS las tablas.');
    }

    // sync() crea las tablas si no existen
    // sync({ force: true }) DROP + CREATE
    // sync({ alter: true }) modifica columnas sin perder datos
    await sequelize.sync({ force });

    console.log('✅ Todas las tablas han sido sincronizadas correctamente.');
    console.log('\nTablas creadas:');
    const [results] = await sequelize.query('SHOW TABLES');
    results.forEach(row => {
      const tableName = Object.values(row)[0];
      console.log(`   • ${tableName}`);
    });

    console.log(`\nTotal: ${results.length} tablas`);
  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

migrate();
