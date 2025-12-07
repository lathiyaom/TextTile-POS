import { useCallback } from 'react';
import { useBillStore } from '@/store/billStore';
import type { LineItem } from '@/types/lineItem';
import {
    createEmptyLineItem,
    validateAtLeastOneItem,
    calculateLineItemsTotals,
    getValidLineItems,
} from '@/utils/lineItemUtils';

/**
 * Custom hook for managing line items in bills
 * Integrates with Zustand bill store
 */
export const useLineItems = () => {
    const { draft, setDraft } = useBillStore();

    /**
     * Set line items
     */
    const setLineItems = useCallback(
        (items: LineItem[]) => {
            setDraft({ items });
        },
        [setDraft]
    );

    /**
     * Add a new empty line item
     */
    const addLineItem = useCallback(() => {
        const newItem = createEmptyLineItem();
        setDraft({ items: [...draft.items, newItem] });
    }, [draft.items, setDraft]);

    /**
     * Update a specific line item
     */
    const updateLineItem = useCallback(
        (id: string, updates: Partial<LineItem>) => {
            const updatedItems = draft.items.map((item) =>
                item.id === id ? { ...item, ...updates } : item
            );
            setDraft({ items: updatedItems });
        },
        [draft.items, setDraft]
    );

    /**
     * Remove a line item
     */
    const removeLineItem = useCallback(
        (id: string) => {
            const filtered = draft.items.filter((item) => item.id !== id);
            // Ensure at least one placeholder remains
            if (filtered.length === 0) {
                filtered.push(createEmptyLineItem());
            }
            setDraft({ items: filtered });
        },
        [draft.items, setDraft]
    );

    /**
     * Clear all line items
     */
    const clearLineItems = useCallback(() => {
        setDraft({ items: [createEmptyLineItem()] });
    }, [setDraft]);

    /**
     * Validate line items
     */
    const validate = useCallback(() => {
        return validateAtLeastOneItem(draft.items);
    }, [draft.items]);

    /**
     * Get valid line items (filters out placeholders)
     */
    const getValid = useCallback(() => {
        return getValidLineItems(draft.items);
    }, [draft.items]);

    /**
     * Calculate totals
     */
    const calculateTotals = useCallback(() => {
        return calculateLineItemsTotals(draft.items);
    }, [draft.items]);

    return {
        items: draft.items,
        setLineItems,
        addLineItem,
        updateLineItem,
        removeLineItem,
        clearLineItems,
        validate,
        getValid,
        calculateTotals,
    };
};
