export const OFFER_MUSIC_GENRES = {
  TECHNO_MELODIC_MINIMAL: "techno_melodic_minimal",
  TECHNO_HARD_PEAK: "techno_hard_peak",
  HOUSE_TECH_HOUSE: "house_tech_house",
  HOUSE_MELODIC_AFRO: "house_melodic_afro",
  EDM: "edm",
  DRUM_AND_BASS: "drum_and_bass",
  BASS: "bass",
  PSY_TRANCE: "psy_trance",
  DUBSTEP: "dubstep",
  HIP_HOP: "hip_hop",
  POP: "pop",
} as const;

export type TOfferMusicGenre = (typeof OFFER_MUSIC_GENRES)[keyof typeof OFFER_MUSIC_GENRES];
