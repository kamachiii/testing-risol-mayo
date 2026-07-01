<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div class="not-found">
    <div class="nf-icon">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M16 16s-1.5-2-4-2-4 2-4 2"/>
        <line x1="9" y1="9" x2="9.01" y2="9"/>
        <line x1="15" y1="9" x2="15.01" y2="9"/>
      </svg>
    </div>
    <h1 class="nf-code">404</h1>
    <p class="nf-text">Halaman tidak ditemukan</p>
    <p class="nf-sub">Sepertinya halaman yang kamu cari sudah dipindahkan atau tidak tersedia.</p>
    <button class="btn btn-primary" @click="router.push('/')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
      </svg>
      Kembali ke Beranda
    </button>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  padding: 40px 20px;
  text-align: center;
}
.nf-icon {
  color: var(--brand);
  opacity: 0.4;
  margin-bottom: 12px;
}
.nf-code {
  font-size: 72px;
  font-weight: 900;
  color: var(--brand);
  opacity: 0.15;
  line-height: 1;
  margin-bottom: 8px;
}
.nf-text {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 6px;
}
.nf-sub {
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 24px;
}
</style>
