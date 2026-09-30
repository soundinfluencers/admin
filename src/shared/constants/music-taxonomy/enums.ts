export const COMMUNITY_MUSIC_GENRES = {
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

export const COMMUNITY_THEME_TOPICS = {
  IBIZA: "ibiza",
  DANCING: "dancing",
  MEME: "meme",
} as const;

export const CREATOR_MUSIC_GENRES = {
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

export const CREATOR_CONTENT_FOCUS = {
  MUSIC_DANCE: "music_dance",
  MUSIC_LIPSYNC: "music_lipsync",
  MUSIC_REACTIONS: "music_reactions",
  MUSIC_LYRICS: "music_lyrics",
  ENTERTAINMENT_LIFESTYLE: "entertainment_lifestyle",
  ENTERTAINMENT_FASHION: "entertainment_fashion",
  ENTERTAINMENT_FITNESS_SPORT: "entertainment_fitness_sport",
  ENTERTAINMENT_BEAUTY: "entertainment_beauty",
  ENTERTAINMENT_TRAVEL: "entertainment_travel",
  ENTERTAINMENT_FAMILY: "entertainment_family",
  ENTERTAINMENT_COMEDY: "entertainment_comedy",
  ENTERTAINMENT_COSPLAY: "entertainment_cosplay",
  ENTERTAINMENT_FOOD: "entertainment_food",
  ENTERTAINMENT_ART: "entertainment_art",
} as const;

export type TCommunityMusicGenre = (typeof COMMUNITY_MUSIC_GENRES)[keyof typeof COMMUNITY_MUSIC_GENRES];
export type TCommunityThemeTopic = (typeof COMMUNITY_THEME_TOPICS)[keyof typeof COMMUNITY_THEME_TOPICS];
export type TCreatorMusicGenre = (typeof CREATOR_MUSIC_GENRES)[keyof typeof CREATOR_MUSIC_GENRES];
export type TCreatorContentFocus = (typeof CREATOR_CONTENT_FOCUS)[keyof typeof CREATOR_CONTENT_FOCUS];
