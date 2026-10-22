import React, { useState, useEffect, useCallback } from 'react';
import {
  PRESCRIBED_TARGETS,
  calculateDailyNutritionStatus,
  calculateInchChangeSummary,
  evaluateWeeklyKeysToSuccess,
  getLocalDateString,
  getTimeUntilMidnight,
  applyMidnightResetIfNeeded,
  type FoodLogEntry,
  type BodyMeasurementEntry,
  type WeeklyConsistencyState,
  type MacroTargets,
} from './utils/recompLogic';
import {
  INITIAL_FOOD_LOGS,
  INITIAL_MEASUREMENT_LOGS,
  INITIAL_WEEKLY_CONSISTENCY,
  type WorkoutDayPlan,
} from './data/programData';
import { WorkoutsView } from './components/WorkoutsView';
import { NutritionView } from './components/NutritionView';
import { GoalsAndPillarsView } from './components/GoalsAndPillarsView';
import { Check, ShieldCheck, Flame, Droplets, Dumbbell, RotateCcw, Clock } from 'lucide-react';

type ActiveTab = 'dashboard' | 'workouts' | 'nutrition' | 'goals';

const STORAGE_KEY = 'recompos_clean_state_v2';
const LEGACY_STORAGE_KEY = 'recompos_github_state_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [lastActiveDate, setLastActiveDate] = useState<string>(() => getLocalDateString());
  const [midnightCountdown, setMidnightCountdown] = useState<string>(
    () => getTimeUntilMidnight().formatted
  );

  // Zero demo data initial states
  const [foodLogs, setFoodLogs] = useState<FoodLogEntry[]>(INITIAL_FOOD_LOGS);
  const [waterOz, setWaterOz] = useState<number>(0);
  const [activeTargets, setActiveTargets] = useState<MacroTargets>(PRESCRIBED_TARGETS);
  const [measurements, setMeasurements] = useState<BodyMeasurementEntry[]>(INITIAL_MEASUREMENT_LOGS);
  const [weeklyConsistency, setWeeklyConsistency] = useState<WeeklyConsistencyState>(
    INITIAL_WEEKLY_CONSISTENCY
  );
  const [completedSessionsThisWeek, setCompletedSessionsThisWeek] = useState<string[]>([]);
  const [ankleWarmupChecks, setAnkleWarmupChecks] = useState<Record<string, boolean>>({
    ankle_circles: false,
    wall_stretch: false,
    band_resisted: false,
  });
  const [flatShoesVerified, setFlatShoesVerified] = useState<boolean>(false);
  const [lungeSwappedToBss, setLungeSwappedToBss] = useState<boolean>(false);
  const [lissModality, setLissModality] = useState<string>('Incline Treadmill Walk');
  const [lissMinutesToday, setLissMinutesToday] = useState<number>(0);
  const [macroDayCreditedToday, setMacroDayCreditedToday] = useState<boolean>(false);

  const performDailyMidnightReset = useCallback((newDateStr: string) => {
    setLastActiveDate(newDateStr);
    setFoodLogs([]);
    setWaterOz(0);
    setMacroDayCreditedToday(false);
    setAnkleWarmupChecks({
      ankle_circles: false,
      wall_stretch: false,
      band_resisted: false,
    });
    setFlatShoesVerified(false);
    setLissMinutesToday(0);
  }, []);

  // Load persisted state from localStorage and run midnight reset check if date changed
  useEffect(() => {
    try {
      localStorage.removeItem(LEGACY_STORAGE_KEY);

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const todayStr = getLocalDateString();
        const savedDate = parsed.lastActiveDate || todayStr;

        const resetCheck = applyMidnightResetIfNeeded(
          {
            lastActiveDate: savedDate,
            foodLogs: Array.isArray(parsed.foodLogs) ? parsed.foodLogs : [],
            waterOz: typeof parsed.waterOz === 'number' ? parsed.waterOz : 0,
            macroDayCreditedToday: Boolean(parsed.macroDayCreditedToday),
            ankleWarmupChecks: parsed.ankleWarmupChecks || {
              ankle_circles: false,
              wall_stretch: false,
              band_resisted: false,
            },
            flatShoesVerified: Boolean(parsed.flatShoesVerified),
            lissMinutesToday: typeof parsed.lissMinutesToday === 'number' ? parsed.lissMinutesToday : 0,
            setCompletionMap: {},
          },
          todayStr
        );

        setLastActiveDate(resetCheck.state.lastActiveDate);
        setFoodLogs(resetCheck.state.foodLogs);
        setWaterOz(resetCheck.state.waterOz);
        setMacroDayCreditedToday(resetCheck.state.macroDayCreditedToday);
        setAnkleWarmupChecks(resetCheck.state.ankleWarmupChecks);
        setFlatShoesVerified(resetCheck.state.flatShoesVerified);
        setLissMinutesToday(resetCheck.state.lissMinutesToday);

        if (Array.isArray(parsed.measurements)) setMeasurements(parsed.measurements);
        if (parsed.weeklyConsistency) setWeeklyConsistency(parsed.weeklyConsistency);
        if (Array.isArray(parsed.completedSessionsThisWeek)) {
          setCompletedSessionsThisWeek(parsed.completedSessionsThisWeek);
        }
        if (typeof parsed.lungeSwappedToBss === 'boolean') {
          setLungeSwappedToBss(parsed.lungeSwappedToBss);
        }
        if (typeof parsed.lissModality === 'string') {
          setLissModality(parsed.lissModality);
        }
      }
    } catch {
      // Ignore storage read errors
    }
  }, []);

  // Live 1-second Midnight Reset Watcher & Countdown
  useEffect(() => {
    const checkClock = () => {
      const now = new Date();
      const currentDateStr = getLocalDateString(now);
      setMidnightCountdown(getTimeUntilMidnight(now).formatted);

      if (currentDateStr !== lastActiveDate) {
        performDailyMidnightReset(currentDateStr);
      }
    };

    const interval = window.setInterval(checkClock, 1000);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkClock();
      }
    };
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', checkClock);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', checkClock);
    };
  }, [lastActiveDate, performDailyMidnightReset]);

  // Save state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          lastActiveDate,
          foodLogs,
          waterOz,
          macroDayCreditedToday,
          ankleWarmupChecks,
          flatShoesVerified,
          measurements,
          weeklyConsistency,
          completedSessionsThisWeek,
          lungeSwappedToBss,
          lissModality,
          lissMinutesToday,
        })
      );
    } catch {
      // Ignore storage write errors
    }
  }, [
    lastActiveDate,
    foodLogs,
    waterOz,
    macroDayCreditedToday,
    ankleWarmupChecks,
    flatShoesVerified,
    measurements,
    weeklyConsistency,
    completedSessionsThisWeek,
    lungeSwappedToBss,
    lissModality,
    lissMinutesToday,
  ]);

  const nutritionStatus = calculateDailyNutritionStatus(foodLogs, activeTargets);
  const inchSummary = calculateInchChangeSummary(measurements);
  const keysStatus = evaluateWeeklyKeysToSuccess(weeklyConsistency);

  const handleAddFoodLog = (entry: Omit<FoodLogEntry, 'id' | 'timestamp'>) => {
    const now = new Date();
    const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setFoodLogs((prev) => [
      {
        ...entry,
        id: `food_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        timestamp,
      },
      ...prev,
    ]);
  };

  const handleRemoveFoodLog = (id: string) => {
    setFoodLogs((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCompleteSession = (workoutId: WorkoutDayPlan['id']) => {
    const alreadyDone = completedSessionsThisWeek.includes(workoutId);
    if (alreadyDone) return;

    setCompletedSessionsThisWeek((prev) => [...prev, workoutId]);
    setWeeklyConsistency((prev) => {
      if (workoutId === 'tracy_session') {
        return { ...prev, tracySessionCompleted: true };
      }
      return {
        ...prev,
        programmedWorkoutsCompleted: Math.min(4, prev.programmedWorkoutsCompleted + 1),
      };
    });
  };

  const handleToggleAnkleWarmup = (id: string) => {
    setAnkleWarmupChecks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreditMacroDay = () => {
    if (macroDayCreditedToday) return;
    setMacroDayCreditedToday(true);
    setWeeklyConsistency((prev) => ({
      ...prev,
      macroDaysTrackedAndHit: Math.min(7, prev.macroDaysTrackedAndHit + 1),
    }));
  };

  const handleAddMeasurement = (entry: Omit<BodyMeasurementEntry, 'id'>) => {
    setMeasurements((prev) => [
      ...prev,
      {
        ...entry,
        id: `m_${Date.now()}`,
      },
    ]);
  };

  const handleDeleteMeasurement = (id: string) => {
    setMeasurements((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  return (
    <div className="min-h-screen flex flex-col text-slate-900">
      {/* Strict 3-Zone Top Bar Contract — Turquoise & Pink Theme */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-teal-200/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              handleSelectTab('dashboard');
            }}
            className="text-lg font-bold tracking-tight bg-gradient-to-r from-teal-600 via-pink-600 to-teal-600 bg-clip-text text-transparent whitespace-nowrap shrink-0"
          >
            The Sparkly Drow
          </a>

          {/* Zone 2: 4 single-line text navigation links */}
          <nav aria-label="Primary Navigation" className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            {(
              [
                { id: 'dashboard', label: 'Command Center' },
                { id: 'workouts', label: '4-Day Workout Split' },
                { id: 'nutrition', label: 'Daily Nutrition' },
                { id: 'goals', label: 'Inches & Pillars' },
              ] as const
            ).map((nav) => (
              <button
                key={nav.id}
                type="button"
                onClick={() => handleSelectTab(nav.id)}
                className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
                  activeTab === nav.id
                    ? 'text-pink-600 font-semibold border-b-2 border-teal-500'
                    : 'text-slate-600 hover:text-teal-700'
                }`}
              >
                {nav.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => performDailyMidnightReset(getLocalDateString())}
              className="px-4 py-2 text-xs font-semibold text-white bg-pink-600 rounded-lg hover:bg-pink-500 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Today
            </button>
          </div>
        </div>

        {/* Mobile Secondary Tab Bar */}
        <div className="flex md:hidden items-center gap-1.5 overflow-x-auto pt-3 mt-3 border-t border-pink-100">
          {(
            [
              { id: 'dashboard', label: 'Overview' },
              { id: 'workouts', label: 'Workouts' },
              { id: 'nutrition', label: 'Nutrition' },
              { id: 'goals', label: 'Inches & Pillars' },
            ] as const
          ).map((nav) => (
            <button
              key={nav.id}
              type="button"
              onClick={() => handleSelectTab(nav.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap shrink-0 ${
                activeTab === nav.id
                  ? 'bg-teal-600 text-white'
                  : 'bg-teal-50 text-teal-900'
              }`}
            >
              {nav.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Container (1440px baseline -> max-w-7xl) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        {activeTab === 'dashboard' && (
          <>
            {/* Hero / Weekly Keys to Success Command Center */}
            <section className="bg-white border border-teal-200/90 rounded-xl p-6 lg:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-teal-700 font-medium">
                      <span>The Sparkly Drow Protocol</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-pink-600">Left Ankle Protected 4-Day Split</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums inline-flex items-center gap-1 text-teal-800">
                        <Clock className="w-3.5 h-3.5 text-pink-600" />
                        Midnight Reset ({lastActiveDate}) in {midnightCountdown}
                      </span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 text-balance">
                      Simultaneous Fat Loss & Lean Muscle Growth Command
                    </h1>
                    <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
                      Built around your four core pillars: progressive compound resistance training, a 2,118 kcal high-protein nutrition matrix (129g P / 282g C / 60g F), 7–9 hours of recovery sleep, and ankle-safe LISS & NEAT movement. Daily nutrition, hydration, warm-ups, and workout sets reset automatically at 12:00 AM.
                    </p>
                  </div>

                  {/* Quick Navigation Triggers */}
                  <div className="flex flex-wrap items-center gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => handleSelectTab('workouts')}
                      className="px-4 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
                    >
                      Open 4-Day Workout Split
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectTab('nutrition')}
                      className="px-4 py-2.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
                    >
                      Log 2,118 kcal & 120 oz Water
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectTab('goals')}
                      className="px-4 py-2.5 rounded-lg border border-teal-300 bg-teal-50/60 hover:bg-teal-100/70 text-teal-900 text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
                    >
                      Track Inches & 4 Pillars
                    </button>
                  </div>
                </div>

                {/* Right 5 Columns: Keys to Success Interactive Weekly Scorecard (Deep Drow Obsidian + Turquoise & Pink) */}
                <div className="lg:col-span-5 bg-[#191326] text-white rounded-xl p-6 flex flex-col justify-between space-y-4 border border-pink-500/30">
                  <div className="flex items-center justify-between border-b border-pink-500/20 pb-3">
                    <div>
                      <span className="text-xs text-pink-300 font-medium">Weekly Execution Contract</span>
                      <h2 className="text-lg font-bold text-white">Keys to Success Scorecard</h2>
                    </div>
                    <span className="text-xs font-mono font-bold text-teal-300 tabular-nums">
                      {keysStatus.totalKeysMet} / 3 Keys Active
                    </span>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    {/* Key 1: Tracy 1x/wk + 2 Programmed Workouts */}
                    <div className="p-3 rounded-lg bg-[#241c36] border border-teal-500/30 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">
                          01. Strength Train with Tracy (1x) + 2 Programmed Workouts
                        </p>
                        <p className="text-pink-200/90 mt-0.5 font-mono tabular-nums">
                          Tracy: {weeklyConsistency.tracySessionCompleted ? 'Done' : 'Pending'} · Programmed:{' '}
                          {weeklyConsistency.programmedWorkoutsCompleted}/2+ sessions
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setWeeklyConsistency((prev) => ({
                            ...prev,
                            tracySessionCompleted: !prev.tracySessionCompleted,
                          }))
                        }
                        className={`px-2.5 py-1.5 rounded text-xs font-semibold whitespace-nowrap shrink-0 flex items-center gap-1 ${
                          weeklyConsistency.tracySessionCompleted
                            ? 'bg-teal-500 text-slate-950'
                            : 'bg-pink-600 text-white hover:bg-pink-500'
                        }`}
                      >
                        {weeklyConsistency.tracySessionCompleted && <Check className="w-3.5 h-3.5" />}
                        <span>{weeklyConsistency.tracySessionCompleted ? 'Tracy 1x' : 'Log Tracy 1x'}</span>
                      </button>
                    </div>

                    {/* Key 2: Track macros & hit targets 5x/week */}
                    <div className="p-3 rounded-lg bg-[#241c36] border border-pink-500/30 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">
                          02. Track Macros & Hit Targets 5x / Week
                        </p>
                        <p className="text-teal-200/90 mt-0.5 font-mono tabular-nums">
                          {weeklyConsistency.macroDaysTrackedAndHit}/5 target days hit · 2 untracked days allowed
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          aria-label="Decrement tracked macro days"
                          onClick={() =>
                            setWeeklyConsistency((prev) => ({
                              ...prev,
                              macroDaysTrackedAndHit: Math.max(0, prev.macroDaysTrackedAndHit - 1),
                            }))
                          }
                          className="px-2 py-1 rounded bg-[#33284a] hover:bg-[#3f325c] text-pink-200 font-mono"
                        >
                          -
                        </button>
                        <button
                          type="button"
                          aria-label="Increment tracked macro days"
                          onClick={() =>
                            setWeeklyConsistency((prev) => ({
                              ...prev,
                              macroDaysTrackedAndHit: Math.min(7, prev.macroDaysTrackedAndHit + 1),
                            }))
                          }
                          className="px-2 py-1 rounded bg-teal-500 hover:bg-teal-400 text-slate-950 font-mono font-semibold"
                        >
                          +1 Day
                        </button>
                      </div>
                    </div>

                    {/* Key 3: Cheat Options Selector (1 Cheat Day OR 2 Cheat Meals) */}
                    <div className="p-3 rounded-lg bg-[#241c36] border border-teal-500/30 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-white">
                          03. Cheat Option: 1 Cheat Day OR 2 Cheat Meals
                        </span>
                        <span className="font-mono tabular-nums text-teal-300">
                          {weeklyConsistency.cheatUsedCount}/{keysStatus.maxAllowedCheats} used
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 bg-[#140f1f] p-1 rounded">
                          <button
                            type="button"
                            onClick={() =>
                              setWeeklyConsistency((prev) => ({
                                ...prev,
                                cheatMode: 'one_day',
                                cheatUsedCount: Math.min(1, prev.cheatUsedCount),
                              }))
                            }
                            className={`px-2 py-1 rounded text-[11px] font-semibold whitespace-nowrap shrink-0 ${
                              weeklyConsistency.cheatMode === 'one_day'
                                ? 'bg-pink-500 text-white'
                                : 'text-pink-200/80 hover:text-white'
                            }`}
                          >
                            1 Cheat Day
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setWeeklyConsistency((prev) => ({
                                ...prev,
                                cheatMode: 'two_meals',
                              }))
                            }
                            className={`px-2 py-1 rounded text-[11px] font-semibold whitespace-nowrap shrink-0 ${
                              weeklyConsistency.cheatMode === 'two_meals'
                                ? 'bg-teal-400 text-slate-950'
                                : 'text-teal-200/80 hover:text-white'
                            }`}
                          >
                            2 Cheat Meals
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              setWeeklyConsistency((prev) => ({
                                ...prev,
                                cheatUsedCount:
                                  (prev.cheatUsedCount + 1) % (keysStatus.maxAllowedCheats + 1),
                              }))
                            }
                            className="px-2.5 py-1 rounded bg-pink-600 hover:bg-pink-500 text-white text-[11px] font-mono whitespace-nowrap shrink-0"
                          >
                            Log / Cycle Used
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Full-Width 4-Column Daily Telemetry Strip Below Hero Split */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-pink-100">
                <div className="p-4 rounded-lg bg-pink-50/50 border border-pink-200/80">
                  <div className="flex items-center justify-between text-xs text-pink-700 font-medium">
                    <span>Daily Calorie & Protein Fuel</span>
                    <Flame className="w-4 h-4 text-pink-600" />
                  </div>
                  <p className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                    {nutritionStatus.totals.calories} / {activeTargets.calories} kcal
                  </p>
                  <p className="text-xs font-mono tabular-nums text-slate-600 mt-1">
                    Protein: {nutritionStatus.totals.protein}g / {activeTargets.protein}g · Carbs:{' '}
                    {nutritionStatus.totals.carbs}g · Fats: {nutritionStatus.totals.fats}g
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-teal-50/50 border border-teal-200/80">
                  <div className="flex items-center justify-between text-xs text-teal-700 font-medium">
                    <span>Daily Hydration & Guardrails</span>
                    <Droplets className="w-4 h-4 text-teal-600" />
                  </div>
                  <p className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                    {waterOz} / {activeTargets.waterOz} oz Water
                  </p>
                  <p className="text-xs font-mono tabular-nums text-slate-600 mt-1">
                    Sugar: {nutritionStatus.totals.sugar}g (&lt;40g) · Sat Fat:{' '}
                    {nutritionStatus.totals.saturatedFat}g (&lt;20g)
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-pink-50/50 border border-pink-200/80">
                  <div className="flex items-center justify-between text-xs text-pink-700 font-medium">
                    <span>4-Day Split & Left Ankle Shield</span>
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                  </div>
                  <p className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                    {completedSessionsThisWeek.length} Sessions Logged
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    {lungeSwappedToBss
                      ? 'Bulgarian Split Squat Swap Active'
                      : 'Standard Low Step-Up / Lunge'}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-teal-50/50 border border-teal-200/80">
                  <div className="flex items-center justify-between text-xs text-teal-700 font-medium">
                    <span>Total Recomp Change in Inches</span>
                    <Dumbbell className="w-4 h-4 text-pink-600" />
                  </div>
                  <p className="text-xl font-bold font-mono tabular-nums text-teal-700 mt-1">
                    {measurements.length < 2
                      ? '0.0 in'
                      : `${inchSummary.totalInchesDelta} in (${inchSummary.waistDelta}" Waist)`}
                  </p>
                  <p className="text-xs font-mono tabular-nums text-slate-600 mt-1">
                    {measurements.length === 0
                      ? 'Log first measurement in Inches & Pillars'
                      : `Energy: ${inchSummary.avgEnergy}/10 · Sleep: ${inchSummary.avgSleep}h · Steps: ${inchSummary.avgSteps.toLocaleString()}`}
                  </p>
                </div>
              </div>
            </section>

            {/* Interactive Daily Nutrition directly accessible on Command Center */}
            <NutritionView
              foodLogs={foodLogs}
              onAddFoodLog={handleAddFoodLog}
              onRemoveFoodLog={handleRemoveFoodLog}
              waterOz={waterOz}
              onUpdateWaterOz={setWaterOz}
              activeTargets={activeTargets}
              onUpdateTargets={setActiveTargets}
              onCreditMacroDay={handleCreditMacroDay}
              macroDayCreditedToday={macroDayCreditedToday}
            />
          </>
        )}

        {activeTab === 'workouts' && (
          <WorkoutsView
            completedSessionsThisWeek={completedSessionsThisWeek}
            onCompleteSession={handleCompleteSession}
            ankleWarmupChecks={ankleWarmupChecks}
            onToggleAnkleWarmup={handleToggleAnkleWarmup}
            flatShoesVerified={flatShoesVerified}
            onToggleFlatShoes={() => setFlatShoesVerified((prev) => !prev)}
            lungeSwappedToBss={lungeSwappedToBss}
            onToggleLungeSwap={() => setLungeSwappedToBss((prev) => !prev)}
            lissMinutesToday={lissMinutesToday}
            lissModality={lissModality}
            onUpdateLiss={(mod, mins) => {
              setLissModality(mod);
              setLissMinutesToday(mins);
            }}
            lastActiveDate={lastActiveDate}
          />
        )}

        {activeTab === 'nutrition' && (
          <NutritionView
            foodLogs={foodLogs}
            onAddFoodLog={handleAddFoodLog}
            onRemoveFoodLog={handleRemoveFoodLog}
            waterOz={waterOz}
            onUpdateWaterOz={setWaterOz}
            activeTargets={activeTargets}
            onUpdateTargets={setActiveTargets}
            onCreditMacroDay={handleCreditMacroDay}
            macroDayCreditedToday={macroDayCreditedToday}
          />
        )}

        {activeTab === 'goals' && (
          <GoalsAndPillarsView
            measurements={measurements}
            onAddMeasurement={handleAddMeasurement}
            onDeleteMeasurement={handleDeleteMeasurement}
          />
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-teal-200/80 bg-white/90 px-6 py-5 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <span>
            <strong className="text-pink-600">The Sparkly Drow</strong> — 4-Day Upper/Lower Split (Left Ankle Protected) · 2,118 kcal / 129P / 282C / 60F · 120 oz Water · Automatic 12:00 AM Reset
          </span>
          <div className="flex items-center gap-4 font-medium">
            <button
              type="button"
              onClick={() => handleSelectTab('workouts')}
              className="text-teal-700 hover:text-pink-600 transition-colors"
            >
              Workouts
            </button>
            <button
              type="button"
              onClick={() => handleSelectTab('nutrition')}
              className="text-teal-700 hover:text-pink-600 transition-colors"
            >
              Nutrition
            </button>
            <button
              type="button"
              onClick={() => handleSelectTab('goals')}
              className="text-teal-700 hover:text-pink-600 transition-colors"
            >
              Inches & Pillars
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
