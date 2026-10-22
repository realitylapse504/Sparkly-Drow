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
import { Check, Flame, Droplets, Dumbbell, RotateCcw, Clock, Ruler, ArrowRight } from 'lucide-react';

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
  const waterPct = Math.min(100, Math.round((waterOz / activeTargets.waterOz) * 100));

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
      if (workoutId === 'full_body_session') {
        return { ...prev, weeklyFullBodyCompleted: true };
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
      {/* Strict 3-Zone Top Bar Contract — Bubbly Turquoise & Pink */}
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-pink-200/70 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              handleSelectTab('dashboard');
            }}
            className="text-xl font-bold tracking-tight bg-gradient-to-r from-teal-500 via-pink-500 to-teal-500 bg-clip-text text-transparent whitespace-nowrap shrink-0"
          >
            The Sparkly Drow
          </a>

          {/* Zone 2: 4 Concise Nav Links */}
          <nav aria-label="Primary Navigation" className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600">
            {(
              [
                { id: 'dashboard', label: 'Today' },
                { id: 'workouts', label: 'Workouts' },
                { id: 'nutrition', label: 'Nutrition' },
                { id: 'goals', label: 'Progress & Guide' },
              ] as const
            ).map((nav) => (
              <button
                key={nav.id}
                type="button"
                onClick={() => handleSelectTab(nav.id)}
                className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
                  activeTab === nav.id
                    ? 'text-pink-600 font-bold border-b-2 border-teal-400'
                    : 'text-slate-600 hover:text-teal-600'
                }`}
              >
                {nav.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => performDailyMidnightReset(getLocalDateString())}
              className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl hover:from-pink-600 hover:to-pink-700 transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Day
            </button>
          </div>
        </div>

        {/* Mobile Secondary Tab Bar */}
        <div className="flex md:hidden items-center gap-2 overflow-x-auto pt-3 mt-3 border-t border-pink-100">
          {(
            [
              { id: 'dashboard', label: 'Today' },
              { id: 'workouts', label: 'Workouts' },
              { id: 'nutrition', label: 'Nutrition' },
              { id: 'goals', label: 'Progress' },
            ] as const
          ).map((nav) => (
            <button
              key={nav.id}
              type="button"
              onClick={() => handleSelectTab(nav.id)}
              className={`px-3.5 py-1.5 rounded-2xl text-xs font-semibold whitespace-nowrap shrink-0 ${
                activeTab === nav.id
                  ? 'bg-teal-500 text-white'
                  : 'bg-pink-50 text-pink-800'
              }`}
            >
              {nav.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 space-y-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Airy, Upbeat Hero Card */}
            <section className="bg-white/95 border border-teal-200/80 rounded-3xl p-7 lg:p-8 shadow-xs">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Left 6 Columns: Friendly Greeting & Quick Jumps */}
                <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-teal-600">
                      <span>4-Day Split</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-pink-500">Ankle-Friendly</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums inline-flex items-center gap-1 text-slate-500 font-normal">
                        <Clock className="w-3.5 h-3.5 text-pink-500" />
                        Resets in {midnightCountdown}
                      </span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 text-balance">
                      Strong, Fueled & Feeling Good
                    </h1>
                    <p className="text-sm text-slate-600 leading-relaxed max-w-md">
                      Your daily spot for ankle-friendly lifts, 2,118 cal macro goals, and 120 oz of water. Everything resets fresh at midnight!
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleSelectTab('workouts')}
                      className="px-5 py-2.5 rounded-2xl bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5"
                    >
                      Start a Workout <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectTab('nutrition')}
                      className="px-5 py-2.5 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold transition-all whitespace-nowrap shrink-0"
                    >
                      Log Food & Water
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectTab('goals')}
                      className="px-4 py-2.5 rounded-2xl border border-teal-200 bg-teal-50/60 hover:bg-teal-100/70 text-teal-900 text-xs font-bold transition-all whitespace-nowrap shrink-0"
                    >
                      Check-In Inches
                    </button>
                  </div>
                </div>

                {/* Right 6 Columns: Bubbly Weekly Wins (Keys to Success) */}
                <div className="lg:col-span-6 bg-gradient-to-br from-teal-50/90 via-white to-pink-50/90 border border-pink-200/80 rounded-3xl p-6 flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">This Week’s Keys to Success</h2>
                      <p className="text-xs text-slate-500">Three simple habits that drive results</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-pink-600 tabular-nums">
                      {keysStatus.totalKeysMet} / 3 Hit
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    {/* Key 1: Full-Body + 2 Split Days */}
                    <div className="p-3.5 rounded-2xl bg-white border border-teal-200/80 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-900">1. Full-Body Session (1x) + 2 Split Days</p>
                        <p className="text-slate-500 mt-0.5 font-mono tabular-nums">
                          Full-Body: {weeklyConsistency.weeklyFullBodyCompleted ? 'Done' : 'Not yet'} · Split:{' '}
                          {weeklyConsistency.programmedWorkoutsCompleted}/2
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setWeeklyConsistency((prev) => ({
                            ...prev,
                            weeklyFullBodyCompleted: !prev.weeklyFullBodyCompleted,
                          }))
                        }
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 flex items-center gap-1 transition-colors ${
                          weeklyConsistency.weeklyFullBodyCompleted
                            ? 'bg-teal-500 text-white'
                            : 'bg-pink-100 text-pink-700 hover:bg-pink-200'
                        }`}
                      >
                        {weeklyConsistency.weeklyFullBodyCompleted && <Check className="w-3.5 h-3.5" />}
                        <span>{weeklyConsistency.weeklyFullBodyCompleted ? 'Full-Body Done' : 'Check Full-Body'}</span>
                      </button>
                    </div>

                    {/* Key 2: 5 Macro Days */}
                    <div className="p-3.5 rounded-2xl bg-white border border-pink-200/80 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-900">2. Hit Macros 5x / Week</p>
                        <p className="text-slate-500 mt-0.5 font-mono tabular-nums">
                          {weeklyConsistency.macroDaysTrackedAndHit}/5 days hit · 2 days off-duty!
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          aria-label="Decrement tracked macro days"
                          onClick={() =>
                            setWeeklyConsistency((prev) => ({
                              ...prev,
                              macroDaysTrackedAndHit: Math.max(0, prev.macroDaysTrackedAndHit - 1),
                            }))
                          }
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-bold"
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
                          className="px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-mono font-bold"
                        >
                          +1 Day
                        </button>
                      </div>
                    </div>

                    {/* Key 3: Cheat Option */}
                    <div className="p-3.5 rounded-2xl bg-white border border-teal-200/80 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-bold text-slate-900">3. Weekly Treat Choice</p>
                        <p className="text-slate-500 mt-0.5 font-mono tabular-nums">
                          {weeklyConsistency.cheatUsedCount}/{keysStatus.maxAllowedCheats} used this week
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-1 bg-pink-50 p-1 rounded-xl border border-pink-200/60">
                          <button
                            type="button"
                            onClick={() =>
                              setWeeklyConsistency((prev) => ({
                                ...prev,
                                cheatMode: 'one_day',
                                cheatUsedCount: Math.min(1, prev.cheatUsedCount),
                              }))
                            }
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap shrink-0 ${
                              weeklyConsistency.cheatMode === 'one_day'
                                ? 'bg-pink-500 text-white'
                                : 'text-pink-700 hover:text-pink-900'
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
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap shrink-0 ${
                              weeklyConsistency.cheatMode === 'two_meals'
                                ? 'bg-teal-500 text-white'
                                : 'text-teal-800 hover:text-teal-950'
                            }`}
                          >
                            2 Cheat Meals
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setWeeklyConsistency((prev) => ({
                              ...prev,
                              cheatUsedCount:
                                (prev.cheatUsedCount + 1) % (keysStatus.maxAllowedCheats + 1),
                            }))
                          }
                          className="px-2.5 py-1.5 rounded-xl bg-pink-100 hover:bg-pink-200 text-pink-800 text-[11px] font-bold whitespace-nowrap shrink-0"
                        >
                          Use Treat
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 4 Bubbly Daily Snapshot Cards (Uncluttered — No Duplicate Full Page Below!) */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Card 1: Daily Fuel */}
              <div className="bg-white border border-pink-200/80 rounded-3xl p-6 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-pink-600">
                    <span>Today’s Fuel</span>
                    <Flame className="w-4 h-4" />
                  </div>
                  <p className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-2">
                    {nutritionStatus.totals.calories} <span className="text-sm font-normal text-slate-400">/ {activeTargets.calories} cal</span>
                  </p>
                  <p className="text-xs font-mono tabular-nums text-slate-600 mt-1.5">
                    Protein: <strong>{nutritionStatus.totals.protein}g</strong> / {activeTargets.protein}g
                  </p>
                  <p className="text-xs font-mono tabular-nums text-slate-500 mt-0.5">
                    Carbs: {nutritionStatus.totals.carbs}g · Fats: {nutritionStatus.totals.fats}g
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectTab('nutrition')}
                  className="w-full py-2 px-3 rounded-2xl bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-bold transition-colors"
                >
                  Open Food Picker
                </button>
              </div>

              {/* Card 2: 120 oz Water Quick-Tap */}
              <div className="bg-white border border-teal-200/80 rounded-3xl p-6 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-teal-600">
                    <span>120 oz Water Goal</span>
                    <Droplets className="w-4 h-4" />
                  </div>
                  <p className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-2">
                    {waterOz} <span className="text-sm font-normal text-slate-400">/ {activeTargets.waterOz} oz</span>
                  </p>
                  <div className="w-full h-2 bg-teal-100 rounded-full overflow-hidden mt-2.5">
                    <div
                      className="h-full bg-gradient-to-r from-teal-400 to-pink-400 transition-transform duration-150 origin-left"
                      style={{ width: `${waterPct}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[8, 16, 24].map((oz) => (
                    <button
                      key={oz}
                      type="button"
                      onClick={() => setWaterOz((prev) => prev + oz)}
                      className="py-1.5 px-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-xs font-mono font-bold transition-colors"
                    >
                      +{oz}oz
                    </button>
                  ))}
                </div>
              </div>

              {/* Card 3: Workouts */}
              <div className="bg-white border border-pink-200/80 rounded-3xl p-6 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-pink-600">
                    <span>4-Day Split</span>
                    <Dumbbell className="w-4 h-4" />
                  </div>
                  <p className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-2">
                    {completedSessionsThisWeek.length} <span className="text-sm font-normal text-slate-400">logged this week</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1.5">
                    Upper / Lower split with left-ankle warm-ups & swaps built in.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectTab('workouts')}
                  className="w-full py-2 px-3 rounded-2xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition-colors"
                >
                  View Workout Plan
                </button>
              </div>

              {/* Card 4: Inches & Energy */}
              <div className="bg-white border border-teal-200/80 rounded-3xl p-6 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-teal-600">
                    <span>Inches & Energy</span>
                    <Ruler className="w-4 h-4" />
                  </div>
                  <p className="text-2xl font-bold font-mono tabular-nums text-teal-600 mt-2">
                    {measurements.length < 2 ? '0.0 in' : `${inchSummary.totalInchesDelta} in`}
                  </p>
                  <p className="text-xs text-slate-500 mt-1.5">
                    {measurements.length === 0
                      ? 'Log your starting measurements anytime.'
                      : `Energy: ${inchSummary.avgEnergy}/10 · Sleep: ${inchSummary.avgSleep}h`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectTab('goals')}
                  className="w-full py-2 px-3 rounded-2xl bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-bold transition-colors"
                >
                  Log Check-In
                </button>
              </div>
            </section>
          </div>
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

      {/* Quiet, Concise Footer */}
      <footer className="border-t border-pink-200/60 bg-white/80 px-6 py-5 mt-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <span>
            <strong className="text-pink-600">The Sparkly Drow</strong> · 2,118 cal · 129g Protein · 120 oz Water · Resets at 12:00 AM
          </span>
          <div className="flex items-center gap-5 font-semibold">
            <button
              type="button"
              onClick={() => handleSelectTab('workouts')}
              className="text-teal-600 hover:text-pink-600 transition-colors"
            >
              Workouts
            </button>
            <button
              type="button"
              onClick={() => handleSelectTab('nutrition')}
              className="text-teal-600 hover:text-pink-600 transition-colors"
            >
              Nutrition
            </button>
            <button
              type="button"
              onClick={() => handleSelectTab('goals')}
              className="text-teal-600 hover:text-pink-600 transition-colors"
            >
              Progress & Guide
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
