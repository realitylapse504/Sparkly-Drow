import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PRESCRIBED_TARGETS,
  applyPb2Addon,
  calculateDailyNutritionStatus,
  calculateInchChangeSummary,
  evaluateWeeklyKeysToSuccess,
  calculateCustomRecompMacros,
  applyMidnightResetIfNeeded,
  getLocalDateString,
  getTimeUntilMidnight,
  type FoodLogEntry,
  type BodyMeasurementEntry,
} from './recompLogic';

test('prescribed targets match exact nutrition brief (2118 kcal, 129P, 282C, 60F, <40 sugar, <20 sat fat, 120oz water)', () => {
  assert.equal(PRESCRIBED_TARGETS.calories, 2118);
  assert.equal(PRESCRIBED_TARGETS.protein, 129);
  assert.equal(PRESCRIBED_TARGETS.carbs, 282);
  assert.equal(PRESCRIBED_TARGETS.fats, 60);
  assert.equal(PRESCRIBED_TARGETS.maxSugar, 40);
  assert.equal(PRESCRIBED_TARGETS.maxSaturatedFat, 20);
  assert.equal(PRESCRIBED_TARGETS.waterOz, 120);
});

test('applyPb2Addon adds 60 kcal and 6g protein to protein shakes', () => {
  const baseShake = {
    name: 'Premier Protein Shake',
    category: 'protein' as const,
    servingNote: '1 bottle (11 oz)',
    calories: 160,
    protein: 30,
    carbs: 5,
    fats: 3,
    sugar: 1,
    saturatedFat: 1,
  };

  const withPb2 = applyPb2Addon(baseShake, true);
  assert.equal(withPb2.calories, 220);
  assert.equal(withPb2.protein, 36);
  assert.equal(withPb2.sugar, 2);
  assert.equal(withPb2.addedPb2, true);
  assert.ok(withPb2.name.includes('PB2'));
});

test('calculateDailyNutritionStatus flags sugar > 40g and saturated fat > 20g', () => {
  const entries: FoodLogEntry[] = [
    {
      id: '1',
      name: 'Ground Turkey Bowl',
      category: 'protein',
      servingNote: '6 oz',
      calories: 1050,
      protein: 70,
      carbs: 140,
      fats: 22,
      sugar: 18,
      saturatedFat: 8,
      timestamp: '08:00 AM',
    },
    {
      id: '2',
      name: '93% Lean Ground Beef & Sweet Potato',
      category: 'protein',
      servingNote: '6 oz + 200g',
      calories: 1040,
      protein: 60,
      carbs: 138,
      fats: 35,
      sugar: 15,
      saturatedFat: 10,
      timestamp: '01:00 PM',
    },
  ];

  const status = calculateDailyNutritionStatus(entries);
  assert.equal(status.totals.calories, 2090);
  assert.equal(status.totals.protein, 130);
  assert.equal(status.sugarOverLimit, false);
  assert.equal(status.saturatedFatOverLimit, false);
  assert.equal(status.isTargetHit, true);

  const overSugarStatus = calculateDailyNutritionStatus([
    ...entries,
    {
      id: '3',
      name: 'High Sugar Item',
      category: 'sweet',
      servingNote: '1 bar',
      calories: 100,
      protein: 2,
      carbs: 20,
      fats: 2,
      sugar: 12,
      saturatedFat: 1,
      timestamp: '06:00 PM',
    },
  ]);
  assert.equal(overSugarStatus.totals.sugar, 45);
  assert.equal(overSugarStatus.sugarOverLimit, true);
  assert.equal(overSugarStatus.isTargetHit, false);
});

test('evaluateWeeklyKeysToSuccess validates 1x Full-Body + 2 split workouts, 5/7 macro days, and cheat options', () => {
  const passingWeek = evaluateWeeklyKeysToSuccess({
    weeklyFullBodyCompleted: true,
    programmedWorkoutsCompleted: 2,
    macroDaysTrackedAndHit: 5,
    cheatMode: 'two_meals',
    cheatUsedCount: 2,
  });
  assert.equal(passingWeek.workoutKeyMet, true);
  assert.equal(passingWeek.macroKeyMet, true);
  assert.equal(passingWeek.cheatKeyMet, true);
  assert.equal(passingWeek.remainingFlexibleMacroDays, 2);
  assert.equal(passingWeek.allKeysMet, true);

  const overCheatDay = evaluateWeeklyKeysToSuccess({
    weeklyFullBodyCompleted: true,
    programmedWorkoutsCompleted: 3,
    macroDaysTrackedAndHit: 5,
    cheatMode: 'one_day',
    cheatUsedCount: 2,
  });
  assert.equal(overCheatDay.cheatKeyMet, false);
  assert.equal(overCheatDay.allKeysMet, false);
});

test('calculateInchChangeSummary computes inch deltas and energy/sleep averages accurately', () => {
  const logs: BodyMeasurementEntry[] = [
    {
      id: 'm1',
      date: '2026-10-01',
      weightLbs: 174.0,
      waistIn: 33.5,
      hipsIn: 39.5,
      chestIn: 40.0,
      thighIn: 23.0,
      armIn: 13.5,
      energyRating: 6,
      sleepHours: 7.0,
      stepsCount: 7800,
    },
    {
      id: 'm2',
      date: '2026-10-22',
      weightLbs: 171.2,
      waistIn: 32.0,
      hipsIn: 38.8,
      chestIn: 40.2,
      thighIn: 22.7,
      armIn: 13.8,
      energyRating: 9,
      sleepHours: 8.2,
      stepsCount: 9400,
    },
  ];

  const summary = calculateInchChangeSummary(logs);
  assert.equal(summary.waistDelta, -1.5);
  assert.equal(summary.totalInchesDelta, -2.0);
  assert.equal(summary.weightDelta, -2.8);
  assert.equal(summary.avgEnergy, 7.5);
  assert.equal(summary.avgSleep, 7.6);
  assert.equal(summary.avgSteps, 8600);
});

test('calculateCustomRecompMacros calculates 15-20% deficit and 0.8-1.0g/lb protein', () => {
  const custom = calculateCustomRecompMacros({
    currentWeightLbs: 170,
    targetWeightLbs: 155,
    maintenanceCalories: 2550,
    deficitPercent: 17,
    proteinPerLbTarget: 0.9,
  });
  assert.equal(custom.calories, 2117);
  assert.equal(custom.protein, 140);
  assert.equal(custom.waterOz, 120);
});

test('applyMidnightResetIfNeeded clears daily food, water, warm-ups, LISS, and set checks when date advances past midnight', () => {
  const populatedDay = {
    lastActiveDate: '2026-10-21',
    foodLogs: [
      {
        id: 'f1',
        name: 'Chicken Breast',
        category: 'protein' as const,
        servingNote: '5 oz',
        calories: 220,
        protein: 42,
        carbs: 0,
        fats: 4.5,
        sugar: 0,
        saturatedFat: 1.2,
        timestamp: '12:00 PM',
      },
    ],
    waterOz: 96,
    macroDayCreditedToday: true,
    ankleWarmupChecks: { ankle_circles: true, wall_stretch: true, band_resisted: true },
    flatShoesVerified: true,
    lissMinutesToday: 30,
    setCompletionMap: { ua_1_set_1: true, ua_1_set_2: true },
  };

  // Same date -> no reset
  const sameDayResult = applyMidnightResetIfNeeded(populatedDay, '2026-10-21');
  assert.equal(sameDayResult.didReset, false);
  assert.equal(sameDayResult.state.waterOz, 96);
  assert.equal(sameDayResult.state.foodLogs.length, 1);

  // Next day (past midnight) -> full daily reset
  const nextDayResult = applyMidnightResetIfNeeded(populatedDay, '2026-10-22');
  assert.equal(nextDayResult.didReset, true);
  assert.equal(nextDayResult.state.lastActiveDate, '2026-10-22');
  assert.equal(nextDayResult.state.waterOz, 0);
  assert.equal(nextDayResult.state.foodLogs.length, 0);
  assert.equal(nextDayResult.state.macroDayCreditedToday, false);
  assert.equal(nextDayResult.state.flatShoesVerified, false);
  assert.equal(nextDayResult.state.lissMinutesToday, 0);
  assert.equal(nextDayResult.state.ankleWarmupChecks.ankle_circles, false);
  assert.equal(nextDayResult.state.setCompletionMap.ua_1_set_1, false);
});

test('getLocalDateString and getTimeUntilMidnight return properly formatted values', () => {
  const sampleDate = new Date(2026, 9, 22, 23, 30, 0); // Oct 22, 2026 23:30:00
  assert.equal(getLocalDateString(sampleDate), '2026-10-22');
  const countdown = getTimeUntilMidnight(sampleDate);
  assert.equal(countdown.hours, 0);
  assert.equal(countdown.minutes, 30);
  assert.equal(countdown.seconds, 0);
  assert.equal(countdown.formatted, '00:30:00');
});
