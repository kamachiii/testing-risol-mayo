# 🛒 Belanja.in — Development Roadmap

> Last updated: 2026-06-30
> Status: PLANNING — tunggu approval user

---

## Implementation Order (Prioritas + Dependency)

### 🔴 Phase 1 — Core (harus duluan)
| Step | Task | Alasan |
|------|------|--------|
| 1.1 | Product detail page `/products/:id` | Tanpa ini, user gak bisa liat produk. Route backend sudah ada (`GET /api/products/:id`) |
| 1.2 | Search server-side | Sebelum pagination, search harus backend dulu |
| 1.3 | Pagination (products + orders) | Depends on server-side search |
| 1.4 | 404 page | 10 menit, langsung beres |
| 1.5 | Footer links → router-link pages | Fix broken HTML + buat halaman Tentang/Bantuan/etc |

### 🟠 Phase 2 — Admin Power
| Step | Task | Alasan |
|------|------|--------|
| 2.1 | Admin CRUD products UI | Admin gak bisa manage produk dari web |
| 2.2 | Order status flow (Pending→Paid→Processed→Shipped→Delivered) | Manual dropdown → proper flow |
| 2.3 | Dashboard admin pakai chart (Chart.js) | Basic stats → visual analytics |

### 🟡 Phase 3 — User Experience
| Step | Task | Alasan |
|------|------|--------|
| 3.1 | Order cancellation by user | User gak bisa batalin order |
| 3.2 | Saved addresses | Checkout gak perlu input ulang |
| 3.3 | Payment status flow improvement | Upload bukti → auto pending → admin verify |
| 3.4 | Loading skeleton di semua halaman | Konsistensi UX |
| 3.5 | Cart count badge live update | Real-time tanpa refresh |

### 🟢 Phase 4 — Engagement
| Step | Task | Alasan |
|------|------|--------|
| 4.1 | Product reviews/ratings | Social proof |
| 4.2 | Wishlist/Favorites | Engagement |
| 4.3 | Promo/voucher system | Banner "Diskon 30%" → real system |
| 4.4 | Invoice PDF | Professional touch |

### 🔵 Phase 5 — Advanced
| Step | Task | Alasan |
|------|------|--------|
| 5.1 | Dashboard admin charts (Chart.js) | Already in Phase 2, this is polish |
| 5.2 | Mobile bottom nav bar | Shopee-style |
| 5.3 | Dark mode toggle | CSS vars sudah ada |
| 5.4 | PWA (installable) | Offline capability |
| 5.5 | WebSocket real-time stock | Stok live update |

---

## Notes

- Phase 1-2 target: MVP kuat (bisa dipresentasi/dipake beneran)
- Phase 3-4: UX enhancement (daya saing)
- Phase 5: Advanced (nice-to-have, bisa nanti)
- Tiap step: implement → build → verify → user approve → next
- **Gak boleh skip phase** — dependency chain berurutan
- Backend routes sudah ada untuk majoritas fitur (products CRUD, orders, cart)
