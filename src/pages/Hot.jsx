import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActions,
    Chip,
    CircularProgress,
    Alert,
    Stack,
    Fade,
    Avatar,
    Button
} from '@mui/material';
import {
    MusicNote as MusicIcon,
    Whatshot as HotIcon,
    PlayArrow as PlayIcon
} from '@mui/icons-material';
import axios from 'axios';

const Hot = () => {
    const [hotPlaylists, setHotPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const categories = {
        afrohouse: { label: 'Afro House', color: '#ff9800' },
        indiedance: { label: 'Indie Dance', color: '#e91e63' },
        organichouse: { label: 'Organic House', color: '#8bc34a' },
        downtempo: { label: 'Down Tempo', color: '#2196f3' },
        melodichouse: { label: 'Melodic House', color: '#9c27b0' }
    };

    useEffect(() => {
        fetchHotPlaylists();
    }, []);

    const fetchHotPlaylists = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/hot');
            setHotPlaylists(response.data.hotPlaylists || []);
        } catch (error) {
            console.error('Error fetching hot playlists:', error);
            setError('HOT playlistleri yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

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
                            HOT Playlists
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                            Her kategoriden en son eklenen admin playlist'ler
                        </Typography>
                    </Box>
                </Box>
                <Button
                    variant="outlined"
                    onClick={fetchHotPlaylists}
                    startIcon={<HotIcon />}
                >
                    Yenile
                </Button>
            </Box>

            {/* Error Alert */}
            {error && (
                <Fade in>
                    <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                </Fade>
            )}

            {/* Info Card */}
            <Card sx={{ mb: 3, bgcolor: '#fff3e0' }}>
                <CardContent>
                    <Typography variant="h6" color="primary" gutterBottom>
                        🔥 HOT Sistem Açıklaması
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        HOT sayfası her kategoriden en son eklenen admin playlist'i gösterir.
                        Bu playlist'ler mobil uygulamada öne çıkan içerik olarak görünür.
                    </Typography>
                </CardContent>
            </Card>

            {/* HOT Playlists Grid */}
            <Grid container spacing={3}>
                {hotPlaylists.map((playlist) => (
                    <Grid item xs={12} sm={6} md={4} key={playlist._id}>
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
                                            {playlist.name}
                                        </Typography>
                                        <Chip
                                            label={playlist.categoryDisplayName || categories[playlist.mainCategory]?.label}
                                            size="small"
                                            sx={{
                                                bgcolor: categories[playlist.mainCategory]?.color || '#757575',
                                                color: 'white',
                                                fontWeight: 'bold'
                                            }}
                                        />
                                    </Box>
                                    <Chip
                                        icon={<HotIcon />}
                                        label="HOT"
                                        size="small"
                                        sx={{
                                            bgcolor: '#ff6b35',
                                            color: 'white',
                                            fontWeight: 'bold'
                                        }}
                                    />
                                </Box>

                                {playlist.description && (
                                    <Typography variant="body2" color="text.secondary" mb={2}>
                                        {playlist.description}
                                    </Typography>
                                )}

                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                    <Chip
                                        icon={<MusicIcon />}
                                        label={`${playlist.musicCount || 0} şarkı`}
                                        variant="outlined"
                                        size="small"
                                    />
                                    <Chip
                                        label={playlist.subCategory}
                                        size="small"
                                        variant="outlined"
                                        sx={{
                                            borderColor: categories[playlist.mainCategory]?.color,
                                            color: categories[playlist.mainCategory]?.color,
                                            fontWeight: 'bold'
                                        }}
                                    />
                                </Box>

                                <Typography variant="caption" color="text.secondary">
                                    Oluşturan: {playlist.owner?.displayName}
                                </Typography>
                                <br />
                                <Typography variant="caption" color="text.secondary">
                                    {new Date(playlist.createdAt).toLocaleDateString('tr-TR')}
                                </Typography>
                            </CardContent>

                            <CardActions>
                                <Button
                                    size="small"
                                    startIcon={<PlayIcon />}
                                    sx={{
                                        color: categories[playlist.mainCategory]?.color,
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Playlist'i Görüntüle
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {hotPlaylists.length === 0 && !loading && (
                <Card sx={{ textAlign: 'center', py: 8 }}>
                    <CardContent>
                        <HotIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            HOT Playlist Bulunamadı
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={3}>
                            Henüz hiç admin playlist eklenmemiş. Category Playlists sayfasından
                            her kategori için playlist oluşturun.
                        </Typography>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
};

export default Hot;