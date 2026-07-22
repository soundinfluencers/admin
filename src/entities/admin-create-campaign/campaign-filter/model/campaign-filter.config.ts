export type UnifiedFilterConfig = {
    key: string;
    label: string;
    communityId?: string;
    creatorId?: string;
    parent?: "techno" | "house";
};

export const UNIFIED_MUSIC_GENRES: UnifiedFilterConfig[] = [
    {
        key: "techno_melodic_minimal",
        label: "Melodic, Minimal",
        communityId: "techno_melodic_minimal",
        creatorId: "electronic_techno_melodic_minimal",
        parent: "techno",
    },
    {
        key: "techno_hard_peak",
        label: "Hard, Peak",
        communityId: "techno_hard_peak",
        creatorId: "electronic_techno_hard_peak",
        parent: "techno",
    },
    {
        key: "house_tech_house",
        label: "Tech House",
        communityId: "house_tech_house",
        creatorId: "electronic_house_tech_house",
        parent: "house",
    },
    {
        key: "house_melodic_afro",
        label: "Melodic, Afro",
        communityId: "house_melodic_afro",
        creatorId: "electronic_house_melodic_afro",
        parent: "house",
    },
    {
        key: "edm",
        label: "EDM",
        communityId: "edm",
        creatorId: "electronic_edm",
    },
    {
        key: "drum_and_bass",
        label: "D&B",
        communityId: "drum_and_bass",
        creatorId: "electronic_drum_and_bass",
    },
    {
        key: "bass",
        label: "Bass",
        communityId: "bass",
        creatorId: "electronic_bass",
    },
    {
        key: "psy_trance",
        label: "Psy, Trance",
        communityId: "psy_trance",
        creatorId: "electronic_psy_trance",
    },
    {
        key: "dubstep",
        label: "Dubstep",
        communityId: "dubstep",
        creatorId: "electronic_dubstep",
    },
    {
        key: "hip_hop",
        label: "Hip-hop",
        communityId: "hip_hop",
        creatorId: "mainstream_hip_hop",
    },
    {
        key: "pop",
        label: "Pop",
        communityId: "pop",
        creatorId: "mainstream_pop",
    },
    {
        key: "arabic",
        label: "Arabic",
        creatorId: "mainstream_arabic",
    },
    {
        key: "k_pop",
        label: "K-Pop",
        creatorId: "mainstream_k_pop",
    },
    {
        key: "metal_rock",
        label: "Metal/Rock",
        creatorId: "mainstream_metal_rock",
    },
    {
        key: "latin",
        label: "Latin",
        creatorId: "mainstream_latin",
    },
];

export const UNIFIED_ADDITIONAL_TOPICS: UnifiedFilterConfig[] = [
    {
        key: "ibiza",
        label: "Ibiza",
        communityId: "ibiza",
    },
    {
        key: "dancing",
        label: "Dancing",
        communityId: "dancing",
        creatorId: "music_dance",
    },
    {
        key: "meme",
        label: "Meme",
        communityId: "meme",
    },
    {
        key: "lipsync",
        label: "Lipsync",
        creatorId: "music_lipsync",
    },
    {
        key: "reactions",
        label: "Reactions",
        creatorId: "music_reactions",
    },
    {
        key: "lyrics",
        label: "Lyrics",
        creatorId: "music_lyrics",
    },
    {
        key: "lifestyle",
        label: "Lifestyle",
        creatorId: "entertainment_lifestyle",
    },
    {
        key: "fashion",
        label: "Fashion",
        creatorId: "entertainment_fashion",
    },
    {
        key: "fitness_sport",
        label: "Fitness/Sport",
        creatorId: "entertainment_fitness_sport",
    },
    {
        key: "beauty",
        label: "Beauty",
        creatorId: "entertainment_beauty",
    },
    {
        key: "travel",
        label: "Travel",
        creatorId: "entertainment_travel",
    },
    {
        key: "family",
        label: "Family",
        creatorId: "entertainment_family",
    },
    {
        key: "comedy",
        label: "Comedy",
        creatorId: "entertainment_comedy",
    },
    {
        key: "cosplay",
        label: "Cosplay",
        creatorId: "entertainment_cosplay",
    },
    {
        key: "food",
        label: "Food",
        creatorId: "entertainment_food",
    },
    {
        key: "art",
        label: "Art",
        creatorId: "entertainment_art",
    },
];
