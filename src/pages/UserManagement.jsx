// src/pages/UserManagement.jsx - KULLANICI YÖNETİMİ SAYFASI

import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Avatar,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    TextField,
    InputAdornment,
    IconButton,
    Chip,
    Button,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    Alert,
    CircularProgress,
    Tooltip,
    Divider,
    Stack,
    Fade,
    Grow,
    Badge,
    LinearProgress
} from '@mui/material';
import {
    Search,
    MoreVert,
    Edit,
    Delete,
    PersonOff,
    Person,
    Verified,
    WorkspacePremium,
    MusicNote,
    Album,
    LibraryMusic,
    Share,
    FilterList,
    Badge as BadgeIcon,
    LocalOffer,
    LockReset,
    Groups,
    TrendingUp,
    AdminPanelSettings,
    Refresh,
    CheckCircle,
    Cancel,
    Email,
    Phone,
    CalendarToday,
    Star
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const UserManagement = () => {
    // State
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

    // Tag ve Badge Tanımları
    const tags = {
        producer: { label: 'Prodüktör', icon: MusicNote, color: '#9c27b0', bgColor: '#9c27b010' },
        dj: { label: 'DJ', icon: Album, color: '#2196f3', bgColor: '#2196f310' },
        'dj-producer': { label: 'DJ & Prodüktör', icon: LibraryMusic, color: '#4caf50', bgColor: '#4caf5010' },
        distributor: { label: 'Distribütör', icon: Share, color: '#ff9800', bgColor: '#ff980010' },
        none: { label: 'Yok', icon: null, color: '#757575', bgColor: '#75757510' }
    };

    const badges = {
        standard: { label: 'Standart', icon: Verified, color: '#757575' },
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
                status: filterStatus,
                tag: filterTag,
                badge: filterBadge,
                sortBy: 'createdAt',
                sortOrder: 'desc'
            });

            const response = await axios.get(`${API_BASE_URL}/admin/users?${params}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (response.data.success) {
                setUsers(response.data.users || []);
                setTotalUsers(response.data.pagination?.totalUsers || 0);
                setStats(response.data.stats);
            }
        } catch (error) {
            console.error('Error fetching users:', error);

            // Mock data for demo
            const mockUsers = generateMockUsers();
            setUsers(mockUsers);
            setTotalUsers(mockUsers.length);
            setStats(generateMockStats());
        } finally {
            setLoading(false);
        }
    };

    // Mock data generators
    const generateMockUsers = () => {
        return Array.from({ length: 50 }, (_, i) => ({
            _id: `user_${i + 1}`,
            username: `user_${i + 1}`,
            email: `user${i + 1}@example.com`,
            firstName: `Ad${i + 1}`,
            lastName: `Soyad${i + 1}`,
            phone: `+90 555 ${String(Math.floor(Math.random() * 900) + 100)} ${String(Math.floor(Math.random() * 90) + 10)} ${String(Math.floor(Math.random() * 90) + 10)}`,
            userTag: ['producer', 'dj', 'dj-producer', 'distributor', 'none'][Math.floor(Math.random() * 5)],
            badge: ['standard', 'premium', 'none'][Math.floor(Math.random() * 3)],
            isActive: Math.random() > 0.2,
            isAdmin: i < 2,
            isPremium: Math.random() > 0.7,
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)),
            followerCount: Math.floor(Math.random() * 1000),
            followingCount: Math.floor(Math.random() * 500),
            profileImage: null
        }));
    };

    const generateMockStats = () => ({
        total: 250,
        active: 210,
        premium: 45,
        withStandardBadge: 80,
        withPremiumBadge: 25,
        producers: 60,
        djs: 45,
        djProducers: 35,
        distributors: 20
    });

    // Handler Functions
    const handleMenuOpen = (event, user) => {
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

        if (type === 'tag' && selectedUser) {
            setSelectedTag(selectedUser.userTag || 'none');
        } else if (type === 'badge' && selectedUser) {
            setSelectedBadge(selectedUser.badge || 'none');
            setBadgeReason('');
        } else if (type === 'password') {
            setNewPassword('');
        }
    };

    const closeDialog = () => {
        setDialogOpen(false);
        setSelectedUser(null);
        setSelectedTag('');
        setSelectedBadge('');
        setBadgeReason('');
        setNewPassword('');
    };

    const handleDialogSubmit = async () => {
        // API calls would go here
        showAlert('İşlem başarıyla tamamlandı', 'success');
        closeDialog();
        fetchUsers();
    };

    const showAlert = (message, severity) => {
        setAlertMessage(message);
        setAlertSeverity(severity);
        setTimeout(() => setAlertMessage(''), 5000);
    };

    // Effects
    useEffect(() => {
        fetchUsers();
    }, [page, rowsPerPage, searchTerm, filterTag, filterBadge, filterStatus]);

    // Render Functions
    const renderTagChip = (tag) => {
        const tagInfo = tags[tag] || tags.none;
        const Icon = tagInfo.icon;

        if (tag === 'none' || !tag) return null;

        return (
            <Chip
                size="small"
                label={tagInfo.label}
                icon={Icon ? <Icon style={{ fontSize: 16 }} /> : null}
                sx={{
                    bgcolor: tagInfo.bgColor,
                    color: tagInfo.color,
                    border: `1px solid ${tagInfo.color}30`,
                    fontWeight: 500
                }}
            />
        );
    };

    const renderBadgeChip = (badge) => {
        const badgeInfo = badges[badge] || badges.none;
        const Icon = badgeInfo.icon;

        if (badge === 'none' || !badge) return null;

        return (
            <Tooltip title={`${badgeInfo.label} Rozet`}>
                <Chip
                    size="small"
                    label={badgeInfo.label}
                    icon={Icon ? <Icon style={{ fontSize: 16 }} /> : null}
                    variant={badge === 'premium' ? 'filled' : 'outlined'}
                    sx={{
                        bgcolor: badge === 'premium' ? badgeInfo.color : 'transparent',
                        color: badge === 'premium' ? '#fff' : badgeInfo.color,
                        borderColor: badgeInfo.color,
                        fontWeight: 600
                    }}
                />
            </Tooltip>
        );
    };

    return (
        <Box sx={{ p: 3, bgcolor: '#fafafa', minHeight: '100vh' }}>
            {/* Header */}
            <Fade in timeout={800}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: '#000' }}>
                        Kullanıcı Yönetimi
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Kullanıcıları yönetin, tag ve rozet atayın
                    </Typography>
                </Box>
            </Fade>

            {/* Alert */}
            {alertMessage && (
                <Fade in>
                    <Alert
                        severity={alertSeverity}
                        sx={{ mb: 3 }}
                        onClose={() => setAlertMessage('')}
                        icon={alertSeverity === 'success' ? <CheckCircle /> : <Cancel />}
                    >
                        {alertMessage}
                    </Alert>
                </Fade>
            )}

            {/* Statistics Cards */}
            {stats && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Grow in timeout={1000}>
                            <Card sx={{ bgcolor: '#fff', border: '1px solid #e0e0e0' }}>
                                <CardContent>
                                    <Box display="flex" alignItems="center" justifyContent="space-between">
                                        <Box>
                                            <Typography color="textSecondary" variant="body2" gutterBottom>
                                                Toplam Kullanıcı
                                            </Typography>
                                            <Typography variant="h4" fontWeight="bold">
                                                {stats.total || 0}
                                            </Typography>
                                        </Box>
                                        <Avatar sx={{ bgcolor: '#000', width: 48, height: 48 }}>
                                            <Groups />
                                        </Avatar>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grow>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Grow in timeout={1200}>
                            <Card sx={{ bgcolor: '#fff', border: '1px solid #e0e0e0' }}>
                                <CardContent>
                                    <Box display="flex" alignItems="center" justifyContent="space-between">
                                        <Box>
                                            <Typography color="textSecondary" variant="body2" gutterBottom>
                                                Premium Üye
                                            </Typography>
                                            <Typography variant="h4" fontWeight="bold" color="#ffc107">
                                                {stats.premium || 0}
                                            </Typography>
                                        </Box>
                                        <Avatar sx={{ bgcolor: '#ffc107', width: 48, height: 48 }}>
                                            <WorkspacePremium />
                                        </Avatar>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grow>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Grow in timeout={1400}>
                            <Card sx={{ bgcolor: '#fff', border: '1px solid #e0e0e0' }}>
                                <CardContent>
                                    <Box display="flex" alignItems="center" justifyContent="space-between">
                                        <Box>
                                            <Typography color="textSecondary" variant="body2" gutterBottom>
                                                Prodüktör
                                            </Typography>
                                            <Typography variant="h4" fontWeight="bold" color="#9c27b0">
                                                {stats.producers || 0}
                                            </Typography>
                                        </Box>
                                        <Avatar sx={{ bgcolor: '#9c27b0', width: 48, height: 48 }}>
                                            <MusicNote />
                                        </Avatar>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grow>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Grow in timeout={1600}>
                            <Card sx={{ bgcolor: '#fff', border: '1px solid #e0e0e0' }}>
                                <CardContent>
                                    <Box display="flex" alignItems="center" justifyContent="space-between">
                                        <Box>
                                            <Typography color="textSecondary" variant="body2" gutterBottom>
                                                DJ
                                            </Typography>
                                            <Typography variant="h4" fontWeight="bold" color="#2196f3">
                                                {(stats.djs || 0) + (stats.djProducers || 0)}
                                            </Typography>
                                        </Box>
                                        <Avatar sx={{ bgcolor: '#2196f3', width: 48, height: 48 }}>
                                            <Album />
                                        </Avatar>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grow>
                    </Grid>
                </Grid>
            )}

            {/* Filters and Search */}
            <Fade in timeout={1800}>
                <Paper sx={{ p: 3, mb: 3, bgcolor: '#fff', border: '1px solid #e0e0e0' }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={3}>
                            <TextField
                                fullWidth
                                size="small"
                                variant="outlined"
                                placeholder="Kullanıcı ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Tag Filtrele</InputLabel>
                                <Select
                                    value={filterTag}
                                    onChange={(e) => setFilterTag(e.target.value)}
                                    label="Tag Filtrele"
                                >
                                    <MenuItem value="all">Tümü</MenuItem>
                                    <MenuItem value="producer">Prodüktör</MenuItem>
                                    <MenuItem value="dj">DJ</MenuItem>
                                    <MenuItem value="dj-producer">DJ & Prodüktör</MenuItem>
                                    <MenuItem value="distributor">Distribütör</MenuItem>
                                    <MenuItem value="none">Tag Yok</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Rozet Filtrele</InputLabel>
                                <Select
                                    value={filterBadge}
                                    onChange={(e) => setFilterBadge(e.target.value)}
                                    label="Rozet Filtrele"
                                >
                                    <MenuItem value="all">Tümü</MenuItem>
                                    <MenuItem value="standard">Standart</MenuItem>
                                    <MenuItem value="premium">Premium</MenuItem>
                                    <MenuItem value="none">Rozet Yok</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth size="small">
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
                    </Grid>
                </Paper>
            </Fade>

            {/* Users Table */}
            <Fade in timeout={2000}>
                <TableContainer component={Paper} sx={{ bgcolor: '#fff', border: '1px solid #e0e0e0' }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#fafafa' }}>
                                <TableCell sx={{ fontWeight: 'bold' }}>Kullanıcı</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>İletişim</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Tag</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Rozet</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Durum</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Takipçi</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Kayıt Tarihi</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>İşlemler</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">
                                        <CircularProgress sx={{ color: '#000' }} />
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">
                                        <Typography color="textSecondary">
                                            Kullanıcı bulunamadı
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => (
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
                                                    {user.username[0]?.toUpperCase()}
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
                                                        {user.isPremium && (
                                                            <Tooltip title="Premium Üye">
                                                                <Star sx={{ fontSize: 16, color: '#ffc107' }} />
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
                                            <Stack spacing={0.5}>
                                                <Box display="flex" alignItems="center" gap={0.5}>
                                                    <Email sx={{ fontSize: 14, color: 'text.secondary' }} />
                                                    <Typography variant="caption">{user.email}</Typography>
                                                </Box>
                                                {user.phone && (
                                                    <Box display="flex" alignItems="center" gap={0.5}>
                                                        <Phone sx={{ fontSize: 14, color: 'text.secondary' }} />
                                                        <Typography variant="caption">{user.phone}</Typography>
                                                    </Box>
                                                )}
                                            </Stack>
                                        </TableCell>
                                        <TableCell align="center">
                                            {renderTagChip(user.userTag)}
                                        </TableCell>
                                        <TableCell align="center">
                                            {renderBadgeChip(user.badge)}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                size="small"
                                                label={user.isActive ? 'Aktif' : 'Pasif'}
                                                color={user.isActive ? 'success' : 'error'}
                                                variant={user.isActive ? 'filled' : 'outlined'}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="body2">
                                                {user.followerCount || 0}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box display="flex" alignItems="center" gap={0.5} justifyContent="center">
                                                <CalendarToday sx={{ fontSize: 14, color: 'text.secondary' }} />
                                                <Typography variant="caption">
                                                    {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton
                                                size="small"
                                                onClick={(e) => handleMenuOpen(e, user)}
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
                        onPageChange={(e, newPage) => setPage(newPage)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={(e) => {
                            setRowsPerPage(parseInt(e.target.value, 10));
                            setPage(0);
                        }}
                        labelRowsPerPage="Sayfa başına:"
                        labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
                    />
                </TableContainer>
            </Fade>

            {/* Actions Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                    sx: {
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        border: '1px solid #e0e0e0'
                    }
                }}
            >
                <MenuItem onClick={() => openDialog('tag')}>
                    <LocalOffer sx={{ mr: 1 }} fontSize="small" />
                    Tag Güncelle
                </MenuItem>
                <MenuItem onClick={() => openDialog('badge')}>
                    <BadgeIcon sx={{ mr: 1 }} fontSize="small" />
                    Rozet Yönet
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => {
                    // Toggle user status
                    showAlert('Kullanıcı durumu güncellendi', 'success');
                    handleMenuClose();
                }}>
                    {selectedUser?.isActive ? (
                        <>
                            <PersonOff sx={{ mr: 1 }} fontSize="small" />
                            Hesabı Pasifleştir
                        </>
                    ) : (
                        <>
                            <Person sx={{ mr: 1 }} fontSize="small" />
                            Hesabı Aktifleştir
                        </>
                    )}
                </MenuItem>
                <MenuItem onClick={() => openDialog('password')}>
                    <LockReset sx={{ mr: 1 }} fontSize="small" />
                    Şifre Sıfırla
                </MenuItem>
            </Menu>

            {/* Tag Dialog */}
            <Dialog
                open={dialogOpen && dialogType === 'tag'}
                onClose={closeDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Tag Güncelle</DialogTitle>
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
                                <MenuItem value="none">Tag Kaldır</MenuItem>
                                <MenuItem value="producer">
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <MusicNote sx={{ color: tags.producer.color }} />
                                        Prodüktör
                                    </Box>
                                </MenuItem>
                                <MenuItem value="dj">
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Album sx={{ color: tags.dj.color }} />
                                        DJ
                                    </Box>
                                </MenuItem>
                                <MenuItem value="dj-producer">
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <LibraryMusic sx={{ color: tags['dj-producer'].color }} />
                                        DJ & Prodüktör
                                    </Box>
                                </MenuItem>
                                <MenuItem value="distributor">
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Share sx={{ color: tags.distributor.color }} />
                                        Distribütör
                                    </Box>
                                </MenuItem>
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
                        Güncelle
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
                <DialogTitle>Rozet Yönet</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                            Kullanıcı: <strong>{selectedUser?.username}</strong>
                        </Typography>
                        <Typography variant="caption" color="textSecondary" gutterBottom>
                            Mevcut Rozet: {selectedUser?.badge || 'Yok'}
                        </Typography>
                        <FormControl fullWidth sx={{ mt: 2 }}>
                            <InputLabel>Rozet Seç</InputLabel>
                            <Select
                                value={selectedBadge}
                                onChange={(e) => setSelectedBadge(e.target.value)}
                                label="Rozet Seç"
                            >
                                <MenuItem value="none">Rozet Kaldır</MenuItem>
                                <MenuItem value="standard">
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Verified sx={{ color: badges.standard.color }} />
                                        Standart Rozet
                                    </Box>
                                </MenuItem>
                                <MenuItem value="premium">
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <WorkspacePremium sx={{ color: badges.premium.color }} />
                                        Premium Rozet
                                    </Box>
                                </MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Sebep (Opsiyonel)"
                            value={badgeReason}
                            onChange={(e) => setBadgeReason(e.target.value)}
                            sx={{ mt: 2 }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>İptal</Button>
                    <Button
                        onClick={handleDialogSubmit}
                        variant="contained"
                        sx={{ bgcolor: '#000', '&:hover': { bgcolor: '#212121' } }}
                    >
                        Uygula
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
        </Box>
    );
};

export default UserManagement;