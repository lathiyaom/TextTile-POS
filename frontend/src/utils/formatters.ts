/**
 * Format currency in Indian Rupee format
 */
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

/**
 * Format number with Indian thousand separators
 */
export const formatNumber = (value: number, decimals: number = 2): string => {
    return new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(value);
};

/**
 * Format date in Indian format
 */
export const formatDate = (dateString: string, format: 'short' | 'long' = 'short'): string => {
    const date = new Date(dateString);
    
    if (format === 'short') {
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    }
    
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
};

/**
 * Format date and time
 */
export const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

/**
 * Get payment status badge classes
 */
export const getPaymentStatusBadge = (status: string): string => {
    const styles: Record<string, string> = {
        Paid: 'bg-green-100 text-green-800 border-green-200',
        Unpaid: 'bg-red-100 text-red-800 border-red-200',
        'Partially Paid': 'bg-amber-100 text-amber-800 border-amber-200',
    };
    return styles[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

/**
 * Calculate payment status based on amounts
 */
export const calculatePaymentStatus = (
    advancePaid: number,
    amountDue: number,
    grandTotal: number
): 'Paid' | 'Unpaid' | 'Partially Paid' => {
    if (amountDue === 0 || advancePaid >= grandTotal) {
        return 'Paid';
    }
    if (advancePaid > 0) {
        return 'Partially Paid';
    }
    return 'Unpaid';
};

/**
 * Get financial year from date
 */
export const getFinancialYear = (date: Date, fyStartDate: string = '04-01'): string => {
    const [month, day] = fyStartDate.split('-').map(Number);
    const fyStart = new Date(date.getFullYear(), month - 1, day);
    
    if (date < fyStart) {
        return `${date.getFullYear() - 1}-${String(date.getFullYear()).slice(-2)}`;
    }
    return `${date.getFullYear()}-${String(date.getFullYear() + 1).slice(-2)}`;
};
