"use client"

import { useState, useEffect } from "react"
import api from "../../utils/api"
import Loading from "../../components/common/Loading"
import "../../styles/AdminReporting.css"

const Reporting = () => {
  const [reportData, setReportData] = useState({
    popularSubjects: [],
    sessionCompletionRate: 0,
    cityUsage: [],
    userGrowth: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  })
  const [activeChart, setActiveChart] = useState("popularSubjects")

  useEffect(() => {
    fetchReportData()
  }, [dateRange])

  const fetchReportData = async () => {
    try {
      setLoading(true)
      const response = await api.get("/admin/reports", {
        params: dateRange,
      })
      setReportData(response.data)
    } catch (err) {
      setError("Failed to fetch report data. Please try again later.")
      console.error("Error fetching report data:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDateChange = (e) => {
    const { name, value } = e.target
    setDateRange({
      ...dateRange,
      [name]: value,
    })
  }

  const exportData = () => {
    // Create CSV content
    let csvContent = ""

    if (activeChart === "popularSubjects") {
      csvContent = "Subject,Count\n"
      reportData.popularSubjects.forEach((item) => {
        csvContent += `${item.subject},${item.count}\n`
      })
    } else if (activeChart === "cityUsage") {
      csvContent = "City,Count\n"
      reportData.cityUsage.forEach((item) => {
        csvContent += `${item.city},${item.count}\n`
      })
    } else if (activeChart === "userGrowth") {
      csvContent = "Date,Students,Tutors\n"
      reportData.userGrowth.forEach((item) => {
        csvContent += `${item.date},${item.students},${item.tutors}\n`
      })
    }

    // Create a download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `${activeChart}_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) return <Loading />

  return (
    <div className="admin-reporting-container">
      <div className="reporting-header">
        <h1>Reporting Dashboard</h1>
        <div className="date-range-picker">
          <div className="date-input">
            <label htmlFor="startDate">Start Date</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateChange}
              max={dateRange.endDate}
            />
          </div>
          <div className="date-input">
            <label htmlFor="endDate">End Date</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateChange}
              min={dateRange.startDate}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="report-summary">
        <div className="summary-card">
          <h3>Total Users</h3>
          <p className="summary-value">{reportData.totalUsers || 0}</p>
        </div>
        <div className="summary-card">
          <h3>Total Sessions</h3>
          <p className="summary-value">{reportData.totalSessions || 0}</p>
        </div>
        <div className="summary-card">
          <h3>Completion Rate</h3>
          <p className="summary-value">{reportData.sessionCompletionRate || 0}%</p>
        </div>
        <div className="summary-card">
          <h3>Total Revenue</h3>
          <p className="summary-value">Rs. {reportData.totalRevenue?.toLocaleString() || 0}</p>
        </div>
      </div>

      <div className="report-tabs">
        <button
          className={`tab-btn ${activeChart === "popularSubjects" ? "active" : ""}`}
          onClick={() => setActiveChart("popularSubjects")}
        >
          Popular Subjects
        </button>
        <button
          className={`tab-btn ${activeChart === "cityUsage" ? "active" : ""}`}
          onClick={() => setActiveChart("cityUsage")}
        >
          Platform Usage by City
        </button>
        <button
          className={`tab-btn ${activeChart === "userGrowth" ? "active" : ""}`}
          onClick={() => setActiveChart("userGrowth")}
        >
          User Growth
        </button>
      </div>

      <div className="chart-container">
        <div className="chart-header">
          <h2>
            {activeChart === "popularSubjects" && "Popular Subjects"}
            {activeChart === "cityUsage" && "Platform Usage by City"}
            {activeChart === "userGrowth" && "User Growth Over Time"}
          </h2>
          <button className="export-btn" onClick={exportData}>
            Export Data
          </button>
        </div>

        {activeChart === "popularSubjects" && (
          <div className="chart popular-subjects-chart">
            {reportData.popularSubjects.length === 0 ? (
              <div className="no-data">No data available for the selected date range</div>
            ) : (
              <div className="bar-chart">
                {reportData.popularSubjects.map((item, index) => (
                  <div key={index} className="bar-item">
                    <div className="bar-label">{item.subject}</div>
                    <div className="bar-container">
                      <div
                        className="bar"
                        style={{
                          width: `${(item.count / Math.max(...reportData.popularSubjects.map((s) => s.count))) * 100}%`,
                        }}
                      ></div>
                      <span className="bar-value">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeChart === "cityUsage" && (
          <div className="chart city-usage-chart">
            {reportData.cityUsage.length === 0 ? (
              <div className="no-data">No data available for the selected date range</div>
            ) : (
              <div className="pie-chart-container">
                <div className="pie-chart">
                  {/* This would be a more complex pie chart component */}
                  <div className="pie-chart-placeholder">Pie chart visualization would go here</div>
                </div>
                <div className="pie-legend">
                  {reportData.cityUsage.map((item, index) => (
                    <div key={index} className="legend-item">
                      <div className="legend-color" style={{ backgroundColor: `hsl(${index * 30}, 70%, 50%)` }}></div>
                      <div className="legend-label">{item.city}</div>
                      <div className="legend-value">{item.count}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeChart === "userGrowth" && (
          <div className="chart user-growth-chart">
            {reportData.userGrowth.length === 0 ? (
              <div className="no-data">No data available for the selected date range</div>
            ) : (
              <div className="line-chart-container">
                {/* This would be a more complex line chart component */}
                <div className="line-chart-placeholder">Line chart visualization would go here</div>
                <div className="line-chart-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Students</th>
                        <th>Tutors</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.userGrowth.map((item, index) => (
                        <tr key={index}>
                          <td>{new Date(item.date).toLocaleDateString()}</td>
                          <td>{item.students}</td>
                          <td>{item.tutors}</td>
                          <td>{item.students + item.tutors}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Reporting

