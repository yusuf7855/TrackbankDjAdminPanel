// src/pages/ArtistEssentialApproval.jsx
// Admin paneli - Artist Essential Playlist Onay Sayfası
// ✅ Playlist modeli ile uyumlu (isArtistEssential: true)

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Button,
    Chip,
    Avatar,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Tabs,
    Tab,
    Paper,
    CircularProgress,
    Alert,
    Snackbar,
    Tooltip,
    Badge,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    ListItemSecondaryAction
} from '@mui/material';
import {
    CheckCircle as ApproveIcon,
    Cancel as RejectIcon,
    Visibility as ViewIcon,
    PlaylistPlay as PlaylistIcon,
    Person as PersonIcon,
    MusicNote as MusicIcon,
    Schedule as PendingIcon,
    ThumbUp as ApprovedIcon,
    ThumbDown as RejectedIcon,
    Refresh as RefreshIcon,
    Close as CloseIcon,
    Diamond as PremiumIcon,
    Star as StandardIcon,
    VerifiedUser as VerifiedIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            {...other}
        >
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
}

export default function ArtistEssentialApproval() {
    const [tabValue, setTabValue] = useState(0);
    const [playlists, setPlaylists] = useState({
        pending: [],
        approved: [],
        rejected: []
    });
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Dialog states
    const [viewDialog, setViewDialog] = useState({ open: false, playlist: null });
    const [rejectDialog, setRejectDialog] = useState({ open: false, playlist: null, reason: '' });

    // Stats
    const [stats, setStats] = useState({
        pending: 0,
        approved: 0,
        rejected: 0
    });

    useEffect(() => {
        fetchPlaylists();
    }, []);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
        return { Authorization: `Bearer ${token}` };
    };

    const fetchPlaylists = async () => {
        setLoading(true);
        try {
            // ✅ Auth header yok - Admin panel public
            const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/admin/artist-essential/playlists?status=pending`),
                axios.get(`${API_BASE_URL}/api/admin/artist-essential/playlists?status=approved&limit=50`),
                axios.get(`${API_BASE_URL}/api/admin/artist-essential/playlists?status=rejected&limit=50`)
            ]);

            const pendingData = pendingRes.data?.data?.playlists || [];
            const approvedData = approvedRes.data?.data?.playlists || [];
            const rejectedData = rejectedRes.data?.data?.playlists || [];

            setPlaylists({
                pending: pendingData,
                approved: approvedData,
                rejected: rejectedData
            });

            setStats({
                pending: pendingData.length,
                approved: approvedData.length,
                rejected: rejectedData.length
            });

        } catch (err) {
            console.error('Fetch playlists error:', err);
            setError('Playlistler yüklenirken hata oluştu: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (playlistId) => {
        setActionLoading(playlistId);
        try {
            await axios.post(
                `${API_BASE_URL}/api/admin/artist-essential/playlists/${playlistId}/approve`
            );

            setSuccess('Playlist başarıyla onaylandı!');
            fetchPlaylists();
        } catch (err) {
            console.error('Approve error:', err);
            setError(err.response?.data?.message || 'Onaylama sırasında hata oluştu');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async () => {
        if (!rejectDialog.playlist) return;

        setActionLoading(rejectDialog.playlist._id);
        try {
            await axios.post(
                `${API_BASE_URL}/api/admin/artist-essential/playlists/${rejectDialog.playlist._id}/reject`,
                { reason: rejectDialog.reason },
                { headers: getAuthHeaders() }
            );

            setSuccess('Playlist reddedildi');
            setRejectDialog({ open: false, playlist: null, reason: '' });
            fetchPlaylists();
        } catch (err) {
            console.error('Reject error:', err);
            setError(err.response?.data?.message || 'Reddetme sırasında hata oluştu');
        } finally {
            setActionLoading(null);
        }
    };

    const getBadgeIcon = (badge) => {
        switch (badge) {
            case 'premium':
                return <PremiumIcon sx={{ color: '#ffd700', fontSize: 16 }} />;
            case 'standard':
                return <StandardIcon sx={{ color: '#7c3aed', fontSize: 16 }} />;
            case 'trackbang':
                return <VerifiedIcon sx={{ color: '#1da1f2', fontSize: 16 }} />;
            default:
                return null;
        }
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('data:image')) return url;
        if (url.startsWith('http')) return url;
        return `${API_BASE_URL}${url}`;
    };

    // Playlist Card Component
    const PlaylistCard = ({ playlist, showActions = true, status = 'pending' }) => {
        // userId populate edilmiş owner bilgisi
        const owner = playlist.userId || {};
        const badge = owner.badge || 'standard';
        const musicCount = playlist.musics?.length || 0;

        return (
            <Card sx={{
                mb: 2,
                border: status === 'pending' ? '2px solid #ff9800' : '1px solid #e0e0e0',
                transition: 'all 0.2s',
                '&:hover': { boxShadow: 4 }
            }}>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        {/* Cover Image */}
                        <Grid item xs={12} sm={2}>
                            <Avatar
                                variant="rounded"
                                src={getImageUrl(playlist.coverImage)}
                                sx={{ width: 80, height: 80, bgcolor: '#f5f5f5' }}
                            >
                                <PlaylistIcon sx={{ fontSize: 40, color: '#999' }} />
                            </Avatar>
                        </Grid>

                        {/* Playlist Info */}
                        <Grid item xs={12} sm={4}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {playlist.name}
                                </Typography>
                                {getBadgeIcon(badge)}
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {playlist.description || 'Açıklama yok'}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Chip
                                    icon={<MusicIcon sx={{ fontSize: 14 }} />}
                                    label={`${musicCount} şarkı`}
                                    size="small"
                                    variant="outlined"
                                />
                                <Chip
                                    label={badge === 'premium' ? 'Premium' : badge === 'trackbang' ? 'TrackBang' : 'Standard'}
                                    size="small"
                                    sx={{
                                        bgcolor: badge === 'premium' ? '#fff3e0' : badge === 'trackbang' ? '#e3f2fd' : '#ede7f6',
                                        color: badge === 'premium' ? '#e65100' : badge === 'trackbang' ? '#1565c0' : '#5e35b1'
                                    }}
                                />
                            </Box>
                        </Grid>

                        {/* Owner Info */}
                        <Grid item xs={12} sm={3}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar
                                    src={getImageUrl(owner.profileImage)}
                                    sx={{ width: 32, height: 32 }}
                                >
                                    <PersonIcon />
                                </Avatar>
                                <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {owner.displayName || owner.username || owner.firstName || 'Bilinmiyor'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {formatDate(playlist.createdAt)}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>

                        {/* Actions */}
                        <Grid item xs={12} sm={3}>
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                <Tooltip title="Detayları Gör">
                                    <IconButton
                                        onClick={() => setViewDialog({ open: true, playlist })}
                                        size="small"
                                    >
                                        <ViewIcon />
                                    </IconButton>
                                </Tooltip>

                                {showActions && status === 'pending' && (
                                    <>
                                        <Button
                                            variant="contained"
                                            color="success"
                                            size="small"
                                            startIcon={actionLoading === playlist._id ?
                                                <CircularProgress size={16} color="inherit" /> :
                                                <ApproveIcon />
                                            }
                                            onClick={() => handleApprove(playlist._id)}
                                            disabled={actionLoading === playlist._id}
                                        >
                                            Onayla
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            size="small"
                                            startIcon={<RejectIcon />}
                                            onClick={() => setRejectDialog({
                                                open: true,
                                                playlist,
                                                reason: ''
                                            })}
                                            disabled={actionLoading === playlist._id}
                                        >
                                            Reddet
                                        </Button>
                                    </>
                                )}

                                {status === 'approved' && (
                                    <Chip
                                        icon={<ApprovedIcon />}
                                        label="Onaylandı"
                                        color="success"
                                        size="small"
                                    />
                                )}

                                {status === 'rejected' && (
                                    <Tooltip title={playlist.rejectionReason || 'Sebep belirtilmedi'}>
                                        <Chip
                                            icon={<RejectedIcon />}
                                            label="Reddedildi"
                                            color="error"
                                            size="small"
                                        />
                                    </Tooltip>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        );
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                        Artist Essential Onay
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Artist playlistlerini incele ve onayla
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={fetchPlaylists}
                    disabled={loading}
                >
                    Yenile
                </Button>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                    <Card sx={{ bgcolor: '#fff3e0' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: '#ff9800' }}>
                                <PendingIcon />
                            </Avatar>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                    {stats.pending}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Bekleyen
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card sx={{ bgcolor: '#e8f5e9' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: '#4caf50' }}>
                                <ApprovedIcon />
                            </Avatar>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                    {stats.approved}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Onaylanan
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card sx={{ bgcolor: '#ffebee' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: '#f44336' }}>
                                <RejectedIcon />
                            </Avatar>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                    {stats.rejected}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Reddedilen
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Tabs */}
            <Paper sx={{ mb: 2 }}>
                <Tabs
                    value={tabValue}
                    onChange={(e, v) => setTabValue(v)}
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab
                        label={
                            <Badge badgeContent={stats.pending} color="warning">
                                <Box sx={{ pr: 2 }}>Bekleyenler</Box>
                            </Badge>
                        }
                    />
                    <Tab label={`Onaylananlar (${stats.approved})`} />
                    <Tab label={`Reddedilenler (${stats.rejected})`} />
                </Tabs>
            </Paper>

            {/* Loading */}
            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                    <CircularProgress />
                </Box>
            )}

            {/* Tab Panels */}
            {!loading && (
                <>
                    <TabPanel value={tabValue} index={0}>
                        {playlists.pending.length === 0 ? (
                            <Alert severity="info">
                                Onay bekleyen playlist bulunmuyor
                            </Alert>
                        ) : (
                            playlists.pending.map(playlist => (
                                <PlaylistCard
                                    key={playlist._id}
                                    playlist={playlist}
                                    status="pending"
                                />
                            ))
                        )}
                    </TabPanel>

                    <TabPanel value={tabValue} index={1}>
                        {playlists.approved.length === 0 ? (
                            <Alert severity="info">
                                Onaylanmış playlist bulunmuyor
                            </Alert>
                        ) : (
                            playlists.approved.map(playlist => (
                                <PlaylistCard
                                    key={playlist._id}
                                    playlist={playlist}
                                    status="approved"
                                    showActions={false}
                                />
                            ))
                        )}
                    </TabPanel>

                    <TabPanel value={tabValue} index={2}>
                        {playlists.rejected.length === 0 ? (
                            <Alert severity="info">
                                Reddedilmiş playlist bulunmuyor
                            </Alert>
                        ) : (
                            playlists.rejected.map(playlist => (
                                <PlaylistCard
                                    key={playlist._id}
                                    playlist={playlist}
                                    status="rejected"
                                    showActions={false}
                                />
                            ))
                        )}
                    </TabPanel>
                </>
            )}

            {/* View Dialog */}
            <Dialog
                open={viewDialog.open}
                onClose={() => setViewDialog({ open: false, playlist: null })}
                maxWidth="md"
                fullWidth
            >
                {viewDialog.playlist && (
                    <>
                        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar
                                    variant="rounded"
                                    src={getImageUrl(viewDialog.playlist.coverImage)}
                                    sx={{ width: 48, height: 48 }}
                                >
                                    <PlaylistIcon />
                                </Avatar>
                                <Box>
                                    <Typography variant="h6">{viewDialog.playlist.name}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {viewDialog.playlist.musics?.length || 0} şarkı
                                    </Typography>
                                </Box>
                            </Box>
                            <IconButton onClick={() => setViewDialog({ open: false, playlist: null })}>
                                <CloseIcon />
                            </IconButton>
                        </DialogTitle>
                        <DialogContent dividers>
                            {/* Description */}
                            {viewDialog.playlist.description && (
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Açıklama
                                    </Typography>
                                    <Typography>{viewDialog.playlist.description}</Typography>
                                </Box>
                            )}

                            {/* Owner Info */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                                    Oluşturan
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar src={getImageUrl(viewDialog.playlist.userId?.profileImage)}>
                                        <PersonIcon />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="body1">
                                            {viewDialog.playlist.userId?.displayName || viewDialog.playlist.userId?.username || 'Bilinmiyor'}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {viewDialog.playlist.userId?.email}
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label={viewDialog.playlist.userId?.badge || 'standard'}
                                        size="small"
                                    />
                                </Box>
                            </Box>

                            {/* Music List */}
                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                                Şarkılar
                            </Typography>
                            <List sx={{ bgcolor: '#f5f5f5', borderRadius: 2 }}>
                                {viewDialog.playlist.musics?.map((music, index) => (
                                    <ListItem key={music._id || index} divider={index < viewDialog.playlist.musics.length - 1}>
                                        <ListItemAvatar>
                                            <Avatar
                                                variant="rounded"
                                                src={getImageUrl(music.imageUrl)}
                                            >
                                                <MusicIcon />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={music.title}
                                            secondary={music.artist || music.artistNames}
                                        />
                                        <ListItemSecondaryAction>
                                            <Chip
                                                label={music.genre}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                                {(!viewDialog.playlist.musics || viewDialog.playlist.musics.length === 0) && (
                                    <ListItem>
                                        <ListItemText
                                            primary="Şarkı bulunamadı"
                                            secondary="Bu playlist henüz şarkı içermiyor"
                                        />
                                    </ListItem>
                                )}
                            </List>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setViewDialog({ open: false, playlist: null })}>
                                Kapat
                            </Button>
                            {viewDialog.playlist.adminApprovalStatus === 'pending' && (
                                <>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={() => {
                                            setViewDialog({ open: false, playlist: null });
                                            setRejectDialog({ open: true, playlist: viewDialog.playlist, reason: '' });
                                        }}
                                    >
                                        Reddet
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="success"
                                        onClick={() => {
                                            handleApprove(viewDialog.playlist._id);
                                            setViewDialog({ open: false, playlist: null });
                                        }}
                                    >
                                        Onayla
                                    </Button>
                                </>
                            )}
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* Reject Dialog */}
            <Dialog
                open={rejectDialog.open}
                onClose={() => setRejectDialog({ open: false, playlist: null, reason: '' })}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Playlist'i Reddet
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        "{rejectDialog.playlist?.name}" playlistini reddetmek istediğinize emin misiniz?
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Red Sebebi (İsteğe bağlı)"
                        placeholder="Kullanıcıya gösterilecek red sebebini yazın..."
                        value={rejectDialog.reason}
                        onChange={(e) => setRejectDialog({ ...rejectDialog, reason: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRejectDialog({ open: false, playlist: null, reason: '' })}>
                        İptal
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleReject}
                        disabled={actionLoading === rejectDialog.playlist?._id}
                    >
                        {actionLoading === rejectDialog.playlist?._id ? (
                            <CircularProgress size={20} color="inherit" />
                        ) : (
                            'Reddet'
                        )}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbars */}
            <Snackbar
                open={!!success}
                autoHideDuration={3000}
                onClose={() => setSuccess(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity="success" onClose={() => setSuccess(null)}>
                    {success}
                </Alert>
            </Snackbar>

            <Snackbar
                open={!!error}
                autoHideDuration={5000}
                onClose={() => setError(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity="error" onClose={() => setError(null)}>
                    {error}
                </Alert>
            </Snackbar>
        </Box>
    );
}