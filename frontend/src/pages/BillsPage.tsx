import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Card, Button, Select } from '@/components/atoms';
import { FilterTabs } from '@/components/organisms/FilterTabs';
import { SearchBar } from '@/components/organisms/SearchBar';
import { BillsTable } from '@/components/organisms/BillsTable';
import { Pagination, type PaginationState } from '@/components/organisms/Pagination';
import { BillDetailPanel } from '@/components/organisms/BillDetailPanel';
import { billApi } from '@/services/api/bill';
import type { Bill, PaymentStatus } from '@/types';
import { Plus, FileText } from 'lucide-react';

export const BillsPage: React.FC = () => {
    const navigate = useNavigate();
    const [bills, setBills] = useState<Bill[]>([]);
    const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [paymentStatusFilter, setPaymentStatusFilter] = useState<PaymentStatus | ''>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<string>('bill_date');
    const [sortDir, setSortDir] = useState<string>('DESC');
    const [pagination, setPagination] = useState<PaginationState>({
        page: 1,
        pageSize: 25,
        totalItems: 0,
        totalPages: 1,
    });

    const fetchBills = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await billApi.getAll(
                pagination.page,
                pagination.pageSize,
                {
                    payment_status: paymentStatusFilter || undefined,
                    search: searchQuery || undefined,
                    sort_by: sortBy || undefined,
                    sort_dir: sortDir || undefined,
                }
            );
            setBills(response.data || []);
            setPagination({
                page: response.pagination.page,
                pageSize: response.pagination.page_size,
                totalItems: response.pagination.total_items,
                totalPages: response.pagination.total_pages,
            });
        } catch (error) {
            console.error('Failed to fetch bills:', error);
        } finally {
            setIsLoading(false);
        }
    }, [pagination.page, pagination.pageSize, paymentStatusFilter, searchQuery, sortBy, sortDir]);

    useEffect(() => {
        fetchBills();
    }, [fetchBills]);

    const handleBillSelect = async (bill: Bill) => {
        const fullBill = await billApi.getById(bill.id);
        setSelectedBill(fullBill);
    };

    const handleAddBill = () => {
        navigate('/bills/create');
    };

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortDir((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
        } else {
            setSortBy(field);
            setSortDir('ASC');
        }
    };

    const handleStatusFilterChange = (value: PaymentStatus | '') => {
        setPaymentStatusFilter(value);
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    const handlePageChange = (page: number) => {
        setPagination((prev) => ({ ...prev, page }));
    };

    const handlePageSizeChange = (pageSize: number) => {
        setPagination((prev) => ({ ...prev, pageSize, page: 1 }));
    };

    return (
        <DashboardLayout>
            <div className="flex h-screen bg-slate-50">
                <div className="flex-1 flex flex-col overflow-hidden w-full transition-all duration-300">
                    <div className="px-6 pt-6 pb-4 border-b border-slate-200 bg-white flex-shrink-0">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-2xl font-semibold text-slate-900">Bills</h1>
                                <p className="text-sm text-slate-500 mt-0.5">
                                    Manage all your purchase bills in one place
                                </p>
                            </div>
                            <Button variant="primary" size="sm" onClick={handleAddBill}>
                                <Plus className="w-4 h-4 mr-1.5" />
                                New Bill
                            </Button>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <FilterTabs value={paymentStatusFilter} onChange={handleStatusFilterChange} />
                            <div className="flex-1" />
                            <SearchBar value={searchQuery} onChange={handleSearchChange} placeholder="Search bills..." />
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col overflow-hidden m-4 mb-0">
                        <Card className="flex-1 flex flex-col overflow-hidden border-slate-200 shadow-sm">
                            {isLoading ? (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto" />
                                        <p className="text-xs text-slate-500 mt-3">Loading bills...</p>
                                    </div>
                                </div>
                            ) : bills.length === 0 ? (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="text-center max-w-xs mx-auto">
                                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-sm text-slate-600 mb-2 font-medium">
                                            No bills found
                                        </p>
                                        <p className="text-xs text-slate-500 mb-4">
                                            Start by creating your first bill. You can add items and track payments.
                                        </p>
                                        <Button variant="primary" size="sm" onClick={handleAddBill}>
                                            Create Your First Bill
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col overflow-hidden">
                                    <div className="flex-1 overflow-hidden">
                                        <BillsTable
                                            bills={bills}
                                            selectedBillId={selectedBill?.id}
                                            onBillSelect={handleBillSelect}
                                            sortBy={sortBy}
                                            sortDir={sortDir}
                                            onSort={handleSort}
                                        />
                                    </div>
                                    <div className="flex-shrink-0">
                                        <Pagination
                                            pagination={pagination}
                                            onPageChange={handlePageChange}
                                            onPageSizeChange={handlePageSizeChange}
                                        />
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </div>

            <BillDetailPanel
                isOpen={!!selectedBill}
                billDetails={selectedBill}
                onClose={() => setSelectedBill(null)}
                onUpdate={fetchBills}
            />
        </DashboardLayout>
    );
};
