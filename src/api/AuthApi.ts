import { api, setAuthTokens, clearAuthTokens } from './BaseApi';

export { setAuthTokens };


export interface LoginResponse {
  token_type: string;
  access_token: string;
  refresh_token: string;
}


export interface UserProfile {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await api.post<LoginResponse>('/auth/login', {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async (): Promise<void> => {
  clearAuthTokens();
};

export const registerUser = async (userData: RegisterRequest): Promise<void> => {
  try {
    await api.post('/users/', userData);
  } catch (error) {
    throw error;
  }
};

export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const response = await api.get<UserProfile>('/users/profile');
    return response.data;
  } catch (error) {
    throw error;
  }
};
