export interface CongregationProfile {
  name: string;
  subtitle: string;
  defaultTime: string;
  hospitalityOverseer?: string;
  hospitalityOverseerPhone?: string;
  backupPhoneNumber?: string;
}

export interface TalkHistory {
  date: string;
  talkNo: string | null;
  theme: string | null;
}

export interface Speaker {
  id: string;
  nom: string;
  congregation: string;
  talkHistory: TalkHistory[];
  telephone?: string;
  notes?: string;
  photoUrl?: string;
  maritalStatus?: 'single' | 'couple';
  isVehiculed?: boolean;
  gender?: 'male' | 'female';
  tags?: string[];
}

// Type for the raw speaker data before processing
export interface SpeakerRaw {
    id: string;
    nom: string;
    congregation: string;
    talkHistory: TalkHistoryRaw[];
    telephone?: string;
    notes?: string;
    photoUrl?: string;
    maritalStatus?: 'single' | 'couple';
    isVehiculed?: boolean;
    gender?: 'male' | 'female';
    tags?: string[];
}

// Type for the raw talk history within SpeakerRaw
export interface TalkHistoryRaw {
    date: string;
    talkNo: string | null;
    theme: string | null;
}


export interface Host {
  nom: string;
  telephone: string;
  gender: 'male' | 'female' | 'couple';
  address?: string;
  photoUrl?: string;
  notes?: string;
  unavailabilities?: { start: string; end: string }[];
  tags?: string[];
}

export interface Visit {
  // From Speaker
  id: string; // speaker id
  nom: string;
  congregation: string;
  telephone?: string;
  photoUrl?: string;
  
  // Visit specific
  visitId: string;
  visitDate: string;
  visitTime: string;
  arrivalDate?: string; // Date d'arrivée
  departureDate?: string; // Date de départ
  host: string;
  accommodation: string;
  meals: string;
  notes?: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  attachments?: { name: string; dataUrl: string; size: number }[];
  locationType: 'physical' | 'zoom' | 'streaming';
  communicationStatus?: {
    confirmation?: { speaker?: string; host?: string };
    preparation?: { speaker?: string; host?: string }; // ISO date strings
    'reminder-7'?: { speaker?: string; host?: string };
    'reminder-2'?: { speaker?: string; host?: string };
    thanks?: { speaker?: string; host?:string };
  };
  checklist?: { text: string; completed: boolean }[];
  
  // Talk details for this visit
  talkNoOrType: string | null;
  talkTheme: string | null;
}


export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export type Language = 'fr' | 'cv';
export type MessageType = 'confirmation' | 'preparation' | 'reminder-7' | 'reminder-2' | 'thanks';
export type MessageRole = 'speaker' | 'host';

export type CustomMessageTemplates = Partial<{
  [lang in Language]: Partial<{
    [type in MessageType]: Partial<{
      [role in MessageRole]: string;
    }>;
  }>;
}>;

export type CustomHostRequestTemplates = Partial<{
  [lang in Language]: string;
}>;

export interface Holiday {
  date: string; // MM-DD
  name: string;
  country: 'FR' | 'PT' | 'CV';
}

export interface Vacation {
  name: string;
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
  country: 'FR';
  zone?: 'A' | 'B' | 'C';
  color: string; // tailwind bg color
}

export interface PublicTalk {
    number: number | string;
    theme: string;
}

export type Theme = 'light' | 'dark' | 'system' | 'jw';