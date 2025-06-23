// src/pages/SampleBank.jsx
import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Card, CardContent, Button, Grid, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Alert, LinearProgress,
    Chip, Avatar
} from '@mui/material';
import {
    Add as AddIcon,
    CloudUpload as CloudUploadIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    AudioFile as AudioFileIcon,
    Archive as ArchiveIcon,
    Image as ImageIcon,
    LibraryMusic as LibraryMusicIcon
} from '@mui/icons-material';

const SampleBank = () => {
    const [samples, setSamples] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingSample, setEditingSample] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Form states
    const [title, setTitle] = useState('');
    const [genre, setGenre] = useState('');
    const [price, setPrice] = useState('');
    const [image, setImage] = useState(null);
    const [demoFile, setDemoFile] = useState(null);
    const [mainContent, setMainContent] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    const genres = [
        'Afro House', 'İndie Dance', 'Melodic House', 'Organic House', 'Down Tempo'
    ];

    useEffect(() => {
        fetchSamples();
    }, []);

    const fetchSamples = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/samples');
            const data = await response.json();
            setSamples(data);
        } catch (error) {
            console.error('Samples fetch error:', error);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onload = (e) => setImagePreview(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleDemoFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'audio/mpeg') {
            setDemoFile(file);
        } else {
            alert('Lütfen MP3 formatında bir dosya seçin');
        }
    };

    const handleMainContentChange = (e) => {
        const file = e.target.files[0];
        if (file && file.name.endsWith('.zip')) {
            setMainContent(file);
        } else {
            alert('Lütfen ZIP formatında bir dosya seçin');
        }
    };

    const handleSubmit = async () => {
        if (!title || !genre || !price || !image || !demoFile || !mainContent) {
            alert('Lütfen tüm alanları doldurun');
            return;
        }

        setLoading(true);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('genre', genre);
        formData.append('price', price);
        formData.append('image', image);
        formData.append('demoFile', demoFile);
        formData.append('mainContent', mainContent);

        if (editingSample) {
            formData.append('sampleId', editingSample._id);
        }

        try {
            const url = editingSample
                ? `http://localhost:5000/api/samples/${editingSample._id}`
                : 'http://localhost:5000/api/samples';

            const method = editingSample ? 'PUT' : 'POST';

            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const progress = (e.loaded / e.total) * 100;
                    setUploadProgress(progress);
                }
            });

            xhr.onload = () => {
                if (xhr.status === 200 || xhr.status === 201) {
                    fetchSamples();
                    resetForm();
                    setOpenDialog(false);
                } else {
                    alert('Yükleme hatası');
                }
                setLoading(false);
            };

            xhr.onerror = () => {
                alert('Yükleme hatası');
                setLoading(false);
            };

            xhr.open(method, url);
            xhr.send(formData);

        } catch (error) {
            console.error('Upload error:', error);
            alert('Yükleme hatası');
            setLoading(false);
        }
    };

    const handleEdit = (sample) => {
        setEditingSample(sample);
        setTitle(sample.title);
        setGenre(sample.genre);
        setPrice(sample.price.toString());
        setImagePreview(sample.imageUrl);
        setOpenDialog(true);
    };

    const handleDelete = async (sampleId) => {
        if (window.confirm('Bu sample\'ı silmek istediğinizden emin misiniz?')) {
            try {
                await fetch(`http://localhost:5000/api/samples/${sampleId}`, {
                    method: 'DELETE'
                });
                fetchSamples();
            } catch (error) {
                console.error('Delete error:', error);
            }
        }
    };

    const resetForm = () => {
        setTitle('');
        setGenre('');
        setPrice('');
        setImage(null);
        setDemoFile(null);
        setMainContent(null);
        setImagePreview('');
        setEditingSample(null);
        setUploadProgress(0);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                    <Typography variant="h4" gutterBottom fontWeight="bold">
                        Sample Bank Yönetimi
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Müzik sample'larını yükleyin ve yönetin
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
                    sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        px: 3,
                        py: 1.5
                    }}
                >
                    Yeni Sample Ekle
                </Button>
            </Box>

            {/* Statistics Cards */}
            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center">
                                <LibraryMusicIcon sx={{ fontSize: 40, mr: 2 }} />
                                <Box>
                                    <Typography variant="h4" fontWeight="bold">
                                        {samples.length}
                                    </Typography>
                                    <Typography variant="body2">
                                        Toplam Sample
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center">
                                <AudioFileIcon sx={{ fontSize: 40, mr: 2 }} />
                                <Box>
                                    <Typography variant="h4" fontWeight="bold">
                                        {samples.filter(s => s.paymentStatus === 'free').length}
                                    </Typography>
                                    <Typography variant="body2">
                                        Ücretsiz
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center">
                                <ArchiveIcon sx={{ fontSize: 40, mr: 2 }} />
                                <Box>
                                    <Typography variant="h4" fontWeight="bold">
                                        {samples.filter(s => s.paymentStatus === 'paid').length}
                                    </Typography>
                                    <Typography variant="body2">
                                        Ücretli
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center">
                                <CloudUploadIcon sx={{ fontSize: 40, mr: 2 }} />
                                <Box>
                                    <Typography variant="h4" fontWeight="bold">
                                        {new Set(samples.map(s => s.genre)).size}
                                    </Typography>
                                    <Typography variant="body2">
                                        Farklı Genre
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Samples Table */}
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Sample Listesi
                    </Typography>
                    <TableContainer component={Paper} sx={{ mt: 2 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Görsel</TableCell>
                                    <TableCell>Başlık</TableCell>
                                    <TableCell>Genre</TableCell>
                                    <TableCell>Fiyat</TableCell>
                                    <TableCell>Durum</TableCell>
                                    <TableCell>Oluşturma Tarihi</TableCell>
                                    <TableCell>İşlemler</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {samples.map((sample) => (
                                    <TableRow key={sample._id}>
                                        <TableCell>
                                            <Avatar
                                                src={sample.imageUrl}
                                                variant="rounded"
                                                sx={{ width: 50, height: 50 }}
                                            >
                                                <ImageIcon />
                                            </Avatar>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="subtitle2" fontWeight="bold">
                                                {sample.title}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={sample.genre} size="small" />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color={sample.price === 0 ? 'success.main' : 'primary.main'}>
                                                {sample.price === 0 ? 'Ücretsiz' : `$${sample.price}`}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={sample.paymentStatus === 'free' ? 'Ücretsiz' : 'Ücretli'}
                                                color={sample.paymentStatus === 'free' ? 'success' : 'primary'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {new Date(sample.createdAt).toLocaleDateString('tr-TR')}
                                        </TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => handleEdit(sample)} color="primary">
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton onClick={() => handleDelete(sample._id)} color="error">
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Upload Dialog */}
            <Dialog open={openDialog} onClose={resetForm} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Box display="flex" alignItems="center">
                        <CloudUploadIcon sx={{ mr: 1, color: 'primary.main' }} />
                        {editingSample ? 'Sample Düzenle' : 'Yeni Sample Ekle'}
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Sample Başlığı"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Genre</InputLabel>
                                <Select
                                    value={genre}
                                    onChange={(e) => setGenre(e.target.value)}
                                    label="Genre"
                                >
                                    {genres.map((g) => (
                                        <MenuItem key={g} value={g}>{g}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Fiyat ($)"
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                required
                                inputProps={{ min: 0, step: 0.01 }}
                            />
                        </Grid>

                        {/* Image Upload */}
                        <Grid item xs={12}>
                            <Box sx={{ border: '2px dashed #ccc', borderRadius: 2, p: 3, textAlign: 'center' }}>
                                <input
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    id="image-upload"
                                    type="file"
                                    onChange={handleImageChange}
                                />
                                <label htmlFor="image-upload">
                                    <Button variant="outlined" component="span" startIcon={<ImageIcon />}>
                                        Görsel Yükle
                                    </Button>
                                </label>
                                {imagePreview && (
                                    <Box sx={{ mt: 2 }}>
                                        <img src={imagePreview} alt="Preview" style={{ maxWidth: 200, maxHeight: 200 }} />
                                    </Box>
                                )}
                            </Box>
                        </Grid>

                        {/* Demo File Upload */}
                        <Grid item xs={12} sm={6}>
                            <Box sx={{ border: '2px dashed #ccc', borderRadius: 2, p: 3, textAlign: 'center' }}>
                                <input
                                    accept="audio/mpeg"
                                    style={{ display: 'none' }}
                                    id="demo-upload"
                                    type="file"
                                    onChange={handleDemoFileChange}
                                />
                                <label htmlFor="demo-upload">
                                    <Button variant="outlined" component="span" startIcon={<AudioFileIcon />}>
                                        Demo MP3 Yükle
                                    </Button>
                                </label>
                                {demoFile && (
                                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                        {demoFile.name}
                                    </Typography>
                                )}
                            </Box>
                        </Grid>

                        {/* Main Content Upload */}
                        <Grid item xs={12} sm={6}>
                            <Box sx={{ border: '2px dashed #ccc', borderRadius: 2, p: 3, textAlign: 'center' }}>
                                <input
                                    accept=".zip"
                                    style={{ display: 'none' }}
                                    id="content-upload"
                                    type="file"
                                    onChange={handleMainContentChange}
                                />
                                <label htmlFor="content-upload">
                                    <Button variant="outlined" component="span" startIcon={<ArchiveIcon />}>
                                        Ana İçerik ZIP Yükle
                                    </Button>
                                </label>
                                {mainContent && (
                                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                        {mainContent.name}
                                    </Typography>
                                )}
                            </Box>
                        </Grid>

                        {/* Upload Progress */}
                        {loading && (
                            <Grid item xs={12}>
                                <Box sx={{ width: '100%' }}>
                                    <LinearProgress variant="determinate" value={uploadProgress} />
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                        Yükleniyor... {Math.round(uploadProgress)}%
                                    </Typography>
                                </Box>
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={resetForm}>İptal</Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={loading}
                        sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                    >
                        {loading ? 'Yükleniyor...' : editingSample ? 'Güncelle' : 'Ekle'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SampleBank;