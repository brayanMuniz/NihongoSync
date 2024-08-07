export interface WanikaniJLPTData {
  Level: number[];
  N5: (number | null)[];
  N4: (number | null)[];
  N3: (number | null)[];
  N2: (number | null)[];
  N1: (number | null)[];
}



export type JLPTLevels = "N5" | "N4" | "N3" | "N2" | "N1";

// All credit goes to https://www.wkstats.com/charts/jlpt
export const wanikaniJLPTData: WanikaniJLPTData = {
  Level: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60],
  N5: [18.99, 44.30, 56.96, 68.35, 78.48, 87.34, 91.14, 94.94, 94.94, 98.73, 98.73, 98.73, 98.73, 98.73, 98.73, 100.00, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
  N4: [1.81, 6.63, 13.25, 21.08, 33.13, 44.58, 51.81, 58.43, 67.47, 77.11, 80.72, 86.14, 90.36, 90.36, 94.58, 96.99, 97.59, 98.19, 98.19, 98.19, 98.80, 98.80, 98.80, 99.40, 99.40, 99.40, 100.00, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
  N3: [0.00, 0.54, 1.63, 3.81, 5.99, 9.26, 12.53, 16.62, 21.80, 25.61, 31.61, 36.24, 39.51, 43.32, 47.14, 51.50, 56.40, 59.67, 62.40, 67.03, 70.84, 73.84, 76.84, 77.93, 81.74, 81.74, 84.74, 86.10, 87.74, 90.19, 91.83, 93.46, 94.28, 95.10, 96.19, 96.73, 97.28, 97.82, 98.09, 98.37, 98.37, 98.64, 98.64, 98.91, 98.91, 99.18, 99.18, 99.18, 99.18, 99.46, 100.00, null, null, null, null, null, null, null],
  N2: [0.00, 0.54, 1.09, 3.54, 5.18, 5.99, 7.36, 8.17, 8.99, 10.63, 12.81, 16.08, 18.53, 21.25, 24.25, 25.61, 28.07, 29.97, 34.06, 36.24, 38.15, 40.33, 42.51, 47.96, 50.68, 54.22, 55.59, 58.58, 60.49, 62.40, 65.67, 68.66, 71.93, 73.84, 76.29, 79.56, 81.74, 83.11, 83.92, 85.29, 86.38, 87.74, 89.65, 90.46, 92.10, 92.92, 94.01, 95.91, 95.91, 95.91, 100.00, null, null, null, null, null, null, null],
  N1: [0.00, 0.16, 0.24, 0.24, 0.41, 0.49, 0.57, 0.57, 0.73, 0.73, 0.89, 1.14, 1.79, 2.27, 2.52, 2.92, 3.41, 3.81, 4.55, 5.11, 5.84, 7.14, 8.20, 8.85, 9.90, 11.28, 12.50, 13.96, 15.67, 16.64, 18.18, 19.56, 20.70, 22.24, 23.54, 25.24, 27.11, 29.06, 31.33, 33.44, 34.98, 37.09, 39.20, 40.91, 42.94, 45.21, 47.40, 49.51, 52.19, 54.38, 55.76, 58.52, 61.04, 63.64, 66.23, 68.91, 71.43, 74.03, 76.70, 79.14]
};


export const getJLPTLevelFromWKLevel = (wanikaniLevel: number): JLPTLevels => {
  if (wanikaniLevel <= 4) return "N5"
  if (wanikaniLevel >= 5 && wanikaniLevel <= 15) return "N4";
  if (wanikaniLevel >= 16 && wanikaniLevel <= 25) return "N3";
  if (wanikaniLevel >= 26 && wanikaniLevel <= 50) return "N2";
  return "N1"; // For levels above 50
};

