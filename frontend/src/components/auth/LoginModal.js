import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './LoginModal.css';

const LoginModal = ({ onClose, initialTab = 'login' }) => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(initialTab === 'login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  const [signupForm, setSignupForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    password: '',
    confirmPassword: '',
  });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(loginForm.email, loginForm.password);
    
    if (result.success) {
      onClose();
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (signupForm.password !== signupForm.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (signupForm.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    // Prepare signup data
    const signupData = {
      email: signupForm.email,
      firstName: signupForm.firstName,
      lastName: signupForm.lastName,
      password: signupForm.password,
      phone: signupForm.phone,
      address: signupForm.address,
      city: signupForm.city,
      state: signupForm.state,
      zipCode: signupForm.zipCode,
      country: signupForm.country
    };

    const result = await register(signupData);
    
    if (result.success) {
      setSuccess(result.message || 'Account created successfully! Please log in.');
      setIsLogin(true);
      setSignupForm({ 
        firstName: '', 
        lastName: '', 
        email: '', 
        phone: '', 
        address: '', 
        city: '', 
        state: '', 
        zipCode: '', 
        country: '', 
        password: '', 
        confirmPassword: '' 
      });
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button onClick={onClose} className="modal-close">
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-logo">CloudRetail</h2>
        </div>

        {/* Tabs */}
        <div className="modal-tabs">
          <button
            onClick={() => {
              setIsLogin(true);
              setError('');
              setSuccess('');
            }}
            className={`modal-tab ${isLogin ? 'active' : ''}`}
          >
            Log in
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              setError('');
              setSuccess('');
            }}
            className={`modal-tab ${!isLogin ? 'active' : ''}`}
          >
            Sign up
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div className="alert alert-success">
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {/* Login Form */}
        {isLogin ? (
          <form onSubmit={handleLoginSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                required
                className="form-input"
                placeholder="your@email.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                required
                className="form-input"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="form-button"
            >
              {loading ? 'Logging in...' : 'Log in'}
            </button>

            <div className="form-footer">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setIsLogin(false)}
              >
                Sign up
              </button>
            </div>
          </form>
        ) : (
          /* Signup Form */
          <form onSubmit={handleSignupSubmit} className="auth-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  value={signupForm.firstName}
                  onChange={(e) => setSignupForm({ ...signupForm, firstName: e.target.value })}
                  required
                  className="form-input"
                  placeholder="John"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  value={signupForm.lastName}
                  onChange={(e) => setSignupForm({ ...signupForm, lastName: e.target.value })}
                  className="form-input"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                type="email"
                value={signupForm.email}
                onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                required
                className="form-input"
                placeholder="your@email.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                value={signupForm.phone}
                onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                className="form-input"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Address</label>
              <input
                type="text"
                value={signupForm.address}
                onChange={(e) => setSignupForm({ ...signupForm, address: e.target.value })}
                className="form-input"
                placeholder="Street address"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  value={signupForm.city}
                  onChange={(e) => setSignupForm({ ...signupForm, city: e.target.value })}
                  className="form-input"
                  placeholder="San Francisco"
                />
              </div>

              <div className="form-group">
                <label className="form-label">State</label>
                <input
                  type="text"
                  value={signupForm.state}
                  onChange={(e) => setSignupForm({ ...signupForm, state: e.target.value })}
                  className="form-input"
                  placeholder="CA"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Zip Code</label>
                <input
                  type="text"
                  value={signupForm.zipCode}
                  onChange={(e) => setSignupForm({ ...signupForm, zipCode: e.target.value })}
                  className="form-input"
                  placeholder="12345"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Country</label>
                <input
                  type="text"
                  value={signupForm.country}
                  onChange={(e) => setSignupForm({ ...signupForm, country: e.target.value })}
                  className="form-input"
                  placeholder="USA"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                value={signupForm.password}
                onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                required
                minLength={8}
                className="form-input"
                placeholder="••••••••"
              />
              <span className="form-helper">
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px' }}>
                  <li>Must be at least 8 characters</li>
                  <li>Contains at least 1 number</li>
                  <li>Contains at least 1 special character</li>
                  <li>Contains at least 1 uppercase letter</li>
                  <li>Contains at least 1 lowercase letter</li>
                </ul>
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input
                type="password"
                value={signupForm.confirmPassword}
                onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                required
                className="form-input"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="form-button"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>

            <div className="form-footer">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setIsLogin(true)}
              >
                Log in
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
