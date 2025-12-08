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
import UserManagement from "./pages/UserManagement.jsx";
import ArtistManagement from "./pages/ArtistManagement.jsx";
import ArtistEssentialApproval from "./pages/ArtistEssentialApproval.jsx";
import GenreManagement from "./pages/GenreManagement.jsx";
import SubscriptionManagement from "./pages/SubscriptionManagement.jsx";  // ✅ YENİ EKLENEN

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
            letterSpacing: '-0.5px',
        },
        h5: {
            fontWeight: 600,
        },
        h6: {
            fontWeight: 500,
        },
        button: {
            textTransform: 'none',
            fontWeight: 500,
        },
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    padding: '10px 24px',
                },
                contained: {
                    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 8,
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 6,
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderBottom: '1px solid #e0e0e0',
                },
                head: {
                    fontWeight: 600,
                    backgroundColor: '#fafafa',
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
                <Box sx={{
                    display: 'flex',
                    minHeight: '100vh',
                    bgcolor: 'background.default'
                }}>
                    <Routes>
                        <Route path="/" element={<Layout />}>
                            <Route index element={<Dashboard />} />
                            <Route path="admin" element={<Dashboard />} />

                            {/* Admin Panel Routes */}
                            <Route path="admin/music" element={<AddMusic />} />
                            <Route path="admin/genres" element={<GenreManagement />} />
                            <Route path="admin/playlists" element={<Playlists />} />
                            <Route path="admin/samples" element={<SampleBank />} />
                            <Route path="admin/store" element={<StoreManagement />} />
                            <Route path="admin/notifications" element={<Notifications />} />
                            <Route path="admin/users" element={<UserManagement />} />
                            <Route path="admin/artists" element={<ArtistManagement />} />
                            <Route path="admin/artist-essential" element={<ArtistEssentialApproval />} />
                            <Route path="admin/subscriptions" element={<SubscriptionManagement />} />  {/* ✅ YENİ */}
                            <Route path="admin/analytics" element={<div style={{ padding: '24px' }}>
                                <h2>Analytics</h2>
                                <p>Analytics sayfası yakında...</p>
                            </div>} />
                            <Route path="admin/settings" element={<div style={{ padding: '24px' }}>
                                <h2>Ayarlar</h2>
                                <p>Ayarlar sayfası yakında...</p>
                            </div>} />

                            {/* Legacy routes (eski routelar) - backward compatibility için */}
                            <Route path="add-music" element={<AddMusic />} />
                            <Route path="samples" element={<Samples />} />
                            <Route path="upload" element={<UploadSample />} />
                            <Route path="sample-bank" element={<SampleBank />} />
                            <Route path="notifications" element={<Notifications />} />
                            <Route path="playlists" element={<Playlists />} />
                            <Route path="store" element={<StoreManagement />} />
                            <Route path="users" element={<UserManagement />} />
                            <Route path="genres" element={<GenreManagement />} />
                            <Route path="subscriptions" element={<SubscriptionManagement />} />  {/* ✅ Legacy */}
                            <Route path="artist-essential" element={<ArtistEssentialApproval />} />

                            <Route path="settings" element={<div style={{ padding: '24px' }}>
                                <h2>Ayarlar</h2>
                                <p>Ayarlar sayfası yakında...</p>
                            </div>} />
                        </Route>
                    </Routes>
                </Box>
            </Router>
        </ThemeProvider>
    );
}

export default App;