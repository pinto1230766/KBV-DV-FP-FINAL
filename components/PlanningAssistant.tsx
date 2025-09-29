import React, { useMemo, useState } from 'react';
import { Visit } from '../types';
import { useData } from '../contexts/DataContext';
import { UNASSIGNED_HOST } from '../constants';
import { ArrowRightIcon, ExclamationTriangleIcon } from './Icons';
import { CalendarView } from './CalendarView';
import { WeekView } from './WeekView';

type ViewMode = 'month' | 'week';

const ViewSwitcher: React.FC<{ view: ViewMode; setView: (view: ViewMode) => void }> = ({ view, setView }) => (
    <div className="flex items-center bg-gray-200 dark:bg-background-dark rounded-lg p-1">
        <button 
            onClick={() => setView('month')}
            className={`px-4 py-1 text-sm font-semibold rounded-md transition-colors ${view === 'month' ? 'bg-white dark:bg-primary text-primary dark:text-white' : 'text-text-muted dark:text-text-muted-dark'}`}
        >
            Mois
        </button>
        <button 
            onClick={() => setView('week')}
            className={`px-4 py-1 text-sm font-semibold rounded-md transition-colors ${view === 'week' ? 'bg-white dark:bg-primary text-primary dark:text-white' : 'text-text-muted dark:text-text-muted-dark'}`}
        >
            Semaine
        </button>
    </div>
);

interface PlanningAssistantProps {
  onOpenHostRequestModal: (visits: Visit[]) => void;
  onEditVisitClick: (visit: Visit) => void;
}

const daysUntil = (dateStr: string) => {
    const visitDate = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = visitDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getUrgencyInfo = (visit: Visit) => {
    const days = daysUntil(visit.visitDate);
    if (days < 14) return { level: 'critical', text: `J-${days}`, color: 'bg-red-500/20 text-red-700 dark:bg-red-500/30 dark:text-red-300' };
    if (days < 30) return { level: 'warning', text: `J-${days}`, color: 'bg-amber-500/20 text-amber-700 dark:bg-amber-500/30 dark:text-amber-300' };
    return { level: 'normal', text: `J-${days}`, color: 'bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300' };
};

export const PlanningAssistant: React.FC<PlanningAssistantProps> = (props) => {
    const { upcomingVisits, visits, archivedVisits } = useData();
    const [viewMode, setViewMode] = useState<ViewMode>('month');

    const allVisits = useMemo(() => [...visits, ...archivedVisits], [visits, archivedVisits]);

    const visitsNeedingHost = useMemo(() =>
        upcomingVisits.filter(v =>
            v.host === UNASSIGNED_HOST &&
            v.status !== 'cancelled' &&
            v.locationType === 'physical' &&
            !v.congregation.toLowerCase().includes('lyon')
        ).sort((a,b) => new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime()),
        [upcomingVisits]
    );

    const hasActions = visitsNeedingHost.length > 0;

    if (!hasActions) {
        return (
            <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-lg">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-secondary dark:text-white">Assistant de planification</h2>
                    <ViewSwitcher view={viewMode} setView={setViewMode} />
                </div>
                {viewMode === 'month' ? (
                    <CalendarView visits={allVisits} onEditVisit={props.onEditVisitClick} />
                ) : (
                    <WeekView visits={allVisits} onEditVisit={props.onEditVisitClick} />
                )}
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-secondary dark:text-white">Assistant de planification</h2>
                    <ViewSwitcher view={viewMode} setView={setViewMode} />
                </div>
                <div className="space-y-4">
                    {visitsNeedingHost.length > 0 && (
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                                    <ExclamationTriangleIcon className="w-6 h-6"/>
                                    {visitsNeedingHost.length} visite{visitsNeedingHost.length > 1 ? 's' : ''} sans accueil
                                </h3>
                                {visitsNeedingHost.length > 2 && (
                                    <button onClick={() => props.onOpenHostRequestModal(visitsNeedingHost)} className="text-sm font-semibold text-primary dark:text-primary-light hover:underline">
                                        Demande groupée
                                    </button>
                                )}
                            </div>
                            <div className="space-y-2">
                                {visitsNeedingHost.slice(0,3).map(visit => {
                                    const urgency = getUrgencyInfo(visit);
                                    return (
                                        <div key={visit.visitId} onClick={() => props.onEditVisitClick(visit)} className="flex items-center justify-between p-3 bg-card-light dark:bg-card-dark rounded-md cursor-pointer hover:shadow-md transition-shadow">
                                            <div>
                                                <p className="font-semibold">{visit.nom}</p>
                                                <p className="text-xs text-text-muted dark:text-text-muted-dark">{new Date(visit.visitDate + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 text-xs font-bold rounded-full ${urgency.color}`}>{urgency.text}</span>
                                                <ArrowRightIcon className="w-5 h-5 text-text-muted dark:text-text-muted-dark"/>
                                            </div>
                                        </div>
                                    )
                                })}
                                 {visitsNeedingHost.length > 3 && (
                                    <p className="text-center text-xs text-text-muted dark:text-text-muted-dark pt-2">
                                        et {visitsNeedingHost.length - 3} autre(s)...
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {viewMode === 'month' ? (
                <CalendarView visits={allVisits} onEditVisit={props.onEditVisitClick} />
            ) : (
                <WeekView visits={allVisits} onEditVisit={props.onEditVisitClick} />
            )}
        </div>
    );
};