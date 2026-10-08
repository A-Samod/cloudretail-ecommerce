import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import ProductCard from '../../components/ProductCard';
import { getFeaturedProducts, getCategories } from '../../services/api';
import './HomePage.css';

function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Load featured products from API
    getFeaturedProducts(10).then(products => {
      setFeaturedProducts(products || []);
    });

    // Load categories from API
    getCategories().then(cats => {
      setCategories(cats || []);
    });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="home-page">
      <Header />
      
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Discover Premium Apple Products</h1>
          <p className="hero-subtitle">iPhone, MacBook, AirPods and more</p>
          
          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="What are you looking for?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>

          {/* Category Pills */}
          <div className="category-pills">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => navigate(`/products?category=${category.slug}`)}
                className="category-pill"
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Products Section */}
      <div className="featured-section">
        <h2>Featured Products</h2>
        <div className="products-grid">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
