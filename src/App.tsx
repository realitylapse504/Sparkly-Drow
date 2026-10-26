import React, { useState, useEffect, useCallback } from 'react';
import {
  PRESCRIBED_TARGETS,
  calculateDailyNutritionStatus,
  calculateInchChangeSummary,
  evaluateWeeklyKeysToSuccess,
  getLocalDateString,
  getWeekStartDateString,
  getTimeUntilMidnight,
  applyMidnightResetIfNeeded,
  applyWeeklyResetIfNeeded,
  resetWorkoutSessionForDay,
  type FoodLogEntry,
  type BodyMeasurementEntry,
  type WeeklyConsistencyState,
  type CompletedWeekSummary,
  type MacroTargets,
} from './utils/recompLogic';
import {
  INITIAL_FOOD_LOGS,
  INITIAL_MEASUREMENT_LOGS,
  INITIAL_WEEKLY_CONSISTENCY,
  WORKOUT_PLANS,
  buildDefaultSetLogs,
  getDailyQuestsForDate,
  type WorkoutDayPlan,
  type SetLogEntry,
  type DailyWarmupQuest,
} from './data/programData';
import { WorkoutsView } from './components/WorkoutsView';
import { NutritionView } from './components/NutritionView';
import { GoalsAndPillarsView } from './components/GoalsAndPillarsView';
import { DailyQuestsSection } from './components/DailyQuestsSection';
import { PWAInstallButton, OfflineIndicator } from './components/PWAInstallButton';
import { Check, Flame, Droplets, Dumbbell, RotateCcw, Clock, Ruler, ArrowRight, Sparkles } from 'lucide-react';

type ActiveTab = 'dashboard' | 'workouts' | 'nutrition' | 'goals';

const STORAGE_KEY = 'recompos_clean_state_v2';
const LEGACY_STORAGE_KEY = 'recompos_github_state_v1';

function getDefaultWorkoutIdForToday(): WorkoutDayPlan['id'] {
  const day = new Date().getDay();
  if (day === 1) return 'upper_a';
  if (day === 2) return 'lower_a';
  if (day === 3) return 'full_body_session';
  if (day === 5) return 'upper_b';
  if (day === 6) return 'lower_b';
  return 'upper_a';
}

function loadHydratedAppState() {
  const todayStr = getLocalDateString();
  const currentWeekStart = getWeekStartDateString();
  const defaultWarmup = {
    ankle_circles: false,
    wall_stretch: false,
    band_resisted: false,
  };

  try {
    if (typeof window === 'undefined') {
      return null;
    }
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;

    const parsed = JSON.parse(saved);
    const savedDate = parsed.lastActiveDate || todayStr;
    const savedWeekStart = parsed.lastActiveWeekStart || currentWeekStart;
    const savedCustomWorkouts: WorkoutDayPlan[] = Array.isArray(parsed.customWorkouts)
      ? parsed.customWorkouts
      : [];
    const savedScheduleOverrides: Record<string, string> =
      parsed.scheduleOverrides && typeof parsed.scheduleOverrides === 'object'
        ? parsed.scheduleOverrides
        : {};
    const savedCustomDailyQuests: DailyWarmupQuest[] = Array.isArray(parsed.customDailyQuests)
      ? parsed.customDailyQuests
      : [];

    const defaultSetLogs = buildDefaultSetLogs([...WORKOUT_PLANS, ...savedCustomWorkouts]);
    const rawSetLogs: Record<string, SetLogEntry> = { ...defaultSetLogs };
    if (parsed.setLogs && typeof parsed.setLogs === 'object') {
      for (const [k, v] of Object.entries(parsed.setLogs)) {
        if (v && typeof v === 'object') {
          const entry = v as Partial<SetLogEntry>;
          rawSetLogs[k] = {
            weightLbs:
              typeof entry.weightLbs === 'number'
                ? entry.weightLbs
                : defaultSetLogs[k]?.weightLbs ?? 0,
            repsCompleted:
              typeof entry.repsCompleted === 'string'
                ? entry.repsCompleted
                : defaultSetLogs[k]?.repsCompleted ?? '8-10',
            completed: Boolean(entry.completed),
          };
        }
      }
    }

    const setCompletionMap: Record<string, boolean> = {};
    for (const [k, v] of Object.entries(rawSetLogs)) {
      setCompletionMap[k] = v.completed;
    }

    const resetCheck = applyMidnightResetIfNeeded(
      {
        lastActiveDate: savedDate,
        foodLogs: Array.isArray(parsed.foodLogs) ? parsed.foodLogs : [],
        waterOz: typeof parsed.waterOz === 'number' ? parsed.waterOz : 0,
        macroDayCreditedToday: Boolean(parsed.macroDayCreditedToday),
        ankleWarmupChecks: parsed.ankleWarmupChecks || defaultWarmup,
        flatShoesVerified: Boolean(parsed.flatShoesVerified),
        lissMinutesToday:
          typeof parsed.lissMinutesToday === 'number' ? parsed.lissMinutesToday : 0,
        setCompletionMap,
        completedQuestIdsToday: Array.isArray(parsed.completedQuestIdsToday)
          ? parsed.completedQuestIdsToday
          : [],
        questShuffleIndex:
          typeof parsed.questShuffleIndex === 'number' ? parsed.questShuffleIndex : 0,
      },
      todayStr
    );

    const hydratedSetLogs: Record<string, SetLogEntry> = {};
    for (const [k, v] of Object.entries(rawSetLogs)) {
      hydratedSetLogs[k] = {
        ...v,
        completed: Boolean(resetCheck.state.setCompletionMap[k]),
      };
    }

    const weeklyResetCheck = applyWeeklyResetIfNeeded(
      {
        lastActiveWeekStart: savedWeekStart,
        completedSessionsThisWeek: Array.isArray(parsed.completedSessionsThisWeek)
          ? parsed.completedSessionsThisWeek
          : [],
        weeklyConsistency: parsed.weeklyConsistency
          ? { ...INITIAL_WEEKLY_CONSISTENCY, ...parsed.weeklyConsistency }
          : INITIAL_WEEKLY_CONSISTENCY,
        weeklyHistory: Array.isArray(parsed.weeklyHistory) ? parsed.weeklyHistory : [],
      },
      currentWeekStart,
      todayStr
    );

    return {
      lastActiveDate: resetCheck.state.lastActiveDate,
      lastActiveWeekStart: weeklyResetCheck.state.lastActiveWeekStart,
      foodLogs: resetCheck.state.foodLogs,
      waterOz: resetCheck.state.waterOz,
      macroDayCreditedToday: resetCheck.state.macroDayCreditedToday,
      ankleWarmupChecks: resetCheck.state.ankleWarmupChecks,
      flatShoesVerified: resetCheck.state.flatShoesVerified,
      lissMinutesToday: resetCheck.state.lissMinutesToday,
      completedQuestIdsToday: resetCheck.state.completedQuestIdsToday ?? [],
      questShuffleIndex: resetCheck.state.questShuffleIndex ?? 0,
      customDailyQuests: savedCustomDailyQuests,
      totalLifetimeQuestsCompleted:
        typeof parsed.totalLifetimeQuestsCompleted === 'number'
          ? parsed.totalLifetimeQuestsCompleted
          : 0,
      setLogs: hydratedSetLogs,
      activeWorkoutId:
        (parsed.activeWorkoutId as WorkoutDayPlan['id']) || getDefaultWorkoutIdForToday(),
      activeTargets:
        parsed.activeTargets && typeof parsed.activeTargets.calories === 'number'
          ? (parsed.activeTargets as MacroTargets)
          : PRESCRIBED_TARGETS,
      measurements: Array.isArray(parsed.measurements)
        ? parsed.measurements
        : INITIAL_MEASUREMENT_LOGS,
      weeklyConsistency: weeklyResetCheck.state.weeklyConsistency,
      completedSessionsThisWeek: weeklyResetCheck.state.completedSessionsThisWeek,
      weeklyHistory: weeklyResetCheck.state.weeklyHistory,
      lungeSwappedToBss:
        typeof parsed.lungeSwappedToBss === 'boolean' ? parsed.lungeSwappedToBss : false,
      lissModality:
        typeof parsed.lissModality === 'string'
          ? parsed.lissModality
          : 'Incline Treadmill Walk',
      customWorkouts: savedCustomWorkouts,
      scheduleOverrides: savedScheduleOverrides,
    };
  } catch {
    return null;
  }
}

export default function App() {
  const [initialHydrated] = useState(() => loadHydratedAppState());

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [lastActiveDate, setLastActiveDate] = useState<string>(
    () => initialHydrated?.lastActiveDate ?? getLocalDateString()
  );
  const [lastActiveWeekStart, setLastActiveWeekStart] = useState<string>(
    () => initialHydrated?.lastActiveWeekStart ?? getWeekStartDateString()
  );
  const [midnightCountdown, setMidnightCountdown] = useState<string>(
    () => getTimeUntilMidnight().formatted
  );

  // Persisted daily & weekly states (zero demo data by default)
  const [foodLogs, setFoodLogs] = useState<FoodLogEntry[]>(
    () => initialHydrated?.foodLogs ?? INITIAL_FOOD_LOGS
  );
  const [waterOz, setWaterOz] = useState<number>(() => initialHydrated?.waterOz ?? 0);
  const [activeTargets, setActiveTargets] = useState<MacroTargets>(
    () => initialHydrated?.activeTargets ?? PRESCRIBED_TARGETS
  );
  const [measurements, setMeasurements] = useState<BodyMeasurementEntry[]>(
    () => initialHydrated?.measurements ?? INITIAL_MEASUREMENT_LOGS
  );
  const [weeklyConsistency, setWeeklyConsistency] = useState<WeeklyConsistencyState>(
    () => initialHydrated?.weeklyConsistency ?? INITIAL_WEEKLY_CONSISTENCY
  );
  const [completedSessionsThisWeek, setCompletedSessionsThisWeek] = useState<string[]>(
    () => initialHydrated?.completedSessionsThisWeek ?? []
  );
  const [weeklyHistory, setWeeklyHistory] = useState<CompletedWeekSummary[]>(
    () => initialHydrated?.weeklyHistory ?? []
  );
  const [activeWorkoutId, setActiveWorkoutId] = useState<WorkoutDayPlan['id']>(
    () => initialHydrated?.activeWorkoutId ?? getDefaultWorkoutIdForToday()
  );
  const [setLogs, setSetLogs] = useState<Record<string, SetLogEntry>>(
    () => initialHydrated?.setLogs ?? buildDefaultSetLogs()
  );
  const [ankleWarmupChecks, setAnkleWarmupChecks] = useState<Record<string, boolean>>(
    () =>
      initialHydrated?.ankleWarmupChecks ?? {
        ankle_circles: false,
        wall_stretch: false,
        band_resisted: false,
      }
  );
  const [flatShoesVerified, setFlatShoesVerified] = useState<boolean>(
    () => initialHydrated?.flatShoesVerified ?? false
  );
  const [lungeSwappedToBss, setLungeSwappedToBss] = useState<boolean>(
    () => initialHydrated?.lungeSwappedToBss ?? false
  );
  const [lissModality, setLissModality] = useState<string>(
    () => initialHydrated?.lissModality ?? 'Incline Treadmill Walk'
  );
  const [lissMinutesToday, setLissMinutesToday] = useState<number>(
    () => initialHydrated?.lissMinutesToday ?? 0
  );
  const [macroDayCreditedToday, setMacroDayCreditedToday] = useState<boolean>(
    () => initialHydrated?.macroDayCreditedToday ?? false
  );
  const [customWorkouts, setCustomWorkouts] = useState<WorkoutDayPlan[]>(
    () => initialHydrated?.customWorkouts ?? []
  );
  const [scheduleOverrides, setScheduleOverrides] = useState<Record<string, string>>(
    () => initialHydrated?.scheduleOverrides ?? {}
  );

  // Daily Warm-Up Quests states
  const [completedQuestIdsToday, setCompletedQuestIdsToday] = useState<string[]>(
    () => initialHydrated?.completedQuestIdsToday ?? []
  );
  const [questShuffleIndex, setQuestShuffleIndex] = useState<number>(
    () => initialHydrated?.questShuffleIndex ?? 0
  );
  const [customDailyQuests, setCustomDailyQuests] = useState<DailyWarmupQuest[]>(
    () => initialHydrated?.customDailyQuests ?? []
  );
  const [totalLifetimeQuestsCompleted, setTotalLifetimeQuestsCompleted] = useState<number>(
    () => initialHydrated?.totalLifetimeQuestsCompleted ?? 0
  );

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
    setCompletedQuestIdsToday([]);
    setQuestShuffleIndex(0);
    setSetLogs((prev) => {
      const next: Record<string, SetLogEntry> = {};
      for (const [k, v] of Object.entries(prev)) {
        next[k] = { ...v, completed: false };
      }
      return next;
    });
  }, []);

  const performWeeklyReset = useCallback(
    (newWeekStartStr: string = getWeekStartDateString()) => {
      setWeeklyHistory((prevHistory) => {
        const hadActivity =
          completedSessionsThisWeek.length > 0 ||
          weeklyConsistency.weeklyFullBodyCompleted ||
          weeklyConsistency.programmedWorkoutsCompleted > 0 ||
          weeklyConsistency.macroDaysTrackedAndHit > 0;
        if (!hadActivity) return prevHistory;
        const evalPrev = evaluateWeeklyKeysToSuccess(weeklyConsistency);
        return [
          {
            weekStartDate: lastActiveWeekStart,
            completedAtDate: getLocalDateString(),
            workoutsCompletedCount: completedSessionsThisWeek.length,
            fullBodyCompleted: weeklyConsistency.weeklyFullBodyCompleted,
            macroDaysHit: weeklyConsistency.macroDaysTrackedAndHit,
            keysMetCount: evalPrev.totalKeysMet,
          },
          ...prevHistory,
        ].slice(0, 24);
      });

      setLastActiveWeekStart(newWeekStartStr);
      setCompletedSessionsThisWeek([]);
      setWeeklyConsistency((prev) => ({
        weeklyFullBodyCompleted: false,
        programmedWorkoutsCompleted: 0,
        macroDaysTrackedAndHit: 0,
        cheatMode: prev.cheatMode || 'two_meals',
        cheatUsedCount: 0,
      }));
      setSetLogs((prev) => {
        const next: Record<string, SetLogEntry> = {};
        for (const [k, v] of Object.entries(prev)) {
          next[k] = { ...v, completed: false };
        }
        return next;
      });
    },
    [completedSessionsThisWeek, weeklyConsistency, lastActiveWeekStart]
  );

  // Live 1-second Midnight & Monday Weekly Reset Watcher
  useEffect(() => {
    const checkClock = () => {
      const now = new Date();
      const currentDateStr = getLocalDateString(now);
      const currentWeekStartStr = getWeekStartDateString(now);
      setMidnightCountdown(getTimeUntilMidnight(now).formatted);

      if (currentDateStr !== lastActiveDate) {
        performDailyMidnightReset(currentDateStr);
      }
      if (currentWeekStartStr !== lastActiveWeekStart) {
        performWeeklyReset(currentWeekStartStr);
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
  }, [lastActiveDate, lastActiveWeekStart, performDailyMidnightReset, performWeeklyReset]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          lastActiveDate,
          lastActiveWeekStart,
          foodLogs,
          waterOz,
          activeTargets,
          macroDayCreditedToday,
          ankleWarmupChecks,
          flatShoesVerified,
          measurements,
          weeklyConsistency,
          completedSessionsThisWeek,
          weeklyHistory,
          activeWorkoutId,
          setLogs,
          lungeSwappedToBss,
          lissModality,
          lissMinutesToday,
          customWorkouts,
          scheduleOverrides,
          completedQuestIdsToday,
          questShuffleIndex,
          customDailyQuests,
          totalLifetimeQuestsCompleted,
        })
      );
    } catch {
      // Ignore storage write errors
    }
  }, [
    lastActiveDate,
    lastActiveWeekStart,
    foodLogs,
    waterOz,
    activeTargets,
    macroDayCreditedToday,
    ankleWarmupChecks,
    flatShoesVerified,
    measurements,
    weeklyConsistency,
    completedSessionsThisWeek,
    weeklyHistory,
    activeWorkoutId,
    setLogs,
    lungeSwappedToBss,
    lissModality,
    lissMinutesToday,
    customWorkouts,
    scheduleOverrides,
    completedQuestIdsToday,
    questShuffleIndex,
    customDailyQuests,
    totalLifetimeQuestsCompleted,
  ]);

  const nutritionStatus = calculateDailyNutritionStatus(foodLogs, activeTargets);
  const inchSummary = calculateInchChangeSummary(measurements);
  const keysStatus = evaluateWeeklyKeysToSuccess(weeklyConsistency);
  const waterPct = Math.min(100, Math.round((waterOz / activeTargets.waterOz) * 100));
  const dailyQuestsForToday = getDailyQuestsForDate(
    lastActiveDate,
    questShuffleIndex,
    customDailyQuests
  );

  const handleToggleDailyQuest = (questId: string) => {
    setCompletedQuestIdsToday((prev) => {
      const alreadyCompleted = prev.includes(questId);
      if (alreadyCompleted) {
        setTotalLifetimeQuestsCompleted((count) => Math.max(0, count - 1));
        return prev.filter((id) => id !== questId);
      } else {
        setTotalLifetimeQuestsCompleted((count) => count + 1);
        return [...prev, questId];
      }
    });
  };

  const handleShuffleDailyQuests = () => {
    setQuestShuffleIndex((prev) => prev + 1);
  };

  const handleAddCustomDailyQuest = (quest: DailyWarmupQuest) => {
    setCustomDailyQuests((prev) => [...prev, quest]);
  };

  const handleDeleteCustomDailyQuest = (questId: string) => {
    setCustomDailyQuests((prev) => prev.filter((q) => q.id !== questId));
    setCompletedQuestIdsToday((prev) => prev.filter((id) => id !== questId));
  };

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

  const handleResetWorkoutDay = useCallback(
    (workoutId: WorkoutDayPlan['id'] = activeWorkoutId) => {
      const allPlans = [...WORKOUT_PLANS, ...customWorkouts];
      const targetPlan = allPlans.find((w) => w.id === workoutId);
      const exerciseIds = targetPlan ? targetPlan.exercises.map((e) => e.id) : [];

      const currentSetMap: Record<string, boolean> = {};
      for (const [k, v] of Object.entries(setLogs)) {
        currentSetMap[k] = Boolean(v.completed);
      }

      const result = resetWorkoutSessionForDay({
        workoutId,
        exerciseIds,
        completedSessionsThisWeek,
        weeklyConsistency,
        setCompletionMap: currentSetMap,
      });

      setCompletedSessionsThisWeek(result.completedSessionsThisWeek);
      setWeeklyConsistency(result.weeklyConsistency);
      setSetLogs((prev) => {
        const next: Record<string, SetLogEntry> = {};
        for (const [k, v] of Object.entries(prev)) {
          next[k] = {
            ...v,
            completed: Boolean(result.setCompletionMap[k]),
          };
        }
        return next;
      });
    },
    [activeWorkoutId, customWorkouts, setLogs, completedSessionsThisWeek, weeklyConsistency]
  );

  const handleTopBarResetDay = useCallback(() => {
    if (activeTab === 'workouts') {
      handleResetWorkoutDay(activeWorkoutId);
      setAnkleWarmupChecks({
        ankle_circles: false,
        wall_stretch: false,
        band_resisted: false,
      });
      setFlatShoesVerified(false);
      setLissMinutesToday(0);
      return;
    }
    performDailyMidnightReset(getLocalDateString());
    handleResetWorkoutDay(activeWorkoutId);
  }, [activeTab, activeWorkoutId, handleResetWorkoutDay, performDailyMidnightReset]);

  const handleAddCustomWorkout = (workout: WorkoutDayPlan, scheduleDay?: string) => {
    setCustomWorkouts((prev) => [...prev, workout]);
    const newWorkoutLogs = buildDefaultSetLogs([workout]);
    setSetLogs((prev) => ({
      ...newWorkoutLogs,
      ...prev,
    }));
    if (scheduleDay) {
      setScheduleOverrides((prev) => ({
        ...prev,
        [scheduleDay]: workout.id,
      }));
    }
    setActiveWorkoutId(workout.id);
  };

  const handleDeleteCustomWorkout = (workoutId: string) => {
    setCustomWorkouts((prev) => prev.filter((w) => w.id !== workoutId));
    setScheduleOverrides((prev) => {
      const next: Record<string, string> = {};
      for (const [day, assignedId] of Object.entries(prev)) {
        if (assignedId !== workoutId) {
          next[day] = assignedId;
        }
      }
      return next;
    });
  };

  const handleUpdateScheduleDay = (day: string, workoutOrRestId: string) => {
    setScheduleOverrides((prev) => ({
      ...prev,
      [day]: workoutOrRestId,
    }));
  };

  const handleResetScheduleOverrides = () => {
    setScheduleOverrides({});
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
      {/* Strict 3-Zone Top Bar Contract — Desktop & Mobile App Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-pink-200/70 px-4 sm:px-6 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 sm:gap-8">
          {/* Zone 1: Brand Wordmark */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              handleSelectTab('dashboard');
            }}
            className="text-lg sm:text-xl font-bold tracking-tight bg-gradient-to-r from-teal-500 via-pink-500 to-teal-500 bg-clip-text text-transparent whitespace-nowrap shrink-0"
          >
            The Sparkly Drow
          </a>

          {/* Zone 2: 4 Concise Nav Links (Desktop) */}
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

          {/* Zone 3: Install App + Reset Day */}
          <div className="flex items-center gap-2 shrink-0">
            <PWAInstallButton />
            <button
              type="button"
              onClick={handleTopBarResetDay}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl hover:from-pink-600 hover:to-pink-700 transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Day</span>
              <span className="sm:hidden">Reset</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container (padded at bottom on mobile for native app dock) */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-5 sm:pt-8 pb-24 md:pb-8 space-y-6 sm:space-y-8">
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
                      Your daily spot for warm-up quests, ankle-friendly lifts, 2,118 cal macro goals, and 120 oz of water. Daily logs reset at midnight and weekly workouts reset every Monday!
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
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">This Week’s Keys to Success</h2>
                      <p className="text-xs text-slate-500">
                        Week of {lastActiveWeekStart} · Auto-resets Monday
                        {weeklyHistory.length > 0 && ` · ${weeklyHistory.length} wks logged`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-mono font-bold text-pink-600 tabular-nums">
                        {keysStatus.totalKeysMet} / 3 Hit
                      </span>
                      <button
                        type="button"
                        onClick={() => performWeeklyReset(getWeekStartDateString())}
                        className="px-2.5 py-1 rounded-xl border border-teal-200 bg-white hover:bg-teal-50 text-teal-800 text-[11px] font-bold flex items-center gap-1 transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Reset Week
                      </button>
                    </div>
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

            {/* Daily Warm-Up Quests Section */}
            <DailyQuestsSection
              quests={dailyQuestsForToday}
              completedQuestIdsToday={completedQuestIdsToday}
              totalLifetimeQuestsCompleted={totalLifetimeQuestsCompleted}
              onToggleQuest={handleToggleDailyQuest}
              onShuffleQuests={handleShuffleDailyQuests}
              onAddCustomQuest={handleAddCustomDailyQuest}
              onDeleteCustomQuest={handleDeleteCustomDailyQuest}
            />

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
            activeWorkoutId={activeWorkoutId}
            onSelectWorkoutId={setActiveWorkoutId}
            setLogs={setLogs}
            onUpdateSetLogs={setSetLogs}
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
            customWorkouts={customWorkouts}
            onAddCustomWorkout={handleAddCustomWorkout}
            onDeleteCustomWorkout={handleDeleteCustomWorkout}
            scheduleOverrides={scheduleOverrides}
            onUpdateScheduleDay={handleUpdateScheduleDay}
            onResetScheduleOverrides={handleResetScheduleOverrides}
            onResetWorkoutDay={handleResetWorkoutDay}
            onResetWeek={() => performWeeklyReset(getWeekStartDateString())}
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

      {/* Native Mobile App Bottom Navigation Dock (< 768px) */}
      <nav
        aria-label="Mobile App Navigation"
        className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-pink-200/80 px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-lg"
      >
        <div className="grid grid-cols-4 gap-1 max-w-md mx-auto">
          {(
            [
              { id: 'dashboard', label: 'Today', Icon: Sparkles },
              { id: 'workouts', label: 'Workouts', Icon: Dumbbell },
              { id: 'nutrition', label: 'Nutrition', Icon: Flame },
              { id: 'goals', label: 'Progress', Icon: Ruler },
            ] as const
          ).map(({ id, label, Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleSelectTab(id)}
                className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all ${
                  active
                    ? 'bg-gradient-to-r from-teal-500/15 to-pink-500/15 text-pink-600 font-bold'
                    : 'text-slate-500 hover:text-teal-600 font-medium'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-pink-500' : 'text-teal-600'}`} />
                <span className="text-[11px] mt-0.5 leading-tight whitespace-nowrap">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <OfflineIndicator />

      {/* Quiet, Concise Desktop Footer */}
      <footer className="hidden md:block border-t border-pink-200/60 bg-white/80 px-6 py-5 mt-12">
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
