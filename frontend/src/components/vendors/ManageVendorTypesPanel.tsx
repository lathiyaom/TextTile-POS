import React, { useMemo, useState } from 'react';
import { Modal } from '@/components/atoms';
import { Input, Button } from '@/components/atoms';
import { useVendorStore } from '@/store/vendorStore';
import { vendorTypeApi } from '@/services/api/vendor';
import type { VendorType } from '@/types';
import { Pencil, Trash2 } from 'lucide-react';

interface ManageVendorTypesPanelProps {
    isOpen: boolean;
    onClose: () => void;
    // optional: select the newly created type in parent form
    onTypeCreated?: (type: VendorType) => void;
}

export const ManageVendorTypesPanel: React.FC<ManageVendorTypesPanelProps> = ({
    isOpen,
    onClose,
    onTypeCreated,
}) => {
    const { vendorTypes, setVendorTypes } = useVendorStore();

    const [newName, setNewName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState('');
    const [savingId, setSavingId] = useState<number | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [error, setError] = useState('');

    const sortedTypes = useMemo(() => {
        // active first, then inactive
        return [...vendorTypes].sort((a, b) => {
            if (a.is_active === b.is_active) return a.name.localeCompare(b.name);
            return a.is_active ? -1 : 1;
        });
    }, [vendorTypes]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;

        setIsCreating(true);
        setError('');
        try {
            const created: VendorType = await vendorTypeApi.create({ name: newName.trim() });
            setVendorTypes([...vendorTypes, created]);
            setNewName('');
            onTypeCreated && onTypeCreated(created);
        } catch (err: any) {
            setError(err?.response?.data?.error || 'Failed to create vendor type.');
        } finally {
            setIsCreating(false);
        }
    };

    const startEdit = (type: VendorType) => {
        setEditingId(type.id);
        setEditingName(type.name);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditingName('');
    };

    const saveEdit = async (id: number) => {
        if (!editingName.trim()) return;
        setSavingId(id);
        setError('');
        try {
            const updated = await vendorTypeApi.update(id, { name: editingName.trim() });
            const newList = vendorTypes.map((t) => (t.id === id ? { ...t, ...updated } : t));
            setVendorTypes(newList);
            setEditingId(null);
            setEditingName('');
        } catch (err: any) {
            setError(err?.response?.data?.error || 'Failed to update vendor type.');
        } finally {
            setSavingId(null);
        }
    };

    const deactivateType = async (id: number) => {
        const confirm = window.confirm(
            'Are you sure you want to deactivate this type? Existing vendors will keep their current type.'
        );
        if (!confirm) return;

        setDeletingId(id);
        setError('');
        try {
            const updated = await vendorTypeApi.update(id, { name: editingName.trim() });
            const newList = vendorTypes.map((t) => (t.id === id ? { ...t, ...updated } : t));
            setVendorTypes(newList);
            setEditingId(null);
            setEditingName('');
        } catch (err: any) {
            setError(err?.response?.data?.error || 'Failed to deactivate vendor type.');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Manage Vendor Types"
        >
            <div className="max-w-lg w-full">
                {/* quick create */}
                <form onSubmit={handleCreate} className="space-y-3 mb-4">
                    <Input
                        label="New Vendor Type *"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="e.g. Wholesale, Retail"
                    />
                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={isCreating}
                        >
                            Add Type
                        </Button>
                    </div>
                </form>

                {error && (
                    <div className="mb-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
                        {error}
                    </div>
                )}

                {/* list */}
                <div className="border rounded-md overflow-hidden">
                    <div className="bg-gray-50 px-3 py-2 text-xs font-medium text-gray-500 flex justify-between">
                        <span>Type</span>
                        <span className="w-28 text-right">Actions</span>
                    </div>

                    <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                        {sortedTypes.length === 0 && (
                            <div className="px-3 py-3 text-xs text-gray-400">
                                No vendor types created yet.
                            </div>
                        )}

                        {sortedTypes.map((type) => {
                            const isEditing = editingId === type.id;
                            const disabled = savingId === type.id || deletingId === type.id;

                            return (
                                <div
                                    key={type.id}
                                    className="px-3 py-2 flex items-center justify-between gap-3 text-sm"
                                >
                                    <div className="flex-1 min-w-0">
                                        {isEditing ? (
                                            <input
                                                className="w-full border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                                                value={editingName}
                                                onChange={(e) => setEditingName(e.target.value)}
                                            />
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <span className="truncate">{type.name}</span>
                                                <span
                                                    className={`text-[10px] px-1.5 py-0.5 rounded-full border ${type.is_active
                                                        ? 'border-green-100 text-green-700 bg-green-50'
                                                        : 'border-gray-200 text-gray-500 bg-gray-50'
                                                        }`}
                                                >
                                                    {type.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-end gap-1 w-28">
                                        {isEditing ? (
                                            <>
                                                <Button
                                                    type="button"
                                                    variant="primary"
                                                    size="sm"
                                                    disabled={disabled}
                                                    onClick={() => saveEdit(type.id)}
                                                >
                                                    Save
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={cancelEdit}
                                                >
                                                    Cancel
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    type="button"
                                                    className="p-1 rounded-md hover:bg-gray-100"
                                                    onClick={() => startEdit(type)}
                                                    disabled={disabled}
                                                    title="Edit"
                                                >
                                                    <Pencil className="w-4 h-4 text-gray-500" />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="p-1 rounded-md hover:bg-red-50"
                                                    onClick={() => deactivateType(type.id)}
                                                    disabled={disabled || !type.is_active}
                                                    title="Deactivate"
                                                >
                                                    <Trash2 className={`w-4 h-4 ${type.is_active ? 'text-red-500' : 'text-gray-300'}`} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <p className="mt-3 text-[11px] text-gray-400">
                    Inactive types will not appear in the Vendor Type dropdown, but existing vendors keep their current type.
                </p>

                <div className="mt-4 flex justify-end">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                    >
                        Close
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
