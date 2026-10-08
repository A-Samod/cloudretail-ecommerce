import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { orderAPI, paymentAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './CheckoutPage.css';

function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, clearCart, getCartTotal, updateCartQuantity, removeFromCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: '',
  });
  const [paymentInfo, setPaymentInfo] = useState({
    cardholderName: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
  });
  const [paymentFailed, setPaymentFailed] = useState(null);

  // Fetch user's saved address on component mount
  useEffect(() => {
    const fetchUserAddress = async () => {
      try {
        const response = await userAPI.getCurrentUser();
        const userData = response.data.data;
        
        // Pre-populate shipping info if user has saved address
        if (userData) {
          setShippingInfo({
            fullName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || '',
            address: userData.address || '',
            city: userData.city || '',
            state: userData.state || '',
            zipCode: userData.zipCode || '',
            country: userData.country || '',
            phone: userData.phone || '',
          });
        }
      } catch (error) {
        console.error('Error fetching user address:', error);
        // Continue with empty form if fetch fails
      }
    };

    if (user) {
      fetchUserAddress();
    }
  }, [user]);

  const cartTotal = getCartTotal();
  const shippingCost = shippingMethod === 'standard' ? 1.99 : 0;
  const total = cartTotal + shippingCost;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuantityChange = (productId, change) => {
    const item = cart.find(item => item.id === productId);
    if (item) {
      const newQuantity = item.quantity + change;
      if (newQuantity > 0) {
        updateCartQuantity(productId, newQuantity);
      }
    }
  };

  const handleRemoveItem = (productId) => {
    const index = cart.findIndex(item => item.id === productId);
    if (index !== -1) {
      removeFromCart(index);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }

    setLoading(true);
    setError('');
    
    let createdOrder = null;

    try {
      // Create order
      const orderData = {
        userId: user.userId || user.sub || user.username || 'guest-user',
        userEmail: user.email || user.attributes?.email || 'guest@example.com',
        items: cart.map((item) => ({
          productId: item.id,
          productSku: item.sku,
          productName: item.name,
          quantity: item.quantity,
          price: parseFloat(item.price),
        })),
        shippingAddress: shippingInfo,
      };

      const orderResponse = await orderAPI.createOrder(orderData);
      const order = orderResponse.data.data;
      createdOrder = order; // Store order for use in catch block

      // Process payment with actual form values
      const paymentData = {
        orderId: order.id,
        orderNumber: order.orderNumber,
        userId: user.userId || user.username,
        amount: parseFloat(order.totalAmount),
        paymentMethod: 'CREDIT_CARD',
        cardNumber: paymentInfo.cardNumber.replace(/\s/g, ''), // Remove spaces
        cardExpiry: `${paymentInfo.expiryMonth}/${paymentInfo.expiryYear}`,
        cardCVV: paymentInfo.cvv,
      };

      const paymentResponse = await paymentAPI.processPayment(paymentData);
      const payment = paymentResponse.data.data;

      if (payment.status === 'SUCCESS') {
        // Clear cart and show success message
        clearCart();
        setOrderSuccess({
          orderNumber: order.orderNumber,
          orderId: order.id
        });
      } else if (payment.status === 'FAILED') {
        // Show failure popup only (don't set error message)
        setPaymentFailed({
          orderNumber: order.orderNumber,
          failureReason: payment.failureReason || 'Payment declined. Please try another card.'
        });
      } else {
        // Handle unexpected status
        console.warn('Unexpected payment status:', payment.status);
        setPaymentFailed({
          orderNumber: order.orderNumber,
          failureReason: payment.failureReason || 'Payment could not be processed.'
        });
      }
    } catch (err) {
      console.error('Checkout error:', err);
      
      // Check if this is a payment failure response (not a network error)
      if (err.response?.data?.data?.status === 'FAILED') {
        // Payment failed - show modal with the order number we created
        setPaymentFailed({
          orderNumber: createdOrder?.orderNumber || 'N/A',
          failureReason: err.response.data.data.failureReason || 'Payment declined. Please try another card.'
        });
      } else {
        // Only show error banner for unexpected errors (like network issues)
        setError(err.response?.data?.message || 'Failed to process order. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Don't show empty cart if order was successful
  if (cart.length === 0 && !orderSuccess) {
    return (
      <div className="checkout-page">
        <div className="checkout-content">
          <div className="checkout-main-header">
            <Link to="/" className="checkout-logo">
              <h1>CloudRetail</h1>
            </Link>
          </div>
          <div className="empty-checkout">
            <p>Your cart is empty</p>
            <button onClick={() => navigate('/products')} className="btn-primary">
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      {/* Success Modal */}
      {orderSuccess && (
        <div className="success-modal-overlay" onClick={() => navigate('/')}>
          <div className="success-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => navigate('/')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="success-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#10b981" strokeWidth="2" fill="none"/>
                <path d="M8 12l2 2 4-4" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2>Order Placed Successfully!</h2>
            <p className="order-number">Order Number: <strong>{orderSuccess.orderNumber}</strong></p>
            <div className="modal-buttons">
              <button 
                onClick={() => navigate('/orders')} 
                className="btn-primary"
              >
                View My Orders
              </button>
              <button 
                onClick={() => navigate('/')} 
                className="btn-secondary"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Failure Modal */}
      {paymentFailed && (
        <div className="success-modal-overlay" onClick={() => setPaymentFailed(null)}>
          <div className="success-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setPaymentFailed(null)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="failure-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2" fill="none"/>
                <path d="M15 9l-6 6m0-6l6 6" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2>Order Placement Failed!</h2>
            <p className="order-number">Order Number: <strong>{paymentFailed.orderNumber}</strong></p>
            <p className="failure-reason">{paymentFailed.failureReason}</p>
            <div className="modal-buttons">
              <button 
                onClick={() => setPaymentFailed(null)} 
                className="btn-primary"
              >
                Try Again
              </button>
              <button 
                onClick={() => navigate('/')} 
                className="btn-secondary"
              >
                Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="checkout-content">
        <div className="checkout-main-header">
          <Link to="/" className="checkout-logo">
            <h1>CloudRetail</h1>
          </Link>
        </div>

        <div className="checkout-back">
          <Link to="/cart" className="back-link">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </Link>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="checkout-container">
          {/* Items Overview - Left Side */}
          <div className="order-summary-checkout">
            <h2 className="section-title">Items overview</h2>

            <div className="checkout-items">
              {cart.map((item) => {
                const images = item.images ? (typeof item.images === 'string' ? JSON.parse(item.images) : item.images) : [];
                const itemQuantity = item.quantity || 1; // Defensive coding
                return (
                  <div key={item.id} className="checkout-item">
                    <img
                      src={images[0] || 'https://via.placeholder.com/120'}
                      alt={item.name}
                      className="checkout-item-image"
                    />
                    <div className="checkout-item-details">
                      <h3 className="item-name">{item.name}</h3>
                      <p className="item-sku">SKU: {item.sku}</p>
                      <div className="item-quantity-controls">
                        <button 
                          type="button" 
                          className="item-qty-btn"
                          onClick={() => handleQuantityChange(item.id, -1)}
                        >
                          -
                        </button>
                        <span className="item-qty-display">{itemQuantity}</span>
                        <button 
                          type="button" 
                          className="item-qty-btn"
                          onClick={() => handleQuantityChange(item.id, 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="checkout-item-price-section">
                      <p className="checkout-item-price">${(parseFloat(item.price) * itemQuantity).toFixed(2)}</p>
                      <button 
                        type="button" 
                        className="item-remove-btn"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Shipping Options */}
            <div className="shipping-section">
              <div className="shipping-option">
                <input 
                  type="radio" 
                  id="standard-shipping" 
                  name="shipping" 
                  value="standard"
                  checked={shippingMethod === 'standard'}
                  onChange={(e) => setShippingMethod(e.target.value)}
                />
                <label htmlFor="standard-shipping">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 4h13l3 3v8h-2a3 3 0 11-6 0H9a3 3 0 11-6 0H1V6h2V4zm13 13.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm-10 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
                  </svg>
                  <span>Standard Shipping (10-15 business days)</span>
                </label>
                <button type="button" className="change-btn">Change</button>
                <span className="shipping-price">${shippingCost.toFixed(2)}</span>
              </div>
            </div>

            {/* Shipping Address Section */}
            <div className="shipping-address-section">
              <h3>Shipping Address</h3>
              <p className="form-subtitle">Enter your shipping details</p>
              
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={shippingInfo.fullName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Street Address *</label>
                <input
                  type="text"
                  name="address"
                  value={shippingInfo.address}
                  onChange={handleInputChange}
                  placeholder="123 Main Street"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={shippingInfo.city}
                    onChange={handleInputChange}
                    placeholder="Colombo"
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">State/Province</label>
                  <input
                    type="text"
                    name="state"
                    value={shippingInfo.state}
                    onChange={handleInputChange}
                    placeholder="Western"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">ZIP/Postal Code *</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={shippingInfo.zipCode}
                    onChange={handleInputChange}
                    placeholder="10000"
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Country *</label>
                  <input
                    type="text"
                    name="country"
                    value={shippingInfo.country}
                    onChange={handleInputChange}
                    placeholder="Sri Lanka"
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={shippingInfo.phone}
                  onChange={handleInputChange}
                  placeholder="+94 77 123 4567"
                  className="form-input"
                  required
                />
              </div>
            </div>
          </div>

          {/* Payment Form - Right Side */}
          <form onSubmit={handleSubmit} className="checkout-form">
            <h2 className="section-title">Payment details</h2>
            <p className="form-subtitle">Fill in your payment details and complete the order</p>
          
            <div className="form-group">
              <label className="form-label">Cardholder name *</label>
              <input
                type="text"
                name="cardholderName"
                value={paymentInfo.cardholderName}
                onChange={handlePaymentInputChange}
                placeholder="Name Surname"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Card number *</label>
              <input
                type="text"
                name="cardNumber"
                value={paymentInfo.cardNumber}
                onChange={handlePaymentInputChange}
                placeholder="•••• •••• •••• ••••"
                className="form-input"
                maxLength="19"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Expiration date *</label>
                <div className="expiry-inputs">
                  <input
                    type="text"
                    name="expiryMonth"
                    value={paymentInfo.expiryMonth}
                    onChange={handlePaymentInputChange}
                    placeholder="MM"
                    className="form-input expiry-month"
                    maxLength="2"
                    pattern="[0-9]{2}"
                    onInput={(e) => {
                      e.target.value = e.target.value.replace(/[^0-9]/g, '');
                      if (e.target.value.length === 2) {
                        const val = parseInt(e.target.value);
                        if (val < 1 || val > 12) {
                          e.target.setCustomValidity('Month must be between 01 and 12');
                        } else {
                          e.target.setCustomValidity('');
                        }
                      }
                    }}
                    required
                  />
                  <span className="expiry-separator">/</span>
                  <input
                    type="text"
                    name="expiryYear"
                    value={paymentInfo.expiryYear}
                    onChange={handlePaymentInputChange}
                    placeholder="YY"
                    className="form-input expiry-year"
                    maxLength="2"
                    pattern="[0-9]{2}"
                    onInput={(e) => {
                      e.target.value = e.target.value.replace(/[^0-9]/g, '');
                    }}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">CVV *</label>
                <input
                  type="text"
                  name="cvv"
                  value={paymentInfo.cvv}
                  onChange={handlePaymentInputChange}
                  placeholder="•••"
                  className="form-input"
                  maxLength="3"
                  required
                />
              </div>
            </div>

            <div className="payment-method-link">
              <a href="#" onClick={(e) => e.preventDefault()}>Choose another payment method</a>
            </div>

            {/* Summary Section */}
            <div className="payment-summary">
              <h3>Summary</h3>
              
              {cart.map((item) => {
                const itemQuantity = item.quantity || 1;
                return (
                  <div key={item.id} className="summary-item-row">
                    <span>{item.name}</span>
                    <span>${(parseFloat(item.price) * itemQuantity).toFixed(2)}</span>
                  </div>
                );
              })}

              <div className="summary-row-checkout">
                <span>Standard Shipping</span>
                <span>${shippingCost.toFixed(2)}</span>
              </div>

              <div className="summary-total">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button type="submit" disabled={loading} className="submit-order-btn">
              {loading ? 'Processing...' : `Pay $${total.toFixed(2)}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
