// admin-panel/src/pages/GenreManagement.jsx
// Modern tasarım - Kart bazlı, güzel image upload
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Switch,
    FormControlLabel,
    Chip,
    CircularProgress,
    Alert,
    Snackbar,
    Grid,
    Tooltip,
    Fade,
    Skeleton
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Image as ImageIcon,
    Save as SaveIcon,
    Close as CloseIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    Refresh as RefreshIcon,
    KeyboardArrowUp as ArrowUpIcon,
    KeyboardArrowDown as ArrowDownIcon,
    CloudUpload as UploadIcon,
    CheckCircle as CheckIcon
} from '@mui/icons-material';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.trackbangserver.com';

const GenreManagement = () => {
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingGenre, setEditingGenre] = useState(null);
    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        displayName: '',
        color: '#7C3AED',
        isActive: true,
        bannerImage: null,
        squareImage: null,
    });

    // Preview URLs
    const [bannerPreview, setBannerPreview] = useState(null);
    const [squarePreview, setSquarePreview] = useState(null);

    // Drag states for image upload
    const [bannerDragActive, setBannerDragActive] = useState(false);
    const [squareDragActive, setSquareDragActive] = useState(false);

    const bannerInputRef = useRef(null);
    const squareInputRef = useRef(null);

    useEffect(() => {
        fetchGenres();
    }, []);

    const showToast = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const fetchGenres = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/genres/admin/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setGenres(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch genres:', error);
            showToast('Failed to load genres', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (genre = null) => {
        if (genre) {
            setEditingGenre(genre);
            setFormData({
                name: genre.name,
                displayName: genre.displayName,
                color: genre.color || '#7C3AED',
                isActive: genre.isActive,
                bannerImage: null,
                squareImage: null,
            });
            setBannerPreview(genre.bannerImage);
            setSquarePreview(genre.squareImage);
        } else {
            setEditingGenre(null);
            setFormData({
                name: '',
                displayName: '',
                color: '#7C3AED',
                isActive: true,
                bannerImage: null,
                squareImage: null,
            });
            setBannerPreview(null);
            setSquarePreview(null);
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingGenre(null);
    };

    const handleImageChange = (e, type) => {
        const file = e.target.files?.[0];
        if (!file) return;
        processImage(file, type);
    };

    const processImage = (file, type) => {
        if (file.size > 5 * 1024 * 1024) {
            showToast('Image size must be less than 5MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result;
            if (type === 'banner') {
                setFormData(prev => ({ ...prev, bannerImage: base64 }));
                setBannerPreview(base64);
            } else {
                setFormData(prev => ({ ...prev, squareImage: base64 }));
                setSquarePreview(base64);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleDrag = (e, type, active) => {
        e.preventDefault();
        e.stopPropagation();
        if (type === 'banner') {
            setBannerDragActive(active);
        } else {
            setSquareDragActive(active);
        }
    };

    const handleDrop = (e, type) => {
        e.preventDefault();
        e.stopPropagation();
        setBannerDragActive(false);
        setSquareDragActive(false);

        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            processImage(file, type);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim() || !formData.displayName.trim()) {
            showToast('Name and Display Name are required', 'error');
            return;
        }

        try {
            setSaving(true);
            const token = localStorage.getItem('token');

            const payload = {
                name: formData.name.trim(),
                displayName: formData.displayName.trim(),
                color: formData.color,
                order: editingGenre ? editingGenre.order : genres.length,
                isActive: formData.isActive,
            };

            if (formData.bannerImage) payload.bannerImage = formData.bannerImage;
            if (formData.squareImage) payload.squareImage = formData.squareImage;

            if (editingGenre) {
                await axios.put(
                    `${API_URL}/api/genres/admin/${editingGenre._id}`,
                    payload,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                showToast('Genre updated successfully');
            } else {
                await axios.post(
                    `${API_URL}/api/genres/admin`,
                    payload,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                showToast('Genre created successfully');
            }

            handleCloseModal();
            fetchGenres();
        } catch (error) {
            console.error('Save genre error:', error);
            showToast(error.response?.data?.message || 'Failed to save genre', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (genre) => {
        if (!window.confirm(`Delete "${genre.displayName}"?`)) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/genres/admin/${genre._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showToast('Genre deleted');
            fetchGenres();
        } catch (error) {
            showToast('Failed to delete genre', 'error');
        }
    };

    const handleToggleActive = async (genre) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${API_URL}/api/genres/admin/${genre._id}`,
                { isActive: !genre.isActive },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            showToast(`Genre ${!genre.isActive ? 'activated' : 'deactivated'}`);
            fetchGenres();
        } catch (error) {
            showToast('Failed to update', 'error');
        }
    };

    const handleMoveGenre = async (genre, direction) => {
        const currentIndex = genres.findIndex(g => g._id === genre._id);
        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

        if (newIndex < 0 || newIndex >= genres.length) return;

        try {
            const token = localStorage.getItem('token');
            const otherGenre = genres[newIndex];

            // Swap orders
            await Promise.all([
                axios.put(`${API_URL}/api/genres/admin/${genre._id}`, { order: otherGenre.order }, { headers: { Authorization: `Bearer ${token}` } }),
                axios.put(`${API_URL}/api/genres/admin/${otherGenre._id}`, { order: genre.order }, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            fetchGenres();
        } catch (error) {
            showToast('Failed to reorder', 'error');
        }
    };

    const handleSeedGenres = async () => {
        if (!window.confirm('Create default genres?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/genres/admin/seed`, {}, { headers: { Authorization: `Bearer ${token}` } });
            showToast('Default genres created');
            fetchGenres();
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to seed', 'error');
        }
    };

    // Loading skeleton
    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Skeleton variant="text" width={200} height={40} />
                    <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 2 }} />
                </Box>
                <Grid container spacing={2}>
                    {[1, 2, 3, 4, 5].map(i => (
                        <Grid item xs={12} key={i}>
                            <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
                        </Grid>
                    ))}
                </Grid>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight="800" sx={{ color: '#1a1a2e' }}>
                        Genres
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {genres.length} categories • Drag to reorder
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    {genres.length === 0 && (
                        <Button
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={handleSeedGenres}
                            sx={{ borderRadius: 2 }}
                        >
                            Seed Defaults
                        </Button>
                    )}
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenModal()}
                        sx={{
                            borderRadius: 2,
                            bgcolor: '#7C3AED',
                            px: 3,
                            boxShadow: '0 4px 14px rgba(124, 58, 237, 0.4)',
                            '&:hover': { bgcolor: '#6D28D9' }
                        }}
                    >
                        Add Genre
                    </Button>
                </Box>
            </Box>

            {/* Genre Cards */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {genres.map((genre, index) => (
                    <Fade in key={genre._id}>
                        <Card
                            elevation={0}
                            sx={{
                                border: '1px solid',
                                borderColor: genre.isActive ? '#e0e0e0' : '#ffcdd2',
                                borderRadius: 3,
                                overflow: 'hidden',
                                transition: 'all 0.2s',
                                opacity: genre.isActive ? 1 : 0.7,
                                '&:hover': {
                                    borderColor: '#7C3AED',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                                }
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'stretch' }}>
                                {/* Color Bar */}
                                <Box sx={{ width: 6, bgcolor: genre.color, flexShrink: 0 }} />

                                {/* Banner Preview */}
                                <Box
                                    sx={{
                                        width: 180,
                                        height: 90,
                                        bgcolor: '#f5f5f5',
                                        flexShrink: 0,
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {genre.bannerImage ? (
                                        <img
                                            src={genre.bannerImage}
                                            alt=""
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <Box sx={{
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: `linear-gradient(135deg, ${genre.color}22, ${genre.color}44)`
                                        }}>
                                            <ImageIcon sx={{ color: genre.color, fontSize: 32, opacity: 0.5 }} />
                                        </Box>
                                    )}
                                </Box>

                                {/* Content */}
                                <CardContent sx={{ flex: 1, py: 2, display: 'flex', alignItems: 'center' }}>
                                    <Box sx={{ flex: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Typography variant="h6" fontWeight="700" sx={{ color: '#1a1a2e' }}>
                                                {genre.displayName}
                                            </Typography>
                                            {!genre.isActive && (
                                                <Chip
                                                    label="Hidden"
                                                    size="small"
                                                    sx={{
                                                        height: 20,
                                                        fontSize: '0.7rem',
                                                        bgcolor: '#ffebee',
                                                        color: '#c62828'
                                                    }}
                                                />
                                            )}
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                            slug: <code style={{
                                            background: '#f5f5f5',
                                            padding: '2px 6px',
                                            borderRadius: 4,
                                            fontSize: '0.8rem'
                                        }}>{genre.slug}</code>
                                        </Typography>
                                    </Box>

                                    {/* Square Image */}
                                    <Box
                                        sx={{
                                            width: 50,
                                            height: 50,
                                            borderRadius: 2,
                                            bgcolor: '#f5f5f5',
                                            overflow: 'hidden',
                                            mr: 2
                                        }}
                                    >
                                        {genre.squareImage ? (
                                            <img src={genre.squareImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <Box sx={{
                                                height: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: `linear-gradient(135deg, ${genre.color}22, ${genre.color}44)`
                                            }}>
                                                <ImageIcon sx={{ color: genre.color, fontSize: 20, opacity: 0.5 }} />
                                            </Box>
                                        )}
                                    </Box>

                                    {/* Actions */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        {/* Reorder buttons */}
                                        <Box sx={{ display: 'flex', flexDirection: 'column', mr: 1 }}>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleMoveGenre(genre, 'up')}
                                                disabled={index === 0}
                                                sx={{ p: 0.3 }}
                                            >
                                                <ArrowUpIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleMoveGenre(genre, 'down')}
                                                disabled={index === genres.length - 1}
                                                sx={{ p: 0.3 }}
                                            >
                                                <ArrowDownIcon fontSize="small" />
                                            </IconButton>
                                        </Box>

                                        <Tooltip title={genre.isActive ? 'Hide' : 'Show'}>
                                            <IconButton onClick={() => handleToggleActive(genre)}>
                                                {genre.isActive ? <VisibilityIcon /> : <VisibilityOffIcon />}
                                            </IconButton>
                                        </Tooltip>

                                        <Tooltip title="Edit">
                                            <IconButton onClick={() => handleOpenModal(genre)}>
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>

                                        <Tooltip title="Delete">
                                            <IconButton onClick={() => handleDelete(genre)} sx={{ color: '#ef5350' }}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </CardContent>
                            </Box>
                        </Card>
                    </Fade>
                ))}

                {genres.length === 0 && (
                    <Card sx={{ p: 6, textAlign: 'center', border: '2px dashed #e0e0e0', bgcolor: 'transparent' }}>
                        <ImageIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">No genres yet</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Click "Seed Defaults" to create standard genres
                        </Typography>
                        <Button variant="outlined" onClick={handleSeedGenres}>
                            Seed Default Genres
                        </Button>
                    </Card>
                )}
            </Box>

            {/* Modal */}
            <Dialog
                open={showModal}
                onClose={handleCloseModal}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid #eee',
                    pb: 2
                }}>
                    <Typography variant="h6" fontWeight="700">
                        {editingGenre ? 'Edit Genre' : 'New Genre'}
                    </Typography>
                    <IconButton onClick={handleCloseModal} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <form onSubmit={handleSubmit}>
                    <DialogContent sx={{ pt: 3 }}>
                        <Grid container spacing={3}>
                            {/* Name & Display Name */}
                            <Grid item xs={6}>
                                <TextField
                                    label="Slug (internal)"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value.toLowerCase().replace(/\s/g, '') }))}
                                    placeholder="afrohouse"
                                    fullWidth
                                    size="small"
                                    disabled={!!editingGenre}
                                    helperText="Lowercase, no spaces"
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="Display Name"
                                    value={formData.displayName}
                                    onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                                    placeholder="Afro House"
                                    fullWidth
                                    size="small"
                                />
                            </Grid>

                            {/* Color */}
                            <Grid item xs={12}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Theme Color
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    {['#FF6B35', '#E91E63', '#9C27B0', '#7C3AED', '#2196F3', '#4CAF50', '#FF9800', '#607D8B'].map(color => (
                                        <Box
                                            key={color}
                                            onClick={() => setFormData(prev => ({ ...prev, color }))}
                                            sx={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: 2,
                                                bgcolor: color,
                                                cursor: 'pointer',
                                                border: formData.color === color ? '3px solid #1a1a2e' : '3px solid transparent',
                                                transition: 'all 0.2s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                '&:hover': { transform: 'scale(1.1)' }
                                            }}
                                        >
                                            {formData.color === color && <CheckIcon sx={{ color: '#fff', fontSize: 18 }} />}
                                        </Box>
                                    ))}
                                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                                        <input
                                            type="color"
                                            value={formData.color}
                                            onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                                            style={{
                                                width: 36,
                                                height: 36,
                                                border: 'none',
                                                borderRadius: 8,
                                                cursor: 'pointer',
                                                padding: 0
                                            }}
                                        />
                                    </Box>
                                </Box>
                            </Grid>

                            {/* Banner Image */}
                            <Grid item xs={12}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Banner Image <Typography component="span" sx={{ color: '#999', fontSize: '0.75rem' }}>(16:9 ratio)</Typography>
                                </Typography>
                                <Box
                                    onClick={() => bannerInputRef.current?.click()}
                                    onDragEnter={(e) => handleDrag(e, 'banner', true)}
                                    onDragLeave={(e) => handleDrag(e, 'banner', false)}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => handleDrop(e, 'banner')}
                                    sx={{
                                        width: '100%',
                                        height: 140,
                                        borderRadius: 3,
                                        border: bannerDragActive ? '2px dashed #7C3AED' : '2px dashed #ddd',
                                        bgcolor: bannerDragActive ? '#f5f0ff' : '#fafafa',
                                        cursor: 'pointer',
                                        overflow: 'hidden',
                                        transition: 'all 0.2s',
                                        position: 'relative',
                                        '&:hover': { borderColor: '#7C3AED', bgcolor: '#f5f0ff' }
                                    }}
                                >
                                    {bannerPreview ? (
                                        <>
                                            <img src={bannerPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <Box sx={{
                                                position: 'absolute',
                                                inset: 0,
                                                bgcolor: 'rgba(0,0,0,0.4)',
                                                opacity: 0,
                                                transition: 'opacity 0.2s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                '&:hover': { opacity: 1 }
                                            }}>
                                                <Typography sx={{ color: '#fff' }}>Click to change</Typography>
                                            </Box>
                                        </>
                                    ) : (
                                        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                            <UploadIcon sx={{ fontSize: 40, color: '#bbb', mb: 1 }} />
                                            <Typography variant="body2" color="text.secondary">
                                                Drop image here or click to upload
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                                <input ref={bannerInputRef} type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'banner')} style={{ display: 'none' }} />
                            </Grid>

                            {/* Square Image */}
                            <Grid item xs={12}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Square Image <Typography component="span" sx={{ color: '#999', fontSize: '0.75rem' }}>(1:1 ratio)</Typography>
                                </Typography>
                                <Box
                                    onClick={() => squareInputRef.current?.click()}
                                    onDragEnter={(e) => handleDrag(e, 'square', true)}
                                    onDragLeave={(e) => handleDrag(e, 'square', false)}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => handleDrop(e, 'square')}
                                    sx={{
                                        width: 120,
                                        height: 120,
                                        borderRadius: 3,
                                        border: squareDragActive ? '2px dashed #7C3AED' : '2px dashed #ddd',
                                        bgcolor: squareDragActive ? '#f5f0ff' : '#fafafa',
                                        cursor: 'pointer',
                                        overflow: 'hidden',
                                        transition: 'all 0.2s',
                                        position: 'relative',
                                        '&:hover': { borderColor: '#7C3AED', bgcolor: '#f5f0ff' }
                                    }}
                                >
                                    {squarePreview ? (
                                        <>
                                            <img src={squarePreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <Box sx={{
                                                position: 'absolute',
                                                inset: 0,
                                                bgcolor: 'rgba(0,0,0,0.4)',
                                                opacity: 0,
                                                transition: 'opacity 0.2s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                '&:hover': { opacity: 1 }
                                            }}>
                                                <EditIcon sx={{ color: '#fff' }} />
                                            </Box>
                                        </>
                                    ) : (
                                        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                            <UploadIcon sx={{ fontSize: 28, color: '#bbb' }} />
                                            <Typography variant="caption" color="text.secondary">1:1</Typography>
                                        </Box>
                                    )}
                                </Box>
                                <input ref={squareInputRef} type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'square')} style={{ display: 'none' }} />
                            </Grid>

                            {/* Active Toggle */}
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                            sx={{
                                                '& .MuiSwitch-switchBase.Mui-checked': { color: '#7C3AED' },
                                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#7C3AED' }
                                            }}
                                        />
                                    }
                                    label={
                                        <Typography variant="body2">
                                            {formData.isActive ? 'Visible to users' : 'Hidden from users'}
                                        </Typography>
                                    }
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>

                    <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #eee' }}>
                        <Button onClick={handleCloseModal} sx={{ color: '#666' }}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={saving}
                            startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                            sx={{
                                bgcolor: '#7C3AED',
                                px: 3,
                                borderRadius: 2,
                                '&:hover': { bgcolor: '#6D28D9' }
                            }}
                        >
                            {saving ? 'Saving...' : (editingGenre ? 'Update' : 'Create')}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ borderRadius: 2 }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default GenreManagement;