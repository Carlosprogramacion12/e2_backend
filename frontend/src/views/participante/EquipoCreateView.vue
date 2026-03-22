<template>
  <AppLayout>
    <h2 style="font-size:1.5rem;font-weight:700;margin-bottom:1.5rem">Crear Equipo</h2>
    <div class="card" style="max-width:40rem">
      <div class="card-body">
        <form @submit.prevent="save">
          <div class="form-group"><label>Nombre del Equipo</label><input v-model="form.nombre" class="form-control" required></div>
          <div class="form-group"><label>Evento</label><select v-model="form.evento_id" class="form-control" required><option value="">Seleccionar evento...</option><option v-for="e in eventos" :key="e.id" :value="e.id">{{ e.nombre }}</option></select></div>
          <div class="form-group"><label>Nombre del Proyecto</label><input v-model="form.proyecto_nombre" class="form-control" required></div>
          <div class="form-group"><label>Descripción del Proyecto</label><textarea v-model="form.proyecto_descripcion" class="form-control" rows="3"></textarea></div>
          <div class="form-group"><label>URL del Repositorio</label><input v-model="form.repositorio_url" class="form-control" placeholder="https://github.com/..."></div>
          <button type="submit" class="btn btn-indigo btn-block" style="padding:.75rem">Crear Equipo y Proyecto</button>
        </form>
      </div>
    </div>
  </AppLayout>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '../../components/layout/AppLayout.vue'
import api from '../../services/api'
const router = useRouter(); const eventos = ref([])
const form = ref({ nombre:'', evento_id:'', proyecto_nombre:'', proyecto_descripcion:'', repositorio_url:'' })
onMounted(async () => { try { const r = await api.get('/participante/eventos-disponibles'); eventos.value=r.data.data||[] } catch(e){} })
async function save() { try { await api.post('/participante/equipos', form.value); alert('Equipo creado exitosamente'); router.push('/participante/dashboard') } catch(e){alert(e.response?.data?.message||'Error')} }
</script>
