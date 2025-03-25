"use client"

import { useState, useEffect, useRef } from "react"
import api from "../../utils/api"
import Loading from "../../components/common/Loading"
import "../../styles/TutorProfile.css"

const Profile = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    bio: "",
    qualifications: "",
    subjects: [],
    hourlyRate: "",
    location: "",
    isOnline: true,
    inPersonAvailable: false,
    availability: {
      monday: { available: false, slots: [] },
      tuesday: { available: false, slots: [] },
      wednesday: { available: false, slots: [] },
      thursday: { available: false, slots: [] },
      friday: { available: false, slots: [] },
      saturday: { available: false, slots: [] },
      sunday: { available: false, slots: [] },
    },
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [newSubject, setNewSubject] = useState("")
  const [profileImage, setProfileImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await api.get("/tutors/profile")
      setProfile(response.data)
      if (response.data.profilePicture) {
        setImagePreview(response.data.profilePicture)
      }
    } catch (err) {
      setError("Failed to fetch profile. Please try again later.")
      console.error("Error fetching profile:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setProfile({
      ...profile,
      [name]: value,
    })
  }

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target
    setProfile({
      ...profile,
      [name]: checked,
    })
  }

  const handleAvailabilityChange = (day, field, value) => {
    setProfile({
      ...profile,
      availability: {
        ...profile.availability,
        [day]: {
          ...profile.availability[day],
          [field]: value,
        },
      },
    })
  }

  const handleTimeSlotChange = (day, index, value) => {
    const newSlots = [...profile.availability[day].slots]
    newSlots[index] = value

    handleAvailabilityChange(day, "slots", newSlots)
  }

  const addTimeSlot = (day) => {
    const newSlots = [...profile.availability[day].slots, "09:00-10:00"]
    handleAvailabilityChange(day, "slots", newSlots)
  }

  const removeTimeSlot = (day, index) => {
    const newSlots = profile.availability[day].slots.filter((_, i) => i !== index)
    handleAvailabilityChange(day, "slots", newSlots)
  }

  const handleAddSubject = () => {
    if (newSubject.trim() && !profile.subjects.includes(newSubject.trim())) {
      setProfile({
        ...profile,
        subjects: [...profile.subjects, newSubject.trim()],
      })
      setNewSubject("")
    }
  }

  const handleRemoveSubject = (subject) => {
    setProfile({
      ...profile,
      subjects: profile.subjects.filter((s) => s !== subject),
    })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProfileImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current.click()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setSaving(true)
      setError(null)

      // Create form data for file upload
      const formData = new FormData()

      // Add profile image if changed
      if (profileImage) {
        formData.append("profilePicture", profileImage)
      }

      // Add other profile data
      formData.append("profile", JSON.stringify(profile))

      await api.put("/tutors/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError("Failed to update profile. Please try again later.")
      console.error("Error updating profile:", err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loading />

  return (
    <div className="tutor-profile-container">
      <h1>Manage Your Profile</h1>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Profile updated successfully!</div>}

      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h2>Personal Information</h2>

          <div className="profile-image-section">
            <div className="profile-image-container" onClick={triggerFileInput}>
              {imagePreview ? (
                <img src={imagePreview || "/placeholder.svg"} alt="Profile Preview" className="profile-image-preview" />
              ) : (
                <div className="profile-image-placeholder">
                  <span>Add Photo</span>
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden-file-input"
            />
            <button type="button" className="change-photo-btn" onClick={triggerFileInput}>
              Change Photo
            </button>
          </div>

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input type="text" id="name" name="name" value={profile.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              required
              disabled
            />
            <small>Email cannot be changed</small>
          </div>

          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={profile.bio}
              onChange={handleChange}
              rows={4}
              placeholder="Tell students about yourself, your teaching experience, and your approach to tutoring"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="qualifications">Qualifications</label>
            <textarea
              id="qualifications"
              name="qualifications"
              value={profile.qualifications}
              onChange={handleChange}
              rows={3}
              placeholder="List your degrees, certifications, and relevant experience"
              required
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Subjects & Pricing</h2>

          <div className="form-group">
            <label>Subjects You Teach</label>
            <div className="subjects-container">
              {profile.subjects.map((subject, index) => (
                <div key={index} className="subject-tag">
                  <span>{subject}</span>
                  <button type="button" className="remove-subject-btn" onClick={() => handleRemoveSubject(subject)}>
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="add-subject-container">
              <input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="Add a subject"
              />
              <button type="button" className="add-subject-btn" onClick={handleAddSubject}>
                Add
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="hourlyRate">Hourly Rate (Rs.)</label>
            <input
              type="number"
              id="hourlyRate"
              name="hourlyRate"
              value={profile.hourlyRate}
              onChange={handleChange}
              min="100"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={profile.location}
              onChange={handleChange}
              placeholder="City, Province"
              required
            />
          </div>

          <div className="form-group">
            <label>Teaching Preferences</label>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input type="checkbox" name="isOnline" checked={profile.isOnline} onChange={handleCheckboxChange} />
                Available for Online Sessions
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="inPersonAvailable"
                  checked={profile.inPersonAvailable}
                  onChange={handleCheckboxChange}
                />
                Available for In-Person Sessions
              </label>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Availability</h2>
          <p>Set your weekly availability schedule</p>

          <div className="availability-container">
            {Object.entries(profile.availability).map(([day, { available, slots }]) => (
              <div key={day} className="day-availability">
                <div className="day-header">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={available}
                      onChange={(e) => handleAvailabilityChange(day, "available", e.target.checked)}
                    />
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </label>
                </div>

                {available && (
                  <div className="time-slots">
                    {slots.map((slot, index) => (
                      <div key={index} className="time-slot">
                        <input
                          type="text"
                          value={slot}
                          onChange={(e) => handleTimeSlotChange(day, index, e.target.value)}
                          placeholder="e.g. 09:00-10:00"
                        />
                        <button type="button" className="remove-slot-btn" onClick={() => removeTimeSlot(day, index)}>
                          ×
                        </button>
                      </div>
                    ))}

                    <button type="button" className="add-slot-btn" onClick={() => addTimeSlot(day)}>
                      + Add Time Slot
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="profile-preview">
          <h2>Profile Preview</h2>
          <p>This is how students will see your profile</p>

          <div className="preview-card">
            <div className="preview-header">
              <div className="preview-image">
                {imagePreview ? (
                  <img src={imagePreview || "/placeholder.svg"} alt="Profile" />
                ) : (
                  <div className="preview-image-placeholder"></div>
                )}
              </div>
              <div className="preview-info">
                <h3>{profile.name || "Your Name"}</h3>
                <p className="preview-location">{profile.location || "Your Location"}</p>
                <p className="preview-rate">Rs. {profile.hourlyRate || "0"}/hour</p>
              </div>
            </div>

            <div className="preview-subjects">
              {profile.subjects.length > 0 ? (
                profile.subjects.map((subject, index) => (
                  <span key={index} className="preview-subject-tag">
                    {subject}
                  </span>
                ))
              ) : (
                <p className="preview-placeholder">No subjects added yet</p>
              )}
            </div>

            <div className="preview-bio">
              <h4>About Me</h4>
              <p>{profile.bio || "Your bio will appear here"}</p>
            </div>

            <div className="preview-qualifications">
              <h4>Qualifications</h4>
              <p>{profile.qualifications || "Your qualifications will appear here"}</p>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="save-profile-btn" disabled={saving}>
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Profile

