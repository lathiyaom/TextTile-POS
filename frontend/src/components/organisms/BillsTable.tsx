import React from 'react';
import { Badge } from '@/components/atoms';
import type { Bill, PaymentStatus } from '@/types';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface BillsTableProps {
    bills: Bill[];
    selectedBillId?: number;
    onBillSelect: (bill: Bill) => void;
    sortBy: string;
    sortDir: string;
    onSort: (field: string) => void;
}

export const BillsTable: React.FC<BillsTableProps> = ({
    bills,
    selectedBillId,
    onBillSelect,
    sortBy,
    sortDir,
    onSort,
}) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const getPaymentStatusBadge = (status: PaymentStatus) => {
        const variants = {
            Paid: 'success',
            Unpaid: 'danger',
            'Partially Paid': 'warning',
        };
        return variants[status] || 'default';
    };

    const SortIcon = ({ field }: { field: string }) => {
        if (sortBy !== field) return null;
        return sortDir === 'ASC' ? (
            <ChevronUp className="w-3.5 h-3.5" />
        ) : (
            <ChevronDown className="w-3.5 h-3.5" />
        );
    };

    const SortableHeader = ({ field, children }: { field: string; children: React.ReactNode }) => (
        <th
            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
            onClick={() => onSort(field)}
        >
            <div className="flex items-center gap-1">
                {children}
                <SortIcon field={field} />
            </div>
        </th>
    );

    return (
        <div className="overflow-auto h-full">
            <table className="w-full border-collapse">
                <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200">
                    <tr>
                        <SortableHeader field="bill_number">Bill No.</SortableHeader>
                        <SortableHeader field="bill_date">Date</SortableHeader>
                        <SortableHeader field="vendor_name">Vendor</SortableHeader>
                        <SortableHeader field="payment_type">Payment Type</SortableHeader>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Grand Total
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount Due
                        </th>
                        <SortableHeader field="payment_status">Status</SortableHeader>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                    {bills.map((bill) => (
                        <tr
                            key={bill.id}
                            onClick={() => onBillSelect(bill)}
                            className={`cursor-pointer transition-colors hover:bg-blue-50 ${
                                selectedBillId === bill.id ? 'bg-blue-50 border-l-4 border-l-primary-600' : ''
                            }`}
                        >
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                {bill.bill_number}
                                {bill.is_cancelled && (
                                    <Badge variant="danger" className="ml-2 text-xs">
                                        Cancelled
                                    </Badge>
                                )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                                {formatDate(bill.bill_date)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                                {bill.vendor?.vendor_name || 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                                {bill.payment_type?.name || 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                                {formatCurrency(bill.grand_total)}
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                                {formatCurrency(bill.amount_due)}
                            </td>
                            <td className="px-4 py-3">
                                <Badge
                                    variant={getPaymentStatusBadge(bill.payment_status)}
                                    className="text-xs"
                                >
                                    {bill.payment_status}
                                </Badge>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
