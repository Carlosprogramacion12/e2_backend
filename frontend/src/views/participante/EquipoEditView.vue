<template>
  <AppLayout>
    <h2 style="font-size:1.5rem;font-weight:700;margin-bottom:1.5rem">Editar Equipo</h2>
    <div v-if="loading" class="loading"><div class="spinner"></div></div>
    <template v-else>
      <div class="card" style="max-width:40rem;margin-bottom:1.5rem">
        <div class="card-header">Datos del Equipo</div>
        <div class="card-body">
          <form @submit.prevent="saveEquipo">
            <div class="form-group"><label>Nombre del Equipo</label><input v-model="equipo.nombre" class="form-control" required></div>
            <button type="submit" class="btn btn-indigo">Guardar Cambios</button>
          </form>
        </div>
      </div>
      <div class="card" style="max-width:40rem">
        <div class="card-header">Miembros <span class="badge badge-indigo">{{ miembros.length }}</span></div>
        <div class="card-body">
          <div v-for="m in miembros" :key="m.id" style="display:flex;align-items:center;justify-content:space-between;padding:.75rem 0;border-bottom:1px solid #f3f4f6">
            <div style="display:flex;align-items:center;gap:.75rem">
              <div class="user-avatar-sm">{{ (m.nombre||m.email||'?')[0].toUpperCase() }}</div>
              <div><p style="font-weight:500">{{ m.nombre }}</p><span class="badge" :class="m.rol_equipo==='Líder'?'badge-admin':'badge-participante'" style="margin-top:.25rem">{{ m.rol_equipo }}</span></div>
            </div>
          </div>
          <div v-if="!miembros.length" class="empty-state"><p>No hay miembros</p></div>
        </div>
      </div>
    </template>
  </AppLayout>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from '../../components/layout/AppLayout.vue'
import api from '../../services/api'
const route = useRoute()
const equipo = ref({}); const miembros = ref([]); const loading = ref(true)
onMounted(async () => { try { const r = await api.get(`/participante/equipos/${route.params.id}`); equipo.value=r.data.data.equipo||{}; miembros.value=r.data.data.miembros||[] } catch(e){} finally { loading.value=false } })
async function saveEquipo() { try { await api.put(`/participante/equipos/${route.params.id}`, { nombre: equipo.value.nombre }); alert('Equipo actualizado') } catch(e){alert('Error')} }
</script>
