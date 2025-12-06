import React, {
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { ChevronDown, Check, Search, Settings } from 'lucide-react';

export interface SearchableOption {
    value: string;
    label: string;
}

interface SearchableSelectProps {
    label?: string;
    name: string;
    value: string;
    options: SearchableOption[];
    placeholder?: string;
    onChange: (value: string) => void;
    disabled?: boolean;

    // extra bottom "Manage…" row
    manageLabel?: string;              // e.g. "Manage types…"
    onManageClick?: () => void;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
    label,
    name,
    value,
    options,
    placeholder = 'Select…',
    onChange,
    disabled,
    manageLabel,
    onManageClick,
}) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement | null>(null);

    const selectedOption = useMemo(
        () => options.find((o) => o.value === value) || null,
        [options, value]
    );

    const filteredOptions = useMemo(() => {
        if (!search.trim()) return options;
        const s = search.toLowerCase();
        return options.filter((o) => o.label.toLowerCase().includes(s));
    }, [options, search]);

    // close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (!containerRef.current) return;
            if (!containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleSelect = (val: string) => {
        onChange(val);
        setOpen(false);
        setSearch('');
    };

    const handleManage = () => {
        setOpen(false);
        setSearch('');
        onManageClick && onManageClick();
    };

    return (
        <div className="w-full" ref={containerRef}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}

            <div className="relative">
                <button
                    type="button"
                    name={name}
                    disabled={disabled}
                    onClick={() => !disabled && setOpen((o) => !o)}
                    className={`w-full flex items-center justify-between rounded-md border px-3 py-2 text-sm text-left
          ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-900 cursor-pointer'}
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                >
                    <span className={selectedOption ? '' : 'text-gray-400'}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {open && !disabled && (
                    <div className="absolute mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg z-50">
                        {/* Search box */}
                        <div className="px-2 py-1.5 border-b border-gray-100 flex items-center gap-1.5">
                            <Search className="w-3.5 h-3.5 text-gray-400" />
                            <input
                                autoFocus
                                className="w-full bg-transparent text-xs focus:outline-none"
                                placeholder="Search…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        {/* Options */}
                        <ul className="max-h-56 overflow-y-auto py-1 text-sm">
                            {filteredOptions.length === 0 && (
                                <li className="px-3 py-2 text-xs text-gray-400">
                                    No results found
                                </li>
                            )}

                            {filteredOptions.map((opt) => {
                                const isSelected = opt.value === value;
                                return (
                                    <li key={opt.value}>
                                        <button
                                            type="button"
                                            onClick={() => handleSelect(opt.value)}
                                            className={`w-full flex items-center justify-between px-3 py-1.5 text-left hover:bg-gray-50
                      ${isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                                        >
                                            <span>{opt.label}</span>
                                            {isSelected && (
                                                <Check className="w-3.5 h-3.5 text-blue-600" />
                                            )}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>

                        {/* Manage row */}
                        {manageLabel && onManageClick && (
                            <button
                                type="button"
                                onClick={handleManage}
                                className="w-full flex items-center gap-2 px-3 py-2 border-t border-gray-100 text-xs text-primary-700 hover:bg-blue-50"
                            >
                                <Settings className="w-3.5 h-3.5" />
                                <span>{manageLabel}</span>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
