<template>
  <AppLayout>
    <h2 style="font-size:1.5rem;font-weight:700;margin-bottom:1.5rem">Resultados y Rankings</h2>
    <div class="table-container" style="margin-bottom:1.5rem">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem">
        <h3 style="font-size:1.1rem;font-weight:700">🏆 Ranking de Proyectos</h3>
        <select v-model="eventoId" class="form-control" style="width:220px" @change="fetch"><option value="">Último evento</option><option v-for="e in eventos" :key="e.id" :value="e.id">{{ e.nombre }}</option></select>
      </div>
      <div v-if="loading" class="loading"><div class="spinner"></div></div>
      <table v-else>
        <thead><tr><th style="width:60px">#</th><th>Proyecto</th><th>Equipo</th><th>Puntaje</th><th style="text-align:right">Constancia</th></tr></thead>
        <tbody><tr v-for="(r,i) in ranking" :key="r.id">
          <td>
            <span v-if="i<3" style="display:inline-flex;align-items:center;justify-content:center;width:2rem;height:2rem;border-radius:50%;font-weight:700;font-size:.875rem"
              :style="{ background: i===0?'#fef3c7':i===1?'#f3f4f6':'#fed7aa', color: i===0?'#92400e':i===1?'#374151':'#9a3412' }">{{ i+1 }}</span>
            <span v-else class="badge badge-indigo">{{ i+1 }}</span>
          </td>
          <td style="font-weight:500">{{ r.nombre }}</td><td>{{ r.equipo }}</td>
          <td style="font-weight:700;color:#4f46e5">{{ r.puntaje }}</td>
          <td style="text-align:right"><a :href="`/api/admin/resultados/constancia/${r.id}/${i+1}`" target="_blank" class="btn btn-sm btn-indigo">📄 PDF</a></td>
        </tr></tbody>
      </table>
      <div v-if="!loading && !ranking.length" class="empty-state"><h3>No hay resultados disponibles</h3></div>
    </div>
  </AppLayout>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import AppLayout from '../../components/layout/AppLayout.vue'
import api from '../../services/api'
const ranking = ref([]); const eventos = ref([]); const eventoId = ref(''); const loading = ref(true)
async function fetch() { loading.value=true; try { const r = await api.get('/admin/resultados', { params: { evento_id: eventoId.value } }); ranking.value=r.data.data.ranking||[]; eventos.value=r.data.data.eventos||[] } catch(e){} finally { loading.value=false } }
onMounted(fetch)
</script>
