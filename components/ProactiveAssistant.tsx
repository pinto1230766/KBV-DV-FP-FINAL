import React, { useMemo } from 'react';
import { Visit, Speaker, MessageType, MessageRole } from '../types';
import { useData } from '../contexts/DataContext';
import { UNASSIGNED_HOST } from '../constants';
import { ArrowRightIcon, BellIcon, HomeIcon, PlusIcon } from './Icons';

interface ProactiveAssistantProps {
  onOpenHostRequestModal: (visits: Visit[]) => void;
  onScheduleVisitClick: () => void; // To navigate to speaker list
  onEditVisitClick: (visit: Visit) => void;
  onOpenMessageGenerator: (visit: Visit, role: MessageRole, messageType?: MessageType) => void;
}

const daysUntil = (dateStr: string) => {
    const visitDate = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = visitDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const ActionCard: React.FC<{ title: string, description: string, buttonLabel: string, onClick: () => void, icon: React.FC<any> }> = ({ title, description, buttonLabel, onClick, icon: Icon }) => (
    <div className="bg-gray-50 dark:bg-dark p-4 rounded-lg flex items-start gap-4">
        <div className="bg-primary/10 text-primary p-3 rounded-full">
            <Icon className="w-6 h-6" />
        </div>
        <div className="flex-grow">
            <h4 className="font-bold text-text-main dark:text-text-main-dark">{title}</h4>
            <p className="text-sm text-text-muted dark:text-text-muted-dark">{description}</p>
        </div>
        <button onClick={onClick} className="self-center flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-primary text-white text-sm font-semibold rounded-md hover:bg-primary-dark transition-transform active:scale-95">
            {buttonLabel} <ArrowRightIcon className="w-4 h-4" />
        </button>
    </div>
);

export const ProactiveAssistant: React.FC<ProactiveAssistantProps> = (props) => {
    const { upcomingVisits, speakers, archivedVisits } = useData();

    const suggestions = useMemo(() => {
        const actions: React.ReactNode[] = [];

        // Suggestion 1: Unassigned hosts
        const visitsNeedingHost = upcomingVisits.filter(v =>
            v.host === UNASSIGNED_HOST &&
            v.status !== 'cancelled' &&
            v.locationType === 'physical' &&
            !v.congregation.toLowerCase().includes('lyon')
        );
        if (visitsNeedingHost.length > 2) { // Suggest only if there are 3 or more
            actions.push(
                <ActionCard
                    key="host-request"
                    icon={HomeIcon}
                    title={`${visitsNeedingHost.length} visites sans accueil`}
                    description="Plusieurs visites n'ont pas encore d'accueil assigné."
                    buttonLabel="Lancer une demande groupée"
                    onClick={() => props.onOpenHostRequestModal(visitsNeedingHost)}
                />
            );
        }

        // Suggestion 2: Invite speaker who hasn't come in a while
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        
        const allVisits = [...upcomingVisits, ...archivedVisits];
        const upcomingSpeakerIds = new Set(upcomingVisits.map(v => v.id));

        const speakerToInvite = speakers.find(s => {
            if (upcomingSpeakerIds.has(s.id)) return false; // Already scheduled
            const lastVisit = allVisits
                .filter(v => v.id === s.id)
                .sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime())[0];
            
            if (!lastVisit) return true; // Never visited
            return new Date(lastVisit.visitDate) < oneYearAgo;
        });

        if (speakerToInvite) {
            actions.push(
                <ActionCard
                    key="invite-speaker"
                    icon={PlusIcon}
                    title={`Inviter Frère ${speakerToInvite.nom.split(' ')[1]}`}
                    description="Il n'est pas venu depuis plus d'un an."
                    buttonLabel="Programmer"
                    onClick={props.onScheduleVisitClick}
                />
            );
        }
        
        // Suggestion 3: Reminders to send
        const urgentReminderVisit = upcomingVisits.find(v => {
            const daysLeft = daysUntil(v.visitDate);
            if (daysLeft > 7 || daysLeft < 0 || v.locationType !== 'physical') return false;
            const reminderSent = v.communicationStatus?.['reminder-7']?.speaker || v.communicationStatus?.['reminder-7']?.host;
            return (daysLeft <= 7 && !reminderSent);
        });
        
        if (urgentReminderVisit) {
            const daysLeft = daysUntil(urgentReminderVisit.visitDate);
            const reminderType = daysLeft <=2 ? 'J-2' : 'J-7';
            actions.push(
                <ActionCard
                    key="send-reminder"
                    icon={BellIcon}
                    title={`Rappel ${reminderType} pour Frère ${urgentReminderVisit.nom.split(' ')[1]}`}
                    description={`Le rappel pour sa visite du ${new Date(urgentReminderVisit.visitDate + 'T00:00:00').toLocaleDateString('fr-FR')} est à envoyer.`}
                    buttonLabel="Préparer"
                    onClick={() => props.onOpenMessageGenerator(urgentReminderVisit, 'speaker', daysLeft <= 2 ? 'reminder-2' : 'reminder-7')}
                />
            );
        }

        return actions;

    }, [upcomingVisits, speakers, archivedVisits, props]);

    if (suggestions.length === 0) {
        return null;
    }

    return (
        <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-lg mb-8 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-secondary dark:text-primary-light mb-4">Suggestions pour vous</h2>
            <div className="space-y-3">
                {suggestions.map(s => s)}
            </div>
        </div>
    );
};