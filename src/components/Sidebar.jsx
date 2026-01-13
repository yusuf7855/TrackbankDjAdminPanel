import React, { useState } from 'react';
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
    Chip,
    IconButton,
    Collapse,
    Badge
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
    AdminPanelSettings as AdminIcon,
    Circle as CircleIcon,
    ExpandLess,
    ExpandMore,
    Logout as LogoutIcon,
    Menu as MenuIcon,
    Close as CloseIcon,
    TrendingUp,
    MusicNote,
    Group,
    PlayCircle,
    MicExternalOn as ArtistIcon,
    PlaylistAddCheck as ApprovalIcon,
    Category as GenreIcon,
    CardMembership as SubscriptionIcon,
    Star as PremiumIcon,
    SupportAgent as SupportIcon,
    Build as MaintenanceIcon
} from '@mui/icons-material';

const drawerWidth = 280;

// Menu items configuration - ✅ SUBSCRIPTIONS EKLENDİ
const menuItems = [
    {
        id: 'dashboard',
        title: 'Dashboard',
        icon: <DashboardIcon />,
        path: '/admin',
        description: 'Genel Bakış'
    },
    {
        id: 'music',
        title: 'Müzik Yönetimi',
        icon: <MusicAddIcon />,
        path: '/admin/music',
        description: 'Müzik Ekleme ve Düzenleme'
    },
    {
        id: 'genres',
        title: 'Genre Yönetimi',
        icon: <GenreIcon />,
        path: '/admin/genres',
        description: 'Kategori ve Resimler',
        badge: null,
        badgeColor: 'info'
    },
    {
        id: 'artists',
        title: 'Artist Yönetimi',
        icon: <ArtistIcon />,
        path: '/admin/artists',
        description: 'Sanatçı Profilleri',
        badge: null,
        badgeColor: 'warning',
        dynamicBadge: true
    },
    {
        id: 'artist-essential',
        title: 'Artist Essential',
        icon: <ApprovalIcon />,
        path: '/admin/artist-essential',
        description: 'Playlist Onay',
        badge: null,
        badgeColor: 'warning'
    },
    {
        id: 'playlists',
        title: 'Playlist Yönetimi',
        icon: <PlaylistIcon />,
        path: '/admin/playlists',
        description: 'Admin Playlist\'leri'
    },
    {
        id: 'samples',
        title: 'Sample Bank',
        icon: <SampleIcon />,
        path: '/admin/samples',
        description: 'Sample Yönetimi'
    },
    {
        id: 'store',
        title: 'Mağaza',
        icon: <StoreIcon />,
        path: '/admin/store',
        description: 'İlan ve Hak Yönetimi',
        badge: null
    },
    // ✅ YENİ: Abonelik Yönetimi
    {
        id: 'subscriptions',
        title: 'Abonelikler',
        icon: <SubscriptionIcon />,
        path: '/admin/subscriptions',
        description: 'Trial & Premium Yönetimi',
        badge: 'NEW',
        badgeColor: 'success'
    },
    {
        id: 'support',
        title: 'Destek Talepleri',
        icon: <SupportIcon />,
        path: '/admin/support',
        description: 'Kullanıcı Destek Talepleri',
        badge: 'NEW',
        badgeColor: 'warning'
    },
    {
        id: 'notifications',
        title: 'Bildirimler',
        icon: <NotificationIcon />,
        path: '/admin/notifications',
        description: 'Push Bildirimleri',
        badgeCount: 5
    },
    {
        id: 'users',
        title: 'Kullanıcılar',
        icon: <UsersIcon />,
        path: '/admin/users',
        description: 'Kullanıcı Yönetimi',
        badge: null
    },
    {
        id: 'analytics',
        title: 'Analytics',
        icon: <AnalyticsIcon />,
        path: '/admin/analytics',
        description: 'İstatistikler'
    },
    {
        id: 'maintenance',
        title: 'Bakım Modu',
        icon: <MaintenanceIcon />,
        path: '/admin/maintenance',
        description: 'Uygulama Bakım Yönetimi',
        badge: null,
        badgeColor: 'warning'
    },
    {
        id: 'settings',
        title: 'Ayarlar',
        icon: <SettingsIcon />,
        path: '/admin/settings',
        description: 'Sistem Ayarları'
    }
];

// Quick stats configuration - ✅ PREMIUM EKLENDİ
const quickStats = [
    { icon: <MusicNote />, label: 'Müzik', value: '1,247', trend: '+12%', color: '#4caf50' },
    { icon: <PlaylistIcon />, label: 'Playlist', value: '45', trend: '+5%', color: '#4caf50' },
    { icon: <Group />, label: 'Kullanıcı', value: '2.1K', trend: '+18%', color: '#4caf50' },
    { icon: <PremiumIcon />, label: 'Premium', value: '456', trend: '+25%', color: '#FFD700' }  // ✅ GÜNCELLENDİ
];

export default function AdminSidebar({ currentPath, onNavigate }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [statsCollapsed, setStatsCollapsed] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleLogout = () => {
        // Logout işlemi
        console.log('Logout');
        if (onNavigate) {
            onNavigate('/login');
        }
    };

    // Drawer içeriğini oluştur - PART 1
    const drawerHeader = (
        <Box sx={{
            p: 2.5,
            borderBottom: '1px solid #e5e5e5',
            background: '#fff'
        }}>
            {/* Logo ve Başlık */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                        sx={{
                            width: 40,
                            height: 40,
                            backgroundColor: '#000',
                            mr: 1.5
                        }}
                    >
                        <AdminIcon sx={{ fontSize: 20, color: '#fff' }} />
                    </Avatar>
                    <Box>
                        <Typography
                            variant="h6"
                            sx={{
                                fontSize: '1rem',
                                fontWeight: 800,
                                color: '#000',
                                letterSpacing: '-0.3px',
                                lineHeight: 1
                            }}
                        >
                            TrackBang
                        </Typography>
                        <Typography
                            variant="caption"
                            sx={{
                                color: '#666',
                                fontSize: '0.7rem',
                                fontWeight: 500,
                                letterSpacing: '0.5px',
                                textTransform: 'uppercase'
                            }}
                        >
                            Admin Panel
                        </Typography>
                    </Box>
                </Box>

                {/* Mobile Close Button */}
                <IconButton
                    size="small"
                    sx={{ display: { md: 'none' } }}
                    onClick={handleDrawerToggle}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>

            {/* Status Bar */}
            <Box sx={{
                mt: 2,
                p: 1,
                backgroundColor: '#f8f8f8',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircleIcon sx={{ fontSize: 8, color: '#4caf50' }} />
                    <Typography
                        variant="caption"
                        sx={{
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            color: '#333'
                        }}
                    >
                        Sistem Aktif
                    </Typography>
                </Box>
                <Chip
                    label="v1.1.0"
                    size="small"
                    sx={{
                        height: 18,
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        backgroundColor: '#000',
                        color: '#fff',
                        '& .MuiChip-label': {
                            px: 1
                        }
                    }}
                />
            </Box>
        </Box>
    );

    // Navigation Menu
    const navigationMenu = (
        <List sx={{
            flex: 1,
            py: 1,
            px: 2,
            overflowY: 'auto',
            overflowX: 'hidden',
            '&::-webkit-scrollbar': {
                width: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
                background: '#ddd',
                borderRadius: '2px',
            }
        }}>
            {menuItems.map((item) => (
                <ListItem key={item.id} disablePadding sx={{ mb: 0.3 }}>
                    <ListItemButton
                        onClick={() => onNavigate(item.path)}
                        selected={currentPath === item.path}
                        sx={{
                            borderRadius: 1.5,
                            py: 1.3,
                            px: 1.5,
                            minHeight: 46,
                            transition: 'all 0.2s ease',
                            position: 'relative',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                left: 0,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: 3,
                                height: currentPath === item.path ? '60%' : 0,
                                backgroundColor: item.id === 'subscriptions' ? '#10B981' : '#000',  // ✅ Subscription için yeşil
                                borderRadius: '0 2px 2px 0',
                                transition: 'height 0.2s ease'
                            },
                            '&.Mui-selected': {
                                backgroundColor: item.id === 'subscriptions' ? '#10B98110' : '#f5f5f5',  // ✅ Subscription için yeşil ton
                                '&:hover': {
                                    backgroundColor: item.id === 'subscriptions' ? '#10B98120' : '#efefef'
                                }
                            },
                            '&:hover:not(.Mui-selected)': {
                                backgroundColor: '#fafafa'
                            }
                        }}
                    >
                        <ListItemIcon sx={{
                            color: currentPath === item.path
                                ? (item.id === 'subscriptions' ? '#10B981' : '#000')  // ✅ Subscription için yeşil
                                : '#666',
                            minWidth: 36
                        }}>
                            <Badge
                                badgeContent={item.badgeCount}
                                color="error"
                                sx={{
                                    '& .MuiBadge-badge': {
                                        fontSize: '0.6rem',
                                        height: 14,
                                        minWidth: 14,
                                        backgroundColor: '#ff4444'
                                    }
                                }}
                            >
                                {item.icon}
                            </Badge>
                        </ListItemIcon>
                        <ListItemText
                            primary={
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontWeight: currentPath === item.path ? 700 : 500,
                                            fontSize: '0.85rem',
                                            color: currentPath === item.path
                                                ? (item.id === 'subscriptions' ? '#10B981' : '#000')  // ✅ Subscription için yeşil
                                                : '#333',
                                            letterSpacing: '0.01em'
                                        }}
                                    >
                                        {item.title}
                                    </Typography>
                                    {item.badge && (
                                        <Chip
                                            label={item.badge}
                                            size="small"
                                            sx={{
                                                height: 16,
                                                fontSize: '0.6rem',
                                                fontWeight: 700,
                                                backgroundColor: item.badgeColor === 'warning' ? '#ff9800' :
                                                    item.badgeColor === 'info' ? '#7C3AED' :
                                                        item.badgeColor === 'success' ? '#10B981' : '#000',  // ✅ success rengi
                                                color: '#fff',
                                                '& .MuiChip-label': {
                                                    px: 0.7
                                                }
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
    );

    // Stats Section
    const statsSection = (
        <Box>
            <ListItemButton
                onClick={() => setStatsCollapsed(!statsCollapsed)}
                sx={{
                    px: 2.5,
                    py: 1.2,
                    borderTop: '1px solid #e5e5e5',
                    '&:hover': { backgroundColor: '#fafafa' }
                }}
            >
                <ListItemText
                    primary={
                        <Typography
                            variant="caption"
                            sx={{
                                fontWeight: 700,
                                fontSize: '0.7rem',
                                color: '#666',
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase'
                            }}
                        >
                            İstatistikler
                        </Typography>
                    }
                />
                {statsCollapsed ? <ExpandMore sx={{ fontSize: 18 }} /> : <ExpandLess sx={{ fontSize: 18 }} />}
            </ListItemButton>

            <Collapse in={!statsCollapsed} timeout="auto" unmountOnExit>
                <Box sx={{ px: 2, pb: 2 }}>
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 1
                    }}>
                        {quickStats.map((stat, index) => (
                            <Box
                                key={index}
                                sx={{
                                    p: 1.2,
                                    backgroundColor: '#fafafa',
                                    borderRadius: 1,
                                    border: '1px solid #e5e5e5'
                                }}
                            >
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    mb: 0.5
                                }}>
                                    <Box sx={{
                                        color: stat.label === 'Premium' ? '#FFD700' : '#999',  // ✅ Premium için altın rengi
                                        '& svg': { fontSize: 14 }
                                    }}>
                                        {stat.icon}
                                    </Box>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            ml: 0.5,
                                            fontSize: '0.65rem',
                                            color: '#999',
                                            fontWeight: 500
                                        }}
                                    >
                                        {stat.label}
                                    </Typography>
                                </Box>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        fontSize: '0.95rem',
                                        fontWeight: 800,
                                        color: stat.label === 'Premium' ? '#FFD700' : '#000',  // ✅ Premium için altın rengi
                                        lineHeight: 1
                                    }}
                                >
                                    {stat.value}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        fontSize: '0.6rem',
                                        color: stat.color,
                                        fontWeight: 600
                                    }}
                                >
                                    {stat.trend}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Collapse>
        </Box>
    );

    // Footer Section
    const footerSection = (
        <Box>
            {/* Logout Button */}
            <Box sx={{
                p: 2,
                borderTop: '1px solid #e5e5e5'
            }}>
                <ListItemButton
                    onClick={handleLogout}
                    sx={{
                        borderRadius: 1.5,
                        py: 1.2,
                        px: 2,
                        backgroundColor: '#f5f5f5',
                        '&:hover': {
                            backgroundColor: '#efefef'
                        }
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 36, color: '#666' }}>
                        <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                        primary={
                            <Typography
                                variant="body2"
                                sx={{
                                    fontSize: '0.85rem',
                                    fontWeight: 500,
                                    color: '#333'
                                }}
                            >
                                Çıkış Yap
                            </Typography>
                        }
                    />
                </ListItemButton>
            </Box>

            {/* Copyright */}
            <Box sx={{
                p: 2,
                backgroundColor: '#fafafa',
                borderTop: '1px solid #e5e5e5',
                textAlign: 'center'
            }}>
                <Typography
                    variant="caption"
                    sx={{
                        fontSize: '0.65rem',
                        color: '#999',
                        display: 'block'
                    }}
                >
                    © 2024 TrackBang
                </Typography>
            </Box>
        </Box>
    );

    // Complete drawer content
    const drawerContent = (
        <Box sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#ffffff'
        }}>
            {drawerHeader}
            {navigationMenu}
            {statsSection}
            {footerSection}
        </Box>
    );

    // Main return
    return (
        <>
            {/* Desktop Drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        borderRight: '1px solid #e5e5e5',
                        boxShadow: 'none'
                    },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true
                }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box'
                    },
                }}
            >
                {drawerContent}
            </Drawer>
        </>
    );
}