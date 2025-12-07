import React, { useCallback, useRef } from 'react';
import { TEXTILE_CATEGORIES, UNITS } from '@/types/bill';
import type { LineItem } from '@/types/lineItem';
import { Trash2 } from 'lucide-react';

interface LineItemRowProps {
    item: LineItem;
    index: number;
    onChange: (id: string, field: keyof LineItem, value: any) => void;
    onRemove: (id: string) => void;
    onKeyDown: (e: React.KeyboardEvent, rowIndex: number, cellIndex: number) => void;
    canRemove: boolean;
}

export const LineItemRow: React.FC<LineItemRowProps> = ({
    item,
    index,
    onChange,
    onRemove,
    onKeyDown,
    canRemove,
}) => {
    const itemNameRef = useRef<HTMLInputElement>(null);
    const categoryRef = useRef<HTMLSelectElement>(null);
    const qtyRef = useRef<HTMLInputElement>(null);
    const unitRef = useRef<HTMLSelectElement>(null);
    const rateRef = useRef<HTMLInputElement>(null);
    const gstRef = useRef<HTMLInputElement>(null);

    const handleChange = useCallback(
        (field: keyof LineItem, value: any) => {
            onChange(item.id, field, value);
        },
        [item.id, onChange]
    );

    const handleCategoryChange = (categoryValue: string) => {
        const category = TEXTILE_CATEGORIES.find((c) => c.value === categoryValue);
        if (category) {
            handleChange('categoryName', category.value);
            handleChange('gstPercent', category.gst);
        } else {
            handleChange('categoryName', '');
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const isPlaceholder = item.isPlaceholder;
    const rowClass = isPlaceholder
        ? 'bg-gray-50/50'
        : 'bg-white hover:bg-gray-50/50';

    return (
        <tr className={`${rowClass} transition-colors border-b border-gray-100`}>
            {/* Item Name */}
            <td className="px-2 py-1.5">
                <input
                    ref={itemNameRef}
                    type="text"
                    value={item.itemName}
                    onChange={(e) => handleChange('itemName', e.target.value)}
                    onKeyDown={(e) => onKeyDown(e, index, 0)}
                    placeholder={isPlaceholder ? 'Enter item name' : ''}
                    className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
            </td>

            {/* Category */}
            <td className="px-2 py-1.5">
                <select
                    ref={categoryRef}
                    value={item.categoryName || ''}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    onKeyDown={(e) => onKeyDown(e, index, 1)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                >
                    <option value="">Select</option>
                    {TEXTILE_CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                            {cat.label}
                        </option>
                    ))}
                </select>
            </td>

            {/* Quantity */}
            <td className="px-2 py-1.5">
                <input
                    ref={qtyRef}
                    type="number"
                    value={item.qty === null ? '' : item.qty}
                    onChange={(e) => handleChange('qty', e.target.value ? parseFloat(e.target.value) : null)}
                    onKeyDown={(e) => onKeyDown(e, index, 2)}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className="w-full px-2 py-1.5 text-sm text-right border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
            </td>

            {/* Unit */}
            <td className="px-2 py-1.5">
                <select
                    ref={unitRef}
                    value={item.unitName || ''}
                    onChange={(e) => handleChange('unitName', e.target.value)}
                    onKeyDown={(e) => onKeyDown(e, index, 3)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                >
                    <option value="">Unit</option>
                    {UNITS.map((unit) => (
                        <option key={unit} value={unit}>
                            {unit}
                        </option>
                    ))}
                </select>
            </td>

            {/* Rate */}
            <td className="px-2 py-1.5">
                <input
                    ref={rateRef}
                    type="number"
                    value={item.rate === null ? '' : item.rate}
                    onChange={(e) => handleChange('rate', e.target.value ? parseFloat(e.target.value) : null)}
                    onKeyDown={(e) => onKeyDown(e, index, 4)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full px-2 py-1.5 text-sm text-right border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
            </td>

            {/* GST % */}
            <td className="px-2 py-1.5">
                <input
                    ref={gstRef}
                    type="number"
                    value={item.gstPercent === null ? '' : item.gstPercent}
                    onChange={(e) => handleChange('gstPercent', e.target.value ? parseFloat(e.target.value) : null)}
                    onKeyDown={(e) => onKeyDown(e, index, 5)}
                    placeholder="0"
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-full px-2 py-1.5 text-sm text-right border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
            </td>

            {/* Line Total (Read-only) */}
            <td className="px-2 py-1.5">
                <div className="px-2 py-1.5 text-sm text-right font-medium text-gray-900">
                    ₹{formatCurrency(item.lineTotal)}
                </div>
            </td>

            {/* Actions */}
            <td className="px-2 py-1.5 text-center">
                {canRemove && !isPlaceholder && (
                    <button
                        type="button"
                        onClick={() => onRemove(item.id)}
                        className="p-1 rounded hover:bg-red-50 transition-colors"
                        title="Remove item"
                    >
                        <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                )}
            </td>
        </tr>
    );
};
