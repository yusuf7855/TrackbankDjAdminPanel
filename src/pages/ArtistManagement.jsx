// src/pages/ArtistManagement.jsx - ARTİST YÖNETİMİ (YENİ CLAIM AKIŞI)
//
// AKIŞ:
// 1. Admin artist ekler → Placeholder user oluşur (geçici email/telefon)
// 2. Artist "unclaimed" kalır
// 3. Gerçek artist mobil app'ten kayıt olur
// 4. Artist claim başvurusu yapar
// 5. Admin başvuruyu görür, gerçek email/telefon ile placeholder user'ı günceller
// 6. Admin onaylar → Artist claimed olur

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Box, Paper, Typography, Button, TextField, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, TablePagination, IconButton, Avatar, Chip, Dialog, DialogTitle,
    DialogContent, DialogActions, Grid, FormControl, InputLabel, Select, MenuItem, Alert,
    Snackbar, CircularProgress, Tabs, Tab, Tooltip, Stack, Divider, Card, CardContent,
    InputAdornment, Badge, Collapse, CardMedia, Switch, FormControlLabel
} from '@mui/material';
import {
    Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon,
    Refresh as RefreshIcon, MicExternalOn as ArtistIcon, VerifiedUser as VerifiedIcon,
    Person as PersonIcon, HowToReg as ClaimIcon, Check as CheckIcon, Close as CloseIcon,
    Instagram as InstagramIcon, YouTube as YouTubeIcon, Language as WebsiteIcon,
    MusicNote as MusicNoteIcon, Clear as ClearIcon, PersonAdd as PersonAddIcon,
    FilterList as FilterIcon, ExpandLess as ExpandLessIcon, CloudUpload as UploadIcon,
    PhotoCamera as PhotoCameraIcon, Panorama as BannerIcon, Diamond,
    AccountCircle as AccountIcon, ContentCopy as CopyIcon, Email as EmailIcon,
    Phone as PhoneIcon, SwapHoriz as SwapIcon, Info as InfoIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

function TabPanel({ children, value, index, ...other }) {
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
}

const DragDropImageUpload = ({ preview, isDragging, uploadProgress, onDragEnter, onDragLeave, onDragOver, onDrop, onFileSelect, onRemove, inputId, label, icon, height = 200 }) => (
    <Box onDragEnter={onDragEnter} onDragLeave={onDragLeave} onDragOver={onDragOver} onDrop={onDrop}
         onClick={() => !preview && document.getElementById(inputId).click()}
         sx={{ border: '2px dashed', borderColor: isDragging ? '#7C3AED' : '#e0e0e0', borderRadius: 2, p: 2,
             textAlign: 'center', cursor: preview ? 'default' : 'pointer',
             bgcolor: isDragging ? '#F3E8FF' : preview ? 'transparent' : '#fafafa', transition: 'all 0.3s ease',
             position: 'relative', minHeight: height, display: 'flex', flexDirection: 'column',
             alignItems: 'center', justifyContent: 'center', '&:hover': !preview && { borderColor: '#7C3AED', bgcolor: '#F3E8FF' } }}>
        <input id={inputId} type="file" accept="image/*" onChange={onFileSelect} style={{ display: 'none' }} />
        {preview ? (
            <Box position="relative" sx={{ width: '100%' }}>
                <CardMedia component="img" image={preview} alt="Preview" sx={{ width: '100%', height: height, objectFit: 'cover', borderRadius: 1 }} />
                <IconButton onClick={(e) => { e.stopPropagation(); onRemove(); }} sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.7)', color: 'white' }} size="small"><CloseIcon fontSize="small" /></IconButton>
            </Box>
        ) : (
            <Box>
                {icon || <UploadIcon sx={{ fontSize: 48, color: isDragging ? '#7C3AED' : '#999', mb: 1 }} />}
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{isDragging ? 'Bırakın!' : label || 'Görsel Yükle'}</Typography>
                <Typography variant="caption" color="text.secondary">Sürükleyip bırakın veya tıklayın</Typography>
            </Box>
        )}
        {uploadProgress > 0 && uploadProgress < 100 && (
            <Box sx={{ width: '100%', mt: 1, height: 4, bgcolor: '#e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
                <Box sx={{ width: `${uploadProgress}%`, height: '100%', bgcolor: '#7C3AED' }} />
            </Box>
        )}
    </Box>
);

const ArtistManagement = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [tabValue, setTabValue] = useState(searchParams.get('tab') === 'claims' ? 1 : 0);
    const [artists, setArtists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalArtists, setTotalArtists] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [pendingClaims, setPendingClaims] = useState([]);
    const [claimsLoading, setClaimsLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingArtist, setEditingArtist] = useState(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [artistToDelete, setArtistToDelete] = useState(null);
    const [claimActionDialog, setClaimActionDialog] = useState({ open: false, claim: null, action: null });
    const [credentialsDialog, setCredentialsDialog] = useState({ open: false, credentials: null, artistName: '' });
    const [formData, setFormData] = useState({ name: '', bio: '', profileImage: '', bannerImage: '', socialLinks: { spotify: '', instagram: '', youtube: '', twitter: '', soundcloud: '', beatport: '', website: '' } });
    const [createUserAccount, setCreateUserAccount] = useState(true);
    const [profileImagePreview, setProfileImagePreview] = useState(null);
    const [isProfileDragging, setIsProfileDragging] = useState(false);
    const [profileUploadProgress, setProfileUploadProgress] = useState(0);
    const [bannerImagePreview, setBannerImagePreview] = useState(null);
    const [isBannerDragging, setIsBannerDragging] = useState(false);
    const [bannerUploadProgress, setBannerUploadProgress] = useState(0);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [stats, setStats] = useState({ total: 0, claimed: 0, unclaimed: 0, pending: 0 });
    const [rejectionReason, setRejectionReason] = useState('');
    const [updateUserInfo, setUpdateUserInfo] = useState({ email: '', phone: '', firstName: '', lastName: '' });

    const showSnackbar = (message, severity = 'success') => setSnackbar({ open: true, message, severity });
    const copyToClipboard = (text) => { navigator.clipboard.writeText(text); showSnackbar('Panoya kopyalandı'); };

    const validateImage = (file) => {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) { showSnackbar('Sadece resim dosyaları yüklenebilir', 'error'); return false; }
        if (file.size > 5 * 1024 * 1024) { showSnackbar('Dosya boyutu 5MB\'dan küçük olmalıdır', 'error'); return false; }
        return true;
    };

    const processImage = (file, setPreview, setProgress, field) => {
        setProgress(10);
        const reader = new FileReader();
        reader.onloadend = () => { setPreview(reader.result); setFormData(prev => ({ ...prev, [field]: reader.result })); setProgress(100); setTimeout(() => setProgress(0), 1000); };
        reader.readAsDataURL(file);
    };

    const handleProfileImageChange = (e) => { const file = e.target.files[0]; if (file && validateImage(file)) processImage(file, setProfileImagePreview, setProfileUploadProgress, 'profileImage'); };
    const handleBannerImageChange = (e) => { const file = e.target.files[0]; if (file && validateImage(file)) processImage(file, setBannerImagePreview, setBannerUploadProgress, 'bannerImage'); };
    const handleProfileDrop = (e) => { e.preventDefault(); setIsProfileDragging(false); const file = e.dataTransfer.files[0]; if (file && validateImage(file)) processImage(file, setProfileImagePreview, setProfileUploadProgress, 'profileImage'); };
    const handleBannerDrop = (e) => { e.preventDefault(); setIsBannerDragging(false); const file = e.dataTransfer.files[0]; if (file && validateImage(file)) processImage(file, setBannerImagePreview, setBannerUploadProgress, 'bannerImage'); };

    const loadArtists = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/artists`, { params: { page: page + 1, limit: rowsPerPage, search: searchQuery || undefined, claimStatus: statusFilter || undefined } });
            if (response.data.success) {
                const allArtists = response.data.data.artists || [];
                setArtists(allArtists);
                setTotalArtists(response.data.data.pagination?.total || 0);
                setStats({ total: response.data.data.pagination?.total || allArtists.length, claimed: allArtists.filter(a => a.claimStatus === 'claimed').length, unclaimed: allArtists.filter(a => a.claimStatus === 'unclaimed').length, pending: allArtists.filter(a => a.claimStatus === 'pending').length });
            }
        } catch (error) { showSnackbar('Artistler yüklenirken hata oluştu', 'error'); }
        finally { setLoading(false); }
    }, [page, rowsPerPage, searchQuery, statusFilter]);

    const loadPendingClaims = useCallback(async () => {
        setClaimsLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/artists/claims/pending`);
            if (response.data.success) setPendingClaims(response.data.data.claims || []);
        } catch (error) { console.error('Claim başvuruları yüklenirken hata:', error); }
        finally { setClaimsLoading(false); }
    }, []);

    useEffect(() => { loadArtists(); }, [loadArtists]);
    useEffect(() => { if (tabValue === 1) loadPendingClaims(); }, [tabValue, loadPendingClaims]);

    const handleTabChange = (e, v) => { setTabValue(v); setSearchParams(v === 1 ? { tab: 'claims' } : {}); };

    const handleOpenDialog = (artist = null) => {
        if (artist) {
            setEditingArtist(artist);
            setFormData({ name: artist.name || '', bio: artist.bio || '', profileImage: artist.profileImage || '', bannerImage: artist.bannerImage || '', socialLinks: { spotify: artist.socialLinks?.spotify || '', instagram: artist.socialLinks?.instagram || '', youtube: artist.socialLinks?.youtube || '', twitter: artist.socialLinks?.twitter || '', soundcloud: artist.socialLinks?.soundcloud || '', beatport: artist.socialLinks?.beatport || '', website: artist.socialLinks?.website || '' } });
            setProfileImagePreview(artist.profileImage || null);
            setBannerImagePreview(artist.bannerImage || null);
            setCreateUserAccount(false);
        } else {
            setEditingArtist(null);
            setFormData({ name: '', bio: '', profileImage: '', bannerImage: '', socialLinks: { spotify: '', instagram: '', youtube: '', twitter: '', soundcloud: '', beatport: '', website: '' } });
            setProfileImagePreview(null);
            setBannerImagePreview(null);
            setCreateUserAccount(true);
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => { setOpenDialog(false); setEditingArtist(null); setProfileImagePreview(null); setBannerImagePreview(null); };
    const handleFormChange = (field, value) => { if (field.startsWith('socialLinks.')) { const sf = field.replace('socialLinks.', ''); setFormData(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, [sf]: value } })); } else { setFormData(prev => ({ ...prev, [field]: value })); } };

    const handleSubmit = async () => {
        if (!formData.name.trim()) { showSnackbar('Artist adı zorunludur', 'error'); return; }
        try {
            if (editingArtist) {
                await axios.put(`${API_BASE_URL}/artists/${editingArtist._id}`, formData);
                showSnackbar('Artist güncellendi', 'success');
            } else {
                const response = await axios.post(`${API_BASE_URL}/artists`, { ...formData, createUserAccount, badge: 'trackbang', keepUnclaimed: true });
                if (createUserAccount && response.data.data.credentials) {
                    setCredentialsDialog({ open: true, credentials: response.data.data.credentials, artistName: formData.name });
                }
                showSnackbar('Artist eklendi (unclaimed)', 'success');
            }
            handleCloseDialog();
            loadArtists();
        } catch (error) { showSnackbar(error.response?.data?.message || 'Hata oluştu', 'error'); }
    };

    const handleCreateUserForArtist = async (artistId) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/artists/${artistId}/create-user`, { badge: 'trackbang', keepUnclaimed: true });
            if (response.data.success && response.data.data.credentials) {
                setCredentialsDialog({ open: true, credentials: response.data.data.credentials, artistName: response.data.data.artist?.name });
                showSnackbar('Placeholder hesap oluşturuldu', 'success');
                loadArtists();
            }
        } catch (error) { showSnackbar(error.response?.data?.message || 'Hata oluştu', 'error'); }
    };

    const handleDeleteClick = (artist) => { setArtistToDelete(artist); setDeleteConfirmOpen(true); };
    const handleDeleteConfirm = async () => {
        if (!artistToDelete) return;
        try { await axios.delete(`${API_BASE_URL}/artists/${artistToDelete._id}`); showSnackbar('Artist silindi'); loadArtists(); }
        catch (error) { showSnackbar('Silme hatası', 'error'); }
        finally { setDeleteConfirmOpen(false); setArtistToDelete(null); }
    };

    const handleClaimAction = (claim, action) => {
        setClaimActionDialog({ open: true, claim, action });
        if (claim.userId) { setUpdateUserInfo({ email: claim.userId.email || '', phone: claim.userId.phone || '', firstName: claim.userId.firstName || '', lastName: claim.userId.lastName || '' }); }
    };

    const confirmClaimAction = async () => {
        const { claim, action } = claimActionDialog;
        if (!claim) return;
        try {
            if (action === 'approve') {
                if (claim.artistId?.claimedBy) { await axios.put(`${API_BASE_URL}/admin/users/${claim.artistId.claimedBy}`, updateUserInfo); }
                await axios.put(`${API_BASE_URL}/artists/claims/${claim._id}/approve`, { grantBadge: 'trackbang', updateUserInfo });
                showSnackbar('Claim onaylandı ve bilgiler güncellendi!', 'success');
            } else {
                if (!rejectionReason.trim()) { showSnackbar('Red sebebi zorunludur', 'error'); return; }
                await axios.put(`${API_BASE_URL}/artists/claims/${claim._id}/reject`, { rejectionReason });
                showSnackbar('Claim reddedildi', 'success');
            }
            setClaimActionDialog({ open: false, claim: null, action: null });
            setRejectionReason('');
            setUpdateUserInfo({ email: '', phone: '', firstName: '', lastName: '' });
            loadPendingClaims();
            loadArtists();
        } catch (error) { showSnackbar(error.response?.data?.message || 'Hata oluştu', 'error'); }
    };

    const getStatusChip = (status) => {
        switch (status) {
            case 'claimed': return <Chip icon={<VerifiedIcon />} label="Claimed" size="small" sx={{ bgcolor: '#10B981', color: '#fff' }} />;
            case 'pending': return <Chip icon={<ClaimIcon />} label="Pending" size="small" sx={{ bgcolor: '#F59E0B', color: '#fff' }} />;
            default: return <Chip icon={<PersonIcon />} label="Unclaimed" size="small" sx={{ bgcolor: '#6B7280', color: '#fff' }} />;
        }
    };

    return (
        <Box sx={{ p: 3, bgcolor: '#fafafa', minHeight: '100vh' }}>
            {/* Header */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Diamond sx={{ color: '#7C3AED' }} /> Artist Yönetimi
                        <Chip label="Trackbang" size="small" sx={{ bgcolor: '#7C3AED', color: '#fff', ml: 1 }} />
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Sanatçı profillerini ve claim başvurularını yönetin</Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} sx={{ bgcolor: '#7C3AED', '&:hover': { bgcolor: '#6D28D9' }, px: 3, py: 1.5, fontWeight: 'bold' }}>Yeni Artist Ekle</Button>
            </Box>

            {/* Info Alert */}
            <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3 }}>
                <Typography variant="body2"><strong>Claim Akışı:</strong> Artist eklediğinizde placeholder hesap oluşur ve <strong>unclaimed</strong> kalır. Gerçek artist mobil app'ten kayıt olup claim başvurusu yaptığında, başvuruyu onaylarken bilgileri güncelleyebilirsiniz.</Typography>
            </Alert>

            {/* Stats Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {[{ value: stats.total, label: 'Toplam Artist', color: '#7C3AED' }, { value: stats.claimed, label: 'Claimed', color: '#10B981' }, { value: stats.unclaimed, label: 'Unclaimed', color: '#6B7280' }, { value: pendingClaims.length, label: 'Bekleyen Claim', color: '#F59E0B', clickable: true }].map((stat, i) => (
                    <Grid item xs={6} sm={3} key={i}>
                        <Card sx={{ bgcolor: stat.clickable && pendingClaims.length > 0 ? '#FEF3C7' : '#fff', border: '1px solid #e0e0e0', cursor: stat.clickable && pendingClaims.length > 0 ? 'pointer' : 'default' }} onClick={() => stat.clickable && pendingClaims.length > 0 && setTabValue(1)}>
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                {stat.clickable ? <Badge badgeContent={pendingClaims.length} color="warning"><Typography variant="h4" fontWeight="bold" color={stat.color}>{stat.value}</Typography></Badge> : <Typography variant="h4" fontWeight="bold" color={stat.color}>{stat.value}</Typography>}
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>{stat.label}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Tabs */}
            <Paper sx={{ bgcolor: '#fff', border: '1px solid #e0e0e0' }}>
                <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: '1px solid #e0e0e0', '& .MuiTab-root': { fontWeight: 'bold' }, '& .Mui-selected': { color: '#7C3AED' }, '& .MuiTabs-indicator': { bgcolor: '#7C3AED' } }}>
                    <Tab icon={<ArtistIcon />} iconPosition="start" label="Artistler" />
                    <Tab icon={<Badge badgeContent={pendingClaims.length} color="warning"><ClaimIcon /></Badge>} iconPosition="start" label="Claim Başvuruları" />
                </Tabs>

                {/* Tab 0: Artists */}
                <TabPanel value={tabValue} index={0}>
                    <Box sx={{ px: 3, pb: 2 }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <TextField placeholder="Artist ara..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} size="small" sx={{ minWidth: 300 }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>, endAdornment: searchQuery && <InputAdornment position="end"><IconButton size="small" onClick={() => setSearchQuery('')}><ClearIcon /></IconButton></InputAdornment> }} />
                            <Button variant="outlined" startIcon={showFilters ? <ExpandLessIcon /> : <FilterIcon />} onClick={() => setShowFilters(!showFilters)} sx={{ borderColor: '#7C3AED', color: '#7C3AED' }}>Filtreler</Button>
                            <IconButton onClick={loadArtists} disabled={loading}><RefreshIcon sx={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /></IconButton>
                        </Stack>
                        <Collapse in={showFilters}>
                            <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={4}>
                                        <FormControl fullWidth size="small"><InputLabel>Claim Durumu</InputLabel><Select value={statusFilter} label="Claim Durumu" onChange={(e) => setStatusFilter(e.target.value)}><MenuItem value="">Tümü</MenuItem><MenuItem value="unclaimed">Unclaimed</MenuItem><MenuItem value="pending">Pending</MenuItem><MenuItem value="claimed">Claimed</MenuItem></Select></FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={4}><Button variant="outlined" onClick={() => { setStatusFilter(''); setSearchQuery(''); }}>Filtreleri Temizle</Button></Grid>
                                </Grid>
                            </Box>
                        </Collapse>
                    </Box>

                    <TableContainer>
                        <Table>
                            <TableHead><TableRow sx={{ bgcolor: '#f5f5f5' }}><TableCell sx={{ fontWeight: 'bold' }}>Artist</TableCell><TableCell sx={{ fontWeight: 'bold' }}>Placeholder Hesap</TableCell><TableCell sx={{ fontWeight: 'bold' }}>Durum</TableCell><TableCell sx={{ fontWeight: 'bold' }}>Sosyal Medya</TableCell><TableCell sx={{ fontWeight: 'bold' }} align="right">İşlemler</TableCell></TableRow></TableHead>
                            <TableBody>
                                {loading ? <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4 }}><CircularProgress sx={{ color: '#7C3AED' }} /></TableCell></TableRow> :
                                    artists.length === 0 ? <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4 }}><Typography color="text.secondary">Henüz artist eklenmemiş</Typography></TableCell></TableRow> :
                                        artists.map((artist) => (
                                            <TableRow key={artist._id} hover>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Avatar src={artist.profileImage} sx={{ width: 48, height: 48, bgcolor: '#7C3AED' }}>{artist.name?.charAt(0)}</Avatar>
                                                        <Box>
                                                            <Typography fontWeight="bold">{artist.name}{artist.claimStatus === 'claimed' && <VerifiedIcon sx={{ ml: 0.5, fontSize: 16, color: '#10B981' }} />}</Typography>
                                                            <Chip label={`@${artist.slug}`} size="small" variant="outlined" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }} />
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    {artist.hasUserAccount ? (
                                                        <Box>
                                                            <Chip size="small" icon={<AccountIcon />} label={artist.userInfo?.username || 'Var'} color={artist.claimStatus === 'claimed' ? 'success' : 'default'} variant="outlined" />
                                                            {artist.claimStatus !== 'claimed' && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>📧 {artist.userInfo?.email || 'placeholder'}</Typography>}
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}><Diamond sx={{ fontSize: 14, color: '#7C3AED' }} /><Typography variant="caption" color="#7C3AED" fontWeight="bold">Trackbang</Typography></Box>
                                                        </Box>
                                                    ) : <Button size="small" variant="outlined" startIcon={<PersonAddIcon />} onClick={() => handleCreateUserForArtist(artist._id)} sx={{ fontSize: '0.7rem', borderColor: '#7C3AED', color: '#7C3AED' }}>Placeholder Oluştur</Button>}
                                                </TableCell>
                                                <TableCell>{getStatusChip(artist.claimStatus)}</TableCell>
                                                <TableCell>
                                                    <Stack direction="row" spacing={0.5}>
                                                        {artist.socialLinks?.spotify && <Tooltip title="Spotify"><IconButton size="small" href={artist.socialLinks.spotify} target="_blank"><MusicNoteIcon sx={{ fontSize: 18, color: '#1DB954' }} /></IconButton></Tooltip>}
                                                        {artist.socialLinks?.instagram && <Tooltip title="Instagram"><IconButton size="small" href={artist.socialLinks.instagram} target="_blank"><InstagramIcon sx={{ fontSize: 18, color: '#E4405F' }} /></IconButton></Tooltip>}
                                                        {artist.socialLinks?.youtube && <Tooltip title="YouTube"><IconButton size="small" href={artist.socialLinks.youtube} target="_blank"><YouTubeIcon sx={{ fontSize: 18, color: '#FF0000' }} /></IconButton></Tooltip>}
                                                    </Stack>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                        <Tooltip title="Düzenle"><IconButton size="small" onClick={() => handleOpenDialog(artist)} sx={{ color: '#7C3AED' }}><EditIcon /></IconButton></Tooltip>
                                                        <Tooltip title="Sil"><IconButton size="small" onClick={() => handleDeleteClick(artist)} sx={{ color: '#EF4444' }}><DeleteIcon /></IconButton></Tooltip>
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination component="div" count={totalArtists} page={page} onPageChange={(e, p) => setPage(p)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[5, 10, 25, 50]} labelRowsPerPage="Sayfa başına:" />
                </TabPanel>

                {/* Tab 1: Claims */}
                <TabPanel value={tabValue} index={1}>
                    <Box sx={{ px: 3 }}>
                        {claimsLoading ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress sx={{ color: '#7C3AED' }} /></Box> :
                            pendingClaims.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 6 }}>
                                    <ClaimIcon sx={{ fontSize: 64, color: '#d0d0d0', mb: 2 }} />
                                    <Typography variant="h6" color="text.secondary">Bekleyen claim başvurusu yok</Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Artistler mobil app üzerinden claim başvurusu yaptığında burada görünecek.</Typography>
                                </Box>
                            ) : (
                                <Grid container spacing={3}>
                                    {pendingClaims.map((claim) => (
                                        <Grid item xs={12} md={6} key={claim._id}>
                                            <Card sx={{ border: '2px solid #F59E0B', borderRadius: 2 }}>
                                                <CardContent>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                                        <Chip icon={<ClaimIcon />} label="Bekleyen Başvuru" size="small" sx={{ bgcolor: '#FEF3C7', color: '#92400E' }} />
                                                        <Typography variant="caption" color="text.secondary">{new Date(claim.createdAt).toLocaleDateString('tr-TR')}</Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                                                        <Avatar src={claim.artistId?.profileImage} sx={{ width: 56, height: 56, bgcolor: '#7C3AED' }}>{claim.artistId?.name?.charAt(0)}</Avatar>
                                                        <Box><Typography variant="subtitle1" fontWeight="bold">{claim.artistId?.name}</Typography><Typography variant="caption" color="text.secondary">Artist Profili</Typography></Box>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, p: 2, bgcolor: '#E0E7FF', borderRadius: 1 }}>
                                                        <Avatar src={claim.userId?.profileImage} sx={{ width: 48, height: 48, bgcolor: '#4F46E5' }}>{claim.userId?.firstName?.charAt(0)}</Avatar>
                                                        <Box sx={{ flex: 1 }}>
                                                            <Typography variant="subtitle2" fontWeight="bold">{claim.userId?.firstName} {claim.userId?.lastName}</Typography>
                                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>@{claim.userId?.username}</Typography>
                                                            <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                                                                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><EmailIcon sx={{ fontSize: 14 }} /> {claim.userId?.email}</Typography>
                                                                {claim.userId?.phone && <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><PhoneIcon sx={{ fontSize: 14 }} /> {claim.userId?.phone}</Typography>}
                                                            </Stack>
                                                        </Box>
                                                    </Box>
                                                    <Divider sx={{ my: 2 }} />
                                                    <Stack direction="row" spacing={2}>
                                                        <Button variant="contained" startIcon={<CheckIcon />} fullWidth onClick={() => handleClaimAction(claim, 'approve')} sx={{ bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' } }}>Onayla</Button>
                                                        <Button variant="outlined" startIcon={<CloseIcon />} fullWidth onClick={() => handleClaimAction(claim, 'reject')} sx={{ borderColor: '#EF4444', color: '#EF4444' }}>Reddet</Button>
                                                    </Stack>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                    </Box>
                </TabPanel>
            </Paper>

            {/* Add/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle sx={{ bgcolor: '#7C3AED', color: '#fff' }}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>{editingArtist ? <EditIcon /> : <PersonAddIcon />}{editingArtist ? 'Artist Düzenle' : 'Yeni Artist Ekle'}</Box></DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}><Typography variant="subtitle2" color="text.secondary" gutterBottom>Temel Bilgiler</Typography><Divider sx={{ mb: 2 }} /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Artist Adı *" value={formData.name} onChange={(e) => handleFormChange('name', e.target.value)} placeholder="Örn: Murat Boz" /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Bio" value={formData.bio} onChange={(e) => handleFormChange('bio', e.target.value)} multiline rows={3} /></Grid>
                        <Grid item xs={12}><Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>Görseller</Typography><Divider sx={{ mb: 2 }} /></Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary" gutterBottom sx={{ display: 'block', mb: 1 }}>Profil Resmi</Typography>
                            <DragDropImageUpload preview={profileImagePreview} isDragging={isProfileDragging} uploadProgress={profileUploadProgress} onDragEnter={(e) => { e.preventDefault(); setIsProfileDragging(true); }} onDragLeave={(e) => { e.preventDefault(); setIsProfileDragging(false); }} onDragOver={(e) => e.preventDefault()} onDrop={handleProfileDrop} onFileSelect={handleProfileImageChange} onRemove={() => { setProfileImagePreview(null); setFormData(prev => ({ ...prev, profileImage: '' })); }} inputId="profile-image-upload" label="Profil Resmi Yükle" icon={<ArtistIcon sx={{ fontSize: 48, color: '#7C3AED' }} />} height={180} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary" gutterBottom sx={{ display: 'block', mb: 1 }}>Banner Resmi</Typography>
                            <DragDropImageUpload preview={bannerImagePreview} isDragging={isBannerDragging} uploadProgress={bannerUploadProgress} onDragEnter={(e) => { e.preventDefault(); setIsBannerDragging(true); }} onDragLeave={(e) => { e.preventDefault(); setIsBannerDragging(false); }} onDragOver={(e) => e.preventDefault()} onDrop={handleBannerDrop} onFileSelect={handleBannerImageChange} onRemove={() => { setBannerImagePreview(null); setFormData(prev => ({ ...prev, bannerImage: '' })); }} inputId="banner-image-upload" label="Banner Resmi Yükle" icon={<BannerIcon sx={{ fontSize: 48, color: '#7C3AED' }} />} height={180} />
                        </Grid>
                        <Grid item xs={12}><Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>Sosyal Medya</Typography><Divider sx={{ mb: 2 }} /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Spotify" value={formData.socialLinks.spotify} onChange={(e) => handleFormChange('socialLinks.spotify', e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><MusicNoteIcon sx={{ color: '#1DB954' }} /></InputAdornment> }} /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Instagram" value={formData.socialLinks.instagram} onChange={(e) => handleFormChange('socialLinks.instagram', e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><InstagramIcon sx={{ color: '#E4405F' }} /></InputAdornment> }} /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="YouTube" value={formData.socialLinks.youtube} onChange={(e) => handleFormChange('socialLinks.youtube', e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><YouTubeIcon sx={{ color: '#FF0000' }} /></InputAdornment> }} /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Website" value={formData.socialLinks.website} onChange={(e) => handleFormChange('socialLinks.website', e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><WebsiteIcon /></InputAdornment> }} /></Grid>
                        {!editingArtist && (
                            <>
                                <Grid item xs={12}><Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>Placeholder Hesap</Typography><Divider sx={{ mb: 2 }} /></Grid>
                                <Grid item xs={12}><FormControlLabel control={<Switch checked={createUserAccount} onChange={(e) => setCreateUserAccount(e.target.checked)} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#7C3AED' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#7C3AED' } }} />} label={<Box><Typography variant="body2" fontWeight="bold">Placeholder Hesap Oluştur</Typography><Typography variant="caption" color="text.secondary">Geçici hesap (claim sonrası güncellenir)</Typography></Box>} /></Grid>
                                {createUserAccount && <Grid item xs={12}><Alert severity="warning" icon={<InfoIcon />}><Typography variant="body2"><strong>Placeholder Hesap:</strong> Email: artist-[slug]@trackbang.app | Şifre: Trackbang2025! | Rozet: 💎 Trackbang | Durum: Unclaimed<br /><em>⚠️ Claim başvurusunda gerçek bilgilerle güncellenecek.</em></Typography></Alert></Grid>}
                            </>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}><Button onClick={handleCloseDialog} color="inherit">İptal</Button><Button variant="contained" onClick={handleSubmit} sx={{ bgcolor: '#7C3AED', '&:hover': { bgcolor: '#6D28D9' } }}>{editingArtist ? 'Güncelle' : 'Oluştur'}</Button></DialogActions>
            </Dialog>

            {/* Credentials Dialog */}
            <Dialog open={credentialsDialog.open} onClose={() => setCredentialsDialog({ open: false, credentials: null, artistName: '' })} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ bgcolor: '#F59E0B', color: '#fff' }}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><InfoIcon />Placeholder Hesap Oluşturuldu</Box></DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    {credentialsDialog.credentials && (
                        <Box>
                            <Alert severity="warning" sx={{ mb: 3 }}><strong>{credentialsDialog.artistName}</strong> için placeholder hesap oluşturuldu. Artist <strong>unclaimed</strong> durumda.</Alert>
                            <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, mb: 2 }}>
                                {['username', 'email', 'password'].map(field => (
                                    <Box key={field} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <Box><Typography variant="caption" color="text.secondary">{field === 'username' ? 'Kullanıcı Adı' : field === 'email' ? 'Email' : 'Şifre'}</Typography><Typography variant="body1" fontWeight="bold" fontFamily="monospace" color={field === 'password' ? 'error' : 'inherit'}>{credentialsDialog.credentials[field]}</Typography></Box>
                                        <IconButton size="small" onClick={() => copyToClipboard(credentialsDialog.credentials[field])}><CopyIcon fontSize="small" /></IconButton>
                                    </Box>
                                ))}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}><Diamond sx={{ color: '#7C3AED' }} /><Typography variant="body2" fontWeight="bold" color="#7C3AED">Trackbang</Typography><Chip label="Unclaimed" size="small" sx={{ bgcolor: '#6B7280', color: '#fff', ml: 1 }} /></Box>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions><Button variant="contained" onClick={() => setCredentialsDialog({ open: false, credentials: null, artistName: '' })} sx={{ bgcolor: '#7C3AED' }}>Tamam</Button></DialogActions>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}><DialogTitle>Artist Sil</DialogTitle><DialogContent><Typography><strong>{artistToDelete?.name}</strong> adlı artisti silmek istediğinize emin misiniz?</Typography></DialogContent><DialogActions><Button onClick={() => setDeleteConfirmOpen(false)}>İptal</Button><Button variant="contained" color="error" onClick={handleDeleteConfirm}>Sil</Button></DialogActions></Dialog>

            {/* Claim Action Dialog */}
            <Dialog open={claimActionDialog.open} onClose={() => { setClaimActionDialog({ open: false, claim: null, action: null }); setRejectionReason(''); setUpdateUserInfo({ email: '', phone: '', firstName: '', lastName: '' }); }} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ bgcolor: claimActionDialog.action === 'approve' ? '#10B981' : '#EF4444', color: '#fff' }}>{claimActionDialog.action === 'approve' ? '✅ Claim Onayla & Bilgileri Güncelle' : '❌ Claim Reddet'}</DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    {claimActionDialog.claim && (
                        <Box>
                            {claimActionDialog.action === 'approve' ? (
                                <>
                                    <Alert severity="info" sx={{ mb: 3 }}><Typography variant="body2"><strong>{claimActionDialog.claim.userId?.firstName} {claimActionDialog.claim.userId?.lastName}</strong>, <strong>{claimActionDialog.claim.artistId?.name}</strong> profilini sahiplenmek istiyor. Aşağıdaki bilgileri placeholder hesaba aktarın.</Typography></Alert>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom><SwapIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />Placeholder Hesabı Güncelle</Typography><Divider sx={{ mb: 2 }} />
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Ad" value={updateUserInfo.firstName} onChange={(e) => setUpdateUserInfo(prev => ({ ...prev, firstName: e.target.value }))} /></Grid>
                                        <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Soyad" value={updateUserInfo.lastName} onChange={(e) => setUpdateUserInfo(prev => ({ ...prev, lastName: e.target.value }))} /></Grid>
                                        <Grid item xs={12}><TextField fullWidth size="small" label="Email (Gerçek)" value={updateUserInfo.email} onChange={(e) => setUpdateUserInfo(prev => ({ ...prev, email: e.target.value }))} InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon /></InputAdornment> }} helperText="Başvuran kullanıcının gerçek email adresi" /></Grid>
                                        <Grid item xs={12}><TextField fullWidth size="small" label="Telefon (Gerçek)" value={updateUserInfo.phone} onChange={(e) => setUpdateUserInfo(prev => ({ ...prev, phone: e.target.value }))} InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon /></InputAdornment> }} /></Grid>
                                    </Grid>
                                    <Alert severity="success" icon={<Diamond sx={{ color: '#7C3AED' }} />} sx={{ mt: 3 }}>Onaylandığında: Hesap güncellenecek, artist "claimed" olacak, 💎 Trackbang rozeti verilecek.</Alert>
                                </>
                            ) : (
                                <><Typography gutterBottom><strong>{claimActionDialog.claim.userId?.firstName} {claimActionDialog.claim.userId?.lastName}</strong>'ın <strong>{claimActionDialog.claim.artistId?.name}</strong> başvurusunu reddetmek istiyor musunuz?</Typography><TextField fullWidth label="Red Sebebi *" value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} multiline rows={3} sx={{ mt: 2 }} /></>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}><Button onClick={() => { setClaimActionDialog({ open: false, claim: null, action: null }); setRejectionReason(''); setUpdateUserInfo({ email: '', phone: '', firstName: '', lastName: '' }); }}>İptal</Button><Button variant="contained" onClick={confirmClaimAction} disabled={claimActionDialog.action === 'approve' && !updateUserInfo.email} sx={{ bgcolor: claimActionDialog.action === 'approve' ? '#10B981' : '#EF4444' }}>{claimActionDialog.action === 'approve' ? 'Onayla & Güncelle' : 'Reddet'}</Button></DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}><Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} variant="filled">{snackbar.message}</Alert></Snackbar>
        </Box>
    );
};

export default ArtistManagement;