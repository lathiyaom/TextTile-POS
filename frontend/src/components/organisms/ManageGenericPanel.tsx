import React, { useMemo, useState } from 'react';
import { Modal, Input, Button } from '@/components/atoms';
import { Pencil, Trash2 } from 'lucide-react';

export interface ManageableItem {
    id: number;
    name: string;
    is_active: boolean;
    [key: string]: any;
}

export interface GenericCrudApi {
    create: (data: { name: string }) => Promise<ManageableItem>;
    update: (id: number, data: { name?: string; is_active?: boolean }) => Promise<ManageableItem>;
}

interface ManageGenericPanelProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    itemLabel: string; // e.g. "Vendor Type" for labels
    items: ManageableItem[];
    onItemsChange: (items: ManageableItem[]) => void; // Sync with parent/store
    onItemCreated?: (item: ManageableItem) => void;   // Optional selection
    api: GenericCrudApi;
}

export const ManageGenericPanel: React.FC<ManageGenericPanelProps> = ({
    isOpen,
    onClose,
    title,
    itemLabel,
    items,
    onItemsChange,
    onItemCreated,
    api,
}) => {
    const [newName, setNewName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState('');
    const [savingId, setSavingId] = useState<number | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [error, setError] = useState('');

    const sortedItems = useMemo(() => {
        // Active first, then alphabetical
        return [...items].sort((a, b) => {
            if (a.is_active === b.is_active) return a.name.localeCompare(b.name);
            return a.is_active ? -1 : 1;
        });
    }, [items]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;

        setIsCreating(true);
        setError('');
        try {
            // Cast the result to ManageableItem in case API returns specific type
            const created = await api.create({ name: newName.trim() });
            onItemsChange([...items, created]);
            setNewName('');
            onItemCreated && onItemCreated(created);
        } catch (err: any) {
            setError(err?.response?.data?.error || `Failed to create ${itemLabel.toLowerCase()}.`);
        } finally {
            setIsCreating(false);
        }
    };

    const startEdit = (item: ManageableItem) => {
        setEditingId(item.id);
        setEditingName(item.name);
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
            const updated = await api.update(id, { name: editingName.trim() });
            const newList = items.map((t) => (t.id === id ? { ...t, ...updated } : t));
            onItemsChange(newList);
            setEditingId(null);
            setEditingName('');
        } catch (err: any) {
            setError(err?.response?.data?.error || `Failed to update ${itemLabel.toLowerCase()}.`);
        } finally {
            setSavingId(null);
        }
    };

    const deactivateItem = async (id: number) => {
        const confirm = window.confirm(
            `Are you sure you want to deactivate this ${itemLabel.toLowerCase()}? Existing records will be unaffected.`
        );
        if (!confirm) return;

        setDeletingId(id);
        setError('');
        try {
            const updated = await api.update(id, { is_active: false });
            // Depending on API response, updated might define is_active=false, or we force it locally
            const newList = items.map((t) =>
                t.id === id ? { ...t, ...updated, is_active: false } : t
            );
            onItemsChange(newList);
        } catch (err: any) {
            setError(err?.response?.data?.error || `Failed to deactivate ${itemLabel.toLowerCase()}.`);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
        >
            <div className="max-w-lg w-full">
                {/* Quick create */}
                <form onSubmit={handleCreate} className="space-y-3 mb-4">
                    <Input
                        label={`New ${itemLabel} *`}
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder={`e.g. New ${itemLabel}`}
                        autoFocus
                    />
                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={isCreating}
                        >
                            Add {itemLabel}
                        </Button>
                    </div>
                </form>

                {error && (
                    <div className="mb-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
                        {error}
                    </div>
                )}

                {/* List */}
                <div className="border rounded-md overflow-hidden">
                    <div className="bg-gray-50 px-3 py-2 text-xs font-medium text-gray-500 flex justify-between">
                        <span>Name</span>
                        <span className="w-28 text-right">Actions</span>
                    </div>

                    <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                        {sortedItems.length === 0 && (
                            <div className="px-3 py-3 text-xs text-gray-400">
                                No items found.
                            </div>
                        )}

                        {sortedItems.map((item) => {
                            const isEditing = editingId === item.id;
                            const disabled = savingId === item.id || deletingId === item.id;

                            return (
                                <div
                                    key={item.id}
                                    className="px-3 py-2 flex items-center justify-between gap-3 text-sm"
                                >
                                    <div className="flex-1 min-w-0">
                                        {isEditing ? (
                                            <input
                                                className="w-full border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                                                value={editingName}
                                                onChange={(e) => setEditingName(e.target.value)}
                                                autoFocus
                                            />
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <span className="truncate">{item.name}</span>
                                                <span
                                                    className={`text-[10px] px-1.5 py-0.5 rounded-full border ${item.is_active
                                                            ? 'border-green-100 text-green-700 bg-green-50'
                                                            : 'border-gray-200 text-gray-500 bg-gray-50'
                                                        }`}
                                                >
                                                    {item.is_active ? 'Active' : 'Inactive'}
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
                                                    onClick={() => saveEdit(item.id)}
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
                                                    onClick={() => startEdit(item)}
                                                    disabled={disabled}
                                                    title="Edit"
                                                >
                                                    <Pencil className="w-4 h-4 text-gray-500" />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="p-1 rounded-md hover:bg-red-50"
                                                    onClick={() => deactivateItem(item.id)}
                                                    disabled={disabled || !item.is_active}
                                                    title="Deactivate"
                                                >
                                                    <Trash2 className={`w-4 h-4 ${item.is_active ? 'text-red-500' : 'text-gray-300'}`} />
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
                    Inactive entries will not appear in the dropdown, but existing records remain unchanged.
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
