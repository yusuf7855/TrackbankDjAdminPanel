// Dashboard.jsx - ARTIST SİSTEMİ EKLENMİŞ VERSİYON
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Avatar,
    Paper,
    LinearProgress,
    Chip,
    IconButton,
    Tooltip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Alert,
    CircularProgress,
    Fade,
    Grow,
    Stack,
    Divider
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    QueueMusic as PlaylistIcon,
    LibraryMusic as MusicLibraryIcon,
    Store as StoreIcon,
    TrendingUp as TrendingUpIcon,
    People as PeopleIcon,
    Notifications as NotificationIcon,
    Euro as EuroIcon,
    Visibility as VisibilityIcon,
    Download as DownloadIcon,
    Refresh as RefreshIcon,
    Speed as SpeedIcon,
    AccessTime as AccessTimeIcon,
    CloudUpload as CloudUploadIcon,
    Psychology as PsychologyIcon,
    MusicNote as MusicNoteIcon,
    Star as StarIcon,
    Favorite as FavoriteIcon,
    Apple as AppleIcon,
    YouTube as YouTubeIcon,
    Image as ImageIcon,
    Category as CategoryIcon,
    GraphicEq as SpotifyIcon,
    Link as LinkIcon,
    Person as PersonIcon,
    VerifiedUser as VerifiedIcon,
    PersonAdd as PersonAddIcon,
    HowToReg as ClaimIcon,
    MicExternalOn as ArtistIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const Dashboard = () => {
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        music: {
            total: 0,
            featured: 0,
            byGenre: {
                afrohouse: 0,
                indiedance: 0,
                organichouse: 0,
                downtempo: 0,
                melodichouse: 0
            },
            totalLikes: 0,
            totalViews: 0
        },
        platformLinks: {
            spotify: 0,
            appleMusic: 0,
            youtubeMusic: 0,
            beatport: 0,
            soundcloud: 0
        },
        playlists: {
            total: 0,
            admin: 0,
            user: 0,
            withCovers: 0
        },
        // YENİ: Artist istatistikleri
        artists: {
            total: 0,
            claimed: 0,
            unclaimed: 0,
            pendingClaims: 0,
            verified: 0
        },
        users: {
            total: 0,
            active: 0,
            premium: 0,
            newToday: 0,
            verifiedArtists: 0
        },
        store: {
            totalListings: 0,
            activeListings: 0,
            revenue: 0,
            expiredListings: 0
        },
        notifications: {
            sent: 0,
            delivered: 0,
            deliveryRate: 0
        }
    });

    const [recentActivity, setRecentActivity] = useState([]);
    const [recentArtists, setRecentArtists] = useState([]);
    const [topGenres, setTopGenres] = useState([]);
    const [systemHealth] = useState({
        status: 'healthy',
        uptime: '99.9%',
        responseTime: '245ms',
        activeConnections: 142
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const genres = [
        { value: 'afrohouse', label: 'Afro House', color: '#424242', icon: '🌍' },
        { value: 'indiedance', label: 'Indie Dance', color: '#616161', icon: '💃' },
        { value: 'organichouse', label: 'Organic House', color: '#757575', icon: '🌿' },
        { value: 'downtempo', label: 'Down Tempo', color: '#9E9E9E', icon: '🎧' },
        { value: 'melodichouse', label: 'Melodic House', color: '#BDBDBD', icon: '🎹' }
    ];

    const platformConfig = {
        spotify: {
            label: 'Spotify',
            icon: SpotifyIcon,
            color: '#1DB954',
            bgColor: '#1DB95410'
        },
        appleMusic: {
            label: 'Apple Music',
            icon: AppleIcon,
            color: '#000000',
            bgColor: '#00000010'
        },
        youtubeMusic: {
            label: 'YouTube Music',
            icon: YouTubeIcon,
            color: '#FF0000',
            bgColor: '#FF000010'
        },
        beatport: {
            label: 'Beatport',
            icon: MusicNoteIcon,
            color: '#01FF95',
            bgColor: '#01FF9510'
        },
        soundcloud: {
            label: 'SoundCloud',
            icon: MusicNoteIcon,
            color: '#FF8800',
            bgColor: '#FF880010'
        }
    };

    useEffect(() => {
        loadDashboardData();

        // Auto-refresh every 30 seconds
        const interval = setInterval(loadDashboardData, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadDashboardData = async () => {
        if (!loading) setRefreshing(true);

        try {
            setError(null);

            // Fetch real data from API
            const [musicRes, playlistsRes, artistsRes, pendingClaimsRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/music`).catch(() => ({ data: { data: { musics: [] } } })),
                axios.get(`${API_BASE_URL}/playlists/admin`).catch(() => ({ data: { data: { playlists: [] } } })),
                axios.get(`${API_BASE_URL}/artists`).catch(() => ({ data: { data: { artists: [] } } })),
                axios.get(`${API_BASE_URL}/artists/claims/pending`).catch(() => ({ data: { data: { claims: [] } } }))
            ]);

            const musicData = musicRes.data?.data?.musics || musicRes.data?.musics || musicRes.data?.music || [];
            const playlistData = playlistsRes.data?.data?.playlists || playlistsRes.data?.playlists || [];
            const artistData = artistsRes.data?.data?.artists || artistsRes.data?.artists || [];
            const pendingClaims = pendingClaimsRes.data?.data?.claims || pendingClaimsRes.data?.claims || [];

            // Calculate music stats
            const musicStats = {
                total: musicData.length,
                featured: musicData.filter(m => m.isFeatured).length,
                byGenre: {
                    afrohouse: musicData.filter(m => m.genre === 'afrohouse').length,
                    indiedance: musicData.filter(m => m.genre === 'indiedance').length,
                    organichouse: musicData.filter(m => m.genre === 'organichouse').length,
                    downtempo: musicData.filter(m => m.genre === 'downtempo').length,
                    melodichouse: musicData.filter(m => m.genre === 'melodichouse').length
                },
                totalLikes: musicData.reduce((sum, m) => sum + (m.likes || 0), 0),
                totalViews: musicData.reduce((sum, m) => sum + (m.views || 0), 0)
            };

            // Calculate platform links stats (5 platforms)
            const platformStats = {
                spotify: musicData.filter(m => m.platformLinks?.spotify).length,
                appleMusic: musicData.filter(m => m.platformLinks?.appleMusic).length,
                youtubeMusic: musicData.filter(m => m.platformLinks?.youtubeMusic).length,
                beatport: musicData.filter(m => m.platformLinks?.beatport).length,
                soundcloud: musicData.filter(m => m.platformLinks?.soundcloud).length
            };

            // Calculate playlist stats
            const playlistStats = {
                total: playlistData.length,
                admin: playlistData.filter(p => p.isAdminPlaylist).length,
                user: playlistData.filter(p => !p.isAdminPlaylist).length,
                withCovers: playlistData.filter(p => p.coverImage).length
            };

            // YENİ: Calculate artist stats
            const artistStats = {
                total: artistData.length,
                claimed: artistData.filter(a => a.claimStatus === 'claimed').length,
                unclaimed: artistData.filter(a => a.claimStatus === 'unclaimed').length,
                pendingClaims: pendingClaims.length,
                verified: artistData.filter(a => a.isVerified).length
            };

            // Top genres
            const genreData = Object.entries(musicStats.byGenre)
                .map(([genre, count]) => ({
                    genre,
                    label: genres.find(g => g.value === genre)?.label || genre,
                    color: genres.find(g => g.value === genre)?.color || '#757575',
                    icon: genres.find(g => g.value === genre)?.icon || '🎵',
                    count
                }))
                .sort((a, b) => b.count - a.count);

            // Recent artists (son 5)
            const sortedArtists = [...artistData]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5);

            setStats({
                music: musicStats,
                platformLinks: platformStats,
                playlists: playlistStats,
                artists: artistStats,
                users: {
                    total: 2847,
                    active: 1892,
                    premium: 456,
                    newToday: 23,
                    verifiedArtists: artistStats.claimed
                },
                store: {
                    totalListings: 89,
                    activeListings: 67,
                    revenue: 2750,
                    expiredListings: 22
                },
                notifications: {
                    sent: 156,
                    delivered: 142,
                    deliveryRate: 91.0
                }
            });

            setTopGenres(genreData);
            setRecentArtists(sortedArtists);

            // Activity data
            const mockActivity = [
                { id: 1, activity: 'Yeni müzik eklendi', user: 'Admin', type: 'music', time: '2 dakika önce' },
                { id: 2, activity: 'Yeni artist oluşturuldu', user: 'Admin', type: 'artist', time: '5 dakika önce' },
                { id: 3, activity: 'Claim başvurusu alındı', user: 'User_123', type: 'claim', time: '10 dakika önce' },
                { id: 4, activity: 'Admin playlist oluşturuldu', user: 'Admin', type: 'playlist', time: '15 dakika önce' },
                { id: 5, activity: 'Artist profili güncellendi', user: 'Admin', type: 'artist', time: '20 dakika önce' }
            ];

            setRecentActivity(mockActivity);

        } catch (error) {
            console.error('Dashboard verileri yüklenemedi:', error);
            setError('Veriler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const getPlatformCoverage = () => {
        const totalPlatforms = Object.values(stats.platformLinks).reduce((sum, count) => sum + count, 0);
        const maxPossible = stats.music.total * 5;
        return maxPossible > 0 ? ((totalPlatforms / maxPossible) * 100).toFixed(1) : 0;
    };

    const getClaimRate = () => {
        if (stats.artists.total === 0) return 0;
        return ((stats.artists.claimed / stats.artists.total) * 100).toFixed(1);
    };

    if (loading) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                flexDirection: 'column',
                gap: 2,
                bgcolor: '#fafafa'
            }}>
                <CircularProgress size={60} sx={{ color: '#000' }} />
                <Typography variant="h6" color="text.secondary">
                    Dashboard yükleniyor...
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, bgcolor: '#fafafa', minHeight: '100vh' }}>
            {/* Header */}
            <Fade in timeout={800}>
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: '#000' }}>
                            TrackBang Dashboard
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Music Management • Artist System • 5 Platform Support
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        {/* Pending Claims Alert */}
                        {stats.artists.pendingClaims > 0 && (
                            <Chip
                                icon={<ClaimIcon />}
                                label={`${stats.artists.pendingClaims} Bekleyen Claim`}
                                sx={{
                                    bgcolor: '#FF9800',
                                    color: '#fff',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    '&:hover': { bgcolor: '#F57C00' }
                                }}
                                onClick={() => navigate('/admin/artists')}
                            />
                        )}
                        <Chip
                            icon={<SpeedIcon />}
                            label={systemHealth.responseTime}
                            sx={{
                                bgcolor: '#fff',
                                border: '1px solid #e0e0e0',
                                color: '#000',
                                fontWeight: 'bold'
                            }}
                        />
                        <Tooltip title="Verileri Yenile">
                            <IconButton
                                onClick={loadDashboardData}
                                disabled={refreshing}
                                sx={{
                                    bgcolor: '#fff',
                                    border: '1px solid #e0e0e0',
                                    '&:hover': { bgcolor: '#f5f5f5' },
                                    animation: refreshing ? 'rotation 2s infinite linear' : '',
                                    '@keyframes rotation': {
                                        from: { transform: 'rotate(0deg)' },
                                        to: { transform: 'rotate(360deg)' }
                                    }
                                }}
                            >
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
            </Fade>

            {error && (
                <Fade in>
                    <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                </Fade>
            )}

            {/* Main Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Music Library */}
                <Grid item xs={12} sm={6} md={3}>
                    <Fade in timeout={1000}>
                        <Card sx={{
                            height: '100%',
                            transition: 'all 0.3s',
                            bgcolor: '#fff',
                            border: '1px solid #e0e0e0',
                            cursor: 'pointer',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                            }
                        }}
                              onClick={() => navigate('/admin/music')}
                        >
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Avatar sx={{ bgcolor: '#000', mr: 2, width: 56, height: 56 }}>
                                        <MusicLibraryIcon />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h4" fontWeight="bold" color="#000">
                                            {stats.music.total}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Toplam Müzik
                                        </Typography>
                                    </Box>
                                </Box>
                                <Stack spacing={1}>
                                    <Box display="flex" alignItems="center" justifyContent="space-between">
                                        <Chip
                                            icon={<StarIcon />}
                                            label={`Öne Çıkan: ${stats.music.featured}`}
                                            size="small"
                                            sx={{ bgcolor: '#000', color: '#fff' }}
                                        />
                                    </Box>
                                    <Stack direction="row" spacing={1}>
                                        <Chip
                                            icon={<FavoriteIcon />}
                                            label={stats.music.totalLikes}
                                            size="small"
                                            variant="outlined"
                                        />
                                        <Chip
                                            icon={<VisibilityIcon />}
                                            label={stats.music.totalViews}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </Stack>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Fade>
                </Grid>

                {/* YENİ: Artists Card */}
                <Grid item xs={12} sm={6} md={3}>
                    <Grow in timeout={1100}>
                        <Card sx={{
                            height: '100%',
                            transition: 'all 0.3s',
                            bgcolor: '#fff',
                            border: '1px solid #e0e0e0',
                            cursor: 'pointer',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                            }
                        }}
                              onClick={() => navigate('/admin/artists')}
                        >
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Avatar sx={{ bgcolor: '#7C3AED', mr: 2, width: 56, height: 56 }}>
                                        <ArtistIcon />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h4" fontWeight="bold" color="#7C3AED">
                                            {stats.artists.total}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Toplam Artist
                                        </Typography>
                                    </Box>
                                </Box>
                                <Stack spacing={1}>
                                    <Stack direction="row" spacing={1}>
                                        <Chip
                                            icon={<VerifiedIcon />}
                                            label={`Claimed: ${stats.artists.claimed}`}
                                            size="small"
                                            sx={{ bgcolor: '#10B981', color: '#fff' }}
                                        />
                                        <Chip
                                            label={`Unclaimed: ${stats.artists.unclaimed}`}
                                            size="small"
                                            sx={{ bgcolor: '#6B7280', color: '#fff' }}
                                        />
                                    </Stack>
                                    {stats.artists.pendingClaims > 0 && (
                                        <Chip
                                            icon={<ClaimIcon />}
                                            label={`${stats.artists.pendingClaims} Bekleyen Başvuru`}
                                            size="small"
                                            sx={{ bgcolor: '#FF9800', color: '#fff' }}
                                        />
                                    )}
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grow>
                </Grid>

                {/* Playlists */}
                <Grid item xs={12} sm={6} md={3}>
                    <Grow in timeout={1200}>
                        <Card sx={{
                            height: '100%',
                            transition: 'all 0.3s',
                            bgcolor: '#fff',
                            border: '1px solid #e0e0e0',
                            cursor: 'pointer',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                            }
                        }}
                              onClick={() => navigate('/admin/playlists')}
                        >
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Avatar sx={{ bgcolor: '#424242', mr: 2, width: 56, height: 56 }}>
                                        <PlaylistIcon />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h4" fontWeight="bold" color="#424242">
                                            {stats.playlists.total}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Toplam Playlist
                                        </Typography>
                                    </Box>
                                </Box>
                                <Stack spacing={1}>
                                    <Stack direction="row" spacing={1}>
                                        <Chip
                                            label={`Admin: ${stats.playlists.admin}`}
                                            size="small"
                                            sx={{ bgcolor: '#000', color: '#fff' }}
                                        />
                                        <Chip
                                            label={`User: ${stats.playlists.user}`}
                                            size="small"
                                            sx={{ bgcolor: '#616161', color: '#fff' }}
                                        />
                                    </Stack>
                                    <Box display="flex" alignItems="center" gap={0.5}>
                                        <ImageIcon sx={{ fontSize: 14, color: '#000' }} />
                                        <Typography variant="caption" color="text.secondary">
                                            {stats.playlists.withCovers} cover görselli
                                        </Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grow>
                </Grid>

                {/* Users */}
                <Grid item xs={12} sm={6} md={3}>
                    <Grow in timeout={1400}>
                        <Card sx={{
                            height: '100%',
                            transition: 'all 0.3s',
                            bgcolor: '#fff',
                            border: '1px solid #e0e0e0',
                            cursor: 'pointer',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                            }
                        }}
                              onClick={() => navigate('/admin/users')}
                        >
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Avatar sx={{ bgcolor: '#757575', mr: 2, width: 56, height: 56 }}>
                                        <PeopleIcon />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h4" fontWeight="bold" color="#757575">
                                            {stats.users.total}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Toplam Kullanıcı
                                        </Typography>
                                    </Box>
                                </Box>
                                <Stack spacing={1}>
                                    <Stack direction="row" spacing={1}>
                                        <Chip
                                            label={`Aktif: ${stats.users.active}`}
                                            size="small"
                                            sx={{ bgcolor: '#000', color: '#fff' }}
                                        />
                                        <Chip
                                            label={`Premium: ${stats.users.premium}`}
                                            size="small"
                                            sx={{ bgcolor: '#424242', color: '#fff' }}
                                        />
                                    </Stack>
                                    <Box display="flex" alignItems="center" gap={0.5}>
                                        <TrendingUpIcon sx={{ fontSize: 14, color: '#000' }} />
                                        <Typography variant="caption" color="text.secondary">
                                            Bugün +{stats.users.newToday} yeni üye
                                        </Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grow>
                </Grid>
            </Grid>

            {/* Artist Stats Section - YENİ */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12}>
                    <Fade in timeout={1500}>
                        <Card sx={{ bgcolor: '#fff', border: '1px solid #e0e0e0' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Avatar sx={{ bgcolor: '#7C3AED', mr: 2 }}>
                                            <ArtistIcon />
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h6" fontWeight="bold">
                                                Artist Yönetimi
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Sanatçı profilleri ve claim başvuruları
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Button
                                        variant="contained"
                                        startIcon={<PersonAddIcon />}
                                        onClick={() => navigate('/admin/artists')}
                                        sx={{
                                            bgcolor: '#7C3AED',
                                            '&:hover': { bgcolor: '#6D28D9' }
                                        }}
                                    >
                                        Artist Yönetimi
                                    </Button>
                                </Box>

                                <Grid container spacing={3}>
                                    {/* Total Artists */}
                                    <Grid item xs={6} sm={3}>
                                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#F3F4F6', borderRadius: 2 }}>
                                            <ArtistIcon sx={{ fontSize: 32, color: '#7C3AED', mb: 1 }} />
                                            <Typography variant="h4" fontWeight="bold" color="#7C3AED">
                                                {stats.artists.total}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Toplam Artist
                                            </Typography>
                                        </Box>
                                    </Grid>

                                    {/* Claimed */}
                                    <Grid item xs={6} sm={3}>
                                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#D1FAE5', borderRadius: 2 }}>
                                            <VerifiedIcon sx={{ fontSize: 32, color: '#10B981', mb: 1 }} />
                                            <Typography variant="h4" fontWeight="bold" color="#10B981">
                                                {stats.artists.claimed}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Claimed (Sahiplenilmiş)
                                            </Typography>
                                        </Box>
                                    </Grid>

                                    {/* Unclaimed */}
                                    <Grid item xs={6} sm={3}>
                                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#F3F4F6', borderRadius: 2 }}>
                                            <PersonIcon sx={{ fontSize: 32, color: '#6B7280', mb: 1 }} />
                                            <Typography variant="h4" fontWeight="bold" color="#6B7280">
                                                {stats.artists.unclaimed}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Unclaimed (Sahipsiz)
                                            </Typography>
                                        </Box>
                                    </Grid>

                                    {/* Pending Claims */}
                                    <Grid item xs={6} sm={3}>
                                        <Box
                                            sx={{
                                                textAlign: 'center',
                                                p: 2,
                                                bgcolor: stats.artists.pendingClaims > 0 ? '#FEF3C7' : '#F3F4F6',
                                                borderRadius: 2,
                                                cursor: stats.artists.pendingClaims > 0 ? 'pointer' : 'default',
                                                transition: 'all 0.2s',
                                                '&:hover': stats.artists.pendingClaims > 0 ? {
                                                    bgcolor: '#FDE68A',
                                                    transform: 'scale(1.02)'
                                                } : {}
                                            }}
                                            onClick={() => stats.artists.pendingClaims > 0 && navigate('/admin/artists?tab=claims')}
                                        >
                                            <ClaimIcon sx={{ fontSize: 32, color: stats.artists.pendingClaims > 0 ? '#F59E0B' : '#9CA3AF', mb: 1 }} />
                                            <Typography variant="h4" fontWeight="bold" color={stats.artists.pendingClaims > 0 ? '#F59E0B' : '#9CA3AF'}>
                                                {stats.artists.pendingClaims}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Bekleyen Başvuru
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>

                                {/* Claim Rate Progress */}
                                <Box sx={{ mt: 3 }}>
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <Typography variant="body2" color="text.secondary">
                                            Claim Oranı
                                        </Typography>
                                        <Typography variant="body2" fontWeight="bold">
                                            %{getClaimRate()}
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={parseFloat(getClaimRate())}
                                        sx={{
                                            borderRadius: 2,
                                            height: 10,
                                            bgcolor: '#E5E7EB',
                                            '& .MuiLinearProgress-bar': {
                                                bgcolor: '#7C3AED'
                                            }
                                        }}
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    </Fade>
                </Grid>
            </Grid>

            {/* Platform Links Analytics */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12}>
                    <Fade in timeout={1800}>
                        <Card sx={{ bgcolor: '#fff', border: '1px solid #e0e0e0' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <Avatar sx={{ bgcolor: '#000', mr: 2 }}>
                                        <LinkIcon />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h6" fontWeight="bold">
                                            Platform Links Analizi • 5 Platform
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Müziklerin platform dağılımı ve kapsam oranları
                                        </Typography>
                                    </Box>
                                </Box>

                                <Grid container spacing={3}>
                                    {Object.entries(platformConfig).map(([key, config]) => {
                                        const count = stats.platformLinks[key];
                                        const percentage = stats.music.total > 0 ? (count / stats.music.total) * 100 : 0;
                                        const Icon = config.icon;

                                        return (
                                            <Grid item xs={12} sm={6} md={4} lg={2.4} key={key}>
                                                <Box>
                                                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                                                        <Box display="flex" alignItems="center" gap={1}>
                                                            <Icon sx={{ color: config.color, fontSize: 20 }} />
                                                            <Typography variant="body2" fontWeight="bold">
                                                                {config.label}
                                                            </Typography>
                                                        </Box>
                                                        <Chip
                                                            label={count}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: config.bgColor,
                                                                color: config.color,
                                                                fontWeight: 'bold'
                                                            }}
                                                        />
                                                    </Box>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={percentage}
                                                        sx={{
                                                            borderRadius: 2,
                                                            height: 8,
                                                            bgcolor: '#f5f5f5',
                                                            '& .MuiLinearProgress-bar': {
                                                                bgcolor: config.color
                                                            }
                                                        }}
                                                    />
                                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                                        {percentage.toFixed(1)}% kapsam
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        );
                                    })}
                                </Grid>

                                <Divider sx={{ my: 3 }} />

                                {/* Platform Summary */}
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={4}>
                                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#fafafa', borderRadius: 2 }}>
                                            <Typography variant="h5" fontWeight="bold" color="#000">
                                                {Object.values(stats.platformLinks).reduce((sum, count) => sum + count, 0)}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Toplam Platform Linki
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#fafafa', borderRadius: 2 }}>
                                            <Typography variant="h5" fontWeight="bold" color="#1DB954">
                                                {getPlatformCoverage()}%
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Ortalama Kapsam
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#fafafa', borderRadius: 2 }}>
                                            <Typography variant="h5" fontWeight="bold" color="#424242">
                                                5
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Desteklenen Platform
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Fade>
                </Grid>
            </Grid>

            {/* Genre Distribution & Quick Actions */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Genre Distribution */}
                <Grid item xs={12} md={6}>
                    <Fade in timeout={2000}>
                        <Card sx={{ bgcolor: '#fff', border: '1px solid #e0e0e0', height: '100%' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <Avatar sx={{ bgcolor: '#000', mr: 2 }}>
                                        <CategoryIcon />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h6" fontWeight="bold">
                                            Tür Dağılımı
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Müziklerin türlere göre dağılımı
                                        </Typography>
                                    </Box>
                                </Box>

                                <Stack spacing={2}>
                                    {topGenres.map((genre) => (
                                        <Box key={genre.genre}>
                                            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <Typography>{genre.icon}</Typography>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        {genre.label}
                                                    </Typography>
                                                </Box>
                                                <Chip
                                                    label={genre.count}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: genre.color,
                                                        color: '#fff',
                                                        fontWeight: 'bold'
                                                    }}
                                                />
                                            </Box>
                                            <LinearProgress
                                                variant="determinate"
                                                value={stats.music.total > 0 ? (genre.count / stats.music.total) * 100 : 0}
                                                sx={{
                                                    borderRadius: 2,
                                                    height: 8,
                                                    bgcolor: '#f5f5f5',
                                                    '& .MuiLinearProgress-bar': {
                                                        bgcolor: genre.color
                                                    }
                                                }}
                                            />
                                        </Box>
                                    ))}
                                </Stack>
                            </CardContent>
                        </Card>
                    </Fade>
                </Grid>

                {/* Quick Actions */}
                <Grid item xs={12} md={6}>
                    <Fade in timeout={2200}>
                        <Card sx={{ bgcolor: '#fff', border: '1px solid #e0e0e0', height: '100%' }}>
                            <CardContent>
                                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PsychologyIcon />
                                    Hızlı İşlemler
                                </Typography>
                                <Stack spacing={1}>
                                    <Button
                                        variant="contained"
                                        startIcon={<CloudUploadIcon />}
                                        fullWidth
                                        size="large"
                                        onClick={() => navigate('/admin/music')}
                                        sx={{
                                            justifyContent: 'flex-start',
                                            bgcolor: '#000',
                                            color: '#fff',
                                            '&:hover': {
                                                bgcolor: '#212121'
                                            }
                                        }}
                                    >
                                        Yeni Müzik Ekle
                                    </Button>
                                    <Button
                                        variant="contained"
                                        startIcon={<PersonAddIcon />}
                                        fullWidth
                                        size="large"
                                        onClick={() => navigate('/admin/artists')}
                                        sx={{
                                            justifyContent: 'flex-start',
                                            bgcolor: '#7C3AED',
                                            color: '#fff',
                                            '&:hover': {
                                                bgcolor: '#6D28D9'
                                            }
                                        }}
                                    >
                                        Yeni Artist Ekle
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        startIcon={<PlaylistIcon />}
                                        fullWidth
                                        size="large"
                                        onClick={() => navigate('/admin/playlists')}
                                        sx={{
                                            justifyContent: 'flex-start',
                                            borderColor: '#000',
                                            color: '#000',
                                            '&:hover': {
                                                borderColor: '#000',
                                                bgcolor: '#00000005'
                                            }
                                        }}
                                    >
                                        Admin Playlist Oluştur
                                    </Button>
                                    {stats.artists.pendingClaims > 0 && (
                                        <Button
                                            variant="contained"
                                            startIcon={<ClaimIcon />}
                                            fullWidth
                                            size="large"
                                            onClick={() => navigate('/admin/artists?tab=claims')}
                                            sx={{
                                                justifyContent: 'flex-start',
                                                bgcolor: '#F59E0B',
                                                color: '#fff',
                                                '&:hover': {
                                                    bgcolor: '#D97706'
                                                }
                                            }}
                                        >
                                            Claim Başvurularını İncele ({stats.artists.pendingClaims})
                                        </Button>
                                    )}
                                    <Button
                                        variant="outlined"
                                        startIcon={<NotificationIcon />}
                                        fullWidth
                                        size="large"
                                        onClick={() => navigate('/admin/notifications')}
                                        sx={{
                                            justifyContent: 'flex-start',
                                            borderColor: '#616161',
                                            color: '#616161',
                                            '&:hover': {
                                                borderColor: '#616161',
                                                bgcolor: '#61616105'
                                            }
                                        }}
                                    >
                                        Bildirim Gönder
                                    </Button>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Fade>
                </Grid>
            </Grid>

            {/* Recent Activity & Recent Artists */}
            <Grid container spacing={3}>
                {/* Recent Activity */}
                <Grid item xs={12} lg={6}>
                    <Fade in timeout={2600}>
                        <Paper sx={{ p: 3, bgcolor: '#fff', border: '1px solid #e0e0e0' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <AccessTimeIcon />
                                    Son Aktiviteler
                                </Typography>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<RefreshIcon />}
                                    onClick={loadDashboardData}
                                    disabled={refreshing}
                                    sx={{
                                        borderColor: '#000',
                                        color: '#000',
                                        '&:hover': {
                                            borderColor: '#000',
                                            bgcolor: '#00000005'
                                        }
                                    }}
                                >
                                    Yenile
                                </Button>
                            </Box>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Aktivite</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Tip</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Zaman</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {recentActivity.map((activity) => (
                                            <TableRow key={activity.id} hover>
                                                <TableCell>{activity.activity}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={activity.type}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: activity.type === 'music' ? '#000' :
                                                                activity.type === 'playlist' ? '#424242' :
                                                                    activity.type === 'artist' ? '#7C3AED' :
                                                                        activity.type === 'claim' ? '#F59E0B' : '#757575',
                                                            color: '#fff'
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>{activity.time}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Fade>
                </Grid>

                {/* Recent Artists - YENİ */}
                <Grid item xs={12} lg={6}>
                    <Fade in timeout={2800}>
                        <Paper sx={{ p: 3, bgcolor: '#fff', border: '1px solid #e0e0e0' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <ArtistIcon />
                                    Son Eklenen Artistler
                                </Typography>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => navigate('/admin/artists')}
                                    sx={{
                                        borderColor: '#7C3AED',
                                        color: '#7C3AED',
                                        '&:hover': {
                                            borderColor: '#7C3AED',
                                            bgcolor: '#7C3AED10'
                                        }
                                    }}
                                >
                                    Tümünü Gör
                                </Button>
                            </Box>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Artist</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Durum</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Takipçi</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {recentArtists.length > 0 ? recentArtists.map((artist) => (
                                            <TableRow key={artist._id} hover>
                                                <TableCell>
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <Avatar
                                                            src={artist.profileImage}
                                                            sx={{ width: 32, height: 32 }}
                                                        >
                                                            {artist.name?.charAt(0)}
                                                        </Avatar>
                                                        <Typography variant="body2">
                                                            {artist.name}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        icon={artist.claimStatus === 'claimed' ? <VerifiedIcon /> : undefined}
                                                        label={artist.claimStatus === 'claimed' ? 'Claimed' :
                                                            artist.claimStatus === 'pending' ? 'Pending' : 'Unclaimed'}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: artist.claimStatus === 'claimed' ? '#10B981' :
                                                                artist.claimStatus === 'pending' ? '#F59E0B' : '#6B7280',
                                                            color: '#fff'
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {artist.followers?.length || 0}
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={3} align="center">
                                                    <Typography variant="body2" color="text.secondary">
                                                        Henüz artist eklenmemiş
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Fade>
                </Grid>
            </Grid>

            {/* System Stats Row */}
            <Grid container spacing={3} sx={{ mt: 2 }}>
                {/* System Health */}
                <Grid item xs={12} md={4}>
                    <Fade in timeout={3000}>
                        <Paper sx={{ p: 3, bgcolor: '#fff', border: '1px solid #e0e0e0' }}>
                            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <SpeedIcon />
                                Sistem Durumu
                            </Typography>
                            <Stack spacing={2}>
                                <Box display="flex" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">Çalışma Süresi</Typography>
                                    <Typography variant="body1" fontWeight="bold">{systemHealth.uptime}</Typography>
                                </Box>
                                <Divider />
                                <Box display="flex" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">Yanıt Süresi</Typography>
                                    <Typography variant="body1" fontWeight="bold">{systemHealth.responseTime}</Typography>
                                </Box>
                                <Divider />
                                <Box display="flex" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">Aktif Bağlantılar</Typography>
                                    <Typography variant="body1" fontWeight="bold">{systemHealth.activeConnections}</Typography>
                                </Box>
                                <Chip
                                    label={`Durum: ${systemHealth.status}`}
                                    sx={{ alignSelf: 'flex-start', fontWeight: 'bold', bgcolor: '#000', color: '#fff' }}
                                />
                            </Stack>
                        </Paper>
                    </Fade>
                </Grid>

                {/* Store Stats */}
                <Grid item xs={12} md={4}>
                    <Fade in timeout={3200}>
                        <Paper sx={{ p: 3, bgcolor: '#fff', border: '1px solid #e0e0e0' }}>
                            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <StoreIcon />
                                Store İstatistikleri
                            </Typography>
                            <Stack spacing={2}>
                                <Box display="flex" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">Toplam İlan</Typography>
                                    <Typography variant="body1" fontWeight="bold">{stats.store.totalListings}</Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">Aktif İlan</Typography>
                                    <Typography variant="body1" fontWeight="bold">{stats.store.activeListings}</Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">Gelir</Typography>
                                    <Typography variant="body1" fontWeight="bold" color="#1DB954">
                                        {stats.store.revenue.toLocaleString()} TL
                                    </Typography>
                                </Box>
                            </Stack>
                        </Paper>
                    </Fade>
                </Grid>

                {/* Notification Stats */}
                <Grid item xs={12} md={4}>
                    <Fade in timeout={3400}>
                        <Paper sx={{ p: 3, bgcolor: '#fff', border: '1px solid #e0e0e0' }}>
                            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <NotificationIcon />
                                Bildirimler
                            </Typography>
                            <Grid container spacing={2} sx={{ mb: 2 }}>
                                <Grid item xs={6}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="h5" fontWeight="bold">{stats.notifications.sent}</Typography>
                                        <Typography variant="caption" color="text.secondary">Gönderilen</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="h5" fontWeight="bold">{stats.notifications.delivered}</Typography>
                                        <Typography variant="caption" color="text.secondary">Teslim</Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                            <Box>
                                <Box display="flex" justifyContent="space-between" mb={1}>
                                    <Typography variant="body2" color="text.secondary">Başarı Oranı</Typography>
                                    <Typography variant="body2" fontWeight="bold">%{stats.notifications.deliveryRate}</Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={stats.notifications.deliveryRate}
                                    sx={{
                                        borderRadius: 2,
                                        height: 8,
                                        bgcolor: '#f5f5f5',
                                        '& .MuiLinearProgress-bar': { bgcolor: '#000' }
                                    }}
                                />
                            </Box>
                        </Paper>
                    </Fade>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;