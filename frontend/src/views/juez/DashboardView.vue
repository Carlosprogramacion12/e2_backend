<template>
  <AppLayout>
    <h2 style="font-size:1.5rem;font-weight:700;margin-bottom:1.5rem">Sala de Evaluación</h2>
    <div v-if="loading" class="loading"><div class="spinner"></div></div>
    <template v-else>
      <div v-if="!eventos.length" class="empty-state">
        <div class="empty-icon">📋</div>
        <h3>No tienes eventos asignados</h3>
        <p>Cuando un administrador te asigne a un evento, aparecerá aquí.</p>
      </div>
      <div v-for="ev in eventos" :key="ev.id" class="card" style="margin-bottom:1.5rem">
        <div class="card-header">
          <span>{{ ev.nombre }}</span>
          <span class="badge badge-indigo">{{ ev.proyectos?.length || 0 }} proyectos</span>
        </div>
        <div class="card-body">
          <p style="font-size:.875rem;color:#6b7280;margin-bottom:1rem">{{ ev.descripcion || '' }}</p>
          <div style="display:flex;flex-direction:column;gap:.75rem">
            <div v-for="p in ev.proyectos" :key="p.id" class="event-item" @click="$router.push(`/juez/evaluar/${p.id}`)">
              <div class="event-date-box" style="background:rgba(79,70,229,.1);border-color:rgba(79,70,229,.2)">
                <svg style="width:1.5rem;height:1.5rem;color:#4f46e5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
              </div>
              <div style="flex:1">
                <h4 style="font-size:.875rem;font-weight:700">{{ p.nombre }}</h4>
                <p style="font-size:.75rem;color:#6b7280">Equipo: {{ p.equipo || '-' }}</p>
              </div>
              <span v-if="p.evaluado" class="badge badge-participante">✓ Evaluado</span>
              <span v-else class="badge badge-juez">Pendiente</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </AppLayout>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import AppLayout from '../../components/layout/AppLayout.vue'
import api from '../../services/api'
const eventos = ref([]); const loading = ref(true)
onMounted(async () => { try { const r = await api.get('/juez/dashboard'); eventos.value = r.data.data.eventos || [] } catch(e){} finally { loading.value = false } })
</script>
