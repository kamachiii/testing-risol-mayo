<template>
  <div class="info-page">
    <div class="info-container">
      <button class="back-btn" @click="$router.back()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        Kembali
      </button>

      <div v-if="page" class="info-content">
        <h1>{{ page.title }}</h1>
        <p class="info-lead">{{ page.lead }}</p>

        <div v-for="(section, idx) in page.sections" :key="idx">
          <h2>{{ section.heading }}</h2>
          <p v-if="section.text">{{ section.text }}</p>
          <ul v-if="section.list">
            <li v-for="(item, li) in section.list" :key="li">{{ item }}</li>
          </ul>
        </div>
      </div>

      <div v-else class="info-content">
        <h1>Halaman Tidak Ditemukan</h1>
        <p>Halaman yang Anda cari tidak tersedia.</p>
        <router-link to="/" class="back-home">Kembali ke Beranda</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const pages = {
  about: {
    title: 'Tentang Kami',
    lead: 'Belanja.in adalah minimarket online yang menyediakan kebutuhan sehari-hari dengan mudah dan cepat. Kami hadir untuk mempermudah belanja Anda tanpa perlu keluar rumah.',
    sections: [
      {
        heading: 'Visi Kami',
        text: 'Menjadi platform belanja kebutuhan sehari-hari yang paling mudah diakses oleh semua orang, dengan layanan yang cepat, aman, dan terpercaya.',
      },
      {
        heading: 'Mengapa Memilih Kami?',
        list: [
          'Ribuan produk kebutuhan sehari-hari',
          'Pengiriman cepat ke seluruh area',
          'Harga bersaing dan transparan',
          'Pembayaran mudah dan aman',
          'Layanan pelanggan yang responsif',
        ],
      },
      {
        heading: 'Hubungi Kami',
        text: 'Email: support@belanja.in | WhatsApp: +62 812-3456-7890',
      },
    ],
  },
  help: {
    title: 'Bantuan',
    lead: 'Temukan jawaban untuk pertanyaan umum seputar penggunaan Belanja.in.',
    sections: [
      {
        heading: 'Cara Berbelanja',
        list: [
          'Browse produk di halaman utama atau gunakan pencarian',
          'Tambahkan produk ke keranjang',
          'Pilih metode pengiriman: Ambil di Toko atau Diantar',
          'Lakukan pembayaran',
          'Tunggu pesanan Anda tiba!',
        ],
      },
      {
        heading: 'Metode Pembayaran',
        text: 'Kami menerima transfer bank (BCA, Mandiri, BRI, BNI), QRIS, dan pembayaran tunai saat pengambilan di toko.',
      },
      {
        heading: 'Pengembalian Produk',
        text: 'Produk dapat dikembalikan dalam kondisi asli dalam waktu 1 hari setelah pemesanan. Hubungi kami via WhatsApp untuk proses pengembalian.',
      },
    ],
  },
  terms: {
    title: 'Syarat & Ketentuan',
    lead: 'Syarat dan ketentuan berikut berlaku untuk penggunaan layanan Belanja.in.',
    sections: [
      {
        heading: 'Penerimaan Syarat',
        text: 'Dengan mengakses dan menggunakan layanan Belanja.in, Anda menyetujui syarat dan ketentuan yang berlaku.',
      },
      {
        heading: 'Akun Pengguna',
        list: [
          'Anda bertanggung jawab atas keamanan akun Anda',
          'Informasi yang diberikan harus akurat dan terkini',
          'Satu akun untuk setiap pengguna',
        ],
      },
      {
        heading: 'Pemesanan',
        text: 'Semua pemesanan tergantung ketersediaan produk. Kami berhak membatalkan pesanan jika produk tidak tersedia.',
      },
      {
        heading: 'Harga',
        text: 'Harga yang tercantum dapat berubah sewaktu-waktu tanpa pemberitahuan sebelumnya.',
      },
    ],
  },
  privacy: {
    title: 'Kebijakan Privasi',
    lead: 'Kami menghargai privasi Anda. Kebijakan ini menjelaskan bagaimana kami mengumpulkan dan menggunakan data Anda.',
    sections: [
      {
        heading: 'Informasi yang Kami Kumpulkan',
        list: [
          'Nama dan alamat email saat pendaftaran',
          'Alamat pengiriman untuk layanan antar',
          'Informasi pembayaran untuk memproses pesanan',
          'Data penggunaan untuk meningkatkan layanan',
        ],
      },
      {
        heading: 'Penggunaan Informasi',
        text: 'Informasi Anda digunakan untuk memproses pesanan, mengirimkan notifikasi, dan meningkatkan pengalaman berbelanja Anda.',
      },
      {
        heading: 'Keamanan Data',
        text: 'Kami menerapkan langkah-langkah keamanan yang sesuai untuk melindungi data pribadi Anda dari akses yang tidak sah.',
      },
    ],
  },
}

const page = computed(() => pages[route.params.slug] || null)
</script>

<style scoped>
.info-page {
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 100px 20px 60px;
}
.info-container {
  max-width: 720px;
  margin: 0 auto;
}
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  padding: 8px 0;
  margin-bottom: 24px;
}
.back-btn:hover { color: var(--brand); }
.info-content h1 {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 16px;
}
.info-lead {
  font-size: 16px;
  color: var(--text-secondary);
  line-height: 1.7;
  margin-bottom: 32px;
}
.info-content h2 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 28px 0 12px;
}
.info-content p {
  font-size: 15px;
  color: var(--text-secondary);
  line-height: 1.7;
  margin-bottom: 12px;
}
.info-content ul {
  list-style: disc;
  padding-left: 24px;
  margin-bottom: 16px;
}
.info-content li {
  font-size: 15px;
  color: var(--text-secondary);
  line-height: 1.8;
}
.back-home {
  display: inline-block;
  margin-top: 12px;
  color: var(--brand);
  font-weight: 500;
  text-decoration: none;
}
.back-home:hover { text-decoration: underline; }

@media (max-width: 640px) {
  .info-page { padding: 80px 16px 40px; }
  .info-content h1 { font-size: 22px; }
}
</style>
