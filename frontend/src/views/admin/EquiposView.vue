<template>
  <AppLayout>
    <h2 style="font-size:1.5rem;font-weight:700;margin-bottom:1.5rem">Gestión de Equipos</h2>
    <div class="table-container">
      <div v-if="loading" class="loading"><div class="spinner"></div></div>
      <table v-else>
        <thead><tr><th>Equipo</th><th>Proyecto</th><th>Evento</th><th>Miembros</th></tr></thead>
        <tbody><tr v-for="e in equipos" :key="e.id">
          <td style="font-weight:500">{{ e.nombre }}</td>
          <td>{{ e.proyecto?.nombre || '-' }}</td>
          <td>{{ e.proyecto?.evento?.nombre || '-' }}</td>
          <td><span class="badge badge-indigo">{{ e.participantes?.length || 0 }}</span></td>
        </tr></tbody>
      </table>
      <div v-if="!loading && !equipos.length" class="empty-state"><h3>No hay equipos registrados</h3></div>
    </div>
  </AppLayout>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import AppLayout from '../../components/layout/AppLayout.vue'
import api from '../../services/api'
const equipos = ref([]); const loading = ref(true)
onMounted(async () => { try { const r = await api.get('/admin/equipos'); equipos.value=r.data.data.equipos||r.data.data } catch(e){} finally { loading.value=false } })
</script>
