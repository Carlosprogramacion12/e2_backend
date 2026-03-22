const router = require('express').Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const juezCtrl = require('../controllers/juezController');

router.use(auth, role('Juez'));

router.get('/dashboard', juezCtrl.dashboard);
router.get('/evento/:eventoId', juezCtrl.showEvento);
router.get('/evaluar/:proyectoId', juezCtrl.editEvaluacion);
router.post('/evaluar/:proyectoId', juezCtrl.storeEvaluacion);

module.exports = router;
