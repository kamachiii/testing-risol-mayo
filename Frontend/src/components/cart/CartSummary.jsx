// src/components/cart/CartSummary.jsx
import React from 'react';

/**
 * CartSummary — Sticky right-column panel showing price breakdown & checkout CTA.
 *
 * Props:
 *  - cartItems  (array): Full cart item array (for per-item breakdown)
 *  - totalPrice (number): Pre-computed grand total from parent useMemo
 */

const formatIDR = (amount) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);

const SHIPPING_COST = 0; // Free shipping

const CartSummary = ({ cartItems, totalPrice }) => {
  const grandTotal = totalPrice + SHIPPING_COST;

  const handleCheckout = () => {
    // TODO: integrate with order API (POST /api/orders)
    alert('Fitur checkout sedang dalam pengembangan. Silakan coba lagi nanti!');
  };

  return (
    // sticky positioning — parent must be `position: relative` (default)
    <div style={{ position: 'sticky', top: '88px' }}>
      <div
        style={{
          backgroundColor: 'rgba(30, 41, 59, 0.7)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(71, 85, 105, 0.4)',
          borderRadius: '14px',
          padding: '1.375rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0',
        }}
      >
        {/* ── Header ── */}
        <h2
          style={{
            color: 'rgba(226, 232, 240, 0.95)',
            fontWeight: 700,
            fontSize: '1rem',
            margin: '0 0 1.125rem 0',
            paddingBottom: '1rem',
            borderBottom: '1px solid rgba(51, 65, 85, 0.6)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span>🧾</span> Ringkasan Belanja
        </h2>

        {/* ── Per-item breakdown ── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.625rem',
            marginBottom: '1rem',
          }}
        >
          {cartItems.map((item) => (
            <div
              key={item.product_id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '0.5rem',
              }}
            >
              <span
                style={{
                  color: 'rgba(148, 163, 184, 0.85)',
                  fontSize: '0.8125rem',
                  lineHeight: 1.5,
                  flex: 1,
                }}
              >
                {item.name}{' '}
                <span style={{ color: 'rgba(100, 116, 139, 0.8)' }}>×{item.quantity}</span>
              </span>
              <span
                style={{
                  color: 'rgba(203, 213, 225, 0.9)',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  flexShrink: 0,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {formatIDR(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        {/* ── Divider ── */}
        <div style={{ borderTop: '1px solid rgba(51, 65, 85, 0.5)', margin: '0 0 1rem 0' }} />

        {/* ── Subtotal ── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '0.625rem',
          }}
        >
          <span style={{ color: 'rgba(148, 163, 184, 0.8)', fontSize: '0.875rem' }}>Subtotal</span>
          <span style={{ color: 'rgba(203, 213, 225, 0.9)', fontSize: '0.875rem', fontVariantNumeric: 'tabular-nums' }}>
            {formatIDR(totalPrice)}
          </span>
        </div>

        {/* ── Shipping ── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '1.125rem',
          }}
        >
          <span style={{ color: 'rgba(148, 163, 184, 0.8)', fontSize: '0.875rem' }}>Ongkos Kirim</span>
          <span
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#4ade80', /* green — free shipping highlight */
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
            }}
          >
            🎉 Gratis
          </span>
        </div>

        {/* ── Grand Total ── */}
        <div
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(34, 211, 238, 0.2)',
            borderRadius: '10px',
            padding: '0.875rem 1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem',
          }}
        >
          <span style={{ color: 'rgba(226, 232, 240, 0.95)', fontWeight: 600, fontSize: '0.9375rem' }}>
            Total Belanja
          </span>
          <span
            style={{
              color: '#22d3ee',
              fontWeight: 700,
              fontSize: '1.125rem',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {formatIDR(grandTotal)}
          </span>
        </div>

        {/* ── Checkout Button ── */}
        <button
          onClick={handleCheckout}
          style={{
            width: '100%',
            backgroundColor: '#0891b2', /* cyan-600 base */
            backgroundImage: 'linear-gradient(135deg, #0891b2, #06b6d4)',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.9375rem',
            padding: '0.8125rem 1rem',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 20px rgba(6, 182, 212, 0.25)',
            transition: 'all 0.2s ease',
            marginBottom: '0.875rem',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundImage = 'linear-gradient(135deg, #06b6d4, #22d3ee)';
            e.currentTarget.style.boxShadow = '0 4px 24px rgba(6, 182, 212, 0.40)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundImage = 'linear-gradient(135deg, #0891b2, #06b6d4)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(6, 182, 212, 0.25)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <ArrowRightIcon />
          Lanjut ke Pembayaran
        </button>

        {/* ── Trust Badges ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
          }}
        >
          <TrustBadge icon="🔒" label="Aman & Terenkripsi" />
          <span style={{ color: 'rgba(51, 65, 85, 0.8)', fontSize: '0.625rem' }}>•</span>
          <TrustBadge icon="🚚" label="Pengiriman Cepat" />
        </div>
      </div>
    </div>
  );
};

const TrustBadge = ({ icon, label }) => (
  <span
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      color: 'rgba(100, 116, 139, 0.8)',
      fontSize: '0.6875rem',
    }}
  >
    <span style={{ fontSize: '0.75rem' }}>{icon}</span>
    {label}
  </span>
);

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

export default CartSummary;
