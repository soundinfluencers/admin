export type TGenres =
  | 'Techno (Melodic, Minimal)'
  | 'Techno (Hard, Peak)'
  | 'House (Tech House)'
  | 'House (Melodic, Afro)'
  | 'EDM'
  | 'D&B'
  | 'Bass'
  | 'Psy'
  | 'Dubstep'
  | 'Hip-Hop'
  | 'Dance Pop';

interface IGenresOption {
  label: string;
  subLabel?: string;
  value: TGenres;
}

export const GENRES_OPTIONS = [
  { label: "Techno", subLabel: "Melodic, Minimal" ,value: "Techno (Melodic, Minimal)" },
  { label: "Techno", subLabel: "Hard, Peak" ,value: "Techno (Hard, Peak)" },
  { label: "House", subLabel: "Tech House", value: "House (Tech House)" },
  { label: "House", subLabel: "Melodic, Afro" ,value: "House (Melodic, Afro)" },
  { label: "EDM", value: "EDM" },
  { label: "D&B", value: "D&B" },
  { label: "Bass", value: "Bass" },
  { label: "Psy, Trance", value: "Psy" },
  { label: "Dubstep", value: "Dubstep" },
  { label: "Hip-Hop", value: "Hip-Hop" },
  { label: "Pop", value: "Dance Pop" },
] as const satisfies IGenresOption[];

