<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const cart = useCartStore()
const auth = useAuthStore()
const searchQuery = ref('')
const showProfileMenu = ref(false)

const closeMenu = (e) => {
  const wrap = document.querySelector('.profile-wrap')
  if (wrap && !wrap.contains(e.target)) {
    showProfileMenu.value = false
  }
}
onMounted(() => document.addEventListener('click', closeMenu))
onUnmounted(() => document.removeEventListener('click', closeMenu))

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ path: '/', query: { search: searchQuery.value.trim() } })
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  router.push('/')
}

// Sync input with URL on direct load
watch(() => route.query.search, (q) => {
  searchQuery.value = q || ''
}, { immediate: true })

const handleLogout = () => {
  auth.logout()
  router.push('/')
  showProfileMenu.value = false
}
</script>

<template>
  <nav class="navbar">
    <div class="navbar-inner">
      <!-- Logo -->
      <router-link to="/" class="navbar-logo">
        <img src="@/assets/logo.png" alt="Belanja.in" class="logo-img" />
      </router-link>

      <!-- Search -->
      <form class="navbar-search" @submit.prevent="handleSearch">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari produk, snack, minuman..."
          class="search-input"
        />
        <button
          v-if="searchQuery"
          type="button"
          class="search-clear"
          @click="clearSearch"
          aria-label="Hapus pencarian"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </form>

      <!-- Actions -->
      <div class="navbar-actions">
        <!-- Cart -->
        <router-link to="/cart" class="nav-btn" title="Keranjang">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
          </svg>
          <span v-if="cart.totalItems > 0" class="cart-badge">{{ cart.totalItems }}</span>
        </router-link>

        <!-- Logged in: profile dropdown -->
        <template v-if="auth.isLoggedIn">
          <div class="profile-wrap" @mouseenter="showProfileMenu=true" @mouseleave="showProfileMenu=false">
            <button class="profile-pill">
              <span class="p-avatar">{{ auth.user?.name?.charAt(0) || 'U' }}</span>
              <span class="p-name">{{ auth.user?.name }}</span>
              <svg class="p-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <Transition name="menu">
              <div v-if="showProfileMenu" class="profile-dropdown">
                <router-link v-if="auth.isAdmin" to="/admin" class="dd-item" @click="showProfileMenu=false">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                  </svg>
                  Panel Admin
                </router-link>
                <router-link to="/orders" class="dd-item" @click="showProfileMenu=false">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                  Pesanan Saya
                </router-link>
                <div class="dd-divider"></div>
                <button class="dd-item danger" @click="handleLogout">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                    <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Logout
                </button>
              </div>
            </Transition>
          </div>
        </template>

        <!-- Not logged in -->
        <template v-else>
          <router-link :to="{ path: '/login', query: { redirect: $route.fullPath } }" class="btn btn-primary btn-sm">Masuk</router-link>
        </template>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: 64px;
  background: #fff;
  border-bottom: 1px solid rgba(0,0,0,0.06);
}

.navbar-inner {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
  height: 100%;
  padding: 0 24px;
  max-width: 1400px;
  margin: 0 auto;
}

/* ── Logo ── */
.navbar-logo {
  display: flex;
  align-items: center;
  justify-self: start;
  text-decoration: none;
}
.logo-img {
  height: 36px;
  width: auto;
  object-fit: contain;
}

/* ── Search ── */
.navbar-search {
  width: 100%;
  max-width: 480px;
  justify-self: center;
  position: relative;
}
.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  pointer-events: none;
}
.search-clear {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: #e5e7eb;
  color: #6b7280;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s;
}
.search-clear:hover {
  background: #d1d5db;
  color: #374151;
}
.search-input {
  width: 100%;
  height: 40px;
  padding: 0 40px 0 40px;
  font-size: 13px;
  border: 1.5px solid #e5e7eb;
  border-radius: 999px;
  background: #f9fafb;
  color: #111827;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
}
.search-input::placeholder { color: #9ca3af; }
.search-input:focus {
  border-color: #63A8B3;
  box-shadow: 0 0 0 3px rgba(99,168,179,0.12);
  background: #fff;
}

/* ── Actions ── */
.navbar-actions {
  display: flex;
  align-items: center;
  justify-self: end;
  gap: 4px;
}
.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  color: #4b5563;
  text-decoration: none;
  position: relative;
  transition: background 0.15s, color 0.15s;
}
.nav-btn:hover {
  background: #f3f4f6;
  color: #111827;
}
.cart-badge {
  position: absolute;
  top: 4px;
  right: 2px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  font-size: 10px;
  font-weight: 700;
  line-height: 16px;
  text-align: center;
  color: #fff;
  background: #ef4444;
  border-radius: 999px;
}

/* ── Profile Pill ── */
.profile-wrap {
  position: relative;
}
.profile-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 12px 5px 5px;
  border: none;
  background: #f3f4f6;
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.15s;
  font-family: inherit;
}
.profile-pill:hover {
  background: #e5e7eb;
}
.p-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #63A8B3, #4a9aa8);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}
.p-name {
  font-size: 13px;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
}
.p-chevron {
  color: #9ca3af;
  flex-shrink: 0;
}

/* ── Dropdown ── */
.profile-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.1);
  min-width: 190px;
  padding: 6px;
  z-index: 200;
}
.dd-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 14px;
  border: none;
  background: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.12s;
  font-family: inherit;
}
.dd-item:hover {
  background: #f3f4f6;
}
.dd-item.danger {
  color: #ef4444;
}
.dd-item.danger:hover {
  background: #fef2f2;
}
.dd-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 4px 8px;
}
.menu-enter-active,
.menu-leave-active {
  transition: opacity 0.12s ease, transform 0.12s ease;
}
.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* ── Mobile ── */
@media (max-width: 640px) {
  .navbar-inner { padding: 0 12px; }
  .navbar-search {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
    background: #fff;
    border-top: 1px solid #e5e7eb;
    padding: 10px 16px;
    max-width: none;
  }
  .p-name { display: none; }
  .p-chevron { display: none; }
  .profile-pill { padding: 5px; position: relative; }
  .profile-dropdown {
    position: fixed;
    top: auto;
    bottom: 60px;
    right: 12px;
    left: auto;
    min-width: 200px;
  }
}
</style>
