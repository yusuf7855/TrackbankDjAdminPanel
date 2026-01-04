import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Alert,
    Grid,
    Paper,
    Pagination,
    Tooltip
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    Visibility as ViewIcon,
    Reply as ReplyIcon,
    SupportAgent as SupportIcon,
    CheckCircle as ResolvedIcon,
    HourglassEmpty as PendingIcon,
    Build as InProgressIcon,
    Close as ClosedIcon
} from '@mui/icons-material';

const API_BASE_URL = 'https://api.trackbangserver.com';

export default function SupportTickets() {
    const [tickets, setTickets] = useState([]);
    const [stats, setStats] = useState({ open: 0, inProgress: 0, resolved: 0, closed: 0, total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [replyDialogOpen, setReplyDialogOpen] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [replyStatus, setReplyStatus] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [submitting, setSubmitting] = useState(false);

    const fetchTickets = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/support/admin/tickets?status=${statusFilter}&page=${page}&limit=20`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) throw new Error('Talepler yüklenemedi');

            const data = await response.json();
            setTickets(data.tickets || []);
            setTotalPages(data.totalPages || 1);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/support/admin/tickets/stats`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) throw new Error('İstatistikler yüklenemedi');

            const data = await response.json();
            setStats(data.stats || { open: 0, inProgress: 0, resolved: 0, closed: 0, total: 0 });
        } catch (err) {
            console.error('Stats error:', err);
        }
    };

    useEffect(() => {
        fetchTickets();
        fetchStats();
    }, [statusFilter, page]);

    const handleUpdateStatus = async (ticketId, newStatus) => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/support/admin/tickets/${ticketId}/status`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ status: newStatus })
                }
            );

            if (!response.ok) throw new Error('Durum güncellenemedi');

            fetchTickets();
            fetchStats();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleSendReply = async () => {
        if (!replyText.trim() || !selectedTicket) return;

        setSubmitting(true);
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/support/admin/tickets/${selectedTicket._id}/respond`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        response: replyText,
                        status: replyStatus || undefined
                    })
                }
            );

            if (!response.ok) throw new Error('Yanıt gönderilemedi');

            setReplyDialogOpen(false);
            setReplyText('');
            setReplyStatus('');
            setSelectedTicket(null);
            fetchTickets();
            fetchStats();
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusChip = (status) => {
        const statusConfig = {
            open: { label: 'Açık', color: 'warning', icon: <PendingIcon sx={{ fontSize: 14 }} /> },
            in_progress: { label: 'İşleniyor', color: 'info', icon: <InProgressIcon sx={{ fontSize: 14 }} /> },
            resolved: { label: 'Çözüldü', color: 'success', icon: <ResolvedIcon sx={{ fontSize: 14 }} /> },
            closed: { label: 'Kapatıldı', color: 'default', icon: <ClosedIcon sx={{ fontSize: 14 }} /> }
        };

        const config = statusConfig[status] || statusConfig.open;

        return (
            <Chip
                label={config.label}
                color={config.color}
                size="small"
                icon={config.icon}
                sx={{ fontWeight: 600 }}
            />
        );
    };

    const getCategoryLabel = (category) => {
        const categories = {
            billing: 'Ödeme/Fatura',
            bug: 'Hata Bildirimi',
            suggestion: 'Öneri',
            other: 'Diğer'
        };
        return categories[category] || category;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('tr-TR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <SupportIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                    <Typography variant="h5" fontWeight={700}>
                        Destek Talepleri
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={() => { fetchTickets(); fetchStats(); }}
                >
                    Yenile
                </Button>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} md={2.4}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0' }}>
                        <Typography variant="h4" fontWeight={700} color="warning.main">
                            {stats.open}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">Açık</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={6} md={2.4}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd' }}>
                        <Typography variant="h4" fontWeight={700} color="info.main">
                            {stats.inProgress}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">İşleniyor</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={6} md={2.4}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9' }}>
                        <Typography variant="h4" fontWeight={700} color="success.main">
                            {stats.resolved}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">Çözüldü</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={6} md={2.4}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f5f5f5' }}>
                        <Typography variant="h4" fontWeight={700} color="text.secondary">
                            {stats.closed}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">Kapatıldı</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={2.4}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fce4ec' }}>
                        <Typography variant="h4" fontWeight={700} color="primary.main">
                            {stats.total}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">Toplam</Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* Filter */}
            <Card sx={{ mb: 3 }}>
                <CardContent sx={{ py: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Durum Filtrele</InputLabel>
                        <Select
                            value={statusFilter}
                            label="Durum Filtrele"
                            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        >
                            <MenuItem value="all">Tümü</MenuItem>
                            <MenuItem value="open">Açık</MenuItem>
                            <MenuItem value="in_progress">İşleniyor</MenuItem>
                            <MenuItem value="resolved">Çözüldü</MenuItem>
                            <MenuItem value="closed">Kapatıldı</MenuItem>
                        </Select>
                    </FormControl>
                </CardContent>
            </Card>

            {/* Error Alert */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Tickets Table */}
            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Kullanıcı</TableCell>
                                <TableCell>Kategori</TableCell>
                                <TableCell>Konu</TableCell>
                                <TableCell>Durum</TableCell>
                                <TableCell>Tarih</TableCell>
                                <TableCell align="right">İşlemler</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : tickets.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                        <Typography color="text.secondary">
                                            Henüz destek talebi yok
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                tickets.map((ticket) => (
                                    <TableRow key={ticket._id} hover>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {ticket.user?.username || 'Bilinmiyor'}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {ticket.user?.email || ''}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={getCategoryLabel(ticket.category)}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{
                                                maxWidth: 250,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {ticket.subject}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {getStatusChip(ticket.status)}
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="caption">
                                                {formatDate(ticket.createdAt)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Görüntüle">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => {
                                                        setSelectedTicket(ticket);
                                                        setViewDialogOpen(true);
                                                    }}
                                                >
                                                    <ViewIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Yanıtla">
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => {
                                                        setSelectedTicket(ticket);
                                                        setReplyText('');
                                                        setReplyStatus(ticket.status);
                                                        setReplyDialogOpen(true);
                                                    }}
                                                >
                                                    <ReplyIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Pagination */}
                {totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={(e, v) => setPage(v)}
                            color="primary"
                        />
                    </Box>
                )}
            </Card>

            {/* View Dialog - Conversation Style */}
            <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h6" fontWeight={700}>
                            {selectedTicket?.subject}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                            {selectedTicket && getStatusChip(selectedTicket.status)}
                            <Chip label={getCategoryLabel(selectedTicket?.category)} size="small" variant="outlined" />
                        </Box>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary">
                            {selectedTicket?.user?.username} ({selectedTicket?.user?.email})
                        </Typography>
                    </Box>
                </DialogTitle>
                <DialogContent dividers sx={{ bgcolor: '#f9f9f9', maxHeight: 500, overflowY: 'auto' }}>
                    {selectedTicket && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {/* Original user message */}
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Box sx={{ maxWidth: '75%' }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block', textAlign: 'right' }}>
                                        {selectedTicket.user?.username} - {formatDate(selectedTicket.createdAt)}
                                    </Typography>
                                    <Paper sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}>
                                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                            {selectedTicket.message}
                                        </Typography>
                                    </Paper>
                                </Box>
                            </Box>

                            {/* Legacy admin response for old tickets without messages array */}
                            {selectedTicket.adminResponse && (!selectedTicket.messages || selectedTicket.messages.length === 0) && (
                                <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                                    <Box sx={{ maxWidth: '75%' }}>
                                        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                                            <SupportIcon sx={{ fontSize: 12, mr: 0.5 }} />
                                            Destek Ekibi - {selectedTicket.respondedAt ? formatDate(selectedTicket.respondedAt) : ''}
                                        </Typography>
                                        <Paper sx={{ p: 2, bgcolor: '#fff3e0', borderRadius: 2 }}>
                                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                                {selectedTicket.adminResponse}
                                            </Typography>
                                        </Paper>
                                    </Box>
                                </Box>
                            )}

                            {/* Conversation messages */}
                            {selectedTicket.messages && selectedTicket.messages.map((msg, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: msg.sender === 'admin' ? 'flex-start' : 'flex-end'
                                    }}
                                >
                                    <Box sx={{ maxWidth: '75%' }}>
                                        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block', textAlign: msg.sender === 'admin' ? 'left' : 'right' }}>
                                            {msg.sender === 'admin' ? (
                                                <><SupportIcon sx={{ fontSize: 12, mr: 0.5 }} />Destek Ekibi</>
                                            ) : (
                                                selectedTicket.user?.username || 'Kullanıcı'
                                            )}
                                            {msg.createdAt && ` - ${formatDate(msg.createdAt)}`}
                                        </Typography>
                                        <Paper sx={{
                                            p: 2,
                                            bgcolor: msg.sender === 'admin' ? '#fff3e0' : '#e3f2fd',
                                            borderRadius: 2
                                        }}>
                                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                                {msg.message}
                                            </Typography>
                                        </Paper>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setViewDialogOpen(false)}>Kapat</Button>
                    <Button
                        variant="contained"
                        startIcon={<ReplyIcon />}
                        onClick={() => {
                            setViewDialogOpen(false);
                            setReplyText('');
                            setReplyStatus(selectedTicket?.status);
                            setReplyDialogOpen(true);
                        }}
                    >
                        Yanıt Ekle
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Reply Dialog - Shows conversation history */}
            <Dialog open={replyDialogOpen} onClose={() => setReplyDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Typography variant="h6" fontWeight={700}>Yanıt Ekle</Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                        {selectedTicket?.subject}
                    </Typography>
                </DialogTitle>
                <DialogContent dividers>
                    {selectedTicket && (
                        <Box>
                            {/* Conversation history */}
                            <Box sx={{ bgcolor: '#f9f9f9', borderRadius: 2, p: 2, mb: 3, maxHeight: 250, overflowY: 'auto' }}>
                                {/* Original message */}
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        {selectedTicket.user?.username} - İlk Mesaj
                                    </Typography>
                                    <Paper sx={{ p: 1.5, bgcolor: '#e3f2fd', borderRadius: 1, mt: 0.5 }}>
                                        <Typography variant="body2">{selectedTicket.message}</Typography>
                                    </Paper>
                                </Box>

                                {/* Previous messages */}
                                {selectedTicket.messages && selectedTicket.messages.map((msg, index) => (
                                    <Box key={index} sx={{ mb: 2 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            {msg.sender === 'admin' ? 'Destek Ekibi' : selectedTicket.user?.username}
                                            {msg.createdAt && ` - ${formatDate(msg.createdAt)}`}
                                        </Typography>
                                        <Paper sx={{
                                            p: 1.5,
                                            bgcolor: msg.sender === 'admin' ? '#fff3e0' : '#e3f2fd',
                                            borderRadius: 1,
                                            mt: 0.5
                                        }}>
                                            <Typography variant="body2">{msg.message}</Typography>
                                        </Paper>
                                    </Box>
                                ))}
                            </Box>

                            {/* New reply input */}
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                label="Yeni Yanıtınız"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Kullanıcıya yeni yanıtınızı yazın..."
                                sx={{ mb: 2 }}
                            />

                            <FormControl fullWidth size="small">
                                <InputLabel>Yeni Durum (Opsiyonel)</InputLabel>
                                <Select
                                    value={replyStatus}
                                    label="Yeni Durum (Opsiyonel)"
                                    onChange={(e) => setReplyStatus(e.target.value)}
                                >
                                    <MenuItem value="">Değiştirme</MenuItem>
                                    <MenuItem value="open">Açık</MenuItem>
                                    <MenuItem value="in_progress">İşleniyor</MenuItem>
                                    <MenuItem value="resolved">Çözüldü</MenuItem>
                                    <MenuItem value="closed">Kapatıldı</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setReplyDialogOpen(false)} disabled={submitting}>
                        İptal
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSendReply}
                        disabled={!replyText.trim() || submitting}
                        startIcon={submitting ? <CircularProgress size={16} /> : <ReplyIcon />}
                    >
                        {submitting ? 'Gönderiliyor...' : 'Yanıt Gönder'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
