import { apiClient } from './client';
import type {
    Bill,
    BillCreateRequest,
    BillUpdateRequest,
    BillChangeLog,
    PaymentType,
    PaymentTypeCreateRequest,
    PaymentTypeUpdateRequest,
    POSSettings,
    POSSettingsUpdateRequest,
    Note,
    NoteCreateRequest,
    NoteUpdateRequest,
    ApiResponse,
    PaginatedResponse,
} from '@/types';

export const posSettingsApi = {
    get: async (): Promise<POSSettings> => {
        const response = await apiClient.get<ApiResponse<POSSettings>>('/pos-settings');
        return response.data.data!;
    },

    update: async (data: POSSettingsUpdateRequest): Promise<POSSettings> => {
        const response = await apiClient.put<ApiResponse<POSSettings>>('/pos-settings', data);
        return response.data.data!;
    },
};

export const paymentTypeApi = {
    getAll: async (): Promise<PaymentType[]> => {
        const response = await apiClient.get<ApiResponse<PaymentType[]>>('/payment-types');
        return response.data.data!;
    },

    getById: async (id: number): Promise<PaymentType> => {
        const response = await apiClient.get<ApiResponse<PaymentType>>(`/payment-types/${id}`);
        return response.data.data!;
    },

    create: async (data: PaymentTypeCreateRequest): Promise<PaymentType> => {
        const response = await apiClient.post<ApiResponse<PaymentType>>('/payment-types', data);
        return response.data.data!;
    },

    update: async (id: number, data: Partial<PaymentTypeUpdateRequest>): Promise<PaymentType> => {
        const response = await apiClient.put<ApiResponse<PaymentType>>(`/payment-types/${id}`, data);
        return response.data.data!;
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/payment-types/${id}`);
    },
};

export const billApi = {
    getAll: async (
        page: number = 1,
        pageSize: number = 10,
        filters?: {
            vendor_id?: number;
            payment_status?: string;
            financial_year?: string;
            search?: string;
        }
    ): Promise<PaginatedResponse<Bill>> => {
        const params: any = { page, page_size: pageSize, ...filters };
        const response = await apiClient.get<PaginatedResponse<Bill>>('/bills', { params });
        return response.data;
    },

    getById: async (id: number): Promise<Bill> => {
        const response = await apiClient.get<ApiResponse<Bill>>(`/bills/${id}`);
        return response.data.data!;
    },

    create: async (data: BillCreateRequest): Promise<Bill> => {
        const response = await apiClient.post<ApiResponse<Bill>>('/bills', data);
        return response.data.data!;
    },

    update: async (id: number, data: BillUpdateRequest): Promise<Bill> => {
        const response = await apiClient.put<ApiResponse<Bill>>(`/bills/${id}`, data);
        return response.data.data!;
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/bills/${id}`);
    },

    cancel: async (id: number, reason: string): Promise<Bill> => {
        const response = await apiClient.post<ApiResponse<Bill>>(`/bills/${id}/cancel`, { reason });
        return response.data.data!;
    },

    recordPrint: async (id: number): Promise<Bill> => {
        const response = await apiClient.post<ApiResponse<Bill>>(`/bills/${id}/print`);
        return response.data.data!;
    },

    getChangeLog: async (id: number): Promise<BillChangeLog[]> => {
        const response = await apiClient.get<ApiResponse<BillChangeLog[]>>(`/bills/${id}/changelog`);
        return response.data.data!;
    },
};

export const noteApi = {
    getByEntity: async (entityType: 'VENDOR' | 'BILL', entityId: number): Promise<Note[]> => {
        const response = await apiClient.get<ApiResponse<Note[]>>(`/${entityType}/${entityId}/notes`);
        return response.data.data!;
    },

    create: async (entityType: 'VENDOR' | 'BILL', entityId: number, data: NoteCreateRequest): Promise<Note> => {
        const response = await apiClient.post<ApiResponse<Note>>(`/${entityType}/${entityId}/notes`, data);
        return response.data.data!;
    },

    update: async (entityType: 'VENDOR' | 'BILL', entityId: number, noteId: number, data: NoteUpdateRequest): Promise<Note> => {
        const response = await apiClient.put<ApiResponse<Note>>(`/${entityType}/${entityId}/notes/${noteId}`, data);
        return response.data.data!;
    },

    delete: async (entityType: 'VENDOR' | 'BILL', entityId: number, noteId: number): Promise<void> => {
        await apiClient.delete(`/${entityType}/${entityId}/notes/${noteId}`);
    },
};
