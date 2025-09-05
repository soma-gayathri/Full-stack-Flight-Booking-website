const mongoose = require('mongoose');

const passengerSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  passport: { type: String, required: true },
  seatClass: { 
    type: String, 
    enum: ['economy', 'business', 'first'], 
    default: 'economy' 
  }
});

const paymentSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending'
  },
  provider: {
    type: String,
    enum: ['mock', 'razorpay', 'stripe'],
    default: 'mock'
  },
  reference: { type: String },
  amount: { type: Number }
}, { _id: false });

const bookingSchema = new mongoose.Schema({
  flightId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flight',
    required: true
  },
  passengers: [passengerSchema],
  userDetails: {
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true }
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Confirmed', 'Cancelled', 'Completed'],
    default: 'Confirmed'
  },
  bookingReference: {
    type: String,
    unique: true,
    required: true
  },
  payment: paymentSchema
}, {
  timestamps: true
});

// Generate unique booking reference
bookingSchema.pre('save', function(next) {
  if (!this.bookingReference) {
    this.bookingReference = 'BK' + Math.random().toString(36).substr(2, 8).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
