// AddMusic.jsx - ARTIST SİSTEMİ + DRAG & DROP + 5 PLATFORM
import React, { useState, useEffect, useCallback } from 'react';
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
    Tooltip,
    Autocomplete,
    InputAdornment,
    Badge
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
    Close as CloseIcon,
    MicExternalOn as ArtistIcon,
    PersonAdd as PersonAddIcon,
    VerifiedUser as VerifiedIcon,
    Group as GroupIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const AddMusic = () => {
    // Form state - ARTIST SİSTEMİ İLE GÜNCELLENDİ
    const [musicForm, setMusicForm] = useState({
        title: '',
        artists: [], // YENİ: Artist objects array
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

    // Artist search state - YENİ
    const [artistSearch, setArtistSearch] = useState('');
    const [artistOptions, setArtistOptions] = useState([]);
    const [artistsLoading, setArtistsLoading] = useState(false);
    const [showNewArtistDialog, setShowNewArtistDialog] = useState(false);
    const [newArtistName, setNewArtistName] = useState('');
    const [creatingArtist, setCreatingArtist] = useState(false);

    // Music list state
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

    // Image upload states
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Edit dialog states
    const [editImageFile, setEditImageFile] = useState(null);
    const [editImagePreview, setEditImagePreview] = useState(null);
    const [isEditDragging, setIsEditDragging] = useState(false);
    const [editUploadProgress, setEditUploadProgress] = useState(0);
    const [editArtistOptions, setEditArtistOptions] = useState([]);
    const [editArtistSearch, setEditArtistSearch] = useState('');

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

    // ========== ARTIST SEARCH FUNCTIONS - YENİ ==========
    const searchArtists = useCallback(async (query, isEdit = false) => {
        if (!query || query.length < 2) {
            if (isEdit) {
                setEditArtistOptions([]);
            } else {
                setArtistOptions([]);
            }
            return;
        }

        setArtistsLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/artists`, {
                params: { search: query, limit: 20 }
            });

            if (response.data.success) {
                const artists = response.data.data.artists || [];
                // Filter out already selected artists
                const selectedIds = isEdit
                    ? (editingMusic?.artists || []).map(a => a._id || a)
                    : musicForm.artists.map(a => a._id);
                const filtered = artists.filter(a => !selectedIds.includes(a._id));

                if (isEdit) {
                    setEditArtistOptions(filtered);
                } else {
                    setArtistOptions(filtered);
                }
            }
        } catch (error) {
            console.error('Artist arama hatası:', error);
        } finally {
            setArtistsLoading(false);
        }
    }, [musicForm.artists, editingMusic]);

    // Debounced search for add form
    useEffect(() => {
        const timer = setTimeout(() => {
            searchArtists(artistSearch, false);
        }, 300);
        return () => clearTimeout(timer);
    }, [artistSearch, searchArtists]);

    // Debounced search for edit form
    useEffect(() => {
        const timer = setTimeout(() => {
            if (openEditDialog) {
                searchArtists(editArtistSearch, true);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [editArtistSearch, searchArtists, openEditDialog]);

    // Load initial artists
    useEffect(() => {
        const loadInitialArtists = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/artists`, {
                    params: { limit: 50 }
                });
                if (response.data.success) {
                    const artists = response.data.data.artists || [];
                    setArtistOptions(artists);
                    setEditArtistOptions(artists);
                }
            } catch (error) {
                console.error('Initial artists yüklenemedi:', error);
            }
        };
        loadInitialArtists();
    }, []);

    // Create new artist
    const handleCreateNewArtist = async (isEdit = false) => {
        if (!newArtistName.trim()) {
            setError('Artist adı zorunludur');
            return;
        }

        setCreatingArtist(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/artists`, {
                name: newArtistName.trim()
            });

            if (response.data.success) {
                const newArtist = response.data.data.artist;

                if (isEdit && editingMusic) {
                    // Edit form için
                    const currentArtists = editingMusic.artists || [];
                    setEditingMusic({
                        ...editingMusic,
                        artists: [...currentArtists, newArtist]
                    });
                    setEditArtistOptions(prev => [newArtist, ...prev]);
                } else {
                    // Add form için
                    setMusicForm(prev => ({
                        ...prev,
                        artists: [...prev.artists, newArtist]
                    }));
                    setArtistOptions(prev => [newArtist, ...prev]);
                }

                setShowNewArtistDialog(false);
                setNewArtistName('');
                setSuccess(`"${newArtist.name}" artisti oluşturuldu ve eklendi`);
            }
        } catch (error) {
            console.error('Artist oluşturma hatası:', error);
            setError(error.response?.data?.message || 'Artist oluşturulamadı');
        } finally {
            setCreatingArtist(false);
        }
    };

    // ========== EXISTING FUNCTIONS ==========
    useEffect(() => {
        fetchMusic();
    }, []);

    const fetchMusic = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/music`);
            const data = response.data.data?.musics || response.data.musics || response.data.music || response.data || [];
            setMusicList(Array.isArray(data) ? data : []);
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

    // Artist handlers for add form
    const handleArtistSelect = (event, newValue) => {
        setMusicForm(prev => ({ ...prev, artists: newValue }));
    };

    const handleRemoveArtist = (artistToRemove) => {
        setMusicForm(prev => ({
            ...prev,
            artists: prev.artists.filter(a => a._id !== artistToRemove._id)
        }));
    };

    // Artist handlers for edit form
    const handleEditArtistSelect = (event, newValue) => {
        setEditingMusic(prev => ({ ...prev, artists: newValue }));
    };

    const handleRemoveEditArtist = (artistToRemove) => {
        setEditingMusic(prev => ({
            ...prev,
            artists: prev.artists.filter(a => (a._id || a) !== (artistToRemove._id || artistToRemove))
        }));
    };

    // Image validation
    const validateImage = (file) => {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const maxSize = 5 * 1024 * 1024;

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

        reader.onloadstart = () => setUploadProgress(10);

        reader.onprogress = (e) => {
            if (e.lengthComputable) {
                setUploadProgress((e.loaded / e.total) * 100);
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
        if (files && files.length > 0 && validateImage(files[0])) {
            processImageFile(files[0]);
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

        reader.onloadstart = () => setEditUploadProgress(10);

        reader.onprogress = (e) => {
            if (e.lengthComputable) {
                setEditUploadProgress((e.loaded / e.total) * 100);
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
        if (files && files.length > 0 && validateImage(files[0])) {
            processEditImageFile(files[0]);
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
        if (musicForm.artists.length === 0) {
            setError('En az bir artist seçmelisiniz');
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
                title: musicForm.title.trim(),
                artists: musicForm.artists.map(a => a.name), // Send artist names
                imageUrl: musicForm.imageUrl,
                genre: musicForm.genre,
                isFeatured: musicForm.isFeatured,
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
        // Artists'i normalize et (populate edilmiş veya edilmemiş olabilir)
        let normalizedArtists = [];
        if (music.artists && music.artists.length > 0) {
            normalizedArtists = music.artists.map(a => {
                if (typeof a === 'object') return a;
                // Sadece ID ise, options'dan bul
                const found = artistOptions.find(opt => opt._id === a);
                return found || { _id: a, name: 'Unknown' };
            });
        }

        setEditingMusic({
            ...music,
            artists: normalizedArtists,
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
        if (!editingMusic.title?.trim()) {
            setError('Şarkı adı gereklidir');
            return;
        }
        if (!editingMusic.artists || editingMusic.artists.length === 0) {
            setError('En az bir artist seçmelisiniz');
            return;
        }

        setSubmitLoading(true);
        try {
            const updateData = {
                title: editingMusic.title.trim(),
                artists: editingMusic.artists.map(a => a.name || a),
                imageUrl: editingMusic.imageUrl,
                genre: editingMusic.genre,
                isFeatured: editingMusic.isFeatured,
                platformLinks: Object.fromEntries(
                    Object.entries(editingMusic.platformLinks || {}).filter(([_, value]) => value?.trim() !== '')
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
            setError(error.response?.data?.message || 'Müzik güncellenirken hata oluştu');
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
            artists: [],
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
        const title = music.title || '';
        const artistNames = music.artistNames || music.artist || '';
        const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            artistNames.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGenre = filterGenre === 'all' || music.genre === filterGenre;
        return matchesSearch && matchesGenre;
    });

    const getGenreColor = (genre) => genres.find(g => g.value === genre)?.color || '#757575';
    const getGenreIcon = (genre) => genres.find(g => g.value === genre)?.icon || '🎵';
    const getPlatformCount = (platformLinks) => {
        if (!platformLinks) return 0;
        return Object.values(platformLinks).filter(link => link).length;
    };

    // Get display artist name
    const getDisplayArtist = (music) => {
        if (music.artistNames) return music.artistNames;
        if (music.artists && music.artists.length > 0) {
            return music.artists.map(a => a.name || a).join(', ');
        }
        return music.artist || 'Unknown Artist';
    };

    // Drag & Drop Image Component
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
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.9)' }
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
                            sx={{ bgcolor: 'rgba(0,0,0,0.7)', '&:hover': { bgcolor: 'rgba(0,0,0,0.9)' } }}
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
                        Görseli sürükleyip bırakın veya tıklayarak seçin
                    </Typography>
                    <Chip label="JPG, PNG, GIF, WebP • Max 5MB" size="small" variant="outlined" />
                </Box>
            )}

            {uploadProgress > 0 && uploadProgress < 100 && (
                <Box sx={{ width: '100%', mt: 2 }}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="caption" color="text.secondary">Yükleniyor...</Typography>
                        <Typography variant="caption" color="text.secondary">{uploadProgress.toFixed(0)}%</Typography>
                    </Box>
                    <Box sx={{ width: '100%', height: 4, bgcolor: 'grey.200', borderRadius: 2, overflow: 'hidden' }}>
                        <Box sx={{ width: `${uploadProgress}%`, height: '100%', bgcolor: 'primary.main', transition: 'width 0.3s ease' }} />
                    </Box>
                </Box>
            )}
        </Box>
    );

    // Artist Select Component (Reusable)
    const ArtistSelectComponent = ({
                                       value,
                                       onChange,
                                       onRemove,
                                       options,
                                       loading,
                                       onInputChange,
                                       inputValue,
                                       placeholder,
                                       onCreateNew
                                   }) => (
        <Box>
            <Autocomplete
                multiple
                options={options}
                value={value}
                onChange={onChange}
                onInputChange={(e, newValue) => onInputChange(newValue)}
                inputValue={inputValue}
                getOptionLabel={(option) => option.name || ''}
                isOptionEqualToValue={(option, val) => option._id === (val._id || val)}
                loading={loading}
                filterSelectedOptions
                noOptionsText={inputValue.length < 2 ? "En az 2 karakter yazın" : "Artist bulunamadı"}
                renderOption={(props, option) => (
                    <li {...props} key={option._id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                            <Avatar src={option.profileImage} sx={{ width: 36, height: 36, bgcolor: '#7C3AED' }}>
                                {option.name?.charAt(0)}
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="body2" fontWeight="bold">
                                    {option.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {option.claimStatus === 'claimed' ? '✓ Verified Artist' : 'Artist'}
                                </Typography>
                            </Box>
                        </Box>
                    </li>
                )}
                renderTags={(tagValue, getTagProps) =>
                    tagValue.map((option, index) => (
                        <Chip
                            {...getTagProps({ index })}
                            key={option._id || index}
                            avatar={
                                <Avatar src={option.profileImage} sx={{ bgcolor: '#7C3AED' }}>
                                    {(option.name || '?').charAt(0)}
                                </Avatar>
                            }
                            label={option.name || 'Unknown'}
                            onDelete={() => onRemove(option)}
                            sx={{
                                bgcolor: '#F3E8FF',
                                color: '#7C3AED',
                                '& .MuiChip-deleteIcon': {
                                    color: '#7C3AED',
                                    '&:hover': { color: '#6D28D9' }
                                }
                            }}
                        />
                    ))
                }
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder={value.length === 0 ? placeholder : "Daha fazla artist ekle..."}
                        InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                                <>
                                    <InputAdornment position="start">
                                        <ArtistIcon sx={{ color: '#7C3AED' }} />
                                    </InputAdornment>
                                    {params.InputProps.startAdornment}
                                </>
                            ),
                            endAdornment: (
                                <>
                                    {loading ? <CircularProgress size={20} /> : null}
                                    {params.InputProps.endAdornment}
                                </>
                            )
                        }}
                    />
                )}
            />
            <Button
                startIcon={<PersonAddIcon />}
                onClick={onCreateNew}
                sx={{ mt: 1, color: '#7C3AED' }}
                size="small"
            >
                Yeni Artist Oluştur
            </Button>
            {value.length > 0 && (
                <Box sx={{ mt: 2, p: 2, bgcolor: '#F9FAFB', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                        Seçilen Artistler ({value.length}):
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" sx={{ mt: 0.5 }}>
                        {value.map(a => a.name || a).join(', ')}
                    </Typography>
                </Box>
            )}
        </Box>
    );

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box display="flex" alignItems="center" mb={4}>
                <Avatar sx={{ bgcolor: '#7C3AED', mr: 2, width: 56, height: 56 }}>
                    <MusicIcon />
                </Avatar>
                <Box>
                    <Typography variant="h4" fontWeight="bold">
                        Müzik Yönetimi
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Multi-Artist Desteği • 5 Platform: Spotify, Apple Music, YouTube Music, Beatport, SoundCloud
                    </Typography>
                </Box>
            </Box>

            {/* Alerts */}
            <Stack spacing={2} mb={3}>
                {error && (
                    <Fade in>
                        <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
                    </Fade>
                )}
                {success && (
                    <Fade in>
                        <Alert severity="success" onClose={() => setSuccess(null)}>{success}</Alert>
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
                                <Button size="small" onClick={clearForm} startIcon={<ClearIcon />} color="inherit">
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

                                        {/* YENİ: Artist Multi-Select */}
                                        <Box>
                                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                Artistler * (Birden fazla seçebilirsiniz)
                                            </Typography>
                                            <ArtistSelectComponent
                                                value={musicForm.artists}
                                                onChange={handleArtistSelect}
                                                onRemove={handleRemoveArtist}
                                                options={artistOptions}
                                                loading={artistsLoading}
                                                onInputChange={setArtistSearch}
                                                inputValue={artistSearch}
                                                placeholder="Artist ara veya seç..."
                                                onCreateNew={() => setShowNewArtistDialog(true)}
                                            />
                                        </Box>

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
                                                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: genre.color, mr: 1 }} />
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
                                            En az bir platform linki eklemeniz gerekir.
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
                                                        <Box sx={{ mr: 1, color: config.color }}>{config.icon}</Box>
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
                                                <Typography variant="caption" color="text.secondary">Toplam Platform:</Typography>
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
                                                <Typography variant="body2"><strong>{imageFile.name}</strong></Typography>
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
                                            bgcolor: '#7C3AED',
                                            '&:hover': { bgcolor: '#6D28D9' }
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
                                <Button size="small" onClick={fetchMusic} startIcon={<SearchIcon />} color="inherit">
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
                                        <Select value={filterGenre} label="Tür" onChange={(e) => setFilterGenre(e.target.value)}>
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
                                                <Avatar src={music.imageUrl} variant="rounded" sx={{ width: 60, height: 60, mr: 2 }} />
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
                                                            sx={{ bgcolor: getGenreColor(music.genre), color: 'white', fontWeight: 'bold' }}
                                                        />
                                                        {music.isFeatured && (
                                                            <Tooltip title="Öne Çıkan">
                                                                <StarIcon sx={{ color: 'warning.main', fontSize: 20 }} />
                                                            </Tooltip>
                                                        )}
                                                        {/* YENİ: Artist count badge */}
                                                        {music.artists && music.artists.length > 1 && (
                                                            <Tooltip title={`${music.artists.length} Artist`}>
                                                                <Badge badgeContent={music.artists.length} color="secondary">
                                                                    <GroupIcon sx={{ fontSize: 18, color: '#7C3AED' }} />
                                                                </Badge>
                                                            </Tooltip>
                                                        )}
                                                        <Chip
                                                            label={`${getPlatformCount(music.platformLinks)}/5`}
                                                            size="small"
                                                            color="primary"
                                                            variant="outlined"
                                                        />
                                                    </Box>
                                                }
                                                secondary={
                                                    <Box>
                                                        {/* YENİ: Display artist with icon */}
                                                        <Box display="flex" alignItems="center" gap={0.5}>
                                                            <ArtistIcon sx={{ fontSize: 14, color: '#7C3AED' }} />
                                                            <Typography variant="body2" color="text.secondary">
                                                                {getDisplayArtist(music)}
                                                            </Typography>
                                                        </Box>
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

            {/* Edit Dialog - ARTIST SİSTEMİ İLE GÜNCELLENDİ */}
            <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ bgcolor: '#7C3AED', color: '#fff' }}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <EditIcon />
                        Müzik Düzenle
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {editingMusic && (
                        <Stack spacing={3} sx={{ mt: 2 }}>
                            {/* Image Upload */}
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
                                        value={editingMusic.imageUrl || ''}
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
                                value={editingMusic.title || ''}
                                onChange={(e) => setEditingMusic({ ...editingMusic, title: e.target.value })}
                            />

                            {/* YENİ: Artist Multi-Select for Edit */}
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Artistler * (Birden fazla seçebilirsiniz)
                                </Typography>
                                <ArtistSelectComponent
                                    value={editingMusic.artists || []}
                                    onChange={handleEditArtistSelect}
                                    onRemove={handleRemoveEditArtist}
                                    options={editArtistOptions}
                                    loading={artistsLoading}
                                    onInputChange={setEditArtistSearch}
                                    inputValue={editArtistSearch}
                                    placeholder="Artist ara veya seç..."
                                    onCreateNew={() => setShowNewArtistDialog(true)}
                                />
                            </Box>

                            <FormControl fullWidth>
                                <InputLabel>Tür</InputLabel>
                                <Select
                                    value={editingMusic.genre || ''}
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

                            <Divider>Platform Linkleri</Divider>

                            {Object.entries(platformConfig).map(([key, config]) => (
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
                                        startAdornment: <Box sx={{ mr: 1, color: config.color }}>{config.icon}</Box>
                                    }}
                                />
                            ))}

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
                        sx={{ bgcolor: '#7C3AED', '&:hover': { bgcolor: '#6D28D9' } }}
                    >
                        {submitLoading ? 'Güncelleniyor...' : 'Güncelle'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* New Artist Dialog */}
            <Dialog
                open={showNewArtistDialog}
                onClose={() => setShowNewArtistDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ bgcolor: '#7C3AED', color: '#fff' }}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <PersonAddIcon />
                        Yeni Artist Oluştur
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Listede olmayan bir artist için hızlıca yeni profil oluşturun.
                    </Typography>
                    <TextField
                        fullWidth
                        label="Artist Adı *"
                        value={newArtistName}
                        onChange={(e) => setNewArtistName(e.target.value)}
                        placeholder="Örn: Tarkan"
                        sx={{ mt: 2 }}
                        autoFocus
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleCreateNewArtist(openEditDialog);
                            }
                        }}
                    />
                    <Alert severity="info" sx={{ mt: 2 }}>
                        Oluşturulan artist otomatik olarak bu müziğe eklenecektir.
                    </Alert>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => {
                        setShowNewArtistDialog(false);
                        setNewArtistName('');
                    }}>
                        İptal
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => handleCreateNewArtist(openEditDialog)}
                        disabled={creatingArtist || !newArtistName.trim()}
                        startIcon={creatingArtist ? <CircularProgress size={16} /> : <CheckIcon />}
                        sx={{ bgcolor: '#7C3AED', '&:hover': { bgcolor: '#6D28D9' } }}
                    >
                        {creatingArtist ? 'Oluşturuluyor...' : 'Oluştur ve Ekle'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AddMusic;