<script setup>
import { ref, computed, onMounted, shallowRef } from 'vue'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js'
import { Doughnut, Bar } from 'vue-chartjs'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import api from '@/services/api'

const auth = useAuthStore()
const toast = useToast()
const orders = ref([])
const loading = ref(true)
const proofModal = ref(null)

const openProof = (url) => {
  proofModal.value = url
}
const error = ref('')
const updatingId = ref(null)
const activeFilter = ref('all')
const expandedId = ref(null)

const allStatusOptions = [
  { value: 'pending', label: 'Menunggu', color: 'warning' },
  { value: 'paid', label: 'Dibayar', color: 'warning' },
  { value: 'confirmed', label: 'Dikonfirmasi', color: 'info' },
  { value: 'processing', label: 'Diproses', color: 'primary' },
  { value: 'shipped', label: 'Dikirim', color: 'primary' },
  { value: 'delivered', label: 'Diterima', color: 'success' },
  { value: 'completed', label: 'Selesai', color: 'success' },
  { value: 'cancelled', label: 'Dibatalkan', color: 'error' }
]

const statusFlow = {
  pending:  ['confirmed', 'paid', 'cancelled'],
  paid:     ['confirmed', 'processing', 'cancelled'],
  confirmed:['processing', 'cancelled'],
  processing:['shipped', 'cancelled'],
  shipped:  ['delivered', 'cancelled'],
  delivered: ['completed'],
  completed: [],
  cancelled: []
}

const getNextOptions = (currentStatus) => {
  const next = statusFlow[currentStatus] || []
  return allStatusOptions.filter(s => next.includes(s.value))
}

const isTerminal = (s) => s === 'completed' || s === 'cancelled'

const filterOptions = computed(() => [
  { value: 'all', label: 'Semua' },
  ...allStatusOptions
])

const statusSteps = ['pending', 'paid', 'confirmed', 'processing', 'shipped', 'delivered', 'completed']

// Group flat rows into orders with items
// Backend already returns grouped data with nested items[]
const groupedOrders = computed(() => orders.value)

// Filtered orders
const filteredOrders = computed(() => {
  if (activeFilter.value === 'all') return groupedOrders.value
  return groupedOrders.value.filter(o => o.status === activeFilter.value)
})

// Stats
const stats = computed(() => {
  const total = groupedOrders.value.length
  const pending = groupedOrders.value.filter(o => o.status === 'pending').length
  const processing = groupedOrders.value.filter(o => ['confirmed', 'processing', 'shipped'].includes(o.status)).length
  const completed = groupedOrders.value.filter(o => ['completed', 'delivered'].includes(o.status)).length
  // #7: Only count completed/delivered as actual revenue (paid = waiting fulfillment)
  const totalRevenue = groupedOrders.value
    .filter(o => ['completed', 'delivered'].includes(o.status))
    .reduce((sum, o) => sum + Number(o.total_amount), 0)
  return { total, pending, processing, completed, totalRevenue }
})

// Chart: Status distribution (doughnut)
const statusChartData = computed(() => {
  const counts = {}
  for (const o of groupedOrders.value) {
    counts[o.status] = (counts[o.status] || 0) + 1
  }
  const labels = allStatusOptions.map(s => s.label)
  const data = allStatusOptions.map(s => counts[s.value] || 0)
  const colors = ['#f59e0b', '#3b82f6', '#0ea5e9', '#0284c7', '#10b981', '#059669', '#ef4444', '#f59e0b']
  return {
    labels,
    datasets: [{ data, backgroundColor: colors, borderWidth: 0, hoverOffset: 4 }]
  }
})
const statusChartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { padding: 12, usePointStyle: true, pointStyle: 'circle', font: { size: 11 } } } } }

// Chart: Revenue by day (bar)
const revenueChartData = computed(() => {
  const daily = {}
  for (const o of groupedOrders.value) {
    if (['completed', 'delivered'].includes(o.status)) {
      const day = new Date(o.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
      daily[day] = (daily[day] || 0) + Number(o.total_amount)
    }
  }
  const entries = Object.entries(daily).slice(-7).reverse()
  return {
    labels: entries.map(e => e[0]),
    datasets: [{
      label: 'Pendapatan',
      data: entries.map(e => e[1]),
      backgroundColor: '#63A8B3',
      borderRadius: 6,
      barThickness: 28
    }]
  }
})
const revenueChartOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { y: { beginAtZero: true, ticks: { callback: v => 'Rp' + (v/1000).toFixed(0) + 'k', font: { size: 11 } }, grid: { color: '#f3f4f6' } }, x: { grid: { display: false }, ticks: { font: { size: 11 } } } }
}

const fetchOrders = async () => {
  loading.value = true
  error.value = ''
  try {
    const { data } = await api.get('/orders')
    orders.value = data.data || []
  } catch (e) {
    error.value = e.response?.data?.message || 'Gagal memuat pesanan'
  } finally {
    loading.value = false
  }
}

const updateStatus = async (orderId, newStatus) => {
  updatingId.value = orderId
  try {
    await api.put(`/orders/${orderId}/status`, { status: newStatus })
    await fetchOrders()
  } catch (e) {
    toast.error(e.response?.data?.message || 'Gagal update status')
  } finally {
    updatingId.value = null
  }
}

const toggleExpand = (id) => {
  expandedId.value = expandedId.value === id ? null : id
}

const formatDate = (d) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
const formatCurrency = (n) => 'Rp ' + Number(n).toLocaleString('id-ID')

const getStatusLabel = (val) => allStatusOptions.find(s => s.value === val)?.label || val
const getStatusColor = (val) => allStatusOptions.find(s => s.value === val)?.color || 'muted'

const getStepIndex = (status) => statusSteps.indexOf(status)

onMounted(fetchOrders)
</script>

<template>
  <div class="admin-page">
    <div class="admin-top">
      <div class="admin-tabs">
        <router-link to="/admin" class="admin-tab active">Pesanan</router-link>
        <router-link to="/admin/products" class="admin-tab">Produk</router-link>
        <router-link to="/admin/users" class="admin-tab">User</router-link>
        <router-link to="/admin/categories" class="admin-tab">Kategori</router-link>
      </div>
    </div>
    <div class="admin-header">
      <div>
        <h1 class="page-title">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
          Admin Dashboard
        </h1>
        <p class="header-sub">Kelola pesanan dan aktivitas toko</p>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="glass-card stat-card" @click="activeFilter = 'all'" :class="{ active: activeFilter === 'all' }">
        <span class="stat-icon stat-icon-total">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
          </svg>
        </span>
        <div class="stat-info">
          <span class="stat-value">{{ stats.total }}</span>
          <span class="stat-label">Total Pesanan</span>
        </div>
      </div>
      <div class="glass-card stat-card" @click="activeFilter = 'pending'" :class="{ active: activeFilter === 'pending' }">
        <span class="stat-icon stat-icon-warning">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
        </span>
        <div class="stat-info">
          <span class="stat-value">{{ stats.pending }}</span>
          <span class="stat-label">Menunggu</span>
        </div>
      </div>
      <div class="glass-card stat-card" @click="activeFilter = 'processing'" :class="{ active: activeFilter === 'processing' }">
        <span class="stat-icon stat-icon-info">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
          </svg>
        </span>
        <div class="stat-info">
          <span class="stat-value">{{ stats.processing }}</span>
          <span class="stat-label">Aktif</span>
        </div>
      </div>
      <div class="glass-card stat-card" @click="activeFilter = 'completed'" :class="{ active: activeFilter === 'completed' }">
        <span class="stat-icon stat-icon-success">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </span>
        <div class="stat-info">
          <span class="stat-value">{{ stats.completed }}</span>
          <span class="stat-label">Selesai</span>
        </div>
      </div>
    </div>

    <!-- Revenue banner -->
    <div class="revenue-banner glass-card">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
      </svg>
      <span>Pendapatan: <strong>{{ formatCurrency(stats.totalRevenue) }}</strong></span>
    </div>

    <!-- Charts -->
    <div class="charts-grid" v-if="!loading && !error">
      <div class="glass-card chart-card">
        <h3 class="chart-title">Status Pesanan</h3>
        <div class="chart-wrap">
          <Doughnut :data="statusChartData" :options="statusChartOptions" />
        </div>
      </div>
      <div class="glass-card chart-card">
        <h3 class="chart-title">Pendapatan Harian</h3>
        <div class="chart-wrap">
          <Bar :data="revenueChartData" :options="revenueChartOptions" />
        </div>
      </div>
    </div>

    <!-- Filter tabs -->
    <div class="filter-tabs">
      <button
        v-for="opt in filterOptions"
        :key="opt.value"
        class="filter-tab"
        :class="{ active: activeFilter === opt.value }"
        @click="activeFilter = opt.value"
      >
        {{ opt.label }}
        <span v-if="opt.value !== 'all'" class="filter-count">
          {{ groupedOrders.filter(o => o.status === opt.value).length }}
        </span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-grid">
      <div v-for="i in 3" :key="i" class="glass-card" style="padding: 20px;">
        <div class="skeleton" style="height: 14px; width: 50%; margin-bottom: 8px;"></div>
        <div class="skeleton" style="height: 12px; width: 30%;"></div>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="glass-card error-card">
      <p>{{ error }}</p>
      <button class="btn btn-primary btn-sm" @click="fetchOrders">Coba Lagi</button>
    </div>

    <!-- Orders List -->
    <div v-else class="orders-list">
      <div v-if="filteredOrders.length === 0" class="glass-card empty-card">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
        </svg>
        <p>Tidak ada pesanan</p>
      </div>

      <div
        v-for="order in filteredOrders"
        :key="order.id"
        class="order-card glass-card"
        :class="{ expanded: expandedId === order.id }"
      >
        <!-- Order Header -->
        <div class="order-header" @click="toggleExpand(order.id)">
          <div class="order-main">
            <span class="order-id">#{{ order.id }}</span>
            <span class="order-user">{{ order.user_name }}</span>
            <span class="order-date">{{ formatDate(order.created_at) }}</span>
          </div>
          <div class="order-right">
            <span class="order-total">{{ formatCurrency(order.total_amount) }}</span>
            <span class="badge" :class="`badge-${getStatusColor(order.status)}`">
              {{ getStatusLabel(order.status) }}
            </span>
            <span class="expand-icon" :class="{ rotated: expandedId === order.id }">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </span>
          </div>
        </div>

        <!-- Status Stepper -->
        <div v-if="expandedId === order.id" class="order-detail">
          <div class="status-stepper">
            <div
              v-for="(step, idx) in statusSteps"
              :key="step"
              class="step"
              :class="{
                active: getStepIndex(order.status) >= idx,
                current: order.status === step
              }"
            >
              <div class="step-dot">
                <svg v-if="getStepIndex(order.status) > idx" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span v-else>{{ idx + 1 }}</span>
              </div>
              <span class="step-label">{{ getStatusLabel(step) }}</span>
              <div v-if="idx < statusSteps.length - 1" class="step-line" :class="{ filled: getStepIndex(order.status) > idx }"></div>
            </div>
          </div>

          <!-- Customer -->
          <div class="order-address">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            {{ order.user_name || 'Pelanggan' }} <span style="color:#9ca3af">{{ order.user_email ? `(${order.user_email})` : '' }}</span>
          </div>

          <!-- Order Items -->
          <div class="order-items">
            <h4>Item Pesanan</h4>
            <div v-for="item in order.items" :key="item.id" class="order-item">
              <img
                v-if="item.image_url"
                :src="`${item.image_url}`"
                :alt="item.product_name"
                class="item-thumb"
              />
              <div class="item-info">
                <span class="item-name">{{ item.product_name }}</span>
                <span class="item-qty">{{ item.quantity }}x {{ formatCurrency(item.price_at_purchase) }}</span>
              </div>
              <span class="item-subtotal">{{ formatCurrency(item.quantity * item.price_at_purchase) }}</span>
            </div>
          </div>

          <!-- Payment info -->
          <div v-if="order.payment_method" class="order-address">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            {{ order.payment_method }}<span v-if="order.bank_name"> - {{ order.bank_name }}</span>
          </div>
          <!-- Delivery Type -->
          <div class="order-address" style="display:flex;align-items:center;gap:6px;">
            <svg v-if="order.shipping_address === 'Ambil di toko'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>
            <span :style="{ color: order.shipping_address === 'Ambil di toko' ? '#059669' : '#2563eb', fontWeight: 600, fontSize: '12px' }">
              {{ order.shipping_address === 'Ambil di toko' ? 'Ambil di Toko' : 'Diantar ke Alamat' }}
            </span>
          </div>

          <!-- Address -->
          <div v-if="order.shipping_address" class="order-address">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            {{ order.shipping_address }}
          </div>

          <!-- Bukti Transfer -->
          <div v-if="order.payment_proof" class="proof-section">
            <div class="proof-header">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              Bukti Transfer
            </div>
            <div class="proof-image-wrap" @click="openProof(order.payment_proof)">
              <img :src="order.payment_proof" class="proof-thumb" alt="Bukti transfer" />
              <div class="proof-overlay">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
              </div>
            </div>
          </div>

          <!-- Proof Modal -->
          <div v-if="proofModal" class="modal-backdrop" @click.self="proofModal = null">
            <div class="proof-modal">
              <button class="proof-close" @click="proofModal = null">✕</button>
              <img :src="proofModal" class="proof-full" alt="Bukti transfer" />
            </div>
          </div>

          <!-- Action -->
          <div class="order-actions">
            <template v-if="isTerminal(order.status)">
              <span class="terminal-badge" :class="`badge-${getStatusColor(order.status)}`">
                {{ order.status === 'completed' ? '✓ Selesai' : '✕ Dibatalkan' }}
              </span>
            </template>
            <template v-else>
              <label class="action-label">Ubah ke:</label>
              <div class="next-status-btns">
                <button
                  v-for="opt in getNextOptions(order.status)"
                  :key="opt.value"
                  class="status-btn"
                  :class="`status-btn-${opt.color}`"
                  :disabled="updatingId === order.id"
                  @click="updateStatus(order.id, opt.value)"
                >
                  <span v-if="updatingId === order.id" class="spinner-sm"></span>
                  {{ opt.label }}
                </button>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-page { display: flex; flex-direction: column; gap: 16px; padding: 24px; max-width: 1100px; margin: 0 auto; }
.admin-top { display: flex; align-items: center; margin-bottom: 16px; }
.admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.admin-header h1 { font-size: 22px; font-weight: 700; }
.header-sub { font-size: 13px; color: var(--text-muted); margin-top: 2px; }
.page-title { display: flex; align-items: center; gap: 8px; font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }

/* Tabs */
.admin-tabs { display: flex; gap: 4px; background: var(--border-light); padding: 4px; border-radius: 10px; }
.admin-tab { padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 500; text-decoration: none; color: var(--text-muted); transition: all 0.15s; }
.admin-tab.active, .admin-tab.router-link-exact-active { background: #fff; color: var(--brand); box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
.admin-tab:hover { color: var(--text-secondary); }

/* Stats */
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.stat-card { display: flex; align-items: center; gap: 12px; padding: 16px; cursor: pointer; transition: all 0.15s; border: 2px solid transparent; }
.stat-card:hover { transform: translateY(-1px); }
.stat-card.active { border-color: #63A8B3; background: #f0fdfa; }
.stat-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-icon-total { background: #ede9fe; color: #7c3aed; }
.stat-icon-warning { background: #fef3c7; color: #d97706; }
.stat-icon-info { background: #dbeafe; color: #2563eb; }
.stat-icon-success { background: #d1fae5; color: #059669; }
.stat-info { display: flex; flex-direction: column; }
.stat-value { font-size: 20px; font-weight: 700; color: var(--text-primary); }
.stat-label { font-size: 12px; color: var(--text-muted); }

/* Revenue */
.revenue-banner { display: flex; align-items: center; gap: 8px; padding: 12px 16px; font-size: 14px; color: var(--text-secondary); }
.revenue-banner strong { color: #059669; }

/* Charts */
.charts-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 12px; }
.chart-card { padding: 16px; }
.chart-title { font-size: 14px; font-weight: 600; color: var(--text-secondary); margin: 0 0 12px; }
.chart-wrap { height: 200px; position: relative; }

/* Proof */
.proof-section { margin-top: 8px; }
.proof-header { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px; }
.proof-image-wrap { position: relative; width: 120px; height: 120px; border-radius: 10px; overflow: hidden; cursor: pointer; border: 2px solid var(--border-light); }
.proof-thumb { width: 100%; height: 100%; object-fit: cover; }
.proof-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; color: white; }
.proof-image-wrap:hover .proof-overlay { opacity: 1; }
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 1000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
.proof-modal { position: relative; max-width: 90vw; max-height: 90vh; border-radius: 12px; overflow: hidden; background: white; }
.proof-close { position: absolute; top: 8px; right: 8px; width: 32px; height: 32px; border-radius: 50%; border: none; background: rgba(0,0,0,0.5); color: white; font-size: 14px; cursor: pointer; z-index: 1; display: flex; align-items: center; justify-content: center; }
.proof-full { max-width: 80vw; max-height: 85vh; object-fit: contain; }

/* Custom Select */
.custom-select-wrap { position: relative; display: inline-block; }
.custom-select-wrap .status-select { appearance: none; padding-right: 28px; padding-left: 12px; padding-top: 6px; padding-bottom: 6px; border-radius: 8px; border: 1.5px solid var(--border-medium); background: white; font-size: 13px; font-weight: 500; cursor: pointer; min-width: 160px; }
.next-status-btns { display: flex; flex-wrap: wrap; gap: 6px; }

.status-btn {
  padding: 6px 14px;
  border-radius: 8px;
  border: 1.5px solid var(--border-medium);
  background: white;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.status-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.status-btn-warning { border-color: #f59e0b; color: #b45309; }
.status-btn-warning:hover:not(:disabled) { background: #fffbeb; border-color: #f59e0b; }

.status-btn-info { border-color: #3b82f6; color: #1d4ed8; }
.status-btn-info:hover:not(:disabled) { background: #eff6ff; border-color: #3b82f6; }

.status-btn-primary { border-color: #0ea5e9; color: #0369a1; }
.status-btn-primary:hover:not(:disabled) { background: #f0f9ff; border-color: #0ea5e9; }

.status-btn-success { border-color: #10b981; color: #047857; }
.status-btn-success:hover:not(:disabled) { background: #ecfdf5; border-color: #10b981; }

.status-btn-error { border-color: #ef4444; color: #dc2626; }
.status-btn-error:hover:not(:disabled) { background: #fef2f2; border-color: #ef4444; }

.terminal-badge {
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
}

.terminal-badge.badge-success { background: #ecfdf5; color: #047857; }
.terminal-badge.badge-error { background: #fef2f2; color: #dc2626; }

.spinner-sm {
  width: 12px; height: 12px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
.select-arrow { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--text-muted); }

/* Filter Tabs */
.filter-tabs { display: flex; gap: 6px; flex-wrap: wrap; }
.filter-tab {
  display: flex; align-items: center; gap: 4px; padding: 6px 12px; border: 1px solid #e5e7eb;
  border-radius: 999px; font-size: 12px; font-weight: 500; color: var(--text-muted); background: #fff;
  cursor: pointer; transition: all 0.15s;
}
.filter-tab:hover { border-color: #63A8B3; color: #63A8B3; }
.filter-tab.active { background: #63A8B3; color: #fff; border-color: #63A8B3; }
.filter-count { font-size: 11px; opacity: 0.7; }

/* Glass Card */
.glass-card { background: #fff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }

/* Loading */
.loading-grid { display: flex; flex-direction: column; gap: 8px; }
.skeleton { background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 6px; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* Error */
.error-card { padding: 24px; text-align: center; color: #dc2626; }
.btn { padding: 8px 16px; border: none; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; }
.btn-primary { background: #63A8B3; color: #fff; }
.btn-primary:hover { background: #4a9aa8; }
.btn-sm { padding: 6px 12px; font-size: 12px; }

/* Empty */
.empty-card { padding: 48px; text-align: center; color: var(--text-muted); display: flex; flex-direction: column; align-items: center; gap: 12px; }

/* Orders List */
.orders-list { display: flex; flex-direction: column; gap: 8px; }

/* Order Card */
.order-card { overflow: hidden; transition: all 0.2s; }
.order-card.expanded { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }

.order-header {
  display: flex; justify-content: space-between; align-items: center; padding: 14px 16px;
  cursor: pointer; gap: 12px; transition: background 0.15s;
}
.order-header:hover { background: #f9fafb; }
.order-main { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.order-id { font-weight: 700; color: var(--text-primary); font-size: 14px; }
.order-user { font-size: 13px; color: var(--text-secondary); }
.order-date { font-size: 12px; color: var(--text-muted); }
.order-right { display: flex; align-items: center; gap: 10px; }
.order-total { font-weight: 600; color: var(--text-primary); font-size: 14px; }
.expand-icon { transition: transform 0.2s; color: var(--text-muted); display: flex; }
.expand-icon.rotated { transform: rotate(180deg); }

/* Badges */
.badge { padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; white-space: nowrap; }
.badge-warning { background: #fef3c7; color: #92400e; }
.badge-info { background: #dbeafe; color: #1e40af; }
.badge-primary { background: #e0f2fe; color: #0369a1; }
.badge-success { background: #d1fae5; color: #065f46; }
.badge-error { background: #fee2e2; color: #991b1b; }
.badge-muted { background: var(--border-light); color: var(--text-muted); }

/* Order Detail */
.order-detail { padding: 0 16px 16px; border-top: 1px solid #f3f4f6; }

/* Status Stepper */
.status-stepper { display: flex; align-items: center; padding: 20px 0; gap: 0; }
.step { display: flex; flex-direction: column; align-items: center; position: relative; flex: 1; }
.step-dot {
  width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 600; background: var(--border-light); color: var(--text-muted); border: 2px solid #e5e7eb;
  transition: all 0.2s; z-index: 1;
}
.step.active .step-dot { background: #63A8B3; color: #fff; border-color: #63A8B3; }
.step.current .step-dot { box-shadow: 0 0 0 4px rgba(99,168,179,0.2); transform: scale(1.1); }
.step-label { font-size: 10px; color: var(--text-muted); margin-top: 6px; white-space: nowrap; }
.step.active .step-label { color: var(--text-secondary); font-weight: 500; }
.step-line {
  position: absolute; top: 14px; left: 50%; width: 100%; height: 2px; background: #e5e7eb; z-index: 0;
}
.step-line.filled { background: #63A8B3; }

/* Order Items */
.order-items { margin-top: 12px; }
.order-items h4 { font-size: 13px; font-weight: 600; color: var(--text-secondary); margin: 0 0 8px; }
.order-item { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid #f9fafb; }
.order-item:last-child { border-bottom: none; }
.item-thumb { width: 40px; height: 40px; border-radius: 8px; object-fit: cover; }
.item-info { flex: 1; display: flex; flex-direction: column; }
.item-name { font-size: 13px; font-weight: 500; color: var(--text-secondary); }
.item-qty { font-size: 12px; color: var(--text-muted); }
.item-subtotal { font-size: 13px; font-weight: 600; color: var(--text-primary); }

/* Address */
.order-address { display: flex; align-items: center; gap: 6px; margin-top: 12px; padding: 10px 12px; background: #f9fafb; border-radius: 8px; font-size: 12px; color: var(--text-muted); }

/* Actions */
.order-actions { display: flex; align-items: center; gap: 8px; margin-top: 12px; }
.action-label { font-size: 12px; font-weight: 600; color: var(--text-muted); }
.status-select {
  padding: 6px 10px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 12px;
  font-family: inherit; background: #fff; cursor: pointer; transition: border 0.2s;
}
.status-select:focus { border-color: #63A8B3; outline: none; }
</style>
