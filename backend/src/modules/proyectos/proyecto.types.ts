export interface CreateProyectoDto {
  equipo_id: number;
  evento_id: number;
  nombre: string;
  descripcion?: string;
  repositorio_url?: string;
}

export interface UpdateProyectoDto {
  nombre?: string;
  descripcion?: string;
  repositorio_url?: string;
}

export interface ProyectoQueryOptions {
  page?: number;
  limit?: number;
}
