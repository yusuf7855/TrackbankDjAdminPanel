// Playlists.jsx - INPUT FOCUS SORUNU DÜZELTİLMİŞ
import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Button,
    TextField,
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
    CardMedia,
    Chip,
    Stack,
    Alert,
    CircularProgress,
    Checkbox,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    ListItemAvatar,
    Tabs,
    Tab,
    Avatar,
    Fade,
    Divider,
    Tooltip
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Edit as EditIcon,
    Add as AddIcon,
    MusicNote as MusicIcon,
    PlaylistAdd as PlaylistAddIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    Category as CategoryIcon,
    CloudUpload as UploadIcon,
    Image as ImageIcon,
    Visibility as ViewsIcon,
    Favorite as FavoriteIcon,
    Apple as AppleIcon,
    YouTube as YouTubeIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// TabPanel'i memo ile wrap et
const TabPanel = memo(({ children, value, index }) => (
    <div hidden={value !== index}>
        {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
));

export const Playlists = () => {
    const [playlists, setPlaylists] = useState([]);
    const [musics, setMusics] = useState([]);
    const [filteredMusics, setFilteredMusics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingPlaylist, setEditingPlaylist] = useState(null);
    const [selectedMusics, setSelectedMusics] = useState([]);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [musicSearchTerm, setMusicSearchTerm] = useState('');
    const [selectedMusicCategory, setSelectedMusicCategory] = useState('all');
    const [tabValue, setTabValue] = useState(0);
    const [submitLoading, setSubmitLoading] = useState(false);

    // Form state
    const [playlistName, setPlaylistName] = useState('');
    const [playlistDescription, setPlaylistDescription] = useState('');
    const [playlistGenre, setPlaylistGenre] = useState('afrohouse');
    const [playlistSubCategory, setPlaylistSubCategory] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [coverImagePreview, setCoverImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    // Genre listesi - useMemo kullan
    const genres = useMemo(() => [
        { value: 'all', label: 'Tüm Türler', color: '#4caf50', icon: '🎵' },
        { value: 'afrohouse', label: 'Afro House', color: '#ff9800', icon: '🌍' },
        { value: 'indiedance', label: 'Indie Dance', color: '#e91e63', icon: '💃' },
        { value: 'organichouse', label: 'Organic House', color: '#8bc34a', icon: '🌿' },
        { value: 'downtempo', label: 'Down Tempo', color: '#2196f3', icon: '🎧' },
        { value: 'melodichouse', label: 'Melodic House', color: '#9c27b0', icon: '🎹' }
    ], []);

    // Fetch fonksiyonları
    const fetchPlaylists = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/playlists/admin`);
            setPlaylists(response.data.playlists || []);
        } catch (error) {
            console.error('Error fetching playlists:', error);
            setError('Admin playlist\'leri yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchMusics = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/music`);
            setMusics(response.data.music || response.data || []);
        } catch (error) {
            console.error('Error fetching musics:', error);
            setError('Müzik kütüphanesi yüklenirken hata oluştu');
        }
    }, []);

    useEffect(() => {
        fetchPlaylists();
        fetchMusics();
    }, [fetchPlaylists, fetchMusics]);

    // Filter musics
    useEffect(() => {
        let filtered = [...musics];

        if (selectedMusicCategory !== 'all') {
            filtered = filtered.filter(music => music.genre === selectedMusicCategory);
        }

        if (musicSearchTerm) {
            filtered = filtered.filter(music =>
                music.title.toLowerCase().includes(musicSearchTerm.toLowerCase()) ||
                music.artist.toLowerCase().includes(musicSearchTerm.toLowerCase())
            );
        }

        setFilteredMusics(filtered);
    }, [musics, selectedMusicCategory, musicSearchTerm]);

    // Handler fonksiyonları
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverImagePreview(reader.result);
                setCoverImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const validateForm = () => {
        if (!playlistName?.trim()) {
            setError('Playlist adı gereklidir');
            return false;
        }
        if (!playlistSubCategory?.trim()) {
            setError('Alt kategori kodu gereklidir (örn: AH1, MH1)');
            return false;
        }
        if (!/^[A-Z]{2}\d+$/.test(playlistSubCategory.trim())) {
            setError('Alt kategori formatı geçersiz (Örn: AH1, MH1, ID1)');
            return false;
        }
        if (selectedMusics.length === 0) {
            setError('En az bir müzik seçmelisiniz');
            return false;
        }
        if (selectedMusics.length > 10) {
            setError('Maksimum 10 müzik seçebilirsiniz');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setSubmitLoading(true);

        try {
            const data = {
                name: playlistName,
                description: playlistDescription,
                genre: playlistGenre,
                subCategory: playlistSubCategory.toUpperCase(),
                musicIds: selectedMusics,
                coverImage: coverImage || null
            };

            if (editingPlaylist) {
                await axios.put(`${API_BASE_URL}/playlists/admin/${editingPlaylist._id}`, data);
                setSuccess('Admin playlist başarıyla güncellendi');
            } else {
                await axios.post(`${API_BASE_URL}/playlists/admin`, data);
                setSuccess('Admin playlist başarıyla oluşturuldu');
            }

            await fetchPlaylists();
            resetForm();
        } catch (error) {
            console.error('Error saving playlist:', error);
            if (error.response?.data?.message?.includes('Duplicate') ||
                error.response?.data?.message?.includes('kombinasyonu')) {
                setError('Bu genre ve alt kategori kombinasyonu zaten mevcut');
            } else {
                setError('Admin playlist kaydedilirken hata oluştu: ' + (error.response?.data?.message || error.message));
            }
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleEdit = (playlist) => {
        setEditingPlaylist(playlist);
        setPlaylistName(playlist.name || '');
        setPlaylistDescription(playlist.description || '');
        setPlaylistGenre(playlist.genre || 'afrohouse');
        setPlaylistSubCategory(playlist.subCategory || '');
        setCoverImage(playlist.coverImage || '');
        setCoverImagePreview(playlist.coverImage || null);
        setSelectedMusics(playlist.musics?.map(m => m._id) || []);
        setOpenDialog(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bu admin playlist\'i silmek istediğinizden emin misiniz?')) {
            try {
                await axios.delete(`${API_BASE_URL}/playlists/admin/${id}`);
                setSuccess('Admin playlist başarıyla silindi');
                await fetchPlaylists();
            } catch (error) {
                console.error('Error deleting playlist:', error);
                setError('Admin playlist silinirken hata oluştu');
            }
        }
    };

    const handleMusicToggle = (musicId) => {
        setSelectedMusics(prev => {
            const newSelection = prev.includes(musicId)
                ? prev.filter(id => id !== musicId)
                : [...prev, musicId];

            if (newSelection.length > 10) {
                setError('Maksimum 10 müzik seçebilirsiniz');
                return prev;
            }

            setError(null);
            return newSelection;
        });
    };

    const resetForm = () => {
        setPlaylistName('');
        setPlaylistDescription('');
        setPlaylistGenre('afrohouse');
        setPlaylistSubCategory('');
        setCoverImage('');
        setCoverImagePreview(null);
        setImageFile(null);
        setSelectedMusics([]);
        setEditingPlaylist(null);
        setOpenDialog(false);
        setError(null);
        setTabValue(0);
        setSubmitLoading(false);
    };

    const getGenreData = (genreValue) => {
        return genres.find(g => g.value === genreValue) || {
            label: genreValue,
            color: '#757575',
            icon: '🎵'
        };
    };

    // Filtered playlists
    const filteredPlaylists = useMemo(() => {
        return playlists.filter(playlist => {
            const matchesCategory = filterCategory === 'all' || playlist.genre === filterCategory;
            const matchesSearch = playlist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                playlist.subCategory?.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [playlists, filterCategory, searchTerm]);

    if (loading) {
        return (
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="60vh" gap={2}>
                <CircularProgress size={60} />
                <Typography variant="h6">
                    Admin Playlist'leri Yükleniyor...
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: '#9c27b0', mr: 2, width: 56, height: 56 }}>
                        <PlaylistAddIcon />
                    </Avatar>
                    <Box>
                        <Typography variant="h4" fontWeight="bold">
                            Admin Genre Playlist'leri
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                            Cover image'li genre playlist'leri yönetin
                        </Typography>
                    </Box>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
                    sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                        },
                        borderRadius: 2,
                        px: 3,
                        py: 1.5
                    }}
                >
                    Yeni Admin Playlist
                </Button>
            </Box>

            {/* Info Card */}
            <Paper
                elevation={0}
                sx={{
                    mb: 3,
                    p: 3,
                    background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                    border: '1px solid',
                    borderColor: 'divider'
                }}
            >
                <Stack direction="row" spacing={2} alignItems="center">
                    <CategoryIcon sx={{ fontSize: 40, color: '#9c27b0' }} />
                    <Box>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            ℹ️ Genre & Cover Image Sistemi
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            • <strong>Cover Images:</strong> Her playlist için özel cover image yükleyebilirsiniz<br/>
                            • <strong>Genre System:</strong> 5 ana genre: Afro House, Indie Dance, Organic House, Down Tempo, Melodic House<br/>
                            • <strong>HOT System:</strong> Her genre'den en son eklenen admin playlist HOT olarak görünür<br/>
                            • <strong>Alt Kategori:</strong> Format: AH1, MH1, ID1 (İki harf + sayı)
                        </Typography>
                    </Box>
                </Stack>
            </Paper>

            {/* Alerts */}
            <Stack spacing={2} mb={3}>
                {error && (
                    <Fade in>
                        <Alert severity="error" onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    </Fade>
                )}
                {success && (
                    <Fade in>
                        <Alert severity="success" onClose={() => setSuccess(null)}>
                            {success}
                        </Alert>
                    </Fade>
                )}
            </Stack>

            {/* Filters */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Playlist veya alt kategori ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Tür Filtresi</InputLabel>
                                <Select
                                    value={filterCategory}
                                    label="Tür Filtresi"
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                >
                                    {genres.map(genre => (
                                        <MenuItem key={genre.value} value={genre.value}>
                                            <Box display="flex" alignItems="center">
                                                <Typography sx={{ mr: 1 }}>{genre.icon}</Typography>
                                                <Box
                                                    sx={{
                                                        width: 12,
                                                        height: 12,
                                                        borderRadius: '50%',
                                                        bgcolor: genre.color,
                                                        mr: 1
                                                    }}
                                                />
                                                {genre.label}
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={12} md={4}>
                            <Stack direction="row" spacing={2}>
                                <Chip
                                    icon={<PlaylistAddIcon />}
                                    label={`${filteredPlaylists.length} playlist`}
                                    color="primary"
                                    variant="outlined"
                                />
                                <Chip
                                    icon={<ImageIcon />}
                                    label={`${filteredPlaylists.filter(p => p.coverImage).length} cover'lı`}
                                    color="success"
                                    variant="outlined"
                                />
                            </Stack>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Playlists Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell width="80">Cover</TableCell>
                            <TableCell>Playlist Bilgileri</TableCell>
                            <TableCell>Tür & Alt Kategori</TableCell>
                            <TableCell>Stats</TableCell>
                            <TableCell>Tarih</TableCell>
                            <TableCell width="120">İşlemler</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredPlaylists.map((playlist) => {
                            const genreData = getGenreData(playlist.genre);
                            return (
                                <TableRow key={playlist._id} hover>
                                    <TableCell>
                                        {playlist.coverImage ? (
                                            <Avatar
                                                src={playlist.coverImage}
                                                variant="rounded"
                                                sx={{ width: 60, height: 60 }}
                                            />
                                        ) : (
                                            <Avatar
                                                variant="rounded"
                                                sx={{
                                                    width: 60,
                                                    height: 60,
                                                    bgcolor: genreData.color
                                                }}
                                            >
                                                <MusicIcon />
                                            </Avatar>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight="bold">
                                            {playlist.name}
                                        </Typography>
                                        {playlist.description && (
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                {playlist.description}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Stack spacing={1}>
                                            <Chip
                                                label={
                                                    <Box display="flex" alignItems="center" gap={0.5}>
                                                        <span>{genreData.icon}</span>
                                                        <span>{genreData.label}</span>
                                                    </Box>
                                                }
                                                size="small"
                                                sx={{
                                                    bgcolor: genreData.color,
                                                    color: 'white',
                                                    fontWeight: 'bold'
                                                }}
                                            />
                                            <Chip
                                                label={playlist.subCategory}
                                                size="small"
                                                variant="outlined"
                                                sx={{
                                                    borderColor: genreData.color,
                                                    color: genreData.color,
                                                    fontWeight: 'bold'
                                                }}
                                            />
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <Stack spacing={0.5}>
                                            <Chip
                                                icon={<MusicIcon />}
                                                label={`${playlist.musicCount || 0} şarkı`}
                                                size="small"
                                                variant="outlined"
                                            />
                                            <Stack direction="row" spacing={1}>
                                                <Chip
                                                    icon={<ViewsIcon />}
                                                    label={playlist.views || 0}
                                                    size="small"
                                                    variant="outlined"
                                                    color="primary"
                                                />
                                                <Chip
                                                    icon={<FavoriteIcon />}
                                                    label={playlist.likes || 0}
                                                    size="small"
                                                    variant="outlined"
                                                    color="error"
                                                />
                                            </Stack>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {new Date(playlist.createdAt).toLocaleDateString('tr-TR', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1}>
                                            <Tooltip title="Düzenle">
                                                <IconButton onClick={() => handleEdit(playlist)} color="primary" size="small">
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Sil">
                                                <IconButton onClick={() => handleDelete(playlist._id)} color="error" size="small">
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            {filteredPlaylists.length === 0 && (
                <Paper sx={{ textAlign: 'center', py: 8, mt: 3 }}>
                    <PlaylistAddIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        Admin Playlist Bulunamadı
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={3}>
                        {searchTerm || filterCategory !== 'all'
                            ? 'Arama kriterlerinize uygun playlist bulunamadı'
                            : 'Yeni bir admin playlist oluşturmak için yukarıdaki butonu kullanın'}
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenDialog(true)}
                    >
                        İlk Admin Playlist'inizi Oluşturun
                    </Button>
                </Paper>
            )}

            {/* Create/Edit Dialog */}
            <Dialog
                open={openDialog}
                onClose={resetForm}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Box display="flex" alignItems="center">
                        <PlaylistAddIcon sx={{ mr: 1, color: '#9c27b0' }} />
                        {editingPlaylist ? 'Admin Playlist Düzenle' : 'Yeni Admin Playlist Oluştur'}
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                            <Tab icon={<CategoryIcon />} iconPosition="start" label="Bilgiler" />
                            <Tab icon={<ImageIcon />} iconPosition="start" label="Cover Image" />
                            <Tab icon={<MusicIcon />} iconPosition="start" label={`Müzikler (${selectedMusics.length}/10)`} />
                        </Tabs>
                    </Box>

                    {/* Tab 0: Playlist Info */}
                    <TabPanel value={tabValue} index={0}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={8}>
                                <TextField
                                    fullWidth
                                    label="Playlist Adı"
                                    value={playlistName}
                                    onChange={(e) => setPlaylistName(e.target.value)}
                                    required
                                    placeholder="Örn: Afro House Essentials"
                                    autoComplete="off"
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    label="Alt Kategori"
                                    value={playlistSubCategory}
                                    onChange={(e) => setPlaylistSubCategory(e.target.value.toUpperCase())}
                                    placeholder="AH1, MH1..."
                                    required
                                    helperText="Format: İki harf + sayı"
                                    autoComplete="off"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Tür</InputLabel>
                                    <Select
                                        value={playlistGenre}
                                        label="Tür"
                                        onChange={(e) => setPlaylistGenre(e.target.value)}
                                        required
                                    >
                                        {genres.filter(g => g.value !== 'all').map(genre => (
                                            <MenuItem key={genre.value} value={genre.value}>
                                                <Box display="flex" alignItems="center">
                                                    <Typography sx={{ mr: 1 }}>{genre.icon}</Typography>
                                                    <Box
                                                        sx={{
                                                            width: 12,
                                                            height: 12,
                                                            borderRadius: '50%',
                                                            bgcolor: genre.color,
                                                            mr: 1
                                                        }}
                                                    />
                                                    {genre.label}
                                                </Box>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Açıklama"
                                    value={playlistDescription}
                                    onChange={(e) => setPlaylistDescription(e.target.value)}
                                    multiline
                                    rows={3}
                                    placeholder="Bu playlist hakkında kısa bir açıklama..."
                                    autoComplete="off"
                                />
                            </Grid>
                        </Grid>
                    </TabPanel>

                    {/* Tab 1: Cover Image */}
                    <TabPanel value={tabValue} index={1}>
                        <Stack spacing={3}>
                            <Box
                                sx={{
                                    border: '2px dashed',
                                    borderColor: 'grey.300',
                                    borderRadius: 2,
                                    p: 3,
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        borderColor: 'primary.main',
                                        bgcolor: 'grey.50'
                                    }
                                }}
                                onClick={() => document.getElementById('cover-image-upload').click()}
                            >
                                <input
                                    id="cover-image-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    style={{ display: 'none' }}
                                />
                                {coverImagePreview ? (
                                    <Box>
                                        <CardMedia
                                            component="img"
                                            image={coverImagePreview}
                                            alt="Preview"
                                            sx={{
                                                width: '100%',
                                                maxHeight: 400,
                                                objectFit: 'cover',
                                                borderRadius: 2,
                                                mb: 2
                                            }}
                                        />
                                        <Button
                                            variant="outlined"
                                            startIcon={<UploadIcon />}
                                            size="small"
                                        >
                                            Değiştir
                                        </Button>
                                    </Box>
                                ) : (
                                    <Box>
                                        <UploadIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                                        <Typography variant="h6" gutterBottom>
                                            Cover Image Yükle
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Tıklayarak bir görsel seçin (Önerilen: 1:1 oran)
                                        </Typography>
                                    </Box>
                                )}
                            </Box>

                            <Divider>VEYA</Divider>

                            <TextField
                                fullWidth
                                label="Cover Image URL"
                                value={coverImage}
                                onChange={(e) => {
                                    setCoverImage(e.target.value);
                                    setCoverImagePreview(e.target.value);
                                }}
                                placeholder="https://example.com/cover.jpg"
                                helperText="Harici bir cover image linki girebilirsiniz"
                                autoComplete="off"
                            />
                        </Stack>
                    </TabPanel>

                    {/* Tab 2: Music Selection */}
                    <TabPanel value={tabValue} index={2}>
                        <Grid container spacing={2} mb={3}>
                            <Grid item xs={12} sm={8}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Müzik ara..."
                                    value={musicSearchTerm}
                                    onChange={(e) => setMusicSearchTerm(e.target.value)}
                                    InputProps={{
                                        startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                    }}
                                    autoComplete="off"
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Tür</InputLabel>
                                    <Select
                                        value={selectedMusicCategory}
                                        label="Tür"
                                        onChange={(e) => setSelectedMusicCategory(e.target.value)}
                                    >
                                        {genres.map(genre => (
                                            <MenuItem key={genre.value} value={genre.value}>
                                                <Box display="flex" alignItems="center">
                                                    <Typography sx={{ mr: 1 }}>{genre.icon}</Typography>
                                                    {genre.label}
                                                </Box>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>

                        <Alert severity="info" sx={{ mb: 2 }}>
                            Maksimum 10 müzik seçebilirsiniz. Seçilen: {selectedMusics.length}/10
                        </Alert>

                        <List sx={{ maxHeight: 450, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                            {filteredMusics.map(music => (
                                <ListItem key={music._id} divider>
                                    <ListItemIcon>
                                        <Checkbox
                                            checked={selectedMusics.includes(music._id)}
                                            onChange={() => handleMusicToggle(music._id)}
                                            color="primary"
                                            disabled={!selectedMusics.includes(music._id) && selectedMusics.length >= 10}
                                        />
                                    </ListItemIcon>
                                    {music.imageUrl && (
                                        <ListItemAvatar>
                                            <Avatar
                                                src={music.imageUrl}
                                                variant="rounded"
                                                sx={{ width: 50, height: 50 }}
                                            />
                                        </ListItemAvatar>
                                    )}
                                    <ListItemText
                                        primary={
                                            <Typography variant="subtitle2" fontWeight="bold">
                                                {music.title}
                                            </Typography>
                                        }
                                        secondary={
                                            <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
                                                <Typography variant="body2" component="span">
                                                    {music.artist}
                                                </Typography>
                                                <Chip
                                                    label={getGenreData(music.genre).label}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: getGenreData(music.genre).color,
                                                        color: 'white',
                                                        fontSize: '0.7rem'
                                                    }}
                                                />
                                            </Stack>
                                        }
                                    />
                                    <Stack direction="row" spacing={0.5}>
                                        {music.platformLinks?.appleMusic && (
                                            <Tooltip title="Apple Music">
                                                <IconButton size="small">
                                                    <AppleIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        {music.platformLinks?.youtubeMusic && (
                                            <Tooltip title="YouTube Music">
                                                <IconButton size="small">
                                                    <YouTubeIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </Stack>
                                </ListItem>
                            ))}
                        </List>

                        {filteredMusics.length === 0 && (
                            <Box textAlign="center" py={4}>
                                <SearchIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                                <Typography variant="body1" color="text.secondary" mt={2}>
                                    Arama kriterlerinize uygun müzik bulunamadı
                                </Typography>
                            </Box>
                        )}
                    </TabPanel>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={resetForm} color="inherit" disabled={submitLoading}>
                        İptal
                    </Button>
                    {tabValue < 2 && (
                        <Button
                            onClick={() => setTabValue(tabValue + 1)}
                            variant="outlined"
                        >
                            Sonraki
                        </Button>
                    )}
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={selectedMusics.length === 0 || submitLoading}
                        startIcon={submitLoading ? <CircularProgress size={20} /> : null}
                        sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                            }
                        }}
                    >
                        {submitLoading ? 'İşleniyor...' : (editingPlaylist ? 'Güncelle' : 'Oluştur')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Playlists;