import React, { useState } from 'react';
import { FOUR_CORE_PILLARS } from '../data/programData';
import {
  calculateInchChangeSummary,
  getLocalDateString,
  type BodyMeasurementEntry,
} from '../utils/recompLogic';
import { Ruler, Zap, Moon, Plus, Trash2 } from 'lucide-react';

interface GoalsAndPillarsViewProps {
  measurements: BodyMeasurementEntry[];
  onAddMeasurement: (entry: Omit<BodyMeasurementEntry, 'id'>) => void;
  onDeleteMeasurement: (id: string) => void;
}

export const GoalsAndPillarsView: React.FC<GoalsAndPillarsViewProps> = ({
  measurements,
  onAddMeasurement,
  onDeleteMeasurement,
}) => {
  const [date, setDate] = useState(() => getLocalDateString());
  const [weightLbs, setWeightLbs] = useState('');
  const [waistIn, setWaistIn] = useState('');
  const [hipsIn, setHipsIn] = useState('');
  const [chestIn, setChestIn] = useState('');
  const [thighIn, setThighIn] = useState('');
  const [armIn, setArmIn] = useState('');
  const [energyRating, setEnergyRating] = useState('');
  const [sleepHours, setSleepHours] = useState('');
  const [stepsCount, setStepsCount] = useState('');
  const [formError, setFormError] = useState('');

  const summary = calculateInchChangeSummary(measurements);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weightLbs);
    const waist = parseFloat(waistIn);
    if (Number.isNaN(w) || Number.isNaN(waist) || w <= 0 || waist <= 0) {
      setFormError('Please enter your weight and waist measurement.');
      return;
    }
    setFormError('');
    onAddMeasurement({
      date,
      weightLbs: w,
      waistIn: waist,
      hipsIn: parseFloat(hipsIn) || 0,
      chestIn: parseFloat(chestIn) || 0,
      thighIn: parseFloat(thighIn) || 0,
      armIn: parseFloat(armIn) || 0,
      energyRating: Math.min(10, Math.max(1, parseInt(energyRating, 10) || 8)),
      sleepHours: parseFloat(sleepHours) || 7.5,
      stepsCount: parseInt(stepsCount, 10) || 8000,
    });
    setWeightLbs('');
    setWaistIn('');
    setHipsIn('');
    setChestIn('');
    setThighIn('');
    setArmIn('');
    setEnergyRating('');
    setSleepHours('');
    setStepsCount('');
  };

  return (
    <div className="space-y-6">
      {/* 3 Goal Cards (Matching Weight Tracker Card in Screenshot) */}
      <section aria-labelledby="core-goals-heading" className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#121214] border border-zinc-800/90 rounded-3xl p-6">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-semibold">
            <Ruler className="w-4 h-4 text-[#25e86a]" />
            <span id="core-goals-heading">Goal 1 · Change in Inches</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2.5 font-mono tabular-nums">
            <span className="text-3xl font-bold text-[#25e86a]">
              {measurements.length < 2
                ? '0.0 in'
                : `${summary.totalInchesDelta > 0 ? `+${summary.totalInchesDelta}` : summary.totalInchesDelta} in`}
            </span>
            <span className="text-xs text-zinc-500">
              {measurements.length === 0 ? 'No check-ins yet' : `Waist: ${summary.waistDelta}"`}
            </span>
          </div>
        </div>

        <div className="bg-[#121214] border border-zinc-800/90 rounded-3xl p-6">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-semibold">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span>Goal 2 · Daily Energy</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2.5 font-mono tabular-nums">
            <span className="text-3xl font-bold text-white">
              {measurements.length === 0 ? '— / 10' : `${summary.avgEnergy} / 10`}
            </span>
            <span className="text-xs text-zinc-500">Average feel-good score</span>
          </div>
        </div>

        <div className="bg-[#121214] border border-zinc-800/90 rounded-3xl p-6">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-semibold">
            <Moon className="w-4 h-4 text-[#25e86a]" />
            <span>Goal 3 · Sleep & Steps</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2.5 font-mono tabular-nums">
            <span className="text-3xl font-bold text-white">
              {measurements.length === 0 ? '— hrs' : `${summary.avgSleep} hrs`}
            </span>
            <span className="text-xs text-zinc-500">
              {measurements.length === 0 ? 'Target 7–9h & 8k+ steps' : `${summary.avgSteps.toLocaleString()} steps`}
            </span>
          </div>
        </div>
      </section>

      {/* Check-In History + Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <section aria-labelledby="measurement-history-heading" className="lg:col-span-7 bg-[#121214] border border-zinc-800/90 rounded-3xl p-6 space-y-4">
          <div>
            <h3 id="measurement-history-heading" className="text-base font-bold text-white">
              Inches & Check-In Log
            </h3>
            <p className="text-xs text-zinc-400">Your weekly body measurements and energy trends</p>
          </div>

          {measurements.length === 0 ? (
            <div className="py-10 px-4 text-center border border-dashed border-zinc-800 rounded-2xl bg-[#18181b]">
              <p className="text-xs font-bold text-zinc-200">No Check-Ins Yet</p>
              <p className="text-xs text-zinc-500 mt-1">
                Log your first baseline on the right whenever you’re ready!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-[11px] font-semibold text-zinc-400">
                    <th className="py-2 pr-2">Date</th>
                    <th className="py-2 px-2 text-right">Weight</th>
                    <th className="py-2 px-2 text-right">Waist</th>
                    <th className="py-2 px-2 text-right">Hips</th>
                    <th className="py-2 px-2 text-right">Energy</th>
                    <th className="py-2 px-2 text-right">Sleep</th>
                    <th className="py-2 pl-2 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/70 text-xs font-mono tabular-nums">
                  {measurements.map((m) => (
                    <tr key={m.id} className="hover:bg-[#18181b]">
                      <td className="py-2.5 pr-2 font-sans font-semibold text-white">{m.date}</td>
                      <td className="py-2.5 px-2 text-right font-bold text-[#25e86a]">{m.weightLbs} lb</td>
                      <td className="py-2.5 px-2 text-right font-bold text-white">{m.waistIn}"</td>
                      <td className="py-2.5 px-2 text-right text-zinc-400">{m.hipsIn}"</td>
                      <td className="py-2.5 px-2 text-right text-yellow-400 font-bold">{m.energyRating}/10</td>
                      <td className="py-2.5 px-2 text-right text-zinc-400">{m.sleepHours}h</td>
                      <td className="py-2.5 pl-2 text-right">
                        <button
                          type="button"
                          onClick={() => onDeleteMeasurement(m.id)}
                          aria-label={`Delete check-in from ${m.date}`}
                          className="p-1 text-zinc-500 hover:text-red-400 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Log New Check-In Form */}
        <section aria-labelledby="new-checkin-heading" className="lg:col-span-5 bg-[#121214] border border-zinc-800/90 rounded-3xl p-6">
          <h3 id="new-checkin-heading" className="text-base font-bold text-white">
            New Check-In
          </h3>

          <form onSubmit={handleSubmit} className="mt-3 space-y-2.5">
            {formError && (
              <p role="alert" className="text-xs font-medium text-yellow-400">
                {formError}
              </p>
            )}

            <div className="grid grid-cols-2 gap-2.5">
              <label className="block text-[11px] text-zinc-400">
                Date
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-0.5 w-full px-2.5 py-1.5 text-xs font-mono bg-[#18181b] text-white border border-zinc-800 rounded-xl"
                />
              </label>
              <label className="block text-[11px] text-zinc-400">
                Weight (lbs)
                <input
                  type="number"
                  step="0.1"
                  placeholder="150"
                  value={weightLbs}
                  onChange={(e) => setWeightLbs(e.target.value)}
                  className="mt-0.5 w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-[#18181b] text-white border border-zinc-800 rounded-xl placeholder:text-zinc-600"
                />
              </label>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <label className="block text-[11px] text-zinc-400">
                Waist (in)
                <input
                  type="number"
                  step="0.1"
                  placeholder="29.0"
                  value={waistIn}
                  onChange={(e) => setWaistIn(e.target.value)}
                  className="mt-0.5 w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-[#18181b] text-white border border-zinc-800 rounded-xl placeholder:text-zinc-600"
                />
              </label>
              <label className="block text-[11px] text-zinc-400">
                Hips (in)
                <input
                  type="number"
                  step="0.1"
                  placeholder="38.0"
                  value={hipsIn}
                  onChange={(e) => setHipsIn(e.target.value)}
                  className="mt-0.5 w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-[#18181b] text-white border border-zinc-800 rounded-xl placeholder:text-zinc-600"
                />
              </label>
              <label className="block text-[11px] text-zinc-400">
                Chest (in)
                <input
                  type="number"
                  step="0.1"
                  placeholder="35.0"
                  value={chestIn}
                  onChange={(e) => setChestIn(e.target.value)}
                  className="mt-0.5 w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-[#18181b] text-white border border-zinc-800 rounded-xl placeholder:text-zinc-600"
                />
              </label>
              <label className="block text-[11px] text-zinc-400">
                Thigh (in)
                <input
                  type="number"
                  step="0.1"
                  placeholder="21.0"
                  value={thighIn}
                  onChange={(e) => setThighIn(e.target.value)}
                  className="mt-0.5 w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-[#18181b] text-white border border-zinc-800 rounded-xl placeholder:text-zinc-600"
                />
              </label>
              <label className="block text-[11px] text-zinc-400">
                Arm (in)
                <input
                  type="number"
                  step="0.1"
                  placeholder="11.5"
                  value={armIn}
                  onChange={(e) => setArmIn(e.target.value)}
                  className="mt-0.5 w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-[#18181b] text-white border border-zinc-800 rounded-xl placeholder:text-zinc-600"
                />
              </label>
              <label className="block text-[11px] text-zinc-400">
                Energy (1–10)
                <input
                  type="number"
                  min={1}
                  max={10}
                  placeholder="8"
                  value={energyRating}
                  onChange={(e) => setEnergyRating(e.target.value)}
                  className="mt-0.5 w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-[#18181b] text-white border border-zinc-800 rounded-xl placeholder:text-zinc-600"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <label className="block text-[11px] text-zinc-400">
                Sleep (hrs)
                <input
                  type="number"
                  step="0.1"
                  placeholder="8.0"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(e.target.value)}
                  className="mt-0.5 w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-[#18181b] text-white border border-zinc-800 rounded-xl placeholder:text-zinc-600"
                />
              </label>
              <label className="block text-[11px] text-zinc-400">
                Daily Steps
                <input
                  type="number"
                  step="100"
                  placeholder="9000"
                  value={stepsCount}
                  onChange={(e) => setStepsCount(e.target.value)}
                  className="mt-0.5 w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-[#18181b] text-white border border-zinc-800 rounded-xl placeholder:text-zinc-600"
                />
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-full bg-[#25e86a] hover:bg-[#1ed760] text-black text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Save Check-In
            </button>
          </form>
        </section>
      </div>

      {/* Concise 4 Core Pillars Guide */}
      <section aria-labelledby="four-pillars-heading" className="bg-[#121214] border border-zinc-800/90 rounded-3xl p-6 space-y-4">
        <div>
          <h3 id="four-pillars-heading" className="text-base font-bold text-white">
            The 4 Pillars of Body Recomposition
          </h3>
          <p className="text-xs text-zinc-400">How everything works together</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FOUR_CORE_PILLARS.map((pillar) => (
            <div
              key={pillar.number}
              className="p-4 rounded-2xl border border-zinc-800/90 bg-[#18181b] space-y-2"
            >
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
                <span className="text-[#25e86a]">{pillar.number}.</span>
                <span className="text-zinc-400">{pillar.role}</span>
              </div>
              <h4 className="text-sm font-bold text-white">{pillar.title}</h4>
              <p className="text-xs text-zinc-300">{pillar.summary}</p>
              <ul className="space-y-1 pt-1.5 border-t border-zinc-800 text-xs text-zinc-400">
                {pillar.keyPoints.map((pt, i) => (
                  <li key={i}>• {pt}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
