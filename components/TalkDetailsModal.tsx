import React, { useState, useEffect } from 'react';
import { PublicTalk } from '../types';
import { XIcon, TrashIcon, InformationCircleIcon } from './Icons';
import { useData } from '../contexts/DataContext';
import { useConfirm } from '../contexts/ConfirmContext';
import { useToast } from '../contexts/ToastContext';

interface TalkDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    talk: PublicTalk | null;
}

export const TalkDetailsModal: React.FC<TalkDetailsModalProps> = ({ isOpen, onClose, talk }) => {
    const { addTalk, updateTalk, deleteTalk } = useData();
    const confirm = useConfirm();

    const [number, setNumber] = useState<string | number>('');
    const [theme, setTheme] = useState('');

    const isAdding = talk === null;

    useEffect(() => {
        if (isOpen) {
            if (talk) {
                setNumber(talk.number);
                setTheme(talk.theme);
            } else {
                setNumber('');
                setTheme('');
            }
        }
    }, [talk, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const talkData = {
            number: isNaN(Number(number)) ? String(number).toUpperCase() : Number(number),
            theme: theme.trim(),
        };

        if (isAdding) {
            addTalk(talkData);
        } else if (talk) {
            updateTalk(talk.number, talkData);
        }
        onClose();
    };

    const handleDelete = async () => {
        if (talk && await confirm(`Êtes-vous sûr de vouloir supprimer le discours n°${talk.number} ?\n\nCette action est irréversible et ne peut être effectuée que si le discours n'est assigné à aucune visite (passée ou future).`)) {
            deleteTalk(talk.number);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <form onSubmit={handleSubmit} className="bg-card-light dark:bg-card-dark rounded-xl shadow-xl w-full sm:max-w-lg max-h-[90vh] flex flex-col animate-fade-in-up">
                <div className="p-6 bg-gradient-to-br from-primary to-secondary dark:from-primary-dark dark:to-secondary text-white rounded-t-xl">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">{isAdding ? 'Ajouter un discours' : 'Modifier le discours'}</h2>
                        <button type="button" onClick={onClose} className="p-2 -mt-2 -mr-2 rounded-full text-white/70 hover:bg-white/20">
                            <XIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="talk-number" className="block text-sm font-medium text-text-muted dark:text-text-muted-dark">Numéro</label>
                        <input
                            id="talk-number"
                            type="text"
                            value={number}
                            onChange={(e) => setNumber(e.target.value)}
                            className="mt-1 block w-full border border-border-light dark:border-border-dark rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-card-light dark:bg-primary-light/10"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="talk-theme" className="block text-sm font-medium text-text-muted dark:text-text-muted-dark">Thème</label>
                        <textarea
                            id="talk-theme"
                            rows={3}
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                            className="mt-1 block w-full border border-border-light dark:border-border-dark rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-card-light dark:bg-primary-light/10"
                            required
                        />
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-background-dark px-6 py-4 flex justify-between items-center border-t border-border-light dark:border-border-dark rounded-b-xl">
                    <div>
                        {!isAdding && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 border border-transparent rounded-md text-sm font-medium text-white flex items-center gap-2 transition-transform active:scale-95"
                            >
                                <TrashIcon className="w-5 h-5" />
                                Supprimer
                            </button>
                        )}
                    </div>
                    <div className="flex space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-card-light dark:bg-card-dark border border-gray-300 dark:border-border-dark rounded-md text-sm font-medium text-text-main dark:text-text-main-dark hover:bg-gray-50 dark:hover:bg-primary-light/20 transition-transform active:scale-95">
                            Annuler
                        </button>
                        <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary-dark border border-transparent rounded-md text-sm font-medium text-white transition-transform active:scale-95">
                            Enregistrer
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};


// Nouvelle modale pour la mise à jour en masse
interface UpdateTalksListModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const UpdateTalksListModal: React.FC<UpdateTalksListModalProps> = ({ isOpen, onClose }) => {
    const { updatePublicTalksList } = useData();
    const { addToast } = useToast();
    const [talksList, setTalksList] = useState('');

    if (!isOpen) return null;

    const handleUpdate = () => {
        if (!talksList.trim()) {
            addToast("Veuillez coller la liste des discours dans la zone de texte.", 'warning');
            return;
        }
        updatePublicTalksList(talksList);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-xl w-full sm:max-w-2xl max-h-[90vh] flex flex-col animate-fade-in-up">
                <div className="p-6 bg-gradient-to-br from-primary to-secondary dark:from-primary-dark dark:to-secondary text-white rounded-t-xl">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">Mettre à jour la liste des discours</h2>
                        <button type="button" onClick={onClose} className="p-2 -mt-2 -mr-2 rounded-full text-white/70 hover:bg-white/20">
                            <XIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto">
                    <div className="p-4 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-sm flex items-start space-x-3">
                        <InformationCircleIcon className="w-8 h-8 flex-shrink-0" />
                        <div>
                            <p className="font-semibold">Comment ça marche ?</p>
                            <ul className="list-disc pl-5 mt-1">
                                <li>Copiez la liste complète des discours depuis la source officielle.</li>
                                <li>Collez-la ci-dessous. L'application ajoutera les nouveaux discours et mettra à jour les thèmes des discours existants.</li>
                                <li>Aucun discours ne sera supprimé (même les discours personnalisés seront conservés).</li>
                            </ul>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="talks-list-textarea" className="block text-sm font-medium text-text-muted dark:text-text-muted-dark">Coller la liste des discours ici</label>
                        <textarea
                            id="talks-list-textarea"
                            rows={10}
                            value={talksList}
                            onChange={(e) => setTalksList(e.target.value)}
                            className="mt-1 block w-full border border-border-light dark:border-border-dark rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-card-light dark:bg-primary-light/10 font-mono text-sm"
                            placeholder="Exemple :&#10;1. Comment la Bible peut vous aider...&#10;2. La Bible nous aide-t-elle à..."
                        />
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-background-dark px-6 py-4 flex justify-end space-x-3 border-t border-border-light dark:border-border-dark rounded-b-xl">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-card-light dark:bg-card-dark border border-gray-300 dark:border-border-dark rounded-md text-sm font-medium text-text-main dark:text-text-main-dark hover:bg-gray-50 dark:hover:bg-primary-light/20 transition-transform active:scale-95">
                        Annuler
                    </button>
                    <button type="button" onClick={handleUpdate} className="px-4 py-2 bg-primary hover:bg-primary-dark border border-transparent rounded-md text-sm font-medium text-white transition-transform active:scale-95">
                        Mettre à jour
                    </button>
                </div>
            </div>
        </div>
    );
};