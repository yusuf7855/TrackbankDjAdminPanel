// src/pages/LabelManagement.jsx - LABEL YÖNETİMİ (CLAIM DESTEĞİ)
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Box, Paper, Typography, Button, TextField, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, TablePagination, IconButton, Avatar, Chip, Dialog, DialogTitle,
    DialogContent, DialogActions, Grid, FormControl, InputLabel, Select, MenuItem, Alert,
    Snackbar, CircularProgress, Tabs, Tab, Tooltip, Stack, Divider, Card, CardContent,
    InputAdornment, Switch, FormControlLabel
} from '@mui/material';
import {
    Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon,
    Refresh as RefreshIcon, Label as LabelIcon, VerifiedUser as VerifiedIcon,
    Check as CheckIcon, Close as CloseIcon, MusicNote as MusicNoteIcon,
    Clear as ClearIcon, FilterList as FilterIcon, Person as PersonIcon,
    Business as BusinessIcon, Link as LinkIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = 'https://api.trackbangserver.com/api';

function TabPanel({ children, value, index, ...other }) {
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
}

const LabelManagement = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialTab = searchParams.get('tab') === 'claims' ? 1 : 0;

    // State
    const [tabValue, setTabValue] = useState(initialTab);
    const [labels, setLabels] = useState([]);
    const [pendingClaims, setPendingClaims] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [stats, setStats] = useState({ total: 0, claimed: 0, unclaimed: 0, pendingClaims: 0 });

    // Dialog states
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState('add');
    const [selectedLabel, setSelectedLabel] = useState(null);
    const [claimActionDialog, setClaimActionDialog] = useState({ open: false, claim: null, action: null });
    const [rejectionReason, setRejectionReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        name: '', bio: '', website: '', logo: '',
        socialLinks: { instagram: '', youtube: '', spotify: '', beatport: '', soundcloud: '' },
        isVerified: false
    });

    // Token
    const getAuthHeaders = () => {
        const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    // Snackbar
    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    // Load stats
    const loadStats = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/labels/stats`, getAuthHeaders());
            if (response.data.success) {
                setStats(response.data.stats);
            }
        } catch (error) {
            console.error('Stats yüklenemedi:', error);
        }
    }, []);

    // Load labels
    const loadLabels = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', page + 1);
            params.append('limit', rowsPerPage);
            if (searchQuery) params.append('search', searchQuery);
            if (filterStatus !== 'all') params.append('claimStatus', filterStatus);

            const response = await axios.get(`${API_BASE_URL}/labels?${params}`, getAuthHeaders());
            setLabels(response.data.data?.labels || []);
        } catch (error) {
            showSnackbar('Label\'lar yüklenemedi', 'error');
        } finally {
            setLoading(false);
        }
    }, [searchQuery, filterStatus, page, rowsPerPage]);

    // Load pending claims
    const loadPendingClaims = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/labels/claims?status=pending`, getAuthHeaders());
            setPendingClaims(response.data.data?.claims || []);
        } catch (error) {
            console.error('Claims yüklenemedi:', error);
        }
    }, []);

    useEffect(() => {
        loadLabels();
        loadStats();
    }, [loadLabels, loadStats]);

    useEffect(() => {
        if (tabValue === 1) {
            loadPendingClaims();
        }
    }, [tabValue, loadPendingClaims]);

    // Handle tab change
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        setSearchParams(newValue === 1 ? { tab: 'claims' } : {});
    };

    // Open add dialog
    const handleOpenAdd = () => {
        setDialogMode('add');
        setFormData({
            name: '', bio: '', website: '', logo: '',
            socialLinks: { instagram: '', youtube: '', spotify: '', beatport: '', soundcloud: '' },
            isVerified: false
        });
        setOpenDialog(true);
    };

    // Open edit dialog
    const handleOpenEdit = (label) => {
        setDialogMode('edit');
        setSelectedLabel(label);
        setFormData({
            name: label.name || '',
            bio: label.bio || '',
            website: label.website || '',
            logo: label.logo || '',
            socialLinks: label.socialLinks || { instagram: '', youtube: '', spotify: '', beatport: '', soundcloud: '' },
            isVerified: label.isVerified || false
        });
        setOpenDialog(true);
    };

    // Save label
    const handleSave = async () => {
        try {
            if (dialogMode === 'add') {
                await axios.post(`${API_BASE_URL}/labels`, formData, getAuthHeaders());
                showSnackbar('Label oluşturuldu');
            } else {
                await axios.put(`${API_BASE_URL}/labels/${selectedLabel._id}`, formData, getAuthHeaders());
                showSnackbar('Label güncellendi');
            }
            setOpenDialog(false);
            loadLabels();
            loadStats();
        } catch (error) {
            showSnackbar(error.response?.data?.message || 'Hata oluştu', 'error');
        }
    };

    // Delete label
    const handleDelete = async (id) => {
        if (!window.confirm('Bu label\'ı silmek istediğinize emin misiniz?')) return;
        try {
            await axios.delete(`${API_BASE_URL}/labels/${id}`, getAuthHeaders());
            showSnackbar('Label silindi');
            loadLabels();
            loadStats();
        } catch (error) {
            showSnackbar('Silme hatası', 'error');
        }
    };

    // Remove claim
    const handleRemoveClaim = async (id) => {
        if (!window.confirm('Claim\'i kaldırmak istediğinize emin misiniz?')) return;
        try {
            await axios.delete(`${API_BASE_URL}/labels/${id}/claim`, getAuthHeaders());
            showSnackbar('Claim kaldırıldı');
            loadLabels();
            loadStats();
        } catch (error) {
            showSnackbar('Hata oluştu', 'error');
        }
    };

    // Approve claim
    const handleApproveClaim = async () => {
        setActionLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/labels/claims/${claimActionDialog.claim._id}/approve`, {}, getAuthHeaders());
            showSnackbar('Claim onaylandı');
            setClaimActionDialog({ open: false, claim: null, action: null });
            loadPendingClaims();
            loadLabels();
            loadStats();
        } catch (error) {
            showSnackbar(error.response?.data?.message || 'Hata oluştu', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    // Reject claim
    const handleRejectClaim = async () => {
        setActionLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/labels/claims/${claimActionDialog.claim._id}/reject`, {
                adminNote: rejectionReason
            }, getAuthHeaders());
            showSnackbar('Claim reddedildi');
            setClaimActionDialog({ open: false, claim: null, action: null });
            setRejectionReason('');
            loadPendingClaims();
            loadLabels();
            loadStats();
        } catch (error) {
            showSnackbar(error.response?.data?.message || 'Hata oluştu', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    // Get claim status chip
    const getClaimStatusChip = (status) => {
        const config = {
            unclaimed: { label: 'Unclaimed', color: 'default' },
            pending: { label: 'Bekliyor', color: 'warning' },
            claimed: { label: 'Claimed', color: 'success' }
        };
        const { label, color } = config[status] || config.unclaimed;
        return <Chip label={label} color={color} size="small" />;
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: '#FF6B00', width: 56, height: 56 }}>
                        <LabelIcon fontSize="large" />
                    </Avatar>
                    <Box>
                        <Typography variant="h4" fontWeight="bold">Label Yönetimi</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Toplam: {stats.total} • Claimed: {stats.claimed} • Unclaimed: {stats.unclaimed} • Bekleyen: {stats.pendingClaims}
                        </Typography>
                    </Box>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdd}
                    sx={{ bgcolor: '#FF6B00', '&:hover': { bgcolor: '#E55A00' } }}>
                    Yeni Label
                </Button>
            </Box>

            {/* Tabs */}
            <Paper sx={{ mb: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab label={`Tüm Label'lar (${stats.total})`} icon={<LabelIcon />} iconPosition="start" />
                    <Tab label={`Claim Başvuruları (${stats.pendingClaims})`} icon={<PersonIcon />} iconPosition="start" />
                </Tabs>
            </Paper>

            {/* Tab 0: Labels List */}
            <TabPanel value={tabValue} index={0}>
                {/* Filters */}
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth size="small" placeholder="Label ara..."
                                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                                    endAdornment: searchQuery && (
                                        <IconButton size="small" onClick={() => setSearchQuery('')}>
                                            <ClearIcon fontSize="small" />
                                        </IconButton>
                                    )
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Claim Durumu</InputLabel>
                                <Select value={filterStatus} label="Claim Durumu" onChange={(e) => setFilterStatus(e.target.value)}>
                                    <MenuItem value="all">Tümü</MenuItem>
                                    <MenuItem value="unclaimed">Unclaimed</MenuItem>
                                    <MenuItem value="pending">Bekliyor</MenuItem>
                                    <MenuItem value="claimed">Claimed</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <Button fullWidth variant="outlined" startIcon={<RefreshIcon />} onClick={loadLabels}>
                                Yenile
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Labels Table */}
                <TableContainer component={Paper}>
                    {loading && <Box sx={{ width: '100%' }}><CircularProgress sx={{ display: 'block', mx: 'auto', my: 2 }} /></Box>}
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                <TableCell>Label</TableCell>
                                <TableCell>Slug</TableCell>
                                <TableCell align="center">Müzik</TableCell>
                                <TableCell align="center">Claim Durumu</TableCell>
                                <TableCell align="center">Doğrulanmış</TableCell>
                                <TableCell align="right">İşlemler</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {labels.map((label) => (
                                <TableRow key={label._id} hover>
                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <Avatar src={label.logo} sx={{ bgcolor: '#FF6B00' }}>
                                                <LabelIcon />
                                            </Avatar>
                                            <Box>
                                                <Typography fontWeight="bold">{label.name}</Typography>
                                                {label.linkedProfileId && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        @{label.linkedProfileId.username}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={label.slug} size="small" variant="outlined" />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip icon={<MusicNoteIcon />} label={label.trackCount || 0} size="small" />
                                    </TableCell>
                                    <TableCell align="center">
                                        {getClaimStatusChip(label.claimStatus)}
                                    </TableCell>
                                    <TableCell align="center">
                                        {label.isVerified ? (
                                            <VerifiedIcon color="primary" />
                                        ) : (
                                            <Typography color="text.secondary">-</Typography>
                                        )}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Düzenle">
                                            <IconButton onClick={() => handleOpenEdit(label)} color="primary">
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        {label.claimStatus === 'claimed' && (
                                            <Tooltip title="Claim Kaldır">
                                                <IconButton onClick={() => handleRemoveClaim(label._id)} color="warning">
                                                    <PersonIcon />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        <Tooltip title="Sil">
                                            <IconButton onClick={() => handleDelete(label._id)} color="error">
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {labels.length === 0 && !loading && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                        <Typography color="text.secondary">Label bulunamadı</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    <TablePagination
                        component="div" count={-1} page={page} rowsPerPage={rowsPerPage}
                        onPageChange={(e, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }}
                        rowsPerPageOptions={[10, 25, 50]}
                        labelRowsPerPage="Sayfa başına:"
                    />
                </TableContainer>
            </TabPanel>

            {/* Tab 1: Claim Requests */}
            <TabPanel value={tabValue} index={1}>
                <Grid container spacing={3}>
                    {pendingClaims.length === 0 ? (
                        <Grid item xs={12}>
                            <Paper sx={{ p: 4, textAlign: 'center' }}>
                                <Typography color="text.secondary">Bekleyen claim başvurusu yok</Typography>
                            </Paper>
                        </Grid>
                    ) : (
                        pendingClaims.map((claim) => (
                            <Grid item xs={12} md={6} key={claim._id}>
                                <Card>
                                    <CardContent>
                                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                                            <Avatar src={claim.labelId?.logo} sx={{ bgcolor: '#FF6B00', width: 60, height: 60 }}>
                                                <LabelIcon />
                                            </Avatar>
                                            <Box flex={1}>
                                                <Typography variant="h6">{claim.labelId?.name}</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Başvuran: {claim.profileId?.displayName || claim.userId?.email}
                                                </Typography>
                                            </Box>
                                            <Chip label="Bekliyor" color="warning" />
                                        </Box>

                                        {claim.message && (
                                            <Alert severity="info" sx={{ mb: 2 }}>
                                                <Typography variant="body2">{claim.message}</Typography>
                                            </Alert>
                                        )}

                                        {claim.proofUrl && (
                                            <Button href={claim.proofUrl} target="_blank" startIcon={<LinkIcon />} size="small" sx={{ mb: 2 }}>
                                                Kanıt Linki
                                            </Button>
                                        )}

                                        <Divider sx={{ my: 2 }} />

                                        <Box display="flex" gap={1} justifyContent="flex-end">
                                            <Button
                                                variant="outlined" color="error" startIcon={<CloseIcon />}
                                                onClick={() => setClaimActionDialog({ open: true, claim, action: 'reject' })}
                                            >
                                                Reddet
                                            </Button>
                                            <Button
                                                variant="contained" color="success" startIcon={<CheckIcon />}
                                                onClick={() => setClaimActionDialog({ open: true, claim, action: 'approve' })}
                                            >
                                                Onayla
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    )}
                </Grid>
            </TabPanel>

            {/* Add/Edit Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    {dialogMode === 'add' ? 'Yeni Label Ekle' : 'Label Düzenle'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth label="Label Adı" required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth label="Bio" multiline rows={3}
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth label="Website"
                                value={formData.website}
                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth label="Logo URL"
                                value={formData.logo}
                                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Divider sx={{ my: 1 }}>Sosyal Medya</Divider>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth label="Instagram" size="small"
                                value={formData.socialLinks.instagram}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    socialLinks: { ...formData.socialLinks, instagram: e.target.value }
                                })}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth label="YouTube" size="small"
                                value={formData.socialLinks.youtube}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    socialLinks: { ...formData.socialLinks, youtube: e.target.value }
                                })}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth label="Spotify" size="small"
                                value={formData.socialLinks.spotify}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    socialLinks: { ...formData.socialLinks, spotify: e.target.value }
                                })}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth label="Beatport" size="small"
                                value={formData.socialLinks.beatport}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    socialLinks: { ...formData.socialLinks, beatport: e.target.value }
                                })}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth label="SoundCloud" size="small"
                                value={formData.socialLinks.soundcloud}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    socialLinks: { ...formData.socialLinks, soundcloud: e.target.value }
                                })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.isVerified}
                                        onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                                    />
                                }
                                label="Doğrulanmış Label"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>İptal</Button>
                    <Button variant="contained" onClick={handleSave} sx={{ bgcolor: '#FF6B00' }}>
                        {dialogMode === 'add' ? 'Oluştur' : 'Kaydet'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Claim Action Dialog */}
            <Dialog open={claimActionDialog.open} onClose={() => setClaimActionDialog({ open: false, claim: null, action: null })}>
                <DialogTitle>
                    {claimActionDialog.action === 'approve' ? 'Claim Onayla' : 'Claim Reddet'}
                </DialogTitle>
                <DialogContent>
                    {claimActionDialog.action === 'approve' ? (
                        <Typography>
                            <strong>{claimActionDialog.claim?.labelId?.name}</strong> label'ını{' '}
                            <strong>{claimActionDialog.claim?.profileId?.displayName}</strong> kullanıcısına onaylamak istiyor musunuz?
                        </Typography>
                    ) : (
                        <>
                            <Typography sx={{ mb: 2 }}>
                                <strong>{claimActionDialog.claim?.labelId?.name}</strong> claim başvurusunu reddetmek istiyor musunuz?
                            </Typography>
                            <TextField
                                fullWidth label="Red Sebebi (opsiyonel)" multiline rows={2}
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                            />
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setClaimActionDialog({ open: false, claim: null, action: null })}>
                        İptal
                    </Button>
                    <Button
                        variant="contained"
                        color={claimActionDialog.action === 'approve' ? 'success' : 'error'}
                        onClick={claimActionDialog.action === 'approve' ? handleApproveClaim : handleRejectClaim}
                        disabled={actionLoading}
                    >
                        {actionLoading ? <CircularProgress size={24} /> : (claimActionDialog.action === 'approve' ? 'Onayla' : 'Reddet')}
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
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default LabelManagement;
