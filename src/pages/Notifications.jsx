import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    TextField,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Alert,
    CircularProgress,
    Tabs,
    Tab,
    Divider,
    InputAdornment,
    Tooltip,
    Snackbar
} from '@mui/material';
import {
    Send as SendIcon,
    Notifications as NotificationsIcon,
    History as HistoryIcon,
    Analytics as AnalyticsIcon,
    Close as CloseIcon,
    Refresh as RefreshIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Warning as WarningIcon,
    Info as InfoIcon,
    People as PeopleIcon,
    Campaign as CampaignIcon,
    Settings as SettingsIcon,
    Image as ImageIcon,
    Link as LinkIcon
} from '@mui/icons-material';

const API_BASE = 'https://api.trackbangserver.com/api';

const Notifications = () => {
    const [currentTab, setCurrentTab] = useState(0);
    const [loading, setLoading] = useState(false);
    const [sendDialogOpen, setSendDialogOpen] = useState(false);
    const [tokenDialogOpen, setTokenDialogOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [stats, setStats] = useState({});
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [tempToken, setTempToken] = useState('');

    // Form state
    const [form, setForm] = useState({
        title: '',
        body: '',
        type: 'general',
        imageUrl: '',
        deepLink: '',
        targetUsers: ''
    });

    const getToken = () => localStorage.getItem('adminToken') || '';

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const apiCall = async (endpoint, method = 'GET', data = null) => {
        const token = getToken();
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            }
        };
        if (data) options.body = JSON.stringify(data);

        const response = await fetch(`${API_BASE}${endpoint}`, options);
        const result = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                setTokenDialogOpen(true);
                throw new Error('Yetkilendirme gerekli. Lütfen admin token girin.');
            }
            throw new Error(result.message || 'API hatası');
        }
        return result;
    };

    const fetchStats = async () => {
        setLoading(true);
        try {
            const result = await apiCall('/notifications/stats');
            // API response: { notifications: {...}, devices: [...], activeDevices: N }
            const data = result.data || {};
            const notifStats = data.notifications || {};
            setStats({
                totalNotifications: notifStats.totalNotifications || 0,
                totalSent: notifStats.totalSent || 0,
                totalFailed: notifStats.totalFailed || 0,
                totalActiveDevices: data.activeDevices || 0,
                todayNotifications: notifStats.todaySent || 0,
                successRate: notifStats.successRate || 0,
                statusDistribution: notifStats.statusDistribution || {}
            });
        } catch (error) {
            showSnackbar(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const result = await apiCall('/notifications/history?limit=50');
            setNotifications(result.data?.notifications || []);
        } catch (error) {
            showSnackbar(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const sendNotification = async () => {
        if (!form.title || !form.body) {
            showSnackbar('Başlık ve içerik zorunludur', 'error');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                title: form.title,
                body: form.body,
                type: form.type,
                imageUrl: form.imageUrl || undefined,
                deepLink: form.deepLink || undefined,
                targetUsers: form.targetUsers ? form.targetUsers.split(',').map(id => id.trim()).filter(Boolean) : []
            };

            const result = await apiCall('/notifications/send', 'POST', payload);

            showSnackbar(
                `Bildirim gönderildi! Başarılı: ${result.data?.sentCount || 0}, Başarısız: ${result.data?.failedCount || 0}`,
                'success'
            );

            setSendDialogOpen(false);
            setForm({ title: '', body: '', type: 'general', imageUrl: '', deepLink: '', targetUsers: '' });

            // Geçmişi güncelle
            if (currentTab === 1) fetchHistory();
        } catch (error) {
            showSnackbar(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const saveToken = () => {
        if (tempToken.trim()) {
            localStorage.setItem('adminToken', tempToken.trim());
            setTokenDialogOpen(false);
            setTempToken('');
            showSnackbar('Token kaydedildi!', 'success');
            // Veriyi yeniden yükle
            if (currentTab === 0) fetchStats();
            else fetchHistory();
        }
    };

    useEffect(() => {
        if (currentTab === 0) fetchStats();
        else fetchHistory();
    }, [currentTab]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'sent': return <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />;
            case 'failed': return <ErrorIcon sx={{ color: 'error.main', fontSize: 20 }} />;
            case 'partial': return <WarningIcon sx={{ color: 'warning.main', fontSize: 20 }} />;
            default: return <InfoIcon sx={{ color: 'info.main', fontSize: 20 }} />;
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'promotion': return 'secondary';
            case 'update': return 'success';
            case 'warning': return 'warning';
            default: return 'primary';
        }
    };

    return (
        <Box sx={{ p: 3, bgcolor: '#f5f7fa', minHeight: '100vh' }}>
            {/* Header */}
            <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <CardContent sx={{ py: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <CampaignIcon sx={{ fontSize: 48, color: 'white' }} />
                            <Box>
                                <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                                    Bildirim Yönetimi
                                </Typography>
                                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                    Tüm kullanıcılara veya seçili kullanıcılara push bildirim gönder
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                                variant="outlined"
                                startIcon={<SettingsIcon />}
                                onClick={() => setTokenDialogOpen(true)}
                                sx={{
                                    color: 'white',
                                    borderColor: 'rgba(255,255,255,0.5)',
                                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
                                }}
                            >
                                Token Ayarla
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<SendIcon />}
                                onClick={() => setSendDialogOpen(true)}
                                sx={{
                                    bgcolor: 'white',
                                    color: '#667eea',
                                    fontWeight: 600,
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                                }}
                            >
                                Bildirim Gönder
                            </Button>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* Tabs */}
            <Card sx={{ mb: 3 }}>
                <Tabs
                    value={currentTab}
                    onChange={(e, v) => setCurrentTab(v)}
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab
                        icon={<AnalyticsIcon />}
                        label="İstatistikler"
                        iconPosition="start"
                        sx={{ minHeight: 64 }}
                    />
                    <Tab
                        icon={<HistoryIcon />}
                        label="Geçmiş"
                        iconPosition="start"
                        sx={{ minHeight: 64 }}
                    />
                </Tabs>
            </Card>

            {/* Stats Tab */}
            {currentTab === 0 && (
                <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                        <Button
                            startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
                            onClick={fetchStats}
                            disabled={loading}
                        >
                            Yenile
                        </Button>
                    </Box>

                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{
                                            p: 1.5,
                                            borderRadius: 2,
                                            bgcolor: 'primary.light',
                                            display: 'flex'
                                        }}>
                                            <NotificationsIcon sx={{ color: 'primary.main' }} />
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Toplam Bildirim
                                            </Typography>
                                            <Typography variant="h4" fontWeight={700}>
                                                {stats.totalNotifications || 0}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{
                                            p: 1.5,
                                            borderRadius: 2,
                                            bgcolor: 'success.light',
                                            display: 'flex'
                                        }}>
                                            <PeopleIcon sx={{ color: 'success.main' }} />
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Aktif Cihaz
                                            </Typography>
                                            <Typography variant="h4" fontWeight={700}>
                                                {stats.totalActiveDevices || 0}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{
                                            p: 1.5,
                                            borderRadius: 2,
                                            bgcolor: 'warning.light',
                                            display: 'flex'
                                        }}>
                                            <SendIcon sx={{ color: 'warning.main' }} />
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Bugün Gönderilen
                                            </Typography>
                                            <Typography variant="h4" fontWeight={700}>
                                                {stats.todayNotifications || 0}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{
                                            p: 1.5,
                                            borderRadius: 2,
                                            bgcolor: 'info.light',
                                            display: 'flex'
                                        }}>
                                            <CheckCircleIcon sx={{ color: 'info.main' }} />
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Başarı Oranı
                                            </Typography>
                                            <Typography variant="h4" fontWeight={700}>
                                                %{stats.successRate ?? 0}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Hızlı Bildirim Gönder */}
                    <Card sx={{ mt: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <SendIcon color="primary" />
                                Hızlı Bildirim Gönder
                            </Typography>
                            <Divider sx={{ my: 2 }} />
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Başlık"
                                        value={form.title}
                                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                                        placeholder="Bildirim başlığı..."
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Tür</InputLabel>
                                        <Select
                                            value={form.type}
                                            label="Tür"
                                            onChange={(e) => setForm({ ...form, type: e.target.value })}
                                        >
                                            <MenuItem value="general">🔔 Genel</MenuItem>
                                            <MenuItem value="promotion">🎯 Promosyon</MenuItem>
                                            <MenuItem value="update">🔄 Güncelleme</MenuItem>
                                            <MenuItem value="warning">⚠️ Uyarı</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={3}
                                        label="İçerik"
                                        value={form.body}
                                        onChange={(e) => setForm({ ...form, body: e.target.value })}
                                        placeholder="Bildirim içeriği..."
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                        <Button
                                            variant="outlined"
                                            onClick={() => setSendDialogOpen(true)}
                                        >
                                            Gelişmiş Seçenekler
                                        </Button>
                                        <Button
                                            variant="contained"
                                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                                            onClick={sendNotification}
                                            disabled={loading || !form.title || !form.body}
                                            sx={{
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                px: 4
                                            }}
                                        >
                                            Tüm Kullanıcılara Gönder
                                        </Button>
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Box>
            )}

            {/* History Tab */}
            {currentTab === 1 && (
                <Card>
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <HistoryIcon color="primary" />
                                Bildirim Geçmişi
                            </Typography>
                            <Button
                                startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
                                onClick={fetchHistory}
                                disabled={loading}
                            >
                                Yenile
                            </Button>
                        </Box>

                        <TableContainer component={Paper} variant="outlined">
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                                        <TableCell sx={{ fontWeight: 600 }}>Bildirim</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Tür</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Durum</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>İstatistik</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Tarih</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {notifications.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                                                <NotificationsIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                                                <Typography color="text.secondary">
                                                    Henüz bildirim gönderilmemiş
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        notifications.map((notif) => (
                                            <TableRow key={notif._id} hover>
                                                <TableCell>
                                                    <Typography fontWeight={600}>{notif.title}</Typography>
                                                    <Typography variant="body2" color="text.secondary" sx={{
                                                        maxWidth: 300,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}>
                                                        {notif.body}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={notif.type || 'general'}
                                                        size="small"
                                                        color={getTypeColor(notif.type)}
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        {getStatusIcon(notif.status)}
                                                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                                            {notif.status || 'pending'}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" color="success.main">
                                                        ✓ {notif.sentCount || 0}
                                                    </Typography>
                                                    <Typography variant="body2" color="error.main">
                                                        ✗ {notif.failedCount || 0}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {new Date(notif.createdAt).toLocaleDateString('tr-TR', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            )}

            {/* Send Dialog */}
            <Dialog
                open={sendDialogOpen}
                onClose={() => setSendDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}>
                    <SendIcon />
                    Yeni Bildirim Gönder
                    <IconButton
                        onClick={() => setSendDialogOpen(false)}
                        sx={{ position: 'absolute', right: 8, top: 8, color: 'white' }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Başlık *"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                placeholder="Bildirim başlığı"
                                helperText={`${form.title.length}/100`}
                                inputProps={{ maxLength: 100 }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                label="İçerik *"
                                value={form.body}
                                onChange={(e) => setForm({ ...form, body: e.target.value })}
                                placeholder="Bildirim içeriği"
                                helperText={`${form.body.length}/500`}
                                inputProps={{ maxLength: 500 }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Bildirim Türü</InputLabel>
                                <Select
                                    value={form.type}
                                    label="Bildirim Türü"
                                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                                >
                                    <MenuItem value="general">🔔 Genel</MenuItem>
                                    <MenuItem value="promotion">🎯 Promosyon</MenuItem>
                                    <MenuItem value="update">🔄 Güncelleme</MenuItem>
                                    <MenuItem value="warning">⚠️ Uyarı</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Görsel URL"
                                value={form.imageUrl}
                                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                                placeholder="https://example.com/image.jpg"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <ImageIcon color="action" />
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Deep Link"
                                value={form.deepLink}
                                onChange={(e) => setForm({ ...form, deepLink: e.target.value })}
                                placeholder="app://page/detail"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LinkIcon color="action" />
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Hedef Kullanıcı ID'leri"
                                value={form.targetUsers}
                                onChange={(e) => setForm({ ...form, targetUsers: e.target.value })}
                                placeholder="user1, user2, user3"
                                helperText="Boş bırakılırsa tüm kullanıcılara gönderilir"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PeopleIcon color="action" />
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3, bgcolor: 'grey.50' }}>
                    <Button onClick={() => setSendDialogOpen(false)} color="inherit">
                        İptal
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                        onClick={sendNotification}
                        disabled={loading || !form.title || !form.body}
                        sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            px: 4
                        }}
                    >
                        Gönder
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Token Dialog */}
            <Dialog
                open={tokenDialogOpen}
                onClose={() => setTokenDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SettingsIcon color="primary" />
                    Admin Token Ayarla
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        API istekleri için admin JWT token'ınızı girin. Bu token tarayıcıda saklanacaktır.
                    </Typography>
                    <TextField
                        fullWidth
                        type="password"
                        label="Admin Token"
                        value={tempToken}
                        onChange={(e) => setTempToken(e.target.value)}
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    />
                    {getToken() && (
                        <Alert severity="success" sx={{ mt: 2 }}>
                            <Typography variant="body2">
                                Mevcut token: {getToken().substring(0, 20)}...
                            </Typography>
                            <Button
                                size="small"
                                color="error"
                                onClick={() => {
                                    localStorage.removeItem('adminToken');
                                    showSnackbar('Token kaldırıldı', 'info');
                                }}
                                sx={{ mt: 1 }}
                            >
                                Token'ı Kaldır
                            </Button>
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setTokenDialogOpen(false)}>İptal</Button>
                    <Button
                        variant="contained"
                        onClick={saveToken}
                        disabled={!tempToken.trim()}
                    >
                        Kaydet
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={5000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    variant="filled"
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Notifications;
