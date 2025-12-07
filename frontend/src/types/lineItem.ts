/**
 * Line Item type for Bills/Invoices
 * Follows Zoho Books pattern with placeholder row support
 */
export interface LineItem {
    id: string; // Stable key for React
    itemId?: string; // Reference to item master
    itemName: string;
    categoryId?: string;
    categoryName?: string;
    qty: number | null;
    unitId?: string;
    unitName?: string;
    rate: number | null;
    gstPercent: number | null;
    discountPercent?: number | null;
    discountAmount?: number | null;
    lineSubtotal: number; // qty * rate before tax & discount
    lineTaxAmount: number; // computed from gstPercent
    lineTotal: number; // final amount after tax & discount
    isPlaceholder?: boolean; // Used for the always-present empty row
}

/**
 * Line Items totals
 */
export interface LineItemsTotals {
    subTotal: number;
    totalTax: number;
    totalDiscount: number;
    grandTotal: number;
}

/**
 * Validation result for line items
 */
export interface LineItemsValidation {
    isValid: boolean;
    error?: string;
    itemErrors?: Record<string, string>; // key: lineItem.id, value: error message
}
