import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import { getProducts, getCategories } from '../services/api';
import './ProductsPage.css';

function ProductsPage() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const category = searchParams.get('category');
  const searchQuery = searchParams.get('search');

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [category, searchQuery]);

  const loadProducts = async () => {
    setLoading(true);
    
    // Build query params
    const params = {};
    if (category) params.category = category;
    if (searchQuery) params.search = searchQuery;
    
    const result = await getProducts(params);
    setProducts(result.products || []);
    setLoading(false);
  };

  const loadCategories = async () => {
    const cats = await getCategories();
    setCategories(cats || []);
  };

  return (
    <div className="products-page">
      <Header />
      
      <div className="products-container">
        <div className="products-header">
          <h1>{category ? (categories.find(c => c.slug === category)?.name || category) : 'All Products'}</h1>
          <p>{loading ? 'Loading...' : `${products.length} items`}</p>
        </div>

        {loading ? (
          <div className="products-grid">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="skeleton-card">
                <div className="skeleton-image"></div>
                <div className="skeleton-content">
                  <div className="skeleton-title"></div>
                  <div className="skeleton-text"></div>
                  <div className="skeleton-price"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="products-grid">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {products.length === 0 && (
              <div className="no-products">
                <p>No products found</p>
                <Link to="/" className="btn-primary">Back to Home</Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ProductsPage;
