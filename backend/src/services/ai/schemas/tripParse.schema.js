const { Type } = require('../geminiProvider');

const tripParseSchema = {
  type: Type.OBJECT,
  properties: {
    origin: {
      type: Type.STRING,
      description: "The starting city or location of the trip"
    },
    destination: {
      type: Type.STRING,
      description: "The main destination city or location of the trip"
    },
    startDate: {
      type: Type.STRING,
      description: "The start date of the trip in YYYY-MM-DD format, or null if unknown"
    },
    endDate: {
      type: Type.STRING,
      description: "The end date of the trip in YYYY-MM-DD format, or null if unknown"
    },
    durationDays: {
      type: Type.INTEGER,
      description: "The duration of the trip in days, if specified"
    },
    travelers: {
      type: Type.INTEGER,
      description: "The number of travelers. Default to 1 if unknown."
    },
    budget: {
      type: Type.INTEGER,
      description: "The total budget constraint in numbers. E.g. for '20k', extract 20000. Use null if unknown."
    },
    travelMode: {
      type: Type.STRING,
      description: "The mode of transportation. Must be one of: 'car', 'bike', 'bus', 'train', 'flight'. Default to 'car'."
    },
    interests: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING
      },
      description: "A list of interests or themes the user mentioned, e.g. ['historical', 'food', 'nature']"
    }
  },
  required: ["origin", "destination", "travelers", "travelMode"]
};

module.exports = tripParseSchema;
