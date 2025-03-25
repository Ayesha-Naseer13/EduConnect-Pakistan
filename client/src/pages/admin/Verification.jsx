"use client"

import { useState, useEffect } from "react"
import api from "../../utils/api"
import Loading from "../../components/common/Loading"
import "../../styles/AdminVerification.css"

const Verification = () => {
  const [tutors, setTutors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("pending")
  const [selectedTutor, setSelectedTutor] = useState(null)
  const [comment, setComment] = useState("")
  const [stats, setStats] = useState({
    pending: 0,
    verified: 0,
    rejected: 0,
  })

  useEffect(() => {
    fetchTutors()
  }, [activeTab])

  const fetchTutors = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/admin/tutors?status=${activeTab}`)
      setTutors(response.data.tutors)
      setStats(response.data.stats)
    } catch (err) {
      setError("Failed to fetch tutors. Please try again later.")
      console.error("Error fetching tutors:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleVerificationAction = async (tutorId, action) => {
    try {
      await api.put(`/admin/tutors/${tutorId}/${action}`, { comment })
      // Refresh data
      fetchTutors()
      // Close modal
      setSelectedTutor(null)
      setComment("")
    } catch (err) {
      setError(`Failed to ${action} tutor. Please try again later.`)
      console.error(`Error ${action} tutor:`, err)
    }
  }

  if (loading) return <Loading />

  return (
    <div className="admin-verification-container">
      <div className="verification-header">
        <h1>Tutor Verification</h1>
        <div className="verification-stats">
          <div className="stat-card pending">
            <h3>Pending</h3>
            <p>{stats.pending}</p>
          </div>
          <div className="stat-card verified">
            <h3>Verified</h3>
            <p>{stats.verified}</p>
          </div>
          <div className="stat-card rejected">
            <h3>Rejected</h3>
            <p>{stats.rejected}</p>
          </div>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === "pending" ? "active" : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          Pending
        </button>
        <button
          className={`tab-btn ${activeTab === "verified" ? "active" : ""}`}
          onClick={() => setActiveTab("verified")}
        >
          Verified
        </button>
        <button
          className={`tab-btn ${activeTab === "rejected" ? "active" : ""}`}
          onClick={() => setActiveTab("rejected")}
        >
          Rejected
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="tutors-list">
        {tutors.length === 0 ? (
          <div className="no-tutors">
            <p>No {activeTab} tutors found.</p>
          </div>
        ) : (
          tutors.map((tutor) => (
            <div key={tutor._id} className="tutor-card">
              <div className="tutor-header">
                <img
                  src={tutor.profilePicture || "/placeholder-profile.jpg"}
                  alt={tutor.name}
                  className="tutor-image"
                />
                <div className="tutor-info">
                  <h3>{tutor.name}</h3>
                  <p className="tutor-email">{tutor.email}</p>
                  <p className="tutor-location">{tutor.location}</p>
                </div>
                <div className="verification-status">
                  <span className={`status-badge ${tutor.verificationStatus}`}>
                    {tutor.verificationStatus.charAt(0).toUpperCase() + tutor.verificationStatus.slice(1)}
                  </span>
                </div>
              </div>

              <div className="tutor-subjects">
                {tutor.subjects.map((subject, index) => (
                  <span key={index} className="subject-tag">
                    {subject}
                  </span>
                ))}
              </div>

              <div className="tutor-details">
                <div className="detail-item">
                  <span className="detail-label">Hourly Rate:</span>
                  <span>Rs. {tutor.hourlyRate}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Joined:</span>
                  <span>{new Date(tutor.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="tutor-actions">
                <button className="view-btn" onClick={() => setSelectedTutor(tutor)}>
                  View Details
                </button>

                {activeTab === "pending" && (
                  <>
                    <button
                      className="approve-btn"
                      onClick={() => {
                        setSelectedTutor(tutor)
                        setComment("Approved")
                      }}
                    >
                      Approve
                    </button>
                    <button
                      className="reject-btn"
                      onClick={() => {
                        setSelectedTutor(tutor)
                        setComment("")
                      }}
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Tutor Details Modal */}
      {selectedTutor && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Tutor Details</h2>

            <div className="tutor-profile">
              <div className="profile-header">
                <img
                  src={selectedTutor.profilePicture || "/placeholder-profile.jpg"}
                  alt={selectedTutor.name}
                  className="profile-image"
                />
                <div>
                  <h3>{selectedTutor.name}</h3>
                  <p className="profile-email">{selectedTutor.email}</p>
                  <p className="profile-location">{selectedTutor.location}</p>
                  <p className="profile-rate">Rs. {selectedTutor.hourlyRate}/hour</p>
                </div>
              </div>

              <div className="profile-section">
                <h4>Bio</h4>
                <p>{selectedTutor.bio}</p>
              </div>

              <div className="profile-section">
                <h4>Qualifications</h4>
                <p>{selectedTutor.qualifications}</p>
              </div>

              <div className="profile-section">
                <h4>Subjects</h4>
                <div className="profile-subjects">
                  {selectedTutor.subjects.map((subject, index) => (
                    <span key={index} className="subject-tag">
                      {subject}
                    </span>
                  ))}
                </div>
              </div>

              <div className="profile-section">
                <h4>Teaching Preferences</h4>
                <ul>
                  <li>{selectedTutor.isOnline ? "Available" : "Not available"} for online sessions</li>
                  <li>{selectedTutor.inPersonAvailable ? "Available" : "Not available"} for in-person sessions</li>
                </ul>
              </div>

              {activeTab === "pending" && (
                <div className="verification-form">
                  <h4>Verification Decision</h4>
                  <div className="form-group">
                    <label htmlFor="comment">Comment</label>
                    <textarea
                      id="comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Add a comment about your decision"
                      rows={3}
                    />
                  </div>

                  <div className="verification-actions">
                    <button
                      className="approve-btn"
                      onClick={() => handleVerificationAction(selectedTutor._id, "approve")}
                    >
                      Approve
                    </button>
                    <button
                      className="reject-btn"
                      onClick={() => handleVerificationAction(selectedTutor._id, "reject")}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )}

              {(activeTab === "verified" || activeTab === "rejected") && selectedTutor.verificationComment && (
                <div className="profile-section">
                  <h4>Verification Comment</h4>
                  <p>{selectedTutor.verificationComment}</p>
                </div>
              )}
            </div>

            <button
              className="close-btn"
              onClick={() => {
                setSelectedTutor(null)
                setComment("")
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Verification

