// src/pages/SubscriptionManagement.jsx
// ✅ Admin Panel - Abonelik Yönetimi
// ✅ Kalan süre: Gün, Saat, Dakika formatında
// 3 DURUM: Trial | Premium | Süresi Dolmuş

import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    IconButton,
    Avatar,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    Snackbar,
    CircularProgress,
    Tooltip,
    Stack,
    Card,
    CardContent,
    LinearProgress,
    InputAdornment
} from '@mui/material';
import {
    Search as SearchIcon,
    Refresh as RefreshIcon,
    CardGiftcard as GiftIcon,
    Extension as ExtendIcon,
    Block as RevokeIcon,
    History as HistoryIcon,
    Timer as TimerIcon,
    CheckCircle as ActiveIcon,
    Cancel as ExpiredIcon,
    Star as PremiumIcon,
    Schedule as TrialIcon,
    Warning as WarningIcon,
    RestartAlt as ResetIcon,
    AccessTime as AccessTimeIcon,
    Apple as AppleIcon,
    ContentCopy as CopyIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.trackbangserver.com';

// ✅ Kalan süreyi hesapla (gün, saat, dakika)
const calculateTimeRemaining = (endDate) => {
    if (!endDate) return { days: 0, hours: 0, minutes: 0, total: 0, isExpired: true };

    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;

    if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, total: 0, isExpired: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return {
        days,
        hours,
        minutes,
        total: diff,
        isExpired: false
    };
};

// ✅ Kalan süreyi formatlı string olarak döndür
const formatTimeRemaining = (timeObj) => {
    if (timeObj.isExpired) return 'Doldu';

    const parts = [];

    if (timeObj.days > 0) {
        parts.push(`${timeObj.days}g`);
    }
    if (timeObj.hours > 0 || timeObj.days > 0) {
        parts.push(`${timeObj.hours}s`);
    }
    parts.push(`${timeObj.minutes}d`);

    return parts.join(' ');
};

// ✅ Detaylı kalan süre (Tooltip için)
const formatTimeRemainingDetailed = (timeObj) => {
    if (timeObj.isExpired) return 'Süresi dolmuş';

    const parts = [];

    if (timeObj.days > 0) {
        parts.push(`${timeObj.days} gün`);
    }
    if (timeObj.hours > 0) {
        parts.push(`${timeObj.hours} saat`);
    }
    if (timeObj.minutes > 0) {
        parts.push(`${timeObj.minutes} dakika`);
    }

    return parts.join(', ') + ' kaldı';
};

// ✅ Status Chip - Sadece 3 Durum
const StatusChip = ({ status, timeRemaining }) => {
    const getStatusConfig = () => {
        switch (status) {
            case 'premium':
            case 'subscribed':
            case 'admin_granted':
                return {
                    label: 'Premium',
                    color: 'success',
                    icon: <PremiumIcon fontSize="small" />
                };
            case 'trial':
            case 'trial_active':
                return {
                    label: `Deneme (${formatTimeRemaining(timeRemaining)})`,
                    color: 'info',
                    icon: <TrialIcon fontSize="small" />
                };
            case 'trial_expired':
            case 'expired':
            default:
                return {
                    label: 'Süresi Dolmuş',
                    color: 'error',
                    icon: <ExpiredIcon fontSize="small" />
                };
        }
    };

    const config = getStatusConfig();
    return (
        <Tooltip title={status === 'trial_active' || status === 'trial' ? formatTimeRemainingDetailed(timeRemaining) : ''}>
            <Chip
                icon={config.icon}
                label={config.label}
                color={config.color}
                size="small"
                sx={{ fontWeight: 'medium' }}
            />
        </Tooltip>
    );
};

// ✅ Kalan Süre Chip Bileşeni
const TimeRemainingChip = ({ timeRemaining }) => {
    if (timeRemaining.isExpired) {
        return (
            <Chip
                label="Doldu"
                size="small"
                color="error"
                variant="outlined"
                icon={<ExpiredIcon />}
            />
        );
    }

    // Renk belirleme
    let color = 'default';
    let bgcolor = '#f5f5f5';
    let textColor = '#333';

    if (timeRemaining.days <= 1) {
        color = 'error';
        bgcolor = '#FFEBEE';
        textColor = '#C62828';
    } else if (timeRemaining.days <= 3) {
        color = 'warning';
        bgcolor = '#FFF3E0';
        textColor = '#E65100';
    } else if (timeRemaining.days <= 7) {
        color = 'info';
        bgcolor = '#E3F2FD';
        textColor = '#1565C0';
    } else {
        bgcolor = '#E8F5E9';
        textColor = '#2E7D32';
    }

    return (
        <Tooltip title={formatTimeRemainingDetailed(timeRemaining)} arrow>
            <Chip
                icon={<AccessTimeIcon sx={{ fontSize: 16 }} />}
                label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="caption" fontWeight="bold" component="span">
                            {timeRemaining.days}g
                        </Typography>
                        <Typography variant="caption" component="span">
                            {timeRemaining.hours}s
                        </Typography>
                        <Typography variant="caption" component="span">
                            {timeRemaining.minutes}d
                        </Typography>
                    </Box>
                }
                size="small"
                sx={{
                    bgcolor: bgcolor,
                    color: textColor,
                    fontWeight: 'medium',
                    '& .MuiChip-icon': {
                        color: textColor
                    }
                }}
            />
        </Tooltip>
    );
};

// ✅ Kullanıcı durumunu hesapla
const getUserStatus = (user) => {
    const sub = user.subscription;

    // Premium veya Admin tarafından verilmiş aktif abonelik
    if (sub.isActive || sub.grantedByAdmin) {
        if (sub.endDate && new Date(sub.endDate) > new Date()) {
            return 'premium';
        }
        if (sub.type === 'lifetime') {
            return 'premium';
        }
    }

    // Aktif Trial
    if (sub.trialEndDate && new Date(sub.trialEndDate) > new Date()) {
        return 'trial_active';
    }

    // Süresi dolmuş (trial veya abonelik)
    return 'expired';
};

export default function SubscriptionManagement() {
    // State
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Dialog states
    const [grantDialog, setGrantDialog] = useState({ open: false, user: null });
    const [extendDialog, setExtendDialog] = useState({ open: false, user: null });
    const [revokeDialog, setRevokeDialog] = useState({ open: false, user: null });
    const [historyDialog, setHistoryDialog] = useState({ open: false, user: null, history: [] });
    const [trialDialog, setTrialDialog] = useState({ open: false, user: null });
    const [grantTrialDialog, setGrantTrialDialog] = useState({ open: false, user: null });

    // Form states
    const [grantDuration, setGrantDuration] = useState(30);
    const [grantReason, setGrantReason] = useState('');
    const [grantType, setGrantType] = useState('monthly');
    const [extendDays, setExtendDays] = useState(30);
    const [extendReason, setExtendReason] = useState('');
    const [revokeReason, setRevokeReason] = useState('');
    const [trialDays, setTrialDays] = useState(7);
    const [trialHours, setTrialHours] = useState(0);
    const [trialMinutes, setTrialMinutes] = useState(0);

    // Snackbar
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // ✅ Gerçek zamanlı güncelleme için
    const [, setTick] = useState(0);

    useEffect(() => {
        // Her dakika kalan süreleri güncelle
        const interval = setInterval(() => {
            setTick(tick => tick + 1);
        }, 60000); // 1 dakika

        return () => clearInterval(interval);
    }, []);

    // ========== DATA LOADING ==========

    const loadStats = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/admin/subscriptions/stats`);
            if (response.data.success) {
                setStats(response.data.stats);
            }
        } catch (error) {
            console.error('Stats loading error:', error);
        }
    }, []);

    const loadUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/admin/subscriptions/users`, {
                params: {
                    page: page + 1,
                    limit: rowsPerPage,
                    status: statusFilter,
                    search
                }
            });

            if (response.data.success) {
                setUsers(response.data.users);
                setTotal(response.data.pagination.total);
            }
        } catch (error) {
            console.error('Users loading error:', error);
            showSnackbar('Kullanıcılar yüklenemedi', 'error');
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage, statusFilter, search]);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    // ========== HELPERS ==========

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // ========== ACTIONS ==========

    // Abonelik Ver
    const handleGrantSubscription = async () => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/admin/subscriptions/users/${grantDialog.user._id}/grant`,
                {
                    type: grantType,
                    duration: grantType === 'lifetime' ? 36500 : grantDuration,
                    reason: grantReason || 'Admin tarafından verildi'
                }
            );

            if (response.data.success) {
                showSnackbar(`Abonelik başarıyla verildi`);
                setGrantDialog({ open: false, user: null });
                setGrantDuration(30);
                setGrantReason('');
                setGrantType('monthly');
                loadUsers();
                loadStats();
            }
        } catch (error) {
            showSnackbar(error.response?.data?.message || 'İşlem başarısız', 'error');
        }
    };

    // Abonelik Uzat
    const handleExtendSubscription = async () => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/admin/subscriptions/users/${extendDialog.user._id}/extend`,
                {
                    days: extendDays,
                    reason: extendReason || 'Admin tarafından uzatıldı'
                }
            );

            if (response.data.success) {
                showSnackbar(`Abonelik ${extendDays} gün uzatıldı`);
                setExtendDialog({ open: false, user: null });
                setExtendDays(30);
                setExtendReason('');
                loadUsers();
                loadStats();
            }
        } catch (error) {
            showSnackbar(error.response?.data?.message || 'İşlem başarısız', 'error');
        }
    };

    // Abonelik İptal
    const handleRevokeSubscription = async () => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/admin/subscriptions/users/${revokeDialog.user._id}/revoke`,
                { reason: revokeReason || 'Admin tarafından iptal edildi' }
            );

            if (response.data.success) {
                showSnackbar('Abonelik iptal edildi');
                setRevokeDialog({ open: false, user: null });
                setRevokeReason('');
                loadUsers();
                loadStats();
            }
        } catch (error) {
            showSnackbar(error.response?.data?.message || 'İşlem başarısız', 'error');
        }
    };

    // Trial Sıfırla (Yeniden 7 gün ver)
    const handleResetTrial = async () => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/admin/subscriptions/users/${trialDialog.user._id}/reset-trial`,
                { reason: 'Admin tarafından trial sıfırlandı' }
            );

            if (response.data.success) {
                showSnackbar('Deneme süresi sıfırlandı (7 gün verildi)');
                setTrialDialog({ open: false, user: null });
                loadUsers();
                loadStats();
            }
        } catch (error) {
            showSnackbar(error.response?.data?.message || 'İşlem başarısız', 'error');
        }
    };

    // Özel Deneme Süresi Ver
    const handleGrantTrial = async () => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/admin/subscriptions/users/${grantTrialDialog.user._id}/grant-trial`,
                {
                    days: trialDays,
                    hours: trialHours,
                    minutes: trialMinutes,
                    reason: 'Admin tarafından deneme süresi verildi'
                }
            );

            if (response.data.success) {
                const totalTime = [];
                if (trialDays > 0) totalTime.push(`${trialDays} gün`);
                if (trialHours > 0) totalTime.push(`${trialHours} saat`);
                if (trialMinutes > 0) totalTime.push(`${trialMinutes} dakika`);
                showSnackbar(`Deneme süresi verildi: ${totalTime.join(', ')}`);
                setGrantTrialDialog({ open: false, user: null });
                setTrialDays(7);
                setTrialHours(0);
                setTrialMinutes(0);
                loadUsers();
                loadStats();
            }
        } catch (error) {
            showSnackbar(error.response?.data?.message || 'İşlem başarısız', 'error');
        }
    };

    // Geçmiş Göster
    const handleShowHistory = async (user) => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/admin/subscriptions/users/${user._id}`
            );

            if (response.data.success) {
                setHistoryDialog({
                    open: true,
                    user,
                    history: response.data.history || []
                });
            }
        } catch (error) {
            showSnackbar('Geçmiş yüklenemedi', 'error');
        }
    };

    // ========== RENDER ==========

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" fontWeight="bold">
                    Abonelik Yönetimi
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={() => { loadStats(); loadUsers(); }}
                >
                    Yenile
                </Button>
            </Box>

            {/* Stats Cards - 3 Durum */}
            {stats && (
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    {/* Premium */}
                    <Grid item xs={12} sm={4}>
                        <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <PremiumIcon />
                                    <Typography variant="h6">Premium</Typography>
                                </Box>
                                <Typography variant="h3" fontWeight="bold">
                                    {stats.premium?.total || 0}
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                    Aktif abonelik
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Trial */}
                    <Grid item xs={12} sm={4}>
                        <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <TrialIcon />
                                    <Typography variant="h6">Deneme</Typography>
                                </Box>
                                <Typography variant="h3" fontWeight="bold">
                                    {stats.trial?.active || 0}
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                    Aktif trial
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Süresi Dolmuş */}
                    <Grid item xs={12} sm={4}>
                        <Card sx={{ bgcolor: 'error.main', color: 'white' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <ExpiredIcon />
                                    <Typography variant="h6">Süresi Dolmuş</Typography>
                                </Box>
                                <Typography variant="h3" fontWeight="bold">
                                    {(stats.trial?.expired || 0) + (stats.expired?.total || 0)}
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                    Yenileme bekliyor
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Uyarı - Yakında Dolacaklar */}
            {stats?.warnings?.expiringIn3Days > 0 && (
                <Alert
                    severity="warning"
                    sx={{ mb: 2 }}
                    icon={<WarningIcon />}
                >
                    <strong>{stats.warnings.expiringIn3Days}</strong> kullanıcının aboneliği 3 gün içinde dolacak!
                </Alert>
            )}

            {/* Filters & Search */}
            <Paper sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            placeholder="Kullanıcı adı, email veya isim ara..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel>Durum Filtresi</InputLabel>
                            <Select
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                                label="Durum Filtresi"
                            >
                                <MenuItem value="all">Tümü</MenuItem>
                                <MenuItem value="premium">
                                    <Chip icon={<PremiumIcon />} label="Premium" color="success" size="small" sx={{ mr: 1 }} />
                                    Premium
                                </MenuItem>
                                <MenuItem value="trial">
                                    <Chip icon={<TrialIcon />} label="Deneme" color="info" size="small" sx={{ mr: 1 }} />
                                    Deneme
                                </MenuItem>
                                <MenuItem value="expired">
                                    <Chip icon={<ExpiredIcon />} label="Dolmuş" color="error" size="small" sx={{ mr: 1 }} />
                                    Süresi Dolmuş
                                </MenuItem>
                                <MenuItem value="expiring">
                                    <Chip icon={<WarningIcon />} label="Dolacak" color="warning" size="small" sx={{ mr: 1 }} />
                                    3 Gün İçinde Dolacak
                                </MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>

            {/* Users Table */}
            <TableContainer component={Paper}>
                {loading && <LinearProgress />}
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'grey.100' }}>
                            <TableCell><strong>Kullanıcı</strong></TableCell>
                            <TableCell><strong>Durum</strong></TableCell>
                            <TableCell><strong>Abonelik Türü</strong></TableCell>
                            <TableCell><strong>Apple ID</strong></TableCell>
                            <TableCell><strong>Bitiş Tarihi</strong></TableCell>
                            <TableCell><strong>Kalan Süre</strong></TableCell>
                            <TableCell align="right"><strong>İşlemler</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.length === 0 && !loading ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                    <Typography color="textSecondary">
                                        Kullanıcı bulunamadı
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => {
                                const status = getUserStatus(user);
                                // Trial durumunda trialEndDate, premium durumunda endDate kullan
                                const endDate = (status === 'trial_active' || status === 'trial')
                                    ? user.subscription.trialEndDate
                                    : (user.subscription.endDate || user.subscription.trialEndDate);
                                const timeRemaining = calculateTimeRemaining(endDate);

                                return (
                                    <TableRow key={user._id} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar src={user.profileImage} sx={{ width: 40, height: 40 }}>
                                                    {user.fullName?.[0]}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {user.fullName}
                                                    </Typography>
                                                    <Typography variant="caption" color="textSecondary">
                                                        @{user.username} • {user.email}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <StatusChip status={status} timeRemaining={timeRemaining} />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {user.subscription.type === 'monthly' ? 'Aylık' :
                                                    user.subscription.type === 'yearly' ? 'Yıllık' :
                                                        user.subscription.type === 'lifetime' ? 'Ömür Boyu' :
                                                            user.subscription.type === 'trial' ? 'Deneme' :
                                                                user.subscription.grantedByAdmin ? 'Admin' : 'Deneme'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {user.subscription.originalTransactionId ? (
                                                <Tooltip title={`Apple Transaction ID: ${user.subscription.originalTransactionId}`}>
                                                    <Chip
                                                        icon={<AppleIcon sx={{ fontSize: 16 }} />}
                                                        label={user.subscription.originalTransactionId.substring(0, 8) + '...'}
                                                        size="small"
                                                        variant="outlined"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(user.subscription.originalTransactionId);
                                                            showSnackbar('Apple ID kopyalandı', 'info');
                                                        }}
                                                        sx={{
                                                            cursor: 'pointer',
                                                            '&:hover': { bgcolor: 'action.hover' }
                                                        }}
                                                    />
                                                </Tooltip>
                                            ) : (
                                                <Typography variant="body2" color="textSecondary">-</Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {formatDate(endDate)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <TimeRemainingChip timeRemaining={timeRemaining} />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                {/* Abonelik Ver */}
                                                <Tooltip title="Premium Ver">
                                                    <IconButton
                                                        size="small"
                                                        color="success"
                                                        onClick={() => setGrantDialog({ open: true, user })}
                                                    >
                                                        <GiftIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>

                                                {/* Uzat - sadece aktif abonelik/trial varsa */}
                                                {status !== 'expired' && (
                                                    <Tooltip title="Süre Uzat">
                                                        <IconButton
                                                            size="small"
                                                            color="primary"
                                                            onClick={() => setExtendDialog({ open: true, user })}
                                                        >
                                                            <ExtendIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}

                                                {/* İptal - sadece premium varsa */}
                                                {status === 'premium' && (
                                                    <Tooltip title="Aboneliği İptal Et">
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() => setRevokeDialog({ open: true, user })}
                                                        >
                                                            <RevokeIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}

                                                {/* Trial Sıfırla - süresi dolmuş veya trial durumunda */}
                                                {(status === 'expired' || status === 'trial_active') && (
                                                    <Tooltip title="Deneme Süresini Sıfırla (7 gün)">
                                                        <IconButton
                                                            size="small"
                                                            color="info"
                                                            onClick={() => setTrialDialog({ open: true, user })}
                                                        >
                                                            <ResetIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}

                                                {/* Özel Deneme Süresi Ver */}
                                                <Tooltip title="Özel Deneme Süresi Ver">
                                                    <IconButton
                                                        size="small"
                                                        color="warning"
                                                        onClick={() => setGrantTrialDialog({ open: true, user })}
                                                    >
                                                        <TimerIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>

                                                {/* Geçmiş */}
                                                <Tooltip title="Geçmiş">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleShowHistory(user)}
                                                    >
                                                        <HistoryIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    count={total}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                    rowsPerPageOptions={[10, 20, 50, 100]}
                    labelRowsPerPage="Sayfa başına:"
                />
            </TableContainer>

            {/* ========== DIALOGS ========== */}

            {/* Grant Dialog - Premium Ver */}
            <Dialog open={grantDialog.open} onClose={() => setGrantDialog({ open: false, user: null })} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ bgcolor: 'success.main', color: 'white' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <GiftIcon />
                        Premium Abonelik Ver
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    {grantDialog.user && (
                        <Alert severity="info" sx={{ mb: 2 }}>
                            <strong>{grantDialog.user.fullName}</strong> (@{grantDialog.user.username}) kullanıcısına premium verilecek.
                        </Alert>
                    )}
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Abonelik Türü</InputLabel>
                        <Select
                            value={grantType}
                            onChange={(e) => setGrantType(e.target.value)}
                            label="Abonelik Türü"
                        >
                            <MenuItem value="monthly">Aylık</MenuItem>
                            <MenuItem value="yearly">Yıllık</MenuItem>
                            <MenuItem value="lifetime">Ömür Boyu</MenuItem>
                        </Select>
                    </FormControl>
                    {grantType !== 'lifetime' && (
                        <TextField
                            fullWidth
                            type="number"
                            label="Süre (Gün)"
                            value={grantDuration}
                            onChange={(e) => setGrantDuration(parseInt(e.target.value))}
                            sx={{ mb: 2 }}
                            helperText={`${grantDuration} gün = ${Math.round(grantDuration / 30)} ay`}
                        />
                    )}
                    <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label="Sebep (Opsiyonel)"
                        value={grantReason}
                        onChange={(e) => setGrantReason(e.target.value)}
                        placeholder="Örn: Yarışma ödülü, müşteri memnuniyeti..."
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setGrantDialog({ open: false, user: null })}>İptal</Button>
                    <Button variant="contained" color="success" onClick={handleGrantSubscription} startIcon={<GiftIcon />}>
                        Premium Ver
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Extend Dialog - Süre Uzat */}
            <Dialog open={extendDialog.open} onClose={() => setExtendDialog({ open: false, user: null })} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ExtendIcon />
                        Süre Uzat
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    {extendDialog.user && (
                        <>
                            <Alert severity="info" sx={{ mb: 2 }}>
                                <strong>{extendDialog.user.fullName}</strong><br />
                                Mevcut bitiş: {formatDate(extendDialog.user.subscription?.endDate || extendDialog.user.subscription?.trialEndDate)}
                            </Alert>
                            {/* Kalan süre gösterimi */}
                            {(() => {
                                const endDate = extendDialog.user.subscription?.endDate || extendDialog.user.subscription?.trialEndDate;
                                const timeRemaining = calculateTimeRemaining(endDate);
                                if (!timeRemaining.isExpired) {
                                    return (
                                        <Alert severity="success" sx={{ mb: 2 }}>
                                            Kalan süre: <strong>{formatTimeRemainingDetailed(timeRemaining)}</strong>
                                        </Alert>
                                    );
                                }
                                return null;
                            })()}
                        </>
                    )}
                    <TextField
                        fullWidth
                        type="number"
                        label="Eklenecek Gün"
                        value={extendDays}
                        onChange={(e) => setExtendDays(parseInt(e.target.value))}
                        sx={{ mb: 2 }}
                        helperText={`${extendDays} gün eklenecek`}
                    />
                    <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label="Sebep (Opsiyonel)"
                        value={extendReason}
                        onChange={(e) => setExtendReason(e.target.value)}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setExtendDialog({ open: false, user: null })}>İptal</Button>
                    <Button variant="contained" color="primary" onClick={handleExtendSubscription} startIcon={<ExtendIcon />}>
                        Süre Uzat
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Revoke Dialog - İptal Et */}
            <Dialog open={revokeDialog.open} onClose={() => setRevokeDialog({ open: false, user: null })} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ bgcolor: 'error.main', color: 'white' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <RevokeIcon />
                        Aboneliği İptal Et
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Alert severity="error" sx={{ mb: 2 }}>
                        <strong>Dikkat!</strong> Bu işlem kullanıcının premium erişimini hemen sonlandıracak.
                    </Alert>
                    {revokeDialog.user && (
                        <Typography variant="body2" sx={{ mb: 2 }}>
                            Kullanıcı: <strong>{revokeDialog.user.fullName}</strong> (@{revokeDialog.user.username})
                        </Typography>
                    )}
                    <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label="İptal Sebebi"
                        value={revokeReason}
                        onChange={(e) => setRevokeReason(e.target.value)}
                        placeholder="Örn: Kullanıcı isteği, ihlal..."
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setRevokeDialog({ open: false, user: null })}>Vazgeç</Button>
                    <Button variant="contained" color="error" onClick={handleRevokeSubscription} startIcon={<RevokeIcon />}>
                        İptal Et
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Trial Reset Dialog */}
            <Dialog open={trialDialog.open} onClose={() => setTrialDialog({ open: false, user: null })} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ bgcolor: 'info.main', color: 'white' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ResetIcon />
                        Deneme Süresini Sıfırla
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    {trialDialog.user && (
                        <Alert severity="info" sx={{ mb: 2 }}>
                            <strong>{trialDialog.user.fullName}</strong> kullanıcısına yeniden 7 günlük deneme süresi verilecek.
                        </Alert>
                    )}
                    <Typography variant="body2" color="textSecondary">
                        Bu işlem kullanıcının deneme hakkını sıfırlar ve 7 günlük yeni bir deneme süresi başlatır.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setTrialDialog({ open: false, user: null })}>İptal</Button>
                    <Button variant="contained" color="info" onClick={handleResetTrial} startIcon={<ResetIcon />}>
                        7 Gün Ver
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Grant Custom Trial Dialog - Özel Deneme Süresi Ver */}
            <Dialog open={grantTrialDialog.open} onClose={() => setGrantTrialDialog({ open: false, user: null })} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ bgcolor: 'warning.main', color: 'white' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TimerIcon />
                        Deneme Süresi Tanımla
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    {grantTrialDialog.user && (
                        <Alert severity="info" sx={{ mb: 2 }}>
                            <strong>{grantTrialDialog.user.fullName}</strong> (@{grantTrialDialog.user.username}) kullanıcısına deneme süresi verilecek.
                        </Alert>
                    )}
                    <Typography variant="subtitle2" sx={{ mb: 2 }}>
                        Deneme Süresi Belirle:
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={4}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Gün"
                                value={trialDays}
                                onChange={(e) => setTrialDays(Math.max(0, parseInt(e.target.value) || 0))}
                                InputProps={{
                                    inputProps: { min: 0 }
                                }}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Saat"
                                value={trialHours}
                                onChange={(e) => setTrialHours(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
                                InputProps={{
                                    inputProps: { min: 0, max: 23 }
                                }}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Dakika"
                                value={trialMinutes}
                                onChange={(e) => setTrialMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                                InputProps={{
                                    inputProps: { min: 0, max: 59 }
                                }}
                            />
                        </Grid>
                    </Grid>
                    <Alert severity="warning" sx={{ mt: 2 }}>
                        Toplam süre: <strong>{trialDays} gün, {trialHours} saat, {trialMinutes} dakika</strong>
                    </Alert>
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                        Not: Sandbox testleri için kısa süreler (5-10 dakika) kullanabilirsiniz.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setGrantTrialDialog({ open: false, user: null })}>İptal</Button>
                    <Button
                        variant="contained"
                        color="warning"
                        onClick={handleGrantTrial}
                        startIcon={<TimerIcon />}
                        disabled={trialDays === 0 && trialHours === 0 && trialMinutes === 0}
                    >
                        Deneme Süresi Ver
                    </Button>
                </DialogActions>
            </Dialog>

            {/* History Dialog */}
            <Dialog open={historyDialog.open} onClose={() => setHistoryDialog({ open: false, user: null, history: [] })} maxWidth="md" fullWidth>
                <DialogTitle>
                    Abonelik Geçmişi - {historyDialog.user?.fullName}
                </DialogTitle>
                <DialogContent>
                    {historyDialog.history.length === 0 ? (
                        <Typography color="textSecondary" align="center" sx={{ py: 4 }}>
                            Geçmiş kaydı bulunamadı
                        </Typography>
                    ) : (
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Tarih</TableCell>
                                    <TableCell>İşlem</TableCell>
                                    <TableCell>Tür</TableCell>
                                    <TableCell>Bitiş</TableCell>
                                    <TableCell>Sebep</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {historyDialog.history.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{formatDate(item.date)}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={
                                                    item.action === 'started' || item.action === 'admin_granted' ? 'Verildi' :
                                                        item.action === 'renewed' || item.action === 'extended' ? 'Uzatıldı' :
                                                            item.action === 'cancelled' || item.action === 'admin_revoked' ? 'İptal' :
                                                                item.action === 'trial_started' ? 'Deneme Başladı' :
                                                                    item.action === 'trial_reset' ? 'Deneme Sıfırlandı' :
                                                                        item.action
                                                }
                                                size="small"
                                                color={
                                                    item.action === 'started' || item.action === 'admin_granted' ? 'success' :
                                                        item.action === 'renewed' || item.action === 'extended' ? 'info' :
                                                            item.action === 'cancelled' || item.action === 'admin_revoked' ? 'error' :
                                                                'default'
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>{item.type || '-'}</TableCell>
                                        <TableCell>{formatDate(item.endDate)}</TableCell>
                                        <TableCell>{item.reason || '-'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setHistoryDialog({ open: false, user: null, history: [] })}>
                        Kapat
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} variant="filled">
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}