import React from 'react';
import { Speaker } from '../types';
import { XIcon, SpinnerIcon, PlusIcon } from './Icons';
import { Avatar } from './Avatar';

interface SpeakerSuggestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    isLoading: boolean;
    suggestions: { speaker: Speaker, reason: string }[];
    onSchedule: (speaker: Speaker) => void;
}

export const SpeakerSuggestionModal: React.FC<SpeakerSuggestionModalProps> = ({
    isOpen,
    onClose,
    isLoading,
    suggestions,
    onSchedule,
}) => {
    if (!isOpen) return null;

    const handleScheduleClick = (speaker: Speaker) => {
        onSchedule(speaker);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-xl w-full sm:max-w-2xl max-h-[90vh] flex flex-col animate-fade-in-up">
                {/* Header */}
                <div className="p-6 bg-gradient-to-br from-primary to-secondary dark:from-primary-dark dark:to-secondary text-white rounded-t-xl flex-shrink-0">
                    <div className="flex justify-between items-start">
                        <h2 className="text-2xl font-bold">Suggestions d'orateurs (IA)</h2>
                        <button type="button" onClick={onClose} className="p-2 -mt-2 -mr-2 rounded-full text-white/70 hover:bg-white/20">
                            <XIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1 min-h-0">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center h-64">
                            <SpinnerIcon className="w-12 h-12 text-primary" />
                            <p className="mt-4 text-text-muted dark:text-text-muted-dark">L'assistant IA réfléchit...</p>
                        </div>
                    )}
                    {!isLoading && suggestions.length > 0 && (
                        <div className="space-y-4">
                            {suggestions.map(({ speaker, reason }) => (
                                <div key={speaker.id} className="bg-gray-50 dark:bg-dark p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 flex-grow min-w-0">
                                        <Avatar item={speaker} size="w-12 h-12" />
                                        <div className="min-w-0">
                                            <p className="font-bold text-lg text-text-main dark:text-text-main-dark truncate">{speaker.nom}</p>
                                            <p className="text-sm italic text-primary dark:text-primary-light">"{reason}"</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleScheduleClick(speaker)}
                                        className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center px-4 py-2 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors"
                                    >
                                        <PlusIcon className="w-5 h-5 mr-2" />
                                        Programmer
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                     {!isLoading && suggestions.length === 0 && (
                        <div className="text-center py-12 px-6">
                            <h3 className="text-xl font-semibold text-text-main dark:text-text-main-dark">Aucune suggestion pour le moment</h3>
                            <p className="mt-1 text-text-muted dark:text-text-muted-dark">L'assistant IA n'a pas pu générer de suggestions. Veuillez réessayer.</p>
                        </div>
                    )}
                </div>
                 {/* Footer */}
                <div className="bg-gray-50 dark:bg-dark px-6 py-4 flex justify-end space-x-3 border-t border-border-light dark:border-border-dark rounded-b-xl flex-shrink-0">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-card-light dark:bg-card-dark border border-gray-300 dark:border-border-dark rounded-md text-sm font-medium text-text-main dark:text-text-main-dark hover:bg-gray-50 dark:hover:bg-gray-700">
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
};