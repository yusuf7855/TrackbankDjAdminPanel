import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    IconButton,
    Tooltip,
    CircularProgress,
    Alert,
    Grid,
    Divider,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TablePagination,
    TextField,
    InputAdornment
} from '@mui/material';
import {
    Apple as AppleIcon,
    Refresh as RefreshIcon,
    Visibility as ViewIcon,
    CheckCircle as SuccessIcon,
    Error as ErrorIcon,
    Warning as WarningIcon,
    Info as InfoIcon,
    Search as SearchIcon,
    TrendingUp as RenewIcon,
    Cancel as CancelIcon,
    CreditCard as SubscribeIcon,
    MoneyOff as RefundIcon
} from '@mui/icons-material';
import { api } from '../services/api.jsx';

const AppleNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [stats, setStats] = useState({ stats: [], total: 0, today: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [totalCount, setTotalCount] = useState(0);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await api.get('/webhooks/apple/notifications', {
                params: {
                    page: page + 1,
                    limit: rowsPerPage
                }
            });
            setNotifications(response.data.notifications || []);
            setTotalCount(response.data.pagination?.total || 0);
            setError(null);
        } catch (err) {
            console.error('Error fetching notifications:', err);
            setError('Bildirimler yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/webhooks/apple/stats');
            setStats(response.data);
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        fetchStats();
    }, [page, rowsPerPage]);

    const handleRefresh = () => {
        fetchNotifications();
        fetchStats();
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleViewDetail = (notification) => {
        setSelectedNotification(notification);
        setDetailDialogOpen(true);
    };

    const getNotificationTypeInfo = (type) => {
        const types = {
            'SUBSCRIBED': { color: 'success', icon: <SubscribeIcon />, label: 'Yeni Abonelik' },
            'DID_RENEW': { color: 'info', icon: <RenewIcon />, label: 'Yenilendi' },
            'EXPIRED': { color: 'error', icon: <CancelIcon />, label: 'Süresi Doldu' },
            'DID_FAIL_TO_RENEW': { color: 'warning', icon: <WarningIcon />, label: 'Yenileme Başarısız' },
            'DID_CHANGE_RENEWAL_STATUS': { color: 'warning', icon: <InfoIcon />, label: 'Yenileme Durumu Değişti' },
            'REFUND': { color: 'error', icon: <RefundIcon />, label: 'İade' },
            'GRACE_PERIOD_EXPIRED': { color: 'error', icon: <ErrorIcon />, label: 'Ek Süre Doldu' },
            'REVOKE': { color: 'error', icon: <CancelIcon />, label: 'İptal Edildi' },
            'TEST': { color: 'default', icon: <InfoIcon />, label: 'Test' },
            'UNKNOWN': { color: 'default', icon: <InfoIcon />, label: 'Bilinmeyen' }
        };
        return types[type] || types['UNKNOWN'];
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('tr-TR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const filteredNotifications = notifications.filter(n =>
        !searchTerm ||
        n.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.notificationType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.originalTransactionId?.includes(searchTerm)
    );

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <AppleIcon sx={{ fontSize: 40, color: '#000' }} />
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                            Apple Bildirimleri
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            App Store Server-to-Server Notifications
                        </Typography>
                    </Box>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<RefreshIcon />}
                    onClick={handleRefresh}
                    disabled={loading}
                >
                    Yenile
                </Button>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                        <CardContent>
                            <Typography variant="overline">Toplam Bildirim</Typography>
                            <Typography variant="h3" sx={{ fontWeight: 700 }}>
                                {stats.total || 0}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', color: 'white' }}>
                        <CardContent>
                            <Typography variant="overline">Bugün</Typography>
                            <Typography variant="h3" sx={{ fontWeight: 700 }}>
                                {stats.today || 0}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                        <CardContent>
                            <Typography variant="overline">Yenileme</Typography>
                            <Typography variant="h3" sx={{ fontWeight: 700 }}>
                                {stats.stats?.find(s => s._id === 'DID_RENEW')?.count || 0}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                        <CardContent>
                            <Typography variant="overline">İptal/İade</Typography>
                            <Typography variant="h3" sx={{ fontWeight: 700 }}>
                                {(stats.stats?.find(s => s._id === 'EXPIRED')?.count || 0) +
                                 (stats.stats?.find(s => s._id === 'REFUND')?.count || 0)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Notification Type Stats */}
            {stats.stats && stats.stats.length > 0 && (
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>Bildirim Türlerine Göre</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {stats.stats.map((stat, index) => {
                                const typeInfo = getNotificationTypeInfo(stat._id);
                                return (
                                    <Chip
                                        key={index}
                                        icon={typeInfo.icon}
                                        label={`${typeInfo.label}: ${stat.count}`}
                                        color={typeInfo.color}
                                        variant="outlined"
                                        sx={{ fontWeight: 600 }}
                                    />
                                );
                            })}
                        </Box>
                    </CardContent>
                </Card>
            )}

            {/* Error Alert */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Search */}
            <Box sx={{ mb: 2 }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Kullanıcı adı, bildirim türü veya işlem ID'si ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        )
                    }}
                />
            </Box>

            {/* Notifications Table */}
            <Card>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700 }}>Tarih</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Tür</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Kullanıcı</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Ürün</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Ortam</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>İşlem Sonucu</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="center">Detay</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : filteredNotifications.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                                        <Typography color="text.secondary">
                                            Henüz bildirim yok
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredNotifications.map((notification) => {
                                    const typeInfo = getNotificationTypeInfo(notification.notificationType);
                                    return (
                                        <TableRow key={notification._id} hover>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {formatDate(notification.createdAt)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    icon={typeInfo.icon}
                                                    label={typeInfo.label}
                                                    color={typeInfo.color}
                                                    size="small"
                                                    sx={{ fontWeight: 600 }}
                                                />
                                                {notification.subtype && (
                                                    <Typography variant="caption" display="block" color="text.secondary">
                                                        {notification.subtype}
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                    {notification.username || '-'}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {notification.originalTransactionId?.slice(-8) || '-'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {notification.productId || '-'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={notification.environment || 'Unknown'}
                                                    size="small"
                                                    color={notification.environment === 'Production' ? 'success' : 'warning'}
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {notification.processed ? (
                                                    <Tooltip title={notification.processingResult || 'İşlendi'}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <SuccessIcon color="success" fontSize="small" />
                                                            <Typography variant="caption" noWrap sx={{ maxWidth: 150 }}>
                                                                {notification.processingResult?.slice(0, 30) || 'İşlendi'}
                                                            </Typography>
                                                        </Box>
                                                    </Tooltip>
                                                ) : notification.error ? (
                                                    <Tooltip title={notification.error}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <ErrorIcon color="error" fontSize="small" />
                                                            <Typography variant="caption" color="error">
                                                                Hata
                                                            </Typography>
                                                        </Box>
                                                    </Tooltip>
                                                ) : (
                                                    <Typography variant="caption" color="text.secondary">
                                                        Bekliyor
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell align="center">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleViewDetail(notification)}
                                                >
                                                    <ViewIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div"
                    count={totalCount}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    labelRowsPerPage="Sayfa başına:"
                />
            </Card>

            {/* Detail Dialog */}
            <Dialog
                open={detailDialogOpen}
                onClose={() => setDetailDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AppleIcon />
                        Bildirim Detayı
                    </Box>
                </DialogTitle>
                <DialogContent dividers>
                    {selectedNotification && (
                        <Box>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Bildirim Türü</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        {selectedNotification.notificationType}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Alt Tür</Typography>
                                    <Typography variant="body1">
                                        {selectedNotification.subtype || '-'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Kullanıcı</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        {selectedNotification.username || '-'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Ortam</Typography>
                                    <Typography variant="body1">
                                        {selectedNotification.environment}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Ürün ID</Typography>
                                    <Typography variant="body1">
                                        {selectedNotification.productId || '-'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Tarih</Typography>
                                    <Typography variant="body1">
                                        {formatDate(selectedNotification.createdAt)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="caption" color="text.secondary">Original Transaction ID</Typography>
                                    <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                                        {selectedNotification.originalTransactionId || '-'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="caption" color="text.secondary">Transaction ID</Typography>
                                    <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                                        {selectedNotification.transactionId || '-'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="caption" color="text.secondary">İşlem Sonucu</Typography>
                                    <Typography variant="body1">
                                        {selectedNotification.processingResult || '-'}
                                    </Typography>
                                </Grid>
                                {selectedNotification.error && (
                                    <Grid item xs={12}>
                                        <Alert severity="error">
                                            {selectedNotification.error}
                                        </Alert>
                                    </Grid>
                                )}
                            </Grid>

                            {selectedNotification.decodedData && (
                                <Box sx={{ mt: 3 }}>
                                    <Divider sx={{ mb: 2 }} />
                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Decoded Data (JSON)</Typography>
                                    <Paper sx={{ p: 2, bgcolor: '#f5f5f5', maxHeight: 300, overflow: 'auto' }}>
                                        <pre style={{ margin: 0, fontSize: '12px', whiteSpace: 'pre-wrap' }}>
                                            {JSON.stringify(selectedNotification.decodedData, null, 2)}
                                        </pre>
                                    </Paper>
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDetailDialogOpen(false)}>Kapat</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AppleNotifications;
