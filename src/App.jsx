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
import StoreManagement from "./pages/StoreManagement.jsx"; // YENİ: Store Management sayfası

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
            main: '#48c78e', // Store için yeşil renk
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
            main: '#667eea', // Store management için mavi-mor
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
        button: {
            textTransform: 'none',
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
                    border: '1px solid rgba(0,0,0,0.05)',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                        transform: 'translateY(-2px)',
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    padding: '8px 16px',
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                    },
                },
                contained: {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#ffffff',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 6,
                    fontWeight: 500,
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                head: {
                    backgroundColor: '#f8f9fa',
                    fontWeight: 600,
                    borderBottom: '2px solid #e9ecef',
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    border: 'none',
                    boxShadow: '4px 0 12px rgba(0,0,0,0.05)',
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
        // Store Management için özel stil
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
                            <Route path="add-music" element={<AddMusic />} />
                            <Route path="samples" element={<Samples />} />
                            <Route path="upload" element={<UploadSample />} />
                            <Route path="/sample-bank" element={<SampleBank />} />
                            <Route path="notifications" element={<Notifications />} />
                            <Route path="playlists" element={<Playlists />} />
                            <Route path="store" element={<StoreManagement />} /> {/* YENİ: Store Management rotası */}
                            <Route path="settings" element={<div>Settings sayfası yakında...</div>} />
                        </Route>
                    </Routes>
                </Box>
            </Router>
        </ThemeProvider>
    );
}

export default App;