import React, { useMemo, useState, useRef } from 'react';
import { Visit, MessageRole, MessageType } from '../types';
import { useData } from '../contexts/DataContext';
import { 
    PlusIcon, 
    UserIcon, 
    HomeIcon, 
    CalendarDaysIcon, 
    CheckCircleIcon, 
    ArrowRightIcon,
    PrintIcon
} from './Icons';
import { PlanningAssistant } from './PlanningAssistant';
import { DashboardBarChart } from './DashboardBarChart';
import { PrintPreviewModal } from './PrintPreviewModal';
import { DashboardPrintLayout } from './DashboardPrintLayout';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import html2pdf from 'html2pdf.js';

interface DashboardProps {
    onScheduleVisitClick: () => void;
    onAddSpeakerClick: () => void;
    onAddHostClick: () => void;
    onEditVisitClick: (visit: Visit) => void;
    onOpenMessageGenerator: (visit: Visit, role: MessageRole, messageType?: MessageType) => void;
    onOpenHostRequestModal: (visits: Visit[]) => void;
    setActiveTab: (tab: 'planning' | 'messaging' | 'talks' | 'settings') => void;
    onGoToSpeakers: () => void;
    onGoToHosts: () => void;
    onGoToPlanning: () => void;
    onGoToSettings: () => void;
}

const QuickStatCard: React.FC<{ title: string; value: string | number; icon: React.FC<any>; color: string; onClick?: () => void; }> = ({ title, value, icon: Icon, color, onClick }) => (
    <div 
        onClick={onClick}
        className={`bg-card-light dark:bg-card-dark p-4 rounded-xl shadow-soft-lg flex items-center space-x-4 transition-transform transform active:scale-95 ${onClick ? 'cursor-pointer hover:scale-105' : ''}`}
    >
        <div className={`p-3 rounded-full ${color}`}>
            <Icon className="w-8 h-8 text-white" />
        </div>
        <div>
            <p className="text-3xl font-bold text-text-main dark:text-text-main-dark">{value}</p>
            <h3 className="text-sm font-medium text-text-muted dark:text-text-muted-dark">{title}</h3>
        </div>
    </div>
);

const ShortcutButton: React.FC<{ label: string; onClick: () => void; icon: React.FC<any>; }> = ({ label, onClick, icon: Icon }) => (
    <button
        onClick={onClick}
        className="flex items-center p-4 bg-white dark:bg-primary-light rounded-xl shadow-soft-lg w-full text-left hover:bg-gray-100 dark:hover:bg-primary transition-colors transform active:scale-95"
    >
        <div className="p-3 bg-secondary/10 dark:bg-secondary/20 rounded-lg">
            <Icon className="w-6 h-6 text-secondary dark:text-secondary" />
        </div>
        <span className="ml-4 font-semibold text-text-main dark:text-text-main-dark flex-grow">{label}</span>
        <ArrowRightIcon className="w-5 h-5 ml-auto text-text-muted dark:text-text-muted-dark" />
    </button>
);


export const Dashboard: React.FC<DashboardProps> = ({ 
    onScheduleVisitClick, 
    onAddSpeakerClick, 
    onAddHostClick, 
    onEditVisitClick, 
    onOpenMessageGenerator,
    onOpenHostRequestModal,
    setActiveTab,
    onGoToSpeakers,
    onGoToHosts,
    onGoToPlanning,
    onGoToSettings
}) => {
    const { hosts, speakers, archivedVisits, upcomingVisits, visits, congregationProfile } = useData();
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const dashboardContentRef = useRef<HTMLDivElement>(null);
    const isMobile = Capacitor.getPlatform() !== 'web';
    
    const allVisits = useMemo(() => [...upcomingVisits, ...archivedVisits], [upcomingVisits, archivedVisits]);
    
    const stats = [
        { title: "Orateurs", value: speakers.length, icon: UserIcon, color: "bg-accent", onClick: onGoToSpeakers },
        { title: "Contacts d'accueil", value: hosts.length, icon: HomeIcon, color: "bg-secondary", onClick: onGoToHosts },
        { title: "Visites à venir", value: upcomingVisits.length, icon: CalendarDaysIcon, color: "bg-highlight", onClick: onGoToPlanning },
        { title: "Visites archivées", value: archivedVisits.length, icon: CheckCircleIcon, color: "bg-primary", onClick: onGoToSettings },
    ];

    const handleSharePdf = async () => {
        if (!dashboardContentRef.current) return;

        const element = dashboardContentRef.current;
        const options = {
            margin: 10,
            filename: `Rapport_Tableau_de_Bord_${new Date().toLocaleDateString('fr-FR')}.pdf`,
            image: { type: 'jpeg' as 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as 'portrait' },
        };

        try {
            const pdfBase64 = await html2pdf().from(element).set(options).outputPdf('base64');
            const fileName = `Rapport_Tableau_de_Bord_${new Date().toISOString().slice(0,10)}.pdf`;

            await Share.share({
                title: 'Partager le rapport du tableau de bord',
                text: 'Voici le rapport de votre tableau de bord.',
                url: `data:application/pdf;base64,${pdfBase64}`,
                dialogTitle: 'Partager le PDF',
            });

            setIsPrintModalOpen(false);
        } catch (error) {
            console.error('Erreur lors de la génération ou du partage du PDF', error);
            alert('Impossible de générer ou de partager le PDF.');
        }
    };

    return (
        <>
            <div className="space-y-8">
                <div className="flex justify-between items-center animate-fade-in-down">
                    <div>
                        <h1 className="text-4xl font-extrabold font-display text-primary dark:text-white">Tableau de Bord</h1>
                        <p className="mt-2 text-lg text-text-muted dark:text-text-muted-dark">Bienvenue ! Voici un aperçu de votre activité.</p>
                    </div>
                    <button onClick={() => setIsPrintModalOpen(true)} className="flex-shrink-0 p-3 rounded-full text-text-main dark:text-text-main-dark hover:bg-gray-200 dark:hover:bg-primary-light transition-colors no-print" title="Imprimer le rapport du tableau de bord">
                        <PrintIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                     {stats.map((stat, index) => (
                        <QuickStatCard key={stat.title} {...stat} />
                    ))}
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-8 animate-fade-in-up opacity-0" style={{ animationDelay: '200ms' }}>
                        <PlanningAssistant
                            onOpenHostRequestModal={onOpenHostRequestModal}
                            onEditVisitClick={onEditVisitClick}
                        />
                    </div>
                    <div className="space-y-6 animate-fade-in-up opacity-0" style={{ animationDelay: '400ms' }}>
                        <h2 className="text-2xl font-bold text-text-main dark:text-text-main-dark">Raccourcis</h2>
                        <div className="space-y-4">
                            <ShortcutButton label="Programmer une visite" onClick={onScheduleVisitClick} icon={PlusIcon} />
                            <ShortcutButton label="Ajouter un orateur" onClick={onAddSpeakerClick} icon={UserIcon} />
                            <ShortcutButton label="Ajouter un contact d'accueil" onClick={onAddHostClick} icon={HomeIcon} />
                        </div>
                    </div>
                </div>
            </div>
            {isPrintModalOpen && (
                <PrintPreviewModal 
                    onClose={() => setIsPrintModalOpen(false)}
                    isMobile={isMobile}
                    onSharePdf={handleSharePdf}
                >
                    <DashboardPrintLayout 
                        speakers={speakers}
                        hosts={hosts}
                        upcomingVisits={upcomingVisits}
                        archivedVisits={archivedVisits}
                        congregationProfile={congregationProfile}
                    />
                </PrintPreviewModal>
            )}
        </>
    );
};