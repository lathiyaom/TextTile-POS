import type { LineItem, LineItemsTotals, LineItemsValidation } from '@/types/lineItem';

/**
 * Generate a unique ID for line items
 */
const generateId = (): string => {
    return `line-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Create a new empty placeholder line item
 */
export const createEmptyLineItem = (): LineItem => ({
    id: generateId(),
    itemName: '',
    qty: null,
    rate: null,
    gstPercent: null,
    lineSubtotal: 0,
    lineTaxAmount: 0,
    lineTotal: 0,
    isPlaceholder: true,
});

/**
 * Check if a line item is empty (all fields blank)
 */
export const isLineItemEmpty = (item: LineItem): boolean => {
    return (
        !item.itemName.trim() &&
        (item.qty === null || item.qty === 0) &&
        (item.rate === null || item.rate === 0) &&
        !item.categoryName &&
        !item.unitName
    );
};

/**
 * Check if a line item is valid (has minimum required fields)
 * A valid item must have: itemName, qty > 0, rate >= 0
 */
export const isLineItemValid = (item: LineItem): boolean => {
    return (
        item.itemName.trim().length > 0 &&
        item.qty !== null &&
        item.qty > 0 &&
        item.rate !== null &&
        item.rate >= 0
    );
};

/**
 * Get only valid line items (filters out placeholders and invalid items)
 */
export const getValidLineItems = (items: LineItem[]): LineItem[] => {
    return items.filter((item) => !item.isPlaceholder && isLineItemValid(item));
};

/**
 * Validate that at least one valid line item exists
 */
export const validateAtLeastOneItem = (items: LineItem[]): LineItemsValidation => {
    const validItems = getValidLineItems(items);

    if (validItems.length === 0) {
        return {
            isValid: false,
            error: 'At least one item is required',
        };
    }

    return {
        isValid: true,
    };
};

/**
 * Calculate line item totals
 * GST is assumed to be exclusive (added on top of subtotal)
 */
export const calculateLineItemTotals = (item: Partial<LineItem>): {
    lineSubtotal: number;
    lineTaxAmount: number;
    lineTotal: number;
} => {
    const qty = item.qty || 0;
    const rate = item.rate || 0;
    const gstPercent = item.gstPercent || 0;
    const discountPercent = item.discountPercent || 0;
    const discountAmount = item.discountAmount || 0;

    // Calculate subtotal
    let lineSubtotal = qty * rate;

    // Apply discount
    let discountValue = 0;
    if (discountPercent > 0) {
        discountValue = (lineSubtotal * discountPercent) / 100;
    } else if (discountAmount > 0) {
        discountValue = discountAmount;
    }

    const subtotalAfterDiscount = lineSubtotal - discountValue;

    // Calculate tax (GST exclusive)
    const lineTaxAmount = (subtotalAfterDiscount * gstPercent) / 100;

    // Calculate final total
    const lineTotal = subtotalAfterDiscount + lineTaxAmount;

    return {
        lineSubtotal: parseFloat(lineSubtotal.toFixed(2)),
        lineTaxAmount: parseFloat(lineTaxAmount.toFixed(2)),
        lineTotal: parseFloat(lineTotal.toFixed(2)),
    };
};

/**
 * Calculate totals for all valid line items
 */
export const calculateLineItemsTotals = (items: LineItem[]): LineItemsTotals => {
    const validItems = getValidLineItems(items);

    const subTotal = validItems.reduce((sum, item) => sum + item.lineSubtotal, 0);
    const totalTax = validItems.reduce((sum, item) => sum + item.lineTaxAmount, 0);

    // Calculate total discount
    const totalDiscount = validItems.reduce((sum, item) => {
        const discountPercent = item.discountPercent || 0;
        const discountAmount = item.discountAmount || 0;
        const itemSubtotal = (item.qty || 0) * (item.rate || 0);

        if (discountPercent > 0) {
            return sum + (itemSubtotal * discountPercent) / 100;
        } else if (discountAmount > 0) {
            return sum + discountAmount;
        }
        return sum;
    }, 0);

    const grandTotal = subTotal + totalTax;

    return {
        subTotal: parseFloat(subTotal.toFixed(2)),
        totalTax: parseFloat(totalTax.toFixed(2)),
        totalDiscount: parseFloat(totalDiscount.toFixed(2)),
        grandTotal: parseFloat(grandTotal.toFixed(2)),
    };
};

/**
 * Update a line item with recalculated totals
 */
export const updateLineItemWithCalculations = (item: LineItem): LineItem => {
    const { lineSubtotal, lineTaxAmount, lineTotal } = calculateLineItemTotals(item);

    return {
        ...item,
        lineSubtotal,
        lineTaxAmount,
        lineTotal,
        isPlaceholder: false, // Once edited, it's no longer a placeholder
    };
};
