import React from 'react';

export default function SidebarFilter() {
  const categories = ['Semua Produk', 'Siap Saji', 'Frozen', 'Paket Box'];

  return (
    <aside style={{ backgroundColor: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(10px)', borderRadius: '14px', border: '1px solid rgba(71, 85, 105, 0.4)', padding: '1.5rem' }}>
      <h3 style={{ color: '#f1f5f9', fontSize: '1.1rem', borderBottom: '1px solid rgba(71, 85, 105, 0.4)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>Kategori</h3>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {categories.map((cat, idx) => (
          <li key={idx}>
            <a href="#" style={{ 
              color: idx === 0 ? '#f59e0b' : '#94a3b8', 
              textDecoration: 'none', fontWeight: idx === 0 ? '600' : '400',
              transition: 'color 0.2s'
            }}>{cat}</a>
          </li>
        ))}
      </ul>
    </aside>
  );
}