const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
  flightNumber: {
    type: String,
    required: true,
    unique: true
  },
  airline: {
    type: String,
    required: true
  },
  departure: {
    city: { type: String, required: true },
    airport: { type: String, required: true },
    time: { type: String, required: true },
    date: { type: String, required: true }
  },
  arrival: {
    city: { type: String, required: true },
    airport: { type: String, required: true },
    time: { type: String, required: true },
    date: { type: String, required: true }
  },
  price: {
    type: Number,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  seats: {
    economy: { type: Number, default: 0 },
    business: { type: Number, default: 0 },
    first: { type: Number, default: 0 }
  },
  aircraft: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['On Time', 'Delayed', 'Cancelled'],
    default: 'On Time'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Flight', flightSchema);
