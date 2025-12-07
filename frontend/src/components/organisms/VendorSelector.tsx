import React, { useState, useEffect, useMemo } from 'react';
import { SearchableSelect, type SearchableOption } from '@/components/atoms/SearchableSelect';
import { vendorApi } from '@/services/api/vendor';
import { useSettingsStore } from '@/store/settingsStore';
import type { Vendor } from '@/types';
import { AlertTriangle, Building2, MapPin, FileText } from 'lucide-react';

interface VendorSelectorProps {
    value: number | null;
    onChange: (vendorId: number, vendor: Vendor) => void;
    error?: string;
}

export const VendorSelector: React.FC<VendorSelectorProps> = ({ value, onChange, error }) => {
    const { settings } = useSettingsStore();
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showWarning, setShowWarning] = useState(false);

    useEffect(() => {
        loadVendors();
    }, []);

    useEffect(() => {
        if (value && vendors.length > 0) {
            const vendor = vendors.find((v) => v.id === value);
            if (vendor) {
                setSelectedVendor(vendor);
                checkPaymentWarning(vendor);
            }
        } else {
            setSelectedVendor(null);
            setShowWarning(false);
        }
    }, [value, vendors]);

    const loadVendors = async () => {
        setIsLoading(true);
        try {
            const response = await vendorApi.getAll(1, 1000, 'active');
            setVendors(response.data);
        } catch (error) {
            console.error('Failed to load vendors:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const checkPaymentWarning = (vendor: Vendor) => {
        if (!settings?.vendor_payment_warning_days) return;

        // Check if last payment is older than warning days
        // For now, we'll show warning if balance due > 0
        // In production, you'd check actual last payment date
        if (vendor.balance_due > 0) {
            setShowWarning(true);
        } else {
            setShowWarning(false);
        }
    };

    const sortedVendors = useMemo(() => {
        // Sort vendors: Active first, then by name
        return [...vendors].sort((a, b) => {
            if (a.status === 'active' && b.status !== 'active') return -1;
            if (a.status !== 'active' && b.status === 'active') return 1;
            return a.vendor_name.localeCompare(b.vendor_name);
        });
    }, [vendors]);

    const vendorOptions: SearchableOption[] = useMemo(() => {
        return sortedVendors.map((vendor) => {
            let label = vendor.vendor_name;
            if (vendor.business_name) {
                label += ` (${vendor.business_name})`;
            }
            if (vendor.city) {
                label += ` - ${vendor.city}`;
            }
            if (vendor.balance_due > 0) {
                label += ` (Due: ₹${vendor.balance_due.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                })})`;
            }
            return {
                value: vendor.id.toString(),
                label,
            };
        });
    }, [sortedVendors]);

    const handleVendorChange = (vendorId: string) => {
        const vendor = vendors.find((v) => v.id === parseInt(vendorId));
        if (vendor) {
            onChange(vendor.id, vendor);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    return (
        <div className="space-y-3">
            <SearchableSelect
                label="Vendor *"
                name="vendor"
                value={value?.toString() || ''}
                options={vendorOptions}
                onChange={handleVendorChange}
                placeholder="Select vendor..."
                disabled={isLoading}
            />

            {error && <p className="text-xs text-red-600">{error}</p>}

            {showWarning && selectedVendor && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-800">
                        <p className="font-medium">Payment Warning</p>
                        <p>
                            This vendor has an outstanding balance of {formatCurrency(selectedVendor.balance_due)}.
                        </p>
                    </div>
                </div>
            )}

            {selectedVendor && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-md space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                        <Building2 className="w-4 h-4 text-gray-500" />
                        <span>{selectedVendor.vendor_name}</span>
                    </div>

                    {selectedVendor.business_name && (
                        <p className="text-xs text-gray-600">{selectedVendor.business_name}</p>
                    )}

                    {selectedVendor.billing_address && (
                        <div className="flex items-start gap-2 text-xs text-gray-600">
                            <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p>{selectedVendor.billing_address}</p>
                                <p>
                                    {selectedVendor.city && `${selectedVendor.city}, `}
                                    {selectedVendor.state && `${selectedVendor.state} `}
                                    {selectedVendor.pincode && `- ${selectedVendor.pincode}`}
                                </p>
                            </div>
                        </div>
                    )}

                    {selectedVendor.gst_number && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                            <FileText className="w-3 h-3 text-gray-400" />
                            <span>GST: {selectedVendor.gst_number}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-200">
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase">Total Bills</p>
                            <p className="text-sm font-medium text-gray-900">{selectedVendor.total_bills}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase">Total Amount</p>
                            <p className="text-sm font-medium text-gray-900">
                                {formatCurrency(selectedVendor.total_amount)}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase">Balance Due</p>
                            <p
                                className={`text-sm font-medium ${
                                    selectedVendor.balance_due > 0 ? 'text-red-600' : 'text-green-600'
                                }`}
                            >
                                {formatCurrency(selectedVendor.balance_due)}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
