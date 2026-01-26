import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

function getRawToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("auth_token") ||
    ""
  );
}

function normalizeToken(raw: string) {
  const t = (raw || "").trim();
  return t.replace(/^Bearer\s+/i, "");
}

export const api = axios.create({ baseURL });

// Request interceptor - إضافة التوكن للطلبات
api.interceptors.request.use(
  (config) => {
    const token = normalizeToken(getRawToken());
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - معالجة الأخطاء
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("API ERROR:", error?.response?.status, error?.response?.data);
    
    // في حالة 401 Unauthorized، نوجه المستخدم لصفحة تسجيل الدخول
    if (error?.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }
    
    return Promise.reject(error);
  }
);
