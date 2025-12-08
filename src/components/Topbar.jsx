import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Badge,
    Avatar,
    Menu,
    MenuItem,
    Box,
    Divider,
    ListItemIcon,
    ListItemText,
    Tooltip,
    Chip
} from '@mui/material';
import {
    Menu as MenuIcon,
    Notifications as NotificationsIcon,
    Mail as MailIcon,
    Person as PersonIcon,
    Settings as SettingsIcon,
    Logout as LogoutIcon,
    Search as SearchIcon,
    DarkMode as DarkModeIcon,
    LightMode as LightModeIcon,
    AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { useLocation } from 'react-router-dom';

const Topbar = ({ onMenuClick }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [notificationAnchor, setNotificationAnchor] = useState(null);
    const location = useLocation();

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleNotificationMenu = (event) => {
        setNotificationAnchor(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
        setNotificationAnchor(null);
    };

    // Sayfa başlığını al - ✅ SUBSCRIPTIONS EKLENDİ
    const getPageTitle = () => {
        const path = location.pathname;
        const titles = {
            '/admin': 'Dashboard',
            '/admin/music': 'Müzik Yönetimi',
            '/admin/playlists': 'Playlist Yönetimi',
            '/admin/samples': 'Sample Bank',
            '/admin/store': 'Mağaza Yönetimi',
            '/admin/notifications': 'Bildirimler',
            '/admin/users': 'Kullanıcı Yönetimi',
            '/admin/artists': 'Artist Yönetimi',
            '/admin/artist-essential': 'Artist Essential',
            '/admin/genres': 'Genre Yönetimi',
            '/admin/subscriptions': 'Abonelik Yönetimi',  // ✅ YENİ
            '/admin/analytics': 'Analytics',
            '/admin/settings': 'Ayarlar'
        };
        return titles[path] || 'Admin Panel';
    };

    // Mock notifications - ✅ SUBSCRIPTION BİLDİRİMİ EKLENDİ
    const notifications = [
        { id: 1, title: 'Yeni müzik eklendi', time: '2 dakika önce', read: false },
        { id: 2, title: 'Sistem güncellendi', time: '1 saat önce', read: false },
        { id: 3, title: 'Yeni kullanıcı kaydı', time: '3 saat önce', read: true },
        { id: 4, title: 'Playlist onaylandı', time: '5 saat önce', read: true },
        { id: 5, title: '12 trial süresi dolmak üzere', time: '6 saat önce', read: false },  // ✅ YENİ
        { id: 6, title: '5 yeni premium abonelik', time: '1 gün önce', read: true }  // ✅ YENİ
    ];

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <AppBar
            position="fixed"
            elevation={0}
            sx={{
                width: { xs: '100%', md: 'calc(100% - 280px)' },
                ml: { xs: 0, md: '280px' },
                backgroundColor: '#ffffff',
                borderBottom: '1px solid #e5e5e5',
                color: '#000'
            }}
        >
            <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
                {/* Mobile Menu Button */}
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={onMenuClick}
                    sx={{
                        mr: 2,
                        display: { md: 'none' },
                        color: '#333'
                    }}
                >
                    <MenuIcon />
                </IconButton>

                {/* Page Title */}
                <Box sx={{ flexGrow: 1 }}>
                    <Typography
                        variant="h6"
                        noWrap
                        component="div"
                        sx={{
                            fontWeight: 700,
                            fontSize: '1.1rem',
                            color: '#000',
                            letterSpacing: '-0.3px'
                        }}
                    >
                        {getPageTitle()}
                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{
                            color: '#666',
                            fontSize: '0.7rem',
                            fontWeight: 500,
                            letterSpacing: '0.5px'
                        }}
                    >
                        TrackBang Admin Panel
                    </Typography>
                </Box>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {/* Search Button */}
                    <Tooltip title="Ara">
                        <IconButton
                            size="large"
                            sx={{
                                color: '#666',
                                '&:hover': {
                                    backgroundColor: '#f5f5f5'
                                }
                            }}
                        >
                            <SearchIcon />
                        </IconButton>
                    </Tooltip>

                    {/* Notifications */}
                    <Tooltip title="Bildirimler">
                        <IconButton
                            size="large"
                            onClick={handleNotificationMenu}
                            sx={{
                                color: '#666',
                                '&:hover': {
                                    backgroundColor: '#f5f5f5'
                                }
                            }}
                        >
                            <Badge
                                badgeContent={unreadCount}
                                sx={{
                                    '& .MuiBadge-badge': {
                                        backgroundColor: '#000',
                                        color: '#fff',
                                        fontSize: '0.65rem',
                                        height: 18,
                                        minWidth: 18
                                    }
                                }}
                            >
                                <NotificationsIcon />
                            </Badge>
                        </IconButton>
                    </Tooltip>

                    <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: '#e5e5e5' }} />

                    {/* User Menu */}
                    <Box
                        onClick={handleMenu}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            cursor: 'pointer',
                            px: 1,
                            py: 0.5,
                            borderRadius: 2,
                            transition: 'background-color 0.2s',
                            '&:hover': {
                                backgroundColor: '#f5f5f5'
                            }
                        }}
                    >
                        <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                            <Typography
                                variant="body2"
                                sx={{
                                    fontWeight: 600,
                                    fontSize: '0.85rem',
                                    color: '#000'
                                }}
                            >
                                Admin User
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{
                                    color: '#666',
                                    fontSize: '0.7rem'
                                }}
                            >
                                Super Admin
                            </Typography>
                        </Box>
                        <Avatar
                            sx={{
                                width: 36,
                                height: 36,
                                backgroundColor: '#000',
                                fontSize: '0.85rem',
                                fontWeight: 600
                            }}
                        >
                            A
                        </Avatar>
                    </Box>
                </Box>

                {/* Notifications Menu */}
                <Menu
                    anchorEl={notificationAnchor}
                    open={Boolean(notificationAnchor)}
                    onClose={handleClose}
                    PaperProps={{
                        sx: {
                            mt: 1.5,
                            minWidth: 320,
                            maxHeight: 400,
                            border: '1px solid #e5e5e5',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                        }
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                    <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #e5e5e5' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            Bildirimler
                        </Typography>
                        {unreadCount > 0 && (
                            <Chip
                                label={`${unreadCount} yeni`}
                                size="small"
                                sx={{
                                    mt: 0.5,
                                    height: 20,
                                    fontSize: '0.65rem',
                                    backgroundColor: '#000',
                                    color: '#fff'
                                }}
                            />
                        )}
                    </Box>
                    {notifications.map((notification, index) => (
                        <MenuItem
                            key={notification.id}
                            onClick={handleClose}
                            sx={{
                                py: 1.5,
                                px: 2,
                                backgroundColor: !notification.read ? '#fafafa' : 'transparent',
                                borderBottom: index < notifications.length - 1 ? '1px solid #f0f0f0' : 'none',
                                '&:hover': {
                                    backgroundColor: '#f5f5f5'
                                }
                            }}
                        >
                            <Box sx={{ width: '100%' }}>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight: notification.read ? 400 : 600,
                                        fontSize: '0.85rem',
                                        color: '#000'
                                    }}
                                >
                                    {notification.title}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: '#666',
                                        fontSize: '0.7rem'
                                    }}
                                >
                                    {notification.time}
                                </Typography>
                            </Box>
                        </MenuItem>
                    ))}
                    <Box sx={{ p: 1, borderTop: '1px solid #e5e5e5' }}>
                        <Typography
                            variant="caption"
                            sx={{
                                display: 'block',
                                textAlign: 'center',
                                color: '#666',
                                cursor: 'pointer',
                                '&:hover': {
                                    color: '#000'
                                }
                            }}
                            onClick={() => {
                                handleClose();
                                // Navigate to notifications
                            }}
                        >
                            Tüm bildirimleri gör
                        </Typography>
                    </Box>
                </Menu>

                {/* User Menu */}
                <Menu
                    id="menu-appbar"
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    PaperProps={{
                        sx: {
                            mt: 1.5,
                            minWidth: 200,
                            border: '1px solid #e5e5e5',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                        }
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                    <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #e5e5e5' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#000' }}>
                            Admin User
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666' }}>
                            admin@trackbang.com
                        </Typography>
                    </Box>

                    <MenuItem
                        onClick={handleClose}
                        sx={{
                            py: 1.2,
                            '&:hover': {
                                backgroundColor: '#f5f5f5'
                            }
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                            <PersonIcon fontSize="small" sx={{ color: '#666' }} />
                        </ListItemIcon>
                        <ListItemText
                            primary={
                                <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                                    Profil
                                </Typography>
                            }
                        />
                    </MenuItem>

                    <MenuItem
                        onClick={handleClose}
                        sx={{
                            py: 1.2,
                            '&:hover': {
                                backgroundColor: '#f5f5f5'
                            }
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                            <SettingsIcon fontSize="small" sx={{ color: '#666' }} />
                        </ListItemIcon>
                        <ListItemText
                            primary={
                                <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                                    Ayarlar
                                </Typography>
                            }
                        />
                    </MenuItem>

                    <Divider sx={{ my: 0.5 }} />

                    <MenuItem
                        onClick={handleClose}
                        sx={{
                            py: 1.2,
                            '&:hover': {
                                backgroundColor: '#f5f5f5'
                            }
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                            <LogoutIcon fontSize="small" sx={{ color: '#ff4444' }} />
                        </ListItemIcon>
                        <ListItemText
                            primary={
                                <Typography variant="body2" sx={{ fontSize: '0.85rem', color: '#ff4444' }}>
                                    Çıkış Yap
                                </Typography>
                            }
                        />
                    </MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
};

export default Topbar;