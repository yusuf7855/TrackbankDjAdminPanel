// AddMusic.jsx - Complete Drag & Drop for Both Add & Edit (5 Platforms)
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
    Fade,
    Tabs,
    Tab,
    CardMedia,
    FormControlLabel,
    Switch,
    Tooltip
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
    Check as CheckIcon,
    Image as ImageIcon,
    Link as LinkIcon,
    Apple as AppleIcon,
    YouTube as YouTubeIcon,
    Star as StarIcon,
    Visibility as ViewsIcon,
    Favorite as LikesIcon,
    GraphicEq as SpotifyIcon,
    PhotoCamera as PhotoCameraIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const AddMusic = () => {
    const [musicForm, setMusicForm] = useState({
        title: '',
        artist: '',
        imageUrl: '',
        genre: 'afrohouse',
        platformLinks: {
            spotify: '',
            appleMusic: '',
            youtubeMusic: '',
            beatport: '',
            soundcloud: ''
        },
        isFeatured: false
    });

    const [musicList, setMusicList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterGenre, setFilterGenre] = useState('all');
    const [editingMusic, setEditingMusic] = useState(null);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Edit dialog states
    const [editImageFile, setEditImageFile] = useState(null);
    const [editImagePreview, setEditImagePreview] = useState(null);
    const [isEditDragging, setIsEditDragging] = useState(false);
    const [editUploadProgress, setEditUploadProgress] = useState(0);

    const genres = [
        { value: 'all', label: 'Tüm Türler', color: '#4caf50', icon: '🎵' },
        { value: 'afrohouse', label: 'Afro House', color: '#ff9800', icon: '🌍' },
        { value: 'indiedance', label: 'Indie Dance', color: '#e91e63', icon: '💃' },
        { value: 'organichouse', label: 'Organic House', color: '#8bc34a', icon: '🌿' },
        { value: 'downtempo', label: 'Down Tempo', color: '#2196f3', icon: '🎧' },
        { value: 'melodichouse', label: 'Melodic House', color: '#9c27b0', icon: '🎹' }
    ];

    const platformConfig = {
        spotify: {
            label: 'Spotify',
            icon: <SpotifyIcon />,
            color: '#1DB954',
            placeholder: 'https://open.spotify.com/track/...'
        },
        appleMusic: {
            label: 'Apple Music',
            icon: <AppleIcon />,
            color: '#000000',
            placeholder: 'https://music.apple.com/...'
        },
        youtubeMusic: {
            label: 'YouTube Music',
            icon: <YouTubeIcon />,
            color: '#FF0000',
            placeholder: 'https://music.youtube.com/...'
        },
        beatport: {
            label: 'Beatport',
            icon: <MusicIcon />,
            color: '#01FF95',
            placeholder: 'https://www.beatport.com/...'
        },
        soundcloud: {
            label: 'SoundCloud',
            icon: <MusicIcon />,
            color: '#FF8800',
            placeholder: 'https://soundcloud.com/...'
        }
    };

    useEffect(() => {
        fetchMusic();
    }, []);

    const fetchMusic = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/music`);
            setMusicList(response.data.music || response.data || []);
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

    const handlePlatformLinkChange = (platform, value) => {
        setMusicForm({
            ...musicForm,
            platformLinks: {
                ...musicForm.platformLinks,
                [platform]: value
            }
        });
    };

    // Image validation
    const validateImage = (file) => {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!validTypes.includes(file.type)) {
            setError('Sadece resim dosyaları yüklenebilir (JPG, PNG, GIF, WebP)');
            return false;
        }

        if (file.size > maxSize) {
            setError('Dosya boyutu 5MB\'dan küçük olmalıdır');
            return false;
        }

        return true;
    };

    // ADD FORM - Image handlers
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file && validateImage(file)) {
            processImageFile(file);
        }
    };

    const processImageFile = (file) => {
        setImageFile(file);
        setUploadProgress(0);

        const reader = new FileReader();

        reader.onloadstart = () => {
            setUploadProgress(10);
        };

        reader.onprogress = (e) => {
            if (e.lengthComputable) {
                const progress = (e.loaded / e.total) * 100;
                setUploadProgress(progress);
            }
        };

        reader.onloadend = () => {
            setImagePreview(reader.result);
            setMusicForm({ ...musicForm, imageUrl: reader.result });
            setUploadProgress(100);
            setTimeout(() => setUploadProgress(0), 1000);
        };

        reader.onerror = () => {
            setError('Görsel yüklenirken hata oluştu');
            setUploadProgress(0);
        };

        reader.readAsDataURL(file);
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];
            if (validateImage(file)) {
                processImageFile(file);
            }
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setMusicForm({ ...musicForm, imageUrl: '' });
        setUploadProgress(0);
    };

    // EDIT FORM - Image handlers
    const handleEditImageChange = (e) => {
        const file = e.target.files[0];
        if (file && validateImage(file)) {
            processEditImageFile(file);
        }
    };

    const processEditImageFile = (file) => {
        setEditImageFile(file);
        setEditUploadProgress(0);

        const reader = new FileReader();

        reader.onloadstart = () => {
            setEditUploadProgress(10);
        };

        reader.onprogress = (e) => {
            if (e.lengthComputable) {
                const progress = (e.loaded / e.total) * 100;
                setEditUploadProgress(progress);
            }
        };

        reader.onloadend = () => {
            setEditImagePreview(reader.result);
            setEditingMusic({ ...editingMusic, imageUrl: reader.result });
            setEditUploadProgress(100);
            setTimeout(() => setEditUploadProgress(0), 1000);
        };

        reader.onerror = () => {
            setError('Görsel yüklenirken hata oluştu');
            setEditUploadProgress(0);
        };

        reader.readAsDataURL(file);
    };

    const handleEditDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsEditDragging(true);
    };

    const handleEditDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsEditDragging(false);
    };

    const handleEditDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleEditDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsEditDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];
            if (validateImage(file)) {
                processEditImageFile(file);
            }
        }
    };

    const handleRemoveEditImage = () => {
        setEditImageFile(null);
        setEditImagePreview(null);
        setEditUploadProgress(0);
    };

    const validateForm = () => {
        if (!musicForm.title.trim()) {
            setError('Şarkı adı gereklidir');
            return false;
        }
        if (!musicForm.artist.trim()) {
            setError('Sanatçı adı gereklidir');
            return false;
        }
        if (!musicForm.imageUrl && !imageFile) {
            setError('Şarkı görseli gereklidir');
            return false;
        }

        const hasLink = Object.values(musicForm.platformLinks).some(link => link.trim() !== '');
        if (!hasLink) {
            setError('En az bir platform linki eklenmelidir');
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
            const submitData = {
                ...musicForm,
                platformLinks: Object.fromEntries(
                    Object.entries(musicForm.platformLinks).filter(([_, value]) => value.trim() !== '')
                )
            };

            await axios.post(`${API_BASE_URL}/music`, submitData);
            setSuccess('Müzik başarıyla eklendi! 🎵');
            clearForm();
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
            platformLinks: music.platformLinks || {
                spotify: '',
                appleMusic: '',
                youtubeMusic: '',
                beatport: '',
                soundcloud: ''
            }
        });
        setEditImagePreview(music.imageUrl || null);
        setEditImageFile(null);
        setOpenEditDialog(true);
    };

    const handleUpdateMusic = async () => {
        setSubmitLoading(true);
        try {
            const updateData = {
                ...editingMusic,
                platformLinks: Object.fromEntries(
                    Object.entries(editingMusic.platformLinks).filter(([_, value]) => value?.trim() !== '')
                )
            };

            await axios.put(`${API_BASE_URL}/music/${editingMusic._id}`, updateData);
            setSuccess('Müzik başarıyla güncellendi! ✅');
            setOpenEditDialog(false);
            setEditingMusic(null);
            setEditImagePreview(null);
            setEditImageFile(null);
            await fetchMusic();
        } catch (error) {
            setError('Müzik güncellenirken hata oluştu');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bu müziği silmek istediğinizden emin misiniz?')) {
            try {
                await axios.delete(`${API_BASE_URL}/music/${id}`);
                setSuccess('Müzik başarıyla silindi! 🗑️');
                fetchMusic();
            } catch (error) {
                setError('Müzik silinirken hata oluştu');
            }
        }
    };

    const clearForm = () => {
        setMusicForm({
            title: '',
            artist: '',
            imageUrl: '',
            genre: 'afrohouse',
            platformLinks: {
                spotify: '',
                appleMusic: '',
                youtubeMusic: '',
                beatport: '',
                soundcloud: ''
            },
            isFeatured: false
        });
        setImageFile(null);
        setImagePreview(null);
        setError(null);
        setActiveTab(0);
        setUploadProgress(0);
    };

    const filteredMusic = musicList.filter(music => {
        const matchesSearch = music.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            music.artist.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGenre = filterGenre === 'all' || music.genre === filterGenre;
        return matchesSearch && matchesGenre;
    });

    const getGenreColor = (genre) => {
        return genres.find(g => g.value === genre)?.color || '#757575';
    };

    const getGenreIcon = (genre) => {
        return genres.find(g => g.value === genre)?.icon || '🎵';
    };

    const getPlatformCount = (platformLinks) => {
        if (!platformLinks) return 0;
        return Object.values(platformLinks).filter(link => link).length;
    };

    // Drag & Drop Image Component (Reusable)
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
                                     inputId
                                 }) => (
        <Box
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onClick={() => !preview && document.getElementById(inputId).click()}
            sx={{
                border: '2px dashed',
                borderColor: isDragging ? 'primary.main' : 'grey.300',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                cursor: preview ? 'default' : 'pointer',
                bgcolor: isDragging ? 'primary.light' : preview ? 'transparent' : 'grey.50',
                transition: 'all 0.3s ease',
                position: 'relative',
                '&:hover': !preview && {
                    borderColor: 'primary.main',
                    bgcolor: 'primary.light'
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
                <Box position="relative">
                    <CardMedia
                        component="img"
                        image={preview}
                        alt="Preview"
                        sx={{
                            width: '100%',
                            maxHeight: 400,
                            objectFit: 'cover',
                            borderRadius: 2
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
                            '&:hover': {
                                bgcolor: 'rgba(0,0,0,0.9)'
                            }
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                    <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                            position: 'absolute',
                            bottom: 16,
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
                                '&:hover': {
                                    bgcolor: 'rgba(0,0,0,0.9)'
                                }
                            }}
                        >
                            Değiştir
                        </Button>
                        <Button
                            variant="contained"
                            size="small"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove();
                            }}
                            sx={{
                                bgcolor: 'rgba(211,47,47,0.9)',
                                '&:hover': {
                                    bgcolor: 'rgba(211,47,47,1)'
                                }
                            }}
                        >
                            Kaldır
                        </Button>
                    </Stack>
                </Box>
            ) : (
                <Box>
                    <UploadIcon sx={{
                        fontSize: 64,
                        color: isDragging ? 'primary.main' : 'text.secondary',
                        mb: 2,
                        animation: isDragging ? 'bounce 1s infinite' : 'none',
                        '@keyframes bounce': {
                            '0%, 100%': { transform: 'translateY(0)' },
                            '50%': { transform: 'translateY(-10px)' }
                        }
                    }} />
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                        {isDragging ? 'Görseli Buraya Bırakın' : 'Görsel Yükle'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                        {isDragging ? 'Görseli sürükleyip bırakın' : 'Görseli sürükleyip bırakın veya tıklayarak seçin'}
                    </Typography>
                    <Chip
                        label="JPG, PNG, GIF, WebP • Max 5MB"
                        size="small"
                        variant="outlined"
                    />
                </Box>
            )}

            {uploadProgress > 0 && uploadProgress < 100 && (
                <Box sx={{ width: '100%', mt: 2 }}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="caption" color="text.secondary">
                            Yükleniyor...
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {uploadProgress.toFixed(0)}%
                        </Typography>
                    </Box>
                    <Box sx={{
                        width: '100%',
                        height: 4,
                        bgcolor: 'grey.200',
                        borderRadius: 2,
                        overflow: 'hidden'
                    }}>
                        <Box sx={{
                            width: `${uploadProgress}%`,
                            height: '100%',
                            bgcolor: 'primary.main',
                            transition: 'width 0.3s ease'
                        }} />
                    </Box>
                </Box>
            )}
        </Box>
    );

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
                        5 platform desteği: Spotify, Apple Music, YouTube Music, Beatport, SoundCloud
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
                {/* Add Music Form */}
                <Grid item xs={12} lg={5}>
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
                                <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3 }}>
                                    <Tab label="Temel Bilgiler" icon={<MusicIcon />} iconPosition="start" />
                                    <Tab label="Platform Linkleri" icon={<LinkIcon />} iconPosition="start" />
                                    <Tab label="Görsel" icon={<ImageIcon />} iconPosition="start" />
                                </Tabs>

                                {/* Tab 0: Temel Bilgiler */}
                                {activeTab === 0 && (
                                    <Stack spacing={3}>
                                        <TextField
                                            fullWidth
                                            label="Şarkı Adı"
                                            name="title"
                                            value={musicForm.title}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Örn: Sunset Dreams"
                                        />

                                        <TextField
                                            fullWidth
                                            label="Sanatçı"
                                            name="artist"
                                            value={musicForm.artist}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Örn: John Doe"
                                        />

                                        <FormControl fullWidth>
                                            <InputLabel>Tür</InputLabel>
                                            <Select
                                                name="genre"
                                                value={musicForm.genre}
                                                label="Tür"
                                                onChange={handleInputChange}
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

                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={musicForm.isFeatured}
                                                    onChange={(e) => setMusicForm({ ...musicForm, isFeatured: e.target.checked })}
                                                    color="primary"
                                                />
                                            }
                                            label={
                                                <Box display="flex" alignItems="center">
                                                    <StarIcon sx={{ mr: 1, color: 'warning.main' }} />
                                                    Öne Çıkan Müzik
                                                </Box>
                                            }
                                        />
                                    </Stack>
                                )}

                                {/* Tab 1: Platform Links */}
                                {activeTab === 1 && (
                                    <Stack spacing={3}>
                                        <Alert severity="info" icon={<LinkIcon />}>
                                            En az bir platform linki eklemeniz gerekir. Toplam 5 platform: 🟢 Spotify, 🍎 Apple Music, 🔴 YouTube Music, 🎵 Beatport, 🟠 SoundCloud
                                        </Alert>

                                        {Object.entries(platformConfig).map(([key, config]) => (
                                            <TextField
                                                key={key}
                                                fullWidth
                                                label={config.label}
                                                value={musicForm.platformLinks[key]}
                                                onChange={(e) => handlePlatformLinkChange(key, e.target.value)}
                                                placeholder={config.placeholder}
                                                InputProps={{
                                                    startAdornment: (
                                                        <Box sx={{ mr: 1, color: config.color }}>
                                                            {config.icon}
                                                        </Box>
                                                    )
                                                }}
                                            />
                                        ))}

                                        <Paper sx={{ p: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider' }}>
                                            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                                                Platform Durumu:
                                            </Typography>
                                            <Stack spacing={1}>
                                                {Object.entries(platformConfig).map(([key, config]) => (
                                                    <Box key={key} display="flex" alignItems="center" justifyContent="space-between">
                                                        <Box display="flex" alignItems="center" gap={1}>
                                                            <Box sx={{ color: config.color }}>{config.icon}</Box>
                                                            <Typography variant="body2">{config.label}</Typography>
                                                        </Box>
                                                        {musicForm.platformLinks[key] ? (
                                                            <Chip icon={<CheckIcon />} label="Eklendi" size="small" color="success" />
                                                        ) : (
                                                            <Chip label="Boş" size="small" variant="outlined" />
                                                        )}
                                                    </Box>
                                                ))}
                                            </Stack>
                                            <Divider sx={{ my: 2 }} />
                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                <Typography variant="caption" color="text.secondary">
                                                    Toplam Platform:
                                                </Typography>
                                                <Chip
                                                    label={`${getPlatformCount(musicForm.platformLinks)} / 5`}
                                                    size="small"
                                                    color={getPlatformCount(musicForm.platformLinks) > 0 ? 'primary' : 'default'}
                                                />
                                            </Box>
                                        </Paper>
                                    </Stack>
                                )}

                                {/* Tab 2: Image */}
                                {activeTab === 2 && (
                                    <Stack spacing={3}>
                                        <DragDropImageUpload
                                            preview={imagePreview}
                                            isDragging={isDragging}
                                            uploadProgress={uploadProgress}
                                            onDragEnter={handleDragEnter}
                                            onDragLeave={handleDragLeave}
                                            onDragOver={handleDragOver}
                                            onDrop={handleDrop}
                                            onFileSelect={handleImageChange}
                                            onRemove={handleRemoveImage}
                                            inputId="image-upload"
                                        />

                                        <Divider>VEYA</Divider>

                                        <TextField
                                            fullWidth
                                            label="Görsel URL"
                                            name="imageUrl"
                                            value={musicForm.imageUrl}
                                            onChange={handleInputChange}
                                            placeholder="https://example.com/image.jpg"
                                            helperText="Harici bir görsel linki girebilirsiniz"
                                            disabled={!!imagePreview}
                                        />

                                        {imageFile && (
                                            <Alert severity="info" icon={<CheckIcon />}>
                                                <Typography variant="body2">
                                                    <strong>{imageFile.name}</strong>
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Boyut: {(imageFile.size / 1024).toFixed(2)} KB
                                                </Typography>
                                            </Alert>
                                        )}
                                    </Stack>
                                )}

                                {/* Submit Button */}
                                <Box sx={{ mt: 4 }}>
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

                                    {activeTab < 2 && (
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            onClick={() => setActiveTab(activeTab + 1)}
                                            sx={{ mt: 2 }}
                                        >
                                            Sonraki Adım
                                        </Button>
                                    )}
                                </Box>
                            </form>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Music List */}
                <Grid item xs={12} lg={7}>
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
                                        <InputLabel>Tür</InputLabel>
                                        <Select
                                            value={filterGenre}
                                            label="Tür"
                                            onChange={(e) => setFilterGenre(e.target.value)}
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

                            {loading ? (
                                <Box display="flex" justifyContent="center" py={4}>
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <List sx={{ maxHeight: 600, overflow: 'auto' }}>
                                    {filteredMusic.map((music, index) => (
                                        <ListItem key={music._id} divider={index < filteredMusic.length - 1}>
                                            {music.imageUrl && (
                                                <Avatar
                                                    src={music.imageUrl}
                                                    variant="rounded"
                                                    sx={{ width: 60, height: 60, mr: 2 }}
                                                />
                                            )}

                                            <ListItemText
                                                primary={
                                                    <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                                                        <Typography variant="subtitle1" fontWeight="bold">
                                                            {music.title}
                                                        </Typography>
                                                        <Chip
                                                            label={genres.find(g => g.value === music.genre)?.label || music.genre}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: getGenreColor(music.genre),
                                                                color: 'white',
                                                                fontWeight: 'bold'
                                                            }}
                                                        />
                                                        {music.isFeatured && (
                                                            <Tooltip title="Öne Çıkan">
                                                                <StarIcon sx={{ color: 'warning.main', fontSize: 20 }} />
                                                            </Tooltip>
                                                        )}
                                                        <Chip
                                                            label={`${getPlatformCount(music.platformLinks)}/5 platform`}
                                                            size="small"
                                                            color="primary"
                                                            variant="outlined"
                                                        />
                                                    </Box>
                                                }
                                                secondary={
                                                    <Box>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {music.artist}
                                                        </Typography>
                                                        <Stack direction="row" spacing={2} mt={0.5}>
                                                            <Typography variant="caption" color="text.secondary" display="flex" alignItems="center">
                                                                <LikesIcon sx={{ fontSize: 14, mr: 0.5 }} />
                                                                {music.likes || 0}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary" display="flex" alignItems="center">
                                                                <ViewsIcon sx={{ fontSize: 14, mr: 0.5 }} />
                                                                {music.views || 0}
                                                            </Typography>
                                                        </Stack>
                                                        <Stack direction="row" spacing={0.5} mt={1}>
                                                            {music.platformLinks?.spotify && (
                                                                <Tooltip title="Spotify">
                                                                    <IconButton size="small" href={music.platformLinks.spotify} target="_blank" sx={{ color: '#1DB954' }}>
                                                                        <SpotifyIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            )}
                                                            {music.platformLinks?.appleMusic && (
                                                                <Tooltip title="Apple Music">
                                                                    <IconButton size="small" href={music.platformLinks.appleMusic} target="_blank" sx={{ color: '#000' }}>
                                                                        <AppleIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            )}
                                                            {music.platformLinks?.youtubeMusic && (
                                                                <Tooltip title="YouTube Music">
                                                                    <IconButton size="small" href={music.platformLinks.youtubeMusic} target="_blank" sx={{ color: '#FF0000' }}>
                                                                        <YouTubeIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            )}
                                                            {music.platformLinks?.beatport && (
                                                                <Tooltip title="Beatport">
                                                                    <IconButton size="small" href={music.platformLinks.beatport} target="_blank" sx={{ color: '#01FF95' }}>
                                                                        <MusicIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            )}
                                                            {music.platformLinks?.soundcloud && (
                                                                <Tooltip title="SoundCloud">
                                                                    <IconButton size="small" href={music.platformLinks.soundcloud} target="_blank" sx={{ color: '#FF8800' }}>
                                                                        <MusicIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            )}
                                                        </Stack>
                                                    </Box>
                                                }
                                            />
                                            <ListItemSecondaryAction>
                                                <Stack direction="row" spacing={1}>
                                                    <IconButton size="small" onClick={() => handleEdit(music)} color="primary">
                                                        <EditIcon />
                                                    </IconButton>
                                                    <IconButton size="small" onClick={() => handleDelete(music._id)} color="error">
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
                                        {searchTerm || filterGenre !== 'all' ? 'Eşleşen müzik bulunamadı' : 'Henüz müzik eklenmemiş'}
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Edit Dialog with Drag & Drop */}
            <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Box display="flex" alignItems="center" gap={1}>
                        <EditIcon />
                        Müzik Düzenle
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {editingMusic && (
                        <Stack spacing={3} sx={{ mt: 2 }}>
                            {/* Image Upload Section */}
                            <Box>
                                <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                                    Şarkı Görseli
                                </Typography>
                                <DragDropImageUpload
                                    preview={editImagePreview}
                                    isDragging={isEditDragging}
                                    uploadProgress={editUploadProgress}
                                    onDragEnter={handleEditDragEnter}
                                    onDragLeave={handleEditDragLeave}
                                    onDragOver={handleEditDragOver}
                                    onDrop={handleEditDrop}
                                    onFileSelect={handleEditImageChange}
                                    onRemove={handleRemoveEditImage}
                                    inputId="edit-image-upload"
                                />
                                {!editImagePreview && (
                                    <TextField
                                        fullWidth
                                        label="Görsel URL"
                                        value={editingMusic.imageUrl}
                                        onChange={(e) => setEditingMusic({ ...editingMusic, imageUrl: e.target.value })}
                                        placeholder="https://example.com/image.jpg"
                                        sx={{ mt: 2 }}
                                    />
                                )}
                            </Box>

                            <Divider />

                            <TextField
                                fullWidth
                                label="Şarkı Adı"
                                value={editingMusic.title}
                                onChange={(e) => setEditingMusic({ ...editingMusic, title: e.target.value })}
                            />
                            <TextField
                                fullWidth
                                label="Sanatçı"
                                value={editingMusic.artist}
                                onChange={(e) => setEditingMusic({ ...editingMusic, artist: e.target.value })}
                            />
                            <FormControl fullWidth>
                                <InputLabel>Tür</InputLabel>
                                <Select
                                    value={editingMusic.genre}
                                    label="Tür"
                                    onChange={(e) => setEditingMusic({ ...editingMusic, genre: e.target.value })}
                                >
                                    {genres.filter(g => g.value !== 'all').map(genre => (
                                        <MenuItem key={genre.value} value={genre.value}>
                                            {genre.icon} {genre.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <Divider>Platform Linkleri (5 Platform)</Divider>

                            {Object.entries(platformConfig).map(([key, config]) => {
                                const Icon = config.icon.type;
                                return (
                                    <TextField
                                        key={key}
                                        fullWidth
                                        label={config.label}
                                        value={editingMusic.platformLinks?.[key] || ''}
                                        onChange={(e) => setEditingMusic({
                                            ...editingMusic,
                                            platformLinks: { ...editingMusic.platformLinks, [key]: e.target.value }
                                        })}
                                        InputProps={{
                                            startAdornment: <Icon sx={{ mr: 1, color: config.color }} />
                                        }}
                                    />
                                );
                            })}

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={editingMusic.isFeatured || false}
                                        onChange={(e) => setEditingMusic({ ...editingMusic, isFeatured: e.target.checked })}
                                    />
                                }
                                label={
                                    <Box display="flex" alignItems="center">
                                        <StarIcon sx={{ mr: 1, color: 'warning.main' }} />
                                        Öne Çıkan Müzik
                                    </Box>
                                }
                            />
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setOpenEditDialog(false);
                        setEditImagePreview(null);
                        setEditImageFile(null);
                    }}>
                        İptal
                    </Button>
                    <Button
                        onClick={handleUpdateMusic}
                        variant="contained"
                        disabled={submitLoading}
                        startIcon={submitLoading ? <CircularProgress size={16} /> : <SaveIcon />}
                        sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                            }
                        }}
                    >
                        {submitLoading ? 'Güncelleniyor...' : 'Güncelle'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AddMusic;