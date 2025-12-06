import { apiClient } from './client';
import type {
    LoginRequest,
    RegisterRequest,
    LoginResponse,
    User,
    CreateUserRequest,
    UpdateUserRequest,
    ApiResponse,
    PaginatedResponse,
} from '@/types';

export const authApi = {
    register: async (data: RegisterRequest): Promise<User> => {
        const response = await apiClient.post<ApiResponse<User>>('/auth/register', data);
        return response.data.data!;
    },

    login: async (data: LoginRequest): Promise<LoginResponse> => {
        const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', data);
        return response.data.data!;
    },

    getProfile: async (): Promise<User> => {
        const response = await apiClient.get<ApiResponse<User>>('/auth/profile');
        return response.data.data!;
    },
};

export const userApi = {
    getAll: async (page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<User>> => {
        const response = await apiClient.get<PaginatedResponse<User>>('/users', {
            params: { page, page_size: pageSize },
        });
        return response.data;
    },

    getById: async (id: number): Promise<User> => {
        const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
        return response.data.data!;
    },

    create: async (data: CreateUserRequest): Promise<User> => {
        const response = await apiClient.post<ApiResponse<User>>('/users', data);
        return response.data.data!;
    },

    update: async (id: number, data: UpdateUserRequest): Promise<User> => {
        const response = await apiClient.put<ApiResponse<User>>(`/users/${id}`, data);
        return response.data.data!;
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/users/${id}`);
    },
};
