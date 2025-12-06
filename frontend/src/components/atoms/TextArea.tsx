import React from 'react';

interface TextAreaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({
    label,
    error,
    helperText,
    className = '',
    rows = 3,
    ...props
}) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    {label}
                </label>
            )}

            <textarea
                rows={rows}
                className={[
                    'w-full text-sm rounded-md border bg-white',
                    'px-3 py-2.5',
                    'border-slate-200 placeholder-slate-400',
                    'hover:border-slate-300',
                    'focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500',
                    'disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed',
                    error && 'border-red-500 focus:border-red-500 focus:ring-red-100',
                    className,
                ]
                    .filter(Boolean)
                    .join(' ')}
                {...props}
            />

            {error ? (
                <p className="mt-1 text-[11px] text-red-600">{error}</p>
            ) : helperText ? (
                <p className="mt-1 text-[11px] text-slate-500">{helperText}</p>
            ) : null}
        </div>
    );
};
