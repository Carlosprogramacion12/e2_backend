import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: () => import('../views/auth/LoginView.vue'), meta: { guest: true } },
  { path: '/register', name: 'Register', component: () => import('../views/auth/RegisterView.vue'), meta: { guest: true } },
  // Admin
  { path: '/admin/dashboard', name: 'AdminDashboard', component: () => import('../views/admin/DashboardView.vue'), meta: { role: 'Admin' } },
  { path: '/admin/usuarios', name: 'Usuarios', component: () => import('../views/admin/UsuariosView.vue'), meta: { role: 'Admin' } },
  { path: '/admin/eventos', name: 'Eventos', component: () => import('../views/admin/EventosView.vue'), meta: { role: 'Admin' } },
  { path: '/admin/equipos', name: 'AdminEquipos', component: () => import('../views/admin/EquiposView.vue'), meta: { role: 'Admin' } },
  { path: '/admin/proyectos', name: 'Proyectos', component: () => import('../views/admin/ProyectosView.vue'), meta: { role: 'Admin' } },
  { path: '/admin/resultados', name: 'Resultados', component: () => import('../views/admin/ResultadosView.vue'), meta: { role: 'Admin' } },
  { path: '/admin/carreras', name: 'Carreras', component: () => import('../views/admin/CarrerasView.vue'), meta: { role: 'Admin' } },
  // Juez
  { path: '/juez/dashboard', name: 'JuezDashboard', component: () => import('../views/juez/DashboardView.vue'), meta: { role: 'Juez' } },
  { path: '/juez/evaluar/:proyectoId', name: 'Evaluacion', component: () => import('../views/juez/EvaluacionView.vue'), meta: { role: 'Juez' } },
  // Participante
  { path: '/participante/dashboard', name: 'ParticipanteDashboard', component: () => import('../views/participante/DashboardView.vue'), meta: { role: 'Participante' } },
  { path: '/participante/registro-inicial', name: 'RegistroInicial', component: () => import('../views/participante/RegistroInicialView.vue'), meta: { role: 'Participante' } },
  { path: '/participante/equipos/crear', name: 'CrearEquipo', component: () => import('../views/participante/EquipoCreateView.vue'), meta: { role: 'Participante' } },
  { path: '/participante/equipos/editar', name: 'EditarEquipo', component: () => import('../views/participante/EquipoEditView.vue'), meta: { role: 'Participante' } },
  { path: '/participante/equipos/unirse', name: 'UnirseEquipo', component: () => import('../views/participante/EquipoJoinView.vue'), meta: { role: 'Participante' } },
  { path: '/participante/bitacora', name: 'Bitacora', component: () => import('../views/participante/BitacoraView.vue'), meta: { role: 'Participante' } },
  // 404
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('../views/NotFoundView.vue') }
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  if (to.meta.guest && auth.isAuthenticated) {
    return next(auth.dashboardRoute)
  }

  if (to.meta.role) {
    if (!auth.isAuthenticated) return next('/login')
    if (!auth.roles.includes(to.meta.role)) return next(auth.dashboardRoute)
  }

  next()
})

export default router
