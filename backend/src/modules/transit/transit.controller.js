const searchTrains = async (req, res) => {
  try {
    const { origin, destination, date } = req.query;
    const apiKey = process.env.TRAIN_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ success: false, message: 'Train API key is not configured.' });
    }

    if (!origin || !destination || !date) {
      return res.status(400).json({ success: false, message: 'Origin, destination, and date are required.' });
    }

    // Mock response for the UI. Replace this with the actual API call (e.g. axios.get) once provider is known.
    // Example: await axios.get(`https://api.some-train-provider.com/v1/search?origin=${origin}&destination=${destination}&date=${date}`, { headers: { 'Authorization': `Bearer ${apiKey}` } })
    
    setTimeout(() => {
      res.status(200).json({
        success: true,
        data: {
          origin,
          destination,
          date,
          trains: [
            {
              trainNo: "12963",
              trainName: "MEWAR EXPRESS",
              departureTime: "18:30",
              arrivalTime: "07:15",
              duration: "12h 45m",
              classes: [
                { type: "1A", price: 2450, available: true },
                { type: "2A", price: 1450, available: true },
                { type: "3A", price: 1050, available: false },
                { type: "SL", price: 450, available: true }
              ]
            },
            {
              trainNo: "12991",
              trainName: "UDZ INTERCITY",
              departureTime: "06:00",
              arrivalTime: "13:30",
              duration: "07h 30m",
              classes: [
                { type: "CC", price: 750, available: true },
                { type: "2S", price: 200, available: true }
              ]
            },
            {
              trainNo: "19665",
              trainName: "KURJ UDZ EXP",
              departureTime: "22:15",
              arrivalTime: "11:45",
              duration: "13h 30m",
              classes: [
                { type: "2A", price: 1350, available: true },
                { type: "3A", price: 950, available: true },
                { type: "SL", price: 380, available: true }
              ]
            }
          ]
        }
      });
    }, 1200); // Simulate network delay

  } catch (error) {
    console.error('Error fetching trains:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch train details', error: error.message });
  }
};

module.exports = {
  searchTrains
};
