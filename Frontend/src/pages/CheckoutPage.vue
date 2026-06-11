<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import api from '@/services/api'

const router = useRouter()
const cart = useCartStore()
const auth = useAuthStore()
const isLoggedIn = computed(() => auth.isLoggedIn)
const toast = useToast()

const form = ref({
  address: '',
  phone: '',
  notes: '',
  delivery_type: 'pickup',
  payment_method: 'transfer',
  bank_name: '',
})
const loading = ref(false)
const error = ref('')
const success = ref(false)
const orderData = ref(null)
const step = ref(1)

const formatIDR = (amount) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)

const shippingCost = computed(() => form.value.delivery_type === 'pickup' ? 0 : 5000)
const total = computed(() => cart.subtotal + shippingCost.value)

const bankOptions = [
  { id: 'bca', name: 'Bank BCA' },
  { id: 'mandiri', name: 'Bank Mandiri' },
  { id: 'bri', name: 'Bank BRI' },
  { id: 'bni', name: 'Bank BNI' },
  { id: 'qris', name: 'QRIS' },
  { id: 'gopay', name: 'GoPay' },
  { id: 'ovo', name: 'OVO' },
  { id: 'dana', name: 'DANA' },
]

onMounted(async () => {
  if (!auth.isLoggedIn) {
    router.push('/login')
    return
  }
  await cart.fetchCart()
  if (cart.items.length === 0) {
    router.push('/cart')
  }
})

const orderTotal = computed(() => orderData.value?.total_amount || total.value)

const paymentDetails = computed(() => {
  if (!orderData.value) return null
  const method = form.value.payment_method
  const bank = form.value.bank_name

  const bankNames = { bca: 'BCA', mandiri: 'Mandiri', bri: 'BRI', bni: 'BNI' }
  const bankAccounts = { bca: '1234567890', mandiri: '0987654321', bri: '1122334455', bni: '5544332211' }

  if (method === 'transfer') {
    return {
      type: 'transfer',
      bank: bankNames[bank] || 'BCA',
      account: bankAccounts[bank] || '1234567890',
      name: 'PT Belanja.in',
      amount: orderTotal.value,
    }
  }
  if (method === 'qris') {
    return { type: 'qris', amount: orderTotal.value }
  }
  // e-wallet
  return {
    type: 'ewallet',
    name: bank.charAt(0).toUpperCase() + bank.slice(1),
    phone: auth.user?.phone || '08xxxxxxxxxx',
    amount: orderTotal.value,
  }
})

const goNextStep = () => {
  if (!form.value.phone || form.value.phone.trim() === '' || form.value.phone === '08xxxxxxxxxx') {
    error.value = 'Nomor telepon wajib diisi'
    toast.error('Nomor telepon harus diisi!')
    return
  }
  step.value = 2
}

const handleCheckout = async () => {
  // Check stock before submitting
  const outOfStock = cart.items.find(item => item.quantity > item.stock)
  if (outOfStock) {
    error.value = `${outOfStock.name} stok tidak cukup (sisa ${outOfStock.stock})`
    toast.error(`${outOfStock.name} stok tidak cukup (sisa ${outOfStock.stock})`)
    return
  }
  if (!form.value.phone) {
    error.value = 'Nomor telepon wajib diisi'
    return
  }
  if (form.value.payment_method === 'transfer' && !form.value.bank_name) {
    error.value = 'Pilih bank tujuan transfer'
    return
  }
  if (form.value.payment_method === 'qris') {
    form.value.bank_name = 'qris'
  }
  if (['gopay', 'ovo', 'dana'].includes(form.value.payment_method)) {
    form.value.bank_name = form.value.payment_method
  }

  loading.value = true
  error.value = ''
  try {
    const res = await api.post('/orders', {
      shipping_address: form.value.address || 'Ambil di toko',
      phone: form.value.phone,
      notes: form.value.notes,
      delivery_type: form.value.delivery_type,
      payment_method: form.value.payment_method,
      bank_name: form.value.bank_name,
    })
    orderData.value = res.data.data
    step.value = 3
    success.value = true
    cart.fetchCart()
  } catch (e) {
    error.value = e.response?.data?.message || 'Gagal checkout'
  } finally {
    loading.value = false
  }
}

const proofFile = ref(null)
const proofPreview = ref('')
const proofLoading = ref(false)

const handleProofChange = (e) => {
  const file = e.target.files[0]
  if (!file) return
  const allowed = ['image/jpeg', 'image/png', 'image/jpg']
  if (!allowed.includes(file.type)) {
    toast.error('Format file harus JPG atau PNG')
    e.target.value = ''
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    toast.error('Ukuran file maksimal 5MB')
    e.target.value = ''
    return
  }
  if (proofPreview.value) URL.revokeObjectURL(proofPreview.value)
  proofFile.value = file
  proofPreview.value = URL.createObjectURL(file)
}

const handleUploadProof = async () => {
  if (!proofFile.value || !orderData.value) return
  proofLoading.value = true
  try {
    const fd = new FormData()
    fd.append('proof', proofFile.value)
    await api.post(`/orders/${orderData.value.order_id}/payment-proof`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    toast.success('Bukti pembayaran berhasil diupload!')
    proofFile.value = null
    proofPreview.value = ''
  } catch (e) {
    toast.error('Gagal upload bukti')
  } finally {
    proofLoading.value = false
  }
}

const goHome = () => {
  success.value = false
  router.push('/')
}

const goToOrders = () => {
  success.value = false
  router.push('/orders')
}
</script>

<template>
  <div v-if="isLoggedIn" class="checkout-page">
    <h1 class="page-title">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
      Checkout
    </h1>

    <!-- Steps indicator -->
    <div class="steps-bar">
      <div class="step" :class="{ active: step >= 1, done: step > 1 }">
        <span class="step-num">1</span>
        <span class="step-label">Pengiriman</span>
      </div>
      <div class="step-line" :class="{ active: step > 1 }"></div>
      <div class="step" :class="{ active: step >= 2, done: step > 2 }">
        <span class="step-num">2</span>
        <span class="step-label">Pembayaran</span>
      </div>
      <div class="step-line" :class="{ active: step > 2 }"></div>
      <div class="step" :class="{ active: step >= 3 }">
        <span class="step-num">3</span>
        <span class="step-label">Selesai</span>
      </div>
    </div>

    <div class="checkout-layout">
      <!-- Main form -->
      <div class="checkout-main">
        <!-- Error -->
        <Transition name="page">
          <div v-if="error" class="alert alert-error">
            <span>✕</span> {{ error }}
          </div>
        </Transition>

        <!-- Step 1: Delivery -->
        <div v-if="step === 1" class="glass-card form-card">
          <h2 class="card-title">Informasi Pengiriman</h2>

          <div class="field">
            <label>Nomor Telepon</label>
            <input v-model="form.phone" type="tel" class="input" placeholder="08xxxxxxxxxx" required />
          </div>

          <div class="field">
            <label>Tipe Pengiriman</label>
            <div class="delivery-options">
              <label class="delivery-opt" :class="{ active: form.delivery_type === 'pickup' }">
                <input type="radio" v-model="form.delivery_type" value="pickup" hidden />
                                <span class="opt-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h18v18H3z"/><path d="M3 9h18"/><path d="M9 21V9"/></svg></span>
                <span class="opt-text">Ambil di Toko</span>
                <span class="opt-badge free">Gratis</span>
              </label>
              <label class="delivery-opt" :class="{ active: form.delivery_type === 'delivery' }">
                <input type="radio" v-model="form.delivery_type" value="delivery" hidden />
                                <span class="opt-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg></span>
                <span class="opt-text">Antar ke Alamat</span>
                <span class="opt-badge">Rp 5.000</span>
              </label>
            </div>
          </div>

          <div v-if="form.delivery_type === 'delivery'" class="field">
            <label>Alamat Pengiriman</label>
            <textarea v-model="form.address" class="input" placeholder="Alamat lengkap..." rows="3"></textarea>
          </div>

          <div class="field">
            <label>Catatan (opsional)</label>
            <input v-model="form.notes" class="input" placeholder="Contoh: warna, ukuran, dll." />
          </div>

          <button class="btn btn-primary btn-block" @click="goNextStep">
            Lanjut ke Pembayaran
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        </div>

        <!-- Step 2: Payment -->
        <div v-if="step === 2" class="glass-card form-card">
          <h2 class="card-title">Metode Pembayaran</h2>

          <div class="payment-methods">
            <h3 class="sub-label">Transfer Bank</h3>
            <div class="payment-grid">
              <label
                v-for="opt in bankOptions.filter(o => ['bca','mandiri','bri','bni'].includes(o.id))"
                :key="opt.id"
                class="payment-opt"
                :class="{ active: form.payment_method === 'transfer' && form.bank_name === opt.id }"
              >
                <input type="radio" :value="opt.id" hidden @click="form.payment_method = 'transfer'; form.bank_name = opt.id" />
                                <span class="opt-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M3 10h18"/><path d="M5 6l7-3 7 3"/><path d="M4 10v11"/><path d="M20 10v11"/><path d="M8 14v4"/><path d="M12 14v4"/><path d="M16 14v4"/></svg></span>
                <span class="opt-text">{{ opt.name }}</span>
              </label>
            </div>

            <h3 class="sub-label">QRIS</h3>
            <div class="payment-grid">
              <label
                class="payment-opt wide"
                :class="{ active: form.payment_method === 'qris' }"
              >
                <input type="radio" value="qris" hidden @click="form.payment_method = 'qris'; form.bank_name = 'qris'" />
                                <span class="opt-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="8" height="8" rx="1"/><rect x="14" y="2" width="8" height="8" rx="1"/><rect x="2" y="14" width="8" height="8" rx="1"/><rect x="14" y="14" width="4" height="4"/><rect x="20" y="14" width="2" height="2"/><rect x="14" y="20" width="2" height="2"/><rect x="20" y="20" width="2" height="2"/></svg></span>
                <span class="opt-text">QRIS — Semua Bank & E-Wallet</span>
              </label>
            </div>

            <h3 class="sub-label">E-Wallet</h3>
            <div class="payment-grid">
              <label
                v-for="opt in bankOptions.filter(o => ['gopay','ovo','dana'].includes(o.id))"
                :key="opt.id"
                class="payment-opt"
                :class="{ active: form.payment_method === opt.id && form.bank_name === opt.id }"
              >
                <input type="radio" :value="opt.id" hidden @click="form.payment_method = opt.id; form.bank_name = opt.id" />
                                <span class="opt-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 010-4h14v4"/><path d="M3 5v14a2 2 0 002 2h16v-5"/><path d="M18 12a2 2 0 100 4 2 2 0 000-4z"/></svg></span>
                <span class="opt-text">{{ opt.name }}</span>
              </label>
            </div>
          </div>

          <div class="btn-row">
            <button class="btn btn-ghost" @click="step = 1">← Kembali</button>
            <button class="btn btn-primary" @click="handleCheckout" :disabled="loading">
              <span v-if="loading" class="spinner"></span>
              {{ loading ? 'Memproses...' : 'Bayar ' + formatIDR(total) }}
            </button>
          </div>
        </div>

        <!-- Step 3: Success -->
        <div v-if="step === 3 && orderData" class="glass-card form-card success-card">
          <div class="success-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <h2 class="card-title">Pesanan Berhasil!</h2>
          <p class="success-sub">Order #{{ orderData.order_id }} — {{ formatIDR(orderData.total_amount || total) }}</p>

          <!-- Payment Instructions -->
          <div class="payment-instructions glass-card">
            <h3 class="instr-title">
                          {{ paymentDetails.type === 'transfer' ? 'Instruksi Transfer' :
                             paymentDetails.type === 'qris' ? 'Instruksi QRIS' :
                             'Instruksi E-Wallet' }}
                        </h3>

            <!-- Transfer -->
            <div v-if="paymentDetails.type === 'transfer'" class="instr-body">
              <div class="instr-row"><span>Bank</span><strong>{{ paymentDetails.bank }}</strong></div>
              <div class="instr-row"><span>No. Rekening</span><strong>{{ paymentDetails.account }}</strong></div>
              <div class="instr-row"><span>Atas Nama</span><strong>{{ paymentDetails.name }}</strong></div>
              <div class="instr-row highlight"><span>Total</span><strong>{{ formatIDR(paymentDetails.amount) }}</strong></div>
            </div>

            <!-- QRIS -->
            <div v-if="paymentDetails.type === 'qris'" class="instr-body qris-body">
              <div class="qris-qr-wrap">
                <img src="/qris-gopay.png" alt="QRIS Code" class="qris-img" />
                <p class="qris-hint">Scan QR dari Gojek, OVO, DANA, atau mobile banking</p>
              </div>
              <div class="instr-row highlight"><span>Total</span><strong>{{ formatIDR(paymentDetails.amount) }}</strong></div>
            </div>

            <!-- E-Wallet -->
            <div v-if="paymentDetails.type === 'ewallet'" class="instr-body">
              <div class="instr-row"><span>E-Wallet</span><strong>{{ paymentDetails.name }}</strong></div>
              <div class="instr-row"><span>Nomor</span><strong>{{ paymentDetails.phone }}</strong></div>
              <div class="instr-row highlight"><span>Total</span><strong>{{ formatIDR(paymentDetails.amount) }}</strong></div>
            </div>
          </div>

          <!-- Upload Proof -->
          <div class="upload-section glass-card">
            <h3 class="instr-title">📎 Upload Bukti Bayar</h3>
            <p class="upload-hint">Upload screenshot/bukti transfer untuk konfirmasi lebih cepat</p>
            <div class="upload-area">
              <label class="upload-label">
                <input type="file" accept="image/*" @change="handleProofChange" hidden />
                <img v-if="proofPreview" :src="proofPreview" class="proof-thumb" />
                <span v-else class="upload-placeholder">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  Pilih file
                </span>
              </label>
            </div>
            <button
              v-if="proofFile"
              class="btn btn-accent btn-block"
              @click="handleUploadProof"
              :disabled="proofLoading"
            >
              <span v-if="proofLoading" class="spinner"></span>
              {{ proofLoading ? 'Uploading...' : 'Upload Sekarang' }}
            </button>
          </div>

          <div class="btn-row">
            <button class="btn btn-ghost" @click="goHome">← Lanjut Belanja</button>
            <button class="btn btn-primary" @click="goToOrders">Lihat Pesanan →</button>
          </div>
        </div>
      </div>

      <!-- Sidebar: Summary -->
      <div class="checkout-sidebar">
        <div class="glass-card summary-card">
          <h3 class="summary-title">Ringkasan Pesanan</h3>

          <div class="summary-items">
            <div v-for="item in cart.items" :key="item.id" class="summary-item">
              <img :src="item.image_url || 'https://placehold.co/48x48/f5f5f4/a8a29e?text=P'" class="item-thumb" />
              <div class="item-detail">
                <span class="item-name">{{ item.name }}</span>
                <span class="item-qty">x{{ item.quantity }}</span>
              </div>
              <span class="item-sub">{{ formatIDR(item.price * item.quantity) }}</span>
            </div>
          </div>

          <div class="summary-divider"></div>

          <div class="summary-rows">
            <div class="summary-row">
              <span>Subtotal</span>
              <span>{{ formatIDR(cart.subtotal) }}</span>
            </div>
            <div class="summary-row">
              <span>Pengiriman</span>
              <span :class="{ 'free-badge': shippingCost === 0 }">
                {{ shippingCost === 0 ? 'Gratis' : formatIDR(shippingCost) }}
              </span>
            </div>
          </div>

          <div class="summary-divider"></div>

          <div class="summary-total">
            <span>Total</span>
            <span class="total-value">{{ formatIDR(total) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.checkout-page { display: flex; flex-direction: column; gap: 16px; }

.page-title {
  display: flex; align-items: center; gap: 10px;
  font-size: 20px; font-weight: 800; letter-spacing: -0.02em;
}

/* Steps */
.steps-bar {
  display: flex; align-items: center; gap: 0; padding: 16px 0;
}

.step {
  display: flex; align-items: center; gap: 6px;
  opacity: 0.4; transition: opacity var(--duration-base);
}
.step.active { opacity: 1; }

.step-num {
  width: 28px; height: 28px; border-radius: 50%;
  background: var(--border-medium); color: var(--text-muted);
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700;
  transition: all var(--duration-base);
}
.step.active .step-num {
  background: var(--brand); color: white;
  box-shadow: 0 2px 8px rgba(99,168,179,0.3);
}
.step.done .step-num {
  background: var(--brand); color: white;
}

.step-label { font-size: 12.5px; font-weight: 600; color: var(--text-secondary); }
.step.active .step-label { color: var(--text-primary); }

.step-line {
  flex: 1; height: 2px; background: var(--border-medium); margin: 0 8px;
  transition: background var(--duration-base);
}
.step-line.active { background: var(--brand); }

/* Layout */
.checkout-layout {
  display: grid; grid-template-columns: 1fr 340px; gap: 20px; align-items: start;
}

.form-card { padding: 24px; }
.card-title {
  font-size: 17px; font-weight: 700; margin-bottom: 18px; letter-spacing: -0.01em;
}

/* Fields */
.field { margin-bottom: 16px; }
.field label {
  display: block; font-size: 12.5px; font-weight: 600;
  color: var(--text-secondary); margin-bottom: 6px;
}

/* Delivery options */
.delivery-options { display: flex; gap: 10px; }
.delivery-opt {
  flex: 1; display: flex; align-items: center; gap: 10px;
  padding: 12px 16px; border-radius: var(--radius-lg);
  border: 1.5px solid var(--border-medium); background: white;
  cursor: pointer; transition: all var(--duration-base) var(--ease-out-expo);
}
.delivery-opt:hover { border-color: var(--brand); }
.delivery-opt.active {
  border-color: var(--brand); background: var(--brand-light);
  box-shadow: 0 0 0 3px var(--brand-glow);
}
.opt-icon { font-size: 20px; }
.opt-text { font-size: 13.5px; font-weight: 600; flex: 1; }
.opt-badge {
  font-size: 11px; font-weight: 700; padding: 2px 8px;
  border-radius: var(--radius-full); background: var(--surface-100);
}
.opt-badge.free { background: var(--brand-light); color: var(--brand); }

/* Payment */
.payment-methods { margin-bottom: 20px; }
.sub-label {
  font-size: 12.5px; font-weight: 600; color: var(--text-muted);
  margin: 14px 0 8px; text-transform: uppercase; letter-spacing: 0.04em;
}
.payment-grid { display: flex; flex-wrap: wrap; gap: 8px; }
.payment-opt {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 16px; border-radius: var(--radius-lg);
  border: 1.5px solid var(--border-medium); background: white;
  cursor: pointer; transition: all var(--duration-base) var(--ease-out-expo);
}
.payment-opt:hover { border-color: var(--brand); }
.payment-opt.active {
  border-color: var(--brand); background: var(--brand-light);
  box-shadow: 0 0 0 3px var(--brand-glow);
}
.payment-opt.wide { flex: 1; }

/* Buttons */
.btn-row { display: flex; justify-content: space-between; gap: 10px; margin-top: 20px; }
.btn-block { width: 100%; padding: 11px; }
.spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.3); border-top-color: white;
  border-radius: 50%; animation: spin 0.6s linear infinite;
}

/* Success */
.success-card { text-align: center; }
.success-icon { font-size: 48px; margin-bottom: 8px; }
.success-sub { font-size: 14px; color: var(--text-secondary); margin-bottom: 20px; }

/* Payment Instructions */
.payment-instructions { padding: 18px; text-align: left; margin-bottom: 16px; }
.instr-title {
  font-size: 14px; font-weight: 700; margin-bottom: 12px;
}
.instr-body { display: flex; flex-direction: column; gap: 10px; }
.instr-row {
  display: flex; justify-content: space-between; font-size: 13.5px;
  color: var(--text-secondary);
}
.instr-row strong { color: var(--text-primary); }
.instr-row.highlight {
  padding-top: 10px; border-top: 1px solid var(--border-subtle);
}
.instr-row.highlight strong { color: var(--brand); font-size: 16px; }

.qris-body { align-items: center; }
.qris-qr-wrap {
  text-align: center; padding: 16px;
  background: white; border-radius: var(--radius-lg);
  border: 2px dashed var(--border-medium); margin-bottom: 8px;
}
.qris-img { width: 180px; height: 180px; object-fit: contain; margin: 0 auto 10px; }
.qris-hint { font-size: 12px; color: var(--text-muted); }

/* Upload */
.upload-section { padding: 18px; text-align: left; margin-bottom: 16px; }
.upload-hint { font-size: 12.5px; color: var(--text-muted); margin-bottom: 12px; }
.upload-area { margin-bottom: 12px; }
.upload-label {
  display: flex; align-items: center; justify-content: center;
  width: 100%; height: 120px; border: 2px dashed var(--border-medium);
  border-radius: var(--radius-lg); cursor: pointer;
  transition: all var(--duration-base);
}
.upload-label:hover { border-color: var(--brand); background: var(--brand-light); }
.proof-thumb { width: 100%; height: 120px; object-fit: cover; border-radius: var(--radius-md); }
.upload-placeholder {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  color: var(--text-muted); font-size: 13px;
}

/* Alert */
.alert { padding: 10px 14px; border-radius: var(--radius-md); font-size: 13px; font-weight: 500; margin-bottom: 14px; }
.alert-error { background: #fee2e2; color: #dc2626; border: 1px solid #fecaca; }

/* Sidebar Summary */
.summary-card { padding: 20px; position: sticky; top: 80px; }
.summary-title { font-size: 16px; font-weight: 700; margin-bottom: 14px; }
.summary-items { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; }
.summary-item { display: flex; align-items: center; gap: 10px; }
.item-thumb { width: 40px; height: 40px; border-radius: var(--radius-sm); object-fit: cover; background: var(--surface-100); }
.item-detail { flex: 1; min-width: 0; }
.item-name { display: block; font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.item-qty { font-size: 12px; color: var(--text-muted); }
.item-sub { font-size: 13px; font-weight: 600; color: var(--text-primary); }
.summary-divider { height: 1px; background: var(--border-subtle); margin: 12px 0; }
.summary-rows { display: flex; flex-direction: column; gap: 8px; }
.summary-row { display: flex; justify-content: space-between; font-size: 13px; color: var(--text-secondary); }
.free-badge { font-size: 11px; font-weight: 700; color: var(--brand); background: var(--brand-light); padding: 2px 8px; border-radius: var(--radius-full); }
.summary-total { display: flex; justify-content: space-between; font-size: 16px; font-weight: 700; }
.total-value { color: var(--brand); font-size: 18px; font-weight: 800; }

@media (max-width: 768px) {
  .checkout-layout { grid-template-columns: 1fr; }
  .delivery-options { flex-direction: column; }
}
</style>
