import React, { useState, useEffect } from 'react';
import { X, MoreVertical, Edit, Trash2, Plus, Clock, FileText, Building2, MapPin } from 'lucide-react';
import { Badge, Button, Input, Select, Card } from '@/components/atoms';
import { vendorApi, vendorTypeApi, paymentModeApi } from '@/services/api/vendor';
import { useVendorStore } from '@/store/vendorStore';
import type { Vendor, VendorStatus, VendorNote, VendorAuditLog } from '@/types';
import { INDIAN_STATES as STATES } from '@/types/vendor';

interface VendorDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    vendorDetails: Vendor | null;
    onUpdate?: () => void;
}

export const VendorDetailPanel: React.FC<VendorDrawerProps> = ({
    isOpen,
    onClose,
    vendorDetails: vendor, // Alias for backward compatibility/internal usage
    onUpdate = () => { },
}) => {
    const [isEditMode, setIsEditMode] = useState(false);
    const [showStatusMenu, setShowStatusMenu] = useState(false);
    const [notes, setNotes] = useState<VendorNote[]>([]);
    const [activityLogs, setActivityLogs] = useState<VendorAuditLog[]>([]);
    const [newNote, setNewNote] = useState('');
    const [isAddingNote, setIsAddingNote] = useState(false);
    const { vendorTypes, paymentModes, setVendorTypes, setPaymentModes } = useVendorStore();

    // Form state from previous implementation
    const [formData, setFormData] = useState({
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
    });

    useEffect(() => {
        if (vendor && isOpen) {
            setFormData({
                vendor_name: vendor.vendor_name || '',
                business_name: vendor.business_name || '',
                mobile_number: vendor.mobile_number || '',
                whatsapp_number: vendor.whatsapp_number || '',
                email: vendor.email || '',
                gst_number: vendor.gst_number || '',
                billing_address: vendor.billing_address || '',
                city: vendor.city || '',
                state: vendor.state || '',
                pincode: vendor.pincode || '',
                vendor_type_id: vendor.vendor_type?.id.toString() || '',
                payment_mode_id: vendor.payment_mode?.id.toString() || '',
            });
            loadNotesAndActivity();
            loadVendorTypesAndModes();
            setIsEditMode(false); // Reset edit mode when opening new vendor
        }
    }, [vendor, isOpen]);

    const loadVendorTypesAndModes = async () => {
        try {
            const [types, modes] = await Promise.all([
                vendorTypeApi.getAll(),
                paymentModeApi.getAll(),
            ]);
            setVendorTypes(types);
            setPaymentModes(modes);
        } catch (error) {
            console.error('Failed to load vendor types/modes:', error);
        }
    };

    const loadNotesAndActivity = async () => {
        if (!vendor) return;
        try {
            const [notesData, activityData] = await Promise.all([
                vendorApi.getNotes(vendor.id),
                vendorApi.getActivity(vendor.id),
            ]);
            setNotes(notesData);
            setActivityLogs(activityData);
        } catch (error) {
            console.error('Failed to load notes/activity:', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!vendor) return;
        try {
            const payload = {
                vendor_name: formData.vendor_name,
                business_name: formData.business_name || undefined,
                mobile_number: formData.mobile_number,
                whatsapp_number: formData.whatsapp_number || undefined,
                email: formData.email || undefined,
                gst_number: formData.gst_number || undefined,
                billing_address: formData.billing_address || undefined,
                city: formData.city || undefined,
                state: formData.state || undefined,
                pincode: formData.pincode || undefined,
                vendor_type_id: parseInt(formData.vendor_type_id),
                payment_mode_id: formData.payment_mode_id ? parseInt(formData.payment_mode_id) : undefined,
            };

            await vendorApi.update(vendor.id, payload);
            setIsEditMode(false);
            onUpdate();
        } catch (error) {
            console.error('Failed to save vendor:', error);
            // Ideally show toast
        }
    };

    const handleStatusChange = async (status: VendorStatus) => {
        if (!vendor) return;
        try {
            await vendorApi.changeStatus(vendor.id, status);
            setShowStatusMenu(false);
            onUpdate();
        } catch (error) {
            console.error('Failed to change status:', error);
        }
    };

    const handleAddNote = async () => {
        if (!vendor || !newNote.trim()) return;
        try {
            setIsAddingNote(true);
            const note = await vendorApi.createNote(vendor.id, newNote);
            setNotes([note, ...notes]);
            setNewNote('');
        } catch (error) {
            console.error('Failed to add note:', error);
        } finally {
            setIsAddingNote(false);
        }
    };

    const handleDeleteNote = async (noteId: number) => {
        if (!vendor) return;
        try {
            await vendorApi.deleteNote(vendor.id, noteId);
            setNotes(notes.filter(n => n.id !== noteId));
        } catch (error) {
            console.error('Failed to delete note:', error);
        }
    };

    const getStatusBadgeVariant = (status: VendorStatus) => {
        switch (status) {
            case 'active': return 'success';
            case 'inactive': return 'warning';
            case 'blacklisted': return 'danger';
            default: return 'default';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // If not open, don't render anything (or use CSS transition for better performance in actual DOM)
    // For simple implementation, conditional rendering + transition classes
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity cursor-pointer"
                onClick={onClose}
                aria-hidden="true"
            />

            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                <div className={`pointer-events-auto relative w-screen max-w-md md:max-w-none md:w-[35vw] transform transition-transform duration-500 ease-in-out bg-white shadow-xl ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

                    {/* Header - Sticky */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white sticky top-0 z-10 w-full">
                        <div className="flex flex-col">
                            <h2 className="text-lg font-semibold text-gray-900" id="slide-over-title">
                                {isEditMode ? 'Edit Vendor' : vendor?.vendor_name}
                            </h2>
                            {!isEditMode && vendor && (
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant={getStatusBadgeVariant(vendor.status)} className="capitalize px-2 py-0.5 text-xs">
                                        {vendor.status}
                                    </Badge>
                                    <span className="text-xs text-gray-400">#{vendor.vendor_no}</span>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            {!isEditMode && (
                                <>
                                    <button
                                        onClick={() => setIsEditMode(true)}
                                        className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
                                        title="Edit Vendor"
                                    >
                                        <Edit className="w-5 h-5" />
                                    </button>
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowStatusMenu(!showStatusMenu)}
                                            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
                                        >
                                            <MoreVertical className="w-5 h-5" />
                                        </button>
                                        {showStatusMenu && (
                                            <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg border border-gray-100 z-50 py-1">
                                                {(['active', 'inactive', 'blacklisted'] as VendorStatus[]).map((status) => (
                                                    <button
                                                        key={status}
                                                        onClick={() => handleStatusChange(status)}
                                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 capitalize ${status === 'blacklisted' ? 'text-red-600' : 'text-gray-700'
                                                            }`}
                                                    >
                                                        Mark as {status}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                            <button
                                onClick={onClose}
                                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Content - Scrollable */}
                    <div className="h-full overflow-y-auto pb-24">
                        {isEditMode ? (
                            <div className="p-6">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Edit Mode Content - Reused from previous implementation but slightly cleaner structure */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-medium text-gray-900 border-b pb-2">Basic Details</h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            <Input label="Vendor Name *" name="vendor_name" value={formData.vendor_name} onChange={handleChange} required />
                                            <Input label="Business Name" name="business_name" value={formData.business_name} onChange={handleChange} />
                                            <div className="grid grid-cols-2 gap-4">
                                                <Input label="Mobile *" name="mobile_number" value={formData.mobile_number} onChange={handleChange} required />
                                                <Input label="WhatsApp" name="whatsapp_number" value={formData.whatsapp_number} onChange={handleChange} />
                                            </div>
                                            <Input label="Email" name="email" value={formData.email} onChange={handleChange} />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-sm font-medium text-gray-900 border-b pb-2">Business & Address</h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            <Input label="GST Number" name="gst_number" value={formData.gst_number} onChange={handleChange} />
                                            <Input label="Address" name="billing_address" value={formData.billing_address} onChange={handleChange} />
                                            <div className="grid grid-cols-2 gap-4">
                                                <Input label="City" name="city" value={formData.city} onChange={handleChange} />
                                                <Select label="State" name="state" value={formData.state} onChange={handleChange}>
                                                    <option value="">Select State</option>
                                                    {STATES.map(state => <option key={state} value={state}>{state}</option>)}
                                                </Select>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <Input label="Pincode" name="pincode" value={formData.pincode} onChange={handleChange} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <Select name="vendor_type_id" value={formData.vendor_type_id} onChange={handleChange} required label="Type">
                                                    <option value="">Select Type</option>
                                                    {vendorTypes.filter(t => t.is_active).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                </Select>
                                                <Select name="payment_mode_id" value={formData.payment_mode_id} onChange={handleChange} label="Payment Mode">
                                                    <option value="">Select Mode</option>
                                                    {paymentModes.filter(m => m.is_active).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                                </Select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4 border-t">
                                        <Button type="button" variant="secondary" onClick={() => setIsEditMode(false)}>Cancel</Button>
                                        <Button type="submit" variant="primary">Save Changes</Button>
                                    </div>
                                </form>
                            </div>
                        ) : vendor && (
                            <div className="p-6 space-y-8">
                                {/* Section 1: Basic Information */}
                                <section className="space-y-3">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                        <FileText className="w-3.5 h-3.5" /> Basic Information
                                    </h3>
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                        <div className="grid grid-cols-3 gap-y-4">
                                            <div className="col-span-1">
                                                <p className="text-xs text-gray-500 mb-0.5">Primary Contact</p>
                                                <p className="text-sm font-medium text-gray-900">{vendor.vendor_name}</p>
                                            </div>
                                            <div className="col-span-1">
                                                <p className="text-xs text-gray-500 mb-0.5">Mobile</p>
                                                <p className="text-sm text-gray-900">{vendor.mobile_number}</p>
                                            </div>
                                            <div className="col-span-1">
                                                <p className="text-xs text-gray-500 mb-0.5">Note</p>
                                                <p className="text-sm text-gray-900 cursor-pointer text-blue-600 hover:underline" onClick={() => document.getElementById('notes-section')?.scrollIntoView({ behavior: 'smooth' })}>
                                                    {notes.length} notes
                                                </p>
                                            </div>
                                            <div className="col-span-1">
                                                <p className="text-xs text-gray-500 mb-0.5">Email</p>
                                                <p className="text-sm text-gray-900">{vendor.email || '-'}</p>
                                            </div>
                                            <div className="col-span-1">
                                                <p className="text-xs text-gray-500 mb-0.5">WhatsApp</p>
                                                <p className="text-sm text-gray-900">{vendor.whatsapp_number || '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Section 2: Business & Address */}
                                <section className="space-y-3">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                        <Building2 className="w-3.5 h-3.5" /> Business Details
                                    </h3>
                                    <div className="bg-white border boundary-gray-200 rounded-lg p-4 space-y-3 shadow-sm">
                                        <div className="grid grid-cols-2 gap-y-4">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-0.5">Business Name</p>
                                                <p className="text-sm font-medium text-gray-900">{vendor.business_name || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-0.5">GST Number</p>
                                                <p className="text-sm text-gray-900">{vendor.gst_number || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-0.5">Vendor Type</p>
                                                <Badge variant="default" className="text-xs">{vendor.vendor_type?.name || 'N/A'}</Badge>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-0.5">Billing Address</p>
                                                <p className="text-sm text-gray-900 max-w-xs">{vendor.billing_address || '-'}</p>
                                                {(vendor.city || vendor.state || vendor.pincode) && (
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {[vendor.city, vendor.state, vendor.pincode].filter(Boolean).join(', ')}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Section 3: Financials */}
                                <section className="space-y-3">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                        <Badge variant="default" className="h-5 w-auto px-1.5 py-0">₹</Badge> Financials
                                    </h3>
                                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                                        <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                                            <div className="col-span-1">
                                                <p className="text-xs text-gray-500 mb-0.5">Total Bills</p>
                                                <p className="text-lg font-bold text-gray-900">{vendor.total_bills || 0}</p>
                                            </div>
                                            <div className="col-span-1">
                                                <p className="text-xs text-gray-500 mb-0.5">Total Amount</p>
                                                <p className="text-lg font-bold text-gray-900">₹{vendor.total_amount?.toFixed(2) || '0.00'}</p>
                                            </div>
                                            <div className="col-span-1">
                                                <p className="text-xs text-gray-500 mb-0.5">Total Paid</p>
                                                <p className="text-lg font-bold text-green-600">₹{vendor.total_paid?.toFixed(2) || '0.00'}</p>
                                            </div>
                                            <div className="col-span-1">
                                                <p className="text-xs text-gray-500 mb-0.5">Balance Due</p>
                                                <p className="text-lg font-bold text-red-600">₹{vendor.balance_due?.toFixed(2) || '0.00'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Section 4: Notes & Timeline */}
                                <div className="border-t border-gray-200 pt-6" id="notes-section">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-semibold text-gray-900">Notes & Activity</h3>
                                        <span className="text-xs text-gray-400">Recent updates</span>
                                    </div>

                                    {/* Add Note Input */}
                                    <div className="flex gap-2 mb-6">
                                        <Input
                                            className="h-9 text-sm"
                                            placeholder="Write a note..."
                                            value={newNote}
                                            onChange={(e) => setNewNote(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
                                        />
                                        <Button
                                            variant="primary"
                                            onClick={handleAddNote}
                                            disabled={isAddingNote || !newNote.trim()}
                                            size="sm"
                                            className="flex-shrink-0"
                                        >
                                            Add
                                        </Button>
                                    </div>

                                    <div className="space-y-4">
                                        {notes.map((note) => (
                                            <div key={note.id} className="flex gap-3 group">
                                                <div className="relative border-l-2 border-yellow-200 pl-4 py-1">
                                                    <p className="text-sm text-gray-800">{note.note_text}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] text-gray-400 font-medium">{formatDate(note.created_at)}</span>
                                                        <button
                                                            onClick={() => handleDeleteNote(note.id)}
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {activityLogs.map((log) => (
                                            <div key={log.id} className="relative border-l-2 border-gray-100 pl-4 py-1">
                                                <p className="text-xs text-gray-600">{log.description}</p>
                                                <span className="text-[10px] text-gray-400">{formatDate(log.created_at)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
