import React, { useState } from 'react';
import {
  APPROVED_FOOD_CATALOG,
  type ApprovedFoodItem,
} from '../data/programData';
import {
  PRESCRIBED_TARGETS,
  applyPb2Addon,
  calculateDailyNutritionStatus,
  calculateCustomRecompMacros,
  type FoodLogEntry,
  type MacroTargets,
} from '../utils/recompLogic';
import { Droplets, Plus, Trash2, Calculator, CheckCircle2, AlertTriangle, Search } from 'lucide-react';

interface NutritionViewProps {
  foodLogs: FoodLogEntry[];
  onAddFoodLog: (entry: Omit<FoodLogEntry, 'id' | 'timestamp'>) => void;
  onRemoveFoodLog: (id: string) => void;
  waterOz: number;
  onUpdateWaterOz: (newOz: number) => void;
  activeTargets: MacroTargets;
  onUpdateTargets: (targets: MacroTargets) => void;
  onCreditMacroDay: () => void;
  macroDayCreditedToday: boolean;
}

export const NutritionView: React.FC<NutritionViewProps> = ({
  foodLogs,
  onAddFoodLog,
  onRemoveFoodLog,
  waterOz,
  onUpdateWaterOz,
  activeTargets,
  onUpdateTargets,
  onCreditMacroDay,
  macroDayCreditedToday,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'protein' | 'carb' | 'fat' | 'sweet'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [pb2Selections, setPb2Selections] = useState<Record<string, boolean>>({
    fp_premier_protein: true,
  });
  const [variantSelections, setVariantSelections] = useState<Record<string, string>>({
    fc_petit_potatoes: 'Purple',
    fc_brown_rice: 'Brown Rice (Preferred)',
    fc_rice_cakes: 'Sweet Flavor',
  });

  // Custom Food Form State
  const [customName, setCustomName] = useState('');
  const [customCalories, setCustomCalories] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFats, setCustomFats] = useState('');
  const [customSugar, setCustomSugar] = useState('0');
  const [customSatFat, setCustomSatFat] = useState('0');
  const [customError, setCustomError] = useState('');

  // Recomp Macro Calculator State
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcCurrentWeight, setCalcCurrentWeight] = useState(172);
  const [calcTargetWeight, setCalcTargetWeight] = useState(150);
  const [calcMaintenance, setCalcMaintenance] = useState(2580);
  const [calcDeficitPct, setCalcDeficitPct] = useState(18);
  const [calcProteinRatio, setCalcProteinRatio] = useState(0.9);

  const status = calculateDailyNutritionStatus(foodLogs, activeTargets);
  const waterPercentage = Math.min(100, Math.round((waterOz / activeTargets.waterOz) * 100));

  const filteredCatalog = APPROVED_FOOD_CATALOG.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subGroup.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleQuickLogApproved = (item: ApprovedFoodItem) => {
    const usePb2 = Boolean(item.supportsPb2Addon && pb2Selections[item.id]);
    const chosenVariant = item.variants ? variantSelections[item.id] || item.variants[0] : undefined;
    const displayName = chosenVariant ? `${item.name} (${chosenVariant})` : item.name;

    const baseEntry: Omit<FoodLogEntry, 'id' | 'timestamp'> = {
      name: displayName,
      category: item.category,
      servingNote: item.servingNote,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fats: item.fats,
      sugar: item.sugar,
      saturatedFat: item.saturatedFat,
    };

    onAddFoodLog(applyPb2Addon(baseEntry, usePb2));
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customCalories.trim()) {
      setCustomError('Please enter a food name and calories.');
      return;
    }
    const cal = parseFloat(customCalories);
    if (Number.isNaN(cal) || cal < 0) {
      setCustomError('Calories must be a valid positive number.');
      return;
    }
    setCustomError('');
    onAddFoodLog({
      name: customName.trim(),
      category: 'custom',
      servingNote: 'Custom entry',
      calories: Math.round(cal),
      protein: parseFloat(customProtein) || 0,
      carbs: parseFloat(customCarbs) || 0,
      fats: parseFloat(customFats) || 0,
      sugar: parseFloat(customSugar) || 0,
      saturatedFat: parseFloat(customSatFat) || 0,
    });
    setCustomName('');
    setCustomCalories('');
    setCustomProtein('');
    setCustomCarbs('');
    setCustomFats('');
    setCustomSugar('0');
    setCustomSatFat('0');
  };

  const previewCalculatedTargets = calculateCustomRecompMacros({
    currentWeightLbs: calcCurrentWeight,
    targetWeightLbs: calcTargetWeight,
    maintenanceCalories: calcMaintenance,
    deficitPercent: calcDeficitPct,
    proteinPerLbTarget: calcProteinRatio,
  });

  return (
    <div className="space-y-6">
      {/* Top Row: Daily Macros & 120 oz Water */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* 8-Column Macro & Guardrail Card */}
        <section aria-labelledby="macro-command-heading" className="lg:col-span-8 bg-white border border-pink-200/80 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-pink-100">
              <div>
                <h2 id="macro-command-heading" className="text-lg font-bold text-slate-900">
                  Daily Macros & Targets
                </h2>
                <p className="text-xs text-slate-500">
                  Hit your targets 5 days a week — 2 days are flexible!
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCalculator((prev) => !prev)}
                  className="px-3 py-2 rounded-2xl border border-teal-200 bg-teal-50/50 hover:bg-teal-100/70 text-xs font-bold text-teal-800 flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <Calculator className="w-3.5 h-3.5 text-teal-600" />
                  {showCalculator ? 'Hide Calculator' : 'Macro Calculator'}
                </button>
                <button
                  type="button"
                  onClick={onCreditMacroDay}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                    macroDayCreditedToday
                      ? 'bg-teal-500 text-white'
                      : 'bg-pink-500 text-white hover:bg-pink-600'
                  }`}
                >
                  {macroDayCreditedToday ? 'Day Counted!' : 'Count Today (5x/wk)'}
                </button>
              </div>
            </div>

            {/* 4 Bubbly Macro Boxes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-4">
              {/* Calories */}
              <div className="p-3.5 rounded-2xl bg-pink-50/40 border border-pink-200/70">
                <span className="text-xs text-pink-600 font-bold">Calories</span>
                <div className="mt-1 flex items-baseline justify-between font-mono tabular-nums">
                  <span className="text-xl font-bold text-slate-900">{status.totals.calories}</span>
                  <span className="text-xs text-slate-400">/ {activeTargets.calories}</span>
                </div>
                <div className="w-full h-1.5 bg-pink-100 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-pink-500 transition-transform duration-150 origin-left"
                    style={{ width: `${status.macroPercentages.calories}%` }}
                  />
                </div>
              </div>

              {/* Protein */}
              <div className="p-3.5 rounded-2xl bg-teal-50/40 border border-teal-200/70">
                <span className="text-xs text-teal-600 font-bold">Protein</span>
                <div className="mt-1 flex items-baseline justify-between font-mono tabular-nums">
                  <span className="text-xl font-bold text-slate-900">{status.totals.protein}g</span>
                  <span className="text-xs text-slate-400">/ {activeTargets.protein}g</span>
                </div>
                <div className="w-full h-1.5 bg-teal-100 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-teal-500 transition-transform duration-150 origin-left"
                    style={{ width: `${status.macroPercentages.protein}%` }}
                  />
                </div>
              </div>

              {/* Carbs */}
              <div className="p-3.5 rounded-2xl bg-pink-50/40 border border-pink-200/70">
                <span className="text-xs text-pink-600 font-bold">Carbs</span>
                <div className="mt-1 flex items-baseline justify-between font-mono tabular-nums">
                  <span className="text-xl font-bold text-slate-900">{status.totals.carbs}g</span>
                  <span className="text-xs text-slate-400">/ {activeTargets.carbs}g</span>
                </div>
                <div className="w-full h-1.5 bg-pink-100 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-pink-400 transition-transform duration-150 origin-left"
                    style={{ width: `${status.macroPercentages.carbs}%` }}
                  />
                </div>
              </div>

              {/* Fats */}
              <div className="p-3.5 rounded-2xl bg-teal-50/40 border border-teal-200/70">
                <span className="text-xs text-teal-600 font-bold">Fats</span>
                <div className="mt-1 flex items-baseline justify-between font-mono tabular-nums">
                  <span className="text-xl font-bold text-slate-900">{status.totals.fats}g</span>
                  <span className="text-xs text-slate-400">/ {activeTargets.fats}g</span>
                </div>
                <div className="w-full h-1.5 bg-teal-100 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-teal-400 transition-transform duration-150 origin-left"
                    style={{ width: `${status.macroPercentages.fats}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sugar (<40g) & Saturated Fat (<20g) */}
          <div className="mt-4 pt-3.5 border-t border-pink-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl border border-teal-200/70 bg-teal-50/20">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                {status.sugarOverLimit ? (
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-teal-500" />
                )}
                <span>Sugar (Under 40g)</span>
              </div>
              <span
                className={`text-xs font-mono font-bold tabular-nums ${
                  status.sugarOverLimit ? 'text-red-600' : 'text-teal-700'
                }`}
              >
                {status.totals.sugar}g / {activeTargets.maxSugar}g
              </span>
            </div>

            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl border border-pink-200/70 bg-pink-50/20">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                {status.saturatedFatOverLimit ? (
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-pink-500" />
                )}
                <span>Sat Fat (Under 20g)</span>
              </div>
              <span
                className={`text-xs font-mono font-bold tabular-nums ${
                  status.saturatedFatOverLimit ? 'text-red-600' : 'text-pink-700'
                }`}
              >
                {status.totals.saturatedFat}g / {activeTargets.maxSaturatedFat}g
              </span>
            </div>
          </div>
        </section>

        {/* 4-Column 120 oz Water Tracker */}
        <section aria-labelledby="water-tracker-heading" className="lg:col-span-4 bg-white border border-teal-200/80 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-teal-600 font-bold">
                <Droplets className="w-4 h-4" />
                <span>Daily Water</span>
              </div>
              <span className="text-xs font-mono font-bold text-pink-500 tabular-nums">
                {waterPercentage}%
              </span>
            </div>
            <h3 id="water-tracker-heading" className="text-lg font-bold text-slate-900 mt-0.5">
              120 oz Goal
            </h3>

            <div className="mt-3.5 p-4 rounded-2xl bg-teal-50/40 border border-teal-200/70">
              <div className="flex items-baseline justify-between font-mono tabular-nums">
                <span className="text-2xl font-bold text-teal-900">{waterOz} oz</span>
                <span className="text-xs text-teal-600">/ {activeTargets.waterOz} oz</span>
              </div>
              <div className="w-full h-2 bg-teal-100 rounded-full overflow-hidden mt-2.5">
                <div
                  className="h-full bg-gradient-to-r from-teal-400 to-pink-400 transition-transform duration-150 origin-left"
                  style={{ width: `${waterPercentage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="grid grid-cols-4 gap-1.5">
              {[8, 16, 24, 32].map((addOz) => (
                <button
                  key={addOz}
                  type="button"
                  onClick={() => onUpdateWaterOz(waterOz + addOz)}
                  className="py-2 px-1.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-xs font-mono font-bold transition-colors whitespace-nowrap shrink-0"
                >
                  +{addOz}oz
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => onUpdateWaterOz(Math.max(0, waterOz - 8))}
                className="text-xs text-slate-400 hover:text-pink-600"
              >
                -8 oz
              </button>
              <button
                type="button"
                onClick={() => onUpdateWaterOz(120)}
                className="text-xs font-bold text-pink-600 hover:text-pink-700"
              >
                Fill to 120 oz
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Collapsible Recomp Macro Calculator */}
      {showCalculator && (
        <section aria-labelledby="recomp-calc-heading" className="bg-white border border-teal-200 rounded-3xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-teal-100">
            <div>
              <h3 id="recomp-calc-heading" className="text-base font-bold text-slate-900">
                Custom Macro Calculator
              </h3>
              <p className="text-xs text-slate-500">
                Estimate macros from your weight or stick with the 2,118 cal plan.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onUpdateTargets(PRESCRIBED_TARGETS)}
              className="px-3.5 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-xs font-bold text-pink-700 whitespace-nowrap shrink-0"
            >
              Use Prescribed Plan (2,118 cal)
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <label className="block">
              <span className="text-xs text-slate-600">Current Weight</span>
              <input
                type="number"
                value={calcCurrentWeight}
                onChange={(e) => setCalcCurrentWeight(parseFloat(e.target.value) || 150)}
                className="mt-1 w-full px-3 py-1.5 text-xs font-mono tabular-nums border border-teal-200 rounded-xl"
              />
            </label>
            <label className="block">
              <span className="text-xs text-slate-600">Goal Weight</span>
              <input
                type="number"
                value={calcTargetWeight}
                onChange={(e) => setCalcTargetWeight(parseFloat(e.target.value) || 140)}
                className="mt-1 w-full px-3 py-1.5 text-xs font-mono tabular-nums border border-teal-200 rounded-xl"
              />
            </label>
            <label className="block">
              <span className="text-xs text-slate-600">Maintenance Cal</span>
              <input
                type="number"
                value={calcMaintenance}
                onChange={(e) => setCalcMaintenance(parseFloat(e.target.value) || 2500)}
                className="mt-1 w-full px-3 py-1.5 text-xs font-mono tabular-nums border border-teal-200 rounded-xl"
              />
            </label>
            <label className="block">
              <span className="text-xs text-slate-600">Deficit % (15–20)</span>
              <input
                type="number"
                min={10}
                max={25}
                value={calcDeficitPct}
                onChange={(e) => setCalcDeficitPct(parseFloat(e.target.value) || 18)}
                className="mt-1 w-full px-3 py-1.5 text-xs font-mono tabular-nums border border-teal-200 rounded-xl"
              />
            </label>
            <label className="block">
              <span className="text-xs text-slate-600">Protein g/lb</span>
              <input
                type="number"
                step="0.05"
                min={0.7}
                max={1.2}
                value={calcProteinRatio}
                onChange={(e) => setCalcProteinRatio(parseFloat(e.target.value) || 0.9)}
                className="mt-1 w-full px-3 py-1.5 text-xs font-mono tabular-nums border border-teal-200 rounded-xl"
              />
            </label>
          </div>

          <div className="p-3.5 rounded-2xl bg-teal-50/50 border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs font-mono font-bold text-teal-900 tabular-nums">
              Result: {previewCalculatedTargets.calories} cal · {previewCalculatedTargets.protein}g P ·{' '}
              {previewCalculatedTargets.carbs}g C · {previewCalculatedTargets.fats}g F
            </span>
            <button
              type="button"
              onClick={() => onUpdateTargets(previewCalculatedTargets)}
              className="px-4 py-1.5 rounded-xl bg-pink-500 text-white text-xs font-bold hover:bg-pink-600 whitespace-nowrap shrink-0"
            >
              Use These Macros
            </button>
          </div>
        </section>
      )}

      {/* Main Two-Column Approved Food Picker & Today's Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Columns: Approved Food Options */}
        <section aria-labelledby="approved-foods-heading" className="lg:col-span-7 bg-white border border-teal-200/80 rounded-3xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 id="approved-foods-heading" className="text-base font-bold text-slate-900">
                Approved Food List
              </h3>
              <p className="text-xs text-slate-500">Tap any favorite to add it to today’s log</p>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-teal-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search foods..."
                aria-label="Filter approved foods"
                className="pl-8 pr-3 py-1.5 text-xs bg-teal-50/30 border border-teal-200 rounded-2xl text-slate-900 w-full sm:w-44"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-teal-50/70 border border-teal-200/60 rounded-2xl">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'protein', label: 'Proteins' },
                { id: 'carb', label: 'Carbs & Snacks' },
                { id: 'fat', label: 'Fats' },
                { id: 'sweet', label: 'Atkins Treats' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                  selectedCategory === tab.id
                    ? 'bg-pink-500 text-white shadow-xs'
                    : 'text-teal-900 hover:text-pink-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Food Rows */}
          <div className="divide-y divide-pink-100/80 max-h-[540px] overflow-y-auto pr-1">
            {filteredCatalog.map((item) => {
              const pb2Active = Boolean(item.supportsPb2Addon && pb2Selections[item.id]);
              const effectiveCalories = pb2Active ? item.calories + 60 : item.calories;
              const effectiveProtein = pb2Active ? item.protein + 6 : item.protein;

              return (
                <div key={item.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <span>{item.subGroup}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.servingNote}</span>
                      {item.glutenFreeNote && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-teal-600 font-semibold">GF</span>
                        </>
                      )}
                    </div>
                    <p className="text-sm font-bold text-slate-900">{item.name}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono tabular-nums text-slate-500">
                      <span className="font-bold text-pink-600">{effectiveCalories} cal</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-teal-600 font-bold">{effectiveProtein}g P</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.carbs + (pb2Active ? 5 : 0)}g C</span>
                      <span aria-hidden="true">·</span>
                      <span>{Number((item.fats + (pb2Active ? 1.5 : 0)).toFixed(1))}g F</span>
                    </div>

                    {item.supportsPb2Addon && (
                      <label className="inline-flex items-center gap-1.5 text-xs text-pink-600 font-semibold cursor-pointer pt-0.5">
                        <input
                          type="checkbox"
                          checked={pb2Active}
                          onChange={(e) =>
                            setPb2Selections((prev) => ({
                              ...prev,
                              [item.id]: e.target.checked,
                            }))
                          }
                          className="rounded border-pink-300 text-pink-500"
                        />
                        <span>+ PB2 Powder (+60 cal, +6g P)</span>
                      </label>
                    )}

                    {item.variants && (
                      <div className="pt-1 flex items-center gap-1.5">
                        <select
                          aria-label={`Select variety for ${item.name}`}
                          value={variantSelections[item.id] || item.variants[0]}
                          onChange={(e) =>
                            setVariantSelections((prev) => ({
                              ...prev,
                              [item.id]: e.target.value,
                            }))
                          }
                          className="px-2 py-1 text-xs bg-teal-50/50 border border-teal-200 rounded-lg text-slate-700"
                        >
                          {item.variants.map((v) => (
                            <option key={v} value={v}>
                              {v}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleQuickLogApproved(item)}
                    aria-label={`Log ${item.name}`}
                    className="px-3.5 py-1.5 rounded-2xl bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold flex items-center gap-1 whitespace-nowrap shrink-0 self-start sm:self-center"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right 5 Columns: Today's Logged Meals & Custom Add */}
        <div className="lg:col-span-5 space-y-5">
          <section aria-labelledby="todays-log-heading" className="bg-white border border-pink-200/80 rounded-3xl p-6 space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-pink-100">
              <h3 id="todays-log-heading" className="text-base font-bold text-slate-900">
                Today’s Food Log
              </h3>
              <span className="text-xs text-pink-600 font-mono font-bold tabular-nums">
                {status.totals.calories} / {activeTargets.calories} cal
              </span>
            </div>

            {foodLogs.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-xs font-semibold text-slate-500">Nothing logged yet today!</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Tap "Add" on any food on the left to get started.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-pink-100 max-h-[340px] overflow-y-auto pr-1">
                {foodLogs.map((entry) => (
                  <div key={entry.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{entry.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono tabular-nums">
                        {entry.calories} cal · {entry.protein}g P · {entry.carbs}g C · {entry.fats}g F
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveFoodLog(entry.id)}
                      aria-label={`Remove ${entry.name} from log`}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-pink-600 hover:bg-pink-50 transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Concise Custom Food Entry */}
          <section aria-labelledby="custom-food-heading" className="bg-white border border-teal-200/80 rounded-3xl p-6">
            <h3 id="custom-food-heading" className="text-sm font-bold text-slate-900">
              Quick-Add Custom Food
            </h3>

            <form onSubmit={handleCustomSubmit} className="mt-3 space-y-2.5">
              {customError && (
                <p role="alert" className="text-xs font-medium text-red-600">
                  {customError}
                </p>
              )}
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Food or meal name..."
                aria-label="Custom food name"
                className="w-full px-3 py-2 text-xs bg-white border border-teal-200 rounded-2xl text-slate-900"
              />

              <div className="grid grid-cols-3 gap-2">
                <label className="block text-[11px] text-slate-500">
                  Calories
                  <input
                    type="number"
                    value={customCalories}
                    onChange={(e) => setCustomCalories(e.target.value)}
                    placeholder="250"
                    className="mt-0.5 w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-white border border-teal-200 rounded-xl"
                  />
                </label>
                <label className="block text-[11px] text-slate-500">
                  Protein (g)
                  <input
                    type="number"
                    value={customProtein}
                    onChange={(e) => setCustomProtein(e.target.value)}
                    placeholder="25"
                    className="mt-0.5 w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-white border border-teal-200 rounded-xl"
                  />
                </label>
                <label className="block text-[11px] text-slate-500">
                  Carbs (g)
                  <input
                    type="number"
                    value={customCarbs}
                    onChange={(e) => setCustomCarbs(e.target.value)}
                    placeholder="20"
                    className="mt-0.5 w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-white border border-teal-200 rounded-xl"
                  />
                </label>
                <label className="block text-[11px] text-slate-500">
                  Fats (g)
                  <input
                    type="number"
                    value={customFats}
                    onChange={(e) => setCustomFats(e.target.value)}
                    placeholder="6"
                    className="mt-0.5 w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-white border border-teal-200 rounded-xl"
                  />
                </label>
                <label className="block text-[11px] text-slate-500">
                  Sugar (g)
                  <input
                    type="number"
                    value={customSugar}
                    onChange={(e) => setCustomSugar(e.target.value)}
                    placeholder="0"
                    className="mt-0.5 w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-white border border-teal-200 rounded-xl"
                  />
                </label>
                <label className="block text-[11px] text-slate-500">
                  Sat Fat (g)
                  <input
                    type="number"
                    value={customSatFat}
                    onChange={(e) => setCustomSatFat(e.target.value)}
                    placeholder="0"
                    className="mt-0.5 w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-white border border-teal-200 rounded-xl"
                  />
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2 px-4 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold transition-colors"
              >
                Add Custom Food
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};
