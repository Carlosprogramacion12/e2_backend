<template>
  <AppLayout>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem">
      <h2 style="font-size:1.5rem;font-weight:700;color:var(--text-primary)">Editar Proyecto</h2>
      <router-link :to="`/admin/proyectos/${route.params.id}`" class="btn btn-white hover:bg-gray-50 text-gray-700" style="padding:.5rem 1rem;border-radius:.5rem;font-size:.75rem;font-weight:700;text-transform:uppercase;display:inline-flex;align-items:center;box-shadow:0 1px 2px rgba(0,0,0,0.05);text-decoration:none">
        <svg style="width:1rem;height:1rem;margin-right:.5rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        Cancelar y Volver
      </router-link>
    </div>

    <!-- Error/Success Alerts -->
    <div v-if="successMsg" class="alert alert-success" style="margin-bottom:1.5rem">
      <svg style="width:1.25rem;height:1.25rem;color:#34d399;margin-right:0.5rem" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
      {{ successMsg }}
    </div>
    <div v-if="errorMsg" class="alert alert-danger" style="margin-bottom:1.5rem">
      <svg style="width:1.25rem;height:1.25rem;color:#ef4444;margin-right:0.5rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      {{ errorMsg }}
    </div>

    <div v-if="loading" style="padding:4rem;text-align:center"><div class="spinner"></div></div>

    <div v-else style="background:var(--bg-main);min-height:100vh;padding-bottom:3rem">
      <div style="max-width:48rem;margin:0 auto">
        
        <div style="background:var(--bg-card);border-radius:1rem;box-shadow:0 1px 2px rgba(0,0,0,.05);border:1px solid var(--border-color);overflow:hidden;position:relative">
          
          <!-- Decoración Superior -->
          <div style="height:.375rem;width:100%;background:linear-gradient(to right, #6366f1, #9333ea)"></div>

          <div style="padding:2rem">
            <div style="margin-bottom:2rem">
              <h3 style="font-size:1.125rem;font-weight:700;color:var(--text-primary);margin:0">Información del Proyecto</h3>
              <p style="font-size:.875rem;color:var(--text-muted);margin:.25rem 0 0">Actualiza los detalles técnicos y descriptivos visibles para los jueces.</p>
            </div>

            <form @submit.prevent="saveProyecto" style="display:flex;flex-direction:column;gap:1.5rem">
              
              <!-- Nombre del Proyecto -->
              <div>
                <label style="display:block;margin-bottom:.5rem;font-weight:700;font-size:.875rem;color:var(--text-primary)">Nombre del Proyecto</label>
                <div style="position:relative">
                  <input type="text" v-model="form.nombre" required autofocus
                        style="width:100%;padding:.75rem 2.5rem .75rem 1rem;border-radius:.75rem;border:1px solid var(--border-color);background:var(--bg-input);font-size:.875rem;color:var(--text-primary);transition:all 0.2s"
                        class="focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                  <div style="position:absolute;inset-block:0;right:0;padding-right:.75rem;display:flex;align-items:center;pointer-events:none;color:var(--text-muted)">
                    <svg style="width:1.25rem;height:1.25rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                  </div>
                </div>
              </div>

              <!-- URL Repositorio -->
              <div>
                <label style="display:block;margin-bottom:.5rem;font-weight:700;font-size:.875rem;color:var(--text-primary)">Enlace al Repositorio</label>
                <div style="position:relative">
                  <div style="position:absolute;inset-block:0;left:0;padding-left:.75rem;display:flex;align-items:center;pointer-events:none;color:var(--text-muted)">
                    <svg style="width:1.25rem;height:1.25rem" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                  </div>
                  <input type="url" v-model="form.repositorio_url" placeholder="https://github.com/usuario/repositorio"
                        style="width:100%;padding:.75rem 1rem .75rem 2.5rem;border-radius:.75rem;border:1px solid var(--border-color);background:var(--bg-input);font-size:.875rem;color:var(--text-primary);font-family:monospace;transition:all 0.2s"
                        class="focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                </div>
              </div>

              <!-- Descripción -->
              <div>
                <label style="display:block;margin-bottom:.5rem;font-weight:700;font-size:.875rem;color:var(--text-primary)">Descripción Detallada</label>
                <textarea v-model="form.descripcion" rows="6" required placeholder="Describe el objetivo, alcance y tecnologías del proyecto..."
                          style="width:100%;padding:1rem;border-radius:.75rem;border:1px solid var(--border-color);background:var(--bg-input);color:var(--text-primary);line-height:1.6;transition:all 0.2s"
                          class="focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"></textarea>
              </div>

              <!-- Footer con Acciones -->
              <div style="display:flex;align-items:center;justify-content:flex-end;gap:1rem;padding-top:1rem;border-top:1px solid var(--border-color)">
                <router-link :to="`/admin/proyectos/${route.params.id}`" style="font-size:.875rem;font-weight:500;color:var(--text-muted);text-decoration:none;transition:color 0.2s" class="hover:text-gray-800">
                  Descartar Cambios
                </router-link>

                <button type="submit" :disabled="saving" class="btn btn-indigo" style="padding:.75rem 1.5rem;border-radius:.75rem;font-weight:700;font-size:.875rem;display:inline-flex;align-items:center;box-shadow:0 4px 6px -1px rgba(99, 102, 241, 0.3), 0 2px 4px -1px rgba(99, 102, 241, 0.2);transition:all 0.2s">
                  <span v-if="saving" style="margin-right:.5rem" class="spinner-small"></span>
                  <svg v-else style="width:1.25rem;height:1.25rem;margin-right:.5rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
                  Guardar Actualización
                </button>
              </div>

            </form>

          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppLayout from '../../components/layout/AppLayout.vue'
import api from '../../plugins/axios'

const router = useRouter()
const route = useRoute()

const loading = ref(true)
const saving = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const form = ref({
  nombre: '',
  repositorio_url: '',
  descripcion: ''
})

onMounted(async () => {
  const id = route.params.id
  try {
    const r = await api.get(`/admin/proyectos/${id}`)
    const prj = r.data.data
    form.value.nombre = prj.nombre || ''
    form.value.repositorio_url = prj.repositorio_url || ''
    form.value.descripcion = prj.descripcion || ''
  } catch (e) {
    errorMsg.value = 'Error al cargar los datos del proyecto.'
  } finally {
    loading.value = false
  }
})

async function saveProyecto() {
  saving.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    await api.put(`/admin/proyectos/${route.params.id}`, form.value)
    successMsg.value = 'Proyecto actualizado exitosamente.'
    setTimeout(() => {
      router.push(`/admin/proyectos/${route.params.id}`)
    }, 1500)
  } catch (e) {
    errorMsg.value = e.response?.data?.message || 'Error al actualizar el proyecto.'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.spinner-small {
  border: 2px solid rgba(255,255,255,0.3);
  border-left-color: white;
  border-radius: 50%;
  width: 1rem;
  height: 1rem;
  animation: spin 1s linear infinite;
}

.alert-success {
  display: flex;
  align-items: center;
}

.alert-danger {
  display: flex;
  align-items: center;
}
</style>
