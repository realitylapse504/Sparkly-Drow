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
    fc_petit_potatoes: 'Purple Gourmet',
    fc_brown_rice: 'Brown Rice (Preferred)',
    fc_rice_cakes: 'White Cheddar Savory',
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
    <div className="space-y-8">
      {/* Top Row: Daily Macro Telemetry & 120 oz Hydration Command */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* 8-Column Macro & Guardrail Card */}
        <section aria-labelledby="macro-command-heading" className="lg:col-span-8 bg-white border border-pink-200/90 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-pink-100">
              <div>
                <div className="flex items-center gap-2 text-xs text-pink-600 font-medium">
                  <span>Daily Fuel Protocol</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-teal-700">Track & Hit Targets 5x / Week (2 Days Flexible)</span>
                </div>
                <h2 id="macro-command-heading" className="text-xl font-bold text-slate-900 mt-1">
                  Daily Calories, Macros & Sugar / Sat-Fat Guardrails
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCalculator((prev) => !prev)}
                  className="px-3 py-2 rounded-lg border border-teal-300 bg-teal-50/50 hover:bg-teal-100/70 text-xs font-medium text-teal-900 flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <Calculator className="w-3.5 h-3.5 text-teal-600" />
                  {showCalculator ? 'Hide Recomp Calculator' : 'Macro Calculator'}
                </button>
                <button
                  type="button"
                  onClick={onCreditMacroDay}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    macroDayCreditedToday
                      ? 'bg-teal-600 text-white'
                      : 'bg-pink-600 text-white hover:bg-pink-500'
                  }`}
                >
                  {macroDayCreditedToday ? 'Day Credited (5x/wk Key)' : 'Credit Today to 5x/wk Key'}
                </button>
              </div>
            </div>

            {/* Primary 4 Macro Columns */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
              {/* Calories */}
              <div className="p-4 rounded-lg bg-pink-50/40 border border-pink-200/80">
                <span className="text-xs text-pink-700 font-medium">Calories</span>
                <div className="mt-1 flex items-baseline justify-between font-mono tabular-nums">
                  <span className="text-2xl font-bold text-slate-900">{status.totals.calories}</span>
                  <span className="text-xs text-slate-500">/ {activeTargets.calories} kcal</span>
                </div>
                <div className="w-full h-1.5 bg-pink-100 rounded-full overflow-hidden mt-2.5">
                  <div
                    className="h-full bg-pink-600 transition-transform duration-150 origin-left"
                    style={{ width: `${status.macroPercentages.calories}%` }}
                  />
                </div>
                <p className="text-[11px] font-mono tabular-nums text-slate-600 mt-1.5">
                  {status.remainingCalories >= 0
                    ? `${status.remainingCalories} kcal remaining`
                    : `${Math.abs(status.remainingCalories)} kcal over target`}
                </p>
              </div>

              {/* Protein */}
              <div className="p-4 rounded-lg bg-teal-50/40 border border-teal-200/80">
                <span className="text-xs text-teal-700 font-medium">Protein (Target)</span>
                <div className="mt-1 flex items-baseline justify-between font-mono tabular-nums">
                  <span className="text-2xl font-bold text-slate-900">{status.totals.protein}g</span>
                  <span className="text-xs text-slate-500">/ {activeTargets.protein}g</span>
                </div>
                <div className="w-full h-1.5 bg-teal-100 rounded-full overflow-hidden mt-2.5">
                  <div
                    className="h-full bg-teal-600 transition-transform duration-150 origin-left"
                    style={{ width: `${status.macroPercentages.protein}%` }}
                  />
                </div>
                <p className="text-[11px] font-mono tabular-nums text-slate-600 mt-1.5">
                  {Math.max(0, Number((activeTargets.protein - status.totals.protein).toFixed(1)))}g to hit 129g goal
                </p>
              </div>

              {/* Carbs */}
              <div className="p-4 rounded-lg bg-pink-50/40 border border-pink-200/80">
                <span className="text-xs text-pink-700 font-medium">Carbohydrates</span>
                <div className="mt-1 flex items-baseline justify-between font-mono tabular-nums">
                  <span className="text-2xl font-bold text-slate-900">{status.totals.carbs}g</span>
                  <span className="text-xs text-slate-500">/ {activeTargets.carbs}g</span>
                </div>
                <div className="w-full h-1.5 bg-pink-100 rounded-full overflow-hidden mt-2.5">
                  <div
                    className="h-full bg-pink-500 transition-transform duration-150 origin-left"
                    style={{ width: `${status.macroPercentages.carbs}%` }}
                  />
                </div>
                <p className="text-[11px] font-mono tabular-nums text-slate-600 mt-1.5">
                  Workout energy fuel
                </p>
              </div>

              {/* Fats */}
              <div className="p-4 rounded-lg bg-teal-50/40 border border-teal-200/80">
                <span className="text-xs text-teal-700 font-medium">Healthy Fats</span>
                <div className="mt-1 flex items-baseline justify-between font-mono tabular-nums">
                  <span className="text-2xl font-bold text-slate-900">{status.totals.fats}g</span>
                  <span className="text-xs text-slate-500">/ {activeTargets.fats}g</span>
                </div>
                <div className="w-full h-1.5 bg-teal-100 rounded-full overflow-hidden mt-2.5">
                  <div
                    className="h-full bg-teal-500 transition-transform duration-150 origin-left"
                    style={{ width: `${status.macroPercentages.fats}%` }}
                  />
                </div>
                <p className="text-[11px] font-mono tabular-nums text-slate-600 mt-1.5">
                  Hormone support
                </p>
              </div>
            </div>
          </div>

          {/* Strict Daily Guardrails: Sugar (<40g) & Saturated Fat (<20g) */}
          <div className="mt-5 pt-4 border-t border-pink-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-teal-200/80 bg-teal-50/20">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                  {status.sugarOverLimit ? (
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  )}
                  <span>Daily Sugar Guardrail (Stay under 40g)</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {status.sugarOverLimit
                    ? 'Exceeded 40g daily sugar ceiling'
                    : `${Number((activeTargets.maxSugar - status.totals.sugar).toFixed(1))}g allowance remaining`}
                </p>
              </div>
              <span
                className={`text-sm font-mono font-bold tabular-nums ${
                  status.sugarOverLimit ? 'text-red-600' : 'text-teal-800'
                }`}
              >
                {status.totals.sugar}g / {activeTargets.maxSugar}g
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-pink-200/80 bg-pink-50/20">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                  {status.saturatedFatOverLimit ? (
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-pink-600" />
                  )}
                  <span>Saturated Fat Guardrail (Stay under 20g)</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {status.saturatedFatOverLimit
                    ? 'Exceeded 20g daily saturated fat ceiling'
                    : `${Number((activeTargets.maxSaturatedFat - status.totals.saturatedFat).toFixed(1))}g allowance remaining`}
                </p>
              </div>
              <span
                className={`text-sm font-mono font-bold tabular-nums ${
                  status.saturatedFatOverLimit ? 'text-red-600' : 'text-pink-800'
                }`}
              >
                {status.totals.saturatedFat}g / {activeTargets.maxSaturatedFat}g
              </span>
            </div>
          </div>
        </section>

        {/* 4-Column 120 oz Daily Water Hydration Tracker */}
        <section aria-labelledby="water-tracker-heading" className="lg:col-span-4 bg-white border border-teal-200/90 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-teal-700 font-semibold">
                <Droplets className="w-4 h-4 text-teal-600" />
                <span>Mandatory Daily Hydration</span>
              </div>
              <span className="text-xs font-mono font-semibold text-pink-600 tabular-nums">
                {waterPercentage}%
              </span>
            </div>
            <h3 id="water-tracker-heading" className="text-xl font-bold text-slate-900 mt-1">
              120 oz Water Daily
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Essential for muscle glycogen partitioning, cellular recovery, and fat metabolism.
            </p>

            <div className="mt-5 p-4 rounded-xl bg-teal-50/40 border border-teal-200/80">
              <div className="flex items-baseline justify-between font-mono tabular-nums">
                <span className="text-3xl font-bold text-teal-900">{waterOz} oz</span>
                <span className="text-xs text-teal-700">Target: {activeTargets.waterOz} oz</span>
              </div>
              <div className="w-full h-2.5 bg-teal-100 rounded-full overflow-hidden mt-3">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-pink-500 transition-transform duration-150 origin-left"
                  style={{ width: `${waterPercentage}%` }}
                />
              </div>
              <p className="text-xs font-mono tabular-nums text-slate-600 mt-2">
                {waterOz >= activeTargets.waterOz
                  ? '120 oz Daily Hydration Goal Complete!'
                  : `${activeTargets.waterOz - waterOz} oz remaining today`}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-2.5">
            <div className="grid grid-cols-4 gap-2">
              {[8, 16, 24, 32].map((addOz) => (
                <button
                  key={addOz}
                  type="button"
                  onClick={() => onUpdateWaterOz(waterOz + addOz)}
                  className="py-2 px-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-mono font-semibold transition-colors whitespace-nowrap shrink-0"
                >
                  +{addOz}oz
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => onUpdateWaterOz(Math.max(0, waterOz - 8))}
                className="text-xs text-slate-500 hover:text-pink-700"
              >
                -8 oz correction
              </button>
              <button
                type="button"
                onClick={() => onUpdateWaterOz(120)}
                className="text-xs font-semibold text-pink-600 hover:text-pink-700"
              >
                Mark 120 oz Complete
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Collapsible Interactive Recomp Calorie & Macro Calculator */}
      {showCalculator && (
        <section aria-labelledby="recomp-calc-heading" className="bg-white border border-teal-200 rounded-xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-teal-100">
            <div>
              <h3 id="recomp-calc-heading" className="text-lg font-bold text-slate-900">
                Body Recomposition Calorie & Macro Estimator
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Compare custom 15–20% caloric deficit & 0.8–1.0g/lb protein estimates against your prescribed 2,118 kcal plan.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onUpdateTargets(PRESCRIBED_TARGETS)}
              className="px-3.5 py-2 rounded-lg bg-pink-50 hover:bg-pink-100 text-xs font-semibold text-pink-800 whitespace-nowrap shrink-0"
            >
              Restore Prescribed Plan (2,118 kcal · 129P · 282C · 60F)
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <label className="block">
              <span className="text-xs font-medium text-slate-700">Current Weight (lbs)</span>
              <input
                type="number"
                value={calcCurrentWeight}
                onChange={(e) => setCalcCurrentWeight(parseFloat(e.target.value) || 150)}
                className="mt-1 w-full px-3 py-2 text-xs font-mono tabular-nums border border-teal-300 rounded-lg"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-700">Target Weight (lbs)</span>
              <input
                type="number"
                value={calcTargetWeight}
                onChange={(e) => setCalcTargetWeight(parseFloat(e.target.value) || 140)}
                className="mt-1 w-full px-3 py-2 text-xs font-mono tabular-nums border border-teal-300 rounded-lg"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-700">Est. Maintenance (kcal)</span>
              <input
                type="number"
                value={calcMaintenance}
                onChange={(e) => setCalcMaintenance(parseFloat(e.target.value) || 2500)}
                className="mt-1 w-full px-3 py-2 text-xs font-mono tabular-nums border border-teal-300 rounded-lg"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-700">Sweet-Spot Deficit (15–20%)</span>
              <input
                type="number"
                min={10}
                max={25}
                value={calcDeficitPct}
                onChange={(e) => setCalcDeficitPct(parseFloat(e.target.value) || 18)}
                className="mt-1 w-full px-3 py-2 text-xs font-mono tabular-nums border border-teal-300 rounded-lg"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-700">Protein / lb Target (0.8–1.0g)</span>
              <input
                type="number"
                step="0.05"
                min={0.7}
                max={1.2}
                value={calcProteinRatio}
                onChange={(e) => setCalcProteinRatio(parseFloat(e.target.value) || 0.9)}
                className="mt-1 w-full px-3 py-2 text-xs font-mono tabular-nums border border-teal-300 rounded-lg"
              />
            </label>
          </div>

          <div className="p-4 rounded-lg bg-teal-50/50 border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs space-y-1">
              <p className="font-semibold text-slate-900">
                Calculated Output:{' '}
                <span className="font-mono tabular-nums text-teal-800">
                  {previewCalculatedTargets.calories} kcal · {previewCalculatedTargets.protein}g Protein ·{' '}
                  {previewCalculatedTargets.carbs}g Carbs · {previewCalculatedTargets.fats}g Fats
                </span>
              </p>
              <p className="text-slate-500">
                Prescribed Baseline: 2,118 kcal · 129g Protein · 282g Carbs · 60g Fats · &lt;40g Sugar · &lt;20g Sat Fat
              </p>
            </div>
            <button
              type="button"
              onClick={() => onUpdateTargets(previewCalculatedTargets)}
              className="px-4 py-2 rounded-lg bg-pink-600 text-white text-xs font-semibold hover:bg-pink-500 whitespace-nowrap shrink-0"
            >
              Apply Calculated Macros
            </button>
          </div>
        </section>
      )}

      {/* Main Two-Column Food Catalog & Today's Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7 Columns: Curated Approved Food Options Matrix */}
        <section aria-labelledby="approved-foods-heading" className="lg:col-span-7 bg-white border border-teal-200/90 rounded-xl p-6 space-y-5">
          <div>
            <h3 id="approved-foods-heading" className="text-lg font-bold text-slate-900">
              Approved Nutrition Catalog & Quick Logger
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Every approved Lean Protein (including 93% Lean Ground Beef, Gluten-Free Greek Yogurts, Shakes + PB2), Complex Carbs, Petit Potatoes, Healthy Fats, and Atkins Sweet Snacks.
            </p>
          </div>

          {/* Filter Tabs & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1 p-1 bg-teal-50/80 border border-teal-200/60 rounded-lg">
              {(
                [
                  { id: 'all', label: 'All Options' },
                  { id: 'protein', label: 'Lean Proteins' },
                  { id: 'carb', label: 'Carbs & Snacks' },
                  { id: 'fat', label: 'Healthy Fats' },
                  { id: 'sweet', label: 'Atkins Sweets' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    selectedCategory === tab.id
                      ? 'bg-pink-600 text-white shadow-xs'
                      : 'text-teal-900 hover:text-pink-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-teal-600 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter approved foods..."
                aria-label="Filter approved foods"
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-teal-300 rounded-lg text-slate-900 w-full sm:w-48"
              />
            </div>
          </div>

          {/* Food Rows */}
          <div className="divide-y divide-pink-100 max-h-[620px] overflow-y-auto pr-1">
            {filteredCatalog.map((item) => {
              const pb2Active = Boolean(item.supportsPb2Addon && pb2Selections[item.id]);
              const effectiveCalories = pb2Active ? item.calories + 60 : item.calories;
              const effectiveProtein = pb2Active ? item.protein + 6 : item.protein;

              return (
                <div key={item.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{item.subGroup}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.servingNote}</span>
                      {item.glutenFreeNote && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-teal-700 font-medium">Gluten-Free</span>
                        </>
                      )}
                    </div>
                    <p className="text-sm font-bold text-slate-900">{item.name}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono tabular-nums text-slate-600">
                      <span className="font-semibold text-pink-700">{effectiveCalories} kcal</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-teal-700 font-semibold">{effectiveProtein}g P</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.carbs + (pb2Active ? 5 : 0)}g C</span>
                      <span aria-hidden="true">·</span>
                      <span>{Number((item.fats + (pb2Active ? 1.5 : 0)).toFixed(1))}g F</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.sugar + (pb2Active ? 1 : 0)}g Sugar</span>
                    </div>

                    {/* Optional PB2 Toggle for Shakes */}
                    {item.supportsPb2Addon && (
                      <div className="pt-1">
                        <label className="inline-flex items-center gap-2 text-xs text-pink-700 font-medium cursor-pointer">
                          <input
                            type="checkbox"
                            checked={pb2Active}
                            onChange={(e) =>
                              setPb2Selections((prev) => ({
                                ...prev,
                                [item.id]: e.target.checked,
                              }))
                            }
                            className="rounded border-pink-300 text-pink-600"
                          />
                          <span>Add PB2 Powder (+60 kcal, +6g Protein)</span>
                        </label>
                      </div>
                    )}

                    {/* Optional Variant Selector (Petit Potatoes / Rice / Rice Cakes) */}
                    {item.variants && (
                      <div className="pt-1 flex items-center gap-2">
                        <span className="text-[11px] text-slate-500">Option:</span>
                        <select
                          aria-label={`Select variety for ${item.name}`}
                          value={variantSelections[item.id] || item.variants[0]}
                          onChange={(e) =>
                            setVariantSelections((prev) => ({
                              ...prev,
                              [item.id]: e.target.value,
                            }))
                          }
                          className="px-2 py-1 text-xs bg-teal-50/50 border border-teal-200 rounded text-slate-800"
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
                    className="px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 self-start sm:self-center"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Log Food
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right 5 Columns: Today's Logged Meals & Custom Macro Logger */}
        <div className="lg:col-span-5 space-y-6">
          <section aria-labelledby="todays-log-heading" className="bg-white border border-pink-200/90 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-pink-100">
              <div>
                <h3 id="todays-log-heading" className="text-lg font-bold text-slate-900">
                  Today’s Nutrition Log
                </h3>
                <p className="text-xs text-pink-700 font-mono tabular-nums">
                  {foodLogs.length} items logged · {status.totals.calories} / {activeTargets.calories} kcal
                </p>
              </div>
            </div>

            {foodLogs.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm font-medium text-slate-700">No meals logged yet today.</p>
                <p className="text-xs text-slate-500 mt-1">
                  Select an approved food from the catalog on the left to start tracking.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-pink-100 max-h-[380px] overflow-y-auto pr-1">
                {foodLogs.map((entry) => (
                  <div key={entry.id} className="py-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{entry.name}</p>
                      <p className="text-[11px] text-slate-600 font-mono tabular-nums mt-0.5">
                        {entry.calories} kcal · {entry.protein}g P · {entry.carbs}g C · {entry.fats}g F ·{' '}
                        {entry.sugar}g Sug · {entry.saturatedFat}g SatFat
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveFoodLog(entry.id)}
                      aria-label={`Remove ${entry.name} from log`}
                      className="p-1.5 rounded text-slate-400 hover:text-pink-600 hover:bg-pink-50 transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Custom Macro Quick Entry Form */}
          <section aria-labelledby="custom-food-heading" className="bg-white border border-teal-200/90 rounded-xl p-6">
            <h3 id="custom-food-heading" className="text-base font-bold text-slate-900">
              Log Custom Meal or Recipe
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter custom nutrition facts to verify against your 40g sugar and 20g saturated fat ceilings.
            </p>

            <form onSubmit={handleCustomSubmit} className="mt-4 space-y-3">
              {customError && (
                <p role="alert" className="text-xs font-medium text-red-600">
                  {customError}
                </p>
              )}
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Food / Meal Name
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g., Turkey & Quinoa Skillet"
                    className="mt-1 w-full px-3 py-2 text-xs bg-white border border-teal-300 rounded-lg text-slate-900"
                  />
                </label>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <label className="block text-xs font-medium text-slate-700">
                  Calories
                  <input
                    type="number"
                    value={customCalories}
                    onChange={(e) => setCustomCalories(e.target.value)}
                    placeholder="350"
                    className="mt-1 w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-white border border-teal-300 rounded-lg"
                  />
                </label>
                <label className="block text-xs font-medium text-slate-700">
                  Protein (g)
                  <input
                    type="number"
                    value={customProtein}
                    onChange={(e) => setCustomProtein(e.target.value)}
                    placeholder="32"
                    className="mt-1 w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-white border border-teal-300 rounded-lg"
                  />
                </label>
                <label className="block text-xs font-medium text-slate-700">
                  Carbs (g)
                  <input
                    type="number"
                    value={customCarbs}
                    onChange={(e) => setCustomCarbs(e.target.value)}
                    placeholder="38"
                    className="mt-1 w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-white border border-teal-300 rounded-lg"
                  />
                </label>
                <label className="block text-xs font-medium text-slate-700">
                  Fats (g)
                  <input
                    type="number"
                    value={customFats}
                    onChange={(e) => setCustomFats(e.target.value)}
                    placeholder="8"
                    className="mt-1 w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-white border border-teal-300 rounded-lg"
                  />
                </label>
                <label className="block text-xs font-medium text-slate-700">
                  Sugar (g)
                  <input
                    type="number"
                    value={customSugar}
                    onChange={(e) => setCustomSugar(e.target.value)}
                    placeholder="2"
                    className="mt-1 w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-white border border-teal-300 rounded-lg"
                  />
                </label>
                <label className="block text-xs font-medium text-slate-700">
                  Sat Fat (g)
                  <input
                    type="number"
                    value={customSatFat}
                    onChange={(e) => setCustomSatFat(e.target.value)}
                    placeholder="1.5"
                    className="mt-1 w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-white border border-teal-300 rounded-lg"
                  />
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold transition-colors"
              >
                Add Custom Entry to Today’s Log
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};
