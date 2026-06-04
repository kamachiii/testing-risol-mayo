<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import QRCode from 'qrcode'
import ConfirmModal from '@/components/common/ConfirmModal.vue'

const auth = useAuthStore()
const orders = ref([])
const loading = ref(true)
const error = ref('')
const expandedId = ref(null)

const toggleExpand = (id) => {
  expandedId.value = expandedId.value === id ? null : id
  if (expandedId.value) {
    nextTick(() => generateQRCodes())
  }
}

// Generate QR codes for QRIS payments
const generateQRCodes = async () => {
  await nextTick()
  const qrisOrders = orders.value.filter(o => o.payment_method === 'qris' && expandedId.value === o.id)
  for (const order of qrisOrders) {
    const canvas = document.getElementById(`qris-canvas-${order.id}`)
    if (canvas) {
      const qrData = `https://belanja.in/pay/${order.id}?amount=${order.total_amount}&method=qris`
      try {
        await QRCode.toCanvas(canvas, qrData, {
          width: 160,
          margin: 2,
          color: { dark: '#000000', light: '#ffffff' }
        })
      } catch (err) {
        console.error('QR generation failed:', err)
      }
    }
  }
}

// Watch for expanded changes to regenerate QR
watch(expandedId, () => {
  nextTick(() => generateQRCodes())
})

const statusSteps = ['pending', 'paid', 'confirmed', 'processing', 'shipped', 'delivered', 'completed']
const stepLabels = { pending: 'Menunggu', confirmed: 'Dikonfirmasi', processing: 'Diproses', shipped: 'Dikirim', delivered: 'Diterima', completed: 'Selesai', paid: 'Dibayar', cancelled: 'Dibatalkan' }

const getStepIndex = (status) => statusSteps.indexOf(status)

const statusColor = (s) => {
  const map = { pending: 'warning', confirmed: 'info', processing: 'primary', shipped: 'primary', delivered: 'success', completed: 'success', cancelled: 'error', paid: 'warning' }
  return map[s] || 'muted'
}

const statusLabel = (s) => {
  const map = { pending: 'Menunggu', confirmed: 'Dikonfirmasi', processing: 'Diproses', shipped: 'Dikirim', delivered: 'Diterima', completed: 'Selesai', cancelled: 'Dibatalkan', paid: 'Dibayar' }
  return map[s] || s
}

const formatDate = (d) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
const formatCurrency = (n) => 'Rp ' + Number(n).toLocaleString('id-ID')

const fetchOrders = async () => {
  loading.value = true
  error.value = ''
  try {
    const { data } = await api.get('/my-orders/nested')
    orders.value = data.data || []
  } catch (e) {
    error.value = e.response?.data?.message || 'Gagal memuat pesanan'
  } finally {
    loading.value = false
  }
}

const uploadingId = ref(null)
const uploadError = ref('')
const proofViewUrl = ref(null)

const viewProof = (url) => { proofViewUrl.value = url }

// Confirm modal state
const showCancelConfirm = ref(false)
const cancelTargetId = ref(null)
const errorMsg = ref('')

const openCancelConfirm = (orderId) => {
  cancelTargetId.value = orderId
  showCancelConfirm.value = true
}

const cancelOrder = async () => {
  showCancelConfirm.value = false
  try {
    await api.put(`/orders/${cancelTargetId.value}/cancel`)
    await fetchOrders()
  } catch (e) {
    errorMsg.value = e.response?.data?.message || 'Gagal membatalkan pesanan'
    setTimeout(() => errorMsg.value = '', 4000)
  }
}

const triggerUpload = (orderId) => {
  const input = document.getElementById(`proof-${orderId}`)
  if (input) input.click()
}

const handleUploadProof = async (orderId, event) => {
  const file = event.target.files[0]
  if (!file) return
  uploadingId.value = orderId
  uploadError.value = ''
  try {
    const formData = new FormData()
    formData.append('payment_proof', file)
    await api.post(`/orders/${orderId}/payment-proof`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    await fetchOrders()
  } catch (e) {
    uploadError.value = e.response?.data?.message || 'Gagal upload bukti pembayaran'
  } finally {
    uploadingId.value = null
    event.target.value = ''
  }
}

const bankNames = { bca: 'BCA', mandiri: 'Mandiri', bri: 'BRI', bni: 'BNI' }
const bankAccounts = { bca: '1234567890', mandiri: '0987654321', bri: '1122334455', bni: '5544332211' }

onMounted(fetchOrders)
</script>

<template>
  <div class="order-history-page">
    <h1 class="page-title">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
      Pesanan Saya
    </h1>

    <!-- Loading -->
    <div v-if="loading" class="loading-grid">
      <div v-for="i in 3" :key="i" class="glass-card order-card-skeleton">
        <div class="skeleton" style="height: 16px; width: 60%; margin-bottom: 10px;"></div>
        <div class="skeleton" style="height: 12px; width: 40%; margin-bottom: 16px;"></div>
        <div class="skeleton" style="height: 12px; width: 100%;"></div>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="glass-card error-card">
      <p>{{ error }}</p>
      <button class="btn btn-primary btn-sm" @click="fetchOrders">Coba Lagi</button>
    </div>

    <!-- Empty -->
    <div v-else-if="orders.length === 0" class="glass-card empty-card">
      <div class="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
        </div>
      <h3>Belum ada pesanan</h3>
      <p>Mulai belanja untuk membuat pesanan pertama!</p>
      <router-link to="/" class="btn btn-primary" style="margin-top:12px;display:inline-flex;align-items:center;gap:6px;text-decoration:none;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        Mulai Belanja
      </router-link>
    </div>

    <!-- Orders -->
    <div v-else class="orders-list">
      <div
        v-for="order in orders"
        :key="order.id"
        class="glass-card order-card"
        :class="{ expanded: expandedId === order.id }"
      >
        <!-- Header (clickable) -->
        <div class="order-header clickable" @click="toggleExpand(order.id)">
          <div>
            <span class="order-id">Order #{{ order.id }}</span>
            <span class="order-date">{{ formatDate(order.created_at) }}</span>
          </div>
          <div class="order-header-right">
            <span class="badge" :class="`badge-${statusColor(order.status)}`">
              {{ statusLabel(order.status) }}
            </span>
            <span class="expand-icon" :class="{ rotated: expandedId === order.id }">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </span>
          </div>
        </div>

        <!-- Expanded detail -->
        <div v-if="expandedId === order.id" class="order-detail">
          <!-- Status Stepper -->
          <div class="status-stepper" v-if="order.status !== 'cancelled'">
            <div class="stepper-track">
              <div
                v-for="(step, idx) in statusSteps"
                :key="step"
                class="step"
                :class="{ active: getStepIndex(order.status) >= idx, current: order.status === step }"
              >
                <div class="step-dot">
                  <svg v-if="getStepIndex(order.status) > idx" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  <span v-else-if="order.status === step" class="step-current-icon">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="6"/></svg>
                  </span>
                  <span v-else class="step-num">{{ idx + 1 }}</span>
                </div>
                <span class="step-label">{{ stepLabels[step] }}</span>
                <div v-if="idx < statusSteps.length - 1" class="step-connector">
                  <div class="step-connector-fill" :class="{ filled: getStepIndex(order.status) > idx }"></div>
                </div>
              </div>
            </div>
          </div>

        <!-- Delivery Type -->
        <div style="padding: 0 16px; margin-top: 10px; display: flex; align-items: center; gap: 6px; font-size: 13px;">
          <svg v-if="order.shipping_address === 'Ambil di toko'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
          </svg>
          <span :style="{ color: order.shipping_address === 'Ambil di toko' ? '#059669' : '#2563eb', fontWeight: 600 }">
            {{ order.shipping_address === 'Ambil di toko' ? 'Ambil di Toko' : 'Diantar ke Alamat' }}
          </span>
        </div>

        <!-- Shipping Address -->
        <div v-if="order.shipping_address" class="order-address" style="padding: 0 16px; font-size: 13px; color: #6b7280; display: flex; align-items: flex-start; gap: 6px; margin-top: 6px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0; margin-top:1px;">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          <span>{{ order.shipping_address }}</span>
        </div>

        <!-- Items -->
        <div class="order-items">
          <div v-for="item in order.items" :key="item.id" class="order-item">
            <img
              :src="item.image_url || 'https://placehold.co/48x48/f5f5f4/a8a29e?text=P'"
              class="item-thumb"
            />
            <div class="item-info">
              <span class="item-name">{{ item.product_name }}</span>
              <span class="item-qty">x{{ item.quantity }} — {{ formatCurrency(item.price_at_purchase) }}</span>
            </div>
          </div>
        </div>

        <!-- Payment Info -->
        <div v-if="order.payment_method" class="order-payment">
          <!-- Bank Transfer -->
          <div v-if="order.payment_method === 'transfer' && order.bank_name" class="payment-info glass-surface">
            <h4>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;">
              <path d="M3 21h18"/><path d="M3 10h18"/><path d="M5 6l7-3 7 3"/><path d="M4 10v11"/><path d="M20 10v11"/><path d="M8 14v4"/><path d="M12 14v4"/><path d="M16 14v4"/>
            </svg>
            Transfer Bank — {{ bankNames[order.bank_name] || order.bank_name }}
          </h4>
            <div class="payment-rows">
              <div class="pay-row"><span>No. Rekening</span><strong>{{ bankAccounts[order.bank_name] || '-' }}</strong></div>
              <div class="pay-row"><span>Atas Nama</span><strong>PT Belanja.in</strong></div>
              <div class="pay-row highlight"><span>Total</span><strong>{{ formatCurrency(order.total_amount) }}</strong></div>
            </div>
          </div>

          <!-- QRIS -->
          <div v-if="order.payment_method === 'qris'" class="payment-info glass-surface qris-payment">
            <div class="qris-header">
              <div class="qris-badge">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="2" width="8" height="8" rx="1"/><rect x="14" y="2" width="8" height="8" rx="1"/><rect x="2" y="14" width="8" height="8" rx="1"/>
                  <rect x="14" y="14" width="4" height="4"/><rect x="20" y="14" width="2" height="2"/>
                  <rect x="14" y="20" width="2" height="2"/><rect x="20" y="20" width="2" height="2"/>
                </svg>
                <span>QRIS</span>
              </div>
            </div>
            <div class="qris-body">
              <div class="qris-qr-wrap">
                <canvas :id="'qris-canvas-' + order.id" class="qris-canvas"></canvas>
              </div>
              <div class="qris-info">
                <div class="qris-total">
                  <span>Total Pembayaran</span>
                  <strong>{{ formatCurrency(order.total_amount) }}</strong>
                </div>
                <div class="qris-steps">
                  <div class="qris-step"><span class="qris-step-num">1</span> Buka app mobile banking / e-wallet</div>
                  <div class="qris-step"><span class="qris-step-num">2</span> Pilih menu QRIS / Scan QR</div>
                  <div class="qris-step"><span class="qris-step-num">3</span> Scan kode QR di atas</div>
                  <div class="qris-step"><span class="qris-step-num">4</span> Konfirmasi pembayaran</div>
                </div>
              </div>
            </div>
          </div>

          <!-- E-Wallet -->
          <div v-if="['gopay','ovo','dana'].includes(order.payment_method)" class="payment-info glass-surface">
            <h4>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;">
              <path d="M21 12V7H5a2 2 0 010-4h14v4"/><path d="M3 5v14a2 2 0 002 2h16v-5"/><path d="M18 12a2 2 0 100 4 2 2 0 000-4z"/>
            </svg>
            {{ order.payment_method.toUpperCase() }}
          </h4>
            <div class="payment-rows">
              <div class="pay-row highlight"><span>Total</span><strong>{{ formatCurrency(order.total_amount) }}</strong></div>
            </div>
          </div>
        </div>

        </div> <!-- close order-detail -->

        <!-- Total & Actions -->
        <div class="order-footer">
          <div class="order-total">
            <span>Total</span>
            <strong>{{ formatCurrency(order.total_amount) }}</strong>
          </div>

          <!-- Cancel button (pending/paid only) -->
          <button
            v-if="order.status === 'pending' || order.status === 'paid'"
            class="btn btn-sm"
            style="color: #dc2626; border: 1px solid #fecaca; background: #fee2e2; cursor: pointer;"
            @click="openCancelConfirm(order.id)"
                      >Batal Pesanan</button>

          <!-- Upload proof (pending only) -->
          <div v-if="order.status === 'pending' && !order.payment_proof" class="upload-area">
            <input
              type="file"
              :id="`proof-${order.id}`"
              accept="image/jpeg,image/png,image/jpg,image/webp"
              style="display:none"
              @change="handleUploadProof(order.id, $event)"
            />
            <button
              class="btn btn-accent btn-sm"
              @click="triggerUpload(order.id)"
              :disabled="uploadingId === order.id"
            >
              <template v-if="uploadingId === order.id">
                <span class="spinner"></span> Uploading...
              </template>
              <template v-else>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
                </svg>
                Upload Bukti Bayar
              </template>
            </button>
          </div>

          <!-- Proof uploaded -->
          <div v-if="order.payment_proof" class="proof-uploaded" @click="viewProof(order.payment_proof)" style="cursor: pointer;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            Lihat Bukti
          </div>

        </div>
      </div>
    </div>

    <!-- Proof Viewer Modal (single instance) -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="proofViewUrl" class="modal-backdrop" @click="proofViewUrl = null">
          <div class="proof-modal" @click.stop>
            <button class="proof-close" @click="proofViewUrl = null">✕</button>
            <img :src="proofViewUrl" alt="Bukti Pembayaran" class="proof-full" />
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Cancel Confirm Modal -->
    <ConfirmModal
      :show="showCancelConfirm"
      title="Batalkan Pesanan?"
      message="Yakin ingin membatalkan pesanan ini? Tindakan ini tidak dapat dibatalkan."
      confirm-text="Ya, Batalkan"
      cancel-text="Tidak"
      type="danger"
      @confirm="cancelOrder"
      @cancel="showCancelConfirm = false"
    />

    <!-- Error Toast -->
    <Teleport to="body">
      <div v-if="errorMsg" class="toast-error">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        {{ errorMsg }}
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.order-history-page { display: flex; flex-direction: column; gap: 16px; }

.page-title {
  display: flex; align-items: center; gap: 10px;
  font-size: 20px; font-weight: 800; letter-spacing: -0.02em;
}

.loading-grid { display: flex; flex-direction: column; gap: 12px; }
.order-card-skeleton { padding: 20px; }

.error-card, .empty-card { padding: 40px; text-align: center; }
.empty-icon {
  display: flex;
  justify-content: center;
  color: var(--text-muted);
  margin-bottom: 12px;
}
.empty-card h3 { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
.empty-card p { font-size: 13px; color: var(--text-muted); }

.orders-list { display: flex; flex-direction: column; gap: 12px; }

.order-card { padding: 20px; }

.order-header {
  display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px;
}
.order-header-right {
  display: flex; align-items: center; gap: 6px; flex-shrink: 0;
}
.expand-icon {
  display: flex; align-items: center; transition: transform 0.25s ease;
  color: var(--text-muted);
}
.expand-icon.rotated { transform: rotate(180deg); }
.order-id { display: block; font-size: 15px; font-weight: 700; }
.order-date { display: block; font-size: 12px; color: var(--text-muted); margin-top: 2px; }

.order-items { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
.order-item { display: flex; align-items: center; gap: 10px; }
.item-thumb { width: 40px; height: 40px; border-radius: var(--radius-sm); object-fit: cover; background: var(--surface-100); }
.item-info { flex: 1; }
.item-name { display: block; font-size: 13px; font-weight: 600; }
.item-qty { font-size: 12px; color: var(--text-muted); }

/* Payment Info */
.order-payment { margin-bottom: 14px; }
.payment-info { padding: 14px; border-radius: var(--radius-md); }
.payment-info h4 { font-size: 13px; font-weight: 700; margin-bottom: 10px; }
.payment-rows { display: flex; flex-direction: column; gap: 6px; }
.pay-row { display: flex; justify-content: space-between; font-size: 13px; color: var(--text-secondary); }
.pay-row strong { color: var(--text-primary); }
.pay-row.highlight { padding-top: 8px; border-top: 1px solid var(--border-subtle); }
.pay-row.highlight strong { color: var(--brand); font-size: 15px; }

/* QRIS Payment */
.qris-payment { padding: 0; overflow: hidden; }
.qris-header {
  padding: 14px 16px;
  background: linear-gradient(135deg, #63A8B3 0%, #4a9aa8 100%);
  display: flex;
  align-items: center;
  gap: 8px;
}
.qris-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  color: white;
  font-size: 15px;
  font-weight: 700;
}
.qris-badge svg { stroke: white; }
.qris-body {
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.qris-qr-wrap {
  background: white;
  padding: 12px;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.qris-canvas { display: block; border-radius: 4px; }
.qris-info { width: 100%; }
.qris-total {
  text-align: center;
  padding-bottom: 14px;
  margin-bottom: 14px;
  border-bottom: 1px solid #e5e7eb;
}
.qris-total span { display: block; font-size: 12px; color: #9ca3af; margin-bottom: 2px; }
.qris-total strong { font-size: 20px; font-weight: 800; color: #63A8B3; }
.qris-steps { display: flex; flex-direction: column; gap: 8px; }
.qris-step {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  color: #6b7280;
}
.qris-step-num {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #f3f4f6;
  color: #63A8B3;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.qris-thumb { width: 120px; height: 120px; object-fit: contain; margin: 0 auto 8px; }

/* Expanded detail */
.order-detail {
  padding: 0;
  margin-top: 4px;
  animation: slideDown 0.3s ease;
}
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}
.order-detail .order-items {
  padding: 12px 16px;
  margin-bottom: 0;
}
.order-detail .order-payment {
  padding: 0 16px 12px;
}
.order-detail .order-address {
  padding: 0 16px;
}

.order-footer {
  display: flex; justify-content: space-between; align-items: center;
  padding-top: 14px; border-top: 1px solid var(--border-subtle);
}
.order-total span { font-size: 13px; color: var(--text-secondary); display: block; }
.order-total strong { font-size: 16px; color: var(--brand); font-weight: 800; }

.proof-badge {
  font-size: 12px; font-weight: 600; color: var(--brand);
  background: var(--brand-light); padding: 6px 12px; border-radius: var(--radius-full);
}

.spinner {
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.3); border-top-color: white;
  border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block;
}
/* Proof viewer modal */
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 1000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
.proof-modal { position: relative; max-width: 90vw; max-height: 90vh; border-radius: 12px; overflow: hidden; background: white; }
.proof-close { position: absolute; top: 8px; right: 8px; width: 32px; height: 32px; border-radius: 50%; border: none; background: rgba(0,0,0,0.5); color: white; font-size: 14px; cursor: pointer; z-index: 1; display: flex; align-items: center; justify-content: center; }
.proof-full { max-width: 80vw; max-height: 85vh; object-fit: contain; }
.proof-badge.clickable { cursor: pointer; }
.proof-badge.clickable:hover { background: rgba(99,168,179,0.2) !important; color: var(--brand) !important; }

/* ── Status Stepper ── */
.status-stepper {
  padding: 20px 16px 16px;
}
.stepper-track {
  display: flex;
  align-items: flex-start;
  position: relative;
}
.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
  z-index: 1;
}
.step-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  border: 2.5px solid #e5e7eb;
  background: white;
  color: #c0c0c0;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 2;
}
.step-num {
  font-size: 10px;
  line-height: 1;
}
.step.active .step-dot {
  border-color: #63A8B3;
  background: #63A8B3;
  color: white;
  transform: scale(1.05);
}
.step.current .step-dot {
  border-color: #63A8B3;
  background: linear-gradient(135deg, #63A8B3, #4a9aa8);
  color: white;
  box-shadow: 0 0 0 5px rgba(99,168,179,0.2), 0 2px 8px rgba(99,168,179,0.35);
  transform: scale(1.1);
  animation: pulse-ring 2s ease-in-out infinite;
}
@keyframes pulse-ring {
  0%, 100% { box-shadow: 0 0 0 5px rgba(99,168,179,0.2), 0 2px 8px rgba(99,168,179,0.35); }
  50% { box-shadow: 0 0 0 8px rgba(99,168,179,0.1), 0 2px 12px rgba(99,168,179,0.45); }
}
.step-current-icon {
  display: flex;
  animation: pulse-dot 1.5s ease-in-out infinite;
}
@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.step-label {
  font-size: 10px;
  font-weight: 500;
  color: #c0c0c0;
  text-transform: capitalize;
  margin-top: 6px;
  text-align: center;
  line-height: 1.2;
  white-space: nowrap;
  transition: color 0.3s ease;
}
.step.active .step-label {
  color: #6b7280;
  font-weight: 600;
}
.step.current .step-label {
  color: #63A8B3;
  font-weight: 700;
}
.step-connector {
  position: absolute;
  top: 14px;
  left: calc(50% + 14px);
  right: calc(-50% + 14px);
  height: 3px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
  z-index: 0;
}
.step-connector-fill {
  height: 100%;
  width: 0;
  background: linear-gradient(90deg, #63A8B3, #4a9aa8);
  border-radius: 2px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.step-connector-fill.filled {
  width: 100%;
}

/* ── Mobile ── */
@media (max-width: 768px) {
  .order-history-page { padding: 20px 12px; }
  .page-title { font-size: 20px; }
  .page-title .count { font-size: 12px; padding: 2px 8px; }
  .filter-tabs { overflow-x: auto; flex-wrap: nowrap; padding-bottom: 4px; }
  .filter-tab { white-space: nowrap; font-size: 12px; padding: 6px 10px; }
  .order-card { padding: 12px; }
  .order-header { flex-direction: column; align-items: flex-start; gap: 8px; }
  .order-header .order-id { font-size: 16px; }
  .order-meta { flex-direction: row; gap: 12px; }
  .order-detail { padding: 12px; }
  .detail-grid { grid-template-columns: 1fr !important; }
  .status-stepper { padding: 16px 12px 12px; }
  .step-dot { width: 22px; height: 22px; }
  .step-num { font-size: 9px; }
  .step-label { font-size: 8px; margin-top: 4px; }
  .step-connector { top: 11px; left: calc(50% + 11px); right: calc(-50% + 11px); }
  .step-connector { height: 2px; }
  .order-items .item { flex-direction: column; gap: 8px; }
  .order-items .item-qty { margin-left: 0; }
  .order-footer { flex-direction: column; align-items: flex-start; gap: 12px; }
  .order-footer .total { font-size: 18px; }
  .order-actions { flex-wrap: wrap; gap: 8px; }
  .order-actions button { flex: 1; min-width: 0; font-size: 12px; }
  .empty-state { padding: 40px 20px; }
  .empty-state svg { width: 56px; height: 56px; }
  .empty-state h2 { font-size: 16px; }
  }

  .toast-error {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    background: #ef4444;
    color: white;
    padding: 12px 20px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 8px 24px rgba(239, 68, 68, 0.3);
    z-index: 9999;
    animation: toastIn 0.3s ease;
  }

  @keyframes toastIn {
    from { opacity: 0; transform: translateX(-50%) translateY(12px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
  </style>
