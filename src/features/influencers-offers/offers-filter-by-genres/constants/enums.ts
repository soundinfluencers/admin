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

export const OFFER_CREATOR_MUSIC_GENRES = {
  ELECTRONIC_TECHNO_MELODIC_MINIMAL: "electronic_techno_melodic_minimal",
  ELECTRONIC_TECHNO_HARD_PEAK: "electronic_techno_hard_peak",
  ELECTRONIC_HOUSE_TECH_HOUSE: "electronic_house_tech_house",
  ELECTRONIC_HOUSE_MELODIC_AFRO: "electronic_house_melodic_afro",
  ELECTRONIC_EDM: "electronic_edm",
  ELECTRONIC_DRUM_AND_BASS: "electronic_drum_and_bass",
  ELECTRONIC_BASS: "electronic_bass",
  ELECTRONIC_PSY_TRANCE: "electronic_psy_trance",
  ELECTRONIC_DUBSTEP: "electronic_dubstep",
  MAINSTREAM_POP: "mainstream_pop",
  MAINSTREAM_HIP_HOP: "mainstream_hip_hop",
  MAINSTREAM_ARABIC: "mainstream_arabic",
  MAINSTREAM_K_POP: "mainstream_k_pop",
  MAINSTREAM_METAL_ROCK: "mainstream_metal_rock",
  MAINSTREAM_LATIN: "mainstream_latin",
} as const;

export type TOfferMusicGenre = (typeof OFFER_MUSIC_GENRES)[keyof typeof OFFER_MUSIC_GENRES];
export type TOfferCreatorMusicGenre = (typeof OFFER_CREATOR_MUSIC_GENRES)[keyof typeof OFFER_CREATOR_MUSIC_GENRES];
export type TOfferGenre =
  | TOfferMusicGenre
  | TOfferCreatorMusicGenre;
