import { useMemo } from 'react';
import type { POSSettings, Vendor, DiscountType } from '@/types';
import type { LineItem } from '@/types/lineItem';
import { getValidLineItems } from '@/utils/lineItemUtils';

interface CalculationInputs {
    items: LineItem[];
    discountType: DiscountType;
    discountPercentage: number;
    discountAmount: number;
    vendor: Vendor | null;
    settings: POSSettings | null;
    customRoundOff?: number;
    advanceAmountPaid: number;
}

interface CalculationResults {
    subtotal: number;
    calculatedDiscountAmount: number;
    taxableAmount: number;
    cgstAmount: number;
    sgstAmount: number;
    igstAmount: number;
    totalGstAmount: number;
    rawGrandTotal: number;
    roundOffAmount: number;
    grandTotal: number;
    amountDue: number;
    isIntraState: boolean;
}

export const useBillCalculations = (inputs: CalculationInputs): CalculationResults => {
    return useMemo(() => {
        const {
            items,
            discountType,
            discountPercentage,
            discountAmount,
            vendor,
            settings,
            customRoundOff,
            advanceAmountPaid,
        } = inputs;

        // Helper to round to decimals
        const roundToDecimals = (value: number, decimals: number = 2): number => {
            const multiplier = Math.pow(10, decimals);
            return Math.round(value * multiplier) / multiplier;
        };

        // Get only valid items (filters out placeholders)
        const validItems = getValidLineItems(items);

        // Calculate subtotal
        const subtotal = validItems.reduce((sum, item) => sum + item.lineTotal, 0);

        // Calculate discount
        let calculatedDiscountAmount = 0;
        if (discountType === 'Percentage') {
            calculatedDiscountAmount = roundToDecimals((subtotal * discountPercentage) / 100);
        } else if (discountType === 'Amount') {
            calculatedDiscountAmount = discountAmount;
        }

        // Calculate taxable amount
        const taxableAmount = roundToDecimals(subtotal - calculatedDiscountAmount);

        // Determine if intra-state or inter-state
        const isIntraState =
            vendor?.state && settings?.business_registered_state
                ? vendor.state === settings.business_registered_state
                : true;

        // Calculate GST
        let cgstAmount = 0;
        let sgstAmount = 0;
        let igstAmount = 0;

        validItems.forEach((item) => {
            if ((item.gstPercent || 0) > 0) {
                const itemGst = item.lineTaxAmount; // Already calculated in lineItemUtils
                if (isIntraState) {
                    cgstAmount += itemGst / 2;
                    sgstAmount += itemGst / 2;
                } else {
                    igstAmount += itemGst;
                }
            }
        });

        cgstAmount = roundToDecimals(cgstAmount);
        sgstAmount = roundToDecimals(sgstAmount);
        igstAmount = roundToDecimals(igstAmount);
        const totalGstAmount = roundToDecimals(cgstAmount + sgstAmount + igstAmount);

        // Calculate raw grand total
        const rawGrandTotal = roundToDecimals(taxableAmount + totalGstAmount);

        // Calculate round-off and grand total
        let roundOffAmount = 0;
        let grandTotal = rawGrandTotal;

        if (settings?.enable_bill_round_off) {
            if (customRoundOff !== undefined && settings.allow_per_bill_round_off_override) {
                // Use custom round-off
                roundOffAmount = customRoundOff;
                grandTotal = roundToDecimals(rawGrandTotal + roundOffAmount);
            } else {
                // Apply rounding mode
                let rounded = rawGrandTotal;
                switch (settings.round_off_mode) {
                    case 'nearest_rupee':
                        rounded = Math.round(rawGrandTotal);
                        break;
                    case 'round_up':
                        rounded = Math.ceil(rawGrandTotal);
                        break;
                    case 'round_down':
                        rounded = Math.floor(rawGrandTotal);
                        break;
                    case 'nearest_0.50':
                        rounded = Math.round(rawGrandTotal * 2) / 2;
                        break;
                }
                roundOffAmount = roundToDecimals(rounded - rawGrandTotal);
                grandTotal = rounded;
            }
        }

        // Calculate amount due
        const amountDue = Math.max(0, roundToDecimals(grandTotal - advanceAmountPaid));

        return {
            subtotal: roundToDecimals(subtotal),
            calculatedDiscountAmount,
            taxableAmount,
            cgstAmount,
            sgstAmount,
            igstAmount,
            totalGstAmount,
            rawGrandTotal,
            roundOffAmount,
            grandTotal,
            amountDue,
            isIntraState,
        };
    }, [inputs]);
};
