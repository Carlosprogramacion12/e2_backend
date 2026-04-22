import api from '../../plugins/axios';
import type { User } from './users.types';

export const usersService = {
  getUsers: async (): Promise<User[]> => {
    const response = await api.get('/admin/usuarios');
    return response.data.data;
  }
}
