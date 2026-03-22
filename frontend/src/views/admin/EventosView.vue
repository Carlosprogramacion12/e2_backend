<template>
  <AppLayout>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem">
      <h2 style="font-size:1.5rem;font-weight:700">Gestión de Eventos</h2>
      <button class="btn btn-indigo" @click="showModal=true"><span>+</span> Nuevo Evento</button>
    </div>
    <div v-if="msg" class="alert alert-success">{{ msg }}</div>
    <div class="table-container">
      <div v-if="loading" class="loading"><div class="spinner"></div></div>
      <table v-else>
        <thead><tr><th>Nombre</th><th>Descripción</th><th>Fecha Inicio</th><th>Fecha Fin</th><th style="text-align:right">Acciones</th></tr></thead>
        <tbody><tr v-for="e in eventos" :key="e.id">
          <td style="font-weight:500">{{ e.nombre }}</td>
          <td style="color:#6b7280;font-size:.875rem">{{ (e.descripcion||'').substring(0,60) }}{{ e.descripcion?.length > 60 ? '...' : '' }}</td>
          <td>{{ fmt(e.fecha_inicio) }}</td><td>{{ fmt(e.fecha_fin) }}</td>
          <td style="text-align:right">
            <div style="display:flex;justify-content:flex-end;gap:.75rem">
              <button class="action-icon" @click="edit(e)"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button>
              <button class="action-icon danger" @click="del(e.id)"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
            </div>
          </td>
        </tr></tbody>
      </table>
    </div>
    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content" style="max-width:32rem">
        <div class="modal-header">{{ editing?'Editar':'Nuevo' }} Evento <button class="modal-close" @click="close">✕</button></div>
        <div class="modal-body"><form @submit.prevent="save">
          <div class="form-group"><label>Nombre</label><input v-model="form.nombre" class="form-control" required></div>
          <div class="form-group"><label>Descripción</label><textarea v-model="form.descripcion" class="form-control"></textarea></div>
          <div style="display:flex;gap:1rem">
            <div class="form-group" style="flex:1"><label>Fecha Inicio</label><input v-model="form.fecha_inicio" type="date" class="form-control" required></div>
            <div class="form-group" style="flex:1"><label>Fecha Fin</label><input v-model="form.fecha_fin" type="date" class="form-control" required></div>
          </div>
          <button type="submit" class="btn btn-indigo btn-block">{{ editing?'Actualizar':'Crear' }}</button>
        </form></div>
      </div>
    </div>
  </AppLayout>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import AppLayout from '../../components/layout/AppLayout.vue'
import api from '../../services/api'
const eventos = ref([]); const loading = ref(true); const showModal = ref(false); const editing = ref(null); const msg = ref('')
const form = ref({ nombre:'', descripcion:'', fecha_inicio:'', fecha_fin:'' })
const fmt = d => d ? new Date(d).toLocaleDateString('es-MX',{day:'2-digit',month:'short',year:'numeric'}) : '-'
async function fetch() { loading.value=true; try { const r = await api.get('/admin/eventos'); eventos.value=r.data.data.eventos||r.data.data } catch(e){} finally { loading.value=false } }
function edit(e) { editing.value=e; form.value={nombre:e.nombre,descripcion:e.descripcion||'',fecha_inicio:e.fecha_inicio?.split('T')[0]||'',fecha_fin:e.fecha_fin?.split('T')[0]||''}; showModal.value=true }
function close() { showModal.value=false; editing.value=null; form.value={nombre:'',descripcion:'',fecha_inicio:'',fecha_fin:''} }
async function save() { try { if(editing.value) await api.put(`/admin/eventos/${editing.value.id}`,form.value); else await api.post('/admin/eventos',form.value); close(); msg.value='Evento guardado.'; fetch(); setTimeout(()=>msg.value='',3000) } catch(e){alert(e.response?.data?.message||'Error')} }
async function del(id) { if(!confirm('¿Eliminar este evento?'))return; try{await api.delete(`/admin/eventos/${id}`);msg.value='Evento eliminado.';fetch();setTimeout(()=>msg.value='',3000)}catch(e){alert('Error')} }
onMounted(fetch)
</script>
