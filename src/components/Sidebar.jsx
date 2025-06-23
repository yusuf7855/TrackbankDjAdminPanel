// src/components/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
    Box,
    Typography,
    Avatar,
    Chip,
    Stack
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    MusicNote as MusicNoteIcon,
    CloudUpload as UploadIcon,
    PlaylistPlay as PlaylistsIcon,
    PlaylistAdd as PlaylistAddIcon,
    Settings as SettingsIcon,
    Analytics as AnalyticsIcon,
    LibraryMusic as LibraryMusicIcon,
    People as PeopleIcon,
    Whatshot as HotIcon
} from '@mui/icons-material';

const drawerWidth = 280;

const Sidebar = ({ mobileOpen, onMobileClose }) => {
    const location = useLocation();

    const menuItems = [
        {
            text: 'Dashboard',
            icon: <DashboardIcon />,
            path: '/',
            description: 'Genel görünüm',
            color: '#2196f3'
        },
        {
            text: 'Add Music',
            icon: <MusicNoteIcon />,
            path: '/add-music',
            description: 'Müzik ekle',
            color: '#4caf50',
            isNew: true
        },
        {
            text: 'Genre Playlists',
            icon: <PlaylistAddIcon />,
            path: '/playlists',
            description: 'Genre playlist\'leri',
            color: '#9c27b0'
        },
        {
            text: 'Sample Bank',
            icon: <LibraryMusicIcon />,
            path: '/sample-bank',
            description: 'Sample yönetimi',
            color: '#e91e63',
            isNew: true
        },
        {
            text: 'HOT Playlists',
            icon: <HotIcon />,
            path: '/hot',
            description: 'Popüler içerikler',
            color: '#ff5722'
        },
        {
            text: 'Users',
            icon: <PeopleIcon />,
            path: '/users',
            description: 'Kullanıcı yönetimi',
            color: '#607d8b'
        },
        {
            text: 'Settings',
            icon: <SettingsIcon />,
            path: '/settings',
            description: 'Sistem ayarları',
            color: '#795548'
        }
    ];

    const drawerContent = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box sx={{ p: 3, pb: 2 }}>
                <Box display="flex" alignItems="center" mb={2}>
                    <Avatar
                        sx={{
                            width: 48,
                            height: 48,
                            mr: 2,
                            bgcolor: 'primary.main',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            fontWeight: 'bold',
                            fontSize: '1.2rem'
                        }}
                    >
                        DJ
                    </Avatar>
                    <Box>
                        <Typography variant="h6" noWrap fontWeight="bold">
                            DJ Sample Bank
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Admin Panel
                        </Typography>
                    </Box>
                </Box>

                <Box
                    sx={{
                        p: 2,
                        bgcolor: 'primary.main',
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white'
                    }}
                >
                    <Typography variant="body2" fontWeight="bold">
                        🎵 Music Management
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        Genre tabanlı müzik yönetim sistemi
                    </Typography>
                </Box>
            </Box>

            <Divider />

            {/* Navigation Menu */}
            <List sx={{ px: 2, py: 1, flex: 1 }}>
                {menuItems.map((item) => (
                    <ListItem
                        key={item.text}
                        disablePadding
                        sx={{ mb: 1 }}
                    >
                        <ListItemButton
                            component={Link}
                            to={item.path}
                            selected={location.pathname === item.path}
                            onClick={onMobileClose}
                            sx={{
                                borderRadius: 2,
                                py: 1.5,
                                px: 2,
                                '&.Mui-selected': {
                                    bgcolor: 'primary.main',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    '& .MuiListItemIcon-root': {
                                        color: 'white'
                                    },
                                    '&:hover': {
                                        bgcolor: 'primary.dark',
                                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                                    }
                                },
                                '&:hover': {
                                    bgcolor: 'action.hover',
                                    borderRadius: 2,
                                }
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    minWidth: 44,
                                    color: location.pathname === item.path ? 'white' : item.color
                                }}
                            >
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={
                                    <Box display="flex" alignItems="center" justifyContent="space-between">
                                        <Box>
                                            <Typography
                                                variant="body2"
                                                fontWeight={location.pathname === item.path ? 'bold' : 'medium'}
                                            >
                                                {item.text}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color={location.pathname === item.path ? 'rgba(255,255,255,0.8)' : 'text.secondary'}
                                                sx={{ display: 'block', lineHeight: 1.2 }}
                                            >
                                                {item.description}
                                            </Typography>
                                        </Box>
                                        {item.isNew && (
                                            <Chip
                                                label="NEW"
                                                size="small"
                                                sx={{
                                                    height: 20,
                                                    fontSize: '0.7rem',
                                                    bgcolor: '#4caf50',
                                                    color: 'white',
                                                    fontWeight: 'bold'
                                                }}
                                            />
                                        )}
                                        {item.isUpdated && (
                                            <Chip
                                                label="UPD"
                                                size="small"
                                                sx={{
                                                    height: 20,
                                                    fontSize: '0.7rem',
                                                    bgcolor: '#ff9800',
                                                    color: 'white',
                                                    fontWeight: 'bold'
                                                }}
                                            />
                                        )}
                                    </Box>
                                }
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            <Divider sx={{ mx: 2 }} />

            {/* Quick Stats */}
            <Box sx={{ p: 2, mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    📊 Quick Stats
                </Typography>
                <Stack spacing={1}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2">Total Samples</Typography>
                        <Chip label="124" size="small" variant="outlined" />
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2">Genre Playlists</Typography>
                        <Chip label="15" size="small" sx={{ bgcolor: '#9c27b0', color: 'white' }} />
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2">Active Users</Typography>
                        <Chip label="2.4K" size="small" color="success" />
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2">Total Downloads</Typography>
                        <Chip label="8.7K" size="small" sx={{ bgcolor: '#e91e63', color: 'white' }} />
                    </Box>
                </Stack>
            </Box>

            {/* System Info */}
            <Box sx={{ p: 2 }}>
                <Box
                    sx={{
                        p: 2,
                        bgcolor: 'success.main',
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                        color: 'white',
                        textAlign: 'center'
                    }}
                >
                    <Typography variant="body2" fontWeight="bold">
                        🚀 System Status
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        All services running smoothly
                    </Typography>
                </Box>
            </Box>

            {/* Footer */}
            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                    DJ Sample Bank v2.0
                </Typography>
                <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
                    © 2024 - Genre System
                </Typography>
            </Box>
        </Box>
    );

    return (
        <Box
            component="nav"
            sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        >
            {/* Mobile drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={onMobileClose}
                ModalProps={{
                    keepMounted: true, // Better open performance on mobile.
                }}
                sx={{
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: drawerWidth,
                        bgcolor: 'background.paper',
                        borderRight: '1px solid',
                        borderColor: 'divider',
                    },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* Desktop drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', sm: 'block' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: drawerWidth,
                        bgcolor: 'background.paper',
                        borderRight: '1px solid',
                        borderColor: 'divider',
                    },
                }}
                open
            >
                {drawerContent}
            </Drawer>
        </Box>
    );
};

export default Sidebar;