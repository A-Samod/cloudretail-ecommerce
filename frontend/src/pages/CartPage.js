import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './CartPage.css';

function CartPage() {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, getCartTotal, updateCartQuantity } = useCart();
  const cartTotal = getCartTotal();

  const handleQuantityChange = (item, change) => {
    const newQuantity = item.quantity + change;
    if (newQuantity > 0) {
      updateCartQuantity(item.id, newQuantity);
    }
  };

  const handleRemoveItem = (itemId) => {
    const index = cart.findIndex(item => item.id === itemId);
    if (index !== -1) {
      removeFromCart(index);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-content">
          <div className="cart-main-header">
            <Link to="/" className="cart-logo">
              <h1>Sellerlist</h1>
            </Link>
            <div className="cart-auth-buttons">
              <button className="signup-btn-cart">Sign up</button>
              <button className="login-btn-cart">Log in</button>
            </div>
          </div>
          <div className="empty-cart-container">
            <h2>Your cart is empty</h2>
            <p>Add some items to get started</p>
            <button onClick={() => navigate('/products')} className="btn-primary">
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-content">
        <div className="cart-main-header">
          <Link to="/" className="cart-logo">
            <h1>Sellerlist</h1>
          </Link>
          <div className="cart-auth-buttons">
            <button className="signup-btn-cart">Sign up</button>
            <button className="login-btn-cart">Log in</button>
          </div>
        </div>

        <div className="cart-back">
          <Link to="/products" className="back-link">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Shopping
          </Link>
        </div>

        <div className="cart-container">
          <div className="cart-items-section">
            <h2 className="section-title">Shopping Cart ({cart.length} {cart.length === 1 ? 'item' : 'items'})</h2>

            <div className="cart-items-list">
              {cart.map((item) => {
                const images = item.images ? (typeof item.images === 'string' ? JSON.parse(item.images) : item.images) : [];
                const itemQuantity = item.quantity || 1;
                return (
                  <div key={item.id} className="cart-item-card">
                    <img
                      src={images[0] || 'https://via.placeholder.com/120'}
                      alt={item.name}
                      className="cart-item-img"
                    />
                    <div className="cart-item-details">
                      <h3 className="cart-item-name">{item.name}</h3>
                      <p className="cart-item-sku">SKU: {item.sku}</p>
                      <p className="cart-item-unit-price">${parseFloat(item.price).toFixed(2)} each</p>
                    </div>
                    <div className="cart-item-controls">
                      <div className="cart-qty-controls">
                        <button 
                          type="button" 
                          className="cart-qty-btn"
                          onClick={() => handleQuantityChange(item, -1)}
                        >
                          -
                        </button>
                        <span className="cart-qty-display">{itemQuantity}</span>
                        <button 
                          type="button" 
                          className="cart-qty-btn"
                          onClick={() => handleQuantityChange(item, 1)}
                        >
                          +
                        </button>
                      </div>
                      <p className="cart-item-total-price">${(parseFloat(item.price) * itemQuantity).toFixed(2)}</p>
                      <button 
                        type="button" 
                        className="cart-remove-btn"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="cart-summary-section">
            <h2 className="section-title">Order Summary</h2>
            <div className="cart-summary-card">
              <div className="summary-row-cart">
                <span>Subtotal ({cart.length} {cart.length === 1 ? 'item' : 'items'}):</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="summary-row-cart">
                <span>Shipping:</span>
                <span className="free-text">FREE</span>
              </div>
              <div className="summary-row-cart">
                <span>Estimated Tax:</span>
                <span>${(cartTotal * 0.1).toFixed(2)}</span>
              </div>
              <hr className="summary-divider" />
              <div className="summary-row-cart total-row-cart">
                <span>Total:</span>
                <span>${(cartTotal * 1.1).toFixed(2)}</span>
              </div>
              
              <button onClick={() => navigate('/checkout')} className="btn-checkout-main">
                Proceed to Checkout
              </button>
              <button onClick={() => navigate('/products')} className="btn-continue-shopping">
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartPage;
