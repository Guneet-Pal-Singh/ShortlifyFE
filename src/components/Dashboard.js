import React, { useState, useEffect } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const API_URL = 'http://localhost:5000/api';
const backendBaseUrl = "http://localhost:5000";

function Dashboard() {
  const [urls, setUrls] = useState([]);
  const [selectedUrl, setSelectedUrl] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [copyTooltip, setCopyTooltip] = useState(null);

  useEffect(() => {
    fetchUrls();
  }, []);

  const fetchUrls = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please login to view your URLs');
      }

      const response = await fetch(`${API_URL}/urls`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setUrls(data);
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch URLs');
      setLoading(false);
    }
  };

  const fetchAnalytics = async (shortId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please login to view analytics');
      }

      const response = await fetch(`${API_URL}/urls/${shortId}/analytics`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      setError('Failed to fetch analytics');
    }
  };

  const handleUrlSelect = (url) => {
    setSelectedUrl(url);
    fetchAnalytics(url.shortId);
  };

  const handleDelete = async (shortId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please login to delete URLs');
      }

      await fetch(`${API_URL}/urls/${shortId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchUrls();
      if (selectedUrl?.shortId === shortId) {
        setSelectedUrl(null);
        setAnalytics(null);
      }
    } catch (error) {
      setError('Failed to delete URL');
    }
  };

  const handleContextMenu = async (e, shortId) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(`${backendBaseUrl}/${shortId}`);
      setCopiedId(shortId);
      setCopyTooltip(shortId);
      setTimeout(() => setCopyTooltip(null), 1200);
    } catch (err) {
      // Optionally handle error
    }
  };

  const prepareTimeData = () => {
    if (!analytics?.analytics) return null;

    const timeData = analytics.analytics.reduce((acc, visit) => {
      const date = new Date(visit.timestamp).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(timeData),
      datasets: [{
        label: 'Clicks',
        data: Object.values(timeData),
        borderColor: '#007bff',
        tension: 0.1
      }]
    };
  };

  const prepareLocationData = () => {
    if (!analytics?.analytics) return null;

    const locationData = analytics.analytics.reduce((acc, visit) => {
      const country = visit.country || 'Unknown';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(locationData),
      datasets: [{
        data: Object.values(locationData),
        backgroundColor: [
          '#007bff',
          '#28a745',
          '#ffc107',
          '#dc3545',
          '#17a2b8'
        ]
      }]
    };
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard">
      <div className={`url-list ${selectedUrl && analytics ? 'with-analytics' : 'no-analytics'}`}>
        <h2>Your URLs</h2>
        {urls.map(url => (
          <div 
            key={url._id} 
            className={`url-item ${selectedUrl?._id === url._id ? 'selected' : ''}`}
            onClick={() => handleUrlSelect(url)}
          >
            <div className="url-info">
              <h3>{url.shortId}</h3>
              <p>{url.longUrl}</p>
              <div
                className="short-link-container"
                onContextMenu={e => handleContextMenu(e, url.shortId)}
                title="Right click to copy link"
                style={{ cursor: 'context-menu' }}
              >
                <span className="short-link-label">Short Link:</span>
                <a
                  className="short-link-url"
                  href={`${backendBaseUrl}/${url.shortId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {backendBaseUrl}/{url.shortId}
                </a>
                {copyTooltip === url.shortId && (
                  <span className="copy-tooltip">Copied!</span>
                )}
              </div>
              <div style={{
                fontSize: '0.93em',
                color: '#6366f1',
                margin: '0.25rem 0 0.5rem 0',
                fontWeight: 500,
                letterSpacing: '0.01em'
              }}>
                Right click the link above to copy
              </div>
              <span className="clicks">{url.clicks} clicks</span>
            </div>
            <button 
              className="delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(url.shortId);
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {selectedUrl && (
        <div className="analytics">
          <h2>Analytics for {selectedUrl.shortId}</h2>
          
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Clicks</h3>
              <p>{analytics?.clicks || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Unique Visitors</h3>
              <p>{new Set(analytics?.analytics?.map(a => a.ip) || []).size}</p>
            </div>
          </div>

          <div className="chart-container">
            <div className="chart">
              <h3>Clicks Over Time</h3>
              {analytics && <Line data={prepareTimeData()} />}
            </div>
            <div className="chart">
              <h3>Traffic by Location</h3>
              {analytics && <Doughnut data={prepareLocationData()} />}
            </div>
          </div>

          <div className="recent-visits">
            <h3>Recent Visits</h3>
            <div className="visits-list">
              {analytics?.analytics?.slice(0, 5).map((visit, index) => (
                <div key={index} className="visit-item">
                  <span>{new Date(visit.timestamp).toLocaleString()}</span>
                  <span>{visit.country || 'Unknown'}</span>
                  <span>{visit.referrer || 'Direct'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;