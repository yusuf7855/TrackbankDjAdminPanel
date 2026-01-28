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
    CircularProgress,
    Alert,
    Grid,
    Button,
    TextField,
    MenuItem,
    Divider
} from '@mui/material';
import {
    AttachMoney as MoneyIcon,
    TrendingUp as TrendingIcon,
    CalendarToday as CalendarIcon,
    Refresh as RefreshIcon,
    Apple as AppleIcon,
    Android as AndroidIcon,
    CreditCard as SubscriptionIcon
} from '@mui/icons-material';
import { api } from '../services/api.jsx';

// Abonelik ürün isimleri
const PRODUCT_NAMES = {
    'trackbang_monthly_premium': 'Aylık Premium',
    'trackbang_premium_monthly': 'Aylık Premium',
    'trackbang_monthly': 'Aylık Premium',
    'monthly_premium': 'Aylık Premium',
    'default': 'Premium'
};

// Varsayılan fiyat (Apple fiyat göndermezse)
const DEFAULT_PRICE = { price: 1.99, currency: 'EUR' };

const Revenue = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState('all');
    const [stats, setStats] = useState({
        totalRevenue: 0,
        todayRevenue: 0,
        weekRevenue: 0,
        monthRevenue: 0,
        totalSubscriptions: 0,
        renewals: 0,
        refunds: 0,
        newSubscriptions: 0
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            // Apple bildirimlerini çek
            const response = await api.get('/webhooks/apple/notifications', {
                params: { limit: 1000 }
            });

            const notifications = response.data.notifications || [];
            setNotifications(notifications);

            // İstatistikleri hesapla
            calculateStats(notifications);
            setError(null);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Veriler yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    // Fiyatı Apple bildiriminden çıkar
    const getPriceFromNotification = (notification) => {
        // Apple fiyatı milicents cinsinden gönderir (99990 = 99.99 TRY)
        if (notification.decodedData?.transactionInfo?.price) {
            const priceInMillicents = notification.decodedData.transactionInfo.price;
            const currency = notification.decodedData?.transactionInfo?.currency || 'TRY';
            return {
                price: priceInMillicents / 1000,
                currency: currency
            };
        }
        return DEFAULT_PRICE;
    };

    const calculateStats = (notifications) => {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        let totalRevenue = 0;
        let todayRevenue = 0;
        let weekRevenue = 0;
        let monthRevenue = 0;
        let totalSubscriptions = 0;
        let renewals = 0;
        let refunds = 0;
        let newSubscriptions = 0;

        // Para birimi bazında gelir takibi
        const currencyTotals = {};

        notifications.forEach(n => {
            const createdAt = new Date(n.createdAt);
            const priceInfo = getPriceFromNotification(n);
            const price = priceInfo.price;
            const currency = priceInfo.currency;

            // Para birimi bazında toplam
            if (!currencyTotals[currency]) {
                currencyTotals[currency] = 0;
            }

            // Gelir getiren bildirim türleri
            if (n.notificationType === 'SUBSCRIBED') {
                newSubscriptions++;
                totalSubscriptions++;
                totalRevenue += price;
                currencyTotals[currency] += price;

                if (createdAt >= todayStart) todayRevenue += price;
                if (createdAt >= weekStart) weekRevenue += price;
                if (createdAt >= monthStart) monthRevenue += price;
            } else if (n.notificationType === 'DID_RENEW') {
                renewals++;
                totalSubscriptions++;
                totalRevenue += price;
                currencyTotals[currency] += price;

                if (createdAt >= todayStart) todayRevenue += price;
                if (createdAt >= weekStart) weekRevenue += price;
                if (createdAt >= monthStart) monthRevenue += price;
            } else if (n.notificationType === 'REFUND') {
                refunds++;
                totalRevenue -= price;
                currencyTotals[currency] -= price;

                if (createdAt >= todayStart) todayRevenue -= price;
                if (createdAt >= weekStart) weekRevenue -= price;
                if (createdAt >= monthStart) monthRevenue -= price;
            }
        });

        setStats({
            totalRevenue: Math.max(0, totalRevenue),
            todayRevenue: Math.max(0, todayRevenue),
            weekRevenue: Math.max(0, weekRevenue),
            monthRevenue: Math.max(0, monthRevenue),
            totalSubscriptions,
            renewals,
            refunds,
            newSubscriptions,
            currencyTotals
        });
    };

    useEffect(() => {
        fetchData();
    }, []);

    const formatCurrency = (amount, currency = 'TRY') => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: currency
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('tr-TR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Gelir getiren bildirimleri filtrele
    const revenueNotifications = notifications.filter(n =>
        ['SUBSCRIBED', 'DID_RENEW', 'REFUND'].includes(n.notificationType)
    );

    // Tarihe göre filtrele
    const filterByDate = (items) => {
        if (dateRange === 'all') return items;

        const now = new Date();
        let startDate;

        switch (dateRange) {
            case 'today':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            default:
                return items;
        }

        return items.filter(item => new Date(item.createdAt) >= startDate);
    };

    const filteredNotifications = filterByDate(revenueNotifications);

    // Günlük gelir özeti oluştur
    const dailyRevenue = {};
    filteredNotifications.forEach(n => {
        const date = new Date(n.createdAt).toLocaleDateString('tr-TR');
        const priceInfo = getPriceFromNotification(n);
        const price = priceInfo.price;
        const currency = priceInfo.currency;

        if (!dailyRevenue[date]) {
            dailyRevenue[date] = { revenue: 0, count: 0, refunds: 0, currency: currency };
        }

        if (n.notificationType === 'REFUND') {
            dailyRevenue[date].revenue -= price;
            dailyRevenue[date].refunds++;
        } else {
            dailyRevenue[date].revenue += price;
            dailyRevenue[date].count++;
        }
    });

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <MoneyIcon sx={{ fontSize: 40, color: '#4caf50' }} />
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                            Gelir Takibi
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Abonelik Gelirleri ve İstatistikler
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        select
                        size="small"
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        sx={{ minWidth: 150 }}
                    >
                        <MenuItem value="all">Tüm Zamanlar</MenuItem>
                        <MenuItem value="today">Bugün</MenuItem>
                        <MenuItem value="week">Son 7 Gün</MenuItem>
                        <MenuItem value="month">Bu Ay</MenuItem>
                    </TextField>
                    <Button
                        variant="contained"
                        startIcon={<RefreshIcon />}
                        onClick={fetchData}
                        disabled={loading}
                    >
                        Yenile
                    </Button>
                </Box>
            </Box>

            {/* Error Alert */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', color: 'white' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <MoneyIcon />
                                <Typography variant="overline">Toplam Gelir</Typography>
                            </Box>
                            <Typography variant="h3" sx={{ fontWeight: 700 }}>
                                {formatCurrency(stats.totalRevenue, 'TRY')}
                            </Typography>
                            <Typography variant="caption">
                                {stats.totalSubscriptions} işlem
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <CalendarIcon />
                                <Typography variant="overline">Bu Ay</Typography>
                            </Box>
                            <Typography variant="h3" sx={{ fontWeight: 700 }}>
                                {formatCurrency(stats.monthRevenue, 'TRY')}
                            </Typography>
                            <Typography variant="caption">
                                Aylık gelir
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <TrendingIcon />
                                <Typography variant="overline">Bugün</Typography>
                            </Box>
                            <Typography variant="h3" sx={{ fontWeight: 700 }}>
                                {formatCurrency(stats.todayRevenue, 'TRY')}
                            </Typography>
                            <Typography variant="caption">
                                Günlük gelir
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <SubscriptionIcon />
                                <Typography variant="overline">Yenilemeler</Typography>
                            </Box>
                            <Typography variant="h3" sx={{ fontWeight: 700 }}>
                                {stats.renewals}
                            </Typography>
                            <Typography variant="caption">
                                {stats.newSubscriptions} yeni abonelik
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* İstatistik Özeti */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>Abonelik Dağılımı</Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Chip size="small" color="success" label="Yeni" />
                                        <Typography>Yeni Abonelik</Typography>
                                    </Box>
                                    <Typography sx={{ fontWeight: 700 }}>{stats.newSubscriptions}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Chip size="small" color="info" label="Yenileme" />
                                        <Typography>Yenileme</Typography>
                                    </Box>
                                    <Typography sx={{ fontWeight: 700 }}>{stats.renewals}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Chip size="small" color="error" label="İade" />
                                        <Typography>İade</Typography>
                                    </Box>
                                    <Typography sx={{ fontWeight: 700 }}>{stats.refunds}</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>Günlük Gelir Özeti</Typography>
                            {Object.keys(dailyRevenue).length === 0 ? (
                                <Typography color="text.secondary">Henüz veri yok</Typography>
                            ) : (
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 700 }}>Tarih</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }} align="right">İşlem</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }} align="right">İade</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }} align="right">Gelir</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {Object.entries(dailyRevenue)
                                                .sort((a, b) => new Date(b[0].split('.').reverse().join('-')) - new Date(a[0].split('.').reverse().join('-')))
                                                .slice(0, 10)
                                                .map(([date, data]) => (
                                                    <TableRow key={date}>
                                                        <TableCell>{date}</TableCell>
                                                        <TableCell align="right">{data.count}</TableCell>
                                                        <TableCell align="right">
                                                            {data.refunds > 0 && (
                                                                <Chip size="small" color="error" label={data.refunds} />
                                                            )}
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: 700, color: data.revenue >= 0 ? 'success.main' : 'error.main' }}>
                                                            {formatCurrency(data.revenue, data.currency || 'TRY')}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Transaction List */}
            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>Son İşlemler</Typography>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                            <CircularProgress />
                        </Box>
                    ) : filteredNotifications.length === 0 ? (
                        <Typography color="text.secondary" align="center" sx={{ py: 5 }}>
                            Henüz gelir işlemi yok
                        </Typography>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700 }}>Tarih</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Tür</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Kullanıcı</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Ürün</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Platform</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }} align="right">Tutar</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredNotifications.slice(0, 50).map((notification) => {
                                        const productName = PRODUCT_NAMES[notification.productId] || PRODUCT_NAMES['default'];
                                        const priceInfo = getPriceFromNotification(notification);
                                        const isRefund = notification.notificationType === 'REFUND';

                                        return (
                                            <TableRow key={notification._id} hover>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {formatDate(notification.createdAt)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        size="small"
                                                        color={
                                                            notification.notificationType === 'SUBSCRIBED' ? 'success' :
                                                            notification.notificationType === 'DID_RENEW' ? 'info' :
                                                            'error'
                                                        }
                                                        label={
                                                            notification.notificationType === 'SUBSCRIBED' ? 'Yeni' :
                                                            notification.notificationType === 'DID_RENEW' ? 'Yenileme' :
                                                            'İade'
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                        {notification.username || '-'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {productName}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {notification.productId}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        icon={<AppleIcon />}
                                                        label={notification.environment || 'Apple'}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography
                                                        variant="body1"
                                                        sx={{
                                                            fontWeight: 700,
                                                            color: isRefund ? 'error.main' : 'success.main'
                                                        }}
                                                    >
                                                        {isRefund ? '-' : '+'}{formatCurrency(priceInfo.price, priceInfo.currency)}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CardContent>
            </Card>

            {/* Info Card */}
            <Card sx={{ mt: 3, bgcolor: '#fff3e0' }}>
                <CardContent>
                    <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AppleIcon /> Apple App Store Gelir Bilgisi
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        • Apple, her satıştan %15-30 komisyon keser (Small Business Program'da %15)
                        <br />
                        • Sandbox ortamındaki işlemler gerçek gelir değildir
                        <br />
                        • Fiyatlar App Store Connect'te belirlenen fiyatlara göre hesaplanır
                        <br />
                        • Gerçek gelir için App Store Connect &gt; Payments and Financial Reports sayfasını kontrol edin
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
};

export default Revenue;
