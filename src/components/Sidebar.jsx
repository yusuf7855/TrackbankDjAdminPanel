import React from 'react';
import {
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    Box,
    Divider,
    Avatar,
    Chip
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    QueueMusic as PlaylistIcon,
    LibraryAdd as MusicAddIcon,
    Notifications as NotificationIcon,
    Store as StoreIcon,
    LibraryMusic as SampleIcon,
    Settings as SettingsIcon,
    People as UsersIcon,
    Analytics as AnalyticsIcon,
    AdminPanelSettings as AdminIcon
} from '@mui/icons-material';

const drawerWidth = 280;

const menuItems = [
    {
        title: 'Dashboard',
        icon: <DashboardIcon />,
        path: '/admin',
        description: 'Genel Bakış',
        color: '#667eea'
    },
    {
        title: 'Müzik Ekleme',
        icon: <MusicAddIcon />,
        path: '/admin/music',
        description: 'Spotify Müzik Ekleme',
        color: '#1db954', // Spotify yeşili
        isNew: false
    },
    {
        title: 'Playlist Yönetimi',
        icon: <PlaylistIcon />,
        path: '/admin/playlists',
        description: 'Admin Playlist\'leri',
        color: '#764ba2'
    },
    {
        title: 'Sample Bank',
        icon: <SampleIcon />,
        path: '/admin/samples',
        description: 'Sample Yönetimi',
        color: '#f093fb'
    },
    {
        title: 'Mağaza Yönetimi',
        icon: <StoreIcon />,
        path: '/admin/store',
        description: 'İlan ve Hak Yönetimi',
        color: '#48c78e',
        isNew: true // Yeni özellik badge'i için
    },
    {
        title: 'Bildirimler',
        icon: <NotificationIcon />,
        path: '/admin/notifications',
        description: 'Push Bildirimleri',
        color: '#ffdd57'
    },
    {
        title: 'Kullanıcılar',
        icon: <UsersIcon />,
        path: '/admin/users',
        description: 'Kullanıcı Yönetimi',
        color: '#ff7675'
    },
    {
        title: 'Analytics',
        icon: <AnalyticsIcon />,
        path: '/admin/analytics',
        description: 'İstatistikler',
        color: '#00b894'
    },
    {
        title: 'Ayarlar',
        icon: <SettingsIcon />,
        path: '/admin/settings',
        description: 'Sistem Ayarları',
        color: '#636e72'
    }
];

export default function AdminSidebar({ currentPath, onNavigate }) {
    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    borderRight: 'none',
                    boxShadow: '4px 0 20px rgba(0,0,0,0.1)'
                },
            }}
        >
            {/* Logo/Header */}
            <Box sx={{
                p: 3,
                textAlign: 'center',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)'
            }}>
                <Avatar
                    sx={{
                        width: 60,
                        height: 60,
                        mx: 'auto',
                        mb: 2,
                        background: 'rgba(255,255,255,0.2)',
                        fontSize: '2rem'
                    }}
                >
                    🎵
                </Avatar>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>
                    DJ Mobile Admin
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.85rem' }}>
                    Yönetim Paneli v1.0
                </Typography>
                <Chip
                    label="Admin"
                    size="small"
                    icon={<AdminIcon sx={{ fontSize: '0.8rem !important' }} />}
                    sx={{
                        mt: 1,
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        fontSize: '0.75rem'
                    }}
                />
            </Box>

            {/* Navigation Menu */}
            <List sx={{ flex: 1, p: 2 }}>
                {menuItems.map((item) => (
                    <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
                        <ListItemButton
                            onClick={() => onNavigate(item.path)}
                            selected={currentPath === item.path}
                            sx={{
                                borderRadius: 2,
                                py: 1.5,
                                px: 2,
                                position: 'relative',
                                overflow: 'hidden',
                                transition: 'all 0.3s ease',
                                '&.Mui-selected': {
                                    background: `linear-gradient(135deg, ${item.color}40 0%, ${item.color}20 100%)`,
                                    backdropFilter: 'blur(10px)',
                                    border: `1px solid ${item.color}60`,
                                    transform: 'translateX(8px)',
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        left: 0,
                                        top: 0,
                                        bottom: 0,
                                        width: 4,
                                        background: item.color,
                                        borderRadius: '0 2px 2px 0'
                                    }
                                },
                                '&:hover:not(.Mui-selected)': {
                                    background: 'rgba(255,255,255,0.1)',
                                    backdropFilter: 'blur(5px)',
                                    transform: 'translateX(4px)'
                                }
                            }}
                        >
                            <ListItemIcon sx={{
                                color: 'inherit',
                                minWidth: 40,
                                '& svg': {
                                    fontSize: '1.3rem',
                                    filter: currentPath === item.path ? `drop-shadow(0 0 8px ${item.color})` : 'none'
                                }
                            }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body2" fontWeight={currentPath === item.path ? 600 : 500}>
                                            {item.title}
                                        </Typography>
                                        {item.isNew && (
                                            <Chip
                                                label="NEW"
                                                size="small"
                                                sx={{
                                                    height: 16,
                                                    fontSize: '0.65rem',
                                                    bgcolor: '#ff4757',
                                                    color: 'white',
                                                    fontWeight: 'bold'
                                                }}
                                            />
                                        )}
                                    </Box>
                                }
                                secondary={
                                    <Typography variant="caption" sx={{
                                        opacity: 0.7,
                                        fontSize: '0.7rem',
                                        display: currentPath === item.path ? 'block' : 'none'
                                    }}>
                                        {item.description}
                                    </Typography>
                                }
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            {/* Stats Section */}
            <Box sx={{
                mx: 2,
                mb: 2,
                p: 2,
                bgcolor: 'rgba(0,0,0,0.2)',
                borderRadius: 2,
                backdropFilter: 'blur(10px)'
            }}>
                <Typography variant="h6" sx={{ mb: 2, fontSize: '0.9rem', fontWeight: 600 }}>
                    Hızlı İstatistikler
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ fontSize: '0.8rem', opacity: 0.8 }}>
                            Toplam Müzik
                        </Typography>
                        <Chip
                            label="1,247"
                            size="small"
                            sx={{
                                bgcolor: 'rgba(255,255,255,0.2)',
                                color: 'white',
                                fontSize: '0.7rem',
                                height: 20
                            }}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ fontSize: '0.8rem', opacity: 0.8 }}>
                            Aktif Playlist
                        </Typography>
                        <Chip
                            label="45"
                            size="small"
                            sx={{
                                bgcolor: 'rgba(255,255,255,0.2)',
                                color: 'white',
                                fontSize: '0.7rem',
                                height: 20
                            }}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ fontSize: '0.8rem', opacity: 0.8 }}>
                            Aktif Kullanıcı
                        </Typography>
                        <Chip
                            label="142"
                            size="small"
                            sx={{
                                bgcolor: 'rgba(255,255,255,0.2)',
                                color: 'white',
                                fontSize: '0.7rem',
                                height: 20
                            }}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ fontSize: '0.8rem', opacity: 0.8 }}>
                            Günlük İndirme
                        </Typography>
                        <Chip
                            label="89"
                            size="small"
                            sx={{
                                bgcolor: 'rgba(255,255,255,0.2)',
                                color: 'white',
                                fontSize: '0.7rem',
                                height: 20
                            }}
                        />
                    </Box>
                </Box>
            </Box>

            {/* Footer */}
            <Box sx={{
                p: 2,
                borderTop: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(0,0,0,0.1)'
            }}>
                <Typography variant="body2" sx={{ opacity: 0.6, textAlign: 'center', fontSize: '0.75rem' }}>
                    DJ Mobile App v1.0
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.6, textAlign: 'center', fontSize: '0.65rem' }}>
                    © 2024 Admin Panel
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                    <Chip
                        label="🟢 Online"
                        size="small"
                        sx={{
                            bgcolor: 'rgba(72, 199, 142, 0.2)',
                            color: '#48c78e',
                            fontSize: '0.65rem',
                            height: 18
                        }}
                    />
                </Box>
            </Box>
        </Drawer>
    );
}