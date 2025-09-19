'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function DemoClasses() {
  const [classes, setClasses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    coach: '',
    time: '',
    duration: '',
    level: '',
    description: ''
  });

  // Fetch demo classes from Supabase on mount
  useEffect(() => {
    async function fetchClasses() {
      const { data, error } = await supabase
        .from('demo_classes')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        console.error('Error fetching classes:', error);
      } else {
        setClasses(data);
      }
    }
    fetchClasses();
  }, []);

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Show form to add new class
  const handleAddClick = () => {
    setEditingClass(null);
    setFormData({ title: '', coach: '', time: '', duration: '', level: '', description: '' });
    setShowForm(true);
  };

  // Show form to edit existing class
  const handleEditClick = (cls) => {
    setEditingClass(cls.id);
    setFormData({ ...cls });
    setShowForm(true);
  };

  // Delete class from database
  const handleDeleteClick = async (id) => {
    const { error } = await supabase
      .from('demo_classes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting class:', error);
    } else {
      setClasses(prev => prev.filter(c => c.id !== id));
    }
  };

  // Handle form submission for add/edit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (editingClass !== null) {
      // Update existing class
      const { error } = await supabase
        .from('demo_classes')
        .update(formData)
        .eq('id', editingClass);

      if (error) {
        console.error('Error updating class:', error);
      } else {
        setClasses(prev => prev.map(c => c.id === editingClass ? { ...formData, id: editingClass } : c));
        setShowForm(false);
      }
    } else {
      // Insert new class
      const { data, error } = await supabase
        .from('demo_classes')
        .insert([formData])
        .select();

      if (error) {
        console.error('Error adding class:', error);
      } else {
        setClasses(prev => [...prev, data[0]]);
        setShowForm(false);
      }
    }
  };

  return (
    <div className="container my-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 fw-bold">Demo Classes</h2>
        <button onClick={handleAddClick} className="btn btn-success rounded">
          + Add Demo Class
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleFormSubmit} className="mb-4 bg-light p-3 rounded shadow-sm">
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <input required type="text" name="title" placeholder="Class Title" className="form-control" value={formData.title} onChange={handleInputChange} />
            </div>
            <div className="col-md-6">
              <input required type="text" name="coach" placeholder="Coach Name" className="form-control" value={formData.coach} onChange={handleInputChange} />
            </div>
            <div className="col-md-6">
              <input required type="text" name="time" placeholder="Time (e.g. 10:00 AM)" className="form-control" value={formData.time} onChange={handleInputChange} />
            </div>
            <div className="col-md-6">
              <input required type="text" name="duration" placeholder="Duration (e.g. 1 hr)" className="form-control" value={formData.duration} onChange={handleInputChange} />
            </div>
            <div className="col-md-6">
              <select required name="level" className="form-select" value={formData.level} onChange={handleInputChange}>
                <option value="">Select Level</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div className="col-12">
              <input required type="text" name="description" placeholder="Short Description" className="form-control" value={formData.description} onChange={handleInputChange} />
            </div>
          </div>
          <div className="d-flex justify-content-end gap-2">
            <button type="submit" className="btn btn-primary rounded">
              {editingClass !== null ? 'Update Demo Class' : 'Add Demo Class'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary rounded">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Table */}
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
                <div className="btn-group" role="group">
                  <button onClick={() => handleEditClick(cls)} className="btn btn-warning btn-sm me-2 rounded">
                    Edit
                  </button>
                  <button onClick={() => handleDeleteClick(cls.id)} className="btn btn-danger btn-sm rounded">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
