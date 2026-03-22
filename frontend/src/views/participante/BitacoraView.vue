<template>
  <AppLayout>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem">
      <h2 style="font-size:1.5rem;font-weight:700">📝 Bitácora de Avances</h2>
      <button class="btn btn-indigo" @click="showModal=true"><span>+</span> Nuevo Avance</button>
    </div>
    <div v-if="loading" class="loading"><div class="spinner"></div></div>
    <template v-else>
      <div v-if="!avances.length" class="card"><div class="card-body empty-state"><div class="empty-icon">📓</div><h3>Sin avances registrados</h3><p>Comienza documentando el progreso de tu proyecto.</p></div></div>
      <div v-else class="timeline">
        <div v-for="a in avances" :key="a.id" class="timeline-item">
          <p class="timeline-date">{{ fmt(a.created_at) }}</p>
          <h4 style="font-weight:600;margin-bottom:.25rem">{{ a.titulo }}</h4>
          <p style="font-size:.875rem;color:#6b7280">{{ a.descripcion }}</p>
        </div>
      </div>
    </template>
    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content" style="max-width:32rem">
        <div class="modal-header">Nuevo Avance <button class="modal-close" @click="showModal=false">✕</button></div>
        <div class="modal-body"><form @submit.prevent="save">
          <div class="form-group"><label>Título</label><input v-model="form.titulo" class="form-control" required></div>
          <div class="form-group"><label>Descripción</label><textarea v-model="form.descripcion" class="form-control" rows="4" required></textarea></div>
          <button type="submit" class="btn btn-indigo btn-block">Guardar</button>
        </form></div>
      </div>
    </div>
  </AppLayout>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import AppLayout from '../../components/layout/AppLayout.vue'
import api from '../../services/api'
const avances = ref([]); const loading = ref(true); const showModal = ref(false)
const form = ref({ titulo:'', descripcion:'' })
const fmt = d => d ? new Date(d).toLocaleDateString('es-MX',{day:'2-digit',month:'long',year:'numeric'}) : ''
async function fetch() { try { const r = await api.get('/participante/avances'); avances.value=r.data.data||[] } catch(e){} finally { loading.value=false } }
async function save() { try { await api.post('/participante/avances', form.value); showModal.value=false; form.value={titulo:'',descripcion:''}; fetch() } catch(e){alert('Error')} }
onMounted(fetch)
</script>
