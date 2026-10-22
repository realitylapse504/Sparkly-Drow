import React, { useState, useEffect } from 'react';
import {
  WORKOUT_PLANS,
  WEEKLY_SPLIT_OVERVIEW,
  ANKLE_WARMUP_PROTOCOL,
  ANKLE_SAFETY_RULES,
  type WorkoutDayPlan,
} from '../data/programData';
import { Check, Timer, RotateCcw, ArrowLeftRight, ShieldAlert, Footprints } from 'lucide-react';

export interface SetLogState {
  weightLbs: number;
  repsCompleted: string;
  completed: boolean;
}

interface WorkoutsViewProps {
  completedSessionsThisWeek: string[];
  onCompleteSession: (workoutId: WorkoutDayPlan['id']) => void;
  ankleWarmupChecks: Record<string, boolean>;
  onToggleAnkleWarmup: (id: string) => void;
  flatShoesVerified: boolean;
  onToggleFlatShoes: () => void;
  lungeSwappedToBss: boolean;
  onToggleLungeSwap: () => void;
  lissMinutesToday: number;
  lissModality: string;
  onUpdateLiss: (modality: string, minutes: number) => void;
  lastActiveDate: string;
}

export const WorkoutsView: React.FC<WorkoutsViewProps> = ({
  completedSessionsThisWeek,
  onCompleteSession,
  ankleWarmupChecks,
  onToggleAnkleWarmup,
  flatShoesVerified,
  onToggleFlatShoes,
  lungeSwappedToBss,
  onToggleLungeSwap,
  lissMinutesToday,
  lissModality,
  onUpdateLiss,
  lastActiveDate,
}) => {
  const [activeWorkoutId, setActiveWorkoutId] = useState<WorkoutDayPlan['id']>('upper_a');
  const [stretchSecondsLeft, setStretchSecondsLeft] = useState<number>(30);
  const [stretchTimerRunning, setStretchTimerRunning] = useState<boolean>(false);

  // Per-exercise set logs keyed by `${exerciseId}_set_${setIndex}` — zero demo data
  const [setLogs, setSetLogs] = useState<Record<string, SetLogState>>(() => {
    const initial: Record<string, SetLogState> = {};
    for (const plan of WORKOUT_PLANS) {
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
  });

  // Reset daily set completion checks when midnight reset advances lastActiveDate
  useEffect(() => {
    setSetLogs((prev) => {
      const next: Record<string, SetLogState> = {};
      for (const [k, v] of Object.entries(prev)) {
        next[k] = { ...v, completed: false };
      }
      return next;
    });
  }, [lastActiveDate]);

  useEffect(() => {
    if (!stretchTimerRunning) return;
    const interval = window.setInterval(() => {
      setStretchSecondsLeft((prev) => {
        if (prev <= 1) {
          setStretchTimerRunning(false);
          if (!ankleWarmupChecks['wall_stretch']) {
            onToggleAnkleWarmup('wall_stretch');
          }
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [stretchTimerRunning, ankleWarmupChecks, onToggleAnkleWarmup]);

  const activeWorkout =
    WORKOUT_PLANS.find((w) => w.id === activeWorkoutId) || WORKOUT_PLANS[0];

  const handleToggleSet = (key: string) => {
    setSetLogs((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        completed: !prev[key]?.completed,
      },
    }));
  };

  const handleWeightChange = (key: string, weightLbs: number) => {
    setSetLogs((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        weightLbs: Number.isNaN(weightLbs) ? 0 : weightLbs,
      },
    }));
  };

  const handleRepsChange = (key: string, repsCompleted: string) => {
    setSetLogs((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        repsCompleted,
      },
    }));
  };

  const warmupCompletedCount = Object.values(ankleWarmupChecks).filter(Boolean).length;
  const isCurrentSessionLogged = completedSessionsThisWeek.includes(activeWorkout.id);

  const totalSetsInActive = activeWorkout.exercises.reduce((acc, ex) => acc + ex.sets, 0);
  const completedSetsInActive = activeWorkout.exercises.reduce((acc, ex) => {
    let count = 0;
    for (let s = 1; s <= ex.sets; s++) {
      if (setLogs[`${ex.id}_set_${s}`]?.completed) count++;
    }
    return acc + count;
  }, 0);

  return (
    <div className="space-y-8">
      {/* Weekly 4-Day Split + Coaching Schedule Strip */}
      <section aria-labelledby="split-schedule-heading" className="bg-white border border-teal-200/90 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-pink-100">
          <div>
            <h2 id="split-schedule-heading" className="text-xl font-bold text-slate-900">
              4-Day Upper / Lower Split & Weekly Schedule
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Hits every major muscle group twice weekly with optimal recovery and built-in left ankle protection.
            </p>
          </div>
          <div className="text-xs text-pink-700 font-mono font-medium tabular-nums">
            <span>Weekly Keys Target: Tracy 1x/wk + 2–4 Programmed Sessions</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 mt-5">
          {WEEKLY_SPLIT_OVERVIEW.map((item) => {
            const isSelectable = Boolean(item.workoutId);
            const isSelected = item.workoutId === activeWorkoutId;
            const isDone = item.workoutId ? completedSessionsThisWeek.includes(item.workoutId) : false;

            return (
              <div
                key={item.day}
                className={`p-3.5 rounded-lg border transition-colors flex flex-col justify-between ${
                  isSelected
                    ? 'border-pink-500 bg-[#191326] text-white'
                    : item.isRest
                    ? 'border-pink-200/70 bg-pink-50/40 text-slate-600'
                    : 'border-teal-200 bg-white text-slate-900 hover:border-pink-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className={isSelected ? 'text-teal-300 font-medium' : 'text-teal-700 font-medium'}>
                      {item.day}
                    </span>
                    {isDone && (
                      <span className={`font-mono text-[11px] ${isSelected ? 'text-pink-300' : 'text-pink-600'}`}>
                        Logged
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-sm mt-1 leading-snug">{item.session}</p>
                  <p className={`text-xs mt-1 ${isSelected ? 'text-pink-100/80' : 'text-slate-500'}`}>
                    {item.type}
                  </p>
                </div>

                {isSelectable && item.workoutId && (
                  <button
                    type="button"
                    onClick={() => setActiveWorkoutId(item.workoutId!)}
                    className={`mt-3 w-full py-1.5 px-2.5 rounded text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                      isSelected
                        ? 'bg-teal-400 text-slate-950'
                        : 'bg-teal-50 text-teal-900 hover:bg-pink-100 hover:text-pink-900'
                    }`}
                  >
                    {isSelected ? 'Active View' : 'Open Session'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Main Two-Column Workout Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 8 Columns: Active Workout Session & Progressive Overload Table */}
        <div className="lg:col-span-8 bg-white border border-pink-200/90 rounded-xl p-6 space-y-6">
          {/* Segmented Session Selector */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-teal-50/80 border border-teal-200/60 rounded-lg" role="tablist" aria-label="Select workout session">
            {WORKOUT_PLANS.map((plan) => {
              const active = plan.id === activeWorkoutId;
              const completed = completedSessionsThisWeek.includes(plan.id);
              return (
                <button
                  key={plan.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveWorkoutId(plan.id)}
                  className={`px-3 py-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-pink-600 text-white shadow-xs'
                      : 'text-teal-900 hover:text-pink-700'
                  }`}
                >
                  {plan.id === 'upper_a' && 'Mon · Upper A'}
                  {plan.id === 'lower_a' && 'Tue · Lower A (Ankle-Safe)'}
                  {plan.id === 'upper_b' && 'Thu · Upper B'}
                  {plan.id === 'lower_b' && 'Fri · Lower B (Ankle-Safe)'}
                  {plan.id === 'tracy_session' && 'Coach · Tracy 1x/wk'}
                  {completed ? ' (Logged)' : ''}
                </button>
              );
            })}
          </div>

          {/* Session Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-pink-100">
            <div>
              <div className="flex items-center gap-2 text-xs text-teal-700 font-medium">
                <span>{activeWorkout.dayLabel}</span>
                <span aria-hidden="true">·</span>
                <span className="text-pink-600">
                  {activeWorkout.ankleProtected ? 'Left Ankle Protected Protocol' : 'Upper Body Compound & Hypertrophy'}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums text-slate-600">
                  {completedSetsInActive}/{totalSetsInActive} sets checked
                </span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{activeWorkout.title}</h3>
              <p className="text-sm text-slate-600 mt-1">{activeWorkout.subtitle}</p>
            </div>

            <button
              type="button"
              onClick={() => onCompleteSession(activeWorkout.id)}
              className={`px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 ${
                isCurrentSessionLogged
                  ? 'bg-teal-600 text-white hover:bg-teal-500'
                  : 'bg-pink-600 text-white hover:bg-pink-500'
              }`}
            >
              <Check className="w-4 h-4" />
              {isCurrentSessionLogged ? 'Session Credited to Weekly Key' : 'Complete & Credit Session'}
            </button>
          </div>

          {/* Exercise List */}
          <div className="space-y-6">
            {activeWorkout.exercises.map((exercise) => {
              const isSwapped = exercise.id === 'lb_3' && lungeSwappedToBss && exercise.ankleSwapOption;
              const displayedName = isSwapped ? exercise.ankleSwapOption!.swapName : exercise.name;
              const displayedReps = isSwapped ? exercise.ankleSwapOption!.swapReps : exercise.reps;

              return (
                <div key={exercise.id} className="border border-teal-200/80 rounded-lg p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-pink-600 font-mono font-semibold tabular-nums">
                        <span>Exercise 0{exercise.order}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-teal-700">
                          {exercise.sets} sets × {displayedReps}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mt-0.5">{displayedName}</h4>
                      {exercise.tip && (
                        <p className="text-xs text-slate-600 mt-1">
                          <span className="font-semibold text-slate-800">Execution Cue:</span> {exercise.tip}
                        </p>
                      )}
                      {isSwapped && exercise.ankleSwapOption && (
                        <p className="text-xs text-teal-800 mt-1 font-medium">
                          {exercise.ankleSwapOption.swapReason}
                        </p>
                      )}
                    </div>

                    {exercise.ankleSwapOption && (
                      <button
                        type="button"
                        onClick={onToggleLungeSwap}
                        className="px-3 py-1.5 rounded-md border border-pink-300 bg-pink-50 hover:bg-pink-100 text-xs font-semibold text-pink-800 flex items-center gap-1.5 whitespace-nowrap shrink-0"
                      >
                        <ArrowLeftRight className="w-3.5 h-3.5" />
                        {lungeSwappedToBss
                          ? 'Revert to Walking Lunges / Step-Ups'
                          : 'Ankle Mod: Swap to Bulgarian Split Squats'}
                      </button>
                    )}
                  </div>

                  {/* Progressive Overload Set Table */}
                  <div className="mt-4 pt-3 border-t border-teal-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {Array.from({ length: exercise.sets }, (_, idx) => {
                      const setNum = idx + 1;
                      const key = `${exercise.id}_set_${setNum}`;
                      const log = setLogs[key] || {
                        weightLbs: exercise.defaultWeightLbs,
                        repsCompleted: displayedReps,
                        completed: false,
                      };

                      return (
                        <div
                          key={key}
                          className={`p-3 rounded-lg border flex flex-col gap-2 ${
                            log.completed
                              ? 'border-teal-500 bg-teal-50/60'
                              : 'border-pink-200/70 bg-pink-50/30'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-semibold text-slate-700 tabular-nums">
                              Set {setNum}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleToggleSet(key)}
                              aria-label={`Mark ${displayedName} Set ${setNum} complete`}
                              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                                log.completed
                                  ? 'bg-teal-600 text-white'
                                  : 'bg-white border border-pink-300 text-pink-700 hover:bg-pink-50'
                              }`}
                            >
                              {log.completed ? 'Logged' : 'Log Set'}
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <label className="block">
                              <span className="text-[11px] text-slate-500 block">Load (lbs)</span>
                              <input
                                type="number"
                                value={log.weightLbs}
                                onChange={(e) => handleWeightChange(key, parseFloat(e.target.value))}
                                className="mt-0.5 w-full px-2 py-1 text-xs font-mono tabular-nums bg-white border border-teal-200 rounded text-slate-900"
                              />
                            </label>
                            <label className="block">
                              <span className="text-[11px] text-slate-500 block">Target / Reps</span>
                              <input
                                type="text"
                                value={log.repsCompleted}
                                onChange={(e) => handleRepsChange(key, e.target.value)}
                                className="mt-0.5 w-full px-2 py-1 text-xs font-mono tabular-nums bg-white border border-teal-200 rounded text-slate-900"
                              />
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 4 Columns: Left Ankle Safety & Pre-Lower Warm-Up Routine + Low-Impact Cardio */}
        <div className="lg:col-span-4 space-y-6">
          {/* Pre-Lower Body Ankle Warm-Up Checklist */}
          <section aria-labelledby="ankle-protocol-heading" className="bg-white border border-teal-200/90 rounded-xl p-6 space-y-5">
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-teal-100">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-pink-600 font-semibold">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>Left Ankle Protection Protocol</span>
                </div>
                <h3 id="ankle-protocol-heading" className="text-lg font-bold text-slate-900 mt-1">
                  Pre-Lower Body Warm-Up
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Complete before Tuesday (Lower A) and Friday (Lower B) sessions.
                </p>
              </div>
              <span className="text-xs font-mono font-semibold text-teal-700 tabular-nums">
                {warmupCompletedCount}/3 Ready
              </span>
            </div>

            <div className="space-y-3">
              {ANKLE_WARMUP_PROTOCOL.map((step) => {
                const checked = Boolean(ankleWarmupChecks[step.id]);
                return (
                  <div
                    key={step.id}
                    className={`p-3.5 rounded-lg border transition-colors ${
                      checked ? 'border-teal-500 bg-teal-50/50' : 'border-pink-200/80 bg-pink-50/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{step.title}</p>
                        <p className="text-xs font-mono text-teal-800 mt-0.5">{step.prescription}</p>
                        <p className="text-xs text-slate-500 mt-1">{step.detail}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onToggleAnkleWarmup(step.id)}
                        aria-label={`Toggle ${step.title} warm-up completion`}
                        className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                          checked
                            ? 'bg-teal-600 text-white'
                            : 'bg-white border border-pink-300 text-pink-700 hover:bg-pink-50'
                        }`}
                      >
                        {checked ? 'Done' : 'Check'}
                      </button>
                    </div>

                    {step.hasTimer && (
                      <div className="mt-3 pt-2.5 border-t border-teal-200/70 flex items-center justify-between gap-2">
                        <span className="text-xs font-mono tabular-nums text-slate-700">
                          Wall Stretch Hold: <strong>{stretchSecondsLeft}s</strong>
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setStretchTimerRunning((prev) => !prev)}
                            className="px-2.5 py-1 rounded bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold flex items-center gap-1 whitespace-nowrap shrink-0"
                          >
                            <Timer className="w-3.5 h-3.5" />
                            {stretchTimerRunning ? 'Pause' : 'Start 30s Hold'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setStretchTimerRunning(false);
                              setStretchSecondsLeft(30);
                            }}
                            aria-label="Reset 30 second stretch timer"
                            className="p-1 rounded border border-teal-300 bg-white text-teal-700 hover:text-pink-600"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footwear Verification */}
            <div className="pt-3 border-t border-teal-100">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-slate-900">Flat-Soled Footwear Check</p>
                  <p className="text-xs text-slate-500">
                    Vans, Converse, or flat weightlifting shoes (no squishy running soles)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onToggleFlatShoes}
                  className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap shrink-0 ${
                    flatShoesVerified
                      ? 'bg-teal-600 text-white'
                      : 'bg-pink-100 text-pink-900 hover:bg-pink-200'
                  }`}
                >
                  {flatShoesVerified ? 'Flat Shoes Verified' : 'Verify Footwear'}
                </button>
              </div>
            </div>
          </section>

          {/* Ankle-Safe LISS Cardio Accelerator */}
          <section aria-labelledby="liss-cardio-heading" className="bg-white border border-pink-200/90 rounded-xl p-6 space-y-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-teal-700 font-medium">
                <Footprints className="w-4 h-4 text-pink-600" />
                <span>Pillar 04 · Low-Impact Fat-Loss Accelerator</span>
              </div>
              <h3 id="liss-cardio-heading" className="text-lg font-bold text-slate-900 mt-1">
                Ankle-Safe LISS Cardio Log
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                High-impact running, jump rope, and box jumps are eliminated to protect your left ankle.
              </p>
            </div>

            <div className="space-y-3">
              <label className="block">
                <span className="text-xs font-medium text-slate-700">Approved Low-Impact Modality</span>
                <select
                  value={lissModality}
                  onChange={(e) => onUpdateLiss(e.target.value, lissMinutesToday)}
                  className="mt-1 w-full px-3 py-2 text-xs bg-white border border-teal-300 rounded-lg text-slate-900"
                >
                  <option value="Incline Treadmill Walk">Incline Treadmill Walk (3.0–3.5 mph, 6–10% grade)</option>
                  <option value="Stationary Bike">Stationary Bike (Zero impact steady state)</option>
                  <option value="Elliptical Trainer">Elliptical Trainer (Smooth fixed foot plane)</option>
                </select>
              </label>

              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">Today’s LISS Duration</span>
                  <span className="font-mono font-semibold text-pink-700 tabular-nums">{lissMinutesToday} mins</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {[15, 25, 30, 45].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => onUpdateLiss(lissModality, mins)}
                      className={`flex-1 py-1.5 px-2 rounded text-xs font-mono font-semibold transition-colors whitespace-nowrap shrink-0 ${
                        lissMinutesToday === mins
                          ? 'bg-pink-600 text-white'
                          : 'bg-teal-50 text-teal-900 hover:bg-teal-100'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-pink-100 space-y-2">
              {ANKLE_SAFETY_RULES.map((rule) => (
                <div key={rule.title} className="text-xs">
                  <span className="font-semibold text-teal-900">{rule.title}:</span>{' '}
                  <span className="text-slate-600">{rule.detail}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
