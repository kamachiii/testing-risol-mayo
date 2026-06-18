// src/components/cart/CartEmpty.jsx
import React from 'react';

/**
 * CartEmpty — Friendly empty-state screen shown when cart has no items.
 * Includes an inline SVG illustration and a "Kembali Belanja" CTA.
 */
const CartEmpty = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '5rem 1rem',
        textAlign: 'center',
      }}
    >
      {/* ── SVG Illustration ── */}
      <div
        style={{
          position: 'relative',
          marginBottom: '2rem',
        }}
      >
        {/* Glow ring behind the cart */}
        <div
          style={{
            position: 'absolute',
            inset: '-16px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Cart circle container */}
        <div
          style={{
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            backgroundColor: 'rgba(30, 41, 59, 0.7)',
            border: '1px solid rgba(71, 85, 105, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <EmptyCartSVG />
        </div>

        {/* Floating emoji badge */}
        <div
          style={{
            position: 'absolute',
            bottom: '-4px',
            right: '-4px',
            width: '42px',
            height: '42px',
            backgroundColor: '#1e293b',
            border: '2px solid rgba(71, 85, 105, 0.6)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          }}
        >
          😔
        </div>
      </div>

      {/* ── Heading ── */}
      <h2
        style={{
          color: 'rgba(226, 232, 240, 0.95)',
          fontWeight: 700,
          fontSize: '1.375rem',
          margin: '0 0 0.5rem 0',
          letterSpacing: '-0.01em',
        }}
      >
        Keranjangmu masih kosong
      </h2>

      {/* ── Description ── */}
      <p
        style={{
          color: 'rgba(100, 116, 139, 0.9)',
          fontSize: '0.9375rem',
          lineHeight: 1.6,
          maxWidth: '300px',
          margin: '0 0 2.25rem 0',
        }}
      >
        Yuk, pilih Risol Mayo favoritmu dan tambahkan ke keranjang sekarang!
      </p>

      {/* ── Suggestion chips ── */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {['🥐 Risol Original', '🧀 Risol Cheese', '🌶️ Risol Pedas'].map((label) => (
          <span
            key={label}
            style={{
              padding: '0.375rem 0.875rem',
              backgroundColor: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              borderRadius: '999px',
              color: 'rgba(251, 191, 36, 0.85)',
              fontSize: '0.8125rem',
              fontWeight: 500,
            }}
          >
            {label}
          </span>
        ))}
      </div>

      {/* ── CTA Button ── */}
      <a
        href="/products"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: 'transparent',
          border: '1.5px solid rgba(34, 211, 238, 0.5)',
          color: '#22d3ee',
          fontWeight: 600,
          fontSize: '0.9375rem',
          padding: '0.75rem 1.75rem',
          borderRadius: '10px',
          textDecoration: 'none',
          transition: 'all 0.2s ease',
          boxShadow: '0 0 0 0 rgba(34, 211, 238, 0)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(34, 211, 238, 0.1)';
          e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.8)';
          e.currentTarget.style.boxShadow = '0 0 20px rgba(34, 211, 238, 0.12)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.5)';
          e.currentTarget.style.boxShadow = '0 0 0 0 rgba(34, 211, 238, 0)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <ArrowLeftIcon />
        Kembali Belanja
      </a>
    </div>
  );
};

/* ── Empty cart SVG illustration ── */
const EmptyCartSVG = () => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Cart body */}
    <path
      d="M6 8h6l6 32h28l5-20H18"
      stroke="rgba(71, 85, 105, 0.7)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Wheels */}
    <circle cx="24" cy="46" r="3.5" stroke="rgba(71, 85, 105, 0.7)" strokeWidth="2.5" />
    <circle cx="44" cy="46" r="3.5" stroke="rgba(71, 85, 105, 0.7)" strokeWidth="2.5" />
    {/* Handle */}
    <path
      d="M6 8H3"
      stroke="rgba(71, 85, 105, 0.7)"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* "Empty" X mark inside cart */}
    <path
      d="M30 22l8 8M38 22l-8 8"
      stroke="rgba(100, 116, 139, 0.5)"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Amber dot accent */}
    <circle cx="50" cy="14" r="5" fill="rgba(245, 158, 11, 0.15)" stroke="rgba(245, 158, 11, 0.3)" strokeWidth="1.5" />
    <path d="M50 11v3M50 17h.01" stroke="rgba(245, 158, 11, 0.6)" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

export default CartEmpty;
