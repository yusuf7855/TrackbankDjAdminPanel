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
    const [systemHealth] = useState({
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

            // API çağrıları (şimdilik mock veriler kullanılıyor)
            await Promise.all([
                fetch(`${API_BASE}/playlists/admin`).catch(() => ({ json: () => ({}) })),
                fetch(`${API_BASE}/samples/stats`).catch(() => ({ json: () => ({}) })),
                fetch(`${API_BASE}/store/admin/stats`).catch(() => ({ json: () => ({}) })),
                fetch(`${API_BASE}/notifications/stats`).catch(() => ({ json: () => ({}) }))
            ]);

            // Mock aktivite verisi (gerçek API'den gelecek)
            const mockActivity = [
                { id: 1, activity: 'Yeni playlist oluşturuldu', user: 'Admin', priority: 'info', time: '2 dakika önce' },
                { id: 2, activity: 'Sample yüklendi', user: 'DJ_Producer', priority: 'success', time: '5 dakika önce' },
                { id: 3, activity: 'İlan hakkı satın alındı', user: 'MusicLover23', priority: 'warning', time: '10 dakika önce' },
                { id: 4, activity: 'Push bildirim gönderildi', user: 'Admin', priority: 'info', time: '15 dakika önce' },
                { id: 5, activity: 'Yeni kullanıcı kaydı', user: 'NewUser_123', priority: 'success', time: '20 dakika önce' },
            ];

            // Mock veriler (gerçek API'den gelecek)
            setStats({
                playlists: { total: 127, admin: 24, user: 103 },
                samples: { total: 1547, free: 892, paid: 655, downloads: 12847 },
                store: { totalListings: 89, activeListings: 67, revenue: 2750, expiredListings: 22 },
                notifications: { sent: 156, delivered: 142, deliveryRate: 91.0 },
                users: { total: 2847, active: 1892, newToday: 23 }
            });

            setRecentActivity(mockActivity);

        } catch (error) {
            console.error('Dashboard verileri yüklenemedi:', error);
            setError('Veriler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
            setRefreshing(false);
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
                                    animation: refreshing ? 'rotation 2s infinite linear' : '',
                                    '@keyframes rotation': {
                                        from: { transform: 'rotate(0deg)' },
                                        to: { transform: 'rotate(360deg)' }
                                    }
                                }}
                            >
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
            </Fade>

            {error && (
                <Fade in>
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                </Fade>
            )}

            {/* Main Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Playlists */}
                <Grid xs={12} sm={6} md={3}>
                    <Fade in timeout={1000}>
                        <Card sx={{ height: '100%', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-4px)' } }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Avatar sx={{ bgcolor: '#667eea', mr: 2 }}>
                                        <PlaylistIcon />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h4" fontWeight="bold" color="#667eea">
                                            {stats.playlists.total}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Toplam Playlist
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                                    <Chip label={`Admin: ${stats.playlists.admin}`} size="small" color="primary" />
                                    <Chip label={`User: ${stats.playlists.user}`} size="small" color="secondary" />
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={(stats.playlists.admin / stats.playlists.total) * 100}
                                    sx={{ borderRadius: 2 }}
                                />
                            </CardContent>
                        </Card>
                    </Fade>
                </Grid>

                {/* Samples */}
                <Grid xs={12} sm={6} md={3}>
                    <Grow in timeout={1200}>
                        <Card sx={{ height: '100%', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-4px)' } }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Avatar sx={{ bgcolor: '#f093fb', mr: 2 }}>
                                        <SampleIcon />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h4" fontWeight="bold" color="#f093fb">
                                            {stats.samples.total}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Toplam Sample
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                                    <Chip label={`Free: ${stats.samples.free}`} size="small" color="success" />
                                    <Chip label={`Paid: ${stats.samples.paid}`} size="small" color="warning" />
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <DownloadIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                                    <Typography variant="caption" color="primary.main">
                                        {stats.samples.downloads.toLocaleString()} indirme
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grow>
                </Grid>

                {/* Store */}
                <Grid xs={12} sm={6} md={3}>
                    <Fade in timeout={1300}>
                        <Card sx={{ height: '100%', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-4px)' } }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Avatar sx={{ bgcolor: '#48c78e', mr: 2 }}>
                                        <StoreIcon />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h4" fontWeight="bold" color="#48c78e">
                                            {stats.store.totalListings}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Toplam İlan
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                                    <Chip label={`Aktif: ${stats.store.activeListings}`} size="small" color="success" />
                                    <Chip label={`Süresi Dolmuş: ${stats.store.expiredListings}`} size="small" color="error" />
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <EuroIcon sx={{ fontSize: 14, color: 'success.main' }} />
                                    <Typography variant="caption" color="success.main">
                                        {stats.store.revenue.toLocaleString()} TL gelir
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Fade>
                </Grid>

                {/* Users */}
                <Grid xs={12} sm={6} md={3}>
                    <Grow in timeout={1400}>
                        <Card sx={{ height: '100%', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-4px)' } }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Avatar sx={{ bgcolor: '#ff7675', mr: 2 }}>
                                        <PeopleIcon />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h4" fontWeight="bold" color="#ff7675">
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
                <Grid xs={12} md={6}>
                    <Fade in timeout={1500}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Avatar sx={{ bgcolor: '#ffdd57', mr: 2 }}>
                                        <NotificationIcon />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h5" fontWeight="bold">
                                            Bildirimler
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Push bildirim istatistikleri
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="h6" fontWeight="bold" color="primary.main">
                                            {stats.notifications.sent}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Gönderilen
                                        </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="h6" fontWeight="bold" color="success.main">
                                            {stats.notifications.delivered}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Teslim Edilen
                                        </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="h6" fontWeight="bold" color="info.main">
                                            %{stats.notifications.deliveryRate}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Başarı Oranı
                                        </Typography>
                                    </Box>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={stats.notifications.deliveryRate}
                                    color="success"
                                    sx={{ borderRadius: 2 }}
                                />
                            </CardContent>
                        </Card>
                    </Fade>
                </Grid>

                {/* Quick Actions */}
                <Grid xs={12} md={6}>
                    <Fade in timeout={1600}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PsychologyIcon color="primary" />
                                    Hızlı İşlemler
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <Button
                                        variant="contained"
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
            </Grid>

            {/* Recent Activity */}
            <Grid container spacing={3}>
                <Grid xs={12} lg={8}>
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
                                        {recentActivity.map((activity) => (
                                            <TableRow key={activity.id} hover>
                                                <TableCell>{activity.activity}</TableCell>
                                                <TableCell>{activity.user}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={activity.priority}
                                                        size="small"
                                                        color={
                                                            activity.priority === 'success' ? 'success' :
                                                                activity.priority === 'warning' ? 'warning' :
                                                                    activity.priority === 'error' ? 'error' : 'info'
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell>{activity.time}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Fade>
                </Grid>

                {/* System Health */}
                <Grid xs={12} lg={4}>
                    <Fade in timeout={1500}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <SpeedIcon color="success" />
                                Sistem Durumu
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Çalışma Süresi
                                    </Typography>
                                    <Typography variant="h6" color="success.main">
                                        {systemHealth.uptime}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Yanıt Süresi
                                    </Typography>
                                    <Typography variant="h6" color="primary.main">
                                        {systemHealth.responseTime}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Aktif Bağlantılar
                                    </Typography>
                                    <Typography variant="h6" color="info.main">
                                        {systemHealth.activeConnections}
                                    </Typography>
                                </Box>
                                <Chip
                                    label={`Durum: ${systemHealth.status}`}
                                    color="success"
                                    variant="outlined"
                                    sx={{ alignSelf: 'flex-start' }}
                                />
                            </Box>
                        </Paper>
                    </Fade>
                </Grid>
            </Grid>
        </Box>
    );
}