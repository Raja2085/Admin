'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Form,
  Row,
  Col,
  Card,
  InputGroup,
  FormControl,
} from 'react-bootstrap';
import { supabase } from '../../lib/supabaseClient';

function generateRegNo() {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

const initialIndividual = {
  name: '',
  reg_no: '',
  dob: '',
  email: '',
  phone: '',
  place: '',
  class_type: '',
  group_name: '',
  members: [{ name: '', reg_no: generateRegNo(), dob: '', email: '', phone: '', place: '' }],
};

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [mode, setMode] = useState('add');
  const [formData, setFormData] = useState({ ...initialIndividual });
  const [searchTerm, setSearchTerm] = useState('');
  const [classTypeFilter, setClassTypeFilter] = useState('');
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [inlineEditingId, setInlineEditingId] = useState(null);
  const [courseOptions, setCourseOptions] = useState([]);

  const editInputStyle = {
    height: '32px',
    padding: '0 6px',
    fontSize: '0.85rem',
    border: '1px solid #ced4da',
    borderRadius: '4px',
    boxSizing: 'border-box',
    verticalAlign: 'middle',
    width: '100%',
  };

  useEffect(() => {
    fetchStudents();
    fetchCourseOptions();
  }, []);

  async function fetchStudents() {
    const { data, error } = await supabase
      .from('student_list')
      .select('*')
      .order('id', { ascending: true });
    if (!error) {
      setStudents(data || []);
      setFilteredStudents(data || []);
    } else {
      console.error('Fetch students error:', error);
      setStudents([]);
      setFilteredStudents([]);
    }
  }

  async function fetchCourseOptions() {
    const { data, error } = await supabase
      .from('classlist')
      .select('class_name');
    if (!error) {
      setCourseOptions((data || []).map(row => row.class_name));
    }
  }

  function handleSearch() {
    let result = students;
    const term = searchTerm.trim().toLowerCase();
    if (classTypeFilter) {
      result = result.filter((stu) => (stu.class_type || '').toLowerCase() === classTypeFilter);
    }
    if (term) {
      result = result.filter((student) =>
        ['name', 'email', 'class_type', 'group_name', 'place'].some((field) =>
          (student[field] || '').toLowerCase().includes(term)
        )
      );
    }
    setFilteredStudents(result);
  }

  function handleSearchInput(e) {
    setSearchTerm(e.target.value);
  }

  function handleClassTypeFilterChange(e) {
    setClassTypeFilter(e.target.value.toLowerCase());
  }

  // Fix here: generate Reg No once when opening modal
  function openAddModal() {
    setMode('add');
    setFormData({ ...initialIndividual, class_type: '', reg_no: generateRegNo() });
    setShowForm(true);
    setEditingStudentId(null);
  }

  function openEditModal(student) {
    setMode('edit');
    setEditingStudentId(student.id);
    setFormData({
      id: student.id,
      name: student.name || '',
      reg_no: student.reg_no || student.regNo || '',
      dob: student.dob || '',
      email: student.email || '',
      phone: student.phone || '',
      place: student.place || '',
      class_type: student.class_type || '',
      group_name: student.group_name || '',
      course: student.course || '',
      level: student.level || '',
    });
    setShowForm(true);
  }

  function closeModal() {
    setShowForm(false);
    setMode('add');
    setFormData({ ...initialIndividual });
    setEditingStudentId(null);
    setInlineEditingId(null);
  }

  function handleAddInputChange(e) {
    const { name, value } = e.target;
    if (name === 'class_type' && value === 'Group') {
      setFormData({
        class_type: 'Group',
        group_name: '',
        members: [{ name: '', reg_no: generateRegNo(), dob: '', email: '', phone: '', place: '' }],
      });
      return;
    }
    if (name === 'class_type' && value === 'Individual') {
      setFormData({ ...initialIndividual, class_type: 'Individual', reg_no: generateRegNo() });
      return;
    }
    setFormData((prev) => {
      if (prev.class_type === 'Group' && name === 'group_name') {
        return { ...prev, group_name: value };
      }
      if (prev.class_type === 'Individual') {
        return { ...prev, [name]: value };
      }
      return { ...prev, [name]: value };
    });
  }

  function handleMemberChange(idx, e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      members: prev.members.map((m, i) => (i === idx ? { ...m, [name]: value } : m)),
    }));
  }

  // Fix here: assign reg_no once when adding a member
  function handleAddMember() {
    setFormData((prev) => ({
      ...prev,
      members: [
        ...(prev.members || []),
        { name: '', reg_no: generateRegNo(), dob: '', email: '', phone: '', place: '' },
      ],
    }));
  }

  function handleRemoveMember(idx) {
    setFormData((prev) => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== idx),
    }));
  }

  async function initializeAttendanceForStudent(studentId) {
    const attendanceDates = Array.from({ length: 20 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (19 - i));
      return d.toISOString().slice(0, 10);
    });
    const attendanceData = attendanceDates.map((date) => ({
      student_id: studentId,
      attendance_date: date,
      status: 'A',
    }));
    const { error } = await supabase.from('attendance').insert(attendanceData);
    if (error) console.error('Error inserting attendance:', error);
  }

  async function handleAddSubmit(e) {
    e.preventDefault();

    if (formData.class_type === 'Individual') {
      const reg_no = formData.reg_no || generateRegNo();
      const insertData = {
        name: formData.name,
        reg_no,
        dob: formData.dob,
        email: formData.email,
        phone: formData.phone,
        place: formData.place,
        class_type: 'Individual',
        group_name: null,
      };

      const { data, error } = await supabase.from('student_list').insert([insertData]).select('id');
      if (error) {
        alert('Insert failed: ' + error.message);
      } else {
        if (data && data.length > 0) {
          await initializeAttendanceForStudent(data[0].id);
        }
        closeModal();
        fetchStudents();
      }
      return;
    }

    const members = (formData.members || []).map((m) => ({
      ...m,
      reg_no: m.reg_no || generateRegNo(),
      class_type: 'Group',
      group_name: formData.group_name || '',
    }));
    const membersToSave = members.filter((m) => m.name && m.name.trim());
    if (membersToSave.length === 0) {
      alert('Please enter at least one member with a name.');
      return;
    }
    const { data, error } = await supabase.from('student_list').insert(membersToSave).select('id, reg_no');
    if (error) {
      alert('Insert failed: ' + error.message);
    } else {
      if (data && data.length > 0) {
        for (const memberData of data) {
          await initializeAttendanceForStudent(memberData.id);
        }
      }
      closeModal();
      fetchStudents();
    }
  }

  function handleEditInputChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    const id = editingStudentId || formData.id;
    if (!id) {
      alert('No student selected to update.');
      return;
    }
    const updates = {
      name: formData.name,
      dob: formData.dob,
      email: formData.email,
      phone: formData.phone,
      place: formData.place,
      class_type: formData.class_type || 'Individual',
      group_name: formData.group_name || null,
      reg_no: formData.reg_no,
      course: formData.course,
      level: formData.level,
    };
    const { error } = await supabase.from('student_list').update(updates).eq('id', id);
    if (error) {
      alert('Update failed: ' + error.message);
    } else {
      closeModal();
      fetchStudents();
    }
  }

  async function deleteStudent(id) {
    if (!confirm('Are you sure to delete this student?')) return;
    const { error } = await supabase.from('student_list').delete().eq('id', id);
    if (error) {
      alert('Delete failed: ' + error.message);
    } else {
      fetchStudents();
    }
  }

  function startInlineEdit(student) {
    setInlineEditingId(student.id);
    setEditFormData(student);
  }

  function cancelInlineEdit() {
    setInlineEditingId(null);
    setEditFormData({});
  }

  async function saveInlineEdit() {
    const { id, ...updates } = editFormData;
    if (!editFormData.name) {
      alert('Name is required');
      return;
    }
    const { error } = await supabase.from('student_list').update(updates).eq('id', id);
    if (error) {
      alert('Update failed: ' + error.message);
    } else {
      setInlineEditingId(null);
      setEditFormData({});
      fetchStudents();
    }
  }

  return (
    <div className="container mt-4">
      <h2>Student List</h2>

      <Row className="align-items-center mb-3">
        <Col md={2}>
          <Form.Select value={classTypeFilter} onChange={handleClassTypeFilterChange}>
            <option value="">All Types</option>
            <option value="individual">Individual</option>
            <option value="group">Group</option>
          </Form.Select>
        </Col>
        <Col md={7}>
          <InputGroup>
            <FormControl placeholder="Search by name, email, class or group" value={searchTerm} onChange={handleSearchInput} style={{ borderRadius: '6px' }} />
            <Button variant="primary" onClick={handleSearch} style={{ minWidth: '85px', maxWidth: '100px', borderRadius: '6px' }}>
              Search
            </Button>
          </InputGroup>
        </Col>
        <Col md={3} className="text-end">
          <Button variant="success" onClick={openAddModal}>
            + Add Student
          </Button>
        </Col>
      </Row>

      {showForm && (
        <div className="modal fade show d-block custom-modal-overlay">
          <div className="modal-dialog modal-lg">
            <div className="modal-content shadow custom-modal-content">
              <div className="modal-header custom-modal-header">
                <h5 className="modal-title">{mode === 'add' ? 'Add Student' : 'Edit Student'}</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <form onSubmit={mode === 'add' ? handleAddSubmit : handleEditSubmit}>
                <div className="modal-body custom-modal-body">
                  {mode === 'add' ? (
                    <>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-2">
                            <Form.Label>Class Type</Form.Label>
                            <Form.Select name="class_type" value={formData.class_type || ''} onChange={handleAddInputChange} required>
                              <option value="">Select</option>
                              <option value="Individual">Individual</option>
                              <option value="Group">Group</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                      </Row>

                      {formData.class_type === 'Group' && (
                        <>
                          <Row>
                            <Col md={12}>
                              <Form.Group className="mb-2">
                                <Form.Label>Group Name</Form.Label>
                                <Form.Control type="text" name="group_name" value={formData.group_name || ''} onChange={handleAddInputChange} required />
                              </Form.Group>
                            </Col>
                          </Row>
                          <Row>
                            <Col md={12}>
                              <div className="mb-2" style={{ fontWeight: 500 }}>
                                Group Members
                              </div>
                              <div className="bg-light rounded p-3">
                                {(formData.members || []).map((member, idx) => (
                                  <Card key={idx} className="mb-3">
                                    <Card.Body>
                                      <Row className="mb-2">
                                        <Col md={4}>
                                          <Form.Group>
                                            <Form.Label>Name</Form.Label>
                                            <Form.Control 
                                              placeholder="Name" 
                                              name="name" 
                                              value={member.name} 
                                              onChange={(e) => handleMemberChange(idx, e)} 
                                              required 
                                            />
                                          </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                          <Form.Group>
                                            <Form.Label>Reg No (auto)</Form.Label>
                                            <Form.Control placeholder="Reg No (auto)" name="reg_no" value={member.reg_no} disabled />
                                          </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                          <Form.Group>
                                            <Form.Label>DOB</Form.Label>
                                            <Form.Control type="date" name="dob" value={member.dob} onChange={(e) => handleMemberChange(idx, e)} />
                                          </Form.Group>
                                        </Col>
                                      </Row>

                                      <Row className="mb-2">
                                        <Col md={4}>
                                          <Form.Group>
                                            <Form.Label>Email</Form.Label>
                                            <Form.Control type="email" placeholder="Email" name="email" value={member.email} onChange={(e) => handleMemberChange(idx, e)} />
                                          </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                          <Form.Group>
                                            <Form.Label>Phone</Form.Label>
                                            <Form.Control 
                                              type="tel" 
                                              placeholder="Phone" 
                                              name="phone" 
                                              value={member.phone} 
                                              maxLength={10} 
                                              onInput={(e) => (e.target.value = e.target.value.replace(/[^0-9]/g, ''))} 
                                              onChange={(e) => handleMemberChange(idx, e)} 
                                            />
                                          </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                          <Form.Group>
                                            <Form.Label>Place</Form.Label>
                                            <Form.Control type="text" placeholder="Place" name="place" value={member.place} onChange={(e) => handleMemberChange(idx, e)} />
                                          </Form.Group>
                                        </Col>
                                      </Row>

                                      <Row className="mb-2">
                                        <Col md={12} className="d-flex justify-content-end">
                                          {formData.members && formData.members.length > 1 && (
                                            <Button variant="danger" onClick={() => handleRemoveMember(idx)} size="sm" className="ms-1">
                                              Remove
                                            </Button>
                                          )}
                                        </Col>
                                      </Row>
                                    </Card.Body>
                                  </Card>
                                ))}
                                <Button variant="primary" size="sm" className="me-2 mt-2" onClick={handleAddMember}>
                                  Add Member
                                </Button>
                              </div>
                            </Col>
                          </Row>
                        </>
                      )}

                      {formData.class_type === 'Individual' && (
                        <Row>
                          <Col md={4}>
                            <Form.Group className="mb-2">
                              <Form.Label>Name</Form.Label>
                              <Form.Control name="name" value={formData.name || ''} onChange={handleAddInputChange} required />
                            </Form.Group>
                          </Col>
                          <Col md={4}>
                            <Form.Group className="mb-2">
                              <Form.Label>Reg No</Form.Label>
                              <Form.Control name="reg_no" value={formData.reg_no} onChange={handleAddInputChange} required />
                            </Form.Group>
                          </Col>
                          <Col md={4}>
                            <Form.Group className="mb-2">
                              <Form.Label>DOB</Form.Label>
                              <Form.Control type="date" name="dob" value={formData.dob || ''} onChange={handleAddInputChange} />
                            </Form.Group>
                          </Col>
                          <Col md={4}>
                            <Form.Group className="mb-2">
                              <Form.Label>Email</Form.Label>
                              <Form.Control type="email" name="email" value={formData.email || ''} onChange={handleAddInputChange} />
                            </Form.Group>
                          </Col>
                          <Col md={4}>
                            <Form.Group className="mb-2">
                              <Form.Label>Phone</Form.Label>
                              <Form.Control type="tel" name="phone" value={formData.phone || ''} maxLength={10} onInput={(e) => (e.target.value = e.target.value.replace(/[^0-9]/g, ''))} onChange={handleAddInputChange} />
                            </Form.Group>
                          </Col>
                          <Col md={4}>
                            <Form.Group className="mb-2">
                              <Form.Label>Place</Form.Label>
                              <Form.Control type="text" name="place" value={formData.place || ''} onChange={handleAddInputChange} />
                            </Form.Group>
                          </Col>
                        </Row>
                      )}
                    </>
                  ) : (
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-2">
                          <Form.Label>Name</Form.Label>
                          <Form.Control name="name" value={formData.name || ''} onChange={handleEditInputChange} required />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-2">
                          <Form.Label>Reg No</Form.Label>
                          <Form.Control name="reg_no" value={formData.reg_no || ''} onChange={handleEditInputChange} required />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-2">
                          <Form.Label>DOB</Form.Label>
                          <Form.Control type="date" name="dob" value={formData.dob || ''} onChange={handleEditInputChange} />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-2">
                          <Form.Label>Email</Form.Label>
                          <Form.Control type="email" name="email" value={formData.email || ''} onChange={handleEditInputChange} />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-2">
                          <Form.Label>Phone</Form.Label>
                          <Form.Control type="tel" name="phone" value={formData.phone || ''} maxLength={10} onInput={(e) => (e.target.value = e.target.value.replace(/[^0-9]/g, ''))} onChange={handleEditInputChange} />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-2">
                          <Form.Label>Place</Form.Label>
                          <Form.Control type="text" name="place" value={formData.place || ''} onChange={handleEditInputChange} />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-2">
                          <Form.Label>Class Type</Form.Label>
                          <Form.Select name="class_type" value={formData.class_type || 'Individual'} onChange={handleEditInputChange}>
                            <option value="Individual">Individual</option>
                            <option value="Group">Group</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      {formData.class_type === 'Group' && (
                        <Col md={12}>
                          <Form.Group className="mb-2">
                            <Form.Label>Group Name</Form.Label>
                            <Form.Control name="group_name" value={formData.group_name || ''} onChange={handleEditInputChange} />
                          </Form.Group>
                        </Col>
                      )}
                      <Col md={6}>
                        <Form.Group className="mb-2">
                          <Form.Label>Course</Form.Label>
                          <Form.Select
                            name="course"
                            value={formData.course || ''}
                            onChange={handleEditInputChange}
                            required
                          >
                            <option value="">Select Course</option>
                            {courseOptions.map((course, idx) => (
                              <option key={idx} value={course}>
                                {course}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-2">
                          <Form.Label>Level</Form.Label>
                          <Form.Select name="level" value={formData.level || ''} onChange={handleEditInputChange}>
                            <option value="">Select Level</option>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                  )}
                </div>
                <div className="modal-footer custom-modal-footer">
                  <button type="submit" className="btn btn-primary">{mode === 'add' ? 'Save' : 'Update'}</button>
                  <button type="button" onClick={closeModal} className="btn btn-secondary">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <Table
        bordered
        hover
        responsive
        style={{
          tableLayout: 'fixed',
          wordBreak: 'break-word',
          fontSize: '0.82rem',
        }}
      >
        <thead>
          <tr>
            <th style={{ width: '99px' }}>Reg No</th>
            <th style={{ width: '110px' }}>Name</th>
            <th style={{ width: '110px' }}>DOB</th>
            <th style={{ width: '180px' }}>Email</th>
            <th style={{ width: '120px' }}>Phone</th>
            <th style={{ width: '100px' }}>Place</th>
            <th style={{ width: '100px' }}>Class Type</th>
            <th style={{ width: '100px' }}>Group Name</th>
            <th style={{ width: '130px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.length === 0 ? (
            <tr>
              <td colSpan="9" className="text-center">No students found.</td>
            </tr>
          ) : (
            filteredStudents.map((student) => (
              <tr key={student.id}>
                <td style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{student.reg_no}</td>
                <td style={{ whiteSpace: 'normal', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {inlineEditingId === student.id ? (
                    <Form.Control
                      style={editInputStyle}
                      name="name"
                      value={editFormData.name || ''}
                      onChange={(e) =>
                        setEditFormData((prev) => ({ ...prev, name: e.target.value }))
                      }
                    />
                  ) : (
                    <div>
                      {student.name}
                      {student.level && student.level.trim() !== '' && (
                        <>
                          <br />
                          <span style={{ fontSize: '0.9em', color: '#888' }}>({student.level})</span>
                        </>
                      )}
                    </div>
                  )}
                </td>
                <td style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {inlineEditingId === student.id ? (
                    <Form.Control style={editInputStyle} type="date" name="dob" value={editFormData.dob || ''} onChange={(e) => setEditFormData((prev) => ({ ...prev, dob: e.target.value }))} />
                  ) : (
                    student.dob
                  )}
                </td>
                <td style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {inlineEditingId === student.id ? (
                    <Form.Control style={editInputStyle} type="email" name="email" value={editFormData.email || ''} onChange={(e) => setEditFormData((prev) => ({ ...prev, email: e.target.value }))} />
                  ) : (
                    student.email
                  )}
                </td>
                <td style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {inlineEditingId === student.id ? (
                    <Form.Control style={editInputStyle} type="tel" name="phone" value={editFormData.phone || ''} maxLength={10} onInput={(e) => (e.target.value = e.target.value.replace(/[^0-9]/g, ''))} onChange={(e) => setEditFormData((prev) => ({ ...prev, phone: e.target.value }))} />
                  ) : (
                    student.phone
                  )}
                </td>
                <td style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {inlineEditingId === student.id ? (
                    <Form.Control style={editInputStyle} type="text" name="place" value={editFormData.place || ''} onChange={(e) => setEditFormData((prev) => ({ ...prev, place: e.target.value }))} />
                  ) : (
                    student.place
                  )}
                </td>
                <td style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {inlineEditingId === student.id ? (
                    <Form.Select style={editInputStyle} name="class_type" value={editFormData.class_type || ''} onChange={(e) => setEditFormData((prev) => ({ ...prev, class_type: e.target.value }))}>
                      <option value="Individual">Individual</option>
                      <option value="Group">Group</option>
                    </Form.Select>
                  ) : (
                    student.class_type
                  )}
                </td>
                <td style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {inlineEditingId === student.id ? (
                    editFormData.class_type === 'Group' ? (
                      <Form.Control style={editInputStyle} name="group_name" value={editFormData.group_name || ''} onChange={(e) => setEditFormData((prev) => ({ ...prev, group_name: e.target.value }))} required />
                    ) : (
                      <Form.Control style={editInputStyle} name="group_name" value={editFormData.group_name || ''} disabled placeholder="N/A" />
                    )
                  ) : (
                    student.group_name
                  )}
                </td>
                <td style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {inlineEditingId === student.id ? (
                    <div style={{ display: 'flex', gap: '8px', flexDirection: 'row' }}>
                      <Button variant="success" size="sm" onClick={saveInlineEdit}>Save</Button>
                      <Button variant="secondary" size="sm" onClick={cancelInlineEdit}>Cancel</Button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px', flexDirection: 'row' }}>
                      <Button variant="warning" size="sm" onClick={() => openEditModal(student)}>Edit</Button>
                      <Button variant="danger" size="sm" onClick={() => deleteStudent(student.id)}>Delete</Button>
                    </div>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      <style jsx>{`
        .custom-modal-overlay {
          background: rgba(0,0,0,0.4);
          position: fixed !important;
          top: 0; left: 0; width: 100vw; height: 100vh;
          display: flex; justify-content: center; align-items: center;
          z-index: 1050;
        }
        .custom-modal-content {
          max-height: 90vh;
          display: flex;
          flex-direction: column;
        }
        .custom-modal-header, .custom-modal-footer {
          flex-shrink: 0;
          position: sticky;
          background: #fff;
          z-index: 1;
          padding: 1rem;
        }
        .custom-modal-header { top: 0; border-bottom: 1px solid #e9ecef; }
        .custom-modal-footer { bottom: 0; border-top: 1px solid #e9ecef; display: flex; justify-content: flex-end; gap: 0.5rem; padding: 0.75rem 1rem; }
        .custom-modal-body { overflow-y: auto; max-height: 70vh; padding: 1rem; }
      `}</style>
    </div>
  );
}
