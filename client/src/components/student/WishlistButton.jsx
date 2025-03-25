"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import api from "../../utils/api"
import "../../styles/WishlistButton.css"

const WishlistButton = ({ tutorId }) => {
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Check if tutor is in wishlist
    const checkWishlist = async () => {
      if (!isAuthenticated) return

      try {
        const response = await api.get("/wishlist/check", {
          params: { tutorId },
        })
        setIsInWishlist(response.data.isInWishlist)
      } catch (error) {
        console.error("Error checking wishlist:", error)
      }
    }

    checkWishlist()
  }, [tutorId, isAuthenticated])

  const toggleWishlist = async () => {
    if (!isAuthenticated) {
      navigate("/login")
      return
    }

    setIsLoading(true)
    try {
      if (isInWishlist) {
        await api.delete(`/wishlist/${tutorId}`)
      } else {
        await api.post("/wishlist", { tutorId })
      }
      setIsInWishlist(!isInWishlist)
    } catch (error) {
      console.error("Error updating wishlist:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      className={`wishlist-button ${isInWishlist ? "in-wishlist" : ""} ${isLoading ? "loading" : ""}`}
      onClick={toggleWishlist}
      disabled={isLoading}
      title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
    >
      {isInWishlist ? "❤️" : "🤍"}
    </button>
  )
}

export default WishlistButton

