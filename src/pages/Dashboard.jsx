import React from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    Stack,
    LinearProgress,
    Divider
} from '@mui/material';
import {
    MusicNote as MusicNoteIcon,
    PlaylistPlay as PlaylistIcon,
    CloudDownload as DownloadIcon,
    AttachMoney as MoneyIcon
} from '@mui/icons-material';

const Dashboard = () => {
    // Mock data - replace with real data from your API
    const stats = [
        { label: 'Total Samples', value: 124, icon: <MusicNoteIcon fontSize="large" /> },
        { label: 'Playlists', value: 8, icon: <PlaylistIcon fontSize="large" /> },
        { label: 'Downloads', value: 2453, icon: <DownloadIcon fontSize="large" /> },
        { label: 'Revenue', value: '$1,245', icon: <MoneyIcon fontSize="large" /> },
    ];

    const recentSamples = [
        { name: 'Afro Rhythms', category: 'Afro House', date: '2 hours ago' },
        { name: 'Melodic Journey', category: 'Melodic Techno', date: '1 day ago' },
        { name: 'Organic Groove', category: 'Organic House', date: '3 days ago' },
    ];

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Dashboard
            </Typography>

            <Grid container spacing={3} mb={4}>
                {stats.map((stat, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Paper sx={{ p: 3, height: '100%' }}>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <Box sx={{ color: 'primary.main' }}>
                                    {stat.icon}
                                </Box>
                                <Box>
                                    <Typography variant="h6">{stat.value}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {stat.label}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Recent Uploads
                        </Typography>
                        <Stack spacing={2}>
                            {recentSamples.map((sample, index) => (
                                <Box key={index}>
                                    <Typography fontWeight="medium">{sample.name}</Typography>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Typography variant="body2" color="text.secondary">
                                            {sample.category}
                                        </Typography>
                                        <Divider orientation="vertical" flexItem />
                                        <Typography variant="body2" color="text.secondary">
                                            {sample.date}
                                        </Typography>
                                    </Stack>
                                    {index < recentSamples.length - 1 && <Divider sx={{ mt: 1 }} />}
                                </Box>
                            ))}
                        </Stack>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Storage Usage
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={2}>
                            4.2 GB of 10 GB used
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={42}
                            sx={{ height: 8, mb: 2 }}
                        />
                        <Stack spacing={1}>
                            <Typography variant="body2">
                                <strong>Audio Files:</strong> 3.1 GB
                            </Typography>
                            <Typography variant="body2">
                                <strong>Project Files:</strong> 0.8 GB
                            </Typography>
                            <Typography variant="body2">
                                <strong>Other:</strong> 0.3 GB
                            </Typography>
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;