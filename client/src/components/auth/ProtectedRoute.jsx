"use client"

import { Navigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import Loading from "../common/Loading"

const ProtectedRoute = ({ children, role }) => {
  const { user, loading, isAuthenticated } = useAuth()

  if (loading) {
    return <Loading />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute

