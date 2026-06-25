<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product'
import HeroBanner from '@/components/home/HeroBanner.vue'
import SidebarFilter from '@/components/home/SidebarFilter.vue'
import ProductList from '@/components/home/ProductList.vue'
import PaginationBar from '@/components/common/PaginationBar.vue'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const selectedCategory = ref('')
const searchQuery = ref('')
const sortBy = ref('newest')

const categories = computed(() => productStore.categories)
const selectedCategoryName = computed(() => {
  if (!selectedCategory.value) return ''
  const cat = categories.value.find(c => String(c.id) === String(selectedCategory.value))
  return cat ? cat.name : ''
})

// Use products directly from server (server-side filtering)
const filteredProducts = computed(() => productStore.products)

// Debounced server-side search
let searchTimer = null
const doSearch = (q) => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    productStore.fetchProducts({ search: q, page: 1, sort: sortBy.value, category_id: selectedCategory.value || undefined })
  }, 400)
}

const clearSearch = () => {
  searchQuery.value = ''
  selectedCategory.value = ''
  router.push('/')
}

const handlePageChange = (page) => {
  productStore.fetchProducts({ search: searchQuery.value, page, sort: sortBy.value, category_id: selectedCategory.value || undefined })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Watch URL query changes (from Navbar search submit or logo click reset)
watch(
  () => route.query.search,
  (newSearch) => {
    const q = newSearch || ''
    searchQuery.value = q
    if (q) {
      doSearch(q)
    } else {
      // No search query → fetch all products
      clearTimeout(searchTimer)
      productStore.fetchProducts({ search: '', page: 1, sort: sortBy.value })
    }
  }
)

// Watch sort change
watch(sortBy, () => {
  productStore.fetchProducts({ search: searchQuery.value, page: 1, sort: sortBy.value, category_id: selectedCategory.value || undefined })
})

watch(selectedCategory, () => {
  productStore.fetchProducts({ search: searchQuery.value, page: 1, sort: sortBy.value, category_id: selectedCategory.value || undefined })
})

onMounted(async () => {
  if (route.query.search) {
    searchQuery.value = route.query.search
    await productStore.fetchProducts({ search: route.query.search, sort: sortBy.value })
  } else {
    await productStore.fetchProducts({ sort: sortBy.value })
  }
})
</script>

<template>
  <div class="home-page">
    <!-- Hero Banner -->
    <HeroBanner />

    <!-- Filter -->
    <section class="filter-section">
      <SidebarFilter
        :categories="categories"
        :selected="selectedCategory"
        @select="selectedCategory = $event"
      />
    </section>

    <!-- Products -->
    <section id="products" class="products-section">
      <div class="section-header">
        <h2 class="section-title">
          {{ selectedCategoryName || 'Semua Produk' }}
          <span v-if="searchQuery" class="search-label">— pencarian "{{ searchQuery }}"</span>
          <button v-if="searchQuery" class="search-clear-btn" @click="clearSearch">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Hapus</button>
        </h2>
        <div class="sort-wrap">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="16" y2="12"/><line x1="4" y1="18" x2="12" y2="18"/>
          </svg>
          <select v-model="sortBy" class="sort-select">
            <option value="newest">Terbaru</option>
            <option value="price_asc">Harga Terendah</option>
            <option value="price_desc">Harga Tertinggi</option>
            <option value="name_asc">Nama A-Z</option>
            <option value="name_desc">Nama Z-A</option>
          </select>
        </div>
      </div>
      <!-- Loading -->
      <div v-if="productStore.loading" class="loading-state">
        <div class="spinner-lg"></div>
        <p>Memuat produk...</p>
      </div>
      <!-- Empty state -->
      <div v-else-if="filteredProducts.length === 0" class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <p class="empty-title">Produk tidak ditemukan</p>
        <p class="empty-sub">Coba kata kunci lain atau <button class="clear-link" @click="clearSearch">hapus pencarian</button></p>
      </div>
      <ProductList v-else :products="filteredProducts" />
      <PaginationBar
        :current-page="productStore.currentPage"
        :total-pages="productStore.totalPages"
        @change="handlePageChange"
      />
    </section>
  </div>
</template>

<style scoped>
.home-page {
  max-width: 1200px;
  margin: 0 auto;
}
.loading-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}
.spinner-lg {
  width: 36px;
  height: 36px;
  border: 3px solid #e5e7eb;
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  margin: 0 auto 12px;
}
@keyframes spin { to { transform: rotate(360deg); } }
.products-section {
  padding: 0 20px 40px;
  scroll-margin-top: 80px;
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.section-title {
  font-size: 18px;
  font-weight: 700;
}

.sort-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6b7280;
}

.sort-select {
  padding: 6px 28px 6px 8px;
  font-size: 13px;
  font-weight: 600;
  border: 1.5px solid var(--border-medium, #e5e7eb);
  border-radius: var(--radius-full, 999px);
  background: white;
  color: #374151;
  cursor: pointer;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  transition: border-color 0.2s;
}

.sort-select:focus {
  border-color: var(--brand, #63A8B3);
}
.page-top h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #111827;
}

/* ── Empty state ── */
.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 16px;
  color: #9ca3af;
  text-align: center;
}
.empty-title {
  margin: 16px 0 4px;
  font-size: 16px;
  font-weight: 600;
  color: #6b7280;
}
.empty-sub {
  font-size: 13px;
  color: #9ca3af;
}
.clear-link {
  background: none;
  border: none;
  color: #63A8B3;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  padding: 0;
  text-decoration: underline;
}
.clear-link:hover {
  color: #4a9aa8;
}
.search-label {
  font-weight: 400;
  color: #6b7280;
}
.search-clear-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: 8px;
  padding: 3px 10px;
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
  vertical-align: middle;
}
.search-clear-btn:hover {
  background: #fecaca;
}

/* Mobile */
@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  .sort-wrap {
    width: 100%;
  }
  .sort-select {
    width: 100%;
  }
}
</style>
