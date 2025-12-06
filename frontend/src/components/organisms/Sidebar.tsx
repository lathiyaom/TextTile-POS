import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import {
    Users,
    Package,
    ShoppingCart,
    BarChart3,
    Settings,
    LogOut,
    Truck,
    FileText,
    Clock,
    CreditCard,
    Receipt,
    FileCheck,
    ArrowLeft,
    ArrowRight,
    ChevronDown,
    ChevronRight,
    Home,
    DollarSign,
    FolderOpen,
} from 'lucide-react';

interface SidebarItem {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    path?: string;
    children?: SidebarItem[];
}

interface SidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    const [expandedSections, setExpandedSections] = useState<string[]>(['purchases']);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuSections: { title: string; key: string; items: SidebarItem[] }[] = [
        {
            title: 'Main',
            key: 'main',
            items: [
                { icon: Home, label: 'Dashboard', path: '/dashboard' },
                {
                    icon: Truck,
                    label: 'Purchases',
                    children: [
                        { icon: Truck, label: 'Vendors', path: '/vendors' },
                        { icon: Receipt, label: 'Bills', path: '/bills' },
                    ],
                },
            ],
        },
    ];

    const toggleSection = (key: string) => {
        setExpandedSections((prev) =>
            prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
        );
    };

    const isActive = (path?: string) => {
        if (!path) return false;
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    const SidebarItemComponent: React.FC<{ item: SidebarItem; level?: number }> = ({
        item,
        level = 0,
    }) => {
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedSections.includes(item.label.toLowerCase());
        const active = isActive(item.path);

        if (hasChildren) {
            return (
                <li>
                    <button
                        onClick={() => toggleSection(item.label.toLowerCase())}
                        className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors ${
                            active
                                ? 'bg-blue-50 border-l-2 border-blue-600 text-blue-700 font-medium'
                                : 'text-gray-700 hover:bg-gray-50 border-l-2 border-transparent'
                        } ${isCollapsed ? 'justify-center px-2' : ''}`}
                        title={isCollapsed ? item.label : undefined}
                    >
                        <item.icon
                            className={`w-4 h-4 flex-shrink-0 ${
                                active ? 'text-blue-600' : 'text-gray-400'
                            }`}
                        />
                        {!isCollapsed && (
                            <>
                                <span className="flex-1 text-left truncate">{item.label}</span>
                                {isExpanded ? (
                                    <ChevronDown className="w-3 h-3 text-gray-400" />
                                ) : (
                                    <ChevronRight className="w-3 h-3 text-gray-400" />
                                )}
                            </>
                        )}
                    </button>
                    {!isCollapsed && isExpanded && item.children && (
                        <ul className="ml-4 space-y-1">
                            {item.children.map((child) => (
                                <SidebarItemComponent key={child.label} item={child} level={level + 1} />
                            ))}
                        </ul>
                    )}
                </li>
            );
        }

        if (!item.path) return null;

        return (
            <li>
                <NavLink
                    to={item.path}
                    className={({ isActive: navActive }) =>
                        `group flex items-center gap-2.5 px-4 py-2 text-sm transition-colors border-l-2 ${
                            navActive || active
                                ? 'bg-blue-50 border-blue-600 text-blue-700 font-medium'
                                : 'border-transparent text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        } ${isCollapsed ? 'justify-center px-2' : ''}`
                    }
                    title={isCollapsed ? item.label : undefined}
                >
                    {({ isActive: navActive }) => (
                        <>
                            <item.icon
                                className={`w-4 h-4 flex-shrink-0 ${
                                    navActive || active
                                        ? 'text-blue-600'
                                        : 'text-gray-400 group-hover:text-gray-600'
                                }`}
                            />
                            {!isCollapsed && <span className="truncate">{item.label}</span>}
                        </>
                    )}
                </NavLink>
            </li>
        );
    };

    return (
        <aside
            className={`h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 z-50 transition-all duration-300 ${
                isCollapsed ? 'w-16' : 'w-60'
            }`}
        >
            {/* TOP HEADER WITH TOGGLE */}
            <div className="h-14 px-4 flex items-center justify-between border-b border-gray-200 flex-shrink-0">
                {!isCollapsed ? (
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">
                            POS
                        </div>
                        <div className="leading-tight">
                            <p className="text-sm font-semibold text-gray-900">POS Books</p>
                            <p className="text-[11px] text-gray-400">Billing & Inventory</p>
                        </div>
                    </div>
                ) : (
                    <div className="w-7 h-7 rounded-md bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">
                        POS
                    </div>
                )}

                <button
                    onClick={onToggle}
                    className="flex items-center justify-center p-1.5 rounded-md text-gray-600 hover:bg-gray-50"
                    title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {isCollapsed ? (
                        <ArrowRight className="w-4 h-4" />
                    ) : (
                        <ArrowLeft className="w-4 h-4" />
                    )}
                </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-3">
                {menuSections.map((section) => (
                    <div key={section.key} className="mb-4">
                        {!isCollapsed && (
                            <p className="px-4 text-[11px] uppercase tracking-wide text-gray-400 mb-2">
                                {section.title}
                            </p>
                        )}
                        <ul className="space-y-1">
                            {section.items.map((item) => (
                                <SidebarItemComponent key={item.label} item={item} />
                            ))}
                        </ul>
                    </div>
                ))}
            </nav>

            <div className="border-t border-gray-200 px-3 py-2 space-y-2 flex-shrink-0">
                {!isCollapsed && (
                    <NavLink
                        to="/settings"
                        className={({ isActive }) =>
                            `flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors ${
                                isActive
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`
                        }
                    >
                        <Settings className="w-3.5 h-3.5" />
                        <span>Settings</span>
                    </NavLink>
                )}

                {isCollapsed ? (
                    <div className="flex flex-col items-center gap-2">
                        <button
                            onClick={handleLogout}
                            className="flex items-center justify-center p-2 rounded-md text-[11px] font-medium text-red-600 hover:bg-red-50"
                            title="Logout"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-[11px] font-medium text-gray-700 flex-shrink-0">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-gray-800 truncate">
                                        {user?.name}
                                    </p>
                                    <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] font-medium text-red-600 hover:bg-red-50"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Logout</span>
                        </button>
                    </div>
                )}
            </div>
        </aside>
    );
};
