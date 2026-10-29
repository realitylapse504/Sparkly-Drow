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
  applyWeeklyResetIfNeeded,
  resetWorkoutSessionForDay,
  getLocalDateString,
  getWeekStartDateString,
  getTimeUntilMidnight,
  type FoodLogEntry,
  type BodyMeasurementEntry,
} from './recompLogic';
import {
  WORKOUT_PLANS,
  createCustomWorkoutPlan,
  resolveWeeklySchedule,
  buildDefaultSetLogs,
  getDailyQuestsForDate,
  createCustomDailyQuest,
} from '../data/programData';

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

test('applyMidnightResetIfNeeded clears daily food, water, warm-ups, daily quests, LISS, and set checks when date advances past midnight', () => {
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
    completedQuestIdsToday: ['dq_spine_hip_opener', 'dq_glute_core_spark'],
    questShuffleIndex: 2,
  };

  // Same date -> no reset
  const sameDayResult = applyMidnightResetIfNeeded(populatedDay, '2026-10-21');
  assert.equal(sameDayResult.didReset, false);
  assert.equal(sameDayResult.state.waterOz, 96);
  assert.equal(sameDayResult.state.foodLogs.length, 1);
  assert.equal(sameDayResult.state.completedQuestIdsToday?.length, 2);

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
  assert.equal(nextDayResult.state.completedQuestIdsToday?.length, 0);
  assert.equal(nextDayResult.state.questShuffleIndex, 0);
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

test('createCustomWorkoutPlan and resolveWeeklySchedule persist custom workouts and allow scheduling onto any weekday', () => {
  const customPlan = createCustomWorkoutPlan({
    title: 'Glute & Core Sparkle',
    subtitle: 'Hip thrusts, cable kickbacks, and planks',
    ankleProtected: true,
    exercises: [
      { name: 'Barbell Hip Thrust', sets: 4, reps: '8-10', defaultWeightLbs: 135, tip: 'Pause 1s at top' },
      { name: 'Cable Glute Kickback', sets: 3, reps: '12-15', defaultWeightLbs: 30, tip: 'Keep hips square' },
    ],
  });

  assert.ok(customPlan.id.startsWith('custom_'));
  assert.equal(customPlan.isCustom, true);
  assert.equal(customPlan.ankleProtected, true);
  assert.equal(customPlan.exercises.length, 2);

  const logs = buildDefaultSetLogs([...WORKOUT_PLANS, customPlan]);
  const ex1Id = customPlan.exercises[0].id;
  const ex2Id = customPlan.exercises[1].id;
  assert.equal(logs[`${ex1Id}_set_1`]?.weightLbs, 135);
  assert.equal(logs[`${ex2Id}_set_3`]?.repsCompleted, '12-15');

  // Default schedule: Wed = full_body_session, Thu = Rest & Walk, Fri = upper_b, Sat = lower_b
  const defaultSched = resolveWeeklySchedule([customPlan], {});
  assert.equal(defaultSched.find((d) => d.day === 'Wed')?.workoutId, 'full_body_session');
  assert.equal(defaultSched.find((d) => d.day === 'Thu')?.session, 'Rest & Walk');
  assert.equal(defaultSched.find((d) => d.day === 'Fri')?.workoutId, 'upper_b');
  assert.equal(defaultSched.find((d) => d.day === 'Sat')?.workoutId, 'lower_b');

  // Schedule custom workout onto Thursday and Sunday
  const overridden = resolveWeeklySchedule([customPlan], {
    Thu: customPlan.id,
    Sun: 'upper_a',
  });
  const thuSlot = overridden.find((d) => d.day === 'Thu');
  assert.equal(thuSlot?.workoutId, customPlan.id);
  assert.equal(thuSlot?.session, 'Glute & Core Sparkle');
  assert.equal(thuSlot?.type, 'Custom Workout');
  assert.equal(thuSlot?.isRest, false);

  const sunSlot = overridden.find((d) => d.day === 'Sun');
  assert.equal(sunSlot?.workoutId, 'upper_a');
  assert.equal(sunSlot?.session, 'Upper Body A');
});

test('getDailyQuestsForDate and createCustomDailyQuest provide warm-up degree quests with shuffle and custom additions', () => {
  const questsDay1 = getDailyQuestsForDate('2026-10-26', 0);
  assert.equal(questsDay1.length, 3);
  assert.ok(questsDay1[0].title.length > 0);
  assert.ok(questsDay1[0].prescription.length > 0);

  const shuffled = getDailyQuestsForDate('2026-10-26', 1);
  assert.equal(shuffled.length, 3);
  assert.notEqual(questsDay1[0].id, shuffled[0].id);

  const customQuest = createCustomDailyQuest({
    title: 'Wrist & Scapula Warm-Up',
    prescription: '10 wrist circles + 12 band pull-aparts',
    durationLabel: '3 mins',
    category: 'Mobility Flow',
  });
  assert.equal(customQuest.isCustom, true);
  const withCustom = getDailyQuestsForDate('2026-10-26', 0, [customQuest]);
  assert.equal(withCustom.length, 4);
  assert.equal(withCustom[3].title, 'Wrist & Scapula Warm-Up');
});

test('getWeekStartDateString and applyWeeklyResetIfNeeded reset completed workouts and weekly keys on new Monday weeks', () => {
  // Oct 25, 2026 is a Sunday -> Monday of that week is 2026-10-19
  const sun = new Date(2026, 9, 25, 14, 0, 0);
  assert.equal(getWeekStartDateString(sun), '2026-10-19');

  // Oct 26, 2026 is a Monday -> Monday of that week is 2026-10-26
  const mon = new Date(2026, 9, 26, 8, 0, 0);
  assert.equal(getWeekStartDateString(mon), '2026-10-26');

  const activeWeekState = {
    lastActiveWeekStart: '2026-10-19',
    completedSessionsThisWeek: ['upper_a', 'lower_a', 'full_body_session'],
    weeklyConsistency: {
      weeklyFullBodyCompleted: true,
      programmedWorkoutsCompleted: 2,
      macroDaysTrackedAndHit: 5,
      cheatMode: 'one_day' as const,
      cheatUsedCount: 1,
    },
    weeklyHistory: [],
  };

  // Same week -> no reset
  const sameWeek = applyWeeklyResetIfNeeded(activeWeekState, '2026-10-19', '2026-10-24');
  assert.equal(sameWeek.didReset, false);
  assert.equal(sameWeek.state.completedSessionsThisWeek.length, 3);

  // New week (Monday 2026-10-26) -> resets weekly workouts & keys and archives previous week
  const newWeek = applyWeeklyResetIfNeeded(activeWeekState, '2026-10-26', '2026-10-26');
  assert.equal(newWeek.didReset, true);
  assert.equal(newWeek.state.lastActiveWeekStart, '2026-10-26');
  assert.equal(newWeek.state.completedSessionsThisWeek.length, 0);
  assert.equal(newWeek.state.weeklyConsistency.weeklyFullBodyCompleted, false);
  assert.equal(newWeek.state.weeklyConsistency.programmedWorkoutsCompleted, 0);
  assert.equal(newWeek.state.weeklyConsistency.macroDaysTrackedAndHit, 0);
  assert.equal(newWeek.state.weeklyConsistency.cheatUsedCount, 0);
  assert.equal(newWeek.state.weeklyConsistency.cheatMode, 'one_day');
  assert.equal(newWeek.state.weeklyHistory.length, 1);
  assert.equal(newWeek.state.weeklyHistory[0].weekStartDate, '2026-10-19');
  assert.equal(newWeek.state.weeklyHistory[0].workoutsCompletedCount, 3);
  assert.equal(newWeek.state.weeklyHistory[0].keysMetCount, 3);
});

test('resetWorkoutSessionForDay resets only the currently highlighted day workout and its sets without clearing other days', () => {
  const result = resetWorkoutSessionForDay({
    workoutId: 'lower_a',
    exerciseIds: ['la_1', 'la_2', 'la_3', 'la_4', 'la_5'],
    completedSessionsThisWeek: ['upper_a', 'lower_a'],
    weeklyConsistency: {
      weeklyFullBodyCompleted: false,
      programmedWorkoutsCompleted: 2,
      macroDaysTrackedAndHit: 3,
      cheatMode: 'two_meals',
      cheatUsedCount: 0,
    },
    setCompletionMap: {
      ua_1_set_1: true,
      la_1_set_1: true,
      la_2_set_1: true,
    },
  });

  // lower_a removed, upper_a preserved
  assert.deepEqual(result.completedSessionsThisWeek, ['upper_a']);
  assert.equal(result.weeklyConsistency.programmedWorkoutsCompleted, 1);
  // lower_a sets reset to false, upper_a sets preserved
  assert.equal(result.setCompletionMap.la_1_set_1, false);
  assert.equal(result.setCompletionMap.la_2_set_1, false);
  assert.equal(result.setCompletionMap.ua_1_set_1, true);
});

test('all workouts and exercises use specific movement names with no broad or "or" exercise titles', () => {
  assert.equal(WORKOUT_PLANS.length, 5);
  for (const plan of WORKOUT_PLANS) {
    assert.ok(plan.exercises.length >= 4, `${plan.id} should have at least 4 specific exercises`);
    for (const ex of plan.exercises) {
      assert.equal(
        /\bor\b/i.test(ex.name),
        false,
        `Exercise "${ex.name}" in ${plan.id} should not contain "or"`
      );
      assert.equal(
        /circuit|finisher|primary compound lift/i.test(ex.name),
        false,
        `Exercise "${ex.name}" in ${plan.id} should not use a broad category name`
      );
      if (ex.ankleSwapOption) {
        assert.equal(
          /\bor\b/i.test(ex.ankleSwapOption.swapName),
          false,
          `Swap exercise "${ex.ankleSwapOption.swapName}" should be specific`
        );
      }
    }
  }
});




