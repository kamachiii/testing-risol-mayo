<script setup>
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
import Toast from './components/Toast.vue'
import { useToast } from '@/composables/useToast'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const { toasts, removeToast } = useToast()
const route = useRoute()
const showLayout = computed(() => !route.meta.hideLayout)
</script>

<template>
  <div class="app-root">
    <!-- Gradient blobs for glassmorphism -->
    <div class="blob-2"></div>
    <div class="blob-3"></div>
    <Navbar v-if="showLayout" />
    <main :class="showLayout ? 'main-wrap' : 'main-full'">
      <router-view v-slot="{ Component, route }">
        <transition v-if="!route.meta.noTransition" name="page" mode="out-in">
          <component :is="Component" />
        </transition>
        <component v-else :is="Component" />
      </router-view>
    </main>
    <Footer v-if="showLayout" />

    <Teleport to="body">
      <Toast
        v-for="(toast, index) in toasts"
        :key="toast.id"
        :message="toast.message"
        :type="toast.type"
        :duration="toast.duration"
        :stack-index="index"
        @close="removeToast(toast.id)"
      />
    </Teleport>
  </div>
</template>

<style>
.app-root {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
  z-index: 1;
}

.main-wrap {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 20px 32px;
  width: 100%;
}

.main-full {
  flex: 1;
  width: 100%;
}
@media (max-width: 640px) {
  .main-wrap { padding-bottom: 72px; }
}
</style>
