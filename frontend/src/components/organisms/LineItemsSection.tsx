import React, { useCallback, useEffect, useState } from 'react';
import { LineItemRow } from './LineItemRow';
import type { LineItem } from '@/types/lineItem';
import {
    createEmptyLineItem,
    updateLineItemWithCalculations,
    getValidLineItems,
} from '@/utils/lineItemUtils';
import { Plus } from 'lucide-react';

interface LineItemsSectionProps {
    value: LineItem[];
    onChange: (items: LineItem[]) => void;
    error?: string;
    touched?: boolean;
    readOnly?: boolean;
}

export const LineItemsSection: React.FC<LineItemsSectionProps> = ({
    value,
    onChange,
    error,
    touched = false,
    readOnly = false,
}) => {
    const [items, setItems] = useState<LineItem[]>(() => {
        // Ensure there's always at least one placeholder row
        if (value.length === 0) {
            return [createEmptyLineItem()];
        }
        // Check if last item is a placeholder, if not add one
        const lastItem = value[value.length - 1];
        if (!lastItem.isPlaceholder) {
            return [...value, createEmptyLineItem()];
        }
        return value;
    });

    // Sync with parent when items change
    useEffect(() => {
        onChange(items);
    }, [items]);

    /**
     * Handle field change for a specific line item
     */
    const handleItemChange = useCallback((id: string, field: keyof LineItem, value: any) => {
        setItems((prevItems) => {
            const updatedItems = prevItems.map((item) => {
                if (item.id !== id) return item;

                const updatedItem = { ...item, [field]: value };

                // Recalculate totals when qty, rate, or gst changes
                if (field === 'qty' || field === 'rate' || field === 'gstPercent') {
                    return updateLineItemWithCalculations(updatedItem);
                }

                // Mark as non-placeholder when user starts editing
                if (item.isPlaceholder && value) {
                    updatedItem.isPlaceholder = false;
                }

                return updatedItem;
            });

            // Check if we need to add a new placeholder row
            const lastItem = updatedItems[updatedItems.length - 1];
            if (!lastItem.isPlaceholder) {
                updatedItems.push(createEmptyLineItem());
            }

            return updatedItems;
        });
    }, []);

    /**
     * Remove a line item
     */
    const handleRemoveItem = useCallback((id: string) => {
        setItems((prevItems) => {
            const filtered = prevItems.filter((item) => item.id !== id);

            // Ensure there's always at least one placeholder row
            if (filtered.length === 0 || !filtered[filtered.length - 1].isPlaceholder) {
                filtered.push(createEmptyLineItem());
            }

            return filtered;
        });
    }, []);

    /**
     * Add a new empty row
     */
    const handleAddRow = useCallback(() => {
        setItems((prevItems) => {
            // Remove the last placeholder if it exists
            const withoutLastPlaceholder = prevItems.filter(
                (item, index) => !(index === prevItems.length - 1 && item.isPlaceholder)
            );
            // Add a new placeholder
            return [...withoutLastPlaceholder, createEmptyLineItem()];
        });
    }, []);

    /**
     * Handle keyboard navigation (Tab and Enter)
     */
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent, rowIndex: number, cellIndex: number) => {
            const totalCells = 6; // itemName, category, qty, unit, rate, gst

            if (e.key === 'Tab') {
                // Let default Tab behavior work, but check if we're at the end
                if (!e.shiftKey && cellIndex === totalCells - 1) {
                    // Last cell of row, Tab will naturally move to next row
                    // If this is the last row and it's not a placeholder, add a new row
                    if (rowIndex === items.length - 1 && !items[rowIndex].isPlaceholder) {
                        setTimeout(() => {
                            handleAddRow();
                        }, 0);
                    }
                }
            } else if (e.key === 'Enter') {
                e.preventDefault();
                // Move to the first cell of the next row
                if (rowIndex < items.length - 1) {
                    // Focus next row's first input
                    const nextRow = document.querySelector(
                        `tr:nth-child(${rowIndex + 2}) input`
                    ) as HTMLInputElement;
                    if (nextRow) {
                        nextRow.focus();
                    }
                } else {
                    // Last row, add a new row and focus it
                    handleAddRow();
                    setTimeout(() => {
                        const newRow = document.querySelector(
                            `tr:nth-child(${items.length + 1}) input`
                        ) as HTMLInputElement;
                        if (newRow) {
                            newRow.focus();
                        }
                    }, 0);
                }
            }
        },
        [items, handleAddRow]
    );

    const validItems = getValidLineItems(items);
    const showError = touched && error;

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">
                    Line Items <span className="text-red-600">*</span>
                </h3>
                <button
                    type="button"
                    onClick={handleAddRow}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded transition-colors"
                    disabled={readOnly}
                >
                    <Plus className="w-3.5 h-3.5" />
                    Add Item
                </button>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-2 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider w-[25%]">
                                    Item Name
                                </th>
                                <th className="px-2 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider w-[15%]">
                                    Category
                                </th>
                                <th className="px-2 py-2 text-right text-xs font-medium text-gray-600 uppercase tracking-wider w-[10%]">
                                    Qty
                                </th>
                                <th className="px-2 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider w-[10%]">
                                    Unit
                                </th>
                                <th className="px-2 py-2 text-right text-xs font-medium text-gray-600 uppercase tracking-wider w-[12%]">
                                    Rate
                                </th>
                                <th className="px-2 py-2 text-right text-xs font-medium text-gray-600 uppercase tracking-wider w-[10%]">
                                    GST %
                                </th>
                                <th className="px-2 py-2 text-right text-xs font-medium text-gray-600 uppercase tracking-wider w-[13%]">
                                    Line Total
                                </th>
                                <th className="px-2 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wider w-[5%]">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {items.map((item, index) => (
                                <LineItemRow
                                    key={item.id}
                                    item={item}
                                    index={index}
                                    onChange={handleItemChange}
                                    onRemove={handleRemoveItem}
                                    onKeyDown={handleKeyDown}
                                    canRemove={items.length > 1}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Validation Error */}
            {showError && (
                <div className="flex items-start gap-2 text-xs text-red-600">
                    <svg
                        className="w-4 h-4 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                        />
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            {/* Item Count */}
            <div className="text-xs text-gray-500">
                {validItems.length} item{validItems.length !== 1 ? 's' : ''} added
            </div>
        </div>
    );
};
