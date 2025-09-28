import React, { useState, useEffect, useCallback } from 'react';
import { Speaker, Host } from '../types';
import { XIcon, SpinnerIcon, CheckCircleIcon, UserIcon, HomeIcon } from './Icons';
import { useData } from '../contexts/DataContext';
import { Avatar } from './Avatar';
import { useToast } from '../contexts/ToastContext';

interface DuplicateFinderModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const DuplicateSpeakerGroup: React.FC<{ group: Speaker[], onMerge: () => void }> = ({ group, onMerge }) => {
    const [primaryId, setPrimaryId] = useState<string>(group[0].id);
    const { visits, archivedVisits, mergeSpeakers } = useData();

    const getVisitCount = useCallback((speakerId: string) => {
        const upcoming = visits.filter(v => v.id === speakerId).length;
        const past = archivedVisits.filter(v => v.id === speakerId).length;
        return { upcoming, past };
    }, [visits, archivedVisits]);

    const handleMerge = () => {
        const duplicateIds = group.map(s => s.id).filter(id => id !== primaryId);
        mergeSpeakers(primaryId, duplicateIds);
        onMerge();
    };

    return (
        <div className="bg-gray-100 dark:bg-primary-light/10 p-4 rounded-lg">
            <h4 className="font-bold text-lg text-text-main dark:text-text-main-dark mb-2">"{group[0].nom}"</h4>
            <div className="space-y-2">
                {group.map(speaker => {
                    const { upcoming, past } = getVisitCount(speaker.id);
                    return (
                        <div key={speaker.id} className="p-2 border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark rounded-md">
                             <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="radio"
                                    name={`speaker-group-${group[0].nom}`}
                                    checked={primaryId === speaker.id}
                                    onChange={() => setPrimaryId(speaker.id)}
                                    className="h-5 w-5 text-primary focus:ring-primary"
                                />
                                <Avatar item={speaker} size="w-10 h-10" />
                                <div className="text-sm flex-grow">
                                    <p className="font-semibold">{speaker.congregation}</p>
                                    <p className="text-xs text-text-muted dark:text-text-muted-dark">{speaker.telephone || 'Pas de tél.'}</p>
                                </div>
                                <div className="text-xs text-right text-text-muted dark:text-text-muted-dark">
                                    <p>{upcoming} visite(s) à venir</p>
                                    <p>{past} visite(s) archivée(s)</p>
                                </div>
                             </label>
                        </div>
                    );
                })}
            </div>
            <div className="text-right mt-3">
                <button onClick={handleMerge} className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark transition-transform active:scale-95">
                    Fusionner les {group.length} entrées
                </button>
            </div>
        </div>
    );
};

const DuplicateHostGroup: React.FC<{ group: Host[], onMerge: () => void }> = ({ group, onMerge }) => {
    const [primaryName, setPrimaryName] = useState<string>(group[0].nom);
    const { visits, archivedVisits, mergeHosts } = useData();

    const getVisitCount = useCallback((hostName: string) => {
        const upcoming = visits.filter(v => v.host === hostName).length;
        const past = archivedVisits.filter(v => v.host === hostName).length;
        return { upcoming, past };
    }, [visits, archivedVisits]);

    const handleMerge = () => {
        const duplicateNames = group.map(h => h.nom).filter(name => name !== primaryName);
        mergeHosts(primaryName, duplicateNames);
        onMerge();
    };

    return (
        <div className="bg-gray-100 dark:bg-primary-light/10 p-4 rounded-lg">
            <h4 className="font-bold text-lg text-text-main dark:text-text-main-dark mb-2">"{group[0].nom}"</h4>
            <div className="space-y-2">
                {group.map(host => {
                    const { upcoming, past } = getVisitCount(host.nom);
                    return (
                        <div key={host.nom} className="p-2 border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark rounded-md">
                             <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="radio"
                                    name={`host-group-${group[0].nom}`}
                                    checked={primaryName === host.nom}
                                    onChange={() => setPrimaryName(host.nom)}
                                    className="h-5 w-5 text-primary focus:ring-primary"
                                />
                                <Avatar item={host} size="w-10 h-10" />
                                <div className="text-sm flex-grow">
                                    <p className="font-semibold">{host.address || 'Pas d\'adresse'}</p>
                                    <p className="text-xs text-text-muted dark:text-text-muted-dark">{host.telephone || 'Pas de tél.'}</p>
                                </div>
                                <div className="text-xs text-right text-text-muted dark:text-text-muted-dark">
                                    <p>{upcoming} visite(s) à venir</p>
                                    <p>{past} visite(s) archivée(s)</p>
                                </div>
                             </label>
                        </div>
                    );
                })}
            </div>
            <div className="text-right mt-3">
                <button onClick={handleMerge} className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark transition-transform active:scale-95">
                    Fusionner les {group.length} entrées
                </button>
            </div>
        </div>
    );
};

export const DuplicateFinderModal: React.FC<DuplicateFinderModalProps> = ({ isOpen, onClose }) => {
    const { speakers, hosts } = useData();
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'speakers' | 'hosts'>('speakers');
    const [speakerGroups, setSpeakerGroups] = useState<Speaker[][]>([]);
    const [hostGroups, setHostGroups] = useState<Host[][]>([]);

    const findDuplicates = useCallback(() => {
        setIsLoading(true);
        // Find duplicate speakers
        const speakerMap = new Map<string, Speaker[]>();
        speakers.forEach(speaker => {
            const key = speaker.nom.toLowerCase().trim();
            if (!speakerMap.has(key)) {
                speakerMap.set(key, []);
            }
            speakerMap.get(key)!.push(speaker);
        });
        const speakerDups = Array.from(speakerMap.values()).filter(group => group.length > 1);
        setSpeakerGroups(speakerDups);

        // Find duplicate hosts
        const hostMap = new Map<string, Host[]>();
        hosts.forEach(host => {
            const key = host.nom.toLowerCase().trim();
            if (!hostMap.has(key)) {
                hostMap.set(key, []);
            }
            hostMap.get(key)!.push(host);
        });
        const hostDups = Array.from(hostMap.values()).filter(group => group.length > 1);
        setHostGroups(hostDups);

        setIsLoading(false);
    }, [speakers, hosts]);

    useEffect(() => {
        if (isOpen) {
            findDuplicates();
        }
    }, [isOpen, findDuplicates]);

    if (!isOpen) return null;

    const handleMergeCompletion = () => {
        addToast("Fusion réussie !", "success");
        findDuplicates(); // Re-run analysis after merge
    };

    const hasDuplicates = speakerGroups.length > 0 || hostGroups.length > 0;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-xl w-full sm:max-w-3xl max-h-[90vh] flex flex-col animate-fade-in-up">
                <div className="p-6 bg-gradient-to-br from-primary to-secondary dark:from-primary-dark dark:to-secondary text-white rounded-t-xl">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">Recherche de Doublons</h2>
                        <button onClick={onClose} className="p-2 -mt-2 -mr-2 rounded-full text-white/70 hover:bg-white/20">
                            <XIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="border-b border-border-light dark:border-border-dark flex-shrink-0">
                    <nav className="-mb-px flex space-x-6 px-6" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('speakers')}
                            className={`${activeTab === 'speakers' ? 'border-secondary text-secondary' : 'border-transparent text-text-muted dark:text-text-muted-dark hover:text-secondary'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
                        >
                            Orateurs ({speakerGroups.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('hosts')}
                            className={`${activeTab === 'hosts' ? 'border-secondary text-secondary' : 'border-transparent text-text-muted dark:text-text-muted-dark hover:text-secondary'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
                        >
                            Contacts d'accueil ({hostGroups.length})
                        </button>
                    </nav>
                </div>

                <div className="p-6 overflow-y-auto flex-1 min-h-0">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-48">
                            <SpinnerIcon className="w-12 h-12 text-primary" />
                            <p className="mt-4 text-text-muted dark:text-text-muted-dark">Analyse en cours...</p>
                        </div>
                    ) : !hasDuplicates ? (
                        <div className="flex flex-col items-center justify-center h-48 text-center">
                            <CheckCircleIcon className="w-16 h-16 text-green-500" />
                            <h3 className="mt-4 text-xl font-semibold text-text-main dark:text-text-main-dark">Aucun doublon trouvé</h3>
                            <p className="mt-1 text-text-muted dark:text-text-muted-dark">Vos listes sont propres !</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {activeTab === 'speakers' && (
                                speakerGroups.length > 0 ? (
                                    speakerGroups.map(group => <DuplicateSpeakerGroup key={group[0].id} group={group} onMerge={handleMergeCompletion} />)
                                ) : (
                                    <div className="text-center py-8">
                                        <UserIcon className="w-12 h-12 mx-auto text-gray-400"/>
                                        <p className="mt-2 text-text-muted dark:text-text-muted-dark">Aucun doublon trouvé pour les orateurs.</p>
                                    </div>
                                )
                            )}
                            {activeTab === 'hosts' && (
                                hostGroups.length > 0 ? (
                                    hostGroups.map(group => <DuplicateHostGroup key={group[0].nom} group={group} onMerge={handleMergeCompletion} />)
                                ) : (
                                    <div className="text-center py-8">
                                        <HomeIcon className="w-12 h-12 mx-auto text-gray-400"/>
                                        <p className="mt-2 text-text-muted dark:text-text-muted-dark">Aucun doublon trouvé pour les contacts d'accueil.</p>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>

                 <div className="bg-gray-50 dark:bg-background-dark px-6 py-4 flex justify-end space-x-3 border-t border-border-light dark:border-border-dark rounded-b-xl">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-card-light dark:bg-card-dark border border-gray-300 dark:border-border-dark rounded-md text-sm font-medium text-text-main dark:text-text-main-dark hover:bg-gray-50 dark:hover:bg-primary-light/20">
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
};