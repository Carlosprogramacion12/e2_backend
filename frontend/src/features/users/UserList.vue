<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usersService } from './users.service'
import type { User } from './users.types'

const users = ref<User[]>([])

onMounted(async () => {
  try {
    users.value = await usersService.getUsers()
  } catch (error) {
    console.error('Error fetching users:', error)
  }
})
</script>

<template>
  <div class="user-list">
    <h3>Lista de Usuarios</h3>
    <ul>
      <li v-for="user in users" :key="user.id">
        {{ user.name }} ({{ user.email }})
      </li>
    </ul>
  </div>
</template>
