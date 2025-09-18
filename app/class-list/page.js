'use client';
import { useState } from 'react';

export default function ClassList() {
  const [classes, setClasses] = useState([
    { id: 1, className: "Java", coach: "Anita Sharma", status: "Scheduled", time: "07:00", level: "Low", date: "2025-09-10" },
    { id: 2, className: "Python", coach: "Ravi Kumar", status: "Live", time: "18:00", level: "High", date: "2025-09-11" },
    { id: 3, className: "C++", coach: "Priya Nair", status: "Scheduled", time: "17:30", level: "Medium", date: "2025-09-12" },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({
    className: '', coach: '', status: '', time: '', level: '', date: ''
  });

  const handleAddClick = () => {
    setEditingClass(null);
    setFormData({ className: '', coach: '', status: '', time: '', level: '', date: '' });
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

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (editingClass !== null) {
      setClasses(prev => prev.map(c => c.id === editingClass ? { ...formData, id: editingClass } : c));
    } else {
      const newId = classes.length > 0 ? Math.max(...classes.map(c => c.id)) + 1 : 1;
      setClasses(prev => [...prev, { ...formData, id: newId }]);
    }
    setShowForm(false);
  };

  const handleDeleteClick = (id) => {
    setClasses(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="container my-4">
      {/* Header with Add Button */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 fw-bold">Class List</h2>
        <button
          onClick={handleAddClick}
          className="btn btn-success"
        >
          + Add Class
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleFormSubmit} className="mb-4 bg-light p-3 rounded shadow-sm">
          <div className="row mb-3">
            <div className="col-md-6 mb-2">
              <input required type="text" name="className" placeholder="Class Name" className="form-control" value={formData.className} onChange={handleInputChange}/>
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
            <button type="submit" className="btn btn-primary">
              {editingClass !== null ? 'Update Class' : 'Add Class'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Class Table */}
      <table className="table table-bordered">
        <thead className="table-secondary">
          <tr>
            <th>S.No</th>
            <th>Class</th>
            <th>Coach</th>
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
              <td>{cls.className}</td>
              <td>{cls.coach}</td>
              <td>{cls.status}</td>
              <td>{cls.time}</td>
              <td>{cls.level}</td>
              <td>{cls.date}</td>
              <td>
                <button onClick={() => handleEditClick(cls)} className="btn btn-warning btn-sm me-2">
                  Edit
                </button>
                <button onClick={() => handleDeleteClick(cls.id)} className="btn btn-danger btn-sm">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
