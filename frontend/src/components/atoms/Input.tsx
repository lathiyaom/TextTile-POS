import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    helperText,
    className = "",
    ...props
}) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-slate-700 mb-1">
                    {label}
                </label>
            )}

            <input
                className={`w-full px-3.5 py-2 text-sm bg-white rounded-md border 
        transition-all 
        focus:outline-none focus:ring-1 focus:ring-primary-500 
        ${error ? "border-red-500" : "border-slate-300"} 
        ${className}`}
                {...props}
            />

            {error ? (
                <p className="mt-1 text-xs text-red-600">{error}</p>
            ) : helperText ? (
                <p className="mt-1 text-xs text-slate-500">{helperText}</p>
            ) : null}
        </div>
    );
};
