<template>
  <div class="app-wrapper" :class="{ dark: isDark }">
    <div class="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
      <!-- SIDEBAR -->
      <aside :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
        class="sidebar">
        <!-- Logo -->
        <div class="sidebar-header">
          <router-link :to="dashboardRoute" class="logo-link">
            <span class="logo-text">DELTOS</span>
          </router-link>
          <button @click="sidebarOpen = false" class="sidebar-close-btn lg-hidden">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <!-- Nav -->
        <div class="sidebar-nav">
          <nav>
            <h3 class="nav-section-title">Menú Principal</h3>
            <ul class="nav-list">
              <!-- Dashboard (común) -->
              <li>
                <router-link :to="dashboardRoute" class="nav-link" :class="{ active: $route.path.includes('dashboard') }">
                  <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
                  Dashboard
                </router-link>
              </li>

              <!-- Admin Links -->
              <template v-if="auth.isAdmin">
                <li><p class="nav-section-label">Administración</p></li>
                <li>
                  <router-link to="/admin/usuarios" class="nav-link" :class="{ active: $route.path.includes('/admin/usuarios') }">
                    <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                    Usuarios
                  </router-link>
                </li>
                <li>
                  <router-link to="/admin/eventos" class="nav-link" :class="{ active: $route.path.includes('/admin/eventos') }">
                    <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    Eventos
                  </router-link>
                </li>
                <li>
                  <router-link to="/admin/equipos" class="nav-link" :class="{ active: $route.path.includes('/admin/equipos') }">
                    <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                    Equipos
                  </router-link>
                </li>
                <li>
                  <router-link to="/admin/proyectos" class="nav-link" :class="{ active: $route.path.includes('/admin/proyectos') }">
                    <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
                    Proyectos
                  </router-link>
                </li>
                <li>
                  <router-link to="/admin/resultados" class="nav-link" :class="{ active: $route.path.includes('/admin/resultados') }">
                    <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                    Resultados
                  </router-link>
                </li>
                <li>
                  <router-link to="/admin/carreras" class="nav-link" :class="{ active: $route.path.includes('/admin/carreras') }">
                    <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 14l9-5-9-5-9 5 9 5z"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>
                    Carreras
                  </router-link>
                </li>
                <li>
                  <router-link to="/admin/perfiles" class="nav-link" :class="{ active: $route.path.includes('/admin/perfiles') }">
                    <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    Perfiles
                  </router-link>
                </li>
                <li>
                  <router-link to="/admin/reportes" class="nav-link" :class="{ active: $route.path.includes('/admin/reportes') }">
                    <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Reportes
                  </router-link>
                </li>
                <li><p class="nav-section-label">Cuenta</p></li>
                <li>
                  <router-link to="/admin/mi-perfil" class="nav-link" :class="{ active: $route.path.includes('/admin/mi-perfil') }">
                    <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Mi Perfil
                  </router-link>
                </li>
              </template>

              <!-- Juez Links -->
              <template v-if="auth.isJuez">
                <li><p class="nav-section-label">Juez</p></li>
                <li>
                  <router-link to="/juez/dashboard" class="nav-link" :class="{ active: $route.path.includes('/juez/') }">
                    <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    Sala de Evaluación
                  </router-link>
                </li>
              </template>

              <!-- Participante Links -->
              <template v-if="auth.isParticipante">
                <li><p class="nav-section-label">Participación</p></li>
                <li>
                  <router-link to="/participante/perfil" class="nav-link" :class="{ active: $route.path.includes('perfil') }">
                    <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    Mi Perfil
                  </router-link>
                </li>
              </template>
            </ul>
          </nav>
        </div>
      </aside>

      <!-- MAIN AREA -->
      <div class="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <!-- HEADER -->
        <header class="app-header">
          <div class="header-inner">
            <div class="flex items-center gap-2 lg-hidden">
              <button @click="sidebarOpen = true" class="hamburger-btn">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
              </button>
            </div>
            <div class="hidden-sm"></div>
            <div class="header-right">
              <!-- Theme Toggle -->
              <button @click="toggleTheme" class="theme-btn" :title="isDark ? 'Modo claro' : 'Modo oscuro'">
                <!-- Icono Luna (Visible en Modo Claro para cambiar a Oscuro) -->
                <svg v-if="!isDark" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
                </svg>
                <!-- Icono Sol (Visible en Modo Oscuro para cambiar a Claro) -->
                <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fill-rule="evenodd" clip-rule="evenodd"></path>
                </svg>
              </button>
              <!-- User dropdown -->
              <div class="user-dropdown" @click.stop>
                <button @click="dropdownOpen = !dropdownOpen" class="user-dropdown-btn">
                  <span class="user-dropdown-info">
                    <span class="user-dropdown-name">{{ auth.user?.name }}</span>
                    <span class="user-dropdown-email">{{ auth.user?.email }}</span>
                  </span>
                  <span class="user-avatar-circle">
                    {{ initials }}
                  </span>
                  <svg :class="{ 'rotate-180': dropdownOpen }" class="dropdown-arrow" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
                </button>
                <div v-show="dropdownOpen" class="user-dropdown-menu" @click.stop>
                  <router-link to="/admin/mi-perfil" class="dropdown-profile-btn" @click="dropdownOpen = false">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Mi Perfil
                  </router-link>
                  <button @click="handleLogout" class="dropdown-logout-btn">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>
        <!-- CONTENT -->
        <main>
          <div class="content-wrapper">
            <slot />
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const sidebarOpen = ref(false)
const dropdownOpen = ref(false)
const isDark = ref(localStorage.getItem('color-theme') === 'dark')

const dashboardRoute = computed(() => auth.dashboardRoute)

const initials = computed(() => {
  const name = auth.user?.name || ''
  return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()
})

function toggleTheme() {
  isDark.value = !isDark.value
  localStorage.setItem('color-theme', isDark.value ? 'dark' : 'light')
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

function handleLogout() {
  auth.logout()
  router.push('/login')
}

function closeDropdown(e) {
  dropdownOpen.value = false
}

onMounted(() => {
  document.addEventListener('click', closeDropdown)
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
})
onUnmounted(() => document.removeEventListener('click', closeDropdown))
</script>
