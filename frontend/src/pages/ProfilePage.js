import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import './ProfilePage.css';

function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getProfile();
      const profileData = response.data.data;
      setProfile(profileData);
      setFormData({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        address: profileData.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
        },
      });
      setError('');
    } catch (err) {
      if (err.response?.status === 404) {
        // Profile doesn't exist, create one
        await createProfile();
      } else {
        setError('Failed to load profile');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async () => {
    try {
      const newProfile = {
        cognitoUserId: user.userId || user.username,
        email: user.attributes?.email || '',
        firstName: '',
        lastName: '',
        role: 'CUSTOMER',
      };
      const response = await userAPI.createProfile(newProfile);
      setProfile(response.data.data);
    } catch (err) {
      console.error('Failed to create profile:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [addressField]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await userAPI.updateProfile(formData);
      await loadProfile();
      setEditing(false);
      setSuccess('Profile updated successfully!');
      setError('');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError('Failed to update profile');
      setSuccess('');
      console.error(err);
    }
  };

  if (!user) {
    navigate('/');return null;
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="loading-container">
          <div className="loading">Loading profile...</div>
        </div>
      </>
    );
  }

  return (
    <div className="profile-page">
      <Header />
      <div className="profile-content">
        <h1 className="page-title">My Profile</h1>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="profile-container card">
        {!editing ? (
          <div className="profile-view">
            <div className="profile-section">
              <h2>Personal Information</h2>
              <div className="profile-field">
                <label>Name:</label>
                <p>{profile?.firstName} {profile?.lastName || 'Not provided'}</p>
              </div>
              <div className="profile-field">
                <label>Email:</label>
                <p>{profile?.email || 'Not provided'}</p>
              </div>
              <div className="profile-field">
                <label>Phone:</label>
                <p>{profile?.phone || 'Not provided'}</p>
              </div>
              <div className="profile-field">
                <label>Role:</label>
                <p>{profile?.role}</p>
              </div>
            </div>

            <div className="profile-section">
              <h2>Address</h2>
              {profile?.address ? (
                <>
                  <p>{profile.address.street}</p>
                  <p>
                    {profile.address.city}, {profile.address.state} {profile.address.zipCode}
                  </p>
                  <p>{profile.address.country}</p>
                </>
              ) : (
                <p>No address on file</p>
              )}
            </div>

            <button onClick={() => setEditing(true)} className="btn-primary">
              Edit Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="profile-form">
            <h2>Edit Personal Information</h2>

            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>

            <h2>Address</h2>

            <div className="form-group">
              <label>Street</label>
              <input
                type="text"
                name="address.street"
                value={formData.address.street}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>ZIP Code</label>
                <input
                  type="text"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                Save Changes
              </button>
              <button type="button" onClick={() => setEditing(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
      </div>
    </div>
  );
}

export default ProfilePage;
