import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Avatar,
    Paper,
    LinearProgress,
    Chip,
    IconButton,
    Tooltip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Alert,
    CircularProgress,
    Fade,
    Grow
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    QueueMusic as PlaylistIcon,
    LibraryMusic as SampleIcon,
    Store as StoreIcon,
    TrendingUp as TrendingUpIcon,
    People as PeopleIcon,
    Notifications as NotificationIcon,
    Euro as EuroIcon,
    Visibility as VisibilityIcon,
    Download as DownloadIcon,
    Refresh as RefreshIcon,
    Speed as SpeedIcon,
    AccessTime as AccessTimeIcon,
    LocalOffer as LocalOfferIcon,
    Phone as PhoneIcon,
    CloudUpload as CloudUploadIcon,
    Psychology as PsychologyIcon
} from '@mui/icons-material';

const API_BASE = 'http://192.168.1.106:5000/api';

export default function Dashboard() {
    const [stats, setStats] = useState({
        playlists: { total: 0, admin: 0, user: 0 },
        samples: { total: 0, free: 0, paid: 0, downloads: 0 },
        store: { totalListings: 0, activeListings: 0, revenue: 0, expiredListings: 0 },
        notifications: { sent: 0, delivered: 0, deliveryRate: 0 },
        users: { total: 0, active: 0, newToday: 0 }
    });

    const [recentActivity, setRecentActivity] = useState([]);
    const [systemHealth, setSystemHealth] = useState({
        status: 'healthy',
        uptime: '99.9%',
        responseTime: '245ms',
        activeConnections: 142
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadDashboardData();

        // Auto-refresh every 30 seconds
        const interval = setInterval(loadDashboardData, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadDashboardData = async () => {
        if (!loading) setRefreshing(true);

        try {
            setError(null);

            // Paralel olarak tüm verileri yükle
            const [playlistsRes, samplesRes, storeRes, notificationsRes] = await Promise.all([
                fetch(`${API_BASE}/playlists/admin`).catch(() => ({ json: () => ({}) })),
                fetch(`${API_BASE}/samples/stats`).catch(() => ({ json: () => ({}) })),
                fetch(`${API_BASE}/store/admin/stats`).catch(() => ({ json: () => ({}) })),
                fetch(`${API_BASE}/notifications/stats`).catch(() => ({ json: () => ({}) }))
            ]);

            const [playlistsData, samplesData, storeData, notificationsData] = await Promise.all([
                playlistsRes.json(),
                samplesRes.json(),
                storeRes.json(),
                notificationsRes.json()
            ]);

            // Stats güncelle
            setStats({
                playlists: {
                    total: playlistsData.pagination?.total || 0,
                    admin: playlistsData.playlists?.length || 0,
                    user: Math.floor(Math.random() * 50) + 20 // Mock data
                },
                samples: {
                    total: samplesData.totalSamples || 0,
                    free: samplesData.freeSamples || 0,
                    paid: samplesData.paidSamples || 0,
                    downloads: samplesData.totalDownloads || 0
                },
                store: {
                    totalListings: storeData.success ? storeData.stats.totalListings : 0,
                    activeListings: storeData.success ? storeData.stats.activeListings : 0,
                    revenue: storeData.success ? storeData.stats.totalRevenue : 0,
                    expiredListings: storeData.success ? storeData.stats.expiredListings : 0
                },
                notifications: {
                    sent: notificationsData.totalSent || 0,
                    delivered: notificationsData.totalDelivered || 0,
                    deliveryRate: notificationsData.totalSent > 0 ?
                        Math.round((notificationsData.totalDelivered / notificationsData.totalSent) * 100) : 0
                },
                users: {
                    total: 248, // Mock data
                    active: 142, // Mock data
                    newToday: 12 // Mock data
                }
            });

            // Recent activity mock data with more realistic content
            setRecentActivity([
                {
                    type: 'store',
                    message: 'Yeni ilan: "Pioneer DDJ-SZ2 Professional DJ Controller"',
                    time: '2 dakika önce',
                    user: 'dj_producer',
                    priority: 'high'
                },
                {
                    type: 'sample',
                    message: 'Sample Pack yüklendi: "Deep House Vibes Vol.3"',
                    time: '8 dakika önce',
                    user: 'sound_engineer',
                    priority: 'medium'
                },
                {
                    type: 'playlist',
                    message: 'Admin playlist güncellendi: "Melodic House MH23"',
                    time: '15 dakika önce',
                    user: 'admin',
                    priority: 'low'
                },
                {
                    type: 'notification',
                    message: 'Push bildirim: "Yeni Sample Pack Yayında!" - 287 kullanıcı',
                    time: '32 dakika önce',
                    user: 'system',
                    priority: 'medium'
                },
                {
                    type: 'user',
                    message: 'Yeni kullanıcı kaydı: "beat_maker_2024"',
                    time: '1 saat önce',
                    user: 'beat_maker_2024',
                    priority: 'low'
                },
                {
                    type: 'store',
                    message: 'İlan süresi doldu: "Yamaha HS7 Studio Monitor"',
                    time: '2 saat önce',
                    user: 'music_studio',
                    priority: 'medium'
                }
            ]);

            // System health update
            setSystemHealth({
                status: 'healthy',
                uptime: '99.97%',
                responseTime: Math.floor(Math.random() * 100) + 200 + 'ms',
                activeConnections: Math.floor(Math.random() * 50) + 120
            });

        } catch (error) {
            console.error('Dashboard verileri yüklenirken hata:', error);
            setError('Dashboard verileri yüklenirken bir hata oluştu');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const getActivityIcon = (type) => {
        switch (type) {
            case 'store': return <StoreIcon sx={{ fontSize: 16 }} />;
            case 'sample': return <SampleIcon sx={{ fontSize: 16 }} />;
            case 'playlist': return <PlaylistIcon sx={{ fontSize: 16 }} />;
            case 'notification': return <NotificationIcon sx={{ fontSize: 16 }} />;
            case 'user': return <PeopleIcon sx={{ fontSize: 16 }} />;
            default: return <DashboardIcon sx={{ fontSize: 16 }} />;
        }
    };

    const getActivityColor = (type) => {
        switch (type) {
            case 'store': return '#48c78e';
            case 'sample': return '#667eea';
            case 'playlist': return '#764ba2';
            case 'notification': return '#ffdd57';
            case 'user': return '#f093fb';
            default: return '#636e72';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'error';
            case 'medium': return 'warning';
            case 'low': return 'success';
            default: return 'default';
        }
    };

    if (loading) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                flexDirection: 'column',
                gap: 2
            }}>
                <CircularProgress size={60} />
                <Typography variant="h6" color="text.secondary">
                    Dashboard yükleniyor...
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
            {/* Header */}
            <Fade in timeout={800}>
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{
                            background: 'linear-gradient(135deg, #667eea, #764ba2)',
                            backgroundClip: 'text',
                            textFillColor: 'transparent',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            DJ Mobile Dashboard
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Hoş geldiniz! Sistemin genel durumunu buradan takip edebilirsiniz.
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Chip
                            icon={<SpeedIcon />}
                            label={systemHealth.responseTime}
                            color="success"
                            variant="outlined"
                        />
                        <Tooltip title="Verileri Yenile">
                            <IconButton
                                onClick={loadDashboardData}
                                color="primary"
                                disabled={refreshing}
                                sx={{
                                    animation: refreshing ? 'spin 1s linear infinite' : 'none',
                                    '@keyframes spin': {
                                        '0%': { transform: 'rotate(0deg)' },
                                        '100%': { transform: 'rotate(360deg)' }
                                    }
                                }}
                            >
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
            </Fade>

            {/* Error Alert */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* System Health */}
            <Grow in timeout={600}>
                <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white' }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                                    <PsychologyIcon />
                                </Avatar>
                                <Box>
                                    <Typography variant="h6" fontWeight="bold">
                                        Sistem Durumu: {systemHealth.status === 'healthy' ? 'Sağlıklı' : 'Sorunlu'}
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                        Uptime: {systemHealth.uptime} | Aktif Bağlantı: {systemHealth.activeConnections}
                                    </Typography>
                                </Box>
                            </Box>
                            <Chip
                                label="🟢 Online"
                                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                            />
                        </Box>
                    </CardContent>
                </Card>
            </Grow>

            {/* Main Stats Grid */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Playlists */}
                <Grid item xs={12} sm={6} md={3}>
                    <Grow in timeout={800}>
                        <Card sx={{ height: '100%', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-4px)' } }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Avatar sx={{ bgcolor: '#764ba2', mr: 2 }}>
                                        <PlaylistIcon />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h4" fontWeight="bold" color="#764ba2">
                                            {stats.playlists.total}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Toplam Playlist
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    <Chip label={`Admin: ${stats.playlists.admin}`} size="small" color="primary" />
                                    <Chip label={`Kullanıcı: ${stats.playlists.user}`} size="small" variant="outlined" />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grow>
                </Grid>

                {/* Samples */}
                <Grid item xs={12} sm={6} md={3}>
                    <Grow in timeout={1000}>
                        <Card sx={{ height: '100%', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-4px)' } }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Avatar sx={{ bgcolor: '#667eea', mr: 2 }}>
                                        <SampleIcon />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h4" fontWeight="bold" color="#667eea">
                                            {stats.samples.total}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Toplam Sample
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                                    <Chip label={`Ücretsiz: ${stats.samples.free}`} size="small" color="success" />
                                    <Chip label={`Ücretli: ${stats.samples.paid}`} size="small" color="warning" />
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <DownloadIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                    <Typography variant="caption">{stats.samples.downloads} indirme</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grow>
                </Grid>

                {/* Store */}
                <Grid item xs={12} sm={6} md={3}>
                    <Grow in timeout={1200}>
                        <Card sx={{
                            height: '100%',
                            transition: 'transform 0.3s',
                            '&:hover': { transform: 'translateY(-4px)' },
                            background: 'linear-gradient(135deg, #48c78e, #00b894)',
                            color: 'white'
                        }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2 }}>
                                        <StoreIcon />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h4" fontWeight="bold">
                                            {stats.store.totalListings}
                                        </Typography>
                                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                            Toplam İlan
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                                    <Chip
                                        label={`Aktif: ${stats.store.activeListings}`}
                                        size="small"
                                        sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                                    />
                                    <Chip
                                        label={`Süresi Dolmuş: ${stats.store.expiredListings}`}
                                        size="small"
                                        sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <EuroIcon sx={{ fontSize: 14 }} />
                                    <Typography variant="caption">€{stats.store.revenue.toFixed(2)} gelir</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grow>
                </Grid>

                {/* Users */}
                <Grid item xs={12} sm={6} md={3}>
                    <Grow in timeout={1400}>
                        <Card sx={{ height: '100%', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-4px)' } }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Avatar sx={{ bgcolor: '#f093fb', mr: 2 }}>
                                        <PeopleIcon />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h4" fontWeight="bold" color="#f093fb">
                                            {stats.users.total}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Toplam Kullanıcı
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                                    <Chip label={`Aktif: ${stats.users.active}`} size="small" color="success" />
                                    <Chip label={`Bugün: +${stats.users.newToday}`} size="small" color="info" />
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <TrendingUpIcon sx={{ fontSize: 14, color: 'success.main' }} />
                                    <Typography variant="caption" color="success.main">
                                        %{Math.round((stats.users.active / stats.users.total) * 100)} aktif oran
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grow>
                </Grid>
            </Grid>

            {/* Secondary Stats */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Notifications */}
                <Grid item xs={12} md={6}>
                    <Fade in timeout={1000}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <NotificationIcon color="warning" />
                                    Bildirim İstatistikleri
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <Avatar sx={{ bgcolor: '#ffdd57', color: '#333' }}>
                                        <NotificationIcon />
                                    </Avatar>
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography variant="h4" fontWeight="bold" color="#ffdd57">
                                            {stats.notifications.sent}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Gönderilen Bildirim
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2">Teslimat Oranı</Typography>
                                    <Typography variant="body2" fontWeight="medium" color="success.main">
                                        %{stats.notifications.deliveryRate}
                                    </Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={stats.notifications.deliveryRate}
                                    sx={{
                                        height: 8,
                                        borderRadius: 4,
                                        bgcolor: 'grey.200',
                                        '& .MuiLinearProgress-bar': {
                                            bgcolor: stats.notifications.deliveryRate > 90 ? 'success.main' :
                                                stats.notifications.deliveryRate > 70 ? 'warning.main' : 'error.main'
                                        }
                                    }}
                                />
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                    {stats.notifications.delivered} başarıyla teslim edildi
                                </Typography>
                            </CardContent>
                        </Card>
                    </Fade>
                </Grid>

                {/* Revenue & Performance */}
                <Grid item xs={12} md={6}>
                    <Fade in timeout={1200}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <EuroIcon color="success" />
                                    Gelir ve Performans
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <Avatar sx={{ bgcolor: '#48c78e' }}>
                                        <TrendingUpIcon />
                                    </Avatar>
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography variant="h4" fontWeight="bold" color="#48c78e">
                                            €{stats.store.revenue.toFixed(2)}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Toplam Gelir (İlan Hakları)
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                                    <Chip
                                        icon={<LocalOfferIcon />}
                                        label={`${stats.store.totalListings} İlan`}
                                        color="success"
                                        size="small"
                                    />
                                    <Chip
                                        icon={<AccessTimeIcon />}
                                        label={`${stats.store.activeListings} Aktif`}
                                        color="info"
                                        size="small"
                                    />
                                </Box>
                                <Typography variant="caption" color="text.secondary">
                                    Ortalama ilan değeri: €{stats.store.totalListings > 0 ? (stats.store.revenue / stats.store.totalListings).toFixed(2) : '0.00'}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Fade>
                </Grid>
            </Grid>

            {/* Recent Activity */}
            <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                    <Fade in timeout={1400}>
                        <Paper sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <AccessTimeIcon color="primary" />
                                    Son Aktiviteler
                                </Typography>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<RefreshIcon />}
                                    onClick={loadDashboardData}
                                    disabled={refreshing}
                                >
                                    Yenile
                                </Button>
                            </Box>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Aktivite</TableCell>
                                            <TableCell>Kullanıcı</TableCell>
                                            <TableCell>Öncelik</TableCell>
                                            <TableCell>Zaman</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {recentActivity.map((activity, index) => (
                                            <TableRow key={index} hover>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Avatar sx={{
                                                            bgcolor: getActivityColor(activity.type),
                                                            width: 32,
                                                            height: 32
                                                        }}>
                                                            {getActivityIcon(activity.type)}
                                                        </Avatar>
                                                        <Typography variant="body2">
                                                            {activity.message}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={activity.user}
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{ fontSize: '0.75rem' }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={activity.priority.toUpperCase()}
                                                        size="small"
                                                        color={getPriorityColor(activity.priority)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {activity.time}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Fade>
                </Grid>

                {/* Quick Actions & System Info */}
                <Grid item xs={12} lg={4}>
                    <Grid container spacing={2}>
                        {/* Quick Actions */}
                        <Grid item xs={12}>
                            <Fade in timeout={1600}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <SpeedIcon color="primary" />
                                            Hızlı İşlemler
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            <Button
                                                variant="outlined"
                                                startIcon={<CloudUploadIcon />}
                                                fullWidth
                                                size="small"
                                                sx={{ justifyContent: 'flex-start' }}
                                            >
                                                Yeni Sample Yükle
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                startIcon={<PlaylistIcon />}
                                                fullWidth
                                                size="small"
                                                sx={{ justifyContent: 'flex-start' }}
                                            >
                                                Playlist Oluştur
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                startIcon={<NotificationIcon />}
                                                fullWidth
                                                size="small"
                                                sx={{ justifyContent: 'flex-start' }}
                                            >
                                                Bildirim Gönder
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                startIcon={<StoreIcon />}
                                                fullWidth
                                                size="small"
                                                sx={{ justifyContent: 'flex-start' }}
                                            >
                                                İlan Hakkı Ver
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Fade>
                        </Grid>

                        {/* System Resources */}
                        <Grid item xs={12}>
                            <Fade in timeout={1800}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <PsychologyIcon color="secondary" />
                                            Sistem Kaynakları
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            <Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                    <Typography variant="body2">CPU Kullanımı</Typography>
                                                    <Typography variant="body2" fontWeight="medium">23%</Typography>
                                                </Box>
                                                <LinearProgress variant="determinate" value={23} sx={{ height: 6, borderRadius: 3 }} />
                                            </Box>

                                            <Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                    <Typography variant="body2">Bellek Kullanımı</Typography>
                                                    <Typography variant="body2" fontWeight="medium">67%</Typography>
                                                </Box>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={67}
                                                    color="warning"
                                                    sx={{ height: 6, borderRadius: 3 }}
                                                />
                                            </Box>

                                            <Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                    <Typography variant="body2">Disk Kullanımı</Typography>
                                                    <Typography variant="body2" fontWeight="medium">45%</Typography>
                                                </Box>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={45}
                                                    color="success"
                                                    sx={{ height: 6, borderRadius: 3 }}
                                                />
                                            </Box>

                                            <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    Son güncelleme: {new Date().toLocaleTimeString('tr-TR')}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    Uptime: {systemHealth.uptime}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Fade>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
}