// src/components/ProtectedRoute.jsx - Route Protection Component

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    // Auth kontrolü yapılırken loading göster
    if (loading) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
            >
                <CircularProgress sx={{ color: 'white', mb: 2 }} size={50} />
                <Typography variant="h6" sx={{ color: 'white' }}>
                    Yetki kontrol ediliyor...
                </Typography>
            </Box>
        );
    }

    // Authenticated değilse login'e yönlendir
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Authenticated ise children'ı render et
    return children;
};

export default ProtectedRoute;
