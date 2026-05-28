<script setup>
import { ref, onMounted } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useToast } from '@/composables/useToast'
import CartItem from '@/components/cart/CartItem.vue'
import CartSummary from '@/components/cart/CartSummary.vue'
import CartEmpty from '@/components/cart/CartEmpty.vue'

const cart = useCartStore()
const toast = useToast()
const error = ref('')

onMounted(async () => {
  try {
    await cart.fetchCart()
  } catch (e) {
    error.value = 'Gagal memuat keranjang'
    toast.error('Gagal memuat keranjang')
  }
})
</script>

<template>
  <div class="cart-page">
    <h1 class="page-title">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 01-8 0"/>
      </svg>
      Keranjang
      <span v-if="cart.totalItems > 0" class="badge badge-primary">{{ cart.totalItems }}</span>
    </h1>

    <!-- Loading -->
    <div v-if="cart.loading" class="cart-loading">
      <div class="spinner"></div>
      <span>Memuat keranjang...</span>
    </div>
    <!-- Empty cart -->
    <div v-if="error" class="error-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <p>{{ error }}</p>
      <button @click="cart.fetchCart()" class="btn-primary">Coba Lagi</button>
    </div>
    <CartEmpty v-else-if="!cart.loading && cart.items.length === 0" />

    <!-- Cart content -->
    <div v-else class="cart-layout">
      <div class="cart-items">
        <CartItem
          v-for="item in cart.items"
          :key="item.id"
          :item="item"
        />
      </div>
      <CartSummary />
    </div>
  </div>
</template>

<style scoped>
.cart-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--text-primary);
}

.cart-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 20px;
  align-items: start;
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px 24px;
  color: var(--text-muted);
  text-align: center;
}

.error-state p {
  font-size: 14px;
  color: var(--text-muted);
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

@media (max-width: 768px) {
  .cart-layout {
    grid-template-columns: 1fr;
  }
}
.cart-loading { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 48px 0; color: var(--text-muted); }
.spinner { width: 28px; height: 28px; border: 3px solid var(--border-medium); border-top-color: var(--brand); border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
