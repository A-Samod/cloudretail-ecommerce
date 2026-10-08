import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to CloudRetail</h1>
          <p className="hero-subtitle">
            Your one-stop shop for all your needs. Browse our amazing collection of products!
          </p>
          <Link to="/products">
            <button className="btn-primary btn-large">Shop Now</button>
          </Link>
        </div>
      </section>

      <section className="features-section">
        <h2>Why Shop With Us?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🚚</div>
            <h3>Fast Delivery</h3>
            <p>Get your orders delivered quickly and safely</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💳</div>
            <h3>Secure Payment</h3>
            <p>Your payments are safe and encrypted</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎁</div>
            <h3>Great Deals</h3>
            <p>Amazing discounts and offers every day</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔄</div>
            <h3>Easy Returns</h3>
            <p>Hassle-free returns within 30 days</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to Start Shopping?</h2>
        <p>Explore our catalog and find what you're looking for</p>
        <Link to="/products">
          <button className="btn-primary btn-large">Browse Products</button>
        </Link>
      </section>
    </div>
  );
}

export default HomePage;
