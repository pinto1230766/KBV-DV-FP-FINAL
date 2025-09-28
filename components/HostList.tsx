import React, { useState, useMemo } from 'react';
import { Host } from '../types';
import { PlusIcon, TrashIcon, EditIcon, ChevronDownIcon, SearchIcon, ExclamationTriangleIcon } from './Icons';
import { useData } from '../contexts/DataContext';
import { useConfirm } from '../contexts/ConfirmContext';
import { Avatar as CustomAvatar } from './Avatar';

interface HostListProps {
    onAddHost: () => void;
    onEditHost: (host: Host) => void;
    isExpanded: boolean;
    onToggleExpand: () => void;
}

export const HostList: React.FC<HostListProps> = ({ onAddHost, onEditHost, isExpanded, onToggleExpand }) => {
    const { hosts, visits, deleteHost } = useData();
    const confirm = useConfirm();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredHosts = useMemo(() => {
        return hosts.filter(h => 
            h.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (h.tags || []).join(' ').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [hosts, searchTerm]);


    const handleDelete = async (hostName: string) => {
        const assignedVisitsCount = visits.filter(v => v.host === hostName && v.status !== 'cancelled').length;
        let confirmMessage = `Êtes-vous sûr de vouloir supprimer "${hostName}" de la liste d'accueil ?`;

        if (assignedVisitsCount > 0) {
            const visitPlural = assignedVisitsCount > 1 ? 's' : '';
            confirmMessage += `\n\nATTENTION : Ce contact est assigné à ${assignedVisitsCount} visite${visitPlural} à venir. L'accueil pour cette/ces visite${visitPlural} sera réinitialisé à "À définir".`;
        }

        if(await confirm(confirmMessage)) {
            deleteHost(hostName);
        }
    };

    return (
        <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-lg p-6 mt-8">
            <div className="flex justify-between items-center cursor-pointer" onClick={onToggleExpand}>
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold font-display text-primary dark:text-white">Liste des contacts d'accueil</h2>
                     <span className="bg-gray-200 dark:bg-primary-light/20 text-text-muted dark:text-text-muted-dark text-sm font-semibold px-3 py-1 rounded-full">
                        {hosts.length}
                    </span>
                </div>
                <ChevronDownIcon className={`w-6 h-6 text-text-muted dark:text-text-muted-dark transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            </div>

            <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-6 mb-4">
                         <div className="flex flex-col md:flex-row gap-4 flex-grow w-full md:w-auto">
                            <div className="relative flex-grow">
                                <input
                                    type="text"
                                    placeholder="Rechercher un contact..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-border-light dark:border-border-dark rounded-lg focus:ring-primary focus:border-primary bg-card-light dark:bg-primary-light/10"
                                    aria-label="Rechercher un contact d'accueil"
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <SearchIcon className="w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={onAddHost}
                            className="w-full md:w-auto flex-shrink-0 flex items-center justify-center px-4 py-2 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-transform active:scale-95"
                        >
                            <PlusIcon className="w-5 h-5 mr-2"/>
                            Ajouter un contact
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[32rem] overflow-y-auto p-1">
                        {filteredHosts.length > 0 ? filteredHosts.map((host, index) => (
                            <div 
                                key={host.nom} 
                                className="bg-gray-50 dark:bg-card-dark/50 p-4 rounded-lg flex flex-col h-full animate-fade-in-up opacity-0"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="flex justify-between items-start gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <CustomAvatar item={host} size="w-10 h-10" />
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-text-main dark:text-text-main-dark truncate" title={host.nom}>{host.nom}</p>
                                                {!host.telephone && (
                                                    <span title="Numéro de téléphone manquant">
                                                        <ExclamationTriangleIcon className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-text-muted dark:text-text-muted-dark capitalize">
                                                {host.gender === 'male' ? 'Frère' : host.gender === 'female' ? 'Sœur' : 'Couple'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center shrink-0 -mr-2">
                                        <button onClick={() => onEditHost(host)} className="p-2 text-gray-400 hover:text-primary dark:hover:text-primary-light rounded-full transition-colors active:scale-90" title="Modifier"><EditIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handleDelete(host.nom)} className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-full transition-colors active:scale-90" title="Supprimer"><TrashIcon className="w-5 h-5"/></button>
                                    </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-border-light dark:border-border-dark text-sm text-text-muted dark:text-text-muted-dark space-y-1 flex-grow">
                                    {(host.tags || []).length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-2">
                                            {(host.tags || []).map(tag => (
                                                <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-secondary/10 text-secondary dark:text-secondary dark:bg-secondary/20 font-medium capitalize">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    <p className="truncate" title={host.telephone}>{host.telephone || 'Téléphone non renseigné'}</p>
                                    <p className="truncate" title={host.address}>{host.address || 'Adresse non renseignée'}</p>
                                </div>
                            </div>
                        )) : (
                            <p className="md:col-span-2 text-center py-8 text-text-muted dark:text-text-muted-dark">Aucun contact d'accueil trouvé.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};