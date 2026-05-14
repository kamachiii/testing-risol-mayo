<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'

const props = defineProps({
  product: { type: Object, required: true },
})

const router = useRouter()
const cart = useCartStore()
const auth = useAuthStore()
const toast = useToast()
const showLoginModal = ref(false)
const isAdding = ref(false)

const formatIDR = (amount) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)

const handleAddToCart = async () => {
  if (!auth.isLoggedIn) {
    showLoginModal.value = true
    return
  }
  isAdding.value = true
  const result = await cart.addToCart(props.product.id, 1)
  if (result.success) {
    toast.success(`${props.product.name} ditambahkan ke keranjang!`)
  } else {
    toast.error(result.message || 'Gagal tambah ke keranjang')
  }
  setTimeout(() => { isAdding.value = false }, 600)
}

const closeModal = () => { showLoginModal.value = false }
const goToLogin = () => { showLoginModal.value = false; router.push('/login') }
</script>

<template>
  <div
    class="product-card glass-card"
    v-motion
    :initial="{ opacity: 0, y: 20 }"
    :enter="{ opacity: 1, y: 0, transition: { duration: 400 } }"
  >
    <!-- Image -->
    <div class="card-img-wrap" @click="router.push({ name: 'product-detail', params: { id: product.id } })">
      <img
        :src="product.image_url || 'https://placehold.co/400x400/f5f5f4/a8a29e?text=Produk'"
        :alt="product.name"
        class="card-img"
        loading="lazy"
      />
      <span v-if="product.stock <= 0" class="badge badge-error stock-badge">Habis</span>
      <span v-else-if="product.stock <= 5" class="badge badge-warning stock-badge">Sisa {{ product.stock }}</span>

      <!-- Quick Add -->
      <button
        v-if="product.stock > 0"
        class="quick-add"
        :class="{ 'is-adding': isAdding }"
        @click.stop="handleAddToCart"
      >
        <svg v-if="!isAdding" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        <span v-else class="check-icon">✓</span>
      </button>
    </div>

    <!-- Info -->
    <div class="card-body" @click="router.push({ name: 'product-detail', params: { id: product.id } })">
      <h3 class="card-name">{{ product.name }}</h3>
      <p class="card-category">{{ product.category_name || 'Umum' }}</p>
      <div class="card-footer">
        <span class="card-price">{{ formatIDR(product.price) }}</span>
        <button
          v-if="product.stock > 0"
          class="btn btn-primary btn-sm add-btn"
          @click="handleAddToCart"
          :disabled="isAdding"
        >
          + Keranjang
        </button>
      </div>
    </div>

    <!-- Login Modal -->
    <Teleport to="body">
      <Transition name="page">
        <div v-if="showLoginModal" class="modal-overlay" @click.self="closeModal">
          <div class="modal-glass">
            <div class="modal-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
            </div>
            <h3>Masuk Dulu</h3>
            <p>Login untuk tambah produk ke keranjang</p>
            <div class="modal-actions">
              <button class="btn btn-ghost" @click="closeModal">Batal</button>
              <button class="btn btn-primary" @click="goToLogin">Masuk</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.product-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  cursor: pointer;
  transition: all var(--duration-base) var(--ease-out-expo);
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg), inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.card-img-wrap {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  background: var(--surface-100);
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--duration-slow) var(--ease-out-expo);
}

.product-card:hover .card-img {
  transform: scale(1.05);
}

.stock-badge {
  position: absolute;
  top: 10px;
  left: 10px;
}

.quick-add {
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: white;
  border: none;
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transform: scale(0.8);
  transition: all var(--duration-base) var(--ease-spring);
  color: var(--brand);
}

.product-card:hover .quick-add {
  opacity: 1;
  transform: scale(1);
}

.quick-add:hover {
  background: var(--brand);
  color: white;
  box-shadow: var(--shadow-glow);
}

.quick-add.is-adding {
  opacity: 1;
  transform: scale(1);
  background: var(--brand);
  color: white;
}

.check-icon {
  font-size: 16px;
  font-weight: 700;
  animation: scale-in 0.3s var(--ease-spring);
}

.card-body {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.card-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-category {
  font-size: 11.5px;
  color: var(--text-muted);
  font-weight: 500;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
}

.card-price {
  font-size: 16px;
  font-weight: 800;
  color: var(--brand);
  letter-spacing: -0.02em;
}

.add-btn {
  opacity: 0;
  transform: translateY(4px);
  transition: all var(--duration-base) var(--ease-out-expo);
}

.product-card:hover .add-btn {
  opacity: 1;
  transform: translateY(0);
}

/* Mobile: always show add button */
@media (hover: none) and (pointer: coarse) {
  .add-btn {
    opacity: 1;
    transform: translateY(0);
  }
  .quick-add {
    opacity: 1;
    transform: scale(1);
  }
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--surface-overlay);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-glass {
  background: var(--glass-bg-strong);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-2xl);
  padding: 32px;
  max-width: 360px;
  width: 100%;
  text-align: center;
  box-shadow: var(--shadow-xl);
}

.modal-icon {
  display: flex;
  justify-content: center;
  color: var(--brand);
  margin-bottom: 12px;
}

.modal-glass h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 6px;
}

.modal-glass p {
  font-size: 13.5px;
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.modal-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}
</style>
