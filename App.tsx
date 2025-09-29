import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Speaker, Visit, MessageRole, Language, Host, MessageType, TalkHistory, Theme } from './types';
import { UpcomingVisits } from './components/UpcomingVisits';
import { SpeakerList } from './components/SpeakerList';
import { ScheduleVisitModal } from './components/ScheduleVisitModal';
import { CalendarView } from './components/CalendarView';
import { WeekView } from './components/WeekView';
import { MessagingCenter } from './components/MessagingCenter';
import { SpeakerDetailsModal } from './components/SpeakerDetailsModal';
import { Settings } from './components/Settings';
import { CalendarIcon, ListViewIcon, EnvelopeIcon, CogIcon, MoonIcon, SunIcon, SearchIcon, DashboardIcon, BookOpenIcon, PodiumIcon } from './components/Icons';
import { useToast } from './contexts/ToastContext';
import { useConfirm } from './contexts/ConfirmContext';
import { MessageGeneratorModal } from './components/MessageGeneratorModal';
import { useData } from './contexts/DataContext';
import { NotificationPermissionBanner } from './components/NotificationPermissionBanner';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { HostDetailsModal } from './components/HostDetailsModal';
import { Dashboard } from './components/Dashboard';
import { HostList } from './components/HostList';
import { PastVisitsManager } from './components/PastVisitsManager';
import { TabButton } from './components/TabButton';
import useVisitNotifications from './hooks/useVisitNotifications';
import { Avatar } from './components/Avatar';
import { HostRequestModal } from './components/HostRequestModal';
import { TalksManager } from './components/TalksManager';

type ViewMode = 'cards' | 'list' | 'calendar';
type Tab = 'dashboard' | 'planning' | 'messaging' | 'talks' | 'settings';

const App: React.FC = () => {
    const { 
        congregationProfile,
        upcomingVisits,
        pastUnarchivedVisits,
        deleteVisit,
        completeVisit,
        importData,
        resetData,
        speakers, 
        archivedVisits,
        hosts,
        visits
    } = useData();
    
    // Modals State
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [editingVisit, setEditingVisit] = useState<Visit | null>(null);
    const [speakerToSchedule, setSpeakerToSchedule] = useState<Speaker | null>(null);
    
    const [isSpeakerDetailsModalOpen, setIsSpeakerDetailsModalOpen] = useState(false);
    const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null);

    const [isMessageGeneratorModalOpen, setIsMessageGeneratorModalOpen] = useState(false);
    const [messageModalData, setMessageModalData] = useState<{ visit: Visit; role: MessageRole; messageType?: MessageType } | null>(null);
    const [visitForThankYou, setVisitForThankYou] = useState<Visit | null>(null);

    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    
    const [isHostDetailsModalOpen, setIsHostDetailsModalOpen] = useState(false);
    const [selectedHost, setSelectedHost] = useState<Host | null>(null);

    const [isHostRequestModalOpen, setIsHostRequestModalOpen] = useState(false);
    const [visitsForHostRequest, setVisitsForHostRequest] = useState<Visit[]>([]);
    

    // UI & Settings State
    const [viewMode, setViewMode] = useState<ViewMode>('cards');
    const [calendarViewMode, setCalendarViewMode] = useState<'month' | 'week'>('month');
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
    const [messagingLanguage, setMessagingLanguage] = useState<Language>('fr');
    const [isImporting, setIsImporting] = useState(false);
    const [isSpeakerListExpanded, setIsSpeakerListExpanded] = useState(false);
    const [isHostListExpanded, setIsHostListExpanded] = useState(false);
    
    const [notificationPermission, setNotificationPermission] = useState(
        typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
    );
    const [showNotificationBanner, setShowNotificationBanner] = useState(false);

    useVisitNotifications(upcomingVisits, notificationPermission);

    const [theme, setTheme] = useState<Theme>(() => {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system' || storedTheme === 'jw') {
            return storedTheme as Theme;
        }
        return 'system';
    });

    const [isDarkMode, setIsDarkMode] = useState(() => {
        const stored = localStorage.getItem('is-dark-mode');
        if(stored) return stored === 'true';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    const effectiveTheme = isDarkMode ? 'dark' : 'light';
    
    const { addToast } = useToast();
    const confirm = useConfirm();
    const speakerListRef = useRef<HTMLDivElement>(null);
    const hostListRef = useRef<HTMLDivElement>(null);
    
    const logoDataUri = useMemo(() => {
        const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='#b91c1c'/><text x='50' y='48' dominant-baseline='middle' text-anchor='middle' font-family='Montserrat, sans-serif' font-size='35' font-weight='bold' fill='white'>KBV</text><text x='50' y='70' dominant-baseline='middle' text-anchor='middle' font-family='Inter, sans-serif' font-size='15' font-weight='bold' fill='white'>DV LYON</text></svg>`;
        return `data:image/svg+xml,${encodeURIComponent(svg)}`;
    }, []);

    useEffect(() => {
        const root = window.document.documentElement;
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
        const applyTheme = () => {
            let darkMode = false;
            
            if (theme === 'jw') {
                root.classList.add('theme-jw');
                darkMode = isDarkMode; // Respect manual toggle for JW theme
            } else {
                root.classList.remove('theme-jw');
                if (theme === 'dark') {
                    darkMode = true;
                } else if (theme === 'light') {
                    darkMode = false;
                } else { // System
                    darkMode = mediaQuery.matches;
                }
            }

            if (darkMode) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
            setIsDarkMode(darkMode);
        };
    
        applyTheme();
        localStorage.setItem('theme', theme);
        
        const mediaQueryListener = (e: MediaQueryListEvent) => {
            if (localStorage.getItem('theme') === 'system') {
                setIsDarkMode(e.matches);
            }
        };
        
        mediaQuery.addEventListener('change', mediaQueryListener);
        
        return () => {
            mediaQuery.removeEventListener('change', mediaQueryListener);
        };
    }, [theme, isDarkMode]);
    
    useEffect(() => {
        localStorage.setItem('is-dark-mode', String(isDarkMode));
    }, [isDarkMode]);

    useEffect(() => {
        const notificationPromptDismissed = localStorage.getItem('notificationPromptDismissed');
        if (
            typeof window !== 'undefined' && 
            'Notification' in window && 
            Notification.permission === 'default' && 
            !notificationPromptDismissed
        ) {
            // Use a small delay to avoid overwhelming the user on page load
            const timer = setTimeout(() => {
                setShowNotificationBanner(true);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleEnableNotifications = () => {
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                setNotificationPermission(permission);
                setShowNotificationBanner(false);
                localStorage.setItem('notificationPromptDismissed', 'true');
                if (permission === 'granted') {
                    addToast("Notifications activées ! Vous recevrez des rappels pour les prochaines visites.", 'success', 7000);
                } else {
                    addToast("Notifications non activées. Gérez-les dans les paramètres de votre navigateur.", 'warning', 7000);
                }
            });
        }
    };
    
    const handleDismissNotificationBanner = () => {
        setShowNotificationBanner(false);
        localStorage.setItem('notificationPromptDismissed', 'true');
    };
    
    const handleOpenMessageGenerator = useCallback((visit: Visit, role: MessageRole, messageType?: MessageType) => {
        setMessageModalData({ visit, role, messageType });
        setIsMessageGeneratorModalOpen(true);
    }, []);

    useEffect(() => {
        if (visitForThankYou) {
            handleOpenMessageGenerator(visitForThankYou, 'speaker', 'thanks');
            setVisitForThankYou(null); // Reset after opening
        }
    }, [visitForThankYou, handleOpenMessageGenerator]);


    const toggleTheme = () => {
       if (theme === 'system' || theme === 'jw') {
           setIsDarkMode(prev => !prev);
       } else {
           setTheme(effectiveTheme === 'light' ? 'dark' : 'light');
       }
    };

    const handleScheduleVisit = useCallback((speaker: Speaker) => {
        setSpeakerToSchedule(speaker);
        setEditingVisit(null);
        setIsScheduleModalOpen(true);
    }, []);

    const handleEditVisit = useCallback((visit: Visit) => {
        setEditingVisit(visit);
        setSpeakerToSchedule(null);
        setIsScheduleModalOpen(true);
    }, []);

    const handleDeleteVisit = useCallback(async (visitId: string) => {
        if(await confirm("Êtes-vous sûr de vouloir supprimer cette visite ?")) {
           deleteVisit(visitId);
        }
    }, [confirm, deleteVisit]);
    
    const handleCompleteVisit = useCallback(async (visit: Visit) => {
        if (!await confirm(`Voulez-vous marquer la visite de ${visit.nom} comme terminée ?\nCela mettra à jour sa date de dernière visite et retirera cette planification.`)) {
            return;
        }
        completeVisit(visit);
        setVisitForThankYou(visit);
    }, [confirm, completeVisit]);

    const handleCompleteMultipleVisits = useCallback(async (visitsToArchive: Visit[]) => {
        if (await confirm(`Voulez-vous archiver les ${visitsToArchive.length} visites sélectionnées ?\nCette action mettra à jour l'historique des orateurs.`)) {
            visitsToArchive.forEach(visit => completeVisit(visit));
            addToast(`${visitsToArchive.length} visite(s) archivée(s) avec succès.`, 'success');
        }
    }, [confirm, completeVisit, addToast]);
    
    const handleAddSpeaker = useCallback(() => {
        setSelectedSpeaker(null);
        setIsSpeakerDetailsModalOpen(true);
    }, []);

    const handleEditSpeaker = (speaker: Speaker) => {
        setSelectedSpeaker(speaker);
        setIsSpeakerDetailsModalOpen(true);
    };
    
    const handleAddHost = useCallback(() => {
        setSelectedHost(null);
        setIsHostDetailsModalOpen(true);
    }, []);

    const handleEditHost = (host: Host) => {
        setSelectedHost(host);
        setIsHostDetailsModalOpen(true);
    };

    const handleOpenHostRequestModal = useCallback((visits: Visit[]) => {
        setVisitsForHostRequest(visits);
        setIsHostRequestModalOpen(true);
    }, []);
    
    const handleImportData = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (await confirm("Êtes-vous sûr de vouloir importer ces données ? Cela écrasera toutes les données actuelles.")) {
            setIsImporting(true);
            try {
                const text = await file.text();
                const data = JSON.parse(text);
                importData(data);
            } catch (error) {
                console.error("Failed to import data:", error);
                addToast(`Erreur lors de l'importation : ${error instanceof Error ? error.message : 'Format non valide.'}`, 'error');
            } finally {
                setIsImporting(false);
                event.target.value = '';
            }
        } else {
             event.target.value = '';
        }
    }, [confirm, addToast, importData]);
    
    const handleResetData = useCallback(async () => {
        if (await confirm("ATTENTION : Cette action est irréversible.\nToutes les visites, orateurs et frères pour l'accueil seront supprimés. Voulez-vous continuer ?")) {
            resetData();
        }
    }, [confirm, resetData]);

    const handleScheduleFromShortcut = useCallback(() => {
        setActiveTab('planning');
        setIsSpeakerListExpanded(true);
        // Use timeout to ensure the list has rendered before scrolling
        setTimeout(() => {
            speakerListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }, []);
    
    // --- Navigation handlers from Dashboard ---
    const handleGoToSpeakers = useCallback(() => {
        setActiveTab('planning');
        setIsSpeakerListExpanded(true);
        setTimeout(() => {
            speakerListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }, []);

    const handleGoToHosts = useCallback(() => {
        setActiveTab('planning');
        setIsHostListExpanded(true);
        setTimeout(() => {
            hostListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }, []);
    
    const handleGoToPlanning = useCallback(() => {
        setActiveTab('planning');
    }, []);

    const handleGoToSettings = useCallback(() => {
        setActiveTab('settings');
        // Optional: Scroll to the archives section if possible, but just switching tabs is enough.
    }, []);

    // Effect to handle PWA shortcut actions
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const action = params.get('action');

        // Use a timeout to ensure modals don't conflict with initial render
        if (action) {
            setTimeout(() => {
                if (action === 'schedule') {
                    handleScheduleFromShortcut();
                } else if (action === 'add_speaker') {
                    handleAddSpeaker();
                } else if (action === 'add_host') {
                    handleAddHost();
                }
                // Clean up URL to avoid re-triggering on reload
                if (window.history.replaceState) {
                    const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
                    window.history.replaceState({}, document.title, cleanUrl);
                }
            }, 100);
        }
    }, [handleScheduleFromShortcut, handleAddSpeaker, handleAddHost]);

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <Dashboard 
                    onScheduleVisitClick={handleScheduleFromShortcut}
                    onAddSpeakerClick={handleAddSpeaker}
                    onAddHostClick={handleAddHost}
                    onEditVisitClick={handleEditVisit}
                    onOpenMessageGenerator={handleOpenMessageGenerator}
                    onOpenHostRequestModal={handleOpenHostRequestModal}
                    setActiveTab={setActiveTab}
                    onGoToSpeakers={handleGoToSpeakers}
                    onGoToHosts={handleGoToHosts}
                    onGoToPlanning={handleGoToPlanning}
                    onGoToSettings={handleGoToSettings}
                />;
            case 'planning':
                return (
                    <>
                        <PastVisitsManager
                            visits={pastUnarchivedVisits}
                            onComplete={handleCompleteVisit}
                            onCompleteMultiple={handleCompleteMultipleVisits}
                        />
                        {viewMode === 'calendar' && (
                            <div className="flex justify-center gap-4 mb-4">
                                <button
                                    onClick={() => setCalendarViewMode('month')}
                                    title="Afficher le calendrier par mois"
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold ${calendarViewMode === 'month' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-background-dark text-text-main dark:text-text-main-dark'}`}
                                >
                                    Mois
                                </button>
                                <button
                                    onClick={() => setCalendarViewMode('week')}
                                    title="Afficher le calendrier par semaine"
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold ${calendarViewMode === 'week' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-background-dark text-text-main dark:text-text-main-dark'}`}
                                >
                                    Semaine
                                </button>
                            </div>
                        )}
                        {viewMode === 'cards' || viewMode === 'list' ? (
                            <UpcomingVisits
                                visits={upcomingVisits}
                                onEdit={handleEditVisit}
                                onDelete={handleDeleteVisit}
                                onComplete={handleCompleteVisit}
                                onOpenMessageGenerator={handleOpenMessageGenerator}
                                onScheduleFirst={handleScheduleFromShortcut}
                                viewMode={viewMode}
                            />
                        ) : (
                            calendarViewMode === 'month' ? (
                                <CalendarView 
                                    visits={visits}
                                    onEditVisit={handleEditVisit}
                                />
                            ) : (
                                <WeekView
                                    visits={visits}
                                    onEditVisit={handleEditVisit}
                                />
                            )
                        )}
                        <div ref={speakerListRef} className="my-8">
                            <SpeakerList
                                onSchedule={handleScheduleVisit}
                                onAddSpeaker={handleAddSpeaker}
                                onEditSpeaker={handleEditSpeaker}
                                isExpanded={isSpeakerListExpanded}
                                onToggleExpand={() => setIsSpeakerListExpanded(prev => !prev)}
                            />
                        </div>
                        <div ref={hostListRef} className="my-8">
                            <HostList
                                onAddHost={handleAddHost}
                                onEditHost={handleEditHost}
                                isExpanded={isHostListExpanded}
                                onToggleExpand={() => setIsHostListExpanded(prev => !prev)}
                            />
                        </div>
                    </>
                );
            case 'messaging':
                return <MessagingCenter
                    onOpenMessageGenerator={handleOpenMessageGenerator}
                    language={messagingLanguage}
                    onLanguageChange={setMessagingLanguage}
                />;
            case 'talks':
                return <TalksManager />;
            case 'settings':
                return <Settings
                    theme={theme}
                    setTheme={setTheme}
                    onImport={handleImportData}
                    onResetData={handleResetData}
                    isImporting={isImporting}
                />;
            default:
                return null;
        }
    };

    return (
        <>
            <div className="h-full flex flex-col transition-colors duration-300 overflow-hidden">
                {showNotificationBanner && (
                    <NotificationPermissionBanner
                        onEnable={handleEnableNotifications}
                        onDismiss={handleDismissNotificationBanner}
                    />
                )}
                 <div className="header-safe-area backdrop-blur-lg flex-shrink-0 z-40 no-print">
                    <header className="bg-background/95 dark:bg-background-dark/95 border-b border-white/20 dark:border-white/10">
                        <div className="px-4 sm:px-6 lg:px-8">
                            <div className="flex justify-between items-center py-2 sm:py-4">
                                <div className="flex items-center space-x-3">
                                    <img src={logoDataUri} alt="Logo KBV DV LYON" className="w-8 h-8 sm:w-10 sm:h-10" />
                                    <div>
                                        <h1 className="text-lg sm:text-xl font-bold font-display text-primary dark:text-white">{congregationProfile.name}</h1>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button onClick={() => setIsSearchModalOpen(true)} title="Rechercher" className="p-2 rounded-full text-text-main dark:text-text-main-dark hover:bg-gray-200 dark:hover:bg-primary-light transition-colors">
                                        <SearchIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </button>
                                    <button onClick={toggleTheme} title={isDarkMode ? "Activer le mode clair" : "Activer le mode sombre"} className="p-2 rounded-full text-text-main dark:text-text-main-dark hover:bg-gray-200 dark:hover:bg-primary-light transition-colors">
                                        {effectiveTheme === 'light' ? <MoonIcon className="w-5 h-5 sm:w-6 sm:h-6" /> : <SunIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </header>
                    <nav className="hidden md:block bg-card-light/95 dark:bg-card-dark/95 border-b border-border-light dark:border-border-dark shadow-sm">
                        <div className="flex items-center justify-around">
                            <TabButton icon={DashboardIcon} label="Tableau de bord" isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                            <TabButton icon={CalendarIcon} label="Planning" isActive={activeTab === 'planning'} onClick={() => setActiveTab('planning')} />
                            <TabButton icon={EnvelopeIcon} label="Messagerie" isActive={activeTab === 'messaging'} onClick={() => setActiveTab('messaging')} />
                            <TabButton icon={BookOpenIcon} label="Discours" isActive={activeTab === 'talks'} onClick={() => setActiveTab('talks')} />
                            <TabButton icon={CogIcon} label="Paramètres" isActive={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
                        </div>
                    </nav>
                    <nav className="md:hidden bg-card-light/95 dark:bg-card-dark/95 backdrop-blur-lg flex items-center justify-around border-b border-border-light dark:border-border-dark shadow-sm no-print">
                        <TabButton icon={DashboardIcon} label="Accueil" isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                        <TabButton icon={CalendarIcon} label="Planning" isActive={activeTab === 'planning'} onClick={() => setActiveTab('planning')} />
                        <TabButton icon={EnvelopeIcon} label="Messages" isActive={activeTab === 'messaging'} onClick={() => setActiveTab('messaging')} />
                        <TabButton icon={BookOpenIcon} label="Discours" isActive={activeTab === 'talks'} onClick={() => setActiveTab('talks')} />
                        <TabButton icon={CogIcon} label="Paramètres" isActive={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
                    </nav>
                </div>

                <main className="flex-grow overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    {activeTab === 'planning' && (
                        <div className="flex flex-col sm:flex-row justify-end items-center mb-4 gap-4 pt-4 sm:pt-0 no-print">
                             <div className="flex items-center rounded-lg p-1 bg-gray-200 dark:bg-primary-light/20">
                                <button onClick={() => setViewMode('cards')} title="Afficher en mode cartes" className={`px-3 py-1 text-sm font-semibold rounded-md flex items-center gap-2 ${viewMode === 'cards' ? 'bg-white dark:bg-card-dark shadow-md' : ''}`}>
                                   <DashboardIcon className="w-5 h-5" /> Cartes
                                </button>
                                <button onClick={() => setViewMode('list')} title="Afficher en mode liste" className={`px-3 py-1 text-sm font-semibold rounded-md flex items-center gap-2 ${viewMode === 'list' ? 'bg-white dark:bg-card-dark shadow-md' : ''}`}>
                                   <ListViewIcon className="w-5 h-5" /> Liste
                                </button>
                                <button onClick={() => setViewMode('calendar')} title="Afficher en mode calendrier" className={`px-3 py-1 text-sm font-semibold rounded-md flex items-center gap-2 ${viewMode === 'calendar' ? 'bg-white dark:bg-card-dark shadow-md' : ''}`}>
                                   <CalendarIcon className="w-5 h-5" /> Calendrier
                                </button>
                            </div>
                        </div>
                    )}
                    {renderContent()}
                </main>
            </div>
            
            {/* Modals are rendered here, outside of the main layout div to ensure they are on top of everything */}
            {isScheduleModalOpen && (
                <ScheduleVisitModal 
                    isOpen={isScheduleModalOpen}
                    onClose={() => setIsScheduleModalOpen(false)}
                    visit={editingVisit}
                    speaker={speakerToSchedule}
                    onComplete={handleCompleteVisit}
                />
            )}
            {isSpeakerDetailsModalOpen && (
                    <SpeakerDetailsModal 
                    isOpen={isSpeakerDetailsModalOpen}
                    onClose={() => setIsSpeakerDetailsModalOpen(false)}
                    speaker={selectedSpeaker}
                />
            )}
            {isMessageGeneratorModalOpen && messageModalData && (
                    <MessageGeneratorModal
                    isOpen={isMessageGeneratorModalOpen}
                    onClose={() => setIsMessageGeneratorModalOpen(false)}
                    visit={messageModalData.visit}
                    role={messageModalData.role}
                    language={messagingLanguage}
                    onLanguageChange={setMessagingLanguage}
                    messageType={messageModalData.messageType}
                />
            )}
            {isSearchModalOpen && (
                <GlobalSearchModal
                    isOpen={isSearchModalOpen}
                    onClose={() => setIsSearchModalOpen(false)}
                    onEditVisit={visit => { setIsSearchModalOpen(false); handleEditVisit(visit); }}
                    onEditSpeaker={speaker => { setIsSearchModalOpen(false); handleEditSpeaker(speaker); }}
                    onEditHost={host => { setIsSearchModalOpen(false); handleEditHost(host); }}
                />
            )}
            {isHostDetailsModalOpen && (
                <HostDetailsModal
                    isOpen={isHostDetailsModalOpen}
                    onClose={() => setIsHostDetailsModalOpen(false)}
                    host={selectedHost}
                />
            )}
                {isHostRequestModalOpen && (
                <HostRequestModal
                    isOpen={isHostRequestModalOpen}
                    onClose={() => setIsHostRequestModalOpen(false)}
                    visits={visitsForHostRequest}
                    language={messagingLanguage}
                    onLanguageChange={setMessagingLanguage}
                />
            )}
        </>
    );
};

export default App;