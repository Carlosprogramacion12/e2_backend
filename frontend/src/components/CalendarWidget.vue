<template>
  <div class="calendar-wrapper">
    <!-- Calendar Header -->
    <div class="calendar-header">
      <h3 class="current-label">{{ viewMode === 'month' ? (monthNames[currentDate.getMonth()] + ' ' + currentDate.getFullYear()) : currentDate.getFullYear() }}</h3>
      <div style="display:flex;align-items:center;gap:.75rem;flex-wrap:wrap">
        <slot name="actions"></slot>
        <div class="calendar-controls">
          <button class="btn-today" @click="goToday">Hoy</button>
          <div class="divider"></div>
          <button class="btn-nav" @click="goPrev">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          <button class="btn-nav" @click="goNext">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
          <div class="divider"></div>
          <select v-model="viewMode" class="view-selector">
            <option value="month">Vista Mensual</option>
            <option value="year">Vista del año</option>
          </select>
        </div>
      </div>
    </div>

    <!-- VISTA ANUAL -->
    <div v-if="viewMode === 'year'" class="year-grid">
      <div v-for="(mes, mIndex) in monthNames" :key="mIndex" class="month-card">
        <h4 class="month-title" @click="goToMonth(mIndex)">{{ mes }}</h4>
        <div class="days-header">
          <div v-for="d in dayInitials" :key="d" class="day-init">{{ d }}</div>
        </div>
        <div class="mini-grid">
          <div v-for="blank in getFirstDay(currentDate.getFullYear(), mIndex)" :key="'b'+blank"></div>
          <div v-for="day in getDaysInMonth(currentDate.getFullYear(), mIndex)" :key="'d'+day" 
               class="mini-day" 
               :class="getDayClass(currentDate.getFullYear(), mIndex, day)"
               @click="goToMonth(mIndex, day)"
               @mouseenter="e => { const evs = getEventsForDay(currentDate.getFullYear(), mIndex, day); if(evs.length) showTooltip(e, evs[0]) }"
               @mouseleave="hideTooltip">
            {{ day }}
          </div>
        </div>
      </div>
    </div>

    <!-- VISTA MENSUAL -->
    <div v-if="viewMode === 'month'" class="month-view">
      <div class="month-header">
        <div v-for="d in ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']" :key="d" class="day-title">{{ d }}</div>
      </div>
      <div class="month-grid">
        <div v-for="cell in monthCells" :key="cell.id" class="month-cell" :class="{ 'cell-gray': cell.isGray }">
          <div class="date-num" :class="{ 'is-today': cell.isToday }">{{ cell.day }}</div>
          <div v-for="ev in cell.events" :key="ev.id" class="event-pill" :class="ev.statusClass" 
               @click.stop="$router?.push(`/admin/eventos/${ev.id}`)"
               @mouseenter="e => showTooltip(e, ev)" @mouseleave="hideTooltip">
            {{ ev.nombre }}
          </div>
        </div>
      </div>
    </div>

    <!-- TOOLTIP -->
    <div v-show="tooltipData" class="event-tooltip" :style="{ left: tooltipPos.x + 'px', top: tooltipPos.y + 'px' }">
      <div v-if="tooltipData">
        <div class="tooltip-header">
          <div class="tooltip-dot"></div>
          <h4 class="tooltip-title">{{ tooltipData.nombre }}</h4>
        </div>
        <p class="tooltip-desc">{{ tooltipData.descripcion || 'Sin descripción' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  eventos: { type: Array, default: () => [] }
})

const viewMode = ref('year')
const currentDate = ref(new Date())
const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
const dayInitials = ['D', 'L', 'M', 'M', 'J', 'V', 'S']

// Tooltip state
const tooltipData = ref(null)
const tooltipPos = ref({ x: 0, y: 0 })
let tooltipTimeout = null

const showTooltip = (e, ev) => {
  clearTimeout(tooltipTimeout)
  tooltipData.value = ev
  const rect = e.target.getBoundingClientRect()
  let left = rect.left
  if (left + 256 > window.innerWidth) left = window.innerWidth - 270
  tooltipPos.value = { x: left, y: rect.bottom + 10 }
}

const hideTooltip = () => {
  tooltipTimeout = setTimeout(() => {
    tooltipData.value = null
  }, 300)
}

const goToday = () => { currentDate.value = new Date() }
const goPrev = () => {
  const d = new Date(currentDate.value)
  if (viewMode.value === 'month') d.setMonth(d.getMonth() - 1)
  else d.setFullYear(d.getFullYear() - 1)
  currentDate.value = d
}
const goNext = () => {
  const d = new Date(currentDate.value)
  if (viewMode.value === 'month') d.setMonth(d.getMonth() + 1)
  else d.setFullYear(d.getFullYear() + 1)
  currentDate.value = d
}
const goToMonth = (mIndex, day = 1) => {
  const d = new Date(currentDate.value)
  d.setMonth(mIndex)
  d.setDate(day)
  currentDate.value = d
  viewMode.value = 'month'
}

const getFirstDay = (y, m) => new Date(y, m, 1).getDay()
const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate()

const isTodayDate = (y, m, d) => {
  const t = new Date()
  return t.getDate() === d && t.getMonth() === m && t.getFullYear() === y
}

const getEventsForDay = (y, m, d) => {
  return props.eventos.filter(e => {
    const ed = new Date(e.fecha_inicio)
    return ed.getDate() === d && ed.getMonth() === m && ed.getFullYear() === y
  })
}

const getDayClass = (y, m, d) => {
  if (isTodayDate(y, m, d)) return 'is-today'
  if (getEventsForDay(y, m, d).length > 0) return 'has-event'
  return 'is-normal'
}

const getEventStatusClass = (ev) => {
  const now = new Date()
  const start = new Date(ev.fecha_inicio)
  const end = new Date(ev.fecha_fin)
  if (now < start) return 'ev-future'
  if (now > end) return 'ev-past'
  return 'ev-active'
}

const monthCells = computed(() => {
  const y = currentDate.value.getFullYear()
  const m = currentDate.value.getMonth()
  const firstDay = getFirstDay(y, m)
  const daysInMonth = getDaysInMonth(y, m)
  const daysInPrevMonth = new Date(y, m, 0).getDate()
  
  const cells = []
  
  // Previous month
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ id: `prev-${i}`, day: daysInPrevMonth - i, isGray: true, isToday: false, events: [] })
  }
  
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const evs = getEventsForDay(y, m, d).map(e => ({ ...e, statusClass: getEventStatusClass(e) }))
    cells.push({ id: `cur-${d}`, day: d, isGray: false, isToday: isTodayDate(y, m, d), events: evs })
  }
  
  // Next month remaining
  const remain = 42 - cells.length
  for (let i = 1; i <= remain; i++) {
    cells.push({ id: `next-${i}`, day: i, isGray: true, isToday: false, events: [] })
  }
  
  return cells
})
</script>

<style scoped>
.calendar-wrapper {
  background: var(--card-bg, #1a222c);
  border: 1px solid var(--border, #374151);
  border-radius: 1rem;
  padding: 1.5rem;
  margin-top: 1.5rem;
  color: var(--text-primary, #fff);
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
}
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}
.current-label { font-size: 1.875rem; font-weight: 900; text-transform: capitalize; }
.calendar-controls { display: flex; align-items: center; gap: .5rem; background: var(--card-muted, #24303f); padding: .25rem; border-radius: .75rem; border: 1px solid var(--border, #374151); }
.btn-today { padding: .375rem 1rem; font-size: .875rem; font-weight: 700; color: var(--text-secondary); background: transparent; border: none; border-radius: .5rem; cursor: pointer; transition: all .2s; }
.btn-today:hover { background: var(--bg-hover, #374151); }
.btn-nav { 
  padding: .375rem; 
  background: transparent; 
  border: none; 
  color: #6b7280; 
  cursor: pointer; 
  border-radius: .5rem; 
  transition: all .2s; 
}
.dark .btn-nav { color: #9ca3af; }
.btn-nav:hover { background: #fff; color: #374151; }
.dark .btn-nav:hover { background: #4b5563; color: #f3f4f6; }
.divider { width: 1px; height: 1.5rem; background: var(--border, #374151); }
.view-selector { background: transparent; border: none; font-size: .875rem; font-weight: 700; color: var(--text-primary); cursor: pointer; padding: .375rem; outline: none; }
.view-selector option { color: #000; }

.year-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 2rem; }
.month-card { padding: .5rem; }
.month-title { text-align: center; font-weight: 700; margin-bottom: 1rem; cursor: pointer; transition: color .2s; }
.month-title:hover { color: #4f46e5; }
.days-header { display: grid; grid-template-columns: repeat(7, 1fr); margin-bottom: .5rem; }
.day-init { text-align: center; font-size: .625rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
.mini-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
.mini-day { height: 2rem; width: 2rem; margin: 0 auto; display: flex; align-items: center; justify-content: center; font-size: .75rem; border-radius: 9999px; cursor: pointer; transition: all .2s; }
.mini-day.is-today { background: #4f46e5; color: #fff; font-weight: 700; box-shadow: 0 4px 14px 0 rgba(79,70,229,0.39); }
.mini-day.has-event { background: rgba(79,70,229,0.2); color: #818cf8; font-weight: 700; }
.mini-day.is-normal { color: var(--text-secondary); }
.mini-day.is-normal:hover, .mini-day.has-event:hover { background: var(--bg-hover, #374151); }

/* VISTA MENSUAL */
.month-view { width: 100%; }
.month-header { display: grid; grid-template-columns: repeat(7, 1fr); margin-bottom: .5rem; }
.day-title { text-align: center; font-weight: 700; font-size: .75rem; color: var(--text-muted); text-transform: uppercase; padding: .5rem 0; }
.month-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px; background: var(--border, #374151); border: 1px solid var(--border, #374151); border-radius: .5rem; overflow: hidden; }
.month-cell { min-height: 8rem; padding: .5rem; background: var(--card-bg, #1a222c); transition: background .2s; }
.month-cell:hover { background: var(--card-muted, #24303f); }
.cell-gray { background: rgba(0,0,0,0.2); color: var(--text-muted); }
.cell-gray:hover { background: rgba(0,0,0,0.1); }
.date-num { font-size: .875rem; font-weight: 500; margin-bottom: .25rem; width: 1.75rem; height: 1.75rem; display: flex; align-items: center; justify-content: center; border-radius: 9999px; }
.date-num.is-today { background: #4f46e5; color: #fff; font-weight: 700; box-shadow: 0 4px 14px 0 rgba(79,70,229,0.39); }

.event-pill { font-size: .625rem; font-weight: 600; padding: .125rem .25rem; border-radius: .25rem; margin-bottom: .125rem; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; cursor: pointer; }
.ev-future { background: rgba(59,130,246,.2); color: #60a5fa; }
.ev-past { background: rgba(107,114,128,.2); color: #9ca3af; }
.ev-active { background: rgba(79,70,229,.3); color: #a5b4fc; border-left: 2px solid #4f46e5; }

/* TOOLTIP STYLES */
.event-tooltip {
  position: fixed;
  z-index: 50;
  width: 16rem;
  background: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
  padding: 1rem;
  border: 1px solid #e5e7eb;
  font-size: 0.875rem;
  pointer-events: none;
}
.dark .event-tooltip {
  background: #24303f;
  border-color: #4b5563;
}
.tooltip-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.tooltip-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: #6366f1;
}
.tooltip-title {
  font-weight: 700;
  color: #111827;
  font-size: 0.875rem;
  margin: 0;
}
.dark .tooltip-title {
  color: #fff;
}
.tooltip-desc {
  color: #6b7280;
  font-size: 0.75rem;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.625;
}
.dark .tooltip-desc {
  color: #9ca3af;
}
</style>
