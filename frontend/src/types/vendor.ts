export interface VendorType {
    id: number;
    name: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export type PaymentModeCategory = 'Cash' | 'Card' | 'UPI' | 'Bank Transfer' | 'Cheque' | 'Other';

export interface PaymentMode {
    id: number;
    name: string;
    category: PaymentModeCategory;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export type VendorStatus = 'active' | 'inactive' | 'blacklisted';

export interface Vendor {
    id: number;
    vendor_no: string;
    vendor_name: string;
    business_name: string;
    mobile_number: string;
    whatsapp_number: string;
    email: string;
    gst_number: string;
    billing_address: string;
    city: string;
    state: string;
    pincode: string;
    total_bills: number;
    total_amount: number;
    total_paid: number;
    balance_due: number;
    vendor_type?: VendorType;
    payment_mode?: PaymentMode;
    status: VendorStatus;
    created_at: string;
    updated_at: string;
}

export interface VendorCreateRequest {
    vendor_name: string;
    business_name?: string;
    mobile_number: string;
    whatsapp_number?: string;
    email?: string;
    gst_number?: string;
    billing_address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    vendor_type_id: number;
    payment_mode_id?: number;
    status?: VendorStatus;
}

export interface VendorUpdateRequest {
    vendor_name?: string;
    business_name?: string;
    mobile_number?: string;
    whatsapp_number?: string;
    email?: string;
    gst_number?: string;
    billing_address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    vendor_type_id?: number;
    payment_mode_id?: number;
    status?: VendorStatus;
}

export interface VendorTypeCreateRequest {
    name: string;
    is_active?: boolean;
}

export interface PaymentModeCreateRequest {
    name: string;
    category?: PaymentModeCategory;
    is_active?: boolean;
}

// Indian States
export const INDIAN_STATES = [
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chhattisgarh',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal',
    'Andaman and Nicobar Islands',
    'Chandigarh',
    'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi',
    'Jammu and Kashmir',
    'Ladakh',
    'Lakshadweep',
    'Puducherry',
] as const;

export type IndianState = typeof INDIAN_STATES[number];

export interface VendorNote {
    id: number;
    vendor_id: number;
    note_text: string;
    created_at: string;
    updated_at: string;
}

export interface VendorAuditLog {
    id: number;
    vendor_id: number;
    action_type: 'created' | 'updated' | 'status_change' | 'deleted';
    description: string;
    old_value?: string;
    new_value?: string;
    created_at: string;
}

export interface VendorAttachment {
    id: number;
    vendor_id: number;
    file_name: string;
    file_url: string;
    file_size: number;
    mime_type: string;
    uploaded_at: string;
    created_at: string;
    updated_at: string;
}