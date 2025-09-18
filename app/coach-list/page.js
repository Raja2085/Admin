'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function CoachList() {
  const [coaches, setCoaches] = useState([]);
  const [editingCoachId, setEditingCoachId] = useState(null);
  const [adding, setAdding] = useState(false); // track add form state
  const [formData, setFormData] = useState({});

  useEffect(() => {
    async function fetchCoaches() {
      const { data, error } = await supabase
        .from('coaches')
        .select('*')
        .order('id');
      if (error) {
        alert('Fetch error: ' + error.message);
        return;
      }
      setCoaches(data || []);
    }
    fetchCoaches();
  }, []);

  const handleEditClick = (coach) => {
    setEditingCoachId(coach.id);
    setFormData({ ...coach });
  };

  const handleCancel = () => {
    setEditingCoachId(null);
    setAdding(false);
    setFormData({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const coachBody = { ...formData };
    const { data, error } = await supabase
      .from('coaches')
      .update(coachBody)
      .eq('id', editingCoachId)
      .select();
    if (error) {
      alert('Update error: ' + error.message);
      return;
    }
    if (data && data.length) {
      setCoaches(prev => prev.map(c => c.id === editingCoachId ? data[0] : c));
    }
    setEditingCoachId(null);
    setFormData({});
  };

  const handleDeleteClick = async (id) => {
    const { error } = await supabase
      .from('coaches')
      .delete()
      .eq('id', id);
    if (error) {
      alert('Delete error: ' + error.message);
      return;
    }
    setCoaches(prev => prev.filter(c => c.id !== id));
  };

  const handleAddClick = () => {
    setAdding(true);
    setFormData({
      name: '',
      specialty: '',
      email: '',
      phone: '',
      location: ''
    });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const coachBody = { ...formData };
    const { data, error } = await supabase
      .from('coaches')
      .insert([coachBody])
      .select();
    if (error) {
      alert('Insert error: ' + error.message);
      return;
    }
    if (data && data.length) setCoaches(prev => [...prev, data[0]]);
    setAdding(false);
    setFormData({});
  };

  function formatId(id) {
    return id.toString().padStart(4, '0');
  }

  return (
    <div className="container max-w-6xl bg-white p-5 rounded shadow my-4">
      <style jsx>{`
        .coach-table {
          table-layout: auto;
          width: 100%;
        }
        .coach-table th,
        .coach-table td {
          vertical-align: middle;
          text-align: left;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .coach-table th:last-child,
        .coach-table td:last-child {
          text-align: center;
        }
        .action-buttons {
          display: flex;
          gap: 8px;
          justify-content: center;
        }
      `}</style>

      <div className="d-flex align-items-center mb-4">
        <h2 className="h4 fw-semibold">Coach List</h2>
        <div className="ms-auto">
          {!adding && (
            <button
              onClick={handleAddClick}
              className="btn btn-success mb-3 px-4 py-2 rounded shadow-sm"
              disabled={editingCoachId !== null}
            >
              + Add Coach
            </button>
          )}
        </div>
      </div>

      {/* Add Coach Form at Top */}
      {adding && (
        <form onSubmit={handleAddSubmit} className="mb-4 border p-3 rounded bg-light">
          <h5 className="mb-3">Add New Coach</h5>
          <div className="row g-3">
            <div className="col-md-4">
              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="Name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="col-md-4">
              <input
                type="text"
                name="specialty"
                className="form-control"
                placeholder="Specialty"
                value={formData.specialty}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="col-md-4">
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="col-md-4">
              <input
                type="text"
                name="phone"
                className="form-control"
                placeholder="Phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="col-md-4">
              <input
                type="text"
                name="location"
                className="form-control"
                placeholder="Location"
                value={formData.location}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <div className="mt-3">
            <button type="submit" className="btn btn-primary me-2">Save</button>
            <button type="button" onClick={handleCancel} className="btn btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      {/* Table of Coaches */}
      <table className="table table-bordered table-striped coach-table">
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
              {editingCoachId === coach.id ? (
                <>
                  <td>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="specialty"
                      className="form-control"
                      value={formData.specialty}
                      onChange={handleInputChange}
                    />
                  </td>
                  <td>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="phone"
                      className="form-control"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="location"
                      className="form-control"
                      value={formData.location}
                      onChange={handleInputChange}
                    />
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={handleFormSubmit}
                        className="btn btn-primary btn-sm me-2"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="btn btn-secondary btn-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </>
              ) : (
                <>
                  <td>{coach.name}</td>
                  <td>{coach.specialty}</td>
                  <td>{coach.email}</td>
                  <td>{coach.phone}</td>
                  <td>{coach.location}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleEditClick(coach)}
                        className="btn btn-warning btn-sm me-2"
                        disabled={adding || editingCoachId !== null}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(coach.id)}
                        className="btn btn-danger btn-sm"
                        disabled={adding || editingCoachId !== null}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}