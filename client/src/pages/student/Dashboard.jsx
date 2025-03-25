"use client"

import { useState, useEffect } from "react"
import api from "../../utils/api"
import Loading from "../../components/common/Loading"
import StarRating from "../../components/common/StarRating"
import "../../styles/StudentDashboard.css"

const Dashboard = () => {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("upcoming")
  const [viewMode, setViewMode] = useState("list")
  const [selectedSession, setSelectedSession] = useState(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewData, setReviewData] = useState({
    rating: 0,
    comment: "",
  })
  const [reviewError, setReviewError] = useState("")

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const response = await api.get("/sessions/student")
      setSessions(response.data)
    } catch (err) {
      setError("Failed to fetch sessions. Please try again later.")
      console.error("Error fetching sessions:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSession = async (sessionId) => {
    if (!window.confirm("Are you sure you want to cancel this session?")) {
      return
    }

    try {
      await api.put(`/sessions/${sessionId}/cancel`)
      // Update sessions list
      fetchSessions()
    } catch (err) {
      setError("Failed to cancel session. Please try again later.")
      console.error("Error canceling session:", err)
    }
  }

  const handleRescheduleSession = (session) => {
    setSelectedSession(session)
  }

  const handleSubmitReschedule = async (e, sessionId, newDate, newTime) => {
    e.preventDefault()

    try {
      await api.put(`/sessions/${sessionId}/reschedule`, {
        date: newDate,
        time: newTime,
      })
      // Update sessions list and close modal
      fetchSessions()
      setSelectedSession(null)
    } catch (err) {
      setError("Failed to reschedule session. Please try again later.")
      console.error("Error rescheduling session:", err)
    }
  }

  const openReviewModal = (session) => {
    setSelectedSession(session)
    setShowReviewModal(true)
  }

  const handleReviewChange = (e) => {
    const { name, value } = e.target
    setReviewData({
      ...reviewData,
      [name]: value,
    })
  }

  const handleRatingChange = (rating) => {
    setReviewData({
      ...reviewData,
      rating,
    })
  }

  const submitReview = async (e) => {
    e.preventDefault()

    if (reviewData.rating === 0) {
      setReviewError("Please select a rating")
      return
    }

    try {
      await api.post(`/reviews`, {
        sessionId: selectedSession._id,
        tutorId: selectedSession.tutor._id,
        rating: reviewData.rating,
        comment: reviewData.comment,
      })

      // Reset and close modal
      setReviewData({ rating: 0, comment: "" })
      setShowReviewModal(false)
      setSelectedSession(null)

      // Refresh sessions
      fetchSessions()
    } catch (err) {
      setReviewError("Failed to submit review. Please try again.")
      console.error("Error submitting review:", err)
    }
  }

  const filterSessions = () => {
    const now = new Date()

    if (activeTab === "upcoming") {
      return sessions.filter(
        (session) => new Date(`${session.date}T${session.time}`) > now && session.status !== "cancelled",
      )
    } else if (activeTab === "past") {
      return sessions.filter(
        (session) => new Date(`${session.date}T${session.time}`) < now || session.status === "completed",
      )
    } else if (activeTab === "cancelled") {
      return sessions.filter((session) => session.status === "cancelled")
    }

    return sessions
  }

  const formatDate = (dateString) => {
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  if (loading) return <Loading />

  const filteredSessions = filterSessions()

  return (
    <div className="student-dashboard-container">
      <div className="dashboard-header">
        <h1>My Sessions</h1>
        <div className="view-toggle">
          <button
            className={`view-toggle-btn ${viewMode === "list" ? "active" : ""}`}
            onClick={() => setViewMode("list")}
          >
            List View
          </button>
          <button
            className={`view-toggle-btn ${viewMode === "calendar" ? "active" : ""}`}
            onClick={() => setViewMode("calendar")}
          >
            Calendar View
          </button>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === "upcoming" ? "active" : ""}`}
          onClick={() => setActiveTab("upcoming")}
        >
          Upcoming
        </button>
        <button className={`tab-btn ${activeTab === "past" ? "active" : ""}`} onClick={() => setActiveTab("past")}>
          Past
        </button>
        <button
          className={`tab-btn ${activeTab === "cancelled" ? "active" : ""}`}
          onClick={() => setActiveTab("cancelled")}
        >
          Cancelled
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {viewMode === "list" ? (
        <div className="sessions-list">
          {filteredSessions.length === 0 ? (
            <div className="no-sessions">
              <p>No {activeTab} sessions found.</p>
            </div>
          ) : (
            filteredSessions.map((session) => (
              <div key={session._id} className={`session-card ${session.status}`}>
                <div className="session-header">
                  <div className="tutor-info">
                    <img
                      src={session.tutor.profilePicture || "/placeholder-profile.jpg"}
                      alt={session.tutor.name}
                      className="tutor-image"
                    />
                    <div>
                      <h3>{session.tutor.name}</h3>
                      <p className="session-subject">{session.subject}</p>
                    </div>
                  </div>
                  <div className="session-status">
                    <span className={`status-badge ${session.status}`}>
                      {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="session-details">
                  <div className="detail-item">
                    <span className="detail-label">Date:</span>
                    <span>{formatDate(session.date)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Time:</span>
                    <span>{session.time}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Type:</span>
                    <span>{session.sessionType === "online" ? "Online" : "In-Person"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Price:</span>
                    <span>Rs. {session.tutor.hourlyRate}</span>
                  </div>
                </div>

                <div className="session-actions">
                  {activeTab === "upcoming" && (
                    <>
                      <button className="action-btn reschedule" onClick={() => handleRescheduleSession(session)}>
                        Reschedule
                      </button>
                      <button className="action-btn cancel" onClick={() => handleCancelSession(session._id)}>
                        Cancel
                      </button>
                    </>
                  )}

                  {activeTab === "past" && session.status === "completed" && !session.isReviewed && (
                    <button className="action-btn review" onClick={() => openReviewModal(session)}>
                      Leave Review
                    </button>
                  )}

                  {activeTab === "past" && session.isReviewed && (
                    <div className="review-info">
                      <p>You rated this session:</p>
                      <StarRating rating={session.review.rating} />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="calendar-view">
          {/* Calendar view implementation */}
          <div className="calendar-container">
            {/* This would be a more complex calendar component */}
            <p>Calendar view is under development. Please use list view for now.</p>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {selectedSession && !showReviewModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Reschedule Session</h2>
            <p>Session with {selectedSession.tutor.name}</p>

            <form
              onSubmit={(e) =>
                handleSubmitReschedule(
                  e,
                  selectedSession._id,
                  document.getElementById("newDate").value,
                  document.getElementById("newTime").value,
                )
              }
            >
              <div className="form-group">
                <label htmlFor="newDate">New Date</label>
                <input
                  type="date"
                  id="newDate"
                  defaultValue={selectedSession.date}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="newTime">New Time</label>
                <select id="newTime" defaultValue={selectedSession.time} required>
                  <option value="09:00">9:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="13:00">1:00 PM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="16:00">4:00 PM</option>
                  <option value="17:00">5:00 PM</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setSelectedSession(null)}>
                  Cancel
                </button>
                <button type="submit" className="confirm-btn">
                  Confirm Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedSession && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Review Your Session</h2>
            <p>
              Session with {selectedSession.tutor.name} on {formatDate(selectedSession.date)}
            </p>

            {reviewError && <div className="error-message">{reviewError}</div>}

            <form onSubmit={submitReview}>
              <div className="form-group">
                <label>Rating</label>
                <div className="rating-input">
                  <StarRating rating={reviewData.rating} editable={true} onRatingChange={handleRatingChange} />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="comment">Your Review</label>
                <textarea
                  id="comment"
                  name="comment"
                  value={reviewData.comment}
                  onChange={handleReviewChange}
                  placeholder="Share your experience with this tutor..."
                  rows={4}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setShowReviewModal(false)
                    setSelectedSession(null)
                    setReviewData({ rating: 0, comment: "" })
                    setReviewError("")
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="confirm-btn">
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard

