import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Card, Input, Select, Button, SearchableSelect } from '@/components/atoms';
import { VendorSelector, LineItemsSection, ManageGenericPanel } from '@/components/organisms';
import { useBillStore } from '@/store/billStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useVendorStore } from '@/store/vendorStore';
import { useBillCalculations } from '@/hooks/useBillCalculations';
import { billApi } from '@/services/api/bill';
import { posSettingsApi, paymentTypeApi } from '@/services/api/bill';
import { paymentModeApi } from '@/services/api/vendor';
import type { Vendor, BillCreateRequest } from '@/types';
import { getValidLineItems, validateAtLeastOneItem } from '@/utils/lineItemUtils';
import { FileText, Save, X } from 'lucide-react';

export const BillCreatePage: React.FC = () => {
    const navigate = useNavigate();
    const { draft, setDraft, resetDraft } = useBillStore();
    const { settings, paymentTypes, setSettings, setPaymentTypes } = useSettingsStore();
    const { paymentModes, setPaymentModes } = useVendorStore();

    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [showPaymentTypeModal, setShowPaymentTypeModal] = useState(false);
    const [showPaymentModeModal, setShowPaymentModeModal] = useState(false);

    // Calculate totals
    const calculations = useBillCalculations({
        items: draft.items,
        discountType: draft.discountType,
        discountPercentage: draft.discountPercentage,
        discountAmount: draft.discountAmount,
        vendor: selectedVendor,
        settings,
        customRoundOff: draft.roundOffAmount,
        advanceAmountPaid: draft.advanceAmountPaid,
    });

    useEffect(() => {
        loadInitialData();
        return () => resetDraft();
    }, []);

    useEffect(() => {
        // Auto-calculate next payment due date
        if (settings && draft.billDate && calculations.amountDue > 0) {
            const billDate = new Date(draft.billDate);
            const dueDate = new Date(billDate);
            dueDate.setDate(dueDate.getDate() + settings.default_payment_terms_days);
            setDraft({ nextPaymentDueDate: dueDate.toISOString().split('T')[0] });
        }
    }, [draft.billDate, calculations.amountDue, settings]);

    const loadInitialData = async () => {
        try {
            const [settingsData, paymentTypesData, paymentModesData] = await Promise.all([
                posSettingsApi.get(),
                paymentTypeApi.getAll(),
                paymentModeApi.getAll(),
            ]);
            setSettings(settingsData);
            setPaymentTypes(paymentTypesData);
            setPaymentModes(paymentModesData);
        } catch (error) {
            console.error('Failed to load initial data:', error);
        }
    };

    const handleVendorChange = (vendorId: number, vendor: Vendor) => {
        setSelectedVendor(vendor);
        setDraft({ vendorId, vendor });
        setErrors({ ...errors, vendor: '' });
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!draft.vendorId) {
            newErrors.vendor = 'Vendor is required';
        }

        if (!draft.billDate) {
            newErrors.billDate = 'Bill date is required';
        }

        if (!draft.paymentTypeId) {
            newErrors.paymentType = 'Payment type is required';
        }

        // Validate line items using the proper validation function
        const itemsValidation = validateAtLeastOneItem(draft.items);
        if (!itemsValidation.isValid) {
            newErrors.items = itemsValidation.error || 'At least one item is required';
        }

        if (draft.advanceAmountPaid > 0 && !draft.paymentModeId) {
            newErrors.paymentMode = 'Payment mode is required when advance amount is paid';
        }

        // Check GST number for inter-state
        if (!calculations.isIntraState && calculations.igstAmount > 0 && !selectedVendor?.gst_number) {
            newErrors.vendor = 'Vendor GST number is required for inter-state transactions with GST';
        }

        setErrors(newErrors);
        setTouched({ vendor: true, billDate: true, paymentType: true, items: true, paymentMode: true });
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) {
            alert('Please fix the errors before saving');
            return;
        }

        setIsSaving(true);
        try {
            // Get only valid line items (filters out placeholders)
            const validItems = getValidLineItems(draft.items);

            const requestData: BillCreateRequest = {
                bill_date: draft.billDate,
                vendor_id: draft.vendorId!,
                payment_type_id: draft.paymentTypeId!,
                items: validItems.map((item) => ({
                    item_name: item.itemName,
                    item_category: item.categoryName || '',
                    quantity: item.qty || 0,
                    unit: item.unitName || '',
                    rate: item.rate || 0,
                    gst_percentage: item.gstPercent || 0,
                })),
                discount_type: draft.discountType,
                discount_percentage: draft.discountPercentage,
                discount_amount: draft.discountAmount,
                round_off_amount: settings?.allow_per_bill_round_off_override ? draft.roundOffAmount : undefined,
                advance_amount_paid: draft.advanceAmountPaid,
                payment_mode_id: draft.paymentModeId || undefined,
                next_payment_due_date: draft.nextPaymentDueDate || undefined,
                payment_remarks: draft.paymentRemarks,
            };

            const bill = await billApi.create(requestData);
            alert(`Bill ${bill.bill_number} created successfully!`);
            navigate('/bills');
        } catch (error: any) {
            alert(error?.response?.data?.error || 'Failed to create bill');
        } finally {
            setIsSaving(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const activePaymentTypes = paymentTypes.filter((pt) => pt.is_active);
    const activePaymentModes = paymentModes.filter((pm) => pm.is_active);

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6 text-primary-600" />
                        <h1 className="text-2xl font-semibold text-gray-900">Create Bill</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="secondary" onClick={() => navigate('/bills')}>
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleSave} isLoading={isSaving}>
                            <Save className="w-4 h-4 mr-1" />
                            Save Bill
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    {/* Left Column - Form */}
                    <div className="col-span-2 space-y-6">
                        {/* Basic Information */}
                        <Card>
                            <div className="p-6 space-y-4">
                                <h2 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h2>

                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        type="date"
                                        label="Bill Date *"
                                        value={draft.billDate}
                                        onChange={(e) => setDraft({ billDate: e.target.value })}
                                        error={errors.billDate}
                                    />

                                    <div>
                                        <SearchableSelect
                                            label="Payment Type *"
                                            name="paymentType"
                                            value={draft.paymentTypeId?.toString() || ''}
                                            options={activePaymentTypes.map((pt) => ({
                                                value: pt.id.toString(),
                                                label: pt.name,
                                            }))}
                                            placeholder="Select payment type"
                                            onChange={(value) => setDraft({ paymentTypeId: parseInt(value) })}
                                            manageLabel="Manage Payment Types"
                                            onManageClick={() => setShowPaymentTypeModal(true)}
                                        />
                                        {errors.paymentType && (
                                            <p className="text-xs text-red-600 mt-1">{errors.paymentType}</p>
                                        )}
                                    </div>
                                </div>

                                <VendorSelector
                                    value={draft.vendorId}
                                    onChange={handleVendorChange}
                                    error={errors.vendor}
                                />
                            </div>
                        </Card>

                        {/* Line Items */}
                        <Card>
                            <div className="p-6">
                                <LineItemsSection
                                    value={draft.items}
                                    onChange={(items) => setDraft({ items })}
                                    error={errors.items}
                                    touched={touched.items}
                                />
                            </div>
                        </Card>

                        {/* Discount */}
                        <Card>
                            <div className="p-6 space-y-4">
                                <h2 className="text-lg font-medium text-gray-900 border-b pb-2">Discount</h2>

                                <div className="grid grid-cols-3 gap-4">
                                    <Select
                                        label="Discount Type"
                                        value={draft.discountType}
                                        onChange={(e) =>
                                            setDraft({ discountType: e.target.value as any, discountAmount: 0 })
                                        }
                                    >
                                        <option value="None">None</option>
                                        <option value="Percentage">Percentage</option>
                                        <option value="Amount">Amount</option>
                                    </Select>

                                    {draft.discountType === 'Percentage' && (
                                        <Input
                                            type="number"
                                            label="Discount %"
                                            value={draft.discountPercentage}
                                            onChange={(e) => setDraft({ discountPercentage: parseFloat(e.target.value) })}
                                            min={0}
                                            max={100}
                                            step={0.01}
                                        />
                                    )}

                                    {draft.discountType === 'Amount' && (
                                        <Input
                                            type="number"
                                            label="Discount Amount"
                                            value={draft.discountAmount}
                                            onChange={(e) => setDraft({ discountAmount: parseFloat(e.target.value) })}
                                            min={0}
                                            step={0.01}
                                        />
                                    )}
                                </div>
                            </div>
                        </Card>

                        {/* Advance Payment */}
                        <Card>
                            <div className="p-6 space-y-4">
                                <h2 className="text-lg font-medium text-gray-900 border-b pb-2">Advance Payment</h2>

                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        type="number"
                                        label="Advance Amount Paid"
                                        value={draft.advanceAmountPaid}
                                        onChange={(e) => setDraft({ advanceAmountPaid: parseFloat(e.target.value) || 0 })}
                                        min={0}
                                        step={0.01}
                                    />

                                    <div>
                                        <SearchableSelect
                                            label={`Payment Mode ${draft.advanceAmountPaid > 0 ? '*' : ''}`}
                                            name="paymentMode"
                                            value={draft.paymentModeId?.toString() || ''}
                                            options={activePaymentModes.map((pm) => ({
                                                value: pm.id.toString(),
                                                label: `${pm.name} (${pm.category})`,
                                            }))}
                                            placeholder="Select payment mode"
                                            onChange={(value) => setDraft({ paymentModeId: parseInt(value) })}
                                            disabled={draft.advanceAmountPaid === 0}
                                            manageLabel="Manage Payment Modes"
                                            onManageClick={() => setShowPaymentModeModal(true)}
                                        />
                                        {errors.paymentMode && (
                                            <p className="text-xs text-red-600 mt-1">{errors.paymentMode}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        type="date"
                                        label="Next Payment Due Date"
                                        value={draft.nextPaymentDueDate}
                                        onChange={(e) => setDraft({ nextPaymentDueDate: e.target.value })}
                                    />

                                    <Input
                                        type="text"
                                        label="Payment Remarks"
                                        value={draft.paymentRemarks}
                                        onChange={(e) => setDraft({ paymentRemarks: e.target.value })}
                                        placeholder="e.g., ₹2000 paid at bill creation"
                                        maxLength={500}
                                    />
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right Column - Summary */}
                    <div className="space-y-6">
                        <Card>
                            <div className="p-6 space-y-3 sticky top-6">
                                <h2 className="text-lg font-medium text-gray-900 border-b pb-2">Bill Summary</h2>

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal:</span>
                                        <span className="font-medium">{formatCurrency(calculations.subtotal)}</span>
                                    </div>

                                    {calculations.calculatedDiscountAmount > 0 && (
                                        <div className="flex justify-between text-red-600">
                                            <span>Discount:</span>
                                            <span>-{formatCurrency(calculations.calculatedDiscountAmount)}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between pt-2 border-t border-gray-200">
                                        <span className="text-gray-600">Taxable Amount:</span>
                                        <span className="font-medium">{formatCurrency(calculations.taxableAmount)}</span>
                                    </div>

                                    {calculations.cgstAmount > 0 && (
                                        <>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-500">CGST:</span>
                                                <span>{formatCurrency(calculations.cgstAmount)}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-500">SGST:</span>
                                                <span>{formatCurrency(calculations.sgstAmount)}</span>
                                            </div>
                                        </>
                                    )}

                                    {calculations.igstAmount > 0 && (
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-500">IGST:</span>
                                            <span>{formatCurrency(calculations.igstAmount)}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total GST:</span>
                                        <span className="font-medium">{formatCurrency(calculations.totalGstAmount)}</span>
                                    </div>

                                    {settings?.enable_bill_round_off && (
                                        <>
                                            <div className="flex justify-between text-xs pt-2 border-t border-gray-200">
                                                <span className="text-gray-500">Raw Grand Total:</span>
                                                <span>{formatCurrency(calculations.rawGrandTotal)}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-gray-500">Round-Off:</span>
                                                {settings.allow_per_bill_round_off_override ? (
                                                    <Input
                                                        type="number"
                                                        value={draft.roundOffAmount}
                                                        onChange={(e) =>
                                                            setDraft({ roundOffAmount: parseFloat(e.target.value) || 0 })
                                                        }
                                                        step={0.01}
                                                        className="w-24 text-xs text-right"
                                                    />
                                                ) : (
                                                    <span>{formatCurrency(calculations.roundOffAmount)}</span>
                                                )}
                                            </div>
                                        </>
                                    )}

                                    <div className="flex justify-between pt-2 border-t-2 border-gray-300 text-base font-semibold">
                                        <span>Grand Total:</span>
                                        <span>{formatCurrency(calculations.grandTotal)}</span>
                                    </div>

                                    {draft.advanceAmountPaid > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Advance Paid:</span>
                                            <span>-{formatCurrency(draft.advanceAmountPaid)}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between pt-2 border-t-2 border-gray-300 text-base font-semibold text-primary-600">
                                        <span>Amount Due:</span>
                                        <span>{formatCurrency(calculations.amountDue)}</span>
                                    </div>
                                </div>

                                {settings && calculations.grandTotal >= settings.eway_bill_threshold_amount && (
                                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                                        <p className="text-xs text-amber-800 font-medium">E-Way Bill Required</p>
                                        <p className="text-xs text-amber-600 mt-1">
                                            Grand total exceeds ₹{settings.eway_bill_threshold_amount.toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showPaymentTypeModal && (
                <ManageGenericPanel
                    isOpen={showPaymentTypeModal}
                    onClose={() => setShowPaymentTypeModal(false)}
                    title="Manage Payment Types"
                    itemLabel="Payment Type"
                    items={paymentTypes}
                    onItemsChange={(items) => setPaymentTypes(items as any)}
                    api={paymentTypeApi as any}
                />
            )}

            {showPaymentModeModal && (
                <ManageGenericPanel
                    isOpen={showPaymentModeModal}
                    onClose={() => setShowPaymentModeModal(false)}
                    title="Manage Payment Modes"
                    itemLabel="Payment Mode"
                    items={paymentModes}
                    onItemsChange={(items) => setPaymentModes(items as any)}
                    api={paymentModeApi as any}
                />
            )}
        </DashboardLayout>
    );
};
