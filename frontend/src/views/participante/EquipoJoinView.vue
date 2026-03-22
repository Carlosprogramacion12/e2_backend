<template>
  <AppLayout>
    <h2 style="font-size:1.5rem;font-weight:700;margin-bottom:1.5rem">Unirse a un Equipo</h2>
    <div class="table-container">
      <div style="position:relative;margin-bottom:1rem;max-width:20rem">
        <div style="position:absolute;inset:0;right:auto;padding-left:.75rem;display:flex;align-items:center;pointer-events:none;color:#9ca3af"><svg style="width:1.25rem;height:1.25rem" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg></div>
        <input v-model="search" class="form-control" style="padding-left:2.5rem" placeholder="Buscar equipo..." @input="doSearch">
      </div>
      <div v-if="loading" class="loading"><div class="spinner"></div></div>
      <div v-else style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1rem">
        <div v-for="e in equipos" :key="e.id" class="card">
          <div class="card-body">
            <h3 style="font-weight:700;margin-bottom:.25rem">{{ e.nombre }}</h3>
            <p style="font-size:.875rem;color:#6b7280;margin-bottom:.5rem">{{ e.proyecto?.nombre || 'Sin proyecto' }}</p>
            <div style="display:flex;gap:.5rem;margin-bottom:.75rem">
              <span class="badge badge-indigo">{{ e.miembros || 0 }} miembros</span>
              <span v-if="e.vacantes > 0" class="badge badge-participante">{{ e.vacantes }} vacantes</span>
            </div>
            <button class="btn btn-sm btn-indigo btn-block" @click="solicitar(e.id)" :disabled="e.solicitado">{{ e.solicitado ? 'Solicitud enviada' : 'Solicitar ingreso' }}</button>
          </div>
        </div>
      </div>
      <div v-if="!loading && !equipos.length" class="empty-state"><h3>No se encontraron equipos</h3></div>
    </div>
  </AppLayout>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import AppLayout from '../../components/layout/AppLayout.vue'
import api from '../../services/api'
const equipos = ref([]); const search = ref(''); const loading = ref(true)
let dt=null; function doSearch() { clearTimeout(dt); dt=setTimeout(fetch,300) }
async function fetch() { loading.value=true; try { const r = await api.get('/participante/equipos-disponibles', { params: { search: search.value } }); equipos.value=r.data.data||[] } catch(e){} finally { loading.value=false } }
async function solicitar(id) { try { await api.post(`/participante/solicitudes`, { equipo_id: id }); fetch() } catch(e){alert(e.response?.data?.message||'Error')} }
onMounted(fetch)
</script>
