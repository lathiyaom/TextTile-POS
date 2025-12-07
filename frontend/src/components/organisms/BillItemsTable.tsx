import React, { useState } from 'react';
import { Button, Input, Select } from '@/components/atoms';
import { TEXTILE_CATEGORIES, UNITS, type BillItem } from '@/types';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';

interface BillItemsTableProps {
    items: BillItem[];
    onAddItem: (item: BillItem) => void;
    onUpdateItem: (index: number, item: BillItem) => void;
    onRemoveItem: (index: number) => void;
}

export const BillItemsTable: React.FC<BillItemsTableProps> = ({
    items,
    onAddItem,
    onUpdateItem,
    onRemoveItem,
}) => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [formData, setFormData] = useState<Partial<BillItem>>({
        item_name: '',
        item_category: '',
        quantity: 1,
        unit: 'meter',
        rate: 0,
        gst_percentage: 5,
        line_total: 0,
    });

    const handleChange = (field: keyof BillItem, value: any) => {
        const updated = { ...formData, [field]: value };

        // Auto-calculate line total
        if (field === 'quantity' || field === 'rate') {
            const qty = field === 'quantity' ? parseFloat(value) || 0 : formData.quantity || 0;
            const rate = field === 'rate' ? parseFloat(value) || 0 : formData.rate || 0;
            updated.line_total = parseFloat((qty * rate).toFixed(2));
        }

        // Auto-set GST based on category
        if (field === 'item_category') {
            const category = TEXTILE_CATEGORIES.find((c) => c.value === value);
            if (category) {
                updated.gst_percentage = category.gst;
            }
        }

        setFormData(updated);
    };

    const handleAdd = () => {
        if (!formData.item_name || !formData.quantity || !formData.rate) {
            alert('Please fill all required fields');
            return;
        }

        onAddItem(formData as BillItem);
        setFormData({
            item_name: '',
            item_category: '',
            quantity: 1,
            unit: 'meter',
            rate: 0,
            gst_percentage: 5,
            line_total: 0,
        });
        setIsAdding(false);
    };

    const handleEdit = (index: number) => {
        setEditingIndex(index);
        setFormData(items[index]);
    };

    const handleUpdate = () => {
        if (editingIndex !== null) {
            onUpdateItem(editingIndex, formData as BillItem);
            setEditingIndex(null);
            setFormData({
                item_name: '',
                item_category: '',
                quantity: 1,
                unit: 'meter',
                rate: 0,
                gst_percentage: 5,
                line_total: 0,
            });
        }
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingIndex(null);
        setFormData({
            item_name: '',
            item_category: '',
            quantity: 1,
            unit: 'meter',
            rate: 0,
            gst_percentage: 5,
            line_total: 0,
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">Line Items *</h3>
                {!isAdding && editingIndex === null && (
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-1"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add Item
                    </Button>
                )}
            </div>

            <div className="border border-gray-200 rounded-md overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Item Name
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Category
                            </th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                                Qty
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Unit
                            </th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                                Rate
                            </th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                                GST %
                            </th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                                Line Total
                            </th>
                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase w-20">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {items.length === 0 && !isAdding && (
                            <tr>
                                <td colSpan={8} className="px-3 py-6 text-center text-sm text-gray-500">
                                    No items added. Click "Add Item" to start.
                                </td>
                            </tr>
                        )}

                        {items.map((item, index) =>
                            editingIndex === index ? (
                                <tr key={index} className="bg-blue-50">
                                    <td className="px-2 py-2">
                                        <Input
                                            value={formData.item_name || ''}
                                            onChange={(e) => handleChange('item_name', e.target.value)}
                                            placeholder="Item name"
                                            className="text-sm"
                                        />
                                    </td>
                                    <td className="px-2 py-2">
                                        <Select
                                            value={formData.item_category || ''}
                                            onChange={(e) => handleChange('item_category', e.target.value)}
                                            className="text-sm"
                                        >
                                            <option value="">Select</option>
                                            {TEXTILE_CATEGORIES.map((cat) => (
                                                <option key={cat.value} value={cat.value}>
                                                    {cat.label}
                                                </option>
                                            ))}
                                        </Select>
                                    </td>
                                    <td className="px-2 py-2">
                                        <Input
                                            type="number"
                                            value={formData.quantity || 0}
                                            onChange={(e) => handleChange('quantity', parseFloat(e.target.value))}
                                            min={0}
                                            step={0.01}
                                            className="text-sm text-right"
                                        />
                                    </td>
                                    <td className="px-2 py-2">
                                        <Select
                                            value={formData.unit || 'meter'}
                                            onChange={(e) => handleChange('unit', e.target.value)}
                                            className="text-sm"
                                        >
                                            {UNITS.map((unit) => (
                                                <option key={unit} value={unit}>
                                                    {unit}
                                                </option>
                                            ))}
                                        </Select>
                                    </td>
                                    <td className="px-2 py-2">
                                        <Input
                                            type="number"
                                            value={formData.rate || 0}
                                            onChange={(e) => handleChange('rate', parseFloat(e.target.value))}
                                            min={0}
                                            step={0.01}
                                            className="text-sm text-right"
                                        />
                                    </td>
                                    <td className="px-2 py-2">
                                        <Input
                                            type="number"
                                            value={formData.gst_percentage || 0}
                                            onChange={(e) => handleChange('gst_percentage', parseFloat(e.target.value))}
                                            min={0}
                                            max={100}
                                            step={0.01}
                                            className="text-sm text-right"
                                        />
                                    </td>
                                    <td className="px-3 py-2 text-right font-medium">
                                        ₹{formatCurrency(formData.line_total || 0)}
                                    </td>
                                    <td className="px-2 py-2">
                                        <div className="flex items-center justify-center gap-1">
                                            <button
                                                type="button"
                                                onClick={handleUpdate}
                                                className="p-1 rounded hover:bg-green-100"
                                                title="Save"
                                            >
                                                <Check className="w-4 h-4 text-green-600" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleCancel}
                                                className="p-1 rounded hover:bg-gray-100"
                                                title="Cancel"
                                            >
                                                <X className="w-4 h-4 text-gray-600" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-3 py-2 text-gray-900">{item.item_name}</td>
                                    <td className="px-3 py-2 text-gray-600 text-xs">{item.item_category || '-'}</td>
                                    <td className="px-3 py-2 text-right text-gray-900">{item.quantity}</td>
                                    <td className="px-3 py-2 text-gray-600">{item.unit}</td>
                                    <td className="px-3 py-2 text-right text-gray-900">₹{formatCurrency(item.rate)}</td>
                                    <td className="px-3 py-2 text-right text-gray-600">{item.gst_percentage}%</td>
                                    <td className="px-3 py-2 text-right font-medium text-gray-900">
                                        ₹{formatCurrency(item.line_total)}
                                    </td>
                                    <td className="px-2 py-2">
                                        <div className="flex items-center justify-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => handleEdit(index)}
                                                className="p-1 rounded hover:bg-gray-100"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-3.5 h-3.5 text-gray-600" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => onRemoveItem(index)}
                                                className="p-1 rounded hover:bg-red-100"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-3.5 h-3.5 text-red-600" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        )}

                        {isAdding && (
                            <tr className="bg-blue-50">
                                <td className="px-2 py-2">
                                    <Input
                                        value={formData.item_name || ''}
                                        onChange={(e) => handleChange('item_name', e.target.value)}
                                        placeholder="Item name"
                                        className="text-sm"
                                        autoFocus
                                    />
                                </td>
                                <td className="px-2 py-2">
                                    <Select
                                        value={formData.item_category || ''}
                                        onChange={(e) => handleChange('item_category', e.target.value)}
                                        className="text-sm"
                                    >
                                        <option value="">Select</option>
                                        {TEXTILE_CATEGORIES.map((cat) => (
                                            <option key={cat.value} value={cat.value}>
                                                {cat.label}
                                            </option>
                                        ))}
                                    </Select>
                                </td>
                                <td className="px-2 py-2">
                                    <Input
                                        type="number"
                                        value={formData.quantity || 0}
                                        onChange={(e) => handleChange('quantity', parseFloat(e.target.value))}
                                        min={0}
                                        step={0.01}
                                        className="text-sm text-right"
                                    />
                                </td>
                                <td className="px-2 py-2">
                                    <Select
                                        value={formData.unit || 'meter'}
                                        onChange={(e) => handleChange('unit', e.target.value)}
                                        className="text-sm"
                                    >
                                        {UNITS.map((unit) => (
                                            <option key={unit} value={unit}>
                                                {unit}
                                            </option>
                                        ))}
                                    </Select>
                                </td>
                                <td className="px-2 py-2">
                                    <Input
                                        type="number"
                                        value={formData.rate || 0}
                                        onChange={(e) => handleChange('rate', parseFloat(e.target.value))}
                                        min={0}
                                        step={0.01}
                                        className="text-sm text-right"
                                    />
                                </td>
                                <td className="px-2 py-2">
                                    <Input
                                        type="number"
                                        value={formData.gst_percentage || 0}
                                        onChange={(e) => handleChange('gst_percentage', parseFloat(e.target.value))}
                                        min={0}
                                        max={100}
                                        step={0.01}
                                        className="text-sm text-right"
                                    />
                                </td>
                                <td className="px-3 py-2 text-right font-medium">
                                    ₹{formatCurrency(formData.line_total || 0)}
                                </td>
                                <td className="px-2 py-2">
                                    <div className="flex items-center justify-center gap-1">
                                        <button
                                            type="button"
                                            onClick={handleAdd}
                                            className="p-1 rounded hover:bg-green-100"
                                            title="Add"
                                        >
                                            <Check className="w-4 h-4 text-green-600" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleCancel}
                                            className="p-1 rounded hover:bg-gray-100"
                                            title="Cancel"
                                        >
                                            <X className="w-4 h-4 text-gray-600" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {items.length > 0 && (
                <div className="text-xs text-gray-500">
                    {items.length} item{items.length !== 1 ? 's' : ''} added
                </div>
            )}
        </div>
    );
};
