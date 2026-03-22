const router = require('express').Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');

const adminCtrl = require('../controllers/adminController');
const usuarioCtrl = require('../controllers/usuarioController');
const eventoCtrl = require('../controllers/eventoController');
const equipoCtrl = require('../controllers/equipoController');
const proyectoCtrl = require('../controllers/proyectoController');
const criterioCtrl = require('../controllers/criterioController');
const resultadosCtrl = require('../controllers/resultadosController');
const cpCtrl = require('../controllers/carreraPerfilController');

// Todas las rutas requieren auth + rol Admin
router.use(auth, role('Admin'));

// Dashboard
router.get('/dashboard', adminCtrl.index);
router.post('/dashboard/preferences', adminCtrl.savePreferences);
router.get('/dashboard/report', adminCtrl.generateReport);

// Usuarios
router.get('/usuarios', usuarioCtrl.index);
router.post('/usuarios', usuarioCtrl.store);
router.get('/usuarios/:id', usuarioCtrl.show);
router.put('/usuarios/:id', usuarioCtrl.update);
router.delete('/usuarios/:id', usuarioCtrl.destroy);

// Eventos
router.get('/eventos', eventoCtrl.index);
router.post('/eventos', eventoCtrl.store);
router.get('/eventos/jueces', eventoCtrl.getJueces);
router.get('/eventos/:id', eventoCtrl.show);
router.put('/eventos/:id', eventoCtrl.update);
router.delete('/eventos/:id', eventoCtrl.destroy);

// Criterios de Evaluación
router.post('/eventos/:eventoId/criterios', criterioCtrl.store);
router.get('/criterios/:id', criterioCtrl.show);
router.put('/criterios/:id', criterioCtrl.update);
router.delete('/criterios/:id', criterioCtrl.destroy);

// Equipos
router.get('/equipos', equipoCtrl.index);
router.get('/equipos/:id', equipoCtrl.show);
router.put('/equipos/:id', equipoCtrl.update);
router.delete('/equipos/:id', equipoCtrl.destroy);
router.post('/equipos/:id/miembros', equipoCtrl.addMember);
router.delete('/equipos/:id/miembros/:participanteId', equipoCtrl.removeMember);

// Proyectos
router.get('/proyectos', proyectoCtrl.index);
router.post('/proyectos', proyectoCtrl.store);
router.get('/proyectos/:id', proyectoCtrl.show);
router.put('/proyectos/:id', proyectoCtrl.update);
router.delete('/proyectos/:id', proyectoCtrl.destroy);

// Resultados y Constancias
router.get('/resultados', resultadosCtrl.index);
router.get('/resultados/constancia/:proyectoId/:posicion', resultadosCtrl.descargarConstancia);

// Carreras
router.get('/carreras', cpCtrl.carrerasIndex);
router.post('/carreras', cpCtrl.carrerasStore);
router.put('/carreras/:id', cpCtrl.carrerasUpdate);
router.delete('/carreras/:id', cpCtrl.carrerasDestroy);

// Perfiles
router.get('/perfiles', cpCtrl.perfilesIndex);
router.post('/perfiles', cpCtrl.perfilesStore);
router.put('/perfiles/:id', cpCtrl.perfilesUpdate);
router.delete('/perfiles/:id', cpCtrl.perfilesDestroy);

module.exports = router;
