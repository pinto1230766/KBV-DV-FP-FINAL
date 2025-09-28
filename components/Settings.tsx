import React, { useState, useEffect } from 'react';
import {
    UploadIcon, SpinnerIcon, ExclamationTriangleIcon,
    ExternalLinkIcon, ShieldCheckIcon, PodiumIcon, BookOpenIcon, ServerStackIcon, LockClosedIcon, LockOpenIcon, CloudArrowDownIcon, InformationCircleIcon, SparklesIcon, DownloadIcon, ChevronDownIcon, ClockIcon, SunIcon, MoonIcon, ComputerDesktopIcon, PaintBrushIcon
} from './Icons';
import { useData } from '../contexts/DataContext';
import { ArchivedVisits } from './ArchivedVisits';
import { EncryptionPrompt } from './EncryptionPrompt';
import { CongregationProfile, Theme } from '../types';
import useOnlineStatus from '../hooks/useOnlineStatus';
import { DuplicateFinderModal } from './DuplicateFinderModal';

interface SettingsProps {
    onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onResetData: () => void;
    isImporting: boolean;
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const SettingsSection: React.FC<{ title: string; description: string; icon: React.FC<any>; children: React.ReactNode; startsOpen?: boolean }> = ({ title, description, icon: Icon, children, startsOpen = false }) => {
    const [isExpanded, setIsExpanded] = useState(startsOpen);

    return (
        <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft-lg transition-all duration-300">
            <div className="p-4 cursor-pointer flex justify-between items-center" onClick={() => setIsExpanded(!isExpanded)} role="button" tabIndex={0} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setIsExpanded(!isExpanded)} aria-expanded={isExpanded}>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary/10 rounded-full flex-shrink-0">
                       <Icon className="w-6 h-6 text-secondary"/>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold font-display text-primary dark:text-white">{title}</h2>
                        <p className="text-sm text-text-muted dark:text-text-muted-dark">{description}</p>
                    </div>
                </div>
                <ChevronDownIcon className={`w-6 h-6 text-text-muted dark:text-text-muted-dark transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            </div>
            {isExpanded && (
                <div className="px-4 pb-4 animate-fade-in">
                    <div className="border-t border-border-light dark:border-border-dark pt-4">
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
};


const AppearanceContent: React.FC<{ theme: Theme; setTheme: (theme: Theme) => void; }> = ({ theme, setTheme }) => {
    const options = [
        { value: 'light', label: 'Clair', icon: SunIcon },
        { value: 'dark', label: 'Sombre', icon: MoonIcon },
        { value: 'system', label: 'Système', icon: ComputerDesktopIcon },
        { value: 'jw', label: 'JW.org', icon: PaintBrushIcon },
    ];

    return (
        <div className="space-y-4">
            <p className="text-sm text-text-muted dark:text-text-muted-dark">
                Choisissez l'apparence de l'application. Le mode "Système" s'adaptera automatiquement aux préférences de votre appareil.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {options.map(option => {
                    const Icon = option.icon;
                    const isActive = theme === option.value;
                    return (
                        <button
                            key={option.value}
                            onClick={() => setTheme(option.value as Theme)}
                            className={`flex flex-col items-center justify-center p-6 border-2 rounded-lg transition-all ${
                                isActive ? 'border-secondary bg-secondary/10' : 'border-border-light dark:border-border-dark hover:border-secondary/50'
                            }`}
                        >
                            <Icon className={`w-10 h-10 mb-2 ${isActive ? 'text-secondary' : 'text-text-muted dark:text-text-muted-dark'}`} />
                            <span className={`font-semibold ${isActive ? 'text-secondary' : 'text-text-main dark:text-text-main-dark'}`}>{option.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};


const CongregationProfileContent: React.FC = () => {
    const { congregationProfile, updateCongregationProfile } = useData();
    const [profile, setProfile] = useState<CongregationProfile>(congregationProfile);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        setProfile(congregationProfile);
        setIsDirty(false);
    }, [congregationProfile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({...prev, [name]: value}));
        setIsDirty(true);
    };

    const handleSave = () => {
        updateCongregationProfile(profile);
        setIsDirty(false);
    };

    return (
        <div className="space-y-4">
             <div>
                <label htmlFor="name" className="block text-sm font-medium text-text-muted dark:text-text-muted-dark">Nom de l'application / Congrégation</label>
                <input type="text" id="name" name="name" value={profile.name} onChange={handleChange} className="mt-1 block w-full border border-border-light dark:border-border-dark rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-secondary focus:border-secondary bg-card-light dark:bg-primary-light/10" />
            </div>
            <div>
                <label htmlFor="subtitle" className="block text-sm font-medium text-text-muted dark:text-text-muted-dark">Sous-titre</label>
                <input type="text" id="subtitle" name="subtitle" value={profile.subtitle} onChange={handleChange} className="mt-1 block w-full border border-border-light dark:border-border-dark rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-secondary focus:border-secondary bg-card-light dark:bg-primary-light/10" />
            </div>
             <div>
                <label htmlFor="defaultTime" className="block text-sm font-medium text-text-muted dark:text-text-muted-dark">Heure par défaut des discours</label>
                <input type="time" id="defaultTime" name="defaultTime" value={profile.defaultTime} onChange={handleChange} className="mt-1 block w-full border border-border-light dark:border-border-dark rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-secondary focus:border-secondary bg-card-light dark:bg-primary-light/10" />
            </div>
            <div>
                <label htmlFor="hospitalityOverseer" className="block text-sm font-medium text-text-muted dark:text-text-muted-dark">Responsable de l'accueil</label>
                <input type="text" id="hospitalityOverseer" name="hospitalityOverseer" value={profile.hospitalityOverseer || ''} onChange={handleChange} className="mt-1 block w-full border border-border-light dark:border-border-dark rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-secondary focus:border-secondary bg-card-light dark:bg-primary-light/10" />
            </div>
            <div>
                <label htmlFor="hospitalityOverseerPhone" className="block text-sm font-medium text-text-muted dark:text-text-muted-dark">Téléphone du responsable</label>
                <input type="tel" id="hospitalityOverseerPhone" name="hospitalityOverseerPhone" value={profile.hospitalityOverseerPhone || ''} onChange={handleChange} className="mt-1 block w-full border border-border-light dark:border-border-dark rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-secondary focus:border-secondary bg-card-light dark:bg-primary-light/10" />
            </div>
            <div>
                <label htmlFor="backupPhoneNumber" className="block text-sm font-medium text-text-muted dark:text-text-muted-dark">Numéro WhatsApp pour sauvegarde (avec indicatif)</label>
                <input type="tel" id="backupPhoneNumber" name="backupPhoneNumber" value={profile.backupPhoneNumber || ''} onChange={handleChange} className="mt-1 block w-full border border-border-light dark:border-border-dark rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-secondary focus:border-secondary bg-card-light dark:bg-primary-light/10" placeholder="+33612345678" />
            </div>
            <div className="text-right">
                <button onClick={handleSave} disabled={!isDirty} className="px-4 py-2 bg-primary hover:bg-primary-light text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-95">
                    Enregistrer les modifications
                </button>
            </div>
        </div>
    );
};

const GoogleSheetsContent: React.FC<{ onSync: () => Promise<void> }> = ({ onSync }) => {
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSync, setLastSync] = useState<string | null>(null);
    const isOnline = useOnlineStatus();
    
    useEffect(() => {
        setLastSync(localStorage.getItem('lastGoogleSheetSync'));
    }, []);

    const handleSync = async () => {
        setIsSyncing(true);
        await onSync();
        setLastSync(new Date().toISOString());
        setIsSyncing(false);
    };

    return (
        <div className="space-y-4">
            <div className="p-4 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-sm flex items-start space-x-3">
                <InformationCircleIcon className="w-8 h-8 flex-shrink-0" />
                <div>
                    <p className="font-semibold">Instructions :</p>
                    <ol className="list-decimal pl-5 mt-1 space-y-1">
                        <li>L'application est pré-configurée pour se synchroniser avec le Google Sheet de suivi.</li>
                        <li>Assurez-vous que le Google Sheet est partagé publiquement avec le lien (en mode Lecteur). Allez dans <strong>Partager</strong> &gt; <strong>Accès général</strong> &gt; <strong>"Tous les utilisateurs disposant du lien"</strong>.</li>
                        <li>Vérifiez que la première feuille est nommée "Planning" et contient les colonnes : <strong className="font-mono">Date, Orateur, Congrégation, N° Discours, Thème</strong>.</li>
                        <li>Cliquez sur le bouton "Synchroniser" pour importer les dernières visites.</li>
                    </ol>
                </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end items-center gap-4">
                 {lastSync && (
                    <p className="text-xs text-text-muted dark:text-text-muted-dark">
                        Dernière synchro: {new Date(lastSync).toLocaleString('fr-FR')}
                    </p>
                )}
                <button onClick={handleSync} disabled={isSyncing || !isOnline} className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary-light text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-95">
                    {isSyncing ? <SpinnerIcon className="w-5 h-5 mr-2" /> : <CloudArrowDownIcon className="w-5 h-5 mr-2" />}
                    {isSyncing ? 'Synchronisation...' : 'Synchroniser'}
                </button>
            </div>
            {!isOnline && <p className="text-right text-xs text-amber-600 dark:text-amber-400 mt-2">La synchronisation est désactivée en mode hors ligne.</p>}
        </div>
    );
};

const SecurityContent: React.FC = () => {
    const { isEncrypted, enableEncryption, disableEncryption } = useData();
    const [isPromptOpen, setIsPromptOpen] = useState(false);
    const [promptMode, setPromptMode] = useState<'setup' | 'disable'>('setup');

    const handleEnableClick = () => {
        setPromptMode('setup');
        setIsPromptOpen(true);
    };

    const handleDisableClick = () => {
        setPromptMode('disable');
        setIsPromptOpen(true);
    };

    const StatusBadge: React.FC<{ active: boolean }> = ({ active }) => (
        active ? (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300">
                <LockClosedIcon className="w-4 h-4" />
                <span className="text-sm font-semibold">Chiffrement activé</span>
            </div>
        ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
                <LockOpenIcon className="w-4 h-4" />
                <span className="text-sm font-semibold">Chiffrement désactivé</span>
            </div>
        )
    );

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                   <StatusBadge active={isEncrypted} />
                   <p className="text-sm text-text-muted dark:text-text-muted-dark mt-2 max-w-md">
                        {isEncrypted 
                            ? "Vos données sont protégées. Un mot de passe est requis à chaque ouverture de l'application."
                            : "Vos données sont stockées en clair. Activez le chiffrement pour plus de sécurité."
                        }
                   </p>
                </div>
                {isEncrypted ? (
                     <button onClick={handleDisableClick} className="flex-shrink-0 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-transform active:scale-95">
                        Désactiver
                    </button>
                ) : (
                     <button onClick={handleEnableClick} className="flex-shrink-0 px-4 py-2 bg-primary hover:bg-primary-light text-white font-semibold rounded-lg transition-transform active:scale-95">
                        Activer le chiffrement
                    </button>
                )}
            </div>
            {isPromptOpen && (
                <EncryptionPrompt
                    mode={promptMode}
                    onClose={() => setIsPromptOpen(false)}
                    onSetPassword={async (pass) => {
                        const success = await enableEncryption(pass);
                        if (success) setIsPromptOpen(false);
                        return success;
                    }}
                    onDisable={async (pass) => {
                        const success = await disableEncryption(pass);
                        if (success) setIsPromptOpen(false);
                        return success;
                    }}
                />
            )}
        </>
    );
};

const StorageManagerContent: React.FC = () => {
    const { appData } = useData();
    const [usage, setUsage] = useState({ bytes: 0, percent: 0 });
    const QUOTA = 5 * 1024 * 1024; // 5MB

    useEffect(() => {
        if (appData) {
            const dataString = JSON.stringify(appData);
            const bytes = new TextEncoder().encode(dataString).length;
            setUsage({
                bytes: bytes,
                percent: (bytes / QUOTA) * 100,
            });
        }
    }, [appData]);

    const usageMB = (usage.bytes / 1024 / 1024).toFixed(2);
    const quotaMB = (QUOTA / 1024 / 1024).toFixed(2);
    
    let progressBarColor = 'bg-green-500';
    if (usage.percent > 90) {
        progressBarColor = 'bg-red-500';
    } else if (usage.percent > 75) {
        progressBarColor = 'bg-amber-500';
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center font-semibold">
                <span>Espace utilisé</span>
                <span>{usageMB} Mo / {quotaMB} Mo</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-primary-light/20 rounded-full h-2.5">
                <div className={`${progressBarColor} h-2.5 rounded-full`} style={{ width: `${Math.min(usage.percent, 100)}%` }}></div>
            </div>
            {usage.percent > 75 && (
                <div className={`p-3 rounded-md text-sm flex items-start space-x-3 ${usage.percent > 90 ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'}`}>
                    <ExclamationTriangleIcon className="w-6 h-6 flex-shrink-0 mt-0.5" />
                    <p>
                        <strong>Attention :</strong> L'espace de stockage est presque plein.
                        Si le stockage est plein, vos nouvelles données ne seront pas sauvegardées.
                    </p>
                </div>
            )}
            <div>
                <h3 className="font-semibold mt-4">Comment libérer de l'espace ?</h3>
                <ul className="list-disc pl-5 mt-2 text-sm text-text-muted dark:text-text-muted-dark space-y-1">
                    <li>Supprimez les photos des orateurs et contacts d'accueil qui ne sont plus nécessaires.</li>
                    <li>Dans les visites programmées, supprimez les pièces jointes (PDF) qui ne sont plus utiles.</li>
                    <li>Archivez les visites terminées pour alléger la liste active.</li>
                    <li>Supprimez définitivement les visites très anciennes depuis l'archive.</li>
                </ul>
            </div>
        </div>
    );
};

const DataManagementContent: React.FC<Omit<SettingsProps, 'theme' | 'setTheme'>> = ({ onImport, onResetData, isImporting }) => {
    const { exportData } = useData();

    return (
        <div className="space-y-6">
             <div>
                <h3 className="text-lg font-semibold text-text-main dark:text-text-main-dark mb-2">Sauvegarde et Restauration</h3>
                <p className="text-sm text-text-muted dark:text-text-muted-dark mb-4">
                    Il est recommandé de faire des sauvegardes régulières. Le fichier sera enregistré dans votre dossier de téléchargements.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button onClick={exportData} className="flex flex-col items-center justify-center text-center p-4 bg-gray-100 dark:bg-primary-light/10 rounded-lg hover:bg-gray-200 dark:hover:bg-primary-light/20 transition-colors">
                        <DownloadIcon className="w-8 h-8 mb-2 text-secondary" />
                        <span className="font-semibold">Télécharger la sauvegarde</span>
                        <span className="text-xs text-text-muted dark:text-text-muted-dark mt-1">Enregistrer toutes les données dans un fichier.</span>
                    </button>
                    <label htmlFor="import-file" className="flex flex-col items-center justify-center text-center p-4 bg-gray-100 dark:bg-primary-light/10 rounded-lg hover:bg-gray-200 dark:hover:bg-primary-light/20 transition-colors cursor-pointer">
                        {isImporting ? (
                            <>
                                <SpinnerIcon className="w-8 h-8 mb-2 text-secondary" />
                                <span className="font-semibold">Importation...</span>
                            </>
                        ) : (
                            <>
                                <UploadIcon className="w-8 h-8 mb-2 text-secondary" />
                                <span className="font-semibold">Importer les données</span>
                            </>
                        )}
                         <span className="text-xs text-text-muted dark:text-text-muted-dark mt-1">Restaurer depuis un fichier</span>
                        <input id="import-file" type="file" className="sr-only" onChange={onImport} accept=".json" disabled={isImporting} />
                    </label>
                </div>
             </div>

            <div>
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">Zone de Danger</h3>
                <div className="mt-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                         <p className="font-semibold text-red-800 dark:text-red-200">Réinitialiser l'application</p>
                         <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                            Efface définitivement toutes les visites, orateurs et contacts. Cette action est irréversible.
                         </p>
                    </div>
                     <button onClick={onResetData} className="w-full sm:w-auto mt-2 sm:mt-0 flex-shrink-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                        <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                        Réinitialiser
                    </button>
                </div>
            </div>
        </div>
    );
};

const UsefulLinksContent: React.FC = () => {
    const sheetUrl = "https://docs.google.com/spreadsheets/d/1drIzPPi6AohCroSyUkF1UmMFxuEtMACBF4XATDjBOcg/edit?usp=drivesdk";

    return (
        <a 
            href={sheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center p-4 bg-gray-100 dark:bg-primary-light/10 rounded-lg hover:bg-gray-200 dark:hover:bg-primary-light/20 transition-colors"
        >
            <ExternalLinkIcon className="w-6 h-6 mr-3 text-green-600" />
            <span className="font-semibold">Ouvrir le Google Sheet de suivi</span>
        </a>
    );
};

const MaintenanceContent: React.FC = () => {
    const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                   <p className="font-semibold text-text-main dark:text-text-main-dark">Rechercher les doublons</p>
                   <p className="text-sm text-text-muted dark:text-text-muted-dark mt-1 max-w-md">
                        Analysez vos listes d'orateurs et de contacts d'accueil pour trouver et fusionner les entrées en double.
                   </p>
                </div>
                <button onClick={() => setIsDuplicateModalOpen(true)} className="flex-shrink-0 px-4 py-2 bg-primary hover:bg-primary-light text-white font-semibold rounded-lg transition-transform active:scale-95">
                    Lancer la recherche
                </button>
            </div>
            {isDuplicateModalOpen && (
                <DuplicateFinderModal 
                    isOpen={isDuplicateModalOpen} 
                    onClose={() => setIsDuplicateModalOpen(false)} 
                />
            )}
        </>
    );
};

export const Settings: React.FC<SettingsProps> = ({ onImport, onResetData, isImporting, theme, setTheme }) => {
    const { syncWithGoogleSheet, archivedVisits } = useData();
    return (
        <div className="space-y-6">
            <SettingsSection title="Apparence" description="Personnalisez le thème de l'application." icon={PaintBrushIcon} startsOpen={true}>
                <AppearanceContent theme={theme} setTheme={setTheme} />
            </SettingsSection>
            
            <SettingsSection title="Profil de la Congrégation" description="Personnalisez les informations de l'application." icon={PodiumIcon}>
                <CongregationProfileContent />
            </SettingsSection>

            <SettingsSection title="Synchronisation Google Sheets" description="Importez et mettez à jour les visites depuis un Google Sheet." icon={CloudArrowDownIcon}>
                <GoogleSheetsContent onSync={syncWithGoogleSheet} />
            </SettingsSection>

            <SettingsSection title="Sécurité et Confidentialité" description="Protégez vos données avec un mot de passe." icon={ShieldCheckIcon}>
                <SecurityContent />
            </SettingsSection>

            <SettingsSection title="Gestion du Stockage" description="Gérez l'espace utilisé par l'application sur votre appareil." icon={ServerStackIcon}>
                <StorageManagerContent />
            </SettingsSection>

            <SettingsSection title="Maintenance" description="Outils pour maintenir la qualité des données." icon={SparklesIcon}>
                 <MaintenanceContent />
            </SettingsSection>

            <SettingsSection title="Gestion des données" description="Sauvegardez, restaurez ou réinitialisez les données." icon={DownloadIcon}>
                <DataManagementContent onImport={onImport} onResetData={onResetData} isImporting={isImporting} />
            </SettingsSection>

            <SettingsSection title="Liens Utiles" description="Accédez rapidement à vos ressources externes." icon={BookOpenIcon}>
                <UsefulLinksContent />
            </SettingsSection>
            
            <SettingsSection title="Archive des visites" description={`Consultez l'historique des visites terminées (${archivedVisits.length}).`} icon={ClockIcon}>
                <ArchivedVisits />
            </SettingsSection>
        </div>
    );
};