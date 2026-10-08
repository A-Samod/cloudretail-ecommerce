import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { catalogAPI, inventoryAPI } from '../services/api';
import './ProductDetailPage.css';

function ProductDetailPage({ addToCart }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProduct();
    loadInventory();
  }, [id]);

  const loadProduct = async () => {
    try {
      const response = await catalogAPI.getProduct(id);
      const productData = response.data.data;
      setProduct(productData);
      setError('');
    } catch (err) {
      setError('Failed to load product details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadInventory = async () => {
    try {
      const response = await inventoryAPI.getStock(id);
      setInventory(response.data.data);
    } catch (err) {
      console.error('Failed to load inventory:', err);
    }
  };

  const handleAddToCart = () => {
    if (quantity > 0 && quantity <= (inventory?.availableQty || 0)) {
      addToCart(product, quantity);
      alert(`${product.name} (${quantity}) added to cart!`);
      navigate('/cart');
    } else {
      alert('Invalid quantity');
    }
  };

  if (loading) {
    return <div className="loading">Loading product...</div>;
  }

  if (error || !product) {
    return <div className="error">{error || 'Product not found'}</div>;
  }

  const availableStock = inventory?.availableQty || 0;
  const isInStock = availableStock > 0;

  return (
    <div className="product-detail-page">
      <button onClick={() => navigate('/products')} className="btn-back">
        ← Back to Products
      </button>

      <div className="product-detail-container">
        <div className="product-images">
          <img
            src={product.images?.[0] || 'https://via.placeholder.com/500'}
            alt={product.name}
            className="main-image"
          />
        </div>

        <div className="product-details">
          <h1 className="product-title">{product.name}</h1>
          
          <div className="product-info-card">
            <div className="info-row">
              <span className="info-label">SKU:</span>
              <span className="info-value">{product.sku}</span>
            </div>
            
            {product.brand && (
              <div className="info-row">
                <span className="info-label">Brand:</span>
                <span className="info-value">{product.brand}</span>
              </div>
            )}
            
            {product.category && (
              <div className="info-row">
                <span className="info-label">Category:</span>
                <span className="info-value">{product.category}</span>
              </div>
            )}
            
            <div className="info-row description-row">
              <span className="info-label">Description:</span>
              <div className="info-description">{product.description || 'No description available'}</div>
            </div>
          </div>

          <div className="product-price-section">
            <span className="price">${parseFloat(product.price).toFixed(2)}</span>
            {product.compareAtPrice && (
              <span className="compare-price">
                ${parseFloat(product.compareAtPrice).toFixed(2)}
              </span>
            )}
          </div>

          <div className="stock-info">
            {isInStock ? (
              <>
                <span className="stock-badge in-stock">In Stock</span>
                <span className="stock-quantity">
                  {availableStock} units available
                </span>
                {availableStock < 10 && (
                  <span className="stock-warning">⚠️ Low Stock!</span>
                )}
              </>
            ) : (
              <span className="stock-badge out-of-stock">Out of Stock</span>
            )}
          </div>

          {isInStock && (
            <div className="quantity-selector">
              <label>Quantity:</label>
              <div className="quantity-controls">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="qty-btn"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.min(availableStock, Math.max(1, parseInt(e.target.value) || 1)))
                  }
                  min="1"
                  max={availableStock}
                  className="qty-input"
                />
                <button
                  onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                  className="qty-btn"
                >
                  +
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleAddToCart}
            disabled={!isInStock}
            className="btn-primary btn-add-cart-large"
          >
            {isInStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;
