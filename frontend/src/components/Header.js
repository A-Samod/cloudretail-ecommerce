import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getCategories } from '../services/api';
import LoginModal from './auth/LoginModal';
import './Header.css';

function Header() {
  const { cart } = useContext(CartContext);
  const { user, logout } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [initialTab, setInitialTab] = useState('login');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  const cartItemsCount = cart?.reduce((total, item) => total + (item.quantity || 1), 0) || 0;

  useEffect(() => {
    // Load categories from API
    getCategories().then(cats => {
      setCategories(cats || []);
    });
  }, []);

  const handleLoginClick = () => {
    setInitialTab('login');
    setShowLoginModal(true);
  };

  const handleSignupClick = () => {
    setInitialTab('signup');
    setShowLoginModal(true);
  };

  const handleCartClick = (e) => {
    if (!user) {
      e.preventDefault();
      setInitialTab('login');
      setShowLoginModal(true);
    }
  };

  const handleLogout = () => {
    logout();
    setShowProfileDropdown(false);
    navigate('/');
  };

  return (
    <>
      <header className="header">
        <div className="header-container">
          <div className="header-top">
            <Link to="/" className="logo">
              <h1>CloudRetail</h1>
            </Link>
            
            <div className="header-actions">
              <Link to="/cart" className="cart-icon" onClick={handleCartClick}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="9" cy="21" r="1" fill="currentColor" stroke="none"/>
                  <circle cx="20" cy="21" r="1" fill="currentColor" stroke="none"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {cartItemsCount > 0 && (
                  <span className="cart-badge">{cartItemsCount}</span>
                )}
              </Link>
              
              {user ? (
                <div className="profile-dropdown-wrapper">
                  <button 
                    className="profile-icon-btn" 
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </button>
                  
                  {showProfileDropdown && (
                    <>
                      <div 
                        className="dropdown-overlay" 
                        onClick={() => setShowProfileDropdown(false)}
                      />
                      <div className="profile-dropdown">
                        <div className="dropdown-header">
                          <div className="user-email">{user.email}</div>
                        </div>
                        <Link 
                          to="/profile" 
                          className="dropdown-item"
                          onClick={() => setShowProfileDropdown(false)}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Profile
                        </Link>
                        <Link 
                          to="/orders" 
                          className="dropdown-item"
                          onClick={() => setShowProfileDropdown(false)}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                          My Orders
                        </Link>
                        <button 
                          className="dropdown-item logout-item"
                          onClick={handleLogout}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Log out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <button className="btn-secondary" onClick={handleSignupClick}>
                    Sign up
                  </button>
                  <button className="btn-secondary" onClick={handleLoginClick}>
                    Log in
                  </button>
                </>
              )}
            </div>
          </div>
          
          <nav className="header-nav">
            {categories.map((category) => (
              <Link 
                key={category.id} 
                to={`/products?category=${category.slug}`}
                className="nav-link"
              >
                {category.name}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      
      {showLoginModal && (
        <LoginModal 
          initialTab={initialTab}
          onClose={() => setShowLoginModal(false)} 
        />
      )}
    </>
  );
}

export default Header;
