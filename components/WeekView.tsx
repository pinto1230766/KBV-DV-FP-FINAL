import React, { useState, useMemo } from 'react';
import { Visit } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';
import { format, startOfWeek, endOfWeek, addDays, eachDayOfInterval, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { fr } from 'date-fns/locale';

interface WeekViewProps {
  visits: Visit[];
  onEditVisit: (visit: Visit) => void;
}

const DayCard: React.FC<{ day: Date; visits: Visit[]; onEditVisit: (visit: Visit) => void }> = ({ day, visits, onEditVisit }) => {
  const isToday = isSameDay(day, new Date());

  return (
    <div className={`flex-1 min-w-[150px] rounded-lg p-3 ${isToday ? 'bg-primary-light/10' : 'bg-gray-100 dark:bg-background-dark'}`}>
      <div className="text-center mb-3">
        <p className={`font-semibold text-sm ${isToday ? 'text-primary' : 'text-text-muted dark:text-text-muted-dark'}`}>{format(day, 'eee', { locale: fr }).toUpperCase()}</p>
        <p className={`text-2xl font-bold ${isToday ? 'text-primary' : 'text-text-main dark:text-text-main-dark'}`}>{format(day, 'd')}</p>
      </div>
      <div className="space-y-2">
        {visits.length > 0 ? (
          visits.map(visit => (
            <div 
              key={visit.visitId} 
              onClick={() => onEditVisit(visit)}
              className="p-2 rounded-lg bg-white dark:bg-card-dark shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-card-dark-light transition-colors"
            >
              <p className="font-bold text-sm text-text-main dark:text-text-main-dark">{visit.nom}</p>
              <p className="text-xs text-text-muted dark:text-text-muted-dark">{visit.talkNoOrType}</p>
            </div>
          ))
        ) : (
          <div className="text-center text-xs text-gray-400 dark:text-gray-600 pt-4">Aucune visite</div>
        )}
      </div>
    </div>
  );
};

export const WeekView: React.FC<WeekViewProps> = ({ visits, onEditVisit }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const start = startOfWeek(currentDate, { weekStartsOn: 1 });
  const end = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start, end });

  const weekVisits = useMemo(() => {
    const visitsByDay = new Map<string, Visit[]>();
    weekDays.forEach(day => {
      const dayString = format(day, 'yyyy-MM-dd');
      const dayVisits = visits.filter(v => v.visitDate === dayString);
      visitsByDay.set(dayString, dayVisits);
    });
    return visitsByDay;
  }, [visits, weekDays]);

  const handlePrevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const handleGoToToday = () => setCurrentDate(new Date());

  return (
    <div className="p-4 bg-card-light dark:bg-card-dark rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <button onClick={handleGoToToday} className="px-4 py-2 text-sm font-semibold bg-gray-200 dark:bg-background-dark rounded-lg hover:bg-gray-300 dark:hover:bg-primary-light/20">Aujourd'hui</button>
          <div className="flex items-center gap-2">
            <button onClick={handlePrevWeek} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-primary-light/20"><ChevronLeftIcon className="w-6 h-6" /></button>
            <button onClick={handleNextWeek} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-primary-light/20"><ChevronRightIcon className="w-6 h-6" /></button>
          </div>
        </div>
        <h2 className="text-xl font-bold text-text-main dark:text-text-main-dark">
          {format(start, 'd MMMM', { locale: fr })} - {format(end, 'd MMMM yyyy', { locale: fr })}
        </h2>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {weekDays.map(day => (
          <DayCard 
            key={day.toString()} 
            day={day} 
            visits={weekVisits.get(format(day, 'yyyy-MM-dd')) || []}
            onEditVisit={onEditVisit}
          />
        ))}
      </div>
    </div>
  );
};
