// src/App.jsx
import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CartPage from './pages/CartPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [cartItems, setCartItems] = useState([]);

  // Fungsi menambah ke keranjang dari Home
  const addToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product_id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          cart_id: Date.now(), // dummy id
          product_id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image_url: product.image_url,
        },
      ];
    });
  };

  // Fungsi manipulasi keranjang dari CartPage
  const handleQuantityChange = (productId, action) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.product_id === productId) {
          if (action === 'increase') return { ...item, quantity: item.quantity + 1 };
          if (action === 'decrease' && item.quantity > 1)
            return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.product_id !== productId));
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#0f172a', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif' }}>
      <Navbar totalItems={totalItems} onNavigate={setCurrentPage} />
      
      {/* Simple Routing */}
      {currentPage === 'home' && <HomePage onAddToCart={addToCart} />}
      {currentPage === 'cart' && (
        <CartPage 
          cartItems={cartItems} 
          onQuantityChange={handleQuantityChange} 
          onRemove={handleRemoveItem} 
          onNavigate={setCurrentPage}
        />
      )}

      <Footer />
    </div>
  );
}