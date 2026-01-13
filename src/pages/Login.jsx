// src/pages/Login.jsx - Modern Full-Screen Admin Login

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    TextField,
    Button,
    Typography,
    Alert,
    CircularProgress,
    InputAdornment,
    IconButton,
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    LockOutlined,
    EmailOutlined,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { login, isAuthenticated, loading: authLoading } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Zaten giriş yapılmışsa yönlendir
    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            navigate('/admin');
        }
    }, [isAuthenticated, authLoading, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!formData.email || !formData.password) {
            setError('Email ve şifre gereklidir');
            setLoading(false);
            return;
        }

        try {
            // AuthContext'in login fonksiyonunu kullan
            const result = await login(formData.email, formData.password);

            if (result.success) {
                navigate('/admin');
            } else {
                setError(result.message || 'Giriş başarısız');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Bağlantı hatası. Lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    // Auth kontrolü yapılırken loading göster
    if (authLoading) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#000',
                }}
            >
                <CircularProgress sx={{ color: '#fff' }} />
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                width: '100vw',
                display: 'flex',
                backgroundColor: '#000',
                overflow: 'hidden',
            }}
        >
            {/* Sol Taraf - Branding */}
            <Box
                sx={{
                    flex: 1,
                    display: { xs: 'none', md: 'flex' },
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative',
                    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
                    borderRight: '1px solid rgba(255,255,255,0.05)',
                    padding: 6,
                }}
            >
                {/* Background Pattern */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: `
                            radial-gradient(circle at 20% 80%, rgba(255,255,255,0.03) 0%, transparent 50%),
                            radial-gradient(circle at 80% 20%, rgba(255,255,255,0.03) 0%, transparent 50%)
                        `,
                        pointerEvents: 'none',
                    }}
                />

                {/* Logo */}
                <Box
                    sx={{
                        width: 120,
                        height: 120,
                        borderRadius: '24px',
                        backgroundColor: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 4,
                        boxShadow: '0 20px 60px rgba(255,255,255,0.1)',
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: 48,
                            fontWeight: 900,
                            color: '#000',
                            letterSpacing: '-2px',
                        }}
                    >
                        TB
                    </Typography>
                </Box>

                <Typography
                    variant="h2"
                    sx={{
                        color: '#fff',
                        fontWeight: 800,
                        letterSpacing: '-2px',
                        mb: 2,
                        textAlign: 'center',
                    }}
                >
                    TrackBang
                </Typography>

                <Typography
                    sx={{
                        color: 'rgba(255,255,255,0.5)',
                        fontSize: '1.1rem',
                        textAlign: 'center',
                        maxWidth: 400,
                        lineHeight: 1.8,
                    }}
                >
                    Admin Panel - Müzik platformunuzu yönetin,
                    kullanıcıları takip edin ve içerikleri kontrol edin.
                </Typography>

                {/* Stats */}
                <Box
                    sx={{
                        display: 'flex',
                        gap: 6,
                        mt: 6,
                    }}
                >
                    {[
                        { value: '2.1K+', label: 'Kullanıcı' },
                        { value: '1.2K+', label: 'Müzik' },
                        { value: '45+', label: 'Playlist' },
                    ].map((stat, index) => (
                        <Box key={index} sx={{ textAlign: 'center' }}>
                            <Typography
                                sx={{
                                    color: '#fff',
                                    fontSize: '2rem',
                                    fontWeight: 700,
                                }}
                            >
                                {stat.value}
                            </Typography>
                            <Typography
                                sx={{
                                    color: 'rgba(255,255,255,0.4)',
                                    fontSize: '0.85rem',
                                }}
                            >
                                {stat.label}
                            </Typography>
                        </Box>
                    ))}
                </Box>

                {/* Version */}
                <Typography
                    sx={{
                        position: 'absolute',
                        bottom: 32,
                        color: 'rgba(255,255,255,0.2)',
                        fontSize: '0.75rem',
                        letterSpacing: '1px',
                    }}
                >
                    VERSION 2.0.0
                </Typography>
            </Box>

            {/* Sağ Taraf - Login Form */}
            <Box
                sx={{
                    flex: { xs: 1, md: '0 0 500px' },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: { xs: 3, sm: 6 },
                    backgroundColor: '#0a0a0a',
                }}
            >
                <Box
                    sx={{
                        width: '100%',
                        maxWidth: 380,
                    }}
                >
                    {/* Mobile Logo */}
                    <Box
                        sx={{
                            display: { xs: 'flex', md: 'none' },
                            flexDirection: 'column',
                            alignItems: 'center',
                            mb: 4,
                        }}
                    >
                        <Box
                            sx={{
                                width: 64,
                                height: 64,
                                borderRadius: '16px',
                                backgroundColor: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 2,
                            }}
                        >
                            <Typography
                                sx={{
                                    fontSize: 28,
                                    fontWeight: 900,
                                    color: '#000',
                                }}
                            >
                                TB
                            </Typography>
                        </Box>
                        <Typography
                            sx={{
                                color: '#fff',
                                fontSize: '1.5rem',
                                fontWeight: 700,
                            }}
                        >
                            TrackBang
                        </Typography>
                    </Box>

                    {/* Form Header */}
                    <Typography
                        variant="h4"
                        sx={{
                            color: '#fff',
                            fontWeight: 700,
                            mb: 1,
                        }}
                    >
                        Hoş Geldiniz
                    </Typography>
                    <Typography
                        sx={{
                            color: 'rgba(255,255,255,0.5)',
                            mb: 4,
                        }}
                    >
                        Admin hesabınızla giriş yapın
                    </Typography>

                    {/* Error Alert */}
                    {error && (
                        <Alert
                            severity="error"
                            sx={{
                                mb: 3,
                                borderRadius: 2,
                                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                color: '#f44336',
                                border: '1px solid rgba(244, 67, 54, 0.3)',
                                '& .MuiAlert-icon': {
                                    color: '#f44336',
                                },
                            }}
                        >
                            {error}
                        </Alert>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            autoComplete="email"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <EmailOutlined sx={{ color: 'rgba(255,255,255,0.3)' }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                mb: 2.5,
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: 'rgba(255,255,255,0.03)',
                                    borderRadius: 2,
                                    color: '#fff',
                                    '& fieldset': {
                                        borderColor: 'rgba(255,255,255,0.1)',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'rgba(255,255,255,0.2)',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#fff',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: 'rgba(255,255,255,0.5)',
                                    '&.Mui-focused': {
                                        color: '#fff',
                                    },
                                },
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Şifre"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleChange}
                            autoComplete="current-password"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockOutlined sx={{ color: 'rgba(255,255,255,0.3)' }} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                            sx={{ color: 'rgba(255,255,255,0.3)' }}
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                mb: 4,
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: 'rgba(255,255,255,0.03)',
                                    borderRadius: 2,
                                    color: '#fff',
                                    '& fieldset': {
                                        borderColor: 'rgba(255,255,255,0.1)',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'rgba(255,255,255,0.2)',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#fff',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: 'rgba(255,255,255,0.5)',
                                    '&.Mui-focused': {
                                        color: '#fff',
                                    },
                                },
                            }}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{
                                py: 1.8,
                                borderRadius: 2,
                                backgroundColor: '#fff',
                                color: '#000',
                                fontWeight: 600,
                                fontSize: '1rem',
                                textTransform: 'none',
                                boxShadow: 'none',
                                '&:hover': {
                                    backgroundColor: 'rgba(255,255,255,0.9)',
                                    boxShadow: '0 8px 30px rgba(255,255,255,0.2)',
                                },
                                '&:disabled': {
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    color: 'rgba(255,255,255,0.3)',
                                },
                            }}
                        >
                            {loading ? (
                                <CircularProgress size={24} sx={{ color: '#000' }} />
                            ) : (
                                'Giriş Yap'
                            )}
                        </Button>
                    </form>

                    {/* Footer */}
                    <Box sx={{ mt: 4, textAlign: 'center' }}>
                        <Typography
                            sx={{
                                color: 'rgba(255,255,255,0.3)',
                                fontSize: '0.8rem',
                            }}
                        >
                            Bu panel sadece yetkili yöneticiler içindir.
                        </Typography>
                        <Typography
                            sx={{
                                color: 'rgba(255,255,255,0.2)',
                                fontSize: '0.75rem',
                                mt: 1,
                            }}
                        >
                            © 2024 TrackBang. Tüm hakları saklıdır.
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default Login;
