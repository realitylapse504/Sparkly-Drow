import React, { useState, useEffect } from 'react';
import {
  WORKOUT_PLANS,
  ANKLE_WARMUP_PROTOCOL,
  ANKLE_SAFETY_RULES,
  CARDIO_MODALITIES,
  PREFERRED_EXERCISE_LIBRARY,
  createCustomWorkoutPlan,
  resolveWeeklySchedule,
  type WorkoutDayPlan,
  type SetLogEntry,
} from '../data/programData';
import {
  Check,
  Timer,
  RotateCcw,
  ArrowLeftRight,
  ShieldAlert,
  Footprints,
  Plus,
  Trash2,
  X,
} from 'lucide-react';

interface WorkoutsViewProps {
  activeWorkoutId: WorkoutDayPlan['id'];
  onSelectWorkoutId: (workoutId: WorkoutDayPlan['id']) => void;
  customWorkouts: WorkoutDayPlan[];
  onAddCustomWorkout: (workout: WorkoutDayPlan, scheduleDay?: string) => void;
  onDeleteCustomWorkout: (workoutId: string) => void;
  scheduleOverrides: Record<string, string>;
  onUpdateScheduleDay: (day: string, workoutOrRestId: string) => void;
  onResetScheduleOverrides: () => void;
  onResetWorkoutDay: (workoutId: WorkoutDayPlan['id']) => void;
  onResetWeek: () => void;
  setLogs: Record<string, SetLogEntry>;
  onUpdateSetLogs: React.Dispatch<React.SetStateAction<Record<string, SetLogEntry>>>;
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
}

interface DraftExerciseRow {
  name: string;
  sets: string;
  reps: string;
  weightLbs: string;
  tip: string;
}

export const WorkoutsView: React.FC<WorkoutsViewProps> = ({
  activeWorkoutId,
  onSelectWorkoutId,
  customWorkouts,
  onAddCustomWorkout,
  onDeleteCustomWorkout,
  scheduleOverrides,
  onUpdateScheduleDay,
  onResetScheduleOverrides,
  onResetWorkoutDay,
  onResetWeek,
  setLogs,
  onUpdateSetLogs,
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
}) => {
  const [stretchSecondsLeft, setStretchSecondsLeft] = useState<number>(30);
  const [stretchTimerRunning, setStretchTimerRunning] = useState<boolean>(false);

  // Custom Workout Builder State
  const [showBuilder, setShowBuilder] = useState<boolean>(false);
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customSubtitle, setCustomSubtitle] = useState<string>('');
  const [customAssignDay, setCustomAssignDay] = useState<string>('');
  const [customAnkleProtected, setCustomAnkleProtected] = useState<boolean>(false);
  const [builderError, setBuilderError] = useState<string>('');
  const [draftExercises, setDraftExercises] = useState<DraftExerciseRow[]>([
    { name: '', sets: '3', reps: '10–12 reps', weightLbs: '25', tip: '' },
    { name: '', sets: '3', reps: '12–15 reps', weightLbs: '20', tip: '' },
  ]);

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

  const allWorkoutPlans = [...WORKOUT_PLANS, ...customWorkouts];
  const resolvedSchedule = resolveWeeklySchedule(customWorkouts, scheduleOverrides);
  const hasScheduleOverrides = Object.keys(scheduleOverrides).length > 0;

  const activeWorkout =
    allWorkoutPlans.find((w) => w.id === activeWorkoutId) || allWorkoutPlans[0];

  const handleToggleSet = (key: string) => {
    onUpdateSetLogs((prev) => {
      const next = {
        ...prev,
        [key]: {
          ...prev[key],
          completed: !prev[key]?.completed,
        },
      };

      const allSetsDone = activeWorkout.exercises.every((ex) => {
        for (let s = 1; s <= ex.sets; s++) {
          if (!next[`${ex.id}_set_${s}`]?.completed) return false;
        }
        return true;
      });
      if (allSetsDone && !completedSessionsThisWeek.includes(activeWorkout.id)) {
        setTimeout(() => onCompleteSession(activeWorkout.id), 0);
      }

      return next;
    });
  };

  const handleWeightChange = (key: string, weightLbs: number) => {
    onUpdateSetLogs((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        weightLbs: Number.isNaN(weightLbs) ? 0 : weightLbs,
      },
    }));
  };

  const handleRepsChange = (key: string, repsCompleted: string) => {
    onUpdateSetLogs((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        repsCompleted,
      },
    }));
  };

  const handleUpdateDraftExercise = (
    index: number,
    field: keyof DraftExerciseRow,
    value: string
  ) => {
    setDraftExercises((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const handleAddDraftRow = () => {
    setDraftExercises((prev) => [
      ...prev,
      { name: '', sets: '3', reps: '10–12 reps', weightLbs: '20', tip: '' },
    ]);
  };

  const handleRemoveDraftRow = (index: number) => {
    setDraftExercises((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  const handleCreateCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) {
      setBuilderError('Please give your custom workout a name.');
      return;
    }
    const validExercises = draftExercises.filter((ex) => ex.name.trim() !== '');
    if (validExercises.length === 0) {
      setBuilderError('Please add at least one exercise with a name.');
      return;
    }

    setBuilderError('');
    const newPlan = createCustomWorkoutPlan({
      title: customTitle,
      subtitle: customSubtitle || 'Custom saved workout session.',
      ankleProtected: customAnkleProtected,
      exercises: validExercises.map((ex) => ({
        name: ex.name,
        sets: parseInt(ex.sets, 10) || 3,
        reps: ex.reps || '10–12 reps',
        defaultWeightLbs: parseFloat(ex.weightLbs) || 0,
        tip: ex.tip,
      })),
    });

    onAddCustomWorkout(newPlan, customAssignDay || undefined);
    setCustomTitle('');
    setCustomSubtitle('');
    setCustomAssignDay('');
    setCustomAnkleProtected(false);
    setDraftExercises([
      { name: '', sets: '3', reps: '10–12 reps', weightLbs: '25', tip: '' },
      { name: '', sets: '3', reps: '12–15 reps', weightLbs: '20', tip: '' },
    ]);
    setShowBuilder(false);
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
      {/* Compact Weekly Schedule Strip with Per-Day Workout Scheduling */}
      <section aria-labelledby="split-schedule-heading" className="bg-[#121214] border border-zinc-800/90 rounded-3xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
          <div>
            <h2 id="split-schedule-heading" className="text-lg font-bold text-white">
              Weekly Split Schedule
            </h2>
            <p className="text-xs text-zinc-400">
              Goal: 1x Full-Body + 2–4 Split Days · Auto-resets every Monday for a fresh week!
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {(isCurrentSessionLogged || completedSetsInActive > 0) && (
              <button
                type="button"
                onClick={() => onResetWorkoutDay(activeWorkout.id)}
                className="px-3.5 py-2 rounded-full border border-zinc-800 bg-[#1c1c1f] hover:bg-[#27272a] text-xs font-semibold text-zinc-200 flex items-center gap-1.5 whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5 text-yellow-400" />
                Reset Highlighted Day
              </button>
            )}
            {completedSessionsThisWeek.length > 1 && (
              <button
                type="button"
                onClick={onResetWeek}
                className="px-3.5 py-2 rounded-full border border-zinc-800 bg-[#1c1c1f] hover:bg-[#27272a] text-xs font-semibold text-zinc-200 flex items-center gap-1.5 whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#25e86a]" />
                Reset Week ({completedSessionsThisWeek.length} Done)
              </button>
            )}
            {hasScheduleOverrides && (
              <button
                type="button"
                onClick={onResetScheduleOverrides}
                className="px-3.5 py-2 rounded-full border border-zinc-800 bg-[#1c1c1f] hover:bg-[#27272a] text-xs font-semibold text-zinc-200 whitespace-nowrap"
              >
                Reset Schedule
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowBuilder((prev) => !prev)}
              className="px-4 py-2 rounded-full bg-[#25e86a] hover:bg-[#1ed760] text-black text-xs font-bold flex items-center gap-1.5 whitespace-nowrap"
            >
              {showBuilder ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {showBuilder ? 'Close Builder' : 'New Custom Workout'}
            </button>
          </div>
        </div>

        {/* Collapsible Custom Workout Builder */}
        {showBuilder && (
          <form
            onSubmit={handleCreateCustomSubmit}
            className="p-5 rounded-3xl bg-[#18181b] border border-zinc-800 space-y-4"
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-[#25e86a]">Saved Forever in Your Library</span>
                <h3 className="text-base font-bold text-white">Create Custom Workout</h3>
              </div>
            </div>

            {builderError && (
              <p role="alert" className="text-xs font-semibold text-red-400">
                {builderError}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="block text-xs text-zinc-400 font-medium">
                Workout Name
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g., Glute & Core Sculpt"
                  aria-label="Custom workout name"
                  className="mt-1 w-full px-3 py-2 text-xs bg-[#0d0d0f] border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600"
                />
              </label>

              <label className="block text-xs text-zinc-400 font-medium">
                Focus / Notes
                <input
                  type="text"
                  value={customSubtitle}
                  onChange={(e) => setCustomSubtitle(e.target.value)}
                  placeholder="e.g., Booty bands, kickbacks & abs"
                  aria-label="Custom workout focus"
                  className="mt-1 w-full px-3 py-2 text-xs bg-[#0d0d0f] border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600"
                />
              </label>

              <label className="block text-xs text-zinc-400 font-medium">
                Schedule on Day (Optional)
                <select
                  value={customAssignDay}
                  onChange={(e) => setCustomAssignDay(e.target.value)}
                  aria-label="Schedule custom workout on day"
                  className="mt-1 w-full px-3 py-2 text-xs bg-[#0d0d0f] border border-zinc-800 rounded-xl text-white"
                >
                  <option value="">Save to Library (Any Day)</option>
                  <option value="Mon">Monday</option>
                  <option value="Tue">Tuesday</option>
                  <option value="Wed">Wednesday</option>
                  <option value="Thu">Thursday</option>
                  <option value="Fri">Friday</option>
                  <option value="Sat">Saturday</option>
                  <option value="Sun">Sunday</option>
                </select>
              </label>
            </div>

            <label className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={customAnkleProtected}
                onChange={(e) => setCustomAnkleProtected(e.target.checked)}
                className="rounded border-zinc-700 accent-[#25e86a]"
              />
              <span>Lower-Body / Ankle-Friendly Session</span>
            </label>

            {/* Exercise Rows */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Exercises</span>
                <button
                  type="button"
                  onClick={handleAddDraftRow}
                  className="px-3 py-1 rounded-full bg-[#121214] border border-zinc-800 hover:bg-[#222226] text-zinc-200 text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5 text-[#25e86a]" />
                  Add Exercise
                </button>
              </div>

              {draftExercises.map((row, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-[#121214] border border-zinc-800 grid grid-cols-1 sm:grid-cols-12 gap-2 items-end"
                >
                  <div className="sm:col-span-4 space-y-1">
                    <label className="block text-[11px] text-zinc-400">
                      Quick-Pick Preferred Exercise (or type below)
                      <select
                        value=""
                        onChange={(e) => {
                          const chosen = PREFERRED_EXERCISE_LIBRARY.find(
                            (p) => p.name === e.target.value
                          );
                          if (chosen) {
                            setDraftExercises((prev) =>
                              prev.map((r, i) =>
                                i === idx
                                  ? {
                                      name: chosen.name,
                                      sets: String(chosen.defaultSets),
                                      reps: chosen.defaultReps,
                                      weightLbs: String(chosen.defaultWeightLbs),
                                      tip: chosen.tip,
                                    }
                                  : r
                              )
                            );
                          }
                        }}
                        aria-label={`Quick-pick preferred exercise for row ${idx + 1}`}
                        className="mt-0.5 w-full px-2 py-1 text-[11px] bg-[#18181b] border border-zinc-800 rounded-lg text-white font-medium"
                      >
                        <option value="">Choose from Preferred Exercise Pool...</option>
                        {(
                          [
                            'Glutes',
                            'Back',
                            'Legs',
                            'Core',
                            'Arms / Curls',
                            'Chest',
                            'Shoulders',
                          ] as const
                        ).map((cat) => (
                          <optgroup key={cat} label={cat}>
                            {PREFERRED_EXERCISE_LIBRARY.filter((p) => p.category === cat).map(
                              (item) => (
                                <option key={item.name} value={item.name}>
                                  {item.name}
                                  {item.activationTier ? ` (${item.activationTier})` : ''}
                                </option>
                              )
                            )}
                          </optgroup>
                        ))}
                      </select>
                    </label>
                    <label className="block text-[11px] text-zinc-400">
                      Exercise #{idx + 1} Name
                      <input
                        type="text"
                        value={row.name}
                        onChange={(e) => handleUpdateDraftExercise(idx, 'name', e.target.value)}
                        placeholder="e.g., Barbell Hip Thrust"
                        className="mt-0.5 w-full px-2.5 py-1.5 text-xs bg-[#18181b] border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600"
                      />
                    </label>
                  </div>
                  <label className="sm:col-span-2 block text-[11px] text-zinc-400">
                    Sets
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={row.sets}
                      onChange={(e) => handleUpdateDraftExercise(idx, 'sets', e.target.value)}
                      className="mt-0.5 w-full px-2.5 py-1.5 text-xs font-mono bg-[#18181b] border border-zinc-800 rounded-lg text-white"
                    />
                  </label>
                  <label className="sm:col-span-2 block text-[11px] text-zinc-400">
                    Reps
                    <input
                      type="text"
                      value={row.reps}
                      onChange={(e) => handleUpdateDraftExercise(idx, 'reps', e.target.value)}
                      placeholder="10–12 reps"
                      className="mt-0.5 w-full px-2.5 py-1.5 text-xs font-mono bg-[#18181b] border border-zinc-800 rounded-lg text-white"
                    />
                  </label>
                  <label className="sm:col-span-2 block text-[11px] text-zinc-400">
                    Weight (lbs)
                    <input
                      type="number"
                      value={row.weightLbs}
                      onChange={(e) => handleUpdateDraftExercise(idx, 'weightLbs', e.target.value)}
                      className="mt-0.5 w-full px-2.5 py-1.5 text-xs font-mono bg-[#18181b] border border-zinc-800 rounded-lg text-white"
                    />
                  </label>
                  <div className="sm:col-span-2 flex items-center gap-1.5">
                    <label className="flex-1 block text-[11px] text-zinc-400">
                      Form Tip
                      <input
                        type="text"
                        value={row.tip}
                        onChange={(e) => handleUpdateDraftExercise(idx, 'tip', e.target.value)}
                        placeholder="Optional tip"
                        className="mt-0.5 w-full px-2 py-1.5 text-xs bg-[#18181b] border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600"
                      />
                    </label>
                    {draftExercises.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDraftRow(idx)}
                        aria-label={`Remove exercise ${idx + 1}`}
                        className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg mb-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowBuilder(false)}
                className="px-4 py-2 rounded-full border border-zinc-800 bg-[#121214] text-xs font-semibold text-zinc-300 hover:bg-[#1c1c1f]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-[#25e86a] hover:bg-[#1ed760] text-black text-xs font-bold"
              >
                Save Custom Workout
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {resolvedSchedule.map((item) => {
            const isSelectable = Boolean(item.workoutId);
            const isSelected = item.workoutId === activeWorkoutId;
            const isDone = item.workoutId ? completedSessionsThisWeek.includes(item.workoutId) : false;
            const currentSelectValue =
              scheduleOverrides[item.day] ||
              item.workoutId ||
              (item.day === 'Thu' ? 'rest_walk' : 'rest_recharge');

            return (
              <div
                key={item.day}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'border-[#25e86a] bg-[#18181b] text-white'
                    : item.isRest
                    ? 'border-zinc-900 bg-[#0d0d0f] text-zinc-500'
                    : 'border-zinc-800/90 bg-[#18181b] text-white hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 text-xs">
                    <span className={isSelected ? 'text-[#25e86a] font-bold' : 'text-zinc-400 font-semibold'}>
                      {item.day}
                    </span>
                    {isDone && (
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-yellow-400">
                        <span className="w-2 h-2 rounded-full bg-yellow-400" />
                        Done
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-xs sm:text-sm mt-1 leading-snug text-white">{item.session}</p>
                  <p className="text-[11px] mt-0.5 text-zinc-400">
                    {item.type}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <select
                    aria-label={`Schedule workout for ${item.day}`}
                    value={currentSelectValue}
                    onChange={(e) => {
                      const val = e.target.value;
                      onUpdateScheduleDay(item.day, val);
                      if (val !== 'rest_walk' && val !== 'rest_recharge') {
                        onSelectWorkoutId(val);
                      }
                    }}
                    className="w-full px-2 py-1 rounded-lg text-[10px] font-medium border bg-[#121214] border-zinc-800 text-zinc-300 cursor-pointer"
                  >
                    <optgroup label="Programmed Split">
                      <option value="upper_a">Upper Body A</option>
                      <option value="lower_a">Lower Body A</option>
                      <option value="full_body_session">Full-Body & Core</option>
                      <option value="upper_b">Upper Body B</option>
                      <option value="lower_b">Lower Body B</option>
                    </optgroup>
                    {customWorkouts.length > 0 && (
                      <optgroup label="Saved Custom Workouts">
                        {customWorkouts.map((cw) => (
                          <option key={cw.id} value={cw.id}>
                            {cw.title}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    <optgroup label="Rest & Recovery">
                      <option value="rest_walk">Rest & Walk</option>
                      <option value="rest_recharge">Rest & Recharge</option>
                    </optgroup>
                  </select>

                  {isSelectable && item.workoutId && (
                    <button
                      type="button"
                      onClick={() => onSelectWorkoutId(item.workoutId!)}
                      className={`w-full py-1 px-2 rounded-full text-[11px] font-bold transition-colors whitespace-nowrap shrink-0 ${
                        isSelected
                          ? 'bg-[#25e86a] text-black'
                          : 'bg-[#121214] border border-zinc-800 text-zinc-300 hover:bg-[#222226]'
                      }`}
                    >
                      {isSelected ? 'Viewing' : 'Open'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Main Two-Column Workout Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Columns: Active Workout Session */}
        <div className="lg:col-span-8 bg-[#121214] border border-zinc-800/90 rounded-3xl p-6 space-y-5">
          {/* Segmented Session Selector (Built-In + Saved Custom Workouts) */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#18181b] border border-zinc-800 rounded-2xl" role="tablist" aria-label="Select workout session">
            {allWorkoutPlans.map((plan) => {
              const active = plan.id === activeWorkoutId;
              const completed = completedSessionsThisWeek.includes(plan.id);
              return (
                <button
                  key={plan.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onSelectWorkoutId(plan.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-[#25e86a] text-black'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {plan.id === 'upper_a' && 'Mon · Upper A'}
                  {plan.id === 'lower_a' && 'Tue · Lower A'}
                  {plan.id === 'full_body_session' && 'Wed · Full-Body'}
                  {plan.id === 'upper_b' && 'Fri · Upper B'}
                  {plan.id === 'lower_b' && 'Sat · Lower B'}
                  {plan.isCustom && (plan.shortTabLabel || plan.title)}
                  {completed ? ' (Done)' : ''}
                </button>
              );
            })}
          </div>

          {/* Session Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
            <div>
              <div className="flex items-center gap-2 text-xs text-zinc-400 font-semibold">
                <span className="text-white">{activeWorkout.dayLabel}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums text-[#25e86a]">
                  {completedSetsInActive}/{totalSetsInActive} sets done
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mt-0.5">{activeWorkout.title}</h3>
              <p className="text-xs text-zinc-400 mt-0.5">{activeWorkout.subtitle}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {activeWorkout.isCustom && (
                <button
                  type="button"
                  onClick={() => onDeleteCustomWorkout(activeWorkout.id)}
                  aria-label={`Delete custom workout ${activeWorkout.title}`}
                  className="px-3 py-2.5 rounded-full border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-bold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              )}
              {(isCurrentSessionLogged || completedSetsInActive > 0) && (
                <button
                  type="button"
                  onClick={() => onResetWorkoutDay(activeWorkout.id)}
                  aria-label={`Reset workout for ${activeWorkout.title}`}
                  className="px-3.5 py-2.5 rounded-full border border-zinc-800 bg-[#1c1c1f] hover:bg-[#27272a] text-zinc-200 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-yellow-400" />
                  Reset Workout
                </button>
              )}
              <button
                type="button"
                onClick={() => onCompleteSession(activeWorkout.id)}
                className={`px-4 py-2.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  isCurrentSessionLogged
                    ? 'bg-[#25e86a]/15 border border-[#25e86a]/40 text-[#25e86a]'
                    : 'bg-[#25e86a] text-black hover:bg-[#1ed760]'
                }`}
              >
                <Check className="w-4 h-4" />
                {isCurrentSessionLogged ? 'Workout Logged!' : 'Finish Workout'}
              </button>
            </div>
          </div>

          {/* Exercise List */}
          <div className="space-y-4">
            {activeWorkout.exercises.map((exercise) => {
              const isSwapped = exercise.id === 'lb_3' && lungeSwappedToBss && exercise.ankleSwapOption;
              const displayedName = isSwapped ? exercise.ankleSwapOption!.swapName : exercise.name;
              const displayedReps = isSwapped ? exercise.ankleSwapOption!.swapReps : exercise.reps;

              return (
                <div key={exercise.id} className="bg-[#18181b] border border-zinc-800/90 rounded-2xl p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-mono font-bold tabular-nums">
                        <span className="text-yellow-400">#{exercise.order}</span>
                        <span aria-hidden="true" className="text-zinc-600">·</span>
                        <span className="text-[#25e86a]">
                          {exercise.sets} sets × {displayedReps}
                        </span>
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-white mt-0.5">{displayedName}</h4>
                      {exercise.tip && (
                        <p className="text-xs text-zinc-400 mt-0.5">{exercise.tip}</p>
                      )}
                      {isSwapped && exercise.ankleSwapOption && (
                        <p className="text-xs text-yellow-400 mt-0.5 font-medium">
                          {exercise.ankleSwapOption.swapReason}
                        </p>
                      )}
                    </div>

                    {exercise.ankleSwapOption && (
                      <button
                        type="button"
                        onClick={onToggleLungeSwap}
                        className="px-3 py-1.5 rounded-full border border-zinc-700 bg-[#121214] hover:bg-[#222226] text-xs font-semibold text-zinc-200 flex items-center gap-1.5 whitespace-nowrap shrink-0"
                      >
                        <ArrowLeftRight className="w-3.5 h-3.5 text-yellow-400" />
                        {lungeSwappedToBss
                          ? 'Switch to Dumbbell Low Box Step-Up (MAX)'
                          : 'Ankle Swap: Single-Leg Hip Thrust (MED)'}
                      </button>
                    )}
                  </div>

                  {/* Set Table */}
                  <div className="mt-3 pt-3 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
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
                              ? 'border-[#25e86a]/50 bg-[#121214]'
                              : 'border-zinc-800 bg-[#121214]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold text-zinc-300 tabular-nums">
                              Set {setNum}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleToggleSet(key)}
                              aria-label={`Mark ${displayedName} Set ${setNum} complete`}
                              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                                log.completed
                                  ? 'bg-[#25e86a] text-black'
                                  : 'bg-[#1c1c1f] border border-zinc-800 text-zinc-300 hover:bg-[#27272a]'
                              }`}
                            >
                              {log.completed ? 'Done' : 'Check'}
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <label className="block">
                              <span className="text-[10px] text-zinc-500 block">Weight (lbs)</span>
                              <input
                                type="number"
                                value={log.weightLbs}
                                onChange={(e) => handleWeightChange(key, parseFloat(e.target.value))}
                                className="mt-0.5 w-full px-2 py-1 text-xs font-mono tabular-nums bg-[#18181b] border border-zinc-800 rounded-lg text-white"
                              />
                            </label>
                            <label className="block">
                              <span className="text-[10px] text-zinc-500 block">Reps</span>
                              <input
                                type="text"
                                value={log.repsCompleted}
                                onChange={(e) => handleRepsChange(key, e.target.value)}
                                className="mt-0.5 w-full px-2 py-1 text-xs font-mono tabular-nums bg-[#18181b] border border-zinc-800 rounded-lg text-white"
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
          <section aria-labelledby="ankle-protocol-heading" className="bg-[#121214] border border-zinc-800/90 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-zinc-800/80">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-yellow-400 font-bold">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>Left Ankle Care</span>
                </div>
                <h3 id="ankle-protocol-heading" className="text-base font-bold text-white mt-0.5">
                  Leg Day Warm-Up
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-[#25e86a] tabular-nums">
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
                      checked
                        ? 'border-[#25e86a]/50 bg-[#18181b]'
                        : 'border-zinc-800 bg-[#18181b]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-white">
                          {step.title} <span className="font-mono font-normal text-zinc-400">({step.prescription})</span>
                        </p>
                        <p className="text-[11px] text-zinc-500 mt-0.5">{step.detail}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onToggleAnkleWarmup(step.id)}
                        aria-label={`Toggle ${step.title} warm-up completion`}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                          checked
                            ? 'bg-[#25e86a] text-black'
                            : 'bg-[#121214] border border-zinc-800 text-zinc-300 hover:bg-[#222226]'
                        }`}
                      >
                        {checked ? 'Done' : 'Check'}
                      </button>
                    </div>

                    {step.hasTimer && (
                      <div className="mt-2.5 pt-2 border-t border-zinc-800 flex items-center justify-between gap-2">
                        <span className="text-xs font-mono tabular-nums text-zinc-400">
                          Timer: <strong className="text-white">{stretchSecondsLeft}s</strong>
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setStretchTimerRunning((prev) => !prev)}
                            className="px-3 py-1 rounded-full bg-[#25e86a] hover:bg-[#1ed760] text-black text-xs font-bold flex items-center gap-1 whitespace-nowrap shrink-0"
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
                            className="p-1 rounded-full border border-zinc-800 bg-[#121214] text-zinc-400 hover:text-white"
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
            <div className="pt-2 border-t border-zinc-800 flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-white">Flat Shoes On</p>
                <p className="text-[11px] text-zinc-400">Vans, Converse, or flat lifters</p>
              </div>
              <button
                type="button"
                onClick={onToggleFlatShoes}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shrink-0 ${
                  flatShoesVerified
                    ? 'bg-[#25e86a] text-black'
                    : 'bg-[#18181b] border border-zinc-800 text-zinc-300 hover:bg-[#222226]'
                }`}
              >
                {flatShoesVerified ? 'Checked' : 'Verify'}
              </button>
            </div>
          </section>

          {/* Low-Impact Cardio */}
          <section aria-labelledby="liss-cardio-heading" className="bg-[#121214] border border-zinc-800/90 rounded-3xl p-6 space-y-3.5">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-bold">
              <Footprints className="w-4 h-4 text-[#25e86a]" />
              <h3 id="liss-cardio-heading" className="text-sm font-bold text-white">
                Ankle-Safe Cardio
              </h3>
            </div>

            <label className="block">
              <span className="text-xs text-zinc-400">Pick low-impact cardio variation</span>
              <select
                value={
                  CARDIO_MODALITIES.some((m) => m.id === lissModality)
                    ? lissModality
                    : CARDIO_MODALITIES[0].id
                }
                onChange={(e) => onUpdateLiss(e.target.value, lissMinutesToday)}
                className="mt-1 w-full px-3 py-2 text-xs bg-[#18181b] border border-zinc-800 rounded-xl text-white font-medium"
              >
                {(['Treadmill', 'Stairmaster', 'Row Machine', 'Bike & Elliptical'] as const).map(
                  (category) => (
                    <optgroup key={category} label={category}>
                      {CARDIO_MODALITIES.filter((m) => m.category === category).map((mod) => (
                        <option key={mod.id} value={mod.id}>
                          {mod.label}
                        </option>
                      ))}
                    </optgroup>
                  )
                )}
              </select>
            </label>

            {(() => {
              const activeMod =
                CARDIO_MODALITIES.find((m) => m.id === lissModality) || CARDIO_MODALITIES[0];
              return (
                <p className="text-[11px] text-zinc-300 bg-[#18181b] border border-zinc-800 rounded-xl px-3 py-2">
                  {activeMod.ankleSafetyNote}
                </p>
              );
            })()}

            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Minutes today</span>
                <span className="font-mono font-bold text-[#25e86a] tabular-nums">{lissMinutesToday} mins</span>
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                {[15, 25, 30, 45].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => onUpdateLiss(lissModality, mins)}
                    className={`flex-1 py-1.5 px-2 rounded-full text-xs font-mono font-bold transition-colors whitespace-nowrap shrink-0 ${
                      lissMinutesToday === mins
                        ? 'bg-[#25e86a] text-black'
                        : 'bg-[#18181b] border border-zinc-800 text-zinc-300 hover:bg-[#222226]'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-800 space-y-1.5">
              {ANKLE_SAFETY_RULES.map((rule) => (
                <p key={rule.title} className="text-[11px] text-zinc-400">
                  <strong className="text-white">{rule.title}:</strong> {rule.detail}
                </p>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
