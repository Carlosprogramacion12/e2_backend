export interface CreateEventoDto {
  nombre: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin: string;
  jueces?: number[];
}

export interface UpdateEventoDto {
  nombre?: string;
  descripcion?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  jueces?: number[];
}

export interface EventoQueryOptions {
  page?: number;
  limit?: number;
}
