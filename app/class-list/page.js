'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function ClassList() {
  const [classes, setClasses] = useState([]);
  const [editingClassId, setEditingClassId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [formData, setFormData] = useState({});

  // Fetch classes
  useEffect(() => {
    async function fetchClasses() {
      const { data, error } = await supabase
        .from('classlist')
        .select('*')
        .order('id');
      if (error) {
        alert('Fetch error: ' + error.message);
        return;
      }
      setClasses(data || []);
    }
    fetchClasses();
  }, []);

  const handleEditClick = (cls) => {
    setEditingClassId(cls.id);
    setFormData({ ...cls });
  };

  const handleCancel = () => {
    setEditingClassId(null);
    setAdding(false);
    setFormData({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ FIXED UPDATE (remove id)
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    const { id, ...classBody } = formData; // strip id
    const { data, error } = await supabase
      .from('classlist')
      .update(classBody)
      .eq('id', editingClassId)
      .select();
    if (error) {
      alert('Update error: ' + error.message);
      return;
    }
    if (data && data.length) {
      setClasses((prev) =>
        prev.map((c) => (c.id === editingClassId ? data[0] : c))
      );
    }
    setEditingClassId(null);
    setFormData({});
  };

  const handleDeleteClick = async (id) => {
    const { error } = await supabase.from('classlist').delete().eq('id', id);
    if (error) {
      alert('Delete error: ' + error.message);
      return;
    }
    setClasses((prev) => prev.filter((c) => c.id !== id));
  };

  const handleAddClick = () => {
    setAdding(true);
    setFormData({
      coach: '',
      class_name: '',
      status: '',
      time: '',
      level: '',
      date: ''
    });
  };

  // ✅ FIXED INSERT (ignore id)
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const { id, ...classBody } = formData; // strip id
    const { data, error } = await supabase
      .from('classlist')
      .insert([classBody])
      .select();
    if (error) {
      alert('Insert error: ' + error.message);
      return;
    }
    if (data && data.length) setClasses((prev) => [...prev, data[0]]);
    setAdding(false);
    setFormData({});
  };

  return (
    <div className="container max-w-6xl bg-white p-5 rounded shadow my-4">
      <style jsx>{`
        .class-table {
          table-layout: auto;
          width: 100%;
        }
        .class-table th,
        .class-table td {
          vertical-align: middle;
          text-align: left;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .class-table th:last-child,
        .class-table td:last-child {
          text-align: center;
        }
        .action-buttons {
          display: flex;
          gap: 8px;
          justify-content: center;
        }
      `}</style>

      <div className="d-flex align-items-center mb-4">
        <h2 className="h4 fw-semibold">Class List</h2>
        <div className="ms-auto">
          {!adding && (
            <button
              onClick={handleAddClick}
              className="btn btn-success mb-3 px-4 py-2 rounded shadow-sm"
              disabled={editingClassId !== null}
            >
              + Add Class
            </button>
          )}
        </div>
      </div>

      {/* Add Class Form */}
      {adding && (
        <form
          onSubmit={handleAddSubmit}
          className="mb-4 border p-3 rounded bg-light"
        >
          <h5 className="mb-3">Add New Class</h5>
          <div className="row g-3">
            <div className="col-md-4">
              <input
                type="text"
                name="coach"
                className="form-control"
                placeholder="Coach Name"
                value={formData.coach}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="col-md-4">
              <input
                type="text"
                name="class_name"
                className="form-control"
                placeholder="Class Name"
                value={formData.class_name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="col-md-4">
              <select
                name="status"
                className="form-select"
                value={formData.status}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Status</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Live">Live</option>
              </select>
            </div>
            <div className="col-md-4">
              <input
                type="time"
                name="time"
                className="form-control"
                value={formData.time}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="col-md-4">
              <select
                name="level"
                className="form-select"
                value={formData.level}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Level</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div className="col-md-4">
              <input
                type="date"
                name="date"
                className="form-control"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <div className="mt-3">
            <button type="submit" className="btn btn-primary me-2">
              Save
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <table className="table table-bordered table-striped class-table">
        <thead className="table-secondary">
          <tr>
            <th>S.No</th>
            <th>Coach</th>
            <th>Class</th>
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
              {editingClassId === cls.id ? (
                <>
                  <td>
                    <input
                      type="text"
                      name="coach"
                      className="form-control"
                      value={formData.coach}
                      onChange={handleInputChange}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="class_name"
                      className="form-control"
                      value={formData.class_name}
                      onChange={handleInputChange}
                    />
                  </td>
                  <td>
                    <select
                      name="status"
                      className="form-select"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="Live">Live</option>
                    </select>
                  </td>
                  <td>
                    <input
                      type="time"
                      name="time"
                      className="form-control"
                      value={formData.time}
                      onChange={handleInputChange}
                    />
                  </td>
                  <td>
                    <select
                      name="level"
                      className="form-select"
                      value={formData.level}
                      onChange={handleInputChange}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </td>
                  <td>
                    <input
                      type="date"
                      name="date"
                      className="form-control"
                      value={formData.date}
                      onChange={handleInputChange}
                    />
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={handleUpdateSubmit}
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
                  <td>{cls.coach}</td>
                  <td>{cls.class_name}</td>
                  <td>{cls.status}</td>
                  <td>{cls.time}</td>
                  <td>{cls.level}</td>
                  <td>{cls.date}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleEditClick(cls)}
                        className="btn btn-warning btn-sm me-2"
                        disabled={adding || editingClassId !== null}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(cls.id)}
                        className="btn btn-danger btn-sm"
                        disabled={adding || editingClassId !== null}
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