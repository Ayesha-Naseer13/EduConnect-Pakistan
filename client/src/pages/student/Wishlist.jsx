"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import api from "../../utils/api"
import TutorCard from "../../components/student/TutorCard"
import Loading from "../../components/common/Loading"
import "../../styles/Wishlist.css"

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortBy, setSortBy] = useState("name")
  const [filterSubject, setFilterSubject] = useState("")
  const [subjects, setSubjects] = useState([])

  useEffect(() => {
    fetchWishlist()
  }, [])

  const fetchWishlist = async () => {
    try {
      setLoading(true)
      const response = await api.get("/wishlist")
      setWishlist(response.data)

      // Extract unique subjects for filter dropdown
      const allSubjects = response.data.flatMap((item) => item.tutor.subjects)
      const uniqueSubjects = [...new Set(allSubjects)]
      setSubjects(uniqueSubjects)
    } catch (err) {
      setError("Failed to fetch wishlist. Please try again later.")
      console.error("Error fetching wishlist:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFromWishlist = async (tutorId) => {
    try {
      await api.delete(`/wishlist/${tutorId}`)
      // Update wishlist
      setWishlist(wishlist.filter((item) => item.tutor._id !== tutorId))
    } catch (err) {
      setError("Failed to remove tutor from wishlist. Please try again later.")
      console.error("Error removing from wishlist:", err)
    }
  }

  const sortWishlist = (items) => {
    return [...items].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.tutor.name.localeCompare(b.tutor.name)
        case "rating":
          return b.tutor.rating - a.tutor.rating
        case "price-low":
          return a.tutor.hourlyRate - b.tutor.hourlyRate
        case "price-high":
          return b.tutor.hourlyRate - a.tutor.hourlyRate
        default:
          return 0
      }
    })
  }

  const filterWishlist = (items) => {
    if (!filterSubject) return items

    return items.filter((item) =>
      item.tutor.subjects.some((subject) => subject.toLowerCase().includes(filterSubject.toLowerCase())),
    )
  }

  if (loading) return <Loading />

  const filteredWishlist = filterWishlist(wishlist)
  const sortedWishlist = sortWishlist(filteredWishlist)

  return (
    <div className="wishlist-container">
      <div className="wishlist-header">
        <h1>My Wishlist</h1>
        <div className="wishlist-count">
          {wishlist.length} {wishlist.length === 1 ? "tutor" : "tutors"}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {wishlist.length === 0 ? (
        <div className="empty-wishlist">
          <h2>Your wishlist is empty</h2>
          <p>Add tutors to your wishlist to save them for later.</p>
          <Link to="/tutors" className="find-tutors-btn">
            Find Tutors
          </Link>
        </div>
      ) : (
        <>
          <div className="wishlist-controls">
            <div className="filter-control">
              <label htmlFor="filterSubject">Filter by Subject:</label>
              <select id="filterSubject" value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}>
                <option value="">All Subjects</option>
                {subjects.map((subject, index) => (
                  <option key={index} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            <div className="sort-control">
              <label htmlFor="sortBy">Sort by:</label>
              <select id="sortBy" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="name">Name (A-Z)</option>
                <option value="rating">Rating (High to Low)</option>
                <option value="price-low">Price (Low to High)</option>
                <option value="price-high">Price (High to Low)</option>
              </select>
            </div>
          </div>

          <div className="wishlist-results">
            {filteredWishlist.length === 0 ? (
              <div className="no-results">
                <h3>No tutors match your filter</h3>
                <p>Try selecting a different subject or clearing the filter</p>
              </div>
            ) : (
              <div className="tutors-grid">
                {sortedWishlist.map((item) => (
                  <div key={item.tutor._id} className="wishlist-item">
                    <TutorCard tutor={item.tutor} />
                    <button className="remove-wishlist-btn" onClick={() => handleRemoveFromWishlist(item.tutor._id)}>
                      Remove from Wishlist
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default Wishlist

