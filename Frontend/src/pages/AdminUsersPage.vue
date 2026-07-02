<script setup>
import { ref, onMounted, computed } from 'vue'
import { useToast } from '@/composables/useToast'
import api from '@/services/api'
import ConfirmModal from '@/components/common/ConfirmModal.vue'

const toast = useToast()
const users = ref([])
const loading = ref(true)
const showModal = ref(false)
const editMode = ref(false)
const editId = ref(null)
const saving = ref(false)
const deletingId = ref(null)

const form = ref({ name: '', email: '', password: '', role: 'customer' })

const fetchUsers = async () => {
  loading.value = true
  try {
    const res = await api.get('/users')
    users.value = res.data.data
  } catch (e) {
    toast.error('Gagal memuat data user')
  } finally {
    loading.value = false
  }
}

const openCreate = () => {
  editMode.value = false
  editId.value = null
  form.value = { name: '', email: '', password: '', role: 'customer' }
  showModal.value = true
}

const openEdit = (user) => {
  editMode.value = true
  editId.value = user.id
  form.value = { name: user.name, email: user.email, password: '', role: user.role }
  showModal.value = true
}

const saveUser = async () => {
  if (!form.value.name.trim() || !form.value.email.trim()) {
    return toast.error('Nama dan email wajib diisi')
  }
  if (!editMode.value && !form.value.password) {
    return toast.error('Password wajib diisi')
  }
  saving.value = true
  try {
    const payload = { ...form.value }
    if (editMode.value && !payload.password) delete payload.password
    if (editMode.value) {
      await api.put(`/users/${editId.value}`, payload)
      toast.success('User berhasil diupdate')
    } else {
      await api.post('/users', payload)
      toast.success('User berhasil ditambahkan')
    }
    showModal.value = false
    fetchUsers()
  } catch (e) {
    toast.error(e.response?.data?.message || 'Gagal menyimpan user')
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

const deleteUser = async () => {
  showDeleteConfirm.value = false
  const id = deleteTargetId.value
  deletingId.value = id
  try {
    await api.delete(`/users/${id}`)
    toast.success('User berhasil dihapus')
    fetchUsers()
  } catch (e) {
    toast.error(e.response?.data?.message || 'Gagal menghapus user')
  } finally {
    deletingId.value = null
  }
}

const formatDate = (d) => {
  if (!d) return '-'
  const dt = new Date(d)
  return dt.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const stats = computed(() => ({
  total: users.value.length,
  admin: users.value.filter(u => u.role === 'admin').length,
  user: users.value.filter(u => u.role === 'customer').length,
}))

onMounted(fetchUsers)
</script>

<template>
  <div class="admin-page">
<<<<<<< HEAD
    <div class="admin-top">
      <div class="admin-tabs">
        <router-link to="/admin" class="admin-tab">Pesanan</router-link>
        <router-link to="/admin/products" class="admin-tab">Produk</router-link>
        <router-link to="/admin/users" class="admin-tab active">User</router-link>
        <router-link to="/admin/categories" class="admin-tab">Kategori</router-link>
      </div>
    </div>
=======
>>>>>>> 667c821 (Fix: remove redundant admin tab navigation (navbar handles it))

    <!-- Header -->
    <div class="admin-header">
      <div>
        <h1>Manajemen User</h1>
        <p class="header-sub">{{ users.length }} user terdaftar</p>
      </div>
      <button class="btn btn-primary" @click="openCreate">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Tambah User
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-grid">
      <div v-for="i in 3" :key="i" class="skeleton" style="height: 48px; border-radius: 8px;"></div>
    </div>

    <!-- Table -->
    <div v-else class="table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nama</th>
            <th>Email</th>
            <th>Role</th>
            <th>Bergabung</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td class="id-col">#{{ user.id }}</td>
            <td class="name-col">
              <div class="user-avatar">{{ user.name?.charAt(0)?.toUpperCase() || '?' }}</div>
              <span>{{ user.name }}</span>
            </td>
            <td>{{ user.email }}</td>
            <td>
              <span class="role-badge" :class="user.role === 'admin' ? 'role-admin' : 'role-customer'">
                {{ user.role === 'admin' ? 'Admin' : 'Customer' }}
              </span>
            </td>
            <td class="date-col">{{ formatDate(user.created_at) }}</td>
            <td class="actions-col">
              <button class="btn-icon" title="Edit" @click="openEdit(user)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="btn-icon btn-danger" title="Hapus" @click="openDeleteConfirm(user.id)" :disabled="deletingId === user.id">
                <svg v-if="deletingId !== user.id" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                <span v-else class="spinner-sm"></span>
              </button>
            </td>
          </tr>
          <tr v-if="users.length === 0">
            <td colspan="6" class="empty-row">Belum ada user</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal-card">
          <div class="modal-header">
            <h3>{{ editMode ? 'Edit User' : 'Tambah User' }}</h3>
            <button class="modal-close" @click="showModal = false">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Nama</label>
              <input v-model="form.name" type="text" placeholder="Nama lengkap" class="form-input" />
            </div>
            <div class="form-group">
              <label>Email</label>
              <input v-model="form.email" type="email" placeholder="email@contoh.com" class="form-input" />
            </div>
            <div class="form-group">
              <label>{{ editMode ? 'Password (kosongkan jika tidak ganti)' : 'Password' }}</label>
              <input v-model="form.password" type="password" :placeholder="editMode ? '••••••••' : 'Masukkan password'" class="form-input" />
            </div>
            <div class="form-group">
              <label>Role</label>
              <select v-model="form.role" class="form-input">
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" @click="showModal = false">Batal</button>
            <button class="btn btn-primary" @click="saveUser" :disabled="saving">
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
    title="Hapus User?"
    message="User akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan."
    confirm-text="Ya, Hapus"
    cancel-text="Batal"
    type="danger"
    @confirm="deleteUser"
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

.table-wrap { overflow-x: auto; }
.admin-table { width: 100%; border-collapse: collapse; }
.admin-table th {
  text-align: left; padding: 10px 12px; font-size: 12px; font-weight: 700; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 2px solid var(--border-subtle);
}
.admin-table td { padding: 12px; border-bottom: 1px solid var(--border-subtle); font-size: 14px; }
.admin-table tr:hover td { background: var(--surface-100); }

.id-col { font-weight: 700; color: var(--text-muted); font-size: 13px; }
.name-col { display: flex; align-items: center; gap: 10px; }
.user-avatar {
  width: 32px; height: 32px; border-radius: 50%; background: var(--brand); color: white;
  display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; flex-shrink: 0;
}
.date-col { color: var(--text-muted); font-size: 13px; }

.role-badge {
  padding: 3px 10px; border-radius: var(--radius-full); font-size: 12px; font-weight: 600;
}
.role-admin { background: #ede9fe; color: #7c3aed; }
.role-customer { background: #d1fae5; color: #059669; }

.actions-col { display: flex; gap: 4px; }
.btn-icon {
  width: 32px; height: 32px; border-radius: var(--radius-sm); border: none; background: transparent;
  display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-secondary);
  transition: all 0.15s;
}
.btn-icon:hover { background: var(--surface-100); color: var(--text-primary); }
.btn-icon.btn-danger:hover { background: #fee2e2; color: #dc2626; }
.empty-row { text-align: center; color: var(--text-muted); padding: 32px !important; }

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
  background: white; border-radius: var(--radius-lg); width: 100%; max-width: 440px;
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
.form-group label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px; color: var(--text-primary); }
.form-input {
  width: 100%; padding: 8px 12px; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);
  font-size: 14px; outline: none; transition: border-color 0.15s; background: white; color: var(--text-primary);
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

/* Mobile */
@media (max-width: 768px) {
  .admin-page { padding: 16px 12px; }
<<<<<<< HEAD
  .admin-tabs { overflow-x: auto; }
  .admin-tab { white-space: nowrap; font-size: 12px; padding: 6px 10px; }
=======
>>>>>>> 667c821 (Fix: remove redundant admin tab navigation (navbar handles it))
  .stats-row { grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .stat-value { font-size: 18px; }
  .admin-header h1 { font-size: 18px; }
  .admin-table th, .admin-table td { padding: 8px 6px; font-size: 12px; }
  .date-col { display: none; }
}
</style>
