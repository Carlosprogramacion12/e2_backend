import { CarreraRepository } from './carrera.repository';
import { CreateCarreraDto, UpdateCarreraDto } from './carrera.types';

const carreraRepository = new CarreraRepository();

export class CarreraService {
  async getAllCarreras() {
    const carreras = await carreraRepository.findAll();
    return {
      success: true,
      data: carreras.map((c) => ({
        ...c,
        id: Number(c.id)
      }))
    };
  }

  async getCarreraById(id: number) {
    const carrera = await carreraRepository.findById(id);
    if (!carrera) throw { status: 404, message: 'Carrera no encontrada' };

    return {
      success: true,
      data: { ...carrera, id: Number(carrera.id) }
    };
  }

  async createCarrera(data: CreateCarreraDto) {
    const carrera = await carreraRepository.create(data);
    return {
      success: true,
      message: 'Carrera creada.',
      data: { ...carrera, id: Number(carrera.id) }
    };
  }

  async updateCarrera(id: number, data: UpdateCarreraDto) {
    const carrera = await carreraRepository.findById(id);
    if (!carrera) throw { status: 404, message: 'Carrera no encontrada' };

    await carreraRepository.update(id, data);
    return { success: true, message: 'Carrera actualizada.' };
  }

  async deleteCarrera(id: number) {
    const carrera = await carreraRepository.findById(id);
    if (!carrera) throw { status: 404, message: 'Carrera no encontrada' };

    await carreraRepository.delete(id);
    return { success: true, message: 'Carrera eliminada.' };
  }
}
