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
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  const summary = calculateInchChangeSummary(measurements);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weightLbs);
    const waist = parseFloat(waistIn);
    if (Number.isNaN(w) || Number.isNaN(waist) || w <= 0 || waist <= 0) {
      setFormError('Please enter valid positive numbers for Weight and Waist measurements.');
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
      notes: notes.trim() || 'Body recomposition check-in.',
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
    setNotes('');
  };

  return (
    <div className="space-y-8">
      {/* Three Core Transformation Goals KPI Row */}
      <section aria-labelledby="core-goals-heading" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-teal-200/90 rounded-xl p-6">
          <div className="flex items-center gap-2 text-xs text-teal-700 font-medium">
            <Ruler className="w-4 h-4 text-pink-600" />
            <span>Goal 01 · Body Recomposition Metric</span>
          </div>
          <h2 id="core-goals-heading" className="text-lg font-bold text-slate-900 mt-1">
            Change in Inches
          </h2>
          <div className="mt-3 flex items-baseline gap-3 font-mono tabular-nums">
            <span className="text-3xl font-bold text-teal-600">
              {measurements.length < 2
                ? '0.0 in'
                : `${summary.totalInchesDelta > 0 ? `+${summary.totalInchesDelta}` : summary.totalInchesDelta} in`}
            </span>
            <span className="text-xs text-slate-500">
              {measurements.length === 0
                ? 'No baseline logged yet'
                : `Waist: ${summary.waistDelta > 0 ? `+${summary.waistDelta}` : summary.waistDelta} in · Scale: ${summary.weightDelta} lbs`}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-2">
            Simultaneous fat loss and lean muscle gain shifts tape measurements faster than scale weight alone.
          </p>
        </div>

        <div className="bg-white border border-pink-200/90 rounded-xl p-6">
          <div className="flex items-center gap-2 text-xs text-pink-700 font-medium">
            <Zap className="w-4 h-4 text-pink-600" />
            <span>Goal 02 · Daily Vitality & Output</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mt-1">Improved Energy</h3>
          <div className="mt-3 flex items-baseline gap-3 font-mono tabular-nums">
            <span className="text-3xl font-bold text-pink-600">
              {measurements.length === 0 ? '— / 10' : `${summary.avgEnergy} / 10`}
            </span>
            <span className="text-xs text-slate-500">Avg Daily Energy Score</span>
          </div>
          <p className="text-xs text-slate-600 mt-2">
            Fueled by 282g complex carbs, 120 oz daily hydration, and keeping daily sugar strictly under 40g.
          </p>
        </div>

        <div className="bg-white border border-teal-200/90 rounded-xl p-6">
          <div className="flex items-center gap-2 text-xs text-teal-700 font-medium">
            <Moon className="w-4 h-4 text-teal-600" />
            <span>Goal 03 · Sleep & NEAT Activity</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mt-1">Recovery & NEAT</h3>
          <div className="mt-3 flex items-baseline gap-3 font-mono tabular-nums">
            <span className="text-3xl font-bold text-teal-700">
              {measurements.length === 0 ? '— hrs' : `${summary.avgSleep} hrs`}
            </span>
            <span className="text-xs text-slate-500">
              Avg Steps: {measurements.length === 0 ? '0' : summary.avgSteps.toLocaleString()} / day
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-2">
            Target 7–9 hours of sleep to lower cortisol and 8,000–10,000 daily steps for non-exercise fat loss.
          </p>
        </div>
      </section>

      {/* Measurement Logger + Historical Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <section aria-labelledby="measurement-history-heading" className="lg:col-span-7 bg-white border border-pink-200/90 rounded-xl p-6 space-y-4">
          <div>
            <h3 id="measurement-history-heading" className="text-lg font-bold text-slate-900">
              Body Recomposition & Inches History
            </h3>
            <p className="text-xs text-slate-500">
              Track tape measurements across Waist, Hips, Chest, Thigh, and Arm alongside Sleep and NEAT steps.
            </p>
          </div>

          {measurements.length === 0 ? (
            <div className="py-12 px-4 text-center border border-dashed border-pink-200 rounded-lg bg-pink-50/30">
              <p className="text-sm font-semibold text-slate-800">No Measurement Check-Ins Logged Yet</p>
              <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                Enter your starting baseline measurements in the form on the right to begin tracking your change in inches, sleep hours, and daily energy.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-pink-200 text-[11px] font-semibold text-teal-800">
                    <th className="py-2.5 pr-3">Date</th>
                    <th className="py-2.5 px-2 text-right">Weight</th>
                    <th className="py-2.5 px-2 text-right">Waist</th>
                    <th className="py-2.5 px-2 text-right">Hips</th>
                    <th className="py-2.5 px-2 text-right">Chest</th>
                    <th className="py-2.5 px-2 text-right">Energy</th>
                    <th className="py-2.5 px-2 text-right">Sleep</th>
                    <th className="py-2.5 px-2 text-right">Steps</th>
                    <th className="py-2.5 pl-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-100 text-xs font-mono tabular-nums">
                  {measurements.map((m) => (
                    <tr key={m.id} className="hover:bg-teal-50/40">
                      <td className="py-3 pr-3 font-sans font-medium text-slate-900">{m.date}</td>
                      <td className="py-3 px-2 text-right text-slate-700">{m.weightLbs} lb</td>
                      <td className="py-3 px-2 text-right font-semibold text-teal-700">{m.waistIn}"</td>
                      <td className="py-3 px-2 text-right text-slate-700">{m.hipsIn}"</td>
                      <td className="py-3 px-2 text-right text-slate-700">{m.chestIn}"</td>
                      <td className="py-3 px-2 text-right text-pink-700 font-semibold">{m.energyRating}/10</td>
                      <td className="py-3 px-2 text-right text-slate-700">{m.sleepHours}h</td>
                      <td className="py-3 px-2 text-right text-slate-700">{m.stepsCount.toLocaleString()}</td>
                      <td className="py-3 pl-2 text-right">
                        <button
                          type="button"
                          onClick={() => onDeleteMeasurement(m.id)}
                          aria-label={`Delete check-in from ${m.date}`}
                          className="p-1 text-slate-400 hover:text-pink-600 rounded"
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
        <section aria-labelledby="new-checkin-heading" className="lg:col-span-5 bg-white border border-teal-200/90 rounded-xl p-6">
          <h3 id="new-checkin-heading" className="text-lg font-bold text-slate-900">
            Log Inches, Energy & Recovery Check-In
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Record weekly body measurements and daily recovery metrics.
          </p>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            {formError && (
              <p role="alert" className="text-xs font-medium text-red-600">
                {formError}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs font-medium text-slate-700">
                Check-In Date
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-teal-300 rounded-lg"
                />
              </label>
              <label className="block text-xs font-medium text-slate-700">
                Body Weight (lbs)
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 170.0"
                  value={weightLbs}
                  onChange={(e) => setWeightLbs(e.target.value)}
                  className="mt-1 w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-white border border-teal-300 rounded-lg"
                />
              </label>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <label className="block text-xs font-medium text-slate-700">
                Waist (in)
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 32.5"
                  value={waistIn}
                  onChange={(e) => setWaistIn(e.target.value)}
                  className="mt-1 w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-white border border-teal-300 rounded-lg"
                />
              </label>
              <label className="block text-xs font-medium text-slate-700">
                Hips (in)
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 39.0"
                  value={hipsIn}
                  onChange={(e) => setHipsIn(e.target.value)}
                  className="mt-1 w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-white border border-teal-300 rounded-lg"
                />
              </label>
              <label className="block text-xs font-medium text-slate-700">
                Chest (in)
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 40.0"
                  value={chestIn}
                  onChange={(e) => setChestIn(e.target.value)}
                  className="mt-1 w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-white border border-teal-300 rounded-lg"
                />
              </label>
              <label className="block text-xs font-medium text-slate-700">
                Thigh (in)
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 23.0"
                  value={thighIn}
                  onChange={(e) => setThighIn(e.target.value)}
                  className="mt-1 w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-white border border-teal-300 rounded-lg"
                />
              </label>
              <label className="block text-xs font-medium text-slate-700">
                Arm (in)
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 13.5"
                  value={armIn}
                  onChange={(e) => setArmIn(e.target.value)}
                  className="mt-1 w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-white border border-teal-300 rounded-lg"
                />
              </label>
              <label className="block text-xs font-medium text-slate-700">
                Energy (1–10)
                <input
                  type="number"
                  min={1}
                  max={10}
                  placeholder="e.g. 8"
                  value={energyRating}
                  onChange={(e) => setEnergyRating(e.target.value)}
                  className="mt-1 w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-white border border-teal-300 rounded-lg"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs font-medium text-slate-700">
                Sleep (7–9 hrs target)
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 8.0"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(e.target.value)}
                  className="mt-1 w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-white border border-teal-300 rounded-lg"
                />
              </label>
              <label className="block text-xs font-medium text-slate-700">
                NEAT Steps (8k–10k)
                <input
                  type="number"
                  step="100"
                  placeholder="e.g. 9000"
                  value={stepsCount}
                  onChange={(e) => setStepsCount(e.target.value)}
                  className="mt-1 w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-white border border-teal-300 rounded-lg"
                />
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Save Measurement & Energy Check-In
            </button>
          </form>
        </section>
      </div>

      {/* The Four Core Pillars of Body Recomposition */}
      <section aria-labelledby="four-pillars-heading" className="bg-white border border-teal-200/90 rounded-xl p-6 space-y-6">
        <div className="pb-4 border-b border-pink-100">
          <h3 id="four-pillars-heading" className="text-xl font-bold text-slate-900">
            The Four Core Pillars of Body Recomposition
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            Simultaneously shedding body fat while building lean muscle requires balanced execution across stimulus, fuel, recovery, and daily movement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FOUR_CORE_PILLARS.map((pillar, idx) => (
            <div
              key={pillar.number}
              className={`p-5 rounded-xl border space-y-3 ${
                idx % 2 === 0
                  ? 'border-teal-200 bg-teal-50/30'
                  : 'border-pink-200 bg-pink-50/30'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-mono font-semibold">
                <span className="text-pink-600">{pillar.number}.</span>
                <span aria-hidden="true">·</span>
                <span className="text-teal-700">{pillar.role}</span>
              </div>
              <h4 className="text-base font-bold text-slate-900">{pillar.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{pillar.summary}</p>
              <ul className="space-y-2 pt-2 border-t border-teal-200/60 text-xs text-slate-700">
                {pillar.keyPoints.map((pt, i) => (
                  <li key={i} className="leading-relaxed">
                    • {pt}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
