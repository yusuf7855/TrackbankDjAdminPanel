// src/pages/Backups.jsx - Database Backup Management
import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    Button,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tooltip,
    LinearProgress
} from '@mui/material';
import {
    Backup as BackupIcon,
    Download as DownloadIcon,
    Delete as DeleteIcon,
    Refresh as RefreshIcon,
    Storage as StorageIcon,
    Schedule as ScheduleIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon
} from '@mui/icons-material';
import { api } from '../services/api';

export default function Backups() {
    const [backups, setBackups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [deleteDialog, setDeleteDialog] = useState({ open: false, backup: null });
    const [stats, setStats] = useState({ totalSize: 0, backupCount: 0, lastBackup: null });

    useEffect(() => {
        fetchBackups();
    }, []);

    const fetchBackups = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/admin/backups');
            if (response.data.success) {
                setBackups(response.data.backups || []);
                setStats({
                    totalSize: response.data.totalSize || 0,
                    backupCount: response.data.backups?.length || 0,
                    lastBackup: response.data.backups?.[0]?.createdAt || null
                });
            }
        } catch (err) {
            setError('Yedekler yüklenirken hata oluştu: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const createBackup = async () => {
        try {
            setCreating(true);
            setError(null);
            setSuccess(null);
            const response = await api.post('/admin/backups/create');
            if (response.data.success) {
                setSuccess('Yedekleme başarıyla oluşturuldu!');
                fetchBackups();
            }
        } catch (err) {
            setError('Yedekleme oluşturulurken hata: ' + (err.response?.data?.message || err.message));
        } finally {
            setCreating(false);
        }
    };

    const deleteBackup = async (backupName) => {
        try {
            setError(null);
            const response = await api.delete(`/admin/backups/${backupName}`);
            if (response.data.success) {
                setSuccess('Yedek silindi!');
                fetchBackups();
            }
        } catch (err) {
            setError('Yedek silinirken hata: ' + (err.response?.data?.message || err.message));
        }
        setDeleteDialog({ open: false, backup: null });
    };

    const downloadBackup = async (backupName) => {
        try {
            window.open(`${api.defaults.baseURL}/admin/backups/${backupName}/download`, '_blank');
        } catch (err) {
            setError('İndirme başlatılamadı');
        }
    };

    const formatSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleString('tr-TR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                        Veritabanı Yedekleri
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Otomatik günlük yedekleme aktif (Her gün 03:00)
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={fetchBackups}
                        disabled={loading}
                    >
                        Yenile
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={creating ? <CircularProgress size={20} color="inherit" /> : <BackupIcon />}
                        onClick={createBackup}
                        disabled={creating}
                        sx={{ backgroundColor: '#000', '&:hover': { backgroundColor: '#333' } }}
                    >
                        {creating ? 'Oluşturuluyor...' : 'Manuel Yedek Al'}
                    </Button>
                </Box>
            </Box>

            {/* Alerts */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
                    {success}
                </Alert>
            )}

            {/* Stats Cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
                <Card>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <StorageIcon sx={{ fontSize: 40, color: '#1976d2' }} />
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                {formatSize(stats.totalSize)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Toplam Boyut
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <BackupIcon sx={{ fontSize: 40, color: '#4caf50' }} />
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                {stats.backupCount}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Toplam Yedek
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <ScheduleIcon sx={{ fontSize: 40, color: '#ff9800' }} />
                        <Box>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {stats.lastBackup ? formatDate(stats.lastBackup) : 'Henüz yok'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Son Yedek
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Box>

            {/* Backups Table */}
            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        Yedek Listesi
                    </Typography>

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : backups.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <BackupIcon sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
                            <Typography color="text.secondary">
                                Henüz yedek bulunmuyor
                            </Typography>
                        </Box>
                    ) : (
                        <TableContainer component={Paper} elevation={0}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 600 }}>Yedek Adı</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Tarih</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Boyut</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Tür</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Durum</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }} align="right">İşlemler</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {backups.map((backup) => (
                                        <TableRow key={backup.name} hover>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <StorageIcon sx={{ color: '#666', fontSize: 20 }} />
                                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                        {backup.name}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>{formatDate(backup.createdAt)}</TableCell>
                                            <TableCell>{formatSize(backup.size)}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={backup.type === 'auto' ? 'Otomatik' : 'Manuel'}
                                                    size="small"
                                                    color={backup.type === 'auto' ? 'info' : 'default'}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    icon={backup.status === 'completed' ? <CheckCircleIcon /> : <ErrorIcon />}
                                                    label={backup.status === 'completed' ? 'Tamamlandı' : 'Hata'}
                                                    size="small"
                                                    color={backup.status === 'completed' ? 'success' : 'error'}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <Tooltip title="İndir">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => downloadBackup(backup.name)}
                                                        sx={{ color: '#1976d2' }}
                                                    >
                                                        <DownloadIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Sil">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => setDeleteDialog({ open: true, backup: backup.name })}
                                                        sx={{ color: '#d32f2f' }}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, backup: null })}>
                <DialogTitle>Yedeği Sil</DialogTitle>
                <DialogContent>
                    <Typography>
                        <strong>{deleteDialog.backup}</strong> yedeğini silmek istediğinize emin misiniz?
                        Bu işlem geri alınamaz.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, backup: null })}>
                        İptal
                    </Button>
                    <Button
                        onClick={() => deleteBackup(deleteDialog.backup)}
                        color="error"
                        variant="contained"
                    >
                        Sil
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
