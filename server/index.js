const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const Flight = require('./models/Flight');
const Booking = require('./models/Booking');

const app = express();
const PORT = process.env.PORT || 3001;

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {

})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());

// Initialize sample flights if database is empty
async function initializeFlights() {
  try {
    const count = await Flight.countDocuments();
    if (count === 0) {
      const sampleFlights = [
        {
          flightNumber: 'AI101',
          airline: 'Air India',
          departure: { city: 'Mumbai', airport: 'BOM', time: '10:00 AM', date: '2024-01-15' },
          arrival: { city: 'Delhi', airport: 'DEL', time: '12:00 PM', date: '2024-01-15' },
          price: 5000,
          duration: '2h',
          seats: { economy: 120, business: 30, first: 10 },
          aircraft: 'Boeing 787',
          status: 'On Time'
        },
        {
          flightNumber: '6E202',
          airline: 'IndiGo',
          departure: { city: 'Delhi', airport: 'DEL', time: '2:00 PM', date: '2024-01-15' },
          arrival: { city: 'Bangalore', airport: 'BLR', time: '4:30 PM', date: '2024-01-15' },
          price: 4500,
          duration: '2h 30m',
          seats: { economy: 150, business: 20, first: 8 },
          aircraft: 'Airbus A320',
          status: 'On Time'
        },
        {
          flightNumber: 'SG303',
          airline: 'SpiceJet',
          departure: { city: 'Chennai', airport: 'MAA', time: '8:00 AM', date: '2024-01-15' },
          arrival: { city: 'Kolkata', airport: 'CCU', time: '10:15 AM', date: '2024-01-15' },
          price: 3800,
          duration: '2h 15m',
          seats: { economy: 100, business: 15, first: 5 },
          aircraft: 'Boeing 737',
          status: 'Delayed'
        },
        {
          flightNumber: 'UK404',
          airline: 'Vistara',
          departure: { city: 'Hyderabad', airport: 'HYD', time: '11:30 AM', date: '2024-01-15' },
          arrival: { city: 'Pune', airport: 'PNQ', time: '12:45 PM', date: '2024-01-15' },
          price: 3200,
          duration: '1h 15m',
          seats: { economy: 80, business: 12, first: 6 },
          aircraft: 'Airbus A320',
          status: 'On Time'
        }
      ];
      
      await Flight.insertMany(sampleFlights);
      console.log('Sample flights initialized in database');
    }
  } catch (error) {
    console.error('Error initializing flights:', error);
    process.exit(1);
  }
}

// Initialize flights when server starts
initializeFlights();

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Flight Booking API is running with MongoDB!', database: 'Connected' });
});

app.get('/api/flights', async (req, res) => {
  try {
    const { from, to, date, passengers = 1 } = req.query;
    
    let query = {};
    const conditions = [];

    if (from) {
      conditions.push({
        '$or': [
          { 'departure.city': { $regex: from, $options: 'i' } },
          { 'departure.airport': { $regex: from, $options: 'i' } }
        ]
      });
    }
    
    if (to) {
      conditions.push({
        '$or': [
          { 'arrival.city': { $regex: to, $options: 'i' } },
          { 'arrival.airport': { $regex: to, $options: 'i' } }
        ]
      });
    }
    
    if (date) {
      conditions.push({ 'departure.date': date });
    }

    if (conditions.length > 0) {
      query = { '$and': conditions };
    }
    
    const flights = await Flight.find(query);
    
    res.json({ 
      flights,
      total: flights.length,
      filters: { from, to, date, passengers }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching flights', details: error.message });
  }
});

app.get('/api/flights/:id', async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);
    if (!flight) {
      return res.status(404).json({ error: 'Flight not found' });
    }
    res.json({ flight });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching flight', details: error.message });
  }
});

app.get('/api/airlines', async (req, res) => {
  try {
    const airlines = await Flight.distinct('airline');
    res.json({ airlines });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching airlines', details: error.message });
  }
});

app.get('/api/cities', async (req, res) => {
  try {
    const departureCities = await Flight.distinct('departure.city');
    const arrivalCities = await Flight.distinct('arrival.city');
    const cities = [...new Set([...departureCities, ...arrivalCities])];
    res.json({ cities });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching cities', details: error.message });
  }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const { flightId, passengers, userDetails } = req.body;
    
    if (!flightId || !passengers || !userDetails) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const flight = await Flight.findById(flightId);
    if (!flight) {
      return res.status(404).json({ error: 'Flight not found' });
    }
    
    const totalAmount = flight.price * passengers.length;
    
    const booking = new Booking({
      flightId,
      passengers,
      userDetails,
      totalAmount
    });
    
    await booking.save();
    
    res.status(201).json({ 
      message: 'Booking confirmed!',
      booking,
      bookingReference: booking.bookingReference
    });
  } catch (error) {
    res.status(500).json({ error: 'Error creating booking', details: error.message });
  }
});

// Get all bookings
app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find().populate('flightId');
    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching bookings', details: error.message });
  }
});


app.get('/api/seed/flights', async (req, res) => {
  try {
    const extraFlights = [
      {
        flightNumber: 'AI205', airline: 'Air India',
        departure: { city: 'Delhi', airport: 'DEL', time: '06:30 AM', date: '2024-01-16' },
        arrival:   { city: 'Mumbai', airport: 'BOM', time: '08:40 AM', date: '2024-01-16' },
        price: 5200, duration: '2h 10m', seats: { economy: 140, business: 20, first: 6 },
        aircraft: 'Airbus A321', status: 'On Time'
      },
      {
        flightNumber: '6E415', airline: 'IndiGo',
        departure: { city: 'Bangalore', airport: 'BLR', time: '09:15 AM', date: '2024-01-16' },
        arrival:   { city: 'Hyderabad', airport: 'HYD', time: '10:25 AM', date: '2024-01-16' },
        price: 3100, duration: '1h 10m', seats: { economy: 160, business: 0, first: 0 },
        aircraft: 'Airbus A320', status: 'On Time'
      },
      {
        flightNumber: 'UK709', airline: 'Vistara',
        departure: { city: 'Pune', airport: 'PNQ', time: '01:40 PM', date: '2024-01-16' },
        arrival:   { city: 'Delhi', airport: 'DEL', time: '03:50 PM', date: '2024-01-16' },
        price: 5400, duration: '2h 10m', seats: { economy: 110, business: 16, first: 4 },
        aircraft: 'Boeing 737', status: 'On Time'
      },
      {
        flightNumber: 'SG812', airline: 'SpiceJet',
        departure: { city: 'Kolkata', airport: 'CCU', time: '07:20 PM', date: '2024-01-16' },
        arrival:   { city: 'Chennai', airport: 'MAA', time: '09:35 PM', date: '2024-01-16' },
        price: 3950, duration: '2h 15m', seats: { economy: 120, business: 12, first: 0 },
        aircraft: 'Boeing 737', status: 'Delayed'
      },
      {
        flightNumber: 'G8401', airline: 'Go First',
        departure: { city: 'Ahmedabad', airport: 'AMD', time: '10:10 AM', date: '2024-01-16' },
        arrival:   { city: 'Mumbai', airport: 'BOM', time: '11:15 AM', date: '2024-01-16' },
        price: 2600, duration: '1h 05m', seats: { economy: 170, business: 0, first: 0 },
        aircraft: 'Airbus A320', status: 'On Time'
      },
      {
        flightNumber: 'QF302', airline: 'Akasa Air',
        departure: { city: 'Delhi', airport: 'DEL', time: '05:45 AM', date: '2024-01-17' },
        arrival:   { city: 'Bangalore', airport: 'BLR', time: '08:15 AM', date: '2024-01-17' },
        price: 4800, duration: '2h 30m', seats: { economy: 180, business: 0, first: 0 },
        aircraft: 'Boeing 737 MAX', status: 'On Time'
      },
      {
        flightNumber: 'AI560', airline: 'Air India',
        departure: { city: 'Hyderabad', airport: 'HYD', time: '08:00 PM', date: '2024-01-17' },
        arrival:   { city: 'Mumbai', airport: 'BOM', time: '09:20 PM', date: '2024-01-17' },
        price: 3500, duration: '1h 20m', seats: { economy: 150, business: 20, first: 6 },
        aircraft: 'Airbus A320', status: 'On Time'
      },
      {
        flightNumber: 'UK223', airline: 'Vistara',
        departure: { city: 'Chandigarh', airport: 'IXC', time: '11:30 AM', date: '2024-01-17' },
        arrival:   { city: 'Delhi', airport: 'DEL', time: '12:25 PM', date: '2024-01-17' },
        price: 2200, duration: '55m', seats: { economy: 100, business: 12, first: 0 },
        aircraft: 'Airbus A320', status: 'On Time'
      },
      {
        flightNumber: '6E990', airline: 'IndiGo',
        departure: { city: 'Goa', airport: 'GOI', time: '03:10 PM', date: '2024-01-17' },
        arrival:   { city: 'Pune', airport: 'PNQ', time: '04:25 PM', date: '2024-01-17' },
        price: 2800, duration: '1h 15m', seats: { economy: 170, business: 0, first: 0 },
        aircraft: 'Airbus A320', status: 'On Time'
      },
      {
        flightNumber: 'SG555', airline: 'SpiceJet',
        departure: { city: 'Jaipur', airport: 'JAI', time: '07:45 AM', date: '2024-01-18' },
        arrival:   { city: 'Delhi', airport: 'DEL', time: '08:45 AM', date: '2024-01-18' },
        price: 2100, duration: '1h', seats: { economy: 120, business: 8, first: 0 },
        aircraft: 'Boeing 737', status: 'On Time'
      }
    ];

    let upserts = 0;
    for (const f of extraFlights) {
      const r = await Flight.updateOne(
        { flightNumber: f.flightNumber },
        { $set: f },
        { upsert: true }
      );
      if (r.upsertedCount || r.modifiedCount) upserts += 1;
    }

    const total = await Flight.countDocuments();
    res.json({ message: 'Extra flights seeded', updated: upserts, total });
  } catch (error) {
    res.status(500).json({ error: 'Error seeding flights', details: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Flights API: http://localhost:${PORT}/api/flights`);
  console.log(`Airlines: http://localhost:${PORT}/api/airlines`);
  console.log(`Cities: http://localhost:${PORT}/api/cities`);
  console.log(`Bookings API: http://localhost:${PORT}/api/bookings`);
  console.log(`Database: MongoDB`);
});
