// src/pages/UserManagement.jsx - Pagination düzeltilmiş versiyon
import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    TextField,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    Avatar,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Card,
    CardContent,
    Tooltip,
    Alert,
    Snackbar,
    Stack,
    CircularProgress
} from '@mui/material';
import {
    Search as SearchIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    Restore as RestoreIcon,
    Person as PersonIcon,
    PersonOff as PersonOffIcon,
    Group as GroupIcon,
    PersonAdd as PersonAddIcon,
    Refresh as RefreshIcon,
    Warning as WarningIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    BugReport as BugReportIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const UserManagement = () => {
    // ============ STATE MANAGEMENT ============
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0,
        newThisMonth: 0,
        newThisWeek: 0,
        newToday: 0,
        activePercentage: 0
    });
    const [selectedUser, setSelectedUser] = useState(null);
    const [alert, setAlert] = useState({ show: false, type: 'success', message: '' });
    const [connectionStatus, setConnectionStatus] = useState('checking');
    const [isUsingMockData, setIsUsingMockData] = useState(false);
    const [debugInfo, setDebugInfo] = useState([]);

    // Pagination & Filtering
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalUsers, setTotalUsers] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy] = useState('createdAt');
    const [sortOrder] = useState('desc');

    // Modals
    const [userDetailModal, setUserDetailModal] = useState(false);
    const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [debugModal, setDebugModal] = useState(false);

    // ============ ENHANCED MOCK DATA ============
    const generateMockUsers = (totalCount = 100) => {
        const mockUsers = [];
        const firstNames = ['Ahmet', 'Mehmet', 'Ayşe', 'Fatma', 'Ali', 'Veli', 'Zeynep', 'Merve', 'Can', 'Ece', 'Burak', 'Selin', 'Kemal', 'Derya', 'Oğuz'];
        const lastNames = ['Yılmaz', 'Kaya', 'Demir', 'Çelik', 'Şahin', 'Yıldız', 'Özkan', 'Polat', 'Aksoy', 'Güven', 'Türk', 'Aydın', 'Öztürk', 'Karaca'];

        for (let i = 1; i <= totalCount; i++) {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const isActive = Math.random() > 0.2; // 80% aktif
            const createdDaysAgo = Math.floor(Math.random() * 365);

            mockUsers.push({
                _id: `mock_${i}`,
                username: `user${i.toString().padStart(3, '0')}`,
                email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
                firstName,
                lastName,
                fullName: `${firstName} ${lastName}`,
                isActive,
                createdAt: new Date(Date.now() - (createdDaysAgo * 24 * 60 * 60 * 1000)).toISOString(),
                followersCount: Math.floor(Math.random() * 500),
                followingCount: Math.floor(Math.random() * 200),
                bio: `${firstName} ${lastName} - Müzik tutkunu`
            });
        }

        return mockUsers;
    };

    const allMockUsers = generateMockUsers(234); // Toplam 234 mock kullanıcı

    // ============ API CONFIGURATION ============

    const addDebugInfo = (message) => {
        console.log(message);
        setDebugInfo(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    const testBackendConnection = async () => {
        try {
            setConnectionStatus('checking');
            addDebugInfo('🔍 Backend bağlantısı test ediliyor...');

            const response = await fetch('/health');
            const text = await response.text();

            addDebugInfo(`Health endpoint response: ${response.status}`);

            if (response.ok && !text.startsWith('<')) {
                addDebugInfo('✅ Backend bağlantısı başarılı');
                setConnectionStatus('connected');
                setIsUsingMockData(false);
                return true;
            } else {
                addDebugInfo('❌ Backend HTML döndürüyor - proxy problemi');
                setConnectionStatus('disconnected');
                setIsUsingMockData(true);
                return false;
            }
        } catch (error) {
            addDebugInfo(`❌ Backend bağlantı hatası: ${error.message}`);
            setConnectionStatus('disconnected');
            setIsUsingMockData(true);
            return false;
        }
    };

    const apiCall = async (endpoint, method = 'GET', data = null) => {
        try {
            addDebugInfo(`🚀 API Call: ${method} ${endpoint}`);

            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer fake-admin-token'
                }
            };

            if (data) {
                options.body = JSON.stringify(data);
            }

            // Try different endpoint patterns
            const endpointVariations = [
                `/api${endpoint}`,
                endpoint,
                endpoint.replace('/admin', '/api')
            ];

            for (const testEndpoint of endpointVariations) {
                try {
                    addDebugInfo(`🔍 Trying: ${testEndpoint}`);

                    const response = await fetch(testEndpoint, options);
                    const text = await response.text();

                    if (text.startsWith('<!DOCTYPE') || text.startsWith('<html')) {
                        addDebugInfo(`❌ ${testEndpoint} returns HTML`);
                        continue;
                    }

                    let result = {};
                    if (text) {

                            result = JSON.parse(text);


                    }

                    if (!response.ok) {
                        if (response.status === 404) {
                            addDebugInfo(`❌ ${testEndpoint} not found`);
                            continue;
                        }
                        throw new Error(result.message || `HTTP ${response.status}`);
                    }

                    addDebugInfo(`✅ ${testEndpoint} success!`);
                    return result;

                } catch (error) {
                    addDebugInfo(`❌ ${testEndpoint} failed: ${error.message}`);
                    continue;
                }
            }

            throw new Error('All endpoint variations failed');

        } catch (error) {
            addDebugInfo(`❌ API call completely failed: ${error.message}`);
            throw error;
        }
    };

    // ============ DATA LOADING FUNCTIONS ============

    const loadUsers = async () => {
        try {
            setLoading(true);
            addDebugInfo('📋 Kullanıcılar yükleniyor...');

            const queryParams = new URLSearchParams({
                page: page + 1,
                limit: rowsPerPage,
                search: searchTerm,
                status: statusFilter,
                sortBy,
                sortOrder
            });

            const response = await apiCall(`/admin/users?${queryParams}`);

            if (response && response.success) {
                setUsers(response.users || []);
                setTotalUsers(response.pagination?.totalUsers || 0);
                setIsUsingMockData(false);
                addDebugInfo(`✅ ${response.users?.length || 0} gerçek kullanıcı yüklendi`);

                if (response.users?.length === 0 && searchTerm) {
                    showAlert('info', 'Arama kriterlerine uygun kullanıcı bulunamadı');
                }
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            addDebugInfo(`❌ Gerçek veri yükleme hatası: ${error.message}`);

            // Use paginated mock data
            const filteredUsers = allMockUsers.filter(user => {
                const matchesSearch = !searchTerm ||
                    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.fullName.toLowerCase().includes(searchTerm.toLowerCase());

                const matchesStatus = statusFilter === 'all' ||
                    (statusFilter === 'active' && user.isActive) ||
                    (statusFilter === 'inactive' && !user.isActive);

                return matchesSearch && matchesStatus;
            });

            // Sort users
            filteredUsers.sort((a, b) => {
                if (sortBy === 'createdAt') {
                    return sortOrder === 'desc'
                        ? new Date(b.createdAt) - new Date(a.createdAt)
                        : new Date(a.createdAt) - new Date(b.createdAt);
                }
                return 0;
            });

            // Paginate
            const startIndex = page * rowsPerPage;
            const endIndex = startIndex + rowsPerPage;
            const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

            setUsers(paginatedUsers);
            setTotalUsers(filteredUsers.length);
            setIsUsingMockData(true);

            addDebugInfo(`🧪 ${paginatedUsers.length}/${filteredUsers.length} mock kullanıcı gösteriliyor (sayfa ${page + 1})`);
            showAlert('warning', `Demo veriler gösteriliyor - ${filteredUsers.length} toplam kullanıcı`);
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            addDebugInfo('📊 İstatistikler yükleniyor...');
            const response = await apiCall('/admin/stats');

            if (response && response.success) {
                setStats(response.stats || {});
                addDebugInfo('✅ Gerçek istatistikler yüklendi');
            } else {
                throw new Error('Invalid stats response');
            }
        } catch (error) {
            addDebugInfo(`❌ Gerçek istatistik hatası: ${error.message}`);

            // Calculate stats from mock data
            const activeUsers = allMockUsers.filter(u => u.isActive).length;
            const inactiveUsers = allMockUsers.length - activeUsers;

            const now = new Date();
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

            const newThisMonth = allMockUsers.filter(u => new Date(u.createdAt) > thirtyDaysAgo).length;
            const newThisWeek = allMockUsers.filter(u => new Date(u.createdAt) > sevenDaysAgo).length;
            const newToday = allMockUsers.filter(u => new Date(u.createdAt) > oneDayAgo).length;

            const mockStats = {
                total: allMockUsers.length,
                active: activeUsers,
                inactive: inactiveUsers,
                newThisMonth,
                newThisWeek,
                newToday,
                activePercentage: Math.round((activeUsers / allMockUsers.length) * 100)
            };

            setStats(mockStats);
            addDebugInfo(`🧪 Mock istatistikler: ${mockStats.total} toplam kullanıcı`);
        }
    };

    // ============ USER OPERATIONS ============

    const handleDeleteUser = async (permanent = false) => {
        if (!userToDelete) return;

        try {
            setLoading(true);
            addDebugInfo(`🗑️ Kullanıcı siliniyor: ${userToDelete.username}, permanent: ${permanent}`);

            if (!isUsingMockData) {
                const endpoint = `/admin/users/${userToDelete._id}${permanent ? '?permanent=true' : ''}`;
                const response = await apiCall(endpoint, 'DELETE');

                if (response && response.success) {
                    showAlert('success', response.message || 'Kullanıcı başarıyla silindi');
                } else {
                    throw new Error('Delete operation failed');
                }
            } else {
                // Mock delete - remove from local array
                const userIndex = allMockUsers.findIndex(u => u._id === userToDelete._id);
                if (userIndex >= 0) {
                    if (permanent) {
                        allMockUsers.splice(userIndex, 1);
                    } else {
                        allMockUsers[userIndex].isActive = false;
                    }
                }
                showAlert('success', `Mock: Kullanıcı ${permanent ? 'kalıcı olarak silindi' : 'deaktive edildi'}`);
            }

            await loadUsers();
            await loadStats();
            setDeleteConfirmModal(false);
            setUserToDelete(null);

        } catch (error) {
            addDebugInfo(`❌ Silme hatası: ${error.message}`);
            showAlert('error', 'Kullanıcı silinirken hata oluştu: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRestoreUser = async (userId) => {
        try {
            setLoading(true);
            addDebugInfo(`🔄 Kullanıcı restore ediliyor: ${userId}`);

            if (!isUsingMockData) {
                const response = await apiCall(`/admin/users/${userId}/restore`, 'POST');

                if (response && response.success) {
                    showAlert('success', 'Kullanıcı başarıyla geri yüklendi');
                } else {
                    throw new Error('Restore operation failed');
                }
            } else {
                // Mock restore
                const user = allMockUsers.find(u => u._id === userId);
                if (user) {
                    user.isActive = true;
                }
                showAlert('success', 'Mock: Kullanıcı aktif hale getirildi');
            }

            await loadUsers();
            await loadStats();

        } catch (error) {
            addDebugInfo(`❌ Restore hatası: ${error.message}`);
            showAlert('error', 'Kullanıcı geri yüklenirken hata oluştu: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleViewUser = async (userId) => {
        try {
            addDebugInfo(`👤 Kullanıcı detayları getiriliyor: ${userId}`);

            if (!isUsingMockData) {
                const response = await apiCall(`/admin/users/${userId}`);

                if (response && response.success) {
                    setSelectedUser(response.user);
                    setUserDetailModal(true);
                } else {
                    throw new Error('User details fetch failed');
                }
            } else {
                // Mock user details
                const user = allMockUsers.find(u => u._id === userId) || users.find(u => u._id === userId);
                if (user) {
                    setSelectedUser({
                        ...user,
                        playlistsCount: Math.floor(Math.random() * 20)
                    });
                    setUserDetailModal(true);
                }
            }
        } catch (error) {
            addDebugInfo(`❌ Detay hatası: ${error.message}`);
            showAlert('error', 'Kullanıcı detayları alınırken hata oluştu: ' + error.message);
        }
    };

    const handleStatusToggle = async (userId, currentStatus) => {
        try {
            setLoading(true);
            addDebugInfo(`🔄 Durum değiştiriliyor: ${userId}, ${currentStatus} → ${!currentStatus}`);

            if (!isUsingMockData) {
                const response = await apiCall(`/admin/users/${userId}/status`, 'PUT', {
                    isActive: !currentStatus,
                    reason: !currentStatus ? 'Admin activation' : 'Admin deactivation'
                });

                if (response && response.success) {
                    showAlert('success', response.message || 'Kullanıcı durumu güncellendi');
                } else {
                    throw new Error('Status update failed');
                }
            } else {
                // Mock status toggle
                const user = allMockUsers.find(u => u._id === userId);
                if (user) {
                    user.isActive = !currentStatus;
                }
                showAlert('success', `Mock: Kullanıcı ${!currentStatus ? 'aktif' : 'pasif'} hale getirildi`);
            }

            await loadUsers();
            await loadStats();

        } catch (error) {
            addDebugInfo(`❌ Durum değiştirme hatası: ${error.message}`);
            showAlert('error', 'Durum güncellenirken hata oluştu: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // ============ EVENT HANDLERS ============

    const showAlert = (type, message) => {
        setAlert({ show: true, type, message });
        setTimeout(() => {
            setAlert(prev => ({ ...prev, show: false }));
        }, 5000);
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setPage(0);
    };

    const handleFilterChange = (event) => {
        setStatusFilter(event.target.value);
        setPage(0);
    };

    const handleRefresh = async () => {
        addDebugInfo('🔄 Veri yenileniyor...');
        await testBackendConnection();
        await Promise.all([loadUsers(), loadStats()]);
    };

    const handlePageChange = (event, newPage) => {
        addDebugInfo(`📄 Sayfa değişiyor: ${page + 1} → ${newPage + 1}`);
        setPage(newPage);
    };

    const handleRowsPerPageChange = (event) => {
        const newRowsPerPage = parseInt(event.target.value, 10);
        addDebugInfo(`📏 Sayfa boyutu değişiyor: ${rowsPerPage} → ${newRowsPerPage}`);
        setRowsPerPage(newRowsPerPage);
        setPage(0);
    };

    // ============ EFFECTS ============

    useEffect(() => {
        addDebugInfo('🚀 UserManagement component mounted');

        const initializeComponent = async () => {
            await testBackendConnection();
            await loadStats();
        };

        initializeComponent();
    }, []);

    useEffect(() => {
        addDebugInfo(`📄 Sayfa parametreleri değişti: page=${page}, rowsPerPage=${rowsPerPage}, search="${searchTerm}", status="${statusFilter}"`);
        loadUsers();
    }, [page, rowsPerPage, searchTerm, statusFilter]);

    // ============ COMPONENTS ============

    const StatCard = ({ title, value, icon, color, subtitle }) => (
        <Card sx={{
            height: '100%',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 3
            }
        }}>
            <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                        <Typography variant="h4" fontWeight="bold" color={color}>
                            {typeof value === 'number' ? value.toLocaleString() : (value || 0)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                            {title}
                        </Typography>
                        {subtitle && (
                            <Typography variant="caption" color="textSecondary">
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                    <Box
                        sx={{
                            p: 2,
                            borderRadius: 2,
                            backgroundColor: `${color}15`,
                            color: color
                        }}
                    >
                        {icon}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );

    const ConnectionStatus = () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Box
                sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor:
                        connectionStatus === 'connected' ? '#4caf50' :
                            connectionStatus === 'disconnected' ? '#f44336' : '#ff9800'
                }}
            />
            <Typography variant="body2" color="textSecondary">
                Backend: {
                connectionStatus === 'connected' ? 'Bağlı' :
                    connectionStatus === 'disconnected' ? 'Bağlantı Yok' : 'Kontrol Ediliyor...'
            }
            </Typography>
            {isUsingMockData && (
                <Chip
                    label="DEMO VERİ"
                    size="small"
                    color="warning"
                    variant="outlined"
                />
            )}
            <Button size="small" onClick={testBackendConnection}>
                Test
            </Button>
            <Button size="small" onClick={() => setDebugModal(true)} startIcon={<BugReportIcon />}>
                Debug
            </Button>
        </Box>
    );

    const formatDate = (dateString) => {

            return format(new Date(dateString), 'dd MMM yyyy', { locale: tr });

    };

    // ============ MAIN RENDER ============

    return (
        <Box sx={{ p: 3 }}>
            {/* Connection Status */}
            <ConnectionStatus />

            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold">
                    👥 Kullanıcı Yönetimi {isUsingMockData && '(Demo Mode)'}
                </Typography>
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
                        onClick={handleRefresh}
                        disabled={loading}
                    >
                        Yenile
                    </Button>
                </Stack>
            </Box>

            {/* Statistics Cards */}
            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Toplam Kullanıcı"
                        value={stats.total}
                        icon={<GroupIcon />}
                        color="#2196f3"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Aktif Kullanıcı"
                        value={stats.active}
                        icon={<PersonIcon />}
                        color="#4caf50"
                        subtitle={`%${stats.activePercentage || 0} aktif`}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Bu Ay Yeni"
                        value={stats.newThisMonth}
                        icon={<PersonAddIcon />}
                        color="#ff9800"
                        subtitle={`Bu hafta: ${stats.newThisWeek || 0}`}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Pasif Kullanıcı"
                        value={stats.inactive}
                        icon={<PersonOffIcon />}
                        color="#f44336"
                    />
                </Grid>
            </Grid>

            {/* Filters and Search */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Kullanıcı ara (username, email, isim)..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            InputProps={{
                                startAdornment: <SearchIcon sx={{ mr: 1, color: 'gray' }} />
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Durum Filtresi</InputLabel>
                            <Select
                                value={statusFilter}
                                label="Durum Filtresi"
                                onChange={handleFilterChange}
                            >
                                <MenuItem value="all">Tümü</MenuItem>
                                <MenuItem value="active">Aktif</MenuItem>
                                <MenuItem value="inactive">Pasif</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Typography variant="body2" color="textSecondary">
                            Toplam {totalUsers} kullanıcı bulundu
                            {isUsingMockData && ' (demo)'}
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>

            {/* Users Table */}
            <Paper>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Kullanıcı</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Durum</TableCell>
                                <TableCell>Takipçi/Takip</TableCell>
                                <TableCell>Kayıt Tarihi</TableCell>
                                <TableCell align="center">İşlemler</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                        <Box display="flex" alignItems="center" justifyContent="center" gap={2}>
                                            <CircularProgress size={24} />
                                            <Typography>Yükleniyor...</Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                        <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                                            <Typography>📭 Kullanıcı bulunamadı</Typography>
                                            {connectionStatus === 'disconnected' && (
                                                <Typography variant="caption" color="error">
                                                    Backend bağlantısı yok. Demo verileri yükleniyor...
                                                </Typography>
                                            )}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user._id} hover>
                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={2}>
                                                <Avatar
                                                    src={user.profileImage ? `/uploads/profiles/${user.profileImage}` : null}
                                                    sx={{ width: 40, height: 40 }}
                                                >
                                                    {(user.username || 'U').charAt(0).toUpperCase()}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="subtitle2" fontWeight="bold">
                                                        {user.username || 'Unknown'}
                                                    </Typography>
                                                    <Typography variant="caption" color="textSecondary">
                                                        {user.fullName || 'İsim belirtilmemiş'}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {user.email || 'Email yok'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={user.isActive ? 'Aktif' : 'Pasif'}
                                                color={user.isActive ? 'success' : 'error'}
                                                size="small"
                                                variant="outlined"
                                                icon={user.isActive ? <CheckCircleIcon /> : <ErrorIcon />}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {user.followersCount || 0} / {user.followingCount || 0}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {formatDate(user.createdAt)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Stack direction="row" spacing={1} justifyContent="center">
                                                <Tooltip title="Detayları Görüntüle">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleViewUser(user._id)}
                                                    >
                                                        <ViewIcon />
                                                    </IconButton>
                                                </Tooltip>

                                                {user.isActive ? (
                                                    <Tooltip title="Deaktive Et">
                                                        <IconButton
                                                            size="small"
                                                            color="warning"
                                                            onClick={() => handleStatusToggle(user._id, user.isActive)}
                                                        >
                                                            <PersonOffIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                ) : (
                                                    <Tooltip title="Aktif Et">
                                                        <IconButton
                                                            size="small"
                                                            color="success"
                                                            onClick={() => handleRestoreUser(user._id)}
                                                        >
                                                            <RestoreIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}

                                                <Tooltip title="Sil">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => {
                                                            setUserToDelete(user);
                                                            setDeleteConfirmModal(true);
                                                        }}
                                                    >
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
                    onPageChange={handlePageChange}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleRowsPerPageChange}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    labelRowsPerPage="Sayfa başına:"
                    labelDisplayedRows={({ from, to, count }) =>
                        `${from}-${to} / ${count !== -1 ? count : `${to}'den fazla`}${isUsingMockData ? ' (demo)' : ''}`
                    }
                    showFirstButton
                    showLastButton
                />
            </Paper>

            {/* User Detail Modal */}
            <Dialog open={userDetailModal} onClose={() => setUserDetailModal(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    👤 Kullanıcı Detayları {isUsingMockData && '(Demo)'}
                </DialogTitle>
                <DialogContent>
                    {selectedUser && (
                        <Box sx={{ pt: 2 }}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={4}>
                                    <Box textAlign="center">
                                        <Avatar
                                            src={selectedUser.profileImage ? `/uploads/profiles/${selectedUser.profileImage}` : null}
                                            sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
                                        >
                                            {(selectedUser.username || 'U').charAt(0).toUpperCase()}
                                        </Avatar>
                                        <Typography variant="h6" fontWeight="bold">
                                            {selectedUser.username || 'Unknown'}
                                        </Typography>
                                        <Chip
                                            label={selectedUser.isActive ? 'Aktif' : 'Pasif'}
                                            color={selectedUser.isActive ? 'success' : 'error'}
                                            size="small"
                                            sx={{ mt: 1 }}
                                        />
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={8}>
                                    <Stack spacing={2}>
                                        <Box>
                                            <Typography variant="subtitle2" color="textSecondary">
                                                Tam İsim
                                            </Typography>
                                            <Typography variant="body1">
                                                {selectedUser.fullName || 'Belirtilmemiş'}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle2" color="textSecondary">
                                                Email
                                            </Typography>
                                            <Typography variant="body1">
                                                {selectedUser.email || 'Email yok'}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle2" color="textSecondary">
                                                Biyografi
                                            </Typography>
                                            <Typography variant="body1">
                                                {selectedUser.bio || 'Biyografi eklenmemiş'}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle2" color="textSecondary">
                                                İstatistikler
                                            </Typography>
                                            <Typography variant="body2">
                                                • Takipçi: {selectedUser.followersCount || 0}
                                            </Typography>
                                            <Typography variant="body2">
                                                • Takip: {selectedUser.followingCount || 0}
                                            </Typography>
                                            <Typography variant="body2">
                                                • Playlist: {selectedUser.playlistsCount || 0}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle2" color="textSecondary">
                                                Kayıt Tarihi
                                            </Typography>
                                            <Typography variant="body1">
                                                {selectedUser.createdAt ?
                                                    format(new Date(selectedUser.createdAt), 'dd MMMM yyyy HH:mm', { locale: tr }) :
                                                    'Tarih bilgisi yok'
                                                }
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setUserDetailModal(false)}>
                        Kapat
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={deleteConfirmModal} onClose={() => setDeleteConfirmModal(false)} maxWidth="sm">
                <DialogTitle>
                    <Box display="flex" alignItems="center" gap={1}>
                        <WarningIcon color="warning" />
                        Kullanıcı Silme Onayı {isUsingMockData && '(Demo)'}
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ mb: 2 }}>
                        <strong>{userToDelete?.username}</strong> kullanıcısını silmek istediğinizden emin misiniz?
                    </Typography>
                    <Alert severity="info" sx={{ mt: 2 }}>
                        <strong>Soft Delete:</strong> Kullanıcı deaktive edilir, veriler korunur.
                    </Alert>
                    <Alert severity="error" sx={{ mt: 1 }}>
                        <strong>Kalıcı Silme:</strong> Kullanıcı tamamen silinir, geri alınamaz!
                    </Alert>
                    {isUsingMockData && (
                        <Alert severity="warning" sx={{ mt: 1 }}>
                            <strong>Demo Mode:</strong> Bu sadece demo amaçlıdır, gerçek veri silinmez.
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirmModal(false)}>
                        İptal
                    </Button>
                    <Button
                        onClick={() => handleDeleteUser(false)}
                        color="warning"
                        variant="outlined"
                        startIcon={<PersonOffIcon />}
                    >
                        Deaktive Et
                    </Button>
                    <Button
                        onClick={() => handleDeleteUser(true)}
                        color="error"
                        variant="contained"
                        startIcon={<DeleteIcon />}
                    >
                        Kalıcı Sil
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Debug Modal */}
            <Dialog open={debugModal} onClose={() => setDebugModal(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Box display="flex" alignItems="center" gap={1}>
                        <BugReportIcon />
                        Debug Bilgileri
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Backend Bağlantı Durumu
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                            Status: {connectionStatus} | Mock Data: {isUsingMockData ? 'Evet' : 'Hayır'}
                        </Typography>

                        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                            Son Debug Mesajları
                        </Typography>
                        <Paper sx={{ p: 2, maxHeight: 300, overflow: 'auto', bgcolor: '#f5f5f5' }}>
                            {debugInfo.map((info, index) => (
                                <Typography key={index} variant="caption" component="div" sx={{ fontFamily: 'monospace' }}>
                                    {info}
                                </Typography>
                            ))}
                        </Paper>

                        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                            Mevcut Veriler
                        </Typography>
                        <Typography variant="body2">
                            • Görüntülenen kullanıcılar: {users.length}<br/>
                            • Toplam kullanıcı sayısı: {totalUsers}<br/>
                            • Mevcut sayfa: {page + 1}<br/>
                            • Sayfa boyutu: {rowsPerPage}<br/>
                            • Arama terimi: "{searchTerm}"<br/>
                            • Durum filtresi: {statusFilter}<br/>
                            • Veri kaynağı: {isUsingMockData ? 'Mock Data' : 'Backend API'}
                        </Typography>

                        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                            Test Önerileri
                        </Typography>
                        <Typography variant="body2">
                            1. Backend'in çalıştığından emin olun: http://localhost:5000<br/>
                            2. package.json'da proxy ayarını kontrol edin<br/>
                            3. Frontend'i restart edin (npm start)<br/>
                            4. Network tab'ta /api/admin/users endpoint'ini kontrol edin
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDebugInfo([])}>
                        Logları Temizle
                    </Button>
                    <Button onClick={() => setDebugModal(false)}>
                        Kapat
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Alert Snackbar */}
            <Snackbar
                open={alert.show}
                autoHideDuration={5000}
                onClose={() => setAlert({ ...alert, show: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setAlert({ ...alert, show: false })}
                    severity={alert.type}
                    sx={{ width: '100%' }}
                    variant="filled"
                >
                    {alert.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default UserManagement;