<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const props = defineProps({
  message: String,
  type: { type: String, default: 'success' },
  duration: { type: Number, default: 3000 },
  stackIndex: { type: Number, default: 0 },
})

const emit = defineEmits(['close'])
const visible = ref(true)
const paused = ref(false)
const remaining = ref(props.duration)
let timer = null

const offsetBottom = computed(() => 24 + props.stackIndex * 56)

function startTimer() {
  timer = setTimeout(() => {
    visible.value = false
    setTimeout(() => emit('close'), 300)
  }, remaining.value)
}

function pauseTimer() {
  paused.value = true
  clearTimeout(timer)
}

function resumeTimer() {
  paused.value = false
  startTimer()
}

onMounted(() => {
  startTimer()
})

onUnmounted(() => {
  clearTimeout(timer)
})
</script>

<template>
  <Transition name="toast">
    <div
      v-if="visible"
      class="toast glass-strong"
      :class="`toast-${type}`"
      :style="{ bottom: offsetBottom + 'px' }"
      @mouseenter="pauseTimer"
      @mouseleave="resumeTimer"
    >
      <span class="toast-icon">
        <template v-if="type === 'success'">✓</template>
        <template v-else-if="type === 'error'">✕</template>
        <template v-else-if="type === 'warning'">⚠</template>
        <template v-else>i</template>
      </span>
      <span class="toast-msg">{{ message }}</span>
    </div>
  </Transition>
</template>

<style scoped>
.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 10000;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  font-size: 13.5px;
  font-weight: 500;
  max-width: 360px;
  animation: slide-in-right var(--duration-slow) var(--ease-out-expo);
  transition: bottom 0.25s ease;
}

.toast-success { border-left: 3px solid var(--brand); }
.toast-error { border-left: 3px solid #ef4444; }
.toast-warning { border-left: 3px solid var(--accent); }
.toast-info { border-left: 3px solid #3b82f6; }

.toast-icon {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.toast-success .toast-icon { background: var(--brand-light); color: var(--brand); }
.toast-error .toast-icon { background: #fee2e2; color: #ef4444; }
.toast-warning .toast-icon { background: var(--accent-light); color: #d97706; }
.toast-info .toast-icon { background: #dbeafe; color: #3b82f6; }

.toast-msg { color: var(--text-primary); line-height: 1.4; }

.toast-enter-active { transition: all var(--duration-slow) var(--ease-out-expo); }
.toast-leave-active { transition: all var(--duration-base) ease; }
.toast-enter-from { opacity: 0; transform: translateX(40px); }
.toast-leave-to { opacity: 0; transform: translateX(40px) scale(0.95); }
</style>
