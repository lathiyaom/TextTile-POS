import React from 'react';
import { Badge } from '@/components/atoms';
import type { Vendor, VendorStatus } from '@/types';

interface VendorsTableProps {
    vendors: Vendor[];
    selectedVendorId?: number;
    onVendorSelect: (vendor: Vendor) => void;
    sortBy?: string;
    sortDir?: string;
    onSort: (field: string) => void;
}

const getStatusBadgeVariant = (status: VendorStatus) => {
    switch (status) {
        case 'active':
            return 'success';
        case 'inactive':
            return 'warning';
        case 'blacklisted':
            return 'danger';
        default:
            return 'default';
    }
};

const getSortIcon = (field: string, currentSortBy?: string, currentSortDir?: string) => {
    if (currentSortBy !== field) return null;
    return currentSortDir === 'ASC' ? '↑' : '↓';
};

export const VendorsTable: React.FC<VendorsTableProps> = ({
    vendors,
    selectedVendorId,
    onVendorSelect,
    sortBy,
    sortDir,
    onSort,
}) => {
    return (
        <div className="overflow-auto">
            <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                    <tr>
                        <th
                            className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide cursor-pointer hover:bg-slate-100 transition-colors"
                            onClick={() => onSort('vendor_name')}
                        >
                            Vendor Name {getSortIcon('vendor_name', sortBy, sortDir)}
                        </th>
                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                            Vendor No
                        </th>
                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                            City
                        </th>
                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                            State
                        </th>
                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                            Mobile
                        </th>
                        <th
                            className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide cursor-pointer hover:bg-slate-100 transition-colors"
                            onClick={() => onSort('status')}
                        >
                            Status {getSortIcon('status', sortBy, sortDir)}
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                    {vendors.map((vendor) => (
                        <tr
                            key={vendor.id}
                            onClick={() => onVendorSelect(vendor)}
                            className={`cursor-pointer transition-colors ${
                                selectedVendorId === vendor.id
                                    ? 'bg-blue-50/80'
                                    : 'hover:bg-slate-50'
                            }`}
                        >
                            <td className="px-4 py-2.5">
                                <div className="text-[13px] font-medium text-slate-900">
                                    {vendor.vendor_name}
                                </div>
                                {vendor.business_name && (
                                    <div className="text-[11px] text-slate-500">
                                        {vendor.business_name}
                                    </div>
                                )}
                            </td>
                            <td className="px-4 py-2.5 text-[13px] text-slate-800">
                                {vendor.vendor_no}
                            </td>
                            <td className="px-4 py-2.5 text-[13px] text-slate-800">
                                {vendor.city || '-'}
                            </td>
                            <td className="px-4 py-2.5 text-[13px] text-slate-800">
                                {vendor.state || '-'}
                            </td>
                            <td className="px-4 py-2.5 text-[13px] text-slate-800">
                                {vendor.mobile_number || '-'}
                            </td>
                            <td className="px-4 py-2.5">
                                <Badge
                                    variant={getStatusBadgeVariant(vendor.status)}
                                    className="capitalize text-[11px] px-2 py-0.5"
                                >
                                    {vendor.status}
                                </Badge>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

