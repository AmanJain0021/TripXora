import React, { useState } from 'react';
import { replanItinerary } from '../../api/ai.api';
import { useTrip } from '../../hooks/useTrip';

const BudgetPanel = ({ trip }) => {
  const budget = trip?.budget;
  const { fetchTrip } = useTrip();
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [newBudgetSim, setNewBudgetSim] = useState('');

  if (!budget || !budget.totalBudget) {
    return (
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 flex flex-col items-center justify-center text-center h-full">
        <p className="text-[#697386] text-xs font-medium mb-1">No budget specified for this journey.</p>
        <p className="text-xs text-[#697386]">Update trip preferences to set a total budget target.</p>
      </div>
    );
  }

  const {
    totalBudget,
    totalEstimated,
    remaining,
    status,
    breakdown,
    currency
  } = budget;

  const percentageUsed = Math.min((totalEstimated / totalBudget) * 100, 100);

  let statusBadgeClass = 'badge-green';
  let progressColor = 'bg-[#1FA774]';
  if (status === 'over') {
    statusBadgeClass = 'bg-red-50 text-red-600 border border-red-200';
    progressColor = 'bg-red-500';
  } else if (status === 'optimized' || percentageUsed > 85) {
    statusBadgeClass = 'badge-orange';
    progressColor = 'bg-[#F28C28]';
  }

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency || 'INR', maximumFractionDigits: 0 }).format(val);
  };

  const handleOptimizeCheaper = async () => {
    setIsOptimizing(true);
    try {
      await replanItinerary(trip._id, "Find cheaper alternatives for meals and attractions to bring down the overall cost.");
      await fetchTrip(trip._id);
    } catch (err) {
      console.error('Failed to optimize budget', err);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleSimulateBudget = async () => {
    const val = Number(newBudgetSim);
    if (!val || val <= 0) return;
    setIsOptimizing(true);
    try {
      await replanItinerary(trip._id, `Adjust itinerary to utilize the new budget of ${val}`, val);
      await fetchTrip(trip._id);
      setNewBudgetSim('');
    } catch (err) {
      console.error('Failed to simulate new budget', err);
    } finally {
      setIsOptimizing(false);
    }
  };

  if (isOptimizing) {
    return (
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-8 text-center h-full flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1FA774] mb-3"></div>
        <h3 className="text-sm font-bold text-[#172033] mb-1">Optimizing Travel Budget...</h3>
        <p className="text-[#697386] text-xs font-medium">Re-calculating routes and activity estimates.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 flex-1 flex flex-col h-full overflow-hidden text-[#172033]">
      <div className="flex justify-between items-center mb-4 shrink-0">
        <h3 className="text-base font-extrabold text-[#172033]">Budget Overview</h3>
        <span className={`${statusBadgeClass} text-[10px] uppercase tracking-wider`}>
          {status}
        </span>
      </div>

      <div className="overflow-y-auto flex-1 space-y-5 pr-1">
        <div className="bg-[#F7F8FA] p-3.5 rounded-xl border border-[#E5E7EB]">
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-[11px] text-[#697386] font-semibold">Estimated Cost</p>
              <p className="text-2xl font-extrabold text-[#1FA774]">{formatCurrency(totalEstimated)}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-[#697386] font-semibold">Target Budget</p>
              <p className="text-sm font-bold text-[#172033]">{formatCurrency(totalBudget)}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-2 w-full bg-[#E5E7EB] rounded-full overflow-hidden mb-2">
            <div 
              className={`h-full ${progressColor} transition-all duration-1000 ease-out`}
              style={{ width: `${percentageUsed}%` }}
            />
          </div>
          
          <p className={`text-xs font-semibold ${remaining < 0 ? 'text-red-600' : 'text-[#697386]'}`}>
            {remaining < 0 
              ? `Over budget by ${formatCurrency(Math.abs(remaining))}` 
              : `${formatCurrency(remaining)} remaining`}
          </p>
        </div>

        {/* AI Budget Controls */}
        <div className="bg-[#F0EBFF] p-3.5 rounded-xl border border-[#6D3DF5]/20">
          <h4 className="text-xs font-extrabold text-[#6D3DF5] mb-2 flex items-center gap-1.5">
            <span>✨</span> AI Budget Adjuster
          </h4>
          
          <div className="space-y-2">
            {status === 'over' && (
              <button
                onClick={handleOptimizeCheaper}
                className="w-full btn-secondary text-xs py-1.5"
              >
                Find Cheaper Alternatives
              </button>
            )}

            <div className="flex gap-2">
              <input
                type="number"
                placeholder="New Budget Target (₹)..."
                value={newBudgetSim}
                onChange={(e) => setNewBudgetSim(e.target.value)}
                className="flex-1 text-xs border border-[#E5E7EB] bg-white rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-[#6D3DF5] outline-none text-[#172033] font-medium"
              />
              <button
                onClick={handleSimulateBudget}
                disabled={!newBudgetSim}
                className="btn-primary text-xs py-1.5 px-3 disabled:opacity-50"
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-extrabold text-[#172033] mb-3 text-xs uppercase tracking-wider">Cost Breakdown</h4>
          <div className="space-y-3">
            {Object.entries(breakdown || {}).map(([category, amount]) => {
              if (amount === 0) return null;
              const catPct = totalEstimated > 0 ? (amount / totalEstimated) * 100 : 0;
              
              return (
                <div key={category} className="flex flex-col text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-[#697386] capitalize">{category.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className="font-bold text-[#172033]">{formatCurrency(amount)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 bg-[#F7F8FA] border border-[#E5E7EB] rounded-full overflow-hidden">
                      <div className="h-full bg-[#6D3DF5] rounded-full" style={{ width: `${catPct}%` }} />
                    </div>
                    <span className="text-[10px] text-[#697386] font-semibold w-7 text-right">{Math.round(catPct)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetPanel;
