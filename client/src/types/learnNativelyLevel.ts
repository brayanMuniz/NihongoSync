import { JLPTLevels } from "./WanikaniJLPT";

export interface LNtoWKMapping {
  lnLevel: number;
  wkLevel: number;
}

export const lnToJLPTMapping: { range: [number, number], jlptLevel: JLPTLevels }[] = [
  { range: [0, 12], jlptLevel: "N5" },
  { range: [13, 19], jlptLevel: "N4" },
  { range: [20, 26], jlptLevel: "N3" },
  { range: [27, 33], jlptLevel: "N2" },
  { range: [34, 40], jlptLevel: "N1" },
  { range: [41, Infinity], jlptLevel: "N1" } // LN level 41+ maps to JLPT N1+
];

// Reference: https://learnnatively.com/our-grading-system/
const lnToWkMappings: LNtoWKMapping[] = [
  // N5
  { lnLevel: 12, wkLevel: 4 },
  // N4
  { lnLevel: 13, wkLevel: 5 },
  { lnLevel: 14, wkLevel: 7 },
  { lnLevel: 15, wkLevel: 9 },
  { lnLevel: 16, wkLevel: 11 },
  { lnLevel: 17, wkLevel: 13 },
  { lnLevel: 18, wkLevel: 14 },
  { lnLevel: 19, wkLevel: 15 },
  // N3
  { lnLevel: 20, wkLevel: 16 },
  { lnLevel: 21, wkLevel: 18 },
  { lnLevel: 22, wkLevel: 20 },
  { lnLevel: 23, wkLevel: 22 },
  { lnLevel: 24, wkLevel: 24 },
  { lnLevel: 25, wkLevel: 25 },
  { lnLevel: 26, wkLevel: 25 },
  // N2
  { lnLevel: 27, wkLevel: 26 },
  { lnLevel: 28, wkLevel: 30 },
  { lnLevel: 29, wkLevel: 34 },
  { lnLevel: 30, wkLevel: 38 },
  { lnLevel: 31, wkLevel: 42 },
  { lnLevel: 32, wkLevel: 46 },
  { lnLevel: 33, wkLevel: 50 },
  // N1+
  { lnLevel: 34, wkLevel: 52 },
  { lnLevel: 35, wkLevel: 54 },
  { lnLevel: 36, wkLevel: 56 },
  { lnLevel: 37, wkLevel: 58 },
  { lnLevel: 38, wkLevel: 59 },
  { lnLevel: 39, wkLevel: 60 },
  { lnLevel: 40, wkLevel: 60 },
];

export function getWaniKaniLevelFromLN(LNLevel: string): number {
  const LNLevelNumber = Number(LNLevel)
  if (LNLevelNumber >= 41) return 60
  const mapping = lnToWkMappings.find(m => m.lnLevel === LNLevelNumber);
  return mapping ? mapping.wkLevel : 5; // Return null if no matching level is found
}

export function getJLPTLevelFromLN(lnLevel: number): JLPTLevels {
  for (const mapping of lnToJLPTMapping) {
    if (lnLevel >= mapping.range[0] && lnLevel <= mapping.range[1]) {
      return mapping.jlptLevel;
    }
  }
  return "N1"; // Return null if no matching level is found
}

export type LNTvSeasonData = {
  Language: string;
  "TV Season Title": string;
  Status: string;
  "Date Started": string;
  "Date Started (Raw)": string;
  "Date Finished": string;
  "Date Finished (Raw)": string;
  "Current Episode": string;
  "Episodes Watched": string;
  "Number Of Episodes": string;
  "Total Minutes Watched": string;
  "Private Notes": string;
  "My Rating": string;
  "My Entertainment Rating": string;
  "My Language Learning Rating": string;
  "My Review Headline": string;
  "My Review": string;
  "My Lists": string;
  "TMDB ID": string;
  "TV Season ID": string;
  "Difficulty Level": string;
  "Difficulty Level Temporary": string;
  "Series ID": string;
  "Series Title": string;
  "Series Order": string;
  "TV Season Tags (No Spoilers)": string;
  "TV Season Genre Tags": string;
  "TV Season Spoiler Tags": string;
};

