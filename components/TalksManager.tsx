import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { SearchIcon, PodiumIcon, PlusIcon, EditIcon, ArrowUpOnSquareIcon, ChevronDownIcon } from './Icons';
import { PublicTalk, Visit } from '../types';
import { TalkDetailsModal, UpdateTalksListModal } from './TalkDetailsModal';
import { AssignTalkModal } from './AssignTalkModal';

type SortOption = 'number' | 'theme' | 'lastVisit';
type TalkStatus = 'Scheduled' | 'Recent' | 'Available' | 'New';

const statusInfo: { [key in TalkStatus]: { text: string; color: string } } = {
    Scheduled: { text: 'Programmé', color: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300' },
    Recent: { text: 'Récent', color: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' },
    Available: { text: 'Disponible', color: 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300' },
    New: { text: 'Nouveau', color: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300' },
};

interface TalkCardProps {
    talk: any; // Using 'any' because it's an extended object from useMemo
    onEdit: (talk: PublicTalk) => void;
    onAssign: (talk: PublicTalk) => void;
}

const TalkCard: React.FC<TalkCardProps> = ({ talk, onEdit, onAssign }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { visits, archivedVisits } = useData();

    const fullHistory = useMemo(() => {
        return [...visits, ...archivedVisits]
            .filter(v => v.talkTheme?.trim() === talk.theme.trim())
            .sort((a,b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());
    }, [visits, archivedVisits, talk.theme]);

    const currentStatus = statusInfo[talk.status];

    return (
        <div className="bg-gray-50 dark:bg-card-dark rounded-lg transition-shadow hover:shadow-md">
            <div className="p-3 flex items-center gap-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)} role="button" aria-expanded={isExpanded}>
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light rounded-full font-bold text-lg">
                    {talk.number}
                </div>
                <div className="flex-grow min-w-0">
                    <p className="font-semibold text-text-main dark:text-text-main-dark truncate" title={talk.theme}>{talk.theme}</p>
                    <div className="flex items-center gap-4 text-xs text-text-muted dark:text-text-muted-dark mt-1">
                        <span className={`px-2 py-0.5 font-semibold rounded-full ${currentStatus.color}`}>{currentStatus.text}</span>
                        {talk.nextVisit ? (
                            <span>Prochaine fois: <strong>{talk.nextVisit.date}</strong> par <strong>{talk.nextVisit.speaker}</strong></span>
                        ) : talk.lastPresented ? (
                            <span>Dernière fois: <strong>{talk.lastPresented.date}</strong> par <strong>{talk.lastPresented.speaker}</strong></span>
                        ) : null}
                    </div>
                </div>
                <div className="flex items-center flex-shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); onAssign(talk); }} className="hidden sm:flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary dark:text-primary-light text-sm font-semibold rounded-md hover:bg-primary/20 transition-transform active:scale-95">
                        <PlusIcon className="w-4 h-4" /> Attribuer
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onEdit(talk); }} className="p-2 text-text-muted dark:text-text-muted-dark hover:text-primary dark:hover:text-primary-light rounded-full transition-colors active:scale-90" aria-label={`Modifier le discours ${talk.number}`} title="Modifier">
                        <EditIcon className="w-5 h-5" />
                    </button>
                    <ChevronDownIcon className={`w-6 h-6 text-text-muted dark:text-text-muted-dark transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {isExpanded && (
                <div className="px-3 pb-3 animate-fade-in">
                    <div className="border-t border-border-light dark:border-border-dark pt-3">
                         <button onClick={(e) => { e.stopPropagation(); onAssign(talk); }} className="sm:hidden w-full flex items-center justify-center gap-2 mb-3 px-3 py-2 bg-primary/10 text-primary dark:text-primary-light text-sm font-semibold rounded-md hover:bg-primary/20 transition-transform active:scale-95">
                            <PlusIcon className="w-4 h-4" /> Attribuer ce discours
                        </button>
                        <h5 className="font-bold text-sm mb-2 px-2">Historique des présentations</h5>
                        {fullHistory.length > 0 ? (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-xs text-text-muted dark:text-text-muted-dark">
                                        <th className="p-2">Date</th>
                                        <th className="p-2">Orateur</th>
                                        <th className="p-2">Statut</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {fullHistory.map(visit => (
                                        <tr key={visit.visitId} className="border-t border-border-light dark:border-border-dark">
                                            <td className="p-2">{new Date(visit.visitDate + 'T00:00:00').toLocaleDateString('fr-FR')}</td>
                                            <td className="p-2 font-semibold">{visit.nom}</td>
                                            <td className="p-2">{visits.some(v => v.visitId === visit.visitId) ? 'Programmé' : 'Archivé'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-center text-sm text-text-muted dark:text-text-muted-dark py-4">Ce discours n'a jamais été présenté.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export const TalksManager: React.FC = () => {
    const { visits, archivedVisits, publicTalks } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [editingTalk, setEditingTalk] = useState<PublicTalk | null>(null);
    const [talkToAssign, setTalkToAssign] = useState<PublicTalk | null>(null);
    const [sortOption, setSortOption] = useState<SortOption>('number');
    const [statusFilter, setStatusFilter] = useState<'all' | TalkStatus>('all');

    const talkHistoryMap = useMemo(() => {
        const history = new Map<string, { date: Date; speaker: string }>();
        // Only archived visits count for "last presented"
        archivedVisits.forEach(visit => {
            if (visit.talkTheme) {
                const theme = visit.talkTheme.trim();
                const visitDate = new Date(visit.visitDate + 'T00:00:00');
                if (!history.has(theme) || visitDate > history.get(theme)!.date) {
                    history.set(theme, { date: visitDate, speaker: visit.nom });
                }
            }
        });
        return history;
    }, [archivedVisits]);
    
    const allVisits = useMemo(() => [...visits, ...archivedVisits], [visits, archivedVisits]);

    const talksWithInfo = useMemo(() => {
        let filtered = publicTalks.map(talk => {
            const lastPresentedHistory = talkHistoryMap.get(talk.theme.trim());
            const nextVisit = visits.find(v => v.talkTheme?.trim() === talk.theme.trim());
            
            let status: TalkStatus = 'New';
            if (nextVisit) {
                status = 'Scheduled';
            } else if (lastPresentedHistory) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const diffTime = today.getTime() - lastPresentedHistory.date.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                status = (diffDays <= 365) ? 'Recent' : 'Available';
            }
            
            return {
                ...talk,
                lastPresented: lastPresentedHistory ? { date: lastPresentedHistory.date.toLocaleDateString('fr-FR'), speaker: lastPresentedHistory.speaker } : null,
                nextVisit: nextVisit ? { date: new Date(nextVisit.visitDate + 'T00:00:00').toLocaleDateString('fr-FR'), speaker: nextVisit.nom } : null,
                status,
                recencyDays: lastPresentedHistory ? (new Date().getTime() - lastPresentedHistory.date.getTime()) / (1000 * 3600 * 24) : null,
            };
        }).filter(talk => {
            const lowerSearchTerm = searchTerm.toLowerCase();
            const speakerHistory = allVisits
                .filter(v => v.talkTheme?.trim() === talk.theme.trim())
                .some(v => v.nom.toLowerCase().includes(lowerSearchTerm));

            return talk.theme.toLowerCase().includes(lowerSearchTerm) ||
                   talk.number.toString().toLowerCase().includes(lowerSearchTerm) ||
                   speakerHistory;
        });
        
        if (statusFilter !== 'all') {
            filtered = filtered.filter(t => t.status === statusFilter);
        }

        filtered.sort((a, b) => {
            switch (sortOption) {
                case 'theme':
                    return a.theme.localeCompare(b.theme);
                case 'lastVisit':
                    const daysA = a.recencyDays === null ? -1 : a.recencyDays; // Never presented should be last
                    const daysB = b.recencyDays === null ? -1 : b.recencyDays;
                    return daysA - daysB; // Smaller days (more recent) first
                case 'number':
                default:
                    const numA = typeof a.number === 'string' ? Infinity : a.number;
                    const numB = typeof b.number === 'string' ? Infinity : b.number;
                    if (numA === Infinity && numB === Infinity) return a.number.toString().localeCompare(b.number.toString());
                    return numA - numB;
            }
        });

        return filtered;
    }, [publicTalks, talkHistoryMap, visits, allVisits, searchTerm, sortOption, statusFilter]);

    const handleAddTalk = () => {
        setEditingTalk(null);
        setIsDetailsModalOpen(true);
    };

    const handleEditTalk = (talk: PublicTalk) => {
        setEditingTalk(talk);
        setIsDetailsModalOpen(true);
    };

    const handleAssignTalk = (talk: PublicTalk) => {
        setTalkToAssign(talk);
        setIsAssignModalOpen(true);
    };

    return (
        <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-lg p-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-primary dark:text-white">Gestion des Discours</h2>
                    <p className="text-text-muted dark:text-text-muted-dark mt-1">Consultez, ajoutez ou modifiez les discours publics.</p>
                </div>
                 <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <button onClick={() => setIsUpdateModalOpen(true)} className="flex-shrink-0 w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary dark:text-text-main-dark font-semibold rounded-lg transition-transform active:scale-95">
                        <ArrowUpOnSquareIcon className="w-5 h-5 mr-2" />
                        Mettre à jour la liste
                    </button>
                    <button onClick={handleAddTalk} className="flex-shrink-0 w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-transform active:scale-95">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Ajouter un discours
                    </button>
                </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="relative w-full flex-grow">
                    <input
                        type="text"
                        placeholder="Rechercher par thème, n° ou orateur..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-border-light dark:border-border-dark rounded-lg focus:ring-primary focus:border-primary bg-card-light dark:bg-card-dark text-text-main dark:text-text-main-dark dark:placeholder-text-muted-dark"
                        aria-label="Rechercher un discours par thème, numéro ou orateur"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="w-5 h-5 text-gray-400" />
                    </div>
                </div>
                <div className="relative w-full md:w-52">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="w-full pl-3 pr-10 py-2 border border-border-light dark:border-border-dark rounded-lg focus:ring-primary focus:border-primary appearance-none bg-card-light dark:bg-card-dark text-text-main dark:text-text-main-dark"
                        aria-label="Filtrer par statut"
                    >
                        <option value="all">Tous les statuts</option>
                        {Object.entries(statusInfo).map(([key, value]) => (
                            <option key={key} value={key}>{value.text}</option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                    </div>
                </div>
                <div className="relative w-full md:w-52">
                    <select
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value as SortOption)}
                        className="w-full pl-3 pr-10 py-2 border border-border-light dark:border-border-dark rounded-lg focus:ring-primary focus:border-primary appearance-none bg-card-light dark:bg-card-dark text-text-main dark:text-text-main-dark"
                        aria-label="Trier les discours par"
                    >
                        <option value="number">Trier par Numéro</option>
                        <option value="theme">Trier par Thème</option>
                        <option value="lastVisit">Trier par Récence</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                    </div>
                </div>
            </div>
            {talksWithInfo.length > 0 ? (
                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 -mr-2">
                    {talksWithInfo.map((talk, index) => (
                        <div key={talk.number} className="animate-fade-in-up opacity-0" style={{ animationDelay: `${index * 30}ms` }}>
                            <TalkCard talk={talk} onEdit={handleEditTalk} onAssign={handleAssignTalk} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 px-6">
                    <PodiumIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" />
                    <h3 className="mt-4 text-xl font-semibold text-text-main dark:text-text-main-dark">Aucun discours trouvé</h3>
                    <p className="mt-1 text-text-muted dark:text-text-muted-dark">Essayez de modifier votre recherche ou ajoutez un nouveau discours.</p>
                </div>
            )}
            
            {isDetailsModalOpen && (
                <TalkDetailsModal 
                    isOpen={isDetailsModalOpen}
                    onClose={() => setIsDetailsModalOpen(false)}
                    talk={editingTalk}
                />
            )}
            {isUpdateModalOpen && (
                <UpdateTalksListModal 
                    isOpen={isUpdateModalOpen}
                    onClose={() => setIsUpdateModalOpen(false)}
                />
            )}
            {isAssignModalOpen && (
                <AssignTalkModal
                    isOpen={isAssignModalOpen}
                    onClose={() => setIsAssignModalOpen(false)}
                    talk={talkToAssign}
                />
            )}
        </div>
    );
};