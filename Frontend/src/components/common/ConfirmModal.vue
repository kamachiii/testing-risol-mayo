<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, default: 'Konfirmasi' },
  message: { type: String, default: '' },
  confirmText: { type: String, default: 'Ya' },
  cancelText: { type: String, default: 'Batal' },
  type: { type: String, default: 'danger' }, // danger, warning, info
})

const emit = defineEmits(['confirm', 'cancel'])

const isVisible = ref(false)
const isAnimating = ref(false)

watch(() => props.show, (val) => {
  if (val) {
    isVisible.value = true
    setTimeout(() => isAnimating.value = true, 10)
  } else {
    isAnimating.value = false
    setTimeout(() => isVisible.value = false, 200)
  }
})

const onConfirm = () => {
  isAnimating.value = false
  setTimeout(() => {
    isVisible.value = false
    emit('confirm')
  }, 200)
}

const onCancel = () => {
  isAnimating.value = false
  setTimeout(() => {
    isVisible.value = false
    emit('cancel')
  }, 200)
}
</script>

<template>
  <Teleport to="body">
    <div v-if="isVisible" class="modal-overlay" :class="{ active: isAnimating }" @click.self="onCancel">
      <div class="modal-card" :class="[type, { active: isAnimating }]">
        <div class="modal-icon">
          <svg v-if="type === 'danger'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          <svg v-else-if="type === 'warning'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <svg v-else width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
        </div>
        <h3 class="modal-title">{{ title }}</h3>
        <p class="modal-message">{{ message }}</p>
        <div class="modal-actions">
          <button class="modal-btn cancel" @click="onCancel">{{ cancelText }}</button>
          <button class="modal-btn confirm" :class="type" @click="onConfirm">{{ confirmText }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  transition: background 0.25s ease;
  backdrop-filter: blur(0px);
}

.modal-overlay.active {
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(4px);
}

.modal-card {
  background: white;
  border-radius: 20px;
  padding: 32px 28px 24px;
  max-width: 380px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  transform: scale(0.9) translateY(20px);
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-card.active {
  transform: scale(1) translateY(0);
  opacity: 1;
}

.modal-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  margin-bottom: 16px;
}

.danger .modal-icon { background: #fef2f2; color: #ef4444; }
.warning .modal-icon { background: #fffbeb; color: #f59e0b; }
.info .modal-icon { background: #eff6ff; color: #3b82f6; }

.modal-title {
  font-size: 17px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px;
}

.modal-message {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
  margin: 0 0 24px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.modal-btn {
  padding: 10px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
  min-width: 100px;
}

.modal-btn.cancel {
  background: #f3f4f6;
  color: #6b7280;
}

.modal-btn.cancel:hover {
  background: #e5e7eb;
  color: #374151;
}

.modal-btn.confirm.danger {
  background: #ef4444;
  color: white;
}

.modal-btn.confirm.danger:hover {
  background: #dc2626;
}

.modal-btn.confirm.warning {
  background: #f59e0b;
  color: white;
}

.modal-btn.confirm.warning:hover {
  background: #d97706;
}

.modal-btn.confirm.info {
  background: #3b82f6;
  color: white;
}

.modal-btn.confirm.info:hover {
  background: #2563eb;
}
</style>
