import React from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { useAuthStore } from '@/store/authStore';
import {
    BarChart3,
    TrendingUp,
    Users,
    ShoppingCart,
    Package,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
    const { user } = useAuthStore();

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Top Header*/}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">
                            Dashboard
                        </h1>
                        <p className="text-gray-500 text-sm">
                            Welcome back, {user?.name}
                        </p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-4 gap-4">
                    <DashboardCard
                        icon={<TrendingUp className="w-5 h-5" />}
                        title="Total Sales"
                        value="₹0.00"
                    />

                    <DashboardCard
                        icon={<ShoppingCart className="w-5 h-5" />}
                        title="Today Orders"
                        value="0"
                    />

                    <DashboardCard
                        icon={<Package className="w-5 h-5" />}
                        title="Products"
                        value="0"
                    />

                    <DashboardCard
                        icon={<Users className="w-5 h-5" />}
                        title="Vendors"
                        value="0"
                    />
                </div>

                {/* Analytics Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-5 py-3 border-b border-gray-200">
                        <h2 className="text-sm font-semibold text-gray-700">
                            Analytics Overview
                        </h2>
                    </div>
                    <div className="p-6 flex justify-center text-gray-500 text-sm">
                        No Analytics available
                    </div>
                </div>

                {/* Account Information Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-5 py-3 border-b border-gray-200">
                        <h2 className="text-sm font-semibold text-gray-700">
                            Account Information
                        </h2>
                    </div>

                    <div className="p-6 text-sm">
                        <InfoRow label="Name" value={user?.name} />
                        <InfoRow label="Email" value={user?.email} />
                        <InfoRow
                            label="Status"
                            value={
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                    Active
                                </span>
                            }
                        />
                        <InfoRow
                            label="Created On"
                            value={
                                user?.created_at
                                    ? new Date(user.created_at).toLocaleDateString()
                                    : 'N/A'
                            }
                        />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

// ---------------- Components ------------------

const DashboardCard = ({ icon, title, value }: any) => (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm px-4 py-4 flex flex-col space-y-1">
        <div className="text-blue-600">{icon}</div>
        <p className="text-xs text-gray-500">{title}</p>
        <p className="text-lg font-semibold text-gray-900">{value}</p>
    </div>
);

const InfoRow = ({ label, value }: any) => (
    <div className="flex justify-between py-2 border-b last:border-none border-gray-200 text-gray-700">
        <span className="text-gray-500">{label}:</span>
        <span className="font-medium">{value}</span>
    </div>
);
