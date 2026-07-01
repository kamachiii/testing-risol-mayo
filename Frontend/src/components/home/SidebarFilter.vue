<script setup>
const props = defineProps({
  categories: { type: Array, default: () => [] },
  selected: { type: String, default: '' },
})

const emit = defineEmits(['select'])

const selectCategory = (id) => {
  emit('select', id === props.selected ? '' : id)
}
</script>

<template>
  <div class="filter-chips">
    <button
      class="chip"
      :class="{ active: !selected }"
      @click="emit('select', '')"
    >
      Semua
    </button>
    <button
      v-for="cat in categories"
      :key="cat.id || cat.slug"
      class="chip"
      :class="{ active: String(selected) === String(cat.id) }"
      @click="selectCategory(cat.id)"
    >
      <svg v-if="cat.name === 'Snack & Cemilan'" class="chip-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 00-3 3v4a3 3 0 006 0V5a3 3 0 00-3-3z"/><path d="M19 10H5a2 2 0 00-2 2v2a2 2 0 002 2h14a2 2 0 002-2v-2a2 2 0 00-2-2z"/><path d="M12 16v6"/></svg>
<svg v-else-if="cat.name === 'Minuman'" class="chip-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 8h1a4 4 0 110 8h-1"/><path d="M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>
<svg v-else-if="cat.name === 'Makanan Instan'" class="chip-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 2l1.5 18h15L21 2"/><path d="M9 2v6l3-3 3 3V2"/></svg>
<svg v-else-if="cat.name === 'Kebutuhan Dapur'" class="chip-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M12 6v6l4 2"/></svg>
<svg v-else-if="cat.name === 'Perlengkapan Mandi'" class="chip-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 21h10"/><rect x="5" y="3" width="14" height="18" rx="4"/><line x1="12" y1="9" x2="12" y2="15"/></svg>
<svg v-else-if="cat.name === 'Rokok'" class="chip-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="8" width="16" height="12" rx="2"/><line x1="22" y1="11" x2="22" y2="17"/><path d="M6 8V6c0-1 1-2 2-2h1c1 0 2 1 2 2v2"/></svg>
      {{ cat.name }}
    </button>
  </div>
</template>

<style scoped>
.filter-chips {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 0 8px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.filter-chips::-webkit-scrollbar { display: none; }

.chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 16px;
  font-size: 13px;
  font-weight: 600;
  border: 1.5px solid var(--border-medium);
  border-radius: var(--radius-full);
  background: white;
  color: var(--text-secondary);
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--duration-base) var(--ease-out-expo);
  flex-shrink: 0;
}

.chip:hover {
  border-color: var(--brand);
  color: var(--brand);
  background: var(--brand-light);
}

.chip.active {
  background: var(--brand);
  color: white;
  border-color: var(--brand);
  box-shadow: 0 2px 8px rgba(5, 150, 105, 0.3);
}

.chip-icon {
  display: flex;
  align-items: center;
}
</style>
