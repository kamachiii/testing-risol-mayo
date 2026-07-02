<script setup>
import { useCartStore } from '@/stores/cart'
import { getImageUrl } from '@/services/api'

const props = defineProps({
  item: { type: Object, required: true },
})

const cart = useCartStore()

const formatIDR = (amount) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)

const decreaseQty = () => {
  if (props.item.quantity <= 1) {
    cart.removeItem(props.item.id)
  } else {
    cart.changeQuantity(props.item.id, props.item.quantity - 1)
  }
}

const increaseQty = () => {
  if (props.item.quantity < props.item.stock) {
    cart.changeQuantity(props.item.id, props.item.quantity + 1)
  }
}

const removeItem = () => {
  cart.removeItem(props.item.id)
}
</script>

<template>
  <div class="cart-item glass-card">
    <!-- Image -->
    <div class="item-img-wrap">
      <img
        :src="getImageUrl(item.image_url) || 'https://placehold.co/120x120/f5f5f4/a8a29e?text=Produk'"
        :alt="item.name"
        class="item-img"
        loading="lazy"
      />
    </div>

    <!-- Info -->
    <div class="item-info">
      <h3 class="item-name">{{ item.name }}</h3>
      <p class="item-price">{{ formatIDR(item.price) }} / pcs</p>
    </div>

    <!-- Quantity -->
    <div class="item-qty">
      <button class="qty-btn" @click="decreaseQty">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>
      <span class="qty-value">{{ item.quantity }}</span>
      <span v-if="item.quantity >= item.stock" class="stock-limit">Stok habis</span>
      <button class="qty-btn" @click="increaseQty" :disabled="item.quantity >= item.stock">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>
    </div>

    <!-- Subtotal -->
    <div class="item-subtotal">
      <span class="subtotal-value">{{ formatIDR(item.price * item.quantity) }}</span>
    </div>

    <!-- Remove -->
    <button class="remove-btn" @click="removeItem" title="Hapus">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
      </svg>
    </button>
  </div>
</template>

<style scoped>
.cart-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px;
  transition: all var(--duration-base) var(--ease-out-expo);
}

.cart-item:hover {
  box-shadow: var(--shadow-md), inset 0 1px 0 rgba(255,255,255,0.5);
}

.item-img-wrap {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-md);
  overflow: hidden;
  flex-shrink: 0;
  background: var(--surface-100);
}

.item-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-price {
  font-size: 12.5px;
  color: var(--text-muted);
  margin-top: 2px;
}

.item-qty {
  display: flex;
  align-items: center;
  gap: 8px;
}

.qty-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1.5px solid var(--border-medium);
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all var(--duration-fast);
}

.qty-btn:hover {
  border-color: var(--brand);
  color: var(--brand);
  background: var(--brand-light);
}

.qty-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.qty-btn:disabled:hover {
  border-color: var(--border-medium);
  color: var(--text-secondary);
  background: white;
}

.stock-limit {
  position: absolute;
  bottom: -18px;
  left: 0;
  font-size: 11px;
  color: #ef4444;
  white-space: nowrap;
}

.qty-value {
  font-size: 14px;
  font-weight: 700;
  min-width: 24px;
  text-align: center;
}

.item-subtotal {
  min-width: 100px;
  text-align: right;
}

.subtotal-value {
  font-size: 15px;
  font-weight: 700;
  color: var(--brand);
}

.remove-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--duration-fast);
  flex-shrink: 0;
}

.remove-btn:hover {
  background: #fee2e2;
  color: #ef4444;
}

@media (max-width: 640px) {
  .cart-item { flex-wrap: wrap; gap: 12px; }
  .item-subtotal { min-width: auto; }
}
</style>
