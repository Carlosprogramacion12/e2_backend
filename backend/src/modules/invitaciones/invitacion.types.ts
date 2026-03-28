export interface CrearInvitacionDto {
  user_id?: number;
  participante_id?: number; // legacy compatibility
  rol?: string;
  perfil_sugerido_id?: number;
  mensaje?: string;
}

