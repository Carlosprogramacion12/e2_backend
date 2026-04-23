export function toEvaluacionResponse(c: any) {
  return {
    ...c,
    id: Number(c.id),
    proyecto_id: Number(c.proyecto_id),
    juez_user_id: Number(c.juez_id),
    criterio_id: Number(c.criterio_id),
    puntuacion: Number(c.puntuacion),
    criterio: c.evaluacion_criterios ? {
        ...c.evaluacion_criterios,
        id: Number(c.evaluacion_criterios.id),
        evento_id: Number(c.evaluacion_criterios.evento_id),
        ponderacion: Number(c.evaluacion_criterios.ponderacion)
    } : null
  };
}

export function toProyectoResponse(proyecto: any) {
  return {
    ...proyecto,
    id: Number(proyecto.id),
    equipo_id: Number(proyecto.equipo_id),
    evento_id: Number(proyecto.evento_id),
    equipo: proyecto.equipos ? {
      ...proyecto.equipos,
      id: Number(proyecto.equipos.id)
    } : null,
    evento: proyecto.eventos ? {
      ...proyecto.eventos,
      id: Number(proyecto.eventos.id)
    } : null,
    evaluaciones: proyecto.evaluaciones ? proyecto.evaluaciones.map(toEvaluacionResponse) : [],
    calificaciones: proyecto.evaluaciones ? proyecto.evaluaciones.map(toEvaluacionResponse) : []
  };
}
