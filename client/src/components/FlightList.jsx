import React from 'react'

function FlightList({ flights, onFlightSelect }) {
  if (flights.length === 0) {
    return (
      <div className="no-flights">
        <h3>No flights found</h3>
        <p>Try adjusting your search criteria</p>
      </div>
    )
  }

  return (
    <div className="flights-section">
      <div className="flights-header">
        <h2>Available Flights ({flights.length})</h2>
      </div>
      
      <div className="flights-grid">
        {flights.map(flight => (
          <div key={flight.id} className="flight-card">
            <div className="flight-header">
              <div className="airline-info">
                <h3>{flight.airline}</h3>
                <span className="flight-number">{flight.flightNumber}</span>
              </div>
              <div className="flight-status">
                <span className={`status-badge ${flight.status.toLowerCase().replace(' ', '-')}`}>
                  {flight.status}
                </span>
              </div>
            </div>
            
            <div className="flight-route">
              <div className="departure">
                <strong>{flight.departure.city}</strong>
                <span className="airport-code">{flight.departure.airport}</span>
                <span className="time">{flight.departure.time}</span>
                <span className="date">{flight.departure.date}</span>
              </div>
              
              <div className="flight-details">
                <div className="flight-arrow">✈️</div>
                <div className="duration">{flight.duration}</div>
                <div className="aircraft">{flight.aircraft}</div>
              </div>
              
              <div className="arrival">
                <strong>{flight.arrival.city}</strong>
                <span className="airport-code">{flight.arrival.airport}</span>
                <span className="time">{flight.arrival.time}</span>
                <span className="date">{flight.arrival.date}</span>
              </div>
            </div>
            
            <div className="flight-footer">
              <div className="seats-info">
                <span>Economy: {flight.seats.economy}</span>
                <span>Business: {flight.seats.business}</span>
                <span>First: {flight.seats.first}</span>
              </div>
              
              <div className="price-section">
                <span className="price">₹{flight.price.toLocaleString()}</span>
                <button 
                  className="book-btn"
                  onClick={() => onFlightSelect(flight)}
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FlightList
