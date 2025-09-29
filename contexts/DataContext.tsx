import React, { createContext, useContext, useMemo, useCallback, ReactNode, useState, useEffect } from 'react';
import { Speaker, Visit, Host, CustomMessageTemplates, CustomHostRequestTemplates, Language, MessageType, MessageRole, TalkHistory, CongregationProfile, PublicTalk } from '../types';
import { initialSpeakers, initialHosts, UNASSIGNED_HOST, initialVisits, initialPublicTalks } from '../constants';
import { useToast } from './ToastContext';
import { encrypt, decrypt } from '../utils/crypto';
import { EncryptionPrompt } from '../components/EncryptionPrompt';
import { SpinnerIcon } from '../components/Icons';
import useOnlineStatus from '../hooks/useOnlineStatus';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

interface AppData {
  speakers: Speaker[];
  visits: Visit[];
  hosts: Host[];
  archivedVisits: Visit[];
  customTemplates: CustomMessageTemplates;
  customHostRequestTemplates: CustomHostRequestTemplates;
  congregationProfile: CongregationProfile;
  publicTalks: PublicTalk[];
}

const initialData: AppData = {
    speakers: initialSpeakers,
    visits: initialVisits,
    hosts: initialHosts,
    archivedVisits: [],
    customTemplates: {},
    customHostRequestTemplates: {},
    congregationProfile: {
        name: "KBV DV LYON .FP",
        subtitle: "Gestion des Orateurs Visiteurs",
        defaultTime: "14:30",
        hospitalityOverseer: "Pinto Francisco",
        hospitalityOverseerPhone: "+33777388914",
        backupPhoneNumber: "",
    },
    publicTalks: initialPublicTalks,
};


// Define the shape of the data and actions provided by the context.
interface DataContextType {
  appData: AppData | null;
  isEncrypted: boolean;
  isOnline: boolean;
  
  upcomingVisits: Visit[];
  pastUnarchivedVisits: Visit[];
  
  // Actions
  addSpeaker: (speakerData: Speaker) => void;
  updateSpeaker: (speakerData: Speaker) => void;
  deleteSpeaker: (speakerId: string) => void;
  addVisit: (visitData: Visit) => void;
  updateVisit: (visitData: Visit) => void;
  deleteVisit: (visitId: string) => void;
  completeVisit: (visit: Visit) => void;
  deleteArchivedVisit: (visitId: string) => void;
  addHost: (hostData: Host) => boolean;
  updateHost: (hostName: string, updatedData: Partial<Host>) => void;
  deleteHost: (hostName: string) => void;
  saveCustomTemplate: (language: Language, messageType: MessageType, role: MessageRole, text: string) => void;
  deleteCustomTemplate: (language: Language, messageType: MessageType, role: MessageRole) => void;
  saveCustomHostRequestTemplate: (language: Language, text: string) => void;
  deleteCustomHostRequestTemplate: (language: Language) => void;
  logCommunication: (visitId: string, messageType: MessageType, role: MessageRole) => void;
  updateCongregationProfile: (profile: CongregationProfile) => void;
  
  addTalk: (talkData: PublicTalk) => void;
  updateTalk: (talkNumber: string | number, updatedData: PublicTalk) => void;
  deleteTalk: (talkNumber: string | number) => void;
  updatePublicTalksList: (talksList: string) => void;
  
  exportData: () => void;
  importData: (data: any) => Promise<void>;
  resetData: () => void;
  
  enableEncryption: (password: string) => Promise<boolean>;
  disableEncryption: (password: string) => Promise<boolean>;

  syncWithGoogleSheet: () => Promise<void>;
  apiKey: string;

  mergeSpeakers: (primarySpeakerId: string, duplicateIds: string[]) => void;
  mergeHosts: (primaryHostName: string, duplicateNames: string[]) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { addToast } = useToast();
    const isOnline = useOnlineStatus();

    const [appData, setAppData] = useState<AppData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLocked, setIsLocked] = useState(false);
    const [isEncrypted, setIsEncrypted] = useState(false);
    const [sessionPassword, setSessionPassword] = useState<string | null>(null);

    // Initial load effect
    useEffect(() => {
        const encryptedFlag = localStorage.getItem('dataIsEncrypted') === 'true';
        setIsEncrypted(encryptedFlag);
        
        if (encryptedFlag) {
            setIsLocked(true);
        } else {
            try {
                const plainTextData = localStorage.getItem('appData');
                if (plainTextData) {
                    setAppData(JSON.parse(plainTextData));
                } else {
                    localStorage.setItem('appData', JSON.stringify(initialData));
                    setAppData(initialData);
                }
            } catch (error) {
                console.error("Error loading plaintext data:", error);
                addToast("Erreur de chargement des données. Réinitialisation.", "error");
                localStorage.setItem('appData', JSON.stringify(initialData));
                setAppData(initialData);
            }
        }
        setIsLoading(false);
    }, []);

    // Persist data on change effect
    useEffect(() => {
        if (!appData || isLoading) return;

        const saveDataToLocalStorage = async () => {
            try {
                if (isEncrypted && sessionPassword) {
                    const encryptedData = await encrypt(appData, sessionPassword);
                    localStorage.setItem('encryptedAppData', encryptedData);
                    localStorage.removeItem('appData');
                } else if (!isEncrypted) {
                    const plainTextData = JSON.stringify(appData);
                    localStorage.setItem('appData', plainTextData);
                    localStorage.removeItem('encryptedAppData');
                }
            } catch (error) {
                console.error("Error saving data to localStorage:", error);
                let userMessage = "Erreur critique de sauvegarde. Vos derniers changements pourraient ne pas être enregistrés.";
                if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.code === 22)) {
                    userMessage = "Erreur de sauvegarde : le stockage de votre navigateur est plein. Essayez de supprimer des photos ou des pièces jointes.";
                }
                addToast(userMessage, "error", 10000);
            }
        };

        saveDataToLocalStorage();
    }, [appData, isEncrypted, sessionPassword, isLoading, addToast]);

    const unlock = async (password: string): Promise<boolean> => {
        const encryptedData = localStorage.getItem('encryptedAppData');
        if (!encryptedData) {
            addToast("Aucune donnée chiffrée trouvée.", "error");
            return false;
        }
        try {
            const decryptedData = await decrypt<AppData>(encryptedData, password);
            setAppData(decryptedData);
            setSessionPassword(password);
            setIsLocked(false);
            addToast("Données déverrouillées.", "success");
            return true;
        } catch (error) {
            addToast("Mot de passe incorrect.", "error");
            return false;
        }
    };
    
    const enableEncryption = async (password: string): Promise<boolean> => {
        if (!appData) {
            addToast("Les données ne sont pas prêtes.", "error");
            return false;
        }
        try {
            const encryptedData = await encrypt(appData, password);
            localStorage.setItem('encryptedAppData', encryptedData);
            localStorage.setItem('dataIsEncrypted', 'true');
            localStorage.removeItem('appData');
            setIsEncrypted(true);
            setSessionPassword(password);
            addToast("Chiffrement activé avec succès.", "success");
            return true;
        } catch (error) {
            addToast("L'activation du chiffrement a échoué.", "error");
            return false;
        }
    };

    const disableEncryption = async (password: string): Promise<boolean> => {
        if (!appData) {
             addToast("Les données ne sont pas prêtes.", "error");
             return false;
        }
        try {
            // We need to re-verify the password by decrypting
            const encryptedData = localStorage.getItem('encryptedAppData');
            if (!encryptedData) throw new Error("No encrypted data found to decrypt.");
            await decrypt(encryptedData, password); // This will throw if password is wrong

            localStorage.setItem('appData', JSON.stringify(appData));
            localStorage.removeItem('encryptedAppData');
            localStorage.removeItem('dataIsEncrypted');
            setIsEncrypted(false);
            setSessionPassword(null);
            addToast("Chiffrement désactivé.", "success");
            return true;
        } catch (error) {
             addToast("Mot de passe incorrect. Le chiffrement ne peut pas être désactivé.", "error");
            return false;
        }
    };

    // Derived state, memoized for performance.
    const upcomingVisits = useMemo(() => {
        if (!appData) return [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return [...appData.visits]
            .filter(v => new Date(v.visitDate + 'T00:00:00') >= today)
            .sort((a, b) => new Date(a.visitDate + 'T00:00:00').getTime() - new Date(b.visitDate + 'T00:00:00').getTime());
    }, [appData]);
    
    const pastUnarchivedVisits = useMemo(() => {
        if (!appData) return [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(today.getDate() - 90);

        return [...appData.visits]
            .filter(v => {
                const visitDate = new Date(v.visitDate + 'T00:00:00');
                return visitDate < today && visitDate >= ninetyDaysAgo && v.status !== 'completed' && v.status !== 'cancelled';
            })
            .sort((a, b) => new Date(b.visitDate + 'T00:00:00').getTime() - new Date(a.visitDate + 'T00:00:00').getTime());
    }, [appData]);
    
    // --- Actions (refactored for single appData state) ---
    const updateAppData = (updater: (prev: AppData) => AppData) => {
        setAppData(prev => (prev ? updater(prev) : null));
    };

    const addSpeaker = (speakerData: Speaker) => {
        updateAppData(prev => ({
            ...prev,
            speakers: [...prev.speakers, speakerData].sort((a, b) => a.nom.localeCompare(b.nom))
        }));
        addToast("Orateur ajouté.", 'success');
    };

    const updateSpeaker = (speakerData: Speaker) => {
        updateAppData(prev => ({
            ...prev,
            speakers: prev.speakers.map(s => s.id === speakerData.id ? speakerData : s).sort((a, b) => a.nom.localeCompare(b.nom)),
            visits: prev.visits.map(v => v.id === speakerData.id ? { ...v, nom: speakerData.nom, congregation: speakerData.congregation, telephone: speakerData.telephone, photoUrl: speakerData.photoUrl } : v)
        }));
        addToast("Orateur mis à jour.", 'success');
    };

    const deleteSpeaker = (speakerId: string) => {
        const speakerToDelete = appData?.speakers.find(s => s.id === speakerId);
        if (!speakerToDelete) return;
        updateAppData(prev => ({
            ...prev,
            speakers: prev.speakers.filter(s => s.id !== speakerId),
            visits: prev.visits.filter(v => v.id !== speakerId)
        }));
        addToast(`"${speakerToDelete.nom}" et ses visites associées ont été supprimés.`, 'success');
    };

    const addVisit = (visitData: Visit) => {
        const visitWithStatus = { ...visitData, communicationStatus: {} };
        updateAppData(prev => ({ ...prev, visits: [...prev.visits, visitWithStatus] }));
        addToast("Visite programmée avec succès.", 'success');
    };
    
    const updateVisit = (visitData: Visit) => {
        updateAppData(prev => ({ ...prev, visits: prev.visits.map(v => v.visitId === visitData.visitId ? visitData : v) }));
        addToast("Visite mise à jour avec succès.", 'success');
    };
    
    const deleteVisit = (visitId: string) => {
        updateAppData(prev => ({ ...prev, visits: prev.visits.filter(v => v.visitId !== visitId) }));
        addToast("Visite supprimée.", 'success');
    };

    const completeVisit = (visit: Visit) => {
        updateAppData(prev => {
            const newSpeakers = prev.speakers.map(s => {
                if (s.id === visit.id) {
                    const newHistoryEntry: TalkHistory = { date: visit.visitDate, talkNo: visit.talkNoOrType, theme: visit.talkTheme };
                    const newTalkHistory = [...(s.talkHistory || []), newHistoryEntry];
                    const uniqueHistory = Array.from(new Set(newTalkHistory.map(h => h.date)))
                        .map(date => newTalkHistory.find(h => h.date === date)!)
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    return { ...s, talkHistory: uniqueHistory };
                }
                return s;
            });
            return {
                ...prev,
                speakers: newSpeakers,
                archivedVisits: [visit, ...prev.archivedVisits],
                visits: prev.visits.filter(v => v.visitId !== visit.visitId)
            };
        });
        addToast(`Visite de ${visit.nom} marquée comme terminée et archivée.`, 'success');
    };

    const deleteArchivedVisit = (visitId: string) => {
        updateAppData(prev => ({ ...prev, archivedVisits: prev.archivedVisits.filter(v => v.visitId !== visitId) }));
        addToast("Visite supprimée définitivement de l'archive.", 'info');
    };

    const addHost = (newHost: Host): boolean => {
        if (newHost.nom && !appData?.hosts.some(h => h.nom.toLowerCase() === newHost.nom.toLowerCase())) {
            updateAppData(prev => ({ ...prev, hosts: [...prev.hosts, newHost].sort((a, b) => a.nom.localeCompare(b.nom)) }));
            return true;
        }
        return false;
    };
    
    const updateHost = (hostName: string, updatedData: Partial<Host>) => {
        updateAppData(prev => {
            const newHosts = prev.hosts.map(h => h.nom === hostName ? { ...h, ...updatedData } : h).sort((a,b) => a.nom.localeCompare(b.nom));
            let newVisits = prev.visits;
            let newArchived = prev.archivedVisits;
            if (updatedData.nom && updatedData.nom !== hostName) {
                newVisits = prev.visits.map(v => v.host === hostName ? { ...v, host: updatedData.nom! } : v);
                newArchived = prev.archivedVisits.map(v => v.host === hostName ? { ...v, host: updatedData.nom! } : v);
            }
            return { ...prev, hosts: newHosts, visits: newVisits, archivedVisits: newArchived };
        });
        addToast(`Informations pour "${updatedData.nom || hostName}" mises à jour.`, 'info');
    };

    const deleteHost = (hostName: string) => {
        const assignedVisits = appData?.visits.filter(v => v.host === hostName && v.status !== 'cancelled');
        updateAppData(prev => ({
            ...prev,
            hosts: prev.hosts.filter(h => h.nom !== hostName),
            visits: assignedVisits && assignedVisits.length > 0
                ? prev.visits.map(v => v.host === hostName ? { ...v, host: UNASSIGNED_HOST } : v)
                : prev.visits
        }));
        if (assignedVisits && assignedVisits.length > 0) {
            addToast(`"${hostName}" supprimé. ${assignedVisits.length} visite(s) associée(s) ont été mises à jour.`, 'success');
        } else {
            addToast(`"${hostName}" a été supprimé.`, 'success');
        }
    };
    
    const logCommunication = (visitId: string, messageType: MessageType, role: MessageRole) => {
        updateAppData(prev => {
            let confirmedToast = false;
            const newVisits = prev.visits.map(v => {
                if (v.visitId === visitId) {
                    const now = new Date().toISOString();
                    const updatedStatus = JSON.parse(JSON.stringify(v.communicationStatus || {}));
                    if (!updatedStatus[messageType]) updatedStatus[messageType] = {};
                    updatedStatus[messageType]![role] = now;
                    const newStatus = (messageType === 'preparation' && role === 'host' && v.status === 'pending') ? 'confirmed' : v.status;
                    if (newStatus === 'confirmed' && v.status === 'pending') confirmedToast = true;
                    return { ...v, communicationStatus: updatedStatus, status: newStatus };
                }
                return v;
            });
            if(confirmedToast) addToast("Statut de la visite mis à 'Confirmé'.", 'success');
            return { ...prev, visits: newVisits };
        });
    };

    const saveCustomTemplate = (language: Language, messageType: MessageType, role: MessageRole, text: string) => {
        updateAppData(prev => {
            const newTemplates = JSON.parse(JSON.stringify(prev.customTemplates));
            if (!newTemplates[language]) newTemplates[language] = {};
            if (!newTemplates[language]![messageType]) newTemplates[language]![messageType] = {};
            newTemplates[language]![messageType]![role] = text;
            return { ...prev, customTemplates: newTemplates };
        });
        addToast("Modèle de message sauvegardé !", 'success');
    };
    
    const deleteCustomTemplate = (language: Language, messageType: MessageType, role: MessageRole) => {
        updateAppData(prev => {
            const newTemplates = JSON.parse(JSON.stringify(prev.customTemplates));
            if (newTemplates[language]?.[messageType]?.[role]) {
                delete newTemplates[language]![messageType]![role];
                if (Object.keys(newTemplates[language]![messageType]!).length === 0) delete newTemplates[language]![messageType];
                if (Object.keys(newTemplates[language]!).length === 0) delete newTemplates[language];
            }
            return { ...prev, customTemplates: newTemplates };
        });
        addToast("Modèle par défaut restauré.", 'info');
    };

    const saveCustomHostRequestTemplate = (language: Language, text: string) => {
        updateAppData(prev => ({ ...prev, customHostRequestTemplates: { ...prev.customHostRequestTemplates, [language]: text } }));
        addToast("Modèle de message de demande d'accueil sauvegardé !", 'success');
    };

    const deleteCustomHostRequestTemplate = (language: Language) => {
        updateAppData(prev => {
            const newTemplates = { ...prev.customHostRequestTemplates };
            delete newTemplates[language];
            return { ...prev, customHostRequestTemplates: newTemplates };
        });
        addToast("Modèle par défaut restauré pour la demande d'accueil.", 'info');
    };
    
    const updateCongregationProfile = (profile: CongregationProfile) => {
        updateAppData(prev => ({...prev, congregationProfile: profile }));
        addToast("Profil de la congrégation mis à jour.", 'success');
    };

    const addTalk = (talkData: PublicTalk) => {
        updateAppData(prev => {
            if (prev.publicTalks.some(t => t.number === talkData.number)) {
                addToast(`Le discours n°${talkData.number} existe déjà.`, 'error');
                return prev;
            }
            const newTalks = [...prev.publicTalks, talkData].sort((a, b) => {
                const numA = typeof a.number === 'string' ? Infinity : a.number;
                const numB = typeof b.number === 'string' ? Infinity : b.number;
                if (numA === Infinity && numB === Infinity) {
                    return String(a.number).localeCompare(String(b.number));
                }
                return numA - numB;
            });
            addToast(`Discours n°${talkData.number} ajouté.`, 'success');
            return { ...prev, publicTalks: newTalks };
        });
    };

    const updateTalk = (talkNumber: string | number, updatedData: PublicTalk) => {
        updateAppData(prev => {
            const talkExists = prev.publicTalks.some(t => t.number === updatedData.number && t.number !== talkNumber);
            if (talkExists) {
                addToast(`Le discours n°${updatedData.number} existe déjà.`, 'error');
                return prev;
            }
            const newTalks = prev.publicTalks.map(t => (t.number === talkNumber ? updatedData : t)).sort((a, b) => {
                const numA = typeof a.number === 'string' ? Infinity : a.number;
                const numB = typeof b.number === 'string' ? Infinity : b.number;
                if (numA === Infinity && numB === Infinity) {
                    return String(a.number).localeCompare(String(b.number));
                }
                return numA - numB;
            });
            addToast(`Discours n°${updatedData.number} mis à jour.`, 'success');
            return { ...prev, publicTalks: newTalks };
        });
    };

    const deleteTalk = (talkNumber: string | number) => {
        const allVisits = [...(appData?.visits || []), ...(appData?.archivedVisits || [])];
        const isTalkAssigned = allVisits.some(v => v.talkNoOrType === talkNumber.toString());

        if (isTalkAssigned) {
            addToast(`Impossible de supprimer le discours n°${talkNumber} car il est assigné à une ou plusieurs visites.`, 'error');
            return;
        }

        updateAppData(prev => ({
            ...prev,
            publicTalks: prev.publicTalks.filter(t => t.number !== talkNumber),
        }));
        addToast(`Discours n°${talkNumber} supprimé.`, 'success');
    };
    
    const updatePublicTalksList = (talksList: string) => {
        let addedCount = 0;
        let updatedCount = 0;

        updateAppData(prev => {
            const talkMap = new Map<string | number, PublicTalk>();
            prev.publicTalks.forEach(t => talkMap.set(t.number, t));

            const lines = talksList.split('\n').filter(line => line.trim());
            const talkRegex = /^(\d+)\.?\s+(.+)$/;

            lines.forEach(line => {
                const match = line.trim().match(talkRegex);
                if (match) {
                    const number = parseInt(match[1], 10);
                    const theme = match[2].trim();
                    const existing = talkMap.get(number);

                    if (existing) {
                        if (existing.theme !== theme) {
                            existing.theme = theme;
                            updatedCount++;
                        }
                    } else {
                        talkMap.set(number, { number, theme });
                        addedCount++;
                    }
                }
            });

            const finalTalks = Array.from(talkMap.values()).sort((a, b) => {
                const numA = typeof a.number === 'string' ? Infinity : a.number;
                const numB = typeof b.number === 'string' ? Infinity : b.number;
                if (numA === Infinity && numB === Infinity) {
                    return String(a.number).localeCompare(String(b.number));
                }
                return numA - numB;
            });
    
          return { ...prev, publicTalks: finalTalks };
        });
    
        addToast(`${addedCount} discours ajoutés et ${updatedCount} mis à jour.`, 'success');
    };

    const downloadFallback = useCallback((blob: Blob, fileName: string) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, []);

    const exportData = useCallback(async () => {
        if (!appData) return;
        const jsonData = JSON.stringify(appData, null, 2);
        const date = new Date().toISOString().slice(0, 10);
        const fileName = `gestion_visiteurs_tj_backup_${date}.json`;

        if (Capacitor.isNativePlatform()) {
            try {
                const result = await Filesystem.requestPermissions();
                if (result.publicStorage === 'denied') {
                    addToast("Permission de stockage refusée. Impossible de sauvegarder.", 'error');
                    return;
                }
                await Filesystem.writeFile({
                    path: fileName,
                    data: jsonData,
                    directory: Directory.Documents,
                    encoding: Encoding.UTF8,
                });
                addToast(`Sauvegarde enregistrée dans le dossier Documents: ${fileName}`, 'success');
            } catch (error) {
                console.error('Erreur lors de la sauvegarde sur l\'appareil natif', error);
                addToast(`Erreur lors de la sauvegarde sur l'appareil : ${error instanceof Error ? error.message : String(error)}`, 'error');
            }
        } else {
            const blob = new Blob([jsonData], { type: 'application/json' });
            downloadFallback(blob, fileName);
            addToast("Téléchargement de la sauvegarde démarré.", 'success');
        }
    }, [appData, addToast, downloadFallback]);

    const importData = async (data: any) => {
        if (!data.speakers || !data.visits || !data.hosts) {
            throw new Error("Fichier de sauvegarde non valide ou corrompu.");
        }
        if (!appData) {
            addToast("Les données actuelles ne sont pas chargées, impossible de fusionner.", "error");
            return;
        }
    
        addToast("Fusion des données en cours...", "info");
    
        const unifyByName = <T extends { nom: string }>(current: T[], imported: T[]): T[] => {
            const map = new Map<string, T>();
            current.forEach(item => map.set(item.nom.toLowerCase().trim(), item));
            (imported || []).forEach(item => map.set(item.nom.toLowerCase().trim(), item));
            return Array.from(map.values());
        };
        const finalSpeakers = unifyByName(appData.speakers, (data.speakers || []) as Speaker[]);
        const finalHosts = unifyByName(appData.hosts, (data.hosts || []) as Host[]);
    
        const speakerNameToInfoMap = new Map<string, Speaker>();
        finalSpeakers.forEach(s => speakerNameToInfoMap.set(s.nom.toLowerCase().trim(), s));
        
        const visitKey = (v: Visit) => v.visitDate;
        const visitMap = new Map<string, { visit: Visit; isArchived: boolean }>();
    
        appData.visits.forEach(v => visitMap.set(visitKey(v), { visit: v, isArchived: false }));
        appData.archivedVisits.forEach(v => visitMap.set(visitKey(v), { visit: v, isArchived: true }));
        
        (data.visits || []).forEach((v: Visit) => visitMap.set(visitKey(v), { visit: v, isArchived: false }));
        (data.archivedVisits || []).forEach((v: Visit) => visitMap.set(visitKey(v), { visit: v, isArchived: true }));
        
        const finalVisits: Visit[] = [];
        const finalArchivedVisits: Visit[] = [];
    
        visitMap.forEach(({ visit, isArchived }) => {
            const speakerInfo = speakerNameToInfoMap.get(visit.nom.toLowerCase().trim());
            if (speakerInfo) {
                const finalVisit: Visit = {
                    ...visit,
                    id: speakerInfo.id,
                    nom: speakerInfo.nom,
                    congregation: speakerInfo.congregation,
                    telephone: speakerInfo.telephone,
                    photoUrl: speakerInfo.photoUrl,
                };
    
                if (isArchived) {
                    finalArchivedVisits.push(finalVisit);
                } else {
                    finalVisits.push(finalVisit);
                }
            } else {
                // If speaker not found in unified list (e.g. name changed), keep original visit
                 if (isArchived) {
                    finalArchivedVisits.push(visit);
                } else {
                    finalVisits.push(visit);
                }
            }
        });
    
        const unifyTalks = (current: PublicTalk[], imported: PublicTalk[]): PublicTalk[] => {
            const map = new Map<string | number, PublicTalk>();
            current.forEach(item => map.set(item.number, item));
            (imported || []).forEach(item => map.set(item.number, item));
            return Array.from(map.values());
        };
        const finalTalks = unifyTalks(appData.publicTalks, data.publicTalks || []);
    
        const newAppData: AppData = {
            speakers: finalSpeakers.sort((a, b) => a.nom.localeCompare(b.nom)),
            hosts: finalHosts.sort((a, b) => a.nom.localeCompare(b.nom)),
            visits: finalVisits,
            archivedVisits: finalArchivedVisits,
            congregationProfile: data.congregationProfile || appData.congregationProfile,
            customTemplates: data.customTemplates || appData.customTemplates,
            customHostRequestTemplates: data.customHostRequestTemplates || appData.customHostRequestTemplates,
            publicTalks: finalTalks,
        };
    
        setAppData(newAppData);
        addToast("Les données ont été fusionnées intelligemment pour éviter les doublons !", 'success');
    };

    const resetData = () => {
        setAppData(initialData);
        addToast("Toutes les données ont été réinitialisées.", 'success');
    };

    const parseDate = (dateStr: string): Date | null => {
        if (!dateStr) return null;
        let date: Date | undefined;
        if (dateStr.includes('/')) {
            const parts = dateStr.split('/');
            if (parts.length === 3) {
                // Assuming DD/MM/YYYY
                date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            }
        } else if (dateStr.includes('-')) {
            // Assuming YYYY-MM-DD
            date = new Date(dateStr + 'T00:00:00');
        }

        if (date && !isNaN(date.getTime())) {
            return date;
        }
        return null;
    };

    const apiKey = (typeof process !== 'undefined' && process.env?.API_KEY) ? process.env.API_KEY : '';

    const syncWithGoogleSheet = async (): Promise<void> => {
        if (!appData) return;
        
        const googleSheetId = '1drIzPPi6AohCroSyUkF1UmMFxuEtMACBF4XATDjBOcg';
        const googleSheetRange = 'Planning!A:E';

        const rangeParts = googleSheetRange.split('!');
        const [sheetName, range] = rangeParts;

        const url = `https://docs.google.com/spreadsheets/d/${googleSheetId}/gviz/tq?sheet=${encodeURIComponent(sheetName)}&range=${encodeURIComponent(range)}&tqx=out:json`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Erreur ${response.status}: Impossible de récupérer les données. Vérifiez que la feuille est partagée publiquement.`);
            }
            
            const rawText = await response.text();
            const jsonMatch = rawText.match(/google\.visualization\.Query\.setResponse\((.*)\)/);
            if (!jsonMatch || !jsonMatch[1]) {
                throw new Error("Réponse de l'API Google Visualization invalide.");
            }
            const data = JSON.parse(jsonMatch[1]);


            if (data.status === 'error') {
                throw new Error(data.errors.map((e: any) => e.detailed_message).join(', '));
            }

            const rows = data.table.rows;
            const cols = data.table.cols;

            if (!rows || rows.length === 0) {
                addToast("Aucune donnée trouvée dans la feuille de calcul (après les en-têtes).", 'warning');
                return;
            }

            const headers = cols.map((h: any) => h.label.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, ''));
            const dateIndex = headers.findIndex(h => h.includes('data'));
            const speakerIndex = headers.findIndex(h => h.includes('orador'));
            const congIndex = headers.findIndex(h => h.includes('kongregason'));
            const talkNoIndex = headers.findIndex(h => h.includes('n'));
            const themeIndex = headers.findIndex(h => h.includes('tema'));

            if ([dateIndex, speakerIndex, congIndex].some(i => i === -1)) {
                addToast("En-têtes requis manquants: Data, Orador, Kongregason.", 'error');
                return;
            }

            let addedCount = 0, updatedCount = 0, skippedCount = 0;
            const addedVisitsDetails: string[] = [];
            const updatedVisitsDetails: string[] = [];

            updateAppData(prev => {
                const newSpeakers = [...prev.speakers];
                const newVisits = [...prev.visits];
                const speakerMap = new Map(newSpeakers.map(s => [s.nom.toLowerCase(), s]));

                for (const row of rows) {
                    const cells = row.c;
                    const dateValue = cells[dateIndex]?.v;
                    let visitDateObj: Date | null = null;

                    if (typeof dateValue === 'string' && dateValue.startsWith('Date(')) {
                        const dateParts = dateValue.substring(5, dateValue.length - 1).split(',');
                        visitDateObj = new Date(Number(dateParts[0]), Number(dateParts[1]), Number(dateParts[2]));
                    } else if (typeof dateValue === 'string') {
                        visitDateObj = parseDate(dateValue);
                    }

                    const speakerName = cells[speakerIndex]?.v?.trim();
                    const congregation = cells[congIndex]?.v?.trim() || '';
                    
                    if (!visitDateObj || !speakerName) {
                        skippedCount++;
                        continue;
                    }

                    // Timezone-safe date formatting
                    const year = visitDateObj.getFullYear();
                    const month = String(visitDateObj.getMonth() + 1).padStart(2, '0');
                    const day = String(visitDateObj.getDate()).padStart(2, '0');
                    const formattedDate = `${year}-${month}-${day}`;
                    
                    const displayDate = visitDateObj.toLocaleDateString('fr-FR');

                    let speaker = speakerMap.get(speakerName.toLowerCase());
                    if (!speaker) {
                        speaker = { id: crypto.randomUUID(), nom: speakerName, congregation: congregation || 'À définir', talkHistory: [], gender: 'male' };
                        newSpeakers.push(speaker);
                        speakerMap.set(speakerName.toLowerCase(), speaker);
                    } else if (speaker.congregation !== congregation && congregation) {
                        // Update congregation if it differs
                        speaker.congregation = congregation;
                    }

                    const existingVisitIndex = newVisits.findIndex(v => v.nom.toLowerCase() === speakerName.toLowerCase() && v.visitDate === formattedDate);

                    const talkNoValue = talkNoIndex > -1 ? (cells[talkNoIndex]?.v !== null ? String(cells[talkNoIndex]?.v) : null) : null;
                    const themeValue = themeIndex > -1 ? (cells[themeIndex]?.v !== null ? String(cells[themeIndex]?.v) : null) : null;


                    if (existingVisitIndex > -1) {
                        const existingVisit = newVisits[existingVisitIndex];
                        const updates: string[] = [];
                        
                        if (existingVisit.id !== speaker.id) {
                            existingVisit.id = speaker.id;
                            existingVisit.nom = speaker.nom;
                            existingVisit.telephone = speaker.telephone;
                            existingVisit.photoUrl = speaker.photoUrl;
                            updates.push("Orateur");
                        }
                        
                        if (congregation && existingVisit.congregation !== congregation) {
                            existingVisit.congregation = congregation;
                            updates.push("Congrégation");
                        }
                        if (talkNoIndex > -1 && existingVisit.talkNoOrType !== talkNoValue) {
                            existingVisit.talkNoOrType = talkNoValue;
                            updates.push("N° Discours");
                        }
                        if (themeIndex > -1 && existingVisit.talkTheme !== themeValue) {
                            existingVisit.talkTheme = themeValue;
                            updates.push("Thème");
                        }

                        if (updates.length > 0) {
                            updatedCount++;
                            updatedVisitsDetails.push(`- ${speaker.nom} (${displayDate}): ${updates.join(', ')}`);
                        }
                    } else {
                        const newVisit: Visit = {
                            id: speaker.id, nom: speaker.nom, congregation, telephone: speaker.telephone, photoUrl: speaker.photoUrl,
                            visitId: crypto.randomUUID(), visitDate: formattedDate, visitTime: prev.congregationProfile.defaultTime,
                            host: congregation.toLowerCase().includes('zoom') || congregation.toLowerCase().includes('streaming') ? 'N/A' : UNASSIGNED_HOST,
                            accommodation: '', meals: '', status: 'pending',
                            locationType: congregation.toLowerCase().includes('zoom') ? 'zoom' : congregation.toLowerCase().includes('streaming') ? 'streaming' : 'physical',
                            talkNoOrType: talkNoValue,
                            talkTheme: themeValue,
                            communicationStatus: {},
                        };
                        newVisits.push(newVisit);
                        addedCount++;
                        addedVisitsDetails.push(`- ${newVisit.nom} (${displayDate})`);
                    }
                }
                return { ...prev, speakers: newSpeakers, visits: newVisits };
            });

            let toastMessage = `Synchronisation terminée !\n- ${addedCount} visite(s) ajoutée(s)\n- ${updatedCount} visite(s) mise(s) à jour\n- ${skippedCount} ligne(s) ignorée(s)`;
            if (addedVisitsDetails.length > 0) {
                toastMessage += `\n\nAjouts:\n${addedVisitsDetails.join('\n')}`;
            }
            if (updatedVisitsDetails.length > 0) {
                toastMessage += `\n\nMises à jour:\n${updatedVisitsDetails.join('\n')}`;
            }
            localStorage.setItem('lastGoogleSheetSync', new Date().toISOString());
            addToast(toastMessage, 'success', 15000);

        } catch (error) {
            console.error("Error syncing with Google Sheet:", error);
            addToast(`Erreur de synchronisation: ${error instanceof Error ? error.message : 'Inconnue'}.`, 'error');
        }
    };

    const mergeSpeakers = (primarySpeakerId: string, duplicateIds: string[]) => {
        updateAppData(prev => {
            const primarySpeaker = prev.speakers.find(s => s.id === primarySpeakerId);
            if (!primarySpeaker) {
                addToast("Erreur : l'orateur principal n'a pas été trouvé.", 'error');
                return prev;
            }
    
            const newVisits = prev.visits.map(v => {
                if (duplicateIds.includes(v.id)) {
                    return { ...v, id: primarySpeaker.id, nom: primarySpeaker.nom, congregation: primarySpeaker.congregation, telephone: primarySpeaker.telephone, photoUrl: primarySpeaker.photoUrl };
                }
                return v;
            });
    
            const newArchivedVisits = prev.archivedVisits.map(v => {
                if (duplicateIds.includes(v.id)) {
                    return { ...v, id: primarySpeaker.id, nom: primarySpeaker.nom, congregation: primarySpeaker.congregation, telephone: primarySpeaker.telephone, photoUrl: primarySpeaker.photoUrl };
                }
                return v;
            });
    
            const newSpeakers = prev.speakers.filter(s => !duplicateIds.includes(s.id));
    
            return {
                ...prev,
                speakers: newSpeakers,
                visits: newVisits,
                archivedVisits: newArchivedVisits,
            };
        });
        addToast("Orateurs fusionnés avec succès.", "success");
    };

    const mergeHosts = (primaryHostName: string, duplicateNames: string[]) => {
        updateAppData(prev => {
            const newVisits = prev.visits.map(v => {
                if (duplicateNames.includes(v.host)) {
                    return { ...v, host: primaryHostName };
                }
                return v;
            });
    
            const newArchivedVisits = prev.archivedVisits.map(v => {
                if (duplicateNames.includes(v.host)) {
                    return { ...v, host: primaryHostName };
                }
                return v;
            });
    
            const newHosts = prev.hosts.filter(h => !duplicateNames.includes(h.nom));
    
            return {
                ...prev,
                hosts: newHosts,
                visits: newVisits,
                archivedVisits: newArchivedVisits,
            };
        });
        addToast("Contacts d'accueil fusionnés avec succès.", "success");
    };
    
    const value: DataContextType = {
        appData,
        isEncrypted,
        isOnline,
        upcomingVisits,
        pastUnarchivedVisits,
        addSpeaker, updateSpeaker, deleteSpeaker,
        addVisit, updateVisit, deleteVisit, completeVisit, deleteArchivedVisit,
        addHost, updateHost, deleteHost,
        saveCustomTemplate, deleteCustomTemplate, saveCustomHostRequestTemplate, deleteCustomHostRequestTemplate,
        logCommunication, exportData, importData, resetData,
        enableEncryption, disableEncryption,
        updateCongregationProfile,
        syncWithGoogleSheet,
        addTalk, updateTalk, deleteTalk, updatePublicTalksList,
        apiKey,
        mergeSpeakers,
        mergeHosts,
    };
    
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-light dark:bg-dark">
                <SpinnerIcon className="w-12 h-12 text-primary" />
            </div>
        );
    }

    if (isLocked) {
        return <EncryptionPrompt mode="unlock" onUnlock={unlock} />;
    }

    if (!appData) {
        // This case should ideally not be hit if logic is correct, but it's a safe fallback.
        return (
            <div className="flex items-center justify-center h-screen bg-light dark:bg-dark">
                <p>Erreur critique lors du chargement des données.</p>
            </div>
        );
    }

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) throw new Error('useData must be used within a DataProvider');
    if (context.appData === null) throw new Error('useData cannot be used before data is loaded/unlocked');

    // Create stable references for derived data using the appData object
    const { speakers, visits, hosts, archivedVisits, customTemplates, customHostRequestTemplates, congregationProfile, publicTalks } = context.appData;

    return {
        ...context,
        speakers,
        visits,
        hosts,
        archivedVisits,
        customTemplates,
        customHostRequestTemplates,
        congregationProfile,
        publicTalks,
    };
};