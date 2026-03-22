const router = require('express').Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');

const participanteCtrl = require('../controllers/participanteController');
const equipoCtrl = require('../controllers/participanteEquipoController');
const avanceCtrl = require('../controllers/avanceController');
const solicitudCtrl = require('../controllers/solicitudController');
const invitacionCtrl = require('../controllers/invitacionController');

router.use(auth, role('Participante'));

// Registro inicial
router.get('/registro-inicial', participanteCtrl.getRegistroInicial);
router.post('/registro-inicial', participanteCtrl.registroInicial);

// Dashboard
router.get('/dashboard', participanteCtrl.dashboard);

// Equipos
router.get('/equipos/create', equipoCtrl.createForm);
router.post('/equipos', equipoCtrl.store);
router.get('/equipos/join', equipoCtrl.showJoinForm);
router.get('/equipos/edit', equipoCtrl.edit);
router.put('/equipos/:id', equipoCtrl.update);
router.post('/equipos/add-member', equipoCtrl.addMember);
router.delete('/equipos/remove-member/:id', equipoCtrl.removeMember);
router.delete('/equipos/leave', equipoCtrl.leave);

// Solicitudes
router.get('/solicitudes/mis', solicitudCtrl.misSolicitudes);
router.get('/solicitudes/equipo/:equipoId', solicitudCtrl.verSolicitudesEquipo);
router.post('/solicitudes/:equipoId', solicitudCtrl.crearSolicitud);
router.post('/solicitudes/:id/aceptar', solicitudCtrl.aceptar);
router.post('/solicitudes/:id/rechazar', solicitudCtrl.rechazar);

// Invitaciones
router.get('/invitaciones/mis', invitacionCtrl.misInvitaciones);
router.post('/invitaciones/:id/aceptar', invitacionCtrl.aceptar);
router.post('/invitaciones/:id/rechazar', invitacionCtrl.rechazar);
router.post('/equipos/:equipoId/invitar', invitacionCtrl.enviarInvitacion);
router.get('/equipos/:equipoId/invitaciones-enviadas', invitacionCtrl.invitacionesEnviadas);

// Avances (Bitácora)
router.get('/avances', avanceCtrl.index);
router.post('/avances', avanceCtrl.store);
router.delete('/avances/:id', avanceCtrl.destroy);

// Constancias
router.get('/constancia/:tipo', participanteCtrl.generarConstancia);

module.exports = router;
