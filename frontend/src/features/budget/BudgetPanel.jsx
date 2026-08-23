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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center text-center h-full">
        <p className="text-gray-500 mb-2">No budget set for this trip.</p>
        <p className="text-sm text-gray-400">Update your trip settings to set a budget.</p>
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

  // Colors based on status
  let statusColor = 'text-green-600 bg-green-50';
  let progressColor = 'bg-green-500';
  if (status === 'over') {
    statusColor = 'text-red-600 bg-red-50';
    progressColor = 'bg-red-500';
  } else if (status === 'optimized' || percentageUsed > 85) {
    statusColor = 'text-orange-600 bg-orange-50';
    progressColor = 'bg-orange-500';
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center h-full flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">AI is Optimizing Budget...</h3>
        <p className="text-gray-500 text-sm">Finding alternatives and adjusting your plan.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex-1 flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <h3 className="text-xl font-bold text-gray-900">Budget Overview</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${statusColor}`}>
          {status}
        </span>
      </div>

      <div className="overflow-y-auto flex-1 pr-2 space-y-6">
        <div>
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-sm text-gray-500 font-medium">Estimated Cost</p>
              <p className="text-3xl font-extrabold text-gray-900">{formatCurrency(totalEstimated)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 font-medium">Total Budget</p>
              <p className="text-lg font-bold text-gray-700">{formatCurrency(totalBudget)}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden mb-2">
            <div 
              className={`h-full ${progressColor} transition-all duration-1000 ease-out`}
              style={{ width: `${percentageUsed}%` }}
            />
          </div>
          
          <p className={`text-sm font-medium ${remaining < 0 ? 'text-red-500' : 'text-gray-500'}`}>
            {remaining < 0 
              ? `Over budget by ${formatCurrency(Math.abs(remaining))}` 
              : `${formatCurrency(remaining)} remaining`}
          </p>
        </div>

        {/* AI Budget Tools */}
        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
          <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
            <svg className="w-4 h-4 mr-1 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            AI Optimizer
          </h4>
          
          <div className="space-y-3">
            {status === 'over' && (
              <button
                onClick={handleOptimizeCheaper}
                className="w-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors text-sm font-medium py-2 px-3 rounded-lg flex items-center justify-center shadow-sm"
              >
                Find Cheaper Alternatives
              </button>
            )}

            <div className="flex gap-2">
              <input
                type="number"
                placeholder="New Budget..."
                value={newBudgetSim}
                onChange={(e) => setNewBudgetSim(e.target.value)}
                className="flex-1 min-w-0 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
              />
              <button
                onClick={handleSimulateBudget}
                disabled={!newBudgetSim}
                className="bg-primary text-white px-3 py-2 text-sm font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors shrink-0 shadow-sm"
              >
                Simulate
              </button>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wider">Breakdown</h4>
          <div className="space-y-3">
            {Object.entries(breakdown || {}).map(([category, amount]) => {
              if (amount === 0) return null;
              
              // Calculate percentage for this category
              const catPct = totalEstimated > 0 ? (amount / totalEstimated) * 100 : 0;
              
              return (
                <div key={category} className="flex flex-col">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700 capitalize">{category.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className="text-sm font-bold text-gray-900">{formatCurrency(amount)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-400 rounded-full" style={{ width: `${catPct}%` }} />
                    </div>
                    <span className="text-xs text-gray-400 w-8 text-right">{Math.round(catPct)}%</span>
                  </div>
                </div>
              );
            })}
            {totalEstimated === 0 && (
              <p className="text-center text-sm text-gray-400 py-4">Generate an itinerary to see the cost breakdown.</p>
            )}
          </div>
        </div>
        
        {trip.optimizationMetadata?.optimizationNotes && (
          <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
            <p className="text-xs text-blue-800 font-medium mb-1">AI Budget Notes:</p>
            <ul className="text-xs text-blue-600 space-y-1 list-disc list-inside">
              {trip.optimizationMetadata.optimizationNotes.map((note, i) => (
                <li key={i}>{note}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetPanel;
