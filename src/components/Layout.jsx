import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Box, Toolbar } from '@mui/material';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Layout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // onNavigate fonksiyonunu tanımla
    const handleNavigate = (path) => {
        navigate(path);
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <Topbar />
            <Sidebar
                currentPath={location.pathname}
                onNavigate={handleNavigate}
            />
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar /> {/* For spacing below the app bar */}
                <Outlet />
            </Box>
        </Box>
    );
};

export default Layout;