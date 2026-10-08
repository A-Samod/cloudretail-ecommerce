import React, { createContext, useState, useContext, useEffect } from 'react';
import { userAPI } from '../services/api';

// TESTING MODE
const USE_MOCK_AUTH = false;

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      if (USE_MOCK_AUTH) {
        // Check localStorage for mock user
        const mockUser = localStorage.getItem('mockUser');
        if (mockUser) {
          setUser(JSON.parse(mockUser));
        }
      } else {
        // Check localStorage for real API user
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        const accessToken = localStorage.getItem('accessToken');
        
        if (storedUser && (storedToken || accessToken)) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        }
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to decode JWT token
  const decodeJWT = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  };

  const login = async (email, password) => {
    try {
      if (USE_MOCK_AUTH) {
        // Mock login - accept any email/password
        const mockUser = {
          username: email,
          email: email,
          userId: 'mock-user-123',
          role: 'CUSTOMER', // Default role for mock users
          attributes: {
            email: email,
            name: email.split('@')[0]
          }
        };
        localStorage.setItem('mockUser', JSON.stringify(mockUser));
        setUser(mockUser);
        return { success: true };
      } else {
        // Real API login
        const response = await userAPI.signin({ email, password });
        
        // Check if response has the expected structure
        if (response.data && response.data.success && response.data.data) {
          const { idToken, accessToken } = response.data.data;
          
          // Decode the idToken to get user information
          const decodedToken = decodeJWT(idToken);
          const decodedAccessToken = decodeJWT(accessToken);
          
          if (!decodedToken) {
            return { success: false, error: 'Failed to decode authentication token' };
          }
          
          const userData = {
            email: decodedToken.email,
            userId: decodedToken.sub,
            cognitoUserId: decodedToken.sub, // Cognito User ID
            firstName: decodedToken.given_name,
            lastName: decodedToken.family_name,
            idToken: idToken,
            accessToken: accessToken
          };
          
          // Store tokens in localStorage FIRST so API calls can use them
          localStorage.setItem('token', idToken);
          localStorage.setItem('accessToken', accessToken);
          
          // Now fetch user profile to get role information
          try {
            const profileResponse = await userAPI.getCurrentUser();
            if (profileResponse.data && profileResponse.data.success) {
              const profile = profileResponse.data.data;
              userData.role = profile.role || 'CUSTOMER';
              userData.userId = profile.id; // Use database user ID
            }
          } catch (profileError) {
            console.warn('Could not fetch user profile, defaulting to CUSTOMER role:', profileError);
            console.error('Profile Error Details:', profileError.response?.data);
            userData.role = 'CUSTOMER'; // Default to customer if profile fetch fails
          }
          
          localStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
          return { success: true };
        } else {
          return { success: false, error: 'Invalid response from server' };
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      if (USE_MOCK_AUTH) {
        // Mock registration
        const mockUser = {
          username: userData.email,
          email: userData.email,
          userId: 'mock-user-' + Date.now(),
          attributes: {
            email: userData.email,
            name: userData.firstName || userData.email.split('@')[0]
          }
        };
        localStorage.setItem('mockUser', JSON.stringify(mockUser));
        setUser(mockUser);
        return { success: true };
      } else {
        // Real API signup
        const response = await userAPI.signup(userData);
        
        if (response.data) {
          // Registration successful, but don't log in automatically
          // User should log in with their credentials
          return { success: true, message: 'Account created successfully! Please log in.' };
        } else {
          return { success: false, error: 'Invalid response from server' };
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Registration failed' 
      };
    }
  };

  const logout = async () => {
    try {
      if (USE_MOCK_AUTH) {
        localStorage.removeItem('mockUser');
        setUser(null);
      } else {
        // Real API logout - Clear ALL auth data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('idToken');
        setUser(null);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
