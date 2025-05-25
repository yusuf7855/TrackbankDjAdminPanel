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
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Edit as EditIcon,
    Add as AddIcon
} from '@mui/icons-material';
import axios from 'axios';

const Playlists = () => {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [newPlaylist, setNewPlaylist] = useState({
        name: '',
        description: ''
    });

    useEffect(() => {
        fetchPlaylists();
    }, []);

    const fetchPlaylists = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/playlists');
            setPlaylists(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching playlists:', error);
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewPlaylist({ ...newPlaylist, [name]: value });
    };

    const handleCreatePlaylist = async () => {
        try {
            await axios.post('http://localhost:5000/api/playlists', newPlaylist);
            fetchPlaylists();
            setOpenDialog(false);
            setNewPlaylist({ name: '', description: '' });
        } catch (error) {
            console.error('Error creating playlist:', error);
        }
    };

    const deletePlaylist = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/playlists/${id}`);
            fetchPlaylists();
        } catch (error) {
            console.error('Error deleting playlist:', error);
        }
    };

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
                <Typography variant="h4">Playlists</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
                >
                    New Playlist
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Samples</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {playlists.map((playlist) => (
                            <TableRow key={playlist._id}>
                                <TableCell>{playlist.name}</TableCell>
                                <TableCell>{playlist.description}</TableCell>
                                <TableCell>{playlist.musics?.length || 0}</TableCell>
                                <TableCell>
                                    <IconButton>
                                        <EditIcon color="primary" />
                                    </IconButton>
                                    <IconButton onClick={() => deletePlaylist(playlist._id)}>
                                        <DeleteIcon color="error" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Create Playlist Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Create New Playlist</DialogTitle>
                <DialogContent>
                    <Box sx={{ minWidth: 400, pt: 1 }}>
                        <TextField
                            fullWidth
                            label="Playlist Name"
                            name="name"
                            value={newPlaylist.name}
                            onChange={handleInputChange}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Description"
                            name="description"
                            value={newPlaylist.description}
                            onChange={handleInputChange}
                            margin="normal"
                            multiline
                            rows={3}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button
                        onClick={handleCreatePlaylist}
                        variant="contained"
                        disabled={!newPlaylist.name}
                    >
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Playlists;