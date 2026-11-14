import React, { useState, useEffect } from 'react';
import {
  createCustomDailyQuest,
  type DailyWarmupQuest,
} from '../data/programData';
import {
  Sparkles,
  Check,
  Shuffle,
  Plus,
  Timer,
  RotateCcw,
  Trash2,
  X,
} from 'lucide-react';

interface DailyQuestsSectionProps {
  quests: DailyWarmupQuest[];
  completedQuestIdsToday: string[];
  totalLifetimeQuestsCompleted: number;
  onToggleQuest: (questId: string) => void;
  onShuffleQuests: () => void;
  onAddCustomQuest: (quest: DailyWarmupQuest) => void;
  onDeleteCustomQuest: (questId: string) => void;
}

function formatSeconds(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export const DailyQuestsSection: React.FC<DailyQuestsSectionProps> = ({
  quests,
  completedQuestIdsToday,
  totalLifetimeQuestsCompleted,
  onToggleQuest,
  onShuffleQuests,
  onAddCustomQuest,
  onDeleteCustomQuest,
}) => {
  const [activeTimerQuestId, setActiveTimerQuestId] = useState<string | null>(null);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);

  const [showCustomForm, setShowCustomForm] = useState<boolean>(false);
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customPrescription, setCustomPrescription] = useState<string>('');
  const [customDuration, setCustomDuration] = useState<string>('3 mins');
  const [customCategory, setCustomCategory] =
    useState<DailyWarmupQuest['category']>('Mobility Flow');
  const [formError, setFormError] = useState<string>('');

  useEffect(() => {
    if (!timerRunning || !activeTimerQuestId) return;
    const interval = window.setInterval(() => {
      setTimerSecondsLeft((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          if (!completedQuestIdsToday.includes(activeTimerQuestId)) {
            onToggleQuest(activeTimerQuestId);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [timerRunning, activeTimerQuestId, completedQuestIdsToday, onToggleQuest]);

  const completedCount = quests.filter((q) =>
    completedQuestIdsToday.includes(q.id)
  ).length;
  const totalCount = quests.length;
  const allCompleted = totalCount > 0 && completedCount === totalCount;
  const progressPct =
    totalCount > 0 ? Math.min(100, Math.round((completedCount / totalCount) * 100)) : 0;

  const handleStartOrToggleTimer = (quest: DailyWarmupQuest) => {
    const defaultSecs = quest.timerSeconds || 180;
    if (activeTimerQuestId !== quest.id) {
      setActiveTimerQuestId(quest.id);
      setTimerSecondsLeft(defaultSecs);
      setTimerRunning(true);
      return;
    }
    if (timerSecondsLeft === 0) {
      setTimerSecondsLeft(defaultSecs);
      setTimerRunning(true);
    } else {
      setTimerRunning((prev) => !prev);
    }
  };

  const handleResetTimer = (quest: DailyWarmupQuest) => {
    setTimerRunning(false);
    setActiveTimerQuestId(quest.id);
    setTimerSecondsLeft(quest.timerSeconds || 180);
  };

  const handleCreateCustomQuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) {
      setFormError('Please enter a warm-up quest name.');
      return;
    }
    if (!customPrescription.trim()) {
      setFormError('Please enter the warm-up moves or reps.');
      return;
    }
    setFormError('');
    const created = createCustomDailyQuest({
      title: customTitle,
      prescription: customPrescription,
      durationLabel: customDuration,
      category: customCategory,
    });
    onAddCustomQuest(created);
    setCustomTitle('');
    setCustomPrescription('');
    setCustomDuration('3 mins');
    setShowCustomForm(false);
  };

  return (
    <section
      aria-labelledby="daily-quests-heading"
      className="bg-[#121214] border border-zinc-800/90 rounded-3xl p-6 lg:p-7 space-y-5"
    >
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-zinc-400">
            <span className="inline-flex items-center gap-1 text-white">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              Daily Warm-Up Quests
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums text-[#25e86a] font-bold">
              {completedCount} / {totalCount} Done Today
            </span>
            {totalLifetimeQuestsCompleted > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums text-zinc-500 font-normal">
                  {totalLifetimeQuestsCompleted} Total Completed
                </span>
              </>
            )}
          </div>
          <h2 id="daily-quests-heading" className="text-xl font-bold text-white">
            {allCompleted
              ? 'All Daily Warm-Up Quests Complete!'
              : 'Today’s Warm-Up Degree Quests'}
          </h2>
          <p className="text-xs text-zinc-400">
            Bite-sized warm-up flows, joint prep, and light movement to wake up your body every day.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onShuffleQuests}
            className="px-3.5 py-2 rounded-full border border-zinc-800 bg-[#1c1c1f] hover:bg-[#252529] text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Shuffle className="w-3.5 h-3.5 text-zinc-400" />
            Shuffle Warm-Ups
          </button>
          <button
            type="button"
            onClick={() => setShowCustomForm((prev) => !prev)}
            className="px-4 py-2 rounded-full bg-[#25e86a] hover:bg-[#1ed760] text-black text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            {showCustomForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {showCustomForm ? 'Close' : 'Custom Warm-Up'}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-[#1c1c1f] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#25e86a] transition-all duration-200"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Collapsible Custom Warm-Up Quest Form */}
      {showCustomForm && (
        <form
          onSubmit={handleCreateCustomQuest}
          className="p-4 sm:p-5 rounded-2xl bg-[#18181b] border border-zinc-800 space-y-3.5"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Add a Custom Daily Warm-Up Quest</h3>
            <span className="text-[11px] font-semibold text-[#25e86a]">Repeats Daily</span>
          </div>

          {formError && (
            <p role="alert" className="text-xs font-semibold text-red-400">
              {formError}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <label className="sm:col-span-2 block text-xs font-medium text-zinc-400">
              Warm-Up Title
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="e.g., Wrist & Shoulder Warm-Up"
                aria-label="Warm-Up Title"
                className="mt-1 w-full px-3 py-2 text-xs bg-[#0d0d0f] border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600"
              />
            </label>

            <label className="block text-xs font-medium text-zinc-400">
              Category
              <select
                value={customCategory}
                onChange={(e) =>
                  setCustomCategory(e.target.value as DailyWarmupQuest['category'])
                }
                aria-label="Warm-Up Category"
                className="mt-1 w-full px-3 py-2 text-xs bg-[#0d0d0f] border border-zinc-800 rounded-xl text-white"
              >
                <option value="Mobility Flow">Mobility Flow</option>
                <option value="Core & Glute Spark">Core & Glute Spark</option>
                <option value="Ankle & Joint Prep">Ankle & Joint Prep</option>
                <option value="Light Movement">Light Movement</option>
              </select>
            </label>

            <label className="block text-xs font-medium text-zinc-400">
              Duration
              <input
                type="text"
                value={customDuration}
                onChange={(e) => setCustomDuration(e.target.value)}
                placeholder="3 mins"
                aria-label="Warm-Up Duration"
                className="mt-1 w-full px-3 py-2 text-xs bg-[#0d0d0f] border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600"
              />
            </label>
          </div>

          <label className="block text-xs font-medium text-zinc-400">
            Warm-Up Moves / Reps
            <input
              type="text"
              value={customPrescription}
              onChange={(e) => setCustomPrescription(e.target.value)}
              placeholder="e.g., 10 wrist circles · 12 band pull-aparts · 20s plank"
              aria-label="Warm-Up Moves"
              className="mt-1 w-full px-3 py-2 text-xs bg-[#0d0d0f] border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600"
            />
          </label>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowCustomForm(false)}
              className="px-3.5 py-1.5 rounded-full border border-zinc-800 bg-[#121214] text-xs font-semibold text-zinc-300 hover:bg-[#1c1c1f]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-full bg-[#25e86a] hover:bg-[#1ed760] text-black text-xs font-bold"
            >
              Save Daily Quest
            </button>
          </div>
        </form>
      )}

      {/* Quest Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quests.map((quest) => {
          const isDone = completedQuestIdsToday.includes(quest.id);
          const isTimerActiveForThis = activeTimerQuestId === quest.id;
          const displaySeconds = isTimerActiveForThis
            ? timerSecondsLeft
            : quest.timerSeconds || 180;

          return (
            <div
              key={quest.id}
              className={`rounded-2xl border p-4 flex flex-col justify-between gap-3.5 transition-all ${
                isDone
                  ? 'border-[#25e86a]/40 bg-[#18181b]'
                  : 'border-zinc-800/90 bg-[#18181b] hover:border-zinc-700'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-[11px] font-semibold">
                  <span className="text-zinc-400">{quest.category}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-yellow-400 font-bold tabular-nums">
                      {quest.durationLabel}
                    </span>
                    {quest.isCustom && (
                      <button
                        type="button"
                        onClick={() => onDeleteCustomQuest(quest.id)}
                        aria-label={`Delete custom quest ${quest.title}`}
                        className="text-zinc-500 hover:text-red-400 p-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white leading-snug">
                  {quest.title}
                </h3>

                <p className="text-xs font-medium text-zinc-200 leading-relaxed">
                  {quest.prescription}
                </p>

                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  {quest.detail}
                </p>
              </div>

              <div className="pt-2.5 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                {/* Optional Quick Warm-Up Timer */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleStartOrToggleTimer(quest)}
                    aria-label={`${
                      isTimerActiveForThis && timerRunning ? 'Pause' : 'Start'
                    } timer for ${quest.title}`}
                    className="px-2.5 py-1.5 rounded-full border border-zinc-800 bg-[#121214] hover:bg-[#222226] text-zinc-200 text-[11px] font-mono font-semibold flex items-center gap-1 whitespace-nowrap"
                  >
                    <Timer className="w-3.5 h-3.5 text-zinc-400" />
                    <span>
                      {isTimerActiveForThis && timerRunning
                        ? `Pause ${formatSeconds(displaySeconds)}`
                        : formatSeconds(displaySeconds)}
                    </span>
                  </button>
                  {isTimerActiveForThis && (
                    <button
                      type="button"
                      onClick={() => handleResetTimer(quest)}
                      aria-label={`Reset timer for ${quest.title}`}
                      className="p-1.5 rounded-full border border-zinc-800 text-zinc-400 hover:text-white"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Quest Completion Button */}
                <button
                  type="button"
                  onClick={() => onToggleQuest(quest.id)}
                  aria-label={`Complete quest ${quest.title}`}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 ${
                    isDone
                      ? 'bg-[#25e86a]/15 border border-[#25e86a]/40 text-[#25e86a]'
                      : 'bg-[#25e86a] hover:bg-[#1ed760] text-black'
                  }`}
                >
                  {isDone && <Check className="w-3.5 h-3.5" />}
                  <span>{isDone ? 'Quest Done!' : 'Complete Quest'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
