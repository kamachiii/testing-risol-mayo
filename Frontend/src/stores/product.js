import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useProductStore = defineStore('products', () => {
  const products = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Map category_id → name (sesuai database)
  const categoryMap = {
    1: 'Snack & Cemilan',
    2: 'Minuman',
    3: 'Makanan Instan',
    4: 'Kebutuhan Dapur',
    5: 'Perlengkapan Mandi',
    6: 'Rokok',
  }

  const searchQuery = ref('')
  const currentPage = ref(1)
  const totalPages = ref(1)
  const totalItems = ref(0)

  async function fetchProducts({ search, page, limit, sort, category_id } = {}) {
      loading.value = true
      error.value = null
      try {
        const params = {}
        if (search !== undefined) params.search = search
        if (page !== undefined) params.page = page
        if (sort !== undefined) params.sort = sort
        if (limit !== undefined) params.limit = limit
        if (category_id !== undefined) params.category_id = category_id
      const { data } = await api.get('/products', { params })
      const raw = data.data || []
      products.value = raw.map(p => ({
        id: p.id,
        name: p.name,
        price: Number(p.price),
        category_id: p.category_id,
        category: p.category_name || categoryMap[p.category_id] || 'Lainnya',
        category_name: p.category_name || categoryMap[p.category_id] || 'Lainnya',
        description: p.description || '',
        image_url: p.image_url?.startsWith('http') ? p.image_url : `${p.image_url}`,
        stock: p.stock ?? 0,
      }))
      // Pagination info from server
      if (data.pagination) {
        totalPages.value = data.pagination.totalPages
        totalItems.value = data.pagination.total
        currentPage.value = data.pagination.page
      }
    } catch (err) {
      console.error('Gagal mengambil data produk:', err.message)
      error.value = 'Gagal memuat produk. Pastikan server backend aktif.'
      products.value = []
    } finally {
      loading.value = false
    }
  }

  const categories = Object.entries(categoryMap).map(([id, name]) => ({
    id: Number(id),
    name,
  }))

  return {
    products,
    loading,
    error,
    fetchProducts,
    categories,
    categoryMap,
    searchQuery,
    currentPage,
    totalPages,
    totalItems,
  }
})
