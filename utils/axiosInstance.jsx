
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.3:5000/api';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        console.log('📤 Request:', config.method.toUpperCase(), config.url);
        return config;
    },
    (error) => {
        console.error('❌ Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        console.log('✅ Response:', response.status, response.config.url);
        return response;
    },
    (error) => {
        console.error('❌ Response error:', error);

        if (error.response) {
            const { status, data } = error.response;

            switch (status) {
                case 404:
                    console.error('404 Not Found:', data.message);
                    break;

                case 500:
                    console.error('500 Server Error:', data.message);
                    alert('Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.');
                    break;

                default:
                    console.error(`Error ${status}:`, data.message);
            }
        } else if (error.request) {
            console.error('No response received:', error.request);
            alert('Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin.');
        } else {
            console.error('Request setup error:', error.message);
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;