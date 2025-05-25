import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Toolbar } from '@mui/material';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Layout = () => {
    return (
        <Box sx={{ display: 'flex' }}>
            <Topbar />
            <Sidebar />
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar /> {/* For spacing below the app bar */}
                <Outlet />
            </Box>
        </Box>
    );
};

export default Layout;