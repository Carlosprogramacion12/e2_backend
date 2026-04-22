<template>
  <AppLayout>
    <div style="max-width:64rem;margin:0 auto;padding-top:2rem">
      <!-- Encabezado -->
      <div style="margin-bottom:2rem;display:flex;justify-content:space-between;align-items:center">
        <h2 style="font-size:1.5rem;font-weight:700;color:var(--text-primary)">Nueva Carrera</h2>
        <nav style="font-size:.875rem;color:var(--text-muted);display:flex;gap:.5rem;align-items:center">
          <router-link to="/admin/dashboard" style="color:inherit;text-decoration:none" class="hover:text-indigo-600">Dashboard</router-link>
          <span>/</span>
          <router-link to="/admin/carreras" style="color:inherit;text-decoration:none" class="hover:text-indigo-600">Carreras</router-link>
          <span>/</span>
          <span style="color:#4f46e5;font-weight:600">Nueva</span>
        </nav>
      </div>

      <div style="background:var(--card-bg,#fff);border:1px solid var(--border,#e5e7eb);border-radius:.5rem;box-shadow:0 1px 3px rgba(0,0,0,.1);overflow:hidden">
        <div style="padding:1rem 1.5rem;border-bottom:1px solid var(--border,#e5e7eb)">
          <h3 style="font-weight:600;color:var(--text-primary)">Detalles de la Carrera</h3>
        </div>

        <form @submit.prevent="save" style="padding:2rem">
          <div style="display:flex;flex-wrap:wrap;gap:1.5rem;margin-bottom:2rem">
            <!-- Nombre -->
            <div style="flex:1;min-width:18rem">
              <label style="display:block;margin-bottom:.5rem;font-weight:500;color:var(--text-primary)">
                Nombre <span style="color:#ef4444">*</span>
              </label>
              <input v-model="form.nombre" type="text" placeholder="Ej. Ingeniería Mecánica" required autofocus
                style="width:100%;box-sizing:border-box;border:1.5px solid var(--border,#d1d5db);border-radius:.375rem;padding:.75rem 1.25rem;font-weight:500;outline:none;transition:border-color .2s;background:var(--input-bg,transparent);color:var(--text-primary)" />
            </div>

            <!-- Clave -->
            <div style="flex:1;min-width:18rem">
              <label style="display:block;margin-bottom:.5rem;font-weight:500;color:var(--text-primary)">
                Clave <span style="color:#ef4444">*</span>
              </label>
              <input v-model="form.clave" type="text" placeholder="Ej. IM" required
                style="width:100%;box-sizing:border-box;border:1.5px solid var(--border,#d1d5db);border-radius:.375rem;padding:.75rem 1.25rem;font-weight:500;outline:none;transition:border-color .2s;background:var(--input-bg,transparent);color:var(--text-primary)" />
            </div>
          </div>

          <!-- BOTONES -->
          <div style="display:flex;justify-content:flex-end;gap:1rem;margin-top:2rem">
            <router-link to="/admin/carreras"
              style="display:flex;justify-content:center;border-radius:.25rem;border:1px solid #d1d5db;padding:.5rem 1.5rem;font-weight:500;color:#374151;text-decoration:none;transition:background .2s"
              class="hover:bg-gray-50">
              Cancelar
            </router-link>
            <button type="submit"
              style="display:flex;justify-content:center;border-radius:.25rem;background:#4f46e5;padding:.5rem 1.5rem;font-weight:500;color:#fff;transition:opacity .2s;border:none;cursor:pointer"
              class="hover:bg-indigo-700">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref } from 'vue'
import AppLayout from '../../components/layout/AppLayout.vue'
import api from '../../plugins/axios'
import alerts from '../../services/alerts'
import { useRouter } from 'vue-router'

const router = useRouter()
const form = ref({ nombre: '', clave: '' })

async function save() {
  try {
    await api.post('/admin/carreras', form.value)
    router.push({ path: '/admin/carreras', query: { msg: 'Carrera creada con éxito.' } })
  } catch (error) {
    console.error(error)
    alerts.error('Ocurrió un error al guardar la carrera.')
  }
}
</script>
