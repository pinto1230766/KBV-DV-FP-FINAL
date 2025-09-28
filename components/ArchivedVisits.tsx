import React, { useState, useMemo } from 'react';
import { Visit } from '../types';
import { SearchIcon, TrashIcon, CalendarIcon } from './Icons';
import { useData } from '../contexts/DataContext';
import { useConfirm } from '../contexts/ConfirmContext';

export const ArchivedVisits: React.FC = () => {
    const { archivedVisits, deleteArchivedVisit } = useData();
    const confirm = useConfirm();
    const [searchTerm, setSearchTerm] = useState('');

    const sortedAndFilteredVisits = useMemo(() => {
        const lowerCaseTerm = searchTerm.toLowerCase();
        return archivedVisits
            .filter(v =>
                v.nom.toLowerCase().includes(lowerCaseTerm) ||
                v.congregation.toLowerCase().includes(lowerCaseTerm) ||
                v.host.toLowerCase().includes(lowerCaseTerm)
            )
            .sort((a, b) => new Date(b.visitDate + 'T00:00:00').getTime() - new Date(a.visitDate + 'T00:00:00').getTime());
    }, [archivedVisits, searchTerm]);

    const handleDelete = async (visit: Visit) => {
        const visitDate = new Date(visit.visitDate + 'T00:00:00').toLocaleDateString('fr-FR');
        if (await confirm(`Êtes-vous sûr de vouloir supprimer définitivement l'archive de la visite de ${visit.nom} du ${visitDate} ?\n\nCette action est irréversible.`)) {
            deleteArchivedVisit(visit.visitId);
        }
    };
    
    const formatDate = (dateString: string) => {
        return new Date(dateString + 'T00:00:00').toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div>
            <div className="relative mb-4">
                <input
                    type="text"
                    placeholder="Rechercher dans l'archive (par orateur, congrégation, accueil...)"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-border-light dark:border-border-dark rounded-lg focus:ring-primary focus:border-primary bg-card-light dark:bg-primary-light/10"
                    aria-label="Rechercher dans l'archive"
                />
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="w-5 h-5 text-gray-400" />
                </div>
            </div>

            {sortedAndFilteredVisits.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {sortedAndFilteredVisits.map((visit, index) => (
                        <div 
                            key={visit.visitId} 
                            className="bg-gray-50 dark:bg-primary-light/10 p-3 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-2 animate-fade-in-up opacity-0"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div>
                                <p className="font-semibold text-text-main dark:text-text-main-dark">{visit.nom}</p>
                                <p className="text-sm text-text-muted dark:text-text-muted-dark">{visit.congregation}</p>
                                <p className="text-sm text-text-muted dark:text-text-muted-dark mt-1">
                                    {formatDate(visit.visitDate)} - Accueil par : <strong>{visit.host}</strong>
                                </p>
                            </div>
                            <button 
                                onClick={() => handleDelete(visit)} 
                                className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full self-start sm:self-center transition-colors active:scale-90"
                                title="Supprimer définitivement"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                 <div className="text-center py-12 px-6">
                    <CalendarIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" />
                    <h3 className="mt-4 text-xl font-semibold text-text-main dark:text-text-main-dark">
                        {searchTerm ? `Aucun résultat pour "${searchTerm}"` : "L'archive est vide"}
                    </h3>
                    <p className="mt-1 text-text-muted dark:text-text-muted-dark">
                        {searchTerm ? "Essayez d'autres mots-clés." : "Les visites que vous terminez apparaîtront ici."}
                    </p>
                </div>
            )}
        </div>
    );
};