'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function DemoClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    coach: '',
    hour: '10',
    minute: '00',
    ampm: 'AM',
    duration: '',
    level: '',
    description: ''
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('demo_classes')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.log('Fetch Error:', error);
      setClasses([]);
    } else {
      setClasses(data || []);
    }
    setLoading(false);
  };

  const handleAddClick = () => {
    setEditingClass(null);
    setFormData({
      title: '', coach: '', hour: '10', minute: '00', ampm: 'AM',
      duration: '', level: '', description: ''
    });
    setShowForm(true);
  };

  const handleEditClick = (cls) => {
    // Parse stored time into hour/minute/AMPM
    let hour = '10', minute = '00', ampm = 'AM';
    if (cls.time) {
      const parts = cls.time.split(/[: ]/); // e.g., "10:30 AM"
      if (parts.length === 3) {
        [hour, minute, ampm] = parts;
      }
    }
    setEditingClass(cls.id);
    setFormData({ ...cls, hour, minute, ampm });
    setShowForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Merge hour/minute/AMPM into time string
    const time = `${formData.hour}:${formData.minute} ${formData.ampm}`;
    const dbData = { ...formData, time };
    delete dbData.hour;
    delete dbData.minute;
    delete dbData.ampm;

    if (editingClass !== null) {
      const { error } = await supabase
        .from('demo_classes')
        .update(dbData)
        .eq('id', editingClass);
      if (error) alert('Update error: ' + error.message);
    } else {
      const { error } = await supabase
        .from('demo_classes')
        .insert([dbData]);
      if (error) alert('Insert error: ' + error.message);
    }

    setShowForm(false);
    setEditingClass(null);
    setFormData({
      title: '', coach: '', hour: '10', minute: '00', ampm: 'AM',
      duration: '', level: '', description: ''
    });
    fetchClasses();
  };

  const handleDeleteClick = async (id) => {
    const { error } = await supabase
      .from('demo_classes')
      .delete()
      .eq('id', id);
    if (error) alert('Delete error: ' + error.message);
    else fetchClasses();
  };

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 fw-bold">Demo Classes</h2>
        <button onClick={handleAddClick} className="btn btn-success">+ Add Demo Class</button>
      </div>

      {showForm && (
        <div className="modal fade show d-block custom-modal-overlay">
          <div className="modal-dialog">
            <div className="modal-content shadow custom-modal-content">
              <div className="modal-header custom-modal-header">
                <h5 className="modal-title">{editingClass !== null ? 'Edit Demo Class' : 'Add Demo Class'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowForm(false)}></button>
              </div>
              <form onSubmit={handleFormSubmit}>
                <div className="modal-body custom-modal-body">
                  {[
                    { label: 'Class Title', name: 'title', type: 'text' },
                    { label: 'Coach Name', name: 'coach', type: 'text' },
                    { label: 'Duration', name: 'duration', type: 'text', placeholder: 'e.g. 1 hr' },
                    { label: 'Description', name: 'description', type: 'textarea' }
                  ].map(field => (
                    <div className="mb-3" key={field.name}>
                      <label className="form-label">{field.label}</label>
                      {field.type === 'textarea' ? (
                        <textarea
                          required
                          name={field.name}
                          rows={3}
                          className="form-control"
                          value={formData[field.name]}
                          onChange={handleInputChange}
                        ></textarea>
                      ) : (
                        <input
                          required
                          type={field.type}
                          name={field.name}
                          placeholder={field.placeholder || ''}
                          className="form-control"
                          value={formData[field.name]}
                          onChange={handleInputChange}
                        />
                      )}
                    </div>
                  ))}

                  {/* Time Selector */}
                  <div className="mb-3">
                    <label className="form-label">Time</label>
                    <div className="d-flex gap-2">
                      <select name="hour" required className="form-select" value={formData.hour} onChange={handleInputChange}>
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i + 1} value={(i + 1 < 10 ? '0' : '') + (i + 1)}>
                            {(i + 1 < 10 ? '0' : '') + (i + 1)}
                          </option>
                        ))}
                      </select>
                      <select name="minute" required className="form-select" value={formData.minute} onChange={handleInputChange}>
                        {Array.from({ length: 60 }, (_, i) => (
                          <option key={i} value={(i < 10 ? '0' : '') + i}>
                            {(i < 10 ? '0' : '') + i}
                          </option>
                        ))}
                      </select>
                      <select name="ampm" required className="form-select" value={formData.ampm} onChange={handleInputChange}>
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Level</label>
                    <select name="level" required className="form-select" value={formData.level} onChange={handleInputChange}>
                      <option value="">Select Level</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer custom-modal-footer">
                  <button type="submit" className="btn btn-primary">{editingClass !== null ? 'Update' : 'Add'}</button>
                  <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
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
              <th>Title</th>
              <th>Coach</th>
              <th>Time</th>
              <th>Duration</th>
              <th>Level</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((cls, idx) => (
              <tr key={cls.id}>
                <td>{idx + 1}</td>
                <td>{cls.title}</td>
                <td>{cls.coach}</td>
                <td>{cls.time}</td>
                <td>{cls.duration}</td>
                <td>{cls.level}</td>
                <td>{cls.description}</td>
                <td>
                  <div className="d-flex gap-2">
                    <button onClick={() => handleEditClick(cls)} className="btn btn-warning btn-sm">Edit</button>
                    <button onClick={() => handleDeleteClick(cls.id)} className="btn btn-danger btn-sm">Delete</button>
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
          top: 0; left: 0; width: 100vw; height: 100vh;
          display: flex; justify-content: center; align-items: center;
          z-index: 1050;
        }
        .custom-modal-content {
          max-height: 80vh;
          display: flex;
          flex-direction: column;
        }
        .custom-modal-header, .custom-modal-footer {
          flex-shrink: 0;
          position: sticky;
          background: #fff;
          z-index: 1;
        }
        .custom-modal-header { top: 0; }
        .custom-modal-footer { bottom: 0; }
        .custom-modal-body { overflow-y: auto; max-height: 70vh; }
      `}</style>
    </div>
  );
}
