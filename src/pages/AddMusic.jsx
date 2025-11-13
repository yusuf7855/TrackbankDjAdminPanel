import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
    Card,
    CardContent,
    Alert,
    Chip,
    Stack,
    IconButton,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Avatar,
    Fade
} from '@mui/material';
import {
    Add as AddIcon,
    MusicNote as MusicIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Search as SearchIcon,
    CloudUpload as UploadIcon,
    Preview as PreviewIcon,
    Save as SaveIcon,
    Clear as ClearIcon,
    Check as CheckIcon
} from '@mui/icons-material';
import axios from 'axios';

const AddMusic = () => {
    const [musicForm, setMusicForm] = useState({
        spotifyId: '',
        title: '',
        artist: '',
        beatportUrl: '',
        category: 'afrohouse'
    });

    const [musicList, setMusicList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [editingMusic, setEditingMusic] = useState(null);
    const [openEditDialog, setOpenEditDialog] = useState(false);

    const categories = [
        { value: 'all', label: 'Tüm Kategoriler', color: '#4caf50' },
        { value: 'afrohouse', label: 'Afro House', color: '#ff9800' },
        { value: 'indiedance', label: 'Indie Dance', color: '#e91e63' },
        { value: 'organichouse', label: 'Organic House', color: '#8bc34a' },
        { value: 'downtempo', label: 'Down Tempo', color: '#2196f3' },
        { value: 'melodichouse', label: 'Melodic House', color: '#9c27b0' }
    ];

    useEffect(() => {
        fetchMusic();
    }, []);

    const fetchMusic = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/music');
            setMusicList(response.data || []);
        } catch (error) {
            console.error('Error fetching music:', error);
            setError('Müzik listesi yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setMusicForm({ ...musicForm, [name]: value });
    };

    const extractSpotifyId = (url) => {
        // Spotify URL'den ID çıkarma
        const match = url.match(/track\/([a-zA-Z0-9]+)/);
        return match ? match[1] : url;
    };

    const handleSpotifyUrlChange = (e) => {
        const url = e.target.value;
        const spotifyId = extractSpotifyId(url);
        setMusicForm({ ...musicForm, spotifyId });
    };

    const validateForm = () => {
        if (!musicForm.spotifyId.trim()) {
            setError('Spotify ID gereklidir');
            return false;
        }
        if (!musicForm.title.trim()) {
            setError('Şarkı adı gereklidir');
            return false;
        }
        if (!musicForm.artist.trim()) {
            setError('Sanatçı adı gereklidir');
            return false;
        }
        if (!musicForm.beatportUrl.trim()) {
            setError('Beatport URL gereklidir');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setSubmitLoading(true);
        setError(null);

        try {
            await axios.post('http://localhost:5000/api/music', musicForm);
            setSuccess('Müzik başarıyla eklendi!');
            setMusicForm({
                spotifyId: '',
                title: '',
                artist: '',
                beatportUrl: '',
                category: 'afrohouse'
            });
            fetchMusic();
        } catch (error) {
            console.error('Error adding music:', error);
            setError(error.response?.data?.message || 'Müzik eklenirken hata oluştu');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleEdit = (music) => {
        setEditingMusic({
            ...music,
            beatportUrl: music.beatportUrl || ''
        });
        setOpenEditDialog(true);
    };

    const handleUpdateMusic = async () => {
        setSubmitLoading(true);
        try {
            await axios.put(`http://localhost:5000/api/music/${editingMusic._id}`, editingMusic);
            setSuccess('Müzik başarıyla güncellendi!');
            setOpenEditDialog(false);
            setEditingMusic(null);
            await fetchMusic();
            // eslint-disable-next-line no-unused-vars
        } catch (_) {
            setError('Müzik güncellenirken hata oluştu');
        }
        finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bu müziği silmek istediğinizden emin misiniz?')) {
            try {
                await axios.delete(`http://localhost:5000/api/music/${id}`);
                setSuccess('Müzik başarıyla silindi!');
                fetchMusic();
                // eslint-disable-next-line no-unused-vars
            } catch (error) {
                setError('Müzik silinirken hata oluştu');
            }
        }
    };

    const clearForm = () => {
        setMusicForm({
            spotifyId: '',
            title: '',
            artist: '',
            beatportUrl: '',
            category: 'afrohouse'
        });
        setError(null);
    };

    const filteredMusic = musicList.filter(music => {
        const matchesSearch = music.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            music.artist.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || music.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const getCategoryColor = (category) => {
        return categories.find(c => c.value === category)?.color || '#757575';
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box display="flex" alignItems="center" mb={4}>
                <Avatar sx={{ bgcolor: '#1976d2', mr: 2, width: 56, height: 56 }}>
                    <MusicIcon />
                </Avatar>
                <Box>
                    <Typography variant="h4" fontWeight="bold">
                        Müzik Yönetimi
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Spotify müziklerini sisteme ekleyin ve yönetin
                    </Typography>
                </Box>
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

            <Grid container spacing={3}>
                <Grid item xs={12} md={5}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                                <Typography variant="h6" fontWeight="bold">
                                    Yeni Müzik Ekle
                                </Typography>
                                <Button
                                    size="small"
                                    onClick={clearForm}
                                    startIcon={<ClearIcon />}
                                    color="inherit"
                                >
                                    Temizle
                                </Button>
                            </Box>

                            <form onSubmit={handleSubmit}>
                                <Stack spacing={3}>
                                    <TextField
                                        fullWidth
                                        label="Spotify URL veya ID"
                                        name="spotifyId"
                                        value={musicForm.spotifyId}
                                        onChange={handleSpotifyUrlChange}
                                        placeholder="https://open.spotify.com/track/... veya sadece ID"
                                        required
                                        helperText="Spotify track URL'ini yapıştırın veya sadece track ID'sini girin"
                                    />

                                    <TextField
                                        fullWidth
                                        label="Şarkı Adı"
                                        name="title"
                                        value={musicForm.title}
                                        onChange={handleInputChange}
                                        required
                                    />

                                    <TextField
                                        fullWidth
                                        label="Sanatçı"
                                        name="artist"
                                        value={musicForm.artist}
                                        onChange={handleInputChange}
                                        required
                                    />

                                    <TextField
                                        fullWidth
                                        label="Beatport URL"
                                        name="beatportUrl"
                                        value={musicForm.beatportUrl}
                                        onChange={handleInputChange}
                                        placeholder="https://www.beatport.com/track/..."
                                        required
                                        helperText="Müziğin Beatport satış linkini girin"
                                    />

                                    <FormControl fullWidth>
                                        <InputLabel>Kategori</InputLabel>
                                        <Select
                                            name="category"
                                            value={musicForm.category}
                                            label="Kategori"
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

                                    {/* Preview Section */}
                                    {musicForm.spotifyId && (
                                        <Box
                                            sx={{
                                                p: 2,
                                                bgcolor: 'grey.50',
                                                borderRadius: 2,
                                                border: '1px solid',
                                                borderColor: 'grey.200'
                                            }}
                                        >
                                            <Typography variant="subtitle2" gutterBottom>
                                                Spotify Preview:
                                            </Typography>
                                            <iframe
                                                src={`https://open.spotify.com/embed/track/${musicForm.spotifyId}?utm_source=generator&theme=0`}
                                                width="100%"
                                                height="80"
                                                frameBorder="0"
                                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                                loading="lazy"
                                                style={{ borderRadius: '8px' }}
                                            />
                                        </Box>
                                    )}

                                    <Button
                                        type="submit"
                                        variant="contained"
                                        size="large"
                                        fullWidth
                                        disabled={submitLoading}
                                        startIcon={submitLoading ? <CircularProgress size={20} /> : <AddIcon />}
                                        sx={{
                                            py: 1.5,
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                                            }
                                        }}
                                    >
                                        {submitLoading ? 'Ekleniyor...' : 'Müzik Ekle'}
                                    </Button>
                                </Stack>
                            </form>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Music List */}
                <Grid item xs={12} md={7}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                                <Typography variant="h6" fontWeight="bold">
                                    Müzik Listesi ({filteredMusic.length})
                                </Typography>
                                <Button
                                    size="small"
                                    onClick={fetchMusic}
                                    startIcon={<SearchIcon />}
                                    color="inherit"
                                >
                                    Yenile
                                </Button>
                            </Box>

                            {/* Filters */}
                            <Grid container spacing={2} mb={3}>
                                <Grid item xs={12} sm={8}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        placeholder="Şarkı veya sanatçı ara..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        InputProps={{
                                            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Kategori</InputLabel>
                                        <Select
                                            value={filterCategory}
                                            label="Kategori"
                                            onChange={(e) => setFilterCategory(e.target.value)}
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

                            {loading ? (
                                <Box display="flex" justifyContent="center" py={4}>
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <List sx={{ maxHeight: 600, overflow: 'auto' }}>
                                    {filteredMusic.map((music, index) => (
                                        <ListItem key={music._id} divider={index < filteredMusic.length - 1}>
                                            <ListItemText
                                                primary={
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <Typography variant="subtitle1" fontWeight="bold">
                                                            {music.title}
                                                        </Typography>
                                                        <Chip
                                                            label={categories.find(c => c.value === music.category)?.label || music.category}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: getCategoryColor(music.category),
                                                                color: 'white',
                                                                fontWeight: 'bold'
                                                            }}
                                                        />
                                                    </Box>
                                                }
                                                secondary={
                                                    <Box>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {music.artist}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {music.likes || 0} beğeni • Spotify ID: {music.spotifyId}
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                            <ListItemSecondaryAction>
                                                <Stack direction="row" spacing={1}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleEdit(music)}
                                                        color="primary"
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleDelete(music._id)}
                                                        color="error"
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Stack>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    ))}
                                </List>
                            )}

                            {filteredMusic.length === 0 && !loading && (
                                <Box textAlign="center" py={4}>
                                    <MusicIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                                    <Typography variant="h6" color="text.secondary">
                                        {searchTerm || filterCategory !== 'all' ? 'Eşleşen müzik bulunamadı' : 'Henüz müzik eklenmemiş'}
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Edit Dialog */}
            <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Müzik Düzenle</DialogTitle>
                <DialogContent>
                    {editingMusic && (
                        <Stack spacing={3} sx={{ mt: 2 }}>
                            <TextField
                                fullWidth
                                label="Spotify ID"
                                value={editingMusic.spotifyId}
                                onChange={(e) => setEditingMusic({...editingMusic, spotifyId: e.target.value})}
                                disabled
                            />
                            <TextField
                                fullWidth
                                label="Şarkı Adı"
                                value={editingMusic.title}
                                onChange={(e) => setEditingMusic({...editingMusic, title: e.target.value})}
                            />
                            <TextField
                                fullWidth
                                label="Sanatçı"
                                value={editingMusic.artist}
                                onChange={(e) => setEditingMusic({...editingMusic, artist: e.target.value})}
                            />
                            <TextField
                                fullWidth
                                label="Beatport URL"
                                value={editingMusic.beatportUrl}
                                onChange={(e) => setEditingMusic({...editingMusic, beatportUrl: e.target.value})}
                            />
                            <FormControl fullWidth>
                                <InputLabel>Kategori</InputLabel>
                                <Select
                                    value={editingMusic.category}
                                    label="Kategori"
                                    onChange={(e) => setEditingMusic({...editingMusic, category: e.target.value})}
                                >
                                    {categories.filter(c => c.value !== 'all').map(category => (
                                        <MenuItem key={category.value} value={category.value}>
                                            {category.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEditDialog(false)}>
                        İptal
                    </Button>
                    <Button
                        onClick={handleUpdateMusic}
                        variant="contained"
                        disabled={submitLoading}
                        startIcon={submitLoading ? <CircularProgress size={16} /> : <SaveIcon />}
                    >
                        {submitLoading ? 'Güncelleniyor...' : 'Güncelle'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AddMusic;