<script setup lang="ts">
import UserList from '../features/users/UserList.vue'
import MainLayout from '../layouts/MainLayout.vue'
</script>

<template>
  <MainLayout>
    <div class="users-view">
      <h1>Gestión de Usuarios</h1>
      <UserList />
    </div>
  </MainLayout>
</template>
