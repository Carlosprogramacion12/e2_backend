<template>
  <div class="auth-page" :class="{ dark: isDark }">
    <div style="position:relative;width:100%;max-width:64rem;padding:0 1rem">
      <!-- Glow Effect -->
      <div class="auth-glow"></div>
      <div class="auth-card-split">
        <!-- Theme toggle -->
        <button @click="toggleTheme" style="position:absolute;top:1rem;right:1rem;z-index:50;padding:.5rem;border-radius:50%;border:none;cursor:pointer;background:none;color:#6b7280">
          <svg v-if="isDark" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fill-rule="evenodd" clip-rule="evenodd"/></svg>
          <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>
        </button>

        <!-- LEFT: Visual Section -->
        <div class="auth-visual">
          <div class="blob-1"></div>
          <div class="blob-2"></div>
          <div style="position:relative;z-index:10">
            <div style="display:flex;align-items:center;gap:.75rem;margin-bottom:1.5rem">
              <span style="font-size:2.5rem;font-weight:800;letter-spacing:.15em;font-family:Figtree,sans-serif">
                <span style="background:linear-gradient(to right,#fff,#d1d5db);-webkit-background-clip:text;-webkit-text-fill-color:transparent">DELTOS</span>
              </span>
            </div>
            <p style="color:#c7d2fe;opacity:.9;font-size:1.1rem">Gestión de Proyectos Académicos</p>
          </div>
          <div style="position:relative;z-index:10;margin-bottom:2.5rem">
            <h2 style="font-size:1.875rem;font-weight:700;margin-bottom:1rem">¡Bienvenido de nuevo!</h2>
            <p style="color:#c7d2fe;line-height:1.7;opacity:.9">
              Ingresa a tu cuenta para continuar gestionando equipos, evaluando proyectos y visualizando resultados.
            </p>
          </div>
          <div style="font-size:.75rem;color:#a5b4fc;opacity:.7">&copy; {{ new Date().getFullYear() }} DELTOS System.</div>
        </div>

        <!-- RIGHT: Form Section -->
        <div class="auth-form-side">
          <h2>Iniciar Sesión</h2>
          <p class="subtitle">Por favor, introduce tus credenciales.</p>

          <div v-if="error" class="alert alert-danger">{{ error }}</div>

          <form @submit.prevent="handleLogin" style="display:flex;flex-direction:column;gap:1.25rem">
            <div class="form-group" style="margin:0">
              <label>Correo Electrónico</label>
              <div style="position:relative">
                <div style="position:absolute;inset:0;right:auto;left:0;padding-left:.75rem;display:flex;align-items:center;pointer-events:none;color:#9ca3af">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/></svg>
                </div>
                <input v-model="email" type="email" class="form-control" style="padding-left:2.5rem" placeholder="nombre@ejemplo.com" required autofocus>
              </div>
            </div>

            <div class="form-group" style="margin:0">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.25rem">
                <label style="margin:0">Contraseña</label>
              </div>
              <div style="position:relative">
                <div style="position:absolute;inset:0;right:auto;left:0;padding-left:.75rem;display:flex;align-items:center;pointer-events:none;color:#9ca3af">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                </div>
                <input v-model="password" :type="showPass ? 'text' : 'password'" class="form-control" style="padding-left:2.5rem;padding-right:2.5rem" placeholder="••••••••" required>
                <button type="button" @click="showPass = !showPass" style="position:absolute;inset:0;left:auto;right:0;padding-right:.75rem;display:flex;align-items:center;background:none;border:none;cursor:pointer;color:#9ca3af">
                  <svg v-if="!showPass" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.059 10.059 0 013.949-5.347m1.735-1.277L21 21"/></svg>
                </button>
              </div>
            </div>

            <div style="padding-top:.5rem">
              <button type="submit" class="btn btn-indigo btn-block" style="padding:.75rem;font-weight:700;border-radius:.75rem;box-shadow:0 10px 15px -3px rgba(79,70,229,.3)" :disabled="loading">
                {{ loading ? 'Ingresando...' : 'Ingresar' }}
              </button>
            </div>

            <div style="text-align:center;font-size:.875rem;color:#6b7280;margin-top:.5rem">
              ¿No tienes una cuenta?
              <router-link to="/register" style="font-weight:700;color:#4f46e5;text-decoration:none">Regístrate aquí</router-link>
            </div>
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

const auth = useAuthStore()
const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const showPass = ref(false)
const isDark = ref(localStorage.getItem('color-theme') === 'dark')

function toggleTheme() {
  isDark.value = !isDark.value
  localStorage.setItem('color-theme', isDark.value ? 'dark' : 'light')
}

async function handleLogin() {
  loading.value = true; error.value = ''
  try {
    await auth.login(email.value, password.value)
    router.push(auth.dashboardRoute)
  } catch (e) {
    error.value = e.response?.data?.message || 'Error al iniciar sesión'
  } finally { loading.value = false }
}
</script>

<style scoped>
.w-5 { width: 1.25rem; }
.h-5 { height: 1.25rem; }
</style>
