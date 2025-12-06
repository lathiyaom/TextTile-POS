import React, { useState } from 'react';
import { Sidebar } from '@/components/organisms/Sidebar';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="h-screen bg-gray-50 w-full overflow-hidden">
            <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
            <main
                className={`h-full overflow-y-auto transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-60'
                    }`}
            >
                <div className="p-8">{children}</div>
            </main>
        </div>
    );
};
