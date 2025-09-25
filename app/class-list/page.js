'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function ClassList() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    coach: '',
    class_name: '',
    status: '',
    hour: '10',
    minute: '00',
    ampm: 'AM',
    level: '',
    date: ''
  });

  const [coachOptions, setCoachOptions] = useState([]);
  const [classNameOptions, setClassNameOptions] = useState([]);

  useEffect(() => {
    fetchClasses();
    fetchCoachOptions();
    fetchClassNameOptions();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('classlist')
      .select('*')
      .order('id');
    if (error) {
      alert('Fetch error: ' + error.message);
      setClasses([]);
    } else {
      setClasses(data || []);
    }
    setLoading(false);
  };

  const fetchCoachOptions = async () => {
    const { data, error } = await supabase
      .from('coaches')
      .select('name', { count: 'exact' });

    if (!error) {
      const uniqueCoaches = [...new Set(data.map(c => c.name))];
      setCoachOptions(uniqueCoaches);
    }
  };

  const fetchClassNameOptions = async () => {
    const { data, error } = await supabase
      .from('coaches')
      .select('specialty', { count: 'exact' });

    if (!error) {
      const uniqueSpecialties = [...new Set(data.map(c => c.specialty))];
      setClassNameOptions(uniqueSpecialties);
    }
  };

  const handleAddClick = () => {
    setEditingId(null);
    setFormData({
      coach: '',
      class_name: '',
      status: '',
      hour: '10',
      minute: '00',
      ampm: 'AM',
      level: '',
      date: ''
    });
    setShowForm(true);
  };

  const handleEditClick = (cls) => {
    let hour = '10', minute = '00', ampm = 'AM';
    if (cls.time) {
      const parts = cls.time.split(/[: ]/);
      if (parts.length === 3) [hour, minute, ampm] = parts;
    }
    setEditingId(cls.id);
    setFormData({ ...cls, hour, minute, ampm });
    setShowForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const time = `${formData.hour}:${formData.minute} ${formData.ampm}`;
    const dbData = { ...formData, time };
    delete dbData.hour;
    delete dbData.minute;
    delete dbData.ampm;

    if (editingId !== null) {
      const { id, ...updateData } = dbData; 
      const { error } = await supabase
        .from('classlist')
        .update(updateData)
        .eq('id', editingId);
      if (error) alert('Update error: ' + error.message);
    } else {
      const { error } = await supabase
        .from('classlist')
        .insert([dbData]);
      if (error) alert('Insert error: ' + error.message);
    }

    setShowForm(false);
    setEditingId(null);
    setFormData({
      coach: '',
      class_name: '',
      status: '',
      hour: '10',
      minute: '00',
      ampm: 'AM',
      level: '',
      date: ''
    });
    fetchClasses();
  };

  const handleDeleteClick = async (id) => {
    const { error } = await supabase
      .from('classlist')
      .delete()
      .eq('id', id);
    if (error) alert('Delete error: ' + error.message);
    else fetchClasses();
  };

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 fw-bold">Class List</h2>
        <button onClick={handleAddClick} className="btn btn-success">+ Add Class</button>
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
                      value={formData.coach}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Coach</option>
                      {coachOptions.map((coach, idx) => (
                        <option key={idx} value={coach}>{coach}</option>
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
                        <option key={idx} value={cls}>{cls}</option>
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
                          return <option key={i} value={val}>{val}</option>
                        })}
                      </select>
                      <select name="minute" className="form-select" value={formData.minute} onChange={handleInputChange}>
                        {Array.from({ length: 60 }, (_, i) => {
                          const val = i.toString().padStart(2, '0');
                          return <option key={i} value={val}>{val}</option>
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
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      className="form-control"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer custom-modal-footer">
                  <button type="submit" className="btn btn-primary">{editingId !== null ? 'Update' : 'Add'}</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? <p>Loading...</p> : (
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
                    <button className="btn btn-warning btn-sm" onClick={() => handleEditClick(cls)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteClick(cls.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <style jsx>{`
        .custom-modal-overlay {
          background: rgba(0,0,0,0.4);
          position: fixed !important;
          top:0; left:0; width:100vw; height:100vh;
          display:flex; justify-content:center; align-items:center;
          z-index:1050;
        }
        .custom-modal-content {
          max-height: 80vh;
          display:flex;
          flex-direction:column;
        }
        .custom-modal-header, .custom-modal-footer {
          flex-shrink:0;
          position: sticky;
          background:#fff;
          z-index:1;
        }
        .custom-modal-header { top:0; }
        .custom-modal-footer { bottom:0; }
        .custom-modal-body { overflow-y:auto; max-height:70vh; }
      `}</style>
    </div>
  );
}
