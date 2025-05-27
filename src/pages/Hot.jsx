import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Grid,
    Switch,
    FormControlLabel,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Checkbox,
    Tabs,
    Tab,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    CardActions,
    Divider,
    Avatar,
    Stack,
    Fade
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    MusicNote as MusicIcon,
    PlaylistAdd as PlaylistAddIcon,
    Remove as RemoveIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    Whatshot as HotIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    DragIndicator as DragIcon
} from '@mui/icons-material';
import axios from 'axios';

const Hot = () => {
    // State management
    const [hots, setHots] = useState([]);
    const [musics, setMusics] = useState([]);
    const [filteredMusics, setFilteredMusics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [openMusicDialog, setOpenMusicDialog] = useState(false);
    const [editingHot, setEditingHot] = useState(null);
    const [selectedHot, setSelectedHot] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedMusics, setSelectedMusics] = useState([]);
    const [tabValue, setTabValue] = useState(0);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');

    const [hotForm, setHotForm] = useState({
        name: '',
        description: '',
        category: 'all',
        isActive: true,
        order: 0
    });

    const categories = [
        { value: 'all', label: 'All Categories', color: '#4caf50' },
        { value: 'afrohouse', label: 'Afro House', color: '#ff9800' },
        { value: 'indiedance', label: 'Indie Dance', color: '#e91e63' },
        { value: 'organichouse', label: 'Organic House', color: '#8bc34a' },
        { value: 'downtempo', label: 'Down Tempo', color: '#2196f3' },
        { value: 'melodichouse', label: 'Melodic House', color: '#9c27b0' }
    ];

    useEffect(() => {
        fetchHots();
        fetchMusics();
    }, []);

    useEffect(() => {
        filterMusics();
    }, [musics, selectedCategory, searchTerm]);

    const fetchHots = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/hot');
            setHots(response.data.hots || []);
        } catch (error) {
            console.error('Error fetching hots:', error);
            setError('HOT playlistleri yüklenirken hata oluştu');
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
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(music => music.category === selectedCategory);
        }

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(music =>
                music.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                music.artist.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredMusics(filtered);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setHotForm({
            ...hotForm,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async () => {
        if (!hotForm.name.trim()) {
            setError('Playlist adı gereklidir');
            return;
        }

        try {
            if (editingHot) {
                await axios.put(`http://localhost:5000/api/hot/${editingHot._id}`, hotForm);
                setSuccess('HOT playlist başarıyla güncellendi');
            } else {
                await axios.post('http://localhost:5000/api/hot', hotForm);
                setSuccess('HOT playlist başarıyla oluşturuldu');
            }
            fetchHots();
            resetForm();
        } catch (error) {
            console.error('Error saving hot:', error);
            setError('HOT playlist kaydedilirken hata oluştu');
        }
    };

    const handleEdit = (hot) => {
        setEditingHot(hot);
        setHotForm({
            name: hot.name,
            description: hot.description,
            category: hot.category,
            isActive: hot.isActive,
            order: hot.order
        });
        setOpenDialog(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bu HOT playlist\'i silmek istediğinizden emin misiniz?')) {
            try {
                await axios.delete(`http://localhost:5000/api/hot/${id}`);
                setSuccess('HOT playlist başarıyla silindi');
                fetchHots();
            } catch (error) {
                console.error('Error deleting hot:', error);
                setError('HOT playlist silinirken hata oluştu');
            }
        }
    };

    const handleToggleActive = async (hot) => {
        try {
            await axios.put(`http://localhost:5000/api/hot/${hot._id}`, {
                ...hot,
                isActive: !hot.isActive
            });
            setSuccess(`HOT playlist ${!hot.isActive ? 'etkinleştirildi' : 'devre dışı bırakıldı'}`);
            fetchHots();
        } catch (error) {
            console.error('Error toggling active status:', error);
            setError('Durum güncellenirken hata oluştu');
        }
    };

    const handleManageMusics = (hot) => {
        setSelectedHot(hot);
        setSelectedMusics(hot.musics?.map(m => m._id) || []);
        setOpenMusicDialog(true);
    };

    const handleMusicToggle = (musicId) => {
        setSelectedMusics(prev =>
            prev.includes(musicId)
                ? prev.filter(id => id !== musicId)
                : [...prev, musicId]
        );
    };

    const handleSaveMusics = async () => {
        try {
            await axios.put(`http://localhost:5000/api/hot/${selectedHot._id}`, {
                ...selectedHot,
                musics: selectedMusics
            });
            setSuccess('Müzikler başarıyla güncellendi');
            fetchHots();
            setOpenMusicDialog(false);
        } catch (error) {
            console.error('Error updating musics:', error);
            setError('Müzikler güncellenirken hata oluştu');
        }
    };

    const resetForm = () => {
        setHotForm({
            name: '',
            description: '',
            category: 'all',
            isActive: true,
            order: 0
        });
        setEditingHot(null);
        setOpenDialog(false);
    };

    const getCategoryColor = (category) => {
        return categories.find(c => c.value === category)?.color || '#757575';
    };

    const filteredHots = hots.filter(hot => {
        const matchesCategory = filterCategory === 'all' || hot.category === filterCategory;
        const matchesSearch = hot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            hot.description.toLowerCase().includes(searchTerm.toLowerCase());
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
                    HOT Playlistleri Yükleniyor...
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: '#ff6b35', mr: 2 }}>
                        <HotIcon />
                    </Avatar>
                    <Box>
                        <Typography variant="h4" fontWeight="bold">
                            HOT Playlists Yönetimi
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                            Öne çıkan müzik playlistlerini yönetin
                        </Typography>
                    </Box>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
                    sx={{
                        bgcolor: '#ff6b35',
                        '&:hover': { bgcolor: '#e55a2b' },
                        borderRadius: 2,
                        px: 3,
                        py: 1.5
                    }}
                >
                    Yeni HOT Playlist
                </Button>
            </Box>

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
                                placeholder="Playlist ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>Kategori Filtresi</InputLabel>
                                <Select
                                    value={filterCategory}
                                    label="Kategori Filtresi"
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
                                Toplam: {filteredHots.length} playlist
                            </Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* HOT Playlists Cards */}
            <Grid container spacing={3}>
                {filteredHots.map((hot) => (
                    <Grid item xs={12} sm={6} md={4} key={hot._id}>
                        <Card
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 4
                                }
                            }}
                        >
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                    <Box>
                                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                                            {hot.name}
                                        </Typography>
                                        <Chip
                                            label={categories.find(c => c.value === hot.category)?.label || hot.category}
                                            size="small"
                                            sx={{
                                                bgcolor: getCategoryColor(hot.category),
                                                color: 'white',
                                                fontWeight: 'bold'
                                            }}
                                        />
                                    </Box>
                                    <Box display="flex" alignItems="center">
                                        <DragIcon sx={{ color: 'text.secondary', mr: 1 }} />
                                        <Typography variant="body2" color="text.secondary">
                                            #{hot.order}
                                        </Typography>
                                    </Box>
                                </Box>

                                {hot.description && (
                                    <Typography variant="body2" color="text.secondary" mb={2}>
                                        {hot.description}
                                    </Typography>
                                )}

                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                    <Chip
                                        icon={<MusicIcon />}
                                        label={`${hot.musicCount || 0} şarkı`}
                                        variant="outlined"
                                        size="small"
                                    />
                                    <Chip
                                        label={hot.isActive ? 'Aktif' : 'Pasif'}
                                        size="small"
                                        color={hot.isActive ? 'success' : 'default'}
                                        variant={hot.isActive ? 'filled' : 'outlined'}
                                    />
                                </Box>
                            </CardContent>

                            <Divider />

                            <CardActions>
                                <Button
                                    size="small"
                                    onClick={() => handleManageMusics(hot)}
                                    startIcon={<PlaylistAddIcon />}
                                >
                                    Müzikler
                                </Button>
                                <Button
                                    size="small"
                                    onClick={() => handleEdit(hot)}
                                    startIcon={<EditIcon />}
                                >
                                    Düzenle
                                </Button>
                                <IconButton
                                    size="small"
                                    onClick={() => handleToggleActive(hot)}
                                    color={hot.isActive ? 'success' : 'default'}
                                >
                                    {hot.isActive ? <VisibilityIcon /> : <VisibilityOffIcon />}
                                </IconButton>
                                <IconButton
                                    size="small"
                                    onClick={() => handleDelete(hot._id)}
                                    color="error"
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {filteredHots.length === 0 && (
                <Card sx={{ textAlign: 'center', py: 8 }}>
                    <CardContent>
                        <HotIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            HOT Playlist Bulunamadı
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={3}>
                            Yeni bir HOT playlist oluşturmak için yukarıdaki butonu kullanın
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setOpenDialog(true)}
                        >
                            İlk HOT Playlist'inizi Oluşturun
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Create/Edit HOT Dialog */}
            <Dialog open={openDialog} onClose={resetForm} maxWidth="md" fullWidth>
                <DialogTitle sx={{ pb: 1 }}>
                    <Box display="flex" alignItems="center">
                        <HotIcon sx={{ mr: 1, color: '#ff6b35' }} />
                        {editingHot ? 'HOT Playlist Düzenle' : 'Yeni HOT Playlist Oluştur'}
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={8}>
                            <TextField
                                fullWidth
                                label="Playlist Adı"
                                name="name"
                                value={hotForm.name}
                                onChange={handleInputChange}
                                required
                                error={!hotForm.name.trim()}
                                helperText={!hotForm.name.trim() ? 'Playlist adı gereklidir' : ''}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Sıra"
                                name="order"
                                type="number"
                                value={hotForm.order}
                                onChange={handleInputChange}
                                inputProps={{ min: 0 }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Kategori</InputLabel>
                                <Select
                                    name="category"
                                    value={hotForm.category}
                                    label="Kategori"
                                    onChange={handleInputChange}
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
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Açıklama"
                                name="description"
                                value={hotForm.description}
                                onChange={handleInputChange}
                                multiline
                                rows={3}
                                placeholder="Bu HOT playlist hakkında kısa bir açıklama yazın..."
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={hotForm.isActive}
                                        onChange={handleInputChange}
                                        name="isActive"
                                        color="success"
                                    />
                                }
                                label="Aktif (Uygulamada görünür)"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={resetForm} color="inherit">
                        İptal
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        sx={{ bgcolor: '#ff6b35', '&:hover': { bgcolor: '#e55a2b' } }}
                    >
                        {editingHot ? 'Güncelle' : 'Oluştur'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Manage Musics Dialog */}
            <Dialog open={openMusicDialog} onClose={() => setOpenMusicDialog(false)} maxWidth="lg" fullWidth>
                <DialogTitle>
                    <Box display="flex" alignItems="center">
                        <PlaylistAddIcon sx={{ mr: 1, color: '#ff6b35' }} />
                        "{selectedHot?.name}" için Müzik Yönetimi
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                            <Tab label={`Seçili Müzikler (${selectedMusics.length})`} />
                            <Tab label="Müzik Ekle" />
                        </Tabs>
                    </Box>

                    <TabPanel value={tabValue} index={0}>
                        <Typography variant="h6" mb={2} color="primary">
                            Seçili Müzikler ({selectedMusics.length})
                        </Typography>
                        {selectedMusics.length === 0 ? (
                            <Box textAlign="center" py={4}>
                                <MusicIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                                <Typography variant="body1" color="text.secondary" mt={2}>
                                    Henüz müzik seçilmedi
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    "Müzik Ekle" sekmesinden müzik ekleyebilirsiniz
                                </Typography>
                            </Box>
                        ) : (
                            <List>
                                {selectedMusics.map(musicId => {
                                    const music = musics.find(m => m._id === musicId);
                                    if (!music) return null;
                                    return (
                                        <ListItem key={musicId} divider>
                                            <ListItemText
                                                primary={music.title}
                                                secondary={
                                                    <Box>
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
                                            <ListItemSecondaryAction>
                                                <IconButton
                                                    edge="end"
                                                    onClick={() => handleMusicToggle(musicId)}
                                                    color="error"
                                                >
                                                    <RemoveIcon />
                                                </IconButton>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    );
                                })}
                            </List>
                        )}
                    </TabPanel>

                    <TabPanel value={tabValue} index={1}>
                        <Grid container spacing={2} mb={3}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    placeholder="Müzik ara..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    InputProps={{
                                        startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Kategori Filtresi</InputLabel>
                                    <Select
                                        value={selectedCategory}
                                        label="Kategori Filtresi"
                                        onChange={(e) => setSelectedCategory(e.target.value)}
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

                        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                            {filteredMusics.map(music => (
                                <ListItem key={music._id} divider>
                                    <Checkbox
                                        checked={selectedMusics.includes(music._id)}
                                        onChange={() => handleMusicToggle(music._id)}
                                        color="primary"
                                    />
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
                    <Button onClick={() => setOpenMusicDialog(false)} color="inherit">
                        İptal
                    </Button>
                    <Button
                        onClick={handleSaveMusics}
                        variant="contained"
                        startIcon={<PlaylistAddIcon />}
                        sx={{ bgcolor: '#ff6b35', '&:hover': { bgcolor: '#e55a2b' } }}
                    >
                        Değişiklikleri Kaydet
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Hot;