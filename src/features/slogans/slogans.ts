/** Five curated slogans, selected once when a batch is created. */
export const SLOGANS = [
 'Tüte leer? Hol dir Nachschub auf Astrocatcandy.shop!',
 'Bleib knusprig – bestell mehr auf Astrocatcandy.shop',
 'Für mehr Knuspergenuss besuche Astrocatcandy.shop',
 'Dein Snack-Abenteuer geht weiter auf Astrocatcandy.shop',
 'Noch Lust auf mehr? Hol dir die nächste Ladung auf Astrocatcandy.shop'
] as const;
export const randomSlogan = (): string => SLOGANS[Math.floor(Math.random()*SLOGANS.length)];
