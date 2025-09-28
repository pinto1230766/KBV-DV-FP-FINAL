import React, { useState, useMemo, useRef } from 'react';
import { Visit, MessageRole, MessageType } from '../types';
import { CalendarIcon, EditIcon, TrashIcon, CheckIcon, InformationCircleIcon, ExclamationTriangleIcon, ChatBubbleOvalLeftEllipsisIcon, PlusIcon, DocumentTextIcon, VideoCameraIcon, EnvelopeIcon, EllipsisVerticalIcon, BellIcon, SparklesIcon, HomeIcon, PrintIcon, ListViewIcon, DashboardIcon, WifiIcon } from './Icons';
import { UNASSIGNED_HOST, NO_HOST_NEEDED } from '../constants';
import { useData } from '../contexts/DataContext';
import { Avatar } from './Avatar';

interface UpcomingVisitsProps {
    visits: Visit[];
    onEdit: (visit: Visit) => void;
    onDelete: (visitId: string) => void;
    onComplete: (visit: Visit) => void;
    onOpenMessageGenerator: (visit: Visit, role: MessageRole, messageType?: MessageType) => void;
    onScheduleFirst: () => void;
    viewMode: 'cards' | 'list';
}

type DateFilterType = 'all' | 'week' | 'month';
type StatusFilterType = 'all' | 'pending' | 'confirmed' | 'cancelled';

const formatMonth = (dateString: string) => new Date(dateString + 'T00:00:00').toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase().replace('.', '');
const formatDay = (dateString: string) => new Date(dateString + 'T00:00:00').toLocaleDateString('fr-FR', { day: '2-digit' });
const formatWeekday = (dateString: string) => new Date(dateString + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long' });

const statusStyles: { [key in Visit['status'] | 'completed']: { text: string; cardBorder: string; listBadge: string } } = {
  pending: { text: 'En attente', cardBorder: 'bg-amber-400', listBadge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300' },
  confirmed: { text: 'Confirmé', cardBorder: 'bg-green-500', listBadge: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' },
  cancelled: { text: 'Annulé', cardBorder: 'bg-red-500', listBadge: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' },
  completed: { text: 'Terminé', cardBorder: 'bg-gray-500', listBadge: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
};


// --- Sub-components for VisitCard ---

const ChecklistItem: React.FC<{ label: string; done: boolean; icon: React.FC<any>; }> = ({ label, done, icon: Icon }) => (
    <div className="flex items-center gap-2">
        <Icon className={`w-5 h-5 flex-shrink-0 ${done ? 'text-green-500' : 'text-gray-400 dark:text-gray-500'}`} />
        <span className={`text-sm ${done ? 'font-semibold text-green-600 dark:text-green-400' : 'text-text-muted dark:text-text-muted-dark'}`}>{label}</span>
    </div>
);


const VisitCardDateInfo: React.FC<{ visit: Visit; isZoom: boolean; isStreaming: boolean; isLocalSpeaker: boolean; isRemote: boolean; isSpecialEvent: boolean; }> = ({ visit, isZoom, isStreaming, isLocalSpeaker, isRemote, isSpecialEvent }) => (
    <div className="md:col-span-5 flex items-center space-x-2 sm:space-x-4 border-b md:border-b-0 md:border-r border-border-light dark:border-border-dark pb-4 md:pb-0 md:pr-6">
        <div className="flex flex-col items-center justify-center text-center p-2 rounded-lg w-16 sm:w-20 flex-shrink-0">
            <span className="text-xs sm:text-sm font-bold text-secondary">{formatMonth(visit.visitDate)}</span>
            <span className="text-3xl sm:text-4xl font-bold text-text-main dark:text-text-main-dark tracking-tight">{formatDay(visit.visitDate)}</span>
            <span className="text-xs text-text-muted dark:text-text-muted-dark capitalize">{formatWeekday(visit.visitDate)}</span>
        </div>
        <div className="min-w-0 flex-grow">
            <div className="flex items-center space-x-2 sm:space-x-3">
                <Avatar item={visit} size="w-12 h-12" />
                <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base sm:text-lg font-bold text-primary dark:text-white truncate" title={visit.nom}>{visit.nom}</h3>
                        {/* FIX: Wrap icons in a span with a title to provide tooltips without passing an invalid prop to the Icon component. */}
                        {visit.locationType === 'physical' && !isLocalSpeaker && !isSpecialEvent && <span title="Présentiel"><HomeIcon className="w-5 h-5 text-gray-500"/></span>}
                        {isZoom && <span title="Zoom"><VideoCameraIcon className="w-5 h-5 text-indigo-500"/></span>}
                        {isStreaming && <span title="Streaming"><WifiIcon className="w-5 h-5 text-purple-500"/></span>}
                        {isLocalSpeaker && !isRemote && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">Local</span>}
                        {isSpecialEvent && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300">Événement</span>}
                    </div>
                    <p className="text-xs sm:text-sm text-text-muted dark:text-text-muted-dark truncate" title={visit.congregation}>{visit.congregation}</p>
                </div>
            </div>
            {visit.talkTheme && (
                <div className="flex items-start space-x-1 sm:space-x-2 mt-1 sm:mt-2">
                    <DocumentTextIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm text-text-muted dark:text-text-muted-dark min-w-0" title={`${visit.talkNoOrType ? `(${visit.talkNoOrType}) ` : ''}${visit.talkTheme}`}>
                        <span className="font-semibold text-text-main dark:text-text-main-dark">{visit.talkNoOrType ? `(${visit.talkNoOrType})` : ''}</span> {visit.talkTheme}
                    </p>
                </div>
            )}
        </div>
    </div>
);

const VisitCardHostInfo: React.FC<{ visit: Visit; onEdit: (visit: Visit) => void; hostExists: boolean; isZoom: boolean; isStreaming: boolean; isLocalSpeaker: boolean; isRemote: boolean; isSpecialEvent: boolean; }> = ({ visit, onEdit, hostExists, isZoom, isStreaming, isLocalSpeaker, isRemote, isSpecialEvent }) => {
    const comms = visit.communicationStatus || {};
    const confirmationDone = !!comms.confirmation?.speaker;
    const prepSpeakerDone = !!comms.preparation?.speaker;
    const prepHostDone = !!comms.preparation?.host;
    const reminderDone = !!(comms['reminder-7']?.speaker || comms['reminder-7']?.host || comms['reminder-2']?.speaker || comms['reminder-2']?.host);
    const thanksDone = !!(comms.thanks?.speaker || comms.thanks?.host);
    
    const checklist = visit.checklist || [];
    const completedTasks = checklist.filter(task => task.completed).length;
    const totalTasks = checklist.length;

    const renderContent = () => {
        if (isSpecialEvent) {
            return (
                <div className="flex items-center text-cyan-600 dark:text-cyan-400">
                    <HomeIcon className="w-5 h-5 mr-2" />
                    <span className="font-semibold">Événement spécial</span>
                </div>
            );
        }
        if (isRemote) {
            return (
                 <div className={`flex items-center ${isZoom ? 'text-indigo-600 dark:text-indigo-400' : 'text-purple-600 dark:text-purple-400'}`}>
                    <VideoCameraIcon className="w-5 h-5 mr-2" />
                    <span className="font-semibold">{isZoom ? 'Visite par Zoom' : 'Visite par Streaming'}</span>
                </div>
            );
        }
        if (isLocalSpeaker) {
            return (
                <div className="flex items-center text-blue-600 dark:text-blue-400">
                   <HomeIcon className="w-5 h-5 mr-2" />
                   <span className="font-semibold">Orateur local</span>
               </div>
           );
        }
        if (visit.host === NO_HOST_NEEDED) {
             return (
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <HomeIcon className="w-5 h-5 mr-2" />
                    <span className="font-semibold">Accueil non nécessaire</span>
                </div>
            );
        }
        if (visit.host === UNASSIGNED_HOST) {
            return (
                <div className="space-y-2">
                    <div className="flex items-center justify-center text-orange dark:text-orange">
                        <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                        <span className="font-semibold">Accueil à définir</span>
                    </div>
                    <button onClick={() => onEdit(visit)} className="w-full px-4 py-2 bg-orange hover:bg-orange/80 text-white font-bold rounded-lg transition-transform active:scale-95">
                        Assigner
                    </button>
                </div>
            );
        }
        return (
            <div className="flex flex-col items-center space-y-2 w-full">
                <div>
                    <p className="text-sm text-text-muted dark:text-text-muted-dark">Accueil par :</p>
                    <p className="font-bold text-lg text-text-main dark:text-text-main-dark truncate" title={visit.host}>{visit.host}</p>
                    {!hostExists && (
                        <div title="Cet hôte a été supprimé. Veuillez modifier la visite." className="flex items-center justify-center text-orange dark:text-orange mt-1">
                            <ExclamationTriangleIcon className="w-5 h-5" />
                        </div>
                    )}
                </div>
                 <div className="mt-4 w-full bg-white/40 dark:bg-black/20 p-3 rounded-lg space-y-2 text-left">
                    <h4 className="text-sm font-bold text-left text-text-muted dark:text-text-muted-dark uppercase mb-1">Suivi</h4>
                    <div className="space-y-1.5">
                        <ChecklistItem label="Confirmation" done={confirmationDone} icon={CheckIcon} />
                        <ChecklistItem label="Préparation Orateur" done={prepSpeakerDone} icon={EnvelopeIcon} />
                        {visit.host !== UNASSIGNED_HOST && visit.locationType === 'physical' && (
                            <ChecklistItem label="Préparation Accueil" done={prepHostDone} icon={EnvelopeIcon} />
                        )}
                        <ChecklistItem label="Rappels" done={reminderDone} icon={BellIcon} />
                        <ChecklistItem label="Remerciements" done={thanksDone} icon={SparklesIcon} />
                    </div>
                    {totalTasks > 0 && (
                        <div className="pt-2 mt-2 border-t border-white/30 dark:border-white/10">
                            <ChecklistItem 
                                label={`Tâches (${completedTasks}/${totalTasks})`} 
                                done={completedTasks === totalTasks && totalTasks > 0} 
                                icon={CheckIcon} 
                            />
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="md:col-span-3 flex flex-col items-center justify-center text-center py-4 md:py-0">
             {renderContent()}
        </div>
    );
};

interface VisitCardActionsProps {
    visit: Visit;
    onEdit: (visit: Visit) => void;
    onDelete: (visitId: string) => void;
    onComplete: (visit: Visit) => void;
    onOpenMessageGenerator: (visit: Visit, role: MessageRole, messageType?: any) => void;
    isLocalSpeaker: boolean;
    isRemote: boolean;
    isSpecialEvent: boolean;
    isMenuOpen: boolean;
    setIsMenuOpen: (isOpen: boolean) => void;
}

const VisitCardActions: React.FC<VisitCardActionsProps> = ({ visit, onEdit, onDelete, onComplete, onOpenMessageGenerator, isLocalSpeaker, isRemote, isSpecialEvent, isMenuOpen, setIsMenuOpen }) => {
    const menuRef = useRef<HTMLDivElement>(null);
    
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuRef, setIsMenuOpen]);
    
    return (
        <div className="md:col-span-4 border-t md:border-t-0 md:border-l border-border-light dark:border-border-dark pt-4 md:pt-0 md:pl-6">
            <div className="flex flex-col space-y-2">
                 <div className="flex flex-col sm:flex-row gap-2">
                    <button onClick={() => onOpenMessageGenerator(visit, 'speaker')} disabled={isSpecialEvent} className="flex-1 flex items-center justify-center p-2 text-sm font-semibold bg-white/50 text-text-main dark:bg-white/10 dark:text-text-main-dark rounded-lg hover:bg-white/80 dark:hover:bg-white/20 transition-transform active:scale-95 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed">
                        <ChatBubbleOvalLeftEllipsisIcon className="w-4 h-4 mr-1.5"/> Orateur
                    </button>
                    <button onClick={() => onOpenMessageGenerator(visit, 'host')} disabled={visit.host === UNASSIGNED_HOST || visit.host === NO_HOST_NEEDED || isLocalSpeaker || isRemote || isSpecialEvent} className="flex-1 flex items-center justify-center p-2 text-sm font-semibold bg-green-100 text-green-700 rounded-lg hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-800/50 transition-transform active:scale-95 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed">
                         <ChatBubbleOvalLeftEllipsisIcon className="w-4 h-4 mr-1.5"/> Accueil
                    </button>
                </div>
                <div className="flex justify-end items-center space-x-1 mt-2">
                     <button onClick={() => onEdit(visit)} className="p-2 rounded-full text-text-muted dark:text-text-muted-dark hover:bg-white/20 dark:hover:bg-primary-light/20 hover:text-primary dark:hover:text-white transition-colors active:scale-90 flex items-center justify-center" title="Modifier">
                        <EditIcon className="w-5 h-5" />
                    </button>
                     <div className="relative" ref={menuRef}>
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-full text-text-muted dark:text-text-muted-dark hover:bg-white/20 dark:hover:bg-primary-light/20 transition-colors active:scale-90">
                            <EllipsisVerticalIcon className="w-5 h-5" />
                        </button>
                        {isMenuOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-card-light dark:bg-card-dark rounded-md shadow-lg z-10 border border-border-light dark:border-border-dark">
                                <div className="py-1">
                                    <button onClick={() => { onComplete(visit); setIsMenuOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-green-700 dark:text-green-300 hover:bg-gray-100 dark:hover:bg-primary-light/20">
                                        <CheckIcon className="w-4 h-4 mr-3" /> Terminer la visite
                                    </button>
                                    <div className="border-t border-border-light dark:border-border-dark my-1"></div>
                                    <button onClick={() => { onDelete(visit.visitId); setIsMenuOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-primary-light/20">
                                        <TrashIcon className="w-4 h-4 mr-3" /> Supprimer
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main Components ---

const VisitCard: React.FC<{ visit: Visit; onEdit: (visit: Visit) => void; onDelete: (visitId: string) => void; onComplete: (visit: Visit) => void; onOpenMessageGenerator: (visit: Visit, role: MessageRole, messageType?: any) => void; index: number; }> = ({ visit, onEdit, onDelete, onComplete, onOpenMessageGenerator, index }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { hosts, archivedVisits } = useData();
    const isArchived = useMemo(() => archivedVisits.some(v => v.visitId === visit.visitId), [archivedVisits, visit.visitId]);
    const hostExists = useMemo(() => visit.host === UNASSIGNED_HOST || visit.host === NO_HOST_NEEDED || hosts.some(h => h.nom === visit.host), [hosts, visit.host]);
    const isLocalSpeaker = visit.congregation.toLowerCase().includes('lyon');
    const isZoom = visit.locationType === 'zoom';
    const isStreaming = visit.locationType === 'streaming';
    const isRemote = isZoom || isStreaming;
    const isSpecialEvent = visit.congregation === 'Événement spécial';

    const status = isArchived ? 'completed' : visit.status;
    const statusStyle = statusStyles[status];

    const style = {
        animationDelay: `${index * 100}ms`,
        opacity: 0,
    };

    return (
        <div 
            style={style}
            className={`relative bg-glass dark:bg-glass-dark rounded-xl shadow-soft-lg border border-white/20 dark:border-white/10 backdrop-blur-xl transition-transform duration-200 hover:scale-[1.02] animate-fade-in-up ${isMenuOpen ? 'z-30' : 'z-10'}`}
        >
            <div className={`absolute top-0 left-0 bottom-0 w-2 ${statusStyle.cardBorder} rounded-l-xl`}></div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-4 pl-6 w-full items-center">
                <VisitCardDateInfo 
                    visit={visit} 
                    isZoom={isZoom} 
                    isStreaming={isStreaming}
                    isLocalSpeaker={isLocalSpeaker}
                    isRemote={isRemote}
                    isSpecialEvent={isSpecialEvent}
                />
                <VisitCardHostInfo 
                    visit={visit} 
                    onEdit={onEdit}
                    hostExists={hostExists}
                    isZoom={isZoom} 
                    isStreaming={isStreaming}
                    isLocalSpeaker={isLocalSpeaker}
                    isRemote={isRemote}
                    isSpecialEvent={isSpecialEvent}
                />
                <VisitCardActions 
                    visit={visit} 
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onComplete={onComplete}
                    onOpenMessageGenerator={onOpenMessageGenerator}
                    isLocalSpeaker={isLocalSpeaker}
                    isRemote={isRemote}
                    isSpecialEvent={isSpecialEvent}
                    isMenuOpen={isMenuOpen}
                    setIsMenuOpen={setIsMenuOpen}
                />
            </div>
        </div>
    );
};

const VisitRow: React.FC<Omit<UpcomingVisitsProps, 'visits' | 'onScheduleFirst' | 'viewMode'> & { visit: Visit; index: number }> = (props) => {
    const { visit, onEdit, onOpenMessageGenerator, index } = props;
    const { archivedVisits } = useData();
    const isArchived = useMemo(() => archivedVisits.some(v => v.visitId === visit.visitId), [archivedVisits, visit.visitId]);
    const isSpecialEvent = visit.congregation === 'Événement spécial';
    const isUrgent = visit.host === UNASSIGNED_HOST && visit.locationType === 'physical';

    const status = isArchived ? 'completed' : visit.status;
    const statusStyle = statusStyles[status];

    return (
         <tr 
            className="border-b border-border-light dark:border-border-dark last:border-b-0 animate-fade-in-up opacity-0"
            style={{ animationDelay: `${index * 30}ms` }}
        >
            <td className="p-3 text-left">
                <p className="font-semibold text-text-main dark:text-text-main-dark">{new Date(visit.visitDate + 'T00:00:00').toLocaleDateString('fr-FR')}</p>
                <p className="text-xs text-text-muted dark:text-text-muted-dark">{formatWeekday(visit.visitDate)}</p>
            </td>
            <td className="p-3 text-left">
                <div className="flex items-center gap-3">
                    <div className="w-5 flex-shrink-0" title={visit.locationType === 'physical' ? 'Présentiel' : visit.locationType === 'zoom' ? 'Zoom' : 'Streaming'}>
                        {visit.locationType === 'physical' && <HomeIcon className="w-5 h-5 text-gray-500" />}
                        {visit.locationType === 'zoom' && <VideoCameraIcon className="w-5 h-5 text-indigo-500" />}
                        {visit.locationType === 'streaming' && <WifiIcon className="w-5 h-5 text-purple-500" />}
                    </div>
                    <div>
                        <p className="font-semibold text-text-main dark:text-text-main-dark">{visit.nom}</p>
                        <p className="text-xs text-text-muted dark:text-text-muted-dark truncate max-w-xs" title={visit.congregation}>{visit.congregation}</p>
                    </div>
                </div>
            </td>
            <td className="p-3 text-left text-sm text-text-muted dark:text-text-muted-dark truncate max-w-sm" title={visit.talkTheme || ''}>
                {visit.talkTheme || 'N/A'}
            </td>
             <td className="p-3 text-left">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${isUrgent ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>{visit.host}</span>
            </td>
             <td className="p-3 text-left">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyle.listBadge}`}>{statusStyle.text}</span>
            </td>
            <td className="p-3 text-right">
                <div className="flex items-center justify-end space-x-1">
                     <button onClick={() => onOpenMessageGenerator(visit, 'speaker')} disabled={isSpecialEvent} className="p-2 text-text-muted dark:text-text-muted-dark hover:text-primary dark:hover:text-white rounded-full disabled:opacity-50" title="Message Orateur"><ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5"/></button>
                     <button onClick={() => onEdit(visit)} className="p-2 text-text-muted dark:text-text-muted-dark hover:text-primary dark:hover:text-white rounded-full" title="Modifier"><EditIcon className="w-5 h-5"/></button>
                </div>
            </td>
        </tr>
    );
};


const FilterButton = <T extends string>({ label, value, active, onClick }: { label: string; value: T; active: boolean; onClick: (v: T) => void; }) => (
    <button
      onClick={() => onClick(value)}
      className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all duration-200 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 active:scale-95 ${active ? 'bg-white dark:bg-card-dark shadow-md text-primary dark:text-white' : 'text-text-muted dark:text-text-muted-dark hover:text-primary dark:hover:text-white'}`}
      aria-pressed={active}
    >
      {label}
    </button>
  );

export const UpcomingVisits: React.FC<UpcomingVisitsProps> = ({ visits, onEdit, onDelete, onComplete, onOpenMessageGenerator, onScheduleFirst, viewMode }) => {
    const [dateFilter, setDateFilter] = useState<DateFilterType>('all');
    const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all');
    
    const filteredVisits = useMemo(() => {
        let statusFilteredVisits;
        if (statusFilter === 'all') {
            statusFilteredVisits = visits.filter(v => v.status !== 'cancelled');
        } else {
            statusFilteredVisits = visits.filter(v => v.status === statusFilter);
        }

        if (dateFilter === 'all') {
            return statusFilteredVisits;
        }

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        if (dateFilter === 'week') {
            const endOfWeek = new Date(now);
            const dayOfWeek = now.getDay();
            const diff = 7 - (dayOfWeek === 0 ? 7 : dayOfWeek);
            endOfWeek.setDate(now.getDate() + diff);
            endOfWeek.setHours(23, 59, 59, 999);
            return statusFilteredVisits.filter(v => {
                const visitDate = new Date(`${v.visitDate}T00:00:00`);
                return visitDate >= now && visitDate <= endOfWeek;
            });
        }

        if (dateFilter === 'month') {
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            endOfMonth.setHours(23, 59, 59, 999);
            return statusFilteredVisits.filter(v => {
                const visitDate = new Date(`${v.visitDate}T00:00:00`);
                return visitDate >= now && visitDate <= endOfMonth;
            });
        }
        return statusFilteredVisits;
    }, [visits, dateFilter, statusFilter]);

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-3xl font-bold font-display text-primary dark:text-white shrink-0">Prochaines visites</h2>
                <div className="w-full md:w-auto bg-gray-100 dark:bg-primary-light/20 p-2 rounded-xl flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex flex-wrap justify-center items-center gap-x-2 sm:gap-x-3 gap-y-2">
                        <FilterButton<DateFilterType> label="Toutes" value="all" active={dateFilter === 'all'} onClick={setDateFilter} />
                        <FilterButton<DateFilterType> label="Cette semaine" value="week" active={dateFilter === 'week'} onClick={setDateFilter} />
                        <FilterButton<DateFilterType> label="Ce mois-ci" value="month" active={dateFilter === 'month'} onClick={setDateFilter} />
                    </div>
                </div>
            </div>

            {visits.length === 0 ? (
                <div className="text-center py-12 px-6 bg-card-light dark:bg-card-dark rounded-lg shadow-soft-lg">
                    <CalendarIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" />
                    <h2 className="mt-4 text-2xl font-semibold text-text-main dark:text-text-main-dark">Aucune visite programmée</h2>
                    <p className="mt-2 text-text-muted dark:text-text-muted-dark">Commencez par planifier une visite depuis la liste des orateurs.</p>
                    <button
                        onClick={onScheduleFirst}
                        className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-transform active:scale-95"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Programmer une première visite
                    </button>
                </div>
            ) : filteredVisits.length === 0 ? (
                 <div className="text-center py-12 px-6 bg-card-light dark:bg-card-dark rounded-lg shadow-soft-lg">
                    <CalendarIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" />
                    <h2 className="mt-4 text-2xl font-semibold text-text-main dark:text-text-main-dark">Aucune visite pour ce filtre</h2>
                    <p className="mt-2 text-text-muted dark:text-text-muted-dark">Modifiez votre sélection pour voir d'autres visites à venir.</p>
                </div>
            ) : (
                viewMode === 'cards' ? (
                    <div className="space-y-6">
                        {filteredVisits.map((visit, index) => (
                            <VisitCard 
                                key={visit.visitId}
                                visit={visit} 
                                onEdit={onEdit} 
                                onDelete={onDelete} 
                                onComplete={onComplete}
                                onOpenMessageGenerator={onOpenMessageGenerator}
                                index={index}
                            />
                        ))}
                    </div>
                ) : (
                     <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft-lg overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                            <thead className="bg-gray-50 dark:bg-primary-light/10">
                                <tr>
                                    <th className="p-3 text-left text-xs font-semibold text-text-muted dark:text-text-muted-dark uppercase tracking-wider">Date</th>
                                    <th className="p-3 text-left text-xs font-semibold text-text-muted dark:text-text-muted-dark uppercase tracking-wider">Orateur</th>
                                    <th className="p-3 text-left text-xs font-semibold text-text-muted dark:text-text-muted-dark uppercase tracking-wider">Thème</th>
                                    <th className="p-3 text-left text-xs font-semibold text-text-muted dark:text-text-muted-dark uppercase tracking-wider">Accueil</th>
                                    <th className="p-3 text-left text-xs font-semibold text-text-muted dark:text-text-muted-dark uppercase tracking-wider">Statut</th>
                                    <th className="p-3 text-right text-xs font-semibold text-text-muted dark:text-text-muted-dark uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredVisits.map((visit, index) => <VisitRow key={visit.visitId} visit={visit} index={index} onEdit={onEdit} onDelete={onDelete} onComplete={onComplete} onOpenMessageGenerator={onOpenMessageGenerator} />)}
                            </tbody>
                        </table>
                    </div>
                )
            )}
        </div>
    );
};
