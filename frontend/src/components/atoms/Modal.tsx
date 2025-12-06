import React from "react";
import { X } from "lucide-react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
}) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            aria-modal="true"
            role="dialog"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div
                className="
          relative w-full max-w-lg mx-4 
          bg-white rounded-lg border border-slate-200 
          shadow-[0_18px_45px_rgba(15,23,42,0.18)]
          animate-in fade-in-0 zoom-in-95 duration-150
        "
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50">
                    <h3 className="text-sm font-medium text-slate-900">{title}</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-5 py-4 text-sm text-slate-800">
                    {children}
                </div>
            </div>
        </div>
    );
};
