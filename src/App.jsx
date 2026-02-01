// src/App.jsx - TrackBang Admin Panel with Authentication

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
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
import LabelManagement from "./pages/LabelManagement.jsx";
import GenreManagement from "./pages/GenreManagement.jsx";
import SubscriptionManagement from "./pages/SubscriptionManagement.jsx";
import SupportTickets from "./pages/SupportTickets.jsx";
import Maintenance from "./pages/Maintenance.jsx";
import AppleNotifications from "./pages/AppleNotifications.jsx";
import Revenue from "./pages/Revenue.jsx";
import Backups from "./pages/Backups.jsx";

// Modern tema oluştur
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

// Protected Layout wrapper
const ProtectedLayout = () => (
    <ProtectedRoute>
        <Layout />
    </ProtectedRoute>
);

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <AuthProvider>
                    <Box sx={{
                        display: 'flex',
                        minHeight: '100vh',
                        bgcolor: 'background.default'
                    }}>
                        <Routes>
                            {/* Public Route - Login */}
                            <Route path="/login" element={<Login />} />

                            {/* Protected Routes */}
                            <Route path="/" element={<ProtectedLayout />}>
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
                                <Route path="admin/labels" element={<LabelManagement />} />
                                <Route path="admin/artist-essential" element={<ArtistEssentialApproval />} />
                                <Route path="admin/subscriptions" element={<SubscriptionManagement />} />
                                <Route path="admin/apple-notifications" element={<AppleNotifications />} />
                                <Route path="admin/revenue" element={<Revenue />} />
                                <Route path="admin/support" element={<SupportTickets />} />
                                <Route path="admin/maintenance" element={<Maintenance />} />
                                <Route path="admin/backups" element={<Backups />} />
                                <Route path="admin/analytics" element={<div style={{ padding: '24px' }}>
                                    <h2>Analytics</h2>
                                    <p>Analytics sayfası yakında...</p>
                                </div>} />
                                <Route path="admin/settings" element={<div style={{ padding: '24px' }}>
                                    <h2>Ayarlar</h2>
                                    <p>Ayarlar sayfası yakında...</p>
                                </div>} />

                                {/* Legacy routes (backward compatibility) */}
                                <Route path="add-music" element={<AddMusic />} />
                                <Route path="samples" element={<Samples />} />
                                <Route path="upload" element={<UploadSample />} />
                                <Route path="sample-bank" element={<SampleBank />} />
                                <Route path="notifications" element={<Notifications />} />
                                <Route path="playlists" element={<Playlists />} />
                                <Route path="store" element={<StoreManagement />} />
                                <Route path="users" element={<UserManagement />} />
                                <Route path="genres" element={<GenreManagement />} />
                                <Route path="subscriptions" element={<SubscriptionManagement />} />
                                <Route path="apple-notifications" element={<AppleNotifications />} />
                                <Route path="revenue" element={<Revenue />} />
                                <Route path="support" element={<SupportTickets />} />
                                <Route path="artist-essential" element={<ArtistEssentialApproval />} />

                                <Route path="settings" element={<div style={{ padding: '24px' }}>
                                    <h2>Ayarlar</h2>
                                    <p>Ayarlar sayfası yakında...</p>
                                </div>} />
                            </Route>

                            {/* Catch all - redirect to login or dashboard */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </Box>
                </AuthProvider>
            </Router>
        </ThemeProvider>
    );
}

export default App;
