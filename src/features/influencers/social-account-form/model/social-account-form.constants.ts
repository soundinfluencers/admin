import type { TPlatform } from "@/shared/types/types.ts";
import type { NestedOption } from "@/shared/ui/checkbox-tree/checkbox-tree.types.ts";
import type { TAccountTypeOption } from "./social-account-form.types.ts";

export const ACCOUNT_TYPE_OPTIONS: TAccountTypeOption[] = [
  {
    value: "community",
    label: "Community",
    description: "Pages that share or repost content",
  },
  {
    value: "creator",
    label: "Creator",
    description: "Individual influencer, artist, or performer",
  },
];

export const PRICE_INPUT_LABELS: Record<TPlatform, string> = {
  instagram: "Price for Instagram post & story, include your currency",
  tiktok: "Price for TikTok post & story, include your currency",
  soundcloud: "Price for SoundCloud repost, include your currency",
  spotify: "Price for Spotify feedback, include your currency",
  facebook: "Price for Facebook post, include your currency",
  youtube: "Price for YouTube post, include your currency",
  press: "Price for Article, include your currency",
};

export const MUSIC_GENRES_COMMUNITY: NestedOption[] = [
  {
    value: "techno",
    label: "Techno",
    children: [
      {
        value: "techno_melodic_minimal",
        label: "Melodic, Minimal",
      },
      {
        value: "techno_hard_peak",
        label: "Hard, Peak",
      },
    ],
  },
  {
    value: "house",
    label: "House",
    children: [
      {
        value: "house_tech_house",
        label: "Tech House",
      },
      {
        value: "house_melodic_afro",
        label: "Melodic, Afro",
      },
    ],
  },
  {
    value: "edm",
    label: "EDM",
  },
  {
    value: "drum_and_bass",
    label: "D&B",
  },
  {
    value: "bass",
    label: "Bass",
  },
  {
    value: "psy_trance",
    label: "Psy, Trance",
  },
  {
    value: "dubstep",
    label: "Dubstep",
  },
  {
    value: "hip_hop",
    label: "Hip-hop",
  },
  {
    value: "pop",
    label: "Pop",
  },
] as const;

export const THEME_TOPICS: NestedOption[] = [
  {
    value: "ibiza",
    label: "Ibiza",
  },
  {
    value: "dancing",
    label: "Dancing",
  },
  {
    value: "meme",
    label: "Meme",
  },
] as const;

export const MUSIC_GENRES_CREATOR: NestedOption[] = [
  {
    value: "electronic_music",
    label: "Electronic Music",
    children: [
      {
        value: "techno",
        label: "Techno",
        children: [
          {
            value: "electronic_techno_melodic_minimal",
            label: "Melodic, Minimal",
          },
          {
            value: "electronic_techno_hard_peak",
            label: "Hard, Peak",
          },
        ],
      },
      {
        value: "house",
        label: "House",
        children: [
          {
            value: "electronic_house_tech_house",
            label: "Tech House",
          },
          {
            value: "electronic_house_melodic_afro",
            label: "Melodic, Afro",
          },
        ],
      },
      {
        value: "electronic_edm",
        label: "EDM",
      },
      {
        value: "electronic_drum_and_bass",
        label: "D&B",
      },
      {
        value: "electronic_bass",
        label: "Bass",
      },
      {
        value: "electronic_psy_trance",
        label: "Psy, Trance",
      },
      {
        value: "electronic_dubstep",
        label: "Dubstep",
      },
    ],
  },
  {
    value: "mainstream_music",
    label: "Mainstream Music",
    children: [
      {
        value: "mainstream_pop",
        label: "Pop",
      },
      {
        value: "mainstream_hip_hop",
        label: "Hip-hop",
      },
      {
        value: "mainstream_arabic",
        label: "Arabic",
      },
      {
        value: "mainstream_k_pop",
        label: "K-Pop",
      },
      {
        value: "mainstream_metal_rock",
        label: "Metal/Rock",
      },
      {
        value: "mainstream_latin",
        label: "Latin",
      },
    ],
  },
] as const;

export const CONTENT_FOCUS_OPTIONS: NestedOption[] = [
  {
    value: "music",
    label: "Music",
    children: [
      {
        value: "music_dance",
        label: "Dance",
      },
      {
        value: "music_lipsync",
        label: "Lipsync",
      },
      {
        value: "music_reactions",
        label: "Reactions",
      },
      {
        value: "music_lyrics",
        label: "Lyrics",
      },
    ],
  },
  {
    value: "entertainment",
    label: "Entertainment",
    children: [
      {
        value: "entertainment_lifestyle",
        label: "Lifestyle",
      },
      {
        value: "entertainment_fashion",
        label: "Fashion",
      },
      {
        value: "entertainment_fitness_sport",
        label: "Fitness/Sport",
      },
      {
        value: "entertainment_beauty",
        label: "Beauty",
      },
      {
        value: "entertainment_travel",
        label: "Travel",
      },
      {
        value: "entertainment_family",
        label: "Family",
      },
      {
        value: "entertainment_comedy",
        label: "Comedy",
      },
      {
        value: "entertainment_cosplay",
        label: "Cosplay",
      },
      {
        value: "entertainment_food",
        label: "Food",
      },
      {
        value: "entertainment_art",
        label: "Art",
      },
    ],
  },
] as const;
