export interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  maxSugar: number;
  maxSaturatedFat: number;
  waterOz: number;
}

export interface FoodLogEntry {
  id: string;
  name: string;
  category: 'protein' | 'carb' | 'fat' | 'sweet' | 'custom';
  servingNote: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  sugar: number;
  saturatedFat: number;
  addedPb2?: boolean;
  timestamp: string;
}

export interface DailyNutritionTotals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  sugar: number;
  saturatedFat: number;
}

export interface DailyNutritionStatus {
  totals: DailyNutritionTotals;
  remainingCalories: number;
  sugarOverLimit: boolean;
  saturatedFatOverLimit: boolean;
  isTargetHit: boolean;
  macroPercentages: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    sugar: number;
    saturatedFat: number;
  };
}

export interface BodyMeasurementEntry {
  id: string;
  date: string;
  weightLbs: number;
  waistIn: number;
  hipsIn: number;
  chestIn: number;
  thighIn: number;
  armIn: number;
  energyRating: number; // 1-10
  sleepHours: number;
  stepsCount: number;
  notes?: string;
}

export interface WeeklyConsistencyState {
  weeklyFullBodyCompleted: boolean;
  programmedWorkoutsCompleted: number; // Goal: >= 2 (up to 4 for full Upper/Lower split)
  macroDaysTrackedAndHit: number; // Goal: >= 5 (out of 7, 2 days flexible)
  cheatMode: 'one_day' | 'two_meals';
  cheatUsedCount: number; // Max 1 if 'one_day', max 2 if 'two_meals'
}

export interface DailyResettableState {
  lastActiveDate: string; // YYYY-MM-DD local date
  foodLogs: FoodLogEntry[];
  waterOz: number;
  macroDayCreditedToday: boolean;
  ankleWarmupChecks: Record<string, boolean>;
  flatShoesVerified: boolean;
  lissMinutesToday: number;
  setCompletionMap: Record<string, boolean>;
}

export const PRESCRIBED_TARGETS: MacroTargets = {
  calories: 2118,
  protein: 129,
  carbs: 282,
  fats: 60,
  maxSugar: 40,
  maxSaturatedFat: 20,
  waterOz: 120,
};

export const PB2_ADDON_MACROS = {
  calories: 60,
  protein: 6,
  carbs: 5,
  fats: 1.5,
  sugar: 1,
  saturatedFat: 0,
};

export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTimeUntilMidnight(now: Date = new Date()): {
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
} {
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diffMs = Math.max(0, midnight.getTime() - now.getTime());
  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const formatted = [hours, minutes, seconds]
    .map((n) => String(n).padStart(2, '0'))
    .join(':');
  return { hours, minutes, seconds, formatted };
}

export function applyMidnightResetIfNeeded(
  state: DailyResettableState,
  currentDateStr: string = getLocalDateString()
): { state: DailyResettableState; didReset: boolean } {
  if (state.lastActiveDate === currentDateStr) {
    return { state, didReset: false };
  }

  const resetSetMap: Record<string, boolean> = {};
  for (const key of Object.keys(state.setCompletionMap)) {
    resetSetMap[key] = false;
  }

  return {
    didReset: true,
    state: {
      lastActiveDate: currentDateStr,
      foodLogs: [],
      waterOz: 0,
      macroDayCreditedToday: false,
      ankleWarmupChecks: {
        ankle_circles: false,
        wall_stretch: false,
        band_resisted: false,
      },
      flatShoesVerified: false,
      lissMinutesToday: 0,
      setCompletionMap: resetSetMap,
    },
  };
}

export function applyPb2Addon(
  entry: Omit<FoodLogEntry, 'id' | 'timestamp'>,
  includePb2: boolean
): Omit<FoodLogEntry, 'id' | 'timestamp'> {
  if (!includePb2) return { ...entry, addedPb2: false };
  return {
    ...entry,
    name: entry.name.includes('PB2') ? entry.name : `${entry.name} + PB2 Powder`,
    calories: entry.calories + PB2_ADDON_MACROS.calories,
    protein: entry.protein + PB2_ADDON_MACROS.protein,
    carbs: entry.carbs + PB2_ADDON_MACROS.carbs,
    fats: Number((entry.fats + PB2_ADDON_MACROS.fats).toFixed(1)),
    sugar: entry.sugar + PB2_ADDON_MACROS.sugar,
    saturatedFat: entry.saturatedFat + PB2_ADDON_MACROS.saturatedFat,
    addedPb2: true,
  };
}

export function calculateDailyNutritionStatus(
  entries: FoodLogEntry[],
  targets: MacroTargets = PRESCRIBED_TARGETS
): DailyNutritionStatus {
  const totals = entries.reduce<DailyNutritionTotals>(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: Number((acc.protein + item.protein).toFixed(1)),
      carbs: Number((acc.carbs + item.carbs).toFixed(1)),
      fats: Number((acc.fats + item.fats).toFixed(1)),
      sugar: Number((acc.sugar + item.sugar).toFixed(1)),
      saturatedFat: Number((acc.saturatedFat + item.saturatedFat).toFixed(1)),
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0, sugar: 0, saturatedFat: 0 }
  );

  const remainingCalories = targets.calories - totals.calories;
  const sugarOverLimit = totals.sugar > targets.maxSugar;
  const saturatedFatOverLimit = totals.saturatedFat > targets.maxSaturatedFat;

  const caloriesWithinBand =
    totals.calories >= targets.calories * 0.85 && totals.calories <= targets.calories * 1.08;
  const proteinMet = totals.protein >= targets.protein * 0.9;
  const isTargetHit = caloriesWithinBand && proteinMet && !sugarOverLimit && !saturatedFatOverLimit;

  const pct = (val: number, max: number) => (max <= 0 ? 0 : Math.min(100, Math.round((val / max) * 100)));

  return {
    totals,
    remainingCalories,
    sugarOverLimit,
    saturatedFatOverLimit,
    isTargetHit,
    macroPercentages: {
      calories: pct(totals.calories, targets.calories),
      protein: pct(totals.protein, targets.protein),
      carbs: pct(totals.carbs, targets.carbs),
      fats: pct(totals.fats, targets.fats),
      sugar: pct(totals.sugar, targets.maxSugar),
      saturatedFat: pct(totals.saturatedFat, targets.maxSaturatedFat),
    },
  };
}

export function calculateInchChangeSummary(entries: BodyMeasurementEntry[]) {
  if (entries.length === 0) {
    return {
      totalInchesDelta: 0,
      waistDelta: 0,
      weightDelta: 0,
      avgEnergy: 0,
      avgSleep: 0,
      avgSteps: 0,
    };
  }

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const first = sorted[0];
  const latest = sorted[sorted.length - 1];

  const sumInches = (m: BodyMeasurementEntry) =>
    m.waistIn + m.hipsIn + m.chestIn + m.thighIn + m.armIn;

  const totalInchesDelta = Number((sumInches(latest) - sumInches(first)).toFixed(1));
  const waistDelta = Number((latest.waistIn - first.waistIn).toFixed(1));
  const weightDelta = Number((latest.weightLbs - first.weightLbs).toFixed(1));

  const avgEnergy = Number(
    (entries.reduce((acc, e) => acc + e.energyRating, 0) / entries.length).toFixed(1)
  );
  const avgSleep = Number(
    (entries.reduce((acc, e) => acc + e.sleepHours, 0) / entries.length).toFixed(1)
  );
  const avgSteps = Math.round(
    entries.reduce((acc, e) => acc + e.stepsCount, 0) / entries.length
  );

  return {
    totalInchesDelta,
    waistDelta,
    weightDelta,
    avgEnergy,
    avgSleep,
    avgSteps,
  };
}

export function evaluateWeeklyKeysToSuccess(state: WeeklyConsistencyState) {
  const workoutKeyMet =
    state.weeklyFullBodyCompleted && state.programmedWorkoutsCompleted >= 2;
  const macroKeyMet = state.macroDaysTrackedAndHit >= 5;
  const maxAllowedCheats = state.cheatMode === 'one_day' ? 1 : 2;
  const cheatKeyMet = state.cheatUsedCount <= maxAllowedCheats;

  const totalKeysMet =
    (workoutKeyMet ? 1 : 0) + (macroKeyMet ? 1 : 0) + (cheatKeyMet ? 1 : 0);

  return {
    workoutKeyMet,
    macroKeyMet,
    cheatKeyMet,
    maxAllowedCheats,
    remainingFlexibleMacroDays: Math.max(0, 7 - state.macroDaysTrackedAndHit),
    totalKeysMet,
    allKeysMet: totalKeysMet === 3,
  };
}

export function calculateCustomRecompMacros(params: {
  currentWeightLbs: number;
  targetWeightLbs: number;
  maintenanceCalories: number;
  deficitPercent: number; // e.g., 15 to 20
  proteinPerLbTarget: number; // e.g., 0.8 to 1.0
}): MacroTargets {
  const clampedDeficit = Math.max(10, Math.min(25, params.deficitPercent));
  const calories = Math.round(params.maintenanceCalories * (1 - clampedDeficit / 100));
  const protein = Math.round(params.targetWeightLbs * params.proteinPerLbTarget);
  const proteinCalories = protein * 4;
  const fatCalories = Math.round(calories * 0.255);
  const fats = Math.round(fatCalories / 9);
  const remainingCarbCalories = Math.max(0, calories - proteinCalories - fats * 9);
  const carbs = Math.round(remainingCarbCalories / 4);

  return {
    calories,
    protein,
    carbs,
    fats,
    maxSugar: 40,
    maxSaturatedFat: 20,
    waterOz: 120,
  };
}
