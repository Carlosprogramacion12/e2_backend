import { PerfilRepository } from './perfil.repository';
import { CreatePerfilDto, UpdatePerfilDto } from './perfil.types';

const perfilRepository = new PerfilRepository();

export class PerfilService {
  async getAllPerfiles() {
    const perfiles = await perfilRepository.findAll();
    return {
      success: true,
      data: perfiles.map((p) => ({
        ...p,
        id: Number(p.id)
      }))
    };
  }

  async getPerfilById(id: number) {
    const perfil = await perfilRepository.findById(id);
    if (!perfil) throw { status: 404, message: 'Perfil no encontrado' };

    return {
      success: true,
      data: { ...perfil, id: Number(perfil.id) }
    };
  }

  async createPerfil(data: CreatePerfilDto) {
    const perfil = await perfilRepository.create(data);
    return {
      success: true,
      message: 'Perfil creado.',
      data: { ...perfil, id: Number(perfil.id) }
    };
  }

  async updatePerfil(id: number, data: UpdatePerfilDto) {
    const perfil = await perfilRepository.findById(id);
    if (!perfil) throw { status: 404, message: 'Perfil no encontrado' };

    await perfilRepository.update(id, data);
    return { success: true, message: 'Perfil actualizado.' };
  }

  async deletePerfil(id: number) {
    const perfil = await perfilRepository.findById(id);
    if (!perfil) throw { status: 404, message: 'Perfil no encontrado' };

    await perfilRepository.delete(id);
    return { success: true, message: 'Perfil eliminado.' };
  }
}
