<template>
  <div class="auth-page" :class="{ dark: isDark }">
    <div style="position:relative;width:100%;max-width:64rem;padding:0 1rem">
      <div class="auth-glow"></div>
      <div class="auth-card-split">
        <button @click="toggleTheme" style="position:absolute;top:1rem;right:1rem;z-index:50;padding:.5rem;border-radius:50%;border:none;cursor:pointer;background:none;color:#6b7280">
          <svg v-if="isDark" style="width:1.25rem;height:1.25rem" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fill-rule="evenodd" clip-rule="evenodd"/></svg>
          <svg v-else style="width:1.25rem;height:1.25rem" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>
        </button>
        <!-- LEFT: Visual -->
        <div class="auth-visual">
          <div class="blob-1"></div><div class="blob-2"></div>
          <div style="position:relative;z-index:10">
            <span style="font-size:2.5rem;font-weight:800;letter-spacing:.15em;background:linear-gradient(to right,#fff,#d1d5db);-webkit-background-clip:text;-webkit-text-fill-color:transparent">DELTOS</span>
            <p style="color:#c7d2fe;margin-top:.5rem;font-size:1.1rem">Gestión de Proyectos Académicos</p>
          </div>
          <div style="position:relative;z-index:10;margin-bottom:2.5rem">
            <h2 style="font-size:1.875rem;font-weight:700;margin-bottom:1rem">¡Únete a DELTOS!</h2>
            <p style="color:#c7d2fe;line-height:1.7">Crea tu cuenta para participar en eventos, formar equipos y gestionar proyectos.</p>
          </div>
          <div style="font-size:.75rem;color:#a5b4fc;opacity:.7">&copy; {{ new Date().getFullYear() }} DELTOS System.</div>
        </div>
        <!-- RIGHT: Form -->
        <div class="auth-form-side">
          <h2>Crear Cuenta</h2>
          <p class="subtitle">Completa tus datos para registrarte.</p>
          <div v-if="error" class="alert alert-danger">{{ error }}</div>
          <form @submit.prevent="handleRegister" style="display:flex;flex-direction:column;gap:1.25rem">
            <div class="form-group" style="margin:0"><label>Nombre completo</label><input v-model="name" class="form-control" placeholder="Tu nombre completo" required></div>
            <div class="form-group" style="margin:0"><label>Correo electrónico</label><input v-model="email" type="email" class="form-control" placeholder="nombre@ejemplo.com" required></div>
            <div class="form-group" style="margin:0"><label>Contraseña</label><input v-model="password" type="password" class="form-control" placeholder="Mínimo 8 caracteres" required minlength="8"></div>
            <div class="form-group" style="margin:0"><label>Confirmar contraseña</label><input v-model="password_confirmation" type="password" class="form-control" placeholder="Mínimo 8 caracteres" required minlength="8"></div>
            <button type="submit" class="btn btn-indigo btn-block" style="padding:.75rem;font-weight:700;border-radius:.75rem" :disabled="loading">{{ loading ? 'Registrando...' : 'Crear Cuenta' }}</button>
            <div style="text-align:center;font-size:.875rem;color:#6b7280">¿Ya tienes cuenta? <router-link to="/login" style="font-weight:700;color:#4f46e5;text-decoration:none">Inicia sesión</router-link></div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth.store'
const auth = useAuthStore(); const router = useRouter()
const name = ref(''); const email = ref(''); const password = ref(''); const password_confirmation = ref(''); const error = ref(''); const loading = ref(false)
const isDark = ref(localStorage.getItem('color-theme') === 'dark')
function toggleTheme() { isDark.value = !isDark.value; localStorage.setItem('color-theme', isDark.value ? 'dark' : 'light') }
async function handleRegister() {
  loading.value = true; error.value = ''
  if (password.value !== password_confirmation.value) {
    error.value = 'Las contraseñas no coinciden'
    loading.value = false
    return
  }
  try { await auth.register(name.value, email.value, password.value); router.push(auth.dashboardRoute) }
  catch (e) { error.value = e.response?.data?.message || 'Error al registrar' }
  finally { loading.value = false }
}
</script>
