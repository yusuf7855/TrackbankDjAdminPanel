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
    Avatar
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    MusicNote as SamplesIcon,
    CloudUpload as UploadIcon,
    PlaylistPlay as PlaylistsIcon,
    Whatshot as HotIcon,
    Settings as SettingsIcon
} from '@mui/icons-material';

const drawerWidth = 240;

const Sidebar = () => {
    const location = useLocation();

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
        { text: 'Samples', icon: <SamplesIcon />, path: '/samples' },
        { text: 'Upload', icon: <UploadIcon />, path: '/upload' },
        { text: 'Playlists', icon: <PlaylistsIcon />, path: '/playlists' },
        { text: 'HOT', icon: <HotIcon />, path: '/hot' },
        { text: 'Settings', icon: <SettingsIcon />, path: '/settings' }
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
                    bgcolor: 'background.paper'
                }
            }}
        >
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                <Avatar
                    sx={{
                        width: 40,
                        height: 40,
                        mr: 2,
                        bgcolor: 'primary.main'
                    }}
                >
                    SB
                </Avatar>
                <Typography variant="h6" noWrap>
                    Sample Bank
                </Typography>
            </Box>
            <Divider />
            <List>
                {menuItems.map((item) => (
                    <ListItem
                        key={item.text}
                        disablePadding
                        component={Link}
                        to={item.path}
                        sx={{
                            color: 'inherit',
                            textDecoration: 'none',
                            '&.active': {
                                backgroundColor: 'primary.main',
                                color: 'primary.contrastText',
                                '& .MuiListItemIcon-root': {
                                    color: 'inherit'
                                }
                            },
                            '&:hover': {
                                backgroundColor: 'action.hover'
                            }
                        }}
                        className={location.pathname === item.path ? 'active' : ''}
                    >
                        <ListItemButton>
                            <ListItemIcon sx={{ color: 'inherit' }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Divider />
            <Box sx={{ p: 2, mt: 'auto' }}>
                <Typography variant="body2" color="text.secondary">
                    v1.0.0
                </Typography>
            </Box>
        </Drawer>
    );
};

export default Sidebar;