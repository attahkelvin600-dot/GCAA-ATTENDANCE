import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { attendanceService, personnelService } from '../services/api';
import '../styles/ManagementDashboard.css';

const today = new Date().toISOString().split('T')[0];

function ManagementDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [activeTab, setActiveTab] = useState('overview');
  const [reportDate, setReportDate] = useState(today);
  const [report, setReport] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: 'personnel' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const isAdmin = user?.role === 'admin';

  const showError = (error, fallback) => {
    setMessage({ type: 'error', text: error.response?.data?.message || fallback });
  };

  const loadReport = useCallback(async () => {
    setLoading(true);
    try {
      const response = await attendanceService.getDailyReport(reportDate);
      setReport(response.data?.data || []);
    } catch (error) {
      showError(error, 'Unable to load the attendance report.');
    } finally {
      setLoading(false);
    }
  }, [reportDate]);

  const loadPersonnel = useCallback(async () => {
    setLoading(true);
    try {
      const response = await personnelService.getAll();
      setPersonnel(response.data?.data || []);
    } catch (error) {
      showError(error, 'Unable to load personnel.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'overview') {
      loadReport();
    } else {
      loadPersonnel();
    }
  }, [activeTab, loadPersonnel, loadReport]);

  const startEditing = (person) => {
    setEditingId(person.id);
    setEditForm({ name: person.name, email: person.email, role: person.role });
    setMessage(null);
  };

  const savePersonnel = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await personnelService.update(editingId, editForm);
      setMessage({ type: 'success', text: 'Personnel details updated.' });
      setEditingId(null);
      await loadPersonnel();
    } catch (error) {
      showError(error, 'Unable to update personnel.');
    } finally {
      setSaving(false);
    }
  };

  const removePersonnel = async (person) => {
    if (!window.confirm(`Remove ${person.name} from the system?`)) return;

    try {
      await personnelService.delete(person.id);
      setMessage({ type: 'success', text: `${person.name} was removed.` });
      await loadPersonnel();
    } catch (error) {
      showError(error, 'Unable to remove personnel.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const counts = report.reduce((summary, person) => {
    if (person.status === 'Absent') summary.absent += 1;
    else if (person.status === 'Still checked in') summary.active += 1;
    else summary.present += 1;
    return summary;
  }, { present: 0, active: 0, absent: 0 });

  return (
    <div className="management-page">
      <header className="management-header">
        <div>
          <p className="management-eyebrow">Operations console</p>
          <h1>Management Dashboard</h1>
          <p>Attendance visibility and personnel administration for GCAA.</p>
        </div>
        <div className="management-actions">
          <span>{user?.name} · {user?.role}</span>
          <Link to="/dashboard" className="management-link">My attendance</Link>
          <button type="button" className="management-logout" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main className="management-container">
        {message && <div className={`management-message ${message.type}`}>{message.text}</div>}

        <nav className="management-tabs" aria-label="Management sections">
          <button type="button" className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
            Attendance overview
          </button>
          <button type="button" className={activeTab === 'personnel' ? 'active' : ''} onClick={() => setActiveTab('personnel')}>
            Personnel directory
          </button>
        </nav>

        {activeTab === 'overview' ? (
          <section>
            <div className="management-section-heading">
              <div>
                <p className="management-eyebrow">Daily status</p>
                <h2>Team attendance</h2>
              </div>
              <label className="date-control">
                Report date
                <input type="date" value={reportDate} onChange={(event) => setReportDate(event.target.value)} />
              </label>
            </div>

            <div className="summary-grid">
              <article><span>Present</span><strong>{counts.present}</strong></article>
              <article><span>Still checked in</span><strong>{counts.active}</strong></article>
              <article><span>Absent</span><strong>{counts.absent}</strong></article>
              <article><span>Total personnel</span><strong>{report.length}</strong></article>
            </div>

            {loading ? <p className="management-empty">Loading attendance report...</p> : (
              <div className="management-table-wrapper">
                <table className="management-table">
                  <thead><tr><th>Name</th><th>Employee ID</th><th>Check in</th><th>Check out</th><th>Status</th></tr></thead>
                  <tbody>
                    {report.map((person) => (
                      <tr key={person.id}>
                        <td>{person.name}</td>
                        <td>{person.employee_id}</td>
                        <td>{person.check_in}</td>
                        <td>{person.check_out}</td>
                        <td><span className={`status-pill ${person.status.toLowerCase().replaceAll(' ', '-')}`}>{person.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!report.length && <p className="management-empty">No personnel records found.</p>}
              </div>
            )}
          </section>
        ) : (
          <section>
            <div className="management-section-heading">
              <div>
                <p className="management-eyebrow">People</p>
                <h2>Personnel directory</h2>
              </div>
              <span className="management-note">{isAdmin ? 'Admin controls enabled' : 'Read-only supervisor view'}</span>
            </div>

            {loading ? <p className="management-empty">Loading personnel...</p> : (
              <div className="management-table-wrapper">
                <table className="management-table personnel-table">
                  <thead><tr><th>Name</th><th>Employee ID</th><th>Email</th><th>Role</th>{isAdmin && <th>Actions</th>}</tr></thead>
                  <tbody>
                    {personnel.map((person) => editingId === person.id ? (
                      <tr key={person.id}>
                        <td colSpan={isAdmin ? 5 : 4}>
                          <form className="inline-edit-form" onSubmit={savePersonnel}>
                            <input aria-label="Name" value={editForm.name} onChange={(event) => setEditForm({ ...editForm, name: event.target.value })} required />
                            <input aria-label="Email" type="email" value={editForm.email} onChange={(event) => setEditForm({ ...editForm, email: event.target.value })} required />
                            <select aria-label="Role" value={editForm.role} onChange={(event) => setEditForm({ ...editForm, role: event.target.value })}>
                              <option value="personnel">Personnel</option>
                              <option value="supervisor">Supervisor</option>
                              <option value="admin">Admin</option>
                            </select>
                            <button type="submit" className="small-button save" disabled={saving}>Save</button>
                            <button type="button" className="small-button cancel" onClick={() => setEditingId(null)}>Cancel</button>
                          </form>
                        </td>
                      </tr>
                    ) : (
                      <tr key={person.id}>
                        <td>{person.name}</td><td>{person.employee_id}</td><td>{person.email}</td><td><span className="role-label">{person.role}</span></td>
                        {isAdmin && <td className="row-actions"><button type="button" onClick={() => startEditing(person)}>Edit</button><button type="button" className="danger" onClick={() => removePersonnel(person)}>Remove</button></td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!personnel.length && <p className="management-empty">No personnel records found.</p>}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default ManagementDashboard;