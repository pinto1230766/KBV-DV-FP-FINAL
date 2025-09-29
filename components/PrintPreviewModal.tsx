import React, { ReactNode, useEffect } from 'react';
import { XIcon, PrintIcon } from './Icons';
import { useData } from '../contexts/DataContext';

interface PrintPreviewModalProps {
    children: ReactNode;
    onClose: () => void;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({ children, onClose }) => {
    const { congregationProfile } = useData();

    // Call window.print() directly from the user's click event handler.
    const handlePrint = () => {
        window.print();
    };

    // Add an effect to listen for the 'afterprint' event to close the modal.
    useEffect(() => {
        const handleAfterPrint = () => {
            onClose();
        };

        window.addEventListener('afterprint', handleAfterPrint);
        
        // Cleanup the event listener when the component unmounts.
        return () => {
            window.removeEventListener('afterprint', handleAfterPrint);
        };
    }, [onClose]);

    return (
        <>
            {/* The modal UI, which will be hidden during printing */}
            <div 
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-4 no-print" 
                onClick={onClose}
            >
                <div 
                    className="bg-gray-200 dark:bg-black/80 rounded-xl shadow-2xl w-full h-full max-w-4xl max-h-[95vh] flex flex-col animate-fade-in-up"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-4 bg-card-light dark:bg-card-dark flex justify-between items-center rounded-t-xl border-b border-border-light dark:border-border-dark flex-shrink-0">
                        <h2 className="text-xl font-bold text-text-main dark:text-text-main-dark">Aperçu avant impression</h2>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handlePrint}
                                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-light text-white font-semibold rounded-lg"
                            >
                                <PrintIcon className="w-5 h-5"/>
                                Lancer l'impression
                            </button>
                            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-primary-light/20">
                                <XIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Visible Content for Preview */}
                    <div className="flex-1 overflow-y-auto bg-white shadow-inner">
                        {children}
                    </div>

                    {/* Footer */}
                    <div className="p-2 text-center text-xs text-gray-500 bg-gray-100 dark:bg-background-dark rounded-b-xl border-t border-border-light dark:border-border-dark">
                        <p>Document généré le {new Date().toLocaleDateString('fr-FR')} par l'application de gestion des visiteurs - {congregationProfile.name}</p>
                    </div>
                </div>
            </div>

            {/* The content that will actually be printed, hidden from the screen */}
            <div className="print-only">
                {children}
            </div>
        </>
    );
};