import React, { useState, useEffect } from 'react';
import {
    Send,
    Bell,
    History,
    BarChart3,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    Users,
    TrendingUp,
    X,
    Settings,
    Image,
    Link,
    Volume2,
    Hash,
    Target
} from 'lucide-react';

const Notifications = () => {
    const [currentTab, setCurrentTab] = useState('stats');
    const [openSendDialog, setOpenSendDialog] = useState(false);
    const [openTokenDialog, setOpenTokenDialog] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ show: false, type: 'success', message: '' });
    const [tempToken, setTempToken] = useState('');

    // Bildirim formu state
    const [notificationForm, setNotificationForm] = useState({
        title: '',
        body: '',
        type: 'general',
        targetUsers: '',
        imageUrl: '',
        deepLink: '',
        data: '{}',
        sound: 'default',
        badge: 1
    });

    // Backend API ayarları - kendi URL'inizi buraya yazın
    const API_BASE = 'http://localhost:5000/api';

    // Debug için API URL'sini konsola yazdır
    console.log('API Base URL:', API_BASE);

    const getAuthToken = () => {
        // localStorage'dan token'ı al
        const token = localStorage.getItem('adminToken');
        console.log('LocalStorage admin token:', token ? `Token mevcut (${token.substring(0, 10)}...)` : 'Token bulunamadı');

        return token || '';
    };

    const apiCall = async (endpoint, method = 'GET', data = null) => {
        try {
            const token = getAuthToken();

            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            // Token varsa Authorization header'ına ekle
            if (token) {
                options.headers['Authorization'] = `Bearer ${token}`;
                console.log('Token kullanılıyor:', `${token.substring(0, 10)}...`);
            } else {
                console.log('Token yok, auth olmadan deneniyor...');
            }

            if (data) {
                options.body = JSON.stringify(data);
            }

            console.log(`API Call: ${method} ${API_BASE}${endpoint}`);
            console.log('Headers:', options.headers);

            const response = await fetch(`${API_BASE}${endpoint}`, options);
            const result = await response.json();

            if (!response.ok) {
                // Özel hata mesajları
                if (response.status === 401) {
                    throw new Error('Yetkilendirme gerekli. Admin token ayarlayın veya backend auth ayarlarını kontrol edin.');
                } else if (response.status === 403) {
                    throw new Error('Bu işlem için yetkiniz yok.');
                } else if (response.status === 404) {
                    throw new Error('API endpoint bulunamadı.');
                }
                throw new Error(result.message || `HTTP ${response.status} hatası`);
            }

            return result;
        } catch (error) {
            console.error('API Error Details:', error);
            throw error;
        }
    };

    const showAlert = (type, message) => {
        setAlert({ show: true, type, message });
        setTimeout(() => {
            setAlert({ show: false, type: '', message: '' });
        }, 5000);
    };

    const setAdminToken = () => {
        if (tempToken.trim()) {
            localStorage.setItem('adminToken', tempToken.trim());
            setOpenTokenDialog(false);
            setTempToken('');
            showAlert('success', 'Admin token başarıyla kaydedildi!');
        } else {
            showAlert('error', 'Geçerli bir token girin!');
        }
    };

    const removeAdminToken = () => {
        localStorage.removeItem('adminToken');
        showAlert('info', 'Admin token kaldırıldı.');
    };

    const sendNotification = async () => {
        setLoading(true);
        try {
            let parsedData = {};
            try {
                parsedData = JSON.parse(notificationForm.data);
            } catch {
                parsedData = {};
            }

            const targetUsersArray = notificationForm.targetUsers
                ? notificationForm.targetUsers.split(',').map(id => id.trim()).filter(id => id)
                : [];

            const payload = {
                ...notificationForm,
                data: parsedData,
                targetUsers: targetUsersArray,
                badge: parseInt(notificationForm.badge) || 1
            };

            const result = await apiCall('/notifications/send', 'POST', payload);

            showAlert('success', `Bildirim başarıyla gönderildi! Gönderilen: ${result.data.sentCount}, Başarısız: ${result.data.failedCount}`);

            setNotificationForm({
                title: '',
                body: '',
                type: 'general',
                targetUsers: '',
                imageUrl: '',
                deepLink: '',
                data: '{}',
                sound: 'default',
                badge: 1
            });

            setOpenSendDialog(false);

        } catch (error) {
            // 401 hatası alırsa token ayarlama öner
            if (error.message.includes('Yetkilendirme gerekli')) {
                showAlert('error', `${error.message} Token ayarlama dialogunu açmak için tıklayın.`);
                setOpenTokenDialog(true);
            } else {
                showAlert('error', error.message || 'Bildirim gönderilemedi');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchNotificationHistory = async () => {
        setLoading(true);
        try {
            const result = await apiCall('/notifications/history?page=1&limit=20');
            setNotifications(result.data.notifications || []);
        } catch (error) {
            if (error.message.includes('Yetkilendirme gerekli')) {
                showAlert('error', 'Bildirim geçmişi için yetkilendirme gerekli. Token ayarlayın.');
                setOpenTokenDialog(true);
            } else {
                showAlert('error', 'Bildirim geçmişi alınamadı');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        setLoading(true);
        try {
            const result = await apiCall('/notifications/stats');
            setStats(result.data || {});
        } catch (error) {
            if (error.message.includes('Yetkilendirme gerekli')) {
                showAlert('error', 'İstatistikler için yetkilendirme gerekli. Token ayarlayın.');
                setOpenTokenDialog(true);
            } else {
                showAlert('error', 'İstatistikler alınamadı');
            }
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            sent: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Gönderildi' },
            failed: { icon: XCircle, color: 'bg-red-100 text-red-800', label: 'Başarısız' },
            partial: { icon: AlertCircle, color: 'bg-yellow-100 text-yellow-800', label: 'Kısmi' },
            pending: { icon: Clock, color: 'bg-blue-100 text-blue-800', label: 'Bekliyor' }
        };

        const config = statusConfig[status] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                <Icon className="w-3 h-3 mr-1" />
                {config.label}
            </span>
        );
    };

    const getTypeBadge = (type) => {
        const typeColors = {
            general: 'bg-gray-100 text-gray-800',
            music: 'bg-blue-100 text-blue-800',
            playlist: 'bg-purple-100 text-purple-800',
            user: 'bg-indigo-100 text-indigo-800',
            promotion: 'bg-yellow-100 text-yellow-800'
        };

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColors[type] || typeColors.general}`}>
                {type.toUpperCase()}
            </span>
        );
    };

    useEffect(() => {
        if (currentTab === 'stats') {
            fetchStats();
        } else if (currentTab === 'history') {
            fetchNotificationHistory();
        }
    }, [currentTab]);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4">
                        <Bell className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Bildirim Yönetimi</h1>
                        <p className="text-gray-600 mt-1">Kullanıcılara push bildirim gönder ve geçmişi görüntüle</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${localStorage.getItem('adminToken') ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                        <span className="text-sm text-gray-600">
                            Auth: {localStorage.getItem('adminToken') ? 'Token' : 'Açık'}
                        </span>
                    </div>
                    <button
                        onClick={() => setOpenTokenDialog(true)}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                    >
                        {localStorage.getItem('adminToken') ? 'Token Değiştir' : 'Token Ekle'}
                    </button>
                    <button
                        onClick={() => setOpenSendDialog(true)}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg flex items-center hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg"
                    >
                        <Send className="w-5 h-5 mr-2" />
                        Bildirim Gönder
                    </button>
                </div>
            </div>

            {/* Alert */}
            {alert.show && (
                <div className={`mb-6 p-4 rounded-lg border ${
                    alert.type === 'success'
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : alert.type === 'info'
                            ? 'bg-blue-50 border-blue-200 text-blue-800'
                            : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                    <div className="flex">
                        <div className="flex-shrink-0">
                            {alert.type === 'success' ? (
                                <CheckCircle className="h-5 w-5" />
                            ) : alert.type === 'info' ? (
                                <Bell className="h-5 w-5" />
                            ) : (
                                <XCircle className="h-5 w-5" />
                            )}
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium">{alert.message}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        <button
                            onClick={() => setCurrentTab('stats')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center ${
                                currentTab === 'stats'
                                    ? 'border-purple-500 text-purple-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <BarChart3 className="w-5 h-5 mr-2" />
                            İstatistikler
                        </button>
                        <button
                            onClick={() => setCurrentTab('history')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center ${
                                currentTab === 'history'
                                    ? 'border-purple-500 text-purple-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <History className="w-5 h-5 mr-2" />
                            Geçmiş
                        </button>
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {/* İstatistikler Tab */}
                    {currentTab === 'stats' && (
                        <div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                {/* Toplam Gönderilen */}
                                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-blue-100 text-sm font-medium">Toplam Gönderilen</p>
                                            <p className="text-3xl font-bold mt-2">{stats.totalSent || 0}</p>
                                        </div>
                                        <Send className="w-8 h-8 text-blue-200" />
                                    </div>
                                </div>

                                {/* Başarılı */}
                                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-green-100 text-sm font-medium">Başarılı</p>
                                            <p className="text-3xl font-bold mt-2">{stats.totalSuccess || 0}</p>
                                        </div>
                                        <CheckCircle className="w-8 h-8 text-green-200" />
                                    </div>
                                </div>

                                {/* Başarısız */}
                                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-red-100 text-sm font-medium">Başarısız</p>
                                            <p className="text-3xl font-bold mt-2">{stats.totalFailed || 0}</p>
                                        </div>
                                        <XCircle className="w-8 h-8 text-red-200" />
                                    </div>
                                </div>

                                {/* Aktif Cihazlar */}
                                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-orange-100 text-sm font-medium">Aktif Cihazlar</p>
                                            <p className="text-3xl font-bold mt-2">{stats.activeDevices || 0}</p>
                                        </div>
                                        <Users className="w-8 h-8 text-orange-200" />
                                    </div>
                                </div>
                            </div>

                            {/* Başarı Oranı */}
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <div className="flex items-center mb-4">
                                    <TrendingUp className="w-6 h-6 text-green-500 mr-3" />
                                    <h3 className="text-lg font-semibold text-gray-900">Başarı Oranı</h3>
                                </div>
                                <div className="flex items-baseline">
                                    <span className="text-4xl font-bold text-green-500">
                                        {stats.totalSent > 0
                                            ? Math.round((stats.totalSuccess / stats.totalSent) * 100)
                                            : 0}%
                                    </span>
                                    <span className="ml-2 text-gray-600">Son gönderilen bildirimlerin başarı oranı</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Geçmiş Tab */}
                    {currentTab === 'history' && (
                        <div>
                            {loading ? (
                                <div className="flex justify-center items-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                                    <span className="ml-3 text-gray-600">Yükleniyor...</span>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-white">
                                        <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Bildirim
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Tür
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Durum
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                İstatistikler
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Tarih
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                        {notifications.map((notification) => (
                                            <tr key={notification._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {notification.title}
                                                        </div>
                                                        <div className="text-sm text-gray-500 max-w-xs truncate">
                                                            {notification.body}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getTypeBadge(notification.type)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getStatusBadge(notification.status)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <div className="text-sm text-gray-900">
                                                            Gönderilen: <span className="font-medium">{notification.sentCount || 0}</span>
                                                        </div>
                                                        <div className="text-sm text-gray-900">
                                                            Başarısız: <span className="font-medium">{notification.failedCount || 0}</span>
                                                        </div>
                                                        <div className="text-sm text-purple-600">
                                                            Başarı: <span className="font-medium">%{notification.successRate || 0}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {new Date(notification.createdAt).toLocaleDateString('tr-TR', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>

                                    {notifications.length === 0 && (
                                        <div className="text-center py-12">
                                            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                Henüz Bildirim Gönderilmemiş
                                            </h3>
                                            <p className="text-gray-500">
                                                İlk bildirimi göndermek için yukarıdaki butonu kullanın
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Bildirim Gönder Modal */}
            {openSendDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div className="flex items-center">
                                <Send className="w-6 h-6 text-purple-500 mr-3" />
                                <h2 className="text-xl font-semibold text-gray-900">Yeni Bildirim Gönder</h2>
                            </div>
                            <button
                                onClick={() => setOpenSendDialog(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Başlık */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Başlık *
                                    </label>
                                    <input
                                        type="text"
                                        value={notificationForm.title}
                                        onChange={(event) => setNotificationForm(prev => ({ ...prev, title: event.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        placeholder="Bildirim başlığı"
                                        maxLength={100}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">{notificationForm.title.length}/100</p>
                                </div>

                                {/* Tür */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Bildirim Türü
                                    </label>
                                    <select
                                        value={notificationForm.type}
                                        onChange={(event) => setNotificationForm(prev => ({ ...prev, type: event.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    >
                                        <option value="general">Genel</option>
                                        <option value="music">Müzik</option>
                                        <option value="playlist">Playlist</option>
                                        <option value="user">Kullanıcı</option>
                                        <option value="promotion">Promosyon</option>
                                    </select>
                                </div>
                            </div>

                            {/* İçerik */}
                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    İçerik *
                                </label>
                                <textarea
                                    value={notificationForm.body}
                                    onChange={(event) => setNotificationForm(prev => ({ ...prev, body: event.target.value }))}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    placeholder="Bildirim içeriği"
                                    maxLength={500}
                                />
                                <p className="text-xs text-gray-500 mt-1">{notificationForm.body.length}/500</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                {/* Görsel URL */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                        <Image className="w-4 h-4 mr-1" />
                                        Görsel URL (Opsiyonel)
                                    </label>
                                    <input
                                        type="url"
                                        value={notificationForm.imageUrl}
                                        onChange={(event) => setNotificationForm(prev => ({ ...prev, imageUrl: event.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>

                                {/* Deep Link */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                        <Link className="w-4 h-4 mr-1" />
                                        Deep Link (Opsiyonel)
                                    </label>
                                    <input
                                        type="text"
                                        value={notificationForm.deepLink}
                                        onChange={(event) => setNotificationForm(prev => ({ ...prev, deepLink: event.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        placeholder="app://page/detail/123"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                {/* Ses */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                        <Volume2 className="w-4 h-4 mr-1" />
                                        Ses
                                    </label>
                                    <select
                                        value={notificationForm.sound}
                                        onChange={(event) => setNotificationForm(prev => ({ ...prev, sound: event.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    >
                                        <option value="default">Varsayılan</option>
                                        <option value="notification">Bildirim</option>
                                        <option value="alert">Uyarı</option>
                                    </select>
                                </div>

                                {/* Badge */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                        <Hash className="w-4 h-4 mr-1" />
                                        Badge Sayısı (iOS)
                                    </label>
                                    <input
                                        type="number"
                                        value={notificationForm.badge}
                                        onChange={(event) => setNotificationForm(prev => ({ ...prev, badge: event.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        min="1"
                                        max="99"
                                    />
                                </div>
                            </div>

                            {/* Hedef Kullanıcılar */}
                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                    <Target className="w-4 h-4 mr-1" />
                                    Hedef Kullanıcı ID'leri (Opsiyonel)
                                </label>
                                <input
                                    type="text"
                                    value={notificationForm.targetUsers}
                                    onChange={(event) => setNotificationForm(prev => ({ ...prev, targetUsers: event.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    placeholder="user1, user2, user3 (virgülle ayırın)"
                                />
                                <p className="text-xs text-gray-500 mt-1">Boş bırakılırsa tüm kullanıcılara gönderilir</p>
                            </div>

                            {/* Ekstra Data */}
                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                    <Settings className="w-4 h-4 mr-1" />
                                    Ekstra Data (JSON)
                                </label>
                                <textarea
                                    value={notificationForm.data}
                                    onChange={(event) => setNotificationForm(prev => ({ ...prev, data: event.target.value }))}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono text-sm"
                                    placeholder='{"key": "value", "page": "home"}'
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                            <button
                                onClick={() => setOpenSendDialog(false)}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={sendNotification}
                                disabled={loading || !notificationForm.title || !notificationForm.body}
                                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Gönderiliyor...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4 mr-2" />
                                        Gönder
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Token Ayarlama Modal */}
            {openTokenDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-md w-full">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div className="flex items-center">
                                <Settings className="w-6 h-6 text-purple-500 mr-3" />
                                <h2 className="text-xl font-semibold text-gray-900">Token Ayarları (Opsiyonel)</h2>
                            </div>
                            <button
                                onClick={() => setOpenTokenDialog(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Admin Authorization Token
                                </label>
                                <input
                                    type="password"
                                    value={tempToken}
                                    onChange={(event) => setTempToken(event.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    placeholder="Admin token'ınızı girin"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Token opsiyoneldir. Backend auth gerektiriyorsa ekleyin.
                                </p>
                            </div>

                            {/* Mevcut Token Durumu */}
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">
                                    <strong>Mevcut Token:</strong> {
                                    localStorage.getItem('adminToken')
                                        ? '✅ Ayarlanmış'
                                        : '❌ Ayarlanmamış'
                                }
                                </p>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-between p-6 border-t border-gray-200">
                            <button
                                onClick={removeAdminToken}
                                className="px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors text-sm"
                            >
                                Token'ı Kaldır
                            </button>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setOpenTokenDialog(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={setAdminToken}
                                    className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                                >
                                    Token'ı Kaydet
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notifications;