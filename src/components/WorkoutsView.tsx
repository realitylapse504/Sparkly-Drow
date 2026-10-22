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
    <div className="space-y-6">
      {/* Compact, Bubbly Weekly Schedule Strip */}
      <section aria-labelledby="split-schedule-heading" className="bg-white border border-teal-200/80 rounded-3xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-pink-100">
          <h2 id="split-schedule-heading" className="text-lg font-bold text-slate-900">
            Weekly Split Schedule
          </h2>
          <span className="text-xs text-pink-600 font-semibold">
            Goal: 1x Full-Body + 2–4 Split Days
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 mt-4">
          {WEEKLY_SPLIT_OVERVIEW.map((item) => {
            const isSelectable = Boolean(item.workoutId);
            const isSelected = item.workoutId === activeWorkoutId;
            const isDone = item.workoutId ? completedSessionsThisWeek.includes(item.workoutId) : false;

            return (
              <div
                key={item.day}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-pink-400 bg-gradient-to-b from-pink-500 to-pink-600 text-white shadow-xs'
                    : item.isRest
                    ? 'border-pink-100 bg-pink-50/40 text-slate-500'
                    : 'border-teal-200/80 bg-white text-slate-900 hover:border-pink-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 text-xs">
                    <span className={isSelected ? 'text-pink-100 font-bold' : 'text-teal-600 font-bold'}>
                      {item.day}
                    </span>
                    {isDone && (
                      <span className={`font-mono text-[10px] font-bold ${isSelected ? 'text-white' : 'text-teal-600'}`}>
                        Done
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-xs sm:text-sm mt-1 leading-snug">{item.session}</p>
                  <p className={`text-[11px] mt-0.5 ${isSelected ? 'text-pink-100' : 'text-slate-400'}`}>
                    {item.type}
                  </p>
                </div>

                {isSelectable && item.workoutId && (
                  <button
                    type="button"
                    onClick={() => setActiveWorkoutId(item.workoutId!)}
                    className={`mt-2.5 w-full py-1 px-2 rounded-xl text-[11px] font-bold transition-colors whitespace-nowrap shrink-0 ${
                      isSelected
                        ? 'bg-white text-pink-600'
                        : 'bg-teal-50 text-teal-800 hover:bg-pink-100 hover:text-pink-800'
                    }`}
                  >
                    {isSelected ? 'Viewing' : 'Open'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Main Two-Column Workout Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Columns: Active Workout Session */}
        <div className="lg:col-span-8 bg-white border border-pink-200/80 rounded-3xl p-6 space-y-5">
          {/* Segmented Session Selector */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-teal-50/70 border border-teal-200/60 rounded-2xl" role="tablist" aria-label="Select workout session">
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
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-pink-500 text-white shadow-xs'
                      : 'text-teal-900 hover:text-pink-600'
                  }`}
                >
                  {plan.id === 'upper_a' && 'Mon · Upper A'}
                  {plan.id === 'lower_a' && 'Tue · Lower A'}
                  {plan.id === 'upper_b' && 'Thu · Upper B'}
                  {plan.id === 'lower_b' && 'Fri · Lower B'}
                  {plan.id === 'full_body_session' && 'Sat · Full-Body'}
                  {completed ? ' (Done)' : ''}
                </button>
              );
            })}
          </div>

          {/* Session Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-pink-100">
            <div>
              <div className="flex items-center gap-2 text-xs text-teal-600 font-semibold">
                <span>{activeWorkout.dayLabel}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums text-slate-500">
                  {completedSetsInActive}/{totalSetsInActive} sets done
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">{activeWorkout.title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{activeWorkout.subtitle}</p>
            </div>

            <button
              type="button"
              onClick={() => onCompleteSession(activeWorkout.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                isCurrentSessionLogged
                  ? 'bg-teal-500 text-white'
                  : 'bg-pink-500 text-white hover:bg-pink-600'
              }`}
            >
              <Check className="w-4 h-4" />
              {isCurrentSessionLogged ? 'Workout Logged!' : 'Finish Workout'}
            </button>
          </div>

          {/* Exercise List */}
          <div className="space-y-4">
            {activeWorkout.exercises.map((exercise) => {
              const isSwapped = exercise.id === 'lb_3' && lungeSwappedToBss && exercise.ankleSwapOption;
              const displayedName = isSwapped ? exercise.ankleSwapOption!.swapName : exercise.name;
              const displayedReps = isSwapped ? exercise.ankleSwapOption!.swapReps : exercise.reps;

              return (
                <div key={exercise.id} className="border border-teal-200/70 rounded-2xl p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-mono font-bold tabular-nums">
                        <span className="text-pink-500">#{exercise.order}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-teal-700">
                          {exercise.sets} sets × {displayedReps}
                        </span>
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">{displayedName}</h4>
                      {exercise.tip && (
                        <p className="text-xs text-slate-500 mt-0.5">{exercise.tip}</p>
                      )}
                      {isSwapped && exercise.ankleSwapOption && (
                        <p className="text-xs text-teal-700 mt-0.5 font-medium">
                          {exercise.ankleSwapOption.swapReason}
                        </p>
                      )}
                    </div>

                    {exercise.ankleSwapOption && (
                      <button
                        type="button"
                        onClick={onToggleLungeSwap}
                        className="px-3 py-1.5 rounded-xl border border-pink-200 bg-pink-50 hover:bg-pink-100 text-xs font-bold text-pink-700 flex items-center gap-1.5 whitespace-nowrap shrink-0"
                      >
                        <ArrowLeftRight className="w-3.5 h-3.5" />
                        {lungeSwappedToBss ? 'Switch to Lunges' : 'Ankle Swap: Split Squats'}
                      </button>
                    )}
                  </div>

                  {/* Set Table */}
                  <div className="mt-3 pt-3 border-t border-teal-100/80 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
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
                          className={`p-2.5 rounded-xl border flex flex-col gap-2 ${
                            log.completed
                              ? 'border-teal-400 bg-teal-50/60'
                              : 'border-pink-100 bg-pink-50/20'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold text-slate-600 tabular-nums">
                              Set {setNum}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleToggleSet(key)}
                              aria-label={`Mark ${displayedName} Set ${setNum} complete`}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                                log.completed
                                  ? 'bg-teal-500 text-white'
                                  : 'bg-white border border-pink-200 text-pink-600 hover:bg-pink-50'
                              }`}
                            >
                              {log.completed ? 'Done' : 'Check'}
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <label className="block">
                              <span className="text-[10px] text-slate-400 block">Weight (lbs)</span>
                              <input
                                type="number"
                                value={log.weightLbs}
                                onChange={(e) => handleWeightChange(key, parseFloat(e.target.value))}
                                className="mt-0.5 w-full px-2 py-1 text-xs font-mono tabular-nums bg-white border border-teal-200 rounded-lg text-slate-900"
                              />
                            </label>
                            <label className="block">
                              <span className="text-[10px] text-slate-400 block">Reps</span>
                              <input
                                type="text"
                                value={log.repsCompleted}
                                onChange={(e) => handleRepsChange(key, e.target.value)}
                                className="mt-0.5 w-full px-2 py-1 text-xs font-mono tabular-nums bg-white border border-teal-200 rounded-lg text-slate-900"
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

        {/* Right 4 Columns: Concise Left Ankle Care & Low-Impact Cardio */}
        <div className="lg:col-span-4 space-y-5">
          {/* Left Ankle Warm-Up */}
          <section aria-labelledby="ankle-protocol-heading" className="bg-white border border-teal-200/80 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-teal-100">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-pink-600 font-bold">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>Left Ankle Care</span>
                </div>
                <h3 id="ankle-protocol-heading" className="text-base font-bold text-slate-900 mt-0.5">
                  Leg Day Warm-Up
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-teal-600 tabular-nums">
                {warmupCompletedCount}/3
              </span>
            </div>

            <div className="space-y-2.5">
              {ANKLE_WARMUP_PROTOCOL.map((step) => {
                const checked = Boolean(ankleWarmupChecks[step.id]);
                return (
                  <div
                    key={step.id}
                    className={`p-3 rounded-2xl border transition-colors ${
                      checked ? 'border-teal-400 bg-teal-50/50' : 'border-pink-100 bg-pink-50/20'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          {step.title} <span className="font-mono font-normal text-teal-700">({step.prescription})</span>
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{step.detail}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onToggleAnkleWarmup(step.id)}
                        aria-label={`Toggle ${step.title} warm-up completion`}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                          checked
                            ? 'bg-teal-500 text-white'
                            : 'bg-white border border-pink-200 text-pink-600 hover:bg-pink-50'
                        }`}
                      >
                        {checked ? 'Done' : 'Check'}
                      </button>
                    </div>

                    {step.hasTimer && (
                      <div className="mt-2.5 pt-2 border-t border-teal-100 flex items-center justify-between gap-2">
                        <span className="text-xs font-mono tabular-nums text-slate-600">
                          Timer: <strong>{stretchSecondsLeft}s</strong>
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setStretchTimerRunning((prev) => !prev)}
                            className="px-2.5 py-1 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold flex items-center gap-1 whitespace-nowrap shrink-0"
                          >
                            <Timer className="w-3.5 h-3.5" />
                            {stretchTimerRunning ? 'Pause' : '30s Timer'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setStretchTimerRunning(false);
                              setStretchSecondsLeft(30);
                            }}
                            aria-label="Reset 30 second stretch timer"
                            className="p-1 rounded-lg border border-teal-200 bg-white text-teal-700 hover:text-pink-600"
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

            {/* Flat Shoes Check */}
            <div className="pt-2 border-t border-teal-100 flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-slate-900">Flat Shoes On</p>
                <p className="text-[11px] text-slate-500">Vans, Converse, or flat lifters</p>
              </div>
              <button
                type="button"
                onClick={onToggleFlatShoes}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 ${
                  flatShoesVerified
                    ? 'bg-teal-500 text-white'
                    : 'bg-pink-100 text-pink-800 hover:bg-pink-200'
                }`}
              >
                {flatShoesVerified ? 'Checked' : 'Verify'}
              </button>
            </div>
          </section>

          {/* Low-Impact Cardio */}
          <section aria-labelledby="liss-cardio-heading" className="bg-white border border-pink-200/80 rounded-3xl p-6 space-y-3.5">
            <div className="flex items-center gap-1.5 text-xs text-teal-600 font-bold">
              <Footprints className="w-4 h-4 text-pink-500" />
              <h3 id="liss-cardio-heading" className="text-sm font-bold text-slate-900">
                Ankle-Safe Cardio
              </h3>
            </div>

            <label className="block">
              <span className="text-xs text-slate-500">Pick low-impact cardio</span>
              <select
                value={lissModality}
                onChange={(e) => onUpdateLiss(e.target.value, lissMinutesToday)}
                className="mt-1 w-full px-3 py-2 text-xs bg-white border border-teal-200 rounded-xl text-slate-900"
              >
                <option value="Incline Treadmill Walk">Incline Treadmill Walk</option>
                <option value="Stationary Bike">Stationary Bike</option>
                <option value="Elliptical Trainer">Elliptical</option>
              </select>
            </label>

            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Minutes today</span>
                <span className="font-mono font-bold text-pink-600 tabular-nums">{lissMinutesToday} mins</span>
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                {[15, 25, 30, 45].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => onUpdateLiss(lissModality, mins)}
                    className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-mono font-bold transition-colors whitespace-nowrap shrink-0 ${
                      lissMinutesToday === mins
                        ? 'bg-pink-500 text-white'
                        : 'bg-teal-50 text-teal-800 hover:bg-teal-100'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-pink-100 space-y-1.5">
              {ANKLE_SAFETY_RULES.map((rule) => (
                <p key={rule.title} className="text-[11px] text-slate-500">
                  <strong className="text-slate-700">{rule.title}:</strong> {rule.detail}
                </p>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
