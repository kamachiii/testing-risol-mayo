<script setup>
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const cart = useCartStore()

const formatIDR = (amount) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
</script>

<template>
  <div class="cart-summary glass-card">
    <h3 class="summary-title">Ringkasan Belanja</h3>

    <div class="summary-rows">
      <div class="summary-row">
        <span>Subtotal ({{ cart.totalItems }} item)</span>
        <span class="summary-value">{{ formatIDR(cart.subtotal) }}</span>
      </div>
      <div class="summary-row muted">
        <span>Biaya Kirim</span>
        <span class="shipping-note">Dihitung saat checkout</span>
      </div>
    </div>

    <div class="summary-divider"></div>

    <div class="summary-total">
      <span>Total</span>
      <span class="total-value">{{ formatIDR(cart.subtotal) }}</span>
    </div>

    <button class="btn btn-accent btn-block checkout-btn" @click="router.push('/checkout')">
      Checkout
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"/>
        <polyline points="12 5 19 12 12 19"/>
      </svg>
    </button>
  </div>
</template>

<style scoped>
.cart-summary {
  padding: 20px;
  position: sticky;
  top: 80px;
}

.summary-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 16px;
  color: var(--text-primary);
}

.summary-rows {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 13.5px;
  color: var(--text-secondary);
}

.summary-row.muted { color: var(--text-muted); }

.summary-value {
  font-weight: 600;
  color: var(--text-primary);
}

.free-badge {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--brand);
  background: var(--brand-light);
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.summary-divider {
  height: 1px;
  background: var(--border-subtle);
  margin: 14px 0;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 16px;
}

.total-value {
  color: var(--brand);
  font-size: 18px;
  font-weight: 800;
}

.btn-block {
  width: 100%;
  padding: 12px;
  font-size: 14px;
}
</style>
