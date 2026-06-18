// src/components/cart/CartItem.jsx
import React from 'react';

/**
 * CartItem — Displays a single product row in the cart.
 *
 * Props:
 *  - item         (object): Cart item data (cart_id, product_id, name, price, quantity, image_url)
 *  - onQuantityChange (fn): (productId, 'increase' | 'decrease') => void
 *  - onRemove         (fn): (productId) => void
 */

// ── Utility: format number as IDR currency ──────────────────────────────────
const formatIDR = (amount) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);

// ── Styles shared across quantity buttons ───────────────────────────────────
const qtyBtnBase = {
  width: '32px',
  height: '32px',
  borderRadius: '8px',
  border: '1px solid rgba(71, 85, 105, 0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.125rem',
  fontWeight: 600,
  lineHeight: 1,
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  backgroundColor: 'rgba(30, 41, 59, 0.8)',
  color: 'rgba(226, 232, 240, 0.9)',
  userSelect: 'none',
};

const CartItem = ({ item, onQuantityChange, onRemove }) => {
  const subtotal = item.price * item.quantity;
  const isMinQty = item.quantity <= 1;

  return (
    <article
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        backgroundColor: 'rgba(30, 41, 59, 0.65)',
        border: '1px solid rgba(71, 85, 105, 0.35)',
        borderLeft: '3px solid #f59e0b', /* amber — signature warm accent */
        borderRadius: '12px',
        padding: '1rem',
        transition: 'border-color 0.2s ease, background-color 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.85)';
        e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.5)';
        e.currentTarget.style.borderLeftColor = '#fbbf24';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.65)';
        e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.35)';
        e.currentTarget.style.borderLeftColor = '#f59e0b';
      }}
    >
      {/* ── Product Image ── */}
      <div
        style={{
          flexShrink: 0,
          width: '80px',
          height: '80px',
          borderRadius: '10px',
          overflow: 'hidden',
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(51, 65, 85, 0.5)',
        }}
      >
        <img
          src={item.image_url}
          alt={item.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            e.target.src = 'https://placehold.co/80x80/1e293b/f59e0b?text=🥐';
          }}
        />
      </div>

      {/* ── Product Info ── */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3
          style={{
            color: 'rgba(226, 232, 240, 0.95)',
            fontWeight: 600,
            fontSize: '0.9375rem',
            margin: '0 0 4px 0',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {item.name}
        </h3>

        <p
          style={{
            color: '#f59e0b',
            fontWeight: 600,
            fontSize: '0.8125rem',
            margin: '0 0 8px 0',
          }}
        >
          {formatIDR(item.price)}&nbsp;<span style={{ color: 'rgba(100, 116, 139, 0.9)', fontWeight: 400 }}>/ pcs</span>
        </p>

        {/* Subtotal badge */}
        <p
          style={{
            color: 'rgba(148, 163, 184, 0.8)',
            fontSize: '0.75rem',
            margin: 0,
          }}
        >
          Subtotal:{' '}
          <span style={{ color: '#22d3ee', fontWeight: 600 }}>
            {formatIDR(subtotal)}
          </span>
        </p>
      </div>

      {/* ── Quantity Stepper ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexShrink: 0,
        }}
        role="group"
        aria-label={`Jumlah ${item.name}`}
      >
        {/* Minus button */}
        <button
          onClick={() => onQuantityChange(item.product_id, 'decrease')}
          disabled={isMinQty}
          aria-label="Kurangi jumlah"
          style={{
            ...qtyBtnBase,
            opacity: isMinQty ? 0.35 : 1,
            cursor: isMinQty ? 'not-allowed' : 'pointer',
          }}
          onMouseEnter={(e) => {
            if (!isMinQty) {
              e.currentTarget.style.backgroundColor = 'rgba(34, 211, 238, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.4)';
              e.currentTarget.style.color = '#22d3ee';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.8)';
            e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.6)';
            e.currentTarget.style.color = 'rgba(226, 232, 240, 0.9)';
          }}
        >
          −
        </button>

        {/* Quantity display */}
        <span
          style={{
            minWidth: '28px',
            textAlign: 'center',
            color: 'rgba(226, 232, 240, 0.95)',
            fontWeight: 700,
            fontSize: '0.9375rem',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {item.quantity}
        </span>

        {/* Plus button */}
        <button
          onClick={() => onQuantityChange(item.product_id, 'increase')}
          aria-label="Tambah jumlah"
          style={qtyBtnBase}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(34, 211, 238, 0.15)';
            e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.4)';
            e.currentTarget.style.color = '#22d3ee';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.8)';
            e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.6)';
            e.currentTarget.style.color = 'rgba(226, 232, 240, 0.9)';
          }}
        >
          +
        </button>
      </div>

      {/* ── Remove Button ── */}
      <button
        onClick={() => onRemove(item.product_id)}
        aria-label={`Hapus ${item.name} dari keranjang`}
        style={{
          flexShrink: 0,
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          border: '1px solid transparent',
          backgroundColor: 'transparent',
          color: 'rgba(100, 116, 139, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          marginLeft: '4px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(248, 113, 113, 0.1)';
          e.currentTarget.style.borderColor = 'rgba(248, 113, 113, 0.3)';
          e.currentTarget.style.color = '#f87171';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.borderColor = 'transparent';
          e.currentTarget.style.color = 'rgba(100, 116, 139, 0.7)';
        }}
      >
        <TrashIcon />
      </button>
    </article>
  );
};

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
  </svg>
);

export default CartItem;
