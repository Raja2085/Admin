'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function Assessments() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    course: '',
    duration: '',
    date: '',
    startHour: '10',
    startMinute: '00',
    startAMPM: 'AM',
    endHour: '11',
    endMinute: '00',
    endAMPM: 'AM',
    totalMarks: '',
    level: ''
  });
  const [viewingQuestionsFor, setViewingQuestionsFor] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);

  const mapDbToState = (data) =>
    data.map(({ start_time, end_time, total_marks, ...rest }) => {
      const [sh, sm, sampm] = start_time.match(/(\d+):(\d+) (\w+)/).slice(1);
      const [eh, em, eampm] = end_time.match(/(\d+):(\d+) (\w+)/).slice(1);
      return {
        ...rest,
        startHour: sh,
        startMinute: sm,
        startAMPM: sampm,
        endHour: eh,
        endMinute: em,
        endAMPM: eampm,
        totalMarks: total_marks
      };
    });

  const mapStateToDb = (data) => ({
    course: data.course,
    duration: data.duration,
    date: data.date,
    start_time: `${data.startHour}:${data.startMinute} ${data.startAMPM}`,
    end_time: `${data.endHour}:${data.endMinute} ${data.endAMPM}`,
    total_marks: Number(data.totalMarks),
    level: data.level
  });

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.log('Fetch Error:', error);
      setAssessments([]);
    } else {
      setAssessments(mapDbToState(data || []));
    }
    setLoading(false);
  };

  const handleAddClick = () => {
    setEditingId(null);
    setFormData({
      course: '',
      duration: '',
      date: '',
      startHour: '10',
      startMinute: '00',
      startAMPM: 'AM',
      endHour: '11',
      endMinute: '00',
      endAMPM: 'AM',
      totalMarks: '',
      level: ''
    });
    setShowForm(true);
  };

  const handleEditClick = (a) => {
    setEditingId(a.id);
    setFormData({ ...a });
    setShowForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const dbData = mapStateToDb(formData);

    if (editingId) {
      const { error } = await supabase
        .from('assessments')
        .update(dbData)
        .eq('id', editingId);
      if (error) alert('Update error: ' + error.message);
    } else {
      const { error } = await supabase
        .from('assessments')
        .insert([dbData]);
      if (error) alert('Insert error: ' + error.message);
    }

    setShowForm(false);
    setEditingId(null);
    setFormData({
      course: '',
      duration: '',
      date: '',
      startHour: '10',
      startMinute: '00',
      startAMPM: 'AM',
      endHour: '11',
      endMinute: '00',
      endAMPM: 'AM',
      totalMarks: '',
      level: ''
    });
    fetchAssessments();
  };

  const handleDeleteClick = async (id) => {
    const { error } = await supabase
      .from('assessments')
      .delete()
      .eq('id', id);
    if (error) alert('Delete error: ' + error.message);
    else fetchAssessments();
  };

  const handleViewQuestions = async (id) => {
    setViewingQuestionsFor(id);
    setQuestionsLoading(true);
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('assessment_id', id);
    if (error) {
      alert('Failed to fetch questions: ' + error.message);
      setQuestions([]);
    } else {
      setQuestions(data || []);
    }
    setQuestionsLoading(false);
  };

  const closeQuestions = () => {
    setViewingQuestionsFor(null);
    setQuestions([]);
  };

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 fw-bold">Assessments</h2>
        <button onClick={handleAddClick} className="btn btn-success">+ Add Assessment</button>
      </div>

      {showForm && (
        <div className="modal fade show d-block custom-modal-overlay">
          <div className="modal-dialog">
            <div className="modal-content shadow custom-modal-content">
              <div className="modal-header custom-modal-header">
                <h5 className="modal-title">{editingId ? 'Edit Assessment' : 'Add Assessment'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowForm(false)}></button>
              </div>
              <form onSubmit={handleFormSubmit}>
                <div className="modal-body custom-modal-body">
                  {['course','duration','date','totalMarks'].map((field) => (
                    <div className="mb-3" key={field}>
                      <label className="form-label">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                      <input
                        required
                        type={field==='totalMarks'?'number':field==='date'?'date':'text'}
                        name={field}
                        className="form-control"
                        value={formData[field]}
                        onChange={handleInputChange}
                      />
                    </div>
                  ))}

                  {/* Start Time */}
                  <div className="mb-3">
                    <label className="form-label">Start Time</label>
                    <div className="d-flex gap-2">
                      <select name="startHour" className="form-select" value={formData.startHour} onChange={handleInputChange}>
                        {Array.from({ length: 12 }, (_, i) => <option key={i} value={(i+1).toString().padStart(2,'0')}>{(i+1).toString().padStart(2,'0')}</option>)}
                      </select>
                      <select name="startMinute" className="form-select" value={formData.startMinute} onChange={handleInputChange}>
                        {Array.from({ length: 60 }, (_, i) => <option key={i} value={i.toString().padStart(2,'0')}>{i.toString().padStart(2,'0')}</option>)}
                      </select>
                      <select name="startAMPM" className="form-select" value={formData.startAMPM} onChange={handleInputChange}>
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </div>

                  {/* End Time */}
                  <div className="mb-3">
                    <label className="form-label">End Time</label>
                    <div className="d-flex gap-2">
                      <select name="endHour" className="form-select" value={formData.endHour} onChange={handleInputChange}>
                        {Array.from({ length: 12 }, (_, i) => <option key={i} value={(i+1).toString().padStart(2,'0')}>{(i+1).toString().padStart(2,'0')}</option>)}
                      </select>
                      <select name="endMinute" className="form-select" value={formData.endMinute} onChange={handleInputChange}>
                        {Array.from({ length: 60 }, (_, i) => <option key={i} value={i.toString().padStart(2,'0')}>{i.toString().padStart(2,'0')}</option>)}
                      </select>
                      <select name="endAMPM" className="form-select" value={formData.endAMPM} onChange={handleInputChange}>
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </div>

                  {/* Level */}
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
                  <button type="submit" className="btn btn-primary">{editingId?'Update':'Add'}</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {loading ? <p>Loading...</p> : (
        <>
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
              <th>Questions</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assessments.map((a, idx) => (
              <tr key={a.id}>
                <td>{idx+1}</td>
                <td>{a.course}</td>
                <td>{a.duration}</td>
                <td>{a.date}</td>
                <td>{`${a.startHour}:${a.startMinute} ${a.startAMPM}`}</td>
                <td>{`${a.endHour}:${a.endMinute} ${a.endAMPM}`}</td>
                <td>{a.totalMarks}</td>
                <td>{a.level}</td>
                <td>
                  <button onClick={() => handleViewQuestions(a.id)} className="btn btn-info btn-sm">View</button>
                </td>
                <td>
                  <button onClick={() => handleEditClick(a)} className="btn btn-warning btn-sm me-2">Edit</button>
                  <button onClick={() => handleDeleteClick(a.id)} className="btn btn-danger btn-sm">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Questions Modal */}
        {viewingQuestionsFor && (
          <div className="modal fade show d-block custom-modal-overlay">
            <div className="modal-dialog modal-lg">
              <div className="modal-content shadow custom-modal-content">
                <div className="modal-header custom-modal-header">
                  <h5 className="modal-title">Questions for Assessment #{viewingQuestionsFor}</h5>
                  <button type="button" className="btn-close" onClick={closeQuestions}></button>
                </div>
                <div className="modal-body custom-modal-body">
                  {questionsLoading ? <p>Loading questions...</p> :
                  questions.length === 0 ? <p>No questions found.</p> :
                  <ol>
                    {questions.map(q => (
                      <li key={q.id}>
                        <p><strong>Q:</strong> {q.question}</p>
                        <ul>
                          {q.options.map((opt,i)=><li key={i}>{opt}</li>)}
                        </ul>
                        <p><em>Answer: {q.answer}</em></p>
                      </li>
                    ))}
                  </ol>}
                </div>
                <div className="modal-footer custom-modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeQuestions}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}
        </>
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