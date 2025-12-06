import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Card, Input, Button, Select, Modal } from '@/components/atoms';
import { SearchableSelect } from '@/components/atoms/SearchableSelect';
import { vendorApi, vendorTypeApi, paymentModeApi } from '@/services/api/vendor';
import { useVendorStore } from '@/store/vendorStore';
import { INDIAN_STATES, type VendorStatus, type VendorType, type PaymentMode } from '@/types';
import { Plus } from 'lucide-react';

export const VendorCreatePage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;

    const { vendorTypes, paymentModes, setVendorTypes, setPaymentModes } = useVendorStore();

    const [formData, setFormData] = useState({
        vendor_no: '',
        vendor_name: '',
        business_name: '',
        mobile_number: '',
        whatsapp_number: '',
        email: '',
        gst_number: '',
        billing_address: '',
        city: '',
        state: '',
        pincode: '',
        vendor_type_id: '',
        payment_mode_id: '',
        status: 'active' as VendorStatus,
    });

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
    const [newTypeName, setNewTypeName] = useState('');
    const [isCreatingType, setIsCreatingType] = useState(false);

    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [newPaymentName, setNewPaymentName] = useState('');
    const [isCreatingPayment, setIsCreatingPayment] = useState(false);

    const stateOptions = useMemo(() => INDIAN_STATES.map((s) => ({
        value: s,
        label: s,
    })), []);

    useEffect(() => {
        loadInitialData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const loadInitialData = async () => {
        try {
            setIsLoadingData(true);
            const [types, modes] = await Promise.all([
                vendorTypeApi.getAll(),
                paymentModeApi.getAll(),
            ]);

            setVendorTypes(types);
            setPaymentModes(modes);

            if (isEditMode && id) {
                const vendorId = parseInt(id);
                const vendor = await vendorApi.getById(vendorId);

                setFormData({
                    vendor_no: vendor.vendor_no,
                    vendor_name: vendor.vendor_name,
                    business_name: vendor.business_name || '',
                    mobile_number: vendor.mobile_number,
                    whatsapp_number: vendor.whatsapp_number || '',
                    email: vendor.email || '',
                    gst_number: vendor.gst_number || '',
                    billing_address: vendor.billing_address || '',
                    city: vendor.city || '',
                    state: vendor.state || '',
                    pincode: vendor.pincode || '',
                    vendor_type_id: vendor.vendor_type?.id.toString() || '',
                    payment_mode_id: vendor.payment_mode?.id.toString() || '',
                    status: vendor.status,
                });
            } else {
                const vendorNo = await vendorApi.generateVendorNo();
                setFormData(prev => ({ ...prev, vendor_no: vendorNo }));
            }
        } catch (err: any) {
            setError('Failed to load initial data');
            console.error(err);
        } finally {
            setIsLoadingData(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleCreateType = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTypeName.trim()) return;

        setIsCreatingType(true);
        try {
            const newType: VendorType = await vendorTypeApi.create({ name: newTypeName });
            setVendorTypes([...vendorTypes, newType]);
            setFormData(prev => ({
                ...prev,
                vendor_type_id: newType.id.toString(),
            }));
            setIsTypeModalOpen(false);
            setNewTypeName('');
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to create vendor type');
        } finally {
            setIsCreatingType(false);
        }
    };

    const handleCreatePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPaymentName.trim()) return;

        setIsCreatingPayment(true);
        try {
            const newMode: PaymentMode = await paymentModeApi.create({ name: newPaymentName });
            setPaymentModes([...paymentModes, newMode]);
            setFormData(prev => ({
                ...prev,
                payment_mode_id: newMode.id.toString(),
            }));
            setIsPaymentModalOpen(false);
            setNewPaymentName('');
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to create payment mode preference');
        } finally {
            setIsCreatingPayment(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!formData.vendor_name.trim()) {
            setError('Vendor Name is required.');
            setIsLoading(false);
            return;
        }
        if (!formData.mobile_number.trim()) {
            setError('Mobile Number is required.');
            setIsLoading(false);
            return;
        }
        if (!formData.vendor_type_id) {
            setError('Vendor Type is required.');
            setIsLoading(false);
            return;
        }

        const payload = {
            vendor_name: formData.vendor_name.trim(),
            business_name: formData.business_name || undefined,
            mobile_number: formData.mobile_number.trim(),
            whatsapp_number: formData.whatsapp_number || undefined,
            email: formData.email || undefined,
            gst_number: formData.gst_number || undefined,
            billing_address: formData.billing_address || undefined,
            city: formData.city || undefined,
            state: formData.state || undefined,
            pincode: formData.pincode || undefined,
            vendor_type_id: parseInt(formData.vendor_type_id),
            payment_mode_id: formData.payment_mode_id ? parseInt(formData.payment_mode_id) : undefined,
            status: formData.status,
        };

        try {
            if (isEditMode && id) {
                await vendorApi.update(parseInt(id), payload);
            } else {
                await vendorApi.create(payload);
            }
            navigate('/vendors');
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                `Failed to ${isEditMode ? 'update' : 'create'} vendor`
            );
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoadingData) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                        <p className="text-gray-600 mt-4">Loading vendor details...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Page Header */}
                <div className="flex flex-col gap-2">
                    <p className="text-xs text-gray-400">
                        Purchases / Vendors /{' '}
                        <span className="text-gray-500">
                            {isEditMode ? 'Edit Vendor' : 'New Vendor'}
                        </span>
                    </p>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
                                {isEditMode ? 'Edit Vendor' : 'Create New Vendor'}
                            </h1>
                            <p className="text-gray-600 text-sm mt-1">
                                {isEditMode
                                    ? 'Update existing vendor information.'
                                    : 'Add a new vendor your business deals with.'}
                            </p>
                        </div>

                        {/* Slim summary on the right */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600">
                            <div className="flex items-center justify-between gap-4">
                                <span className="font-medium text-gray-700">Vendor No.</span>
                                <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-white border border-gray-200">
                                    {formData.vendor_no || 'Generating...'}
                                </span>
                            </div>
                            <div className="mt-1 flex items-center justify-between gap-4">
                                <span>Status</span>
                                <Select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="blacklisted">Blacklisted</option>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>

                <Card>
                    <form onSubmit={handleSubmit} className="space-y-8 p-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {/* Basic Details */}
                        <section className="space-y-4">
                            <div>
                                <h2 className="text-sm font-semibold text-gray-900">
                                    Basic Details
                                </h2>
                                <p className="text-xs text-gray-500">
                                    Identify this vendor in your books. Fields marked * are required.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input
                                    label="Vendor Number"
                                    name="vendor_no"
                                    value={formData.vendor_no}
                                    readOnly
                                    disabled
                                />
                                <Input
                                    label="Vendor Name *"
                                    name="vendor_name"
                                    value={formData.vendor_name}
                                    onChange={handleChange}
                                    required
                                />
                                <Input
                                    label="Business / Company Name"
                                    name="business_name"
                                    value={formData.business_name}
                                    onChange={handleChange}
                                />
                            </div>
                        </section>

                        {/* Contact & Tax */}
                        <section className="space-y-4">
                            <div>
                                <h2 className="text-sm font-semibold text-gray-900">
                                    Contact & Tax
                                </h2>
                                <p className="text-xs text-gray-500">
                                    How do you reach this vendor and record their tax information?
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Mobile Number *"
                                    name="mobile_number"
                                    value={formData.mobile_number}
                                    onChange={handleChange}
                                    required
                                />
                                <Input
                                    label="WhatsApp Number"
                                    name="whatsapp_number"
                                    value={formData.whatsapp_number}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                                <Input
                                    label="GST Number"
                                    name="gst_number"
                                    value={formData.gst_number}
                                    onChange={handleChange}
                                />
                            </div>
                        </section>

                        {/* Address */}
                        <section className="space-y-4">
                            <div>
                                <h2 className="text-sm font-semibold text-gray-900">
                                    Billing Address
                                </h2>
                                <p className="text-xs text-gray-500">
                                    This address will appear on your purchase documents.
                                </p>
                            </div>

                            <Input
                                label="Street / Area"
                                name="billing_address"
                                value={formData.billing_address}
                                onChange={handleChange}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input
                                    label="City"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                />
                                <SearchableSelect
                                    label="State"
                                    name="state"
                                    value={formData.state}
                                    options={stateOptions}
                                    placeholder="Select State"
                                    onChange={(val) =>
                                        setFormData((prev) => ({ ...prev, state: val }))
                                    }
                                />
                                <Input
                                    label="Pincode"
                                    name="pincode"
                                    value={formData.pincode}
                                    onChange={handleChange}
                                />
                            </div>
                        </section>

                        {/* Preferences */}
                        <section className="space-y-4">
                            <div>
                                <h2 className="text-sm font-semibold text-gray-900">
                                    Preferences
                                </h2>
                                <p className="text-xs text-gray-500">
                                    Classify this vendor and set payment preferences.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium text-gray-700">
                                            Vendor Type *
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setIsTypeModalOpen(true)}
                                            className="text-primary-600 hover:text-primary-700 text-xs font-semibold flex items-center"
                                        >
                                            <Plus className="w-3 h-3 mr-1" />
                                            Add
                                        </button>
                                    </div>
                                    <Select
                                        name="vendor_type_id"
                                        value={formData.vendor_type_id}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Vendor Type</option>
                                        {vendorTypes
                                            .filter(t => t.is_active)
                                            .map(type => (
                                                <option key={type.id} value={type.id}>
                                                    {type.name}
                                                </option>
                                            ))}
                                    </Select>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium text-gray-700">
                                            Payment Mode Preference
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setIsPaymentModalOpen(true)}
                                            className="text-primary-600 hover:text-primary-700 text-xs font-semibold flex items-center"
                                        >
                                            <Plus className="w-3 h-3 mr-1" />
                                            Add
                                        </button>
                                    </div>
                                    <Select
                                        name="payment_mode_id"
                                        value={formData.payment_mode_id}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Payment Mode</option>
                                        {paymentModes
                                            .filter(m => m.is_active)
                                            .map(mode => (
                                                <option key={mode.id} value={mode.id}>
                                                    {mode.name}
                                                </option>
                                            ))}
                                    </Select>
                                </div>
                            </div>
                        </section>

                        {/* Actions */}
                        <section className="pt-4 border-t flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <p className="text-xs text-gray-500">
                                You can change these details later from the vendor profile.
                            </p>
                            <div className="flex justify-end space-x-4">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => navigate('/vendors')}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    isLoading={isLoading}
                                >
                                    {isEditMode ? 'Update Vendor' : 'Create Vendor'}
                                </Button>
                            </div>
                        </section>
                    </form>
                </Card>
            </div>

            {/* Vendor Type Modal */}
            <Modal
                isOpen={isTypeModalOpen}
                onClose={() => setIsTypeModalOpen(false)}
                title="Create New Vendor Type"
            >
                <form onSubmit={handleCreateType} className="space-y-4">
                    <Input
                        label="Vendor Type Name *"
                        value={newTypeName}
                        onChange={(e) => setNewTypeName(e.target.value)}
                        placeholder="e.g. Wholesale, Retail"
                        required
                        autoFocus
                    />
                    <div className="flex justify-end space-x-3 mt-6">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsTypeModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={isCreatingType}
                        >
                            Create Type
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Payment Mode Modal */}
            <Modal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                title="Create Payment Mode Preference"
            >
                <form onSubmit={handleCreatePayment} className="space-y-4">
                    <Input
                        label="Payment Mode Name *"
                        value={newPaymentName}
                        onChange={(e) => setNewPaymentName(e.target.value)}
                        placeholder="e.g. Cash, UPI, Bank Transfer"
                        required
                        autoFocus
                    />
                    <div className="flex justify-end space-x-3 mt-6">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsPaymentModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={isCreatingPayment}
                        >
                            Create Payment Mode
                        </Button>
                    </div>
                </form>
            </Modal>
        </DashboardLayout>
    );
};
