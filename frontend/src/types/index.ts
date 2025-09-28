// 基本的な型定義

export interface User {
  id: number;
  email: string;
  subscription_status: string;
  created_at: string;
  updated_at: string;
}

export interface ClientInfo {
  surname: string;
  givenName: string;
  birthDate: string;
  birthTime?: string;
  gender: 'male' | 'female';
  birthPlace?: string;
  email: string;
}

export interface KyuseiKigakuResult {
  honmei: string;
  gekkyu: string;
  nichikyu: string;
}

export interface SeimeiHandanResult {
  total: number;
  heaven: number;
  earth: number;
  personality: number;
}

export interface KanteiResult {
  id: string;
  client_info: ClientInfo;
  kyusei_kigaku: KyuseiKigakuResult;
  seimei_handan: SeimeiHandanResult;
  created_at: string;
  status: 'draft' | 'completed' | 'sent';
}

export interface FormErrors {
  [key: string]: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ストア用の型定義
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface KanteiState {
  currentKantei: KanteiResult | null;
  kanteiList: KanteiResult[];
  isCalculating: boolean;
  isSending: boolean;
  isGeneratingPdf: boolean;
}

export interface AppState {
  theme: 'light' | 'dark';
  notifications: boolean;
  autoSave: boolean;
}