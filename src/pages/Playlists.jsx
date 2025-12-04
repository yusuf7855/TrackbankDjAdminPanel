// Playlists.jsx - MUSICS IS NOT ITERABLE HATASI DÜZELTİLMİŞ
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
    // ✅ State tanımlamaları - musics için boş array başlangıç değeri
    const [playlists, setPlaylists] = useState([]);
    const [musics, setMusics] = useState([]); // ✅ Başlangıç değeri boş array
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

    // ✅ Fetch fonksiyonları - DÜZELTİLMİŞ
    const fetchPlaylists = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/playlists/admin`);
            // Response yapısını kontrol et
            const playlistData = response.data?.playlists || response.data?.data?.playlists || [];
            setPlaylists(Array.isArray(playlistData) ? playlistData : []);
        } catch (error) {
            console.error('Error fetching playlists:', error);
            setError('Admin playlist\'leri yüklenirken hata oluştu');
            setPlaylists([]); // ✅ Hata durumunda boş array
        } finally {
            setLoading(false);
        }
    }, []);

    // ✅ fetchMusics - HATA DÜZELTİLDİ
    const fetchMusics = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/music`);

            // ✅ Response yapısını doğru şekilde parse et
            // Backend: { success: true, data: { musics: [...], pagination: {...} } }
            // veya: { success: true, musics: [...] }
            let musicData = [];

            if (response.data?.data?.musics) {
                // Yeni format: response.data.data.musics
                musicData = response.data.data.musics;
            } else if (response.data?.musics) {
                // Alternatif format: response.data.musics
                musicData = response.data.musics;
            } else if (response.data?.music) {
                // Eski format: response.data.music
                musicData = response.data.music;
            } else if (Array.isArray(response.data?.data)) {
                // response.data.data array ise
                musicData = response.data.data;
            } else if (Array.isArray(response.data)) {
                // response.data direkt array ise
                musicData = response.data;
            }

            // ✅ Her zaman array olduğundan emin ol
            setMusics(Array.isArray(musicData) ? musicData : []);

        } catch (error) {
            console.error('Error fetching musics:', error);
            setError('Müzik kütüphanesi yüklenirken hata oluştu');
            setMusics([]); // ✅ Hata durumunda boş array set et
        }
    }, []);

    useEffect(() => {
        fetchPlaylists();
        fetchMusics();
    }, [fetchPlaylists, fetchMusics]);

    // ✅ Filter musics - GÜVENLİ SPREAD OPERATÖRÜ
    useEffect(() => {
        // ✅ musics'in array olduğundan emin ol
        if (!Array.isArray(musics)) {
            setFilteredMusics([]);
            return;
        }

        let filtered = [...musics]; // ✅ Artık güvenli

        if (selectedMusicCategory !== 'all') {
            filtered = filtered.filter(music => music?.genre === selectedMusicCategory);
        }

        if (musicSearchTerm) {
            const searchLower = musicSearchTerm.toLowerCase();
            filtered = filtered.filter(music =>
                music?.title?.toLowerCase().includes(searchLower) ||
                music?.artist?.toLowerCase().includes(searchLower) ||
                music?.artistNames?.toLowerCase().includes(searchLower)
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

    // ✅ handleEdit - GÜVENLİ MUSİCS ERİŞİMİ
    const handleEdit = (playlist) => {
        setEditingPlaylist(playlist);
        setPlaylistName(playlist.name || '');
        setPlaylistDescription(playlist.description || '');
        setPlaylistGenre(playlist.genre || 'afrohouse');
        setPlaylistSubCategory(playlist.subCategory || '');
        setCoverImage(playlist.coverImage || '');
        setCoverImagePreview(playlist.coverImage || null);

        // ✅ Güvenli musics erişimi
        const musicIds = Array.isArray(playlist.musics)
            ? playlist.musics.map(m => m?._id || m).filter(Boolean)
            : [];
        setSelectedMusics(musicIds);

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
            const prevArray = Array.isArray(prev) ? prev : [];
            const newSelection = prevArray.includes(musicId)
                ? prevArray.filter(id => id !== musicId)
                : [...prevArray, musicId];

            if (newSelection.length > 10) {
                setError('Maksimum 10 müzik seçebilirsiniz');
                return prevArray;
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

    // ✅ Filtered playlists - GÜVENLİ FİLTRELEME
    const filteredPlaylists = useMemo(() => {
        if (!Array.isArray(playlists)) return [];

        return playlists.filter(playlist => {
            if (!playlist) return false;
            const matchesCategory = filterCategory === 'all' || playlist.genre === filterCategory;
            const matchesSearch =
                playlist.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                playlist.subCategory?.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [playlists, filterCategory, searchTerm]);

    // Auto-clear messages
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

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
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">
                        🎵 Admin Playlist Yönetimi
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mt={0.5}>
                        {filteredPlaylists.length} playlist • {musics.length} müzik mevcut
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
                    sx={{
                        background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                        boxShadow: '0 3px 15px rgba(102, 126, 234, 0.3)',
                    }}
                >
                    Yeni Admin Playlist
                </Button>
            </Box>

            {/* Alerts */}
            {success && (
                <Fade in>
                    <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
                        {success}
                    </Alert>
                </Fade>
            )}
            {error && (
                <Fade in>
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                </Fade>
            )}

            {/* Filters */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            placeholder="Playlist ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            }}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Kategori</InputLabel>
                            <Select
                                value={filterCategory}
                                label="Kategori"
                                onChange={(e) => setFilterCategory(e.target.value)}
                            >
                                {genres.map(genre => (
                                    <MenuItem key={genre.value} value={genre.value}>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <span>{genre.icon}</span>
                                            <span>{genre.label}</span>
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>

            {/* Playlist Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'grey.100' }}>
                            <TableCell>Cover</TableCell>
                            <TableCell>Playlist</TableCell>
                            <TableCell>Kategori</TableCell>
                            <TableCell>Alt Kategori</TableCell>
                            <TableCell align="center">Müzik</TableCell>
                            <TableCell align="center">Beğeni</TableCell>
                            <TableCell align="center">İzlenme</TableCell>
                            <TableCell align="right">İşlemler</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredPlaylists.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                    <Typography color="text.secondary">
                                        {searchTerm || filterCategory !== 'all'
                                            ? 'Arama kriterlerine uygun playlist bulunamadı'
                                            : 'Henüz admin playlist oluşturulmamış'}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredPlaylists.map((playlist) => {
                                const genreData = getGenreData(playlist.genre);
                                const musicCount = Array.isArray(playlist.musics)
                                    ? playlist.musics.length
                                    : (playlist.musicCount || 0);

                                return (
                                    <TableRow key={playlist._id} hover>
                                        <TableCell>
                                            <Avatar
                                                src={playlist.coverImage}
                                                variant="rounded"
                                                sx={{ width: 56, height: 56 }}
                                            >
                                                <MusicIcon />
                                            </Avatar>
                                        </TableCell>
                                        <TableCell>
                                            <Typography fontWeight="medium">
                                                {playlist.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {playlist.description?.substring(0, 50)}
                                                {playlist.description?.length > 50 ? '...' : ''}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={`${genreData.icon} ${genreData.label}`}
                                                size="small"
                                                sx={{
                                                    backgroundColor: genreData.color,
                                                    color: 'white'
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={playlist.subCategory}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                icon={<MusicIcon />}
                                                label={musicCount}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                                                <FavoriteIcon fontSize="small" color="error" />
                                                <Typography variant="body2">{playlist.likes || 0}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                                                <ViewsIcon fontSize="small" color="action" />
                                                <Typography variant="body2">{playlist.views || 0}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Düzenle">
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => handleEdit(playlist)}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Sil">
                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleDelete(playlist._id)}
                                                >
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

            {/* Create/Edit Dialog */}
            <Dialog
                open={openDialog}
                onClose={resetForm}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 2 }
                }}
            >
                <DialogTitle>
                    <Box display="flex" alignItems="center" gap={1}>
                        <PlaylistAddIcon color="primary" />
                        {editingPlaylist ? 'Admin Playlist Düzenle' : 'Yeni Admin Playlist'}
                    </Box>
                </DialogTitle>

                <DialogContent dividers>
                    <Tabs
                        value={tabValue}
                        onChange={(e, newValue) => setTabValue(newValue)}
                        sx={{ mb: 2 }}
                    >
                        <Tab label="Temel Bilgiler" />
                        <Tab label={`Müzik Seç (${selectedMusics.length}/10)`} />
                    </Tabs>

                    <TabPanel value={tabValue} index={0}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={8}>
                                <Stack spacing={2}>
                                    <TextField
                                        label="Playlist Adı"
                                        value={playlistName}
                                        onChange={(e) => setPlaylistName(e.target.value)}
                                        fullWidth
                                        required
                                    />
                                    <TextField
                                        label="Açıklama"
                                        value={playlistDescription}
                                        onChange={(e) => setPlaylistDescription(e.target.value)}
                                        fullWidth
                                        multiline
                                        rows={3}
                                    />
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <FormControl fullWidth required>
                                                <InputLabel>Kategori</InputLabel>
                                                <Select
                                                    value={playlistGenre}
                                                    label="Kategori"
                                                    onChange={(e) => setPlaylistGenre(e.target.value)}
                                                >
                                                    {genres.filter(g => g.value !== 'all').map(genre => (
                                                        <MenuItem key={genre.value} value={genre.value}>
                                                            <Box display="flex" alignItems="center" gap={1}>
                                                                <span>{genre.icon}</span>
                                                                <span>{genre.label}</span>
                                                            </Box>
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <TextField
                                                label="Alt Kategori Kodu"
                                                value={playlistSubCategory}
                                                onChange={(e) => setPlaylistSubCategory(e.target.value.toUpperCase())}
                                                fullWidth
                                                required
                                                placeholder="AH1, MH2, ID3..."
                                                helperText="Format: 2 harf + sayı (örn: AH1)"
                                            />
                                        </Grid>
                                    </Grid>
                                </Stack>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Box
                                    sx={{
                                        border: '2px dashed',
                                        borderColor: 'grey.300',
                                        borderRadius: 2,
                                        p: 2,
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        '&:hover': { borderColor: 'primary.main' }
                                    }}
                                    component="label"
                                >
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                    {coverImagePreview ? (
                                        <Box>
                                            <img
                                                src={coverImagePreview}
                                                alt="Cover"
                                                style={{
                                                    width: '100%',
                                                    height: 150,
                                                    objectFit: 'cover',
                                                    borderRadius: 8
                                                }}
                                            />
                                            <Typography variant="caption" color="text.secondary" mt={1}>
                                                Değiştirmek için tıklayın
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Box py={4}>
                                            <UploadIcon sx={{ fontSize: 48, color: 'grey.400' }} />
                                            <Typography variant="body2" color="text.secondary" mt={1}>
                                                Kapak Resmi Yükle
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Grid>
                        </Grid>
                    </TabPanel>

                    <TabPanel value={tabValue} index={1}>
                        <Box mb={2}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={8}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        placeholder="Müzik ara..."
                                        value={musicSearchTerm}
                                        onChange={(e) => setMusicSearchTerm(e.target.value)}
                                        InputProps={{
                                            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Kategori</InputLabel>
                                        <Select
                                            value={selectedMusicCategory}
                                            label="Kategori"
                                            onChange={(e) => setSelectedMusicCategory(e.target.value)}
                                        >
                                            {genres.map(genre => (
                                                <MenuItem key={genre.value} value={genre.value}>
                                                    {genre.icon} {genre.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Box>

                        {selectedMusics.length > 0 && (
                            <Alert severity="info" sx={{ mb: 2 }}>
                                {selectedMusics.length} müzik seçildi (Maksimum 10)
                            </Alert>
                        )}

                        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                            {filteredMusics.length === 0 ? (
                                <ListItem>
                                    <ListItemText
                                        primary="Müzik bulunamadı"
                                        secondary={musics.length === 0
                                            ? "Müzik kütüphanesi yüklenemedi"
                                            : "Arama kriterlerinizi değiştirin"}
                                    />
                                </ListItem>
                            ) : (
                                filteredMusics.map((music) => {
                                    const isSelected = selectedMusics.includes(music._id);
                                    const genreData = getGenreData(music.genre);

                                    return (
                                        <ListItem
                                            key={music._id}
                                            button
                                            onClick={() => handleMusicToggle(music._id)}
                                            sx={{
                                                borderRadius: 1,
                                                mb: 0.5,
                                                backgroundColor: isSelected ? 'action.selected' : 'transparent'
                                            }}
                                        >
                                            <ListItemIcon>
                                                <Checkbox checked={isSelected} />
                                            </ListItemIcon>
                                            <ListItemAvatar>
                                                <Avatar
                                                    src={music.imageUrl}
                                                    variant="rounded"
                                                >
                                                    <MusicIcon />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={music.title}
                                                secondary={
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <Typography variant="caption">
                                                            {music.artist || music.artistNames}
                                                        </Typography>
                                                        <Chip
                                                            label={genreData.label}
                                                            size="small"
                                                            sx={{
                                                                height: 18,
                                                                fontSize: 10,
                                                                backgroundColor: genreData.color,
                                                                color: 'white'
                                                            }}
                                                        />
                                                    </Box>
                                                }
                                            />
                                            <Box display="flex" gap={1}>
                                                <Chip
                                                    icon={<FavoriteIcon sx={{ fontSize: 12 }} />}
                                                    label={music.likes || 0}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                                <Chip
                                                    icon={<ViewsIcon sx={{ fontSize: 12 }} />}
                                                    label={music.views || 0}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </Box>
                                        </ListItem>
                                    );
                                })
                            )}
                        </List>
                    </TabPanel>
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={resetForm} disabled={submitLoading}>
                        İptal
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={submitLoading}
                        startIcon={submitLoading ? <CircularProgress size={20} /> : <AddIcon />}
                    >
                        {editingPlaylist ? 'Güncelle' : 'Oluştur'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Playlists;