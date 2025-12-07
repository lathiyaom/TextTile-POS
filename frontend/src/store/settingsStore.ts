import { create } from 'zustand';
import type { POSSettings, PaymentType } from '@/types';

interface SettingsStoreState {
    settings: POSSettings | null;
    paymentTypes: PaymentType[];
    isLoading: boolean;
    setSettings: (settings: POSSettings) => void;
    setPaymentTypes: (types: PaymentType[]) => void;
    setLoading: (loading: boolean) => void;
}

export const useSettingsStore = create<SettingsStoreState>((set) => ({
    settings: null,
    paymentTypes: [],
    isLoading: false,
    setSettings: (settings) => set({ settings }),
    setPaymentTypes: (types) => set({ paymentTypes: types || [] }),
    setLoading: (loading) => set({ isLoading: loading }),
}));
