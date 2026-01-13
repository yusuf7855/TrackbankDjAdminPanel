// src/pages/Login.jsx - Admin Panel Login Page

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Alert,
    CircularProgress,
    InputAdornment,
    IconButton,
    Avatar,
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    AdminPanelSettings,
    Email,
    Lock,
} from '@mui/icons-material';
import api from '../services/api';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [checkingAuth, setCheckingAuth] = useState(true);

    // Sayfa yüklendiğinde mevcut token kontrolü
    useEffect(() => {
        const checkExistingAuth = async () => {
            const token = localStorage.getItem('adminToken');
            if (token) {
                try {
                    const response = await api.get('/admin/auth/verify', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (response.data.success) {
                        navigate('/admin');
                        return;
                    }
                } catch (err) {
                    // Token geçersiz, temizle
                    localStorage.removeItem('adminToken');
                    localStorage.removeItem('adminUser');
                }
            }
            setCheckingAuth(false);
        };
        checkExistingAuth();
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validation
        if (!formData.email || !formData.password) {
            setError('Email ve şifre gereklidir');
            setLoading(false);
            return;
        }

        try {
            const response = await api.post('/admin/auth/login', {
                email: formData.email,
                password: formData.password
            });

            if (response.data.success) {
                // Token ve admin bilgilerini kaydet
                localStorage.setItem('adminToken', response.data.token);
                localStorage.setItem('adminUser', JSON.stringify(response.data.admin));

                // Dashboard'a yönlendir
                navigate('/admin');
            } else {
                setError(response.data.message || 'Giriş başarısız');
            }
        } catch (err) {
            console.error('Login error:', err);
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.response?.status === 401) {
                setError('Geçersiz email veya şifre');
            } else if (err.response?.status === 403) {
                setError('Bu panele erişim yetkiniz bulunmamaktadır');
            } else {
                setError('Bağlantı hatası. Lütfen tekrar deneyin.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Auth kontrolü yapılırken loading göster
    if (checkingAuth) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
            >
                <CircularProgress sx={{ color: 'white' }} />
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: 2,
            }}
        >
            <Card
                sx={{
                    maxWidth: 420,
                    width: '100%',
                    borderRadius: 4,
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                    overflow: 'hidden',
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                        padding: 4,
                        textAlign: 'center',
                    }}
                >
                    <Avatar
                        sx={{
                            width: 80,
                            height: 80,
                            margin: '0 auto 16px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        }}
                    >
                        <AdminPanelSettings sx={{ fontSize: 40 }} />
                    </Avatar>
                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                        TrackBang
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mt: 1 }}>
                        Admin Panel
                    </Typography>
                </Box>

                {/* Form */}
                <CardContent sx={{ padding: 4 }}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            margin="normal"
                            variant="outlined"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Email color="action" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                }
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Şifre"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleChange}
                            margin="normal"
                            variant="outlined"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock color="action" />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                }
                            }}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{
                                mt: 3,
                                py: 1.5,
                                borderRadius: 2,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                fontWeight: 600,
                                fontSize: '1rem',
                                textTransform: 'none',
                                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)',
                                    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
                                },
                                '&:disabled': {
                                    background: '#ccc',
                                }
                            }}
                        >
                            {loading ? (
                                <CircularProgress size={24} sx={{ color: 'white' }} />
                            ) : (
                                'Giriş Yap'
                            )}
                        </Button>
                    </form>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        align="center"
                        sx={{ mt: 3 }}
                    >
                        Bu panel sadece yetkili yöneticiler içindir.
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
};

export default Login;
