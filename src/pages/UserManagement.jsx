// src/components/Admin/UserManagement.jsx - SİLME ÖZELLİĞİ EKLENMİŞ

import React, { useState, useEffect } from 'react';
import {
    Box, Grid, Card, CardContent, Typography, Avatar, Paper,
    Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, TablePagination, TextField, InputAdornment,
    IconButton, Chip, Button, Menu, MenuItem, Dialog,
    DialogTitle, DialogContent, DialogActions, FormControl,
    InputLabel, Select, Alert, CircularProgress, Tooltip,
    Divider
} from '@mui/material';
import {
    Search, MoreVert, Delete, PersonOff, Person,
    Verified, WorkspacePremium, MusicNote, Album,
    LibraryMusic, Share, Badge as BadgeIcon,
    LocalOffer, LockReset, Groups, CheckCircle,
    AdminPanelSettings, Refresh, Warning
} from '@mui/icons-material';
import axiosInstance from '../../utils/axiosInstance';

const UserManagement = () => {
    // State Management
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalUsers, setTotalUsers] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTag, setFilterTag] = useState('all');
    const [filterBadge, setFilterBadge] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState('');
    const [stats, setStats] = useState(null);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertSeverity, setAlertSeverity] = useState('success');

    // Form States
    const [selectedTag, setSelectedTag] = useState('');
    const [selectedBadge, setSelectedBadge] = useState('');
    const [badgeReason, setBadgeReason] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    // Tag ve Badge Tanımları
    const tags = {
        producer: { label: 'Prodüktör', icon: MusicNote, color: '#9c27b0' },
        dj: { label: 'DJ', icon: Album, color: '#2196f3' },
        'dj-producer': { label: 'DJ & Prodüktör', icon: LibraryMusic, color: '#4caf50' },
        distributor: { label: 'Distribütör', icon: Share, color: '#ff9800' },
        none: { label: 'Yok', icon: null, color: '#757575' }
    };

    const badges = {
        standard: { label: 'Standart', icon: Verified, color: '#2196f3' },
        premium: { label: 'Premium', icon: WorkspacePremium, color: '#ffc107' },
        none: { label: 'Yok', icon: null, color: '#bdbdbd' }
    };

    // API Functions
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page + 1,
                limit: rowsPerPage,
                search: searchTerm,
                status: filterStatus !== 'all' ? filterStatus : '',
                tag: filterTag !== 'all' ? filterTag : '',
                badge: filterBadge !== 'all' ? filterBadge : '',
                sortBy: 'createdAt',
                sortOrder: 'desc'
            });

            const response = await axiosInstance.get(`/admin/users?${params}`);

            if (response.data.success) {
                setUsers(response.data.users || []);
                setTotalUsers(response.data.total || response.data.users?.length || 0);

                if (response.data.stats) {
                    setStats(response.data.stats);
                }
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            showAlert(error.response?.data?.message || 'Kullanıcılar yüklenirken hata oluştu', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await axiosInstance.get('/admin/stats');
            if (response.data.success) {
                setStats(response.data.stats);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    // Kullanıcı Silme - YENİ
    const deleteUser = async (userId) => {
        try {
            const response = await axiosInstance.delete(`/admin/users/${userId}`);

            if (response.data.success) {
                showAlert('Kullanıcı kalıcı olarak silindi', 'success');
                fetchUsers();
                fetchStats();
                closeDialog();
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            showAlert(error.response?.data?.message || 'Kullanıcı silinirken hata oluştu', 'error');
        }
    };

    // Badge Verme
    const grantBadge = async (userId, badge, reason) => {
        try {
            const response = await axiosInstance.post(
                `/admin/users/${userId}/badge/grant`,
                { badge, reason }
            );

            if (response.data.success) {
                showAlert(`${badges[badge].label} rozet başarıyla verildi`, 'success');
                fetchUsers();
                closeDialog();
            }
        } catch (error) {
            console.error('Error granting badge:', error);
            showAlert(error.response?.data?.message || 'Rozet verilirken hata oluştu', 'error');
        }
    };

    // Badge Kaldırma
    const revokeBadge = async (userId) => {
        try {
            const response = await axiosInstance.post(`/admin/users/${userId}/badge/revoke`);

            if (response.data.success) {
                showAlert('Rozet başarıyla kaldırıldı', 'success');
                fetchUsers();
            }
        } catch (error) {
            console.error('Error revoking badge:', error);
            showAlert(error.response?.data?.message || 'Rozet kaldırılırken hata oluştu', 'error');
        }
    };

    // Tag Atama
    const assignTag = async (userId, tag) => {
        try {
            const response = await axiosInstance.post(
                `/admin/users/${userId}/tag`,
                { tag }
            );

            if (response.data.success) {
                showAlert('Tag başarıyla atandı', 'success');
                fetchUsers();
                closeDialog();
            }
        } catch (error) {
            console.error('Error assigning tag:', error);
            showAlert(error.response?.data?.message || 'Tag atanırken hata oluştu', 'error');
        }
    };

    // Kullanıcı Durumu Değiştirme
    const toggleUserStatus = async (userId) => {
        try {
            const response = await axiosInstance.patch(`/admin/users/${userId}/status`);

            if (response.data.success) {
                showAlert('Kullanıcı durumu güncellendi', 'success');
                fetchUsers();
            }
        } catch (error) {
            console.error('Error toggling user status:', error);
            showAlert(error.response?.data?.message || 'Durum değiştirilirken hata oluştu', 'error');
        }
    };

    // Şifre Sıfırlama
    const resetPassword = async (userId, newPassword) => {
        try {
            const response = await axiosInstance.post(
                `/admin/users/${userId}/reset-password`,
                { newPassword }
            );

            if (response.data.success) {
                showAlert('Şifre başarıyla sıfırlandı', 'success');
                closeDialog();
            }
        } catch (error) {
            console.error('Error resetting password:', error);
            showAlert(error.response?.data?.message || 'Şifre sıfırlanırken hata oluştu', 'error');
        }
    };

    // useEffect Hooks
    useEffect(() => {
        fetchUsers();
        fetchStats();
    }, [page, rowsPerPage, filterStatus, filterTag, filterBadge]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm !== undefined) {
                fetchUsers();
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    // Helper Functions
    const showAlert = (message, severity) => {
        setAlertMessage(message);
        setAlertSeverity(severity);
        setTimeout(() => {
            setAlertMessage('');
        }, 5000);
    };

    const handleMenuClick = (event, user) => {
        setAnchorEl(event.currentTarget);
        setSelectedUser(user);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const openDialog = (type) => {
        setDialogType(type);
        setDialogOpen(true);
        handleMenuClose();

        // Reset form values
        if (type === 'badge') {
            setSelectedBadge(selectedUser?.badge || 'none');
            setBadgeReason('');
        } else if (type === 'tag') {
            setSelectedTag(selectedUser?.userTag || 'none');
        } else if (type === 'password') {
            setNewPassword('');
        } else if (type === 'delete') {
            setDeleteConfirmText('');
        }
    };

    const closeDialog = () => {
        setDialogOpen(false);
        setDialogType('');
        setSelectedTag('');
        setSelectedBadge('');
        setBadgeReason('');
        setNewPassword('');
        setDeleteConfirmText('');
    };

    const handleDialogSubmit = () => {
        if (dialogType === 'tag') {
            assignTag(selectedUser._id, selectedTag);
        } else if (dialogType === 'badge') {
            if (selectedBadge === 'none') {
                revokeBadge(selectedUser._id);
            } else {
                grantBadge(selectedUser._id, selectedBadge, badgeReason);
            }
        } else if (dialogType === 'password') {
            resetPassword(selectedUser._id, newPassword);
        } else if (dialogType === 'delete') {
            if (deleteConfirmText === selectedUser.username) {
                deleteUser(selectedUser._id);
            } else {
                showAlert('Kullanıcı adı eşleşmiyor', 'error');
            }
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Kullanıcı Yönetimi
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    Kullanıcıları yönet, rozet ata, düzenle ve sil
                </Typography>
            </Box>

            {/* Alert */}
            {alertMessage && (
                <Alert
                    severity={alertSeverity}
                    sx={{ mb: 2 }}
                    onClose={() => setAlertMessage('')}
                >
                    {alertMessage}
                </Alert>
            )}

            {/* Stats Cards */}
            {stats && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Box display="flex" alignItems="center" gap={2}>
                                    <Groups sx={{ fontSize: 40, color: '#2196f3' }} />
                                    <Box>
                                        <Typography variant="h4">
                                            {stats.general?.[0]?.totalUsers || 0}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Toplam Kullanıcı
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Box display="flex" alignItems="center" gap={2}>
                                    <CheckCircle sx={{ fontSize: 40, color: '#4caf50' }} />
                                    <Box>
                                        <Typography variant="h4">
                                            {stats.general?.[0]?.activeUsers || 0}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Aktif Kullanıcı
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Box display="flex" alignItems="center" gap={2}>
                                    <WorkspacePremium sx={{ fontSize: 40, color: '#ffc107' }} />
                                    <Box>
                                        <Typography variant="h4">
                                            {stats.general?.[0]?.premiumUsers || 0}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Premium Kullanıcı
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Box display="flex" alignItems="center" gap={2}>
                                    <AdminPanelSettings sx={{ fontSize: 40, color: '#000' }} />
                                    <Box>
                                        <Typography variant="h4">
                                            {stats.general?.[0]?.adminUsers || 0}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Admin Kullanıcı
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Filters */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            placeholder="Kullanıcı ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search />
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={2}>
                        <FormControl fullWidth>
                            <InputLabel>Durum</InputLabel>
                            <Select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                label="Durum"
                            >
                                <MenuItem value="all">Tümü</MenuItem>
                                <MenuItem value="active">Aktif</MenuItem>
                                <MenuItem value="inactive">Pasif</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={2}>
                        <FormControl fullWidth>
                            <InputLabel>Tag</InputLabel>
                            <Select
                                value={filterTag}
                                onChange={(e) => setFilterTag(e.target.value)}
                                label="Tag"
                            >
                                <MenuItem value="all">Tümü</MenuItem>
                                {Object.entries(tags).map(([key, tag]) => (
                                    <MenuItem key={key} value={key}>
                                        {tag.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={2}>
                        <FormControl fullWidth>
                            <InputLabel>Rozet</InputLabel>
                            <Select
                                value={filterBadge}
                                onChange={(e) => setFilterBadge(e.target.value)}
                                label="Rozet"
                            >
                                <MenuItem value="all">Tümü</MenuItem>
                                {Object.entries(badges).map(([key, badge]) => (
                                    <MenuItem key={key} value={key}>
                                        {badge.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <Button
                            fullWidth
                            variant="contained"
                            startIcon={<Refresh />}
                            onClick={fetchUsers}
                            sx={{ bgcolor: '#000', '&:hover': { bgcolor: '#212121' } }}
                        >
                            Yenile
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Users Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Kullanıcı</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Tag</TableCell>
                            <TableCell>Rozet</TableCell>
                            <TableCell>Durum</TableCell>
                            <TableCell>Kayıt Tarihi</TableCell>
                            <TableCell align="center">İşlemler</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    <CircularProgress sx={{ color: '#000' }} />
                                </TableCell>
                            </TableRow>
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    <Typography color="textSecondary">
                                        Kullanıcı bulunamadı
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user._id} hover>
                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <Avatar
                                                src={user.profileImage}
                                                alt={user.username}
                                                sx={{
                                                    width: 40,
                                                    height: 40,
                                                    bgcolor: user.isAdmin ? '#000' : '#757575'
                                                }}
                                            >
                                                {user.username?.[0]?.toUpperCase() || 'U'}
                                            </Avatar>
                                            <Box>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {user.username}
                                                    </Typography>
                                                    {user.isAdmin && (
                                                        <Tooltip title="Admin">
                                                            <AdminPanelSettings sx={{ fontSize: 16, color: '#000' }} />
                                                        </Tooltip>
                                                    )}
                                                </Box>
                                                <Typography variant="caption" color="textSecondary">
                                                    {user.firstName} {user.lastName}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>

                                    <TableCell>
                                        <Typography variant="body2">
                                            {user.email}
                                        </Typography>
                                    </TableCell>

                                    <TableCell>
                                        {user.userTag && tags[user.userTag] ? (
                                            <Chip
                                                label={tags[user.userTag].label}
                                                size="small"
                                                sx={{
                                                    bgcolor: tags[user.userTag].color + '20',
                                                    color: tags[user.userTag].color,
                                                    fontWeight: 600
                                                }}
                                            />
                                        ) : (
                                            <Typography variant="body2" color="textSecondary">
                                                -
                                            </Typography>
                                        )}
                                    </TableCell>

                                    <TableCell>
                                        {user.badge && badges[user.badge] && user.badge !== 'none' ? (
                                            <Chip
                                                icon={React.createElement(badges[user.badge].icon, { sx: { fontSize: 16 } })}
                                                label={badges[user.badge].label}
                                                size="small"
                                                sx={{
                                                    bgcolor: badges[user.badge].color + '20',
                                                    color: badges[user.badge].color,
                                                    fontWeight: 600
                                                }}
                                            />
                                        ) : (
                                            <Typography variant="body2" color="textSecondary">
                                                -
                                            </Typography>
                                        )}
                                    </TableCell>

                                    <TableCell>
                                        <Chip
                                            label={user.isActive ? 'Aktif' : 'Pasif'}
                                            size="small"
                                            color={user.isActive ? 'success' : 'default'}
                                        />
                                    </TableCell>

                                    <TableCell>
                                        <Typography variant="body2">
                                            {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                                        </Typography>
                                    </TableCell>

                                    <TableCell align="center">
                                        <IconButton
                                            onClick={(e) => handleMenuClick(e, user)}
                                            size="small"
                                        >
                                            <MoreVert />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                <TablePagination
                    component="div"
                    count={totalUsers}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    labelRowsPerPage="Sayfa başına:"
                    labelDisplayedRows={({ from, to, count }) =>
                        `${from}-${to} / ${count !== -1 ? count : `${to}+`}`
                    }
                />
            </TableContainer>

            {/* Action Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={() => openDialog('tag')}>
                    <LocalOffer sx={{ mr: 1, fontSize: 20 }} />
                    Tag Ata
                </MenuItem>
                <MenuItem onClick={() => openDialog('badge')}>
                    <BadgeIcon sx={{ mr: 1, fontSize: 20 }} />
                    Rozet Ver/Kaldır
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => toggleUserStatus(selectedUser?._id)}>
                    {selectedUser?.isActive ? (
                        <>
                            <PersonOff sx={{ mr: 1, fontSize: 20 }} />
                            Deaktif Et
                        </>
                    ) : (
                        <>
                            <Person sx={{ mr: 1, fontSize: 20 }} />
                            Aktif Et
                        </>
                    )}
                </MenuItem>
                <MenuItem onClick={() => openDialog('password')}>
                    <LockReset sx={{ mr: 1, fontSize: 20 }} />
                    Şifre Sıfırla
                </MenuItem>
                <Divider />
                <MenuItem
                    onClick={() => openDialog('delete')}
                    disabled={selectedUser?.isAdmin}
                    sx={{ color: 'error.main' }}
                >
                    <Delete sx={{ mr: 1, fontSize: 20 }} />
                    Kullanıcıyı Sil
                </MenuItem>
            </Menu>

            {/* Tag Dialog */}
            <Dialog
                open={dialogOpen && dialogType === 'tag'}
                onClose={closeDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Tag Ata</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                            Kullanıcı: <strong>{selectedUser?.username}</strong>
                        </Typography>
                        <FormControl fullWidth sx={{ mt: 2 }}>
                            <InputLabel>Tag Seç</InputLabel>
                            <Select
                                value={selectedTag}
                                onChange={(e) => setSelectedTag(e.target.value)}
                                label="Tag Seç"
                            >
                                {Object.entries(tags).map(([key, tag]) => (
                                    <MenuItem key={key} value={key}>
                                        {tag.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>İptal</Button>
                    <Button
                        onClick={handleDialogSubmit}
                        variant="contained"
                        sx={{ bgcolor: '#000', '&:hover': { bgcolor: '#212121' } }}
                    >
                        Ata
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Badge Dialog */}
            <Dialog
                open={dialogOpen && dialogType === 'badge'}
                onClose={closeDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Rozet Ver/Kaldır</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                            Kullanıcı: <strong>{selectedUser?.username}</strong>
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                            Mevcut Rozet: <strong>{selectedUser?.badge ? badges[selectedUser.badge]?.label : 'Yok'}</strong>
                        </Typography>

                        <FormControl fullWidth sx={{ mt: 2 }}>
                            <InputLabel>Rozet Seç</InputLabel>
                            <Select
                                value={selectedBadge}
                                onChange={(e) => setSelectedBadge(e.target.value)}
                                label="Rozet Seç"
                            >
                                {Object.entries(badges).map(([key, badge]) => (
                                    <MenuItem key={key} value={key}>
                                        {badge.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {selectedBadge !== 'none' && (
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Rozet Verme Nedeni"
                                value={badgeReason}
                                onChange={(e) => setBadgeReason(e.target.value)}
                                sx={{ mt: 2 }}
                                placeholder="Opsiyonel: Rozet verme nedeninizi açıklayın..."
                            />
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>İptal</Button>
                    <Button
                        onClick={handleDialogSubmit}
                        variant="contained"
                        sx={{ bgcolor: '#000', '&:hover': { bgcolor: '#212121' } }}
                    >
                        {selectedBadge === 'none' ? 'Rozeti Kaldır' : 'Rozet Ver'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Password Reset Dialog */}
            <Dialog
                open={dialogOpen && dialogType === 'password'}
                onClose={closeDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Şifre Sıfırla</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                            Kullanıcı: <strong>{selectedUser?.username}</strong>
                        </Typography>
                        <TextField
                            fullWidth
                            type="password"
                            label="Yeni Şifre"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            helperText="En az 6 karakter"
                            sx={{ mt: 2 }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>İptal</Button>
                    <Button
                        onClick={handleDialogSubmit}
                        variant="contained"
                        disabled={newPassword.length < 6}
                        sx={{ bgcolor: '#000', '&:hover': { bgcolor: '#212121' } }}
                    >
                        Şifreyi Sıfırla
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete User Dialog - YENİ */}
            <Dialog
                open={dialogOpen && dialogType === 'delete'}
                onClose={closeDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ color: 'error.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Warning />
                    Kullanıcıyı Kalıcı Olarak Sil
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <Alert severity="error" sx={{ mb: 2 }}>
                            <strong>DİKKAT!</strong> Bu işlem geri alınamaz. Kullanıcı ve tüm verileri kalıcı olarak silinecektir.
                        </Alert>

                        <Typography variant="body2" gutterBottom>
                            <strong>Kullanıcı:</strong> {selectedUser?.username}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                            <strong>Email:</strong> {selectedUser?.email}
                        </Typography>
                        <Typography variant="body2" gutterBottom sx={{ mb: 2 }}>
                            <strong>Ad Soyad:</strong> {selectedUser?.firstName} {selectedUser?.lastName}
                        </Typography>

                        <Typography variant="body2" color="textSecondary" gutterBottom>
                            Onaylamak için kullanıcı adını yazın: <strong>{selectedUser?.username}</strong>
                        </Typography>

                        <TextField
                            fullWidth
                            label="Kullanıcı Adı"
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            placeholder={selectedUser?.username}
                            sx={{ mt: 2 }}
                            autoComplete="off"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>İptal</Button>
                    <Button
                        onClick={handleDialogSubmit}
                        variant="contained"
                        color="error"
                        disabled={deleteConfirmText !== selectedUser?.username}
                        startIcon={<Delete />}
                    >
                        Kalıcı Olarak Sil
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UserManagement;