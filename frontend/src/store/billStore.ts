import { create } from 'zustand';
import type { Bill, Vendor, DiscountType } from '@/types';
import type { LineItem } from '@/types/lineItem';

interface BillDraft {
    billDate: string;
    vendorId: number | null;
    vendor: Vendor | null;
    paymentTypeId: number | null;
    items: LineItem[]; // Changed from BillItem[] to LineItem[]
    discountType: DiscountType;
    discountPercentage: number;
    discountAmount: number;
    roundOffAmount: number;
    advanceAmountPaid: number;
    paymentModeId: number | null;
    nextPaymentDueDate: string;
    paymentRemarks: string;
}

interface CalculatedTotals {
    subtotal: number;
    taxableAmount: number;
    cgstAmount: number;
    sgstAmount: number;
    igstAmount: number;
    totalGstAmount: number;
    rawGrandTotal: number;
    grandTotal: number;
    amountDue: number;
}

interface BillStoreState {
    bills: Bill[];
    selectedBill: Bill | null;
    draft: BillDraft;
    calculated: CalculatedTotals;
    isLoading: boolean;
    
    // Actions
    setBills: (bills: Bill[]) => void;
    setSelectedBill: (bill: Bill | null) => void;
    setDraft: (draft: Partial<BillDraft>) => void;
    setCalculated: (calculated: CalculatedTotals) => void;
    addItem: (item: LineItem) => void;
    updateItem: (index: number, item: LineItem) => void;
    removeItem: (index: number) => void;
    resetDraft: () => void;
    setLoading: (loading: boolean) => void;
}

const initialDraft: BillDraft = {
    billDate: new Date().toISOString().split('T')[0],
    vendorId: null,
    vendor: null,
    paymentTypeId: null,
    items: [],
    discountType: 'None',
    discountPercentage: 0,
    discountAmount: 0,
    roundOffAmount: 0,
    advanceAmountPaid: 0,
    paymentModeId: null,
    nextPaymentDueDate: '',
    paymentRemarks: '',
};

const initialCalculated: CalculatedTotals = {
    subtotal: 0,
    taxableAmount: 0,
    cgstAmount: 0,
    sgstAmount: 0,
    igstAmount: 0,
    totalGstAmount: 0,
    rawGrandTotal: 0,
    grandTotal: 0,
    amountDue: 0,
};

export const useBillStore = create<BillStoreState>((set) => ({
    bills: [],
    selectedBill: null,
    draft: initialDraft,
    calculated: initialCalculated,
    isLoading: false,

    setBills: (bills) => set({ bills }),
    
    setSelectedBill: (bill) => set({ selectedBill: bill }),
    
    setDraft: (draftUpdate) =>
        set((state) => ({
            draft: { ...state.draft, ...draftUpdate },
        })),
    
    setCalculated: (calculated) => set({ calculated }),
    
    addItem: (item) =>
        set((state) => ({
            draft: {
                ...state.draft,
                items: [...state.draft.items, item],
            },
        })),
    
    updateItem: (index, item) =>
        set((state) => ({
            draft: {
                ...state.draft,
                items: state.draft.items.map((i, idx) => (idx === index ? item : i)),
            },
        })),
    
    removeItem: (index) =>
        set((state) => ({
            draft: {
                ...state.draft,
                items: state.draft.items.filter((_, idx) => idx !== index),
            },
        })),
    
    resetDraft: () =>
        set({
            draft: initialDraft,
            calculated: initialCalculated,
        }),
    
    setLoading: (loading) => set({ isLoading: loading }),
}));
