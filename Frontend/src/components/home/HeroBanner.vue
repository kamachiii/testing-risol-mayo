<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const features = [
  { icon: 'bag', title: 'Belanja Mudah', desc: 'Pesan dari rumah, barang sampai depan pintu' },
  { icon: 'truck', title: 'Pengiriman Cepat', desc: 'Same day delivery area Jabodetabek' },
  { icon: 'tag', title: 'Harga Terjangkau', desc: 'Harga minimarket, kenyamanan online' },
]

const visible = ref(false)
onMounted(() => { setTimeout(() => visible.value = true, 100) })

const scrollToProducts = () => {
  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <div class="hero">
    <div class="hero-bg"></div>
    <div class="hero-content" :class="{ visible }">
      <div class="hero-text">
        <div class="hero-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          Minimarket Online
        </div>
        <h1 class="hero-title">
          Belanja kebutuhan<br/>
          <span class="hero-highlight">hari ini</span> dengan mudah
        </h1>
        <p class="hero-subtitle">
          Snack, minuman, kebutuhan sehari-hari — semua ada di Belanja.in.
          Tinggal pesan, barang langsung dikirim.
        </p>
        <div class="hero-actions">
          <button @click="scrollToProducts" class="hero-btn primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            Lihat Produk
          </button>
        </div>
      </div>
    </div>

    <!-- Features -->
    <div class="features-row">
      <div v-for="f in features" :key="f.title" class="feature-item">
        <div class="feature-icon">
          <svg v-if="f.icon === 'bag'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
          <svg v-else-if="f.icon === 'truck'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          <svg v-else-if="f.icon === 'tag'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
        </div>
        <div>
          <p class="feature-title">{{ f.title }}</p>
          <p class="feature-desc">{{ f.desc }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero {
  position: relative;
  margin-bottom: 28px;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #63A8B3 0%, #4A9AA8 40%, #3D8A98 100%);
  border-radius: 20px;
  z-index: 0;
}

.hero-bg::before {
  content: '';
  position: absolute;
  top: -60%;
  right: -20%;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
}

.hero-bg::after {
  content: '';
  position: absolute;
  bottom: -40%;
  left: -10%;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.04);
}

.hero-content {
  position: relative;
  z-index: 1;
  padding: 40px 36px 28px;
  opacity: 0;
  transform: translateY(12px);
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.hero-content.visible {
  opacity: 1;
  transform: translateY(0);
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  letter-spacing: 0.02em;
  margin-bottom: 16px;
}

.hero-title {
  font-size: 30px;
  font-weight: 800;
  color: white;
  line-height: 1.2;
  letter-spacing: -0.03em;
  margin: 0 0 12px;
}

.hero-highlight {
  position: relative;
  display: inline-block;
}

.hero-highlight::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 4px;
  height: 10px;
  background: rgba(233, 168, 74, 0.45);
  border-radius: 4px;
  z-index: 0;
  pointer-events: none;
}

.hero-subtitle {
  font-size: 14.5px;
  color: rgba(255, 255, 255, 0.82);
  line-height: 1.6;
  margin: 0 0 24px;
  max-width: 460px;
}

.hero-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.hero-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 10px 20px;
  border-radius: 12px;
  font-size: 13.5px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
}

.hero-btn.primary {
  background: white;
  color: #3D8A98;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.hero-btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.hero-btn.ghost {
  background: rgba(255, 255, 255, 0.14);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.25);
}

.hero-btn.ghost:hover {
  background: rgba(255, 255, 255, 0.22);
}

/* Features row */
.features-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 16px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: white;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
}

.feature-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
}

.feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--brand-light, #E8F5F7);
  color: var(--brand, #63A8B3);
  flex-shrink: 0;
}

.feature-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary, #111827);
  margin: 0 0 2px;
}

.feature-desc {
  font-size: 12px;
  color: var(--text-muted, #9ca3af);
  margin: 0;
  line-height: 1.4;
}

/* Mobile */
@media (max-width: 768px) {
  .hero-content {
    padding: 28px 20px 20px;
  }

  .hero-title {
    font-size: 24px;
  }

  .hero-subtitle {
    font-size: 13.5px;
  }

  .features-row {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}
</style>
