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
    MusicNote as SamplesIcon,
    CloudUpload as UploadIcon,
    PlaylistPlay as PlaylistsIcon,
    Settings as SettingsIcon,
    Analytics as AnalyticsIcon
} from '@mui/icons-material';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

const drawerWidth = 280;

const Sidebar = () => {
    const location = useLocation();

    const menuItems = [
        {
            text: 'Dashboard',
            icon: <DashboardIcon />,
            path: '/',
            description: 'Genel görünüm'
        },
        {
            text: 'Add Music',
            icon: <MusicNoteIcon />,
            path: '/add-music',
            description: 'Müzik ekle',
            isNew: true
        },
        {
            text: 'Sample Library',
            icon: <SamplesIcon />,
            path: '/samples',
            description: 'Ses örnekleri'
        },
        {
            text: 'Upload Sample',
            icon: <UploadIcon />,
            path: '/upload',
            description: 'Yeni sample yükle'
        },
        {
            text: 'Category Playlists',
            icon: <PlaylistsIcon />,
            path: '/playlists',
            description: 'Kategori playlist\'leri',
            isUpdated: true
        },
        {
            text: 'Settings',
            icon: <SettingsIcon />,
            path: '/settings',
            description: 'Ayarlar'
        }
    ];

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    bgcolor: 'background.paper',
                    borderRight: '1px solid',
                    borderColor: 'divider',
                }
            }}
        >
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
                        Profesyonel müzik yönetim sistemi
                    </Typography>
                </Box>
            </Box>

            <Divider />

            {/* Navigation Menu */}
            <List sx={{ px: 2, py: 1 }}>
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
                                    color: location.pathname === item.path ? 'white' : 'text.secondary'
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
                                                sx={{
                                                    opacity: 0.7,
                                                    color: location.pathname === item.path ? 'white' : 'text.secondary'
                                                }}
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
                                                    bgcolor: '#ff6b35',
                                                    color: 'white',
                                                    fontWeight: 'bold'
                                                }}
                                            />
                                        )}
                                        {item.isUpdated && (
                                            <Chip
                                                label="UPDATED"
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
                        <Typography variant="body2">Category Playlists</Typography>
                        <Chip label="15" size="small" sx={{ bgcolor: '#9c27b0', color: 'white' }} />
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2">Active Users</Typography>
                        <Chip label="2.4K" size="small" color="success" />
                    </Box>
                </Stack>
            </Box>

            {/* Footer */}
            <Box sx={{ mt: 'auto', p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                    DJ Sample Bank v2.0
                </Typography>
                <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
                    © 2024 - Admin Panel
                </Typography>
            </Box>
        </Drawer>
    );
};

export default Sidebar;