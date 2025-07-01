import { Episode } from './index';
// src/types/index.ts
export interface Episode {
  episode_number: number;
  episode_title: string;
  episode_url: string;
  duration: string;
}

export interface Year {
  id: number;
  release_year: number;
}

export interface Country {
  id: number;
  country_name: string;
}

export interface Genre {
  id: number;
  genre_name: string;
}

export interface Film {
  id: number;
  slug: string;
  title_film: string;
  thumb: string;
  trailer: string ;
  film_type: boolean;
  year: Year | null;
  country: Country | null;
  genres: Genre[];
  actor: string;
  director: string;
  content: string;
  view: number;
  is_premium: boolean;
  point_required: number | null;
  film_episodes: Episode[];
  favorite_count?: number;
}

export interface Comment {
  id: number;
  user_id: number;
  film_id: number;
  comment: string;
  created_at: string;
  is_blocked: boolean;
  user: {
    name: string;
  } | null;
}

export interface Rating {
  id: number;
  user_id: number;
  film_id: number;
  rating: number;
}


export interface WatchHistories {
  id: number
  user_id: number;
  episodes_id: number;
  watch_at: number;
  progress_time: number
}

export interface Users {
  id: number
  name: string;
  email: string;
  role: string;
  points: number
}