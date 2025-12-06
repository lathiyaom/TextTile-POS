import { apiClient } from './client';
import type {
    Vendor,
    VendorType,
    PaymentMode,
    VendorCreateRequest,
    VendorUpdateRequest,
    VendorTypeCreateRequest,
    PaymentModeCreateRequest,
    VendorNote,
    VendorAuditLog,
    VendorAttachment,
    ApiResponse,
    PaginatedResponse,
} from '@/types';

export const vendorTypeApi = {
    getAll: async (): Promise<VendorType[]> => {
        const response = await apiClient.get<ApiResponse<VendorType[]>>('/vendor-types');
        return response.data.data!;
    },

    getById: async (id: number): Promise<VendorType> => {
        const response = await apiClient.get<ApiResponse<VendorType>>(`/vendor-types/${id}`);
        return response.data.data!;
    },

    create: async (data: VendorTypeCreateRequest): Promise<VendorType> => {
        const response = await apiClient.post<ApiResponse<VendorType>>('/vendor-types', data);
        return response.data.data!;
    },

    update: async (id: number, data: Partial<VendorTypeCreateRequest>): Promise<VendorType> => {
        const response = await apiClient.put<ApiResponse<VendorType>>(`/vendor-types/${id}`, data);
        return response.data.data!;
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/vendor-types/${id}`);
    },
};

export const paymentModeApi = {
    getAll: async (): Promise<PaymentMode[]> => {
        const response = await apiClient.get<ApiResponse<PaymentMode[]>>('/payment-modes');
        return response.data.data!;
    },

    getById: async (id: number): Promise<PaymentMode> => {
        const response = await apiClient.get<ApiResponse<PaymentMode>>(`/payment-modes/${id}`);
        return response.data.data!;
    },

    create: async (data: PaymentModeCreateRequest): Promise<PaymentMode> => {
        const response = await apiClient.post<ApiResponse<PaymentMode>>('/payment-modes', data);
        return response.data.data!;
    },

    update: async (id: number, data: Partial<PaymentModeCreateRequest>): Promise<PaymentMode> => {
        const response = await apiClient.put<ApiResponse<PaymentMode>>(`/payment-modes/${id}`, data);
        return response.data.data!;
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/payment-modes/${id}`);
    },
};

export const vendorApi = {
    generateVendorNo: async (): Promise<string> => {
        const response = await apiClient.get<ApiResponse<{ vendor_no: string }>>('/vendors/generate-number');
        return response.data.data!.vendor_no;
    },

    getAll: async (page: number = 1, pageSize: number = 10, status?: string, search?: string, sortBy?: string, sortDir?: string): Promise<PaginatedResponse<Vendor>> => {
        const params: any = { page, page_size: pageSize };
        if (status) params.status = status;
        if (search) params.search = search;
        if (sortBy) params.sort_by = sortBy;
        if (sortDir) params.sort_dir = sortDir;

        const response = await apiClient.get<PaginatedResponse<Vendor>>('/vendors', { params });
        return response.data;
    },

    getById: async (id: number): Promise<Vendor> => {
        const response = await apiClient.get<ApiResponse<Vendor>>(`/vendors/${id}`);
        return response.data.data!;
    },

    create: async (data: VendorCreateRequest): Promise<Vendor> => {
        const response = await apiClient.post<ApiResponse<Vendor>>('/vendors', data);
        return response.data.data!;
    },

    update: async (id: number, data: VendorUpdateRequest): Promise<Vendor> => {
        const response = await apiClient.put<ApiResponse<Vendor>>(`/vendors/${id}`, data);
        return response.data.data!;
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/vendors/${id}`);
    },

    changeStatus: async (id: number, status: string, reason?: string): Promise<Vendor> => {
        const response = await apiClient.patch<ApiResponse<Vendor>>(`/vendors/${id}/status`, { status, reason });
        return response.data.data!;
    },

    getNotes: async (id: number): Promise<VendorNote[]> => {
        const response = await apiClient.get<ApiResponse<VendorNote[]>>(`/vendors/${id}/notes`);
        return response.data.data!;
    },

    createNote: async (id: number, noteText: string): Promise<VendorNote> => {
        const response = await apiClient.post<ApiResponse<VendorNote>>(`/vendors/${id}/notes`, { note_text: noteText });
        return response.data.data!;
    },

    updateNote: async (id: number, noteId: number, noteText: string): Promise<VendorNote> => {
        const response = await apiClient.put<ApiResponse<VendorNote>>(`/vendors/${id}/notes/${noteId}`, { note_text: noteText });
        return response.data.data!;
    },

    deleteNote: async (id: number, noteId: number): Promise<void> => {
        await apiClient.delete(`/vendors/${id}/notes/${noteId}`);
    },

    getActivity: async (id: number): Promise<VendorAuditLog[]> => {
        const response = await apiClient.get<ApiResponse<VendorAuditLog[]>>(`/vendors/${id}/activity`);
        return response.data.data!;
    },

    getAttachments: async (id: number): Promise<VendorAttachment[]> => {
        const response = await apiClient.get<ApiResponse<VendorAttachment[]>>(`/vendors/${id}/attachments`);
        return response.data.data!;
    },

    uploadAttachment: async (id: number, file: File): Promise<VendorAttachment> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await apiClient.post<ApiResponse<VendorAttachment>>(`/vendors/${id}/attachments`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data.data!;
    },

    deleteAttachment: async (id: number, attachmentId: number): Promise<void> => {
        await apiClient.delete(`/vendors/${id}/attachments/${attachmentId}`);
    },
};
