import React, { useState, useMemo } from 'react';
import { Speaker, Visit } from '../types';
import { PlusIcon, SearchIcon, ChevronDownIcon, UserCircleIcon, SparklesIcon, SpinnerIcon, ExclamationTriangleIcon, CarIcon, UserGroupIcon, MaleIcon, FemaleIcon, HomeIcon } from './Icons';
import { useData } from '../contexts/DataContext';
import { Avatar } from './Avatar';
import { useToast } from '../contexts/ToastContext';
import { GoogleGenAI, Type } from '@google/genai';
import { SpeakerSuggestionModal } from './SpeakerSuggestionModal';

interface SpeakerListProps {
    onSchedule: (speaker: Speaker) => void;
    onAddSpeaker: () => void;
    onEditSpeaker: (speaker: Speaker) => void;
    isExpanded: boolean;
    onToggleExpand: () => void;
}

type SortOption = 'name' | 'congregation' | 'lastVisit';

export const SpeakerList: React.FC<SpeakerListProps> = ({ onSchedule, onAddSpeaker, onEditSpeaker, isExpanded, onToggleExpand }) => {
    const { speakers, archivedVisits, apiKey, isOnline } = useData();
    const { addToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCongregation, setSelectedCongregation] = useState('');
    const [sortOption, setSortOption] = useState<SortOption>('name');
    
    const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
    const [suggestions, setSuggestions] = useState<{ speaker: Speaker; reason: string }[]>([]);
    const [isSuggesting, setIsSuggesting] = useState(false);

    const congregations = useMemo(() => {
        const allCongs = speakers.map(s => s.congregation);
        return [...new Set(allCongs)].sort();
    }, [speakers]);
    
    const getMostRecentVisitDate = (speaker: Speaker): Date | null => {
        const historyDates = (speaker.talkHistory || []).map(h => new Date(h.date + 'T00:00:00'));
        const archivedVisitDates = archivedVisits
            .filter(v => v.id === speaker.id)
            .map(v => new Date(v.visitDate + 'T00:00:00'));
        
        const allDates = [...historyDates, ...archivedVisitDates];

        if (allDates.length === 0) {
            return null;
        }

        const mostRecent = new Date(Math.max.apply(null, allDates.map(d => d.getTime())));
        return mostRecent;
    };

    const filteredSpeakers = useMemo(() => {
        let speakersToSort = speakers.filter(speaker => {
            const searchTermMatch = searchTerm === '' ||
                speaker.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                speaker.congregation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (speaker.tags || []).join(' ').toLowerCase().includes(searchTerm.toLowerCase());
            
            const congregationMatch = selectedCongregation === '' || speaker.congregation === selectedCongregation;

            return searchTermMatch && congregationMatch;
        });

        switch (sortOption) {
            case 'congregation':
                speakersToSort.sort((a, b) => a.congregation.localeCompare(b.congregation) || a.nom.localeCompare(b.nom));
                break;
            case 'lastVisit':
                speakersToSort.sort((a, b) => {
                    const dateA = getMostRecentVisitDate(a)?.getTime() || 0;
                    const dateB = getMostRecentVisitDate(b)?.getTime() || 0;
                    if (dateA === 0 && dateB !== 0) return -1; // Nulls (never visited) first
                    if (dateA !== 0 && dateB === 0) return 1;
                    return dateA - dateB; // Oldest first
                });
                break;
            case 'name':
            default:
                speakersToSort.sort((a, b) => a.nom.localeCompare(b.nom));
                break;
        }
        return speakersToSort;
    }, [speakers, searchTerm, selectedCongregation, sortOption, archivedVisits]);

    const handleSuggestSpeakers = async () => {
        if (!isOnline) {
            addToast("Connexion Internet requise pour utiliser l'assistant IA.", 'info');
            return;
        }
        if (!apiKey) {
            addToast("Veuillez configurer votre clé API dans les Paramètres pour utiliser l'IA.", 'error');
            return;
        }

        setIsSuggesting(true);
        setIsSuggestionModalOpen(true);
        setSuggestions([]);

        try {
            const speakersWithLastVisit = speakers.map(speaker => {
                const lastVisit = getMostRecentVisitDate(speaker);
                return {
                    name: speaker.nom,
                    lastVisit: lastVisit ? lastVisit.toISOString().split('T')[0] : 'Jamais'
                };
            });

            const speakerListString = speakersWithLastVisit
                .map(s => `- ${s.name}, dernière visite: ${s.lastVisit}`)
                .join('\n');

            const prompt = `Vous êtes un assistant aidant à planifier les orateurs pour une congrégation. Votre objectif est de promouvoir la variété. Voici une liste des orateurs disponibles et la date de leur dernière intervention :\n\n${speakerListString}\n\nEn vous basant sur cette liste, suggérez 3 orateurs à inviter prochainement. Donnez la priorité à ceux qui ne sont pas venus depuis le plus longtemps ou qui ne sont jamais venus. Retournez votre réponse sous la forme d'un tableau JSON d'objets. Chaque objet doit avoir deux clés : "speakerName" (le nom exact de la liste) et "reason" (une courte justification amicale en français pour la suggestion). Ne renvoyez que le tableau JSON, sans texte supplémentaire avant ou après.`;
            
            const ai = new GoogleGenAI({ apiKey });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                speakerName: { type: Type.STRING },
                                reason: { type: Type.STRING }
                            },
                            required: ["speakerName", "reason"]
                        }
                    }
                }
            });

            const jsonStr = response.text.trim();
            const aiSuggestions: { speakerName: string, reason: string }[] = JSON.parse(jsonStr);

            const matchedSuggestions = aiSuggestions.map(suggestion => {
                const speaker = speakers.find(s => s.nom === suggestion.speakerName);
                return speaker ? { speaker, reason: suggestion.reason } : null;
            }).filter((s): s is { speaker: Speaker, reason: string } => s !== null);

            setSuggestions(matchedSuggestions);

        } catch (error) {
            console.error("Error suggesting speakers:", error);
            addToast(error instanceof Error && error.message.includes("API key") 
                ? "Erreur: La clé API n'est pas configurée ou est invalide."
                : "Erreur lors de la génération des suggestions.", 'error');
            setIsSuggestionModalOpen(false); // Close modal on error
        } finally {
            setIsSuggesting(false);
        }
    };

    return (
        <div className="bg-card-light/80 dark:bg-card-dark/80 backdrop-blur-sm rounded-xl shadow-soft-lg p-6 mt-8">
             <div className="flex justify-between items-center cursor-pointer" onClick={onToggleExpand}>
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold font-display text-primary dark:text-white">Liste des orateurs</h2>
                    <span className="bg-gray-200 dark:bg-primary-light/20 text-text-muted dark:text-text-muted-dark text-sm font-semibold px-3 py-1 rounded-full">
                        {speakers.length}
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
                                    placeholder="Rechercher un orateur..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-border-light dark:border-border-dark rounded-lg focus:ring-secondary focus:border-secondary bg-card-light dark:bg-primary-light/10"
                                    aria-label="Rechercher un orateur"
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <SearchIcon className="w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                             <div className="flex-grow md:flex-grow-0 grid grid-cols-2 md:flex md:flex-row gap-4">
                                <div className="relative">
                                    <select
                                        value={selectedCongregation}
                                        onChange={(e) => setSelectedCongregation(e.target.value)}
                                        className="w-full pl-3 pr-10 py-2 border border-border-light dark:border-border-dark rounded-lg focus:ring-secondary focus:border-secondary appearance-none bg-card-light dark:bg-primary-light/10"
                                        aria-label="Filtrer par congrégation"
                                    >
                                        <option value="">Toutes les congrégations</option>
                                        {congregations.map(cong => (
                                            <option key={cong} value={cong}>{cong}</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                                    </div>
                                </div>
                                 <div className="relative">
                                    <select
                                        value={sortOption}
                                        onChange={(e) => setSortOption(e.target.value as SortOption)}
                                        className="w-full pl-3 pr-10 py-2 border border-border-light dark:border-border-dark rounded-lg focus:ring-secondary focus:border-secondary appearance-none bg-card-light dark:bg-primary-light/10"
                                        aria-label="Trier les orateurs par"
                                    >
                                        <option value="name">Trier par Nom</option>
                                        <option value="congregation">Trier par Congrégation</option>
                                        <option value="lastVisit">Trier par Dernière visite</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                            <button 
                                onClick={handleSuggestSpeakers}
                                className="w-full md:w-auto flex-shrink-0 flex items-center justify-center px-4 py-2 bg-secondary/10 hover:bg-secondary/20 text-secondary dark:text-secondary font-semibold rounded-lg transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isSuggesting || !isOnline || !apiKey}
                                title={!isOnline ? "Connexion Internet requise pour cette fonctionnalité." : !apiKey ? "Veuillez configurer votre clé API dans les Paramètres." : "Suggérer un orateur avec l'IA"}
                            >
                                {isSuggesting ? <SpinnerIcon className="w-5 h-5 mr-2" /> : <SparklesIcon className="w-5 h-5 mr-2" />}
                                {isSuggesting ? "Suggestion..." : "Suggérer"}
                            </button>
                            <button 
                                onClick={onAddSpeaker}
                                className="w-full md:w-auto flex-shrink-0 flex items-center justify-center px-4 py-2 bg-primary hover:bg-primary-light text-white font-semibold rounded-lg transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                            >
                                <PlusIcon className="w-5 h-5 mr-2" />
                                Ajouter
                            </button>
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredSpeakers.length > 0 ? (
                            filteredSpeakers.map((speaker, index) => {
                                const lastVisitDate = getMostRecentVisitDate(speaker);
                                const isLocalSpeaker = speaker.congregation.toLowerCase().includes('lyon');
                                return (
                                <div 
                                    key={speaker.id} 
                                    className="bg-card-light/50 dark:bg-card-dark/50 p-4 rounded-xl shadow-md flex flex-col h-full animate-fade-in-up opacity-0"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="flex items-center gap-4 flex-grow min-w-0">
                                        <Avatar item={speaker} size="w-12 h-12" />
                                        <div className="min-w-0">
                                            <p className="font-bold text-lg text-text-main dark:text-text-main-dark truncate" title={speaker.nom}>{speaker.nom}</p>
                                            <p className="text-sm text-text-muted dark:text-text-muted-dark truncate" title={speaker.congregation}>{speaker.congregation}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                                         {isLocalSpeaker && (
                                            <span title="Orateur local" className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                                                <HomeIcon className="w-4 h-4" /> Local
                                            </span>
                                        )}
                                        {speaker.isVehiculed && (
                                            <span title="Véhiculé" className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                                <CarIcon className="w-4 h-4" /> Véhiculé
                                            </span>
                                        )}
                                        {speaker.maritalStatus === 'couple' && (
                                            <span title="En couple" className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">
                                                <UserGroupIcon className="w-4 h-4" /> En Couple
                                            </span>
                                        )}
                                        {!speaker.telephone && (
                                            <span title="Numéro de téléphone manquant" className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-orange/20 text-orange dark:bg-orange/30">
                                                <ExclamationTriangleIcon className="w-4 h-4" /> Tél. manquant
                                            </span>
                                        )}
                                        {(speaker.tags || []).map(tag => (
                                            <span key={tag} className="text-xs px-2 py-1 rounded-full bg-secondary/10 text-secondary dark:text-secondary dark:bg-secondary/20 font-medium capitalize">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="text-sm text-text-muted dark:text-text-muted-dark mt-4 pt-4 border-t border-border-light dark:border-border-dark">
                                        Dernière visite : <span className="font-semibold text-text-main dark:text-text-main-dark">{lastVisitDate ? lastVisitDate.toLocaleDateString('fr-FR') : 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-4">
                                        <button
                                            onClick={() => onEditSpeaker(speaker)}
                                            className="flex-1 text-center py-2 text-text-muted dark:text-text-muted-dark hover:text-primary dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-primary-light/20 transition-colors active:scale-95 font-semibold"
                                            aria-label={`Détails pour ${speaker.nom}`}
                                        >
                                            Détails
                                        </button>
                                        <button 
                                            onClick={() => onSchedule(speaker)} 
                                            className="flex-1 flex items-center justify-center px-4 py-2 bg-primary hover:bg-primary-light text-white font-semibold rounded-lg transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                        >
                                            <PlusIcon className="w-5 h-5 mr-2" />
                                            Programmer
                                        </button>
                                    </div>
                                </div>
                            )})
                        ) : (
                             <div className="md:col-span-2 text-center py-12 px-6">
                                <UserCircleIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" />
                                <h3 className="mt-4 text-xl font-semibold text-text-main dark:text-text-main-dark">Aucun orateur trouvé</h3>
                                <p className="mt-1 text-text-muted dark:text-text-muted-dark">Essayez de modifier vos filtres de recherche.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <SpeakerSuggestionModal
                isOpen={isSuggestionModalOpen}
                onClose={() => setIsSuggestionModalOpen(false)}
                isLoading={isSuggesting}
                suggestions={suggestions}
                onSchedule={onSchedule}
            />
        </div>
    );
};