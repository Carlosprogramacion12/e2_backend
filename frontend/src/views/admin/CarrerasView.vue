<template>
  <AppLayout>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem">
      <h2 style="font-size:1.5rem;font-weight:700">🎓 Gestión de Carreras</h2>
      <button class="btn btn-indigo" @click="showModal=true"><span>+</span> Nueva Carrera</button>
    </div>
    <div v-if="msg" class="alert alert-success">{{ msg }}</div>
    <div class="table-container">
      <table>
        <thead><tr><th>Nombre</th><th>Clave</th><th style="text-align:right">Acciones</th></tr></thead>
        <tbody><tr v-for="c in carreras" :key="c.id">
          <td style="font-weight:500">{{ c.nombre }}</td><td><span class="badge badge-indigo">{{ c.clave || '-' }}</span></td>
          <td style="text-align:right"><div style="display:flex;justify-content:flex-end;gap:.75rem">
            <button class="action-icon" @click="edit(c)"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button>
            <button class="action-icon danger" @click="del(c.id)"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
          </div></td>
        </tr></tbody>
      </table>
    </div>
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content" style="max-width:28rem">
        <div class="modal-header">{{ editing?'Editar':'Nueva' }} Carrera <button class="modal-close" @click="close">✕</button></div>
        <div class="modal-body"><form @submit.prevent="save">
          <div class="form-group"><label>Nombre</label><input v-model="form.nombre" class="form-control" required></div>
          <div class="form-group"><label>Clave</label><input v-model="form.clave" class="form-control"></div>
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
const carreras = ref([]); const showModal = ref(false); const editing = ref(null); const msg = ref('')
const form = ref({ nombre:'', clave:'' })
async function fetch() { try { const r = await api.get('/admin/carreras'); carreras.value=r.data.data||[] } catch(e){} }
function edit(c) { editing.value=c; form.value={nombre:c.nombre,clave:c.clave||''}; showModal.value=true }
function close() { showModal.value=false; editing.value=null; form.value={nombre:'',clave:''} }
async function save() { try { if(editing.value) await api.put(`/admin/carreras/${editing.value.id}`,form.value); else await api.post('/admin/carreras',form.value); close(); msg.value='Carrera guardada.'; fetch(); setTimeout(()=>msg.value='',3000) } catch(e){alert('Error')} }
async function del(id) { if(!confirm('¿Eliminar?'))return; await api.delete(`/admin/carreras/${id}`); msg.value='Carrera eliminada.'; fetch(); setTimeout(()=>msg.value='',3000) }
onMounted(fetch)
</script>
