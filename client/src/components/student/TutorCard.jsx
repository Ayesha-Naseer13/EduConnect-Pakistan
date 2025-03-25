"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import StarRating from "../common/StarRating"
import WishlistButton from "./WishlistButton"
import "../../styles/TutorCard.css"

const TutorCard = ({ tutor }) => {
  const { isAuthenticated, isStudent } = useAuth()
  const [showMore, setShowMore] = useState(false)

  const { _id, name, profilePicture, subjects, hourlyRate, rating, reviewCount, location, isOnline, bio } = tutor

  const truncatedBio = bio?.length > 100 ? `${bio.substring(0, 100)}...` : bio

  return (
    <div className="tutor-card">
      <div className="tutor-card-header">
        <div className="tutor-image">
          <img src={profilePicture || "/placeholder-profile.jpg"} alt={`${name} - Tutor`} />
        </div>
        <div className="tutor-info">
          <h3>{name}</h3>
          <div className="tutor-rating">
            <StarRating rating={rating} />
            <span>({reviewCount} reviews)</span>
          </div>
          <div className="tutor-location">
            <span>{location}</span>
            {isOnline && <span className="online-badge">Online Available</span>}
          </div>
        </div>
        {isAuthenticated && isStudent && <WishlistButton tutorId={_id} />}
      </div>

      <div className="tutor-subjects">
        {subjects.slice(0, 3).map((subject, index) => (
          <span key={index} className="subject-tag">
            {subject}
          </span>
        ))}
        {subjects.length > 3 && <span className="subject-tag more-tag">+{subjects.length - 3} more</span>}
      </div>

      <div className="tutor-bio">
        <p>{showMore ? bio : truncatedBio}</p>
        {bio?.length > 100 && (
          <button className="show-more-btn" onClick={() => setShowMore(!showMore)}>
            {showMore ? "Show less" : "Show more"}
          </button>
        )}
      </div>

      <div className="tutor-card-footer">
        <div className="tutor-price">
          <span className="price-amount">Rs. {hourlyRate}</span>
          <span className="price-unit">/hour</span>
        </div>
        <div className="tutor-actions">
          <Link to={`/book/${_id}`} className="book-btn">
            Book Session
          </Link>
          <Link to={`/tutors/${_id}`} className="view-profile-btn">
            View Profile
          </Link>
        </div>
      </div>
    </div>
  )
}

export default TutorCard

