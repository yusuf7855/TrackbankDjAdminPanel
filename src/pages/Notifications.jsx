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
    Target,
    Smartphone,
    Apple
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

    // Backend API ayarları
    const API_BASE = 'http://192.168.1.3:5000/api';

    const getAuthToken = () => {
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
                if (response.status === 401) {
                    throw new Error('Yetkilendirme gerekli. Admin token ayarlayın.');
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
            const result = await apiCall('/notifications/admin/stats');
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

    useEffect(() => {
        if (currentTab === 'history') {
            fetchNotificationHistory();
        } else if (currentTab === 'stats') {
            fetchStats();
        }
    }, [currentTab]);

    const getStatusBadge = (status) => {
        const styles = {
            sent: 'bg-green-50 text-green-700 border border-green-200',
            failed: 'bg-red-50 text-red-700 border border-red-200',
            partial: 'bg-amber-50 text-amber-700 border border-amber-200',
            pending: 'bg-blue-50 text-blue-700 border border-blue-200'
        };

        const icons = {
            sent: <CheckCircle className="w-3 h-3" />,
            failed: <XCircle className="w-3 h-3" />,
            partial: <AlertCircle className="w-3 h-3" />,
            pending: <Clock className="w-3 h-3" />
        };

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
                {icons[status] || icons.pending}
                <span className="ml-1 capitalize">{status || 'pending'}</span>
            </span>
        );
    };

    const getTypeBadge = (type) => {
        const styles = {
            general: 'bg-blue-50 text-blue-700 border border-blue-200',
            promotion: 'bg-purple-50 text-purple-700 border border-purple-200',
            update: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
            warning: 'bg-orange-50 text-orange-700 border border-orange-200'
        };

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${styles[type] || styles.general}`}>
                {type || 'general'}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="bg-gradient-to-r from-purple-500 to-blue-600 p-3 rounded-xl">
                                    <Bell className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">
                                        Bildirim Yönetimi
                                    </h1>
                                    <p className="text-gray-600 mt-1">Push bildirimleri gönder ve yönet</p>
                                </div>
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setOpenTokenDialog(true)}
                                    className="flex items-center px-4 py-2.5 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-200 border border-gray-200"
                                >
                                    <Settings className="w-4 h-4 mr-2" />
                                    Token Ayarla
                                </button>
                                <button
                                    onClick={() => setOpenSendDialog(true)}
                                    className="flex items-center px-6 py-2.5 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg hover:from-purple-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    Bildirim Gönder
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alert */}
                {alert.show && (
                    <div className={`mb-6 p-4 rounded-xl border ${
                        alert.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
                            alert.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
                                'bg-blue-50 border-blue-200 text-blue-800'
                    } shadow-sm`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                {alert.type === 'success' && <CheckCircle className="w-5 h-5 mr-2" />}
                                {alert.type === 'error' && <XCircle className="w-5 h-5 mr-2" />}
                                {alert.type === 'info' && <AlertCircle className="w-5 h-5 mr-2" />}
                                <span className="font-medium">{alert.message}</span>
                            </div>
                            <button
                                onClick={() => setAlert({ show: false, type: '', message: '' })}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Tab Navigation */}
                <div className="mb-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1">
                        <nav className="flex space-x-1">
                            <button
                                onClick={() => setCurrentTab('stats')}
                                className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                                    currentTab === 'stats'
                                        ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-md'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                            >
                                <BarChart3 className="w-4 h-4 mr-2" />
                                İstatistikler
                            </button>
                            <button
                                onClick={() => setCurrentTab('history')}
                                className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                                    currentTab === 'history'
                                        ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-md'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                            >
                                <History className="w-4 h-4 mr-2" />
                                Geçmiş
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Stats Tab */}
                {currentTab === 'stats' && (
                    <div className="space-y-6">
                        {/* Main Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-center">
                                    <div className="bg-blue-50 p-3 rounded-lg">
                                        <Bell className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Toplam Bildirim</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.totalNotifications || 0}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-center">
                                    <div className="bg-green-50 p-3 rounded-lg">
                                        <Users className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Aktif Cihaz</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.totalActiveDevices || 0}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-center">
                                    <div className="bg-purple-50 p-3 rounded-lg">
                                        <TrendingUp className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Bugün Gönderilen</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.todayNotifications || 0}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-center">
                                    <div className="bg-emerald-50 p-3 rounded-lg">
                                        <CheckCircle className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Başarı Oranı</p>
                                        <p className="text-2xl font-bold text-gray-900">%95</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Platform Distribution */}
                        {stats.platformDistribution && stats.platformDistribution.length > 0 && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <Smartphone className="w-5 h-5 mr-2 text-blue-600" />
                                        Platform Dağılımı
                                    </h3>
                                    <div className="space-y-3">
                                        {stats.platformDistribution.map((platform) => (
                                            <div key={platform._id} className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    {platform._id === 'ios' ?
                                                        <Apple className="w-4 h-4 mr-2 text-gray-600" /> :
                                                        <Smartphone className="w-4 h-4 mr-2 text-gray-600" />
                                                    }
                                                    <span className="text-sm font-medium text-gray-700 capitalize">
                                                        {platform._id}
                                                    </span>
                                                </div>
                                                <span className="text-sm font-bold text-gray-900">
                                                    {platform.count}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
                                        Bildirim Türleri
                                    </h3>
                                    <div className="space-y-3">
                                        {stats.typeDistribution && stats.typeDistribution.map((type) => (
                                            <div key={type._id} className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-700 capitalize">
                                                    {type._id}
                                                </span>
                                                <span className="text-sm font-bold text-gray-900">
                                                    {type.count}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* History Tab */}
                {currentTab === 'history' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <History className="w-5 h-5 mr-2 text-purple-600" />
                                Bildirim Geçmişi
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
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
                                        İstatistik
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tarih
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {notifications.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center">
                                                <Bell className="w-12 h-12 text-gray-400 mb-4" />
                                                <p className="text-gray-500 font-medium">Henüz bildirim gönderilmemiş</p>
                                                <p className="text-sm text-gray-400">İlk bildiriminizi gönderin</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    notifications.map((notification) => (
                                        <tr key={notification._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 mb-1">
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
                                                        Gönderilen: <span className="font-medium text-green-600">{notification.sentCount || 0}</span>
                                                    </div>
                                                    <div className="text-sm text-gray-900">
                                                        Başarısız: <span className="font-medium text-red-600">{notification.failedCount || 0}</span>
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
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Send Notification Modal */}
                {openSendDialog && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
                                <div className="flex items-center">
                                    <div className="bg-gradient-to-r from-purple-500 to-blue-600 p-2 rounded-lg mr-3">
                                        <Send className="w-5 h-5 text-white" />
                                    </div>
                                    <h2 className="text-xl font-semibold text-gray-900">Yeni Bildirim Gönder</h2>
                                </div>
                                <button
                                    onClick={() => setOpenSendDialog(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Başlık */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Başlık *
                                        </label>
                                        <input
                                            type="text"
                                            value={notificationForm.title}
                                            onChange={(e) => setNotificationForm(prev => ({ ...prev, title: e.target.value }))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                            placeholder="Bildirim başlığı"
                                            maxLength={100}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">{notificationForm.title.length}/100</p>
                                    </div>

                                    {/* İçerik */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            İçerik *
                                        </label>
                                        <textarea
                                            value={notificationForm.body}
                                            onChange={(e) => setNotificationForm(prev => ({ ...prev, body: e.target.value }))}
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                            placeholder="Bildirim içeriği"
                                            maxLength={500}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">{notificationForm.body.length}/500</p>
                                    </div>

                                    {/* Tür */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Bildirim Türü
                                        </label>
                                        <select
                                            value={notificationForm.type}
                                            onChange={(e) => setNotificationForm(prev => ({ ...prev, type: e.target.value }))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                        >
                                            <option value="general">🔔 Genel</option>
                                            <option value="promotion">🎯 Promosyon</option>
                                            <option value="update">🔄 Güncelleme</option>
                                            <option value="warning">⚠️ Uyarı</option>
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
                                            onChange={(e) => setNotificationForm(prev => ({ ...prev, badge: e.target.value }))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                            min="1"
                                            max="99"
                                        />
                                    </div>

                                    {/* Görsel URL */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                            <Image className="w-4 h-4 mr-1" />
                                            Görsel URL (Opsiyonel)
                                        </label>
                                        <input
                                            type="url"
                                            value={notificationForm.imageUrl}
                                            onChange={(e) => setNotificationForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
                                            onChange={(e) => setNotificationForm(prev => ({ ...prev, deepLink: e.target.value }))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                            placeholder="app://page/detail"
                                        />
                                    </div>

                                    {/* Ses */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                            <Volume2 className="w-4 h-4 mr-1" />
                                            Bildirim Sesi
                                        </label>
                                        <select
                                            value={notificationForm.sound}
                                            onChange={(e) => setNotificationForm(prev => ({ ...prev, sound: e.target.value }))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                        >
                                            <option value="default">🔊 Varsayılan</option>
                                            <option value="notification">🔔 Bildirim</option>
                                            <option value="alert">⚠️ Uyarı</option>
                                        </select>
                                    </div>

                                    {/* Hedef Kullanıcılar */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                            <Target className="w-4 h-4 mr-1" />
                                            Hedef Kullanıcı ID'leri (Opsiyonel)
                                        </label>
                                        <input
                                            type="text"
                                            value={notificationForm.targetUsers}
                                            onChange={(e) => setNotificationForm(prev => ({ ...prev, targetUsers: e.target.value }))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                            placeholder="user1, user2, user3 (virgülle ayırın)"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Boş bırakılırsa tüm kullanıcılara gönderilir</p>
                                    </div>

                                    {/* Ekstra Data */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                            <Settings className="w-4 h-4 mr-1" />
                                            Ekstra Data (JSON)
                                        </label>
                                        <textarea
                                            value={notificationForm.data}
                                            onChange={(e) => setNotificationForm(prev => ({ ...prev, data: e.target.value }))}
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-mono text-sm"
                                            placeholder='{"key": "value", "page": "home"}'
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                                <button
                                    onClick={() => setOpenSendDialog(false)}
                                    className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={sendNotification}
                                    disabled={loading || !notificationForm.title || !notificationForm.body}
                                    className="px-8 py-2.5 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg hover:from-purple-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-md"
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

                {/* Token Setup Modal */}
                {openTokenDialog && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
                                <div className="flex items-center">
                                    <div className="bg-gradient-to-r from-gray-500 to-blue-600 p-2 rounded-lg mr-3">
                                        <Settings className="w-5 h-5 text-white" />
                                    </div>
                                    <h2 className="text-xl font-semibold text-gray-900">Admin Token Ayarla</h2>
                                </div>
                                <button
                                    onClick={() => setOpenTokenDialog(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6">
                                <p className="text-gray-600 mb-4">
                                    API istekleri için admin token'ınızı girin. Bu token localStorage'da saklanacak.
                                </p>
                                <input
                                    type="password"
                                    value={tempToken}
                                    onChange={(e) => setTempToken(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    placeholder="Admin token girin..."
                                />

                                {getAuthToken() && (
                                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <p className="text-sm text-green-700 flex items-center">
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Token mevcut: {getAuthToken().substring(0, 10)}...
                                        </p>
                                        <button
                                            onClick={removeAdminToken}
                                            className="mt-2 text-sm text-red-600 hover:text-red-800 flex items-center"
                                        >
                                            <X className="w-3 h-3 mr-1" />
                                            Token'ı Kaldır
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                                <button
                                    onClick={() => setOpenTokenDialog(false)}
                                    className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={setAdminToken}
                                    disabled={!tempToken.trim()}
                                    className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg hover:from-purple-600 hover:to-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                                >
                                    Kaydet
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;