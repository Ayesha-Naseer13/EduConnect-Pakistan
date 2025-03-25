import { Link } from "react-router-dom"
import "../styles/Home.css"

const Home = () => {
  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Find the Perfect Tutor for Your Learning Journey</h1>
          <p>
            EduConnect Pakistan connects students with qualified tutors across the country. Whether you need help with
            academics, test prep, or skill development, we've got you covered.
          </p>
          <div className="hero-buttons">
            <Link to="/tutors" className="primary-button">
              Find a Tutor
            </Link>
            <Link to="/register" className="secondary-button">
              Become a Tutor
            </Link>
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2>How EduConnect Works</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Search</h3>
            <p>Find tutors based on subject, location, price, and availability</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📅</div>
            <h3>Book</h3>
            <p>Schedule sessions that fit your calendar and learning needs</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h3>Learn</h3>
            <p>Connect with your tutor online or in-person for personalized learning</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⭐</div>
            <h3>Review</h3>
            <p>Share your experience and help others find great tutors</p>
          </div>
        </div>
      </section>

      <section className="subjects-section">
        <h2>Popular Subjects</h2>
        <div className="subjects-grid">
          <div className="subject-card">Mathematics</div>
          <div className="subject-card">Physics</div>
          <div className="subject-card">Chemistry</div>
          <div className="subject-card">Biology</div>
          <div className="subject-card">English</div>
          <div className="subject-card">Computer Science</div>
          <div className="subject-card">History</div>
          <div className="subject-card">Economics</div>
        </div>
      </section>

      <section className="testimonials-section">
        <h2>What Our Users Say</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <p>
              "EduConnect helped me find the perfect math tutor for my daughter. Her grades have improved
              significantly!"
            </p>
            <div className="testimonial-author">- Fatima A., Parent</div>
          </div>
          <div className="testimonial-card">
            <p>
              "As a tutor, this platform has connected me with students who truly value education. The scheduling system
              makes it easy to manage my time."
            </p>
            <div className="testimonial-author">- Ahmed K., Physics Tutor</div>
          </div>
          <div className="testimonial-card">
            <p>
              "I was struggling with my university courses until I found a tutor through EduConnect. Now I'm confident
              in my studies."
            </p>
            <div className="testimonial-author">- Zainab M., University Student</div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to Start Learning?</h2>
        <p>Join thousands of students and tutors on EduConnect Pakistan today.</p>
        <Link to="/register" className="primary-button">
          Sign Up Now
        </Link>
      </section>
    </div>
  )
}

export default Home

