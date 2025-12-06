import React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Select: React.FC<SelectProps> = ({
    label,
    error,
    helperText,
    className = "",
    children,
    ...props
}) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-slate-700 mb-1">
                    {label}
                </label>
            )}

            <select
                className={`w-full px-3.5 py-2 text-sm bg-white rounded-md border 
        focus:outline-none focus:ring-1 focus:ring-primary-500 
        transition-all
        ${error ? "border-red-500" : "border-slate-300"} 
        ${className}`}
                {...props}
            >
                {children}
            </select>

            {error ? (
                <p className="mt-1 text-xs text-red-600">{error}</p>
            ) : helperText ? (
                <p className="mt-1 text-xs text-slate-500">{helperText}</p>
            ) : null}
        </div>
    );
};
