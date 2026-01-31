// AddMusic.jsx - ARTIST SİSTEMİ + DRAG & DROP + 5 PLATFORM + DYNAMIC GENRES
// FIX: Multi-artist selection input bug fixed
// FIX: Image upload state sync issue fixed with useRef
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
    Grid,
    Card,
    CardContent,
    Alert,
    Chip,
    Stack,
    IconButton,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Avatar,
    Fade,
    Tabs,
    Tab,
    CardMedia,
    FormControlLabel,
    Switch,
    Tooltip,
    Autocomplete,
    InputAdornment,
    Badge
} from '@mui/material';
import {
    Add as AddIcon,
    MusicNote as MusicIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Search as SearchIcon,
    CloudUpload as UploadIcon,
    Save as SaveIcon,
    Clear as ClearIcon,
    Check as CheckIcon,
    Image as ImageIcon,
    Link as LinkIcon,
    Apple as AppleIcon,
    YouTube as YouTubeIcon,
    Star as StarIcon,
    Visibility as ViewsIcon,
    Favorite as LikesIcon,
    GraphicEq as SpotifyIcon,
    PhotoCamera as PhotoCameraIcon,
    Close as CloseIcon,
    MicExternalOn as ArtistIcon,
    PersonAdd as PersonAddIcon,
    Group as GroupIcon,
    Label as LabelIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.trackbangserver.com';

const AddMusic = () => {
    // Form state
    const [musicForm, setMusicForm] = useState({
        title: '',
        artists: [],
        imageUrl: '',
        genre: '',
        platformLinks: {
            spotify: '',
            appleMusic: '',
            youtubeMusic: '',
            beatport: '',
            soundcloud: ''
        },
        isFeatured: false
    });

    // Genre state - BACKEND'DEN ÇEKİLİYOR
    const [genres, setGenres] = useState([]);
    const [genresLoading, setGenresLoading] = useState(true);

    // Artist search state
    const [artistSearch, setArtistSearch] = useState('');
    const [artistOptions, setArtistOptions] = useState([]);
    const [artistsLoading, setArtistsLoading] = useState(false);
    const [showNewArtistDialog, setShowNewArtistDialog] = useState(false);
    const [newArtistName, setNewArtistName] = useState('');
    const [creatingArtist, setCreatingArtist] = useState(false);

    // Label search state
    const [labelSearch, setLabelSearch] = useState('');
    const [labelOptions, setLabelOptions] = useState([]);
    const [labelsLoading, setLabelsLoading] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState(null);

    // Edit Label state
    const [editLabelSearch, setEditLabelSearch] = useState('');
    const [editLabelOptions, setEditLabelOptions] = useState([]);
    const [editLabelsLoading, setEditLabelsLoading] = useState(false);
    const [editSelectedLabel, setEditSelectedLabel] = useState(null);

    // Music list state
    const [musicList, setMusicList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterGenre, setFilterGenre] = useState('all');
    const [editingMusic, setEditingMusic] = useState(null);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    // Image upload states
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // FIX: useRef for reliable image data (state sync issue fix)
    const imageDataRef = useRef(null);
    const editImageDataRef = useRef(null);

    // Edit dialog states
    const [_editImageFile, setEditImageFile] = useState(null);
    const [editImagePreview, setEditImagePreview] = useState(null);
    const [isEditDragging, setIsEditDragging] = useState(false);
    const [editUploadProgress, setEditUploadProgress] = useState(0);
    const [editArtistOptions, setEditArtistOptions] = useState([]);
    const [editArtistSearch, setEditArtistSearch] = useState('');

    // ⭐ SPOTIFY INTEGRATION STATES
    const [spotifyLink, setSpotifyLink] = useState('');
    const [spotifyLoading, setSpotifyLoading] = useState(false);
    const [spotifyFetched, setSpotifyFetched] = useState(false);
    const [spotifyError, setSpotifyError] = useState(null);
    const [spotifyArtistName, setSpotifyArtistName] = useState('');

    // ⭐ ARTIST MATCHING STATES (Sanatci eslestirme)
    const [artistMatchResults, setArtistMatchResults] = useState([]); // check-artists-batch sonuclari
    const [artistSelections, setArtistSelections] = useState({}); // Admin'in secimleri: { artistName: artistId }
    const [showArtistMatchDialog, setShowArtistMatchDialog] = useState(false);
    const [artistMatchLoading, setArtistMatchLoading] = useState(false);

    const platformConfig = {
        spotify: {
            label: 'Spotify',
            icon: <SpotifyIcon />,
            color: '#1DB954',
            placeholder: 'https://open.spotify.com/track/...'
        },
        appleMusic: {
            label: 'Apple Music',
            icon: <AppleIcon />,
            color: '#000000',
            placeholder: 'https://music.apple.com/...'
        },
        youtubeMusic: {
            label: 'YouTube Music',
            icon: <YouTubeIcon />,
            color: '#FF0000',
            placeholder: 'https://music.youtube.com/...'
        },
        beatport: {
            label: 'Beatport',
            icon: <MusicIcon />,
            color: '#01FF95',
            placeholder: 'https://www.beatport.com/...'
        },
        soundcloud: {
            label: 'SoundCloud',
            icon: <MusicIcon />,
            color: '#FF8800',
            placeholder: 'https://soundcloud.com/...'
        }
    };

    // ========== ⭐ SPOTIFY INTEGRATION FUNCTIONS ⭐ ==========

    // Spotify track URL'i mi kontrol et (query params ve intl-xx dahil)
    const isValidSpotifyTrackUrl = (url) => {
        if (!url) return false;
        // /intl-tr/, /intl-en/ gibi dil prefix'lerini ve ?si=xxx parametrelerini de kabul et
        const trackRegex = /^https?:\/\/open\.spotify\.com\/(intl-[a-z]{2}\/)?track\/[a-zA-Z0-9]+/i;
        const uriRegex = /^spotify:track:[a-zA-Z0-9]+/i;
        const trimmedUrl = url.trim();
        return trackRegex.test(trimmedUrl) || uriRegex.test(trimmedUrl);
    };

    // Spotify track ID'sini çıkar
    const extractSpotifyTrackId = (url) => {
        if (!url) return null;
        // URL'den query params'ı temizle ve track ID'yi al (intl-xx prefix'i dahil)
        const urlRegex = /open\.spotify\.com\/(intl-[a-z]{2}\/)?track\/([a-zA-Z0-9]+)/;
        const uriRegex = /spotify:track:([a-zA-Z0-9]+)/;

        let match = urlRegex.exec(url);
        if (match) return match[2]; // intl prefix varsa group 2'de

        match = uriRegex.exec(url);
        if (match) return match[1];

        return null;
    };

    // Spotify'dan metadata çek
    const fetchSpotifyMetadata = async (spotifyUrl) => {
        const trackId = extractSpotifyTrackId(spotifyUrl);
        if (!trackId) {
            setSpotifyError('Geçerli bir Spotify track linki girin');
            return;
        }

        setSpotifyLoading(true);
        setSpotifyError(null);

        try {
            console.log('🎵 Fetching Spotify metadata for track:', trackId);

            // Admin token'ı al
            const adminToken = localStorage.getItem('adminToken');
            console.log('🔑 Admin token exists:', !!adminToken);

            if (!adminToken) {
                setSpotifyError('Oturum bulunamadı, lütfen tekrar giriş yapın');
                setSpotifyLoading(false);
                return;
            }

            const response = await axios.get(`${API_BASE_URL}/api/spotify/track/${trackId}`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });

            console.log('📥 Spotify API response:', response.data);

            if (response.data.success && response.data.data) {
                const data = response.data.data;
                // Spotify controller'dan gelen field'lar: name, artist, imageUrl
                const trackName = data.name || data.title || '';
                const artistName = data.artist || data.artistNames || '';
                const imageUrl = data.imageUrl || '';

                console.log('✅ Spotify metadata received:', { trackName, artistName, imageUrl });

                // Form'u güncelle
                setMusicForm(prev => {
                    const newForm = {
                        ...prev,
                        title: trackName,
                        platformLinks: {
                            ...prev.platformLinks,
                            spotify: spotifyUrl.trim()
                        }
                    };
                    console.log('📝 Updated form:', newForm);
                    return newForm;
                });

                // Spotify'dan gelen image'ı ayarla
                if (imageUrl) {
                    setImagePreview(imageUrl);
                    imageDataRef.current = imageUrl;
                    console.log('🖼️ Image set:', imageUrl);
                }

                // Artist adını sakla (artist seçimi için kullanılacak)
                setSpotifyArtistName(artistName);
                setSpotifyFetched(true);

                // ⭐ Sanatci eslesmelerini kontrol et
                if (artistName) {
                    checkArtistsMatches(artistName);
                }

                setSuccess(`✅ Spotify'dan bilgiler alındı: "${trackName}" - ${artistName}`);
            } else {
                console.error('❌ Spotify API returned unsuccessful:', response.data);
                setSpotifyError('Spotify\'dan veri alınamadı');
            }
        } catch (error) {
            console.error('❌ Spotify metadata fetch error:', error);
            console.error('❌ Error response:', error.response?.data);

            if (error.response?.status === 401) {
                setSpotifyError('Oturum süresi dolmuş, lütfen tekrar giriş yapın');
            } else if (error.response?.status === 404) {
                setSpotifyError('Şarkı Spotify\'da bulunamadı');
            } else {
                setSpotifyError(`Spotify bilgileri alınamadı: ${error.response?.data?.message || error.message}`);
            }
        } finally {
            setSpotifyLoading(false);
        }
    };

    // Spotify linki değiştiğinde
    const handleSpotifyLinkChange = (e) => {
        const link = e.target.value;
        setSpotifyLink(link);
        setSpotifyError(null);

        console.log('🔗 Spotify link changed:', link);
        console.log('🔗 Is valid:', isValidSpotifyTrackUrl(link));

        // Geçerli bir link ise otomatik fetch
        if (isValidSpotifyTrackUrl(link) && !spotifyLoading) {
            console.log('🚀 Triggering Spotify fetch...');
            fetchSpotifyMetadata(link);
        } else if (link && !isValidSpotifyTrackUrl(link)) {
            setSpotifyFetched(false);
        }
    };

    // Paste event handler - yapıştırma anında tetiklenir
    const handleSpotifyPaste = (e) => {
        // Paste edilen içeriği al
        const pastedText = e.clipboardData.getData('text');
        console.log('📋 Pasted text:', pastedText);
        console.log('📋 Trimmed:', pastedText.trim());

        const trimmedText = pastedText.trim();

        if (isValidSpotifyTrackUrl(trimmedText)) {
            e.preventDefault(); // Default paste'i engelle
            console.log('✅ Valid Spotify link pasted, fetching...');
            setSpotifyLink(trimmedText);
            setSpotifyError(null);
            // Direkt fetch et
            fetchSpotifyMetadata(trimmedText);
        } else {
            console.log('❌ Invalid Spotify link:', trimmedText);
            console.log('❌ Regex test result:', /^https?:\/\/open\.spotify\.com\/track\/[a-zA-Z0-9]+/i.test(trimmedText));
        }
    };

    // Spotify verilerini temizle
    const clearSpotifyData = () => {
        setSpotifyLink('');
        setSpotifyFetched(false);
        setSpotifyError(null);
        setSpotifyArtistName('');
        setMusicForm(prev => ({
            ...prev,
            title: '',
            artists: [],
            platformLinks: {
                ...prev.platformLinks,
                spotify: ''
            }
        }));
        setImagePreview(null);
        imageDataRef.current = null;
        // Artist matching state'lerini de temizle
        setArtistMatchResults([]);
        setArtistSelections({});
    };

    // ========== ARTIST MATCHING FUNCTIONS ==========
    // Sanatci isimlerini kontrol et ve eslesmeler varsa dialog goster
    const checkArtistsMatches = async (artistNamesString) => {
        if (!artistNamesString || artistNamesString.trim().length < 2) return;

        // Sanatci isimlerini virgul ile ayir
        const artistNames = artistNamesString.split(',').map(name => name.trim()).filter(name => name.length > 0);

        if (artistNames.length === 0) return;

        console.log('🔍 Checking artist matches for:', artistNames);
        setArtistMatchLoading(true);

        try {
            const adminToken = localStorage.getItem('adminToken');
            const response = await axios.post(
                `${API_BASE_URL}/api/music/check-artists-batch`,
                { artistNames },
                { headers: { Authorization: `Bearer ${adminToken}` } }
            );

            console.log('📋 Artist match response:', response.data);

            if (response.data.success) {
                setArtistMatchResults(response.data.results);

                // Eslesmeler varsa dialog goster
                if (response.data.hasAnyMatches) {
                    setShowArtistMatchDialog(true);
                    // Varsayilan secimleri ayarla (ilk eslesen veya yeni olustur)
                    const defaultSelections = {};
                    response.data.results.forEach(result => {
                        if (result.hasMatches && result.matches.length > 0) {
                            // Ilk eslesen artist'i varsayilan sec
                            defaultSelections[result.searchName] = result.matches[0].id;
                        } else {
                            // Esleme yok, yeni olusturulacak
                            defaultSelections[result.searchName] = null;
                        }
                    });
                    setArtistSelections(defaultSelections);
                } else {
                    // Esleme yok, tum sanatcilar yeni olusturulacak
                    const defaultSelections = {};
                    response.data.results.forEach(result => {
                        defaultSelections[result.searchName] = null;
                    });
                    setArtistSelections(defaultSelections);
                }
            }
        } catch (error) {
            console.error('❌ Artist match check error:', error);
            // Hata durumunda devam et, sanatcilar otomatik olusturulacak
        } finally {
            setArtistMatchLoading(false);
        }
    };

    // Artist secim dialogunu kapat ve secimleri onayla
    const handleArtistMatchConfirm = () => {
        setShowArtistMatchDialog(false);
        console.log('✅ Artist selections confirmed:', artistSelections);
    };

    // Tek bir sanatci icin secim degistir
    const handleArtistSelectionChange = (artistName, selectedId) => {
        setArtistSelections(prev => ({
            ...prev,
            [artistName]: selectedId || null
        }));
    };

    // ========== GENRE FETCH ==========
    const fetchGenres = async () => {
        try {
            setGenresLoading(true);
            const response = await axios.get(`${API_BASE_URL}/api/genres`);

            if (response.data.success && response.data.data) {
                const genreList = response.data.data;
                setGenres(genreList);

                if (genreList.length > 0 && !musicForm.genre) {
                    setMusicForm(prev => ({ ...prev, genre: genreList[0].slug }));
                }
            }
        } catch (error) {
            console.error('Genre fetch error:', error);
            setGenres([
                { slug: 'afrohouse', displayName: 'Afro House' },
                { slug: 'indiedance', displayName: 'Indie Dance' },
                { slug: 'organichouse', displayName: 'Organic House' },
                { slug: 'downtempo', displayName: 'Down Tempo' },
                { slug: 'melodichouse', displayName: 'Melodic House' }
            ]);
        } finally {
            setGenresLoading(false);
        }
    };

    // ========== ARTIST SEARCH FUNCTIONS ==========
    const searchArtists = useCallback(async (query, isEdit = false) => {
        if (!query || query.length < 2) {
            return;
        }

        setArtistsLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/artists`, {
                params: { search: query, limit: 20 }
            });

            if (response.data.success) {
                const artists = response.data.data.artists || [];
                const selectedIds = isEdit
                    ? (editingMusic?.artists || []).map(a => a._id || a)
                    : musicForm.artists.map(a => a._id);
                const filtered = artists.filter(a => !selectedIds.includes(a._id));

                if (isEdit) {
                    setEditArtistOptions(filtered);
                } else {
                    setArtistOptions(filtered);
                }
            }
        } catch (error) {
            console.error('Artist arama hatası:', error);
        } finally {
            setArtistsLoading(false);
        }
    }, [musicForm.artists, editingMusic]);

    // Debounced search for add form
    useEffect(() => {
        const timer = setTimeout(() => {
            searchArtists(artistSearch, false);
        }, 300);
        return () => clearTimeout(timer);
    }, [artistSearch, searchArtists]);

    // Debounced search for edit form
    useEffect(() => {
        const timer = setTimeout(() => {
            if (openEditDialog) {
                searchArtists(editArtistSearch, true);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [editArtistSearch, searchArtists, openEditDialog]);

    // Label search function
    const searchLabels = useCallback(async (query) => {
        if (!query || query.length < 2) {
            setLabelOptions([]);
            return;
        }

        setLabelsLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/labels/search`, {
                params: { q: query }
            });

            if (response.data.success) {
                setLabelOptions(response.data.labels || []);
            }
        } catch (error) {
            console.error('Label arama hatası:', error);
        } finally {
            setLabelsLoading(false);
        }
    }, []);

    // Debounced label search
    useEffect(() => {
        const timer = setTimeout(() => {
            searchLabels(labelSearch);
        }, 300);
        return () => clearTimeout(timer);
    }, [labelSearch, searchLabels]);

    // Edit Label search function
    const searchEditLabels = useCallback(async (query) => {
        if (!query || query.length < 2) {
            setEditLabelOptions([]);
            return;
        }

        setEditLabelsLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/labels/search`, {
                params: { q: query }
            });

            if (response.data.success) {
                setEditLabelOptions(response.data.labels || []);
            }
        } catch (error) {
            console.error('Edit Label arama hatası:', error);
        } finally {
            setEditLabelsLoading(false);
        }
    }, []);

    // Debounced edit label search
    useEffect(() => {
        if (!openEditDialog) return;
        const timer = setTimeout(() => {
            searchEditLabels(editLabelSearch);
        }, 300);
        return () => clearTimeout(timer);
    }, [editLabelSearch, searchEditLabels, openEditDialog]);

    // Load initial data
    useEffect(() => {
        fetchGenres();
        fetchMusic();

        const loadInitialArtists = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/artists`, {
                    params: { limit: 50 }
                });
                if (response.data.success) {
                    const artists = response.data.data.artists || [];
                    setArtistOptions(artists);
                    setEditArtistOptions(artists);
                }
            } catch (error) {
                console.error('Initial artists yüklenemedi:', error);
            }
        };
        loadInitialArtists();
    }, []);

    // Create new artist
    const handleCreateNewArtist = async (isEdit = false) => {
        if (!newArtistName.trim()) {
            setError('Artist adı zorunludur');
            return;
        }

        setCreatingArtist(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/api/artists`, {
                name: newArtistName.trim()
            });

            if (response.data.success) {
                const newArtist = response.data.data.artist;

                if (isEdit && editingMusic) {
                    const currentArtists = editingMusic.artists || [];
                    setEditingMusic({
                        ...editingMusic,
                        artists: [...currentArtists, newArtist]
                    });
                    setEditArtistOptions(prev => [newArtist, ...prev]);
                } else {
                    setMusicForm(prev => ({
                        ...prev,
                        artists: [...prev.artists, newArtist]
                    }));
                    setArtistOptions(prev => [newArtist, ...prev]);
                }

                setShowNewArtistDialog(false);
                setNewArtistName('');
                setSuccess(`"${newArtist.name}" artisti oluşturuldu ve eklendi`);
            }
        } catch (error) {
            console.error('Artist oluşturma hatası:', error);
            setError(error.response?.data?.message || 'Artist oluşturulamadı');
        } finally {
            setCreatingArtist(false);
        }
    };

    // ========== EXISTING FUNCTIONS ==========
    const fetchMusic = async () => {
        setLoading(true);
        try {
            // FIX: Tüm müzikleri çekmek için limit artırıldı
            const response = await axios.get(`${API_BASE_URL}/api/music`, {
                params: { limit: 500 }
            });
            const data = response.data.data?.musics || response.data.musics || response.data.music || response.data || [];
            console.log('📥 Fetched music count:', Array.isArray(data) ? data.length : 0);
            setMusicList(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching music:', error);
            setError('Müzik listesi yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setMusicForm({ ...musicForm, [name]: value });
    };

    const handlePlatformLinkChange = (platform, value) => {
        setMusicForm({
            ...musicForm,
            platformLinks: {
                ...musicForm.platformLinks,
                [platform]: value
            }
        });
    };

    // Artist handlers for add form
    const handleArtistSelect = (event, newValue) => {
        setMusicForm(prev => ({ ...prev, artists: newValue }));
        setArtistSearch(''); // Reset search after selection
    };

    const handleRemoveArtist = (artistToRemove) => {
        setMusicForm(prev => ({
            ...prev,
            artists: prev.artists.filter(a => a._id !== artistToRemove._id)
        }));
    };

    // Artist handlers for edit form
    const handleEditArtistSelect = (event, newValue) => {
        setEditingMusic(prev => ({ ...prev, artists: newValue }));
        setEditArtistSearch(''); // Reset search after selection
    };

    const handleRemoveEditArtist = (artistToRemove) => {
        setEditingMusic(prev => ({
            ...prev,
            artists: prev.artists.filter(a => (a._id || a) !== (artistToRemove._id || artistToRemove))
        }));
    };

    // Image validation
    const validateImage = (file) => {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const maxSize = 5 * 1024 * 1024;

        if (!validTypes.includes(file.type)) {
            setError('Sadece resim dosyaları yüklenebilir (JPG, PNG, GIF, WebP)');
            return false;
        }

        if (file.size > maxSize) {
            setError('Dosya boyutu 5MB\'dan küçük olmalıdır');
            return false;
        }

        return true;
    };

    // ADD FORM - Image handlers
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file && validateImage(file)) {
            processImageFile(file);
        }
    };

    const processImageFile = (file) => {
        setImageFile(file);
        setUploadProgress(0);

        const reader = new FileReader();
        reader.onloadstart = () => setUploadProgress(10);
        reader.onprogress = (e) => {
            if (e.lengthComputable) {
                setUploadProgress((e.loaded / e.total) * 100);
            }
        };
        reader.onloadend = () => {
            const base64Result = reader.result;
            console.log('✅ Image loaded, length:', base64Result?.length);

            // FIX: Ref'e de yaz - state sync sorununu aşmak için
            imageDataRef.current = base64Result;

            setImagePreview(base64Result);
            setMusicForm(prev => ({ ...prev, imageUrl: base64Result }));
            setUploadProgress(100);
            setTimeout(() => setUploadProgress(0), 1000);
        };
        reader.onerror = () => {
            setError('Görsel yüklenirken hata oluştu');
            setUploadProgress(0);
        };
        reader.readAsDataURL(file);
    };

    const handleDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
    const handleDrop = (e) => {
        e.preventDefault(); e.stopPropagation(); setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0 && validateImage(files[0])) {
            processImageFile(files[0]);
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        imageDataRef.current = null; // FIX: Ref'i de temizle
        setMusicForm(prev => ({ ...prev, imageUrl: '' }));
        setUploadProgress(0);
    };

    // EDIT FORM - Image handlers
    const handleEditImageChange = (e) => {
        const file = e.target.files[0];
        if (file && validateImage(file)) {
            processEditImageFile(file);
        }
    };

    const processEditImageFile = (file) => {
        setEditImageFile(file);
        setEditUploadProgress(0);

        const reader = new FileReader();
        reader.onloadstart = () => setEditUploadProgress(10);
        reader.onprogress = (e) => {
            if (e.lengthComputable) {
                setEditUploadProgress((e.loaded / e.total) * 100);
            }
        };
        reader.onloadend = () => {
            const base64Result = reader.result;
            console.log('✅ Edit image loaded, length:', base64Result?.length);

            // FIX: Ref'e de yaz
            editImageDataRef.current = base64Result;

            setEditImagePreview(base64Result);
            setEditingMusic(prev => ({ ...prev, imageUrl: base64Result }));
            setEditUploadProgress(100);
            setTimeout(() => setEditUploadProgress(0), 1000);
        };
        reader.onerror = () => {
            setError('Görsel yüklenirken hata oluştu');
            setEditUploadProgress(0);
        };
        reader.readAsDataURL(file);
    };

    const handleEditDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setIsEditDragging(true); };
    const handleEditDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsEditDragging(false); };
    const handleEditDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
    const handleEditDrop = (e) => {
        e.preventDefault(); e.stopPropagation(); setIsEditDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0 && validateImage(files[0])) {
            processEditImageFile(files[0]);
        }
    };

    const handleRemoveEditImage = () => {
        setEditImageFile(null);
        setEditImagePreview(null);
        editImageDataRef.current = null; // FIX: Ref'i de temizle
        setEditUploadProgress(0);
    };

    const validateForm = () => {
        // ⭐ Spotify'dan fetch edildiyse title otomatik gelmiş demektir
        if (!musicForm.title.trim() && !spotifyFetched) {
            setError('Şarkı adı gereklidir - Spotify linki yapıştırın veya manuel girin');
            return false;
        }

        // Spotify fetch edildi ama title boşsa (API sorunu olabilir)
        if (!musicForm.title.trim() && spotifyFetched) {
            setError('Spotify\'dan şarkı adı alınamadı, lütfen tekrar deneyin');
            return false;
        }

        // ⭐ Spotify'dan artist geldiyse veya manuel seçildiyse OK
        if (musicForm.artists.length === 0 && !spotifyArtistName) {
            setError('En az bir artist seçmelisiniz veya Spotify linki girin');
            return false;
        }
        // FIX: Ref'i de kontrol et
        if (!imageDataRef.current && !musicForm.imageUrl && !imagePreview && !imageFile) {
            setError('Şarkı görseli gereklidir');
            return false;
        }
        if (!musicForm.genre) {
            setError('Tür seçmelisiniz');
            return false;
        }

        // ⭐ Spotify linki zorunlu
        const hasSpotifyLink = musicForm.platformLinks.spotify && musicForm.platformLinks.spotify.trim() !== '';
        if (!hasSpotifyLink) {
            setError('Spotify linki zorunludur');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmitLoading(true);
        setError(null);

        try {
            // FIX: Önce ref'ten, sonra state'lerden al
            const finalImageUrl = imageDataRef.current || musicForm.imageUrl || imagePreview;

            console.log('📤 Image sources:', {
                ref: imageDataRef.current ? `[${imageDataRef.current.length} chars]` : 'null',
                formState: musicForm.imageUrl ? `[${musicForm.imageUrl.length} chars]` : 'null',
                preview: imagePreview ? `[${imagePreview.length} chars]` : 'null',
                final: finalImageUrl ? `[${finalImageUrl.length} chars]` : 'NULL!'
            });

            if (!finalImageUrl) {
                setError('Görsel yüklenemedi, lütfen tekrar deneyin');
                setSubmitLoading(false);
                return;
            }

            // ⭐ Artist listesini hazırla - Spotify'dan gelen artist'i ekle
            let artistNames = musicForm.artists.map(a => a.name);

            // Eğer Spotify'dan artist geldiyse ve listede yoksa ekle
            if (spotifyArtistName && !artistNames.some(name =>
                name.toLowerCase() === spotifyArtistName.toLowerCase()
            )) {
                // Spotify'dan gelen artist virgülle ayrılmış olabilir
                const spotifyArtists = spotifyArtistName.split(',').map(n => n.trim()).filter(n => n);
                artistNames = [...spotifyArtists, ...artistNames];
            }

            // ⭐ Artist seçimlerini hazırla (backend'e gönderilecek)
            const artistSelectionsArray = Object.entries(artistSelections).map(([name, selectedId]) => ({
                name: name,
                selectedId: selectedId || null
            }));

            const submitData = {
                title: musicForm.title.trim(),
                artists: artistNames,
                artistSelections: artistSelectionsArray.length > 0 ? artistSelectionsArray : undefined,
                imageUrl: finalImageUrl,
                genre: musicForm.genre,
                isFeatured: musicForm.isFeatured,
                platformLinks: Object.fromEntries(
                    Object.entries(musicForm.platformLinks).filter(([, value]) => value.trim() !== '')
                ),
                // Label - isim veya ID gönder
                labelName: selectedLabel ? selectedLabel.name : (labelSearch.trim() || undefined),
                labelId: selectedLabel?._id || undefined
            };

            console.log('📤 Submitting music:', {
                ...submitData,
                imageUrl: `[${submitData.imageUrl.length} chars]`,
                spotifyArtist: spotifyArtistName,
                artistSelections: artistSelectionsArray,
                label: submitData.labelName || submitData.labelId || 'none'
            });

            await axios.post(`${API_BASE_URL}/api/music`, submitData);
            setSuccess('Müzik başarıyla eklendi! 🎵');
            clearForm();
            fetchMusic();
        } catch (error) {
            console.error('Error adding music:', error);
            setError(error.response?.data?.message || 'Müzik eklenirken hata oluştu');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleEdit = (music) => {
        let normalizedArtists = [];
        if (music.artists && music.artists.length > 0) {
            normalizedArtists = music.artists.map(a => {
                if (typeof a === 'object') return a;
                const found = artistOptions.find(opt => opt._id === a);
                return found || { _id: a, name: 'Unknown' };
            });
        }

        // Label bilgisini normalize et
        let normalizedLabel = null;
        if (music.labelId) {
            if (typeof music.labelId === 'object') {
                normalizedLabel = music.labelId;
            } else {
                normalizedLabel = { _id: music.labelId, name: music.labelName || 'Unknown Label' };
            }
        }

        setEditingMusic({
            ...music,
            artists: normalizedArtists,
            platformLinks: music.platformLinks || {
                spotify: '',
                appleMusic: '',
                youtubeMusic: '',
                beatport: '',
                soundcloud: ''
            }
        });
        setEditImagePreview(music.imageUrl || null);
        editImageDataRef.current = music.imageUrl || null; // FIX: Mevcut image'ı ref'e yaz
        setEditImageFile(null);
        setEditArtistSearch('');
        // Label edit state'lerini ayarla
        setEditSelectedLabel(normalizedLabel);
        setEditLabelSearch(normalizedLabel?.name || '');
        setEditLabelOptions([]);
        setOpenEditDialog(true);
    };

    const handleUpdateMusic = async () => {
        if (!editingMusic.title?.trim()) {
            setError('Şarkı adı gereklidir');
            return;
        }
        if (!editingMusic.artists || editingMusic.artists.length === 0) {
            setError('En az bir artist seçmelisiniz');
            return;
        }

        setSubmitLoading(true);
        try {
            // FIX: Önce ref'ten, sonra state'lerden al
            const finalImageUrl = editImageDataRef.current || editingMusic.imageUrl || editImagePreview;

            const updateData = {
                title: editingMusic.title.trim(),
                artists: editingMusic.artists.map(a => a.name || a),
                imageUrl: finalImageUrl,
                genre: editingMusic.genre,
                isFeatured: editingMusic.isFeatured,
                platformLinks: Object.fromEntries(
                    Object.entries(editingMusic.platformLinks || {}).filter(([, value]) => value?.trim() !== '')
                ),
                // Label bilgisi
                labelName: editSelectedLabel ? editSelectedLabel.name : (editLabelSearch.trim() || undefined),
                labelId: editSelectedLabel?._id || undefined
            };

            await axios.put(`${API_BASE_URL}/api/music/${editingMusic._id}`, updateData);
            setSuccess('Müzik başarıyla güncellendi! ✅');
            setOpenEditDialog(false);
            setEditingMusic(null);
            setEditImagePreview(null);
            setEditImageFile(null);
            editImageDataRef.current = null;
            // Edit label state'lerini temizle
            setEditLabelSearch('');
            setEditSelectedLabel(null);
            setEditLabelOptions([]);
            await fetchMusic();
        } catch (error) {
            setError(error.response?.data?.message || 'Müzik güncellenirken hata oluştu');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bu müziği silmek istediğinizden emin misiniz?')) {
            try {
                await axios.delete(`${API_BASE_URL}/api/music/${id}`);
                setSuccess('Müzik başarıyla silindi! 🗑️');
                fetchMusic();
            } catch (err) {
                console.error('Silme hatası:', err);
                setError('Müzik silinirken hata oluştu');
            }
        }
    };

    const clearForm = () => {
        setMusicForm({
            title: '',
            artists: [],
            imageUrl: '',
            genre: genres.length > 0 ? genres[0].slug : '',
            platformLinks: {
                spotify: '',
                appleMusic: '',
                youtubeMusic: '',
                beatport: '',
                soundcloud: ''
            },
            isFeatured: false
        });
        setImageFile(null);
        setImagePreview(null);
        imageDataRef.current = null; // FIX: Ref'i de temizle
        setError(null);
        setActiveTab(0);
        setUploadProgress(0);
        setArtistSearch('');
        // ⭐ Spotify verilerini temizle
        setSpotifyLink('');
        setSpotifyFetched(false);
        setSpotifyError(null);
        setSpotifyArtistName('');
        // ⭐ Artist matching state'lerini temizle
        setArtistMatchResults([]);
        setArtistSelections({});
        setShowArtistMatchDialog(false);
        // ⭐ Label state'lerini temizle
        setLabelSearch('');
        setSelectedLabel(null);
        setLabelOptions([]);
    };

    const filteredMusic = musicList.filter(music => {
        const title = music.title || '';
        const artistNames = music.artistNames || music.artist || '';
        const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            artistNames.toLowerCase().includes(searchTerm.toLowerCase());

        // FIX: Case-insensitive genre comparison
        const musicGenre = (music.genre || '').toLowerCase().trim();
        const selectedGenre = (filterGenre || '').toLowerCase().trim();
        const matchesGenre = selectedGenre === 'all' || musicGenre === selectedGenre;

        return matchesSearch && matchesGenre;
    });

    const getGenreDisplayName = (slug) => {
        const genre = genres.find(g => g.slug === slug);
        return genre?.displayName || slug;
    };

    const getPlatformCount = (platformLinks) => {
        if (!platformLinks) return 0;
        return Object.values(platformLinks).filter(link => link).length;
    };

    const getDisplayArtist = (music) => {
        if (music.artistNames) return music.artistNames;
        if (music.artists && music.artists.length > 0) {
            return music.artists.map(a => a.name || a).join(', ');
        }
        return music.artist || 'Unknown Artist';
    };

    // Drag & Drop Image Component
    const DragDropImageUpload = ({
                                     preview, isDragging, uploadProgress,
                                     onDragEnter, onDragLeave, onDragOver, onDrop,
                                     onFileSelect, onRemove, inputId
                                 }) => (
        <Box
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onClick={() => !preview && document.getElementById(inputId).click()}
            sx={{
                border: '2px dashed',
                borderColor: isDragging ? 'primary.main' : 'grey.300',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                cursor: preview ? 'default' : 'pointer',
                bgcolor: isDragging ? 'primary.light' : preview ? 'transparent' : 'grey.50',
                transition: 'all 0.3s ease',
                position: 'relative',
                '&:hover': !preview && { borderColor: 'primary.main', bgcolor: 'primary.light' }
            }}
        >
            <input id={inputId} type="file" accept="image/*" onChange={onFileSelect} style={{ display: 'none' }} />

            {preview ? (
                <Box position="relative">
                    <CardMedia component="img" image={preview} alt="Preview"
                               sx={{ width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: 2 }} />
                    <IconButton onClick={(e) => { e.stopPropagation(); onRemove(); }}
                                sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.7)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.9)' } }}>
                        <CloseIcon />
                    </IconButton>
                    <Stack direction="row" spacing={1}
                           sx={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)' }}>
                        <Button variant="contained" size="small" startIcon={<PhotoCameraIcon />}
                                onClick={(e) => { e.stopPropagation(); document.getElementById(inputId).click(); }}
                                sx={{ bgcolor: 'rgba(0,0,0,0.7)', '&:hover': { bgcolor: 'rgba(0,0,0,0.9)' } }}>
                            Değiştir
                        </Button>
                        <Button variant="contained" size="small" color="error" startIcon={<DeleteIcon />}
                                onClick={(e) => { e.stopPropagation(); onRemove(); }}>
                            Kaldır
                        </Button>
                    </Stack>
                </Box>
            ) : (
                <Box>
                    <UploadIcon sx={{
                        fontSize: 64, color: isDragging ? 'primary.main' : 'text.secondary', mb: 2,
                        animation: isDragging ? 'bounce 1s infinite' : 'none',
                        '@keyframes bounce': { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } }
                    }} />
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                        {isDragging ? 'Görseli Buraya Bırakın' : 'Görsel Yükle'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                        Görseli sürükleyip bırakın veya tıklayarak seçin
                    </Typography>
                    <Chip label="JPG, PNG, GIF, WebP • Max 5MB" size="small" variant="outlined" />
                </Box>
            )}

            {uploadProgress > 0 && uploadProgress < 100 && (
                <Box sx={{ width: '100%', mt: 2 }}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="caption" color="text.secondary">Yükleniyor...</Typography>
                        <Typography variant="caption" color="text.secondary">{uploadProgress.toFixed(0)}%</Typography>
                    </Box>
                    <Box sx={{ width: '100%', height: 4, bgcolor: 'grey.200', borderRadius: 2, overflow: 'hidden' }}>
                        <Box sx={{ width: `${uploadProgress}%`, height: '100%', bgcolor: 'primary.main', transition: 'width 0.3s ease' }} />
                    </Box>
                </Box>
            )}
        </Box>
    );

    // Artist Select Component - FIX: inputValue kontrolü düzeltildi
    const ArtistSelectComponent = ({
                                       value, onChange, onRemove, options, loading,
                                       onInputChange, inputValue, placeholder, onCreateNew
                                   }) => (
        <Box>
            <Autocomplete
                multiple
                options={options}
                value={value}
                onChange={onChange}
                // FIX: onInputChange'de reason kontrolü
                onInputChange={(event, newInputValue, reason) => {
                    // Sadece kullanıcı yazarken güncelle, reset/clear durumlarında boşalt
                    if (reason === 'input') {
                        onInputChange(newInputValue);
                    } else if (reason === 'clear' || reason === 'reset') {
                        onInputChange('');
                    }
                }}
                inputValue={inputValue}
                getOptionLabel={(option) => option.name || ''}
                isOptionEqualToValue={(option, val) => option._id === (val._id || val)}
                loading={loading}
                filterSelectedOptions
                clearOnBlur={false}
                noOptionsText={inputValue.length < 2 ? "En az 2 karakter yazın" : "Artist bulunamadı"}
                renderOption={(props, option) => (
                    <li {...props} key={option._id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                            <Avatar src={option.profileImage} sx={{ width: 36, height: 36, bgcolor: '#7C3AED' }}>
                                {option.name?.charAt(0)}
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="body2" fontWeight="bold">{option.name}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {option.claimStatus === 'claimed' ? '✓ Verified Artist' : 'Artist'}
                                </Typography>
                            </Box>
                        </Box>
                    </li>
                )}
                renderTags={(tagValue, getTagProps) =>
                    tagValue.map((option, index) => (
                        <Chip
                            {...getTagProps({ index })}
                            key={option._id || index}
                            avatar={<Avatar src={option.profileImage} sx={{ bgcolor: '#7C3AED' }}>{(option.name || '?').charAt(0)}</Avatar>}
                            label={option.name || 'Unknown'}
                            onDelete={() => onRemove(option)}
                            sx={{ bgcolor: '#F3E8FF', color: '#7C3AED', '& .MuiChip-deleteIcon': { color: '#7C3AED', '&:hover': { color: '#6D28D9' } } }}
                        />
                    ))
                }
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder={value.length === 0 ? placeholder : "Daha fazla artist ekle..."}
                        InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                                <>
                                    <InputAdornment position="start"><ArtistIcon sx={{ color: '#7C3AED' }} /></InputAdornment>
                                    {params.InputProps.startAdornment}
                                </>
                            ),
                            endAdornment: (
                                <>
                                    {loading ? <CircularProgress size={20} /> : null}
                                    {params.InputProps.endAdornment}
                                </>
                            )
                        }}
                    />
                )}
            />
            <Button startIcon={<PersonAddIcon />} onClick={onCreateNew} sx={{ mt: 1, color: '#7C3AED' }} size="small">
                Yeni Artist Oluştur
            </Button>
            {value.length > 0 && (
                <Box sx={{ mt: 2, p: 2, bgcolor: '#F9FAFB', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary">Seçilen Artistler ({value.length}):</Typography>
                    <Typography variant="body2" fontWeight="bold" sx={{ mt: 0.5 }}>
                        {value.map(a => a.name || a).join(', ')}
                    </Typography>
                </Box>
            )}
        </Box>
    );

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box display="flex" alignItems="center" mb={4}>
                <Avatar sx={{ bgcolor: '#7C3AED', mr: 2, width: 56, height: 56 }}><MusicIcon /></Avatar>
                <Box>
                    <Typography variant="h4" fontWeight="bold">Müzik Yönetimi</Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Multi-Artist Desteği • 5 Platform: Spotify, Apple Music, YouTube Music, Beatport, SoundCloud
                    </Typography>
                </Box>
            </Box>

            {/* Alerts */}
            <Stack spacing={2} mb={3}>
                {error && <Fade in><Alert severity="error" onClose={() => setError(null)}>{error}</Alert></Fade>}
                {success && <Fade in><Alert severity="success" onClose={() => setSuccess(null)}>{success}</Alert></Fade>}
            </Stack>

            <Grid container spacing={3}>
                {/* Add Music Form */}
                <Grid item xs={12} lg={5}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                                <Typography variant="h6" fontWeight="bold">Yeni Müzik Ekle</Typography>
                                <Button size="small" onClick={clearForm} startIcon={<ClearIcon />} color="inherit">Temizle</Button>
                            </Box>

                            <form onSubmit={handleSubmit}>
                                <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3 }}>
                                    <Tab label="Temel Bilgiler" icon={<MusicIcon />} iconPosition="start" />
                                    <Tab label="Platform Linkleri" icon={<LinkIcon />} iconPosition="start" />
                                    <Tab label="Görsel" icon={<ImageIcon />} iconPosition="start" />
                                </Tabs>

                                {/* Tab 0: Temel Bilgiler */}
                                {activeTab === 0 && (
                                    <Stack spacing={3}>
                                        {/* ⭐ SPOTIFY LINK - EN ÜSTTE */}
                                        <Box>
                                            <Typography variant="body2" color="text.secondary" mb={1}>
                                                Spotify linkini yapıştırın
                                            </Typography>

                                            <TextField
                                                fullWidth
                                                value={spotifyLink}
                                                onChange={handleSpotifyLinkChange}
                                                onPaste={handleSpotifyPaste}
                                                placeholder="https://open.spotify.com/track/..."
                                                error={!!spotifyError}
                                                helperText={spotifyError}
                                                disabled={spotifyLoading}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <SpotifyIcon sx={{ color: '#1DB954' }} />
                                                        </InputAdornment>
                                                    ),
                                                    endAdornment: spotifyLoading ? (
                                                        <InputAdornment position="end">
                                                            <CircularProgress size={20} sx={{ color: '#1DB954' }} />
                                                        </InputAdornment>
                                                    ) : spotifyFetched ? (
                                                        <InputAdornment position="end">
                                                            <CheckIcon sx={{ color: '#1DB954' }} />
                                                        </InputAdornment>
                                                    ) : null
                                                }}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        '&.Mui-focused fieldset': {
                                                            borderColor: '#1DB954',
                                                        },
                                                    },
                                                }}
                                            />

                                            {spotifyFetched && (
                                                <Box mt={2}>
                                                    <Paper sx={{ p: 2, bgcolor: 'rgba(29, 185, 84, 0.1)', border: '2px solid #1DB954' }}>
                                                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                                                            <Typography variant="subtitle1" fontWeight="bold" color="#1DB954">
                                                                ✓ Spotify'dan Alındı
                                                            </Typography>
                                                            <Button size="small" onClick={clearSpotifyData} color="error" variant="outlined">
                                                                Temizle
                                                            </Button>
                                                        </Box>
                                                        <Box display="flex" gap={2}>
                                                            {imagePreview && (
                                                                <Box
                                                                    component="img"
                                                                    src={imagePreview}
                                                                    alt="Cover"
                                                                    sx={{ width: 80, height: 80, borderRadius: 1, objectFit: 'cover' }}
                                                                />
                                                            )}
                                                            <Box>
                                                                <Typography variant="h6" fontWeight="bold">
                                                                    {musicForm.title}
                                                                </Typography>
                                                                <Typography variant="body1" color="text.secondary">
                                                                    {spotifyArtistName}
                                                                </Typography>
                                                                {artistMatchLoading ? (
                                                                    <Box display="flex" alignItems="center" gap={1} mt={1}>
                                                                        <CircularProgress size={14} />
                                                                        <Typography variant="caption" color="text.secondary">
                                                                            Sanatçı eşleşmeleri kontrol ediliyor...
                                                                        </Typography>
                                                                    </Box>
                                                                ) : artistMatchResults.some(r => r.hasMatches) ? (
                                                                    <Box mt={1}>
                                                                        <Button
                                                                            size="small"
                                                                            variant="outlined"
                                                                            color="primary"
                                                                            startIcon={<GroupIcon />}
                                                                            onClick={() => setShowArtistMatchDialog(true)}
                                                                            sx={{ textTransform: 'none' }}
                                                                        >
                                                                            Eşleşme bulundu - Sanatçı seç
                                                                        </Button>
                                                                    </Box>
                                                                ) : (
                                                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                                                        {artistMatchResults.length > 0 ? 'Yeni sanatçı oluşturulacak' : 'Sanatçı sistemde yoksa otomatik oluşturulacak'}
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                        </Box>
                                                    </Paper>
                                                </Box>
                                            )}
                                        </Box>

                                        {/* ⭐ LABEL SEÇİMİ */}
                                        <Box>
                                            <Autocomplete
                                                freeSolo
                                                options={labelOptions}
                                                value={selectedLabel}
                                                onChange={(event, newValue) => {
                                                    if (typeof newValue === 'string') {
                                                        setSelectedLabel(null);
                                                        setLabelSearch(newValue);
                                                    } else {
                                                        setSelectedLabel(newValue);
                                                        setLabelSearch(newValue?.name || '');
                                                    }
                                                }}
                                                onInputChange={(event, newInputValue, reason) => {
                                                    if (reason === 'input') {
                                                        setLabelSearch(newInputValue);
                                                        if (selectedLabel && selectedLabel.name !== newInputValue) {
                                                            setSelectedLabel(null);
                                                        }
                                                    }
                                                }}
                                                inputValue={labelSearch}
                                                getOptionLabel={(option) => {
                                                    if (typeof option === 'string') return option;
                                                    return option.name || '';
                                                }}
                                                isOptionEqualToValue={(option, val) => option._id === val?._id}
                                                loading={labelsLoading}
                                                noOptionsText={labelSearch.length < 2 ? "En az 2 karakter yazın" : "Label bulunamadı - yeni oluşturulacak"}
                                                renderOption={(props, option) => (
                                                    <li {...props} key={option._id}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <LabelIcon sx={{ color: '#FF6B00' }} />
                                                            <Typography variant="body2">{option.name}</Typography>
                                                        </Box>
                                                    </li>
                                                )}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Label (İsteğe bağlı)"
                                                        placeholder="Label adı yazın..."
                                                        InputProps={{
                                                            ...params.InputProps,
                                                            startAdornment: (
                                                                <InputAdornment position="start">
                                                                    <LabelIcon sx={{ color: '#FF6B00' }} />
                                                                </InputAdornment>
                                                            ),
                                                            endAdornment: (
                                                                <>
                                                                    {labelsLoading ? <CircularProgress size={20} /> : null}
                                                                    {params.InputProps.endAdornment}
                                                                </>
                                                            )
                                                        }}
                                                    />
                                                )}
                                            />
                                            {labelSearch && !selectedLabel && (
                                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                                    "{labelSearch}" bulunamazsa yeni label oluşturulacak
                                                </Typography>
                                            )}
                                            {selectedLabel && (
                                                <Chip
                                                    icon={<LabelIcon />}
                                                    label={selectedLabel.name}
                                                    onDelete={() => {
                                                        setSelectedLabel(null);
                                                        setLabelSearch('');
                                                    }}
                                                    sx={{ mt: 1, bgcolor: '#FFF3E0', color: '#FF6B00' }}
                                                />
                                            )}
                                        </Box>

                                        <FormControl fullWidth>
                                            <InputLabel>Tür</InputLabel>
                                            <Select
                                                name="genre"
                                                value={musicForm.genre}
                                                label="Tür"
                                                onChange={handleInputChange}
                                                required
                                                disabled={genresLoading}
                                            >
                                                {genresLoading ? (
                                                    <MenuItem disabled>
                                                        <CircularProgress size={16} sx={{ mr: 1 }} /> Yükleniyor...
                                                    </MenuItem>
                                                ) : (
                                                    genres.map(genre => (
                                                        <MenuItem key={genre.slug} value={genre.slug}>
                                                            {genre.displayName}
                                                        </MenuItem>
                                                    ))
                                                )}
                                            </Select>
                                        </FormControl>

                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={musicForm.isFeatured}
                                                    onChange={(e) => setMusicForm({ ...musicForm, isFeatured: e.target.checked })}
                                                    color="primary"
                                                />
                                            }
                                            label={
                                                <Box display="flex" alignItems="center">
                                                    <StarIcon sx={{ mr: 1, color: 'warning.main' }} />
                                                    Öne Çıkan Müzik
                                                </Box>
                                            }
                                        />
                                    </Stack>
                                )}

                                {/* Tab 1: Platform Links */}
                                {activeTab === 1 && (
                                    <Stack spacing={3}>
                                        <Alert severity="info" icon={<LinkIcon />}>
                                            Spotify linki zorunludur. Diğer platform linkleri opsiyoneldir.
                                        </Alert>

                                        {Object.entries(platformConfig).map(([key, config]) => (
                                            <TextField
                                                key={key}
                                                fullWidth
                                                label={key === 'spotify' ? `${config.label} (Zorunlu)` : config.label}
                                                value={musicForm.platformLinks[key]}
                                                onChange={(e) => handlePlatformLinkChange(key, e.target.value)}
                                                placeholder={config.placeholder}
                                                disabled={key === 'spotify' && spotifyFetched}
                                                required={key === 'spotify'}
                                                InputProps={{
                                                    startAdornment: <Box sx={{ mr: 1, color: config.color }}>{config.icon}</Box>,
                                                    endAdornment: key === 'spotify' && spotifyFetched && (
                                                        <InputAdornment position="end">
                                                            <Tooltip title="Spotify'dan otomatik alındı">
                                                                <CheckIcon sx={{ color: '#1DB954' }} />
                                                            </Tooltip>
                                                        </InputAdornment>
                                                    )
                                                }}
                                                sx={key === 'spotify' ? {
                                                    '& .MuiOutlinedInput-root': {
                                                        '& fieldset': { borderColor: '#1DB954' },
                                                        '&:hover fieldset': { borderColor: '#1DB954' },
                                                    }
                                                } : {}}
                                            />
                                        ))}

                                        <Paper sx={{ p: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider' }}>
                                            <Typography variant="subtitle2" gutterBottom fontWeight="bold">Platform Durumu:</Typography>
                                            <Stack spacing={1}>
                                                {Object.entries(platformConfig).map(([key, config]) => (
                                                    <Box key={key} display="flex" alignItems="center" justifyContent="space-between">
                                                        <Box display="flex" alignItems="center" gap={1}>
                                                            <Box sx={{ color: config.color }}>{config.icon}</Box>
                                                            <Typography variant="body2">{config.label}</Typography>
                                                        </Box>
                                                        {musicForm.platformLinks[key] ? (
                                                            <Chip icon={<CheckIcon />} label="Eklendi" size="small" color="success" />
                                                        ) : (
                                                            <Chip label="Boş" size="small" variant="outlined" />
                                                        )}
                                                    </Box>
                                                ))}
                                            </Stack>
                                            <Divider sx={{ my: 2 }} />
                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                <Typography variant="caption" color="text.secondary">Toplam Platform:</Typography>
                                                <Chip label={`${getPlatformCount(musicForm.platformLinks)} / 5`} size="small"
                                                      color={getPlatformCount(musicForm.platformLinks) > 0 ? 'primary' : 'default'} />
                                            </Box>
                                        </Paper>
                                    </Stack>
                                )}

                                {/* Tab 2: Image */}
                                {activeTab === 2 && (
                                    <Stack spacing={3}>
                                        {/* ⭐ Spotify'dan gelen görsel */}
                                        {spotifyFetched && imagePreview && (
                                            <Paper
                                                sx={{
                                                    p: 2,
                                                    bgcolor: 'rgba(29, 185, 84, 0.1)',
                                                    border: '2px solid #1DB954',
                                                    borderRadius: 2
                                                }}
                                            >
                                                <Box display="flex" alignItems="center" gap={1} mb={2}>
                                                    <SpotifyIcon sx={{ color: '#1DB954' }} />
                                                    <Typography variant="subtitle1" fontWeight="bold" color="#1DB954">
                                                        Spotify'dan Alınan Kapak Resmi
                                                    </Typography>
                                                    <CheckIcon sx={{ color: '#1DB954' }} />
                                                </Box>
                                                <Box display="flex" justifyContent="center">
                                                    <Box
                                                        component="img"
                                                        src={imagePreview}
                                                        sx={{
                                                            width: 200,
                                                            height: 200,
                                                            objectFit: 'cover',
                                                            borderRadius: 2,
                                                            border: '3px solid #1DB954'
                                                        }}
                                                    />
                                                </Box>
                                                <Typography variant="caption" color="text.secondary" textAlign="center" display="block" mt={1}>
                                                    Bu görsel Spotify'dan otomatik alındı
                                                </Typography>
                                            </Paper>
                                        )}

                                        {/* Manuel görsel yükleme - Spotify'dan gelmemişse göster */}
                                        {!spotifyFetched && (
                                            <>
                                                <DragDropImageUpload
                                                    preview={imagePreview} isDragging={isDragging} uploadProgress={uploadProgress}
                                                    onDragEnter={handleDragEnter} onDragLeave={handleDragLeave}
                                                    onDragOver={handleDragOver} onDrop={handleDrop}
                                                    onFileSelect={handleImageChange} onRemove={handleRemoveImage}
                                                    inputId="image-upload"
                                                />

                                                <Divider>VEYA</Divider>

                                                <TextField
                                                    fullWidth label="Görsel URL" name="imageUrl"
                                                    value={musicForm.imageUrl} onChange={handleInputChange}
                                                    placeholder="https://example.com/image.jpg"
                                                    helperText="Harici bir görsel linki girebilirsiniz"
                                                    disabled={!!imagePreview}
                                                />
                                            </>
                                        )}

                                        {imageFile && (
                                            <Alert severity="info" icon={<CheckIcon />}>
                                                <Typography variant="body2"><strong>{imageFile.name}</strong></Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Boyut: {(imageFile.size / 1024).toFixed(2)} KB
                                                </Typography>
                                            </Alert>
                                        )}
                                    </Stack>
                                )}

                                {/* Submit Button */}
                                <Box sx={{ mt: 4 }}>
                                    <Button
                                        type="submit" variant="contained" size="large" fullWidth
                                        disabled={submitLoading}
                                        startIcon={submitLoading ? <CircularProgress size={20} /> : <AddIcon />}
                                        sx={{ py: 1.5, bgcolor: '#7C3AED', '&:hover': { bgcolor: '#6D28D9' } }}
                                    >
                                        {submitLoading ? 'Ekleniyor...' : 'Müzik Ekle'}
                                    </Button>

                                    {activeTab < 2 && (
                                        <Button fullWidth variant="outlined" onClick={() => setActiveTab(activeTab + 1)} sx={{ mt: 2 }}>
                                            Sonraki Adım
                                        </Button>
                                    )}
                                </Box>
                            </form>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Music List */}
                <Grid item xs={12} lg={7}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                                <Typography variant="h6" fontWeight="bold">Müzik Listesi ({filteredMusic.length})</Typography>
                                <Button size="small" onClick={fetchMusic} startIcon={<SearchIcon />} color="inherit">Yenile</Button>
                            </Box>

                            <Grid container spacing={2} mb={3}>
                                <Grid item xs={12} sm={8}>
                                    <TextField
                                        fullWidth size="small" placeholder="Şarkı veya sanatçı ara..."
                                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                        InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Tür</InputLabel>
                                        <Select value={filterGenre} label="Tür" onChange={(e) => setFilterGenre(e.target.value)}>
                                            <MenuItem value="all">Tüm Türler</MenuItem>
                                            {genres.map(genre => (
                                                <MenuItem key={genre.slug} value={genre.slug}>
                                                    {genre.displayName}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>

                            {loading ? (
                                <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
                            ) : (
                                <List sx={{ maxHeight: 600, overflow: 'auto' }}>
                                    {filteredMusic.map((music, index) => (
                                        <ListItem key={music._id} divider={index < filteredMusic.length - 1}>
                                            {music.imageUrl && (
                                                <Avatar src={music.imageUrl} variant="rounded" sx={{ width: 60, height: 60, mr: 2 }} />
                                            )}

                                            <ListItemText
                                                primary={
                                                    <Box component="span" display="flex" alignItems="center" gap={1} flexWrap="wrap">
                                                        <Typography component="span" variant="subtitle1" fontWeight="bold">{music.title}</Typography>
                                                        <Chip
                                                            label={getGenreDisplayName(music.genre)}
                                                            size="small"
                                                            sx={{ bgcolor: '#7C3AED', color: 'white', fontWeight: 'bold' }}
                                                        />
                                                        {music.isFeatured && (
                                                            <Tooltip title="Öne Çıkan">
                                                                <StarIcon sx={{ color: 'warning.main', fontSize: 20 }} />
                                                            </Tooltip>
                                                        )}
                                                        {music.artists && music.artists.length > 1 && (
                                                            <Tooltip title={`${music.artists.length} Artist`}>
                                                                <Badge badgeContent={music.artists.length} color="secondary">
                                                                    <GroupIcon sx={{ fontSize: 18, color: '#7C3AED' }} />
                                                                </Badge>
                                                            </Tooltip>
                                                        )}
                                                        <Chip label={`${getPlatformCount(music.platformLinks)}/5`} size="small" color="primary" variant="outlined" />
                                                        {music.labelId && (
                                                            <Chip
                                                                icon={<LabelIcon sx={{ fontSize: 14 }} />}
                                                                label={typeof music.labelId === 'object' ? music.labelId.name : 'Label'}
                                                                size="small"
                                                                sx={{ bgcolor: '#FF6B00', color: 'white' }}
                                                            />
                                                        )}
                                                    </Box>
                                                }
                                                secondaryTypographyProps={{ component: 'div' }}
                                                secondary={
                                                    <Box>
                                                        <Box display="flex" alignItems="center" gap={0.5}>
                                                            <ArtistIcon sx={{ fontSize: 14, color: '#7C3AED' }} />
                                                            <Typography component="span" variant="body2" color="text.secondary">
                                                                {getDisplayArtist(music)}
                                                            </Typography>
                                                        </Box>
                                                        <Stack direction="row" spacing={2} mt={0.5}>
                                                            <Typography component="span" variant="caption" color="text.secondary" display="flex" alignItems="center">
                                                                <LikesIcon sx={{ fontSize: 14, mr: 0.5 }} />{music.likes || 0}
                                                            </Typography>
                                                            <Typography component="span" variant="caption" color="text.secondary" display="flex" alignItems="center">
                                                                <ViewsIcon sx={{ fontSize: 14, mr: 0.5 }} />{music.views || 0}
                                                            </Typography>
                                                        </Stack>
                                                        <Stack direction="row" spacing={0.5} mt={1}>
                                                            {music.platformLinks?.spotify && (
                                                                <Tooltip title="Spotify">
                                                                    <IconButton size="small" href={music.platformLinks.spotify} target="_blank" sx={{ color: '#1DB954' }}>
                                                                        <SpotifyIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            )}
                                                            {music.platformLinks?.appleMusic && (
                                                                <Tooltip title="Apple Music">
                                                                    <IconButton size="small" href={music.platformLinks.appleMusic} target="_blank" sx={{ color: '#000' }}>
                                                                        <AppleIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            )}
                                                            {music.platformLinks?.youtubeMusic && (
                                                                <Tooltip title="YouTube Music">
                                                                    <IconButton size="small" href={music.platformLinks.youtubeMusic} target="_blank" sx={{ color: '#FF0000' }}>
                                                                        <YouTubeIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            )}
                                                            {music.platformLinks?.beatport && (
                                                                <Tooltip title="Beatport">
                                                                    <IconButton size="small" href={music.platformLinks.beatport} target="_blank" sx={{ color: '#01FF95' }}>
                                                                        <MusicIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            )}
                                                            {music.platformLinks?.soundcloud && (
                                                                <Tooltip title="SoundCloud">
                                                                    <IconButton size="small" href={music.platformLinks.soundcloud} target="_blank" sx={{ color: '#FF8800' }}>
                                                                        <MusicIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            )}
                                                        </Stack>
                                                    </Box>
                                                }
                                            />
                                            <ListItemSecondaryAction>
                                                <Stack direction="row" spacing={1}>
                                                    <IconButton size="small" onClick={() => handleEdit(music)} color="primary">
                                                        <EditIcon />
                                                    </IconButton>
                                                    <IconButton size="small" onClick={() => handleDelete(music._id)} color="error">
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Stack>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    ))}
                                </List>
                            )}

                            {filteredMusic.length === 0 && !loading && (
                                <Box textAlign="center" py={4}>
                                    <MusicIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                                    <Typography variant="h6" color="text.secondary">
                                        {searchTerm || filterGenre !== 'all' ? 'Eşleşen müzik bulunamadı' : 'Henüz müzik eklenmemiş'}
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Edit Dialog */}
            <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ bgcolor: '#7C3AED', color: '#fff' }}>
                    <Box display="flex" alignItems="center" gap={1}><EditIcon />Müzik Düzenle</Box>
                </DialogTitle>
                <DialogContent>
                    {editingMusic && (
                        <Stack spacing={3} sx={{ mt: 2 }}>
                            <Box>
                                <Typography variant="subtitle2" gutterBottom fontWeight="bold">Şarkı Görseli</Typography>
                                <DragDropImageUpload
                                    preview={editImagePreview} isDragging={isEditDragging} uploadProgress={editUploadProgress}
                                    onDragEnter={handleEditDragEnter} onDragLeave={handleEditDragLeave}
                                    onDragOver={handleEditDragOver} onDrop={handleEditDrop}
                                    onFileSelect={handleEditImageChange} onRemove={handleRemoveEditImage}
                                    inputId="edit-image-upload"
                                />
                                {!editImagePreview && (
                                    <TextField
                                        fullWidth label="Görsel URL" value={editingMusic.imageUrl || ''}
                                        onChange={(e) => setEditingMusic({ ...editingMusic, imageUrl: e.target.value })}
                                        placeholder="https://example.com/image.jpg" sx={{ mt: 2 }}
                                    />
                                )}
                            </Box>

                            <Divider />

                            <TextField fullWidth label="Şarkı Adı" value={editingMusic.title || ''}
                                       onChange={(e) => setEditingMusic({ ...editingMusic, title: e.target.value })} />

                            <Box>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Artistler * (Birden fazla seçebilirsiniz)
                                </Typography>
                                <ArtistSelectComponent
                                    value={editingMusic.artists || []}
                                    onChange={handleEditArtistSelect}
                                    onRemove={handleRemoveEditArtist}
                                    options={editArtistOptions}
                                    loading={artistsLoading}
                                    onInputChange={setEditArtistSearch}
                                    inputValue={editArtistSearch}
                                    placeholder="Artist ara veya seç..."
                                    onCreateNew={() => setShowNewArtistDialog(true)}
                                />
                            </Box>

                            <FormControl fullWidth>
                                <InputLabel>Tür</InputLabel>
                                <Select
                                    value={editingMusic.genre || ''}
                                    label="Tür"
                                    onChange={(e) => setEditingMusic({ ...editingMusic, genre: e.target.value })}
                                >
                                    {genres.map(genre => (
                                        <MenuItem key={genre.slug} value={genre.slug}>
                                            {genre.displayName}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {/* Label (Plak Şirketi) */}
                            <Box>
                                <Autocomplete
                                    freeSolo
                                    options={editLabelOptions}
                                    value={editSelectedLabel}
                                    onChange={(event, newValue) => {
                                        if (typeof newValue === 'string') {
                                            setEditSelectedLabel(null);
                                            setEditLabelSearch(newValue);
                                        } else {
                                            setEditSelectedLabel(newValue);
                                            setEditLabelSearch(newValue?.name || '');
                                        }
                                    }}
                                    onInputChange={(event, newInputValue, reason) => {
                                        if (reason === 'input') {
                                            setEditLabelSearch(newInputValue);
                                            if (editSelectedLabel && editSelectedLabel.name !== newInputValue) {
                                                setEditSelectedLabel(null);
                                            }
                                        }
                                    }}
                                    inputValue={editLabelSearch}
                                    getOptionLabel={(option) => {
                                        if (typeof option === 'string') return option;
                                        return option.name || '';
                                    }}
                                    isOptionEqualToValue={(option, val) => option._id === val?._id}
                                    loading={editLabelsLoading}
                                    noOptionsText={editLabelSearch.length < 2 ? "En az 2 karakter yazın" : "Label bulunamadı - yeni oluşturulacak"}
                                    renderOption={(props, option) => (
                                        <li {...props} key={option._id}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <LabelIcon sx={{ color: '#FF6B00' }} />
                                                <Typography variant="body2">{option.name}</Typography>
                                            </Box>
                                        </li>
                                    )}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Label (İsteğe bağlı)"
                                            placeholder="Label adı yazın..."
                                            InputProps={{
                                                ...params.InputProps,
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <LabelIcon sx={{ color: '#FF6B00' }} />
                                                    </InputAdornment>
                                                )
                                            }}
                                        />
                                    )}
                                />
                            </Box>

                            <Divider>Platform Linkleri</Divider>

                            {Object.entries(platformConfig).map(([key, config]) => (
                                <TextField
                                    key={key} fullWidth label={config.label}
                                    value={editingMusic.platformLinks?.[key] || ''}
                                    onChange={(e) => setEditingMusic({
                                        ...editingMusic,
                                        platformLinks: { ...editingMusic.platformLinks, [key]: e.target.value }
                                    })}
                                    InputProps={{ startAdornment: <Box sx={{ mr: 1, color: config.color }}>{config.icon}</Box> }}
                                />
                            ))}

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={editingMusic.isFeatured || false}
                                        onChange={(e) => setEditingMusic({ ...editingMusic, isFeatured: e.target.checked })}
                                    />
                                }
                                label={<Box display="flex" alignItems="center"><StarIcon sx={{ mr: 1, color: 'warning.main' }} />Öne Çıkan Müzik</Box>}
                            />
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setOpenEditDialog(false); setEditImagePreview(null); setEditImageFile(null); setEditArtistSearch(''); editImageDataRef.current = null; setEditLabelSearch(''); setEditSelectedLabel(null); setEditLabelOptions([]); }}>İptal</Button>
                    <Button
                        onClick={handleUpdateMusic} variant="contained" disabled={submitLoading}
                        startIcon={submitLoading ? <CircularProgress size={16} /> : <SaveIcon />}
                        sx={{ bgcolor: '#7C3AED', '&:hover': { bgcolor: '#6D28D9' } }}
                    >
                        {submitLoading ? 'Güncelleniyor...' : 'Güncelle'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* New Artist Dialog */}
            <Dialog open={showNewArtistDialog} onClose={() => setShowNewArtistDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ bgcolor: '#7C3AED', color: '#fff' }}>
                    <Box display="flex" alignItems="center" gap={1}><PersonAddIcon />Yeni Artist Oluştur</Box>
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Listede olmayan bir artist için hızlıca yeni profil oluşturun.
                    </Typography>
                    <TextField
                        fullWidth label="Artist Adı *" value={newArtistName}
                        onChange={(e) => setNewArtistName(e.target.value)}
                        placeholder="Örn: Tarkan" sx={{ mt: 2 }} autoFocus
                        onKeyPress={(e) => { if (e.key === 'Enter') handleCreateNewArtist(openEditDialog); }}
                    />
                    <Alert severity="info" sx={{ mt: 2 }}>
                        Oluşturulan artist otomatik olarak bu müziğe eklenecektir.
                    </Alert>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => { setShowNewArtistDialog(false); setNewArtistName(''); }}>İptal</Button>
                    <Button
                        variant="contained"
                        onClick={() => handleCreateNewArtist(openEditDialog)}
                        disabled={creatingArtist || !newArtistName.trim()}
                        startIcon={creatingArtist ? <CircularProgress size={16} /> : <CheckIcon />}
                        sx={{ bgcolor: '#7C3AED', '&:hover': { bgcolor: '#6D28D9' } }}
                    >
                        {creatingArtist ? 'Oluşturuluyor...' : 'Oluştur ve Ekle'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ⭐ Artist Match Dialog - Sanatci Eslestirme */}
            <Dialog open={showArtistMatchDialog} onClose={() => setShowArtistMatchDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ bgcolor: '#7C3AED', color: '#fff' }}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <GroupIcon />
                        Sanatçı Eşleştirme
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Alert severity="info" sx={{ mb: 3 }}>
                        Spotify'dan gelen sanatçı isimleri için mevcut eşleşmeler bulundu.
                        Her sanatçı için mevcut bir profil seçebilir veya yeni oluşturulmasını sağlayabilirsiniz.
                    </Alert>

                    {artistMatchLoading ? (
                        <Box display="flex" justifyContent="center" p={4}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Stack spacing={3}>
                            {artistMatchResults.map((result, index) => (
                                <Paper key={index} sx={{ p: 2, bgcolor: result.hasMatches ? 'rgba(124, 58, 237, 0.05)' : 'rgba(0,0,0,0.02)' }}>
                                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                        {result.searchName}
                                        {result.hasMatches && (
                                            <Chip
                                                label={`${result.matches.length} eşleşme`}
                                                size="small"
                                                color="primary"
                                                sx={{ ml: 1 }}
                                            />
                                        )}
                                    </Typography>

                                    {result.hasMatches ? (
                                        <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                                            <InputLabel>Sanatçı Seç</InputLabel>
                                            <Select
                                                value={artistSelections[result.searchName] || ''}
                                                label="Sanatçı Seç"
                                                onChange={(e) => {
                                                    handleArtistSelectionChange(result.searchName, e.target.value || null);
                                                }}
                                            >
                                                <MenuItem value="">
                                                    <em>🆕 Yeni Oluştur: "{result.suggestedSlug}"</em>
                                                </MenuItem>
                                                {result.matches.map((match) => (
                                                    <MenuItem key={match.id} value={match.id}>
                                                        <Box display="flex" alignItems="center" gap={1}>
                                                            {match.profileImage ? (
                                                                <Avatar src={match.profileImage} sx={{ width: 24, height: 24 }} />
                                                            ) : (
                                                                <Avatar sx={{ width: 24, height: 24, bgcolor: '#7C3AED' }}>
                                                                    {match.name?.charAt(0)}
                                                                </Avatar>
                                                            )}
                                                            <span>{match.displayName}</span>
                                                            {match.claimed && (
                                                                <CheckIcon sx={{ color: '#7C3AED', fontSize: 16 }} />
                                                            )}
                                                        </Box>
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                            Eşleşme bulunamadı. Yeni sanatçı oluşturulacak: <strong>{result.suggestedSlug}</strong>
                                        </Typography>
                                    )}
                                </Paper>
                            ))}
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setShowArtistMatchDialog(false)}>
                        İptal
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleArtistMatchConfirm}
                        startIcon={<CheckIcon />}
                        sx={{ bgcolor: '#7C3AED', '&:hover': { bgcolor: '#6D28D9' } }}
                    >
                        Seçimleri Onayla
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AddMusic;