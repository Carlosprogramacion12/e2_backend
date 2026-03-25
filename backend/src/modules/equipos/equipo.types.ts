export interface UpdateEquipoDto {
  nombre?: string;
  max_programadores?: number;
  max_disenadores?: number;
  max_testers?: number;
}

export interface AddMiembroDto {
  participante_id: number;
  perfil_id: number;
}

export interface EquipoQueryOptions {
  page?: number;
  limit?: number;
}
