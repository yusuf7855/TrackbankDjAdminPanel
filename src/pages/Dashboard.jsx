import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    Stack,
    LinearProgress,
    Divider,
    Card,
    CardContent,
    Avatar,
    Chip,
    IconButton,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction
} from '@mui/material';
import {
    MusicNote as MusicNoteIcon,
    PlaylistPlay as PlaylistIcon,
    CloudDownload as DownloadIcon,
    AttachMoney as MoneyIcon,
    Whatshot as HotIcon,
    TrendingUp as TrendingIcon,
    People as PeopleIcon,
    Storage as StorageIcon,
    Refresh as RefreshIcon,
    ArrowUpward as ArrowUpIcon,
    ArrowDownward as ArrowDownIcon
} from '@mui/icons-material';
import axios from 'axios';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalSamples: 0,
        totalPlaylists: 0,
        totalDownloads: 0,
        totalRevenue: 0,
        hotPlaylists: 0,
        activeUsers: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [hotPlaylists, setHotPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch all data in parallel
            const [samplesRes, playlistsRes, hotRes] = await Promise.all([
                axios.get('http://localhost:5000/api/samples'),
                axios.get('http://localhost:5000/api/playlists/public'),
                axios.get('http://localhost:5000/api/hot')
            ]);

            setStats({
                totalSamples: samplesRes.data?.length || 0,
                totalPlaylists: playlistsRes.data?.playlists?.length || 0,
                totalDownloads: 2847, // Mock data
                totalRevenue: 1245.50, // Mock data
                hotPlaylists: hotRes.data?.hots?.length || 0,
                activeUsers: 2400 // Mock data
            });

            setHotPlaylists(hotRes.data?.hots?.slice(0, 5) || []);

            // Mock recent activity
            setRecentActivity([
                {
                    type: 'sample',
                    name: 'Afro Deep Rhythms',
                    action: 'uploaded',
                    time: '2 saat önce',
                    category: 'Afro House'
                },
                {
                    type: 'hot',
                    name: 'Summer Vibes 2024',
                    action: 'created',
                    time: '4 saat önce',
                    category: 'HOT Playlist'
                },
                {
                    type: 'download',
                    name: 'Organic Groove Pack',
                    action: 'downloaded',
                    time: '6 saat önce',
                    category: 'Organic House'
                },
                {
                    type: 'playlist',
                    name: 'Indie Dance Collection',
                    action: 'updated',
                    time: '1 gün önce',
                    category: 'Indie Dance'
                }
            ]);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, icon, color, trend, trendValue }) => (
        <Card
            sx={{
                height: '100%',
                background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
                border: `1px solid ${color}20`,
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 25px ${color}20`
                }
            }}
        >
            <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar
                        sx={{
                            bgcolor: color,
                            width: 56,
                            height: 56,
                            boxShadow: `0 4px 12px ${color}40`
                        }}
                    >
                        {icon}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h4" fontWeight="bold" color="text.primary">
                            {typeof value === 'number' && value > 1000
                                ? `${(value/1000).toFixed(1)}K`
                                : value
                            }
                        </Typography>
                        <Typography variant="body2" color="text.secondary" fontWeight="medium">
                            {title}
                        </Typography>
                        {trend && (
                            <Box display="flex" alignItems="center" mt={1}>
                                {trend === 'up' ? (
                                    <ArrowUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
                                ) : (
                                    <ArrowDownIcon sx={{ fontSize: 16, color: 'error.main' }} />
                                )}
                                <Typography
                                    variant="caption"
                                    color={trend === 'up' ? 'success.main' : 'error.main'}
                                    fontWeight="bold"
                                    ml={0.5}
                                >
                                    {trendValue}%
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <Stack alignItems="center" spacing={2}>
                    <Typography variant="h5">Dashboard Yükleniyor...</Typography>
                    <LinearProgress sx={{ width: 200 }} />
                </Stack>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Dashboard
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Hoş geldiniz! İşte sistemin genel durumu
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={fetchDashboardData}
                    sx={{ borderRadius: 2 }}
                >
                    Yenile
                </Button>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard
                        title="Total Samples"
                        value={stats.totalSamples}
                        icon={<MusicNoteIcon />}
                        color="#1976d2"
                        trend="up"
                        trendValue="12"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard
                        title="HOT Playlists"
                        value={stats.hotPlaylists}
                        icon={<HotIcon />}
                        color="#ff6b35"
                        trend="up"
                        trendValue="25"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard
                        title="Total Downloads"
                        value={stats.totalDownloads}
                        icon={<DownloadIcon />}
                        color="#4caf50"
                        trend="up"
                        trendValue="8"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard
                        title="Playlists"
                        value={stats.totalPlaylists}
                        icon={<PlaylistIcon />}
                        color="#9c27b0"
                        trend="up"
                        trendValue="15"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard
                        title="Revenue"
                        value={`$${stats.totalRevenue}`}
                        icon={<MoneyIcon />}
                        color="#ff9800"
                        trend="up"
                        trendValue="22"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard
                        title="Active Users"
                        value={stats.activeUsers}
                        icon={<PeopleIcon />}
                        color="#607d8b"
                        trend="up"
                        trendValue="5"
                    />
                </Grid>
            </Grid>

            {/* Content Grid */}
            <Grid container spacing={3}>
                {/* Recent Activity */}
                <Grid item xs={12} md={7}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={3}>
                                <TrendingIcon sx={{ mr: 1, color: 'primary.main' }} />
                                <Typography variant="h6" fontWeight="bold">
                                    Son Aktiviteler
                                </Typography>
                            </Box>
                            <List>
                                {recentActivity.map((activity, index) => (
                                    <ListItem key={index} divider={index < recentActivity.length - 1}>
                                        <Avatar
                                            sx={{
                                                mr: 2,
                                                bgcolor: activity.type === 'sample' ? '#1976d2' :
                                                    activity.type === 'hot' ? '#ff6b35' :
                                                        activity.type === 'download' ? '#4caf50' : '#9c27b0',
                                                width: 40,
                                                height: 40
                                            }}
                                        >
                                            {activity.type === 'sample' ? <MusicNoteIcon /> :
                                                activity.type === 'hot' ? <HotIcon /> :
                                                    activity.type === 'download' ? <DownloadIcon /> : <PlaylistIcon />}
                                        </Avatar>
                                        <ListItemText
                                            primary={
                                                <Typography variant="body1" fontWeight="medium">
                                                    {activity.name}
                                                </Typography>
                                            }
                                            secondary={
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {activity.action} • {activity.time}
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                        <ListItemSecondaryAction>
                                            <Chip
                                                label={activity.category}
                                                size="small"
                                                variant="outlined"
                                                sx={{
                                                    borderColor: activity.type === 'sample' ? '#1976d2' :
                                                        activity.type === 'hot' ? '#ff6b35' :
                                                            activity.type === 'download' ? '#4caf50' : '#9c27b0',
                                                    color: activity.type === 'sample' ? '#1976d2' :
                                                        activity.type === 'hot' ? '#ff6b35' :
                                                            activity.type === 'download' ? '#4caf50' : '#9c27b0'
                                                }}
                                            />
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                {/* HOT Playlists & System Status */}
                <Grid item xs={12} md={5}>
                    <Stack spacing={3}>
                        {/* HOT Playlists */}
                        <Card>
                            <CardContent>
                                <Box display="flex" alignItems="center" mb={2}>
                                    <HotIcon sx={{ mr: 1, color: '#ff6b35' }} />
                                    <Typography variant="h6" fontWeight="bold">
                                        Aktif HOT Playlists
                                    </Typography>
                                </Box>
                                <Stack spacing={2}>
                                    {hotPlaylists.filter(hot => hot.isActive).slice(0, 3).map((hot) => (
                                        <Box
                                            key={hot._id}
                                            sx={{
                                                p: 2,
                                                bgcolor: 'grey.50',
                                                borderRadius: 2,
                                                border: '1px solid',
                                                borderColor: 'grey.200'
                                            }}
                                        >
                                            <Typography variant="subtitle2" fontWeight="bold">
                                                {hot.name}
                                            </Typography>
                                            <Box display="flex" alignItems="center" justifyContent="space-between" mt={1}>
                                                <Typography variant="body2" color="text.secondary">
                                                    {hot.musicCount || 0} şarkı
                                                </Typography>
                                                <Chip
                                                    label={hot.category === 'all' ? 'All Genres' : hot.category}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: '#ff6b35',
                                                        color: 'white',
                                                        fontWeight: 'bold'
                                                    }}
                                                />
                                            </Box>
                                        </Box>
                                    ))}
                                </Stack>
                            </CardContent>
                        </Card>

                        {/* System Status */}
                        <Card>
                            <CardContent>
                                <Box display="flex" alignItems="center" mb={3}>
                                    <StorageIcon sx={{ mr: 1, color: 'primary.main' }} />
                                    <Typography variant="h6" fontWeight="bold">
                                        Sistem Durumu
                                    </Typography>
                                </Box>
                                <Stack spacing={2}>
                                    <Box>
                                        <Box display="flex" justifyContent="space-between" mb={1}>
                                            <Typography variant="body2" fontWeight="medium">
                                                Depolama Kullanımı
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                4.2 GB / 10 GB
                                            </Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={42}
                                            sx={{
                                                height: 8,
                                                borderRadius: 4,
                                                bgcolor: 'grey.200',
                                                '& .MuiLinearProgress-bar': {
                                                    borderRadius: 4,
                                                    bgcolor: 'primary.main'
                                                }
                                            }}
                                        />
                                    </Box>
                                    <Divider />
                                    <Stack spacing={1}>
                                        <Box display="flex" justifyContent="space-between">
                                            <Typography variant="body2">Audio Files</Typography>
                                            <Typography variant="body2" fontWeight="bold">3.1 GB</Typography>
                                        </Box>
                                        <Box display="flex" justifyContent="space-between">
                                            <Typography variant="body2">Thumbnails</Typography>
                                            <Typography variant="body2" fontWeight="bold">0.8 GB</Typography>
                                        </Box>
                                        <Box display="flex" justifyContent="space-between">
                                            <Typography variant="body2">Other</Typography>
                                            <Typography variant="body2" fontWeight="bold">0.3 GB</Typography>
                                        </Box>
                                    </Stack>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;