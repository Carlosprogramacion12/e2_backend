<template>
  <AppLayout>
    <h2 style="font-size:1.5rem;font-weight:700;margin-bottom:1.5rem">Registro de Participante</h2>
    <div class="card" style="max-width:40rem">
      <div class="card-body">
        <div v-if="msg" class="alert alert-success">{{ msg }}</div>
        <form @submit.prevent="save">
          <div class="form-group"><label>Matrícula / No. Control</label><input v-model="form.matricula" class="form-control" required></div>
          <div class="form-group"><label>Semestre</label><select v-model="form.semestre" class="form-control" required><option v-for="s in 12" :key="s" :value="s">{{ s }}° Semestre</option></select></div>
          <div class="form-group"><label>Carrera</label><select v-model="form.carrera" class="form-control" required><option value="">Seleccionar...</option><option v-for="(nombre, i) in carrerasDisponibles" :key="i" :value="nombre">{{ nombre }}</option></select></div>
          <div class="form-group"><label>Perfil</label><select v-model="form.perfil_id" class="form-control"><option value="">Seleccionar...</option><option v-for="p in perfiles" :key="p.id" :value="p.id">{{ p.nombre }}</option></select></div>
          <button type="submit" class="btn btn-indigo btn-block" style="padding:.75rem">Completar Registro</button>
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
const router = useRouter(); const msg = ref(''); const perfiles = ref([])
const carrerasDisponibles = [
  'Ingeniería en Sistemas Computacionales',
  'Ingeniería Mecánica',
  'Ingeniería Eléctrica',
  'Ingeniería Electrónica',
  'Ingeniería Química',
  'Ingeniería Industrial',
  'Ingeniería Civil',
  'Ingeniería en Gestión Empresarial',
  'Licenciatura en Administración',
  'Contador Público'
]
const form = ref({ matricula:'', semestre:'', carrera:'', perfil_id:'' })
onMounted(async () => { try { const r = await api.get('/participante/registro-inicial'); perfiles.value=r.data.data?.perfiles||[] } catch(e){} })
async function save() { try { await api.post('/participante/registro-inicial', form.value); msg.value='Registro completado'; setTimeout(()=>router.push('/participante/dashboard'),1500) } catch(e){alert(e.response?.data?.message||'Error')} }
</script>
