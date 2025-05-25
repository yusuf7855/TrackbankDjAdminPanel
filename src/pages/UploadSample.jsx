import React, { useState } from 'react';
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
    LinearProgress,
    Alert,
    Grid
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import api from "../services/api.jsx";

const UploadSample = () => {
    const [formData, setFormData] = useState({
        name: '',
        category: 'Afro House',
        price: 0,
        paymentStatus: 'free',
        file: null
    });
    const [uploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    const categories = [
        'Afro House',
        'Indie Dance',
        'Organic House',
        'Melodic Techno',
        'Downtempo'
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, file: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('name', formData.name);
            // append other fields...
            formData.append('file', formData.file);

            await api.uploadSample(formData);
            setSuccess(true);
            // reset form...
        } catch (err) {
            setError(err.response?.data?.message || 'Upload failed');
        } finally {
            setIsUploading(false);
        }
    };
    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Upload New Sample
            </Typography>

            <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Sample Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Category</InputLabel>
                                <Select
                                    name="category"
                                    value={formData.category}
                                    label="Category"
                                    onChange={handleChange}
                                    required
                                >
                                    {categories.map(category => (
                                        <MenuItem key={category} value={category}>
                                            {category}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Price"
                                name="price"
                                type="number"
                                value={formData.price}
                                onChange={handleChange}
                                inputProps={{ min: 0, step: 0.01 }}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Payment Status</InputLabel>
                                <Select
                                    name="paymentStatus"
                                    value={formData.paymentStatus}
                                    label="Payment Status"
                                    onChange={handleChange}
                                    required
                                >
                                    <MenuItem value="free">Free</MenuItem>
                                    <MenuItem value="paid">Paid</MenuItem>
                                    <MenuItem value="pending">Pending</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <Button
                                component="label"
                                variant="outlined"
                                startIcon={<CloudUploadIcon />}
                                fullWidth
                                sx={{ py: 2 }}
                            >
                                Upload Sample File
                                <input
                                    type="file"
                                    hidden
                                    onChange={handleFileChange}
                                    accept=".mp3,.wav,.zip"
                                    required
                                />
                            </Button>
                            {formData.file && (
                                <Typography variant="body2" mt={1}>
                                    Selected: {formData.file.name}
                                </Typography>
                            )}
                        </Grid>

                        {isUploading && (
                            <Grid item xs={12}>
                                <LinearProgress
                                    variant="determinate"
                                    value={uploadProgress}
                                />
                                <Typography variant="body2" textAlign="center" mt={1}>
                                    Uploading: {uploadProgress}%
                                </Typography>
                            </Grid>
                        )}

                        {success && (
                            <Grid item xs={12}>
                                <Alert severity="success">
                                    Sample uploaded successfully!
                                </Alert>
                            </Grid>
                        )}

                        {error && (
                            <Grid item xs={12}>
                                <Alert severity="error">{error}</Alert>
                            </Grid>
                        )}

                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                fullWidth
                                disabled={isUploading}
                            >
                                {isUploading ? 'Uploading...' : 'Upload Sample'}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Box>
    );
};

export default UploadSample;