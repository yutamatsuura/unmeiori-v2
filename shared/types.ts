// 共通型定義
export interface ServiceResponse<T = any> {
  message: string;
  data?: T;
  error?: string;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  service: string;
  timestamp?: string;
}

export interface ServiceInfo {
  message: string;
  service: string;
  port: number;
}