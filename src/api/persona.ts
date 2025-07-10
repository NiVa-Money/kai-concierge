/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export const BASE_URL =
  "https://v0-fork-of-brightdata-api-examples-tau.vercel.app/api/api";

export const api = axios.create({
  baseURL: BASE_URL,
});

export type Platform = "LinkedIn" | "Twitter" | "Instagram";

export interface ScrapedLinkedInData {
  profile_url: string;
  name: string;
  headline?: string;
  about?: string;
  [key: string]: any;
}

export interface ScrapedTwitterData {
  user_id: string;
  username: string;
  full_name?: string;
  tweets: { text: string; timestamp: string }[];
  [key: string]: any;
}

export interface ScrapedInstagramData {
  username: string;
  full_name?: string;
  followers?: string;
  posts: { caption: string; image_url: string }[];
  [key: string]: any;
}

export interface PersonaSummary {
  key_insights: string[];
  demographics: string;
  personality: string;
  interests: string;
  shopping: string;
  recommendations: string;
  total_sections: number;
}

export interface PersonaResponse {
  full_analysis: string;
  summary: PersonaSummary;
  [key: string]: any;
}

// LinkedIn Scraper
export const scrapeLinkedIn = async (
  url: string
): Promise<ScrapedLinkedInData[]> => {
  const res = await api.post<ScrapedLinkedInData[]>("/scrape/linkedin", {
    url,
  });
  return res.data;
};

// Twitter Scraper
export const scrapeTwitter = async (
  username: string
): Promise<ScrapedTwitterData[]> => {
  const res = await api.post<ScrapedTwitterData[]>("/scrape/twitter", {
    username,
  });
  return res.data;
};

// Instagram Scraper
export const scrapeInstagram = async (
  username: string
): Promise<ScrapedInstagramData[]> => {
  const res = await api.post<ScrapedInstagramData[]>("/scrape/instagram", {
    username,
  });
  return res.data;
};

// Persona Generator
export const generatePersona = async (
  platform: Platform,
  username: string,
  profileData: any[]
): Promise<PersonaResponse> => {
  const res = await api.post<PersonaResponse>("/generate-persona", {
    platform,
    username,
    profileData,
  });
  return res.data;
};
