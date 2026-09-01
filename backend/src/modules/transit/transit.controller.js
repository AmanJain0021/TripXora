const axios = require('axios');

const cityIataMap = {
  'delhi': 'DEL', 'new delhi': 'DEL',
  'mumbai': 'BOM', 'bombay': 'BOM',
  'bengaluru': 'BLR', 'bangalore': 'BLR',
  'goa': 'GOI',
  'kolkata': 'CCU', 'calcutta': 'CCU',
  'chennai': 'MAA',
  'hyderabad': 'HYD',
  'jaipur': 'JAI',
  'ahmedabad': 'AMD',
  'indore': 'IDR', 'dhar': 'IDR', 'pithampur': 'IDR',
  'udaipur': 'UDR',
  'pune': 'PNQ',
  'kochi': 'COK', 'cochin': 'COK'
};

const getIataCode = (cityName) => {
  if (!cityName) return null;
  const clean = cityName.trim().toLowerCase();
  if (cityIataMap[clean]) return cityIataMap[clean];
  if (clean.length === 3) return clean.toUpperCase();
  return null;
};

const searchTrains = async (req, res) => {
  try {
    const { origin, destination, date } = req.query;

    if (!origin || !destination || !date) {
      return res.status(400).json({ success: false, message: 'Origin, destination, and date are required.' });
    }

    // Mock train response matching Indian railway schedule
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
    }, 600);

  } catch (error) {
    console.error('Error fetching trains:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch train details', error: error.message });
  }
};

const searchFlights = async (req, res) => {
  try {
    const { origin, destination, date, cabinClass } = req.query;

    if (!origin || !destination || !date) {
      return res.status(400).json({ success: false, message: 'Origin, destination, and date are required.' });
    }

    const apiKey = process.env.FLIGHT_API_KEY;
    const depIata = getIataCode(origin);
    const arrIata = getIataCode(destination);

    if (apiKey) {
      try {
        let apiUrl = `http://api.aviationstack.com/v1/flights?access_key=${apiKey}&limit=6`;
        if (depIata) apiUrl += `&dep_iata=${depIata}`;
        if (arrIata) apiUrl += `&arr_iata=${arrIata}`;

        const response = await axios.get(apiUrl, { timeout: 4000 });

        if (response.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
          const liveFlights = response.data.data.map((item, idx) => {
            const depTimeRaw = item.departure?.scheduled || item.departure?.estimated;
            const arrTimeRaw = item.arrival?.scheduled || item.arrival?.estimated;

            const formatTime = (isoStr) => {
              if (!isoStr) return "10:00";
              const d = new Date(isoStr);
              return isNaN(d.getTime()) ? "10:00" : d.toTimeString().substring(0, 5);
            };

            const flightNumber = item.flight?.iata || item.flight?.number || `FL-${100 + idx}`;
            const airlineName = item.airline?.name || "Domestic Airline";
            const airlineCode = item.airline?.iata || "6E";

            return {
              flightNo: flightNumber,
              airline: airlineName,
              code: airlineCode,
              departureTime: formatTime(depTimeRaw),
              arrivalTime: formatTime(arrTimeRaw),
              duration: "02h 15m",
              stops: item.flight_status === "active" ? "In-Air" : "Non-stop",
              classes: [
                { type: "Economy", price: 3800 + (idx * 450), available: true, seatsLeft: 5 + (idx % 4) },
                { type: "Business", price: 12500 + (idx * 1200), available: true, seatsLeft: 2 }
              ]
            };
          });

          return res.status(200).json({
            success: true,
            data: {
              origin,
              destination,
              date,
              flights: liveFlights
            }
          });
        }
      } catch (apiErr) {
        console.warn('AviationStack API call failed or timed out, using fallback flight schedules:', apiErr.message);
      }
    }

    // Fallback flight data
    setTimeout(() => {
      res.status(200).json({
        success: true,
        data: {
          origin,
          destination,
          date,
          flights: [
            {
              flightNo: "6E-204",
              airline: "IndiGo",
              code: "6E",
              departureTime: "07:15",
              arrivalTime: "09:30",
              duration: "02h 15m",
              stops: "Non-stop",
              classes: [
                { type: "Economy", price: 4250, available: true, seatsLeft: 7 },
                { type: "Flexi Plus", price: 5400, available: true, seatsLeft: 4 }
              ]
            },
            {
              flightNo: "AI-802",
              airline: "Air India",
              code: "AI",
              departureTime: "11:45",
              arrivalTime: "14:05",
              duration: "02h 20m",
              stops: "Non-stop",
              classes: [
                { type: "Economy", price: 4890, available: true, seatsLeft: 12 },
                { type: "Premium Eco", price: 7900, available: true, seatsLeft: 3 },
                { type: "Business", price: 16500, available: true, seatsLeft: 2 }
              ]
            },
            {
              flightNo: "UK-955",
              airline: "Vistara",
              code: "UK",
              departureTime: "16:20",
              arrivalTime: "18:40",
              duration: "02h 20m",
              stops: "Non-stop",
              classes: [
                { type: "Economy", price: 5100, available: true, seatsLeft: 5 },
                { type: "Premium Eco", price: 8200, available: true, seatsLeft: 2 },
                { type: "Business", price: 18200, available: true, seatsLeft: 1 }
              ]
            },
            {
              flightNo: "QP-1102",
              airline: "Akasa Air",
              code: "QP",
              departureTime: "20:10",
              arrivalTime: "22:25",
              duration: "02h 15m",
              stops: "Non-stop",
              classes: [
                { type: "Saver", price: 3950, available: true, seatsLeft: 8 },
                { type: "Flexi", price: 4700, available: true, seatsLeft: 5 }
              ]
            }
          ]
        }
      });
    }, 500);

  } catch (error) {
    console.error('Error fetching flights:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch flight details', error: error.message });
  }
};

module.exports = {
  searchTrains,
  searchFlights
};


