import React from 'react';
import { Button } from '@/components/atoms';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationState {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

interface PaginationProps {
    pagination: PaginationState;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
    pagination,
    onPageChange,
    onPageSizeChange,
}) => {
    const { page, pageSize, totalItems, totalPages } = pagination;

    const showingFrom = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
    const showingTo = Math.min(page * pageSize, totalItems);

    if (totalPages <= 1 && totalItems <= pageSize) {
        return null;
    }

    return (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50 text-xs">
            <div className="flex items-center gap-3">
                <span className="text-slate-600">
                    Showing {showingFrom} to {showingTo} of {totalItems} vendors
                </span>
                <select
                    value={pageSize}
                    onChange={(e) => onPageSizeChange(Number(e.target.value))}
                    className="px-2 py-1 border border-slate-300 rounded-md text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                    <option value={10}>10 / page</option>
                    <option value={25}>25 / page</option>
                    <option value={50}>50 / page</option>
                    <option value={100}>100 / page</option>
                </select>
            </div>
            <div className="flex items-center gap-2">
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onPageChange(Math.max(1, page - 1))}
                    disabled={page === 1}
                >
                    <ChevronLeft className="w-3 h-3" />
                </Button>
                <span className="text-slate-600 px-2">
                    Page {page} of {totalPages}
                </span>
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                >
                    <ChevronRight className="w-3 h-3" />
                </Button>
            </div>
        </div>
    );
};

