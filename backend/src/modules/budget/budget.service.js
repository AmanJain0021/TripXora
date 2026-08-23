const Trip = require('../trip/trip.model');

/**
 * Recalculates the budget based on the current itinerary and accommodation
 * @param {Object} trip - The Mongoose trip document
 * @returns {Object} The updated budget object
 */
const recalculateBudget = (trip) => {
  let transport = 0;
  let accommodation = 0;
  let food = 0;
  let activities = 0;
  let localTransport = 0;
  let miscellaneous = 0;

  // 1. Calculate costs from Itinerary
  if (trip.itinerary && trip.itinerary.length > 0) {
    trip.itinerary.forEach(day => {
      day.items.forEach(item => {
        const cost = Number(item.cost) || 0;
        
        switch (item.type) {
          case 'meal':
            food += cost;
            break;
          case 'attraction':
            activities += cost;
            break;
          case 'travel':
            // Assume intercity travel goes to transport, intracity to localTransport
            if (cost > 1000) { // arbitrary threshold for now, or just dump to transport
              transport += cost;
            } else {
              localTransport += cost;
            }
            break;
          case 'hotel':
            accommodation += cost;
            break;
          default:
            miscellaneous += cost;
        }
      });
    });
  }

  // 2. Add accommodation costs if explicitly defined outside itinerary
  if (trip.accommodation && trip.accommodation.length > 0) {
    trip.accommodation.forEach(hotel => {
      accommodation += (Number(hotel.estimatedCost) || 0);
    });
  }

  // 3. Add base travel cost (e.g. flight/train to destination if not in itinerary)
  // We can add a rough estimate based on distance in the future, for now rely on user/itinerary.

  const totalEstimated = transport + accommodation + food + activities + localTransport + miscellaneous;
  const perPerson = trip.travelers > 0 ? totalEstimated / trip.travelers : totalEstimated;
  
  const totalBudget = trip.budget?.totalBudget || 0;
  const remaining = totalBudget > 0 ? totalBudget - totalEstimated : 0;
  
  let status = 'pending';
  if (totalBudget > 0) {
    if (remaining < 0) {
      status = 'over';
    } else if (remaining < totalBudget * 0.1) {
      status = 'optimized'; // tight budget
    } else {
      status = 'within';
    }
  }

  return {
    totalBudget,
    currency: trip.budget?.currency || 'INR',
    breakdown: {
      transport,
      accommodation,
      food,
      activities,
      localTransport,
      miscellaneous
    },
    totalEstimated,
    perPerson,
    remaining,
    status
  };
};

module.exports = {
  recalculateBudget
};
