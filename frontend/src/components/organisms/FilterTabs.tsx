import React from 'react';
import type { VendorStatus } from '@/types';

interface FilterTabsProps {
    value: VendorStatus | '';
    onChange: (value: VendorStatus | '') => void;
}

const STATUS_TABS: { label: string; value: VendorStatus | '' }[] = [
    { label: 'All Vendors', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Blacklisted', value: 'blacklisted' },
];

export const FilterTabs: React.FC<FilterTabsProps> = ({ value, onChange }) => {
    return (
        <div className="flex gap-1 rounded-full bg-slate-100 px-1 py-1">
            {STATUS_TABS.map((tab) => (
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

