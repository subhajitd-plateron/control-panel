'use client';

import {useState} from 'react';
import {
    Home,
    Users,
    UserCheck,
    UserPlus,
    Settings,
    Shield,
    Database,
    BarChart3,
    TrendingUp,
    PieChart,
    ChevronDown,
    ChevronRight,
    Building2,
    Search,
    AlertTriangle
} from 'lucide-react';
import {clsx} from 'clsx';

interface NavItem {
    name: string;
    href: string;
    icon: any;
    children?: NavItem[];
}

const navigation: NavItem[] = [
    {
        name: 'Dashboard',
        href: '/dashboard',
        icon: Home,
    },
    {
        name: 'Customers',
        href: '/users',
        icon: Users,
        children: [
            {name: 'Active Users', href: '/users/active', icon: UserCheck},
            {name: 'Add User', href: '/users/add', icon: UserPlus},
        ],
    },
    {
        name: 'User Management',
        href: '/users',
        icon: Users,
        children: [
            {name: 'Active Users', href: '/users/active', icon: UserCheck},
            {name: 'Add User', href: '/users/add', icon: UserPlus},
        ],
    },
    {
        name: 'Analytics',
        href: '/analytics',
        icon: BarChart3,
        children: [
            {name: 'Performance', href: '/analytics/performance', icon: TrendingUp},
            {name: 'Reports Dashboard', href: '/analytics/reports', icon: PieChart},
            {name: 'Missing Orders', href: '/analytics/reports/missing-orders', icon: Search},
            {name: 'Sales Mismatch', href: '/analytics/reports/sales-mismatch', icon: AlertTriangle},
            {name: 'SQL Query', href: '/analytics/reports/sql-query', icon: Database},
        ],
    },
    {
        name: 'System',
        href: '/system',
        icon: Settings,
        children: [
            {name: 'Security', href: '/system/security', icon: Shield},
            {name: 'Database', href: '/system/database', icon: Database},
        ],
    },
];

interface SidebarProps {
    isCollapsed?: boolean;
}

export default function Sidebar({isCollapsed = false}: SidebarProps) {
    const [expandedItems, setExpandedItems] = useState<string[]>([]);

    const toggleExpanded = (itemName: string) => {
        setExpandedItems(prev =>
            prev.includes(itemName)
                ? prev.filter(name => name !== itemName)
                : [...prev, itemName]
        );
    };

    return (
        <div className={clsx(
            'bg-theme-sidebar text-theme-sidebar h-full flex flex-col transition-all duration-300',
            isCollapsed ? 'w-16' : 'w-64'
        )}>
            {/* Logo */}
            <div className="flex items-center p-4 border-b border-theme"
                 style={{height: isCollapsed ? '81px' : '81px'}}>
                <div className="bg-blue-600 p-2 rounded-lg">
                    <Building2 className="w-6 h-6"/>
                </div>
                {!isCollapsed && (
                    <div className="ml-3">
                        <h2 className="text-lg font-semibold">Control Panel</h2>
                        <p className="text-sm text-theme-muted">Admin Portal</p>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                {navigation.map((item) => (
                    <div key={item.name}>
                        {/* Parent Navigation Item */}
                        <button
                            onClick={() => item.children && toggleExpanded(item.name)}
                            className={clsx(
                                'w-full flex items-center justify-between p-3 text-left rounded-lg transition-all duration-200 group',
                                'hover:bg-secondary hover:text-theme-sidebar',
                                'focus:outline-none focus:ring-2 focus:ring-primary'
                            )}
                        >
                            <div className="flex items-center">
                                <item.icon className="w-5 h-5"/>
                                {!isCollapsed && (
                                    <span className="ml-3 text-sm font-medium">{item.name}</span>
                                )}
                            </div>

                            {!isCollapsed && item.children && (
                                <div className="transition-transform duration-200">
                                    {expandedItems.includes(item.name) ? (
                                        <ChevronDown className="w-4 h-4"/>
                                    ) : (
                                        <ChevronRight className="w-4 h-4"/>
                                    )}
                                </div>
                            )}
                        </button>

                        {/* Child Navigation Items */}
                        {item.children && !isCollapsed && (
                            <div className={clsx(
                                'ml-4 mt-1 space-y-1 overflow-hidden transition-all duration-300 ease-in-out',
                                expandedItems.includes(item.name)
                                    ? 'max-h-96 opacity-100'
                                    : 'max-h-0 opacity-0'
                            )}>
                                {item.children.map((child) => (
                                    <a
                                        key={child.name}
                                        href={child.href}
                                        className={clsx(
                                            'flex items-center p-2 pl-6 text-sm rounded-lg transition-all duration-200',
                                            'text-theme-muted hover:text-theme-sidebar hover:bg-secondary',
                                            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-sidebar'
                                        )}
                                    >
                                        <child.icon className="w-4 h-4"/>
                                        <span className="ml-3">{child.name}</span>
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </nav>

            {/* User Profile */}
            {!isCollapsed && (
                <div className="border-t border-theme p-4">
                    <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium">A</span>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium">Admin User</p>
                            <p className="text-xs text-theme-muted">admin@company.com</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
