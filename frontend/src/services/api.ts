import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // برای ارسال session cookie
  timeout: 10000,
});

// ----------------------------------------------
// احراز هویت
// ----------------------------------------------
export const authApi = {
  login: (username: string, password: string) => api.post('/auth.php', { username, password }),
  logout: () => api.delete('/auth.php'),
  check: () => api.get('/auth.php'),
};

// ----------------------------------------------
// مدیریت درخواست‌ها
// ----------------------------------------------
export const requestsApi = {
  // دریافت لیست همه درخواست‌ها
  getAll: () => api.get('/requests.php'),

  // ثبت درخواست جدید (مشتری)
  create: (data: {
    customer_name: string;
    customer_phone: string;
    customer_address: string;
    device_brand: string;
    device_model: string;
    device_issue: string;
    device_password?: string;
  }) => api.post('/requests.php', data),

  // به‌روزرسانی کامل یا جزئی یک درخواست (فقط مدیر)
  update: (id: number, data: {
    status?: string;
    final_price?: number;
    parts_used?: string;
  }) => api.put('/requests.php', { id, ...data }),

  // حذف درخواست (اختیاری)
  delete: (id: number) => api.delete(`/requests.php?id=${id}`),
};

// ----------------------------------------------
// پیگیری وضعیت (عمومی)
// ----------------------------------------------
export const trackingApi = {
  getByCode: (code: string) => api.get(`/tracking.php?code=${code}`),
};

// ----------------------------------------------
// آمار داشبورد
// ----------------------------------------------
export const statsApi = {
  get: () => api.get('/stats.php'),
};

// ----------------------------------------------
// (اختیاری) اینترسپتور برای مدیریت خطاها
// ----------------------------------------------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // خطای برگشتی از سرور
      console.error(`API Error ${error.response.status}:`, error.response.data);
    } else if (error.request) {
      // درخواست ارسال شده اما پاسخی دریافت نشد
      console.error('No response received:', error.request);
    } else {
      // خطای تنظیم درخواست
      console.error('Request error:', error.message);
    }
    return Promise.reject(error);
  }
);