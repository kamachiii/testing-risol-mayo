<script setup>
import { ref, onMounted, computed } from 'vue'
import { useToast } from '@/composables/useToast'
import api from '@/services/api'
import ConfirmModal from '@/components/common/ConfirmModal.vue'

const toast = useToast()
const categories = ref([])
const loading = ref(true)
const showModal = ref(false)
const editMode = ref(false)
const editId = ref(null)
const saving = ref(false)
const deletingId = ref(null)

const form = ref({ name: '' })

const fetchCategories = async () => {
  loading.value = true
  try {
    const res = await api.get('/categories')
    categories.value = res.data.data
  } catch (e) {
    toast.error('Gagal memuat data kategori')
  } finally {
    loading.value = false
  }
}

const openCreate = () => {
  editMode.value = false
  editId.value = null
  form.value = { name: '' }
  showModal.value = true
}

const openEdit = (cat) => {
  editMode.value = true
  editId.value = cat.id
  form.value = { name: cat.name }
  showModal.value = true
}

const saveCategory = async () => {
  if (!form.value.name.trim()) {
    return toast.error('Nama kategori wajib diisi')
  }
  saving.value = true
  try {
    if (editMode.value) {
      await api.put(`/categories/${editId.value}`, { name: form.value.name.trim() })
      toast.success('Kategori berhasil diupdate')
    } else {
      await api.post('/categories', { name: form.value.name.trim() })
      toast.success('Kategori berhasil ditambahkan')
    }
    showModal.value = false
    fetchCategories()
  } catch (e) {
    toast.error(e.response?.data?.message || 'Gagal menyimpan kategori')
  } finally {
    saving.value = false
  }
}

const showDeleteConfirm = ref(false)
const deleteTargetId = ref(null)

const openDeleteConfirm = (id) => {
  deleteTargetId.value = id
  showDeleteConfirm.value = true
}

const deleteCategory = async () => {
  showDeleteConfirm.value = false
  const id = deleteTargetId.value
  deletingId.value = id
  try {
    await api.delete(`/categories/${id}`)
    toast.success('Kategori berhasil dihapus')
    fetchCategories()
  } catch (e) {
    toast.error(e.response?.data?.message || 'Gagal menghapus kategori')
  } finally {
    deletingId.value = null
  }
}

const catIconMap = [
  { keyword: 'snack', icon: '🍪' },
  { keyword: 'cemilan', icon: '🍿' },
  { keyword: 'minuman', icon: '🥤' },
  { keyword: 'makanan', icon: '🍜' },
  { keyword: 'instan', icon: '🍜' },
  { keyword: 'dapur', icon: '🍳' },
  { keyword: 'mandi', icon: '🧴' },
  { keyword: 'rokok', icon: '🚬' },
  { keyword: 'kesehatan', icon: '💊' },
  { keyword: 'peralatan', icon: '🔧' },
  { keyword: 'perlengkapan', icon: '📦' },
  { keyword: 'rumah', icon: '🏠' },
]

const getCatIcon = (name) => {
  const lower = name.toLowerCase()
  const match = catIconMap.find(m => lower.includes(m.keyword))
  return match ? match.icon : '📁'
}

onMounted(fetchCategories)
</script>

<template>
  <div class="admin-page">
<<<<<<< HEAD
    <div class="admin-top">
      <div class="admin-tabs">
        <router-link to="/admin" class="admin-tab">Pesanan</router-link>
        <router-link to="/admin/products" class="admin-tab">Produk</router-link>
        <router-link to="/admin/users" class="admin-tab">User</router-link>
        <router-link to="/admin/categories" class="admin-tab active">Kategori</router-link>
      </div>
    </div>
=======
>>>>>>> 667c821 (Fix: remove redundant admin tab navigation (navbar handles it))

    <!-- Header -->
    <div class="admin-header">
      <div>
        <h1>Manajemen Kategori</h1>
        <p class="header-sub">Total {{ categories.length }} kategori</p>
      </div>
      <button class="btn btn-primary" @click="openCreate">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Tambah Kategori
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-grid">
      <div v-for="i in 4" :key="i" class="skeleton" style="height: 64px; border-radius: 12px;"></div>
    </div>

    <!-- Category Grid -->
    <div v-else class="cat-grid">
      <div
        v-for="cat in categories"
        :key="cat.id"
        class="cat-card glass-card"
      >
        <div class="cat-icon">{{ getCatIcon(cat.name) }}</div>
        <div class="cat-info">
          <span class="cat-name">{{ cat.name }}</span>
          <span class="cat-id">ID: {{ cat.id }}</span>
        </div>
        <div class="cat-actions">
          <button class="btn-icon" title="Edit" @click="openEdit(cat)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-icon btn-danger" title="Hapus" @click="openDeleteConfirm(cat.id)" :disabled="deletingId === cat.id">
            <svg v-if="deletingId !== cat.id" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            <span v-else class="spinner-sm"></span>
          </button>
        </div>
      </div>

      <!-- Empty -->
      <div v-if="categories.length === 0" class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
        </svg>
        <p>Belum ada kategori</p>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal-card">
          <div class="modal-header">
            <h3>{{ editMode ? 'Edit Kategori' : 'Tambah Kategori' }}</h3>
            <button class="modal-close" @click="showModal = false">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Nama Kategori</label>
              <input v-model="form.name" type="text" placeholder="Contoh: Makanan Ringan" class="form-input" @keyup.enter="saveCategory" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" @click="showModal = false">Batal</button>
            <button class="btn btn-primary" @click="saveCategory" :disabled="saving">
              <span v-if="saving" class="spinner-sm" style="border-top-color: white;"></span>
              {{ editMode ? 'Update' : 'Simpan' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>

  <!-- Delete Confirm Modal -->
  <ConfirmModal
    :show="showDeleteConfirm"
    title="Hapus Kategori?"
    message="Kategori akan dihapus secara permanen. Pastikan tidak ada produk yang menggunakan kategori ini."
    confirm-text="Ya, Hapus"
    cancel-text="Batal"
    type="danger"
    @confirm="deleteCategory"
    @cancel="showDeleteConfirm = false"
  />
</template>

<style scoped>
.admin-page { padding: 24px; max-width: 1100px; margin: 0 auto; }
<<<<<<< HEAD
.admin-top { display: flex; align-items: center; margin-bottom: 16px; }
.admin-tabs { display: flex; gap: 4px; background: var(--border-light); padding: 4px; border-radius: 10px; }
.admin-tab {
  padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 500;
  text-decoration: none; color: var(--text-muted); transition: all 0.15s;
}
.admin-tab:hover { color: var(--text-secondary); }
.admin-tab.active, .admin-tab.router-link-exact-active { background: #fff; color: var(--text-primary); box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
=======
>>>>>>> 667c821 (Fix: remove redundant admin tab navigation (navbar handles it))

.admin-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;
}
.admin-header h1 { font-size: 22px; font-weight: 700; }
.header-sub { font-size: 13px; color: var(--text-muted); margin-top: 2px; }

.cat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
.cat-card {
  display: flex; align-items: center; gap: 14px; padding: 16px;
  transition: transform 0.15s, box-shadow 0.15s; cursor: default;
}
.cat-card:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.06); }

.cat-icon { font-size: 28px; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; background: var(--surface-100); border-radius: 12px; flex-shrink: 0; }
.cat-info { flex: 1; min-width: 0; }
.cat-name { display: block; font-size: 15px; font-weight: 700; }
.cat-id { display: block; font-size: 12px; color: var(--text-muted); margin-top: 2px; }
.cat-actions { display: flex; gap: 4px; flex-shrink: 0; }

.btn-icon {
  width: 32px; height: 32px; border-radius: var(--radius-sm); border: none; background: transparent;
  display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-secondary);
  transition: all 0.15s;
}
.btn-icon:hover { background: var(--surface-100); color: var(--text-primary); }
.btn-icon.btn-danger:hover { background: #fee2e2; color: #dc2626; }
.empty-state { grid-column: 1 / -1; text-align: center; padding: 48px 16px; color: var(--text-muted); }
.empty-state p { margin-top: 12px; font-size: 14px; }

.spinner-sm {
  width: 14px; height: 14px; border: 2px solid rgba(0,0,0,0.1); border-top-color: var(--brand);
  border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px;
}
.modal-card {
  background: white; border-radius: var(--radius-lg); width: 100%; max-width: 400px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2); animation: modalIn 0.2s ease;
}
@keyframes modalIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } }
.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 20px; border-bottom: 1px solid var(--border-subtle);
}
.modal-header h3 { font-size: 16px; font-weight: 700; }
.modal-close { background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 4px; border-radius: 6px; }
.modal-close:hover { background: var(--surface-100); }
.modal-body { padding: 20px; }
.modal-footer {
  display: flex; justify-content: flex-end; gap: 8px; padding: 12px 20px;
  border-top: 1px solid var(--border-subtle);
}

.form-group { margin-bottom: 14px; }
.form-group:last-child { margin-bottom: 0; }
.form-group label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px; }
.form-input {
  width: 100%; padding: 8px 12px; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);
  font-size: 14px; outline: none; transition: border-color 0.15s; background: white;
}
.form-input:focus { border-color: var(--brand); }

.btn {
  display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: var(--radius-sm);
  font-size: 13px; font-weight: 600; border: none; cursor: pointer; transition: all 0.15s;
}
.btn-primary { background: var(--brand); color: white; }
.btn-primary:hover { filter: brightness(1.05); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-ghost { background: transparent; color: var(--text-secondary); }
.btn-ghost:hover { background: var(--surface-100); }

.loading-grid { display: flex; flex-direction: column; gap: 8px; }
.skeleton {
  background: linear-gradient(90deg, var(--surface-100) 25%, #e5e7eb 50%, var(--surface-100) 75%);
  background-size: 200% 100%; animation: shimmer 1.5s infinite;
}
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

@media (max-width: 768px) {
  .admin-page { padding: 16px 12px; }
<<<<<<< HEAD
  .admin-tabs { overflow-x: auto; }
  .admin-tab { white-space: nowrap; font-size: 12px; padding: 6px 10px; }
=======
>>>>>>> 667c821 (Fix: remove redundant admin tab navigation (navbar handles it))
  .admin-header h1 { font-size: 18px; }
  .cat-grid { grid-template-columns: 1fr; }
}
</style>
