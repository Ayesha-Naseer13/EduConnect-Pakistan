"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../../utils/api"
import Loading from "../../components/common/Loading"
import StarRating from "../../components/common/StarRating"
import "../../styles/BookSession.css"

const BookSession = () => {
  const { tutorId } = useParams()
  const navigate = useNavigate()

  const [tutor, setTutor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [availableTimes, setAvailableTimes] = useState([])
  const [sessionType, setSessionType] = useState("online")
  const [subject, setSubject] = useState("")
  const [notes, setNotes] = useState("")
  const [formErrors, setFormErrors] = useState({})
  const [bookingSuccess, setBookingSuccess] = useState(false)

  useEffect(() => {
    const fetchTutorDetails = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/tutors/${tutorId}`)
        setTutor(response.data)
      } catch (err) {
        setError("Failed to fetch tutor details. Please try again later.")
        console.error("Error fetching tutor details:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchTutorDetails()
  }, [tutorId])

  useEffect(() => {
    // When date changes, fetch available times
    if (selectedDate) {
      fetchAvailableTimes()
    } else {
      setAvailableTimes([])
    }
  }, [selectedDate])

  const fetchAvailableTimes = async () => {
    try {
      const response = await api.get(`/tutors/${tutorId}/availability`, {
        params: { date: selectedDate },
      })
      setAvailableTimes(response.data.availableTimes)
    } catch (err) {
      console.error("Error fetching available times:", err)
      setAvailableTimes([])
    }
  }

  const validateForm = () => {
    const errors = {}

    if (!selectedDate) {
      errors.date = "Please select a date"
    }

    if (!selectedTime) {
      errors.time = "Please select a time"
    }

    if (!subject.trim()) {
      errors.subject = "Please select a subject"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await api.post("/sessions", {
        tutorId,
        date: selectedDate,
        time: selectedTime,
        sessionType,
        subject,
        notes,
      })

      setBookingSuccess(true)

      // Reset form
      setSelectedDate("")
      setSelectedTime("")
      setSessionType("online")
      setSubject("")
      setNotes("")

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        navigate("/student/dashboard")
      }, 3000)
    } catch (err) {
      setError("Failed to book session. Please try again later.")
      console.error("Error booking session:", err)
    }
  }

  if (loading) return <Loading />

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/tutors")}>Back to Tutors</button>
      </div>
    )
  }

  if (!tutor) {
    return (
      <div className="error-container">
        <h2>Tutor Not Found</h2>
        <p>The tutor you're looking for doesn't exist or has been removed.</p>
        <button onClick={() => navigate("/tutors")}>Back to Tutors</button>
      </div>
    )
  }

  // Get today's date in YYYY-MM-DD format for min date attribute
  const today = new Date().toISOString().split("T")[0]

  return (
    <div className="book-session-container">
      {bookingSuccess ? (
        <div className="booking-success">
          <h2>Booking Successful!</h2>
          <p>Your session with {tutor.name} has been booked successfully.</p>
          <p>You will be redirected to your dashboard shortly...</p>
        </div>
      ) : (
        <>
          <div className="tutor-profile-summary">
            <div className="tutor-profile-header">
              <img
                src={tutor.profilePicture || "/placeholder-profile.jpg"}
                alt={`${tutor.name} - Tutor`}
                className="tutor-profile-image"
              />
              <div className="tutor-profile-info">
                <h2>{tutor.name}</h2>
                <div className="tutor-rating-info">
                  <StarRating rating={tutor.rating} />
                  <span>({tutor.reviewCount} reviews)</span>
                </div>
                <p className="tutor-hourly-rate">Rs. {tutor.hourlyRate}/hour</p>
              </div>
            </div>

            <div className="tutor-subjects-list">
              <h3>Subjects</h3>
              <div className="subjects-tags">
                {tutor.subjects.map((subject, index) => (
                  <span key={index} className="subject-tag">
                    {subject}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="booking-form-container">
            <h2>Book a Session</h2>

            <form className="booking-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="date">Select Date</label>
                <input
                  type="date"
                  id="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={today}
                  className={formErrors.date ? "input-error" : ""}
                />
                {formErrors.date && <span className="error-text">{formErrors.date}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="time">Select Time</label>
                <select
                  id="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  disabled={!selectedDate || availableTimes.length === 0}
                  className={formErrors.time ? "input-error" : ""}
                >
                  <option value="">Select a time slot</option>
                  {availableTimes.map((time, index) => (
                    <option key={index} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
                {formErrors.time && <span className="error-text">{formErrors.time}</span>}
                {selectedDate && availableTimes.length === 0 && (
                  <span className="info-text">No available time slots for this date</span>
                )}
              </div>

              <div className="form-group">
                <label>Session Type</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="sessionType"
                      value="online"
                      checked={sessionType === "online"}
                      onChange={() => setSessionType("online")}
                    />
                    Online
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="sessionType"
                      value="in-person"
                      checked={sessionType === "in-person"}
                      onChange={() => setSessionType("in-person")}
                      disabled={!tutor.inPersonAvailable}
                    />
                    In-Person
                    {!tutor.inPersonAvailable && <span className="unavailable-text">(Unavailable)</span>}
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <select
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className={formErrors.subject ? "input-error" : ""}
                >
                  <option value="">Select a subject</option>
                  {tutor.subjects.map((subj, index) => (
                    <option key={index} value={subj}>
                      {subj}
                    </option>
                  ))}
                </select>
                {formErrors.subject && <span className="error-text">{formErrors.subject}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="notes">Additional Notes (Optional)</label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any specific topics you want to cover or questions you have"
                  rows={4}
                />
              </div>

              <div className="booking-summary">
                <h3>Booking Summary</h3>
                <div className="summary-item">
                  <span>Tutor:</span>
                  <span>{tutor.name}</span>
                </div>
                {selectedDate && (
                  <div className="summary-item">
                    <span>Date:</span>
                    <span>{new Date(selectedDate).toLocaleDateString()}</span>
                  </div>
                )}
                {selectedTime && (
                  <div className="summary-item">
                    <span>Time:</span>
                    <span>{selectedTime}</span>
                  </div>
                )}
                <div className="summary-item">
                  <span>Session Type:</span>
                  <span>{sessionType === "online" ? "Online" : "In-Person"}</span>
                </div>
                {subject && (
                  <div className="summary-item">
                    <span>Subject:</span>
                    <span>{subject}</span>
                  </div>
                )}
                <div className="summary-item total">
                  <span>Total:</span>
                  <span>Rs. {tutor.hourlyRate}</span>
                </div>
              </div>

              <button type="submit" className="book-button">
                Book Session
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  )
}

export default BookSession

