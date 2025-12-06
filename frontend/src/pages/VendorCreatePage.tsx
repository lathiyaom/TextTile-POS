import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Card, Input, Button, Select, TextArea } from '@/components/atoms';
import { vendorApi, vendorTypeApi, paymentModeApi } from '@/services/api/vendor';
import { useVendorStore } from '@/store/vendorStore';
import {
    INDIAN_STATES,
    type VendorStatus,
    type VendorType,
    type PaymentMode,
    type VendorNote,
} from '@/types';

// NEW
import {
    SearchableSelect,
    type SearchableOption,
} from '@/components/atoms/SearchableSelect';
import {
    ManageGenericPanel,
    type GenericCrudApi,
} from '@/components/organisms/ManageGenericPanel';

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
        initial_note: '',
    });

    const [notes, setNotes] = useState<VendorNote[]>([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);

    // Panel states
    const [isManageTypesOpen, setIsManageTypesOpen] = useState(false);
    const [isManagePaymentsOpen, setIsManagePaymentsOpen] = useState(false);

    useEffect(() => {
        loadInitialData();
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
                // Load vendor details and notes in parallel
                const [vendor, vendorNotes] = await Promise.all([
                    vendorApi.getById(vendorId),
                    vendorApi.getNotes(vendorId),
                ]);

                setNotes(vendorNotes);
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
                    initial_note: '', // Reset note field for adding new notes
                });
            } else {
                const vendorNo = await vendorApi.generateVendorNo();
                setFormData((prev) => ({ ...prev, vendor_no: vendorNo }));
            }
        } catch (err: any) {
            setError('Failed to load initial data');
            console.error(err);
        } finally {
            setIsLoadingData(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
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

        // Note validation
        if (formData.initial_note.length > 1000) {
            setError('Note cannot exceed 1000 characters.');
            setIsLoading(false);
            return;
        }

        if (isEditMode && formData.initial_note.trim() && notes.length >= 3) {
            setError('Maximum 3 notes allowed. Please delete an existing note to add a new one.');
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
            payment_mode_id: formData.payment_mode_id
                ? parseInt(formData.payment_mode_id)
                : undefined,
            status: formData.status,
        };

        try {
            if (isEditMode && id) {
                await vendorApi.update(parseInt(id), payload);

                // Add new note if provided during update
                if (formData.initial_note.trim()) {
                    try {
                        await vendorApi.createNote(parseInt(id), formData.initial_note.trim());
                    } catch (noteErr) {
                        console.error('Failed to save note:', noteErr);
                    }
                }
            } else {
                const newVendor = await vendorApi.create(payload);

                // If there's an initial note, create it
                if (formData.initial_note.trim()) {
                    try {
                        await vendorApi.createNote(newVendor.id, formData.initial_note.trim());
                    } catch (noteErr) {
                        console.error('Failed to save initial note:', noteErr);
                    }
                }
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
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
                        <p className="text-gray-600 mt-4">Loading...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // Options
    const vendorTypeOptions: SearchableOption[] = vendorTypes
        .filter((t) => t.is_active)
        .map((t) => ({
            value: t.id.toString(),
            label: t.name,
        }));

    const paymentModeOptions: SearchableOption[] = paymentModes
        .filter((m) => m.is_active)
        .map((m) => ({
            value: m.id.toString(),
            label: m.name,
        }));

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isEditMode ? 'Edit Vendor' : 'Create New Vendor'}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {isEditMode
                            ? 'Update existing vendor information details'
                            : 'Add a new vendor to the system'}
                    </p>
                </div>

                <Card>
                    <form onSubmit={handleSubmit} className="space-y-6 p-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        <div className="max-w-xs">
                            <Input
                                label="Vendor Number"
                                name="vendor_no"
                                value={formData.vendor_no}
                                readOnly
                                disabled
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Vendor Name *"
                                name="vendor_name"
                                value={formData.vendor_name}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                label="Business/Company Name"
                                name="business_name"
                                value={formData.business_name}
                                onChange={handleChange}
                            />
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

                        <Input
                            label="Billing Address"
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
                            <Select
                                label="State"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                            >
                                <option value="">Select State</option>
                                {INDIAN_STATES.map((state) => (
                                    <option key={state} value={state}>
                                        {state}
                                    </option>
                                ))}
                            </Select>
                            <Input
                                label="Pincode"
                                name="pincode"
                                value={formData.pincode}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Vendor Type */}
                            <div className="space-y-1">
                                <SearchableSelect
                                    label="Vendor Type *"
                                    name="vendor_type_id"
                                    value={formData.vendor_type_id}
                                    options={vendorTypeOptions}
                                    placeholder="Select Vendor Type"
                                    onChange={(val) =>
                                        setFormData((prev) => ({ ...prev, vendor_type_id: val }))
                                    }
                                    manageLabel="Manage types…"
                                    onManageClick={() => setIsManageTypesOpen(true)}
                                />
                            </div>

                            {/* Payment Mode */}
                            <div className="space-y-1">
                                <SearchableSelect
                                    label="Payment Mode Preference"
                                    name="payment_mode_id"
                                    value={formData.payment_mode_id}
                                    options={paymentModeOptions}
                                    placeholder="Select Payment Mode"
                                    onChange={(val) =>
                                        setFormData((prev) => ({ ...prev, payment_mode_id: val }))
                                    }
                                    manageLabel="Manage modes…"
                                    onManageClick={() => setIsManagePaymentsOpen(true)}
                                />
                            </div>
                        </div>

                        {/* Recent Notes Display (Edit Mode Only) */}
                        {isEditMode && notes.length > 0 && (
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-700">Previous Notes</label>
                                <div className="bg-slate-50 rounded-md p-4 space-y-3 max-h-48 overflow-y-auto border border-slate-200">
                                    {notes.map((note) => (
                                        <div key={note.id} className="text-sm text-slate-600 border-b border-slate-100 last:border-0 pb-2 last:pb-0">
                                            <p>{note.note_text}</p>
                                            <span className="text-xs text-slate-400 mt-1 block">
                                                {new Date(note.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Note Input */}
                        <TextArea
                            label={isEditMode ? 'Add a new note' : 'Remarks / Initial Note'}
                            name="initial_note"
                            value={formData.initial_note}
                            onChange={handleChange}
                            placeholder={isEditMode ? 'Add a new note...' : 'Add any initial remarks about this vendor...'}
                            rows={3}
                        />

                        <div className="flex justify-end space-x-4 pt-4 border-t">
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
                    </form>
                </Card>

                {/* Manage Vendor Types */}
                <ManageGenericPanel
                    isOpen={isManageTypesOpen}
                    onClose={() => setIsManageTypesOpen(false)}
                    title="Manage Vendor Types"
                    itemLabel="Vendor Type"
                    items={vendorTypes}
                    onItemsChange={(items) => setVendorTypes(items as VendorType[])}
                    api={vendorTypeApi as GenericCrudApi}
                    onItemCreated={(item) =>
                        setFormData((prev) => ({
                            ...prev,
                            vendor_type_id: item.id.toString(),
                        }))
                    }
                />

                {/* Manage Payment Modes */}
                <ManageGenericPanel
                    isOpen={isManagePaymentsOpen}
                    onClose={() => setIsManagePaymentsOpen(false)}
                    title="Manage Payment Modes"
                    itemLabel="Payment Mode"
                    items={paymentModes}
                    onItemsChange={(items) => setPaymentModes(items as PaymentMode[])}
                    api={paymentModeApi as GenericCrudApi}
                    onItemCreated={(item) =>
                        setFormData((prev) => ({
                            ...prev,
                            payment_mode_id: item.id.toString(),
                        }))
                    }
                />
            </div>
        </DashboardLayout>
    );
};
