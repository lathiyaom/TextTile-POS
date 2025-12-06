import { create } from 'zustand';
import type { VendorType, PaymentMode } from '@/types';

interface VendorStoreState {
    vendorTypes: VendorType[];
    paymentModes: PaymentMode[];
    isLoading: boolean;
    setVendorTypes: (types: VendorType[]) => void;
    setPaymentModes: (modes: PaymentMode[]) => void;
    setLoading: (loading: boolean) => void;
}

export const useVendorStore = create<VendorStoreState>((set) => ({
    vendorTypes: [],
    paymentModes: [],
    isLoading: false,
    setVendorTypes: (types) => set({ vendorTypes: types || [] }),
    setPaymentModes: (modes) => set({ paymentModes: modes || [] }),
    setLoading: (loading) => set({ isLoading: loading }),
}));
