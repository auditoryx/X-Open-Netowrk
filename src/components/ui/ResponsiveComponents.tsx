import React from 'react';

interface ResponsiveTableProps {
  columns: Array<{
    key: string;
    label: string;
    width?: string;
    mobileHide?: boolean;
  }>;
  data: Array<Record<string, any>>;
  keyField: string;
  renderCell?: (key: string, value: any, row: any) => React.ReactNode;
  onRowClick?: (row: any) => void;
  loading?: boolean;
}

interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'small' | 'medium' | 'large';
  className?: string;
}

interface MobileCardProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

/**
 * Responsive table that converts to mobile-friendly cards
 */
export function ResponsiveTable({
  columns,
  data,
  keyField,
  renderCell,
  onRowClick,
  loading = false
}: ResponsiveTableProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded mb-2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  style={{ width: column.width }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row) => (
              <tr
                key={row[keyField]}
                onClick={() => onRowClick?.(row)}
                className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {renderCell ? renderCell(column.key, row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {data.map((row) => (
          <div
            key={row[keyField]}
            onClick={() => onRowClick?.(row)}
            className={`
              bg-white border border-gray-200 rounded-lg p-4 space-y-2
              ${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
            `}
          >
            {columns
              .filter(column => !column.mobileHide)
              .map((column) => (
                <div key={column.key} className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">{column.label}:</span>
                  <span className="text-sm text-gray-900 text-right">
                    {renderCell ? renderCell(column.key, row[column.key], row) : row[column.key]}
                  </span>
                </div>
              ))}
          </div>
        ))}
      </div>
    </>
  );
}

/**
 * Responsive grid with configurable breakpoints
 */
export function ResponsiveGrid({
  children,
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 'medium',
  className = ''
}: ResponsiveGridProps) {
  const gapClasses = {
    small: 'gap-2',
    medium: 'gap-4',
    large: 'gap-6'
  };

  const gridClasses = `
    grid 
    grid-cols-${columns.sm} 
    md:grid-cols-${columns.md} 
    lg:grid-cols-${columns.lg} 
    xl:grid-cols-${columns.xl}
    ${gapClasses[gap]}
    ${className}
  `;

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
}

/**
 * Mobile-optimized card component
 */
export function MobileCard({
  title,
  subtitle,
  actions,
  children,
  onClick,
  className = ''
}: MobileCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white border border-gray-200 rounded-lg p-4 space-y-3
        ${onClick ? 'cursor-pointer hover:bg-gray-50 active:bg-gray-100' : ''}
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1 truncate">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="ml-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>

      {/* Content */}
      <div>
        {children}
      </div>
    </div>
  );
}

/**
 * Mobile-friendly form layout
 */
export function ResponsiveForm({
  children,
  className = ''
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-4 sm:space-y-6 ${className}`}>
      {children}
    </div>
  );
}

/**
 * Responsive form field
 */
export function ResponsiveFormField({
  label,
  children,
  required = false,
  error,
  hint,
  className = ''
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-gray-500">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}

/**
 * Mobile-optimized button group
 */
export function ResponsiveButtonGroup({
  children,
  direction = 'horizontal',
  className = ''
}: {
  children: React.ReactNode;
  direction?: 'horizontal' | 'vertical';
  className?: string;
}) {
  const directionClasses = {
    horizontal: 'flex flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0',
    vertical: 'flex flex-col space-y-2'
  };

  return (
    <div className={`${directionClasses[direction]} ${className}`}>
      {children}
    </div>
  );
}

/**
 * Responsive stats grid
 */
export function ResponsiveStats({
  stats
}: {
  stats: Array<{
    label: string;
    value: string | number;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
    icon?: React.ReactNode;
  }>;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                {stat.label}
              </p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {stat.value}
              </p>
              {stat.change && (
                <p className={`text-xs mt-1 ${
                  stat.trend === 'up' ? 'text-green-600' : 
                  stat.trend === 'down' ? 'text-red-600' : 
                  'text-gray-600'
                }`}>
                  {stat.change}
                </p>
              )}
            </div>
            {stat.icon && (
              <div className="flex-shrink-0 text-gray-400">
                {stat.icon}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Mobile-friendly navigation tabs
 */
export function ResponsiveTabs({
  tabs,
  activeTab,
  onTabChange,
  className = ''
}: {
  tabs: Array<{ id: string; label: string; count?: number }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}) {
  return (
    <div className={`${className}`}>
      {/* Mobile Dropdown */}
      <div className="sm:hidden">
        <select
          value={activeTab}
          onChange={(e) => onTabChange(e.target.value)}
          className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        >
          {tabs.map((tab) => (
            <option key={tab.id} value={tab.id}>
              {tab.label} {tab.count !== undefined && `(${tab.count})`}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop Tabs */}
      <div className="hidden sm:block">
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-900'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

/**
 * Hook for responsive behavior
 */
export function useResponsive() {
  const [isMobile, setIsMobile] = React.useState(false);
  const [isTablet, setIsTablet] = React.useState(false);

  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet
  };
}