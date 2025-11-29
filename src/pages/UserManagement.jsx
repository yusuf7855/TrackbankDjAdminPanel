// src/pages/UserManagement.jsx - KULLANICI YÖNETİMİ (SADECE STANDART KULLANICILAR)
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
    Collapse
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
    Group as GroupIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Badge Tanımları (sadece görüntüleme için - trackbang hariç)
const badges = {
    standard: { label: 'Standart', icon: Verified, color: '#2196f3' },
    premium: { label: 'Premium', icon: WorkspacePremium, color: '#ffc107' },
    none: { label: 'Rozet Yok', icon: null, color: '#9e9e9e' }
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
    const [showFilters, setShowFilters] = useState(false);

    // Dialog states
    const [editDialog, setEditDialog] = useState({ open: false, user: null });
    const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null });
    const [passwordDialog, setPasswordDialog] = useState({ open: false, user: null, mode: 'reset' });
    const [passwordResultDialog, setPasswordResultDialog] = useState({ open: false, data: null });

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
        isActive: true
    });

    // Snackbar state
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // Stats
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        adminUsers: 0
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
                excludeBadge: 'trackbang' // ⭐ Trackbang rozetli kullanıcıları hariç tut
            };

            const response = await axios.get(`${API_BASE_URL}/admin/users`, { params });

            if (response.data.success) {
                // Frontend'de de filtrele (backend desteklemezse)
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
    }, [page, rowsPerPage, searchQuery, roleFilter, statusFilter]);

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

    // ========== HANDLERS ==========
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        showSnackbar('Panoya kopyalandı', 'success');
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
            isActive: user.isActive !== false
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

    const renderBadgeChip = (badge) => {
        // Trackbang rozetli kullanıcılar bu sayfada görünmemeli
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
                    Normal kullanıcı hesaplarını görüntüleyin ve yönetin (Artistler hariç)
                </Typography>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={4}>
                    <Card sx={{ bgcolor: '#fff', border: '1px solid #e0e0e0' }}>
                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                            <Typography variant="h4" fontWeight="bold" color="#7C3AED">{stats.totalUsers || 0}</Typography>
                            <Typography variant="caption" color="text.secondary">Toplam Kullanıcı</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={6} sm={4}>
                    <Card sx={{ bgcolor: '#fff', border: '1px solid #e0e0e0' }}>
                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                            <Typography variant="h4" fontWeight="bold" color="#10B981">{stats.activeUsers || 0}</Typography>
                            <Typography variant="caption" color="text.secondary">Aktif Kullanıcı</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={6} sm={4}>
                    <Card sx={{ bgcolor: '#fff', border: '1px solid #e0e0e0' }}>
                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                            <Typography variant="h4" fontWeight="bold" color="#F59E0B">{stats.adminUsers || 0}</Typography>
                            <Typography variant="caption" color="text.secondary">Admin</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Info Alert */}
            <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                    <strong>💎 Trackbang rozetli artistler</strong> bu listede görünmez. Onları yönetmek için <strong>Artist Yönetimi</strong> sayfasını kullanın.
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
                            Filtreler
                        </Button>
                        <IconButton onClick={() => { loadUsers(); loadStats(); }} disabled={loading}>
                            <RefreshIcon sx={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                        </IconButton>
                    </Stack>

                    <Collapse in={showFilters}>
                        <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Rol</InputLabel>
                                        <Select value={roleFilter} label="Rol" onChange={(e) => setRoleFilter(e.target.value)}>
                                            <MenuItem value="">Tümü</MenuItem>
                                            <MenuItem value="admin">Admin</MenuItem>
                                            <MenuItem value="user">Normal Kullanıcı</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Durum</InputLabel>
                                        <Select value={statusFilter} label="Durum" onChange={(e) => setStatusFilter(e.target.value)}>
                                            <MenuItem value="">Tümü</MenuItem>
                                            <MenuItem value="active">Aktif</MenuItem>
                                            <MenuItem value="inactive">Pasif</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Button variant="outlined" fullWidth onClick={() => { setRoleFilter(''); setStatusFilter(''); setSearchQuery(''); }}>
                                        Filtreleri Temizle
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
                                <TableCell sx={{ fontWeight: 'bold' }}>Telefon</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Rozet</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Rol</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Durum</TableCell>
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
                                                <Avatar src={user.profileImage} sx={{ width: 48, height: 48, bgcolor: '#7C3AED' }}>
                                                    {user.firstName?.charAt(0) || user.username?.charAt(0)}
                                                </Avatar>
                                                <Box>
                                                    <Typography fontWeight="bold">
                                                        {user.firstName} {user.lastName}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                                                        @{user.username}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{user.email}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{user.phone || '-'}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            {renderBadgeChip(user.badge)}
                                        </TableCell>
                                        <TableCell>
                                            {user.isAdmin ? (
                                                <Chip icon={<AdminIcon />} label="Admin" size="small" color="error" />
                                            ) : (
                                                <Chip icon={<PersonIcon />} label="Kullanıcı" size="small" variant="outlined" />
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {user.isActive !== false ? (
                                                <Chip label="Aktif" size="small" sx={{ bgcolor: '#10B981', color: '#fff' }} />
                                            ) : (
                                                <Chip label="Pasif" size="small" sx={{ bgcolor: '#EF4444', color: '#fff' }} />
                                            )}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                <Tooltip title="Şifre Sıfırla (Trackbang2025!)">
                                                    <IconButton size="small" onClick={() => handleOpenPasswordDialog(user, 'reset')} sx={{ color: '#F59E0B' }}>
                                                        <LockResetIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Yeni Şifre Belirle">
                                                    <IconButton size="small" onClick={() => handleOpenPasswordDialog(user, 'update')} sx={{ color: '#10B981' }}>
                                                        <KeyIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Düzenle">
                                                    <IconButton size="small" onClick={() => handleOpenEditDialog(user)} sx={{ color: '#7C3AED' }}>
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Sil">
                                                    <IconButton size="small" onClick={() => handleOpenDeleteDialog(user)} sx={{ color: '#EF4444' }}>
                                                        <DeleteIcon />
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
                            <TextField fullWidth label="Ad" value={editFormData.firstName} onChange={(e) => handleEditFormChange('firstName', e.target.value)} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Soyad" value={editFormData.lastName} onChange={(e) => handleEditFormChange('lastName', e.target.value)} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Kullanıcı Adı" value={editFormData.username} onChange={(e) => handleEditFormChange('username', e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start">@</InputAdornment> }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Email" value={editFormData.email} onChange={(e) => handleEditFormChange('email', e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon /></InputAdornment> }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Telefon" value={editFormData.phone} onChange={(e) => handleEditFormChange('phone', e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon /></InputAdornment> }} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Bio" value={editFormData.bio} onChange={(e) => handleEditFormChange('bio', e.target.value)} multiline rows={2} />
                        </Grid>
                        <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                control={<Switch checked={editFormData.isAdmin} onChange={(e) => handleEditFormChange('isAdmin', e.target.checked)} color="error" />}
                                label={<Box><Typography variant="body2" fontWeight="bold">Admin Yetkisi</Typography><Typography variant="caption" color="text.secondary">Admin paneline erişim izni</Typography></Box>}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                control={<Switch checked={editFormData.isActive} onChange={(e) => handleEditFormChange('isActive', e.target.checked)} color="success" />}
                                label={<Box><Typography variant="body2" fontWeight="bold">Aktif Hesap</Typography><Typography variant="caption" color="text.secondary">Hesap giriş yapabilir</Typography></Box>}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                    <Button onClick={handleCloseEditDialog} color="inherit">İptal</Button>
                    <Button variant="contained" onClick={handleSaveUser} sx={{ bgcolor: '#7C3AED', '&:hover': { bgcolor: '#6D28D9' } }}>Kaydet</Button>
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
            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} variant="filled">{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default UserManagement;