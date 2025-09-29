// /app/classlist/page.js

'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function ClassList() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    coach: '', // Will now store coach_display_id
    class_name: '',
    status: '',
    hour: '10',
    minute: '00',
    ampm: 'AM',
    level: '',
    date: '',
  });

  // State now stores objects with { name, id }
  const [coachOptions, setCoachOptions] = useState([]); 
  const [classNameOptions, setClassNameOptions] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharedClass, setSharedClass] = useState(null);
  
  // State for Google integration
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [userSession, setUserSession] = useState(null);
  const [isSessionChecked, setIsSessionChecked] = useState(false); 

  useEffect(() => {
    fetchClasses();
    fetchCoachOptions();
    fetchClassNameOptions();
    checkUserAndGoogleConnection(); 
  }, []);

  const checkUserAndGoogleConnection = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    setUserSession(session);

    if (error || !session?.user) {
        console.warn("No active Supabase session or error:", error);
        setIsGoogleConnected(false);
        setIsSessionChecked(true);
        return;
    }

    const { data, error: tokenError } = await supabase
      .from('google_integrations')
      .select('id')
      .eq('user_id', session.user.id)
      .maybeSingle(); 

    const connected = !!data && !tokenError;
    setIsGoogleConnected(connected);
    setIsSessionChecked(true); 
  };

  const handleConnectGoogle = async () => {
    if (!userSession?.user) {
      alert("You must be logged in to connect your Google account.");
      return;
    }
    
    const res = await fetch(`/api/auth/callback/google?auth_url_only=true&user_id=${userSession.user.id}`);
    const data = await res.json();

    if (res.ok && data.authUrl) {
      window.location.href = data.authUrl;
    } else {
      alert('Failed to initiate Google connection. Check API route setup.');
    }
  };

  const fetchClasses = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('classlist').select('*').order('id', { ascending: false }); 
    if (error) {
      alert('Fetch error: ' + error.message);
      setClasses([]);
    } else {
      setClasses(data || []);
    }
    setLoading(false);
  };

  // 👇 CORRECTED: Fetching both coach name and coach_display_id
  const fetchCoachOptions = async () => {
    const { data, error } = await supabase.from('coaches').select('name, coach_display_id');
    if (!error) {
      // Store the objects { name, coach_display_id }
      setCoachOptions(data || []);
    }
  };

  const fetchClassNameOptions = async () => {
    const { data, error } = await supabase.from('coaches').select('specialty');
    if (!error) {
      const uniqueSpecialties = [...new Set(data.map(c => c.specialty))];
      setClassNameOptions(uniqueSpecialties);
    }
  };

  const handleAddClick = () => {
    if (!isGoogleConnected) {
        alert("You must connect your Google account first to schedule a class with a Meet link.");
        return;
    }
    setEditingId(null);
    setFormData({
      coach: '',
      class_name: '',
      status: '',
      hour: '10',
      minute: '00',
      ampm: 'AM',
      level: '',
      date: '',
    });
    setShowForm(true);
  };

  const handleEditClick = (cls) => {
    let hour = '10', minute = '00', ampm = 'AM';
    if (cls.time) {
      const parts = cls.time.split(':'); 
      if (parts.length === 2) {
        let hInt = parseInt(parts[0]);
        minute = parts[1];
        if (hInt >= 12) {
          ampm = 'PM';
          hour = (hInt === 12 ? 12 : hInt - 12).toString().padStart(2, '0');
        } else {
          ampm = 'AM';
          hour = (hInt === 0 ? 12 : hInt).toString().padStart(2, '0');
        }
      }
    }
    // For editing, you need to set coach back to the ID (cls.coach_id) if available
    setEditingId(cls.id);
    setFormData({ ...cls, coach: cls.coach_id || cls.coach, hour, minute, ampm });
    setShowForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  function convertTo24Hour(hour, minute, ampm) {
    let h = parseInt(hour);
    if (ampm === 'PM' && h !== 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return `${h.toString().padStart(2, '0')}:${minute.padStart(2, '0')}`;
  }

  // 👇 CORRECTED: No longer fetching coach ID; it's already in formData.coach
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!userSession) {
        alert('Authentication error. Please log in again.');
        return;
    }
    if (!isGoogleConnected) {
        alert('Google account not connected. Please connect it before scheduling a class.');
        return;
    }
    
    if (editingId !== null) {
        alert("Editing is not yet supported for classes with Google Meet links. Please delete and re-add.");
        return;
    }

    const time24 = convertTo24Hour(formData.hour, formData.minute, formData.ampm);
    
    // --- 1. Map Coach ID and Name ---
    const selectedCoach = coachOptions.find(opt => opt.coach_display_id === formData.coach);

    if (!selectedCoach) {
        alert("Selected coach ID is invalid. Please select a coach from the dropdown.");
        return;
    }
    
    // --- 2. Create Final Payload ---
    let classData = {
      // Store the Coach Name (for display purposes)
      coach: selectedCoach.name, 
      // Store the Coach ID (for database reference)
      coach_id: formData.coach, 
      class_name: formData.class_name,
      status: formData.status,
      time: time24,
      level: formData.level,
      date: formData.date,
    };

    try {
      const res = await fetch('/api/create-meet', {
        method: 'POST',
        body: JSON.stringify(classData), // Payload now includes coach_id and coach name
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userSession.access_token}` 
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert('API Error: ' + (errorData.error || 'Failed to create class.'));
        return;
      }

      const data = await res.json();
      alert('Class added with Google Meet link!');
      setShowForm(false);
      fetchClasses();
    } catch (error) {
      console.error('Network or server error:', error);
      alert('Network or server error: ' + (error.message || 'An unknown error occurred.'));
    }
  };
  // 👆 END of handleFormSubmit

  const handleDeleteClick = async (id) => {
    if (!window.confirm("Are you sure you want to delete this class?")) return;
    const { error } = await supabase.from('classlist').delete().eq('id', id);
    if (error) alert('Delete error: ' + error.message);
    else fetchClasses();
  };

  const handleShareClick = (cls) => {
    setSharedClass(cls);
    setShowShareModal(true);
  };

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 fw-bold">Class List</h2>
        <div className="d-flex gap-2">
            
            {!isSessionChecked ? (
                <button className="btn btn-secondary" disabled>Loading...</button>
            ) : !isGoogleConnected ? (
                <button onClick={handleConnectGoogle} className="btn btn-warning">
                    Connect Google 🤝
                </button>
            ) : (
                <button className="btn btn-success" disabled>
                    Google Connected ✅
                </button>
            )}
            
            <button onClick={handleAddClick} className="btn btn-success" disabled={!isGoogleConnected || !isSessionChecked}>
              + Add Class
            </button>
        </div>
      </div>

      {showForm && (
        <div className="modal fade show d-block custom-modal-overlay">
          <div className="modal-dialog">
            <div className="modal-content shadow custom-modal-content">
              <div className="modal-header custom-modal-header">
                <h5 className="modal-title">{editingId !== null ? 'Edit Class' : 'Add Class'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowForm(false)}></button>
              </div>
              <form onSubmit={handleFormSubmit}>
                <div className="modal-body custom-modal-body">
                  <div className="mb-3">
                    <label className="form-label">Coach</label>
                    <select
                      required
                      className="form-select"
                      name="coach"
                      value={formData.coach} // Value is now coach_display_id
                      onChange={handleInputChange}
                    >
                      <option value="">Select Coach</option>
                      {/* 👇 CORRECTED: Use coach_display_id as the value, but show name */}
                      {coachOptions.map((coach, idx) => (
                        <option key={idx} value={coach.coach_display_id}>
                          {coach.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Class Name</label>
                    <select
                      required
                      className="form-select"
                      name="class_name"
                      value={formData.class_name}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Class</option>
                      {classNameOptions.map((cls, idx) => (
                        <option key={idx} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select
                      required
                      className="form-select"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Status</option>
                      <option value="Scheduled">Scheduled</option>
                      <option value="Live">Live</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Time</label>
                    <div className="d-flex gap-2">
                      <select name="hour" className="form-select" value={formData.hour} onChange={handleInputChange}>
                        {Array.from({ length: 12 }, (_, i) => {
                          const val = (i + 1).toString().padStart(2, '0');
                          return (
                            <option key={i} value={val}>
                              {val}
                            </option>
                          );
                        })}
                      </select>
                      <select name="minute" className="form-select" value={formData.minute} onChange={handleInputChange}>
                        {Array.from({ length: 60 }, (_, i) => {
                          const val = i.toString().padStart(2, '0');
                          return (
                            <option key={i} value={val}>
                              {val}
                            </option>
                          );
                        })}
                      </select>
                      <select name="ampm" className="form-select" value={formData.ampm} onChange={handleInputChange}>
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Level</label>
                    <select
                      required
                      className="form-select"
                      name="level"
                      value={formData.level}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Level</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Date</label>
                    <input type="date" className="form-control" name="date" value={formData.date} onChange={handleInputChange} required />
                  </div>
                </div>
                <div className="modal-footer custom-modal-footer">
                  <button type="submit" className="btn btn-primary" disabled={!isGoogleConnected}>
                    {editingId !== null ? 'Update' : 'Add'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="table table-bordered table-striped">
          <thead className="table-secondary">
            <tr>
              <th>S.No</th>
              <th>Coach</th>
              <th>Class Name</th>
              <th>Status</th>
              <th>Time</th>
              <th>Level</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((cls, idx) => (
              <tr key={cls.id}>
                <td>{idx + 1}</td>
                <td>{cls.coach}</td>
                <td>{cls.class_name}</td>
                <td>{cls.status}</td>
                <td>{cls.time}</td>
                <td>{cls.level}</td>
                <td>{cls.date}</td>
                <td>
                  <div className="d-flex gap-2">
                    <button className="btn btn-warning btn-sm" onClick={() => handleEditClick(cls)}>
                      Edit
                    </button>
                    {cls.meet_link ? (
                        <button className="btn btn-secondary btn-sm" onClick={() => handleShareClick(cls)}>
                          Share
                        </button>
                    ) : (
                        <button className="btn btn-secondary btn-sm" disabled>
                          No Link
                        </button>
                    )}
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteClick(cls.id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showShareModal && sharedClass && (
        <div className="modal fade show d-block custom-modal-overlay">
          <div className="modal-dialog">
            <div className="modal-content shadow custom-modal-content">
              <div className="modal-header custom-modal-header">
                <h5 className="modal-title">Class Details &amp; Meet Link</h5>
                <button type="button" className="btn-close" onClick={() => setShowShareModal(false)}></button>
              </div>
              <div className="modal-body custom-modal-body">
                <p>
                  <strong>Coach:</strong> {sharedClass.coach}
                </p>
                <p>
                  <strong>Class Name:</strong> {sharedClass.class_name}
                </p>
                <p>
                  <strong>Status:</strong> {sharedClass.status}
                </p>
                <p>
                  <strong>Time:</strong> {sharedClass.time}
                </p>
                <p>
                  <strong>Level:</strong> {sharedClass.level}
                </p>
                <p>
                  <strong>Date:</strong> {sharedClass.date}
                </p>
                <p>
                  <strong>Google Meet Link:</strong>{' '}
                  <a href={sharedClass.meet_link} target="_blank" rel="noopener noreferrer">
                    {sharedClass.meet_link || "N/A"}
                  </a>
                  {sharedClass.meet_link && (
                    <button
                      className="btn btn-outline-primary btn-sm ms-2"
                      onClick={() => navigator.clipboard.writeText(sharedClass.meet_link)}
                    >
                      Copy Link
                    </button>
                  )}
                </p>
              </div>
              <div className="modal-footer custom-modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowShareModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-modal-overlay {
          background: rgba(0, 0, 0, 0.4);
          position: fixed !important;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1050;
        }
        .custom-modal-content {
          max-height: 80vh;
          display: flex;
          flex-direction: column;
        }
        .custom-modal-header,
        .custom-modal-footer {
          flex-shrink: 0;
          position: sticky;
          background: #fff;
          z-index: 1;
        }
        .custom-modal-header {
          top: 0;
        }
        .custom-modal-footer {
          bottom: 0;
        }
        .custom-modal-body {
          overflow-y: auto;
          max-height: 70vh;
        }
      `}</style>
    </div>
  );
}