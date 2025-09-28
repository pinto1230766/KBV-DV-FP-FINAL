import React, { useState } from 'react';
import { Visit } from '../types';
import { InformationCircleIcon, CheckIcon } from './Icons';

interface PastVisitsManagerProps {
    visits: Visit[];
    onComplete: (visit: Visit) => void;
    onCompleteMultiple: (visits: Visit[]) => void;
}

export const PastVisitsManager: React.FC<PastVisitsManagerProps> = ({ visits, onComplete, onCompleteMultiple }) => {
    const [selectedVisitIds, setSelectedVisitIds] = useState<Set<string>>(new Set());

    if (visits.length === 0) {
        return null;
    }

    const handleSelect = (visitId: string) => {
        setSelectedVisitIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(visitId)) {
                newSet.delete(visitId);
            } else {
                newSet.add(visitId);
            }
            return newSet;
        });
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedVisitIds(new Set(visits.map(v => v.visitId)));
        } else {
            setSelectedVisitIds(new Set());
        }
    };

    const handleArchiveSelected = () => {
        const visitsToArchive = visits.filter(v => selectedVisitIds.has(v.visitId));
        onCompleteMultiple(visitsToArchive);
        setSelectedVisitIds(new Set());
    };
    
    const handleArchiveAll = () => {
        onCompleteMultiple(visits);
        setSelectedVisitIds(new Set());
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString + 'T00:00:00').toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };
    
    const allSelected = selectedVisitIds.size === visits.length && visits.length > 0;
    const isIndeterminate = selectedVisitIds.size > 0 && !allSelected;

    return (
        <div className="bg-amber-50 dark:bg-amber-900/30 border-l-4 border-amber-500 rounded-r-lg p-6 mb-8 animate-fade-in-up">
            <div className="flex items-start gap-4">
                <InformationCircleIcon className="w-8 h-8 text-amber-600 dark:text-amber-300 flex-shrink-0 mt-1" />
                <div>
                    <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-300 mb-2">Visites passées à archiver ({visits.length})</h2>
                    <p className="text-amber-700 dark:text-amber-200 text-sm mb-4">
                        Les visites suivantes sont terminées mais n'ont pas encore été archivées. Sélectionnez-les pour mettre à jour leur statut.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 mb-4">
                        <button onClick={handleArchiveSelected} disabled={selectedVisitIds.size === 0} className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-transform active:scale-95 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                            <CheckIcon className="w-5 h-5 mr-2" />
                            Archiver la sélection ({selectedVisitIds.size})
                        </button>
                         <button onClick={handleArchiveAll} className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-green-800 hover:bg-green-900 text-white font-semibold rounded-lg transition-transform active:scale-95 text-sm">
                            Tout archiver
                        </button>
                    </div>
                    <div className="space-y-3">
                         <div className="flex items-center p-2 border-b border-amber-200 dark:border-amber-800/50">
                            <input
                                id="select-all-past"
                                type="checkbox"
                                checked={allSelected}
                                ref={el => { if (el) { el.indeterminate = isIndeterminate; } }}
                                onChange={handleSelectAll}
                                className="h-5 w-5 rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary"
                            />
                            <label htmlFor="select-all-past" className="ml-3 font-semibold text-text-main dark:text-text-main-dark cursor-pointer">
                                Tout sélectionner
                            </label>
                        </div>
                        {visits.map(visit => (
                            <div key={visit.visitId} className="flex items-center p-3 bg-white/50 dark:bg-amber-900/20 rounded-lg shadow-sm">
                                <input
                                    id={`visit-checkbox-${visit.visitId}`}
                                    type="checkbox"
                                    checked={selectedVisitIds.has(visit.visitId)}
                                    onChange={() => handleSelect(visit.visitId)}
                                    className="h-5 w-5 rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary"
                                />
                                <label htmlFor={`visit-checkbox-${visit.visitId}`} className="ml-4 flex-grow cursor-pointer">
                                    <p className="font-semibold text-text-main dark:text-text-main-dark">{visit.nom}</p>
                                    <p className="text-sm text-text-muted dark:text-text-muted-dark">{formatDate(visit.visitDate)}</p>
                                </label>
                                <button
                                    onClick={() => onComplete(visit)}
                                    className="hidden sm:block shrink-0 px-3 py-1 bg-green-600/20 hover:bg-green-600/40 text-green-800 dark:text-green-200 font-semibold rounded-lg transition-colors text-xs"
                                >
                                    Archiver
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};