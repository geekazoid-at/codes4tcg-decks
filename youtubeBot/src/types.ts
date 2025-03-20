export type Video = {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
};

export type DeckMeta = {
  videoId: string;
  index: number;
  coverCards: string[];
  tags: string[];
  legalities: { standard: boolean };
  name?: string;
};

export type VideoMeta = {
  id: string;
  name: string;
  author: string;
  link: string;
  publishedAt: Date;
  tags: string[];
};
