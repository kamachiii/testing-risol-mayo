import React from 'react';

// -- KOMPONEN KARTU PRODUK --
const ProductCard = ({ product, onAddToCart }) => {
  const formatIDR = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  return (
    <div style={{
      backgroundColor: 'rgba(30, 41, 59, 0.7)', borderRadius: '14px', border: '1px solid rgba(71, 85, 105, 0.4)',
      overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s'
    }}>
      <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: '600', marginBottom: '4px' }}>{product.category}</span>
        <h4 style={{ margin: '0 0 0.5rem 0', color: '#f8fafc', fontSize: '1.1rem' }}>{product.name}</h4>
        <p style={{ margin: '0 0 1rem 0', color: '#cbd5e1', fontWeight: 'bold', fontSize: '1.2rem' }}>{formatIDR(product.price)}</p>
        
        {/* Tombol Tambah ke Keranjang */}
        <button 
          onClick={() => onAddToCart(product)}
          style={{
            marginTop: 'auto', padding: '0.75rem', borderRadius: '8px', border: 'none',
            backgroundColor: '#f59e0b', color: '#fff', fontWeight: 'bold', cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d97706'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f59e0b'}
        >
          + Tambah ke Keranjang
        </button>
      </div>
    </div>
  );
};

// -- KOMPONEN GRID LIST --
export default function ProductList({ products, onAddToCart }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem'
    }}>
      {products.map(product => (
        <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
      ))}
    </div>
  );
}