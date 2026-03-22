import { defineStore } from 'pinia'
import api from '../services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token') || null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    roles: (state) => state.user?.roles || [],
    isAdmin: (state) => state.user?.roles?.includes('Admin'),
    isJuez: (state) => state.user?.roles?.includes('Juez'),
    isParticipante: (state) => state.user?.roles?.includes('Participante'),
    dashboardRoute: (state) => {
      if (state.user?.roles?.includes('Admin')) return '/admin/dashboard'
      if (state.user?.roles?.includes('Juez')) return '/juez/dashboard'
      if (state.user?.roles?.includes('Participante')) return '/participante/dashboard'
      return '/login'
    }
  },

  actions: {
    async login(email, password) {
      const { data } = await api.post('/auth/login', { email, password })
      this.token = data.data.token
      this.user = data.data.user
      localStorage.setItem('token', data.data.token)
      localStorage.setItem('user', JSON.stringify(data.data.user))
      return data.data
    },

    async register(name, email, password) {
      const { data } = await api.post('/auth/register', { name, email, password })
      this.token = data.data.token
      this.user = data.data.user
      localStorage.setItem('token', data.data.token)
      localStorage.setItem('user', JSON.stringify(data.data.user))
      return data.data
    },

    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },

    async fetchMe() {
      try {
        const { data } = await api.get('/auth/me')
        this.user = data.data
        localStorage.setItem('user', JSON.stringify(data.data))
      } catch { this.logout() }
    }
  }
})
