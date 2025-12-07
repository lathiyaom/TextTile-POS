import React, { useState, useEffect } from 'react';
import { Modal, Button, TextArea } from '@/components/atoms';
import { noteApi } from '@/services/api/bill';
import type { Note } from '@/types';
import { Clock, User, Edit2, Trash2, Plus } from 'lucide-react';

interface NotesModalProps {
    isOpen: boolean;
    onClose: () => void;
    entityType: 'VENDOR' | 'BILL';
    entityId: number;
    maxNotes?: number;
}

export const NotesModal: React.FC<NotesModalProps> = ({
    isOpen,
    onClose,
    entityType,
    entityId,
    maxNotes,
}) => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [noteText, setNoteText] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && entityId) {
            loadNotes();
        }
    }, [isOpen, entityId]);

    const loadNotes = async () => {
        setIsLoading(true);
        setError('');
        try {
            const data = await noteApi.getByEntity(entityType, entityId);
            setNotes(data);
        } catch (err: any) {
            setError(err?.response?.data?.error || 'Failed to load notes');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!noteText.trim()) {
            setError('Note text is required');
            return;
        }

        if (noteText.length > 1000) {
            setError('Note text cannot exceed 1000 characters');
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            if (editingId) {
                await noteApi.update(entityType, entityId, editingId, { note_text: noteText });
            } else {
                await noteApi.create(entityType, entityId, { note_text: noteText });
            }
            setNoteText('');
            setEditingId(null);
            await loadNotes();
        } catch (err: any) {
            setError(err?.response?.data?.error || 'Failed to save note');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (note: Note) => {
        setEditingId(note.id);
        setNoteText(note.note_text);
        setError('');
    };

    const handleDelete = async (noteId: number) => {
        if (!window.confirm('Are you sure you want to delete this note?')) return;

        setIsLoading(true);
        setError('');
        try {
            await noteApi.delete(entityType, entityId, noteId);
            await loadNotes();
        } catch (err: any) {
            setError(err?.response?.data?.error || 'Failed to delete note');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setNoteText('');
        setError('');
    };

    const canAddMore = !maxNotes || notes.length < maxNotes;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Notes">
            <div className="space-y-4">
                {/* Note count indicator */}
                {maxNotes && (
                    <div className="text-xs text-gray-500">
                        {notes.length} / {maxNotes} notes used
                    </div>
                )}

                {/* Error message */}
                {error && (
                    <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
                        {error}
                    </div>
                )}

                {/* Notes list */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {isLoading && notes.length === 0 ? (
                        <div className="text-sm text-gray-400 text-center py-4">Loading notes...</div>
                    ) : notes.length === 0 ? (
                        <div className="text-sm text-gray-400 text-center py-4">No notes yet</div>
                    ) : (
                        notes.map((note) => (
                            <div
                                key={note.id}
                                className="border border-gray-200 rounded-md p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                                            {note.note_text}
                                        </p>
                                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(note.created_at).toLocaleString()}
                                            </span>
                                            {note.updated_at !== note.created_at && (
                                                <span className="text-gray-400">(edited)</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => handleEdit(note)}
                                            className="p-1 rounded hover:bg-gray-200"
                                            title="Edit"
                                        >
                                            <Edit2 className="w-3.5 h-3.5 text-gray-600" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(note.id)}
                                            className="p-1 rounded hover:bg-red-100"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-3.5 h-3.5 text-red-600" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Add/Edit note form */}
                {(canAddMore || editingId) && (
                    <div className="space-y-3 pt-3 border-t border-gray-200">
                        <TextArea
                            label={editingId ? 'Edit Note' : 'Add New Note'}
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Enter note text (max 1000 characters)"
                            rows={3}
                            helperText={`${noteText.length} / 1000 characters`}
                        />
                        <div className="flex justify-end gap-2">
                            {editingId && (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </Button>
                            )}
                            <Button
                                type="button"
                                variant="primary"
                                size="sm"
                                onClick={handleSave}
                                isLoading={isLoading}
                                disabled={!noteText.trim()}
                            >
                                {editingId ? 'Update Note' : 'Add Note'}
                            </Button>
                        </div>
                    </div>
                )}

                {!canAddMore && !editingId && (
                    <div className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-md px-3 py-2">
                        Maximum {maxNotes} notes allowed
                    </div>
                )}

                <div className="flex justify-end pt-3 border-t border-gray-200">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
