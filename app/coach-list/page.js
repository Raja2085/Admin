'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function CoachList() {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCoach, setEditingCoach] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    email: '',
    phone: '',
    location: ''
  });

  useEffect(() => {
    fetchCoaches();
  }, []);

  const fetchCoaches = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('coaches')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.log('Fetch Error:', error);
      setCoaches([]);
    } else {
      setCoaches(data || []);
    }
    setLoading(false);
  };

  const handleAddClick = () => {
    setEditingCoach(null);
    setFormData({ name: '', specialty: '', email: '', phone: '', location: '' });
    setShowForm(true);
  };

  const handleEditClick = (coach) => {
    setEditingCoach(coach.id);
    setFormData({ ...coach });
    setShowForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (editingCoach !== null) {
      const { error } = await supabase
        .from('coaches')
        .update(formData)
        .eq('id', editingCoach);
      if (error) alert('Update error: ' + error.message);
    } else {
      const { error } = await supabase
        .from('coaches')
        .insert([formData]);
      if (error) alert('Insert error: ' + error.message);
    }

    setShowForm(false);
    setEditingCoach(null);
    setFormData({ name: '', specialty: '', email: '', phone: '', location: '' });
    fetchCoaches();
  };

  const handleDeleteClick = async (id) => {
    const { error } = await supabase
      .from('coaches')
      .delete()
      .eq('id', id);
    if (error) alert('Delete error: ' + error.message);
    else fetchCoaches();
  };

  function formatId(id) {
    return id.toString().padStart(4, '0');
  }

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 fw-bold">Coach List</h2>
        <button onClick={handleAddClick} className="btn btn-success">+ Add Coach</button>
      </div>

      {showForm && (
        <div className="modal fade show d-block custom-modal-overlay">
          <div className="modal-dialog">
            <div className="modal-content shadow custom-modal-content">
              <div className="modal-header custom-modal-header">
                <h5 className="modal-title">{editingCoach ? 'Edit Coach' : 'Add Coach'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowForm(false)}></button>
              </div>
              <form onSubmit={handleFormSubmit}>
                <div className="modal-body custom-modal-body">
                  {[
                    { label: 'Name', name: 'name', type: 'text' },
                    { label: 'Specialty', name: 'specialty', type: 'text' },
                    { label: 'Email', name: 'email', type: 'email' },
                    { label: 'Phone', name: 'phone', type: 'text' },
                    { label: 'Location', name: 'location', type: 'text' }
                  ].map(field => (
                    <div className="mb-3" key={field.name}>
                      <label className="form-label">{field.label}</label>
                      <input
                        required
                        type={field.type}
                        name={field.name}
                        className="form-control"
                        value={formData[field.name]}
                        onChange={handleInputChange}
                      />
                    </div>
                  ))}
                </div>
                <div className="modal-footer custom-modal-footer">
                  <button type="submit" className="btn btn-primary">{editingCoach ? 'Update' : 'Add'}</button>
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
              <th>Coach ID</th>
              <th>Name</th>
              <th>Specialty</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Location</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {coaches.map((coach, idx) => (
              <tr key={coach.id}>
                <td>{idx + 1}</td>
                <td>{formatId(coach.id)}</td>
                <td>{coach.name}</td>
                <td>{coach.specialty}</td>
                <td>{coach.email}</td>
                <td>{coach.phone}</td>
                <td>{coach.location}</td>
                <td>
                  <div className="d-flex gap-2">
                    <button onClick={() => handleEditClick(coach)} className="btn btn-warning btn-sm">Edit</button>
                    <button onClick={() => handleDeleteClick(coach.id)} className="btn btn-danger btn-sm">Delete</button>
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