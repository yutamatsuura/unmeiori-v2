import axios, { type AxiosResponse } from 'axios';

// API ベースURL設定
const API_ENDPOINTS = {
  main: import.meta.env.VITE_API_URL || 'http://localhost:5004',
  kyusei: import.meta.env.VITE_KYUSEI_SERVICE_URL || 'http://localhost:5002',
  seimei: import.meta.env.VITE_SEIMEI_SERVICE_URL || 'http://localhost:5003'
};

// JWT Token 管理
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

const setAuthToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

const removeAuthToken = (): void => {
  localStorage.removeItem('auth_token');
};

// axios インスタンス作成
const createApiClient = (baseURL: string, requireAuth: boolean = false) => {
  const client = axios.create({
    baseURL,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // リクエストインターセプター（JWT認証）
  if (requireAuth) {
    client.interceptors.request.use(
      (config) => {
        const token = getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  // レスポンスインターセプター
  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error) => {
      console.error('API Error:', error);

      // 401エラーの場合、認証トークンを削除してログインページにリダイレクト
      if (error.response?.status === 401) {
        removeAuthToken();
        window.location.href = '/login';
      }

      return Promise.reject(error);
    }
  );

  return client;
};

// API クライアント
export const mainAPI = createApiClient(API_ENDPOINTS.main, true);
export const publicAPI = createApiClient(API_ENDPOINTS.main, false);
export const kyuseiAPI = createApiClient(API_ENDPOINTS.kyusei);
export const seimeiAPI = createApiClient(API_ENDPOINTS.seimei);

// 型定義
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  subscription_status: string;
}

export interface ClientInfo {
  surname: string;
  given_name: string;
  birth_date: string;
  birth_time?: string;
  gender: string;
  birth_place?: string;
  email: string;
}

export interface KanteiRequest {
  client_info: ClientInfo;
}

export interface KyuseiKigakuResponse {
  birth?: {
    date?: string;
    year?: {
      index?: number;
      name?: string;
      rubi?: string;
      gogyou?: string;
      houi?: string;
    };
    month?: {
      index?: number;
      name?: string;
      rubi?: string;
      gogyou?: string;
      houi?: string;
    };
  };
  current?: any;
}

export interface SeimeiHandanResponse {
  total: number;
  heaven: number;
  earth: number;
  personality: number;
  original_response?: any;
}

export interface KanteiResponse {
  id?: number;
  client_info?: any;
  kyusei_result?: KyuseiKigakuResponse;
  seimei_result?: SeimeiHandanResponse;
  combined_result?: any;
  pdf_generated?: boolean;
  pdf_path?: string | null;
  created_at?: string;
}

// Token管理エクスポート
export { getAuthToken, setAuthToken, removeAuthToken };

// API 関数
export const authAPI = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await publicAPI.post('/api/auth/login', data);
    const result = response.data;

    // JWTトークンを保存
    if (result.access_token) {
      setAuthToken(result.access_token);
    }

    return result;
  },

  logout: async (): Promise<void> => {
    removeAuthToken();
  },

  getCurrentUser: async () => {
    const response = await mainAPI.get('/api/auth/me');
    return response.data;
  },

  getUserTheme: async () => {
    const response = await mainAPI.get('/api/auth/theme');
    return response;
  },

  updateUserTheme: async (data: { theme_id: string }) => {
    const response = await mainAPI.put('/api/auth/theme', data);
    return response.data;
  },
};

export const kyuseiKigakuAPI = {
  calculate: async (data: KanteiRequest): Promise<KyuseiKigakuResponse> => {
    const response = await kyuseiAPI.post('/calculate', data);
    return response.data;
  },
};

export const seimeiHandanAPI = {
  calculate: async (data: any): Promise<any> => {
    const response = await seimeiAPI.post('/seimei/analyze', data);
    return response.data;
  },
};

export const kanteiAPI = {
  calculate: async (data: KanteiRequest): Promise<KanteiResponse> => {
    const response = await mainAPI.post('/api/kantei/calculate', data);
    return response.data;
  },

  generatePdf: async (kanteiId: string): Promise<Blob> => {
    // まずPDFを生成
    const generateResponse = await mainAPI.post(`/api/kantei/generate-pdf-legacy`, {
      kantei_id: parseInt(kanteiId)
    });

    if (!generateResponse.data.success) {
      throw new Error(generateResponse.data.message || 'PDF generation failed');
    }

    // 生成されたPDFをダウンロード
    const downloadResponse = await mainAPI.get(`/api/kantei/pdf/${kanteiId}`, {
      responseType: 'blob'
    });

    return downloadResponse.data;
  },

  getPdf: async (kanteiId: string): Promise<Blob> => {
    const response = await mainAPI.get(`/api/kantei/pdf/${kanteiId}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  getHistory: async (page: number = 1, limit: number = 10) => {
    const response = await mainAPI.get(`/api/kantei/history?page=${page}&limit=${limit}`);
    return response.data;
  },

  getById: async (kanteiId: string) => {
    const response = await mainAPI.get(`/api/kantei/${kanteiId}`);
    return response.data;
  },

  sendEmail: async (kanteiId: string, email: string): Promise<void> => {
    await mainAPI.post(`/api/kantei/send-email`, {
      kantei_id: kanteiId,
      email
    });
  },

  delete: async (kanteiId: string): Promise<void> => {
    await mainAPI.delete(`/api/kantei/${kanteiId}`);
  },

  generateWord: async (kanteiId: string): Promise<Blob> => {
    const response = await mainAPI.post(`/api/kantei/generate-word`, {
      kantei_id: parseInt(kanteiId)
    }, {
      responseType: 'blob'
    });
    return response.data;
  },
};

export const templateAPI = {
  getSettings: async () => {
    const response = await mainAPI.get('/api/template/settings');
    return response.data;
  },

  updateSettings: async (settings: any) => {
    const response = await mainAPI.put('/api/template/update', settings);
    return response.data;
  },

  uploadLogo: async (file: File) => {
    const formData = new FormData();
    formData.append('logo', file);

    const response = await mainAPI.post('/api/template/upload-logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default {
  auth: authAPI,
  kyusei: kyuseiKigakuAPI,
  seimei: seimeiHandanAPI,
  kantei: kanteiAPI,
  template: templateAPI,
};