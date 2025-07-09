/* eslint-disable @typescript-eslint/no-explicit-any */
// apiService.ts

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
  [key: string]: any; // for analytics, slides, persona_summary, storyboard_slides
}

export interface SuggestedService {
  name: string;
  description: string;
}

// Base URL (replace with actual server if needed)
const BASE_URL = "https://v0-brightdata-api-examples.vercel.app/api";

/* 1. Scrape LinkedIn */
export const scrapeLinkedIn = async (
  url: string
): Promise<ScrapedLinkedInData[]> => {
  const res = await fetch(`${BASE_URL}/scrape/linkedin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  if (!res.ok) throw new Error(`LinkedIn scrape failed: ${res.status}`);
  return await res.json();
};

/* 2. Scrape Twitter */
export const scrapeTwitter = async (
  username: string
): Promise<ScrapedTwitterData[]> => {
  const res = await fetch(`${BASE_URL}/scrape/twitter`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  });

  if (!res.ok) throw new Error(`Twitter scrape failed: ${res.status}`);
  return await res.json();
};

/* 3. Scrape Instagram */
export const scrapeInstagram = async (
  username: string
): Promise<ScrapedInstagramData[]> => {
  const res = await fetch(`${BASE_URL}/scrape/instagram`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  });

  if (!res.ok) throw new Error(`Instagram scrape failed: ${res.status}`);
  return await res.json();
};

/* 4. Generate Persona */
export const generatePersona = async (
  platform: Platform,
  username: string,
  profileData: any[]
): Promise<PersonaResponse> => {
  const res = await fetch(`${BASE_URL}/generate-persona`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ platform, username, profileData }),
  });

  if (!res.ok) throw new Error(`Persona generation failed: ${res.status}`);
  return await res.json();
};

/* 5. Suggest Services */
export const suggestServices = async (
  personaAnalysis: string
): Promise<SuggestedService[]> => {
  const res = await fetch(`${BASE_URL}/suggest-services`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ personaAnalysis }),
  });

  if (!res.ok) throw new Error(`Service suggestion failed: ${res.status}`);
  return await res.json();
};
