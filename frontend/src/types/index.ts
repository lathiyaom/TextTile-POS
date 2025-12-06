export interface User {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    confirm_password: string;
}

export interface LoginResponse {
    token: string;
    user: User;
}

export interface CreateUserRequest {
    name: string;
    email: string;
    password: string;
}

export interface UpdateUserRequest {
    name?: string;
    email?: string;
    is_active?: boolean;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    error?: any;
}

export interface PaginatedResponse<T> {
    success: boolean;
    message: string;
    data: T[];
    pagination: {
        page: number;
        page_size: number;
        total_items: number;
        total_pages: number;
    };
}

// Export vendor types
export * from './vendor';
