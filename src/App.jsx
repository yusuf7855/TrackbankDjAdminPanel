import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AddMusic from './pages/AddMusic';
import Samples from './pages/Samples';
import UploadSample from './pages/UploadSample';
import { Playlists } from "./pages/Playlists.jsx";
import SampleBank from "./pages/SampleBank.jsx";
import Notifications from "./pages/Notifications.jsx";
import StoreManagement from "./pages/StoreManagement.jsx";

// Modern tema oluştur - Store için renkler eklendi
const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1976d2',
            light: '#42a5f5',
            dark: '#1565c0',
        },
        secondary: {
            main: '#dc004e',
        },
        success: {
            main: '#48c78e',
            light: '#81ecec',
            dark: '#00b894',
        },
        warning: {
            main: '#ffdd57',
            light: '#fff3cd',
            dark: '#fdcb6e',
        },
        error: {
            main: '#ff7675',
            light: '#fab1a0',
            dark: '#d63031',
        },
        info: {
            main: '#667eea',
            light: '#9c88ff',
            dark: '#764ba2',
        },
        background: {
            default: '#f5f5f5',
            paper: '#ffffff',
        },
        text: {
            primary: '#2c3e50',
            secondary: '#7f8c8d',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h4: {
            fontWeight: 700,
            letterSpacing: '-0.02em',
        },
        h5: {
            fontWeight: 600,
            letterSpacing: '-0.01em',
        },
        h6: {
            fontWeight: 600,
        },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                    borderRadius: 16,
                    '&:hover': {
                        boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                    '&.MuiPaper-elevation1': {
                        boxShadow: '4px 0 12px rgba(0,0,0,0.05)',
                    },
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                },
            },
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    '&:hover': {
                        backgroundColor: 'rgba(102, 126, 234, 0.04)',
                    },
                },
            },
        },
        MuiLinearProgress: {
            styleOverrides: {
                root: {
                    borderRadius: 4,
                    height: 8,
                },
            },
        },
    },
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <Box sx={{ display: 'flex', minHeight: '100vh' }}>
                    <Routes>
                        <Route path="/" element={<Layout />}>
                            <Route index element={<Dashboard />} />
                            <Route path="admin" element={<Dashboard />} />
                            <Route path="admin/playlists" element={<Playlists />} />
                            <Route path="admin/samples" element={<SampleBank />} />
                            <Route path="admin/store" element={<StoreManagement />} />
                            <Route path="admin/notifications" element={<Notifications />} />
                            <Route path="admin/users" element={<div>Kullanıcılar sayfası yakında...</div>} />
                            <Route path="admin/analytics" element={<div>Analytics sayfası yakında...</div>} />
                            <Route path="admin/settings" element={<div>Settings sayfası yakında...</div>} />

                            {/* Legacy routes (eski routelar) */}
                            <Route path="add-music" element={<AddMusic />} />
                            <Route path="samples" element={<Samples />} />
                            <Route path="upload" element={<UploadSample />} />
                            <Route path="sample-bank" element={<SampleBank />} />
                            <Route path="notifications" element={<Notifications />} />
                            <Route path="playlists" element={<Playlists />} />
                            <Route path="store" element={<StoreManagement />} />
                            <Route path="settings" element={<div>Settings sayfası yakında...</div>} />
                        </Route>
                    </Routes>
                </Box>
            </Router>
        </ThemeProvider>
    );
}

export default App;