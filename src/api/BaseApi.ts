import axios from "axios";

export const api = axios.create({
    baseURL: "https://mxf2-backend.onrender.com/api/v1",
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
});

export const getAccessToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refreshToken');
};

export const getTokenType = (): string | null => {
  return localStorage.getItem('tokenType');
};

export const clearAuthTokens = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('tokenType');
  
  window.dispatchEvent(new CustomEvent('auth-tokens-cleared'));
};

export const setAuthTokens = (tokenData: {token_type: string; access_token: string; refresh_token: string}): void => {
  localStorage.setItem('accessToken', tokenData.access_token);
  localStorage.setItem('refreshToken', tokenData.refresh_token);
  localStorage.setItem('tokenType', tokenData.token_type);
};

export const refreshAccessToken = async (): Promise<{token_type: string; access_token: string}> => {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    clearAuthTokens();
    throw new Error('No refresh token available');
  }
  
  try {
    const response = await api.post<{token_type: string; access_token: string}>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    
    localStorage.setItem('accessToken', response.data.access_token);
    localStorage.setItem('tokenType', response.data.token_type);
    
    return response.data;
  } catch (error: any) {
    clearAuthTokens();
    throw error;
  }
};

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve(token);
        }
    });
    
    failedQueue = [];
};

api.interceptors.request.use(
    (config) => {
        const tokenType = getTokenType();
        const accessToken = getAccessToken();
        
        if (tokenType && accessToken) {
            config.headers.Authorization = `${tokenType} ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (originalRequest.url?.includes('/auth/refresh')) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => {
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                await refreshAccessToken();
                
                const tokenType = getTokenType();
                const accessToken = getAccessToken();
                
                if (tokenType && accessToken) {
                    originalRequest.headers.Authorization = `${tokenType} ${accessToken}`;
                }
                
                processQueue(null);
                
                return api(originalRequest);
                
            } catch (refreshError: any) {
                processQueue(refreshError, null);
                
                clearAuthTokens();
                
                if ((window as any).redirectToLogin) {
                    (window as any).redirectToLogin();
                } else {
                    window.location.href = '#/login';
                }
                
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);