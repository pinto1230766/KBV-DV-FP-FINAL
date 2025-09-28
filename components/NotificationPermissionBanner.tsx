import React from 'react';
import { BellIcon, XIcon } from './Icons';

interface NotificationPermissionBannerProps {
    onEnable: () => void;
    onDismiss: () => void;
}

export const NotificationPermissionBanner: React.FC<NotificationPermissionBannerProps> = ({ onEnable, onDismiss }) => {
    return (
        <div className="bg-primary/90 dark:bg-primary-dark/90 text-white p-4 fixed bottom-0 left-0 right-0 z-50 md:bottom-auto md:top-0 animate-fade-in">
            <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-left">
                    <BellIcon className="w-8 h-8 flex-shrink-0" />
                    <div>
                        <p className="font-bold">Recevez des rappels de visites</p>
                        <p className="text-sm opacity-80">Activez les notifications pour ne jamais oublier un rappel important (J-7, J-2, etc.).</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto flex-shrink-0">
                    <button
                        onClick={onEnable}
                        className="w-full sm:w-auto px-4 py-2 bg-white text-primary font-semibold rounded-lg hover:bg-opacity-90 transition-transform active:scale-95"
                    >
                        Activer
                    </button>
                    <button
                        onClick={onDismiss}
                        className="p-2 rounded-full hover:bg-white/20 transition-colors"
                        title="Fermer"
                    >
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};