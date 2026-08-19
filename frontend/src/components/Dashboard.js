import React, { useCallback, useEffect, useState } from 'react';
import { attendanceService } from '../services/api';
import '../styles/Dashboard.css';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('checkin');
  const [checkInData, setCheckInData] = useState({
    location: '',
    locationName: '',
    latitude: null,
    longitude: null,
    notes: ''
  });
  const [checkOutNotes, setCheckOutNotes] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [records, setRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));

  const formatDateTime = (dateValue) => {
    if (!dateValue) return '-';
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleString();
  };

  const formatCoordinate = (value) => {
    if (value === null || value === undefined) return null;
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return null;
    return parsed.toFixed(6);
  };

  const getCoordinatesText = (record) => {
    const lat = formatCoordinate(record.latitude);
    const lng = formatCoordinate(record.longitude);
    if (!lat || !lng) return null;
    return `Lat ${lat}, Lng ${lng}`;
  };

  const fetchRecords = useCallback(async () => {
    if (!user?.id) return;
    setRecordsLoading(true);
    try {
      const response = await attendanceService.getRecords({ personnel_id: user.id });
      setRecords(response.data?.data || []);
    } catch (error) {
      setMessage({
        type: 'error',
        text: `X ${error.response?.data?.message || 'Failed to load records'}`
      });
    } finally {
      setRecordsLoading(false);
    }
  }, [user?.id]);

  const getReadableLocation = useCallback(async (latitude, longitude) => {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to reverse geocode location');
    }

    const data = await response.json();
    const address = data.address || {};

    const parts = [
      address.suburb || address.neighbourhood || address.city_district || address.road,
      address.city || address.town || address.village || address.county,
      address.state
    ].filter(Boolean);

    if (parts.length > 0) {
      return parts.join(', ');
    }

    return data.display_name || '';
  }, []);

  const autoDetectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Location is not supported by this browser.');
      return;
    }

    setLocating(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let formattedLocation = `Lat ${latitude.toFixed(6)}, Lng ${longitude.toFixed(6)}`;

        try {
          const readable = await getReadableLocation(latitude, longitude);
          if (readable) {
            formattedLocation = readable;
          }
        } catch (error) {
          // Keep coordinate fallback when reverse lookup fails.
        }

        setCheckInData((prev) => ({
          ...prev,
          location: formattedLocation,
          locationName: formattedLocation,
          latitude,
          longitude
        }));
        setLocating(false);
      },
      (error) => {
        let errorMessage = 'Unable to get your location.';
        if (error.code === 1) errorMessage = 'Location permission denied. You can enter location manually.';
        if (error.code === 2) errorMessage = 'Location unavailable. Please try again.';
        if (error.code === 3) errorMessage = 'Location request timed out. Please try again.';
        setLocationError(errorMessage);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [getReadableLocation]);

  useEffect(() => {
    if (activeTab === 'records') {
      fetchRecords();
    }
  }, [activeTab, fetchRecords]);

  useEffect(() => {
    if (activeTab === 'checkin' && !checkInData.location) {
      autoDetectLocation();
    }
  }, [activeTab, checkInData.location, autoDetectLocation]);

  const handleCheckIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await attendanceService.checkIn(
        user.id,
        checkInData.location,
        checkInData.notes,
        checkInData.latitude,
        checkInData.longitude,
        checkInData.locationName
      );
      setMessage({ type: 'success', text: 'Check-in successful.' });
      setCheckInData({
        location: '',
        locationName: '',
        latitude: null,
        longitude: null,
        notes: ''
      });
      fetchRecords();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: `X ${error.response?.data?.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await attendanceService.checkOut(user.id, checkOutNotes);
      setMessage({ type: 'success', text: 'Check-out successful.' });
      setCheckOutNotes('');
      fetchRecords();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: `X ${error.response?.data?.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>GCAA Attendance Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.name}</span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </header>

      <div className="dashboard-container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'checkin' ? 'active' : ''}`}
            onClick={() => setActiveTab('checkin')}
          >
            Check In
          </button>
          <button
            className={`tab ${activeTab === 'checkout' ? 'active' : ''}`}
            onClick={() => setActiveTab('checkout')}
          >
            Check Out
          </button>
          <button
            className={`tab ${activeTab === 'records' ? 'active' : ''}`}
            onClick={() => setActiveTab('records')}
          >
            Records
          </button>
        </div>

        <div className="tab-content">
          {message && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}

          {activeTab === 'checkin' && (
            <div className="form-section">
              <h2>Check In</h2>
              <form onSubmit={handleCheckIn}>
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={checkInData.location}
                    onChange={(e) =>
                      setCheckInData({
                        ...checkInData,
                        location: e.target.value,
                        locationName: e.target.value,
                        latitude: null,
                        longitude: null
                      })
                    }
                    placeholder={locating ? 'Detecting location...' : 'Auto-detected location will appear here'}
                  />
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={autoDetectLocation}
                    disabled={locating}
                  >
                    {locating ? 'Detecting...' : 'Use Current Location'}
                  </button>
                  {locationError && <p className="location-error">{locationError}</p>}
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    value={checkInData.notes}
                    onChange={(e) => setCheckInData({ ...checkInData, notes: e.target.value })}
                    placeholder="Any additional notes (optional)"
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Checking In...' : 'Check In'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'checkout' && (
            <div className="form-section">
              <h2>Check Out</h2>
              <form onSubmit={handleCheckOut}>
                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    value={checkOutNotes}
                    onChange={(e) => setCheckOutNotes(e.target.value)}
                    placeholder="Any additional notes (optional)"
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Checking Out...' : 'Check Out'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'records' && (
            <div className="form-section">
              <h2>My Attendance Records</h2>
              {recordsLoading ? (
                <p>Loading records...</p>
              ) : records.length === 0 ? (
                <p>No attendance records yet.</p>
              ) : (
                <div className="records-table-wrapper">
                  <table className="records-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Check In</th>
                        <th>Check Out</th>
                        <th>Location</th>
                        <th>Map</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((record) => (
                        <tr key={record.id}>
                          <td>{formatDateTime(record.check_in_time).split(',')[0]}</td>
                          <td>{formatDateTime(record.check_in_time)}</td>
                          <td>{record.check_out_time ? formatDateTime(record.check_out_time) : 'Not checked out'}</td>
                          <td title={getCoordinatesText(record) || undefined}>
                            {record.location_name || record.location || '-'}
                          </td>
                          <td>
                            {record.latitude && record.longitude ? (
                              <a
                                href={`https://www.google.com/maps?q=${record.latitude},${record.longitude}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Open Map
                              </a>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td>{record.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
