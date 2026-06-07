<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import api from '@/services/api'

const auth = useAuthStore()
const toast = useToast()
const products = ref([])
const categories = ref([])
const loading = ref(true)
const showModal = ref(false)
const editMode = ref(false)
const saving = ref(false)
const errorMsg = ref('')
const currentPage = ref(1)
const perPage = ref(10)

const defaultForm = { name: '', price: '', description: '', stock: '', category_id: '' }
const form = ref({ ...defaultForm })
const formImage = ref(null)
const editingId = ref(null)
const imagePreview = ref('')

const fetchError = ref('')

const paginatedProducts = computed(() => products.value)

const totalPages = computed(() => totalServerPages.value)

const totalServerItems = ref(0)
const totalServerPages = ref(1)

const fetchProducts = async () => {
  loading.value = true
  fetchError.value = ''
  try {
    const { data } = await api.get('/products', { params: { page: currentPage.value, limit: perPage.value } })
    products.value = data.data || []
    totalServerItems.value = data.pagination?.total || 0
    totalServerPages.value = data.pagination?.totalPages || 1
  } catch (e) {
    console.error(e)
    fetchError.value = 'Gagal memuat produk. Silakan coba lagi.'
  } finally {
    loading.value = false
  }
}

const goToPage = (page) => {
  currentPage.value = page
  fetchProducts()
}

const fetchCategories = async () => {
  try {
    const { data } = await api.get('/categories')
    categories.value = data.data || []
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => { fetchProducts(); fetchCategories() })

const openAdd = () => {
  editMode.value = false
  form.value = { ...defaultForm }
  formImage.value = null
  imagePreview.value = ''
  errorMsg.value = ''
  showModal.value = true
}

const openEdit = (p) => {
  editMode.value = true
  editingId.value = p.id
  form.value = {
    name: p.name,
    price: p.price,
    description: p.description,
    stock: p.stock,
    category_id: p.category_id
  }
  imagePreview.value = p.image_url ? `${p.image_url}` : ''
  formImage.value = null
  errorMsg.value = ''
  showModal.value = true
}

const onImageChange = (e) => {
  const file = e.target.files[0]
  if (!file) return
  const allowed = ['image/jpeg', 'image/png', 'image/jpg']
  if (!allowed.includes(file.type)) {
    errorMsg.value = 'Format file harus JPG atau PNG'
    e.target.value = ''
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    errorMsg.value = 'Ukuran file maksimal 5MB'
    e.target.value = ''
    return
  }
  if (imagePreview.value) URL.revokeObjectURL(imagePreview.value)
  formImage.value = file
  imagePreview.value = URL.createObjectURL(file)
}

const validateForm = () => {
  if (!form.value.name || form.value.name.trim() === '') {
    errorMsg.value = 'Nama produk wajib diisi'
    return false
  }
  if (!form.value.price || Number(form.value.price) < 0) {
    errorMsg.value = 'Harga tidak valid (harus >= 0)'
    return false
  }
  if (form.value.stock === '' || Number(form.value.stock) < 0) {
    errorMsg.value = 'Stok tidak valid (harus >= 0)'
    return false
  }
  if (!form.value.category_id) {
    errorMsg.value = 'Kategori wajib dipilih'
    return false
  }
  if (!editMode.value && !formImage.value) {
    errorMsg.value = 'Gambar produk wajib diunggah'
    return false
  }
  return true
}

const saveProduct = async () => {
  saving.value = true
  errorMsg.value = ''
  if (!validateForm()) {
    saving.value = false
    return
  }
  try {
    const fd = new FormData()
    fd.append('name', form.value.name)
    fd.append('price', form.value.price)
    fd.append('description', form.value.description)
    fd.append('stock', form.value.stock)
    fd.append('category_id', form.value.category_id)
    if (formImage.value) fd.append('image', formImage.value)

    if (editMode.value) {
      await api.put(`/products/${editingId.value}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    } else {
      await api.post('/products', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    }
    showModal.value = false
    await fetchProducts()
  } catch (e) {
    errorMsg.value = e.response?.data?.message || 'Gagal menyimpan produk'
  } finally {
    saving.value = false
  }
}

const deleteProductId = ref(null)
const showDeleteConfirm = ref(false)

const confirmDelete = (id) => {
  deleteProductId.value = id
  showDeleteConfirm.value = true
}

const doDelete = async () => {
  showDeleteConfirm.value = false
  try {
    await api.delete(`/products/${deleteProductId.value}`)
    toast.success('Produk berhasil dihapus')
    await fetchProducts()
  } catch (e) {
    toast.error(e.response?.data?.message || 'Gagal hapus produk')
  }
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
  deleteProductId.value = null
}

const fmtPrice = (n) => 'Rp ' + Number(n).toLocaleString('id-ID')
</script>

<template>
  <div class="admin-page">
    <div class="admin-top">
      <div class="admin-tabs">
        <router-link to="/admin" class="admin-tab">Pesanan</router-link>
        <router-link to="/admin/products" class="admin-tab active">Produk</router-link>
        <router-link to="/admin/users" class="admin-tab">User</router-link>
        <router-link to="/admin/categories" class="admin-tab">Kategori</router-link>
      </div>
    </div>
    <div class="admin-header">
      <div>
        <h1>Produk</h1>
        <p class="header-sub">Kelola produk minimarket</p>
      </div>
      <button class="btn-primary" @click="openAdd">+ Tambah Produk</button>
    </div>

    <div v-if="loading" class="loading-state">Memuat...</div>
    <div v-else-if="fetchError" class="error-state">
      <p>{{ fetchError }}</p>
      <button class="btn-sm btn-edit" @click="fetchProducts">Coba Lagi</button>
    </div>

    <div v-else class="table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Gambar</th>
            <th>Nama</th>
            <th>Kategori</th>
            <th>Harga</th>
            <th>Stok</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in paginatedProducts" :key="p.id">
            <td>
              <img v-if="p.image_url" :src="`${p.image_url}`" class="thumb" :alt="p.name" />
              <div v-else class="no-img">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </div>
            </td>
            <td class="name-cell">{{ p.name }}</td>
            <td>{{ p.category_name || '-' }}</td>
            <td>{{ fmtPrice(p.price) }}</td>
            <td :class="{ 'low-stock': p.stock < 5 }">{{ p.stock }}</td>
            <td class="actions-cell">
              <button class="btn-sm btn-edit" @click="openEdit(p)">Edit</button>
              <button class="btn-sm btn-delete" @click="confirmDelete(p.id)">Hapus</button>
            </td>
          </tr>
          <tr v-if="!loading && paginatedProducts.length === 0" class="empty-row">
            <td colspan="6">Tidak ada produk</td>
          </tr>
        </tbody>
      </table>
      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button class="page-btn" :disabled="currentPage <= 1" @click="goToPage(currentPage - 1)">‹</button>
        <span class="page-info">Halaman {{ currentPage }} dari {{ totalPages }}</span>
        <button class="page-btn" :disabled="currentPage >= totalPages" @click="goToPage(currentPage + 1)">›</button>
      </div>
    </div>

    <!-- Modal Add/Edit -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-card">
        <h2>{{ editMode ? 'Edit Produk' : 'Tambah Produk' }}</h2>
        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
        <form @submit.prevent="saveProduct" class="modal-form">
          <div class="form-row">
            <div class="form-col">
              <label>Nama Produk</label>
              <input v-model="form.name" required />
            </div>
            <div class="form-col">
              <label>Kategori</label>
              <select v-model="form.category_id" required>
                <option value="">Pilih kategori</option>
                <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-col">
              <label>Harga (Rp)</label>
              <input v-model="form.price" type="number" min="0" required />
            </div>
            <div class="form-col">
              <label>Stok</label>
              <input v-model="form.stock" type="number" min="0" required />
            </div>
          </div>
          <div class="form-group">
            <label>Deskripsi</label>
            <textarea v-model="form.description" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>Gambar Produk</label>
            <input type="file" accept="image/*" @change="onImageChange" />
            <img v-if="imagePreview" :src="imagePreview" class="preview-img" />
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="showModal = false">Batal</button>
            <button type="submit" class="btn-primary" :disabled="saving">
              {{ saving ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirm Modal -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="cancelDelete">
      <div class="modal-box delete-modal">
        <h3>Hapus Produk</h3>
        <p>Yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan.</p>
        <div class="modal-actions">
          <button class="btn-secondary" @click="cancelDelete">Batal</button>
          <button class="btn-danger" @click="doDelete">Hapus</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-page { padding: 24px; max-width: 1100px; margin: 0 auto; }
.admin-top { display: flex; align-items: center; margin-bottom: 16px; }
.admin-top h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); }
.admin-tabs { display: flex; gap: 4px; background: var(--border-light); padding: 4px; border-radius: 10px; }
.admin-tab { padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 500; text-decoration: none; color: var(--text-muted); transition: all 0.15s; }
.admin-tab.active, .admin-tab.router-link-exact-active { background: #fff; color: var(--text-primary); box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
.admin-tab:hover { color: var(--text-secondary); }
.admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.admin-header h1 { font-size: 22px; font-weight: 700; }
.header-sub { font-size: 13px; color: var(--text-muted); margin-top: 2px; }
.admin-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); }
.btn-primary { padding: 10px 20px; background: #63A8B3; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
.btn-primary:hover { background: #4a9aa8; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-secondary { padding: 10px 20px; background: var(--border-light); color: var(--text-secondary); border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; cursor: pointer; }
.btn-secondary:hover { background: #e5e7eb; }
.loading-state { text-align: center; padding: 48px; color: #9ca3af; }
.error-state { text-align: center; padding: 48px; color: #dc2626; }
.error-state p { margin-bottom: 12px; }
.table-wrap { overflow-x: auto; }
.admin-table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
.admin-table th { text-align: left; padding: 12px 16px; background: #f9fafb; font-size: 12px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
.admin-table td { padding: 12px 16px; border-top: 1px solid #f3f4f6; font-size: 13px; color: var(--text-secondary); }
.admin-table tr:hover td { background: #f9fafb; }
.thumb { width: 48px; height: 48px; border-radius: 8px; object-fit: cover; }
.no-img { width: 48px; height: 48px; border-radius: 8px; background: var(--border-light); display: flex; align-items: center; justify-content: center; color: #d1d5db; }
.name-cell { font-weight: 600; }
.low-stock { color: #dc2626; font-weight: 600; }
.empty-row { text-align: center; color: #9ca3af; padding: 32px; }

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid var(--border-light);
}

.page-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1.5px solid var(--border-medium);
  background: white;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.page-btn:hover:not(:disabled) {
  border-color: var(--brand);
  color: var(--brand);
  background: var(--brand-light);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  font-size: 13px;
  color: var(--text-muted);
}
.delete-modal { max-width: 380px; }
.delete-modal h3 { margin-bottom: 8px; }
.delete-modal p { color: var(--text-muted); margin-bottom: 20px; font-size: 14px; }
.btn-danger { padding: 10px 20px; background: #dc2626; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
.btn-danger:hover { background: #b91c1c; }
.actions-cell { display: flex; gap: 6px; }
.btn-sm { padding: 5px 12px; border: none; border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer; transition: background 0.15s; }
.btn-edit { background: #e0f2fe; color: #0369a1; }
.btn-edit:hover { background: #bae6fd; }
.btn-delete { background: #fee2e2; color: #dc2626; }
.btn-delete:hover { background: #fecaca; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 999; backdrop-filter: blur(2px); }
.modal-card { background: #fff; border-radius: 16px; padding: 32px; width: 90%; max-width: 560px; max-height: 85vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
.modal-card h2 { font-size: 18px; font-weight: 700; margin-bottom: 20px; }
.error-msg { color: #dc2626; font-size: 13px; margin-bottom: 12px; }
.modal-form { display: flex; flex-direction: column; gap: 16px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

/* ── Mobile ── */
@media (max-width: 768px) {
  .admin-page { padding: 16px 12px; }
  .page-title { font-size: 20px; }
  .admin-tabs { gap: 8px; }
  .form-row { grid-template-columns: 1fr; gap: 12px; }
  .form-actions { flex-direction: column; }
  .form-actions button { width: 100%; }
  /* Table → card layout */
  .admin-table { display: none; }
  .product-cards { display: flex; flex-direction: column; gap: 12px; margin-top: 12px; }
  .product-card { display: flex; gap: 12px; padding: 12px; background: var(--surface); border: 1px solid var(--border-subtle); border-radius: 10px; align-items: center; }
  .product-card img { width: 60px; height: 60px; border-radius: 8px; object-fit: cover; flex-shrink: 0; }
  .product-card .no-img { width: 60px; height: 60px; border-radius: 8px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 24px; }
  .product-card .info { flex: 1; min-width: 0; }
  .product-card .info .name { font-weight: 600; font-size: 14px; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .product-card .info .price { color: var(--brand); font-size: 13px; }
  .product-card .actions { display: flex; gap: 8px; flex-shrink: 0; }
}
.form-col { display: flex; flex-direction: column; gap: 4px; }
.form-group { display: flex; flex-direction: column; gap: 4px; }
label { font-size: 12px; font-weight: 600; color: var(--text-muted); }
input, select, textarea { padding: 10px 12px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-family: inherit; background: #f9fafb; transition: border 0.2s; }
input:focus, select:focus, textarea:focus { border-color: #63A8B3; outline: none; background: #fff; }
.preview-img { width: 80px; height: 80px; border-radius: 8px; object-fit: cover; margin-top: 8px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
</style>
