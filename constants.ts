import { Speaker, Host, Language, MessageType, MessageRole, Visit, SpeakerRaw, PublicTalk } from './types';

export const UNASSIGNED_HOST = 'À définir';
export const NO_HOST_NEEDED = 'Pas nécessaire';

// Raw data for speakers and their scheduled talks (both past and future)
const speakersWithTalksRaw: SpeakerRaw[] = [
    {
        "id": "4",
        "nom": "Alexis CARVALHO",
        "congregation": "Lyon KBV",
        "talkHistory": [
            {
                "date": "2026-01-03",
                "talkNo": null,
                "theme": null
            }
        ],
        "telephone": "33644556677"
    },
    {
        "id": "25",
        "nom": "José DA SILVA",
        "congregation": "Creil KBV",
        "talkHistory": [
            {
                "date": "2026-01-10",
                "talkNo": "179",
                "theme": "Nega iluzon di mundu, sforsa pa kes kuza di Reinu ki ta izisti di verdadi"
            }
        ],
        "telephone": "33618772533"
    },
    {
        "id": "20",
        "nom": "João CECCON",
        "congregation": "Villiers KBV",
        "talkHistory": [
            {
                "date": "2026-01-17",
                "talkNo": "1",
                "theme": "Bu konxe Deus dretu?"
            }
        ],
        "telephone": "33601234567"
    },
    {
        "id": "30",
        "nom": "Marcelino DOS SANTOS",
        "congregation": "Plaisir KBV",
        "talkHistory": [
            {
                "date": "2026-01-24",
                "talkNo": "36",
                "theme": "Vida é só kel-li?"
            }
        ],
        "telephone": "33650015128"
    },
    {
        "id": "9",
        "nom": "David MOREIRA",
        "congregation": "Steinsel KBV",
        "talkHistory": [
            {
                "date": "2026-01-31",
                "talkNo": "56",
                "theme": "Na ki lider ki bu pode kunfia?"
            }
        ],
        "telephone": "352621386797"
    },
    {
        "id": "11",
        "nom": "Eddy SILVA",
        "congregation": "Steinsel KBV",
        "talkHistory": [
            {
                "date": "2026-02-07",
                "talkNo": "9",
                "theme": "Obi i kunpri Palavra di Deus"
            }
        ],
        "telephone": "352691574935"
    },
    {
        "id": "37",
        "nom": "Valdir DIOGO",
        "congregation": "Porto KBV",
        "talkHistory": [
            {
                "date": "2026-02-14",
                "talkNo": "189",
                "theme": "Anda ku Deus ta traze-nu bensons gosi i pa tudu témpu"
            }
        ],
        "telephone": "33677788899"
    },
    {
        "id": "23",
        "nom": "Jorge GONÇALVES",
        "congregation": "Porto KBV",
        "talkHistory": [
            {
                "date": "2026-02-21",
                "talkNo": "4",
                "theme": "Ki próvas ten ma Deus ta izisti?"
            }
        ],
        "telephone": "33633456789"
    },
    {
        "id": "57",
        "nom": "Jeje ou JP",
        "congregation": "",
        "talkHistory": [
            {
                "date": "2026-02-28",
                "talkNo": null,
                "theme": null
            }
        ],
        "gender": "male"
    },
    {
        "id": "18",
        "nom": "Jefersen BOELJIN",
        "congregation": "Rotterdam KBV",
        "talkHistory": [
            {
                "date": "2026-03-07",
                "talkNo": null,
                "theme": null
            }
        ],
        "telephone": "31618513034"
    },
    {
        "id": "58",
        "nom": "Dimitri GIVAC",
        "congregation": "Marseille KBV",
        "talkHistory": [
            {
                "date": "2026-03-14",
                "talkNo": "3",
                "theme": "Bu sta ta anda ku organizason unidu di Jeová?"
            },
            {
                "date": "2025-10-18",
                "talkNo": null,
                "theme": null
            }
        ],
        "gender": "male"
    },
    {
        "id": "38",
        "nom": "Jonatã ALVES",
        "congregation": "Albufeira KBV Zoom",
        "talkHistory": [
            {
                "date": "2026-03-21",
                "talkNo": "11",
                "theme": "Sima Jizus, nu 'ka ta faze párti di mundu'"
            }
        ],
        "telephone": "",
        "tags": ["zoom", "expérimenté"]
    },
    {
        "id": "event-59",
        "nom": "Diskursu Spesial",
        "congregation": "Événement spécial",
        "talkHistory": [
            {
                "date": "2026-03-28",
                "talkNo": "DS",
                "theme": "Ken ki ta ben konpo téra?"
            }
        ]
    },
    {
        "id": "6",
        "nom": "Dany TAVARES",
        "congregation": "Plaisir KBV",
        "talkHistory": [
            {
                "date": "2025-05-03",
                "talkNo": "32",
                "theme": "Modi ki nu pode lida ku preokupasons di vida"
            },
            {
                "date": "2025-09-20",
                "talkNo": "102",
                "theme": "Presta atenson na \"profesia\""
            }
        ],
        "telephone": "33668121101"
    },
    {
        "id": "24",
        "nom": "José BATALHA",
        "congregation": "Marseille KBV",
        "talkHistory": [
            {
                "date": "2025-05-31",
                "talkNo": "17",
                "theme": "Da Deus glória ku tudu kel ki bu ten"
            }
        ],
        "telephone": "33618505292"
    },
    {
        "id": "22",
        "nom": "Joel CARDOSO",
        "congregation": "Nice KBV",
        "talkHistory": [
            {
                "date": "2025-06-14",
                "talkNo": "30",
                "theme": "Modi ki familia pode pápia ku kunpanheru midjór"
            }
        ],
        "telephone": "33658943038"
    },
    {
        "id": "19",
        "nom": "Jérémy TORRES",
        "congregation": "Lyon KBV",
        "talkHistory": [
            {
                "date": "2025-07-05",
                "talkNo": "12",
                "theme": "Deus kré pa bu ruspeta kes ki ren autoridadi"
            }
        ],
        "telephone": "33690123456",
        "notes": "Allergique aux chats.",
        "tags": ["allergie-chat"]
    },
    {
        "id": "10",
        "nom": "David VIEIRA",
        "congregation": "Villiers KBV",
        "talkHistory": [
            {
                "date": "2025-08-30",
                "talkNo": "108",
                "theme": "Bu pode kunfia ma nu ta ben ten un futuru sóbi!"
            }
        ],
        "telephone": "33771670140"
    },
    {
        "id": "27",
        "nom": "Luis CARDOSO",
        "congregation": "Nice KBV",
        "talkHistory": [
            {
                "date": "2025-09-06",
                "talkNo": "15",
                "theme": "Mostra bondadi pa tudu algen"
            }
        ],
        "telephone": "33669519131"
    },
    {
        "id": "60",
        "nom": "Paulo COSTA",
        "congregation": "Streaming",
        "talkHistory": [
            {
                "date": "2025-09-13",
                "talkNo": "43",
                "theme": "Kel ki Deus ta fla sénpri é midjór pa nos"
            }
        ],
        "gender": "male"
    },
    {
        "id": "61",
        "nom": "João Paulo BAPTISTA",
        "congregation": "Lyon KBV",
        "talkHistory": [
            {
                "date": "2025-09-27",
                "talkNo": "DS",
                "theme": "Modi ki géra ta ben kaba ?"
            }
        ],
        "gender": "male"
    },
    {
        "id": "8",
        "nom": "David LUCIO",
        "congregation": "Porto KBV",
        "talkHistory": [
            {
                "date": "2025-10-04",
                "talkNo": "16",
                "theme": "Kontinua ta bira bu amizadi ku Deus más fórti"
            }
        ],
        "telephone": "351960413461"
    },
    {
        "id": "33",
        "nom": "Moises CALDES",
        "congregation": "Cannes KBV",
        "talkHistory": [
            {
                "date": "2025-10-11",
                "talkNo": "183",
                "theme": "Tra odju di kuzas ki ka ten valor!"
            }
        ],
        "telephone": "33627826869"
    },
    {
        "id": "31",
        "nom": "Mario MIRANDA",
        "congregation": "Cannes KBV Zoom",
        "talkHistory": [
            {
                "date": "2025-10-25",
                "talkNo": "100",
                "theme": "Modi ki nu pode faze bons amizadi"
            }
        ],
        "telephone": "33615879709"
    },
    {
        "id": "15",
        "nom": "Gilberto FERNANDES",
        "congregation": "St Denis KBV",
        "talkHistory": [
            {
                "date": "2025-11-01",
                "talkNo": "2",
                "theme": "Bu ta skapa na témpu di fin?"
            }
        ],
        "telephone": "33769017274"
    },
    {
        "id": "14",
        "nom": "Gianni FARIA",
        "congregation": "Plaisir KBV",
        "talkHistory": [
            {
                "date": "2025-11-08",
                "talkNo": "26",
                "theme": "Abo é inportanti pa Deus?"
            }
        ],
        "telephone": "33698657173"
    },
    {
        "id": "event-62",
        "nom": "Visita do Superintendente de Circuito",
        "congregation": "Événement spécial",
        "talkHistory": [
            {
                "date": "2025-11-15",
                "talkNo": "Visita do Superintendente de Circuito",
                "theme": "Visita do Superintendente de Circuito"
            }
        ]
    },
    {
        "id": "event-63",
        "nom": "Assembleia de Circuito com Representante da Filial",
        "congregation": "Événement spécial",
        "talkHistory": [
            {
                "date": "2025-11-22",
                "talkNo": "Assembleia de Circuito com Representante da Filial",
                "theme": "Assembleia de Circuito com Representante da Filial"
            }
        ]
    },
    {
        "id": "36",
        "nom": "Thomas FREITAS",
        "congregation": "Lyon KBV",
        "talkHistory": [
            {
                "date": "2025-11-29",
                "talkNo": "70",
                "theme": "Pamodi ki Deus merese nos kunfiansa?"
            }
        ],
        "telephone": "33666677788"
    },
    {
        "id": "32",
        "nom": "Matthieu DHALENNE",
        "congregation": "Steinsel KBV",
        "talkHistory": [
            {
                "date": "2025-12-06",
                "talkNo": "194",
                "theme": "Modi ki sabedoria di Deus ta djuda-nu"
            }
        ],
        "telephone": "33628253599"
    },
    {
        "id": "12",
        "nom": "François GIANNINO",
        "congregation": "St Denis KBV",
        "talkHistory": [
            {
                "date": "2025-12-13",
                "talkNo": "7",
                "theme": "Imita mizerikordia di Jeová"
            }
        ],
        "telephone": "33633891566"
    },
    {
        "id": "event-64",
        "nom": "Asenbleia ku enkaregadu di grupu di kongregason",
        "congregation": "Événement spécial",
        "talkHistory": [
            {
                "date": "2025-12-20",
                "talkNo": "Asenbleia ku enkaregadu di grupu di kongregason",
                "theme": "Asenbleia ku enkaregadu di grupu di kongregason"
            }
        ]
    },
    {
        "id": "26",
        "nom": "José FREITAS",
        "congregation": "Lyon KBV",
        "talkHistory": [
            {
                "date": "2025-12-27",
                "talkNo": "55",
                "theme": "Modi ki bu pode faze un bon nómi ki ta agrada Deus?"
            }
        ],
        "telephone": "33666789012"
    },
    {
        "id": "1",
        "nom": "Ailton DIAS",
        "congregation": "Villiers-sur-Marne",
        "talkHistory": [],
        "telephone": "33611223344",
        "notes": undefined,
        "photoUrl": undefined,
        "gender": "male"
    },
    {
        "id": "2",
        "nom": "Alain CURTIS",
        "congregation": "Marseille KBV",
        "talkHistory": [],
        "telephone": "33606630000",
        "notes": "Préfère un repas léger le soir. Pas d'hébergement nécessaire, a de la famille à proximité.",
        "photoUrl": undefined,
        "gender": "male"
    },
    {
        "id": "3",
        "nom": "Alexandre NOGUEIRA",
        "congregation": "Creil",
        "talkHistory": [],
        "telephone": "33612526605",
        "notes": undefined,
        "photoUrl": undefined,
        "gender": "male"
    },
    {
        "id": "5",
        "nom": "Daniel FORTES",
        "congregation": "Villiers-sur-Marne",
        "talkHistory": [],
        "telephone": "33655667788",
        "notes": undefined,
        "photoUrl": undefined,
        "gender": "male"
    },
    {
        "id": "7",
        "nom": "David DE FARIA",
        "congregation": "Villiers-sur-Marne",
        "talkHistory": [],
        "telephone": "33677889900",
        "notes": undefined,
        "photoUrl": undefined,
        "gender": "male"
    },
    {
        "id": "13",
        "nom": "Fred MARQUES",
        "congregation": "Villiers-sur-Marne",
        "talkHistory": [],
        "telephone": "33634567890",
        "notes": undefined,
        "photoUrl": undefined,
        "gender": "male"
    },
    {
        "id": "16",
        "nom": "Isaque PEREIRA",
        "congregation": "St Denis KBV",
        "talkHistory": [],
        "telephone": "33652851904",
        "notes": undefined,
        "photoUrl": undefined,
        "gender": "male"
    },
    {
        "id": "17",
        "nom": "Jean-Paul BATISTA",
        "congregation": "Lyon",
        "talkHistory": [],
        "telephone": "33678901234",
        "notes": undefined,
        "photoUrl": undefined,
        "gender": "male"
    },
    {
        "id": "21",
        "nom": "João-Paulo BAPTISTA",
        "congregation": "Lyon KBV",
        "talkHistory": [],
        "telephone": "33611234567",
        "notes": undefined,
        "photoUrl": undefined,
        "gender": "male"
    },
    {
        "id": "28",
        "nom": "Luis FARIA",
        "congregation": "Plaisir",
        "talkHistory": [],
        "telephone": "33670748952",
        "notes": undefined,
        "photoUrl": undefined,
        "gender": "male"
    },
    {
        "id": "29",
        "nom": "Manuel ANTUNES",
        "congregation": "Villiers KBV",
        "talkHistory": [],
        "telephone": "33670872232",
        "notes": undefined,
        "photoUrl": undefined,
        "gender": "male"
    },
    {
        "id": "35",
        "nom": "Santiago MONIZ",
        "congregation": "Esch",
        "talkHistory": [],
        "telephone": "352691253068",
        "notes": undefined,
        "photoUrl": undefined,
        "gender": "male"
    },
    {
        "id": "39",
        "nom": "Lionel ALMEIDA",
        "congregation": "À définir",
        "talkHistory": [],
        "telephone": "33632461762",
        "notes": undefined,
        "photoUrl": undefined,
        "gender": "male"
    },
    {
        "id": "40",
        "nom": "Arthur FELICIANO",
        "congregation": "À définir",
        "talkHistory": [],
        "telephone": "352621283777",
        "notes": undefined,
        "photoUrl": undefined,
        "gender": "male"
    },
    {
        "id": "41",
        "nom": "Andrea MENARA",
        "congregation": "À définir",
        "talkHistory": [],
        "telephone": "352691295018",
        "notes": undefined,
        "photoUrl": undefined,
        "gender": "male"
    },
    {
        "id": "42",
        "nom": "Victor RIBEIRO",
        "congregation": "À définir",
        "talkHistory": [],
        "telephone": "352621625893",
        "notes": undefined,
        "photoUrl": undefined,
        "gender": "male"
    },
    {
        "id": "43",
        "nom": "Benvindo SILVA",
        "congregation": "À définir",
        "talkHistory": [],
        "telephone": "352691453468",
        "notes": undefined,
        "photoUrl": undefined,
        "gender": "male"
    },
    {
        "id": "44",
        "nom": "Miguel SILVA",
        "congregation": "À définir",
        "talkHistory": [],
        "telephone": "352621651610",
        "notes": undefined,
        "photoUrl": undefined,
        "gender": "male"
    },
    {
        "id": "45",
        "nom": "José BARBOSA",
        "congregation": "À définir",
        "talkHistory": [],
        "telephone": "352661931153",
        "notes": undefined,
        "photoUrl": undefined,
        "gender": "male"
    },
    {
        "id": "46",
        "nom": "Yuri BRADA",
        "congregation": "À définir",
        "talkHistory": [],
        "telephone": "352691556138",
        "notes": undefined,
        "photoUrl": undefined,
        "gender": "male"
    },
    {
        "id": "47",
        "nom": "João CUSTEIRA",
        "congregation": "À définir",
        "talkHistory": [],
        "telephone": "41799014137",
        "notes": undefined,
        "photoUrl": undefined,
        "gender": "male"
    },
    {
        "id": "48",
        "nom": "António GONGA",
        "congregation": "À définir",
        "talkHistory": [],
        "telephone": "352661230114",
        "notes": undefined,
        "photoUrl": undefined,
        "gender": "male"
    },
    {
        "id": "49",
        "nom": "Ashley RAMOS",
        "congregation": "À définir",
        "talkHistory": [],
        "telephone": "33695564747",
        "notes": undefined,
        "photoUrl": undefined,
        "gender": "male"
    },
    {
        "id": "50",
        "nom": "Júlio TAVARES",
        "congregation": "À définir",
        "talkHistory": [],
        "telephone": "352621510176",
        "notes": undefined,
        "photoUrl": undefined,
        "gender": "male"
    },
    {
        "id": "51",
        "nom": "Paulo CORREIA",
        "congregation": "À définir",
        "talkHistory": [],
        "telephone": "33661712640",
        "notes": undefined,
        "photoUrl": undefined,
        "gender": "male"
    },
    {
        "id": "52",
        "nom": "José FERNANDES",
        "congregation": "À définir",
        "talkHistory": [],
        "telephone": "33661881589",
        "notes": undefined,
        "photoUrl": undefined,
        "gender": "male"
    },
    {
        "id": "53",
        "nom": "António MELÍCIO",
        "congregation": "À définir",
        "talkHistory": [],
        "telephone": "31610337402",
        "notes": undefined,
        "photoUrl": undefined,
        "gender": "male"
    },
    {
        "id": "54",
        "nom": "Patrick SOUSA",
        "congregation": "À définir",
        "talkHistory": [],
        "telephone": "31640081710",
        "notes": undefined,
        "photoUrl": undefined,
        "gender": "male"
    },
    {
        "id": "55",
        "nom": "Franck BHAGOOA",
        "congregation": "À définir",
        "talkHistory": [],
        "telephone": "33782551793",
        "notes": undefined,
        "photoUrl": undefined,
        "gender": "male"
    },
    {
        "id": "56",
        "nom": "Van'dredi DOMINGOS",
        "congregation": "À définir",
        "talkHistory": [],
        "telephone": "33769111390",
        "notes": undefined,
        "photoUrl": undefined,
        "gender": "male"
    }
];

// Generate initialSpeakers with only past talks in history
export const initialSpeakers: Speaker[] = speakersWithTalksRaw.map(s => ({
    id: s.id || crypto.randomUUID(),
    nom: s.nom,
    congregation: s.congregation,
    // Keep only talks from before 2025 as "history"
    talkHistory: (s.talkHistory || []).filter(talk => new Date(talk.date).getFullYear() < 2025),
    telephone: s.telephone,
    notes: s.notes,
    photoUrl: s.photoUrl,
    gender: s.gender || 'male',
    tags: s.tags || [],
})).sort((a,b) => a.nom.localeCompare(b.nom));

// Generate initialVisits from future talks in the raw data
export const initialVisits: Visit[] = speakersWithTalksRaw
    .flatMap(speaker => 
        (speaker.talkHistory || [])
            // Filter for talks in 2025 or later to create Visit objects
            .filter(talk => new Date(talk.date).getFullYear() >= 2025)
            .map((talk): Visit => {
                const cong = speaker.congregation.toLowerCase();
                let locationType: 'physical' | 'zoom' | 'streaming' = 'physical';
                if (cong.includes('zoom')) {
                    locationType = 'zoom';
                } else if (cong.includes('streaming')) {
                    locationType = 'streaming';
                }

                return {
                    id: speaker.id,
                    nom: speaker.nom,
                    congregation: speaker.congregation,
                    telephone: speaker.telephone,
                    photoUrl: speaker.photoUrl,
                    visitId: crypto.randomUUID(),
                    visitDate: talk.date,
                    visitTime: '14:30', // Default time, can be edited by user
                    host: cong === 'événement spécial' ? 'N/A' : UNASSIGNED_HOST,
                    accommodation: '',
                    meals: '',
                    status: 'pending',
                    notes: undefined, // Visit-specific notes start empty
                    attachments: [],
                    communicationStatus: {},
                    checklist: [],
                    talkNoOrType: talk.talkNo,
                    talkTheme: talk.theme,
                    locationType: locationType,
                };
            })
    );

// Explicitly cast the array to Host[] before sorting to ensure type safety.
export const initialHosts: Host[] = ([
    { nom: "Jean-Paul Batista", telephone: "", gender: 'male', address: "182 Avenue Felix Faure, 69003", notes: "Logement en centre-ville, idéal pour orateur sans voiture. Pas d'animaux.", unavailabilities: [], tags: ["centre-ville", "sans-animaux"] },
    { nom: "Suzy", telephone: "", gender: 'female', address: "14 bis Montée des Roches, 69009", unavailabilities: [], tags: ["calme"] },
    { nom: "Alexis", telephone: "", gender: 'male', address: "13 Avenue Debrousse, 69005", unavailabilities: [] },
    { nom: "Andréa", telephone: "", gender: 'female', address: "25c Rue Georges Courteline, Villeurbanne", unavailabilities: [] },
    { nom: "Dara & Lia", telephone: "", gender: 'couple', address: "16 Rue Imbert Colomes, 69001", unavailabilities: [], tags: ["proche salle"] },
    { nom: "José Freitas", telephone: "", gender: 'male', address: "27 Av Maréchal Foch, 69110", notes: "Possède un chat. Idéal pour un orateur seul.", unavailabilities: [], tags: ["animaux", "chat"] },
    { nom: "Paulo Martins", telephone: "", gender: 'male', address: "18 Rue des Soeurs Bouviers, 69005", unavailabilities: [] },
    { nom: "Fátima", telephone: "", gender: 'female', address: "9 Chemin de la Vire, Caluire", unavailabilities: [] },
    { nom: "Sanches", telephone: "", gender: 'male', address: "132 Av. L'Aqueduc de Beaunant, 69110 Ste Foy", unavailabilities: [], tags: ["sans escaliers"] },
    { nom: "Torres", telephone: "", gender: 'male', address: "15 Cours Rouget de l'Isle, Rillieux", notes: "Famille avec jeunes enfants, très accueillants.", unavailabilities: [], tags: ["enfants"] },
    { nom: "Nathalie", telephone: "", gender: 'female', address: "86 Rue Pierre Delore, 69008", unavailabilities: [] },
    { nom: "Francisco Pinto", telephone: "", gender: 'male', address: "20 Rue Professeur Patel, 69009", unavailabilities: [] }
] as Host[]).sort((a,b) => a.nom.localeCompare(b.nom));

export const messageTemplates: Record<Language, Record<MessageType, Record<MessageRole, string>>> = {
  fr: {
    confirmation: {
      speaker: `Bonjour Frère {speakerName},{firstTimeIntroduction}

Nous nous réjouissons de t'accueillir pour ton discours le {visitDate}.

Afin de préparer au mieux ta venue, pourrais-tu nous indiquer si tu as des besoins particuliers ?
- As-tu besoin d'un hébergement ?
- Serais-tu disponible pour un repas ?
- Viendras-tu par tes propres moyens ou as-tu besoin qu'on vienne te chercher ?

N'hésite pas si tu as la moindre question.
Fraternellement.

{hospitalityOverseer}
{hospitalityOverseerPhone}`,
      host: `Bonjour Frère {hostName},

J'espère que tu vas bien.
Juste une petite confirmation pour l'accueil de Frère *{speakerName}* le *{visitDate}*.

Est-ce que tout est en ordre de ton côté ?

Merci pour ton hospitalité !
Fraternellement.

{hospitalityOverseer}
{hospitalityOverseerPhone}`
    },
    preparation: {
      speaker: `Bonjour Frère {speakerName},

J'espère que tu vas bien.

Nous nous réjouissons de t'accueillir pour ton discours public prévu le *{visitDate}* à *{visitTime}*.

Pour l'organisation, c'est notre frère *{hostName}* qui s'occupera de ton accueil. Si tu as des questions ou des besoins spécifiques (transport, hébergement, repas), n'hésite pas à le contacter.

Voici ses coordonnées :
- Téléphone : {hostPhone}
- Adresse : {hostAddress}

Nous avons hâte de passer ce moment avec toi.

Fraternellement.

{hospitalityOverseer}
{hospitalityOverseerPhone}`,
      host: `Bonjour Frère {hostName},

J'espère que tu vas bien.

Je te contacte concernant l'accueil de notre orateur invité, Frère *{speakerName}*, qui nous visitera le *{visitDate}* à *{visitTime}*.

Merci de t'être porté volontaire. Peux-tu prendre contact avec lui pour coordonner les détails de sa visite (transport, repas, hébergement) ? Son numéro est {speakerPhone}.

Fais-moi savoir si tu as la moindre question.

Merci pour ton hospitalité.
Fraternellement.

{hospitalityOverseer}
{hospitalityOverseerPhone}`
    },
    'reminder-7': {
      speaker: `Bonjour Frère {speakerName},

Ceci est un petit rappel amical pour ton discours public parmi nous, prévu dans une semaine, le *{visitDate}* à *{visitTime}*.

Frère {hostName} ({hostPhone}) est toujours ton contact pour l'organisation.

Nous nous réjouissons de t'accueillir.
À très bientôt !

{hospitalityOverseer}
{hospitalityOverseerPhone}`,
      host: `Bonjour Frère {hostName},

Petit rappel amical concernant l'accueil de Frère *{speakerName}*, prévu dans une semaine, le *{visitDate}* à *{visitTime}*.

N'hésite pas si tu as des questions.

Merci encore pour ton aide précieuse.
Fraternellement.

{hospitalityOverseer}
{hospitalityOverseerPhone}`
    },
    'reminder-2': {
      speaker: `Bonjour Frère {speakerName},

Dernier petit rappel avant ton discours public prévu ce week-end, le *{visitDate}* à *{visitTime}*.

Nous avons vraiment hâte de t'écouter. Fais bon voyage si tu dois te déplacer.

Fraternellement.

{hospitalityOverseer}
{hospitalityOverseerPhone}`,
      host: `Bonjour Frère {hostName},

Dernier petit rappel pour l'accueil de Frère *{speakerName}* ce week-end, le *{visitDate}* à *{visitTime}*.

Tout est en ordre de ton côté ?

Merci pour tout.
Fraternellement.

{hospitalityOverseer}
{hospitalityOverseerPhone}`
    },
    thanks: {
      speaker: `Bonjour Frère {speakerName},

Juste un petit mot pour te remercier encore chaleureusement pour ton excellent discours. Nous avons tous été très encouragés.

Nous espérons que tu as passé un bon moment parmi nous et que ton retour s'est bien passé.

Au plaisir de te revoir.
Fraternellement.

{hospitalityOverseer}
{hospitalityOverseerPhone}`,
      host: `Bonjour Frère {hostName},

Un grand merci pour ta merveilleuse hospitalité envers Frère *{speakerName}* ce week-end. C'est grâce à des frères comme toi que nos orateurs se sentent si bien accueillis.

Ton aide a été très appréciée.

Fraternellement.

{hospitalityOverseer}
{hospitalityOverseerPhone}`
    }
  },
  cv: {
    confirmation: {
      speaker: `Olá, Irmon {speakerName},{firstTimeIntroduction}

Nu sta kontenti di resebe-u pa bu diskursu na dia {visitDate}.

Pa nu prepara midjor pa bu vizita, bu pode fla-nu si bu ten algun nesesidadi spesial?
- Bu mesti di alojamentu?
- Bu sta dispunível pa un kumida?
- Bu ta ben pa bu konta ô bu mesti pa algen bai buska-u?

Si bu tiver kualker pergunta, ka bu ezita.
Ku amor fraternu.

{hospitalityOverseer}
{hospitalityOverseerPhone}`,
      host: `Olá, Irmon {hostName},

N ta spera ma bu sta dretu.
Sô un konfirmason rapidu pa akolhimentu di Irmon *{speakerName}* na dia *{visitDate}*.

Sta tudu dretu di bu ladu?

Obrigadu pa bu ospitalidadi!
Ku amor fraternu.

{hospitalityOverseer}
{hospitalityOverseerPhone}`
    },
    preparation: {
      speaker: `Olá, Irmon {speakerName},

N ta spera ma bu sta dretu.

Nu sta kontenti di resebe-u pa bu diskursu públiku markadu pa dia *{visitDate}* às *{visitTime}*.

Pa organizason, é nos irmon *{hostName}* ki ta enkarrega di resebe-u. Si bu tiver algun pergunta ô nesesidadi spesífiku (transporti, alojamentu, kumida), ka bu ezita na kontakta-l.

Es li é se kontaktu:
- Telefoni: {hostPhone}
- Nderesu: {hostAddress}

Nu sta ansiozu pa pasa es momentu ku bo.

Ku amor fraternu.

{hospitalityOverseer}
{hospitalityOverseerPhone}`,
      host: `Olá, Irmon {hostName},

N ta spera ma bu sta dretu.

N sta kontakta-u sobri akolhimentu di nos orador konvidadu, Irmon *{speakerName}*, ki ta vizita-nu na dia *{visitDate}* às *{visitTime}*.

Obrigadu pa bu voluntariadu. Bu pode entra en kontaktu ku el pa kordena kes detadjis di se vizita (transporti, kumida, alojamentu)? Se númeru é {speakerPhone}.

Aviza-m si bu tiver algun pergunta.

Obrigadu pa bu ospitalidadi.
Ku amor fraternu.

{hospitalityOverseer}
{hospitalityOverseerPhone}`
    },
    'reminder-7': {
      speaker: `Olá, Irmon {speakerName},

Es li é un pikenu lembreti amigável pa bu diskursu públiku na nos kongregason, markadu pa li un simana, na dia *{visitDate}* às *{visitTime}*.

Irmon {hostName} ({hostPhone}) inda é bu kontaktu pa organizason.

Nu sta kontenti di resebe-u.
Te breve!

{hospitalityOverseer}
{hospitalityOverseerPhone}`,
      host: `Olá, Irmon {hostName},

Pikenu lembreti amigável sobri akolhimentu di Irmon *{speakerName}*, markadu pa li un simana, na dia *{visitDate}* às *{visitTime}*.

Ka bu ezita si bu tiver algun pergunta.

Obrigadu más un bes pa bu ajuda presioza.
Ku amor fraternu.

{hospitalityOverseer}
{hospitalityOverseerPhone}`
    },
    'reminder-2': {
      speaker: `Olá, Irmon {speakerName},

Últimu pikenu lembreti antis di bu diskursu públiku markadu pa es fin di simana, na dia *{visitDate}* às *{visitTime}*.

Nu sta mutu ansiozu pa uvi-u. Fazi un bon viaji si bu tiver ki disloka.

Ku amor fraternu.

{hospitalityOverseer}
{hospitalityOverseerPhone}`,
      host: `Olá, Irmon {hostName},

Últimu pikenu lembreti pa akolhimentu di Irmon *{speakerName}* es fin di simana, na dia *{visitDate}* às *{visitTime}*.

Tudu dretu di bu ladu?

Obrigadu pa tudu.
Ku amor fraternu.

{hospitalityOverseer}
{hospitalityOverseerPhone}`
    },
    thanks: {
      speaker: `Olá, Irmon {speakerName},

Sô un palavrinha pa gradese-u más un bes di korason pa bu eselenti diskursu. Nu fika tudu mutu enkorajadu.

Nu ta spera ma bu pasa un bon momentu na nos meiu i ma bu regresu foi tranquilu.

Un abrasu i ti próssima.
Ku amor fraternu.

{hospitalityOverseer}
{hospitalityOverseerPhone}`,
      host: `Olá, Irmon {hostName},

Un grandi obrigadu pa bu maravilhoza ospitalidadi pa ku Irmon *{speakerName}* es fin di simana. É grasas a irmons sima bo ki nos oradoris ta sinti tan ben resebidu.

Bu ajuda foi mutu apresiadu.

Ku amor fraternu.

{hospitalityOverseer}
{hospitalityOverseerPhone}`
    }
  }
};

export const hostRequestMessageTemplates: Record<Language, string> = {
  fr: `Bonjour chers frères et sœurs, ☀️

Nous avons la joie d'accueillir prochainement plusieurs orateurs visiteurs. Nous recherchons des familles hospitalières pour les recevoir.

Voici les visites pour lesquelles nous avons besoin de votre aide :

{visitList}

Si vous pouvez aider pour l'un de ces besoins (hébergement, repas, ou les deux), merci de répondre en précisant le nom de l'orateur et ce que vous pouvez proposer.

Votre hospitalité est grandement appréciée !

« N’oubliez pas l’hospitalité, car grâce à elle certains ont sans le savoir logé des anges. » (Hébreux 13:2)

{hospitalityOverseer}
{hospitalityOverseerPhone}`,
  cv: `Olá, keridus irmons i irmãs, ☀️

Nu ten alegria di resebe alguns oradoris vizitanti na futuru prósimu. Nu sta buska famílias ospitaleras pa resebe-s.

Es li é kes vizita ki nu mesti di nhos ajuda pa akolhimentu:

{visitList}

Si nhos pode djuda ku un di kes nesesidadi li (alojamentu, kumida, ô es dôs), favor responde ku nómi di orador i ku kuzê ki nhos pode oferese.

Nhos ospitalidadi é mutu apresiadu!

« Ka nhos skese di ospitalidadi, pamodi é grasas a el ki alguns resebe anjus na ses kaza sen es sabe. » (Ebreus 13:2)

{hospitalityOverseer}
{hospitalityOverseerPhone}`
};


export const initialPublicTalks: PublicTalk[] = [
    { number: 1, theme: "Comment la Bible peut vous aider à améliorer votre vie" },
    { number: 2, theme: "La Bible nous aide-t-elle à faire face aux problèmes d’aujourd’hui ?" },
    { number: 3, theme: "La Bible : un livre digne de confiance" },
    { number: 4, theme: "Ce que la Bible prédit pour notre époque" },
    { number: 5, theme: "Le Royaume de Dieu est-il une réalité ?" },
    { number: 6, theme: "Comment le Royaume de Dieu nous sera bénéfique" },
    { number: 7, theme: "Vivre en accord avec la prière modèle" },
    { number: 8, theme: "Servez Jéhovah d’un cœur complet" },
    { number: 9, theme: "La voie de Dieu est la meilleure" },
    { number: 10, theme: "Appréciez-vous les dons que Dieu vous a faits ?" },
    { number: 11, theme: "Ce qui se cache derrière l’esprit de rébellion" },
    { number: 12, theme: "Respectons l’autorité divine" },
    { number: 13, theme: "Une bonne nouvelle dans un monde violent" },
    { number: 14, theme: "Menez une vie de famille qui honore Dieu" },
    { number: 15, theme: "Qui est votre Dieu ?" },
    { number: 16, theme: "Avons-nous des raisons de croire en Dieu ?" },
    { number: 17, theme: "Honorez Dieu dans tout ce que vous faites" },
    { number: 18, theme: "Les principes bibliques peuvent-ils nous aider à affronter les problèmes actuels ?" },
    { number: 19, theme: "La vie a-t-elle un sens ?" },
    { number: 20, theme: "Le Créateur : comprenez-le, aimez-le" },
    { number: 21, theme: "Le monde actuel survivra-t-il ?" },
    { number: 22, theme: "L’avenir de la religion" },
    { number: 23, theme: "Le jour du jugement : une raison d’avoir peur ou d’espérer ?" },
    { number: 24, theme: "Un seul vrai Dieu, une seule vraie foi : est-ce possible ?" },
    { number: 25, theme: "Pourquoi les chrétiens doivent-ils être différents ?" },
    { number: 26, theme: "Vous pouvez vivre éternellement sur la terre. Le croyez-vous ?" },
    { number: 27, theme: "Une terre purifiée sera-t-elle un jour une réalité ?" },
    { number: 28, theme: "De bonnes relations avec les autres : comment est-ce possible ?" },
    { number: 29, theme: "Comment faire face aux inquiétudes de la vie" },
    { number: 30, theme: "Comment bâtir un mariage solide et heureux" },
    { number: 31, theme: "Parents, bâtissez avec sagesse" },
    { number: 32, theme: "Comment améliorer la communication au sein de la famille" },
    { number: 33, theme: "L’alcool : quel est le point de vue équilibré ?" },
    { number: 34, theme: "Faites confiance au Dieu de tout réconfort" },
    { number: 35, theme: "Comment trouver la sécurité dans un monde dangereux" },
    { number: 36, theme: "Est-ce plus tard que vous ne le pensez ?" },
    { number: 37, theme: "Dieu se soucie-t-il vraiment de vous ?" },
    { number: 38, theme: "Comment pouvez-vous survivre à la fin du monde ?" },
    { number: 39, theme: "Les décisions que vous prenez ont une influence sur votre avenir" },
    { number: 40, theme: "Ce que signifie aimer son prochain" },
    { number: 41, theme: "Agissez avec sagesse à l’approche de la fin" },
    { number: 42, theme: "Comment l’amour et la foi peuvent vaincre le monde" },
    { number: 43, theme: "Le chemin qui mène à la vie est-il trop difficile ?" },
    { number: 44, theme: "Ayez confiance dans le pouvoir de la Parole de Dieu" },
    { number: 45, theme: "Suivez l’exemple du plus grand homme qui ait vécu" },
    { number: 46, theme: "Jésus Christ : qui est-il vraiment ?" },
    { number: 47, theme: "« Soyez saints parce que je suis saint »" },
    { number: 48, theme: "Rejetons les raisonnements qui sont contre la connaissance de Dieu" },
    { number: 49, theme: "Le seul remède à la défaillance des humains" },
    { number: 50, theme: "Qui est qualifié pour diriger l’humanité ?" },
    { number: 51, theme: "La présence du Christ : que signifie-t-elle pour vous ?" },
    { number: 52, theme: "Dieu et votre foi : quel lien ?" },
    { number: 53, theme: "Une fraternité mondiale sauvée de la destruction" },
    { number: 54, theme: "Le règne millénaire de paix de Dieu est proche" },
    { number: 55, theme: "La paix et la sécurité véritables : quand ?" },
    { number: 56, theme: "Où trouver de l’aide en temps de détresse ?" },
    { number: 57, theme: "Dans les difficultés, où trouver du réconfort ?" },
    { number: 58, theme: "Qui peut être sauvé ?" },
    { number: 59, theme: "Vous serez libérés !" },
    { number: 60, theme: "Comment la sagesse divine nous est bénéfique" },
    { number: 61, theme: "Qui sont les vrais disciples du Christ ?" },
    { number: 62, theme: "Le rôle de la religion dans les affaires du monde" },
    { number: 63, theme: "Ne vous laissez pas tromper" },
    { number: 64, theme: "Qui est le seul à pouvoir nous guider ?" },
    { number: 65, theme: "L’heure de rendre des comptes à Dieu est proche" },
    { number: 66, theme: "Quand Dieu va-t-il commencer à diriger le monde ?" },
    { number: 67, theme: "Pourquoi se réfugier en Jéhovah ?" },
    { number: 68, theme: "Quel est le fondement de votre espérance ?" },
    { number: 69, theme: "La résurrection : une victoire sur la mort !" },
    { number: 70, theme: "Que deviendront les morts ?" },
    { number: 71, theme: "Restez spirituellement éveillés" },
    { number: 72, theme: "L’amour : la qualité qui distingue les vrais chrétiens" },
    { number: 73, theme: "Comment se faire un bon nom auprès de Dieu" },
    { number: 74, theme: "Comment avoir une bonne conscience" },
    { number: 75, theme: "Combien de temps vous reste-t-il ?" },
    { number: 76, theme: "La paix véritable viendra-t-elle un jour ?" },
    { number: 77, theme: "Dans quel genre de personnes Dieu trouve-t-il son plaisir ?" },
    { number: 78, theme: "Dieu se souvient de vous. Et vous ?" },
    { number: 79, theme: "L’amitié avec Dieu ou l’amitié avec le monde : laquelle choisirez-vous ?" },
    { number: 80, theme: "Pourquoi vous pouvez avoir confiance en la Bible" },
    { number: 81, theme: "Ce que notre Créateur attend de nous" },
    { number: 82, theme: "Jéhovah et Christ : sont-ils égaux ?" },
    { number: 83, theme: "Vous pouvez connaître le bonheur dès maintenant !" },
    { number: 84, theme: "Peut-on aimer la justice et haïr l’injustice ?" },
    { number: 85, theme: "Bonne nouvelle pour toutes les nations" },
    { number: 86, theme: "Changements sur la terre : quel avenir ?" },
    { number: 87, theme: "Qui sont les ministres de Dieu aujourd’hui ?" },
    { number: 88, theme: "« Tenez-vous prêts » !" },
    { number: 89, theme: "Pourquoi les humains ont besoin de Dieu" },
    { number: 90, theme: "La vie dans le nouveau monde de Dieu" },
    { number: 91, theme: "Pourquoi vivre selon les normes de la Bible ?" },
    { number: 92, theme: "Le culte qui plaît à Dieu" },
    { number: 93, theme: "Des prières qui sont exaucées" },
    { number: 94, theme: "Dieu condamne-t-il toutes les religions ?" },
    { number: 95, theme: "Que se passe-t-il après la mort ?" },
    { number: 96, theme: "La science a-t-elle rendu la Bible inutile ?" },
    { number: 97, theme: "Comment trouver la joie de vivre" },
    { number: 98, theme: "Qui est le Diable ? Est-il réel ?" },
    { number: 99, theme: "La résurrection : pourquoi cette espérance est sûre" },
    { number: 100, theme: "Comment surmonter le mal par le bien" },
    { number: 101, theme: "Jéhovah : le Grand Potier" },
    { number: 102, theme: "Choisissez la vie !" },
    { number: 103, theme: "Vous pouvez être aussi justes que Dieu" },
    { number: 104, theme: "Parents, êtes-vous un bon exemple ?" },
    { number: 105, theme: "Enfants, quelle est votre place dans les dispositions de Dieu ?" },
    { number: 106, theme: "Comment l’esprit saint agit sur nous" },
    { number: 107, theme: "Soumettons-nous à la domination de Dieu dès maintenant" },
    { number: 108, theme: "La scène de ce monde est en train de changer" },
    { number: 109, theme: "L’hospitalité : une marque du christianisme" },
    { number: 110, theme: "Dieu vient en aide à ceux qui l’aiment" },
    { number: 111, theme: "La confiance en l’organisation de Jéhovah" },
    { number: 112, theme: "Comment montrer du respect pour nos lieux de culte" },
    { number: 113, theme: "Comment affronter l’avenir avec foi et courage" },
    { number: 114, theme: "Appréciez votre place dans l’assemblée" },
    { number: 115, theme: "Comment vous protéger du piège du Diable : le spiritisme" },
    { number: 116, theme: "Le mariage : son origine et son but" },
    { number: 117, theme: "Comment faire pour que votre mariage soit une réussite durable" },
    { number: 118, theme: "Imitez le Dieu de vérité" },
    { number: 119, theme: "La jalousie : comment la maîtriser ?" },
    { number: 120, theme: "Comment trouver le bonheur en faisant des dons" },
    { number: 121, theme: "Un peuple pur et droit aux yeux de Jéhovah" },
    { number: 122, theme: "Le contentement favorise la piété" },
    { number: 123, theme: "Pourquoi les chrétiens doivent être des porteurs de lumière" },
    { number: 124, theme: "Résistez à la tendance à vous plaindre" },
    { number: 125, theme: "Marcher avec Dieu apporte des bienfaits, aujourd’hui et pour toujours" },
    { number: 126, theme: "Continuez de grandir en spiritualité" },
    { number: 127, theme: "Comment rester spirituellement fort" },
    { number: 128, theme: "Votre avenir : comment l’assurer ?" },
    { number: 129, theme: "Restez intègres dans un monde méchant" },
    { number: 130, theme: "Les principes bibliques : pouvons-nous vivre en les appliquant ?" },
    { number: 131, theme: "Comment endurer la persécution" },
    { number: 132, theme: "Comment garder son zèle pour le vrai culte" },
    { number: 133, theme: "Qui sèmera le vent récoltera la tempête" },
    { number: 134, theme: "Un monde sans préjugés : quand ?" },
    { number: 135, theme: "Comment garder une vision positive de la vie" },
    { number: 136, theme: "La vraie liberté : où la trouver ?" },
    { number: 137, theme: "Ce que Dieu a fait pour vous" },
    { number: 138, theme: "Êtes-vous conscient de vos besoins spirituels ?" },
    { number: 139, theme: "La miséricorde : une facette dominante de la personnalité de Dieu" },
    { number: 140, theme: "Vivez une vie qui a un but" },
    { number: 141, theme: "Gardez l’esprit de sacrifice" },
    { number: 142, theme: "Regardez le mariage du point de vue de Dieu" },
    { number: 143, theme: "Appréciez-vous le rôle du Christ dans le projet de Dieu ?" },
    { number: 144, theme: "Quel genre de nom vous faites-vous ?" },
    { number: 145, theme: "Qu’est-ce que le Royaume de Dieu ?" },
    { number: 146, theme: "Utilisez l’éducation pour louer Jéhovah" },
    { number: 147, theme: "Trouvez du plaisir dans la justice de Jéhovah" },
    { number: 148, theme: "La création révèle le Dieu vivant" },
    { number: 149, theme: "Amis de la paix, réjouissez-vous !" },
    { number: 150, theme: "Êtes-vous sur le chemin de la vie éternelle ?" },
    { number: 151, theme: "Jéhovah est un refuge pour son peuple" },
    { number: 152, theme: "L’homme qui a ruiné la réputation de Dieu" },
    { number: 153, theme: "Qui est comme Jéhovah notre Dieu ?" },
    { number: 154, theme: "Les anges : quelle est leur influence sur notre vie ?" },
    { number: 155, theme: "Fin des ténèbres, un monde de lumière" },
    { number: 156, theme: "« Un temps pour tout »" },
    { number: 157, theme: "Le point de vue de Dieu sur les relations sexuelles et le mariage" },
    { number: 158, theme: "Restons sans tache dans un monde dépravé" },
    { number: 159, theme: "Regardons les jeunes d’un œil positif" },
    { number: 160, theme: "Comment vous pouvez vous approcher de Dieu" },
    { number: 161, theme: "Pourquoi Jésus a-t-il souffert et est-il mort ?" },
    { number: 162, theme: "Sommes-nous en train de gagner le combat pour la pureté de la pensée et de la conduite ?" },
    { number: 163, theme: "Pourquoi craindre le vrai Dieu ?" },
    { number: 164, theme: "Dieu est-il responsable de nos malheurs ?" },
    { number: 165, theme: "La domination de l’homme est à son point de rupture" },
    { number: 166, theme: "Appréciez la vie en abondance dès maintenant !" },
    { number: 167, theme: "Ce que la proximité d’Armaguédon signifie pour vous" },
    { number: 168, theme: "Rendez à Dieu ce qui est à Dieu" },
    { number: 169, theme: "Pourquoi Jésus est le seul sauveur de l’humanité" },
    { number: 170, theme: "Soyez courageux et ayez confiance en Jéhovah" },
    { number: 171, theme: "Le gouvernement mondial de Dieu : une réalité" },
    { number: 172, theme: "Quel espoir pour nos chers disparus ?" },
    { number: 173, theme: "Le plus grand miracle de tous les temps" },
    { number: 174, theme: "Le seul vrai Dieu" },
    { number: 175, theme: "Quelles sont les références des vrais chrétiens ?" },
    { number: 176, theme: "Bienvenue dans la seule communauté internationale qui soit unie" },
    { number: 177, theme: "Quel est votre point de vue sur l’autorité ?" },
    { number: 178, theme: "Comment le Royaume de Dieu nous touche-t-il aujourd’hui ?" },
    { number: 179, theme: "Une bonne nouvelle pour tous les peuples" },
    { number: 180, theme: "La Bible et votre avenir" },
    { number: 181, theme: "Un monde nouveau et juste est proche" },
    { number: 182, theme: "Les jeunes peuvent-ils rendre Dieu heureux ?" },
    { number: 183, theme: "La mort n’est pas la fin de tout !" },
    { number: 184, theme: "La fin des fausses religions est proche" },
    { number: 185, theme: "Que se passe-t-il quand on meurt ?" },
    { number: 186, theme: "Une prière qui sera exaucée" },
    { number: 187, theme: "Comment être un bon père" },
    { number: 188, theme: "Ce que l’avenir nous réserve" },
    { number: 189, theme: "Pourquoi se faire baptiser ?" },
    { number: 190, theme: "Qui est ton Dieu ?" },
    { number: 191, theme: "Comment faire face à l’avenir en toute confiance" },
    { number: 192, theme: "Comment surmonter l’inquiétude" },
    { number: 193, theme: "Comment trouver la paix intérieure" },
    { number: 194, theme: "Comment renforcer votre confiance en Dieu" },
];