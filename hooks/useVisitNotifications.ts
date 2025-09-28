import { useState, useEffect } from 'react';
import { Visit } from '../types';

const formatDate = (dateString: string) => {
    // Appending 'T00:00:00' ensures the date string is parsed in the local timezone, not as UTC midnight.
    // This prevents off-by-one day errors in different timezones.
    return new Date(dateString + 'T00:00:00').toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const useVisitNotifications = (
    visits: Visit[],
    notificationPermission: NotificationPermission
): Record<string, { status: 'sent' | 'scheduled'; sentAt?: string }> => {
    
    const [notificationStatus, setNotificationStatus] = useState<Record<string, { status: 'sent' | 'scheduled'; sentAt?: string }>>({});

    useEffect(() => {
        const notifiedVisits: Record<string, string> = JSON.parse(localStorage.getItem('notifiedVisits') || '{}');
        const newStatus: Record<string, { status: 'sent' | 'scheduled'; sentAt?: string }> = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        const futureVisits = visits.filter(v => new Date(v.visitDate + 'T00:00:00') >= today && v.status !== 'cancelled');
        
        futureVisits.forEach(visit => {
            const visitDate = new Date(visit.visitDate + 'T00:00:00');
            
            // --- J-7 Reminder ---
            const sevenDaysBefore = new Date(visitDate);
            sevenDaysBefore.setDate(visitDate.getDate() - 7);
            const j7Key = `${visit.visitId}_j7`;
            
            if (today.getTime() === sevenDaysBefore.getTime() && !notifiedVisits[j7Key]) {
                if (notificationPermission === 'granted') {
                    new Notification(`Rappel J-7: Visite de ${visit.nom}`, {
                        body: `Le ${formatDate(visit.visitDate)} à ${visit.visitTime}.\nAccueil par : ${visit.host}`,
                        tag: j7Key,
                    });
                    notifiedVisits[j7Key] = new Date().toISOString();
                }
            }
            
            // --- J-2 Reminder ---
            const twoDaysBefore = new Date(visitDate);
            twoDaysBefore.setDate(visitDate.getDate() - 2);
            const j2Key = `${visit.visitId}_j2`;
            
            if (today.getTime() === twoDaysBefore.getTime() && !notifiedVisits[j2Key]) {
                if (notificationPermission === 'granted') {
                    new Notification(`Rappel J-2: Visite de ${visit.nom}`, {
                        body: `Dans 2 jours: ${formatDate(visit.visitDate)}.\nN'oubliez pas les derniers détails avec ${visit.host}.`,
                        tag: j2Key,
                    });
                    notifiedVisits[j2Key] = new Date().toISOString();
                }
            }
            
            // --- J-1 Reminder ---
            const oneDayBefore = new Date(visitDate);
            oneDayBefore.setDate(visitDate.getDate() - 1);
            const j1Key = `${visit.visitId}_j1`;
            
            if (today.getTime() === oneDayBefore.getTime() && !notifiedVisits[j1Key]) {
                if (notificationPermission === 'granted') {
                     new Notification(`Rappel J-1: Visite de ${visit.nom}`, {
                        body: `Demain à ${visit.visitTime}.\nNous avons hâte de l'accueillir !`,
                        tag: j1Key,
                    });
                    notifiedVisits[j1Key] = new Date().toISOString();
                }
            }

            const lastJ7 = notifiedVisits[j7Key];
            const lastJ2 = notifiedVisits[j2Key];
            const lastJ1 = notifiedVisits[j1Key];
            const lastNotificationTimestamp = lastJ1 || lastJ2 || lastJ7;

            if (lastNotificationTimestamp) {
                newStatus[visit.visitId] = { status: 'sent', sentAt: lastNotificationTimestamp };
            } else {
                newStatus[visit.visitId] = { status: 'scheduled' };
            }
        });
        
        localStorage.setItem('notifiedVisits', JSON.stringify(notifiedVisits));
        setNotificationStatus(newStatus);
    }, [visits, notificationPermission]);

    return notificationStatus;
};

export default useVisitNotifications;