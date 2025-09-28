import React from 'react';

interface TabButtonProps {
    icon: React.FC<any>;
    label: string;
    isActive: boolean;
    onClick: () => void;
}

export const TabButton: React.FC<TabButtonProps> = ({ icon: Icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex-1 md:flex-1 flex flex-col md:flex-row items-center justify-center py-2 md:border-b-2 text-sm font-medium transition-all active:scale-95 md:px-4 md:py-4 ${
            isActive
                ? 'text-secondary md:border-secondary'
                : 'text-text-muted dark:text-text-muted-dark hover:text-secondary md:border-transparent'
        }`}
    >
        <Icon className="w-6 h-6 md:w-5 md:h-5 mb-0.5 md:mb-0 md:mr-2" />
        <span className={`text-xs md:text-sm ${isActive ? 'font-bold' : 'font-medium'}`}>{label}</span>
    </button>
);