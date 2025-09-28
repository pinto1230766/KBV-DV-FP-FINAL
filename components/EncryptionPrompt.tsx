import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheckIcon, ExclamationTriangleIcon, SpinnerIcon, XIcon } from './Icons';

interface EncryptionPromptProps {
    mode: 'unlock' | 'setup' | 'disable';
    onUnlock?: (password: string) => Promise<boolean>;
    onSetPassword?: (password: string) => Promise<boolean>;
    onDisable?: (password: string) => Promise<boolean>;
    onClose?: () => void;
}

export const EncryptionPrompt: React.FC<EncryptionPromptProps> = ({
    mode,
    onUnlock,
    onSetPassword,
    onDisable,
    onClose
}) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const passwordInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Auto-focus the password input when the component mounts
        setTimeout(() => passwordInputRef.current?.focus(), 100);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (mode === 'setup' && password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }

        if (mode === 'setup' && password.length < 8) {
            setError('Le mot de passe doit contenir au moins 8 caractères.');
            return;
        }

        setIsProcessing(true);
        let success = false;
        try {
            switch (mode) {
                case 'unlock':
                    if (onUnlock) success = await onUnlock(password);
                    if (!success) setError('Mot de passe incorrect.');
                    break;
                case 'setup':
                    if (onSetPassword) success = await onSetPassword(password);
                    break;
                case 'disable':
                    if (onDisable) success = await onDisable(password);
                     if (!success) setError('Mot de passe incorrect.');
                    break;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
        } finally {
            if (!success) {
                setIsProcessing(false);
                setPassword('');
                setConfirmPassword('');
            }
        }
    };

    const content = {
        unlock: {
            title: 'Application Verrouillée',
            description: 'Veuillez entrer votre mot de passe pour déchiffrer vos données.',
            buttonText: 'Déverrouiller',
        },
        setup: {
            title: 'Activer le Chiffrement',
            description: 'Choisissez un mot de passe pour protéger vos données. Il sera nécessaire à chaque ouverture.',
            buttonText: 'Activer',
        },
        disable: {
            title: 'Désactiver le Chiffrement',
            description: 'Entrez votre mot de passe actuel pour confirmer et stocker vos données en clair.',
            buttonText: 'Désactiver',
        },
    };

    const currentContent = content[mode];
    const isModal = mode !== 'unlock';

    const promptUI = (
        <div className={`bg-card-light dark:bg-card-dark rounded-xl shadow-xl w-full sm:max-w-md max-h-[90vh] flex flex-col ${isModal ? '' : 'animate-fade-in-up'}`}>
            <form onSubmit={handleSubmit}>
                <div className="p-6 bg-gradient-to-br from-primary to-secondary dark:from-primary-dark dark:to-secondary text-white rounded-t-xl flex-shrink-0">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-4">
                            <ShieldCheckIcon className="h-8 w-8" />
                            <div>
                                <h2 className="text-2xl font-bold">{currentContent.title}</h2>
                                {isModal && <p className="opacity-80 mt-1 text-sm">{currentContent.description}</p>}
                            </div>
                        </div>
                        {isModal && onClose && (
                             <button type="button" onClick={onClose} className="p-2 -mt-2 -mr-2 rounded-full text-white/70 hover:bg-white/20">
                                <XIcon className="w-6 h-6" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto">
                    {!isModal && <p className="text-center text-text-muted dark:text-text-muted-dark">{currentContent.description}</p>}
                    
                    {mode === 'setup' && (
                        <div className="p-4 rounded-md bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 text-sm flex items-start space-x-3">
                            <ExclamationTriangleIcon className="w-10 h-10 flex-shrink-0" />
                            <p><strong>ATTENTION :</strong> Si vous oubliez ce mot de passe, vos données seront <strong>définitivement perdues</strong>. Nous ne pouvons pas le récupérer pour vous.</p>
                        </div>
                    )}
                    
                    <div>
                        <label htmlFor="password-prompt" className="block text-sm font-medium text-text-muted dark:text-text-muted-dark">Mot de passe</label>
                        <input
                            ref={passwordInputRef}
                            id="password-prompt"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full border border-border-light dark:border-border-dark rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-card-light dark:bg-primary-light/10"
                            required
                        />
                    </div>

                    {mode === 'setup' && (
                         <div>
                            <label htmlFor="confirm-password-prompt" className="block text-sm font-medium text-text-muted dark:text-text-muted-dark">Confirmer le mot de passe</label>
                            <input
                                id="confirm-password-prompt"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="mt-1 block w-full border border-border-light dark:border-border-dark rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-card-light dark:bg-primary-light/10"
                                required
                            />
                        </div>
                    )}

                    {error && <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>}
                </div>
                
                <div className="bg-gray-50 dark:bg-background-dark px-6 py-4 flex justify-end space-x-3 border-t border-border-light dark:border-border-dark rounded-b-xl flex-shrink-0">
                    {isModal && onClose && (
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-card-light dark:bg-card-dark border border-gray-300 dark:border-border-dark rounded-md text-sm font-medium text-text-main dark:text-text-main-dark hover:bg-gray-50 dark:hover:bg-primary-light/20">
                            Annuler
                        </button>
                    )}
                    <button type="submit" disabled={isProcessing} className="flex items-center justify-center px-4 py-2 bg-primary hover:bg-primary-dark border border-transparent rounded-md text-sm font-medium text-white disabled:bg-primary/50">
                        {isProcessing && <SpinnerIcon className="w-5 h-5 mr-2"/>}
                        {isProcessing ? 'Traitement...' : currentContent.buttonText}
                    </button>
                </div>
            </form>
        </div>
    );
    
    if (isModal) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in">
                {promptUI}
            </div>
        );
    }

    // Full page lock screen
    return (
        <div className="fixed inset-0 bg-light dark:bg-dark z-50 flex justify-center items-center p-4">
            {promptUI}
        </div>
    );
};