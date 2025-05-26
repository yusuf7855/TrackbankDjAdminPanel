import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Grid,
    Card,
    CardContent,
    Switch,
    FormControlLabel,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Checkbox,
    Tabs,
    Tab,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    MusicNote as MusicIcon,
    PlaylistAdd as PlaylistAddIcon,
    Remove as RemoveIcon
} from '@mui/icons-material';
import axios from 'axios';

const Hot = () => {
    // State management
    const [hots, setHots] = useState([]);
    const [musics, setMusics] = useState([]);
    const [filteredMusics, setFilteredMusics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [openMusicDialog, setOpenMusicDialog] = useState(false);
    const [editingHot, setEditingHot] = useState(null);
    const [selectedHot, setSelectedHot] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedMusics, setSelectedMusics] = useState([]);
    const [tabValue, setTabValue] = useState(0);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [hotForm, setHotForm] = useState({
        name: '',
        description: '',
        category: 'all',
        isActive: true,
        order: 0
    });

    const categories = [
        { value: 'all', label: 'All Categories' },
        { value: 'afrohouse', label: 'Afro House' },
        { value: 'indiedance', label: 'Indie Dance' },
        { value: 'organichouse', label: 'Organic House' },
        { value: 'downtempo', label: 'Down Tempo' },
        { value: 'melodichouse', label: 'Melodic House' }
    ];

    useEffect(() => {
        fetchHots();
        fetchMusics();
    }, []);

    useEffect(() => {
        filterMusics();
    }, [musics, selectedCategory]);

    const fetchHots = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/hot');
            setHots(response.data.hots || []);
        } catch (error) {
            console.error('Error fetching hots:', error);
            setError('Failed to fetch HOT playlists');
        } finally {
            setLoading(false);
        }
    };

    const fetchMusics = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/music');
            setMusics(response.data || []);
        } catch (error) {
            console.error('Error fetching musics:', error);
            setError('Failed to fetch music library');
        }
    };

    const filterMusics = () => {
        if (selectedCategory === 'all') {
            setFilteredMusics(musics);
        } else {
            setFilteredMusics(musics.filter(music => music.category === selectedCategory));
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setHotForm({
            ...hotForm,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async () => {
        try {
            if (editingHot) {
                await axios.put(`http://localhost:5000/api/hot/${editingHot._id}`, hotForm);
                setSuccess('HOT playlist updated successfully');
            } else {
                await axios.post('http://localhost:5000/api/hot', hotForm);
                setSuccess('HOT playlist created successfully');
            }
            fetchHots();
            resetForm();
        } catch (error) {
            console.error('Error saving hot:', error);
            setError('Failed to save HOT playlist');
        }
    };

    const handleEdit = (hot) => {
        setEditingHot(hot);
        setHotForm({
            name: hot.name,
            description: hot.description,
            category: hot.category,
            isActive: hot.isActive,
            order: hot.order
        });
        setOpenDialog(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this HOT playlist?')) {
            try {
                await axios.delete(`http://localhost:5000/api/hot/${id}`);
                setSuccess('HOT playlist deleted successfully');
                fetchHots();
            } catch (error) {
                console.error('Error deleting hot:', error);
                setError('Failed to delete HOT playlist');
            }
        }
    };

    const handleManageMusics = (hot) => {
        setSelectedHot(hot);
        setSelectedMusics(hot.musics?.map(m => m._id) || []);
        setOpenMusicDialog(true);
    };

    const handleMusicToggle = (musicId) => {
        setSelectedMusics(prev =>
            prev.includes(musicId)
                ? prev.filter(id => id !== musicId)
                : [...prev, musicId]
        );
    };

    const handleSaveMusics = async () => {
        try {
            // Update the hot playlist with selected musics
            await axios.put(`http://localhost:5000/api/hot/${selectedHot._id}`, {
                ...selectedHot,
                musics: selectedMusics
            });
            setSuccess('Musics updated successfully');
            fetchHots();
            setOpenMusicDialog(false);
        } catch (error) {
            console.error('Error updating musics:', error);
            setError('Failed to update musics');
        }
    };

    const resetForm = () => {
        setHotForm({
            name: '',
            description: '',
            category: 'all',
            isActive: true,
            order: 0
        });
        setEditingHot(null);
        setOpenDialog(false);
    };

    const TabPanel = ({ children, value, index }) => (
        <div hidden={value !== index}>
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
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
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">HOT Playlists Management</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
                >
                    Create HOT Playlist
                </Button>
            </Box>

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

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Musics</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Order</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {hots.map((hot) => (
                            <TableRow key={hot._id}>
                                <TableCell>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        {hot.name}
                                    </Typography>
                                    {hot.description && (
                                        <Typography variant="body2" color="text.secondary">
                                            {hot.description}
                                        </Typography>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={categories.find(c => c.value === hot.category)?.label || hot.category}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        icon={<MusicIcon />}
                                        label={`${hot.musicCount || 0} songs`}
                                        size="small"
                                        color="secondary"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={hot.isActive ? 'Active' : 'Inactive'}
                                        size="small"
                                        color={hot.isActive ? 'success' : 'default'}
                                    />
                                </TableCell>
                                <TableCell>{hot.order}</TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleManageMusics(hot)} color="primary">
                                        <PlaylistAddIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleEdit(hot)} color="secondary">
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(hot._id)} color="error">
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Create/Edit HOT Dialog */}
            <Dialog open={openDialog} onClose={resetForm} maxWidth="md" fullWidth>
                <DialogTitle>
                    {editingHot ? 'Edit HOT Playlist' : 'Create New HOT Playlist'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Playlist Name"
                                name="name"
                                value={hotForm.name}
                                onChange={handleInputChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Category</InputLabel>
                                <Select
                                    name="category"
                                    value={hotForm.category}
                                    label="Category"
                                    onChange={handleInputChange}
                                >
                                    {categories.map(category => (
                                        <MenuItem key={category.value} value={category.value}>
                                            {category.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Description"
                                name="description"
                                value={hotForm.description}
                                onChange={handleInputChange}
                                multiline
                                rows={3}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Order"
                                name="order"
                                type="number"
                                value={hotForm.order}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={hotForm.isActive}
                                        onChange={handleInputChange}
                                        name="isActive"
                                    />
                                }
                                label="Active"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={resetForm}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {editingHot ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Manage Musics Dialog */}
            <Dialog open={openMusicDialog} onClose={() => setOpenMusicDialog(false)} maxWidth="lg" fullWidth>
                <DialogTitle>
                    Manage Musics for "{selectedHot?.name}"
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                            <Tab label={`Selected (${selectedMusics.length})`} />
                            <Tab label="Add Music" />
                        </Tabs>
                    </Box>

                    <TabPanel value={tabValue} index={0}>
                        <Typography variant="h6" mb={2}>
                            Selected Musics ({selectedMusics.length})
                        </Typography>
                        <List>
                            {selectedMusics.map(musicId => {
                                const music = musics.find(m => m._id === musicId);
                                if (!music) return null;
                                return (
                                    <ListItem key={musicId} divider>
                                        <ListItemText
                                            primary={music.title}
                                            secondary={`${music.artist} • ${music.category}`}
                                        />
                                        <ListItemSecondaryAction>
                                            <IconButton
                                                edge="end"
                                                onClick={() => handleMusicToggle(musicId)}
                                                color="error"
                                            >
                                                <RemoveIcon />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                );
                            })}
                        </List>
                    </TabPanel>

                    <TabPanel value={tabValue} index={1}>
                        <Box mb={2}>
                            <FormControl sx={{ minWidth: 200 }}>
                                <InputLabel>Filter by Category</InputLabel>
                                <Select
                                    value={selectedCategory}
                                    label="Filter by Category"
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                >
                                    {categories.map(category => (
                                        <MenuItem key={category.value} value={category.value}>
                                            {category.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>

                        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                            {filteredMusics.map(music => (
                                <ListItem key={music._id} divider>
                                    <Checkbox
                                        checked={selectedMusics.includes(music._id)}
                                        onChange={() => handleMusicToggle(music._id)}
                                    />
                                    <ListItemText
                                        primary={music.title}
                                        secondary={`${music.artist} • ${music.category} • ${music.likes || 0} likes`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </TabPanel>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenMusicDialog(false)}>Cancel</Button>
                    <Button onClick={handleSaveMusics} variant="contained">
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Hot;