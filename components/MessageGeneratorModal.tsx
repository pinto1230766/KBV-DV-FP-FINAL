import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Visit, Language, MessageType, MessageRole } from '../types';
import { messageTemplates } from '../constants';
import { XIcon, CopyIcon, WhatsAppIcon, ChevronDownIcon, SaveIcon, ArrowUturnLeftIcon, SparklesIcon, SpinnerIcon, EditIcon, CheckIcon } from './Icons';
import { useToast } from '../contexts/ToastContext';
import { useData } from '../contexts/DataContext';
import { LanguageSelector } from './LanguageSelector';
import { GoogleGenAI } from '@google/genai';

interface MessageGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  visit: Visit;
  role: MessageRole;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  messageType?: MessageType;
}

const formatFullDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

export const MessageGeneratorModal: React.FC<MessageGeneratorModalProps> = ({
  isOpen,
  onClose,
  visit,
  role,
  language,
  onLanguageChange,
  messageType: initialMessageType
}) => {
  const { speakers, hosts, customTemplates, saveCustomTemplate, deleteCustomTemplate, logCommunication, apiKey, congregationProfile } = useData();
  const { addToast } = useToast();
  
  const speaker = speakers.find(s => s.id === visit.id);
  const host = hosts.find(h => h.nom === visit.host);
  const currentRecipient = role === 'speaker' ? speaker : host;

  const isLocalSpeaker = useMemo(() => visit.congregation.toLowerCase().includes('lyon'), [visit.congregation]);
  const isRemoteVisit = useMemo(() => visit.locationType === 'zoom' || visit.locationType === 'streaming', [visit.locationType]);
  const isSpecialVisitType = isLocalSpeaker || isRemoteVisit;

  const [messageType, setMessageType] = useState<MessageType>(
    initialMessageType 
      ? initialMessageType 
      : isSpecialVisitType ? 'thanks' : 'confirmation'
  );
  const [messageText, setMessageText] = useState('');
  const [copied, setCopied] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [editedTemplateText, setEditedTemplateText] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  
  const getTemplate = useCallback((lang: Language, type: MessageType, r: MessageRole) => {
      const custom = customTemplates[lang]?.[type]?.[r];
      const defaultTpl = messageTemplates[lang]?.[type]?.[r] || "Modèle non disponible.";
      return { template: custom || defaultTpl, isCustom: !!custom };
  }, [customTemplates]);


  const generateMessage = useCallback((templateText: string) => {
    let generated = templateText;
    const speakerGender = speaker?.gender || 'male';
    const hostGender = host?.gender || 'male';

    const isFirstCommunication = !visit.communicationStatus || Object.keys(visit.communicationStatus).length === 0;

    if (messageType === 'confirmation' && role === 'speaker' && isFirstCommunication) {
        const introductionFR = "\nJe suis le responsable de l'accueil pour le groupe capverdien de Lyon.";
        const introductionCV = "\nMi é responsavel pa akolhimentu na grupu kabuverdianu di Lyon.";
        const intro = language === 'fr' ? introductionFR : introductionCV;
        generated = generated.replace(/{firstTimeIntroduction}/g, intro);
    } else {
        generated = generated.replace(/{firstTimeIntroduction}/g, '');
    }

    if (speakerGender === 'female') {
        generated = generated.replace(/Bonjour Frère/g, 'Bonjour Sœur');
        generated = generated.replace(/Frère \*{speakerName}\*/g, 'Sœur *{speakerName}*');
        generated = generated.replace(/notre orateur invité, Frère/g, 'notre oratrice invitée, Sœur');
        generated = generated.replace(/Olá, Irmon/g, 'Olá, Irmã');
        generated = generated.replace(/Irmon \*{speakerName}\*/g, 'Irmã *{speakerName}*');
    }
    
    if (host) {
        if (hostGender === 'female') {
            generated = generated.replace(/Bonjour Frère {hostName}/g, 'Bonjour Sœur {hostName}');
            generated = generated.replace(/notre frère/g, 'notre sœur');
            generated = generated.replace(/grâce à des frères comme toi/g, 'grâce à des sœurs comme toi');
            generated = generated.replace(/Olá, Irmon {hostName}/g, 'Olá, Irmã {hostName}');
            generated = generated.replace(/nos irmun/g, 'nos irmã');
            generated = generated.replace(/a irmuns sima bo/g, 'a irmãs sima bo');
        } else if (hostGender === 'couple') {
            generated = generated.replace(/Frère {hostName}/g, '{hostName}');
            generated = generated.replace(/Irmun {hostName}/g, '{hostName}');
            generated = generated.replace(/notre frère/g, 'nos frères');
            generated = generated.replace(/nos irmun/g, 'nos irmuns');
            
            const coupleReplacements = { "J'espère que tu vas bien": "J'espère que vous allez bien", "Je te contacte": "Je vous contacte", "Merci de t'être porté volontaire": "Merci de vous être portés volontaires", "Peux-tu prendre contact": "Pouvez-vous prendre contact", "Fais-moi savoir si tu as": "Faites-moi savoir si vous avez", "ton hospitalité": "votre hospitalité", "ton aide": "votre aide", "Tout est en ordre de ton côté": "Tout est en ordre de votre côté", "N ta spera ma bu sta dretu": "N ta spera ma nhos sta dretu", "N sta kontakta-u": "N sta kontakta-nhos", "Obrigadu pa bu voluntariadu": "Obrigadu pa nhos voluntariadu", "Bu pode entra en kontaktu": "Nhos pode entra en kontaktu", "Aviza-m si bu tiver": "Aviza-m si nhos tiver", "pa bu ospitalidadi": "pa nhos ospitalidadi", "pa bu ajuda": "pa nhos ajuda", "di bu ladu": "di nhos ladu" };
            for (const [key, value] of Object.entries(coupleReplacements)) {
                generated = generated.replace(new RegExp(key, 'g'), value);
            }
        }
    }

    generated = generated.replace(/{speakerName}/g, visit.nom);
    generated = generated.replace(/{hostName}/g, visit.host);
    generated = generated.replace(/{visitDate}/g, formatFullDate(visit.visitDate));
    generated = generated.replace(/{visitTime}/g, visit.visitTime);
    generated = generated.replace(/{speakerPhone}/g, speaker?.telephone || '(non renseigné)');
    generated = generated.replace(/{hostPhone}/g, host?.telephone || '(non renseigné)');
    generated = generated.replace(/{hostAddress}/g, host?.address || '(non renseignée)');
    generated = generated.replace(/{hospitalityOverseer}/g, congregationProfile.hospitalityOverseer || '');
    generated = generated.replace(/{hospitalityOverseerPhone}/g, congregationProfile.hospitalityOverseerPhone || '');
    
    return generated;
  }, [visit, speaker, host, messageType, role, language, congregationProfile]);


  const loadMessage = useCallback(() => {
      const { template, isCustom: custom } = getTemplate(language, messageType, role);
      const generated = generateMessage(template);
      setMessageText(generated);
      setEditedTemplateText(template);
      setIsCustom(custom);
  }, [language, messageType, role, getTemplate, generateMessage]);


  useEffect(() => {
    if (isOpen) {
        const newInitialType = initialMessageType 
            ? initialMessageType 
            : (isSpecialVisitType ? 'thanks' : 'confirmation');
        
        setMessageType(newInitialType);
        setIsEditingTemplate(false);
    }
  }, [isOpen, initialMessageType, isSpecialVisitType]);

   useEffect(() => {
    if (isOpen) {
      loadMessage();
    }
  }, [messageType, language, loadMessage, isOpen]);
  
  const handleSaveTemplate = () => {
    saveCustomTemplate(language, messageType, role, editedTemplateText);
    setIsEditingTemplate(false);
  };
  
  const handleRestoreDefault = () => {
    deleteCustomTemplate(language, messageType, role);
    setIsEditingTemplate(false);
  };

  const handleActionAndConfirm = () => {
    logCommunication(visit.visitId, messageType, role);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(messageText).then(() => {
      setCopied(true);
      addToast("Message copié !", 'success');
      setTimeout(() => setCopied(false), 2000);
      handleActionAndConfirm();
    });
  };

  const handleSendWhatsApp = () => {
    if (!currentRecipient?.telephone) {
      addToast(`Le numéro de téléphone pour ${currentRecipient?.nom} n'est pas renseigné.`, 'error');
      return;
    }

    // Étape 1: Copier le message dans le presse-papiers
    navigator.clipboard.writeText(messageText).then(() => {
      addToast("Message copié ! Collez-le dans WhatsApp.", 'success', 6000);
      handleActionAndConfirm();

      // Étape 2: Ouvrir WhatsApp vers la discussion
      const phoneNumber = currentRecipient.telephone.replace(/\D/g, '');
      // On retire le paramètre 'text' qui n'est pas fiable sur toutes les plateformes.
      window.open(`whatsapp://send?phone=${phoneNumber}`);

    }).catch(err => {
        console.error('Failed to copy text: ', err);
        addToast("Erreur lors de la copie du message.", 'error');
    });
  };
  
  const handleGenerateWithAI = async () => {
        if (!apiKey) {
            addToast("Veuillez configurer votre clé API dans les Paramètres.", 'error');
            return;
        }
        setIsGeneratingAI(true);
        try {
            const ai = new GoogleGenAI({ apiKey });

            const speakerDetails = `Nom: ${speaker?.nom}, Congrégation: ${speaker?.congregation}, Notes importantes: ${speaker?.notes || 'Aucune'}`;
            const hostDetails = host ? `Nom: ${host.nom}, Notes importantes: ${host.notes || 'Aucune'}` : 'Aucun accueil assigné.';
            const visitDetails = `Date: ${formatFullDate(visit.visitDate)}, Hébergement prévu: ${visit.accommodation || 'Non défini'}, Repas prévus: ${visit.meals || 'Non défini'}`;

            const prompt = `
            Tu es un assistant rédigeant des messages pour un responsable d'accueil dans une congrégation de Témoins de Jéhovah. Le ton doit être chaleureux, respectueux et fraternel.
            Ta tâche est de transformer le modèle de message suivant en un brouillon plus naturel et personnalisé.
            Incorpore les détails contextuels de manière fluide. Si les notes de l'orateur ou de l'accueil contiennent des informations pertinentes (par exemple, allergies, préférences alimentaires, transport, situation familiale), tu DOIS les mentionner de manière attentionnée et proposer des solutions si nécessaire.
            La langue du message doit être: ${language === 'fr' ? 'Français' : 'Capverdien'}.

            **Contexte de la visite :**
            - Orateur : ${speakerDetails}
            - Accueil : ${hostDetails}
            - Détails de la visite : ${visitDetails}

            **Modèle de message à améliorer :**
            """
            ${messageText}
            """

            **Instructions de rédaction :**
            1.  **Analyse les "Notes importantes"** de l'orateur et de l'accueil. C'est la partie la plus importante. Par exemple, si l'orateur est allergique aux chats et que l'hôte a un chat, il faut absolument le mentionner et proposer une solution (comme un autre accueil pour le repas).
            2.  **Personnalise le message** en utilisant ces informations pour montrer que l'on se soucie des détails.
            3.  Conserve toutes les informations essentielles du modèle (dates, noms, etc.).
            4.  **Ne retourne QUE le texte du message final**, sans aucun commentaire, salutation ou préambule comme "Voici une suggestion :". Le texte doit être prêt à être copié-collé.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            setMessageText(response.text.trim());
            addToast("Message rédigé par l'IA !", 'success');

        } catch (error) {
            console.error("Error generating message with AI:", error);
            addToast(error instanceof Error && error.message.includes("API key") 
                ? "Erreur: La clé API n'est pas configurée ou est invalide."
                : "Erreur lors de la rédaction du message.", 'error');
        } finally {
            setIsGeneratingAI(false);
        }
    };

  const allMessageTypeOptions: { value: MessageType, label: string }[] = [
      { value: 'confirmation', label: language === 'fr' ? 'Confirmation & Besoins' : 'Konfirmason & Nesesidadis' },
      { value: 'preparation', label: language === 'fr' ? 'Préparation' : 'Preparason' },
      { value: 'reminder-7', label: language === 'fr' ? 'Rappel J-7' : 'Lembreti D-7' },
      { value: 'reminder-2', label: language === 'fr' ? 'Rappel J-2' : 'Lembreti D-2' },
      { value: 'thanks', label: language === 'fr' ? 'Remerciements' : 'Agradesimentu' },
  ];

  const messageTypeOptions = isSpecialVisitType
    ? allMessageTypeOptions.filter(opt => opt.value === 'thanks')
    : allMessageTypeOptions;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-xl w-full sm:max-w-2xl max-h-[90vh] flex flex-col animate-fade-in-up">
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-primary to-secondary dark:from-primary-dark dark:to-secondary text-white rounded-t-xl flex-shrink-0">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold">Générer un message</h2>
                    <p className="opacity-80 mt-1">
                        Pour : <span className="font-semibold">{currentRecipient?.nom}</span> ({role === 'speaker' ? 'Orateur' : 'Accueil'})
                    </p>
                </div>
                <button type="button" onClick={onClose} className="p-2 -mt-2 -mr-2 rounded-full text-white/70 hover:bg-white/20">
                    <XIcon className="w-6 h-6" />
                </button>
            </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-text-muted dark:text-text-muted-dark mb-2">Langue</label>
                    <LanguageSelector lang={language} setLang={onLanguageChange} isContained={true} />
                </div>
                <div>
                    <label htmlFor="messageType" className="block text-sm font-medium text-text-muted dark:text-text-muted-dark mb-2">Type de message</label>
                    <div className="relative">
                        <select id="messageType" value={messageType} onChange={(e) => setMessageType(e.target.value as MessageType)} className="block w-full appearance-none border border-border-light dark:border-border-dark rounded-md shadow-sm py-2 pl-3 pr-10 focus:outline-none focus:ring-primary focus:border-primary bg-card-light dark:bg-primary-light/10 text-base">
                            {messageTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><ChevronDownIcon className="w-5 h-5 text-gray-400" /></div>
                    </div>
                </div>
            </div>

            <div className="pt-4 mt-4 border-t border-border-light dark:border-border-dark">
                {isEditingTemplate ? (
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label htmlFor="templateContent" className="block text-sm font-bold text-text-main dark:text-text-main-dark">Modifier le modèle</label>
                            <div className="flex items-center gap-2">
                                 {isCustom && <button type="button" onClick={handleRestoreDefault} className="text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-1"><ArrowUturnLeftIcon className="w-4 h-4" /> Rétablir</button>}
                                <button type="button" onClick={() => setIsEditingTemplate(false)} className="px-2 py-1 text-xs bg-gray-200 dark:bg-primary-light/20 rounded-md">Annuler</button>
                                <button type="button" onClick={handleSaveTemplate} className="px-3 py-1 text-xs bg-primary text-white rounded-md flex items-center gap-1"><SaveIcon className="w-4 h-4"/> Enregistrer</button>
                            </div>
                        </div>
                         <textarea id="templateContent" rows={10} value={editedTemplateText} onChange={(e) => setEditedTemplateText(e.target.value)} className="mt-1 block w-full border border-border-light dark:border-border-dark rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-gray-50 dark:bg-primary-light/20 text-base text-text-main dark:text-text-main-dark" />
                         <p className="text-xs text-text-muted dark:text-text-muted-dark mt-1">Utilisez des variables comme {'{speakerName}'}, {'{hostName}'}, {'{visitDate}'}, etc.</p>
                    </div>
                ) : (
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label htmlFor="messageContent" className="block text-sm font-bold text-text-main dark:text-text-main-dark">Aperçu du message</label>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleGenerateWithAI}
                                    disabled={isGeneratingAI || !apiKey}
                                    className="flex items-center gap-1.5 px-2 py-1 text-xs text-secondary font-semibold rounded-md hover:bg-secondary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    title={!apiKey ? "Veuillez configurer votre clé API dans les Paramètres." : "Rédiger avec l'IA"}
                                >
                                    {isGeneratingAI ? <SpinnerIcon className="w-4 h-4" /> : <SparklesIcon className="w-4 h-4" />}
                                    {isGeneratingAI ? 'Rédaction...' : "Rédiger avec l'IA"}
                                </button>
                                <button onClick={() => setIsEditingTemplate(true)} className="flex items-center gap-1.5 px-2 py-1 text-xs text-primary dark:text-primary-light font-semibold rounded-md hover:bg-primary/10">
                                    <EditIcon className="w-4 h-4" /> Modifier le modèle
                                </button>
                            </div>
                        </div>
                        <div className="relative">
                            <textarea id="messageContent" rows={10} value={messageText} onChange={(e) => setMessageText(e.target.value)} className="mt-1 p-3 w-full border border-border-light dark:border-border-dark rounded-md bg-gray-50 dark:bg-primary-light/20 whitespace-pre-wrap text-base text-text-main dark:text-text-main-dark" />
                        </div>
                    </div>
                )}
            </div>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 dark:bg-background-dark px-6 py-4 border-t border-border-light dark:border-border-dark rounded-b-xl flex-shrink-0">
            <div className="flex flex-col sm:flex-row-reverse gap-3">
                <button type="button" onClick={handleSendWhatsApp} disabled={!currentRecipient?.telephone || isEditingTemplate} title={!currentRecipient?.telephone ? "Le numéro de téléphone du destinataire est manquant." : "Copier le message et ouvrir WhatsApp"} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:w-auto sm:text-sm disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed">
                    <WhatsAppIcon className="w-5 h-5 mr-2" />
                    Copier & Ouvrir WhatsApp
                </button>
                <button type="button" onClick={handleCopyToClipboard} disabled={isEditingTemplate} className="w-full inline-flex justify-center rounded-md border border-primary shadow-sm px-4 py-2 bg-primary/10 text-base font-medium text-primary dark:text-primary-light hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:w-auto sm:text-sm disabled:opacity-50">
                    <CopyIcon className="w-5 h-5 mr-2" /> {copied ? 'Copié !' : 'Copier le texte'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};