"use client"

import "../../styles/StarRating.css"

const StarRating = ({ rating, maxRating = 5, editable = false, onRatingChange = null }) => {
  const stars = []

  const handleClick = (selectedRating) => {
    if (editable && onRatingChange) {
      onRatingChange(selectedRating)
    }
  }

  for (let i = 1; i <= maxRating; i++) {
    stars.push(
      <span
        key={i}
        className={`star ${i <= rating ? "filled" : ""} ${editable ? "editable" : ""}`}
        onClick={() => handleClick(i)}
      >
        ★
      </span>,
    )
  }

  return (
    <div className="star-rating">
      {stars}
      {rating > 0 && <span className="rating-value">{rating.toFixed(1)}</span>}
    </div>
  )
}

export default StarRating

