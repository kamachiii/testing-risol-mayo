<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div class="cart-empty glass-card">
    <div class="empty-icon">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="9" cy="21" r="1"/>
        <circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
      </svg>
    </div>
    <h3>Keranjang Kosong</h3>
    <p>Yuk mulai belanja dan temukan produk favoritmu!</p>
    <button class="btn btn-primary" @click="router.push('/')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"/>
        <polyline points="12 19 5 12 12 5"/>
      </svg>
      Mulai Belanja
    </button>
  </div>
</template>

<style scoped>
.cart-empty {
  padding: 60px 32px;
  text-align: center;
}

.empty-icon {
  display: flex;
  justify-content: center;
  color: var(--text-muted);
  margin-bottom: 16px;
}

.cart-empty h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 6px;
}

.cart-empty p {
  font-size: 13.5px;
  color: var(--text-muted);
  margin-bottom: 20px;
}
</style>
