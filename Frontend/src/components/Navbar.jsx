// src/components/Navbar.jsx
import React from 'react';

/**
 * Navbar — Global header component.
 * Props:
 * - totalItems (number): Total item count in cart, drives the badge.
 * - onNavigate (fn): Function to switch pages ('home' or 'cart')
 */
const Navbar = ({ totalItems = 0, onNavigate }) => {
  const navLinks = [
    { label: 'Beranda', page: 'home' },
    { label: 'Produk', page: 'home' },
    { label: 'Tentang Kami', page: 'home' },
  ];

  return (
    <nav
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(51, 65, 85, 0.5)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: '1152px',
          margin: '0 auto',
          padding: '0 1.5rem',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* ── Logo (Klik untuk ke Home) ── */}
        <a 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            onNavigate('home');
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
        >
          <span
            style={{
              fontSize: '1.375rem',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              background: 'linear-gradient(to right, #f59e0b, #fbbf24)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Risol Mayo
          </span>
          <span style={{ color: '#06b6d4', fontSize: '1.25rem', fontWeight: 'bold' }}>.</span>
        </a>

        {/* ── Nav Links ── */}
        <div
          className="nav-links"
          style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}
        >
          {navLinks.map((link, idx) => (
            <a
              key={idx}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onNavigate(link.page);
              }}
              style={{
                color: 'rgba(203, 213, 225, 0.8)',
                fontSize: '0.9375rem',
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#f59e0b')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(203, 213, 225, 0.8)')}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* ── Cart Icon Button (Klik untuk ke Halaman Cart) ── */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('cart');
          }}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(71, 85, 105, 0.3)',
            transition: 'all 0.2s ease',
            textDecoration: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.8)';
            e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.5)';
            e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.3)';
          }}
        >
          <CartIcon />

          {/* Badge Jumlah Item */}
          {totalItems > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                backgroundColor: '#f59e0b',
                color: '#0f172a',
                fontSize: '0.6875rem',
                fontWeight: 700,
                minWidth: '18px',
                height: '18px',
                borderRadius: '10px',
                padding: '0 4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1,
                boxShadow: '0 0 0 2px #0f172a',
                animation: 'badgePop 0.25s ease-out',
              }}
            >
              {totalItems > 99 ? '99+' : totalItems}
            </span>
          )}
        </a>
      </div>

      {/* Inline keyframe untuk animasi badge */}
      <style>{`
        @keyframes badgePop {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        @media (max-width: 640px) {
          .nav-links { display: none; }
        }
      `}</style>
    </nav>
  );
};

/* ── Inline SVG cart icon ── */
const CartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    fill="none"
    viewBox="0 0 24 24"
    stroke="rgba(203, 213, 225, 0.9)"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="8" cy="21" r="1" />
    <circle cx="19" cy="21" r="1" />
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
  </svg>
);

export default Navbar;