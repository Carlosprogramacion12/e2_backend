export interface CreateUserDto {
  nombre: string;
  email: string;
  password?: string;
  rol_id: number;
}

export interface UpdateUserDto {
  nombre?: string;
  email?: string;
  password?: string;
  rol_id?: number;
  telefono?: string;
  no_control?: string;
  carrera?: string;
}

export interface UserQueryOptions {
  search?: string;
  role?: string;
  page?: number;
  limit?: number;
  evento_id?: number;
}
