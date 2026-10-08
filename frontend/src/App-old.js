import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import './App.css';

// Components
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  const [cart, setCart] = useState([]);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Cart functions
  const addToCart = (product, quantity = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prevCart, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => (item.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Router>
      <div className="App">
        <Authenticator>
          {({ signOut, user }) => (
            <>
              {/* Navigation Bar */}
              <nav className="navbar">
                <div className="nav-container">
                  <Link to="/" className="nav-logo">
                    <h1>CloudRetail</h1>
                  </Link>
                  <ul className="nav-menu">
                    <li className="nav-item">
                      <Link to="/" className="nav-link">
                        Home
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link to="/products" className="nav-link">
                        Products
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link to="/orders" className="nav-link">
                        My Orders
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link to="/profile" className="nav-link">
                        Profile
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link to="/cart" className="nav-link cart-link">
                        Cart ({cartCount})
                      </Link>
                    </li>
                    <li className="nav-item">
                      <button onClick={signOut} className="nav-link btn-signout">
                        Sign Out
                      </button>
                    </li>
                  </ul>
                  <div className="nav-user">
                    <span>Welcome, {user.username}</span>
                  </div>
                </div>
              </nav>

              {/* Routes */}
              <div className="main-content">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route
                    path="/products"
                    element={<ProductsPage addToCart={addToCart} />}
                  />
                  <Route
                    path="/products/:id"
                    element={<ProductDetailPage addToCart={addToCart} />}
                  />
                  <Route
                    path="/cart"
                    element={
                      <CartPage
                        cart={cart}
                        updateQuantity={updateCartQuantity}
                        removeItem={removeFromCart}
                        cartTotal={cartTotal}
                      />
                    }
                  />
                  <Route
                    path="/checkout"
                    element={
                      <CheckoutPage
                        cart={cart}
                        cartTotal={cartTotal}
                        clearCart={clearCart}
                        user={user}
                      />
                    }
                  />
                  <Route path="/orders" element={<OrdersPage user={user} />} />
                  <Route path="/profile" element={<ProfilePage user={user} />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </div>

              {/* Footer */}
              <footer className="footer">
                <p>&copy; 2024 CloudRetail. All rights reserved.</p>
              </footer>
            </>
          )}
        </Authenticator>
      </div>
    </Router>
  );
}

export default App;
