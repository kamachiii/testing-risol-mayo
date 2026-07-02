<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import api, { getImageUrl } from '@/services/api'

const route = useRoute()
const router = useRouter()
const cart = useCartStore()
const auth = useAuthStore()
const toast = useToast()

const product = ref(null)
const loading = ref(true)
const error = ref('')
const quantity = ref(1)
const isAdding = ref(false)
const showLoginModal = ref(false)

const formatIDR = (amount) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)

onMounted(async () => {
  try {
    const { data } = await api.get(`/products/${route.params.id}`)
    if (data.status === 'success' && data.data) {
      product.value = {
        id: data.data.id,
        name: data.data.name,
        price: Number(data.data.price),
        category: data.data.category_name || 'Lainnya',
        description: data.data.description || '',
        image_url: getImageUrl(data.data.image_url),
        stock: data.data.stock ?? 0,
      }
    } else {
      error.value = 'Produk tidak ditemukan'
    }
  } catch (e) {
    error.value = 'Gagal memuat produk'
  } finally {
    loading.value = false
  }
})

const incrementQty = () => {
  if (quantity.value < product.value.stock) quantity.value++
}
const decrementQty = () => {
  if (quantity.value > 1) quantity.value--
}

const handleAddToCart = async () => {
  if (!auth.isLoggedIn) {
    showLoginModal.value = true
    return
  }
  isAdding.value = true
  try {
    const result = await cart.addToCart(product.value.id, quantity.value)
    if (result.success) {
      toast.success(`${product.value.name} ditambahkan ke keranjang!`)
    } else {
      toast.error(result.message || 'Gagal tambah ke keranjang')
    }
  } catch (err) {
    toast.error('Terjadi kesalahan, coba lagi')
  } finally {
    setTimeout(() => { isAdding.value = false }, 600)
  }
}

const closeModal = () => { showLoginModal.value = false }
const goToLogin = () => { showLoginModal.value = false; router.push('/login') }
</script>

<template>
  <div class="detail-page">
    <!-- Loading -->
    <div v-if="loading" class="detail-skeleton">
      <div class="skel-img"></div>
      <div class="skel-info">
        <div class="skel-line w60"></div>
        <div class="skel-line w40"></div>
        <div class="skel-line w80"></div>
        <div class="skel-line w50"></div>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="detail-error">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
      <p>{{ error }}</p>
      <button class="btn btn-primary" @click="router.push('/')">Kembali Belanja</button>
    </div>

    <!-- Product Detail -->
    <div v-else-if="product" class="detail-content">
      <!-- Back button -->
      <button class="back-btn" @click="router.back()">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
        </svg>
        Kembali
      </button>

      <div class="detail-grid">
        <!-- Image -->
        <div class="detail-img-wrap">
          <img
            :src="product.image_url || 'https://placehold.co/600x600/f5f5f4/a8a29e?text=Produk'"
            :alt="product.name"
            class="detail-img"
          />
          <span v-if="product.stock <= 0" class="badge badge-error stock-tag">Stok Habis</span>
          <span v-else-if="product.stock <= 5" class="badge badge-warning stock-tag">Sisa {{ product.stock }}</span>
        </div>

        <!-- Info -->
        <div class="detail-info">
          <span class="category-tag">{{ product.category }}</span>
          <h1 class="detail-name">{{ product.name }}</h1>
          <p class="detail-price">{{ formatIDR(product.price) }}</p>

          <div class="detail-desc">
            <h3>Deskripsi</h3>
            <p>{{ product.description || 'Tidak ada deskripsi untuk produk ini.' }}</p>
          </div>

          <div class="detail-stock">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span v-if="product.stock > 0">Stok tersedia: {{ product.stock }}</span>
            <span v-else class="text-error">Stok habis</span>
          </div>

          <!-- Quantity + Add to Cart -->
          <div class="detail-actions" v-if="product.stock > 0">
            <div class="qty-control">
              <button class="qty-btn" @click="decrementQty" :disabled="quantity <= 1">−</button>
              <span class="qty-value">{{ quantity }}</span>
              <button class="qty-btn" @click="incrementQty" :disabled="quantity >= product.stock">+</button>
            </div>
            <button
              class="btn btn-primary btn-lg detail-add-btn"
              @click="handleAddToCart"
              :disabled="isAdding"
            >
              <span v-if="isAdding" class="spinner"></span>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
              </svg>
              {{ isAdding ? 'Menambahkan...' : 'Tambah ke Keranjang' }}
            </button>
          </div>

          <div v-else class="detail-out-of-stock">
            <p>Produk ini sedang tidak tersedia.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Login Modal -->
    <Transition name="modal">
      <div v-if="showLoginModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-glass">
          <div class="modal-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <h3>Masuk Dulu</h3>
          <p>Anda perlu masuk untuk menambahkan produk ke keranjang.</p>
          <div class="modal-actions">
            <button class="btn btn-ghost" @click="closeModal">Batal</button>
            <button class="btn btn-primary" @click="goToLogin">Masuk</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.detail-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

/* Back */
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  padding: 8px 0;
  margin-bottom: 16px;
  transition: color 0.15s;
}
.back-btn:hover { color: var(--brand); }

/* Grid */
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: start;
}

/* Image */
.detail-img-wrap {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  background: #f9fafb;
  aspect-ratio: 1;
}
.detail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.stock-tag {
  position: absolute;
  top: 12px;
  left: 12px;
  font-size: 11px;
}

/* Info */
.detail-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.category-tag {
  display: inline-block;
  width: fit-content;
  padding: 4px 10px;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--brand);
  background: rgba(99,168,179,0.08);
  border-radius: 999px;
}
.detail-name {
  font-size: 22px;
  font-weight: 700;
  line-height: 1.3;
  color: var(--text-primary);
}
.detail-price {
  font-size: 20px;
  font-weight: 800;
  color: var(--brand);
}
.detail-desc {
  padding: 14px 0;
  border-top: 1px solid var(--border-subtle);
}
.detail-desc h3 {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-secondary);
  margin-bottom: 6px;
}
.detail-desc p {
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--text-primary);
}
.detail-stock {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-muted);
}
.text-error { color: #ef4444; font-weight: 600; }

/* Actions */
.detail-actions {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-top: 8px;
}
.qty-control {
  display: flex;
  align-items: center;
  border: 1.5px solid var(--border-subtle);
  border-radius: 12px;
  overflow: hidden;
}
.qty-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
  transition: background 0.12s;
}
.qty-btn:hover:not(:disabled) { background: #f3f4f6; }
.qty-btn:disabled { color: #d1d5db; cursor: not-allowed; }
.qty-value {
  min-width: 36px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
}
.detail-add-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
}
.detail-out-of-stock {
  padding: 14px 18px;
  background: #fef2f2;
  border-radius: 12px;
  color: #dc2626;
  font-size: 13px;
  font-weight: 600;
}

/* Spinner */
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

/* Skeleton */
.detail-skeleton {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}
.skel-img {
  aspect-ratio: 1;
  border-radius: 16px;
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
.skel-info {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-top: 20px;
}
.skel-line {
  height: 16px;
  border-radius: 8px;
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
.w60 { width: 60%; }
.w40 { width: 40%; }
.w80 { width: 80%; }
.w50 { width: 50%; }

/* Error */
.detail-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 60px 20px;
  color: var(--text-muted);
}
.detail-error p { font-size: 14px; }

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.modal-glass {
  background: #fff;
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  padding: 32px;
  max-width: 360px;
  width: 100%;
  text-align: center;
  box-shadow: 0 8px 30px rgba(0,0,0,0.1);
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
  color: var(--text-muted);
  margin-bottom: 20px;
}
.modal-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

/* Modal transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* Shimmer animation */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Mobile */
@media (max-width: 640px) {
  .detail-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  .detail-name { font-size: 18px; }
  .detail-price { font-size: 18px; }
  .detail-actions { flex-direction: column; }
  .detail-add-btn { width: 100%; }
  .detail-skeleton { grid-template-columns: 1fr; }
}
</style>
