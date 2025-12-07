import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, MoreVertical, Edit, Printer, FileText, User, Package } from 'lucide-react';
import { Badge, Button, TextArea } from '@/components/atoms';
import { billApi } from '@/services/api/bill';
import type { Bill, PaymentStatus, Note } from '@/types';

interface BillDetailPanelProps {
    isOpen: boolean;
    onClose: () => void;
    billDetails: Bill | null;
    onUpdate?: () => void;
}

const MAX_NOTES = 3;
const MAX_NOTE_LENGTH = 1000;

export const BillDetailPanel: React.FC<BillDetailPanelProps> = ({
    isOpen,
    onClose,
    billDetails: bill,
    onUpdate = () => {},
}) => {
    const navigate = useNavigate();
    const [showActionsMenu, setShowActionsMenu] = useState(false);
    const [notes, setNotes] = useState<Note[]>([]);

    const [newNote, setNewNote] = useState('');
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [noteError, setNoteError] = useState('');

    const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
    const [editingNoteText, setEditingNoteText] = useState('');
    const [isUpdatingNoteId, setIsUpdatingNoteId] = useState<number | null>(null);

    useEffect(() => {
        if (bill && isOpen) {
            loadNotes();
        }
    }, [bill, isOpen]);

    const loadNotes = async () => {
        if (!bill) return;
        try {
            const notesData = await billApi.getNotes(bill.id);
            setNotes(notesData);
        } catch (error) {
            console.error('Failed to load notes:', error);
        }
    };

    const validateNewNote = (text: string): string => {
        if (!text.trim()) return 'Note cannot be empty.';
        if (text.length > MAX_NOTE_LENGTH) {
            return `Note cannot be longer than ${MAX_NOTE_LENGTH} characters.`;
        }
        if (notes.length >= MAX_NOTES) {
            return `You can add only ${MAX_NOTES} notes for this bill.`;
        }
        return '';
    };

    const handleAddNote = async () => {
        if (!bill) return;

        const validationError = validateNewNote(newNote);
        if (validationError) {
            setNoteError(validationError);
            return;
        }

        try {
            setIsAddingNote(true);
            setNoteError('');
            const note = await billApi.createNote(bill.id, { note_text: newNote.trim() });
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
        if (!bill) return;
        const confirmDelete = window.confirm('Delete this note? This action cannot be undone.');
        if (!confirmDelete) return;

        try {
            await billApi.deleteNote(bill.id, noteId);
            setNotes(notes.filter((n) => n.id !== noteId));
        } catch (error) {
            console.error('Failed to delete note:', error);
        }
    };

    const startEditNote = (note: Note) => {
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
        if (!bill || editingNoteId === null) return;

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
            const updated = await billApi.updateNote(bill.id, editingNoteId, {
                note_text: editingNoteText.trim(),
            });
            setNotes((prev) => prev.map((n) => (n.id === editingNoteId ? { ...n, ...updated } : n)));
            setEditingNoteId(null);
            setEditingNoteText('');
        } catch (error) {
            console.error('Failed to update note:', error);
            setNoteError('Failed to update note. Please try again.');
        } finally {
            setIsUpdatingNoteId(null);
        }
    };

    const handlePrint = async () => {
        if (!bill) return;
        try {
            await billApi.recordPrint(bill.id);
            alert('Print functionality will be implemented in Phase 5');
            setShowActionsMenu(false);
        } catch (error) {
            console.error('Failed to record print:', error);
        }
    };

    const handleCancel = async () => {
        if (!bill) return;
        const reason = window.prompt('Enter cancellation reason:');
        if (!reason) return;

        try {
            await billApi.cancel(bill.id, reason);
            setShowActionsMenu(false);
            onUpdate();
            onClose();
        } catch (error) {
            console.error('Failed to cancel bill:', error);
            alert('Failed to cancel bill');
        }
    };

    const getPaymentStatusBadge = (status: PaymentStatus) => {
        const variants = {
            Paid: 'success',
            Unpaid: 'danger',
            'Partially Paid': 'warning',
        };
        return variants[status] || 'default';
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
        }).format(amount);
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
                    className={`pointer-events-auto relative w-screen max-w-md md:max-w-none md:w-[35vw] transform transition-transform duration-500 ease-in-out bg-white shadow-xl ${
                        isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white sticky top-0 z-10 w-full">
                        <div className="flex flex-col">
                            <h2 className="text-lg font-semibold text-gray-900" id="slide-over-title">
                                {bill?.bill_number}
                            </h2>
                            {bill && (
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge
                                        variant={getPaymentStatusBadge(bill.payment_status)}
                                        className="capitalize px-2 py-0.5 text-xs"
                                    >
                                        {bill.payment_status}
                                    </Badge>
                                    {bill.is_cancelled && (
                                        <Badge variant="danger" className="px-2 py-0.5 text-xs">
                                            Cancelled
                                        </Badge>
                                    )}
                                    {bill.eway_required && (
                                        <Badge variant="warning" className="px-2 py-0.5 text-xs">
                                            E-Way Required
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            {!bill?.is_cancelled && (
                                <>
                                    <button
                                        onClick={() => {
                                            if (bill) {
                                                onClose();
                                                navigate(`/bills/edit/${bill.id}`);
                                            }
                                        }}
                                        className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
                                        title="Edit Bill"
                                    >
                                        <Edit className="w-5 h-5" />
                                    </button>
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowActionsMenu(!showActionsMenu)}
                                            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
                                        >
                                            <MoreVertical className="w-5 h-5" />
                                        </button>
                                        {showActionsMenu && (
                                            <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg border border-gray-100 z-50 py-1">
                                                <button
                                                    onClick={handlePrint}
                                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-700 flex items-center gap-2"
                                                >
                                                    <Printer className="w-4 h-4" />
                                                    Print Bill
                                                </button>
                                                <button
                                                    onClick={handleCancel}
                                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
                                                >
                                                    <X className="w-4 h-4" />
                                                    Cancel Bill
                                                </button>
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

                    {/* Content */}
                    <div className="h-full overflow-y-auto pb-24">
                        {bill && (
                            <div className="p-6 space-y-8">
                                {/* Basic Information */}
                                <section className="space-y-3">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                        <FileText className="w-3.5 h-3.5" /> Bill Information
                                    </h3>
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                        <div className="grid grid-cols-2 gap-y-4">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-0.5">Bill Date</p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {formatDate(bill.bill_date)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-0.5">Financial Year</p>
                                                <p className="text-sm text-gray-900">{bill.financial_year}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-0.5">Payment Type</p>
                                                <p className="text-sm text-gray-900">
                                                    {bill.payment_type?.name || 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-0.5">Notes</p>
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
                                        </div>
                                    </div>
                                </section>

                                {/* Vendor Information */}
                                <section className="space-y-3">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                        <User className="w-3.5 h-3.5" /> Vendor Details
                                    </h3>
                                    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3 shadow-sm">
                                        <div className="grid grid-cols-2 gap-y-4">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-0.5">Vendor Name</p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {bill.vendor?.vendor_name || 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-0.5">Mobile</p>
                                                <p className="text-sm text-gray-900">
                                                    {bill.vendor?.mobile_number || '-'}
                                                </p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-xs text-gray-500 mb-0.5">Business Name</p>
                                                <p className="text-sm text-gray-900">
                                                    {bill.vendor?.business_name || '-'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Line Items */}
                                <section className="space-y-3">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                        <Package className="w-3.5 h-3.5" /> Line Items
                                    </h3>
                                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                        <table className="w-full text-xs">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                                                        Item
                                                    </th>
                                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">
                                                        Qty
                                                    </th>
                                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">
                                                        Rate
                                                    </th>
                                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">
                                                        Total
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {bill.items?.map((item, index) => (
                                                    <tr key={index}>
                                                        <td className="px-3 py-2 text-sm text-gray-900">
                                                            {item.item_name}
                                                            {item.item_category && (
                                                                <span className="text-xs text-gray-500 ml-1">
                                                                    ({item.item_category})
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-2 text-sm text-right text-gray-900">
                                                            {item.quantity} {item.unit}
                                                        </td>
                                                        <td className="px-3 py-2 text-sm text-right text-gray-900">
                                                            {formatCurrency(item.rate)}
                                                        </td>
                                                        <td className="px-3 py-2 text-sm text-right font-medium text-gray-900">
                                                            {formatCurrency(item.line_total)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>

                                {/* Financial Summary */}
                                <section className="space-y-3">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Financial Summary
                                    </h3>
                                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Subtotal:</span>
                                                <span className="font-medium">
                                                    {formatCurrency(bill.subtotal)}
                                                </span>
                                            </div>
                                            {bill.discount_amount > 0 && (
                                                <div className="flex justify-between text-red-600">
                                                    <span>
                                                        Discount ({bill.discount_type === 'Percentage' ? `${bill.discount_percentage}%` : 'Amount'}):
                                                    </span>
                                                    <span>-{formatCurrency(bill.discount_amount)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between pt-2 border-t border-blue-200">
                                                <span className="text-gray-600">Taxable Amount:</span>
                                                <span className="font-medium">
                                                    {formatCurrency(bill.taxable_amount)}
                                                </span>
                                            </div>
                                            {bill.cgst_amount > 0 && (
                                                <>
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-gray-500">CGST:</span>
                                                        <span>{formatCurrency(bill.cgst_amount)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-gray-500">SGST:</span>
                                                        <span>{formatCurrency(bill.sgst_amount)}</span>
                                                    </div>
                                                </>
                                            )}
                                            {bill.igst_amount > 0 && (
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-gray-500">IGST:</span>
                                                    <span>{formatCurrency(bill.igst_amount)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Total GST:</span>
                                                <span className="font-medium">
                                                    {formatCurrency(bill.total_gst_amount)}
                                                </span>
                                            </div>
                                            {bill.round_off_amount !== 0 && (
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-gray-500">Round-Off:</span>
                                                    <span>{formatCurrency(bill.round_off_amount)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between pt-2 border-t-2 border-blue-300 text-base font-semibold">
                                                <span>Grand Total:</span>
                                                <span>{formatCurrency(bill.grand_total)}</span>
                                            </div>
                                            {bill.advance_amount_paid > 0 && (
                                                <div className="flex justify-between text-green-600">
                                                    <span>Advance Paid:</span>
                                                    <span>-{formatCurrency(bill.advance_amount_paid)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between pt-2 border-t-2 border-blue-300 text-base font-semibold text-primary-600">
                                                <span>Amount Due:</span>
                                                <span>{formatCurrency(bill.amount_due)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Notes Section */}
                                <div className="border-t border-gray-200 pt-6" id="notes-section">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-sm font-semibold text-gray-900">Notes</h3>
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
                                                    onChange={(e) => setEditingNoteText(e.target.value)}
                                                    helperText={`${currentNoteLength}/${MAX_NOTE_LENGTH} characters`}
                                                />
                                                {noteError && (
                                                    <p className="mt-1 text-xs text-red-600">{noteError}</p>
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
                                                        isLoading={isUpdatingNoteId === editingNoteId}
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
                                                    placeholder="Write a note about this bill..."
                                                    disabled={isAtMaxNotes}
                                                    helperText={
                                                        isAtMaxNotes
                                                            ? 'You have reached the maximum of 3 notes. Edit or delete an existing note to add a new one.'
                                                            : `${currentNoteLength}/${MAX_NOTE_LENGTH} characters • ${remainingNotes} notes remaining`
                                                    }
                                                />
                                                {noteError && (
                                                    <p className="mt-1 text-xs text-red-600">{noteError}</p>
                                                )}
                                                <div className="mt-2 flex justify-end">
                                                    <Button
                                                        type="button"
                                                        variant="primary"
                                                        size="sm"
                                                        onClick={handleAddNote}
                                                        disabled={isAddingNote || !newNote.trim() || isAtMaxNotes}
                                                        isLoading={isAddingNote}
                                                    >
                                                        Add Note
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Notes list */}
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
                                                                onClick={() => handleDeleteNote(note.id)}
                                                                className="text-red-400 hover:text-red-600"
                                                                title="Delete note"
                                                            >
                                                                <X className="w-3.5 h-3.5" />
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
