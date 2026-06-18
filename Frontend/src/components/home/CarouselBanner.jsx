import React from 'react';

export default function CarouselBanner() {
  return (
    <div style={{ 
      width: '100%', height: '250px', borderRadius: '16px', 
      background: 'linear-gradient(135deg, #1e293b, #0f172a)',
      border: '1px solid rgba(245, 158, 11, 0.3)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden'
    }}>
      {/* Efek cahaya */}
      <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%)', borderRadius: '50%' }} />
      
      <h2 style={{ color: '#f59e0b', fontSize: '2rem', marginBottom: '0.5rem' }}>Promo Spesial Hari Ini!</h2>
      <p style={{ color: '#cbd5e1', fontSize: '1.1rem' }}>Beli 5 Risol Mayo varian apa saja, Gratis Ongkir se-Depok.</p>
    </div>
  );
}