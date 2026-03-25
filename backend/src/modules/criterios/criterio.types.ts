export interface CreateCriterioDto {
  evento_id: number;
  nombre: string;
  ponderacion: number;
}

export interface UpdateCriterioDto {
  nombre?: string;
  ponderacion?: number;
}
