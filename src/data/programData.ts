import type { FoodLogEntry, BodyMeasurementEntry, WeeklyConsistencyState } from '../utils/recompLogic';

export interface ExercisePrescription {
  id: string;
  order: number;
  name: string;
  sets: number;
  reps: string;
  tip?: string;
  ankleSwapOption?: {
    swapName: string;
    swapReps: string;
    swapReason: string;
  };
  defaultWeightLbs: number;
}

export interface WorkoutDayPlan {
  id: string;
  dayLabel: string;
  shortTabLabel?: string;
  title: string;
  subtitle: string;
  ankleProtected: boolean;
  focusSummary: string;
  isCustom?: boolean;
  exercises: ExercisePrescription[];
}

export interface ApprovedFoodItem {
  id: string;
  name: string;
  category: 'protein' | 'carb' | 'fat' | 'sweet';
  subGroup: string;
  servingNote: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  sugar: number;
  saturatedFat: number;
  glutenFreeNote?: boolean;
  supportsPb2Addon?: boolean;
  variants?: string[];
}

export const FOUR_CORE_PILLARS = [
  {
    number: '01',
    title: 'Progressive Strength',
    role: 'The Stimulus',
    summary: 'Challenge your muscles so they grow while burning fat for fuel.',
    keyPoints: [
      'Compound Moves: Prioritize multi-joint lifts (presses, rows, squats, RDLs).',
      'Progressive Overload: Gradually add a little weight, an extra rep, or cleaner form over time.',
      'Consistency: 3–5 lifts/week (1x Full-Body Strength + 2–4 Upper/Lower days).',
    ],
  },
  {
    number: '02',
    title: 'Smart Nutrition',
    role: 'The Fuel',
    summary: 'A gentle calorie deficit burns fat while high protein builds lean muscle.',
    keyPoints: [
      'Sweet-Spot Deficit: 2,118 calories/day keeps energy high without crash dieting.',
      'High Protein: 129g/day repairs muscle and keeps you full.',
      'Daily Guardrails: 282g carbs, 60g fats, under 40g sugar, and under 20g saturated fat.',
    ],
  },
  {
    number: '03',
    title: 'Sleep & Recovery',
    role: 'The Growth Phase',
    summary: 'Muscles repair and tone while you rest and sleep.',
    keyPoints: [
      '7–9 Hours Sleep: Keeps stress hormones (cortisol) low and recovery high.',
      'Rest Days: Mid-week and weekend rest keeps your joints and left ankle happy.',
    ],
  },
  {
    number: '04',
    title: 'Daily Steps & Low-Impact Cardio',
    role: 'The Accelerator',
    summary: 'Easy daily movement boosts fat loss without draining your lifting energy.',
    keyPoints: [
      'Daily Steps (NEAT): Aim for 8,000–10,000 steps through everyday walking.',
      'Ankle-Safe Cardio: Stick to Incline Walking, Bike, or Elliptical (skip running & jumping).',
    ],
  },
];

export const WEEKLY_SPLIT_OVERVIEW = [
  { day: 'Mon', session: 'Upper Body A', type: 'Strength Push/Pull', isRest: false, workoutId: 'upper_a' as const },
  { day: 'Tue', session: 'Lower Body A', type: 'Glutes & Hamstrings', isRest: false, workoutId: 'lower_a' as const },
  { day: 'Wed', session: 'Full-Body & Core', type: 'Compound & Stability', isRest: false, workoutId: 'full_body_session' as const },
  { day: 'Thu', session: 'Rest & Walk', type: 'Light Steps', isRest: true },
  { day: 'Fri', session: 'Upper Body B', type: 'Sculpt & Hypertrophy', isRest: false, workoutId: 'upper_b' as const },
  { day: 'Sat', session: 'Lower Body B', type: 'Quads & Stability', isRest: false, workoutId: 'lower_b' as const },
  { day: 'Sun', session: 'Rest & Recharge', type: 'Sleep & Reset', isRest: true },
];

export const ANKLE_WARMUP_PROTOCOL = [
  {
    id: 'ankle_circles',
    title: 'Ankle Circles',
    prescription: '10 each way',
    detail: 'Slow, easy circles to warm up the joint.',
  },
  {
    id: 'wall_stretch',
    title: 'Calf Wall Stretch',
    prescription: '30 sec hold',
    detail: 'Gentle stretch — never force into pain.',
    hasTimer: true,
    durationSeconds: 30,
  },
  {
    id: 'band_resisted',
    title: 'Band Ankle Pulls',
    prescription: '12–15 light pulls',
    detail: 'Inward & outward band pulls to wake up stabilizers.',
  },
];

export const ANKLE_SAFETY_RULES = [
  {
    title: 'Low-Impact Cardio Only',
    detail: 'Incline Walk, Bike, or Elliptical — skip running, jump rope, or box jumps.',
  },
  {
    title: 'Flat Shoes on Leg Day',
    detail: 'Wear Vans, Converse, or flat lifters instead of squishy running shoes.',
  },
];

export const WORKOUT_PLANS: WorkoutDayPlan[] = [
  {
    id: 'upper_a',
    dayLabel: 'Monday · Upper A',
    title: 'Upper Body A (Strength)',
    subtitle: 'Controlled reps and steady progress.',
    ankleProtected: false,
    focusSummary: 'Chest, back, shoulders, and arms.',
    exercises: [
      {
        id: 'ua_1',
        order: 1,
        name: 'Barbell or Dumbbell Bench Press',
        sets: 3,
        reps: '6–8 reps',
        tip: 'Controlled lower, strong press up.',
        defaultWeightLbs: 65,
      },
      {
        id: 'ua_2',
        order: 2,
        name: 'Lat Pulldown or Assisted Pull-Ups',
        sets: 3,
        reps: '8–10 reps',
        tip: 'Pull elbows down toward your sides.',
        defaultWeightLbs: 70,
      },
      {
        id: 'ua_3',
        order: 3,
        name: 'Seated Dumbbell Shoulder Press',
        sets: 3,
        reps: '8–10 reps',
        tip: 'Keep back supported against the bench.',
        defaultWeightLbs: 20,
      },
      {
        id: 'ua_4',
        order: 4,
        name: 'Seated Cable Rows',
        sets: 3,
        reps: '10–12 reps',
        tip: 'Squeeze shoulder blades together at the end.',
        defaultWeightLbs: 70,
      },
      {
        id: 'ua_5',
        order: 5,
        name: 'Incline Dumbbell Bicep Curls',
        sets: 2,
        reps: '12–15 reps',
        tip: 'Keep elbows steady at your sides.',
        defaultWeightLbs: 15,
      },
      {
        id: 'ua_6',
        order: 6,
        name: 'Rope Tricep Pushdowns',
        sets: 2,
        reps: '12–15 reps',
        tip: 'Flare the rope slightly at the bottom.',
        defaultWeightLbs: 30,
      },
    ],
  },
  {
    id: 'lower_a',
    dayLabel: 'Tuesday · Lower A (Ankle-Safe)',
    title: 'Lower Body A (Glutes & Hamstrings)',
    subtitle: 'Builds legs & glutes while keeping your left ankle stress-free.',
    ankleProtected: true,
    focusSummary: 'Glutes, hamstrings, quads, and gentle calves.',
    exercises: [
      {
        id: 'la_1',
        order: 1,
        name: 'Leg Press (Medium Foot Placement)',
        sets: 3,
        reps: '8–10 reps',
        tip: 'Keep heels flat on the platform.',
        defaultWeightLbs: 135,
      },
      {
        id: 'la_2',
        order: 2,
        name: 'Romanian Deadlifts (RDLs)',
        sets: 3,
        reps: '8–10 reps',
        tip: 'Feet stay planted; hinge hips back for glutes & hamstrings.',
        defaultWeightLbs: 75,
      },
      {
        id: 'la_3',
        order: 3,
        name: 'Seated Leg Extensions',
        sets: 3,
        reps: '12–15 reps',
        tip: 'Zero ankle load — pause briefly at the top.',
        defaultWeightLbs: 60,
      },
      {
        id: 'la_4',
        order: 4,
        name: 'Lying or Seated Leg Curls',
        sets: 3,
        reps: '12–15 reps',
        tip: 'Smooth curl and controlled return.',
        defaultWeightLbs: 55,
      },
      {
        id: 'la_5',
        order: 5,
        name: 'Seated Calf Raises',
        sets: 2,
        reps: '12–15 reps',
        tip: 'Go slow with light weight; skip deep bottom stretch if ankle feels stiff.',
        defaultWeightLbs: 35,
      },
    ],
  },
  {
    id: 'full_body_session',
    dayLabel: 'Wednesday · Full-Body & Core',
    title: 'Full-Body Strength & Core (1x/wk)',
    subtitle: 'Compound strength, upper push/pull circuit, and core & ankle stability.',
    ankleProtected: true,
    focusSummary: 'Compound strength, upper push/pull circuit, and core/ankle stability.',
    exercises: [
      {
        id: 'fb_1',
        order: 1,
        name: 'Primary Compound Lift (Box Squat, RDL, or Incline Press)',
        sets: 4,
        reps: '6–8 reps',
        tip: 'Flat shoes on & form dialed in.',
        defaultWeightLbs: 85,
      },
      {
        id: 'fb_2',
        order: 2,
        name: 'Upper Body Push / Pull Circuit',
        sets: 3,
        reps: '8–10 reps',
        tip: 'Steady pace and clean reps.',
        defaultWeightLbs: 40,
      },
      {
        id: 'fb_3',
        order: 3,
        name: 'Core & Ankle Balance Finisher',
        sets: 3,
        reps: '12 reps',
        tip: 'Controlled core & stability work.',
        defaultWeightLbs: 20,
      },
    ],
  },
  {
    id: 'upper_b',
    dayLabel: 'Friday · Upper B',
    title: 'Upper Body B (Sculpt & Pump)',
    subtitle: 'Higher reps for muscle tone and posture.',
    ankleProtected: false,
    focusSummary: 'Upper chest, back, side delts, and arms.',
    exercises: [
      {
        id: 'ub_1',
        order: 1,
        name: 'Incline Dumbbell Press',
        sets: 3,
        reps: '10–12 reps',
        tip: 'Low incline bench angle (30°).',
        defaultWeightLbs: 25,
      },
      {
        id: 'ub_2',
        order: 2,
        name: 'Single-Arm Dumbbell Rows',
        sets: 3,
        reps: '10–12 reps',
        tip: 'Support knee and hand on the bench.',
        defaultWeightLbs: 30,
      },
      {
        id: 'ub_3',
        order: 3,
        name: 'Dumbbell Lateral Raises',
        sets: 3,
        reps: '12–15 reps',
        tip: 'Lift to shoulder height with soft elbows.',
        defaultWeightLbs: 10,
      },
      {
        id: 'ub_4',
        order: 4,
        name: 'Cable Face Pulls',
        sets: 3,
        reps: '15 reps',
        tip: 'Pull toward forehead — great for shoulder health.',
        defaultWeightLbs: 25,
      },
      {
        id: 'ub_5',
        order: 5,
        name: 'Hammer Curls',
        sets: 2,
        reps: '12–15 reps',
        tip: 'Palms facing each other.',
        defaultWeightLbs: 15,
      },
      {
        id: 'ub_6',
        order: 6,
        name: 'Overhead Dumbbell Tricep Extension',
        sets: 2,
        reps: '12–15 reps',
        tip: 'Keep elbows pointing forward.',
        defaultWeightLbs: 25,
      },
    ],
  },
  {
    id: 'lower_b',
    dayLabel: 'Saturday · Lower B (Ankle-Safe)',
    title: 'Lower Body B (Quads & Stability)',
    subtitle: 'Zero high-impact landings; built-in left ankle options.',
    ankleProtected: true,
    focusSummary: 'Box/hack squats, hip thrusts, split squats, and calves.',
    exercises: [
      {
        id: 'lb_1',
        order: 1,
        name: 'Goblet Box Squats or Hack Squat',
        sets: 3,
        reps: '8–10 reps',
        tip: 'Box depth protects your ankle while firing up the quads.',
        defaultWeightLbs: 45,
      },
      {
        id: 'lb_2',
        order: 2,
        name: 'Glute Bridges or Barbell Hip Thrusts',
        sets: 3,
        reps: '10–12 reps',
        tip: 'Pause 1 second at the top squeeze.',
        defaultWeightLbs: 95,
      },
      {
        id: 'lb_3',
        order: 3,
        name: 'Walking Lunges or Low Step-Ups',
        sets: 2,
        reps: '10 reps / leg',
        tip: 'Use a low box or swap below if your ankle feels wobbly.',
        ankleSwapOption: {
          swapName: 'Bulgarian Split Squats (Rear Foot Supported)',
          swapReps: '10 reps / leg',
          swapReason: 'Ankle-Safe Swap: Front foot stays planted with zero stepping impact.',
        },
        defaultWeightLbs: 15,
      },
      {
        id: 'lb_4',
        order: 4,
        name: 'Standing Machine Calf or Tibialis Raises',
        sets: 2,
        reps: '12–15 reps',
        tip: 'Slow, controlled reps.',
        defaultWeightLbs: 40,
      },
    ],
  },
];

export interface SetLogEntry {
  weightLbs: number;
  repsCompleted: string;
  completed: boolean;
}

export function buildDefaultSetLogs(
  plans: WorkoutDayPlan[] = WORKOUT_PLANS
): Record<string, SetLogEntry> {
  const initial: Record<string, SetLogEntry> = {};
  for (const plan of plans) {
    for (const ex of plan.exercises) {
      for (let s = 1; s <= ex.sets; s++) {
        initial[`${ex.id}_set_${s}`] = {
          weightLbs: ex.defaultWeightLbs,
          repsCompleted: ex.reps.replace(' reps', ''),
          completed: false,
        };
      }
    }
  }
  return initial;
}

export function createCustomWorkoutPlan(input: {
  id?: string;
  title: string;
  subtitle?: string;
  ankleProtected?: boolean;
  exercises: Array<{
    name: string;
    sets: number;
    reps: string;
    defaultWeightLbs: number;
    tip?: string;
  }>;
}): WorkoutDayPlan {
  const cleanTitle = input.title.trim() || 'Custom Workout';
  const cleanSubtitle =
    input.subtitle?.trim() || 'Custom saved workout session.';
  const workoutId =
    input.id || `custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

  return {
    id: workoutId,
    dayLabel: `Custom · ${cleanTitle}`,
    shortTabLabel: cleanTitle,
    title: cleanTitle,
    subtitle: cleanSubtitle,
    ankleProtected: Boolean(input.ankleProtected),
    focusSummary: cleanSubtitle,
    isCustom: true,
    exercises: input.exercises.map((ex, idx) => ({
      id: `${workoutId}_ex_${idx + 1}`,
      order: idx + 1,
      name: ex.name.trim() || `Exercise ${idx + 1}`,
      sets: Math.max(1, Math.min(10, Math.round(ex.sets) || 3)),
      reps: ex.reps.trim() || '10–12 reps',
      defaultWeightLbs: Math.max(0, Number(ex.defaultWeightLbs) || 0),
      tip: ex.tip?.trim() || undefined,
    })),
  };
}

export function resolveWeeklySchedule(
  customWorkouts: WorkoutDayPlan[] = [],
  scheduleOverrides: Record<string, string> = {}
) {
  const allWorkouts = [...WORKOUT_PLANS, ...customWorkouts];
  const workoutMap = new Map(allWorkouts.map((w) => [w.id, w]));

  return WEEKLY_SPLIT_OVERVIEW.map((defaultSlot) => {
    const overrideId = scheduleOverrides[defaultSlot.day];
    if (!overrideId) {
      return defaultSlot;
    }
    if (overrideId === 'rest_walk') {
      return {
        day: defaultSlot.day,
        session: 'Rest & Walk',
        type: 'Light Steps',
        isRest: true,
        workoutId: undefined,
      };
    }
    if (overrideId === 'rest_recharge') {
      return {
        day: defaultSlot.day,
        session: 'Rest & Recharge',
        type: 'Sleep & Reset',
        isRest: true,
        workoutId: undefined,
      };
    }
    const matched = workoutMap.get(overrideId);
    if (!matched) {
      return defaultSlot;
    }
    return {
      day: defaultSlot.day,
      session: matched.shortTabLabel || matched.title.replace(/\s*\(.*\)/, ''),
      type: matched.isCustom ? 'Custom Workout' : matched.focusSummary.split(',')[0],
      isRest: false,
      workoutId: matched.id,
    };
  });
}

export const APPROVED_FOOD_CATALOG: ApprovedFoodItem[] = [
  // LEAN PROTEINS
  {
    id: 'fp_ground_turkey',
    name: 'Ground Turkey',
    category: 'protein',
    subGroup: 'Lean Protein',
    servingNote: '5 oz cooked',
    calories: 210,
    protein: 31,
    carbs: 0,
    fats: 9,
    sugar: 0,
    saturatedFat: 2.5,
  },
  {
    id: 'fp_ground_beef_93',
    name: '93% Lean Ground Beef',
    category: 'protein',
    subGroup: 'Lean Protein',
    servingNote: '5 oz cooked',
    calories: 230,
    protein: 30,
    carbs: 0,
    fats: 11,
    sugar: 0,
    saturatedFat: 4.5,
  },
  {
    id: 'fp_chicken',
    name: 'Chicken Breast',
    category: 'protein',
    subGroup: 'Lean Protein',
    servingNote: '5 oz cooked',
    calories: 220,
    protein: 42,
    carbs: 0,
    fats: 4.5,
    sugar: 0,
    saturatedFat: 1.2,
  },
  {
    id: 'fp_fish',
    name: 'Fish (White Fish / Salmon)',
    category: 'protein',
    subGroup: 'Lean Protein',
    servingNote: '6 oz fillet',
    calories: 175,
    protein: 36,
    carbs: 0,
    fats: 2.5,
    sugar: 0,
    saturatedFat: 0.5,
  },
  {
    id: 'fp_eggs_ratio',
    name: 'Eggs (1 Yolk + 3 Whites)',
    category: 'protein',
    subGroup: 'Lean Protein',
    servingNote: '1:2–3 ratio',
    calories: 125,
    protein: 17,
    carbs: 1,
    fats: 5,
    sugar: 0,
    saturatedFat: 1.6,
  },
  {
    id: 'fp_two_good',
    name: 'Two Good Greek Yogurt',
    category: 'protein',
    subGroup: 'Greek Yogurt (GF)',
    servingNote: '1 cup',
    calories: 80,
    protein: 12,
    carbs: 3,
    fats: 2,
    sugar: 2,
    saturatedFat: 1,
    glutenFreeNote: true,
  },
  {
    id: 'fp_oikos_triple_zero',
    name: 'Oikos Triple Zero Yogurt',
    category: 'protein',
    subGroup: 'Greek Yogurt (GF)',
    servingNote: '1 cup',
    calories: 90,
    protein: 15,
    carbs: 7,
    fats: 0,
    sugar: 0,
    saturatedFat: 0,
    glutenFreeNote: true,
  },
  {
    id: 'fp_cottage_cheese',
    name: 'Fat Free Cottage Cheese',
    category: 'protein',
    subGroup: 'Lean Dairy',
    servingNote: '1 cup',
    calories: 160,
    protein: 26,
    carbs: 12,
    fats: 0,
    sugar: 8,
    saturatedFat: 0,
  },
  {
    id: 'fp_think_bar',
    name: 'think! Protein Bar',
    category: 'protein',
    subGroup: 'Low-Sugar Bar',
    servingNote: '1 bar',
    calories: 230,
    protein: 20,
    carbs: 23,
    fats: 8,
    sugar: 0,
    saturatedFat: 3,
  },
  {
    id: 'fp_pure_protein_bar',
    name: 'Pure Protein Bar',
    category: 'protein',
    subGroup: 'Low-Sugar Bar',
    servingNote: '1 bar',
    calories: 190,
    protein: 20,
    carbs: 17,
    fats: 4.5,
    sugar: 2,
    saturatedFat: 2.5,
  },
  {
    id: 'fp_dymatize',
    name: 'Dymatize Protein Shake',
    category: 'protein',
    subGroup: 'Low-Sugar Shake',
    servingNote: '1 scoop',
    calories: 120,
    protein: 25,
    carbs: 2,
    fats: 0.5,
    sugar: 1,
    saturatedFat: 0,
    supportsPb2Addon: true,
  },
  {
    id: 'fp_premier_protein',
    name: 'Premier Protein Shake',
    category: 'protein',
    subGroup: 'Low-Sugar Shake',
    servingNote: '1 shake',
    calories: 160,
    protein: 30,
    carbs: 5,
    fats: 3,
    sugar: 1,
    saturatedFat: 1,
    supportsPb2Addon: true,
  },
  {
    id: 'fp_muscle_milk',
    name: 'Muscle Milk Shake',
    category: 'protein',
    subGroup: 'Low-Sugar Shake',
    servingNote: '1 shake',
    calories: 160,
    protein: 25,
    carbs: 7,
    fats: 4,
    sugar: 0,
    saturatedFat: 1,
    supportsPb2Addon: true,
  },

  // CARB OPTIONS
  {
    id: 'fc_brown_rice',
    name: 'Rice',
    category: 'carb',
    subGroup: 'Complex Carb',
    servingNote: '1 cup cooked',
    calories: 218,
    protein: 4.5,
    carbs: 45,
    fats: 1.6,
    sugar: 0.5,
    saturatedFat: 0.3,
    variants: ['Brown Rice (Preferred)', 'White Rice'],
  },
  {
    id: 'fc_sweet_potato',
    name: 'Sweet Potato',
    category: 'carb',
    subGroup: 'Complex Carb',
    servingNote: '1 medium (200g)',
    calories: 180,
    protein: 4,
    carbs: 41,
    fats: 0.3,
    sugar: 11,
    saturatedFat: 0,
  },
  {
    id: 'fc_petit_potatoes',
    name: 'Private Selection Petit Potatoes',
    category: 'carb',
    subGroup: 'Gourmet Potatoes',
    servingNote: '200g roasted',
    calories: 155,
    protein: 4,
    carbs: 35,
    fats: 0.2,
    sugar: 2,
    saturatedFat: 0,
    variants: ['Purple', 'Red', 'Medley', 'Gold'],
  },
  {
    id: 'fc_quinoa',
    name: 'Quinoa',
    category: 'carb',
    subGroup: 'Complex Carb',
    servingNote: '1 cup cooked',
    calories: 222,
    protein: 8,
    carbs: 39,
    fats: 3.5,
    sugar: 1.5,
    saturatedFat: 0.4,
  },
  {
    id: 'fc_oatmeal',
    name: 'Oatmeal',
    category: 'carb',
    subGroup: 'Complex Carb',
    servingNote: '1/2 cup dry',
    calories: 150,
    protein: 5,
    carbs: 27,
    fats: 2.5,
    sugar: 1,
    saturatedFat: 0.5,
  },
  {
    id: 'fc_rice_cakes',
    name: 'Rice Cakes',
    category: 'carb',
    subGroup: 'Snacky Snack',
    servingNote: '2 cakes',
    calories: 100,
    protein: 2,
    carbs: 22,
    fats: 0.5,
    sugar: 4,
    saturatedFat: 0,
    variants: ['Sweet Flavor', 'Savory Flavor'],
  },
  {
    id: 'fc_pop_chips',
    name: 'Popchips',
    category: 'carb',
    subGroup: 'Snacky Snack',
    servingNote: '1 bag',
    calories: 100,
    protein: 1,
    carbs: 17,
    fats: 3,
    sugar: 1,
    saturatedFat: 0.3,
  },
  {
    id: 'fc_hummus',
    name: 'Hummus',
    category: 'carb',
    subGroup: 'Snacky Snack',
    servingNote: '2 tbsp',
    calories: 70,
    protein: 2,
    carbs: 5,
    fats: 4.5,
    sugar: 0.5,
    saturatedFat: 0.6,
  },

  // FAT OPTIONS
  {
    id: 'ff_nut_butter',
    name: 'Nut Butter / Nuts',
    category: 'fat',
    subGroup: 'Healthy Fat',
    servingNote: '1 tbsp / small handful',
    calories: 105,
    protein: 4,
    carbs: 3.5,
    fats: 9,
    sugar: 1,
    saturatedFat: 1.2,
  },
  {
    id: 'ff_coconut_oil',
    name: 'Coconut Oil',
    category: 'fat',
    subGroup: 'Healthy Fat',
    servingNote: '1 tsp',
    calories: 40,
    protein: 0,
    carbs: 0,
    fats: 4.5,
    sugar: 0,
    saturatedFat: 3.8,
  },
  {
    id: 'ff_chia_seeds',
    name: 'Chia Seeds',
    category: 'fat',
    subGroup: 'Healthy Fat',
    servingNote: '1 tbsp',
    calories: 60,
    protein: 2,
    carbs: 5,
    fats: 4,
    sugar: 0,
    saturatedFat: 0.4,
  },

  // SWEET SNACKY SNACKS
  {
    id: 'fs_atkins_pb_cups',
    name: 'Atkins Peanut Butter Cups',
    category: 'sweet',
    subGroup: 'Atkins Dessert',
    servingNote: '1 pack',
    calories: 160,
    protein: 3,
    carbs: 15,
    fats: 13,
    sugar: 1,
    saturatedFat: 6,
  },
  {
    id: 'fs_atkins_nut_roll',
    name: 'Atkins Caramel Nut Roll / Treat',
    category: 'sweet',
    subGroup: 'Atkins Dessert',
    servingNote: '1 bar',
    calories: 190,
    protein: 7,
    carbs: 18,
    fats: 12,
    sugar: 2,
    saturatedFat: 5,
  },
];

export const INITIAL_FOOD_LOGS: FoodLogEntry[] = [];

export const INITIAL_MEASUREMENT_LOGS: BodyMeasurementEntry[] = [];

export const INITIAL_WEEKLY_CONSISTENCY: WeeklyConsistencyState = {
  weeklyFullBodyCompleted: false,
  programmedWorkoutsCompleted: 0,
  macroDaysTrackedAndHit: 0,
  cheatMode: 'two_meals',
  cheatUsedCount: 0,
};

export interface DailyWarmupQuest {
  id: string;
  title: string;
  category: 'Mobility Flow' | 'Core & Glute Spark' | 'Ankle & Joint Prep' | 'Light Movement';
  durationLabel: string;
  prescription: string;
  detail: string;
  timerSeconds?: number;
  isCustom?: boolean;
}

export const DAILY_QUEST_POOL: DailyWarmupQuest[] = [
  {
    id: 'dq_spine_hip_opener',
    title: 'Morning Spine & Hip Wake-Up',
    category: 'Mobility Flow',
    durationLabel: '3 mins',
    prescription: '8 Cat-Cows · 6 World’s Greatest Stretch · 20s Deep Squat Hold',
    detail: 'Gentle warm-up flow to loosen your lower back and hips before starting the day.',
    timerSeconds: 180,
  },
  {
    id: 'dq_glute_core_spark',
    title: 'Glute & Core Activation Mini-Set',
    category: 'Core & Glute Spark',
    durationLabel: '4 mins',
    prescription: '12 Glute Bridges · 10 Dead Bugs · 20s Front Plank',
    detail: 'Fires up your glutes and deep core with zero ankle strain.',
    timerSeconds: 240,
  },
  {
    id: 'dq_ankle_calf_flow',
    title: 'Ankle & Tibialis Warm-Up Circuit',
    category: 'Ankle & Joint Prep',
    durationLabel: '3 mins',
    prescription: '10 Ankle Circles/way · 15 Seated Tibialis Raises · 30s Calf Stretch',
    detail: 'Keeps your left ankle mobile, supported, and warm for lifting or walking.',
    timerSeconds: 180,
  },
  {
    id: 'dq_posture_shoulder_reset',
    title: 'Upper Back & Posture Warm-Up',
    category: 'Mobility Flow',
    durationLabel: '3 mins',
    prescription: '12 Wall Slides · 15 Band Pull-Aparts (or Arm Circles) · 30s Chest Opener',
    detail: 'Opens tight shoulders and primes your upper body for pressing and rowing.',
    timerSeconds: 180,
  },
  {
    id: 'dq_sunshine_stroll',
    title: '10-Minute Brisk Warm-Up Walk',
    category: 'Light Movement',
    durationLabel: '10 mins',
    prescription: '10 mins easy flat walk (~1,000 steps)',
    detail: 'Wakes up your metabolism and chips away at your daily step goal.',
    timerSeconds: 600,
  },
  {
    id: 'dq_bird_dog_hinge',
    title: 'Hip Hinge & Stability Primer',
    category: 'Core & Glute Spark',
    durationLabel: '4 mins',
    prescription: '8 Bird-Dogs/side · 12 Bodyweight Good Mornings · 12 Clamshells/side',
    detail: 'Warms up hamstrings, side glutes, and spinal stabilizers.',
    timerSeconds: 240,
  },
  {
    id: 'dq_banded_glute_prep',
    title: 'Lower-Body Warm-Up Pulse',
    category: 'Core & Glute Spark',
    durationLabel: '4 mins',
    prescription: '15 Seated Band Abductions · 12 Pause Glute Bridges · 10 Box Air Squats',
    detail: 'Ankle-friendly warm-up to get blood flowing to quads and glutes.',
    timerSeconds: 240,
  },
  {
    id: 'dq_evening_hip_decompress',
    title: ' Couch-to-Sleep Hip & Back Unwind',
    category: 'Mobility Flow',
    durationLabel: '4 mins',
    prescription: '30s Figure-4 Stretch/side · 30s Child’s Pose · 5 Slow Nasal Breaths',
    detail: 'Releases hip tension and preps your body for 7–9 hours of recovery sleep.',
    timerSeconds: 240,
  },
  {
    id: 'dq_post_meal_walk',
    title: '5-Minute Post-Meal Digestion Walk',
    category: 'Light Movement',
    durationLabel: '5 mins',
    prescription: '5 mins easy stroll after any meal',
    detail: 'Boosts energy, digestion, and blood sugar balance with zero joint stress.',
    timerSeconds: 300,
  },
];

/**
 * Deterministically picks 3 varied Daily Warm-Up Quests for a given date + shuffle offset,
 * plus appends any custom daily quests the user created.
 */
export function getDailyQuestsForDate(
  dateStr: string,
  shuffleIndex: number = 0,
  customQuests: DailyWarmupQuest[] = []
): DailyWarmupQuest[] {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) >>> 0;
  }
  const offset = Math.abs(hash + shuffleIndex * 3);

  const picked: DailyWarmupQuest[] = [];
  const poolLen = DAILY_QUEST_POOL.length;
  for (let i = 0; i < 3; i++) {
    const idx = (offset + i * 2) % poolLen;
    picked.push(DAILY_QUEST_POOL[idx]);
  }

  return [...picked, ...customQuests];
}

export function createCustomDailyQuest(input: {
  title: string;
  prescription: string;
  durationLabel?: string;
  category?: DailyWarmupQuest['category'];
}): DailyWarmupQuest {
  const cleanTitle = input.title.trim() || 'Custom Warm-Up Quest';
  const cleanPrescription = input.prescription.trim() || '2 sets × 10 easy warm-up reps';
  const cleanDuration = input.durationLabel?.trim() || '3 mins';
  return {
    id: `custom_quest_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title: cleanTitle,
    category: input.category || 'Mobility Flow',
    durationLabel: cleanDuration,
    prescription: cleanPrescription,
    detail: 'Your custom daily warm-up quest.',
    timerSeconds: 180,
    isCustom: true,
  };
}

