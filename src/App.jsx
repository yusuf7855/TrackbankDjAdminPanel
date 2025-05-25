import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
    // Tab state
    const [activeTab, setActiveTab] = useState('music');

    // Music states
    const [musicList, setMusicList] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [musicFormData, setMusicFormData] = useState({
        spotifyId: '',
        title: '',
        artist: '',
        beatportUrl: '',
        category: 'afrahouse'
    });
    const [playlistForm, setPlaylistForm] = useState({
        name: '',
        description: ''
    });
    const [selectedPlaylist, setSelectedPlaylist] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Sample states
    const [samples, setSamples] = useState([]);
    const [sampleFormData, setSampleFormData] = useState({
        name: '',
        category: '',
        price: 0,
        paymentStatus: 'free',
        file: null
    });
    const [downloadTokens, setDownloadTokens] = useState({});
    const [editingSample, setEditingSample] = useState(null);

    const musicCategories = ['afrahouse', 'indiadance', 'organichouse', 'downtempo', 'melodichouse'];
    const sampleCategories = ['Drum', 'Bass', 'Synth', 'Vocal', 'FX', 'Loop'];
    const paymentStatuses = ['paid', 'pending', 'failed', 'free'];

    useEffect(() => {
        if (activeTab === 'music') {
            fetchMusic();
            fetchPlaylists();
        } else {
            fetchSamples();
        }
    }, [activeTab]);

    // Music functions
    const fetchMusic = async () => {
        try {
            const url = searchQuery
                ? `http://localhost:5000/api/music/search?query=${searchQuery}`
                : 'http://localhost:5000/api/music';
            const response = await axios.get(url);
            setMusicList(response.data);
        } catch (error) {
            console.error('Error fetching music:', error);
        }
    };

    const fetchPlaylists = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/playlists');
            setPlaylists(response.data);
        } catch (error) {
            console.error('Error fetching playlists:', error);
        }
    };

    const handleMusicInputChange = (e) => {
        const { name, value } = e.target;
        setMusicFormData({ ...musicFormData, [name]: value });
    };

    const handlePlaylistInputChange = (e) => {
        const { name, value } = e.target;
        setPlaylistForm({ ...playlistForm, [name]: value });
    };

    const handleMusicSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/music', musicFormData);
            fetchMusic();
            setMusicFormData({
                spotifyId: '',
                title: '',
                artist: '',
                beatportUrl: '',
                category: 'afrahouse'
            });
        } catch (error) {
            console.error('Error adding music:', error);
        }
    };

    const handleCreatePlaylist = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/playlists', playlistForm);
            fetchPlaylists();
            setPlaylistForm({
                name: '',
                description: ''
            });
        } catch (error) {
            console.error('Error creating playlist:', error);
        }
    };

    const deleteMusic = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/music/${id}`);
            fetchMusic();
        } catch (error) {
            console.error('Error deleting music:', error);
        }
    };

    const likeMusic = async (id) => {
        try {
            await axios.post(`http://localhost:5000/api/music/${id}/like`);
            fetchMusic();
        } catch (error) {
            console.error('Error liking music:', error);
        }
    };

    const addToPlaylist = async (musicId) => {
        if (!selectedPlaylist) return;

        try {
            await axios.post(`http://localhost:5000/api/music/${musicId}/add-to-playlist`, {
                playlistId: selectedPlaylist
            });
            fetchMusic();
            fetchPlaylists();
        } catch (error) {
            console.error('Error adding to playlist:', error);
        }
    };

    // Sample functions
    const fetchSamples = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/samples');
            setSamples(response.data);
        } catch (error) {
            console.error('Error fetching samples:', error);
        }
    };

    const handleSampleInputChange = (e) => {
        const { name, value } = e.target;
        setSampleFormData({ ...sampleFormData, [name]: value });
    };

    const handleFileChange = (e) => {
        setSampleFormData({ ...sampleFormData, file: e.target.files[0] });
    };

    const handleSampleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', sampleFormData.name);
            formDataToSend.append('category', sampleFormData.category);
            formDataToSend.append('price', sampleFormData.price);
            formDataToSend.append('paymentStatus', sampleFormData.paymentStatus);
            if (sampleFormData.file) {
                formDataToSend.append('file', sampleFormData.file);
            }

            if (editingSample) {
                await axios.put(`http://localhost:5000/api/samples/${editingSample._id}`, formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                setEditingSample(null);
            } else {
                await axios.post('http://localhost:5000/api/samples', formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }

            fetchSamples();
            setSampleFormData({
                name: '',
                category: '',
                price: 0,
                paymentStatus: 'free',
                file: null
            });
        } catch (error) {
            console.error('Error adding/updating sample:', error);
        }
    };

    const generateDownloadLink = async (sampleId) => {
        try {
            const response = await axios.post('http://localhost:5000/api/download/generate', { sampleId });
            setDownloadTokens({
                ...downloadTokens,
                [sampleId]: {
                    url: response.data.downloadUrl,
                    fileName: response.data.fileName
                }
            });
        } catch (error) {
            console.error('Error generating download link:', error);
            alert(error.response?.data?.error || 'Failed to generate download link');
        }
    };

    const deleteSample = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/samples/${id}`);
            fetchSamples();
        } catch (error) {
            console.error('Error deleting sample:', error);
        }
    };

    const updatePaymentStatus = async (sampleId, newStatus) => {
        try {
            await axios.put(`http://localhost:5000/api/samples/${sampleId}/payment-status`, {
                paymentStatus: newStatus
            });
            fetchSamples();

            if (newStatus === 'paid' && !downloadTokens[sampleId]) {
                generateDownloadLink(sampleId);
            }
        } catch (error) {
            console.error('Error updating payment status:', error);
        }
    };

    const editSample = (sample) => {
        setEditingSample(sample);
        setSampleFormData({
            name: sample.name,
            category: sample.category,
            price: sample.price,
            paymentStatus: sample.paymentStatus,
            file: null
        });
    };

    const cancelEdit = () => {
        setEditingSample(null);
        setSampleFormData({
            name: '',
            category: '',
            price: 0,
            paymentStatus: 'free',
            file: null
        });
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Admin Panel</h1>

            {/* Tab Navigation */}
            <div style={{ display: 'flex', marginBottom: '20px', borderBottom: '1px solid #ddd' }}>
                <button
                    onClick={() => setActiveTab('music')}
                    style={{
                        padding: '10px 20px',
                        background: activeTab === 'music' ? '#2196F3' : '#f2f2f2',
                        color: activeTab === 'music' ? 'white' : 'black',
                        border: 'none',
                        cursor: 'pointer',
                        marginRight: '5px'
                    }}
                >
                    Music Management
                </button>
                <button
                    onClick={() => setActiveTab('samples')}
                    style={{
                        padding: '10px 20px',
                        background: activeTab === 'samples' ? '#2196F3' : '#f2f2f2',
                        color: activeTab === 'samples' ? 'white' : 'black',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    Sample Management
                </button>
            </div>

            {activeTab === 'music' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                    {/* Music Management Left Side */}
                    <div>
                        <div style={{ marginBottom: '40px' }}>
                            <h2>Add New Music</h2>
                            <form onSubmit={handleMusicSubmit} style={{ display: 'grid', gap: '15px' }}>
                                <div>
                                    <label>Spotify ID:</label>
                                    <input
                                        type="text"
                                        name="spotifyId"
                                        value={musicFormData.spotifyId}
                                        onChange={handleMusicInputChange}
                                        required
                                        style={{ width: '100%', padding: '8px' }}
                                    />
                                </div>
                                <div>
                                    <label>Title:</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={musicFormData.title}
                                        onChange={handleMusicInputChange}
                                        required
                                        style={{ width: '100%', padding: '8px' }}
                                    />
                                </div>
                                <div>
                                    <label>Artist:</label>
                                    <input
                                        type="text"
                                        name="artist"
                                        value={musicFormData.artist}
                                        onChange={handleMusicInputChange}
                                        required
                                        style={{ width: '100%', padding: '8px' }}
                                    />
                                </div>
                                <div>
                                    <label>Beatport URL:</label>
                                    <input
                                        type="text"
                                        name="beatportUrl"
                                        value={musicFormData.beatportUrl}
                                        onChange={handleMusicInputChange}
                                        required
                                        style={{ width: '100%', padding: '8px' }}
                                    />
                                </div>
                                <div>
                                    <label>Category:</label>
                                    <select
                                        name="category"
                                        value={musicFormData.category}
                                        onChange={handleMusicInputChange}
                                        style={{ width: '100%', padding: '8px' }}
                                    >
                                        {musicCategories.map(category => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </select>
                                </div>
                                <button type="submit" style={{ padding: '10px', background: '#4CAF50', color: 'white', border: 'none' }}>
                                    Add Music
                                </button>
                            </form>
                        </div>

                        <div style={{ marginBottom: '40px' }}>
                            <h2>Create Playlist</h2>
                            <form onSubmit={handleCreatePlaylist} style={{ display: 'grid', gap: '15px' }}>
                                <div>
                                    <label>Playlist Name:</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={playlistForm.name}
                                        onChange={handlePlaylistInputChange}
                                        required
                                        style={{ width: '100%', padding: '8px' }}
                                    />
                                </div>
                                <div>
                                    <label>Description:</label>
                                    <textarea
                                        name="description"
                                        value={playlistForm.description}
                                        onChange={handlePlaylistInputChange}
                                        style={{ width: '100%', padding: '8px', minHeight: '80px' }}
                                    />
                                </div>
                                <button type="submit" style={{ padding: '10px', background: '#2196F3', color: 'white', border: 'none' }}>
                                    Create Playlist
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Music Management Right Side */}
                    <div>
                        <div style={{ marginBottom: '40px' }}>
                            <h2>Music List</h2>
                            <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
                                <input
                                    type="text"
                                    placeholder="Search music..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ flex: 1, padding: '8px' }}
                                />
                                <button
                                    onClick={fetchMusic}
                                    style={{ padding: '8px 15px', background: '#2196F3', color: 'white', border: 'none' }}
                                >
                                    Search
                                </button>
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label>Select Playlist to Add Songs: </label>
                                <select
                                    value={selectedPlaylist}
                                    onChange={(e) => setSelectedPlaylist(e.target.value)}
                                    style={{ padding: '8px', marginLeft: '10px' }}
                                >
                                    <option value="">-- Select --</option>
                                    {playlists.map(playlist => (
                                        <option key={playlist._id} value={playlist._id}>{playlist.name}</option>
                                    ))}
                                </select>
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                <tr style={{ background: '#f2f2f2' }}>
                                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Title</th>
                                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Artist</th>
                                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Beatport</th>
                                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Category</th>
                                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Likes</th>
                                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {musicList.map(music => (
                                    <tr key={music._id} style={{ borderBottom: '1px solid #ddd' }}>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>{music.title}</td>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>{music.artist}</td>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                            <a href={music.beatportUrl} target="_blank" rel="noopener noreferrer">Link</a>
                                        </td>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>{music.category}</td>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>{music.likes || 0}</td>
                                        <td style={{ padding: '10px', border: '1px solid #ddd', display: 'flex', gap: '5px' }}>
                                            <button
                                                onClick={() => likeMusic(music._id)}
                                                style={{ padding: '5px 10px', background: '#FF9800', color: 'white', border: 'none' }}
                                            >
                                                Like
                                            </button>
                                            <button
                                                onClick={() => addToPlaylist(music._id)}
                                                style={{ padding: '5px 10px', background: '#9C27B0', color: 'white', border: 'none' }}
                                            >
                                                Add to Playlist
                                            </button>
                                            <button
                                                onClick={() => deleteMusic(music._id)}
                                                style={{ padding: '5px 10px', background: '#f44336', color: 'white', border: 'none' }}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        <div>
                            <h2>Playlists</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                                {playlists.map(playlist => (
                                    <div key={playlist._id} style={{ border: '1px solid #ddd', borderRadius: '5px', padding: '15px' }}>
                                        <h3>{playlist.name}</h3>
                                        <p>{playlist.description}</p>
                                        <p><strong>Songs:</strong> {playlist.musics?.length || 0}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                    {/* Sample Management Left Side */}
                    <div>
                        <div style={{ marginBottom: '40px' }}>
                            <h2>{editingSample ? 'Edit Sample' : 'Add New Sample'}</h2>
                            <form onSubmit={handleSampleSubmit} style={{ display: 'grid', gap: '15px' }}>
                                <div>
                                    <label>Sample Name:</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={sampleFormData.name}
                                        onChange={handleSampleInputChange}
                                        required
                                        style={{ width: '100%', padding: '8px' }}
                                    />
                                </div>

                                <div>
                                    <label>Category:</label>
                                    <select
                                        name="category"
                                        value={sampleFormData.category}
                                        onChange={handleSampleInputChange}
                                        required
                                        style={{ width: '100%', padding: '8px' }}
                                    >
                                        <option value="">-- Select Category --</option>
                                        {sampleCategories.map(category => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label>Price:</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={sampleFormData.price}
                                        onChange={handleSampleInputChange}
                                        min="0"
                                        step="0.01"
                                        style={{ width: '100%', padding: '8px' }}
                                    />
                                </div>

                                <div>
                                    <label>Payment Status:</label>
                                    <select
                                        name="paymentStatus"
                                        value={sampleFormData.paymentStatus}
                                        onChange={handleSampleInputChange}
                                        style={{ width: '100%', padding: '8px' }}
                                    >
                                        {paymentStatuses.map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label>Sample File (ZIP/MP3):</label>
                                    <input
                                        type="file"
                                        name="file"
                                        onChange={handleFileChange}
                                        required={!editingSample}
                                        style={{ width: '100%', padding: '8px' }}
                                        accept=".zip,.mp3"
                                    />
                                    {editingSample && (
                                        <p style={{ fontSize: '0.8em', color: '#666', marginTop: '5px' }}>
                                            Current file: {editingSample.fileName} (Leave empty to keep current file)
                                        </p>
                                    )}
                                </div>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        type="submit"
                                        style={{ padding: '10px', background: '#4CAF50', color: 'white', border: 'none', flex: 1 }}
                                    >
                                        {editingSample ? 'Update Sample' : 'Upload Sample'}
                                    </button>
                                    {editingSample && (
                                        <button
                                            type="button"
                                            onClick={cancelEdit}
                                            style={{ padding: '10px', background: '#f44336', color: 'white', border: 'none', flex: 1 }}
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Sample Management Right Side */}
                    <div>
                        <div style={{ marginBottom: '40px' }}>
                            <h2>Sample Library</h2>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                <tr style={{ background: '#f2f2f2' }}>
                                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Name</th>
                                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>File</th>
                                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Category</th>
                                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Price</th>
                                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Status</th>
                                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {samples.map(sample => (
                                    <tr key={sample._id} style={{ borderBottom: '1px solid #ddd' }}>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>{sample.name}</td>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>{sample.fileName}</td>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>{sample.category}</td>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>${sample.price.toFixed(2)}</td>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                            <select
                                                value={sample.paymentStatus}
                                                onChange={(e) => updatePaymentStatus(sample._id, e.target.value)}
                                                style={{
                                                    border: '1px solid #ddd',
                                                    padding: '5px',
                                                    background: sample.paymentStatus === 'paid' ? '#e8f5e9' :
                                                        sample.paymentStatus === 'free' ? '#e3f2fd' :
                                                            sample.paymentStatus === 'failed' ? '#ffebee' : '#fff8e1'
                                                }}
                                            >
                                                {paymentStatuses.map(status => (
                                                    <option key={status} value={status}>{status}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td style={{ padding: '10px', border: '1px solid #ddd', display: 'flex', gap: '5px' }}>
                                            <button
                                                onClick={() => editSample(sample)}
                                                style={{ padding: '5px 10px', background: '#FF9800', color: 'white', border: 'none' }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => generateDownloadLink(sample._id)}
                                                disabled={sample.paymentStatus !== 'paid' && sample.paymentStatus !== 'free'}
                                                style={{
                                                    padding: '5px 10px',
                                                    background: sample.paymentStatus === 'paid' || sample.paymentStatus === 'free' ? '#2196F3' : '#cccccc',
                                                    color: 'white',
                                                    border: 'none',
                                                    cursor: sample.paymentStatus === 'paid' || sample.paymentStatus === 'free' ? 'pointer' : 'not-allowed'
                                                }}
                                            >
                                                Get Link
                                            </button>
                                            <button
                                                onClick={() => deleteSample(sample._id)}
                                                style={{ padding: '5px 10px', background: '#f44336', color: 'white', border: 'none' }}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Download Links Section */}
                        <div>
                            <h2>Download Links</h2>
                            {Object.keys(downloadTokens).length > 0 ? (
                                <div style={{ display: 'grid', gap: '10px' }}>
                                    {Object.entries(downloadTokens).map(([sampleId, tokenData]) => {
                                        const sample = samples.find(s => s._id === sampleId);
                                        return (
                                            <div key={sampleId} style={{
                                                border: '1px solid #ddd',
                                                borderRadius: '5px',
                                                padding: '15px',
                                                background: '#f9f9f9'
                                            }}>
                                                <p><strong>{sample?.name}</strong> ({tokenData.fileName})</p>
                                                <p>Link: <a href={tokenData.url} target="_blank" rel="noopener noreferrer">{tokenData.url}</a></p>
                                                <p style={{
                                                    color: '#666',
                                                    fontSize: '0.9em',
                                                    marginTop: '5px'
                                                }}>
                                                    (Expires after 10 minutes)
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p>No download links generated yet. Click "Get Link" on a sample to generate one</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;