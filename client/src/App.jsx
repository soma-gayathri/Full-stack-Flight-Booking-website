import { useState, useEffect } from 'react'
import FlightSearch from './components/FlightSearch'
import FlightList from './components/FlightList'
import BookingForm from './components/BookingForm'
import Header from './components/Header'
import './App.css'

function App() {
  const [flights, setFlights] = useState([])
  const [filteredFlights, setFilteredFlights] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useState({})
  const [selectedFlight, setSelectedFlight] = useState(null)
  const [showBookingForm, setShowBookingForm] = useState(false)

  useEffect(() => {
    fetchFlights()
  }, [])

  const fetchFlights = async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const response = await fetch(`/api/flights?${queryString}`)
      const data = await response.json()
      setFlights(data.flights)
      setFilteredFlights(data.flights)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching flights:', error)
      setLoading(false)
    }
  }

  const handleSearch = (params) => {
    setSearchParams(params)
    fetchFlights(params)
  }

  const handleFlightSelect = (flight) => {
    setSelectedFlight(flight)
    setShowBookingForm(true)
  }

  const handleBookingComplete = () => {
    setShowBookingForm(false)
    setSelectedFlight(null)
    // Refresh flights after booking
    fetchFlights(searchParams)
  }

  if (loading) {
    return <div className="loading">Loading flights...</div>
  }

  return (
    <div className="app">
      <Header />
      
      <main className="main-content">
        {!showBookingForm ? (
          <>
            <FlightSearch onSearch={handleSearch} />
            <FlightList 
              flights={filteredFlights} 
              onFlightSelect={handleFlightSelect}
            />
          </>
        ) : (
          <BookingForm 
            flight={selectedFlight}
            onComplete={handleBookingComplete}
            onBack={() => setShowBookingForm(false)}
          />
        )}
      </main>
    </div>
  )
}

export default App
