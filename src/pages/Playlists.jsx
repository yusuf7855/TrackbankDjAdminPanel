import React, { useState, useEffect } from 'react';
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
    Chip,
    Stack,
    Alert,
    CircularProgress,
    Checkbox,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Tabs,
    Tab,
    Avatar,
    Fade
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Edit as EditIcon,
    Add as AddIcon,
    MusicNote as MusicIcon,
    PlaylistAdd as PlaylistAddIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    Category as CategoryIcon
} from '@mui/icons-material';
import axios from 'axios';

const Playlists = () => {
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

    const [playlistForm, setPlaylistForm] = useState({
        name: '',
        description: '',
        mainCategory: 'afrohouse',
        subCategory: ''
    });

    const categories = [
        { value: 'all', label: 'Tüm Kategoriler', color: '#4caf50' },
        { value: 'afrohouse', label: 'Afro House', color: '#ff9800' },
        { value: 'indiedance', label: 'Indie Dance', color: '#e91e63' },
        { value: 'organichouse', label: 'Organic House', color: '#8bc34a' },
        { value: 'downtempo', label: 'Down Tempo', color: '#2196f3' },
        { value: 'melodichouse', label: 'Melodic House', color: '#9c27b0' }
    ];

    useEffect(() => {
        fetchPlaylists();
        fetchMusics();
    }, []);

    useEffect(() => {
        filterMusics();
    }, [musics, selectedMusicCategory, musicSearchTerm]);

    const fetchPlaylists = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/playlists/admin');
            setPlaylists(response.data.playlists || []);
        } catch (error) {
            console.error('Error fetching playlists:', error);
            setError('Admin playlist\'leri yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const fetchMusics = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/music');
            setMusics(response.data || []);
        } catch (error) {
            console.error('Error fetching musics:', error);
            setError('Müzik kütüphanesi yüklenirken hata oluştu');
        }
    };

    const filterMusics = () => {
        let filtered = musics;

        // Category filter
        if (selectedMusicCategory !== 'all') {
            filtered = filtered.filter(music => music.category === selectedMusicCategory);
        }

        // Search filter
        if (musicSearchTerm) {
            filtered = filtered.filter(music =>
                music.title.toLowerCase().includes(musicSearchTerm.toLowerCase()) ||
                music.artist.toLowerCase().includes(musicSearchTerm.toLowerCase())
            );
        }

        setFilteredMusics(filtered);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPlaylistForm(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        if (!playlistForm.name.trim()) {
            setError('Playlist adı gereklidir');
            return false;
        }
        if (!playlistForm.subCategory.trim()) {
            setError('Alt kategori kodu gereklidir (örn: AH1, MH1)');
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

        try {
            const data = {
                ...playlistForm,
                musicIds: selectedMusics
            };

            if (editingPlaylist) {
                await axios.put(`http://localhost:5000/api/playlists/admin/${editingPlaylist._id}`, data);
                setSuccess('Admin playlist başarıyla güncellendi');
            } else {
                await axios.post('http://localhost:5000/api/playlists/admin', data);
                setSuccess('Admin playlist başarıyla oluşturuldu');
            }

            fetchPlaylists();
            resetForm();
        } catch (error) {
            console.error('Error saving playlist:', error);
            if (error.response?.data?.message?.includes('Duplicate')) {
                setError('Bu kategori ve alt kategori kombinasyonu zaten mevcut');
            } else {
                setError('Admin playlist kaydedilirken hata oluştu');
            }
        }
    };

    const handleEdit = (playlist) => {
        setEditingPlaylist(playlist);
        setPlaylistForm({
            name: playlist.name,
            description: playlist.description,
            mainCategory: playlist.mainCategory,
            subCategory: playlist.subCategory
        });
        setSelectedMusics(playlist.musics?.map(m => m._id) || []);
        setOpenDialog(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bu admin playlist\'i silmek istediğinizden emin misiniz?')) {
            try {
                await axios.delete(`http://localhost:5000/api/playlists/${id}`);
                setSuccess('Admin playlist başarıyla silindi');
                fetchPlaylists();
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

            return newSelection;
        });
    };

    const resetForm = () => {
        setPlaylistForm({
            name: '',
            description: '',
            mainCategory: 'afrohouse',
            subCategory: ''
        });
        setSelectedMusics([]);
        setEditingPlaylist(null);
        setOpenDialog(false);
        setError(null);
    };

    const getCategoryColor = (category) => {
        return categories.find(c => c.value === category)?.color || '#757575';
    };

    const filteredPlaylists = playlists.filter(playlist => {
        const matchesCategory = filterCategory === 'all' || playlist.mainCategory === filterCategory;
        const matchesSearch = playlist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            playlist.subCategory?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const TabPanel = ({ children, value, index }) => (
        <div hidden={value !== index}>
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress size={60} />
                <Typography variant="h6" sx={{ ml: 2 }}>
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
                    <Avatar sx={{ bgcolor: '#9c27b0', mr: 2 }}>
                        <PlaylistAddIcon />
                    </Avatar>
                    <Box>
                        <Typography variant="h4" fontWeight="bold">
                            Admin Kategori Playlist'leri
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                            Mobil uygulama için kategori playlist'leri yönetin (Alt kategori kodlu)
                        </Typography>
                    </Box>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
                    sx={{
                        bgcolor: '#9c27b0',
                        '&:hover': { bgcolor: '#7b1fa2' },
                        borderRadius: 2,
                        px: 3,
                        py: 1.5
                    }}
                >
                    Yeni Admin Playlist
                </Button>
            </Box>

            {/* Info Card */}
            <Card sx={{ mb: 3, bgcolor: '#f3e5f5' }}>
                <CardContent>
                    <Typography variant="h6" color="primary" gutterBottom>
                        ℹ️ Sistem Açıklaması
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        • <strong>Admin Playlist'ler:</strong> Burada oluşturulan playlist'ler mobil uygulamada kategoriler altında gözükür<br/>
                        • <strong>Kullanıcı Playlist'leri:</strong> Uygulama kullanıcıları bu admin playlist'lerindeki müziklerden kendi kişisel playlist'lerini oluşturur<br/>
                        • <strong>Ayrım:</strong> Admin ve kullanıcı playlist'leri tamamen ayrı sistemlerdir<br/>
                        • <strong>HOT Sistem:</strong> Her kategoriden en son eklenen admin playlist HOT olarak görünür
                    </Typography>
                </CardContent>
            </Card>

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
                                placeholder="Playlist veya alt kategori ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>Ana Kategori Filtresi</InputLabel>
                                <Select
                                    value={filterCategory}
                                    label="Ana Kategori Filtresi"
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                    startAdornment={<FilterIcon sx={{ mr: 1 }} />}
                                >
                                    {categories.map(category => (
                                        <MenuItem key={category.value} value={category.value}>
                                            <Box display="flex" alignItems="center">
                                                <Box
                                                    sx={{
                                                        width: 12,
                                                        height: 12,
                                                        borderRadius: '50%',
                                                        bgcolor: category.color,
                                                        mr: 1
                                                    }}
                                                />
                                                {category.label}
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={12} md={4}>
                            <Typography variant="body2" color="text.secondary">
                                Toplam: {filteredPlaylists.length} admin playlist
                            </Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Playlists Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Playlist Adı</TableCell>
                            <TableCell>Ana Kategori</TableCell>
                            <TableCell>Alt Kategori</TableCell>
                            <TableCell>Müzik Sayısı</TableCell>
                            <TableCell>Oluşturulma Tarihi</TableCell>
                            <TableCell>İşlemler</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredPlaylists.map((playlist) => (
                            <TableRow key={playlist._id}>
                                <TableCell>
                                    <Typography variant="subtitle2" fontWeight="bold">
                                        {playlist.name}
                                    </Typography>
                                    {playlist.description && (
                                        <Typography variant="body2" color="text.secondary">
                                            {playlist.description}
                                        </Typography>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={categories.find(c => c.value === playlist.mainCategory)?.label || playlist.mainCategory}
                                        size="small"
                                        sx={{
                                            bgcolor: getCategoryColor(playlist.mainCategory),
                                            color: 'white',
                                            fontWeight: 'bold'
                                        }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={playlist.subCategory}
                                        size="small"
                                        variant="outlined"
                                        sx={{
                                            borderColor: getCategoryColor(playlist.mainCategory),
                                            color: getCategoryColor(playlist.mainCategory),
                                            fontWeight: 'bold'
                                        }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        icon={<MusicIcon />}
                                        label={`${playlist.musicCount || 0} şarkı`}
                                        variant="outlined"
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" color="text.secondary">
                                        {new Date(playlist.createdAt).toLocaleDateString('tr-TR')}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleEdit(playlist)} color="primary">
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(playlist._id)} color="error">
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {filteredPlaylists.length === 0 && (
                <Card sx={{ textAlign: 'center', py: 8, mt: 3 }}>
                    <CardContent>
                        <PlaylistAddIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            Admin Playlist Bulunamadı
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={3}>
                            Yeni bir admin playlist oluşturmak için yukarıdaki butonu kullanın
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setOpenDialog(true)}
                        >
                            İlk Admin Playlist'inizi Oluşturun
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Create/Edit Admin Playlist Dialog */}
            <Dialog open={openDialog} onClose={resetForm} maxWidth="lg" fullWidth>
                <DialogTitle sx={{ pb: 1 }}>
                    <Box display="flex" alignItems="center">
                        <PlaylistAddIcon sx={{ mr: 1, color: '#9c27b0' }} />
                        {editingPlaylist ? 'Admin Playlist Düzenle' : 'Yeni Admin Playlist Oluştur'}
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                            <Tab label="Playlist Bilgileri" />
                            <Tab label={`Müzik Seçimi (${selectedMusics.length}/10)`} />
                        </Tabs>
                    </Box>

                    <TabPanel value={tabValue} index={0}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={8}>
                                <TextField
                                    fullWidth
                                    label="Admin Playlist Adı"
                                    name="name"
                                    value={playlistForm.name}
                                    onChange={handleInputChange}
                                    required
                                    error={!playlistForm.name.trim()}
                                    helperText={!playlistForm.name.trim() ? 'Playlist adı gereklidir' : ''}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    label="Alt Kategori Kodu"
                                    name="subCategory"
                                    value={playlistForm.subCategory}
                                    onChange={handleInputChange}
                                    placeholder="AH1, MH1, ID1..."
                                    required
                                    error={!playlistForm.subCategory.trim()}
                                    helperText="Örn: AH1 (Afro House 1), MH1 (Melodic House 1)"
                                    inputProps={{ style: { textTransform: 'uppercase' } }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Ana Kategori</InputLabel>
                                    <Select
                                        name="mainCategory"
                                        value={playlistForm.mainCategory}
                                        label="Ana Kategori"
                                        onChange={handleInputChange}
                                        required
                                    >
                                        {categories.filter(c => c.value !== 'all').map(category => (
                                            <MenuItem key={category.value} value={category.value}>
                                                <Box display="flex" alignItems="center">
                                                    <Box
                                                        sx={{
                                                            width: 12,
                                                            height: 12,
                                                            borderRadius: '50%',
                                                            bgcolor: category.color,
                                                            mr: 1
                                                        }}
                                                    />
                                                    {category.label}
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
                                    name="description"
                                    value={playlistForm.description}
                                    onChange={handleInputChange}
                                    multiline
                                    rows={3}
                                    placeholder="Bu admin playlist hakkında kısa bir açıklama yazın..."
                                />
                            </Grid>
                        </Grid>
                    </TabPanel>

                    <TabPanel value={tabValue} index={1}>
                        <Grid container spacing={2} mb={3}>
                            <Grid item xs={12} sm={8}>
                                <TextField
                                    fullWidth
                                    placeholder="Müzik ara..."
                                    value={musicSearchTerm}
                                    onChange={(e) => setMusicSearchTerm(e.target.value)}
                                    InputProps={{
                                        startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <FormControl fullWidth>
                                    <InputLabel>Müzik Kategorisi</InputLabel>
                                    <Select
                                        value={selectedMusicCategory}
                                        label="Müzik Kategorisi"
                                        onChange={(e) => setSelectedMusicCategory(e.target.value)}
                                    >
                                        {categories.map(category => (
                                            <MenuItem key={category.value} value={category.value}>
                                                <Box display="flex" alignItems="center">
                                                    <Box
                                                        sx={{
                                                            width: 12,
                                                            height: 12,
                                                            borderRadius: '50%',
                                                            bgcolor: category.color,
                                                            mr: 1
                                                        }}
                                                    />
                                                    {category.label}
                                                </Box>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>

                        <Alert severity="info" sx={{ mb: 2 }}>
                            Maksimum 10 müzik seçebilirsiniz. Seçilen müziklerin kategorisi otomatik olarak playlist'in ana kategorisi ile aynı yapılacak.
                        </Alert>

                        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
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
                                    <ListItemText
                                        primary={music.title}
                                        secondary={
                                            <Box display="flex" alignItems="center" mt={0.5}>
                                                <Typography variant="body2" component="span">
                                                    {music.artist} • {music.category}
                                                </Typography>
                                                <Chip
                                                    label={`${music.likes || 0} beğeni`}
                                                    size="small"
                                                    sx={{ ml: 1 }}
                                                />
                                            </Box>
                                        }
                                    />
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
                    <Button onClick={resetForm} color="inherit">
                        İptal
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        sx={{ bgcolor: '#9c27b0', '&:hover': { bgcolor: '#7b1fa2' } }}
                        disabled={selectedMusics.length === 0}
                    >
                        {editingPlaylist ? 'Güncelle' : 'Oluştur'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
