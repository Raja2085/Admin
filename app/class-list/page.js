'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function ClassList() {
  const [classes, setClasses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({
    class_name: '', coach: '', status: '', time: '', level: '', date: ''
  });

  // Fetch classes from Supabase
  const fetchClasses = async () => {
    const { data, error } = await supabase
      .from('classlist')
      .select('*')
      .order('id', { ascending: true });

    if (error) console.error('Error fetching classes:', error);
    else setClasses(data);
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleAddClick = () => {
    setEditingClass(null);
    setFormData({ class_name: '', coach: '', status: '', time: '', level: '', date: '' });
    setShowForm(true);
  };

  const handleEditClick = (cls) => {
    setEditingClass(cls.id);
    setFormData({ ...cls });
    setShowForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (editingClass) {
      // Update class
      const { error } = await supabase
        .from('classlist')
        .update(formData)
        .eq('id', editingClass);

      if (error) console.error('Update error:', error);
    } else {
      // Insert new class
      const { error } = await supabase
        .from('classlist')
        .insert([formData]);

      if (error) console.error('Insert error:', error);
    }

    setShowForm(false);
    fetchClasses();
  };

  const handleDeleteClick = async (id) => {
    const { error } = await supabase
      .from('classlist')
      .delete()
      .eq('id', id);

    if (error) console.error('Delete error:', error);
    else fetchClasses();
  };

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 fw-bold">Class List</h2>
        <button onClick={handleAddClick} className="btn btn-success">+ Add Class</button>
      </div>

      {showForm && (
        <form onSubmit={handleFormSubmit} className="mb-4 bg-light p-3 rounded shadow-sm">
          <div className="row mb-3">
            <div className="col-md-6 mb-2">
              <input required type="text" name="class_name" placeholder="Class Name" className="form-control" value={formData.class_name} onChange={handleInputChange}/>
            </div>
            <div className="col-md-6 mb-2">
              <input required type="text" name="coach" placeholder="Coach Name" className="form-control" value={formData.coach} onChange={handleInputChange}/>
            </div>
            <div className="col-md-6 mb-2">
              <select required name="status" className="form-select" value={formData.status} onChange={handleInputChange}>
                <option value="">Select Status</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Live">Live</option>
              </select>
            </div>
            <div className="col-md-6 mb-2">
              <input required type="time" name="time" className="form-control" value={formData.time} onChange={handleInputChange}/>
            </div>
            <div className="col-md-6 mb-2">
              <select required name="level" className="form-select" value={formData.level} onChange={handleInputChange}>
                <option value="">Select Level</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div className="col-md-6 mb-2">
              <input required type="date" name="date" className="form-control" value={formData.date} onChange={handleInputChange}/>
            </div>
          </div>
          <div className="d-flex justify-content-end gap-2">
            <button type="submit" className="btn btn-primary">{editingClass ? 'Update Class' : 'Add Class'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      <table className="table table-bordered">
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
              <td>{cls.class_name}</td>
              <td>{cls.coach}</td>
              <td>{cls.status}</td>
              <td>{cls.time}</td>
              <td>{cls.level}</td>
              <td>{cls.date}</td>
              <td>
                <button onClick={() => handleEditClick(cls)} className="btn btn-warning btn-sm me-2">Edit</button>
                <button onClick={() => handleDeleteClick(cls.id)} className="btn btn-danger btn-sm">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}