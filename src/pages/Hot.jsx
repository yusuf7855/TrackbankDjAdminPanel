// Hot.jsx - Platform Links System with Spotify (5 Platforms) - Clean Code
import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActions,
    CardMedia,
    Chip,
    CircularProgress,
    Alert,
    Stack,
    Fade,
    Avatar,
    Button,
    Tooltip,
    IconButton,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Tabs,
    Tab,
    Paper
} from '@mui/material';
import {
    MusicNote as MusicIcon,
    Whatshot as HotIcon,
    PlayArrow as PlayIcon,
    Visibility as ViewsIcon,
    Favorite as FavoriteIcon,
    TrendingUp as TrendingIcon,
    NewReleases as NewReleasesIcon,
    Apple as AppleIcon,
    YouTube as YouTubeIcon,
    Refresh as RefreshIcon,
    Image as ImageIcon,
    GraphicEq as SpotifyIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.3:5000/api';

const Hot = () => {
    const [hotPlaylists, setHotPlaylists] = useState([]);
    const [trendingPlaylists, setTrendingPlaylists] = useState([]);
    const [newReleases, setNewReleases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    const genres = [
        { value: 'afrohouse', label: 'Afro House', color: '#ff9800', icon: '🌍' },
        { value: 'indiedance', label: 'Indie Dance', color: '#e91e63', icon: '💃' },
        { value: 'organichouse', label: 'Organic House', color: '#8bc34a', icon: '🌿' },
        { value: 'downtempo', label: 'Down Tempo', color: '#2196f3', icon: '🎧' },
        { value: 'melodichouse', label: 'Melodic House', color: '#9c27b0', icon: '🎹' }
    ];

    const platformConfig = {
        spotify: { icon: SpotifyIcon, color: '#1DB954', label: 'Spotify' },
        appleMusic: { icon: AppleIcon, color: '#000000', label: 'Apple Music' },
        youtubeMusic: { icon: YouTubeIcon, color: '#FF0000', label: 'YouTube Music' },
        beatport: { icon: MusicIcon, color: '#01FF95', label: 'Beatport' },
        soundcloud: { icon: MusicIcon, color: '#FF8800', label: 'SoundCloud' }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        if (!loading) setRefreshing(true);

        try {
            setError(null);

            const [hotRes, trendingRes, newReleasesRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/hot`).catch(() => ({ data: { hotPlaylists: [] } })),
                axios.get(`${API_BASE_URL}/hot/trending`).catch(() => ({ data: { playlists: [] } })),
                axios.get(`${API_BASE_URL}/hot/new-releases`).catch(() => ({ data: { playlists: [] } }))
            ]);

            setHotPlaylists(hotRes.data.hotPlaylists || []);
            setTrendingPlaylists(trendingRes.data.playlists || []);
            setNewReleases(newReleasesRes.data.playlists || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Veriler yüklenirken hata oluştu');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const getGenreData = (genreValue) => {
        return genres.find(g => g.value === genreValue) || {
            label: genreValue,
            color: '#757575',
            icon: '🎵'
        };
    };

    const getPlatformCount = (platformLinks) => {
        if (!platformLinks) return 0;
        return Object.values(platformLinks).filter(link => link).length;
    };

    const renderPlaylistCard = (playlist, showHotBadge = false) => {
        const genreData = getGenreData(playlist.genre);

        return (
            <Card
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6
                    }
                }}
            >
                {/* Cover Image */}
                {playlist.coverImage && (
                    <CardMedia
                        component="img"
                        height="200"
                        image={playlist.coverImage}
                        alt={playlist.name}
                        sx={{ objectFit: 'cover' }}
                    />
                )}

                {/* No Cover Placeholder */}
                {!playlist.coverImage && (
                    <Box
                        sx={{
                            height: 200,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: genreData.color,
                            color: 'white'
                        }}
                    >
                        <MusicIcon sx={{ fontSize: 80, opacity: 0.5 }} />
                    </Box>
                )}

                <CardContent sx={{ flexGrow: 1 }}>
                    {/* Header */}
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Box flex={1}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom noWrap>
                                {playlist.name}
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
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
                                {playlist.subCategory && (
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
                                )}
                            </Stack>
                        </Box>
                        {showHotBadge && (
                            <Chip
                                icon={<HotIcon />}
                                label="HOT"
                                size="small"
                                sx={{
                                    bgcolor: '#ff6b35',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    ml: 1
                                }}
                            />
                        )}
                    </Box>

                    {/* Description */}
                    {playlist.description && (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            mb={2}
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

                    {/* Stats */}
                    <Stack direction="row" spacing={2} mb={2}>
                        <Tooltip title="Şarkı Sayısı">
                            <Chip
                                icon={<MusicIcon />}
                                label={playlist.musicCount || 0}
                                size="small"
                                variant="outlined"
                            />
                        </Tooltip>
                        <Tooltip title="Görüntülenme">
                            <Chip
                                icon={<ViewsIcon />}
                                label={playlist.views || 0}
                                size="small"
                                variant="outlined"
                                color="primary"
                            />
                        </Tooltip>
                        <Tooltip title="Beğeni">
                            <Chip
                                icon={<FavoriteIcon />}
                                label={playlist.likes || 0}
                                size="small"
                                variant="outlined"
                                color="error"
                            />
                        </Tooltip>
                    </Stack>

                    {/* Preview Musics */}
                    {playlist.musics && playlist.musics.length > 0 && (
                        <Box>
                            <Divider sx={{ mb: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Önizleme
                                </Typography>
                            </Divider>
                            <List dense disablePadding>
                                {playlist.musics.slice(0, 3).map((music, index) => (
                                    <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
                                        {music.imageUrl && (
                                            <ListItemAvatar>
                                                <Avatar
                                                    src={music.imageUrl}
                                                    variant="rounded"
                                                    sx={{ width: 40, height: 40 }}
                                                />
                                            </ListItemAvatar>
                                        )}
                                        <ListItemText
                                            primary={
                                                <Typography variant="body2" noWrap>
                                                    {music.title}
                                                </Typography>
                                            }
                                            secondary={
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <Typography variant="caption" noWrap>
                                                        {music.artist}
                                                    </Typography>
                                                    {music.platformLinks && (
                                                        <Chip
                                                            label={`${getPlatformCount(music.platformLinks)}/5`}
                                                            size="small"
                                                            sx={{ fontSize: '0.65rem', height: 16 }}
                                                        />
                                                    )}
                                                </Stack>
                                            }
                                        />
                                        {/* Platform Icons (5 Platforms) */}
                                        <Stack direction="row" spacing={0.5}>
                                            {music.platformLinks?.spotify && (
                                                <Tooltip title="Spotify">
                                                    <IconButton
                                                        size="small"
                                                        href={music.platformLinks.spotify}
                                                        target="_blank"
                                                        sx={{ color: platformConfig.spotify.color }}
                                                    >
                                                        <SpotifyIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            {music.platformLinks?.appleMusic && (
                                                <Tooltip title="Apple Music">
                                                    <IconButton
                                                        size="small"
                                                        href={music.platformLinks.appleMusic}
                                                        target="_blank"
                                                        sx={{ color: platformConfig.appleMusic.color }}
                                                    >
                                                        <AppleIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            {music.platformLinks?.youtubeMusic && (
                                                <Tooltip title="YouTube Music">
                                                    <IconButton
                                                        size="small"
                                                        href={music.platformLinks.youtubeMusic}
                                                        target="_blank"
                                                        sx={{ color: platformConfig.youtubeMusic.color }}
                                                    >
                                                        <YouTubeIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            {music.platformLinks?.beatport && (
                                                <Tooltip title="Beatport">
                                                    <IconButton
                                                        size="small"
                                                        href={music.platformLinks.beatport}
                                                        target="_blank"
                                                        sx={{ color: platformConfig.beatport.color }}
                                                    >
                                                        <MusicIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            {music.platformLinks?.soundcloud && (
                                                <Tooltip title="SoundCloud">
                                                    <IconButton
                                                        size="small"
                                                        href={music.platformLinks.soundcloud}
                                                        target="_blank"
                                                        sx={{ color: platformConfig.soundcloud.color }}
                                                    >
                                                        <MusicIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </Stack>
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    )}

                    <Divider sx={{ my: 1 }} />

                    {/* Footer */}
                    <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                            Oluşturan: {playlist.owner?.displayName || 'Admin'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {new Date(playlist.createdAt).toLocaleDateString('tr-TR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            })}
                        </Typography>
                    </Box>
                </CardContent>

                <CardActions>
                    <Button
                        size="small"
                        startIcon={<PlayIcon />}
                        fullWidth
                        sx={{
                            color: genreData.color,
                            fontWeight: 'bold',
                            '&:hover': {
                                bgcolor: `${genreData.color}15`
                            }
                        }}
                    >
                        Playlist'i Görüntüle
                    </Button>
                </CardActions>
            </Card>
        );
    };

    if (loading) {
        return (
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="60vh" gap={2}>
                <CircularProgress size={60} />
                <Typography variant="h6">
                    HOT Playlists Yükleniyor...
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: '#ff6b35', mr: 2, width: 56, height: 56 }}>
                        <HotIcon />
                    </Avatar>
                    <Box>
                        <Typography variant="h4" fontWeight="bold">
                            HOT Playlists
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                            En popüler ve öne çıkan playlist'ler • 5 Platform Desteği
                        </Typography>
                    </Box>
                </Box>
                <Button
                    variant="outlined"
                    onClick={fetchAllData}
                    disabled={refreshing}
                    startIcon={refreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
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
                    <HotIcon sx={{ fontSize: 40, color: '#ff6b35' }} />
                    <Box flex={1}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            🔥 HOT Playlists Sistemi
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={1}>
                            HOT sayfası her genre'den en son eklenen admin playlist'leri, trend playlist'leri ve yeni çıkanları gösterir.
                            Bu playlist'ler mobil uygulamada öne çıkan içerik olarak görünür.
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
                            <Chip
                                icon={<SpotifyIcon />}
                                label="Spotify"
                                size="small"
                                sx={{ bgcolor: '#1DB954', color: 'white' }}
                            />
                            <Chip
                                icon={<AppleIcon />}
                                label="Apple Music"
                                size="small"
                                sx={{ bgcolor: '#000', color: 'white' }}
                            />
                            <Chip
                                icon={<YouTubeIcon />}
                                label="YouTube Music"
                                size="small"
                                sx={{ bgcolor: '#FF0000', color: 'white' }}
                            />
                            <Chip
                                icon={<MusicIcon />}
                                label="Beatport"
                                size="small"
                                sx={{ bgcolor: '#01FF95', color: 'black' }}
                            />
                            <Chip
                                icon={<MusicIcon />}
                                label="SoundCloud"
                                size="small"
                                sx={{ bgcolor: '#FF8800', color: 'white' }}
                            />
                        </Stack>
                    </Box>
                </Stack>
            </Paper>

            {/* Tabs */}
            <Tabs
                value={activeTab}
                onChange={(e, v) => setActiveTab(v)}
                sx={{ mb: 3 }}
                variant="fullWidth"
            >
                <Tab
                    icon={<HotIcon />}
                    iconPosition="start"
                    label={`Latest by Genre (${hotPlaylists.length})`}
                />
                <Tab
                    icon={<TrendingIcon />}
                    iconPosition="start"
                    label={`Trending (${trendingPlaylists.length})`}
                />
                <Tab
                    icon={<NewReleasesIcon />}
                    iconPosition="start"
                    label={`New Releases (${newReleases.length})`}
                />
            </Tabs>

            {/* Tab Content */}
            <Box>
                {/* Latest by Genre */}
                {activeTab === 0 && (
                    <Fade in>
                        <Box>
                            <Typography variant="h6" fontWeight="bold" mb={2}>
                                Her Genre'den En Son Playlist
                            </Typography>
                            <Grid container spacing={3}>
                                {hotPlaylists.map((playlist) => (
                                    <Grid item xs={12} sm={6} md={4} key={playlist._id}>
                                        {renderPlaylistCard(playlist, true)}
                                    </Grid>
                                ))}
                            </Grid>
                            {hotPlaylists.length === 0 && (
                                <Paper sx={{ textAlign: 'center', py: 8 }}>
                                    <HotIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                                    <Typography variant="h6" color="text.secondary" gutterBottom>
                                        HOT Playlist Bulunamadı
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Henüz hiç admin playlist eklenmemiş
                                    </Typography>
                                </Paper>
                            )}
                        </Box>
                    </Fade>
                )}

                {/* Trending */}
                {activeTab === 1 && (
                    <Fade in>
                        <Box>
                            <Typography variant="h6" fontWeight="bold" mb={2}>
                                En Popüler Playlists
                            </Typography>
                            <Grid container spacing={3}>
                                {trendingPlaylists.map((playlist) => (
                                    <Grid item xs={12} sm={6} md={4} key={playlist._id}>
                                        {renderPlaylistCard(playlist, false)}
                                    </Grid>
                                ))}
                            </Grid>
                            {trendingPlaylists.length === 0 && (
                                <Paper sx={{ textAlign: 'center', py: 8 }}>
                                    <TrendingIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                                    <Typography variant="h6" color="text.secondary" gutterBottom>
                                        Trending Playlist Bulunamadı
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Henüz yeterli beğeni/görüntülenme yok
                                    </Typography>
                                </Paper>
                            )}
                        </Box>
                    </Fade>
                )}

                {/* New Releases */}
                {activeTab === 2 && (
                    <Fade in>
                        <Box>
                            <Typography variant="h6" fontWeight="bold" mb={2}>
                                Son 7 Günün Yeni Playlist'leri
                            </Typography>
                            <Grid container spacing={3}>
                                {newReleases.map((playlist) => (
                                    <Grid item xs={12} sm={6} md={4} key={playlist._id}>
                                        {renderPlaylistCard(playlist, false)}
                                    </Grid>
                                ))}
                            </Grid>
                            {newReleases.length === 0 && (
                                <Paper sx={{ textAlign: 'center', py: 8 }}>
                                    <NewReleasesIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                                    <Typography variant="h6" color="text.secondary" gutterBottom>
                                        Yeni Playlist Bulunamadı
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Son 7 günde yeni playlist eklenmemiş
                                    </Typography>
                                </Paper>
                            )}
                        </Box>
                    </Fade>
                )}
            </Box>
        </Box>
    );
};

export default Hot;