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
      console.warn('Backend tidak tersedia, menggunakan data dummy:', err.message)
      products.value = getMockProducts()
    } finally {
      loading.value = false
    }
  }

  function getMockProducts() {
    return [
      { id: 101, name: 'Cheetos Jagung 68g', price: 8500, category: 'Snack & Cemilan', categoryIcon: '🍿', image_url: '/uploads/products/cheetos.jpg', stock: 50 },
      { id: 102, name: 'Chuba Stick 60g', price: 7500, category: 'Snack & Cemilan', categoryIcon: '🍿', image_url: '/uploads/products/chuba.jpg', stock: 45 },
      { id: 103, name: 'Taro Net 60g', price: 8000, category: 'Snack & Cemilan', categoryIcon: '🍿', image_url: '/uploads/products/taro.jpg', stock: 40 },
      { id: 104, name: 'Lays Classic 68g', price: 9500, category: 'Snack & Cemilan', categoryIcon: '🍿', image_url: '/uploads/products/lays.jpg', stock: 35 },
      { id: 105, name: 'Oreo Original 137g', price: 12000, category: 'Snack & Cemilan', categoryIcon: '🍿', image_url: '/uploads/products/oreo.jpg', stock: 60 },
      { id: 201, name: 'Le Minerale 600ml', price: 4000, category: 'Minuman', categoryIcon: '🥤', image_url: '/uploads/products/le-minerale.jpg', stock: 100 },
      { id: 202, name: 'Mizone 500ml', price: 6500, category: 'Minuman', categoryIcon: '🥤', image_url: '/uploads/products/mizone.jpg', stock: 80 },
      { id: 203, name: 'Coca-Cola 390ml', price: 7000, category: 'Minuman', categoryIcon: '🥤', image_url: '/uploads/products/coca-cola.jpg', stock: 70 },
      { id: 204, name: 'Teh Pucuk 350ml', price: 4500, category: 'Minuman', categoryIcon: '🥤', image_url: '/uploads/products/teh-pucuk.jpg', stock: 90 },
      { id: 301, name: 'Indomie Goreng 85g', price: 3200, category: 'Makanan Instan', categoryIcon: '🍜', image_url: '/uploads/products/indomie-goreng.jpg', stock: 150 },
      { id: 302, name: 'Indomie Soto 75g', price: 3200, category: 'Makanan Instan', categoryIcon: '🍜', image_url: '/uploads/products/indomie-soto.jpg', stock: 120 },
      { id: 303, name: 'Pop Mie 75g', price: 5500, category: 'Makanan Instan', categoryIcon: '🍜', image_url: '/uploads/products/mie-sedaap.jpg', stock: 80 },
      { id: 401, name: 'Bimoli 1L', price: 18000, category: 'Kebutuhan Dapur', categoryIcon: '🍳', image_url: '/uploads/products/minyak-bimoli.jpg', stock: 40 },
      { id: 402, name: 'Gulaku 1kg', price: 15000, category: 'Kebutuhan Dapur', categoryIcon: '🍳', image_url: '/uploads/products/gula-pasir.jpg', stock: 60 },
      { id: 501, name: 'Lifebuoy 250ml', price: 15000, category: 'Perlengkapan Mandi', categoryIcon: '🧴', image_url: '/uploads/products/lifebuoy.jpg', stock: 35 },
      { id: 502, name: 'Pantene 160ml', price: 18000, category: 'Perlengkapan Mandi', categoryIcon: '🧴', image_url: '/uploads/products/clear.jpg', stock: 30 },
    ]
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
