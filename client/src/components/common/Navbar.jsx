"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import "../../styles/Navbar.css"

const Navbar = () => {
  const { user, isAuthenticated, isStudent, isTutor, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
  }

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          EduConnect Pakistan
        </Link>

        <div className="menu-icon" onClick={toggleMenu}>
          <span className={menuOpen ? "menu-icon-bar open" : "menu-icon-bar"}></span>
          <span className={menuOpen ? "menu-icon-bar open" : "menu-icon-bar"}></span>
          <span className={menuOpen ? "menu-icon-bar open" : "menu-icon-bar"}></span>
        </div>

        <ul className={menuOpen ? "nav-menu active" : "nav-menu"}>
          <li className="nav-item">
            <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/tutors" className="nav-link" onClick={() => setMenuOpen(false)}>
              Find Tutors
            </Link>
          </li>

          {isAuthenticated ? (
            <>
              {isStudent && (
                <>
                  <li className="nav-item">
                    <Link to="/student/dashboard" className="nav-link" onClick={() => setMenuOpen(false)}>
                      Dashboard
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/student/wishlist" className="nav-link" onClick={() => setMenuOpen(false)}>
                      Wishlist
                    </Link>
                  </li>
                </>
              )}

              {isTutor && (
                <>
                  <li className="nav-item">
                    <Link to="/tutor/profile" className="nav-link" onClick={() => setMenuOpen(false)}>
                      Profile
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/tutor/dashboard" className="nav-link" onClick={() => setMenuOpen(false)}>
                      Dashboard
                    </Link>
                  </li>
                </>
              )}

              {isAdmin && (
                <>
                  <li className="nav-item">
                    <Link to="/admin/verification" className="nav-link" onClick={() => setMenuOpen(false)}>
                      Verification
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/admin/reporting" className="nav-link" onClick={() => setMenuOpen(false)}>
                      Reports
                    </Link>
                  </li>
                </>
              )}

              <li className="nav-item">
                <button className="nav-link logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link to="/login" className="nav-link" onClick={() => setMenuOpen(false)}>
                  Login
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/register" className="nav-link register-btn" onClick={() => setMenuOpen(false)}>
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  )
}

export default Navbar

