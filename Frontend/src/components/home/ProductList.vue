<script setup>
import ProductCard from './ProductCard.vue'

defineProps({
  products: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})
</script>

<template>
  <div class="product-grid">
    <!-- Loading skeletons -->
    <template v-if="loading">
      <div v-for="i in 8" :key="i" class="skeleton-card glass-card">
        <div class="skeleton skeleton-img"></div>
        <div style="padding: 14px; display: flex; flex-direction: column; gap: 8px;">
          <div class="skeleton" style="height: 14px; width: 80%;"></div>
          <div class="skeleton" style="height: 11px; width: 40%;"></div>
          <div class="skeleton" style="height: 18px; width: 50%; margin-top: 10px;"></div>
        </div>
      </div>
    </template>

    <!-- Products -->
    <template v-else-if="products.length">
      <ProductCard
        v-for="(product, idx) in products"
        :key="product.id"
        :product="product"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: idx * 50, duration: 350 } }"
      />
    </template>

  </div>
</template>

<style scoped>
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.skeleton-card {
  overflow: hidden;
}

.skeleton-img {
  aspect-ratio: 1;
  width: 100%;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-state h3 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 4px;
}

.empty-state p {
  font-size: 13.5px;
  color: var(--text-muted);
}
</style>
