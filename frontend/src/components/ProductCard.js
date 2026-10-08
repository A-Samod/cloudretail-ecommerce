import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { inventoryAPI } from '../services/api';
import './ProductCard.css';

function ProductCard({ product }) {
  const [stockInfo, setStockInfo] = useState(null);
  
  useEffect(() => {
    const fetchStock = async () => {
      try {
        const response = await inventoryAPI.getStock(product.id);
        setStockInfo(response.data.data);
      } catch (error) {
        // If 404 or error, stock info remains null (out of stock)
        setStockInfo(null);
      }
    };
    
    fetchStock();
  }, [product.id]);
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
  
  // Create a rating based on product features (for visual consistency)
  const rating = product.isFeatured ? 5 : 4;
  
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'star filled' : 'star'}>
        ★
      </span>
    ));
  };
  
  const isInStock = stockInfo && stockInfo.availableQty > 0;
  const isLowStock = stockInfo && stockInfo.availableQty > 0 && stockInfo.availableQty < 10;
  
  return (
    <Link to={`/product/${product.id}`} className="product-card">
      <div className="product-image">
        <img src={images[0] || '/placeholder.jpg'} alt={product.name} />
        {isLowStock && (
          <div className="low-stock-badge">Low Stock</div>
        )}
        {!isInStock && (
          <div className="out-of-stock-badge">Out of Stock</div>
        )}
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-seller">{product.brand}</p>
        <div className="product-rating">
          {renderStars(rating)}
        </div>
        <div className="product-footer">
          <p className="product-price">${product.price}</p>
          {isInStock && (
            <span className="stock-indicator in-stock">✓ In Stock</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
