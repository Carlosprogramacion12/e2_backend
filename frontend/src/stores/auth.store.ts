import { defineStore } from 'pinia'
import api from '../plugins/axios'

export const useAuthStore = defineStore('auth', {
  state: () => {
    let user = null;
    try {
      user = JSON.parse(localStorage.getItem('user') || 'null');
    } catch (e) {
      console.error('Error parsing user from localStorage', e);
      localStorage.removeItem('user');
    }
    return {
      user,
      token: localStorage.getItem('token') || null,
      avatarVersion: Date.now()
    }
  },

  getters: {
    isAuthenticated: (state) => !!state.token,
    roles: (state) => state.user?.roles || [],
    isAdmin: (state) => state.user?.roles?.includes('Admin'),
    isJuez: (state) => state.user?.roles?.includes('Juez'),
    isParticipante: (state) => state.user?.roles?.includes('Participante'),
    dashboardRoute: (state) => {
      const roles = state.user?.roles || []
      if (roles.includes('Admin')) return '/admin/dashboard'
      if (roles.includes('Juez')) return '/juez/dashboard'
      if (roles.includes('Participante')) return '/participante/dashboard'
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
    },

    updateAvatarVersion() {
      this.avatarVersion = Date.now()
    }
  }
})
