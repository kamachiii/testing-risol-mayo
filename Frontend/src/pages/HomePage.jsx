import React from 'react';
import CarouselBanner from '../components/home/CarouselBanner';
import SidebarFilter from '../components/home/SidebarFilter';
import ProductList from '../components/home/ProductList';

// Mock Data Produk
const mockProducts = [
  { id: 101, name: "Risol Mayo Original", price: 5000, category: "Siap Saji", image_url: "https://via.placeholder.com/200/1e293b/f59e0b?text=Risol+Ori" },
  { id: 102, name: "Risol Premium Cheese", price: 7000, category: "Siap Saji", image_url: "https://via.placeholder.com/200/1e293b/f59e0b?text=Risol+Cheese" },
  { id: 103, name: "Risol Beef Bolognese", price: 8000, category: "Siap Saji", image_url: "https://via.placeholder.com/200/1e293b/f59e0b?text=Risol+Beef" },
  { id: 104, name: "Risol Mayo Frozen (Isi 5)", price: 23000, category: "Frozen", image_url: "https://via.placeholder.com/200/1e293b/f59e0b?text=Frozen+Pack" },
  { id: 105, name: "Risol Smoked Beef", price: 7500, category: "Siap Saji", image_url: "https://via.placeholder.com/200/1e293b/f59e0b?text=Smoked+Beef" },
];

export default function HomePage({ onAddToCart }) {
  // TODO: Temanmu nanti akan mengganti mockProducts ini dengan fetch() / axios ke backend API Produk

  return (
    <main style={{ maxWidth: '1152px', margin: '0 auto', padding: '1.5rem', width: '100%', boxSizing: 'border-box' }}>
      <CarouselBanner />
      
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 25%) 1fr', gap: '2rem', marginTop: '2rem', alignItems: 'start' }}>
        <SidebarFilter />
        <ProductList products={mockProducts} onAddToCart={onAddToCart} />
      </div>
    </main>
  );
}