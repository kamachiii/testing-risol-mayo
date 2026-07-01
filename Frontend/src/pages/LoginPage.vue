<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const form = ref({ email: '', password: '' })
const error = ref('')
const loading = ref(false)
const showPassword = ref(false)

const handleLogin = async () => {
  error.value = ''
  loading.value = true
  try {
    const result = await auth.login(form.value.email, form.value.password)
    if (result.success) {
      const redirect = route.query.redirect || '/'
      router.push(redirect)
    } else {
      error.value = result.message || 'Email atau password salah'
    }
  } catch (e) {
    error.value = 'Terjadi kesalahan, coba lagi'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card glass-card">
      <div class="auth-header">
        <img src="@/assets/logo.png" alt="Belanja.in" class="auth-logo-img" />
        <h1>Masuk ke Belanja<span class="dot">.in</span></h1>
        <p>Selamat datang kembali!</p>
      </div>

      <Transition name="page">
        <div v-if="error" class="alert alert-error">
          <span>✕</span> {{ error }}
        </div>
      </Transition>

      <form class="auth-form" @submit.prevent="handleLogin">
        <div class="field">
          <label>Email</label>
          <input
            v-model="form.email"
            type="email"
            class="input"
            placeholder="email@contoh.com"
            required
          />
        </div>

        <div class="field">
          <label>Password</label>
          <div class="password-wrap">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              class="input"
              placeholder="Masukkan password"
              required
            />
            <button type="button" class="pwd-toggle" @click="showPassword = !showPassword">
              <svg v-if="!showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            </button>
          </div>
        </div>

        <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          {{ loading ? 'Masuk...' : 'Masuk' }}
        </button>
      </form>

      <p class="auth-footer">
        Belum punya akun?
        <router-link to="/register" class="link">Daftar sekarang</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #ecfdf5 0%, #fafaf9 50%, #fef3c7 100%);
}

.auth-card {
  width: 100%;
  max-width: 400px;
  padding: 36px 32px;
  text-align: center;
}

.auth-header {
  margin-bottom: 24px;
}

.auth-logo-img {
  height: 64px;
  width: auto;
  object-fit: contain;
  margin-bottom: 12px;
}

.auth-header h1 {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--text-primary);
}

.dot { color: var(--brand); }

.auth-header p {
  font-size: 13.5px;
  color: var(--text-muted);
  margin-top: 4px;
}

.password-wrap {
  position: relative;
}

.password-wrap .input {
  padding-right: 44px;
}

.pwd-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pwd-toggle:hover {
  color: var(--text-primary);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  text-align: left;
}

.field label {
  display: block;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 5px;
}

.btn-block {
  width: 100%;
  margin-top: 4px;
  padding: 11px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.auth-footer {
  margin-top: 20px;
  font-size: 13px;
  color: var(--text-muted);
}

.link {
  color: var(--brand);
  font-weight: 600;
}
.link:hover { text-decoration: underline; }

.alert {
  padding: 10px 14px;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 14px;
  text-align: left;
}

.alert-error {
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

/* ── Mobile ── */
@media (max-width: 640px) {
  .login-page { padding: 16px; }
  .login-card { padding: 24px 20px; }
  .login-card h1 { font-size: 20px; }
}
</style>
