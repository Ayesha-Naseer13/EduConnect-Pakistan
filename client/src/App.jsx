"use client"

import { Routes, Route } from "react-router-dom"
import { Suspense, lazy } from "react"
import Navbar from "./components/common/Navbar"
import Footer from "./components/common/Footer"
import ProtectedRoute from "./components/auth/ProtectedRoute"
import Loading from "./components/common/Loading"
import { useAuth } from "./context/AuthContext"
import "./styles/App.css"

// Lazy load pages for better performance
const Home = lazy(() => import("./pages/Home"))
const Login = lazy(() => import("./pages/Login"))
const Register = lazy(() => import("./pages/Register"))
const TutorSearch = lazy(() => import("./pages/student/TutorSearch"))
const BookSession = lazy(() => import("./pages/student/BookSession"))
const StudentDashboard = lazy(() => import("./pages/student/Dashboard"))
const Wishlist = lazy(() => import("./pages/student/Wishlist"))
const TutorProfile = lazy(() => import("./pages/tutor/Profile"))
const TutorDashboard = lazy(() => import("./pages/tutor/Dashboard"))
const AdminVerification = lazy(() => import("./pages/admin/Verification"))
const AdminReporting = lazy(() => import("./pages/admin/Reporting"))
const NotFound = lazy(() => import("./pages/NotFound"))

function App() {
  const { user } = useAuth()

  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Student Routes */}
            <Route path="/tutors" element={<TutorSearch />} />
            <Route
              path="/book/:tutorId"
              element={
                <ProtectedRoute role="student">
                  <BookSession />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute role="student">
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/wishlist"
              element={
                <ProtectedRoute role="student">
                  <Wishlist />
                </ProtectedRoute>
              }
            />

            {/* Tutor Routes */}
            <Route
              path="/tutor/profile"
              element={
                <ProtectedRoute role="tutor">
                  <TutorProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tutor/dashboard"
              element={
                <ProtectedRoute role="tutor">
                  <TutorDashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/verification"
              element={
                <ProtectedRoute role="admin">
                  <AdminVerification />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reporting"
              element={
                <ProtectedRoute role="admin">
                  <AdminReporting />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}

export default App

