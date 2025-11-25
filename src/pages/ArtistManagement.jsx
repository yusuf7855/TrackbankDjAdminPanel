// src/pages/ArtistManagement.jsx - DRAG & DROP GÖRSEL YÜKLEME
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
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
    Tabs,
    Tab,
    Tooltip,
    Stack,
    Divider,
    Card,
    CardContent,
    InputAdornment,
    Badge,
    Fade,
    Collapse,
    CardMedia
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    Refresh as RefreshIcon,
    MicExternalOn as ArtistIcon,
    VerifiedUser as VerifiedIcon,
    Person as PersonIcon,
    HowToReg as ClaimIcon,
    Check as CheckIcon,
    Close as CloseIcon,
    Link as LinkIcon,
    Instagram as InstagramIcon,
    YouTube as YouTubeIcon,
    Language as WebsiteIcon,
    MusicNote as MusicNoteIcon,
    Image as ImageIcon,
    Clear as ClearIcon,
    Visibility as ViewIcon,
    PersonAdd as PersonAddIcon,
    LinkOff as UnclaimIcon,
    FilterList as FilterIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    CloudUpload as UploadIcon,
    PhotoCamera as PhotoCameraIcon,
    Panorama as BannerIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
    return (
        <div role="tabpanel" hidden={value !== index} id={`artist-tabpanel-${index}`} {...other}>
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
}

// ========== DRAG & DROP IMAGE COMPONENT ==========
const DragDropImageUpload = ({
                                 preview,
                                 isDragging,
                                 uploadProgress,
                                 onDragEnter,
                                 onDragLeave,
                                 onDragOver,
                                 onDrop,
                                 onFileSelect,
                                 onRemove,
                                 inputId,
                                 label,
                                 icon,
                                 aspectRatio = '1/1', // '1/1' for profile, '3/1' for banner
                                 height = 200
                             }) => (
    <Box
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onClick={() => !preview && document.getElementById(inputId).click()}
        sx={{
            border: '2px dashed',
            borderColor: isDragging ? '#7C3AED' : '#e0e0e0',
            borderRadius: 2,
            p: 2,
            textAlign: 'center',
            cursor: preview ? 'default' : 'pointer',
            bgcolor: isDragging ? '#F3E8FF' : preview ? 'transparent' : '#fafafa',
            transition: 'all 0.3s ease',
            position: 'relative',
            minHeight: height,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            '&:hover': !preview && {
                borderColor: '#7C3AED',
                bgcolor: '#F3E8FF'
            }
        }}
    >
        <input
            id={inputId}
            type="file"
            accept="image/*"
            onChange={onFileSelect}
            style={{ display: 'none' }}
        />

        {preview ? (
            <Box position="relative" sx={{ width: '100%' }}>
                <CardMedia
                    component="img"
                    image={preview}
                    alt="Preview"
                    sx={{
                        width: '100%',
                        height: height,
                        objectFit: 'cover',
                        borderRadius: 1
                    }}
                />
                <IconButton
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.9)' }
                    }}
                    size="small"
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                        position: 'absolute',
                        bottom: 8,
                        left: '50%',
                        transform: 'translateX(-50%)'
                    }}
                >
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<PhotoCameraIcon />}
                        onClick={(e) => {
                            e.stopPropagation();
                            document.getElementById(inputId).click();
                        }}
                        sx={{
                            bgcolor: 'rgba(0,0,0,0.7)',
                            fontSize: '0.7rem',
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.9)' }
                        }}
                    >
                        Değiştir
                    </Button>
                </Stack>
            </Box>
        ) : (
            <Box>
                {icon || <UploadIcon sx={{
                    fontSize: 48,
                    color: isDragging ? '#7C3AED' : '#999',
                    mb: 1,
                    animation: isDragging ? 'bounce 1s infinite' : 'none',
                    '@keyframes bounce': {
                        '0%, 100%': { transform: 'translateY(0)' },
                        '50%': { transform: 'translateY(-10px)' }
                    }
                }} />}
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    {isDragging ? 'Bırakın!' : label || 'Görsel Yükle'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Sürükleyip bırakın veya tıklayın
                </Typography>
                <Chip
                    label="JPG, PNG, WebP • Max 5MB"
                    size="small"
                    variant="outlined"
                    sx={{ mt: 1, fontSize: '0.65rem' }}
                />
            </Box>
        )}

        {uploadProgress > 0 && uploadProgress < 100 && (
            <Box sx={{ width: '100%', mt: 1 }}>
                <Box sx={{
                    width: '100%',
                    height: 4,
                    bgcolor: '#e0e0e0',
                    borderRadius: 2,
                    overflow: 'hidden'
                }}>
                    <Box sx={{
                        width: `${uploadProgress}%`,
                        height: '100%',
                        bgcolor: '#7C3AED',
                        transition: 'width 0.3s ease'
                    }} />
                </Box>
            </Box>
        )}
    </Box>
);

const ArtistManagement = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // Tab state
    const initialTab = searchParams.get('tab') === 'claims' ? 1 : 0;
    const [tabValue, setTabValue] = useState(initialTab);

    // Artists state
    const [artists, setArtists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalArtists, setTotalArtists] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Claims state
    const [pendingClaims, setPendingClaims] = useState([]);
    const [claimsLoading, setClaimsLoading] = useState(false);

    // Dialog states
    const [openDialog, setOpenDialog] = useState(false);
    const [editingArtist, setEditingArtist] = useState(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [artistToDelete, setArtistToDelete] = useState(null);
    const [claimActionDialog, setClaimActionDialog] = useState({ open: false, claim: null, action: null });

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        profileImage: '',
        bannerImage: '',
        socialLinks: {
            spotify: '',
            instagram: '',
            youtube: '',
            twitter: '',
            soundcloud: '',
            beatport: '',
            website: ''
        }
    });

    // ========== DRAG & DROP STATES ==========
    const [profileImagePreview, setProfileImagePreview] = useState(null);
    const [profileImageFile, setProfileImageFile] = useState(null);
    const [isProfileDragging, setIsProfileDragging] = useState(false);
    const [profileUploadProgress, setProfileUploadProgress] = useState(0);

    const [bannerImagePreview, setBannerImagePreview] = useState(null);
    const [bannerImageFile, setBannerImageFile] = useState(null);
    const [isBannerDragging, setIsBannerDragging] = useState(false);
    const [bannerUploadProgress, setBannerUploadProgress] = useState(0);

    // Snackbar state
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        claimed: 0,
        unclaimed: 0,
        pending: 0
    });

    // Rejection reason
    const [rejectionReason, setRejectionReason] = useState('');

    // ========== IMAGE VALIDATION & PROCESSING ==========
    const validateImage = (file) => {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!validTypes.includes(file.type)) {
            showSnackbar('Sadece resim dosyaları yüklenebilir (JPG, PNG, GIF, WebP)', 'error');
            return false;
        }

        if (file.size > maxSize) {
            showSnackbar('Dosya boyutu 5MB\'dan küçük olmalıdır', 'error');
            return false;
        }

        return true;
    };

    // Profile Image Handlers
    const processProfileImage = (file) => {
        setProfileImageFile(file);
        setProfileUploadProgress(0);

        const reader = new FileReader();
        reader.onloadstart = () => setProfileUploadProgress(10);
        reader.onprogress = (e) => {
            if (e.lengthComputable) {
                setProfileUploadProgress((e.loaded / e.total) * 100);
            }
        };
        reader.onloadend = () => {
            setProfileImagePreview(reader.result);
            setFormData(prev => ({ ...prev, profileImage: reader.result }));
            setProfileUploadProgress(100);
            setTimeout(() => setProfileUploadProgress(0), 1000);
        };
        reader.onerror = () => {
            showSnackbar('Görsel yüklenirken hata oluştu', 'error');
            setProfileUploadProgress(0);
        };
        reader.readAsDataURL(file);
    };

    const handleProfileImageChange = (e) => {
        const file = e.target.files[0];
        if (file && validateImage(file)) {
            processProfileImage(file);
        }
    };

    const handleProfileDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setIsProfileDragging(true); };
    const handleProfileDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsProfileDragging(false); };
    const handleProfileDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
    const handleProfileDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsProfileDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0 && validateImage(files[0])) {
            processProfileImage(files[0]);
        }
    };
    const handleRemoveProfileImage = () => {
        setProfileImageFile(null);
        setProfileImagePreview(null);
        setFormData(prev => ({ ...prev, profileImage: '' }));
        setProfileUploadProgress(0);
    };

    // Banner Image Handlers
    const processBannerImage = (file) => {
        setBannerImageFile(file);
        setBannerUploadProgress(0);

        const reader = new FileReader();
        reader.onloadstart = () => setBannerUploadProgress(10);
        reader.onprogress = (e) => {
            if (e.lengthComputable) {
                setBannerUploadProgress((e.loaded / e.total) * 100);
            }
        };
        reader.onloadend = () => {
            setBannerImagePreview(reader.result);
            setFormData(prev => ({ ...prev, bannerImage: reader.result }));
            setBannerUploadProgress(100);
            setTimeout(() => setBannerUploadProgress(0), 1000);
        };
        reader.onerror = () => {
            showSnackbar('Görsel yüklenirken hata oluştu', 'error');
            setBannerUploadProgress(0);
        };
        reader.readAsDataURL(file);
    };

    const handleBannerImageChange = (e) => {
        const file = e.target.files[0];
        if (file && validateImage(file)) {
            processBannerImage(file);
        }
    };

    const handleBannerDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setIsBannerDragging(true); };
    const handleBannerDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsBannerDragging(false); };
    const handleBannerDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
    const handleBannerDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsBannerDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0 && validateImage(files[0])) {
            processBannerImage(files[0]);
        }
    };
    const handleRemoveBannerImage = () => {
        setBannerImageFile(null);
        setBannerImagePreview(null);
        setFormData(prev => ({ ...prev, bannerImage: '' }));
        setBannerUploadProgress(0);
    };

    // ========== LOAD DATA ==========
    const loadArtists = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: page + 1,
                limit: rowsPerPage,
                search: searchQuery || undefined,
                claimStatus: statusFilter || undefined
            };

            const response = await axios.get(`${API_BASE_URL}/artists`, { params });

            if (response.data.success) {
                setArtists(response.data.data.artists || []);
                setTotalArtists(response.data.data.pagination?.total || 0);

                const allArtists = response.data.data.artists || [];
                setStats({
                    total: response.data.data.pagination?.total || allArtists.length,
                    claimed: allArtists.filter(a => a.claimStatus === 'claimed').length,
                    unclaimed: allArtists.filter(a => a.claimStatus === 'unclaimed').length,
                    pending: allArtists.filter(a => a.claimStatus === 'pending').length
                });
            }
        } catch (error) {
            console.error('Artists yüklenirken hata:', error);
            showSnackbar('Artistler yüklenirken hata oluştu', 'error');
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage, searchQuery, statusFilter]);

    const loadPendingClaims = useCallback(async () => {
        setClaimsLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/artists/claims/pending`);
            if (response.data.success) {
                setPendingClaims(response.data.data.claims || []);
            }
        } catch (error) {
            console.error('Claim başvuruları yüklenirken hata:', error);
        } finally {
            setClaimsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadArtists();
    }, [loadArtists]);

    useEffect(() => {
        if (tabValue === 1) {
            loadPendingClaims();
        }
    }, [tabValue, loadPendingClaims]);

    // ========== HANDLERS ==========
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        setSearchParams(newValue === 1 ? { tab: 'claims' } : {});
    };

    const handleOpenDialog = (artist = null) => {
        if (artist) {
            setEditingArtist(artist);
            setFormData({
                name: artist.name || '',
                bio: artist.bio || '',
                profileImage: artist.profileImage || '',
                bannerImage: artist.bannerImage || '',
                socialLinks: {
                    spotify: artist.socialLinks?.spotify || '',
                    instagram: artist.socialLinks?.instagram || '',
                    youtube: artist.socialLinks?.youtube || '',
                    twitter: artist.socialLinks?.twitter || '',
                    soundcloud: artist.socialLinks?.soundcloud || '',
                    beatport: artist.socialLinks?.beatport || '',
                    website: artist.socialLinks?.website || ''
                }
            });
            // Set previews for existing images
            setProfileImagePreview(artist.profileImage || null);
            setBannerImagePreview(artist.bannerImage || null);
        } else {
            setEditingArtist(null);
            setFormData({
                name: '',
                bio: '',
                profileImage: '',
                bannerImage: '',
                socialLinks: {
                    spotify: '',
                    instagram: '',
                    youtube: '',
                    twitter: '',
                    soundcloud: '',
                    beatport: '',
                    website: ''
                }
            });
            setProfileImagePreview(null);
            setBannerImagePreview(null);
        }
        setProfileImageFile(null);
        setBannerImageFile(null);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingArtist(null);
        setProfileImagePreview(null);
        setBannerImagePreview(null);
        setProfileImageFile(null);
        setBannerImageFile(null);
    };

    const handleFormChange = (field, value) => {
        if (field.startsWith('socialLinks.')) {
            const socialField = field.replace('socialLinks.', '');
            setFormData(prev => ({
                ...prev,
                socialLinks: { ...prev.socialLinks, [socialField]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            showSnackbar('Artist adı zorunludur', 'error');
            return;
        }

        try {
            if (editingArtist) {
                await axios.put(`${API_BASE_URL}/artists/${editingArtist._id}`, formData);
                showSnackbar('Artist başarıyla güncellendi', 'success');
            } else {
                await axios.post(`${API_BASE_URL}/artists`, formData);
                showSnackbar('Artist başarıyla oluşturuldu', 'success');
            }
            handleCloseDialog();
            loadArtists();
        } catch (error) {
            console.error('Artist kaydedilirken hata:', error);
            showSnackbar(error.response?.data?.message || 'İşlem sırasında hata oluştu', 'error');
        }
    };

    const handleDeleteClick = (artist) => {
        setArtistToDelete(artist);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!artistToDelete) return;

        try {
            await axios.delete(`${API_BASE_URL}/artists/${artistToDelete._id}`);
            showSnackbar('Artist başarıyla silindi', 'success');
            loadArtists();
        } catch (error) {
            console.error('Artist silinirken hata:', error);
            showSnackbar('Artist silinirken hata oluştu', 'error');
        } finally {
            setDeleteConfirmOpen(false);
            setArtistToDelete(null);
        }
    };

    const handleClaimAction = (claim, action) => {
        setClaimActionDialog({ open: true, claim, action });
    };

    const confirmClaimAction = async () => {
        const { claim, action } = claimActionDialog;
        if (!claim) return;

        try {
            if (action === 'approve') {
                await axios.put(`${API_BASE_URL}/artists/claims/${claim._id}/approve`);
                showSnackbar('Claim başvurusu onaylandı', 'success');
            } else {
                if (!rejectionReason.trim()) {
                    showSnackbar('Red sebebi zorunludur', 'error');
                    return;
                }
                await axios.put(`${API_BASE_URL}/artists/claims/${claim._id}/reject`, { rejectionReason });
                showSnackbar('Claim başvurusu reddedildi', 'success');
            }
            setClaimActionDialog({ open: false, claim: null, action: null });
            setRejectionReason('');
            loadPendingClaims();
            loadArtists();
        } catch (error) {
            console.error('Claim işlemi sırasında hata:', error);
            showSnackbar('İşlem sırasında hata oluştu', 'error');
        }
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const getStatusChip = (status) => {
        switch (status) {
            case 'claimed':
                return <Chip icon={<VerifiedIcon />} label="Claimed" size="small" sx={{ bgcolor: '#10B981', color: '#fff' }} />;
            case 'pending':
                return <Chip icon={<ClaimIcon />} label="Pending" size="small" sx={{ bgcolor: '#F59E0B', color: '#fff' }} />;
            default:
                return <Chip icon={<PersonIcon />} label="Unclaimed" size="small" sx={{ bgcolor: '#6B7280', color: '#fff' }} />;
        }
    };

    return (
        <Box sx={{ p: 3, bgcolor: '#fafafa', minHeight: '100vh' }}>
            {/* Header */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ArtistIcon sx={{ color: '#7C3AED' }} />
                        Artist Yönetimi
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Sanatçı profillerini ve claim başvurularını yönetin
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                    sx={{ bgcolor: '#7C3AED', '&:hover': { bgcolor: '#6D28D9' } }}
                >
                    Yeni Artist Ekle
                </Button>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={3}>
                    <Card sx={{ bgcolor: '#fff', border: '1px solid #e0e0e0' }}>
                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                            <Typography variant="h4" fontWeight="bold" color="#7C3AED">{stats.total}</Typography>
                            <Typography variant="caption" color="text.secondary">Toplam Artist</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                    <Card sx={{ bgcolor: '#fff', border: '1px solid #e0e0e0' }}>
                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                            <Typography variant="h4" fontWeight="bold" color="#10B981">{stats.claimed}</Typography>
                            <Typography variant="caption" color="text.secondary">Claimed</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                    <Card sx={{ bgcolor: '#fff', border: '1px solid #e0e0e0' }}>
                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                            <Typography variant="h4" fontWeight="bold" color="#6B7280">{stats.unclaimed}</Typography>
                            <Typography variant="caption" color="text.secondary">Unclaimed</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                    <Card
                        sx={{
                            bgcolor: pendingClaims.length > 0 ? '#FEF3C7' : '#fff',
                            border: '1px solid #e0e0e0',
                            cursor: pendingClaims.length > 0 ? 'pointer' : 'default'
                        }}
                        onClick={() => pendingClaims.length > 0 && setTabValue(1)}
                    >
                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                            <Badge badgeContent={pendingClaims.length} color="warning">
                                <Typography variant="h4" fontWeight="bold" color="#F59E0B">{pendingClaims.length}</Typography>
                            </Badge>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                Bekleyen Claim
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Tabs */}
            <Paper sx={{ bgcolor: '#fff', border: '1px solid #e0e0e0' }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    sx={{
                        borderBottom: '1px solid #e0e0e0',
                        '& .MuiTab-root': { fontWeight: 'bold' },
                        '& .Mui-selected': { color: '#7C3AED' },
                        '& .MuiTabs-indicator': { bgcolor: '#7C3AED' }
                    }}
                >
                    <Tab icon={<ArtistIcon />} iconPosition="start" label="Artistler" />
                    <Tab
                        icon={<Badge badgeContent={pendingClaims.length} color="warning"><ClaimIcon /></Badge>}
                        iconPosition="start"
                        label="Claim Başvuruları"
                    />
                </Tabs>

                {/* Tab 0: Artists List */}
                <TabPanel value={tabValue} index={0}>
                    {/* Search & Filter */}
                    <Box sx={{ px: 3, pb: 2 }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <TextField
                                placeholder="Artist ara..."
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
                            <IconButton onClick={loadArtists} disabled={loading}>
                                <RefreshIcon sx={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                            </IconButton>
                        </Stack>

                        <Collapse in={showFilters}>
                            <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={4}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Claim Durumu</InputLabel>
                                            <Select value={statusFilter} label="Claim Durumu" onChange={(e) => setStatusFilter(e.target.value)}>
                                                <MenuItem value="">Tümü</MenuItem>
                                                <MenuItem value="unclaimed">Unclaimed</MenuItem>
                                                <MenuItem value="pending">Pending</MenuItem>
                                                <MenuItem value="claimed">Claimed</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Button variant="outlined" onClick={() => { setStatusFilter(''); setSearchQuery(''); }}>
                                            Filtreleri Temizle
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Collapse>
                    </Box>

                    {/* Artists Table */}
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Artist</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Slug</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Durum</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Takipçi</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Sosyal Medya</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }} align="right">İşlemler</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                            <CircularProgress size={40} sx={{ color: '#7C3AED' }} />
                                        </TableCell>
                                    </TableRow>
                                ) : artists.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                            <Typography color="text.secondary">Henüz artist eklenmemiş</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    artists.map((artist) => (
                                        <TableRow key={artist._id} hover>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Avatar src={artist.profileImage} sx={{ width: 48, height: 48, bgcolor: '#7C3AED' }}>
                                                        {artist.name?.charAt(0)}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography fontWeight="bold">
                                                            {artist.name}
                                                            {artist.isVerified && <VerifiedIcon sx={{ ml: 0.5, fontSize: 16, color: '#10B981' }} />}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {artist.bio ? (artist.bio.length > 50 ? artist.bio.substring(0, 50) + '...' : artist.bio) : 'Bio yok'}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={artist.slug} size="small" variant="outlined" sx={{ fontFamily: 'monospace' }} />
                                            </TableCell>
                                            <TableCell>{getStatusChip(artist.claimStatus)}</TableCell>
                                            <TableCell>
                                                <Chip icon={<PersonIcon />} label={artist.followers?.length || 0} size="small" variant="outlined" />
                                            </TableCell>
                                            <TableCell>
                                                <Stack direction="row" spacing={0.5}>
                                                    {artist.socialLinks?.spotify && (
                                                        <Tooltip title="Spotify">
                                                            <IconButton size="small" href={artist.socialLinks.spotify} target="_blank">
                                                                <MusicNoteIcon sx={{ fontSize: 18, color: '#1DB954' }} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                    {artist.socialLinks?.instagram && (
                                                        <Tooltip title="Instagram">
                                                            <IconButton size="small" href={artist.socialLinks.instagram} target="_blank">
                                                                <InstagramIcon sx={{ fontSize: 18, color: '#E4405F' }} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                    {artist.socialLinks?.youtube && (
                                                        <Tooltip title="YouTube">
                                                            <IconButton size="small" href={artist.socialLinks.youtube} target="_blank">
                                                                <YouTubeIcon sx={{ fontSize: 18, color: '#FF0000' }} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                    {artist.socialLinks?.website && (
                                                        <Tooltip title="Website">
                                                            <IconButton size="small" href={artist.socialLinks.website} target="_blank">
                                                                <WebsiteIcon sx={{ fontSize: 18 }} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                </Stack>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                    <Tooltip title="Düzenle">
                                                        <IconButton size="small" onClick={() => handleOpenDialog(artist)} sx={{ color: '#7C3AED' }}>
                                                            <EditIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Sil">
                                                        <IconButton size="small" onClick={() => handleDeleteClick(artist)} sx={{ color: '#EF4444' }}>
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
                        count={totalArtists}
                        page={page}
                        onPageChange={(e, newPage) => setPage(newPage)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        labelRowsPerPage="Sayfa başına:"
                    />
                </TabPanel>

                {/* Tab 1: Claim Requests */}
                <TabPanel value={tabValue} index={1}>
                    <Box sx={{ px: 3 }}>
                        {claimsLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                <CircularProgress sx={{ color: '#7C3AED' }} />
                            </Box>
                        ) : pendingClaims.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 6 }}>
                                <ClaimIcon sx={{ fontSize: 64, color: '#d0d0d0', mb: 2 }} />
                                <Typography variant="h6" color="text.secondary">Bekleyen claim başvurusu yok</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Kullanıcılar artist profillerini sahiplenmek için başvurduğunda burada görünecek
                                </Typography>
                            </Box>
                        ) : (
                            <Grid container spacing={3}>
                                {pendingClaims.map((claim) => (
                                    <Grid item xs={12} md={6} key={claim._id}>
                                        <Card sx={{ border: '2px solid #F59E0B', borderRadius: 2 }}>
                                            <CardContent>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                                    <Chip icon={<ClaimIcon />} label="Bekleyen Başvuru" size="small" sx={{ bgcolor: '#FEF3C7', color: '#92400E' }} />
                                                    <Typography variant="caption" color="text.secondary">
                                                        {new Date(claim.createdAt).toLocaleDateString('tr-TR')}
                                                    </Typography>
                                                </Box>

                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                                                    <Avatar src={claim.artistId?.profileImage} sx={{ width: 56, height: 56, bgcolor: '#7C3AED' }}>
                                                        {claim.artistId?.name?.charAt(0)}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="subtitle1" fontWeight="bold">{claim.artistId?.name}</Typography>
                                                        <Typography variant="caption" color="text.secondary">Artist Profili</Typography>
                                                    </Box>
                                                </Box>

                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, p: 2, bgcolor: '#E0E7FF', borderRadius: 1 }}>
                                                    <Avatar src={claim.userId?.profileImage} sx={{ width: 48, height: 48, bgcolor: '#4F46E5' }}>
                                                        {claim.userId?.firstName?.charAt(0)}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="subtitle2" fontWeight="bold">
                                                            {claim.userId?.firstName} {claim.userId?.lastName}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            @{claim.userId?.username} • {claim.userId?.email}
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                                        <strong>Doğrulama Yöntemi:</strong> {claim.verificationMethod}
                                                    </Typography>
                                                    {claim.notes && (
                                                        <Typography variant="body2" color="text.secondary">
                                                            <strong>Not:</strong> {claim.notes}
                                                        </Typography>
                                                    )}
                                                    {claim.verificationLinks?.length > 0 && (
                                                        <Box sx={{ mt: 1 }}>
                                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                                <strong>Doğrulama Linkleri:</strong>
                                                            </Typography>
                                                            {claim.verificationLinks.map((link, idx) => (
                                                                <Chip key={idx} label={link.platform} size="small" component="a" href={link.url} target="_blank" clickable sx={{ mr: 0.5, mb: 0.5 }} />
                                                            ))}
                                                        </Box>
                                                    )}
                                                </Box>

                                                <Divider sx={{ my: 2 }} />

                                                <Stack direction="row" spacing={2}>
                                                    <Button variant="contained" startIcon={<CheckIcon />} fullWidth onClick={() => handleClaimAction(claim, 'approve')} sx={{ bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' } }}>
                                                        Onayla
                                                    </Button>
                                                    <Button variant="outlined" startIcon={<CloseIcon />} fullWidth onClick={() => handleClaimAction(claim, 'reject')} sx={{ borderColor: '#EF4444', color: '#EF4444' }}>
                                                        Reddet
                                                    </Button>
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

            {/* ========== ADD/EDIT ARTIST DIALOG WITH DRAG & DROP ========== */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
                <DialogTitle sx={{ bgcolor: '#7C3AED', color: '#fff' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {editingArtist ? <EditIcon /> : <PersonAddIcon />}
                        {editingArtist ? 'Artist Düzenle' : 'Yeni Artist Ekle'}
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Grid container spacing={3}>
                        {/* Basic Info */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Temel Bilgiler</Typography>
                            <Divider sx={{ mb: 2 }} />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Artist Adı *"
                                value={formData.name}
                                onChange={(e) => handleFormChange('name', e.target.value)}
                                placeholder="Örn: Murat Boz"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Bio"
                                value={formData.bio}
                                onChange={(e) => handleFormChange('bio', e.target.value)}
                                placeholder="Artist hakkında kısa açıklama..."
                                multiline
                                rows={3}
                            />
                        </Grid>

                        {/* ========== IMAGES WITH DRAG & DROP ========== */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                                Görseller (Sürükle & Bırak)
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                        </Grid>

                        {/* Profile Image */}
                        <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary" gutterBottom sx={{ display: 'block', mb: 1 }}>
                                Profil Resmi (1:1)
                            </Typography>
                            <DragDropImageUpload
                                preview={profileImagePreview}
                                isDragging={isProfileDragging}
                                uploadProgress={profileUploadProgress}
                                onDragEnter={handleProfileDragEnter}
                                onDragLeave={handleProfileDragLeave}
                                onDragOver={handleProfileDragOver}
                                onDrop={handleProfileDrop}
                                onFileSelect={handleProfileImageChange}
                                onRemove={handleRemoveProfileImage}
                                inputId="profile-image-upload"
                                label="Profil Resmi Yükle"
                                icon={<ArtistIcon sx={{ fontSize: 48, color: '#7C3AED' }} />}
                                height={180}
                            />
                            {!profileImagePreview && (
                                <TextField
                                    fullWidth
                                    label="veya URL girin"
                                    value={formData.profileImage}
                                    onChange={(e) => {
                                        handleFormChange('profileImage', e.target.value);
                                        if (e.target.value) setProfileImagePreview(e.target.value);
                                    }}
                                    placeholder="https://..."
                                    size="small"
                                    sx={{ mt: 1 }}
                                />
                            )}
                        </Grid>

                        {/* Banner Image */}
                        <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary" gutterBottom sx={{ display: 'block', mb: 1 }}>
                                Banner Resmi (3:1)
                            </Typography>
                            <DragDropImageUpload
                                preview={bannerImagePreview}
                                isDragging={isBannerDragging}
                                uploadProgress={bannerUploadProgress}
                                onDragEnter={handleBannerDragEnter}
                                onDragLeave={handleBannerDragLeave}
                                onDragOver={handleBannerDragOver}
                                onDrop={handleBannerDrop}
                                onFileSelect={handleBannerImageChange}
                                onRemove={handleRemoveBannerImage}
                                inputId="banner-image-upload"
                                label="Banner Resmi Yükle"
                                icon={<BannerIcon sx={{ fontSize: 48, color: '#7C3AED' }} />}
                                height={180}
                            />
                            {!bannerImagePreview && (
                                <TextField
                                    fullWidth
                                    label="veya URL girin"
                                    value={formData.bannerImage}
                                    onChange={(e) => {
                                        handleFormChange('bannerImage', e.target.value);
                                        if (e.target.value) setBannerImagePreview(e.target.value);
                                    }}
                                    placeholder="https://..."
                                    size="small"
                                    sx={{ mt: 1 }}
                                />
                            )}
                        </Grid>

                        {/* Social Links */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                                Sosyal Medya Linkleri
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Spotify"
                                value={formData.socialLinks.spotify}
                                onChange={(e) => handleFormChange('socialLinks.spotify', e.target.value)}
                                placeholder="https://open.spotify.com/artist/..."
                                InputProps={{ startAdornment: <InputAdornment position="start"><MusicNoteIcon sx={{ color: '#1DB954' }} /></InputAdornment> }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Instagram"
                                value={formData.socialLinks.instagram}
                                onChange={(e) => handleFormChange('socialLinks.instagram', e.target.value)}
                                placeholder="https://instagram.com/..."
                                InputProps={{ startAdornment: <InputAdornment position="start"><InstagramIcon sx={{ color: '#E4405F' }} /></InputAdornment> }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="YouTube"
                                value={formData.socialLinks.youtube}
                                onChange={(e) => handleFormChange('socialLinks.youtube', e.target.value)}
                                placeholder="https://youtube.com/..."
                                InputProps={{ startAdornment: <InputAdornment position="start"><YouTubeIcon sx={{ color: '#FF0000' }} /></InputAdornment> }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Twitter"
                                value={formData.socialLinks.twitter}
                                onChange={(e) => handleFormChange('socialLinks.twitter', e.target.value)}
                                placeholder="https://twitter.com/..."
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="SoundCloud"
                                value={formData.socialLinks.soundcloud}
                                onChange={(e) => handleFormChange('socialLinks.soundcloud', e.target.value)}
                                placeholder="https://soundcloud.com/..."
                                InputProps={{ startAdornment: <InputAdornment position="start"><MusicNoteIcon sx={{ color: '#FF8800' }} /></InputAdornment> }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Beatport"
                                value={formData.socialLinks.beatport}
                                onChange={(e) => handleFormChange('socialLinks.beatport', e.target.value)}
                                placeholder="https://beatport.com/artist/..."
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Website"
                                value={formData.socialLinks.website}
                                onChange={(e) => handleFormChange('socialLinks.website', e.target.value)}
                                placeholder="https://..."
                                InputProps={{ startAdornment: <InputAdornment position="start"><WebsiteIcon /></InputAdornment> }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                    <Button onClick={handleCloseDialog} color="inherit">İptal</Button>
                    <Button variant="contained" onClick={handleSubmit} sx={{ bgcolor: '#7C3AED', '&:hover': { bgcolor: '#6D28D9' } }}>
                        {editingArtist ? 'Güncelle' : 'Oluştur'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
                <DialogTitle>Artist Sil</DialogTitle>
                <DialogContent>
                    <Typography><strong>{artistToDelete?.name}</strong> adlı artisti silmek istediğinize emin misiniz?</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Bu işlem geri alınamaz. Artist'e bağlı müzikler etkilenmeyecektir.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirmOpen(false)}>İptal</Button>
                    <Button variant="contained" color="error" onClick={handleDeleteConfirm}>Sil</Button>
                </DialogActions>
            </Dialog>

            {/* Claim Action Dialog */}
            <Dialog open={claimActionDialog.open} onClose={() => setClaimActionDialog({ open: false, claim: null, action: null })} maxWidth="sm" fullWidth>
                <DialogTitle>{claimActionDialog.action === 'approve' ? '✅ Claim Onayla' : '❌ Claim Reddet'}</DialogTitle>
                <DialogContent>
                    {claimActionDialog.claim && (
                        <Box>
                            <Typography gutterBottom>
                                <strong>{claimActionDialog.claim.userId?.firstName} {claimActionDialog.claim.userId?.lastName}</strong> kullanıcısının{' '}
                                <strong>{claimActionDialog.claim.artistId?.name}</strong> artist profilini sahiplenme başvurusunu{' '}
                                {claimActionDialog.action === 'approve' ? 'onaylamak' : 'reddetmek'} istediğinize emin misiniz?
                            </Typography>

                            {claimActionDialog.action === 'reject' && (
                                <TextField
                                    fullWidth
                                    label="Red Sebebi *"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Başvurunun neden reddedildiğini açıklayın..."
                                    multiline
                                    rows={3}
                                    sx={{ mt: 2 }}
                                />
                            )}

                            {claimActionDialog.action === 'approve' && (
                                <Alert severity="info" sx={{ mt: 2 }}>
                                    Onaylandığında kullanıcı bu artist profilinin sahibi olacak ve profili düzenleyebilecek.
                                </Alert>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setClaimActionDialog({ open: false, claim: null, action: null }); setRejectionReason(''); }}>İptal</Button>
                    <Button
                        variant="contained"
                        onClick={confirmClaimAction}
                        sx={{
                            bgcolor: claimActionDialog.action === 'approve' ? '#10B981' : '#EF4444',
                            '&:hover': { bgcolor: claimActionDialog.action === 'approve' ? '#059669' : '#DC2626' }
                        }}
                    >
                        {claimActionDialog.action === 'approve' ? 'Onayla' : 'Reddet'}
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
};

export default ArtistManagement;