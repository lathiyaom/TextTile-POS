import React from "react";

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    subtitle?: string;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = "",
    title,
    subtitle,
}) => {
    return (
        <div
            className={`bg-white rounded-lg border border-slate-200 shadow-sm shadow-[0_1px_3px_rgba(0,0,0,0.04)] ${className}`}
        >
            {(title || subtitle) && (
                <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
                    {title && (
                        <h3 className="text-sm font-medium text-slate-900 tracking-normal">
                            {title}
                        </h3>
                    )}
                    {subtitle && (
                        <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
                    )}
                </div>
            )}

            <div className="p-5">{children}</div>
        </div>
    );
};
