import { useState } from 'react'

function FlightSearch({ onSearch }) {
  const [searchData, setSearchData] = useState({
    from: '',
    to: '',
    date: '',
    passengers: 1
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch(searchData)
  }

  const handleChange = (e) => {
    setSearchData({
      ...searchData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="search-section">
      <div className="search-container">
        <h2>Find Your Perfect Flight</h2>
        <form onSubmit={handleSubmit} className="search-form">
          <div className="form-row">
            <div className="form-group">
              <label>From</label>
              <input
                type="text"
                name="from"
                value={searchData.from}
                onChange={handleChange}
                placeholder="City or Airport"
                className="search-input"
              />
            </div>
            
            <div className="form-group">
              <label>To</label>
              <input
                type="text"
                name="to"
                value={searchData.to}
                onChange={handleChange}
                placeholder="City or Airport"
                className="search-input"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                name="date"
                value={searchData.date}
                onChange={handleChange}
                className="search-input"
              />
            </div>
            
            <div className="form-group">
              <label>Passengers</label>
              <select
                name="passengers"
                value={searchData.passengers}
                onChange={handleChange}
                className="search-input"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
          </div>
          
          <button type="submit" className="search-btn">
            🔍 Search Flights
          </button>
        </form>
      </div>
    </div>
  )
}

export default FlightSearch
