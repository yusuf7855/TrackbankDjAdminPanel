// src/pages/Maintenance.jsx - Maintenance Mode Management

import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Switch,
    TextField,
    Button,
    Alert,
    CircularProgress,
    Divider,
    Chip,
    FormControlLabel,
    Grid,
    Paper,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Build as BuildIcon,
    Warning as WarningIcon,
    CheckCircle as CheckCircleIcon,
    Schedule as ScheduleIcon,
    Refresh as RefreshIcon,
    Save as SaveIcon
} from '@mui/icons-material';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Maintenance = () => {
    const { admin } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [maintenanceData, setMaintenanceData] = useState({
        isActive: false,
        title: 'Bakım Modu',
        message: 'Uygulama şu anda bakımda. Lütfen daha sonra tekrar deneyin.',
        estimatedEndTime: '',
        allowAdmins: true
    });

    const [lastUpdated, setLastUpdated] = useState(null);

    // Fetch maintenance status
    const fetchMaintenanceStatus = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/maintenance/admin/status');
            if (response.data.success) {
                const maintenance = response.data.maintenance;
                setMaintenanceData({
                    isActive: maintenance.isActive || false,
                    title: maintenance.title || 'Bakım Modu',
                    message: maintenance.message || 'Uygulama şu anda bakımda. Lütfen daha sonra tekrar deneyin.',
                    estimatedEndTime: maintenance.estimatedEndTime
                        ? new Date(maintenance.estimatedEndTime).toISOString().slice(0, 16)
                        : '',
                    allowAdmins: maintenance.allowAdmins !== false
                });
                setLastUpdated(response.data.updatedAt);
            }
        } catch (err) {
            console.error('Fetch maintenance error:', err);
            setError('Bakım modu durumu alınamadı');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMaintenanceStatus();
    }, []);

    // Handle toggle maintenance mode
    const handleToggleMaintenance = async () => {
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const response = await api.post('/maintenance/admin/toggle', {
                isActive: !maintenanceData.isActive,
                title: maintenanceData.title,
                message: maintenanceData.message,
                estimatedEndTime: maintenanceData.estimatedEndTime || null,
                allowAdmins: maintenanceData.allowAdmins
            });

            if (response.data.success) {
                setMaintenanceData(prev => ({
                    ...prev,
                    isActive: !prev.isActive
                }));
                setSuccess(response.data.message);
                fetchMaintenanceStatus();
            }
        } catch (err) {
            console.error('Toggle maintenance error:', err);
            setError(err.response?.data?.message || 'Bakım modu değiştirilemedi');
        } finally {
            setSaving(false);
        }
    };

    // Handle save settings
    const handleSaveSettings = async () => {
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const response = await api.put('/maintenance/admin/settings', {
                title: maintenanceData.title,
                message: maintenanceData.message,
                estimatedEndTime: maintenanceData.estimatedEndTime || null,
                allowAdmins: maintenanceData.allowAdmins
            });

            if (response.data.success) {
                setSuccess('Ayarlar kaydedildi');
                fetchMaintenanceStatus();
            }
        } catch (err) {
            console.error('Save settings error:', err);
            setError(err.response?.data?.message || 'Ayarlar kaydedilemedi');
        } finally {
            setSaving(false);
        }
    };

    // Handle input change
    const handleChange = (field) => (event) => {
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        setMaintenanceData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#000' }}>
                        Bakım Modu
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Uygulama bakım modunu yönetin
                    </Typography>
                </Box>
                <Tooltip title="Yenile">
                    <IconButton onClick={fetchMaintenanceStatus} disabled={loading}>
                        <RefreshIcon />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Alerts */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
                    {success}
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* Status Card */}
                <Grid item xs={12} md={4}>
                    <Card
                        sx={{
                            height: '100%',
                            border: maintenanceData.isActive ? '2px solid #ff9800' : '2px solid #4caf50',
                            borderRadius: 3
                        }}
                    >
                        <CardContent sx={{ textAlign: 'center', py: 4 }}>
                            <Box
                                sx={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: '50%',
                                    backgroundColor: maintenanceData.isActive ? '#fff3e0' : '#e8f5e9',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 16px'
                                }}
                            >
                                {maintenanceData.isActive ? (
                                    <BuildIcon sx={{ fontSize: 40, color: '#ff9800' }} />
                                ) : (
                                    <CheckCircleIcon sx={{ fontSize: 40, color: '#4caf50' }} />
                                )}
                            </Box>

                            <Chip
                                label={maintenanceData.isActive ? 'BAKIM MODU AKTİF' : 'UYGULAMA AKTİF'}
                                color={maintenanceData.isActive ? 'warning' : 'success'}
                                sx={{
                                    fontWeight: 700,
                                    fontSize: '0.9rem',
                                    py: 2,
                                    mb: 3
                                }}
                            />

                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                {maintenanceData.isActive
                                    ? 'Kullanıcılar şu anda uygulamaya erişemiyor'
                                    : 'Kullanıcılar uygulamaya normal şekilde erişebiliyor'
                                }
                            </Typography>

                            <Button
                                variant="contained"
                                size="large"
                                onClick={handleToggleMaintenance}
                                disabled={saving}
                                sx={{
                                    backgroundColor: maintenanceData.isActive ? '#4caf50' : '#ff9800',
                                    color: '#fff',
                                    fontWeight: 600,
                                    px: 4,
                                    py: 1.5,
                                    '&:hover': {
                                        backgroundColor: maintenanceData.isActive ? '#388e3c' : '#f57c00'
                                    }
                                }}
                            >
                                {saving ? (
                                    <CircularProgress size={24} sx={{ color: '#fff' }} />
                                ) : maintenanceData.isActive ? (
                                    'Bakım Modunu Kapat'
                                ) : (
                                    'Bakım Modunu Aç'
                                )}
                            </Button>

                            {lastUpdated && (
                                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 2 }}>
                                    Son güncelleme: {new Date(lastUpdated).toLocaleString('tr-TR')}
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Settings Card */}
                <Grid item xs={12} md={8}>
                    <Card sx={{ borderRadius: 3 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                                Bakım Modu Ayarları
                            </Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <TextField
                                    fullWidth
                                    label="Başlık"
                                    value={maintenanceData.title}
                                    onChange={handleChange('title')}
                                    placeholder="Bakım Modu"
                                    variant="outlined"
                                />

                                <TextField
                                    fullWidth
                                    label="Mesaj"
                                    value={maintenanceData.message}
                                    onChange={handleChange('message')}
                                    placeholder="Uygulama şu anda bakımda..."
                                    variant="outlined"
                                    multiline
                                    rows={3}
                                />

                                <TextField
                                    fullWidth
                                    label="Tahmini Bitiş Zamanı"
                                    type="datetime-local"
                                    value={maintenanceData.estimatedEndTime}
                                    onChange={handleChange('estimatedEndTime')}
                                    variant="outlined"
                                    InputLabelProps={{ shrink: true }}
                                    helperText="Kullanıcılara gösterilecek tahmini bitiş zamanı"
                                />

                                <Divider />

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={maintenanceData.allowAdmins}
                                            onChange={handleChange('allowAdmins')}
                                            color="primary"
                                        />
                                    }
                                    label={
                                        <Box>
                                            <Typography variant="body1">
                                                Admin Erişimine İzin Ver
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Adminler bakım modunda bile uygulamaya erişebilir
                                            </Typography>
                                        </Box>
                                    }
                                />

                                <Divider />

                                <Button
                                    variant="contained"
                                    onClick={handleSaveSettings}
                                    disabled={saving}
                                    startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                                    sx={{
                                        backgroundColor: '#000',
                                        color: '#fff',
                                        fontWeight: 600,
                                        py: 1.5,
                                        '&:hover': {
                                            backgroundColor: '#333'
                                        }
                                    }}
                                >
                                    Ayarları Kaydet
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Info Card */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 3, backgroundColor: '#f5f5f5', borderRadius: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                            <WarningIcon sx={{ color: '#ff9800', mt: 0.5 }} />
                            <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                    Bakım Modu Hakkında
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Bakım modunu aktif ettiğinizde:
                                </Typography>
                                <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
                                    <li>
                                        <Typography variant="body2" color="text.secondary">
                                            Tüm kullanıcılar uygulamayı açtığında bakım ekranı görecek
                                        </Typography>
                                    </li>
                                    <li>
                                        <Typography variant="body2" color="text.secondary">
                                            API istekleri reddedilecek (admin endpoint'leri hariç)
                                        </Typography>
                                    </li>
                                    <li>
                                        <Typography variant="body2" color="text.secondary">
                                            Adminler "Admin Erişimine İzin Ver" açıksa erişebilir
                                        </Typography>
                                    </li>
                                    <li>
                                        <Typography variant="body2" color="text.secondary">
                                            Tahmini bitiş zamanı kullanıcılara gösterilecek
                                        </Typography>
                                    </li>
                                </ul>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Maintenance;
