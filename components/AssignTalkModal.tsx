import React, { useState, useEffect } from 'react';
import { PublicTalk, Speaker, Visit } from '../types';
import { XIcon, CalendarIcon } from './Icons';
import { useData } from '../contexts/DataContext';
import { useToast } from '../contexts/ToastContext';
import { UNASSIGNED_HOST } from '../constants';
import { Avatar } from './Avatar';

interface AssignTalkModalProps {
    isOpen: boolean;
    onClose: () => void;
    talk: PublicTalk | null;
}

export const AssignTalkModal: React.FC<AssignTalkModalProps> = ({ isOpen, onClose, talk }) => {
    const { speakers, addVisit, congregationProfile, visits } = useData();
    const { addToast } = useToast();
    
    const [speakerId, setSpeakerId] = useState<string>('');
    const [visitDate, setVisitDate] = useState('');
    const [dateConflict, setDateConflict] = useState<Visit | null>(null);

    useEffect(() => {
        if (isOpen) {
            setSpeakerId('');
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            setVisitDate(`${year}-${month}-${day}`);
            setDateConflict(null);
        }
    }, [isOpen]);
    
    useEffect(() => {
        if (!visitDate) {
            setDateConflict(null);
            return;
        }
        const conflictingVisit = visits.find(v => v.visitDate === visitDate);
        setDateConflict(conflictingVisit || null);
    }, [visitDate, visits]);

    if (!isOpen || !talk) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const selectedSpeaker = speakers.find(s => s.id === speakerId);
        
        if (!selectedSpeaker) {
            addToast("Veuillez sélectionner un orateur.", 'error');
            return;
        }
        if (!visitDate) {
            addToast("Veuillez sélectionner une date.", 'error');
            return;
        }

        const cong = selectedSpeaker.congregation.toLowerCase();
        let locationType: 'physical' | 'zoom' | 'streaming' = 'physical';
        if (cong.includes('zoom')) locationType = 'zoom';
        else if (cong.includes('streaming')) locationType = 'streaming';

        const newVisit: Visit = {
            id: selectedSpeaker.id,
            nom: selectedSpeaker.nom,
            congregation: selectedSpeaker.congregation,
            telephone: selectedSpeaker.telephone,
            photoUrl: selectedSpeaker.photoUrl,
            visitId: crypto.randomUUID(),
            visitDate,
            visitTime: congregationProfile.defaultTime,
            host: locationType !== 'physical' ? 'N/A' : UNASSIGNED_HOST,
            accommodation: '',
            meals: '',
            status: 'pending',
            locationType,
            talkNoOrType: talk.number.toString(),
            talkTheme: talk.theme,
            communicationStatus: {},
        };
        addVisit(newVisit);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <form onSubmit={handleSubmit} className="bg-card-light dark:bg-card-dark rounded-xl shadow-xl w-full sm:max-w-lg max-h-[90vh] flex flex-col animate-fade-in-up">
                <div className="p-6 bg-gradient-to-br from-primary to-secondary dark:from-primary-dark dark:to-secondary text-white rounded-t-xl flex-shrink-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold">Attribuer un discours</h2>
                            <p className="opacity-80 mt-1 truncate">N°{talk.number} - {talk.theme}</p>
                        </div>
                        <button type="button" onClick={onClose} className="p-2 -mt-2 -mr-2 rounded-full text-white/70 hover:bg-white/20">
                            <XIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
                    <div>
                        <label htmlFor="speaker-select" className="block text-sm font-medium text-text-muted dark:text-text-muted-dark">Orateur</label>
                        <select
                            id="speaker-select"
                            value={speakerId}
                            onChange={(e) => setSpeakerId(e.target.value)}
                            className="mt-1 block w-full border border-border-light dark:border-border-dark rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-card-light dark:bg-primary-light/10"
                            required
                        >
                            <option value="" disabled>Sélectionner un orateur</option>
                            {speakers.map(s => (
                                <option key={s.id} value={s.id}>{s.nom} ({s.congregation})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="visit-date-assign" className="block text-sm font-medium text-text-muted dark:text-text-muted-dark">Date du discours</label>
                        <input
                            id="visit-date-assign"
                            type="date"
                            value={visitDate}
                            onChange={(e) => setVisitDate(e.target.value)}
                            className="mt-1 block w-full border border-border-light dark:border-border-dark rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-card-light dark:bg-primary-light/10"
                            required
                        />
                    </div>
                    {dateConflict && (
                         <div className="p-3 rounded-md bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-sm flex items-start space-x-3">
                            <CalendarIcon className="w-5 h-5 flex-shrink-0 mt-0.5"/>
                            <p><strong>Attention :</strong> Une visite est déjà programmée ce jour-là pour <strong>{dateConflict.nom}</strong>.</p>
                        </div>
                    )}
                </div>

                <div className="bg-gray-50 dark:bg-background-dark px-6 py-4 flex justify-end space-x-3 border-t border-border-light dark:border-border-dark rounded-b-xl flex-shrink-0">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-card-light dark:bg-card-dark border border-gray-300 dark:border-border-dark rounded-md text-sm font-medium text-text-main dark:text-text-main-dark hover:bg-gray-50 dark:hover:bg-primary-light/20 transition-transform active:scale-95">
                        Annuler
                    </button>
                    <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary-dark border border-transparent rounded-md text-sm font-medium text-white transition-transform active:scale-95">
                        Attribuer et Programmer
                    </button>
                </div>
            </form>
        </div>
    );
};