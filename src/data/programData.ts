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
      'Ankle-Safe Cardio: Treadmill (High Incline, Interval, Endurance, Sidestep, Backward), Stairmaster, or Row Machine.',
    ],
  },
];

export const WEEKLY_SPLIT_OVERVIEW = [
  { day: 'Mon', session: 'Upper Body A', type: 'Strength Push/Pull', isRest: false, workoutId: 'upper_a' as const },
  { day: 'Tue', session: 'Lower Body A', type: 'MAX Glutes & Hams', isRest: false, workoutId: 'lower_a' as const },
  { day: 'Wed', session: 'Full-Body & Core', type: 'MAX/MED & Cable Core', isRest: false, workoutId: 'full_body_session' as const },
  { day: 'Thu', session: 'Rest & Walk', type: 'Light Steps', isRest: true },
  { day: 'Fri', session: 'Upper Body B', type: 'Sculpt, Back & Delts', isRest: false, workoutId: 'upper_b' as const },
  { day: 'Sat', session: 'Lower Body B', type: 'MAX/MED Glutes & Quads', isRest: false, workoutId: 'lower_b' as const },
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
    detail: 'Treadmill (Incline/Interval/Endurance/Sidestep/Backward), Stairmaster, Row Machine, Bike, or Elliptical — skip running & jumping.',
  },
  {
    title: 'Flat Shoes on Leg Day',
    detail: 'Wear Vans, Converse, or flat lifters instead of squishy running shoes.',
  },
];

export interface CardioModalityOption {
  id: string;
  label: string;
  category: 'Treadmill' | 'Stairmaster' | 'Row Machine' | 'Bike & Elliptical';
  ankleSafetyNote: string;
}

export const CARDIO_MODALITIES: CardioModalityOption[] = [
  {
    id: 'Treadmill — High Incline Walk',
    label: 'Treadmill — High Incline Walk',
    category: 'Treadmill',
    ankleSafetyNote: '8–12% incline at 2.5–3.2 mph; high glute activation with zero running impact.',
  },
  {
    id: 'Treadmill — Low-Impact Interval Walk',
    label: 'Treadmill — Low-Impact Interval Walk',
    category: 'Treadmill',
    ankleSafetyNote: 'Alternate 2 mins brisk incline walk with 1 min flat recovery pace.',
  },
  {
    id: 'Treadmill — Steady Endurance Walk',
    label: 'Treadmill — Steady Endurance Walk',
    category: 'Treadmill',
    ankleSafetyNote: 'Flat to 3% grade steady Zone 2 pace for daily step & fat-loss acceleration.',
  },
  {
    id: 'Treadmill — Controlled Lateral Sidestep',
    label: 'Treadmill — Controlled Lateral Sidestep',
    category: 'Treadmill',
    ankleSafetyNote: '1.5–2.0 mph slow lateral steps while holding rails to strengthen outer glutes & ankle stabilizers.',
  },
  {
    id: 'Treadmill — Backward Walk (Quad & Ankle Stability)',
    label: 'Treadmill — Backward Walk (Quad & Ankle Stability)',
    category: 'Treadmill',
    ankleSafetyNote: '1.5–2.0 mph toe-to-heel backward walk; rehabilitates knees, tibialis, and left ankle.',
  },
  {
    id: 'Stairmaster — Steady Climb',
    label: 'Stairmaster — Steady Climb',
    category: 'Stairmaster',
    ankleSafetyNote: 'Step with your whole flat foot on each stair to fire up glutes without bouncing on toes.',
  },
  {
    id: 'Rowing Machine — Full-Body Ergometer',
    label: 'Rowing Machine — Full-Body Ergometer',
    category: 'Row Machine',
    ankleSafetyNote: 'Zero vertical impact; keep heel straps comfortable so left ankle dorsiflexion stays pain-free.',
  },
  {
    id: 'Stationary Bike — Low-Impact Spin',
    label: 'Stationary Bike — Low-Impact Spin',
    category: 'Bike & Elliptical',
    ankleSafetyNote: 'Seated cycling with smooth pedal strokes and zero joint impact.',
  },
  {
    id: 'Elliptical Trainer — Zero-Impact Glide',
    label: 'Elliptical Trainer — Zero-Impact Glide',
    category: 'Bike & Elliptical',
    ankleSafetyNote: 'Feet never leave the pedals — ultra-gentle on the left ankle.',
  },
];

export interface PreferredExerciseTemplate {
  name: string;
  category: 'Glutes' | 'Back' | 'Legs' | 'Core' | 'Arms / Curls' | 'Chest' | 'Shoulders';
  activationTier?: 'MAX' | 'MED';
  defaultSets: number;
  defaultReps: string;
  defaultWeightLbs: number;
  tip: string;
}

export const PREFERRED_EXERCISE_LIBRARY: PreferredExerciseTemplate[] = [
  // GLUTES (MAX & MED)
  { name: 'Barbell Hip Thrust', category: 'Glutes', activationTier: 'MAX', defaultSets: 4, defaultReps: '8–10 reps', defaultWeightLbs: 135, tip: 'MAX Glute Lift: Drive through flat heels and pause 2 seconds at top lockout.' },
  { name: 'Barbell Conventional Deadlift', category: 'Glutes', activationTier: 'MAX', defaultSets: 4, defaultReps: '6–8 reps', defaultWeightLbs: 135, tip: 'MAX Posterior Chain Lift: Flat shoes on; brace lats and drive the floor away.' },
  { name: 'Barbell Romanian Deadlift', category: 'Glutes', activationTier: 'MAX', defaultSets: 4, defaultReps: '8–10 reps', defaultWeightLbs: 95, tip: 'MAX Glute & Hamstring Lift: Feet planted hip-width; hinge hips straight back.' },
  { name: 'Cable Glute Kickback', category: 'Glutes', activationTier: 'MAX', defaultSets: 3, defaultReps: '12–15 reps / leg', defaultWeightLbs: 25, tip: 'MAX Glute Isolation: Kick straight back with controlled squeeze; keep pelvis level.' },
  { name: 'Weighted Cable Squat', category: 'Glutes', activationTier: 'MAX', defaultSets: 3, defaultReps: '10–12 reps', defaultWeightLbs: 80, tip: 'MAX Glute & Quad Lift: Sit back against cable tension to keep shins vertical and ankle safe.' },
  { name: '45° Glute-Focused Back Hyperextension', category: 'Glutes', activationTier: 'MAX', defaultSets: 3, defaultReps: '12–15 reps', defaultWeightLbs: 25, tip: 'MAX Glute Lift: Flare feet 30°, round upper back slightly, and rise using pure glute contraction.' },
  { name: 'Dumbbell Low Box Step-Up', category: 'Glutes', activationTier: 'MAX', defaultSets: 3, defaultReps: '10 reps / leg', defaultWeightLbs: 20, tip: 'MAX Glute Unilateral Lift: Lean torso slightly forward and press through your working heel.' },
  { name: 'Single-Leg Bench Hip Thrust', category: 'Glutes', activationTier: 'MED', defaultSets: 3, defaultReps: '10–12 reps / leg', defaultWeightLbs: 35, tip: 'MED Glute Unilateral Lift: Ankle-safe single-leg hip thrust with planted flat heel.' },
  { name: 'Wide-Stance Dumbbell Sumo Squat', category: 'Glutes', activationTier: 'MED', defaultSets: 3, defaultReps: '10–12 reps', defaultWeightLbs: 55, tip: 'MED Glute & Adductor Lift: Wide stance keeps shins vertical and left ankle comfortable.' },
  { name: 'Seated Barbell Good Morning', category: 'Glutes', activationTier: 'MED', defaultSets: 3, defaultReps: '10–12 reps', defaultWeightLbs: 55, tip: 'MED Glute & Hamstring Hinge: Sit tall on bench and hinge forward with zero ankle load.' },
  { name: '30° Angled Cable Glute Kickback', category: 'Glutes', activationTier: 'MED', defaultSets: 3, defaultReps: '12–15 reps / leg', defaultWeightLbs: 20, tip: 'MED Glute Medius Lift: Kick back at a 30° angle to target the upper/outer glute shelf.' },

  // BACK
  { name: 'Assisted Pull-Up', category: 'Back', defaultSets: 3, defaultReps: '8–10 reps', defaultWeightLbs: 40, tip: 'Drive elbows down to your sides and pull chin cleanly over the bar.' },
  { name: 'Single-Arm Cable Lat Pulldown', category: 'Back', defaultSets: 3, defaultReps: '10–12 reps / side', defaultWeightLbs: 40, tip: 'Pull handle toward your hip pocket for maximum single-side lat squeeze.' },
  { name: 'Wide-Grip Lat Pulldown', category: 'Back', defaultSets: 3, defaultReps: '8–10 reps', defaultWeightLbs: 75, tip: 'Pull the bar to your upper chest while depressing shoulder blades.' },
  { name: 'Straight-Arm Cable Lat Pullover', category: 'Back', defaultSets: 3, defaultReps: '12–15 reps', defaultWeightLbs: 35, tip: 'Keep elbows softly locked and sweep the bar down to your thighs.' },
  { name: 'Alternating Bent-Over Dumbbell Row', category: 'Back', defaultSets: 3, defaultReps: '10–12 reps / side', defaultWeightLbs: 30, tip: 'Hinge at 45° and alternate rowing each dumbbell to your lower ribs.' },
  { name: 'Standing Reverse Cable Rear Delt Fly', category: 'Back', defaultSets: 3, defaultReps: '12–15 reps', defaultWeightLbs: 15, tip: 'Cross high cables and sweep arms wide to isolate rear delts and upper back.' },
  { name: 'High-Pulley Rope Face Pull', category: 'Back', defaultSets: 3, defaultReps: '15 reps', defaultWeightLbs: 25, tip: 'Pull rope toward your forehead while rotating thumbs backward.' },
  { name: 'Seated Underhand Cable Row', category: 'Back', defaultSets: 3, defaultReps: '10–12 reps', defaultWeightLbs: 70, tip: 'Supinated grip targets lower lats and biceps; squeeze shoulder blades together.' },

  // LEGS
  { name: 'Seated Machine Leg Extension', category: 'Legs', defaultSets: 3, defaultReps: '12–15 reps', defaultWeightLbs: 65, tip: 'Zero ankle load — pause 1 second at full quad lockout.' },
  { name: 'Seated Machine Hamstring Curl', category: 'Legs', defaultSets: 3, defaultReps: '12–15 reps', defaultWeightLbs: 60, tip: 'Lock thigh pad snug and control the eccentric return.' },
  { name: 'Plate-Loaded Free-Weight Leg Press', category: 'Legs', defaultSets: 3, defaultReps: '10–12 reps', defaultWeightLbs: 180, tip: 'High/medium flat-foot placement (compatible with Free-Weight, Yellow, or Purple Leg Press).' },
  { name: 'Yellow Machine Leg Press', category: 'Legs', defaultSets: 3, defaultReps: '10–12 reps', defaultWeightLbs: 140, tip: 'Keep heels flat on the platform and press smoothly without locking knees.' },
  { name: 'Purple Machine Leg Press', category: 'Legs', defaultSets: 3, defaultReps: '10–12 reps', defaultWeightLbs: 140, tip: 'Controlled depth to protect the left ankle while loading quads and glutes.' },
  { name: 'Barbell Hack Squat', category: 'Legs', defaultSets: 4, defaultReps: '8–10 reps', defaultWeightLbs: 95, tip: 'Ankle-friendly quad & glute compound lift with flat shoes.' },
  { name: 'Barbell Goblet Squat', category: 'Legs', defaultSets: 3, defaultReps: '10–12 reps', defaultWeightLbs: 55, tip: 'Sit hips back onto a parallel target with upright chest.' },
  { name: 'Barbell Back Squat', category: 'Legs', defaultSets: 4, defaultReps: '6–8 reps', defaultWeightLbs: 105, tip: 'Brace core in flat shoes; descend to comfortable ankle depth.' },
  { name: 'Seated Machine Calf Extension', category: 'Legs', defaultSets: 2, defaultReps: '12–15 reps', defaultWeightLbs: 45, tip: 'Controlled plantarflexion; avoid aggressive bottom stretch if left ankle feels stiff.' },

  // CORE
  { name: 'Quadruped Alternating Bird Dog', category: 'Core', defaultSets: 3, defaultReps: '10 reps / side', defaultWeightLbs: 0, tip: 'Extend opposite arm and leg long while keeping hips and lumbar spine level.' },
  { name: 'Kneeling High-Pulley Cable Crunch', category: 'Core', defaultSets: 3, defaultReps: '12–15 reps', defaultWeightLbs: 45, tip: 'Flex spine by drawing ribs toward hips rather than hinging at the waist.' },
  { name: 'Seated Bench Cable Knee Tuck', category: 'Core', defaultSets: 3, defaultReps: '12–15 reps', defaultWeightLbs: 25, tip: 'Anchor low cable to feet and tuck knees smoothly toward your chest.' },
  { name: 'High-to-Low Cable Woodchop', category: 'Core', defaultSets: 3, defaultReps: '12 reps / side', defaultWeightLbs: 25, tip: 'Rotate torso diagonally with braced abs and stable feet.' },
  { name: 'Supine Alternating Dead Bug', category: 'Core', defaultSets: 3, defaultReps: '10 reps / side', defaultWeightLbs: 0, tip: 'Press lower back flat into the mat while lowering opposite arm and leg.' },
  { name: 'Forearm Russian Plank', category: 'Core', defaultSets: 3, defaultReps: '45 sec hold', defaultWeightLbs: 0, tip: 'Pull elbows toward toes while squeezing glutes, quads, and lats.' },
  { name: 'Lying Low-Pulley Cable Leg Raise', category: 'Core', defaultSets: 3, defaultReps: '12–15 reps', defaultWeightLbs: 15, tip: 'Control the lower phase so your lower back never arches off the bench/mat.' },

  // ARMS / CURLS
  { name: 'Seated Low-Cable Row Bicep Curl', category: 'Arms / Curls', defaultSets: 3, defaultReps: '12–15 reps', defaultWeightLbs: 35, tip: 'Sit facing the low pulley and curl bar/rope toward your forehead.' },
  { name: 'Standing Dumbbell Bicep Curl', category: 'Arms / Curls', defaultSets: 3, defaultReps: '10–12 reps', defaultWeightLbs: 15, tip: 'Supinate wrists fully at the top without swinging torso.' },
  { name: 'Standing Dumbbell Hammer Curl', category: 'Arms / Curls', defaultSets: 2, defaultReps: '12–15 reps', defaultWeightLbs: 15, tip: 'Keep palms facing each other throughout the curl.' },
  { name: 'Cable Rope Tricep Pushdown', category: 'Arms / Curls', defaultSets: 2, defaultReps: '12–15 reps', defaultWeightLbs: 30, tip: 'Lock elbows at your sides and flare the rope handles at the bottom.' },
  { name: 'Flat-Bench Dumbbell Pullover', category: 'Arms / Curls', defaultSets: 3, defaultReps: '10–12 reps', defaultWeightLbs: 30, tip: 'Targets lats, serratus, and long head of the triceps.' },
  { name: 'Bent-Over Dumbbell Tricep Kickback', category: 'Arms / Curls', defaultSets: 2, defaultReps: '12–15 reps', defaultWeightLbs: 15, tip: 'Keep upper arm parallel to the floor and squeeze triceps at lockout.' },

  // CHEST
  { name: '30° Incline Dumbbell Bench Press', category: 'Chest', defaultSets: 3, defaultReps: '8–10 reps', defaultWeightLbs: 30, tip: 'Set bench to 30° angle to build upper chest without shoulder pinch.' },
  { name: 'Standing Dual-Pulley Cable Chest Fly', category: 'Chest', defaultSets: 3, defaultReps: '12–15 reps', defaultWeightLbs: 20, tip: 'Bring handles together in a controlled hug arc and squeeze chest.' },
  { name: 'Seated Dumbbell Arnold Shoulder Press', category: 'Chest', defaultSets: 3, defaultReps: '10–12 reps', defaultWeightLbs: 20, tip: 'Rotate palms from facing inward to forward as you press overhead.' },
  { name: 'Flat Barbell Bench Press', category: 'Chest', defaultSets: 3, defaultReps: '6–8 reps', defaultWeightLbs: 75, tip: 'Lower bar with control to mid-chest and drive up strongly.' },

  // SHOULDERS
  { name: 'Standing Dumbbell Around-the-World Raise', category: 'Shoulders', defaultSets: 3, defaultReps: '12–15 reps', defaultWeightLbs: 10, tip: 'Sweep light dumbbells in a smooth full semi-circle from hips to overhead.' },
  { name: 'Seated Dumbbell Shoulder Press', category: 'Shoulders', defaultSets: 3, defaultReps: '8–10 reps', defaultWeightLbs: 20, tip: 'Keep upper back supported against the vertical bench pad.' },
  { name: 'Alternating Single-Arm Dumbbell Front Raise', category: 'Shoulders', defaultSets: 3, defaultReps: '12 reps / side', defaultWeightLbs: 12, tip: 'Lift dumbbell to eye level with zero body momentum.' },
  { name: 'Standing Overhead Barbell Shoulder Press', category: 'Shoulders', defaultSets: 3, defaultReps: '8–10 reps', defaultWeightLbs: 45, tip: 'Brace core and glutes; press bar vertically overhead.' },
  { name: 'Standing Dumbbell Lateral Raise', category: 'Shoulders', defaultSets: 3, defaultReps: '12–15 reps', defaultWeightLbs: 12, tip: 'Raise dumbbells out to shoulder height with soft elbows.' },
];

export const WORKOUT_PLANS: WorkoutDayPlan[] = [
  {
    id: 'upper_a',
    dayLabel: 'Monday · Upper A',
    title: 'Upper Body A (Strength Push & Pull)',
    subtitle: 'Heavy chest, wide/underhand back work, overhead pressing, and cable arms.',
    ankleProtected: false,
    focusSummary: 'Flat bench press, wide-grip pulldown, barbell shoulder press, seated underhand row, DB pullover, and cable curls/pushdowns.',
    exercises: [
      {
        id: 'ua_1',
        order: 1,
        name: 'Flat Barbell Bench Press',
        sets: 3,
        reps: '6–8 reps',
        tip: 'Plant feet flat, retract shoulder blades, and press with control.',
        defaultWeightLbs: 75,
      },
      {
        id: 'ua_2',
        order: 2,
        name: 'Wide-Grip Lat Pulldown',
        sets: 3,
        reps: '8–10 reps',
        tip: 'Pull the bar to your upper chest while driving elbows down.',
        defaultWeightLbs: 75,
      },
      {
        id: 'ua_3',
        order: 3,
        name: 'Standing Overhead Barbell Shoulder Press',
        sets: 3,
        reps: '8–10 reps',
        tip: 'Brace core and glutes tight; press bar straight overhead.',
        defaultWeightLbs: 45,
      },
      {
        id: 'ua_4',
        order: 4,
        name: 'Seated Underhand Cable Row',
        sets: 3,
        reps: '10–12 reps',
        tip: 'Supinated grip pulls elbows tight past your torso for lower-lat thickness.',
        defaultWeightLbs: 70,
      },
      {
        id: 'ua_5',
        order: 5,
        name: 'Flat-Bench Dumbbell Pullover',
        sets: 3,
        reps: '10–12 reps',
        tip: 'Keep a soft elbow bend and stretch lats and chest before pulling over sternum.',
        defaultWeightLbs: 30,
      },
      {
        id: 'ua_6',
        order: 6,
        name: 'Seated Low-Cable Row Bicep Curl',
        sets: 2,
        reps: '12–15 reps',
        tip: 'Sit tall at the low pulley and curl handle toward your chin with elbows steady.',
        defaultWeightLbs: 35,
      },
      {
        id: 'ua_7',
        order: 7,
        name: 'Cable Rope Tricep Pushdown',
        sets: 2,
        reps: '12–15 reps',
        tip: 'Lock elbows at your sides and flare the rope handles at the bottom.',
        defaultWeightLbs: 30,
      },
    ],
  },
  {
    id: 'lower_a',
    dayLabel: 'Tuesday · Lower A (Ankle-Safe)',
    title: 'Lower Body A (MAX Glutes & Hamstrings)',
    subtitle: 'Prioritizes MAX glute & posterior chain lifts while keeping your left ankle stress-free.',
    ankleProtected: true,
    focusSummary: 'Barbell hip thrusts (MAX), barbell RDLs (MAX), free-weight leg press, 45° hyperextensions (MAX), cable kickbacks (MAX), and ham/calf machines.',
    exercises: [
      {
        id: 'la_1',
        order: 1,
        name: 'Barbell Hip Thrust',
        sets: 4,
        reps: '8–10 reps',
        tip: 'MAX Glute Lift: Drive through flat heels and hold a 2-second top squeeze.',
        defaultWeightLbs: 135,
      },
      {
        id: 'la_2',
        order: 2,
        name: 'Barbell Romanian Deadlift',
        sets: 4,
        reps: '8–10 reps',
        tip: 'MAX Glute & Hamstring Lift: Feet stay planted in flat shoes; hinge hips straight back.',
        defaultWeightLbs: 95,
      },
      {
        id: 'la_3',
        order: 3,
        name: 'Plate-Loaded Free-Weight Leg Press',
        sets: 3,
        reps: '10–12 reps',
        tip: 'Place feet medium-high on the sled (or use Yellow/Purple Leg Press) to minimize ankle flexion.',
        defaultWeightLbs: 180,
      },
      {
        id: 'la_4',
        order: 4,
        name: '45° Glute-Focused Back Hyperextension',
        sets: 3,
        reps: '12–15 reps',
        tip: 'MAX Glute Lift: Flare toes outward 30°, round upper back slightly, and rise by squeezing glutes.',
        defaultWeightLbs: 25,
      },
      {
        id: 'la_5',
        order: 5,
        name: 'Cable Glute Kickback',
        sets: 3,
        reps: '12–15 reps / leg',
        tip: 'MAX Glute Isolation: Cuff working ankle and kick straight back without arching your lower back.',
        defaultWeightLbs: 25,
      },
      {
        id: 'la_6',
        order: 6,
        name: 'Seated Machine Hamstring Curl',
        sets: 3,
        reps: '12–15 reps',
        tip: 'Zero ankle load — lock the thigh pad snug and control the eccentric return.',
        defaultWeightLbs: 60,
      },
      {
        id: 'la_7',
        order: 7,
        name: 'Seated Machine Calf Extension',
        sets: 2,
        reps: '12–15 reps',
        tip: 'Pause at the top; stop at neutral depth if your left ankle feels stiff.',
        defaultWeightLbs: 45,
      },
    ],
  },
  {
    id: 'full_body_session',
    dayLabel: 'Wednesday · Full-Body & Core',
    title: 'Full-Body Strength & Core (1x/wk)',
    subtitle: 'MAX deadlifts & cable squats, MED seated good mornings, incline DB press, single-arm pulldowns, and cable core.',
    ankleProtected: true,
    focusSummary: 'Barbell deadlifts (MAX), weighted cable squats (MAX), incline DB press, single-arm lat pulldown, seated good mornings (MED), and cable core.',
    exercises: [
      {
        id: 'fb_1',
        order: 1,
        name: 'Barbell Conventional Deadlift',
        sets: 4,
        reps: '6–8 reps',
        tip: 'MAX Posterior Chain Lift: Flat shoes required; pull slack out of the bar and drive the floor away.',
        defaultWeightLbs: 135,
      },
      {
        id: 'fb_2',
        order: 2,
        name: 'Weighted Cable Squat',
        sets: 3,
        reps: '10–12 reps',
        tip: 'MAX Glute & Quad Lift: Sit back against cable tension to keep shins vertical and left ankle stress-free.',
        defaultWeightLbs: 80,
      },
      {
        id: 'fb_3',
        order: 3,
        name: '30° Incline Dumbbell Bench Press',
        sets: 3,
        reps: '8–10 reps',
        tip: 'Lower dumbbells with control to upper chest and press up smoothly.',
        defaultWeightLbs: 30,
      },
      {
        id: 'fb_4',
        order: 4,
        name: 'Single-Arm Cable Lat Pulldown',
        sets: 3,
        reps: '10–12 reps / side',
        tip: 'Drive elbow down toward your hip pocket for full unilateral lat engagement.',
        defaultWeightLbs: 40,
      },
      {
        id: 'fb_5',
        order: 5,
        name: 'Seated Barbell Good Morning',
        sets: 3,
        reps: '10–12 reps',
        tip: 'MED Glute & Hamstring Hinge: Sit on bench with zero ankle load and hinge torso forward with a flat back.',
        defaultWeightLbs: 55,
      },
      {
        id: 'fb_6',
        order: 6,
        name: 'Kneeling High-Pulley Cable Crunch',
        sets: 3,
        reps: '12–15 reps',
        tip: 'Hold rope at forehead and curl ribs down toward pelvis using your abs.',
        defaultWeightLbs: 45,
      },
      {
        id: 'fb_7',
        order: 7,
        name: 'High-to-Low Cable Woodchop',
        sets: 3,
        reps: '12 reps / side',
        tip: 'Rotate torso diagonally across your body while keeping core braced and feet planted.',
        defaultWeightLbs: 25,
      },
    ],
  },
  {
    id: 'upper_b',
    dayLabel: 'Friday · Upper B',
    title: 'Upper Body B (Sculpt, Back & Delts)',
    subtitle: 'Arnold presses, alternating rows, cable chest flys, rear-delt work, and arm sculpting.',
    ankleProtected: false,
    focusSummary: 'Arnold shoulder press, alternating bent rows, cable chest fly, lat pullover, reverse cable fly, face pulls, lateral raises, and arms.',
    exercises: [
      {
        id: 'ub_1',
        order: 1,
        name: 'Seated Dumbbell Arnold Shoulder Press',
        sets: 3,
        reps: '10–12 reps',
        tip: 'Start palms facing you and rotate smoothly outward as you press overhead.',
        defaultWeightLbs: 20,
      },
      {
        id: 'ub_2',
        order: 2,
        name: 'Alternating Bent-Over Dumbbell Row',
        sets: 3,
        reps: '10–12 reps / side',
        tip: 'Hinge hips back 45° and alternate rowing each dumbbell toward your hip.',
        defaultWeightLbs: 30,
      },
      {
        id: 'ub_3',
        order: 3,
        name: 'Standing Dual-Pulley Cable Chest Fly',
        sets: 3,
        reps: '12–15 reps',
        tip: 'Bring handles together in a controlled hug arc and pause 1 second at peak chest squeeze.',
        defaultWeightLbs: 20,
      },
      {
        id: 'ub_4',
        order: 4,
        name: 'Straight-Arm Cable Lat Pullover',
        sets: 3,
        reps: '12–15 reps',
        tip: 'Keep arms nearly straight and sweep the bar down to your thighs using pure lats.',
        defaultWeightLbs: 35,
      },
      {
        id: 'ub_5',
        order: 5,
        name: 'Standing Reverse Cable Rear Delt Fly',
        sets: 3,
        reps: '12–15 reps',
        tip: 'Cross cables at shoulder height and sweep arms outward to sculpt rear delts.',
        defaultWeightLbs: 15,
      },
      {
        id: 'ub_6',
        order: 6,
        name: 'High-Pulley Rope Face Pull',
        sets: 3,
        reps: '15 reps',
        tip: 'Pull the rope toward your forehead while rotating thumbs backward.',
        defaultWeightLbs: 25,
      },
      {
        id: 'ub_7',
        order: 7,
        name: 'Standing Dumbbell Lateral Raise',
        sets: 3,
        reps: '12–15 reps',
        tip: 'Raise dumbbells out to shoulder height with a slight bend in your elbows.',
        defaultWeightLbs: 12,
      },
      {
        id: 'ub_8',
        order: 8,
        name: 'Standing Dumbbell Hammer Curl',
        sets: 2,
        reps: '12–15 reps',
        tip: 'Keep palms facing each other throughout the curl.',
        defaultWeightLbs: 15,
      },
      {
        id: 'ub_9',
        order: 9,
        name: 'Bent-Over Dumbbell Tricep Kickback',
        sets: 2,
        reps: '12–15 reps',
        tip: 'Keep upper arm parallel to the floor and extend forearm to full tricep lockout.',
        defaultWeightLbs: 15,
      },
    ],
  },
  {
    id: 'lower_b',
    dayLabel: 'Saturday · Lower B (Ankle-Safe)',
    title: 'Lower Body B (MAX/MED Glutes, Quads & Core)',
    subtitle: 'Barbell hack squats, MED sumo squats, MAX step-ups (with MED single-hip-thrust swap), 30° kickbacks, and cable core.',
    ankleProtected: true,
    focusSummary: 'Barbell hack squats, wide sumo squats (MED), low box step-ups (MAX), 30° cable kickbacks (MED), leg extensions, and cable knee tucks.',
    exercises: [
      {
        id: 'lb_1',
        order: 1,
        name: 'Barbell Hack Squat',
        sets: 4,
        reps: '8–10 reps',
        tip: 'Ankle-friendly quad & glute compound: Keep flat heels planted and torso upright.',
        defaultWeightLbs: 95,
      },
      {
        id: 'lb_2',
        order: 2,
        name: 'Wide-Stance Dumbbell Sumo Squat',
        sets: 3,
        reps: '10–12 reps',
        tip: 'MED Glute & Inner Thigh Lift: Wide stance keeps shins vertical with minimal ankle bend.',
        defaultWeightLbs: 55,
      },
      {
        id: 'lb_3',
        order: 3,
        name: 'Dumbbell Low Box Step-Up',
        sets: 3,
        reps: '10 reps / leg',
        tip: 'MAX Glute Unilateral Lift: Step onto a low box driving through your heel, or toggle the MED Single-Leg Hip Thrust swap.',
        ankleSwapOption: {
          swapName: 'Single-Leg Bench Hip Thrust',
          swapReps: '10–12 reps / leg',
          swapReason: 'MED Glute Ankle-Safe Swap: High unilateral glute activation with zero box-stepping impact on the left ankle.',
        },
        defaultWeightLbs: 20,
      },
      {
        id: 'lb_4',
        order: 4,
        name: '30° Angled Cable Glute Kickback',
        sets: 3,
        reps: '12–15 reps / leg',
        tip: 'MED Glute Medius Lift: Kick back at a 30° diagonal angle to sculpt the upper/outer glute shelf.',
        defaultWeightLbs: 20,
      },
      {
        id: 'lb_5',
        order: 5,
        name: 'Seated Machine Leg Extension',
        sets: 3,
        reps: '12–15 reps',
        tip: 'Zero ankle load — pause 1 second at full quad lockout.',
        defaultWeightLbs: 65,
      },
      {
        id: 'lb_6',
        order: 6,
        name: 'Seated Bench Cable Knee Tuck',
        sets: 3,
        reps: '12–15 reps',
        tip: 'Core finisher: Sit braced on the bench and draw knees smoothly toward your chest.',
        defaultWeightLbs: 25,
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
    prescription: '12 Wall Slides · 15 Resistance Band Pull-Aparts · 30s Doorway Chest Stretch',
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

