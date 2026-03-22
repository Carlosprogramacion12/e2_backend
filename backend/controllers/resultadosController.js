/**
 * Controlador de Resultados y Constancias (Admin)
 * Equivalente a Admin\ResultadosController
 */
const { Evento } = require('../models');
const { calcularRanking, getTextoLogro } = require('../services/rankingService');
const { generarConstanciaPDF } = require('../services/pdfService');
const { Proyecto, Equipo, Participante, User } = require('../models');

// GET /api/admin/resultados
exports.index = async (req, res) => {
  try {
    const { evento_id } = req.query;
    let evento;

    if (evento_id) {
      evento = await Evento.findByPk(evento_id);
    } else {
      evento = await Evento.findOne({ order: [['created_at', 'DESC']] });
    }

    const eventos = await Evento.findAll();
    let ranking = [];

    if (evento) {
      ranking = await calcularRanking(evento.id);
    }

    res.json({
      success: true,
      data: { ranking, eventos, evento }
    });
  } catch (error) {
    console.error('Error en resultados:', error);
    res.status(500).json({ success: false, message: 'Error al obtener resultados' });
  }
};

// GET /api/admin/resultados/constancia/:proyectoId/:posicion
exports.descargarConstancia = async (req, res) => {
  try {
    const { proyectoId, posicion } = req.params;

    const proyecto = await Proyecto.findByPk(proyectoId, {
      include: [
        {
          model: Equipo, as: 'equipo',
          include: [{
            model: Participante, as: 'participantes',
            include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
            through: { attributes: ['perfil_id'] }
          }]
        },
        { model: Evento, as: 'evento' }
      ]
    });

    if (!proyecto) return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });

    const textoLogro = getTextoLogro(parseInt(posicion));

    generarConstanciaPDF(res, {
      proyecto,
      textoLogro,
      nombreTitular: proyecto.equipo.nombre,
      mostrarIntegrantes: true,
      evento: proyecto.evento
    });
  } catch (error) {
    console.error('Error generando constancia:', error);
    res.status(500).json({ success: false, message: 'Error al generar constancia' });
  }
};
