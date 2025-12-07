import React from 'react';
import type { VendorStatus, PaymentStatus } from '@/types';

interface FilterTabsProps {
    value: VendorStatus | PaymentStatus | '';
    onChange: (value: any) => void;
    tabs?: { label: string; value: any }[];
}

const VENDOR_STATUS_TABS: { label: string; value: VendorStatus | '' }[] = [
    { label: 'All Vendors', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Blacklisted', value: 'blacklisted' },
];

const PAYMENT_STATUS_TABS: { label: string; value: PaymentStatus | '' }[] = [
    { label: 'All Bills', value: '' },
    { label: 'Paid', value: 'Paid' },
    { label: 'Unpaid', value: 'Unpaid' },
    { label: 'Partially Paid', value: 'Partially Paid' },
];

export const FilterTabs: React.FC<FilterTabsProps> = ({ value, onChange, tabs }) => {
    // Auto-detect tabs based on value type if not provided
    const tabsToUse = tabs || (
        typeof value === 'string' && ['Paid', 'Unpaid', 'Partially Paid', ''].includes(value)
            ? PAYMENT_STATUS_TABS
            : VENDOR_STATUS_TABS
    );

    return (
        <div className="flex gap-1 rounded-full bg-slate-100 px-1 py-1">
            {tabsToUse.map((tab) => (
                <button
                    key={tab.label}
                    onClick={() => onChange(tab.value)}
                    className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                        value === tab.value
                            ? 'bg-white border-slate-300 text-slate-900 shadow-sm font-medium'
                            : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-200'
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

