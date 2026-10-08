import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { getProductById } from '../../services/api';
import LoginModal from '../../components/auth/LoginModal';
import Header from '../../components/Header';
import './ProductDetailPage.css';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const productData = await getProductById(id);
      setProduct(productData);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    addToCart(product, quantity);
    navigate('/cart');
  };

  if (loading) return (
    <div>
      <Header />
      <div style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Loading...
      </div>
    </div>
  );
  
  if (!product) return (
    <div>
      <Header />
      <div style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Product not found
      </div>
    </div>
  );

  // Handle images - can be array or string
  let images = [];
  if (product.images) {
    if (Array.isArray(product.images)) {
      images = product.images;
    } else if (typeof product.images === 'string') {
      try {
        // Try to parse if it's a JSON string
        images = JSON.parse(product.images);
      } catch {
        // If it's a comma-separated string or single URL
        images = product.images.split(',').map(img => img.trim());
      }
    }
  }

  return (
    <div className="product-detail-page">
      <Header />

      {/* Product Details */}
      <div className="product-detail-container">
        <Link to="/" className="back-link">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </Link>

        <div className="product-detail-grid">
          {/* Images */}
          <div className="product-images">
            <div className="main-image">
              <img
                src={images[0] || '/placeholder.jpg'}
                alt={product.name}
              />
            </div>
            {images.length > 1 && (
              <div className="thumbnail-grid">
                {images.slice(1, 4).map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`${product.name} ${idx + 2}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="product-details">
            <h1 className="product-title">{product.name}</h1>
            <p className="product-price">
              ${parseFloat(product.price).toFixed(2)}
            </p>

            <div className="product-description">
              <h3>Description</h3>
              <p>{product.description || 'No description available.'}</p>
            </div>

            <div className="product-meta">
              <p><span>SKU:</span> {product.sku}</p>
              <p><span>Brand:</span> {product.brand || 'N/A'}</p>
              <p><span>Category:</span> {product.categoryName || product.category}</p>
            </div>

            {/* Quantity */}
            <div className="quantity-selector">
              <label>Quantity</label>
              <div className="quantity-controls">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="quantity-btn"
                >
                  -
                </button>
                <span className="quantity-value">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="quantity-btn"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="add-to-cart-btn"
            >
              Add to cart
            </button>

            {!isAuthenticated && (
              <p className="login-notice">
                Please log in to add items to cart
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </div>
  );
};

export default ProductDetailPage;
