import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Snackbar,
    IconButton,
    Avatar,
    Tooltip,
    Switch,
    FormControlLabel
} from '@mui/material';
import {
    Store as StoreIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    Refresh as RefreshIcon,
    Euro as EuroIcon,
    Visibility as VisibilityIcon,
    Phone as PhoneIcon,
    Category as CategoryIcon,
    TrendingUp as TrendingUpIcon,
    LocalOffer as LocalOfferIcon,
    AccessTime as AccessTimeIcon
} from '@mui/icons-material';

const API_BASE = 'http://192.168.1.106:5000/api';

export default function StoreManagement() {
    // State management
    const [listings, setListings] = useState([]);
    const [stats, setStats] = useState({
        totalListings: 0,
        activeListings: 0,
        expiredListings: 0,
        totalRevenue: 0
    });
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [totalCount, setTotalCount] = useState(0);

    // Filter states
    const [filters, setFilters] = useState({
        status: '',
        category: '',
        search: ''
    });

    // Modal states
    const [grantRightsModal, setGrantRightsModal] = useState(false);
    const [updateStatusModal, setUpdateStatusModal] = useState(false);
    const [selectedListing, setSelectedListing] = useState(null);
    const [grantRightsForm, setGrantRightsForm] = useState({
        userId: '',
        rightsAmount: 1,
        reason: ''
    });
    const [statusForm, setStatusForm] = useState({
        status: '',
        isActive: false
    });

    // Alert states
    const [alert, setAlert] = useState({ show: false, message: '', severity: 'info' });

    // Categories
    const categories = [
        { key: 'sound_cards', name: 'Ses Kartları' },
        { key: 'monitors', name: 'Monitörler' },
        { key: 'midi_keyboards', name: 'MIDI Klavyeler' },
        { key: 'recording_sets', name: 'Kayıt Setleri' },
        { key: 'production_computers', name: 'Prodüksiyon Bilgisayarları' },
        { key: 'dj_equipment', name: 'DJ Ekipmanları' },
        { key: 'production_control_devices', name: 'Prodüksiyon Kontrol Cihazları' },
        { key: 'gaming_podcast_equipment', name: 'Gaming ve Podcast Ekipmanları' },
        { key: 'microphones', name: 'Mikrofonlar' },
        { key: 'headphones', name: 'Kulaklıklar' },
        { key: 'studio_dj_accessories', name: 'Studio / DJ Aksesuarları' },
        { key: 'cables', name: 'Kablolar' },
        { key: 'interfaces', name: 'Arabirimler' },
        { key: 'recording_devices', name: 'Kayıt Cihazları' },
        { key: 'pre_amplifiers_effects', name: 'Pre-Amifler / Efektler' },
        { key: 'software', name: 'Yazılımlar' }
    ];

    // Load data on component mount
    useEffect(() => {
        loadStoreStats();
        loadListings();
    }, [page, rowsPerPage, filters]);

    // Load store statistics
    const loadStoreStats = async () => {
        try {
            const response = await fetch(`${API_BASE}/store/admin/stats`);
            const data = await response.json();

            if (data.success) {
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Error loading stats:', error);
            showAlert('İstatistikler yüklenirken hata oluştu', 'error');
        }
    };

    // Load listings with filters
    const loadListings = async () => {
        setLoading(true);
        try {
            let url = `${API_BASE}/store/admin/listings?page=${page + 1}&limit=${rowsPerPage}`;

            if (filters.status) url += `&status=${filters.status}`;
            if (filters.category) url += `&category=${filters.category}`;
            if (filters.search) url += `&search=${encodeURIComponent(filters.search)}`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.success) {
                setListings(data.listings);
                setTotalCount(data.pagination.totalItems);
            } else {
                showAlert('İlanlar yüklenirken hata oluştu', 'error');
            }
        } catch (error) {
            console.error('Error loading listings:', error);
            showAlert('İlanlar yüklenirken hata oluştu', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Handle filter changes
    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        setPage(0); // Reset to first page
    };

    // Grant listing rights
    const handleGrantRights = async () => {
        try {
            const response = await fetch(`${API_BASE}/store/admin/rights/grant`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(grantRightsForm)
            });

            const data = await response.json();

            if (data.success) {
                showAlert(`${grantRightsForm.rightsAmount} ilan hakkı başarıyla verildi`, 'success');
                setGrantRightsModal(false);
                setGrantRightsForm({ userId: '', rightsAmount: 1, reason: '' });
            } else {
                showAlert(data.message || 'Hak verme işlemi başarısız', 'error');
            }
        } catch (error) {
            console.error('Error granting rights:', error);
            showAlert('Hak verme işlemi başarısız', 'error');
        }
    };

    // Update listing status
    const handleUpdateStatus = async () => {
        if (!selectedListing) return;

        try {
            const response = await fetch(`${API_BASE}/store/admin/listings/${selectedListing._id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(statusForm)
            });

            const data = await response.json();

            if (data.success) {
                showAlert('İlan durumu başarıyla güncellendi', 'success');
                setUpdateStatusModal(false);
                setSelectedListing(null);
                loadListings();
                loadStoreStats();
            } else {
                showAlert(data.message || 'Güncelleme başarısız', 'error');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            showAlert('Güncelleme başarısız', 'error');
        }
    };

    // Delete listing
    const handleDeleteListing = async (listingId) => {
        if (!window.confirm('Bu ilanı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/store/admin/listings/${listingId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                showAlert('İlan başarıyla silindi', 'success');
                loadListings();
                loadStoreStats();
            } else {
                showAlert(data.message || 'Silme işlemi başarısız', 'error');
            }
        } catch (error) {
            console.error('Error deleting listing:', error);
            showAlert('Silme işlemi başarısız', 'error');
        }
    };

    // Open update status modal
    const openUpdateStatusModal = (listing) => {
        setSelectedListing(listing);
        setStatusForm({
            status: listing.status,
            isActive: listing.isActive
        });
        setUpdateStatusModal(true);
    };

    // Show alert
    const showAlert = (message, severity = 'info') => {
        setAlert({ show: true, message, severity });
    };

    // Close alert
    const closeAlert = () => {
        setAlert({ show: false, message: '', severity: 'info' });
    };

    // Get status color
    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'success';
            case 'expired': return 'warning';
            case 'sold': return 'info';
            case 'inactive': return 'error';
            default: return 'default';
        }
    };

    // Get status text
    const getStatusText = (status) => {
        switch (status) {
            case 'active': return 'Aktif';
            case 'expired': return 'Süresi Dolmuş';
            case 'sold': return 'Satıldı';
            case 'inactive': return 'Pasif';
            default: return status;
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <StoreIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Box>
                    <Typography variant="h4" component="h1" fontWeight="bold">
                        Mağaza Yönetimi
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Kullanıcı ilanları, ilan hakları ve mağaza istatistiklerini yönetin
                    </Typography>
                </Box>
            </Box>

            {/* Statistics Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                                <StoreIcon />
                            </Avatar>
                            <Box>
                                <Typography variant="h5" fontWeight="bold">
                                    {stats.totalListings}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Toplam İlan
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: 'success.main' }}>
                                <TrendingUpIcon />
                            </Avatar>
                            <Box>
                                <Typography variant="h5" fontWeight="bold">
                                    {stats.activeListings}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Aktif İlan
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: 'warning.main' }}>
                                <AccessTimeIcon />
                            </Avatar>
                            <Box>
                                <Typography variant="h5" fontWeight="bold">
                                    {stats.expiredListings}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Süresi Dolmuş
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: 'info.main' }}>
                                <EuroIcon />
                            </Avatar>
                            <Box>
                                <Typography variant="h5" fontWeight="bold">
                                    €{stats.totalRevenue.toFixed(2)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Toplam Gelir
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Filters and Actions */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Durum Filtresi</InputLabel>
                            <Select
                                value={filters.status}
                                label="Durum Filtresi"
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                            >
                                <MenuItem value="">Tüm Durumlar</MenuItem>
                                <MenuItem value="active">Aktif</MenuItem>
                                <MenuItem value="inactive">Pasif</MenuItem>
                                <MenuItem value="expired">Süresi Dolmuş</MenuItem>
                                <MenuItem value="sold">Satıldı</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Kategori Filtresi</InputLabel>
                            <Select
                                value={filters.category}
                                label="Kategori Filtresi"
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                            >
                                <MenuItem value="">Tüm Kategoriler</MenuItem>
                                {categories.map((cat) => (
                                    <MenuItem key={cat.key} value={cat.key}>
                                        {cat.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="Arama"
                            placeholder="İlan numarası, başlık veya açıklama..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            InputProps={{
                                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={2}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => setGrantRightsModal(true)}
                                sx={{ flexGrow: 1 }}
                            >
                                Hak Ver
                            </Button>
                            <IconButton onClick={() => { loadListings(); loadStoreStats(); }}>
                                <RefreshIcon />
                            </IconButton>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            {/* Listings Table */}
            <Paper>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>İlan #</TableCell>
                                <TableCell>Başlık</TableCell>
                                <TableCell>Kullanıcı</TableCell>
                                <TableCell>Kategori</TableCell>
                                <TableCell>Fiyat</TableCell>
                                <TableCell>Durum</TableCell>
                                <TableCell>Görüntülenme</TableCell>
                                <TableCell>İletişim</TableCell>
                                <TableCell>Oluşturulma</TableCell>
                                <TableCell>İşlemler</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={10} align="center">
                                        <Typography>Yükleniyor...</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : listings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={10} align="center">
                                        <Typography>İlan bulunamadı</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                listings.map((listing) => (
                                    <TableRow key={listing._id} hover>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="medium">
                                                {listing.listingNumber}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ maxWidth: 200 }} noWrap>
                                                {listing.title}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {listing.userId ? listing.userId.username : 'N/A'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {listing.categoryDisplayName || listing.category}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="medium">
                                                €{listing.price}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={getStatusText(listing.status)}
                                                color={getStatusColor(listing.status)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <VisibilityIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                <Typography variant="body2">{listing.views}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                <Typography variant="body2">{listing.contactCount}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {new Date(listing.createdAt).toLocaleDateString('tr-TR')}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Tooltip title="Düzenle">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => openUpdateStatusModal(listing)}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Sil">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleDeleteListing(listing._id)}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    component="div"
                    count={totalCount}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    labelRowsPerPage="Sayfa başına satır:"
                    labelDisplayedRows={({ from, to, count }) =>
                        `${from}-${to} / ${count !== -1 ? count : `${to}'den fazla`}`
                    }
                />
            </Paper>

            {/* Grant Rights Modal */}
            <Dialog open={grantRightsModal} onClose={() => setGrantRightsModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>İlan Hakkı Ver</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            fullWidth
                            label="Kullanıcı ID"
                            value={grantRightsForm.userId}
                            onChange={(e) => setGrantRightsForm(prev => ({ ...prev, userId: e.target.value }))}
                            placeholder="Kullanıcı ID'sini girin"
                        />
                        <TextField
                            fullWidth
                            type="number"
                            label="Hak Miktarı"
                            value={grantRightsForm.rightsAmount}
                            onChange={(e) => setGrantRightsForm(prev => ({ ...prev, rightsAmount: parseInt(e.target.value) }))}
                            inputProps={{ min: 1, max: 100 }}
                        />
                        <TextField
                            fullWidth
                            label="Sebep"
                            value={grantRightsForm.reason}
                            onChange={(e) => setGrantRightsForm(prev => ({ ...prev, reason: e.target.value }))}
                            placeholder="Hak verme sebebi"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setGrantRightsModal(false)}>İptal</Button>
                    <Button
                        onClick={handleGrantRights}
                        variant="contained"
                        disabled={!grantRightsForm.userId || !grantRightsForm.rightsAmount}
                    >
                        Hak Ver
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Update Status Modal */}
            <Dialog open={updateStatusModal} onClose={() => setUpdateStatusModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>İlan Durumunu Güncelle</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <FormControl fullWidth>
                            <InputLabel>Yeni Durum</InputLabel>
                            <Select
                                value={statusForm.status}
                                label="Yeni Durum"
                                onChange={(e) => setStatusForm(prev => ({ ...prev, status: e.target.value }))}
                            >
                                <MenuItem value="active">Aktif</MenuItem>
                                <MenuItem value="inactive">Pasif</MenuItem>
                                <MenuItem value="expired">Süresi Dolmuş</MenuItem>
                                <MenuItem value="sold">Satıldı</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={statusForm.isActive}
                                    onChange={(e) => setStatusForm(prev => ({ ...prev, isActive: e.target.checked }))}
                                />
                            }
                            label="Aktif"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setUpdateStatusModal(false)}>İptal</Button>
                    <Button onClick={handleUpdateStatus} variant="contained">
                        Güncelle
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Alert Snackbar */}
            <Snackbar open={alert.show} autoHideDuration={6000} onClose={closeAlert}>
                <Alert onClose={closeAlert} severity={alert.severity} sx={{ width: '100%' }}>
                    {alert.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}