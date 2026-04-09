<template>
  <AppLayout>
    <div class="py-6">
      <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <!-- Encabezado -->
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Catálogo de Carreras</h2>
          <router-link to="/admin/carreras/crear" 
             style="text-decoration:none;"
             class="inline-flex items-center justify-center rounded-lg bg-indigo-600 py-2 px-6 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10 gap-2 transition-all shadow-md hover:shadow-lg border-none cursor-pointer">
             <span style="font-size: 1.25rem;line-height:1;">+</span> Nueva Carrera
          </router-link>
        </div>

        <div v-if="msg" class="alert alert-success" style="font-weight: 600; font-size: 1.05rem; padding-top: 1rem; padding-bottom: 1rem; margin-bottom: 1.5rem;">
          {{ msg }}
        </div>

        <div class="rounded-3xl border border-gray-200 bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-gray-700 dark:bg-gray-800 sm:px-7.5 xl:pb-1">
          <!-- Buscador -->
          <div class="mb-6">
            <div class="relative w-full sm:w-96">
              <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <input type="text" v-model="searchQuery" 
                placeholder="Buscar por nombre o clave..." 
                class="w-full rounded-lg border-[1.5px] border-gray-300 bg-transparent py-2 pl-10 pr-4 font-medium outline-none transition focus:border-indigo-600 active:border-indigo-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-indigo-600">
            </div>
          </div>

          <div class="max-w-full overflow-x-auto">
            <table class="w-full table-auto">
              <thead>
                <tr class="bg-gray-50 text-left dark:bg-gray-700/50">
                  <th class="min-w-[100px] py-4 px-4 font-bold text-gray-500 dark:text-gray-400 uppercase text-xs tracking-wider xl:pl-11">Clave</th>
                  <th class="min-w-[220px] py-4 px-4 font-bold text-gray-500 dark:text-gray-400 uppercase text-xs tracking-wider">Nombre de la Carrera</th>
                  <th class="min-w-[120px] py-4 px-4 font-bold text-gray-500 dark:text-gray-400 uppercase text-xs tracking-wider">Alumnos</th>
                  <th class="py-4 px-4 font-bold text-gray-500 dark:text-gray-400 text-right uppercase text-xs tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loading" style="border:none">
                  <td colspan="4" class="py-10 text-center"><div class="spinner"></div></td>
                </tr>
                <tr v-else-if="carreras.length === 0">
                  <td colspan="4" class="py-5 px-4 text-center text-gray-500">No se encontraron carreras.</td>
                </tr>
                <tr v-for="carrera in carreras" :key="carrera.id" class="border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td class="py-5 px-4 pl-9 xl:pl-11">
                    <span class="inline-block rounded bg-gray-100 px-2.5 py-0.5 text-sm font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-300 font-mono">
                      {{ carrera.clave || '-' }}
                    </span>
                  </td>
                  <td class="py-5 px-4">
                    <div style="display:flex;align-items:center;gap:1rem">
                      <div class="user-avatar-sm">
                        <span class="user-avatar-initials">{{ carrera.nombre ? carrera.nombre.substring(0, 1).toUpperCase() : 'C' }}</span>
                      </div>
                      <p class="text-gray-800 dark:text-white font-medium m-0">{{ carrera.nombre }}</p>
                    </div>
                  </td>
                  <td class="py-5 px-4">
                    <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                      {{ carrera.participantes_count || 0 }} inscritos
                    </div>
                  </td>
                  <td class="py-5 px-4 text-right">
                    <div style="display:flex;align-items:center;justify-content:flex-end;gap:.75rem">
                      <router-link :to="`/admin/carreras/${carrera.id}/editar`" class="action-icon" title="Editar">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </router-link>
                      <button class="action-icon danger" @click="del(carrera.id)" title="Eliminar">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <Pagination 
            v-model="page" 
            :total-pages="pagination.totalPages" 
            @update:model-value="fetchCarreras" 
            style="margin-bottom: 1.5rem;"
          />
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import AppLayout from '../../components/layout/AppLayout.vue'
import Pagination from '../../components/common/Pagination.vue'
import api from '../../services/api'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const carreras = ref([])
const msg = ref(route.query.msg || '')
const searchQuery = ref('')
const page = ref(1)
const loading = ref(false)
const pagination = ref({ total: 0, totalPages: 1 })

watch(searchQuery, () => {
  page.value = 1
  fetchCarreras()
})

async function fetchCarreras() {
  loading.value = true
  try {
    const params = {
      page: page.value,
      search: searchQuery.value,
      limit: 10
    }
    const res = await api.get('/admin/carreras', { params })
    carreras.value = res.data.data || []
    pagination.value = res.data.pagination || { total: carreras.value.length, totalPages: 1 }
  } catch (error) {
    console.error('Error fetching carreras:', error)
  } finally {
    loading.value = false
  }
}

async function del(id) {
  if (!confirm('¿Seguro que deseas eliminar esta carrera?')) return
  try {
    await api.delete(`/admin/carreras/${id}`)
    msg.value = 'Carrera eliminada con éxito.'
    fetchCarreras()
    setTimeout(() => msg.value = '', 3000)
    router.replace({ query: null })
  } catch (error) {
    console.error(error)
    alert('Ocurrió un error al eliminar la carrera.')
  }
}

onMounted(() => {
  fetchCarreras()
  if (msg.value) {
    setTimeout(() => { msg.value = '' }, 3000)
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; font-family: 'Inter', sans-serif; }
.mb-6 { margin-bottom: 1.5rem; }
.mb-4 { margin-bottom: 1rem; }
.pb-2\.5 { padding-bottom: 0.625rem; }
.pt-6 { padding-top: 1.5rem; }
.px-5 { padding-left: 1.25rem; padding-right: 1.25rem; }
.px-4 { padding-left: 1rem; padding-right: 1rem; }
.px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
.px-2\.5 { padding-left: 0.625rem; padding-right: 0.625rem; }
.py-5 { padding-top: 1.25rem; padding-bottom: 1.25rem; }
.py-4 { padding-top: 1rem; padding-bottom: 1rem; }
.py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
.py-0\.5 { padding-top: 0.125rem; padding-bottom: 0.125rem; }
.pl-3 { padding-left: 0.75rem; }
.pl-9 { padding-left: 2.25rem; }
.pr-4 { padding-right: 1rem; }
.pl-10 { padding-left: 2.5rem; }

.max-w-7xl { max-width: 80rem; }
.max-w-full { max-width: 100%; }
.max-w-md { max-width: 28rem; }
.w-full { width: 100%; }
.w-5 { width: 1.25rem; }
.w-4 { width: 1rem; }
.h-5 { height: 1.25rem; }
.h-4 { height: 1rem; }
.h-10 { height: 2.5rem; }
.w-10 { width: 2.5rem; }

.mx-auto { margin-left: auto; margin-right: auto; }
.m-0 { margin: 0; }

.flex { display: flex; }
.inline-flex { display: inline-flex; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.justify-center { justify-content: center; }
.justify-end { justify-content: flex-end; }
.shrink-0 { flex-shrink: 0; }
.gap-2 { gap: 0.5rem; }
.gap-3 { gap: 0.75rem; }
.space-x-3\.5 > * + * { margin-left: 0.875rem; }

.relative { position: relative; }
.absolute { position: absolute; }
.fixed { position: fixed; }
.inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
.inset-y-0 { top: 0; bottom: 0; }
.left-0 { left: 0; }
.z-50 { z-index: 50; }

.text-2xl { font-size: 1.5rem; line-height: 2rem; }
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }
.text-xs { font-size: 0.75rem; line-height: 1rem; }
.font-bold { font-weight: 700; }
.font-medium { font-weight: 500; }
.font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }

.uppercase { text-transform: uppercase; }
.tracking-wider { letter-spacing: 0.05em; }
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

.text-white { opacity: 1; color: rgb(255 255 255); }
.text-gray-800 { opacity: 1; color: rgb(31 41 55); }
.text-gray-700 { opacity: 1; color: rgb(55 65 81); }
.text-gray-600 { opacity: 1; color: rgb(75 85 99); }
.text-gray-500 { opacity: 1; color: rgb(107 114 128); }
.text-gray-400 { opacity: 1; color: rgb(156 163 175); }
.text-indigo-600 { opacity: 1; color: rgb(79 70 229); }
.text-green-800 { opacity: 1; color: rgb(22 101 52); }

.bg-white { opacity: 1; background-color: rgb(255 255 255); }
.bg-black { opacity: 1; background-color: rgb(0 0 0); }
.bg-indigo-600 { opacity: 1; background-color: rgb(79 70 229); }
.bg-indigo-50 { opacity: 1; background-color: rgb(238 242 255); }
.bg-gray-50 { opacity: 1; background-color: rgb(249 250 251); }
.bg-gray-100 { opacity: 1; background-color: rgb(243 244 246); }
.bg-gray-200 { opacity: 1; background-color: rgb(229 231 235); }
.bg-green-50 { opacity: 1; background-color: rgb(240 253 244); }
.bg-transparent { background-color: transparent; }
.bg-opacity-50 { --tw-bg-opacity: 0.5; }

.hover\:bg-gray-50:hover { opacity: 1; background-color: rgb(249 250 251); }
.hover\:bg-gray-200:hover { opacity: 1; background-color: rgb(229 231 235); }
.hover\:bg-indigo-700:hover { opacity: 1; background-color: rgb(67 56 202); }
.hover\:text-indigo-600:hover { opacity: 1; color: rgb(79 70 229); }
.hover\:text-red-600:hover { opacity: 1; color: rgb(220 38 38); }
.hover\:text-gray-600:hover { opacity: 1; color: rgb(75 85 99); }
.hover\:bg-opacity-90:hover { opacity: 0.9; }

.border { border-width: 1px; border-style: solid; }
.border-b { border-bottom-width: 1px; border-bottom-style: solid; }
.border-\[1\.5px\] { border-width: 1.5px; border-style: solid; }
.border-gray-100 { border-color: rgb(243 244 246); }
.border-gray-200 { border-color: rgb(229 231 235); }
.border-gray-300 { border-color: rgb(209 213 219); }
.border-green-200 { border-color: rgb(187 247 208); }

.rounded { border-radius: 0.25rem; }
.rounded-lg { border-radius: 0.5rem; }
.rounded-xl { border-radius: 0.75rem; }
.rounded-3xl { border-radius: 1.5rem; }
.rounded-full { border-radius: 9999px; }

.shadow-sm { box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }
.shadow-md { box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); }
.shadow-lg { box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1); }
.shadow-default { box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1); }

.overflow-x-auto { overflow-x: auto; }
.overflow-hidden { overflow: hidden; }
.pointer-events-none { pointer-events: none; }
.outline-none { outline: 2px solid transparent; outline-offset: 2px; }

.transition { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
.transition-colors { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
.transition-all { transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
.transition-opacity { transition-property: opacity; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }

.table-auto { table-layout: auto; border-collapse: collapse; }
.min-w-\[100px\] { min-width: 100px; }
.min-w-\[220px\] { min-width: 220px; }
.min-w-\[120px\] { min-width: 120px; }

@media (min-width: 640px) {
  .sm\:px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
  .sm\:px-7\.5 { padding-left: 1.875rem; padding-right: 1.875rem; }
  .sm\:w-96 { width: 24rem; }
}

@media (min-width: 1024px) {
  .lg\:px-8 { padding-left: 2rem; padding-right: 2rem; }
}

@media (min-width: 1280px) {
  .xl\:pb-1 { padding-bottom: 0.25rem; }
  .xl\:pl-11 { padding-left: 2.75rem; }
  .xl\:px-10 { padding-left: 2.5rem; padding-right: 2.5rem; }
}

input:focus { border-color: rgb(79 70 229); }
</style>
