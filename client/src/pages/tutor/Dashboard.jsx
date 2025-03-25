"use client"

import { useState, useEffect } from "react"
import api from "../../utils/api"
import Loading from "../../components/common/Loading"
import "../../styles/TutorDashboard.css"

const Dashboard = () => {
  const [sessions, setSessions] = useState([])
  const [earnings, setEarnings] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    thisWeek: 0,
    thisMonth: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("upcoming")
  const [selectedSession, setSelectedSession] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch sessions and earnings in parallel
      const [sessionsResponse, earningsResponse] = await Promise.all([
        api.get("/sessions/tutor"),
        api.get("/tutors/earnings"),
      ])

      setSessions(sessionsResponse.data)
      setEarnings(earningsResponse.data)
    } catch (err) {
      setError("Failed to fetch data. Please try again later.")
      console.error("Error fetching data:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSessionAction = async (sessionId, action) => {
    try {
      await api.put(`/sessions/${sessionId}/${action}`)
      // Refresh data
      fetchData()
    } catch (err) {
      setError(`Failed to ${action} session. Please try again later.`)
      console.error(`Error ${action} session:`, err)
    }
  }

  const filterSessions = () => {
    const now = new Date()

    if (activeTab === "pending") {
      return sessions.filter((session) => session.status === "pending")
    } else if (activeTab === "upcoming") {
      return sessions.filter(
        (session) =>
          (session.status === "confirmed" || session.status === "in-progress") &&
          new Date(`${session.date}T${session.time}`) > now,
      )
    } else if (activeTab === "completed") {
      return sessions.filter((session) => session.status === "completed")
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
    <div className="tutor-dashboard-container">
      <div className="dashboard-header">
        <h1>Tutor Dashboard</h1>
      </div>

      <div className="earnings-overview">
        <h2>Earnings Overview</h2>
        <div className="earnings-cards">
          <div className="earnings-card">
            <h3>Total Earnings</h3>
            <p className="amount">Rs. {earnings.total.toLocaleString()}</p>
          </div>
          <div className="earnings-card">
            <h3>Pending</h3>
            <p className="amount">Rs. {earnings.pending.toLocaleString()}</p>
          </div>
          <div className="earnings-card">
            <h3>This Week</h3>
            <p className="amount">Rs. {earnings.thisWeek.toLocaleString()}</p>
          </div>
          <div className="earnings-card">
            <h3>This Month</h3>
            <p className="amount">Rs. {earnings.thisMonth.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="sessions-section">
        <h2>Sessions</h2>

        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === "pending" ? "active" : ""}`}
            onClick={() => setActiveTab("pending")}
          >
            Pending Requests
          </button>
          <button
            className={`tab-btn ${activeTab === "upcoming" ? "active" : ""}`}
            onClick={() => setActiveTab("upcoming")}
          >
            Upcoming
          </button>
          <button
            className={`tab-btn ${activeTab === "completed" ? "active" : ""}`}
            onClick={() => setActiveTab("completed")}
          >
            Completed
          </button>
          <button
            className={`tab-btn ${activeTab === "cancelled" ? "active" : ""}`}
            onClick={() => setActiveTab("cancelled")}
          >
            Cancelled
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="sessions-list">
          {filteredSessions.length === 0 ? (
            <div className="no-sessions">
              <p>No {activeTab} sessions found.</p>
            </div>
          ) : (
            filteredSessions.map((session) => (
              <div key={session._id} className={`session-card ${session.status}`}>
                <div className="session-header">
                  <div className="student-info">
                    <img
                      src={session.student.profilePicture || "/placeholder-profile.jpg"}
                      alt={session.student.name}
                      className="student-image"
                    />
                    <div>
                      <h3>{session.student.name}</h3>
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
                    <span className="detail-label">Earnings:</span>
                    <span>Rs. {session.amount}</span>
                  </div>
                </div>

                <div className="session-actions">
                  {session.status === "pending" && (
                    <>
                      <button className="action-btn accept" onClick={() => handleSessionAction(session._id, "accept")}>
                        Accept
                      </button>
                      <button
                        className="action-btn decline"
                        onClick={() => handleSessionAction(session._id, "decline")}
                      >
                        Decline
                      </button>
                    </>
                  )}

                  {session.status === "confirmed" && (
                    <button
                      className="action-btn complete"
                      onClick={() => handleSessionAction(session._id, "complete")}
                    >
                      Mark as Completed
                    </button>
                  )}

                  <button className="action-btn view" onClick={() => setSelectedSession(session)}>
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Session Details Modal */}
      {selectedSession && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Session Details</h2>

            <div className="session-detail-grid">
              <div className="detail-row">
                <span className="detail-label">Student:</span>
                <span>{selectedSession.student.name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Subject:</span>
                <span>{selectedSession.subject}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Date:</span>
                <span>{formatDate(selectedSession.date)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Time:</span>
                <span>{selectedSession.time}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Session Type:</span>
                <span>{selectedSession.sessionType === "online" ? "Online" : "In-Person"}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className={`status-text ${selectedSession.status}`}>
                  {selectedSession.status.charAt(0).toUpperCase() + selectedSession.status.slice(1)}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Amount:</span>
                <span>Rs. {selectedSession.amount}</span>
              </div>

              {selectedSession.notes && (
                <div className="detail-row notes">
                  <span className="detail-label">Notes:</span>
                  <span>{selectedSession.notes}</span>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button className="close-btn" onClick={() => setSelectedSession(null)}>
                Close
              </button>

              {selectedSession.status === "pending" && (
                <>
                  <button
                    className="action-btn accept"
                    onClick={() => {
                      handleSessionAction(selectedSession._id, "accept")
                      setSelectedSession(null)
                    }}
                  >
                    Accept
                  </button>
                  <button
                    className="action-btn decline"
                    onClick={() => {
                      handleSessionAction(selectedSession._id, "decline")
                      setSelectedSession(null)
                    }}
                  >
                    Decline
                  </button>
                </>
              )}

              {selectedSession.status === "confirmed" && (
                <button
                  className="action-btn complete"
                  onClick={() => {
                    handleSessionAction(selectedSession._id, "complete")
                    setSelectedSession(null)
                  }}
                >
                  Mark as Completed
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard

