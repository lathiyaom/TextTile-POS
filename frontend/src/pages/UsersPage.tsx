import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Card, Button, Badge } from '@/components/atoms';
import { userApi } from '@/services/api';
import type { User } from '@/types';
import { Plus, Edit, Trash2 } from 'lucide-react';

export const UsersPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchUsers();
    }, [currentPage]);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const response = await userApi.getAll(currentPage, 10);
            setUsers(response.data);
            setTotalPages(response.pagination.total_pages);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await userApi.delete(id);
                fetchUsers();
            } catch (error) {
                console.error('Failed to delete user:', error);
            }
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-5">
                {/* Page Header (lighter, Zoho-like) */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
                        <p className="text-sm text-gray-500">Manage users for your POS Books account.</p>
                    </div>
                    <Button
                        variant="primary"
                        className="flex items-center gap-1.5 text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Add User
                    </Button>
                </div>

                {/* Users Table Card */}
                <Card className="p-0 border border-gray-200 shadow-sm bg-white">
                    {/* Card Header Row (inside card, like Zoho list pages) */}
                    <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-800">Users List</p>
                            <p className="text-xs text-gray-500">
                                {users.length === 0
                                    ? 'No users found for this page.'
                                    : `Showing ${users.length} user${users.length > 1 ? 's' : ''} on page ${currentPage}.`}
                            </p>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="py-16 flex flex-col items-center justify-center">
                            <div className="h-10 w-10 rounded-full border-2 border-gray-200 border-t-blue-500 animate-spin" />
                            <p className="mt-4 text-sm text-gray-500">Loading users…</p>
                        </div>
                    ) : (
                        <>
                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wide">
                                                User
                                            </th>
                                            <th className="px-6 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wide">
                                                Email
                                            </th>
                                            <th className="px-6 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wide">
                                                Status
                                            </th>
                                            <th className="px-6 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wide">
                                                Created On
                                            </th>
                                            <th className="px-6 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wide">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {users.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50">
                                                {/* User + avatar */}
                                                <td className="px-6 py-3 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-700">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="ml-3">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {user.name}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Email */}
                                                <td className="px-6 py-3 whitespace-nowrap">
                                                    <div className="text-sm text-gray-700">{user.email}</div>
                                                </td>

                                                {/* Status */}
                                                <td className="px-6 py-3 whitespace-nowrap">
                                                    <Badge variant={user.is_active ? 'success' : 'danger'}>
                                                        {user.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </td>

                                                {/* Created date */}
                                                <td className="px-6 py-3 whitespace-nowrap text-gray-500">
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-3 whitespace-nowrap text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            className="p-1 rounded hover:bg-gray-100 text-blue-600"
                                                        // TODO: open edit modal / navigation
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(user.id)}
                                                            className="p-1 rounded hover:bg-red-50 text-red-600"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}

                                        {users.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="px-6 py-10 text-center text-sm text-gray-500"
                                                >
                                                    No users to display.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        Previous
                                    </Button>

                                    <span className="text-xs text-gray-600">
                                        Page <span className="font-medium">{currentPage}</span> of{' '}
                                        <span className="font-medium">{totalPages}</span>
                                    </span>

                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() =>
                                            setCurrentPage((p) => Math.min(totalPages, p + 1))
                                        }
                                        disabled={currentPage === totalPages}
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </Card>
            </div>
        </DashboardLayout>
    );
};
