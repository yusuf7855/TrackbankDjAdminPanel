// src/pages/UserManagement.jsx - KULLANICI YÖNETİMİ + ABONELİK YÖNETİMİ
// ✅ YENİ: Abonelik durumu görüntüleme, trial/premium yönetimi, süre uzatma
// NOT: Trackbang rozetli artistler burada GÖRÜNMEYECEK - onlar ArtistManagement'ta
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
    Divider,
    Card,
    CardContent,
    InputAdornment,
    Switch,
    FormControlLabel,
    Collapse,
    LinearProgress
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    Refresh as RefreshIcon,
    Person as PersonIcon,
    Clear as ClearIcon,
    FilterList as FilterIcon,
    ExpandLess as ExpandLessIcon,
    Verified,
    WorkspacePremium,
    AdminPanelSettings as AdminIcon,
    ContentCopy as CopyIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    LockReset as LockResetIcon,
    Lock as LockIcon,
    Key as KeyIcon,
    CheckCircle as CheckCircleIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    Group as GroupIcon,
    Badge as BadgeIcon,
    CardMembership as SubscriptionIcon,
    Timer as TrialIcon,
    Star as PremiumIcon,
    Warning as WarningIcon,
    Cancel as CancelIcon,
    AddCircle as AddIcon,
    Extension as ExtendIcon,
    History as HistoryIcon,
    PlayArrow as StartIcon,
    Replay as ResetIcon,
    Block as RevokeIcon,
    CardGiftcard as GiftIcon,
    CalendarToday as CalendarIcon,
    AccessTime as TimeIcon,
    TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = 'https://api.trackbangserver.com/api';

// Badge Tanımları (sadece görüntüleme için - trackbang hariç)
const badges = {
    standard: { label: 'Standart', icon: Verified, color: '#2196f3' },
    premium: { label: 'Premium', icon: WorkspacePremium, color: '#ffc107' },
    none: { label: 'Rozet Yok', icon: null, color: '#9e9e9e' }
};

// ✅ YENİ: Subscription Status Tanımları
const subscriptionStatuses = {
    new_user: { label: 'Yeni Üye', color: '#9CA3AF', bgColor: '#F3F4F6', icon: PersonIcon },
    trial_active: { label: 'Trial Aktif', color: '#3B82F6', bgColor: '#DBEAFE', icon: TrialIcon },
    trial_expired: { label: 'Trial Doldu', color: '#F59E0B', bgColor: '#FEF3C7', icon: WarningIcon },
    subscribed: { label: 'Premium', color: '#10B981', bgColor: '#D1FAE5', icon: PremiumIcon },
    admin_granted: { label: 'Admin Verdi', color: '#8B5CF6', bgColor: '#EDE9FE', icon: GiftIcon },
    expired: { label: 'Süresi Doldu', color: '#EF4444', bgColor: '#FEE2E2', icon: CancelIcon }
};

// ✅ YENİ: Subscription Type Tanımları
const subscriptionTypes = {
    free: { label: 'Ücretsiz', color: '#9CA3AF' },
    trial: { label: 'Deneme', color: '#3B82F6' },
    monthly: { label: 'Aylık', color: '#10B981' },
    yearly: { label: 'Yıllık', color: '#F59E0B' },
    lifetime: { label: 'Ömür Boyu', color: '#8B5CF6' },
    admin_granted: { label: 'Admin Verdi', color: '#7C3AED' },
    premium: { label: 'Premium', color: '#10B981' }
};

const UserManagement = () => {
    // Users state
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalUsers, setTotalUsers] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [subscriptionFilter, setSubscriptionFilter] = useState('');  // ✅ YENİ
    const [showFilters, setShowFilters] = useState(false);

    // Dialog states
    const [editDialog, setEditDialog] = useState({ open: false, user: null });
    const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null });
    const [passwordDialog, setPasswordDialog] = useState({ open: false, user: null, mode: 'reset' });
    const [passwordResultDialog, setPasswordResultDialog] = useState({ open: false, data: null });

    // ✅ YENİ: Subscription Dialog States
    const [subscriptionDialog, setSubscriptionDialog] = useState({ open: false, user: null, action: null });
    const [subscriptionHistoryDialog, setSubscriptionHistoryDialog] = useState({ open: false, user: null, history: [] });
    const [subscriptionLoading, setSubscriptionLoading] = useState(false);

    // ✅ YENİ: Subscription Form State
    const [subscriptionFormData, setSubscriptionFormData] = useState({
        type: 'admin_granted',
        duration: 30,
        reason: '',
        days: 7
    });

    // Password form state
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Edit form state
    const [editFormData, setEditFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        phone: '',
        bio: '',
        isAdmin: false,
        isActive: true,
        badge: 'none'
    });

    // Snackbar state
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // Stats - ✅ GÜNCELLENDİ: Subscription stats eklendi
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        adminUsers: 0,
        premiumUsers: 0,
        trialUsers: 0,
        expiredTrialUsers: 0
    });

    // ========== SNACKBAR ==========
    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    // ========== LOAD DATA ==========
    const loadUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: page + 1,
                limit: rowsPerPage,
                search: searchQuery || undefined,
                role: roleFilter || undefined,
                status: statusFilter || undefined,
                subscriptionStatus: subscriptionFilter || undefined,
                excludeBadge: 'trackbang'
            };

            const response = await axios.get(`${API_BASE_URL}/admin/users`, { params });

            if (response.data.success) {
                const filteredUsers = (response.data.data.users || []).filter(
                    user => user.badge !== 'trackbang'
                );
                setUsers(filteredUsers);
                setTotalUsers(response.data.data.pagination?.total || filteredUsers.length);
            }
        } catch (error) {
            console.error('Users yüklenirken hata:', error);
            showSnackbar('Kullanıcılar yüklenirken hata oluştu', 'error');
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage, searchQuery, roleFilter, statusFilter, subscriptionFilter]);

    const loadStats = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/admin/dashboard/stats`);
            if (response.data.success) {
                setStats(response.data.data.stats || {});
            }
        } catch (error) {
            console.error('Stats yüklenirken hata:', error);
        }
    }, []);

    useEffect(() => {
        loadUsers();
        loadStats();
    }, [loadUsers, loadStats]);

    // ========== HELPER FUNCTIONS ==========
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        showSnackbar('Panoya kopyalandı', 'success');
    };

    // ✅ YENİ: Kalan gün hesapla
    const calculateDaysRemaining = (user) => {
        if (!user.subscription) return 0;

        const now = new Date();
        let endDate = null;

        // Trial kontrolü
        if (user.subscription.type === 'trial' && user.subscription.trialEndDate) {
            endDate = new Date(user.subscription.trialEndDate);
        }
        // Normal abonelik
        else if (user.subscription.endDate) {
            endDate = new Date(user.subscription.endDate);
        }

        if (!endDate) return 0;

        const diffTime = endDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    // ✅ YENİ: Subscription durumu belirle
    const getSubscriptionStatus = (user) => {
        if (!user.subscription) return 'new_user';

        const now = new Date();
        const sub = user.subscription;

        // Admin tarafından verilmiş ve aktif
        if (sub.grantedByAdmin && sub.isActive) {
            if (!sub.endDate || new Date(sub.endDate) > now) {
                return 'admin_granted';
            }
        }

        // Trial kullanılmamış
        if (!sub.trialUsed && !sub.isActive) {
            return 'new_user';
        }

        // Aktif trial
        if (sub.type === 'trial' && sub.trialEndDate) {
            const trialEnd = new Date(sub.trialEndDate);
            if (trialEnd > now) {
                return 'trial_active';
            } else {
                return 'trial_expired';
            }
        }

        // Trial kullanılmış ama aktif abonelik yok
        if (sub.trialUsed && !sub.isActive) {
            return 'trial_expired';
        }

        // Aktif abonelik
        if (sub.isActive && sub.endDate) {
            const endDate = new Date(sub.endDate);
            if (endDate > now) {
                return 'subscribed';
            } else {
                return 'expired';
            }
        }

        // Aktif ama tarih yok (lifetime vb)
        if (sub.isActive) {
            return 'subscribed';
        }

        return 'new_user';
    };

    // ✅ YENİ: Format date helper
    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatDateTime = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // ✅ YENİ: Subscription status chip render
    const renderSubscriptionChip = (user) => {
        const status = getSubscriptionStatus(user);
        const statusInfo = subscriptionStatuses[status] || subscriptionStatuses.new_user;
        const daysRemaining = calculateDaysRemaining(user);
        const IconComponent = statusInfo.icon;

        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-start' }}>
                <Chip
                    size="small"
                    icon={<IconComponent sx={{ fontSize: 14 }} />}
                    label={statusInfo.label}
                    sx={{
                        bgcolor: statusInfo.bgColor,
                        color: statusInfo.color,
                        fontWeight: 'bold',
                        fontSize: '0.7rem',
                        '& .MuiChip-icon': { color: statusInfo.color }
                    }}
                />
                {daysRemaining > 0 && (status === 'trial_active' || status === 'subscribed' || status === 'admin_granted') && (
                    <Chip
                        size="small"
                        icon={<TimeIcon sx={{ fontSize: 10 }} />}
                        label={`${daysRemaining} gün kaldı`}
                        sx={{
                            height: 18,
                            fontSize: '0.6rem',
                            bgcolor: daysRemaining <= 3 ? '#FEE2E2' : '#F3F4F6',
                            color: daysRemaining <= 3 ? '#EF4444' : '#6B7280',
                            '& .MuiChip-icon': {
                                color: daysRemaining <= 3 ? '#EF4444' : '#6B7280',
                                fontSize: 10
                            }
                        }}
                    />
                )}
            </Box>
        );
    };

    // Edit Dialog
    const handleOpenEditDialog = (user) => {
        setEditFormData({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            username: user.username || '',
            email: user.email || '',
            phone: user.phone || '',
            bio: user.bio || '',
            isAdmin: user.isAdmin || false,
            isActive: user.isActive !== false,
            badge: user.badge || 'none'
        });
        setEditDialog({ open: true, user });
    };

    const handleCloseEditDialog = () => {
        setEditDialog({ open: false, user: null });
    };

    const handleEditFormChange = (field, value) => {
        setEditFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveUser = async () => {
        try {
            await axios.put(`${API_BASE_URL}/admin/users/${editDialog.user._id}`, editFormData);
            showSnackbar('Kullanıcı güncellendi', 'success');
            handleCloseEditDialog();
            loadUsers();
            loadStats();
        } catch (error) {
            console.error('Kullanıcı güncellenirken hata:', error);
            showSnackbar(error.response?.data?.message || 'Güncelleme hatası', 'error');
        }
    };

    // Delete Dialog
    const handleOpenDeleteDialog = (user) => {
        setDeleteDialog({ open: true, user });
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialog({ open: false, user: null });
    };

    const handleDeleteUser = async () => {
        try {
            await axios.delete(`${API_BASE_URL}/admin/users/${deleteDialog.user._id}`);
            showSnackbar('Kullanıcı silindi', 'success');
            handleCloseDeleteDialog();
            loadUsers();
            loadStats();
        } catch (error) {
            console.error('Kullanıcı silinirken hata:', error);
            showSnackbar('Silme hatası', 'error');
        }
    };

    // ========== ŞİFRE YÖNETİMİ ==========
    const handleOpenPasswordDialog = (user, mode = 'reset') => {
        setPasswordDialog({ open: true, user, mode });
        setNewPassword('');
        setShowPassword(false);
    };

    const handleClosePasswordDialog = () => {
        setPasswordDialog({ open: false, user: null, mode: 'reset' });
        setNewPassword('');
    };

    const handleResetPassword = async () => {
        setPasswordLoading(true);
        try {
            const response = await axios.post(
                `${API_BASE_URL}/admin/users/${passwordDialog.user._id}/reset-password`
            );

            if (response.data.success) {
                setPasswordResultDialog({ open: true, data: response.data.data });
                handleClosePasswordDialog();
                showSnackbar('Şifre sıfırlandı', 'success');
            }
        } catch (error) {
            console.error('Şifre sıfırlama hatası:', error);
            showSnackbar(error.response?.data?.message || 'Şifre sıfırlanamadı', 'error');
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (!newPassword || newPassword.length < 6) {
            showSnackbar('Şifre en az 6 karakter olmalıdır', 'error');
            return;
        }

        setPasswordLoading(true);
        try {
            const response = await axios.put(
                `${API_BASE_URL}/admin/users/${passwordDialog.user._id}/password`,
                { newPassword }
            );

            if (response.data.success) {
                setPasswordResultDialog({ open: true, data: response.data.data });
                handleClosePasswordDialog();
                showSnackbar('Şifre güncellendi', 'success');
            }
        } catch (error) {
            console.error('Şifre güncelleme hatası:', error);
            showSnackbar(error.response?.data?.message || 'Şifre güncellenemedi', 'error');
        } finally {
            setPasswordLoading(false);
        }
    };

    const generateRandomPassword = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setNewPassword(password);
    };

    // ========== ✅ YENİ: ABONELİK YÖNETİMİ ==========
    const handleOpenSubscriptionDialog = (user, action) => {
        setSubscriptionDialog({ open: true, user, action });
        setSubscriptionFormData({
            type: 'admin_granted',
            duration: 30,
            reason: '',
            days: action === 'trial' ? 7 : 30
        });
    };

    const handleCloseSubscriptionDialog = () => {
        setSubscriptionDialog({ open: false, user: null, action: null });
    };

    // Abonelik ver
    const handleGrantSubscription = async () => {
        setSubscriptionLoading(true);
        try {
            const response = await axios.post(
                `${API_BASE_URL}/admin/subscriptions/users/${subscriptionDialog.user._id}/grant`,
                {
                    type: subscriptionFormData.type,
                    duration: subscriptionFormData.type === 'lifetime' ? null : subscriptionFormData.duration,
                    reason: subscriptionFormData.reason || 'Admin tarafından verildi'
                }
            );

            if (response.data.success) {
                showSnackbar('Abonelik başarıyla verildi!', 'success');
                handleCloseSubscriptionDialog();
                loadUsers();
                loadStats();
            }
        } catch (error) {
            console.error('Abonelik verme hatası:', error);
            showSnackbar(error.response?.data?.message || 'Abonelik verilemedi', 'error');
        } finally {
            setSubscriptionLoading(false);
        }
    };

    // Süre uzat
    const handleExtendSubscription = async () => {
        setSubscriptionLoading(true);
        try {
            const response = await axios.post(
                `${API_BASE_URL}/admin/subscriptions/users/${subscriptionDialog.user._id}/extend`,
                {
                    days: subscriptionFormData.days,
                    reason: subscriptionFormData.reason || 'Admin tarafından uzatıldı'
                }
            );

            if (response.data.success) {
                showSnackbar(`Abonelik ${subscriptionFormData.days} gün uzatıldı!`, 'success');
                handleCloseSubscriptionDialog();
                loadUsers();
            }
        } catch (error) {
            console.error('Süre uzatma hatası:', error);
            showSnackbar(error.response?.data?.message || 'Süre uzatılamadı', 'error');
        } finally {
            setSubscriptionLoading(false);
        }
    };

    // Trial başlat
    const handleStartTrial = async () => {
        setSubscriptionLoading(true);
        try {
            const response = await axios.post(
                `${API_BASE_URL}/admin/subscriptions/users/${subscriptionDialog.user._id}/start-trial`,
                {
                    days: subscriptionFormData.days
                }
            );

            if (response.data.success) {
                showSnackbar(`${subscriptionFormData.days} günlük trial başlatıldı!`, 'success');
                handleCloseSubscriptionDialog();
                loadUsers();
            }
        } catch (error) {
            console.error('Trial başlatma hatası:', error);
            showSnackbar(error.response?.data?.message || 'Trial başlatılamadı', 'error');
        } finally {
            setSubscriptionLoading(false);
        }
    };

    // Trial sıfırla
    const handleResetTrial = async () => {
        setSubscriptionLoading(true);
        try {
            const response = await axios.post(
                `${API_BASE_URL}/admin/subscriptions/users/${subscriptionDialog.user._id}/reset-trial`,
                {
                    reason: subscriptionFormData.reason || 'Admin tarafından sıfırlandı'
                }
            );

            if (response.data.success) {
                showSnackbar('Trial hakkı sıfırlandı!', 'success');
                handleCloseSubscriptionDialog();
                loadUsers();
            }
        } catch (error) {
            console.error('Trial sıfırlama hatası:', error);
            showSnackbar(error.response?.data?.message || 'Trial sıfırlanamadı', 'error');
        } finally {
            setSubscriptionLoading(false);
        }
    };

    // Abonelik iptal
    const handleRevokeSubscription = async () => {
        setSubscriptionLoading(true);
        try {
            const response = await axios.post(
                `${API_BASE_URL}/admin/subscriptions/users/${subscriptionDialog.user._id}/revoke`,
                {
                    reason: subscriptionFormData.reason || 'Admin tarafından iptal edildi'
                }
            );

            if (response.data.success) {
                showSnackbar('Abonelik iptal edildi!', 'success');
                handleCloseSubscriptionDialog();
                loadUsers();
            }
        } catch (error) {
            console.error('Abonelik iptal hatası:', error);
            showSnackbar(error.response?.data?.message || 'İptal edilemedi', 'error');
        } finally {
            setSubscriptionLoading(false);
        }
    };

    // Abonelik geçmişi
    const handleShowSubscriptionHistory = async (user) => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/admin/subscriptions/users/${user._id}`
            );

            if (response.data.success) {
                setSubscriptionHistoryDialog({
                    open: true,
                    user,
                    history: response.data.data.subscriptionHistory || user.subscriptionHistory || []
                });
            }
        } catch (error) {
            console.error('Geçmiş yüklenirken hata:', error);
            // Fallback: user'dan al
            setSubscriptionHistoryDialog({
                open: true,
                user,
                history: user.subscriptionHistory || []
            });
        }
    };

    const renderBadgeChip = (badge) => {
        if (badge === 'trackbang') return null;

        const badgeInfo = badges[badge] || badges.none;
        if (!badgeInfo.icon) return <Typography variant="caption" color="text.secondary">-</Typography>;

        const IconComponent = badgeInfo.icon;
        return (
            <Chip
                size="small"
                icon={<IconComponent fontSize="small" />}
                label={badgeInfo.label}
                sx={{ bgcolor: badgeInfo.color, color: '#fff', '& .MuiChip-icon': { color: '#fff' } }}
            />
        );
    };

    // ✅ YENİ: Action menu için subscription durumuna göre hangi butonlar gösterilecek
    const canStartTrial = (user) => {
        return !user.subscription?.trialUsed;
    };

    const canExtend = (user) => {
        const status = getSubscriptionStatus(user);
        return ['trial_active', 'subscribed', 'admin_granted'].includes(status);
    };

    const canRevoke = (user) => {
        return user.subscription?.isActive;
    };

    const canResetTrial = (user) => {
        return user.subscription?.trialUsed;
    };

    return (
        <Box sx={{ p: 3, bgcolor: '#fafafa', minHeight: '100vh' }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <GroupIcon sx={{ color: '#7C3AED' }} />
                    Kullanıcı Yönetimi
                    <Chip label="Standart" size="small" sx={{ bgcolor: '#2196f3', color: '#fff', ml: 1 }} />
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Kullanıcı hesaplarını ve aboneliklerini yönetin (Artistler hariç)
                </Typography>
            </Box>

            {/* Stats Cards - ✅ GÜNCELLENDİ */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={4} md={2}>
                    <Card sx={{ bgcolor: '#fff', border: '1px solid #e0e0e0' }}>
                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                            <GroupIcon sx={{ fontSize: 28, color: '#7C3AED', mb: 0.5 }} />
                            <Typography variant="h5" fontWeight="bold" color="#7C3AED">{stats.totalUsers || 0}</Typography>
                            <Typography variant="caption" color="text.secondary">Toplam</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={6} sm={4} md={2}>
                    <Card sx={{ bgcolor: '#fff', border: '1px solid #e0e0e0' }}>
                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                            <CheckCircleIcon sx={{ fontSize: 28, color: '#10B981', mb: 0.5 }} />
                            <Typography variant="h5" fontWeight="bold" color="#10B981">{stats.activeUsers || 0}</Typography>
                            <Typography variant="caption" color="text.secondary">Aktif</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={6} sm={4} md={2}>
                    <Card sx={{ bgcolor: '#fff', border: '1px solid #10B981' }}>
                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                            <PremiumIcon sx={{ fontSize: 28, color: '#10B981', mb: 0.5 }} />
                            <Typography variant="h5" fontWeight="bold" color="#10B981">{stats.premiumUsers || 0}</Typography>
                            <Typography variant="caption" color="text.secondary">Premium</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={6} sm={4} md={2}>
                    <Card sx={{ bgcolor: '#fff', border: '1px solid #3B82F6' }}>
                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                            <TrialIcon sx={{ fontSize: 28, color: '#3B82F6', mb: 0.5 }} />
                            <Typography variant="h5" fontWeight="bold" color="#3B82F6">{stats.trialUsers || 0}</Typography>
                            <Typography variant="caption" color="text.secondary">Trial</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={6} sm={4} md={2}>
                    <Card sx={{ bgcolor: '#fff', border: '1px solid #F59E0B' }}>
                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                            <WarningIcon sx={{ fontSize: 28, color: '#F59E0B', mb: 0.5 }} />
                            <Typography variant="h5" fontWeight="bold" color="#F59E0B">{stats.expiredTrialUsers || 0}</Typography>
                            <Typography variant="caption" color="text.secondary">Trial Doldu</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={6} sm={4} md={2}>
                    <Card sx={{ bgcolor: '#fff', border: '1px solid #EF4444' }}>
                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                            <AdminIcon sx={{ fontSize: 28, color: '#EF4444', mb: 0.5 }} />
                            <Typography variant="h5" fontWeight="bold" color="#EF4444">{stats.adminUsers || 0}</Typography>
                            <Typography variant="caption" color="text.secondary">Admin</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Info Alert */}
            <Alert severity="info" sx={{ mb: 3 }} icon={<SubscriptionIcon />}>
                <Typography variant="body2">
                    <strong>💎 Trackbang rozetli artistler</strong> bu listede görünmez.
                    <strong> 🎫 Abonelik İşlemleri:</strong> Her kullanıcı satırında abonelik ver, süre uzat, trial başlat ve iptal butonları bulunur.
                </Typography>
            </Alert>

            {/* Main Content */}
            <Paper sx={{ bgcolor: '#fff', border: '1px solid #e0e0e0' }}>
                {/* Search & Filter */}
                <Box sx={{ p: 2 }}>
                    <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                        <TextField
                            placeholder="Kullanıcı ara (isim, email, telefon)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            size="small"
                            sx={{ minWidth: 300 }}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                                endAdornment: searchQuery && (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => setSearchQuery('')}>
                                            <ClearIcon />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                        <Button
                            variant="outlined"
                            startIcon={showFilters ? <ExpandLessIcon /> : <FilterIcon />}
                            onClick={() => setShowFilters(!showFilters)}
                            sx={{ borderColor: '#7C3AED', color: '#7C3AED' }}
                        >
                            Filtreler {(roleFilter || statusFilter || subscriptionFilter) && `(${[roleFilter, statusFilter, subscriptionFilter].filter(Boolean).length})`}
                        </Button>
                        <IconButton onClick={() => { loadUsers(); loadStats(); }} disabled={loading}>
                            <RefreshIcon sx={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                        </IconButton>
                    </Stack>

                    <Collapse in={showFilters}>
                        <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={3}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Rol</InputLabel>
                                        <Select value={roleFilter} label="Rol" onChange={(e) => setRoleFilter(e.target.value)}>
                                            <MenuItem value="">Tümü</MenuItem>
                                            <MenuItem value="admin">Admin</MenuItem>
                                            <MenuItem value="user">Normal Kullanıcı</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Hesap Durumu</InputLabel>
                                        <Select value={statusFilter} label="Hesap Durumu" onChange={(e) => setStatusFilter(e.target.value)}>
                                            <MenuItem value="">Tümü</MenuItem>
                                            <MenuItem value="active">Aktif</MenuItem>
                                            <MenuItem value="inactive">Pasif</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                {/* ✅ YENİ: Abonelik Filtresi */}
                                <Grid item xs={12} sm={3}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Abonelik Durumu</InputLabel>
                                        <Select value={subscriptionFilter} label="Abonelik Durumu" onChange={(e) => setSubscriptionFilter(e.target.value)}>
                                            <MenuItem value="">Tümü</MenuItem>
                                            <MenuItem value="premium">
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <PremiumIcon sx={{ color: '#10B981', fontSize: 18 }} />
                                                    Premium
                                                </Box>
                                            </MenuItem>
                                            <MenuItem value="trial">
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <TrialIcon sx={{ color: '#3B82F6', fontSize: 18 }} />
                                                    Trial Aktif
                                                </Box>
                                            </MenuItem>
                                            <MenuItem value="trial_expired">
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <WarningIcon sx={{ color: '#F59E0B', fontSize: 18 }} />
                                                    Trial Dolmuş
                                                </Box>
                                            </MenuItem>
                                            <MenuItem value="free">
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <PersonIcon sx={{ color: '#9CA3AF', fontSize: 18 }} />
                                                    Ücretsiz
                                                </Box>
                                            </MenuItem>
                                            <MenuItem value="expiring">
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <WarningIcon sx={{ color: '#EF4444', fontSize: 18 }} />
                                                    Dolmak Üzere (3 gün)
                                                </Box>
                                            </MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        onClick={() => {
                                            setRoleFilter('');
                                            setStatusFilter('');
                                            setSubscriptionFilter('');
                                            setSearchQuery('');
                                        }}
                                        startIcon={<ClearIcon />}
                                    >
                                        Temizle
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>
                    </Collapse>
                </Box>

                {/* Users Table */}
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                <TableCell sx={{ fontWeight: 'bold' }}>Kullanıcı</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Abonelik Durumu</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Abonelik Türü</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Bitiş Tarihi</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Rozet</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }} align="right">İşlemler</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                        <CircularProgress size={40} sx={{ color: '#7C3AED' }} />
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                        <Typography color="text.secondary">Kullanıcı bulunamadı</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user._id} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Avatar src={user.profileImage} sx={{ width: 44, height: 44, bgcolor: '#7C3AED' }}>
                                                    {user.firstName?.charAt(0) || user.username?.charAt(0)}
                                                </Avatar>
                                                <Box>
                                                    <Typography fontWeight="bold" fontSize="0.9rem">
                                                        {user.firstName} {user.lastName}
                                                        {user.isAdmin && (
                                                            <Chip
                                                                icon={<AdminIcon sx={{ fontSize: 12 }} />}
                                                                label="Admin"
                                                                size="small"
                                                                sx={{ ml: 1, height: 18, fontSize: '0.65rem', bgcolor: '#EF4444', color: '#fff' }}
                                                            />
                                                        )}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                                                        @{user.username}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontSize="0.8rem">{user.email}</Typography>
                                        </TableCell>
                                        {/* ✅ YENİ: Abonelik durumu */}
                                        <TableCell>
                                            {renderSubscriptionChip(user)}
                                        </TableCell>
                                        {/* ✅ YENİ: Abonelik türü */}
                                        <TableCell>
                                            {user.subscription?.type ? (
                                                <Chip
                                                    size="small"
                                                    label={subscriptionTypes[user.subscription.type]?.label || user.subscription.type}
                                                    sx={{
                                                        bgcolor: `${subscriptionTypes[user.subscription.type]?.color || '#9CA3AF'}20`,
                                                        color: subscriptionTypes[user.subscription.type]?.color || '#9CA3AF',
                                                        fontSize: '0.7rem',
                                                        fontWeight: 'bold'
                                                    }}
                                                />
                                            ) : (
                                                <Typography variant="caption" color="text.secondary">-</Typography>
                                            )}
                                        </TableCell>
                                        {/* ✅ YENİ: Bitiş tarihi */}
                                        <TableCell>
                                            <Typography variant="caption" color="text.secondary">
                                                {user.subscription?.type === 'trial'
                                                    ? formatDate(user.subscription?.trialEndDate)
                                                    : formatDate(user.subscription?.endDate)
                                                }
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {renderBadgeChip(user.badge)}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Stack direction="row" spacing={0.5} justifyContent="flex-end" flexWrap="wrap">
                                                {/* ✅ YENİ: Abonelik işlemleri */}
                                                <Tooltip title="Abonelik Ver">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleOpenSubscriptionDialog(user, 'grant')}
                                                        sx={{ color: '#10B981' }}
                                                    >
                                                        <GiftIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>

                                                {canExtend(user) && (
                                                    <Tooltip title="Süre Uzat">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleOpenSubscriptionDialog(user, 'extend')}
                                                            sx={{ color: '#3B82F6' }}
                                                        >
                                                            <ExtendIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}

                                                {canStartTrial(user) && (
                                                    <Tooltip title="Trial Başlat">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleOpenSubscriptionDialog(user, 'trial')}
                                                            sx={{ color: '#F59E0B' }}
                                                        >
                                                            <StartIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}

                                                {canResetTrial(user) && (
                                                    <Tooltip title="Trial Sıfırla">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleOpenSubscriptionDialog(user, 'reset')}
                                                            sx={{ color: '#8B5CF6' }}
                                                        >
                                                            <ResetIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}

                                                {canRevoke(user) && (
                                                    <Tooltip title="Abonelik İptal">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleOpenSubscriptionDialog(user, 'revoke')}
                                                            sx={{ color: '#EF4444' }}
                                                        >
                                                            <RevokeIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}

                                                <Tooltip title="Abonelik Geçmişi">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleShowSubscriptionHistory(user)}
                                                        sx={{ color: '#6B7280' }}
                                                    >
                                                        <HistoryIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>

                                                <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

                                                <Tooltip title="Şifre Sıfırla">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleOpenPasswordDialog(user, 'reset')}
                                                        sx={{ color: '#F59E0B' }}
                                                    >
                                                        <LockResetIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Düzenle">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleOpenEditDialog(user)}
                                                        sx={{ color: '#7C3AED' }}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Sil">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleOpenDeleteDialog(user)}
                                                        sx={{ color: '#EF4444' }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    component="div"
                    count={totalUsers}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    labelRowsPerPage="Sayfa başına:"
                />
            </Paper>

            {/* ========== ✅ YENİ: ABONELİK İŞLEMLERİ DİALOG ========== */}
            <Dialog
                open={subscriptionDialog.open}
                onClose={handleCloseSubscriptionDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{
                    bgcolor: subscriptionDialog.action === 'grant' ? '#10B981' :
                        subscriptionDialog.action === 'extend' ? '#3B82F6' :
                            subscriptionDialog.action === 'trial' ? '#F59E0B' :
                                subscriptionDialog.action === 'revoke' ? '#EF4444' :
                                    subscriptionDialog.action === 'reset' ? '#8B5CF6' : '#7C3AED',
                    color: '#fff'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {subscriptionDialog.action === 'grant' && <><GiftIcon /> Abonelik Ver</>}
                        {subscriptionDialog.action === 'extend' && <><ExtendIcon /> Süre Uzat</>}
                        {subscriptionDialog.action === 'trial' && <><StartIcon /> Trial Başlat</>}
                        {subscriptionDialog.action === 'revoke' && <><RevokeIcon /> Abonelik İptal</>}
                        {subscriptionDialog.action === 'reset' && <><ResetIcon /> Trial Sıfırla</>}
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    {subscriptionDialog.user && (
                        <Box>
                            {/* Kullanıcı bilgisi */}
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                mb: 3,
                                p: 2,
                                bgcolor: '#f5f5f5',
                                borderRadius: 1
                            }}>
                                <Avatar
                                    src={subscriptionDialog.user.profileImage}
                                    sx={{ width: 48, height: 48, bgcolor: '#7C3AED' }}
                                >
                                    {subscriptionDialog.user.firstName?.charAt(0)}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                    <Typography fontWeight="bold">
                                        {subscriptionDialog.user.firstName} {subscriptionDialog.user.lastName}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        @{subscriptionDialog.user.username} • {subscriptionDialog.user.email}
                                    </Typography>
                                </Box>
                                {renderSubscriptionChip(subscriptionDialog.user)}
                            </Box>

                            {/* Grant Form */}
                            {subscriptionDialog.action === 'grant' && (
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Alert severity="info" sx={{ mb: 2 }}>
                                            Bu kullanıcıya premium abonelik vereceksiniz.
                                        </Alert>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Abonelik Türü</InputLabel>
                                            <Select
                                                value={subscriptionFormData.type}
                                                label="Abonelik Türü"
                                                onChange={(e) => setSubscriptionFormData(prev => ({ ...prev, type: e.target.value }))}
                                            >
                                                <MenuItem value="admin_granted">Admin Verdi</MenuItem>
                                                <MenuItem value="monthly">Aylık</MenuItem>
                                                <MenuItem value="yearly">Yıllık</MenuItem>
                                                <MenuItem value="lifetime">Ömür Boyu</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Süre (gün)"
                                            type="number"
                                            value={subscriptionFormData.duration}
                                            onChange={(e) => setSubscriptionFormData(prev => ({
                                                ...prev,
                                                duration: parseInt(e.target.value) || 30
                                            }))}
                                            disabled={subscriptionFormData.type === 'lifetime'}
                                            InputProps={{ inputProps: { min: 1, max: 365 } }}
                                            helperText={subscriptionFormData.type === 'lifetime' ? 'Ömür boyu için süre gerekmiyor' : ''}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                                            {[7, 30, 90, 180, 365].map(d => (
                                                <Chip
                                                    key={d}
                                                    label={d === 365 ? '1 Yıl' : `${d} gün`}
                                                    onClick={() => setSubscriptionFormData(prev => ({ ...prev, duration: d }))}
                                                    variant={subscriptionFormData.duration === d ? 'filled' : 'outlined'}
                                                    color={subscriptionFormData.duration === d ? 'primary' : 'default'}
                                                    sx={{ cursor: 'pointer' }}
                                                    disabled={subscriptionFormData.type === 'lifetime'}
                                                />
                                            ))}
                                        </Stack>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Açıklama (opsiyonel)"
                                            value={subscriptionFormData.reason}
                                            onChange={(e) => setSubscriptionFormData(prev => ({ ...prev, reason: e.target.value }))}
                                            placeholder="Örn: VIP kullanıcı, promosyon, destek talebi..."
                                            multiline
                                            rows={2}
                                        />
                                    </Grid>
                                </Grid>
                            )}

                            {/* Extend Form */}
                            {subscriptionDialog.action === 'extend' && (
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Alert severity="info" sx={{ mb: 2 }}>
                                            Mevcut bitiş tarihi: <strong>
                                            {subscriptionDialog.user.subscription?.type === 'trial'
                                                ? formatDate(subscriptionDialog.user.subscription?.trialEndDate)
                                                : formatDate(subscriptionDialog.user.subscription?.endDate)
                                            }
                                        </strong>
                                        </Alert>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Uzatılacak Gün Sayısı"
                                            type="number"
                                            value={subscriptionFormData.days}
                                            onChange={(e) => setSubscriptionFormData(prev => ({
                                                ...prev,
                                                days: parseInt(e.target.value) || 7
                                            }))}
                                            InputProps={{ inputProps: { min: 1, max: 365 } }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                            {[3, 7, 15, 30, 60, 90].map(d => (
                                                <Chip
                                                    key={d}
                                                    label={`+${d} gün`}
                                                    onClick={() => setSubscriptionFormData(prev => ({ ...prev, days: d }))}
                                                    variant={subscriptionFormData.days === d ? 'filled' : 'outlined'}
                                                    color={subscriptionFormData.days === d ? 'primary' : 'default'}
                                                    sx={{ cursor: 'pointer' }}
                                                />
                                            ))}
                                        </Stack>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Açıklama (opsiyonel)"
                                            value={subscriptionFormData.reason}
                                            onChange={(e) => setSubscriptionFormData(prev => ({ ...prev, reason: e.target.value }))}
                                            placeholder="Örn: Destek talebi, telafi, promosyon..."
                                        />
                                    </Grid>
                                </Grid>
                            )}

                            {/* Trial Form */}
                            {subscriptionDialog.action === 'trial' && (
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Alert severity="warning" sx={{ mb: 2 }}>
                                            Bu kullanıcı için <strong>{subscriptionFormData.days}</strong> günlük deneme süresi başlatılacak.
                                            <br />
                                            <small>Trial başladıktan sonra tekrar trial başlatılamaz (sıfırlama hariç).</small>
                                        </Alert>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Trial Süresi (gün)"
                                            type="number"
                                            value={subscriptionFormData.days}
                                            onChange={(e) => setSubscriptionFormData(prev => ({
                                                ...prev,
                                                days: parseInt(e.target.value) || 7
                                            }))}
                                            InputProps={{ inputProps: { min: 1, max: 30 } }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Stack direction="row" spacing={1}>
                                            {[3, 7, 14, 30].map(d => (
                                                <Chip
                                                    key={d}
                                                    label={`${d} gün`}
                                                    onClick={() => setSubscriptionFormData(prev => ({ ...prev, days: d }))}
                                                    variant={subscriptionFormData.days === d ? 'filled' : 'outlined'}
                                                    color={subscriptionFormData.days === d ? 'warning' : 'default'}
                                                    sx={{ cursor: 'pointer' }}
                                                />
                                            ))}
                                        </Stack>
                                    </Grid>
                                </Grid>
                            )}

                            {/* Revoke Form */}
                            {subscriptionDialog.action === 'revoke' && (
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Alert severity="error" sx={{ mb: 2 }}>
                                            <strong>⚠️ DİKKAT:</strong> Bu kullanıcının aboneliği <strong>hemen</strong> iptal edilecek!
                                            <br />
                                            Kullanıcı premium özelliklerine erişimini kaybedecek.
                                        </Alert>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="İptal Sebebi"
                                            value={subscriptionFormData.reason}
                                            onChange={(e) => setSubscriptionFormData(prev => ({ ...prev, reason: e.target.value }))}
                                            placeholder="Örn: Kural ihlali, kullanıcı talebi, iade..."
                                            required
                                            multiline
                                            rows={2}
                                        />
                                    </Grid>
                                </Grid>
                            )}

                            {/* Reset Trial Form */}
                            {subscriptionDialog.action === 'reset' && (
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Alert severity="info" sx={{ mb: 2 }}>
                                            Kullanıcının trial hakkı sıfırlanacak.
                                            <br />
                                            Sıfırlamadan sonra kullanıcı tekrar trial başlatabilecek.
                                        </Alert>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Açıklama (opsiyonel)"
                                            value={subscriptionFormData.reason}
                                            onChange={(e) => setSubscriptionFormData(prev => ({ ...prev, reason: e.target.value }))}
                                            placeholder="Örn: Teknik sorun, müşteri memnuniyeti..."
                                        />
                                    </Grid>
                                </Grid>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleCloseSubscriptionDialog} color="inherit">
                        İptal
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            if (subscriptionDialog.action === 'grant') handleGrantSubscription();
                            else if (subscriptionDialog.action === 'extend') handleExtendSubscription();
                            else if (subscriptionDialog.action === 'trial') handleStartTrial();
                            else if (subscriptionDialog.action === 'revoke') handleRevokeSubscription();
                            else if (subscriptionDialog.action === 'reset') handleResetTrial();
                        }}
                        disabled={subscriptionLoading || (subscriptionDialog.action === 'revoke' && !subscriptionFormData.reason)}
                        sx={{
                            bgcolor: subscriptionDialog.action === 'grant' ? '#10B981' :
                                subscriptionDialog.action === 'extend' ? '#3B82F6' :
                                    subscriptionDialog.action === 'trial' ? '#F59E0B' :
                                        subscriptionDialog.action === 'revoke' ? '#EF4444' : '#8B5CF6',
                            '&:hover': {
                                bgcolor: subscriptionDialog.action === 'grant' ? '#059669' :
                                    subscriptionDialog.action === 'extend' ? '#2563EB' :
                                        subscriptionDialog.action === 'trial' ? '#D97706' :
                                            subscriptionDialog.action === 'revoke' ? '#DC2626' : '#7C3AED'
                            }
                        }}
                    >
                        {subscriptionLoading ? (
                            <CircularProgress size={20} color="inherit" />
                        ) : (
                            subscriptionDialog.action === 'grant' ? 'Abonelik Ver' :
                                subscriptionDialog.action === 'extend' ? 'Süreyi Uzat' :
                                    subscriptionDialog.action === 'trial' ? 'Trial Başlat' :
                                        subscriptionDialog.action === 'revoke' ? 'Aboneliği İptal Et' :
                                            'Trial Sıfırla'
                        )}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ========== ✅ YENİ: ABONELİK GEÇMİŞİ DİALOG ========== */}
            <Dialog
                open={subscriptionHistoryDialog.open}
                onClose={() => setSubscriptionHistoryDialog({ open: false, user: null, history: [] })}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ bgcolor: '#6B7280', color: '#fff' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <HistoryIcon />
                        Abonelik Geçmişi
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    {subscriptionHistoryDialog.user && (
                        <Box>
                            {/* Kullanıcı bilgisi */}
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                mb: 3,
                                p: 2,
                                bgcolor: '#f5f5f5',
                                borderRadius: 1
                            }}>
                                <Avatar
                                    src={subscriptionHistoryDialog.user.profileImage}
                                    sx={{ width: 48, height: 48, bgcolor: '#7C3AED' }}
                                >
                                    {subscriptionHistoryDialog.user.firstName?.charAt(0)}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                    <Typography fontWeight="bold">
                                        {subscriptionHistoryDialog.user.firstName} {subscriptionHistoryDialog.user.lastName}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        @{subscriptionHistoryDialog.user.username}
                                    </Typography>
                                </Box>
                                {renderSubscriptionChip(subscriptionHistoryDialog.user)}
                            </Box>

                            {/* Mevcut durum özeti */}
                            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <SubscriptionIcon fontSize="small" />
                                    Mevcut Abonelik Durumu
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={6} sm={3}>
                                        <Typography variant="caption" color="text.secondary">Tür</Typography>
                                        <Typography variant="body2" fontWeight="bold">
                                            {subscriptionTypes[subscriptionHistoryDialog.user.subscription?.type]?.label || 'Yok'}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6} sm={3}>
                                        <Typography variant="caption" color="text.secondary">Durum</Typography>
                                        <Typography variant="body2" fontWeight="bold">
                                            {subscriptionHistoryDialog.user.subscription?.isActive ? 'Aktif' : 'Pasif'}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6} sm={3}>
                                        <Typography variant="caption" color="text.secondary">Bitiş Tarihi</Typography>
                                        <Typography variant="body2" fontWeight="bold">
                                            {subscriptionHistoryDialog.user.subscription?.type === 'trial'
                                                ? formatDate(subscriptionHistoryDialog.user.subscription?.trialEndDate)
                                                : formatDate(subscriptionHistoryDialog.user.subscription?.endDate)
                                            }
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6} sm={3}>
                                        <Typography variant="caption" color="text.secondary">Trial Kullanıldı</Typography>
                                        <Typography variant="body2" fontWeight="bold">
                                            {subscriptionHistoryDialog.user.subscription?.trialUsed ? 'Evet' : 'Hayır'}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Paper>

                            {/* Geçmiş tablosu */}
                            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <HistoryIcon fontSize="small" />
                                İşlem Geçmişi
                            </Typography>

                            {subscriptionHistoryDialog.history.length > 0 ? (
                                <TableContainer component={Paper} variant="outlined">
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Tarih</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>İşlem</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Tür</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Başlangıç</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Bitiş</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Açıklama</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {subscriptionHistoryDialog.history.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>
                                                        <Typography variant="caption">
                                                            {formatDateTime(item.date)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            size="small"
                                                            label={
                                                                item.action === 'started' ? 'Başlatıldı' :
                                                                    item.action === 'activated' ? 'Aktifleşti' :
                                                                        item.action === 'extended' ? 'Uzatıldı' :
                                                                            item.action === 'cancelled' ? 'İptal' :
                                                                                item.action === 'expired' ? 'Süresi Doldu' :
                                                                                    item.action === 'admin_granted' ? 'Admin Verdi' :
                                                                                        item.action === 'revoked' ? 'İptal Edildi' :
                                                                                            item.action === 'trial_started' ? 'Trial Başladı' :
                                                                                                item.action === 'trial_reset' ? 'Trial Sıfırlandı' :
                                                                                                    item.action
                                                            }
                                                            sx={{
                                                                bgcolor:
                                                                    item.action.includes('grant') || item.action.includes('start') || item.action.includes('activ') ? '#D1FAE5' :
                                                                        item.action.includes('trial') ? '#DBEAFE' :
                                                                            item.action.includes('extend') ? '#E0E7FF' :
                                                                                item.action.includes('cancel') || item.action.includes('revoke') ? '#FEE2E2' :
                                                                                    item.action.includes('expire') ? '#FEF3C7' : '#F3F4F6',
                                                                color:
                                                                    item.action.includes('grant') || item.action.includes('start') || item.action.includes('activ') ? '#10B981' :
                                                                        item.action.includes('trial') ? '#3B82F6' :
                                                                            item.action.includes('extend') ? '#6366F1' :
                                                                                item.action.includes('cancel') || item.action.includes('revoke') ? '#EF4444' :
                                                                                    item.action.includes('expire') ? '#F59E0B' : '#6B7280',
                                                                fontSize: '0.65rem',
                                                                fontWeight: 'bold'
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="caption">
                                                            {subscriptionTypes[item.type]?.label || item.type || '-'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="caption">
                                                            {formatDate(item.startDate)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="caption">
                                                            {formatDate(item.endDate)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 150, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {item.reason || '-'}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Alert severity="info" icon={<HistoryIcon />}>
                                    Henüz abonelik geçmişi bulunmuyor.
                                </Alert>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setSubscriptionHistoryDialog({ open: false, user: null, history: [] })}
                        variant="contained"
                        sx={{ bgcolor: '#6B7280', '&:hover': { bgcolor: '#4B5563' } }}
                    >
                        Kapat
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ========== ŞİFRE YÖNETİMİ DİALOG ========== */}
            <Dialog open={passwordDialog.open} onClose={handleClosePasswordDialog} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ bgcolor: passwordDialog.mode === 'reset' ? '#F59E0B' : '#10B981', color: '#fff' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {passwordDialog.mode === 'reset' ? <LockResetIcon /> : <KeyIcon />}
                        {passwordDialog.mode === 'reset' ? 'Şifre Sıfırla' : 'Yeni Şifre Belirle'}
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    {passwordDialog.user && (
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                                <Avatar src={passwordDialog.user.profileImage} sx={{ width: 48, height: 48, bgcolor: '#7C3AED' }}>
                                    {passwordDialog.user.firstName?.charAt(0)}
                                </Avatar>
                                <Box>
                                    <Typography fontWeight="bold">
                                        {passwordDialog.user.firstName} {passwordDialog.user.lastName}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        @{passwordDialog.user.username} • {passwordDialog.user.email}
                                    </Typography>
                                </Box>
                            </Box>

                            {passwordDialog.mode === 'reset' ? (
                                <Alert severity="warning" sx={{ mb: 2 }}>
                                    <Typography variant="body2">
                                        Kullanıcının şifresi <strong>Trackbang2025!</strong> olarak sıfırlanacak.
                                        <br />
                                        <small>Kullanıcıya bu şifreyi iletin ve ilk girişte değiştirmesini söyleyin.</small>
                                    </Typography>
                                </Alert>
                            ) : (
                                <Box>
                                    <TextField
                                        fullWidth
                                        label="Yeni Şifre"
                                        type={showPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="En az 6 karakter"
                                        sx={{ mb: 2 }}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><LockIcon /></InputAdornment>,
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                    <Button variant="outlined" size="small" onClick={generateRandomPassword} sx={{ mb: 2, borderColor: '#7C3AED', color: '#7C3AED' }}>
                                        🎲 Rastgele Şifre Oluştur
                                    </Button>

                                    {newPassword && (
                                        <Alert severity="info" sx={{ mb: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <span>Yeni şifre: <strong>{newPassword}</strong></span>
                                                <IconButton size="small" onClick={() => copyToClipboard(newPassword)}>
                                                    <CopyIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        </Alert>
                                    )}
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleClosePasswordDialog} color="inherit">İptal</Button>
                    <Button
                        variant="contained"
                        onClick={passwordDialog.mode === 'reset' ? handleResetPassword : handleUpdatePassword}
                        disabled={passwordLoading || (passwordDialog.mode === 'update' && newPassword.length < 6)}
                        sx={{
                            bgcolor: passwordDialog.mode === 'reset' ? '#F59E0B' : '#10B981',
                            '&:hover': { bgcolor: passwordDialog.mode === 'reset' ? '#D97706' : '#059669' }
                        }}
                    >
                        {passwordLoading ? <CircularProgress size={20} color="inherit" /> : (passwordDialog.mode === 'reset' ? 'Şifreyi Sıfırla' : 'Şifreyi Güncelle')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ========== ŞİFRE SONUÇ DİALOG ========== */}
            <Dialog open={passwordResultDialog.open} onClose={() => setPasswordResultDialog({ open: false, data: null })} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ bgcolor: '#10B981', color: '#fff' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon />
                        Şifre Başarıyla Güncellendi
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    {passwordResultDialog.data && (
                        <Box>
                            <Alert severity="success" sx={{ mb: 3 }}>
                                <strong>{passwordResultDialog.data.username}</strong> kullanıcısının şifresi güncellendi!
                            </Alert>

                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Yeni Giriş Bilgileri</Typography>
                            <Divider sx={{ mb: 2 }} />

                            <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, mb: 2 }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">Kullanıcı Adı</Typography>
                                                <Typography variant="body1" fontWeight="bold" fontFamily="monospace">{passwordResultDialog.data.username}</Typography>
                                            </Box>
                                            <IconButton size="small" onClick={() => copyToClipboard(passwordResultDialog.data.username)}>
                                                <CopyIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </Grid>
                                    {passwordResultDialog.data.email && (
                                        <Grid item xs={12}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">Email</Typography>
                                                    <Typography variant="body1" fontWeight="bold" fontFamily="monospace">{passwordResultDialog.data.email}</Typography>
                                                </Box>
                                                <IconButton size="small" onClick={() => copyToClipboard(passwordResultDialog.data.email)}>
                                                    <CopyIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        </Grid>
                                    )}
                                    <Grid item xs={12}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">Yeni Şifre</Typography>
                                                <Typography variant="body1" fontWeight="bold" fontFamily="monospace" color="error">{passwordResultDialog.data.newPassword}</Typography>
                                            </Box>
                                            <IconButton size="small" onClick={() => copyToClipboard(passwordResultDialog.data.newPassword)}>
                                                <CopyIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>

                            <Alert severity="warning">
                                Bu bilgileri güvenli bir şekilde kullanıcıya iletin! Şifre sadece bir kez gösterilecektir.
                            </Alert>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={() => setPasswordResultDialog({ open: false, data: null })} sx={{ bgcolor: '#7C3AED', '&:hover': { bgcolor: '#6D28D9' } }}>
                        Tamam
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ========== DÜZENLEME DİALOG ========== */}
            <Dialog open={editDialog.open} onClose={handleCloseEditDialog} maxWidth="md" fullWidth>
                <DialogTitle sx={{ bgcolor: '#7C3AED', color: '#fff' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EditIcon />
                        Kullanıcı Düzenle
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Ad"
                                value={editFormData.firstName}
                                onChange={(e) => handleEditFormChange('firstName', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Soyad"
                                value={editFormData.lastName}
                                onChange={(e) => handleEditFormChange('lastName', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Kullanıcı Adı"
                                value={editFormData.username}
                                onChange={(e) => handleEditFormChange('username', e.target.value)}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">@</InputAdornment>
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Email"
                                value={editFormData.email}
                                onChange={(e) => handleEditFormChange('email', e.target.value)}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><EmailIcon /></InputAdornment>
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Telefon"
                                value={editFormData.phone}
                                onChange={(e) => handleEditFormChange('phone', e.target.value)}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><PhoneIcon /></InputAdornment>
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Rozet</InputLabel>
                                <Select
                                    value={editFormData.badge}
                                    label="Rozet"
                                    onChange={(e) => handleEditFormChange('badge', e.target.value)}
                                >
                                    <MenuItem value="none">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <BadgeIcon sx={{ color: '#9e9e9e' }} />
                                            <Typography>Rozet Yok</Typography>
                                        </Box>
                                    </MenuItem>
                                    <MenuItem value="standard">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Verified sx={{ color: '#2196f3' }} />
                                            <Typography>Standart</Typography>
                                        </Box>
                                    </MenuItem>
                                    <MenuItem value="premium">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <WorkspacePremium sx={{ color: '#ffc107' }} />
                                            <Typography>Premium</Typography>
                                        </Box>
                                    </MenuItem>
                                    <MenuItem value="trackbang">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Verified sx={{ color: '#9C27B0' }} />
                                            <Typography>Trackbang Artist</Typography>
                                        </Box>
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Bio"
                                value={editFormData.bio}
                                onChange={(e) => handleEditFormChange('bio', e.target.value)}
                                multiline
                                rows={2}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Divider sx={{ my: 1 }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={editFormData.isAdmin}
                                        onChange={(e) => handleEditFormChange('isAdmin', e.target.checked)}
                                        color="error"
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold">Admin Yetkisi</Typography>
                                        <Typography variant="caption" color="text.secondary">Admin paneline erişim izni</Typography>
                                    </Box>
                                }
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={editFormData.isActive}
                                        onChange={(e) => handleEditFormChange('isActive', e.target.checked)}
                                        color="success"
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold">Aktif Hesap</Typography>
                                        <Typography variant="caption" color="text.secondary">Hesap giriş yapabilir</Typography>
                                    </Box>
                                }
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                    <Button onClick={handleCloseEditDialog} color="inherit">İptal</Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveUser}
                        sx={{ bgcolor: '#7C3AED', '&:hover': { bgcolor: '#6D28D9' } }}
                    >
                        Kaydet
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ========== SİLME ONAY DİALOG ========== */}
            <Dialog open={deleteDialog.open} onClose={handleCloseDeleteDialog}>
                <DialogTitle sx={{ color: '#EF4444' }}>⚠️ Kullanıcı Sil</DialogTitle>
                <DialogContent>
                    <Alert severity="warning" sx={{ mb: 2 }}>Bu işlem geri alınamaz!</Alert>
                    <Typography>
                        <strong>{deleteDialog.user?.firstName} {deleteDialog.user?.lastName}</strong><br />
                        <small>(@{deleteDialog.user?.username})</small><br /><br />
                        kullanıcısını silmek istediğinize emin misiniz?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog}>İptal</Button>
                    <Button variant="contained" color="error" onClick={handleDeleteUser}>Evet, Sil</Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    severity={snackbar.severity}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    variant="filled"
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* CSS for spin animation */}
            <style>
                {`
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                `}
            </style>
        </Box>
    );
};

export default UserManagement;