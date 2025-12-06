import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, MoreVertical, Edit, Trash2, FileText, Building2 } from 'lucide-react';
import { Badge, Button, TextArea } from '@/components/atoms';
import { vendorApi } from '@/services/api/vendor';
import type { Vendor, VendorStatus, VendorNote, VendorAuditLog } from '@/types';

interface VendorDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    vendorDetails: Vendor | null;
    onUpdate?: () => void;
}

const MAX_NOTES = 3;
const MAX_NOTE_LENGTH = 1000;

export const VendorDetailPanel: React.FC<VendorDrawerProps> = ({
    isOpen,
    onClose,
    vendorDetails: vendor,
    onUpdate = () => { },
}) => {
    const navigate = useNavigate();
    const [showStatusMenu, setShowStatusMenu] = useState(false);
    const [notes, setNotes] = useState<VendorNote[]>([]);
    const [activityLogs, setActivityLogs] = useState<VendorAuditLog[]>([]);

    const [newNote, setNewNote] = useState('');
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [noteError, setNoteError] = useState('');

    // edit state for a note
    const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
    const [editingNoteText, setEditingNoteText] = useState('');
    const [isUpdatingNoteId, setIsUpdatingNoteId] = useState<number | null>(null);

    useEffect(() => {
        if (vendor && isOpen) {
            loadNotesAndActivity();
        }
    }, [vendor, isOpen]);

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

    const validateNewNote = (text: string): string => {
        if (!text.trim()) return 'Note cannot be empty.';
        if (text.length > MAX_NOTE_LENGTH) {
            return `Note cannot be longer than ${MAX_NOTE_LENGTH} characters.`;
        }
        if (notes.length >= MAX_NOTES) {
            return `You can add only ${MAX_NOTES} notes for this vendor.`;
        }
        return '';
    };

    const handleAddNote = async () => {
        if (!vendor) return;

        const validationError = validateNewNote(newNote);
        if (validationError) {
            setNoteError(validationError);
            return;
        }

        try {
            setIsAddingNote(true);
            setNoteError('');
            const note = await vendorApi.createNote(vendor.id, newNote.trim());
            setNotes([note, ...notes]);
            setNewNote('');
        } catch (error) {
            console.error('Failed to add note:', error);
            setNoteError('Failed to add note. Please try again.');
        } finally {
            setIsAddingNote(false);
        }
    };

    const handleDeleteNote = async (noteId: number) => {
        if (!vendor) return;
        const confirmDelete = window.confirm('Delete this note? This action cannot be undone.');
        if (!confirmDelete) return;

        try {
            await vendorApi.deleteNote(vendor.id, noteId);
            setNotes(notes.filter((n) => n.id !== noteId));
        } catch (error) {
            console.error('Failed to delete note:', error);
        }
    };

    const startEditNote = (note: VendorNote) => {
        setEditingNoteId(note.id);
        setEditingNoteText(note.note_text);
        setNoteError('');
    };

    const cancelEditNote = () => {
        setEditingNoteId(null);
        setEditingNoteText('');
        setNoteError('');
    };

    const handleUpdateNote = async () => {
        if (!vendor || editingNoteId === null) return;

        if (!editingNoteText.trim()) {
            setNoteError('Note cannot be empty.');
            return;
        }
        if (editingNoteText.length > MAX_NOTE_LENGTH) {
            setNoteError(`Note cannot be longer than ${MAX_NOTE_LENGTH} characters.`);
            return;
        }

        try {
            setIsUpdatingNoteId(editingNoteId);
            setNoteError('');
            // assumes you have an API like this:
            // vendorApi.updateNote(vendorId, noteId, text)
            const updated = await vendorApi.updateNote(vendor.id, editingNoteId, editingNoteText.trim());
            setNotes((prev) =>
                prev.map((n) => (n.id === editingNoteId ? { ...n, ...updated } : n))
            );
            setEditingNoteId(null);
            setEditingNoteText('');
        } catch (error) {
            console.error('Failed to update note:', error);
            setNoteError('Failed to update note. Please try again.');
        } finally {
            setIsUpdatingNoteId(null);
        }
    };

    const getStatusBadgeVariant = (status: VendorStatus) => {
        switch (status) {
            case 'active':
                return 'success';
            case 'inactive':
                return 'warning';
            case 'blacklisted':
                return 'danger';
            default:
                return 'default';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (!isOpen) return null;

    const remainingNotes = Math.max(0, MAX_NOTES - notes.length);
    const currentNoteLength = editingNoteId ? editingNoteText.length : newNote.length;
    const isAtMaxNotes = notes.length >= MAX_NOTES;

    return (
        <div
            className="fixed inset-0 z-50 overflow-hidden"
            aria-labelledby="slide-over-title"
            role="dialog"
            aria-modal="true"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity cursor-pointer"
                onClick={onClose}
                aria-hidden="true"
            />

            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                <div
                    className={`pointer-events-auto relative w-screen max-w-md md:max-w-none md:w-[35vw] transform transition-transform duration-500 ease-in-out bg-white shadow-xl ${isOpen ? 'translate-x-0' : 'translate-x-full'
                        }`}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white sticky top-0 z-10 w-full">
                        <div className="flex flex-col">
                            <h2 className="text-lg font-semibold text-gray-900" id="slide-over-title">
                                {vendor?.vendor_name}
                            </h2>
                            {vendor && (
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge
                                        variant={getStatusBadgeVariant(vendor.status)}
                                        className="capitalize px-2 py-0.5 text-xs"
                                    >
                                        {vendor.status}
                                    </Badge>
                                    <span className="text-xs text-gray-400">#{vendor.vendor_no}</span>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <>
                                <button
                                    onClick={() => {
                                        if (vendor) {
                                            onClose();
                                            navigate(`/vendors/edit/${vendor.id}`);
                                        }
                                    }}
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
                                            {(['active', 'inactive', 'blacklisted'] as VendorStatus[]).map(
                                                (status) => (
                                                    <button
                                                        key={status}
                                                        onClick={() => handleStatusChange(status)}
                                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 capitalize ${status === 'blacklisted'
                                                            ? 'text-red-600'
                                                            : 'text-gray-700'
                                                            }`}
                                                    >
                                                        Mark as {status}
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>
                            </>
                            <button
                                onClick={onClose}
                                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="h-full overflow-y-auto pb-24">
                        {vendor && (
                            <div className="p-6 space-y-8">
                                {/* Basic Information */}
                                <section className="space-y-3">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                        <FileText className="w-3.5 h-3.5" /> Basic Information
                                    </h3>
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                        <div className="grid grid-cols-3 gap-y-4">
                                            <div className="col-span-1">
                                                <p className="text-xs text-gray-500 mb-0.5">
                                                    Primary Contact
                                                </p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {vendor.vendor_name}
                                                </p>
                                            </div>
                                            <div className="col-span-1">
                                                <p className="text-xs text-gray-500 mb-0.5">Mobile</p>
                                                <p className="text-sm text-gray-900">
                                                    {vendor.mobile_number}
                                                </p>
                                            </div>
                                            <div className="col-span-1">
                                                <p className="text-xs text-gray-500 mb-0.5">Note</p>
                                                <p
                                                    className="text-sm text-gray-900 cursor-pointer text-blue-600 hover:underline"
                                                    onClick={() =>
                                                        document
                                                            .getElementById('notes-section')
                                                            ?.scrollIntoView({ behavior: 'smooth' })
                                                    }
                                                >
                                                    {notes.length} notes
                                                </p>
                                            </div>
                                            <div className="col-span-1">
                                                <p className="text-xs text-gray-500 mb-0.5">Email</p>
                                                <p className="text-sm text-gray-900">
                                                    {vendor.email || '-'}
                                                </p>
                                            </div>
                                            <div className="col-span-1">
                                                <p className="text-xs text-gray-500 mb-0.5">WhatsApp</p>
                                                <p className="text-sm text-gray-900">
                                                    {vendor.whatsapp_number || '-'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Business & Address */}
                                <section className="space-y-3">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                        <Building2 className="w-3.5 h-3.5" /> Business Details
                                    </h3>
                                    <div className="bg-white border boundary-gray-200 rounded-lg p-4 space-y-3 shadow-sm">
                                        <div className="grid grid-cols-2 gap-y-4">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-0.5">
                                                    Business Name
                                                </p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {vendor.business_name || '-'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-0.5">
                                                    GST Number
                                                </p>
                                                <p className="text-sm text-gray-900">
                                                    {vendor.gst_number || '-'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-0.5">
                                                    Vendor Type
                                                </p>
                                                <Badge variant="default" className="text-xs">
                                                    {vendor.vendor_type?.name || 'N/A'}
                                                </Badge>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-0.5">
                                                    Billing Address
                                                </p>
                                                <p className="text-sm text-gray-900 max-w-xs">
                                                    {vendor.billing_address || '-'}
                                                </p>
                                                {(vendor.city || vendor.state || vendor.pincode) && (
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {[vendor.city, vendor.state, vendor.pincode]
                                                            .filter(Boolean)
                                                            .join(', ')}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Financials */}
                                <section className="space-y-3">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                        <Badge variant="default" className="h-5 w-auto px-1.5 py-0">
                                            ₹
                                        </Badge>{' '}
                                        Financials
                                    </h3>
                                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                                        <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                                            <div className="col-span-1">
                                                <p className="text-xs text-gray-500 mb-0.5">
                                                    Total Bills
                                                </p>
                                                <p className="text-lg font-bold text-gray-900">
                                                    {vendor.total_bills || 0}
                                                </p>
                                            </div>
                                            <div className="col-span-1">
                                                <p className="text-xs text-gray-500 mb-0.5">
                                                    Total Amount
                                                </p>
                                                <p className="text-lg font-bold text-gray-900">
                                                    ₹
                                                    {vendor.total_amount?.toFixed(2) || '0.00'}
                                                </p>
                                            </div>
                                            <div className="col-span-1">
                                                <p className="text-xs text-gray-500 mb-0.5">
                                                    Total Paid
                                                </p>
                                                <p className="text-lg font-bold text-green-600">
                                                    ₹{vendor.total_paid?.toFixed(2) || '0.00'}
                                                </p>
                                            </div>
                                            <div className="col-span-1">
                                                <p className="text-xs text-gray-500 mb-0.5">
                                                    Balance Due
                                                </p>
                                                <p className="text-lg font-bold text-red-600">
                                                    ₹{vendor.balance_due?.toFixed(2) || '0.00'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Notes & Activity */}
                                <div className="border-t border-gray-200 pt-6" id="notes-section">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-sm font-semibold text-gray-900">
                                            Notes & Activity
                                        </h3>
                                        <span className="text-xs text-gray-400">
                                            {notes.length}/{MAX_NOTES} notes
                                        </span>
                                    </div>

                                    {/* Add / Edit Note area */}
                                    <div className="mb-4">
                                        {editingNoteId ? (
                                            <>
                                                <TextArea
                                                    label="Edit note"
                                                    rows={3}
                                                    value={editingNoteText}
                                                    onChange={(e) =>
                                                        setEditingNoteText(e.target.value)
                                                    }
                                                    helperText={`${currentNoteLength}/${MAX_NOTE_LENGTH} characters`}
                                                />
                                                {noteError && (
                                                    <p className="mt-1 text-xs text-red-600">
                                                        {noteError}
                                                    </p>
                                                )}
                                                <div className="mt-2 flex gap-2 justify-end">
                                                    <Button
                                                        type="button"
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={cancelEditNote}
                                                        disabled={isUpdatingNoteId === editingNoteId}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="primary"
                                                        size="sm"
                                                        onClick={handleUpdateNote}
                                                        isLoading={
                                                            isUpdatingNoteId === editingNoteId
                                                        }
                                                    >
                                                        Save
                                                    </Button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <TextArea
                                                    label="Add a note"
                                                    rows={3}
                                                    value={newNote}
                                                    onChange={(e) => {
                                                        setNewNote(e.target.value);
                                                        if (noteError) setNoteError('');
                                                    }}
                                                    placeholder="Write a note about this vendor..."
                                                    disabled={isAtMaxNotes}
                                                    helperText={
                                                        isAtMaxNotes
                                                            ? 'You have reached the maximum of 3 notes. Edit or delete an existing note to add a new one.'
                                                            : `${currentNoteLength}/${MAX_NOTE_LENGTH} characters • ${remainingNotes} notes remaining`
                                                    }
                                                />
                                                {noteError && (
                                                    <p className="mt-1 text-xs text-red-600">
                                                        {noteError}
                                                    </p>
                                                )}
                                                <div className="mt-2 flex justify-end">
                                                    <Button
                                                        type="button"
                                                        variant="primary"
                                                        size="sm"
                                                        onClick={handleAddNote}
                                                        disabled={
                                                            isAddingNote ||
                                                            !newNote.trim() ||
                                                            isAtMaxNotes
                                                        }
                                                        isLoading={isAddingNote}
                                                    >
                                                        Add Note
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Notes + Activity list */}
                                    <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                                        {notes.map((note) => (
                                            <div key={note.id} className="flex gap-3 group">
                                                <div className="relative border-l-2 border-yellow-200 pl-4 py-1 w-full">
                                                    <div className="flex justify-between items-start gap-2">
                                                        <p className="text-sm text-gray-800 whitespace-pre-wrap">
                                                            {note.note_text}
                                                        </p>
                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => startEditNote(note)}
                                                                className="text-gray-400 hover:text-gray-600"
                                                                title="Edit note"
                                                            >
                                                                <Edit className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handleDeleteNote(note.id)
                                                                }
                                                                className="text-red-400 hover:text-red-600"
                                                                title="Delete note"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] text-gray-400 font-medium">
                                                            {formatDate(note.created_at)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {activityLogs.map((log) => (
                                            <div
                                                key={log.id}
                                                className="relative border-l-2 border-gray-100 pl-4 py-1"
                                            >
                                                <p className="text-xs text-gray-600">
                                                    {log.description}
                                                </p>
                                                <span className="text-[10px] text-gray-400">
                                                    {formatDate(log.created_at)}
                                                </span>
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
