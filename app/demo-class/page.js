'use client';
import { useState } from 'react';

export default function DemoClasses() {
  const [classes, setClasses] = useState([
    { id: 1, title: "Java Programming", coach: "Anita Sharma", time: "10:00 AM", duration: "1 hr", level: "Beginner", description: "Introduction to Java programming covering basic syntax, variables, loops, and OOP concepts." },
    { id: 2, title: "Python Programming", coach: "Ravi Kumar", time: "01:00 PM", duration: "1.5 hrs", level: "Intermediate", description: "Learn Python programming including data structures, functions, file handling, and libraries." },
    { id: 3, title: "C++ Programming", coach: "Priya Nair", time: "03:30 PM", duration: "1 hr", level: "Advanced", description: "Master C++ programming with classes, pointers, memory management, and STL." },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({
    title: '', coach: '', time: '', duration: '', level: '', description: ''
  });

  const handleAddClick = () => {
    setEditingClass(null);
    setFormData({ title: '', coach: '', time: '', duration: '', level: '', description: '' });
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
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 fw-bold">Demo Classes</h2>
        <button
          onClick={handleAddClick}
          className="btn btn-success rounded"
        >
          + Add Demo Class
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleFormSubmit} className="mb-4 bg-light p-3 rounded shadow-sm">
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <input required type="text" name="title" placeholder="Class Title" className="form-control" value={formData.title} onChange={handleInputChange}/>
            </div>
            <div className="col-md-6">
              <input required type="text" name="coach" placeholder="Coach Name" className="form-control" value={formData.coach} onChange={handleInputChange}/>
            </div>
            <div className="col-md-6">
              <input required type="text" name="time" placeholder="Time (e.g. 10:00 AM)" className="form-control" value={formData.time} onChange={handleInputChange}/>
            </div>
            <div className="col-md-6">
              <input required type="text" name="duration" placeholder="Duration (e.g. 1 hr)" className="form-control" value={formData.duration} onChange={handleInputChange}/>
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
              <input required type="text" name="description" placeholder="Short Description" className="form-control" value={formData.description} onChange={handleInputChange}/>
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
