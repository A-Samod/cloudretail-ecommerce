import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../services/api';
import './OrdersPage.css';

function OrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const userId = user.userId || user.username;
      const response = await orderAPI.getOrders(userId);
      setOrders(response.data.data || []);
      setError('');
    } catch (err) {
      setError('Failed to load orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING_PAYMENT: '#ff9800',
      PAID: '#4caf50',
      PROCESSING: '#2196f3',
      SHIPPED: '#9c27b0',
      DELIVERED: '#4caf50',
      CANCELLED: '#f44336',
      FAILED: '#f44336',
    };
    return colors[status] || '#666';
  };

  if (!user) {
    navigate('/');
    return null;
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="loading-container">
          <div className="loading">Loading orders...</div>
        </div>
      </>
    );
  }

  return (
    <div className="orders-page">
      <Header />
      <div className="orders-content">
        <h1 className="page-title">My Orders</h1>

      {error && <div className="error">{error}</div>}

      {orders.length === 0 ? (
        <div className="no-orders">
          <p>You haven't placed any orders yet</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            // Parse shippingAddress if it's a string
            let shippingAddress = order.shippingAddress;
            try {
              if (typeof shippingAddress === 'string') {
                shippingAddress = JSON.parse(shippingAddress);
              }
            } catch (e) {
              console.error('Error parsing shipping address:', e);
              shippingAddress = {};
            }
            
            return (
            <div key={order.id} className="order-card card">
              <div className="order-header">
                <div>
                  <h3>Order #{order.orderNumber}</h3>
                  <p className="order-date">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span
                    className="order-status"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              <div className="order-items">
                {order.items?.map((item) => (
                  <div key={item.id} className="order-item">
                    <div className="order-item-info">
                      <p className="item-name">{item.productName}</p>
                      <p className="item-details">
                        SKU: {item.productSku} | Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="item-price">${parseFloat(item.subtotal).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="order-footer">
                <div className="order-shipping">
                  <p><strong>Shipping Address:</strong></p>
                  <p>
                    {shippingAddress?.fullName || ''}{shippingAddress?.fullName && <br />}
                    {shippingAddress?.address?.street || ''}{shippingAddress?.address?.street && <br />}
                    {shippingAddress?.city || shippingAddress?.address?.city || ''}{(shippingAddress?.city || shippingAddress?.address?.city) && ', '}
                    {shippingAddress?.state || shippingAddress?.address?.state || ''} {shippingAddress?.zipCode || shippingAddress?.address?.zipCode || ''}{(shippingAddress?.city || shippingAddress?.zipCode) && <br />}
                    {shippingAddress?.country || shippingAddress?.address?.country || ''}
                  </p>
                </div>
                <div className="order-total">
                  <p><strong>Total Amount:</strong></p>
                  <p className="total-amount">${parseFloat(order.totalAmount).toFixed(2)}</p>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}

export default OrdersPage;
