<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const banners = [
  { id: 1, svg: 'bag', title: 'Belanja Mudah', subtitle: 'Minimarket online, kapan aja', color: '#63A8B3' },
  { id: 2, svg: 'fire', title: 'Promo Spesial', subtitle: 'Diskon hingga 30% semua produk', color: '#E9A84A' },
  { id: 3, svg: 'rocket', title: 'Pengiriman Cepat', subtitle: 'Sampe depan rumah', color: '#5B8FA8' },
]

const current = ref(0)
let timer = null

const next = () => { current.value = (current.value + 1) % banners.length }
const prev = () => { current.value = (current.value - 1 + banners.length) % banners.length }

onMounted(() => { timer = setInterval(next, 4000) })
onUnmounted(() => { clearInterval(timer) })
</script>

<template>
  <div class="banner-wrap">
    <div class="banner-track" :style="{ transform: `translateX(-${current * 100}%)` }">
      <div
        v-for="b in banners"
        :key="b.id"
        class="banner-slide glass-card"
        :style="{ '--accent': b.color }"
      >
        <div class="banner-content">
          <span class="banner-icon" v-if="b.svg === 'bag'">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
          </span>
          <span class="banner-icon" v-else-if="b.svg === 'fire'">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 12c2-2.96 0-7-1-8 0 3.038-1.773 4.741-3 6-1.226 1.26-2 3.24-2 5a6 6 0 1012 0c0-1.532-1.056-3.94-2-5-1.786 3-2.791 3-4 2z"/>
            </svg>
          </span>
          <span class="banner-icon" v-else-if="b.svg === 'rocket'">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/>
              <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/>
              <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
              <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
            </svg>
          </span>
          <div>
            <h2 class="banner-title">{{ b.title }}</h2>
            <p class="banner-sub">{{ b.subtitle }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Controls -->
    <button class="banner-btn prev" @click="prev">‹</button>
    <button class="banner-btn next" @click="next">›</button>

    <!-- Dots -->
    <div class="banner-dots">
      <button
        v-for="(_, i) in banners"
        :key="i"
        class="dot"
        :class="{ active: i === current }"
        @click="current = i"
      />
    </div>
  </div>
</template>

<style scoped>
.banner-wrap {
  position: relative;
  border-radius: var(--radius-xl);
  overflow: hidden;
  margin-bottom: 24px;
}

.banner-track {
  display: flex;
  transition: transform var(--duration-slow) var(--ease-out-expo);
}

.banner-slide {
  min-width: 100%;
  padding: 28px 32px;
  border-radius: var(--radius-xl);
  background: linear-gradient(135deg, var(--accent, #63A8B3) 0%, color-mix(in srgb, var(--accent) 80%, black) 100%);
  border: none;
  box-shadow: none;
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.banner-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
}

.banner-title {
  font-size: 20px;
  font-weight: 800;
  color: white;
  letter-spacing: -0.02em;
}

.banner-sub {
  font-size: 13.5px;
  color: rgba(255, 255, 255, 0.85);
  margin-top: 2px;
}

.banner-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  border: none;
  font-size: 18px;
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--duration-base);
  box-shadow: var(--shadow-sm);
  z-index: 2;
}

.banner-btn:hover { background: white; box-shadow: var(--shadow-md); }
.banner-btn.prev { left: 12px; }
.banner-btn.next { right: 12px; }

.banner-dots {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
  z-index: 2;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  border: none;
  cursor: pointer;
  transition: all var(--duration-base);
  padding: 0;
}

.dot.active {
  width: 18px;
  border-radius: 3px;
  background: white;
}
</style>
