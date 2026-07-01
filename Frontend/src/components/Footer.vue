<template>
  <footer class="footer">
    <div class="footer-inner container">
      <div class="footer-brand">
        <img src="@/assets/logo.png" alt="Belanja.in" class="footer-logo-img" />
        <p class="footer-tagline">Minimarket online — belanja mudah, pengiriman cepat.</p>
      </div>
      <div class="footer-links">
            <router-link to="/info/about">Tentang</router-link>
            <router-link to="/info/help">Bantuan</router-link>
            <router-link to="/info/terms">Syarat & Ketentuan</router-link>
            <router-link to="/info/privacy">Kebijakan Privasi</router-link>
          </div>
      <div class="footer-copy">
        © {{ new Date().getFullYear() }} Belanja.in — All rights reserved.
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  border-top: 1px solid var(--border-subtle);
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 32px 0 24px;
  margin-top: auto;
}

.footer-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
}

.footer-logo-img {
  height: 28px;
  width: auto;
  object-fit: contain;
}

.footer-tagline {
  font-size: 12.5px;
  color: var(--text-muted);
  margin-top: 2px;
}

.footer-links {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
}

.footer-links a {
  font-size: 12.5px;
  color: var(--text-muted);
  cursor: pointer;
  text-decoration: none;
  transition: color 0.15s;
}

.footer-links a:hover {
  color: var(--brand);
}

.footer-copy {
  font-size: 11.5px;
  color: var(--text-muted);
  opacity: 0.7;
}
</style>
