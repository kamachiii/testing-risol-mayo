// src/pages/CartPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';
import CartEmpty from '../components/cart/CartEmpty';

// Komponen utama menerima props dari App.jsx
const CartPage = ({ cartItems, onQuantityChange, onRemove, onNavigate }) => {
  
  // Hitung total harga otomatis
  const totalPrice = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cartItems]);

  return (
    <main style={{ maxWidth: '1152px', margin: '0 auto', padding: '2rem 1.5rem', width: '100%', boxSizing: 'border-box', flexGrow: 1 }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#f8fafc', margin: '0 0 0.5rem 0' }}>
          Keranjang Belanja
        </h1>
        <p style={{ color: '#94a3b8', margin: 0 }}>
          {cartItems.length} {cartItems.length === 1 ? 'varian' : 'varian'} dalam keranjang
        </p>
      </div>

      {cartItems.length === 0 ? (
        // Oper onNavigate ke CartEmpty agar bisa kembali ke Home
        <CartEmpty onNavigate={onNavigate} /> 
      ) : (
        <CartLayout>
          {/* Kolom Kiri: Daftar Belanjaan */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Header kecil untuk aksi massal */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
               <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Daftar Item</span>
            </div>

            {cartItems.map((item) => (
              <CartItem
                key={item.product_id}
                item={item}
                onQuantityChange={onQuantityChange}
                onRemove={onRemove}
              />
            ))}
          </div>

          {/* Kolom Kanan: Ringkasan Harga (Sticky) */}
          <CartSummary cartItems={cartItems} totalPrice={totalPrice} />
        </CartLayout>
      )}
    </main>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CartLayout — Pembungkus 2 Kolom Responsif (Bawaan Claude)
// ─────────────────────────────────────────────────────────────────────────────
const CartLayout = ({ children }) => {
  const [columns, setColumns] = useState(
    typeof window !== 'undefined' && window.innerWidth >= 1024 ? '70% 30%' : '1fr'
  );

  useEffect(() => {
    const handleResize = () => setColumns(window.innerWidth >= 1024 ? '70% 30%' : '1fr');
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: columns, gap: '1.5rem', alignItems: 'start' }}>
      {children}
    </div>
  );
};

export default CartPage;