export type TTaxonomyOption<TValue extends string = string> = {
  value: TValue;
  label: string;
  children?: readonly TTaxonomyOption<TValue>[];
};

export type TTaxonomyOptions<TValue extends string = string> =
  readonly TTaxonomyOption<TValue>[];
