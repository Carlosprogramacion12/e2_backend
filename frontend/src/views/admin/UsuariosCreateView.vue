<template>
  <AppLayout>
    <div style="max-width:64rem;margin:0 auto">
      <!-- Encabezado -->
      <div style="margin-bottom:2rem;display:flex;justify-content:space-between;align-items:center">
        <h2 style="font-size:1.5rem;font-weight:700;color:var(--text-primary)">Nuevo Usuario</h2>
        <nav style="font-size:.875rem;color:var(--text-muted);display:flex;gap:.5rem;align-items:center">
          <router-link to="/admin/dashboard" style="color:inherit;text-decoration:none" class="hover:text-indigo-600">Dashboard</router-link>
          <span>/</span>
          <router-link to="/admin/usuarios" style="color:inherit;text-decoration:none" class="hover:text-indigo-600">Usuarios</router-link>
          <span>/</span>
          <span style="color:#4f46e5;font-weight:600">Crear</span>
        </nav>
      </div>

      <!-- Contenedor -->
      <div style="background:var(--card-bg,#fff);border:1px solid var(--border,#e5e7eb);border-radius:.5rem;box-shadow:0 1px 3px rgba(0,0,0,.1);overflow:hidden">
        <div style="padding:1rem 1.5rem;border-bottom:1px solid var(--border,#e5e7eb)">
          <h3 style="font-weight:600;color:var(--text-primary)">Información de la Cuenta</h3>
        </div>

        <form @submit.prevent="saveUser" style="padding:2rem">
          <div v-if="error" class="alert alert-red" style="margin-bottom:1.5rem">{{ error }}</div>

          <!-- SECCIÓN 1: DATOS PERSONALES -->
          <div style="display:flex;flex-wrap:wrap;gap:1.5rem;margin-bottom:1.5rem">
            <!-- Nombre -->
            <div style="flex:1;min-width:18rem">
              <label style="display:block;margin-bottom:.5rem;font-weight:500;color:var(--text-primary)">
                Nombre Completo <span style="color:#ef4444">*</span>
              </label>
              <input v-model="form.name" type="text" placeholder="Ej. Juan Pérez" required autofocus
                style="width:100%;border:1.5px solid var(--border,#d1d5db);border-radius:.375rem;padding:.75rem 1.25rem;font-weight:500;outline:none;transition:border-color .2s;background:var(--input-bg,transparent);color:var(--text-primary)"
                class="form-input" />
            </div>

            <!-- Email -->
            <div style="flex:1;min-width:18rem">
              <label style="display:block;margin-bottom:.5rem;font-weight:500;color:var(--text-primary)">
                Correo Electrónico <span style="color:#ef4444">*</span>
              </label>
              <input v-model="form.email" type="email" placeholder="usuario@correo.com" required
                style="width:100%;border:1.5px solid var(--border,#d1d5db);border-radius:.375rem;padding:.75rem 1.25rem;font-weight:500;outline:none;transition:border-color .2s;background:var(--input-bg,transparent);color:var(--text-primary)"
                class="form-input" />
            </div>
          </div>

          <!-- Rol -->
          <div style="margin-bottom:2rem">
            <label style="display:block;margin-bottom:.5rem;font-weight:500;color:var(--text-primary)">
              Rol Asignado <span style="color:#ef4444">*</span>
            </label>
            <div style="position:relative">
              <select v-model="form.rol_id" required
                style="width:100%;appearance:none;border:1.5px solid var(--border,#d1d5db);border-radius:.375rem;padding:.75rem 1.25rem;outline:none;transition:border-color .2s;background:var(--input-bg,transparent);color:var(--text-primary);cursor:pointer">
                <option value="" disabled selected>Selecciona un rol...</option>
                <option v-for="r in roles" :key="r.id" :value="r.id">{{ r.nombre }}</option>
              </select>
              <span style="position:absolute;top:50%;right:1rem;transform:translateY(-50%);pointer-events:none;color:#6b7280">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
              </span>
            </div>
          </div>

          <!-- SECCIÓN 2: SEGURIDAD -->
          <div style="margin-bottom:1.5rem;padding-bottom:.5rem;border-bottom:1px solid var(--border,#e5e7eb)">
            <h4 style="font-weight:500;color:var(--text-primary)">Seguridad</h4>
          </div>

          <div style="display:flex;flex-wrap:wrap;gap:1.5rem;margin-bottom:2rem">
            <!-- Contraseña -->
            <div style="flex:1;min-width:18rem">
              <label style="display:block;margin-bottom:.5rem;font-weight:500;color:var(--text-primary)">
                Contraseña <span style="color:#ef4444">*</span>
              </label>
              <input v-model="form.password" type="password" required autocomplete="new-password" placeholder="Mínimo 8 caracteres"
                style="width:100%;border:1.5px solid var(--border,#d1d5db);border-radius:.375rem;padding:.75rem 1.25rem;font-weight:500;outline:none;transition:border-color .2s;background:var(--input-bg,transparent);color:var(--text-primary)" />
            </div>

            <!-- Confirmar Contraseña -->
            <div style="flex:1;min-width:18rem">
              <label style="display:block;margin-bottom:.5rem;font-weight:500;color:var(--text-primary)">
                Confirmar Contraseña <span style="color:#ef4444">*</span>
              </label>
              <input v-model="form.password_confirmation" type="password" required placeholder="Repite la contraseña"
                style="width:100%;border:1.5px solid var(--border,#d1d5db);border-radius:.375rem;padding:.75rem 1.25rem;font-weight:500;outline:none;transition:border-color .2s;background:var(--input-bg,transparent);color:var(--text-primary)" />
            </div>
          </div>

          <!-- BOTONES -->
          <div style="display:flex;justify-content:flex-end;gap:1rem;margin-top:2rem">
            <router-link to="/admin/usuarios"
              style="display:flex;justify-content:center;border-radius:.25rem;border:1px solid #d1d5db;padding:.5rem 1.5rem;font-weight:500;color:#374151;text-decoration:none;transition:background .2s"
              class="hover:bg-gray-50">
              Cancelar
            </router-link>
            <button type="submit" :disabled="loading"
              style="display:flex;justify-content:center;border-radius:.25rem;background:#4f46e5;padding:.5rem 1.5rem;font-weight:500;color:#fff;transition:opacity .2s;border:none;cursor:pointer"
              class="hover:bg-indigo-700">
              {{ loading ? 'Creando...' : 'Crear Usuario' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '../../components/layout/AppLayout.vue'
import api from '../../plugins/axios'

const router = useRouter()
const loading = ref(false)
const error = ref('')

const roles = [
  { id: 1, nombre: 'Admin' },
  { id: 2, nombre: 'Juez' },
  { id: 3, nombre: 'Participante' }
]

const form = ref({
  name: '',
  email: '',
  rol_id: '',
  password: '',
  password_confirmation: ''
})

async function saveUser() {
  error.value = ''
  if (form.value.password !== form.value.password_confirmation) {
    error.value = 'Las contraseñas no coinciden.'
    return
  }

  loading.value = true
  try {
    await api.post('/admin/usuarios', {
      nombre: form.value.name,
      email: form.value.email,
      rol_id: Number(form.value.rol_id),
      password: form.value.password
    })
    router.push({ name: 'Usuarios', query: { success: 'Usuario creado correctamente' } })
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al crear el usuario.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.form-input:focus {
  border-color: #4f46e5 !important;
}
</style>
