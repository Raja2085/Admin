'use client';
import { useState } from 'react';

export default function Assessments() {
  const [assessments, setAssessments] = useState([
    { id: 1, course: "Java Basics", duration: "1 hr", date: "2025-09-15", startTime: "10:00 AM", endTime: "11:00 AM", totalMarks: 50, level: "Beginner" },
    { id: 2, course: "Python Intermediate", duration: "1.5 hrs", date: "2025-09-17", startTime: "02:00 PM", endTime: "03:30 PM", totalMarks: 75, level: "Intermediate" },
    { id: 3, course: "C++ Advanced", duration: "2 hrs", date: "2025-09-20", startTime: "11:30 AM", endTime: "01:30 PM", totalMarks: 100, level: "Advanced" },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    course: '', duration: '', date: '', startTime: '', endTime: '', totalMarks: '', level: ''
  });

  const handleAddClick = () => {
    setEditingId(null);
    setFormData({ course: '', duration: '', date: '', startTime: '', endTime: '', totalMarks: '', level: '' });
    setShowForm(true);
  };

  const handleEditClick = (assessment) => {
    setEditingId(assessment.id);
    setFormData({ ...assessment });
    setShowForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (editingId !== null) {
      setAssessments(prev =>
        prev.map(a => a.id === editingId ? { ...formData, id: editingId } : a)
      );
    } else {
      const newId = assessments.length > 0 ? Math.max(...assessments.map(a => a.id)) + 1 : 1;
      setAssessments(prev => [...prev, { ...formData, id: newId }]);
    }
    setShowForm(false);
  };

  const handleDeleteClick = (id) => {
    setAssessments(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="container my-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 fw-bold">Assessments</h2>
        <button
          onClick={handleAddClick}
          className="btn btn-success"
        >
          + Add Assessment
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleFormSubmit} className="mb-4 bg-light p-3 rounded shadow-sm">
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <input required type="text" name="course" placeholder="Course Name"
                className="form-control" value={formData.course} onChange={handleInputChange} />
            </div>
            <div className="col-md-6">
              <input required type="text" name="duration" placeholder="Duration (e.g. 1 hr)"
                className="form-control" value={formData.duration} onChange={handleInputChange} />
            </div>
            <div className="col-md-6">
              <input required type="date" name="date"
                className="form-control" value={formData.date} onChange={handleInputChange} />
            </div>
            <div className="col-md-6">
              <input required type="text" name="startTime" placeholder="Start Time (e.g. 10:00 AM)"
                className="form-control" value={formData.startTime} onChange={handleInputChange} />
            </div>
            <div className="col-md-6">
              <input required type="text" name="endTime" placeholder="End Time (e.g. 11:00 AM)"
                className="form-control" value={formData.endTime} onChange={handleInputChange} />
            </div>
            <div className="col-md-6">
              <input required type="number" name="totalMarks" placeholder="Total Marks"
                className="form-control" value={formData.totalMarks} onChange={handleInputChange} />
            </div>
            <div className="col-md-6">
              <select required name="level"
                className="form-select" value={formData.level} onChange={handleInputChange}>
                <option value="">Select Level</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>
          <div className="d-flex justify-content-end gap-2">
            <button type="submit" className="btn btn-primary">
              {editingId !== null ? 'Update Assessment' : 'Add Assessment'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="btn btn-secondary">
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
            <th>Course</th>
            <th>Duration</th>
            <th>Date</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Total Marks</th>
            <th>Level</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {assessments.map((a, idx) => (
            <tr key={a.id}>
              <td>{idx + 1}</td>
              <td>{a.course}</td>
              <td>{a.duration}</td>
              <td>{a.date}</td>
              <td>{a.startTime}</td>
              <td>{a.endTime}</td>
              <td>{a.totalMarks}</td>
              <td>{a.level}</td>
              <td>
                <button onClick={() => handleEditClick(a)}
                  className="btn btn-warning btn-sm me-2">
                  Edit
                </button>
                <button onClick={() => handleDeleteClick(a.id)}
                  className="btn btn-danger btn-sm">
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
