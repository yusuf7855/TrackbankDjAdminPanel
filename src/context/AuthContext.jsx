// src/context/AuthContext.jsx - Admin Authentication Context

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    // Token'ı API'ye ekle
    const setAuthToken = useCallback((token) => {
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete api.defaults.headers.common['Authorization'];
        }
    }, []);

    // Token doğrulama
    const verifyToken = useCallback(async () => {
        const token = localStorage.getItem('adminToken');

        if (!token) {
            setLoading(false);
            setIsAuthenticated(false);
            return false;
        }

        try {
            setAuthToken(token);
            const response = await api.get('/admin/auth/verify');

            if (response.data.success) {
                setAdmin(response.data.admin);
                setIsAuthenticated(true);
                return true;
            } else {
                throw new Error('Token invalid');
            }
        } catch (error) {
            console.error('Token verification failed:', error);
            logout();
            return false;
        } finally {
            setLoading(false);
        }
    }, [setAuthToken]);

    // Sayfa yüklendiğinde token kontrolü
    useEffect(() => {
        verifyToken();
    }, [verifyToken]);

    // Login
    const login = async (email, password) => {
        try {
            const response = await api.post('/admin/auth/login', { email, password });

            if (response.data.success) {
                const { token, admin: adminData } = response.data;

                localStorage.setItem('adminToken', token);
                localStorage.setItem('adminUser', JSON.stringify(adminData));

                setAuthToken(token);
                setAdmin(adminData);
                setIsAuthenticated(true);

                return { success: true };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Giriş başarısız'
            };
        }
    };

    // Logout
    const logout = useCallback(() => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        setAuthToken(null);
        setAdmin(null);
        setIsAuthenticated(false);
        navigate('/login');
    }, [navigate, setAuthToken]);

    // Şifre değiştir
    const changePassword = async (currentPassword, newPassword) => {
        try {
            const response = await api.put('/admin/auth/change-password', {
                currentPassword,
                newPassword
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Şifre değiştirme hatası' };
        }
    };

    // Profil güncelle
    const updateProfile = async (data) => {
        try {
            const response = await api.put('/admin/auth/profile', data);
            if (response.data.success) {
                setAdmin(response.data.admin);
                localStorage.setItem('adminUser', JSON.stringify(response.data.admin));
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Profil güncelleme hatası' };
        }
    };

    const value = {
        admin,
        loading,
        isAuthenticated,
        login,
        logout,
        verifyToken,
        changePassword,
        updateProfile,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
