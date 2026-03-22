<template>
  <AppLayout>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem">
      <h2 style="font-size:1.5rem;font-weight:700">Evaluar Proyecto</h2>
      <button class="btn btn-outline" @click="$router.back()">← Volver</button>
    </div>
    <div v-if="loading" class="loading"><div class="spinner"></div></div>
    <div v-else class="card">
      <div class="card-header">{{ proyecto.nombre }}</div>
      <div class="card-body">
        <p style="font-size:.875rem;color:#6b7280;margin-bottom:1.5rem">{{ proyecto.descripcion || 'Sin descripción' }}</p>
        <form @submit.prevent="save">
          <div v-for="c in criterios" :key="c.id" class="form-group" style="border:1px solid #e5e7eb;border-radius:.75rem;padding:1rem;margin-bottom:1rem">
            <div style="display:flex;justify-content:space-between;margin-bottom:.5rem">
              <label style="font-weight:600;margin:0">{{ c.nombre }} <span style="font-size:.75rem;color:#9ca3af">({{ c.porcentaje }}%)</span></label>
              <span style="font-size:1.1rem;font-weight:700;color:#4f46e5">{{ c.score || 0 }}</span>
            </div>
            <p style="font-size:.75rem;color:#9ca3af;margin-bottom:.5rem">{{ c.descripcion || '' }}</p>
            <input type="range" min="0" max="100" v-model.number="c.score" style="width:100%;accent-color:#4f46e5">
          </div>
          <div class="form-group"><label>Comentario General</label><textarea v-model="comentario" class="form-control" rows="3" placeholder="Escribe un comentario..."></textarea></div>
          <button type="submit" class="btn btn-indigo btn-block" style="padding:.75rem">Guardar Evaluación</button>
        </form>
      </div>
    </div>
  </AppLayout>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '../../components/layout/AppLayout.vue'
import api from '../../services/api'
const route = useRoute(); const router = useRouter()
const proyecto = ref({}); const criterios = ref([]); const comentario = ref(''); const loading = ref(true)
onMounted(async () => {
  try {
    const r = await api.get(`/juez/evaluar/${route.params.id}`)
    proyecto.value = r.data.data.proyecto || {}
    criterios.value = (r.data.data.criterios || []).map(c => ({ ...c, score: c.calificacion || 0 }))
    comentario.value = r.data.data.comentario || ''
  } catch(e){} finally { loading.value = false }
})
async function save() {
  try {
    await api.post(`/juez/evaluar/${route.params.id}`, { calificaciones: criterios.value.map(c => ({ criterio_id: c.id, puntaje: c.score })), comentario: comentario.value })
    alert('Evaluación guardada'); router.push('/juez/dashboard')
  } catch(e) { alert(e.response?.data?.message || 'Error') }
}
</script>
