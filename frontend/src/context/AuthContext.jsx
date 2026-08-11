import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('proto_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/auth/status`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.authenticated && response.data.user) {
          setUser(response.data.user);
        } else {
          localStorage.removeItem('proto_token');
          setToken(null);
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching auth status:', error);
        localStorage.removeItem('proto_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    const { token: newToken, user: userData } = response.data;
    localStorage.setItem('proto_token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password) => {
    const response = await axios.post(`${API_URL}/auth/register`, { name, email, password });
    const { token: newToken, user: userData } = response.data;
    localStorage.setItem('proto_token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const googleLogin = async (idToken) => {
    const response = await axios.post(`${API_URL}/auth/google`, { idToken });
    const { token: newToken, user: userData } = response.data;
    localStorage.setItem('proto_token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const verifyCollegeEmail = async (googleToken) => {
    try {
      const response = await axios.post(`${API_URL}/verify`, { googleToken: googleToken }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success && response.data.user) {
        setUser(response.data.user);
        return { success: true };
      }
      return { success: false, error: 'Verification failed' };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Verification failed' };
    }
  };

  const updateProfile = async (name, avatarSeed) => {
    try {
      const response = await axios.put(`${API_URL}/auth/profile`, { name, avatarSeed }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success && response.data.user) {
        const { token: newToken, user: userData } = response.data;
        localStorage.setItem('proto_token', newToken);
        setToken(newToken);
        setUser(userData);
        return { success: true, user: userData };
      }
      return { success: false, error: 'Update failed' };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Update failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('proto_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, googleLogin, logout, verifyCollegeEmail, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
