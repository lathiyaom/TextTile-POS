import type { Vendor, PaymentMode } from './vendor';

export type PaymentStatus = 'Paid' | 'Unpaid' | 'Partially Paid';
export type DiscountType = 'None' | 'Percentage' | 'Amount';
export type RoundOffMode = 'nearest_rupee' | 'round_up' | 'round_down' | 'nearest_0.50';

export interface PaymentType {
    id: number;
    name: string;
    description: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface POSSettings {
    id: number;
    enable_bill_round_off: boolean;
    round_off_mode: RoundOffMode;
    round_off_decimal_precision: number;
    allow_per_bill_round_off_override: boolean;
    recent_vendor_days: number;
    vendor_payment_warning_days: number;
    default_payment_terms_days: number;
    business_registered_state: string;
    financial_year_start_date: string;
    bill_number_prefix: string;
    bill_number_length: number;
    eway_bill_threshold_amount: number;
    created_at: string;
    updated_at: string;
}

export interface BillItem {
    id?: number;
    item_name: string;
    item_category: string;
    quantity: number;
    unit: string;
    rate: number;
    line_total: number;
    gst_percentage: number;
}

export interface Bill {
    id: number;
    bill_number: string;
    bill_date: string;
    financial_year: string;
    vendor?: Vendor;
    payment_type?: PaymentType;
    payment_status: PaymentStatus;
    items?: BillItem[];
    subtotal: number;
    discount_type: DiscountType;
    discount_percentage: number;
    discount_amount: number;
    taxable_amount: number;
    cgst_amount: number;
    sgst_amount: number;
    igst_amount: number;
    total_gst_amount: number;
    raw_grand_total: number;
    round_off_amount: number;
    grand_total: number;
    advance_amount_paid: number;
    payment_mode?: PaymentMode;
    next_payment_due_date?: string;
    payment_remarks: string;
    amount_due: number;
    eway_required: boolean;
    eway_bill_number: string;
    created_by: number;
    created_at: string;
    modified_by?: number;
    modified_at?: string;
    printed_by?: number;
    printed_count: number;
    last_printed_at?: string;
    cancelled_by?: number;
    cancelled_reason: string;
    cancelled_at?: string;
    is_cancelled: boolean;
}

export interface BillItemCreateRequest {
    item_name: string;
    item_category?: string;
    quantity: number;
    unit: string;
    rate: number;
    gst_percentage?: number;
}

export interface BillCreateRequest {
    bill_date: string;
    vendor_id: number;
    payment_type_id: number;
    items: BillItemCreateRequest[];
    discount_type?: DiscountType;
    discount_percentage?: number;
    discount_amount?: number;
    round_off_amount?: number;
    advance_amount_paid?: number;
    payment_mode_id?: number;
    next_payment_due_date?: string;
    payment_remarks?: string;
}

export interface BillUpdateRequest {
    bill_date?: string;
    vendor_id?: number;
    payment_type_id?: number;
    items?: BillItemCreateRequest[];
    discount_type?: DiscountType;
    discount_percentage?: number;
    discount_amount?: number;
    round_off_amount?: number;
    advance_amount_paid?: number;
    payment_mode_id?: number;
    next_payment_due_date?: string;
    payment_remarks?: string;
}

export interface BillChangeLog {
    id: number;
    bill_id: number;
    field_name: string;
    old_value: string;
    new_value: string;
    changed_by: number;
    changed_at: string;
}

export interface Note {
    id: number;
    entity_type: 'VENDOR' | 'BILL';
    entity_id: number;
    note_text: string;
    created_by: number;
    created_at: string;
    updated_by?: number;
    updated_at: string;
}

export interface NoteCreateRequest {
    note_text: string;
}

export interface NoteUpdateRequest {
    note_text: string;
}

export interface PaymentTypeCreateRequest {
    name: string;
    description?: string;
}

export interface PaymentTypeUpdateRequest {
    name?: string;
    description?: string;
    is_active?: boolean;
}

export interface POSSettingsUpdateRequest {
    enable_bill_round_off?: boolean;
    round_off_mode?: RoundOffMode;
    round_off_decimal_precision?: number;
    allow_per_bill_round_off_override?: boolean;
    recent_vendor_days?: number;
    vendor_payment_warning_days?: number;
    default_payment_terms_days?: number;
    business_registered_state?: string;
    financial_year_start_date?: string;
    bill_number_prefix?: string;
    bill_number_length?: number;
    eway_bill_threshold_amount?: number;
}

// Textile categories for GST defaults
export const TEXTILE_CATEGORIES = [
    { value: 'Raw Cotton', label: 'Raw Cotton', gst: 0 },
    { value: 'Silk Yarn', label: 'Silk Yarn', gst: 0 },
    { value: 'Khadi', label: 'Khadi', gst: 0 },
    { value: 'Fabrics', label: 'Fabrics', gst: 5 },
    { value: 'Garments', label: 'Garments', gst: 5 },
    { value: 'Made-ups', label: 'Made-ups', gst: 5 },
    { value: 'Job Work', label: 'Job Work', gst: 5 },
    { value: 'Textile Products', label: 'Textile Products', gst: 12 },
    { value: 'Embroidery Threads', label: 'Embroidery Threads', gst: 12 },
    { value: 'Synthetic Threads', label: 'Synthetic Threads', gst: 18 },
    { value: 'Accessories', label: 'Accessories', gst: 18 },
    { value: 'Dyes', label: 'Dyes', gst: 18 },
] as const;

export const UNITS = [
    'meter',
    'piece',
    'kg',
    'dozen',
    'roll',
    'yard',
    'box',
    'set',
] as const;

export type Unit = typeof UNITS[number];
