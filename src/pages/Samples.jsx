import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    TextField,
    MenuItem,
    Pagination,
    CircularProgress
} from '@mui/material';
import { Delete, Download, Edit, Search } from '@mui/icons-material';
import axios from 'axios';
import api from "../services/api.jsx";

const Samples = () => {
    const [samples, setSamples] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;

    const categories = [
        'All',
        'Afro House',
        'Indie Dance',
        'Organic House',
        'Melodic Techno',
        'Downtempo'
    ];

    useEffect(() => {
        const fetchSamples = async () => {
            try {
                const response = await api.getSamples();
                setSamples(response.data);
            } catch (error) {
                console.error('Error fetching samples:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSamples();
    }, []);
    const filteredSamples = samples.filter(sample => {
        const matchesSearch = sample.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sample.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || sample.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const handleDownload = async (id) => {
        try {
            const response = await axios.post(`http://localhost:5000/api/download/generate`, { sampleId: id });
            window.open(response.data.downloadUrl, '_blank');
        } catch (error) {
            console.error('Download error:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/samples/${id}`);
            setSamples(samples.filter(sample => sample._id !== id));
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const paginatedSamples = filteredSamples.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Sample Library
            </Typography>

            <Box display="flex" justifyContent="space-between" mb={3}>
                <TextField
                    label="Search samples"
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: <Search sx={{ mr: 1 }} />
                    }}
                    sx={{ width: 300 }}
                />

                <TextField
                    select
                    label="Filter by category"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    variant="outlined"
                    size="small"
                    sx={{ width: 200 }}
                >
                    {categories.map(category => (
                        <MenuItem key={category} value={category === 'All' ? 'all' : category}>
                            {category}
                        </MenuItem>
                    ))}
                </TextField>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Price</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedSamples.map((sample) => (
                            <TableRow key={sample._id}>
                                <TableCell>{sample.name}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={sample.category}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                    />
                                </TableCell>
                                <TableCell>
                                    {sample.price > 0 ? `$${sample.price}` : 'Free'}
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={sample.paymentStatus}
                                        size="small"
                                        color={
                                            sample.paymentStatus === 'paid' ? 'success' :
                                                sample.paymentStatus === 'pending' ? 'warning' : 'default'
                                        }
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleDownload(sample._id)}>
                                        <Download color="primary" />
                                    </IconButton>
                                    <IconButton>
                                        <Edit color="secondary" />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(sample._id)}>
                                        <Delete color="error" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box display="flex" justifyContent="center" mt={3}>
                <Pagination
                    count={Math.ceil(filteredSamples.length / itemsPerPage)}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                    color="primary"
                />
            </Box>
        </Box>
    );
};

export default Samples;