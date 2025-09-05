import { useState } from 'react'

function BookingForm({ flight, onComplete, onBack }) {
  const [bookingData, setBookingData] = useState({
    passengers: [{ firstName: '', lastName: '', passport: '', seatClass: 'economy' }],
    userDetails: {
      email: '',
      phone: '',
      address: ''
    }
  })

  const [currentStep, setCurrentStep] = useState(1)

  const addPassenger = () => {
    if (bookingData.passengers.length < 9) {
      setBookingData({
        ...bookingData,
        passengers: [...bookingData.passengers, { firstName: '', lastName: '', passport: '', seatClass: 'economy' }]
      })
    }
  }

  const removePassenger = (index) => {
    if (bookingData.passengers.length > 1) {
      const newPassengers = bookingData.passengers.filter((_, i) => i !== index)
      setBookingData({ ...bookingData, passengers: newPassengers })
    }
  }

  const updatePassenger = (index, field, value) => {
    const newPassengers = [...bookingData.passengers]
    newPassengers[index][field] = value
    setBookingData({ ...bookingData, passengers: newPassengers })
  }

  const updateUserDetails = (field, value) => {
    setBookingData({
      ...bookingData,
      userDetails: { ...bookingData.userDetails, [field]: value }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flightId: flight.id,
          passengers: bookingData.passengers,
          userDetails: bookingData.userDetails
        })
      })
      
      const result = await response.json()
      
      if (response.ok) {
        alert(`🎉 Booking confirmed! Your reference: ${result.bookingReference}`)
        onComplete()
      } else {
        alert('Error: ' + result.error)
      }
    } catch (error) {
      alert('Error creating booking')
    }
  }

  const totalAmount = flight.price * bookingData.passengers.length

  return (
    <div className="booking-section">
      <div className="booking-container">
        <div className="booking-header">
          <button onClick={onBack} className="back-btn">← Back to Flights</button>
          <h2>Complete Your Booking</h2>
        </div>

        <div className="flight-summary">
          <h3>{flight.airline} - {flight.flightNumber}</h3>
          <div className="route-summary">
            <span>{flight.departure.city} → {flight.arrival.city}</span>
            <span>{flight.departure.date} • {flight.duration}</span>
          </div>
          <div className="price-summary">
            <strong>Total: ₹{totalAmount.toLocaleString()}</strong>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-section">
            <h3>Passenger Details ({bookingData.passengers.length})</h3>
            {bookingData.passengers.map((passenger, index) => (
              <div key={index} className="passenger-form">
                <div className="passenger-header">
                  <h4>Passenger {index + 1}</h4>
                  {index > 0 && (
                    <button 
                      type="button" 
                      onClick={() => removePassenger(index)}
                      className="remove-passenger"
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="First Name"
                    value={passenger.firstName}
                    onChange={(e) => updatePassenger(index, 'firstName', e.target.value)}
                    required
                    className="form-input"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={passenger.lastName}
                    onChange={(e) => updatePassenger(index, 'lastName', e.target.value)}
                    required
                    className="form-input"
                  />
                </div>
                
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Passport Number"
                    value={passenger.passport}
                    onChange={(e) => updatePassenger(index, 'passport', e.target.value)}
                    required
                    className="form-input"
                  />
                  <select
                    value={passenger.seatClass}
                    onChange={(e) => updatePassenger(index, 'seatClass', e.target.value)}
                    className="form-input"
                  >
                    <option value="economy">Economy Class</option>
                    <option value="business">Business Class</option>
                    <option value="first">First Class</option>
                  </select>
                </div>
              </div>
            ))}
            
            {bookingData.passengers.length < 9 && (
              <button type="button" onClick={addPassenger} className="add-passenger-btn">
                + Add Passenger
              </button>
            )}
          </div>

          <div className="form-section">
            <h3>Contact Information</h3>
            <div className="form-row">
              <input
                type="email"
                placeholder="Email Address"
                value={bookingData.userDetails.email}
                onChange={(e) => updateUserDetails('email', e.target.value)}
                required
                className="form-input"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={bookingData.userDetails.phone}
                onChange={(e) => updateUserDetails('phone', e.target.value)}
                required
                className="form-input"
              />
            </div>
            <textarea
              placeholder="Delivery Address"
              value={bookingData.userDetails.address}
              onChange={(e) => updateUserDetails('address', e.target.value)}
              required
              className="form-input"
              rows="3"
            />
          </div>

          <div className="booking-summary">
            <h3>Booking Summary</h3>
            <div className="summary-row">
              <span>Flight:</span>
              <span>{flight.airline} {flight.flightNumber}</span>
            </div>
            <div className="summary-row">
              <span>Route:</span>
              <span>{flight.departure.city} → {flight.arrival.city}</span>
            </div>
            <div className="summary-row">
              <span>Passengers:</span>
              <span>{bookingData.passengers.length}</span>
            </div>
            <div className="summary-row total">
              <span>Total Amount:</span>
              <span>₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <button type="submit" className="confirm-booking-btn">
            🎫 Confirm Booking
          </button>
        </form>
      </div>
    </div>
  )
}

export default BookingForm
