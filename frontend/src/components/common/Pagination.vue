<template>
  <div class="pagination-container" v-if="totalPages >= 1">
    <!-- Botón Anterior -->
    <button 
      class="pagination-nav-btn" 
      :disabled="modelValue <= 1"
      @click="$emit('update:modelValue', modelValue - 1)"
    >
      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Anterior
    </button>

    <!-- Números de Página -->
    <div class="pagination-numbers">
      <template v-for="p in paginationRange" :key="p">
        <button 
          v-if="p !== '...'" 
          :class="['pagination-number-btn', { active: p === modelValue }]"
          @click="$emit('update:modelValue', p)"
        >
          {{ p }}
        </button>
        <span v-else class="pagination-dots">...</span>
      </template>
    </div>

    <!-- Botón Siguiente -->
    <button 
      class="pagination-nav-btn" 
      :disabled="modelValue >= totalPages"
      @click="$emit('update:modelValue', modelValue + 1)"
    >
      Siguiente
      <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  }
});

defineEmits(['update:modelValue']);

const paginationRange = computed(() => {
  const current = props.modelValue;
  const last = props.totalPages;
  const delta = 2;
  const left = current - delta;
  const right = current + delta + 1;
  const range = [];
  const rangeWithDots = [];
  let l;

  for (let i = 1; i <= last; i++) {
    if (i === 1 || i === last || (i >= left && i < right)) {
      range.push(i);
    }
  }

  for (const i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l !== 1) {
        rangeWithDots.push('...');
      }
    }
    rangeWithDots.push(i);
    l = i;
  }

  return rangeWithDots;
});
</script>

<style scoped>
.pagination-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border, #e5e7eb);
}

.pagination-nav-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  transition: all 0.2s;
  cursor: pointer;
}

.pagination-nav-btn:hover:not(:disabled) {
  border-color: #d1d5db;
  background: #f9fafb;
  color: #374151;
}

.pagination-nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-numbers {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.pagination-number-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2.25rem;
  height: 2.25rem;
  padding: 0 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
  background: transparent;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-number-btn:hover:not(.active) {
  background: #f3f4f6;
  color: #111827;
}

.pagination-number-btn.active {
  background: #4f46e5;
  color: white;
  box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.4);
}

.pagination-dots {
  padding: 0 0.5rem;
  color: #9ca3af;
}

.w-4 { width: 1rem; }
.h-4 { height: 1rem; }
.mr-2 { margin-right: 0.5rem; }
.ml-2 { margin-left: 0.5rem; }
</style>
