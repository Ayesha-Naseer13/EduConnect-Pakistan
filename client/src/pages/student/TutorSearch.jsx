"use client"

import { useState, useEffect } from "react"
import api from "../../utils/api"
import TutorCard from "../../components/student/TutorCard"
import Loading from "../../components/common/Loading"
import "../../styles/TutorSearch.css"

const TutorSearch = () => {
  const [tutors, setTutors] = useState([])
  const [filteredTutors, setFilteredTutors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [filters, setFilters] = useState({
    subject: "",
    location: "",
    minPrice: "",
    maxPrice: "",
    minRating: 0,
    availability: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    },
    isOnline: false,
  })

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        setLoading(true)
        const response = await api.get("/tutors")
        setTutors(response.data)
        setFilteredTutors(response.data)
      } catch (err) {
        setError("Failed to fetch tutors. Please try again later.")
        console.error("Error fetching tutors:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchTutors()
  }, [])

  useEffect(() => {
    // Apply filters whenever filters state changes
    applyFilters()
  }, [filters, tutors])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFilters({
      ...filters,
      [name]: value,
    })
  }

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target

    if (name === "isOnline") {
      setFilters({
        ...filters,
        isOnline: checked,
      })
    } else {
      setFilters({
        ...filters,
        availability: {
          ...filters.availability,
          [name]: checked,
        },
      })
    }
  }

  const handleRatingChange = (value) => {
    setFilters({
      ...filters,
      minRating: value,
    })
  }

  const applyFilters = () => {
    let result = [...tutors]

    // Filter by subject
    if (filters.subject) {
      result = result.filter((tutor) =>
        tutor.subjects.some((subject) => subject.toLowerCase().includes(filters.subject.toLowerCase())),
      )
    }

    // Filter by location
    if (filters.location) {
      result = result.filter(
        (tutor) =>
          tutor.location.toLowerCase().includes(filters.location.toLowerCase()) ||
          (filters.location.toLowerCase() === "online" && tutor.isOnline),
      )
    }

    // Filter by price range
    if (filters.minPrice) {
      result = result.filter((tutor) => tutor.hourlyRate >= Number.parseInt(filters.minPrice))
    }

    if (filters.maxPrice) {
      result = result.filter((tutor) => tutor.hourlyRate <= Number.parseInt(filters.maxPrice))
    }

    // Filter by rating
    if (filters.minRating > 0) {
      result = result.filter((tutor) => tutor.rating >= filters.minRating)
    }

    // Filter by availability
    const selectedDays = Object.entries(filters.availability)
      .filter(([_, isSelected]) => isSelected)
      .map(([day]) => day)

    if (selectedDays.length > 0) {
      result = result.filter((tutor) => selectedDays.some((day) => tutor.availability && tutor.availability[day]))
    }

    // Filter by online availability
    if (filters.isOnline) {
      result = result.filter((tutor) => tutor.isOnline)
    }

    setFilteredTutors(result)
  }

  const resetFilters = () => {
    setFilters({
      subject: "",
      location: "",
      minPrice: "",
      maxPrice: "",
      minRating: 0,
      availability: {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
      },
      isOnline: false,
    })
  }

  if (loading) return <Loading />

  return (
    <div className="tutor-search-container">
      <div className="search-header">
        <h1>Find Your Perfect Tutor</h1>
        <p>Browse through our qualified tutors and find the right match for your learning needs</p>
      </div>

      <div className="search-content">
        <div className="filter-sidebar">
          <div className="filter-section">
            <h3>Filters</h3>
            <button className="reset-filters-btn" onClick={resetFilters}>
              Reset Filters
            </button>
          </div>

          <div className="filter-section">
            <label htmlFor="subject">Subject/Topic</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={filters.subject}
              onChange={handleInputChange}
              placeholder="e.g. Mathematics, Physics"
            />
          </div>

          <div className="filter-section">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={filters.location}
              onChange={handleInputChange}
              placeholder="City or 'Online'"
            />
          </div>

          <div className="filter-section">
            <label>Price Range (Rs.)</label>
            <div className="price-range">
              <input
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleInputChange}
                placeholder="Min"
                min="0"
              />
              <span>to</span>
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleInputChange}
                placeholder="Max"
                min="0"
              />
            </div>
          </div>

          <div className="filter-section">
            <label>Minimum Rating</label>
            <div className="rating-filter">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`star ${star <= filters.minRating ? "filled" : ""}`}
                  onClick={() => handleRatingChange(star)}
                >
                  ★
                </span>
              ))}
              {filters.minRating > 0 && (
                <button className="clear-rating-btn" onClick={() => handleRatingChange(0)}>
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="filter-section">
            <label>Availability</label>
            <div className="availability-checkboxes">
              {Object.entries(filters.availability).map(([day, isChecked]) => (
                <label key={day} className="checkbox-label">
                  <input type="checkbox" name={day} checked={isChecked} onChange={handleCheckboxChange} />
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <label className="checkbox-label">
              <input type="checkbox" name="isOnline" checked={filters.isOnline} onChange={handleCheckboxChange} />
              Online Sessions Only
            </label>
          </div>
        </div>

        <div className="search-results">
          {error ? (
            <div className="error-message">{error}</div>
          ) : filteredTutors.length === 0 ? (
            <div className="no-results">
              <h3>No tutors found</h3>
              <p>Try adjusting your filters to see more results</p>
            </div>
          ) : (
            <>
              <div className="results-header">
                <h2>Found {filteredTutors.length} tutors</h2>
              </div>
              <div className="tutors-grid">
                {filteredTutors.map((tutor) => (
                  <TutorCard key={tutor._id} tutor={tutor} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default TutorSearch

