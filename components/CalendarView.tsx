import React, { useState, useMemo } from 'react';
import { Visit, Host } from '../types';
// FIX: Removed non-existent FlagIcon from imports.
import { ChevronLeftIcon, ChevronRightIcon, EditIcon, HomeIcon, VideoCameraIcon, PrintIcon, ExclamationTriangleIcon, CalendarIcon, UserIcon, WifiIcon } from './Icons';
import { useData } from '../contexts/DataContext';
import { UNASSIGNED_HOST } from '../constants';
import { holidays, schoolVacations } from '../data/calendar_data';
import { Holiday, Vacation } from '../types';
import { Avatar } from './Avatar';

interface StayInfo {
    visit: Visit;
    duration: number;
    offset: number;
    isStart: boolean;
    isEnd: boolean;
    track: number;
    color: string;
    textColor: string;
    showText: boolean;
}

interface CalendarViewProps {
    visits: Visit[];
    onEditVisit: (visit: Visit) => void;
}

interface DayDetails {
    date: Date;
    visit: Visit | null;
    stays: StayInfo[];
    holidays: Holiday[];
    vacations: Vacation[];
    unavailableHosts: Host[];
}

const toYYYYMMDD = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const countryFlags: { [key: string]: string } = { FR: '🇫🇷', PT: '🇵🇹', CV: '🇨🇻' };

const isHostAvailable = (host: Host, visitDate: string): boolean => {
    if (!visitDate || !host.unavailabilities || host.unavailabilities.length === 0) {
        return true;
    }
    const checkDate = new Date(visitDate + 'T00:00:00');
    return !host.unavailabilities.some(period => {
        const start = new Date(period.start + 'T00:00:00');
        const end = new Date(period.end + 'T00:00:00');
        return checkDate >= start && checkDate <= end;
    });
};

const statusInfo: Record<Visit['status'] | 'completed', { text: string; color: string }> = {
  pending: { text: 'En attente', color: 'bg-amber-400 text-amber-900' },
  confirmed: { text: 'Confirmé', color: 'bg-green-500 text-white' },
  cancelled: { text: 'Annulé', color: 'bg-red-500 text-white' },
  completed: { text: 'Terminé', color: 'bg-gray-500 text-white' },
};

const stayColors: Record<Visit['status'] | 'completed', { color: string; textColor: string }> = {
    pending: { color: 'bg-amber-400', textColor: 'text-amber-900' },
    confirmed: { color: 'bg-green-500', textColor: 'text-white' },
    completed: { color: 'bg-gray-500', textColor: 'text-white' },
    cancelled: { color: 'bg-red-500', textColor: 'text-white' },
};


export const CalendarView: React.FC<CalendarViewProps> = ({ visits, onEditVisit }) => {
    const { hosts } = useData();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<DayDetails | null>(null);

    const archivedVisitIds = useMemo(() => new Set(visits.filter(v => v.status === 'completed').map(v => v.visitId)), [visits]);

    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    const calendarGridDates = useMemo(() => {
        const days = [];
        const startingDay = firstDayOfMonth.getDay();
        const adjustedStartingDay = startingDay === 0 ? 6 : startingDay - 1;

        const startDate = new Date(firstDayOfMonth);
        startDate.setDate(startDate.getDate() - adjustedStartingDay);

        for (let i = 0; i < 42; i++) { // 6 weeks grid
            const day = new Date(startDate);
            day.setDate(startDate.getDate() + i);
            days.push(day);
        }
        return days;
    }, [firstDayOfMonth]);


    const calendarGridDetails = useMemo(() => {
        const year = currentDate.getFullYear();
        const yearHolidays = holidays[year] || [];
        
        const visitMap = new Map<string, {visit?: Visit, stays: Visit[]}>();
        
        visits.forEach(visit => {
            if (visit.status === 'cancelled') return;
            const dateStr = visit.visitDate;
            if (!visitMap.has(dateStr)) visitMap.set(dateStr, { stays: [] });
            visitMap.get(dateStr)!.visit = visit;

            if (visit.arrivalDate && visit.departureDate) {
                const arrival = new Date(visit.arrivalDate + 'T00:00:00');
                const departure = new Date(visit.departureDate + 'T00:00:00');
                 for (let d = new Date(arrival); d <= departure; d.setDate(d.getDate() + 1)) {
                    const stayDateStr = toYYYYMMDD(d);
                    if (!visitMap.has(stayDateStr)) visitMap.set(stayDateStr, { stays: [] });
                    const entry = visitMap.get(stayDateStr)!;
                    if (!entry.stays.some(s => s.visitId === visit.visitId)) {
                         entry.stays.push(visit);
                    }
                }
            }
        });
        
        const processedWeeks: DayDetails[][] = [];
        for (let i = 0; i < 6; i++) {
            const weekDates = calendarGridDates.slice(i * 7, (i + 1) * 7);
            const weekDetails: DayDetails[] = weekDates.map(day => {
                const dateStr = toYYYYMMDD(day);
                const monthDay = `${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
                
                const visitData = visitMap.get(dateStr);

                return {
                    date: day,
                    visit: visitData?.visit || null,
                    stays: [], // will be populated below
                    holidays: yearHolidays.filter(h => h.date === monthDay),
                    vacations: schoolVacations.filter(v => {
                        const start = new Date(v.start + 'T00:00:00');
                        const end = new Date(v.end + 'T00:00:00');
                        return day >= start && day <= end;
                    }),
                    unavailableHosts: hosts.filter(host => !isHostAvailable(host, dateStr)),
                };
            });
            
            const staysInWeek = Array.from(new Set(weekDetails.flatMap(d => (visitMap.get(toYYYYMMDD(d.date))?.stays || []))));
            
            const tracks: (Visit | null)[] = [null, null, null]; // Max 3 tracks for stays

            staysInWeek.forEach(stay => {
                 const arrival = new Date(stay.arrivalDate! + 'T00:00:00');
                 const departure = new Date(stay.departureDate! + 'T00:00:00');
                 let assignedTrack = false;
                 
                 for(let i=0; i<tracks.length; i++) {
                     let canPlace = true;
                     for(let j=0; j<7; j++) {
                         const day = weekDetails[j];
                         if (day.date >= arrival && day.date <= departure) {
                             if(day.stays.some(s => s.track === i)) {
                                 canPlace = false;
                                 break;
                             }
                         }
                     }
                     if(canPlace) {
                         const isStayArchived = archivedVisitIds.has(stay.visitId);
                         const stayStatus = isStayArchived ? 'completed' : stay.status;
                         const { color, textColor } = stayColors[stayStatus];
                         for(let j=0; j<7; j++) {
                             const day = weekDetails[j];
                             if (day.date >= arrival && day.date <= departure) {
                                 const isStart = day.date.getTime() === arrival.getTime() || j === 0;
                                 const isEnd = day.date.getTime() === departure.getTime() || j === 6;

                                 const isTalkDay = toYYYYMMDD(day.date) === stay.visitDate;
                                 const weekStartDate = weekDates[0];
                                 const weekEndDate = weekDates[6];
                                 const talkDate = new Date(stay.visitDate + 'T00:00:00');
                                 
                                 const showText = isTalkDay || (isStart && (talkDate < weekStartDate || talkDate > weekEndDate));

                                 day.stays.push({ visit: stay, duration: 1, offset: 0, isStart, isEnd, track: i, color, textColor, showText });
                             }
                         }
                         assignedTrack = true;
                         break;
                     }
                 }
            });

            processedWeeks.push(weekDetails);
        }

        return processedWeeks.flat();
    }, [calendarGridDates, visits, hosts, currentDate, archivedVisitIds]);


    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        setSelectedDay(null);
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        setSelectedDay(null);
    };
    
    const handleToday = () => {
        setCurrentDate(new Date());
        setSelectedDay(null);
    };

    const handleDayClick = (day: DayDetails) => {
        setSelectedDay(day);
    };
    
    const closeModal = () => setSelectedDay(null);

    const statusModalInfo = {
      pending: { text: 'En attente', color: 'text-amber-800 bg-amber-100 dark:text-amber-200 dark:bg-amber-500/20' },
      confirmed: { text: 'Confirmé', color: 'text-green-800 bg-green-100 dark:text-green-200 dark:bg-green-500/20' },
      cancelled: { text: 'Annulé', color: 'text-red-800 bg-red-100 dark:text-red-200 dark:bg-red-500/20' },
      completed: { text: 'Terminé', color: 'text-gray-800 bg-gray-100 dark:text-gray-200 dark:bg-gray-500/20' }
    };

    const renderVisitDetailsInModal = (visit: Visit) => {
        const isArchived = archivedVisitIds.has(visit.visitId);
        const visitStatusInfo = isArchived ? statusModalInfo.completed : statusModalInfo[visit.status];
        const hasStayInfo = visit.arrivalDate && visit.departureDate && visit.arrivalDate !== visit.departureDate;
        
        return (
            <div className="p-3 bg-gray-50 dark:bg-primary-light/10 rounded-lg">
                <div className="flex justify-between items-start gap-3">
                    <div className="flex items-start gap-3">
                        <Avatar item={visit} size="w-10 h-10" />
                        <div>
                            <p className={`font-bold text-text-main dark:text-text-main-dark ${visit.status === 'cancelled' ? 'line-through' : ''}`}>{visit.nom}</p>
                            <p className="text-sm text-text-muted dark:text-text-muted-dark">{visit.congregation}</p>
                        </div>
                    </div>
                    <button onClick={() => { onEditVisit(visit); closeModal(); }} className="p-2 -mt-1 -mr-1 rounded-full text-text-muted dark:text-text-muted-dark hover:bg-gray-200 dark:hover:bg-primary-light/20 shrink-0" title="Modifier la visite">
                        <EditIcon className="w-5 h-5"/>
                    </button>
                </div>
                 {hasStayInfo && (
                    <p className="text-sm font-semibold text-primary dark:text-primary-light mt-2">
                        Séjour : {new Date(visit.arrivalDate! + 'T00:00:00').toLocaleDateString('fr-FR', {day: '2-digit', month: 'short'})} → {new Date(visit.departureDate! + 'T00:00:00').toLocaleDateString('fr-FR', {day: '2-digit', month: 'short'})}
                    </p>
                )}
                 <p className="text-sm text-text-muted dark:text-text-muted-dark mt-1">
                    Accueil : <span className="font-semibold text-text-main dark:text-text-main-dark">{visit.host}</span>
                </p>
                {visit.talkTheme && (
                    <p className="text-sm text-text-muted dark:text-text-muted-dark mt-2 italic">
                       « {visit.talkTheme} »
                    </p>
                )}
                <div className="text-right text-xs pt-2 mt-2">
                    <span className={`px-2 py-1 font-semibold rounded-full ${visitStatusInfo.color}`}>{visitStatusInfo.text}</span>
                </div>
            </div>
        );
    };
    
    const ModalSection: React.FC<{title: string, icon: React.FC<any>, children: React.ReactNode}> = ({title, icon: Icon, children}) => (
        <div>
            <h3 className="text-lg font-semibold text-primary dark:text-primary-light mb-2 flex items-center gap-2">
                <Icon className="w-5 h-5"/>
                {title}
            </h3>
            <div className="space-y-3">
                {children}
            </div>
        </div>
    );

    return (
        <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
                <div className="flex items-center gap-2">
                    <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-primary-light/20" title="Mois précédent">
                        <ChevronLeftIcon className="w-6 h-6 text-text-muted dark:text-text-muted-dark" />
                    </button>
                    <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-primary-light/20" title="Mois suivant">
                        <ChevronRightIcon className="w-6 h-6 text-text-muted dark:text-text-muted-dark" />
                    </button>
                     <button onClick={handleToday} className="px-3 py-1.5 border border-border-light dark:border-border-dark rounded-md text-sm font-semibold hover:bg-gray-100 dark:hover:bg-primary-light/20 no-print">
                        Aujourd'hui
                    </button>
                </div>
                <h3 className="text-xl font-bold text-text-main dark:text-text-main-dark text-center capitalize order-first sm:order-none">
                    {currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </h3>
                <div className="flex items-center gap-2">
                     <button onClick={() => window.print()} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-primary-light/20 no-print" title="Imprimer le calendrier">
                        <PrintIcon className="w-5 h-5 text-text-muted dark:text-text-muted-dark" />
                    </button>
                </div>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 mb-4 text-xs text-text-muted dark:text-text-muted-dark no-print">
                <span className="font-semibold">Légende:</span>
                {Object.entries(statusInfo).map(([key, { text, color }]) => (
                    <div key={key} className="flex items-center gap-1.5">
                        <div className={`w-3 h-3 rounded-sm ${color.split(' ')[0]}`}></div>
                        <span>{text}</span>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-sm font-semibold text-text-muted dark:text-text-muted-dark mb-2">
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => <div key={day} className="py-2">{day}</div>)}
            </div>
            <div className="grid grid-cols-7 grid-rows-6 gap-px bg-border-light dark:bg-border-dark border border-border-light dark:border-border-dark rounded-lg overflow-hidden">
                {calendarGridDetails.map((dayDetails) => {
                    const { date, visit, stays, holidays, vacations, unavailableHosts } = dayDetails;
                    const isToday = new Date().toDateString() === date.toDateString();
                    const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                    const isArchived = visit ? archivedVisitIds.has(visit.visitId) : false;

                    const cellClasses = `min-h-[7rem] flex flex-col relative p-1 transition-colors duration-200 ease-in-out cursor-pointer group ${!isCurrentMonth ? 'bg-gray-50 dark:bg-card-dark/50' : 'bg-card-light dark:bg-card-dark'} hover:bg-gray-100 dark:hover:bg-primary-light/20 ${isToday ? 'border-2 border-primary dark:border-secondary bg-primary/10 dark:bg-secondary/10' : ''}`;
                    const dayNumberClasses = `text-sm font-semibold transition-colors z-10 ${isToday ? 'bg-primary dark:bg-secondary text-white rounded-full w-6 h-6 flex items-center justify-center' : isCurrentMonth ? 'text-text-main dark:text-text-main-dark' : 'text-text-muted dark:text-text-muted-dark'}`;
                    
                    const visitStatus = isArchived ? 'completed' : visit?.status;
                    const statusStyle = statusInfo[visitStatus as keyof typeof statusInfo];

                    return (
                        <div key={date.toString()} onClick={() => handleDayClick(dayDetails)} className={cellClasses}>
                            <div className="flex justify-between items-start">
                                <div className="flex flex-col items-start text-xs min-h-[1.25rem]">
                                    {holidays.map(h => (
                                        <span key={h.name} title={h.name}>{countryFlags[h.country]}</span>
                                    ))}
                                </div>
                                <span className={dayNumberClasses}>{date.getDate()}</span>
                            </div>
                           
                            <div className="mt-1 space-y-0.5 overflow-hidden flex-grow relative">
                                {stays.map(stay => (
                                    <div
                                        key={stay.visit.visitId}
                                        className={`absolute left-0 right-0 h-5 text-xs font-bold leading-tight flex items-center gap-1 z-0 ${stay.color} ${stay.textColor} ${stay.isStart ? 'rounded-l-md' : ''} ${stay.isEnd ? 'rounded-r-md' : ''} stay-track-${stay.track}`}
                                        title={stay.visit.nom}
                                    >
                                        {stay.showText && (
                                            <>
                                                {/* FIX: Wrap icons in a span with a title to provide tooltips without passing an invalid prop to the Icon component. */}
                                                {stay.visit.locationType === 'physical' && <span title="Présentiel"><HomeIcon className="w-3 h-3 flex-shrink-0 ml-1" /></span>}
                                                {stay.visit.locationType === 'zoom' && <span title="Zoom"><VideoCameraIcon className="w-3 h-3 flex-shrink-0 ml-1" /></span>}
                                                {stay.visit.locationType === 'streaming' && <span title="Streaming"><WifiIcon className="w-3 h-3 flex-shrink-0 ml-1" /></span>}
                                                <span className="truncate">{stay.visit.nom}</span>
                                            </>
                                        )}
                                    </div>
                                ))}

                                {visit && !stays.some(s => s.visit.visitId === visit.visitId) && (
                                    <div className={`mt-1 p-1 text-xs font-bold leading-tight truncate rounded-md flex items-center gap-1.5 ${statusStyle ? statusStyle.color : 'bg-gray-100'}`} title={visit.nom}>
                                        {/* FIX: Wrap icons in a span with a title to provide tooltips without passing an invalid prop to the Icon component. */}
                                        {visit.locationType === 'physical' && <span title="Présentiel"><HomeIcon className="w-3 h-3 flex-shrink-0" /></span>}
                                        {visit.locationType === 'zoom' && <span title="Zoom"><VideoCameraIcon className="w-3 h-3 flex-shrink-0" /></span>}
                                        {visit.locationType === 'streaming' && <span title="Streaming"><WifiIcon className="w-3 h-3 flex-shrink-0" /></span>}
                                        <span className="truncate">{visit.nom}</span>
                                    </div>
                                )}
                            </div>
                             {unavailableHosts.length > 0 && <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full z-20" title={`${unavailableHosts.length} hôte(s) indisponible(s)`}></div>}
                             <div className="absolute bottom-0 left-0 right-0 h-1 flex">
                                {vacations.map(v => <div key={v.name} className={`h-full flex-1 ${v.color}`} title={v.name}></div>)}
                            </div>
                        </div>
                    );
                })}
            </div>

            {selectedDay && (() => {
                // FIX: Refactored uniqueVisits creation to be more explicit and help TypeScript's type inference.
                const visitsMap = new Map<string, Visit>();
                selectedDay.stays.forEach(s => visitsMap.set(s.visit.visitId, s.visit));
                if (selectedDay.visit) {
                    visitsMap.set(selectedDay.visit.visitId, selectedDay.visit);
                }
                const uniqueVisits = Array.from(visitsMap.values());
                
                return (
                    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex justify-center items-start pt-20 p-4 no-print" onClick={closeModal}>
                        <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-xl w-full sm:max-w-md max-h-[90vh] flex flex-col animate-fade-in-up" onClick={e => e.stopPropagation()}>
                            <div className="p-6 border-b border-border-light dark:border-border-dark">
                                 <h2 className="text-xl font-bold text-text-main dark:text-text-main-dark">
                                    {selectedDay.date.toLocaleDateString('fr-FR', {weekday: 'long', day: 'numeric', month: 'long'})}
                                </h2>
                            </div>
                            <div className="p-6 space-y-6 overflow-y-auto">
                               {uniqueVisits.length > 0 && (
                                    <ModalSection title="Visites & Séjours" icon={UserIcon}>
                                        {uniqueVisits.map(visit => <div key={visit.visitId}>{renderVisitDetailsInModal(visit)}</div>)}
                                    </ModalSection>
                                )}
                                
                                 {(selectedDay.vacations.length > 0 || selectedDay.holidays.length > 0) && (
                                    <ModalSection title="Événements" icon={CalendarIcon}>
                                        {selectedDay.vacations.map(v => (
                                            <p key={v.name} className="text-sm font-semibold">{v.name} (Zone {v.zone})</p>
                                        ))}
                                        {selectedDay.holidays.map(h => (
                                            <p key={h.name} className="text-sm">{countryFlags[h.country]} {h.name}</p>
                                        ))}
                                    </ModalSection>
                                )}

                                {selectedDay.unavailableHosts.length > 0 && (
                                     <ModalSection title="Hôtes indisponibles" icon={ExclamationTriangleIcon}>
                                        <ul className="list-disc pl-5 text-sm">
                                            {selectedDay.unavailableHosts.map(h => <li key={h.nom}>{h.nom}</li>)}
                                        </ul>
                                    </ModalSection>
                                )}

                               {uniqueVisits.length === 0 && selectedDay.holidays.length === 0 && selectedDay.vacations.length === 0 && selectedDay.unavailableHosts.length === 0 && (
                                    <p className="text-center text-text-muted dark:text-text-muted-dark py-4">Aucun événement ce jour-là.</p>
                                )}
                            </div>
                            <div className="bg-gray-50 dark:bg-background-dark px-6 py-3 text-right border-t border-border-light dark:border-border-dark">
                                 <button onClick={closeModal} className="px-4 py-2 bg-card-light dark:bg-card-dark border border-gray-300 dark:border-border-dark rounded-md text-sm font-medium text-text-main dark:text-text-main-dark hover:bg-gray-50 dark:hover:bg-primary-light/20">
                                    Fermer
                                 </button>
                            </div>
                        </div>
                    </div>
                )
            })()}
        </div>
    );
};
