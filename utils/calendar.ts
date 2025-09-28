// utils/calendar.ts

/**
 * Calcule le numéro de semaine ISO 8601 pour une date donnée.
 * Les semaines commencent le lundi.
 */
export const getWeekNumber = (d: Date): number => {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return weekNo;
};

/**
 * Calcule la phase de la lune pour une date donnée.
 * Basé sur un algorithme simple de "moon-phase-js".
 */
export const getMoonPhase = (d: Date): { phase: number; name: string; emoji: string } => {
  const an = (y: number) => 365.25 * (y + 4716);
  const mn = (y: number, m: number) => 30.6 * m - 14.63;
  const jd = an(d.getFullYear()) + mn(d.getFullYear(), d.getMonth() + 1) + d.getDate() - 15;
  const jd_2000 = 2451545; // Julian date of 2000-01-01
  const days_since_2000 = jd - jd_2000;
  const new_moons = days_since_2000 / 29.53;
  const phase = new_moons % 1; // get fraction part

  const phaseValue = Math.round(phase * 8) % 8;
  
  const phases = [
    { name: "Nouvelle lune", emoji: "🌑" },
    { name: "Premier croissant", emoji: "🌒" },
    { name: "Premier quartier", emoji: "🌓" },
    { name: "Lune gibbeuse croissante", emoji: "🌔" },
    { name: "Pleine lune", emoji: "🌕" },
    { name: "Lune gibbeuse décroissante", emoji: "🌖" },
    { name: "Dernier quartier", emoji: "🌗" },
    { name: "Dernier croissant", emoji: "🌘" },
  ];

  const currentPhase = phases[phaseValue];

  return {
    phase: phaseValue,
    name: currentPhase.name,
    emoji: currentPhase.emoji
  };
};

/**
 * Détermine la saison astronomique pour une date donnée dans l'hémisphère nord.
 */
export const getSeason = (d: Date): { name: string; icon: string } => {
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const date = d.getDate();
  const dateValue = month * 100 + date;

  // Dates approximatives des solstices et équinoxes
  const springEquinox = 320; // March 20
  const summerSolstice = 621; // June 21
  const autumnEquinox = 922; // September 22
  const winterSolstice = 1221; // December 21

  if (dateValue >= springEquinox && dateValue < summerSolstice) {
    return { name: "Printemps", icon: "FlowerIcon" };
  } else if (dateValue >= summerSolstice && dateValue < autumnEquinox) {
    return { name: "Été", icon: "SunIcon" };
  } else if (dateValue >= autumnEquinox && dateValue < winterSolstice) {
    return { name: "Hiver", icon: "SnowflakeIcon" };
  } else {
    return { name: "Hiver", icon: "SnowflakeIcon" };
  }
};