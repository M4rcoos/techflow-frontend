import axios from 'axios';
import { cookieStorage } from './cookie-utils';

const API_URL = import.meta.env.VITE_BACKEND_URL;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export const setToken = (newToken: string | null) => {
  if (newToken) {
    cookieStorage.set(TOKEN_KEY, newToken, 7);
  } else {
    cookieStorage.remove(TOKEN_KEY);
  }
};

export const getToken = (): string | null => {
  return cookieStorage.get<string>(TOKEN_KEY);
};

export const setUser = (user: unknown) => {
  cookieStorage.set(USER_KEY, user as Record<string, unknown>, 7);
};

export const getUser = <T = unknown>(): T | null => {
  return cookieStorage.get<T>(USER_KEY);
};

export const clearAuth = () => {
  cookieStorage.remove(TOKEN_KEY);
  cookieStorage.remove(USER_KEY);
};

let token: string | null = getToken();

api.interceptors.request.use(
  (config) => {
    if (!token) {
      token = getToken();
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

interface RateLimitError {
  success: false;
  error: string;
  message: string;
  retryAfter: number;
}

const isRateLimitError = (error: unknown): error is { response: { data: RateLimitError } } => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response: unknown }).response === 'object' &&
    (error as { response: { data: unknown } }).response !== null &&
    'data' in (error as { response: { data: unknown } }).response &&
    typeof (error as { response: { data: RateLimitError } }).response?.data?.error === 'string' &&
    (error as { response: { data: RateLimitError } }).response?.data?.error === 'Too many requests'
  );
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRequest = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
    
    if (error.response?.status === 401 && !isAuthRequest) {
      clearAuth();
      window.location.href = '/login';
    }
    
    if (error.response?.status === 429) {
      const retryAfter = error.response?.headers?.['retry-after'];
      const retrySeconds = retryAfter 
        ? parseInt(retryAfter, 10) 
        : error.response?.data?.retryAfter || 60;
      
      console.warn(`Rate limit exceeded. Retry after ${retrySeconds} seconds.`);
    }
    
    return Promise.reject(error);
  }
);

export async function apiWithRetry<T>(
  request: () => Promise<T>,
  maxRetries = 2,
  baseDelayMs = 1000
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await request();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) break;
      
      if (isRateLimitError(error)) {
        const retryAfter = error.response.data.retryAfter;
        const delay = (retryAfter || 60) * 1000;
        console.log(`Rate limited. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        const retryAfter = error.response.headers?.['retry-after'];
        const delay = retryAfter ? parseInt(retryAfter, 10) * 1000 : baseDelayMs * Math.pow(2, attempt);
        console.log(`Rate limited. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError;
}
