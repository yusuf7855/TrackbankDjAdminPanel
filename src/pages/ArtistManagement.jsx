// src/pages/ArtistManagement.jsx - ARTİST & KULLANICI YÖNETİMİ (TAM VERSİYON)
// ⭐ DÜZELTME: API endpoint /api/admin/users/:id olarak güncellendi
//
// ÖZELLİKLER:
// - Artist bilgileri yönetimi (isim, slug, bio, resimler, sosyal medya)
// - Bağlı kullanıcı hesabı yönetimi (email, telefon, username, şifre, rozet)
// - Claim başvuruları yönetimi
// - Drag & drop resim yükleme (Base64)

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Box, Paper, Typography, Button, TextField, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, TablePagination, IconButton, Avatar, Chip, Dialog, DialogTitle,
    DialogContent, DialogActions, Grid, FormControl, InputLabel, Select, MenuItem, Alert,
    Snackbar, CircularProgress, Tabs, Tab, Tooltip, Stack, Divider, Card, CardContent,
    InputAdornment, Badge, Collapse, CardMedia, Switch, FormControlLabel, LinearProgress,
    Accordion, AccordionSummary, AccordionDetails
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
    Phone as PhoneIcon, SwapHoriz as SwapIcon, Info as InfoIcon, Lock as LockIcon,
    Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon, Send as SendIcon,
    PersonOff as PersonOffIcon, Key as KeyIcon, ExpandMore as ExpandMoreIcon,
    Badge as BadgeIcon, AlternateEmail as TagIcon, Security as SecurityIcon,
    ManageAccounts as ManageAccountsIcon, Save as SaveIcon
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

// Badge seçenekleri
const BADGE_OPTIONS = [
    { value: 'none', label: 'Yok', color: '#6B7280' },
    { value: 'trackbang', label: 'Trackbang', color: '#7C3AED' },
    { value: 'premium', label: 'Premium', color: '#F59E0B' },
    { value: 'standard', label: 'Standard', color: '#3B82F6' },
    { value: 'verified', label: 'Verified', color: '#10B981' },
];

const DragDropImageUpload = ({ preview, isDragging, uploadProgress, onDragEnter, onDragLeave, onDragOver, onDrop, onFileSelect, onRemove, inputId, label, icon, height = 200 }) => {
    const imageSource = preview || '';

    return (
        <Box onDragEnter={onDragEnter} onDragLeave={onDragLeave} onDragOver={onDragOver} onDrop={onDrop}
             onClick={() => !preview && document.getElementById(inputId).click()}
             sx={{ border: '2px dashed', borderColor: isDragging ? '#7C3AED' : '#e0e0e0', borderRadius: 2, p: 2,
                 textAlign: 'center', cursor: preview ? 'default' : 'pointer',
                 bgcolor: isDragging ? '#F3E8FF' : preview ? '#f5f5f5' : 'transparent',
                 transition: 'all 0.2s', height, display: 'flex', flexDirection: 'column',
                 alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            {preview ? (
                <>
                    <CardMedia
                        component="img"
                        image={imageSource}
                        sx={{ maxHeight: height - 40, objectFit: 'contain', borderRadius: 1 }}
                        onError={(e) => {
                            console.error('Image preview error');
                            e.target.style.display = 'none';
                        }}
                    />
                    <IconButton onClick={(e) => { e.stopPropagation(); onRemove(); }}
                                sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}>
                        <ClearIcon fontSize="small" />
                    </IconButton>
                    {preview.startsWith('data:image') && (
                        <Chip
                            label="Base64"
                            size="small"
                            sx={{ position: 'absolute', bottom: 8, left: 8, bgcolor: '#7C3AED', color: 'white', fontSize: '10px' }}
                        />
                    )}
                </>
            ) : (
                <>
                    {icon}
                    <Typography variant="body2" color="text.secondary" mt={1}>{label}</Typography>
                    <Typography variant="caption" color="text.secondary">veya tıklayarak seçin</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                        (Max 5MB - JPEG, PNG, GIF, WEBP)
                    </Typography>
                </>
            )}
            <input id={inputId} type="file" accept="image/jpeg,image/png,image/gif,image/webp" hidden onChange={onFileSelect} />
            {uploadProgress > 0 && uploadProgress < 100 && (
                <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                    <LinearProgress variant="determinate" value={uploadProgress} />
                </Box>
            )}
        </Box>
    );
};

const ArtistManagement = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialTab = searchParams.get('tab') === 'claims' ? 1 : 0;

    // State
    const [tabValue, setTabValue] = useState(initialTab);
    const [artists, setArtists] = useState([]);
    const [pendingClaims, setPendingClaims] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Dialog states
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState('add');
    const [selectedArtist, setSelectedArtist] = useState(null);
    const [claimActionDialog, setClaimActionDialog] = useState({ open: false, claim: null, action: null });
    const [rejectionReason, setRejectionReason] = useState('');

    // Claim approval states
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [approvalLoading, setApprovalLoading] = useState(false);
    const [approvalResult, setApprovalResult] = useState(null);

    // Form data - Artist bilgileri
    const [formData, setFormData] = useState({
        name: '', slug: '', bio: '', profileImage: '', bannerImage: '',
        socialLinks: { instagram: '', youtube: '', spotify: '', website: '' },
        createUserAccount: true, badge: 'trackbang', keepUnclaimed: true
    });

    // ⭐ YENİ: Kullanıcı hesap bilgileri
    const [userData, setUserData] = useState({
        email: '',
        phone: '',
        username: '',
        displayName: '',
        firstName: '',
        lastName: '',
        password: '',
        badge: 'trackbang',
        isActive: true
    });
    const [showUserPassword, setShowUserPassword] = useState(false);
    const [userDataExpanded, setUserDataExpanded] = useState(false);
    const [savingUser, setSavingUser] = useState(false);

    // Drag states
    const [profileDragging, setProfileDragging] = useState(false);
    const [bannerDragging, setBannerDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Token
    const getAuthHeaders = () => {
        const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    // Snackbar
    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    // Load data
    const loadArtists = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append('search', searchQuery);
            if (filterStatus !== 'all') params.append('claimStatus', filterStatus);

            const response = await axios.get(`${API_BASE_URL}/artists?${params}`, getAuthHeaders());
            setArtists(response.data.data?.artists || []);
        } catch (error) {
            showSnackbar('Artistler yüklenemedi', 'error');
        } finally {
            setLoading(false);
        }
    }, [searchQuery, filterStatus]);

    const loadPendingClaims = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/artists/claims/pending`, getAuthHeaders());
            setPendingClaims(response.data.data?.claims || []);
        } catch (error) {
            console.error('Claims yüklenemedi:', error);
        }
    }, []);

    useEffect(() => {
        loadArtists();
        loadPendingClaims();
    }, [loadArtists, loadPendingClaims]);

    // Tab change
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        setSearchParams(newValue === 1 ? { tab: 'claims' } : {});
    };

    // Dialog handlers
    const handleOpenDialog = (artist = null) => {
        if (artist) {
            setDialogMode('edit');
            setSelectedArtist(artist);
            setFormData({
                name: artist.name || '',
                slug: artist.slug || '',
                bio: artist.bio || '',
                profileImage: artist.profileImage || '',
                bannerImage: artist.bannerImage || '',
                socialLinks: artist.socialLinks || { instagram: '', youtube: '', spotify: '', website: '' },
                createUserAccount: false,
                badge: 'trackbang',
                keepUnclaimed: true
            });

            // ⭐ Bağlı kullanıcı bilgilerini yükle
            const linkedUser = artist.claimedBy || artist.placeholderUser;
            if (linkedUser) {
                setUserData({
                    email: linkedUser.email || '',
                    phone: linkedUser.phone || '',
                    username: linkedUser.username || '',
                    displayName: linkedUser.displayName || '',
                    firstName: linkedUser.firstName || '',
                    lastName: linkedUser.lastName || '',
                    password: '', // Şifre boş - değiştirilmezse güncellenmez
                    badge: linkedUser.badge || 'trackbang',
                    isActive: linkedUser.isActive !== false
                });
                setUserDataExpanded(true);
            } else {
                setUserData({
                    email: '', phone: '', username: '', displayName: '',
                    firstName: '', lastName: '', password: '', badge: 'trackbang', isActive: true
                });
                setUserDataExpanded(false);
            }
        } else {
            setDialogMode('add');
            setSelectedArtist(null);
            setFormData({
                name: '', slug: '', bio: '', profileImage: '', bannerImage: '',
                socialLinks: { instagram: '', youtube: '', spotify: '', website: '' },
                createUserAccount: true, badge: 'trackbang', keepUnclaimed: true
            });
            setUserData({
                email: '', phone: '', username: '', displayName: '',
                firstName: '', lastName: '', password: '', badge: 'trackbang', isActive: true
            });
            setUserDataExpanded(false);
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedArtist(null);
        setUploadProgress(0);
        setShowUserPassword(false);
    };

    // Form change
    const handleFormChange = (field, value) => {
        if (field.startsWith('socialLinks.')) {
            const key = field.split('.')[1];
            setFormData(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, [key]: value } }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    // ⭐ User data change
    const handleUserDataChange = (field, value) => {
        setUserData(prev => ({ ...prev, [field]: value }));
    };

    // Auto slug
    const generateSlug = (name) => {
        return name.toLowerCase()
            .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
            .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    };

    // Rastgele şifre oluştur
    const generateRandomPassword = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    };

    // BASE64 IMAGE UPLOAD
    const handleImageUpload = async (file, type) => {
        try {
            const MAX_FILE_SIZE = 5 * 1024 * 1024;
            if (file.size > MAX_FILE_SIZE) {
                showSnackbar(`Dosya çok büyük! Maksimum 5MB. (${(file.size / 1024 / 1024).toFixed(2)}MB)`, 'error');
                return;
            }

            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                showSnackbar('Desteklenmeyen dosya formatı! (JPEG, PNG, GIF, WEBP)', 'error');
                return;
            }

            setUploadProgress(10);

            const reader = new FileReader();
            reader.onloadstart = () => setUploadProgress(30);
            reader.onprogress = (event) => {
                if (event.lengthComputable) {
                    const progress = Math.round((event.loaded * 100) / event.total);
                    setUploadProgress(Math.min(progress, 90));
                }
            };
            reader.onload = () => {
                const base64String = reader.result;
                const base64SizeKB = (base64String.length * 0.75) / 1024;
                handleFormChange(type, base64String);
                setUploadProgress(100);
                showSnackbar(`Görsel yüklendi (${base64SizeKB.toFixed(0)}KB)`);
                setTimeout(() => setUploadProgress(0), 500);
            };
            reader.onerror = () => {
                showSnackbar('Görsel okunamadı', 'error');
                setUploadProgress(0);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            showSnackbar('Görsel yüklenemedi', 'error');
            setUploadProgress(0);
        }
    };

    // Drag handlers
    const createDragHandlers = (setDragging, type) => ({
        onDragEnter: (e) => { e.preventDefault(); setDragging(true); },
        onDragLeave: (e) => { e.preventDefault(); setDragging(false); },
        onDragOver: (e) => e.preventDefault(),
        onDrop: (e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) handleImageUpload(file, type);
        },
        onFileSelect: (e) => {
            const file = e.target.files[0];
            if (file) handleImageUpload(file, type);
        },
        onRemove: () => handleFormChange(type, '')
    });

    // ⭐ Save artist + user data
    const handleSaveArtist = async () => {
        if (!formData.name || !formData.slug) {
            showSnackbar('İsim ve slug zorunludur', 'error');
            return;
        }

        try {
            let artistId = selectedArtist?._id;

            // Artist kaydet/güncelle
            if (dialogMode === 'add') {
                const response = await axios.post(`${API_BASE_URL}/artists`, formData, getAuthHeaders());
                artistId = response.data.data?.artist?._id;
                showSnackbar('Artist başarıyla eklendi');
            } else {
                await axios.put(`${API_BASE_URL}/artists/${artistId}`, formData, getAuthHeaders());
                showSnackbar('Artist başarıyla güncellendi');
            }

            // ⭐ Kullanıcı bilgilerini güncelle (eğer düzenleme modundaysa ve bağlı kullanıcı varsa)
            if (dialogMode === 'edit' && selectedArtist) {
                const linkedUser = selectedArtist.claimedBy || selectedArtist.placeholderUser;
                if (linkedUser && linkedUser._id) {
                    await handleSaveUserData(linkedUser._id, false); // Dialog kapatma yok
                }
            }

            handleCloseDialog();
            loadArtists();
        } catch (error) {
            showSnackbar(error.response?.data?.message || 'İşlem başarısız', 'error');
        }
    };


    const handleSaveUserData = async (userId, showMessage = true) => {
        if (!userId) {
            showSnackbar('Bağlı kullanıcı bulunamadı', 'error');
            return;
        }

        setSavingUser(true);
        try {
            const updateData = {
                email: userData.email,
                phone: userData.phone,
                username: userData.username,
                displayName: userData.displayName,
                firstName: userData.firstName,
                lastName: userData.lastName,
                badge: userData.badge,
                isActive: userData.isActive
            };

            // Şifre varsa ekle
            if (userData.password && userData.password.length >= 6) {
                updateData.password = userData.password;
            }

            // ⭐⭐⭐ DÜZELTME: Doğru endpoint kullanılıyor
            // Eski: /api/users/:id/admin-update (YANLIŞ - bu route yok)
            // Yeni: /api/admin/users/:id (DOĞRU - adminRoutes.js'de tanımlı)
            await axios.put(`${API_BASE_URL}/admin/users/${userId}`, updateData, getAuthHeaders());

            if (showMessage) {
                showSnackbar('Kullanıcı bilgileri güncellendi');
            }

            // Şifreyi temizle
            setUserData(prev => ({ ...prev, password: '' }));
            loadArtists();
        } catch (error) {
            showSnackbar(error.response?.data?.message || 'Kullanıcı güncellenemedi', 'error');
        } finally {
            setSavingUser(false);
        }
    };

    // Delete artist
    const handleDeleteArtist = async (id) => {
        if (!window.confirm('Bu artisti silmek istediğinize emin misiniz?')) return;

        try {
            await axios.delete(`${API_BASE_URL}/artists/${id}`, getAuthHeaders());
            showSnackbar('Artist silindi');
            loadArtists();
        } catch (error) {
            showSnackbar('Silme işlemi başarısız', 'error');
        }
    };

    // Claim action
    const handleClaimAction = async () => {
        const { claim, action } = claimActionDialog;

        try {
            setApprovalLoading(true);
            setApprovalResult(null);

            if (action === 'approve') {
                const requestData = {
                    grantBadge: 'trackbang',
                    newPassword: newPassword || null
                };

                const response = await axios.put(
                    `${API_BASE_URL}/artists/claims/${claim._id}/approve`,
                    requestData,
                    getAuthHeaders()
                );

                setApprovalResult({
                    success: true,
                    data: response.data.data,
                    message: 'Claim başarıyla onaylandı!'
                });

                showSnackbar('Claim onaylandı ve email gönderildi!', 'success');
            } else {
                if (!rejectionReason.trim()) {
                    showSnackbar('Red sebebi zorunludur', 'error');
                    setApprovalLoading(false);
                    return;
                }

                await axios.put(
                    `${API_BASE_URL}/artists/claims/${claim._id}/reject`,
                    { rejectionReason },
                    getAuthHeaders()
                );

                showSnackbar('Claim reddedildi', 'success');
                handleCloseClaimDialog();
            }

            loadPendingClaims();
            loadArtists();
        } catch (error) {
            showSnackbar(error.response?.data?.message || 'Hata oluştu', 'error');
            setApprovalResult({
                success: false,
                error: error.response?.data?.message || error.message
            });
        } finally {
            setApprovalLoading(false);
        }
    };

    const handleCloseClaimDialog = () => {
        setClaimActionDialog({ open: false, claim: null, action: null });
        setRejectionReason('');
        setNewPassword('');
        setShowPassword(false);
        setApprovalResult(null);
    };

    // Status chip
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

    // Badge chip
    const getBadgeChip = (badge) => {
        const badgeInfo = BADGE_OPTIONS.find(b => b.value === badge) || BADGE_OPTIONS[0];
        return (
            <Chip
                icon={<BadgeIcon />}
                label={badgeInfo.label}
                size="small"
                sx={{ bgcolor: badgeInfo.color, color: '#fff' }}
            />
        );
    };

    // Filter
    const filteredArtists = artists.filter(artist => {
        const matchesSearch = artist.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            artist.slug?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || artist.claimStatus === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <Box sx={{ p: 3, bgcolor: '#fafafa', minHeight: '100vh' }}>
            {/* Header */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Diamond sx={{ color: '#7C3AED' }} /> Artist Yönetimi
                        <Chip label="Trackbang" size="small" sx={{ bgcolor: '#7C3AED', color: '#fff', ml: 1 }} />
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Sanatçı profillerini, kullanıcı hesaplarını ve claim başvurularını yönetin
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}
                        sx={{ bgcolor: '#7C3AED', '&:hover': { bgcolor: '#6D28D9' }, px: 3, py: 1.5, fontWeight: 'bold' }}>
                    Yeni Artist Ekle
                </Button>
            </Box>

            {/* Info Alert */}
            <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3 }}>
                <Typography variant="body2">
                    <strong>Yeni Özellik:</strong> Artık artist düzenlerken bağlı kullanıcı hesabının <strong>email, telefon, username, şifre ve rozet</strong> bilgilerini de düzenleyebilirsiniz.
                </Typography>
            </Alert>

            {/* Tabs */}
            <Paper sx={{ mb: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab label={`Artistler (${artists.length})`} icon={<ArtistIcon />} iconPosition="start" />
                    <Tab
                        label={
                            <Badge badgeContent={pendingClaims.length} color="error">
                                Claim Başvuruları
                            </Badge>
                        }
                        icon={<ClaimIcon />}
                        iconPosition="start"
                    />
                </Tabs>
            </Paper>

            {/* Tab 0: Artists */}
            <TabPanel value={tabValue} index={0}>
                {/* Filters */}
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth size="small" placeholder="Artist ara..."
                                       value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
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
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Claim Durumu</InputLabel>
                                <Select value={filterStatus} label="Claim Durumu"
                                        onChange={(e) => setFilterStatus(e.target.value)}>
                                    <MenuItem value="all">Tümü</MenuItem>
                                    <MenuItem value="claimed">Claimed</MenuItem>
                                    <MenuItem value="unclaimed">Unclaimed</MenuItem>
                                    <MenuItem value="pending">Pending</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <Button fullWidth variant="outlined" startIcon={<RefreshIcon />}
                                    onClick={loadArtists}>Yenile</Button>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Artists Table */}
                <Paper>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                    <TableCell>Artist</TableCell>
                                    <TableCell>Slug</TableCell>
                                    <TableCell>Claim Durumu</TableCell>
                                    <TableCell>Bağlı Hesap</TableCell>
                                    <TableCell>Rozet</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell align="right">İşlemler</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                            <CircularProgress />
                                        </TableCell>
                                    </TableRow>
                                ) : filteredArtists.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                            <Typography color="text.secondary">Artist bulunamadı</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredArtists
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((artist) => {
                                            const linkedUser = artist.claimedBy || artist.placeholderUser;
                                            return (
                                                <TableRow key={artist._id} hover>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                            <Avatar src={artist.profileImage} sx={{ width: 48, height: 48 }}>
                                                                <ArtistIcon />
                                                            </Avatar>
                                                            <Box>
                                                                <Typography fontWeight="bold">{artist.name}</Typography>
                                                                {artist.bio && (
                                                                    <Typography variant="caption" color="text.secondary">
                                                                        {artist.bio.substring(0, 50)}...
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip label={artist.slug} size="small" variant="outlined" />
                                                    </TableCell>
                                                    <TableCell>{getStatusChip(artist.claimStatus)}</TableCell>
                                                    <TableCell>
                                                        {linkedUser ? (
                                                            <Tooltip title={`ID: ${linkedUser._id}`}>
                                                                <Chip
                                                                    icon={<AccountIcon />}
                                                                    label={`@${linkedUser.username}`}
                                                                    size="small"
                                                                    variant="outlined"
                                                                    sx={{
                                                                        borderColor: linkedUser.isActive === false ? '#EF4444' : '#10B981',
                                                                        color: linkedUser.isActive === false ? '#EF4444' : 'inherit'
                                                                    }}
                                                                />
                                                            </Tooltip>
                                                        ) : (
                                                            <Typography variant="caption" color="text.secondary">-</Typography>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {linkedUser ? getBadgeChip(linkedUser.badge) : '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {linkedUser?.email ? (
                                                            <Typography variant="caption">{linkedUser.email}</Typography>
                                                        ) : (
                                                            <Typography variant="caption" color="text.secondary">-</Typography>
                                                        )}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Tooltip title="Düzenle">
                                                            <IconButton onClick={() => handleOpenDialog(artist)} color="primary">
                                                                <EditIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Sil">
                                                            <IconButton onClick={() => handleDeleteArtist(artist._id)} color="error">
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        component="div"
                        count={filteredArtists.length}
                        page={page}
                        onPageChange={(e, newPage) => setPage(newPage)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                        labelRowsPerPage="Sayfa başına:"
                    />
                </Paper>
            </TabPanel>

            {/* Tab 1: Claim Applications */}
            <TabPanel value={tabValue} index={1}>
                {pendingClaims.length === 0 ? (
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                        <ClaimIcon sx={{ fontSize: 64, color: '#9ca3af', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">Bekleyen başvuru yok</Typography>
                    </Paper>
                ) : (
                    <Grid container spacing={3}>
                        {pendingClaims.map((claim) => (
                            <Grid item xs={12} md={6} key={claim._id}>
                                <Card sx={{ height: '100%' }}>
                                    <CardContent>
                                        {/* Artist Bilgisi */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                            <Avatar src={claim.artistId?.profileImage} sx={{ width: 64, height: 64 }}>
                                                <ArtistIcon />
                                            </Avatar>
                                            <Box>
                                                <Typography variant="h6" fontWeight="bold">
                                                    {claim.artistId?.name}
                                                </Typography>
                                                <Chip label={`@${claim.artistId?.slug}`} size="small" />
                                            </Box>
                                        </Box>

                                        <Divider sx={{ my: 2 }} />

                                        {/* Başvuran Kullanıcı */}
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                            Başvuran Kullanıcı
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                            <Avatar src={claim.userId?.profileImage} sx={{ width: 40, height: 40 }}>
                                                <PersonIcon />
                                            </Avatar>
                                            <Box>
                                                <Typography fontWeight="bold">
                                                    {claim.userId?.firstName} {claim.userId?.lastName}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    @{claim.userId?.username}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {/* Email & Phone */}
                                        <Box sx={{ bgcolor: '#f3f4f6', p: 2, borderRadius: 1, mb: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                <EmailIcon fontSize="small" color="action" />
                                                <Typography variant="body2">{claim.userId?.email || 'Email yok'}</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <PhoneIcon fontSize="small" color="action" />
                                                <Typography variant="body2">{claim.userId?.phone || 'Telefon yok'}</Typography>
                                            </Box>
                                        </Box>

                                        {/* Tarih */}
                                        <Typography variant="caption" color="text.secondary">
                                            {new Date(claim.createdAt).toLocaleString('tr-TR')}
                                        </Typography>

                                        {/* Aksiyonlar */}
                                        <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
                                            <Button
                                                variant="contained"
                                                color="success"
                                                startIcon={<CheckIcon />}
                                                onClick={() => setClaimActionDialog({ open: true, claim, action: 'approve' })}
                                                sx={{ flex: 1 }}
                                            >
                                                Onayla
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                startIcon={<CloseIcon />}
                                                onClick={() => setClaimActionDialog({ open: true, claim, action: 'reject' })}
                                                sx={{ flex: 1 }}
                                            >
                                                Reddet
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </TabPanel>

            {/* ========== ARTIST EKLE/DÜZENLE DIALOG ========== */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle sx={{ bgcolor: '#7C3AED', color: 'white' }}>
                    {dialogMode === 'add' ? '🎤 Yeni Artist Ekle' : '✏️ Artist Düzenle'}
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Grid container spacing={3}>
                        {/* Images */}
                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2" gutterBottom>Profil Resmi</Typography>
                            <DragDropImageUpload
                                preview={formData.profileImage}
                                isDragging={profileDragging}
                                uploadProgress={uploadProgress}
                                inputId="profile-upload"
                                label="Profil resmi yükle"
                                icon={<PhotoCameraIcon sx={{ fontSize: 40, color: '#9ca3af' }} />}
                                height={180}
                                {...createDragHandlers(setProfileDragging, 'profileImage')}
                            />
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <Typography variant="subtitle2" gutterBottom>Banner Resmi</Typography>
                            <DragDropImageUpload
                                preview={formData.bannerImage}
                                isDragging={bannerDragging}
                                uploadProgress={uploadProgress}
                                inputId="banner-upload"
                                label="Banner resmi yükle"
                                icon={<BannerIcon sx={{ fontSize: 40, color: '#9ca3af' }} />}
                                height={180}
                                {...createDragHandlers(setBannerDragging, 'bannerImage')}
                            />
                        </Grid>

                        {/* Basic Info */}
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="Artist Adı" value={formData.name}
                                       onChange={(e) => {
                                           handleFormChange('name', e.target.value);
                                           if (dialogMode === 'add') {
                                               handleFormChange('slug', generateSlug(e.target.value));
                                           }
                                       }}
                                       required />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="Slug" value={formData.slug}
                                       onChange={(e) => handleFormChange('slug', e.target.value)}
                                       required
                                       helperText="URL'de kullanılacak (örn: dj-name)" />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Bio" multiline rows={3} value={formData.bio}
                                       onChange={(e) => handleFormChange('bio', e.target.value)} />
                        </Grid>

                        {/* Social Links */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" gutterBottom>Sosyal Medya</Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="Instagram" value={formData.socialLinks.instagram}
                                       onChange={(e) => handleFormChange('socialLinks.instagram', e.target.value)}
                                       InputProps={{ startAdornment: <InputAdornment position="start"><InstagramIcon /></InputAdornment> }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="YouTube" value={formData.socialLinks.youtube}
                                       onChange={(e) => handleFormChange('socialLinks.youtube', e.target.value)}
                                       InputProps={{ startAdornment: <InputAdornment position="start"><YouTubeIcon /></InputAdornment> }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="Spotify" value={formData.socialLinks.spotify}
                                       onChange={(e) => handleFormChange('socialLinks.spotify', e.target.value)}
                                       InputProps={{ startAdornment: <InputAdornment position="start"><MusicNoteIcon /></InputAdornment> }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="Website" value={formData.socialLinks.website}
                                       onChange={(e) => handleFormChange('socialLinks.website', e.target.value)}
                                       InputProps={{ startAdornment: <InputAdornment position="start"><WebsiteIcon /></InputAdornment> }}
                            />
                        </Grid>

                        {/* Options (only for new artist) */}
                        {dialogMode === 'add' && (
                            <>
                                <Grid item xs={12}>
                                    <Divider sx={{ my: 1 }} />
                                    <Typography variant="subtitle2" gutterBottom>Hesap Ayarları</Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <FormControlLabel
                                        control={<Switch checked={formData.createUserAccount}
                                                         onChange={(e) => handleFormChange('createUserAccount', e.target.checked)} />}
                                        label="Placeholder hesap oluştur"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <FormControlLabel
                                        control={<Switch checked={formData.keepUnclaimed}
                                                         onChange={(e) => handleFormChange('keepUnclaimed', e.target.checked)} />}
                                        label="Unclaimed olarak bırak"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Rozet</InputLabel>
                                        <Select value={formData.badge} label="Rozet"
                                                onChange={(e) => handleFormChange('badge', e.target.value)}>
                                            {BADGE_OPTIONS.map(badge => (
                                                <MenuItem key={badge.value} value={badge.value}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: badge.color }} />
                                                        {badge.label}
                                                    </Box>
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </>
                        )}

                        {/* ⭐⭐⭐ BAĞLI KULLANICI HESABI YÖNETİMİ ⭐⭐⭐ */}
                        {dialogMode === 'edit' && (selectedArtist?.claimedBy || selectedArtist?.placeholderUser) && (
                            <Grid item xs={12}>
                                <Accordion
                                    expanded={userDataExpanded}
                                    onChange={() => setUserDataExpanded(!userDataExpanded)}
                                    sx={{ mt: 2, bgcolor: '#f8f9fa', border: '1px solid #e0e0e0' }}
                                >
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <ManageAccountsIcon sx={{ color: '#7C3AED' }} />
                                            <Box>
                                                <Typography fontWeight="bold">
                                                    Bağlı Kullanıcı Hesabı
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    @{userData.username} • {userData.email || 'Email yok'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Alert severity="info" sx={{ mb: 3 }}>
                                            <Typography variant="body2">
                                                Bu bölümde artist'e bağlı kullanıcı hesabının bilgilerini düzenleyebilirsiniz.
                                                Şifre alanını boş bırakırsanız mevcut şifre korunur.
                                            </Typography>
                                        </Alert>

                                        <Grid container spacing={2}>
                                            {/* Email */}
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Email"
                                                    type="email"
                                                    value={userData.email}
                                                    onChange={(e) => handleUserDataChange('email', e.target.value)}
                                                    InputProps={{
                                                        startAdornment: <InputAdornment position="start"><EmailIcon /></InputAdornment>
                                                    }}
                                                />
                                            </Grid>

                                            {/* Phone */}
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Telefon"
                                                    value={userData.phone}
                                                    onChange={(e) => handleUserDataChange('phone', e.target.value)}
                                                    InputProps={{
                                                        startAdornment: <InputAdornment position="start"><PhoneIcon /></InputAdornment>
                                                    }}
                                                />
                                            </Grid>

                                            {/* Username */}
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Kullanıcı Adı (Tag)"
                                                    value={userData.username}
                                                    onChange={(e) => handleUserDataChange('username', e.target.value)}
                                                    InputProps={{
                                                        startAdornment: <InputAdornment position="start"><TagIcon /></InputAdornment>
                                                    }}
                                                    helperText="@ ile başlayan tag"
                                                />
                                            </Grid>

                                            {/* Display Name */}
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Görünen Ad"
                                                    value={userData.displayName}
                                                    onChange={(e) => handleUserDataChange('displayName', e.target.value)}
                                                    InputProps={{
                                                        startAdornment: <InputAdornment position="start"><PersonIcon /></InputAdornment>
                                                    }}
                                                />
                                            </Grid>

                                            {/* First Name */}
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Ad"
                                                    value={userData.firstName}
                                                    onChange={(e) => handleUserDataChange('firstName', e.target.value)}
                                                />
                                            </Grid>

                                            {/* Last Name */}
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Soyad"
                                                    value={userData.lastName}
                                                    onChange={(e) => handleUserDataChange('lastName', e.target.value)}
                                                />
                                            </Grid>

                                            {/* Badge */}
                                            <Grid item xs={12} md={6}>
                                                <FormControl fullWidth>
                                                    <InputLabel>Rozet</InputLabel>
                                                    <Select
                                                        value={userData.badge}
                                                        label="Rozet"
                                                        onChange={(e) => handleUserDataChange('badge', e.target.value)}
                                                        startAdornment={<InputAdornment position="start"><BadgeIcon /></InputAdornment>}
                                                    >
                                                        {BADGE_OPTIONS.map(badge => (
                                                            <MenuItem key={badge.value} value={badge.value}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: badge.color }} />
                                                                    {badge.label}
                                                                </Box>
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Grid>

                                            {/* Is Active */}
                                            <Grid item xs={12} md={6}>
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            checked={userData.isActive}
                                                            onChange={(e) => handleUserDataChange('isActive', e.target.checked)}
                                                            color="success"
                                                        />
                                                    }
                                                    label={userData.isActive ? "Hesap Aktif" : "Hesap Pasif"}
                                                />
                                            </Grid>

                                            {/* Password */}
                                            <Grid item xs={12}>
                                                <Divider sx={{ my: 1 }} />
                                                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <SecurityIcon fontSize="small" />
                                                    Şifre Değiştir
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} md={8}>
                                                <TextField
                                                    fullWidth
                                                    label="Yeni Şifre"
                                                    type={showUserPassword ? 'text' : 'password'}
                                                    value={userData.password}
                                                    onChange={(e) => handleUserDataChange('password', e.target.value)}
                                                    placeholder="Boş bırakılırsa mevcut şifre korunur"
                                                    helperText="En az 6 karakter"
                                                    InputProps={{
                                                        startAdornment: <InputAdornment position="start"><LockIcon /></InputAdornment>,
                                                        endAdornment: (
                                                            <InputAdornment position="end">
                                                                <IconButton onClick={() => setShowUserPassword(!showUserPassword)}>
                                                                    {showUserPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                                </IconButton>
                                                            </InputAdornment>
                                                        )
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={4}>
                                                <Button
                                                    fullWidth
                                                    variant="outlined"
                                                    startIcon={<RefreshIcon />}
                                                    onClick={() => handleUserDataChange('password', generateRandomPassword())}
                                                    sx={{ height: 56 }}
                                                >
                                                    Rastgele Şifre
                                                </Button>
                                            </Grid>

                                            {/* Save User Button */}
                                            <Grid item xs={12}>
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    startIcon={savingUser ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                                    onClick={() => {
                                                        const linkedUser = selectedArtist.claimedBy || selectedArtist.placeholderUser;
                                                        handleSaveUserData(linkedUser._id);
                                                    }}
                                                    disabled={savingUser}
                                                    sx={{ mt: 1 }}
                                                >
                                                    {savingUser ? 'Kaydediliyor...' : 'Kullanıcı Bilgilerini Kaydet'}
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </AccordionDetails>
                                </Accordion>
                            </Grid>
                        )}

                        {/* No linked user message */}
                        {dialogMode === 'edit' && !selectedArtist?.claimedBy && !selectedArtist?.placeholderUser && (
                            <Grid item xs={12}>
                                <Alert severity="warning" sx={{ mt: 2 }}>
                                    <Typography variant="body2">
                                        Bu artist'e bağlı kullanıcı hesabı bulunamadı.
                                    </Typography>
                                </Alert>
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                    <Button onClick={handleCloseDialog}>İptal</Button>
                    <Button variant="contained" onClick={handleSaveArtist}
                            sx={{ bgcolor: '#7C3AED', '&:hover': { bgcolor: '#6D28D9' } }}>
                        {dialogMode === 'add' ? 'Ekle' : 'Artist Bilgilerini Güncelle'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ========== CLAIM ACTION DIALOG ========== */}
            <Dialog
                open={claimActionDialog.open}
                onClose={handleCloseClaimDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{
                    bgcolor: claimActionDialog.action === 'approve' ? '#10B981' : '#EF4444',
                    color: 'white'
                }}>
                    {claimActionDialog.action === 'approve' ? '✅ Claim Onayla' : '❌ Claim Reddet'}
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    {claimActionDialog.claim && (
                        <>
                            {/* Artist Bilgisi */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, p: 2, bgcolor: '#f3f4f6', borderRadius: 2 }}>
                                <Avatar src={claimActionDialog.claim.artistId?.profileImage} sx={{ width: 56, height: 56 }}>
                                    <ArtistIcon />
                                </Avatar>
                                <Box>
                                    <Typography variant="h6">{claimActionDialog.claim.artistId?.name}</Typography>
                                    <Chip label={`@${claimActionDialog.claim.artistId?.slug}`} size="small" />
                                </Box>
                            </Box>

                            {/* Başvuran Kullanıcı */}
                            <Alert severity="warning" sx={{ mb: 3 }} icon={<PersonOffIcon />}>
                                <Typography variant="body2">
                                    <strong>Başvuran:</strong> {claimActionDialog.claim.userId?.firstName} {claimActionDialog.claim.userId?.lastName}
                                    (@{claimActionDialog.claim.userId?.username})
                                    <br/>
                                    <strong>Email:</strong> {claimActionDialog.claim.userId?.email}
                                    {claimActionDialog.action === 'approve' && (
                                        <>
                                            <br/><br/>
                                            ⚠️ <strong>Dikkat:</strong> Onay sonrası bu kullanıcı hesabı <strong>pasif</strong> edilecek ve
                                            artist hesap bilgileri yukarıdaki email adresine gönderilecek.
                                        </>
                                    )}
                                </Typography>
                            </Alert>

                            {claimActionDialog.action === 'approve' ? (
                                <>
                                    {approvalResult && (
                                        <Alert severity={approvalResult.success ? 'success' : 'error'} sx={{ mb: 3 }}>
                                            {approvalResult.success ? (
                                                <>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        ✅ Claim başarıyla onaylandı!
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        • Başvuran kullanıcı pasif edildi
                                                        <br/>
                                                        • Bilgiler artist hesabına aktarıldı
                                                        <br/>
                                                        • Email {approvalResult.data?.emailSent ? 'gönderildi ✅' : 'gönderilemedi ❌'}
                                                    </Typography>
                                                </>
                                            ) : (
                                                <Typography variant="body2">❌ Hata: {approvalResult.error}</Typography>
                                            )}
                                        </Alert>
                                    )}

                                    {!approvalResult && (
                                        <>
                                            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                                                <KeyIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                                                Artist Hesap Şifresi
                                            </Typography>
                                            <TextField
                                                fullWidth
                                                label="Yeni Şifre (boş bırakılırsa otomatik oluşturulur)"
                                                type={showPassword ? 'text' : 'password'}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                sx={{ mb: 2 }}
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton onClick={() => setShowPassword(!showPassword)}>
                                                                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                            </IconButton>
                                                            <IconButton onClick={() => setNewPassword(generateRandomPassword())} title="Rastgele şifre">
                                                                <RefreshIcon />
                                                            </IconButton>
                                                        </InputAdornment>
                                                    )
                                                }}
                                            />
                                        </>
                                    )}
                                </>
                            ) : (
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    label="Red Sebebi"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    required
                                    placeholder="Başvurunun neden reddedildiğini açıklayın..."
                                />
                            )}
                        </>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                    <Button onClick={handleCloseClaimDialog} disabled={approvalLoading}>
                        {approvalResult ? 'Kapat' : 'İptal'}
                    </Button>
                    {!approvalResult && (
                        <Button
                            variant="contained"
                            color={claimActionDialog.action === 'approve' ? 'success' : 'error'}
                            onClick={handleClaimAction}
                            disabled={approvalLoading}
                            startIcon={approvalLoading ? <CircularProgress size={20} color="inherit" /> :
                                (claimActionDialog.action === 'approve' ? <SendIcon /> : <CloseIcon />)}
                        >
                            {approvalLoading ? 'İşleniyor...' :
                                (claimActionDialog.action === 'approve' ? 'Onayla & Email Gönder' : 'Reddet')}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
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
        </Box>
    );
};

export default ArtistManagement;