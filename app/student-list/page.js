'use client';

import { useState, useEffect } from 'react';
import { Table, Button, Form, Row, Col, Card, InputGroup, FormControl } from 'react-bootstrap';
import { supabase } from '../../lib/supabaseClient';

function generateRegNo() {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

const initialStudent = {
  class_type: '',
  group_name: '',
  members: [{ name: '', reg_no: '', dob: '', email: '', phone: '', place: '' }],
};

const initialIndividual = {
  name: '',
  reg_no: '',
  dob: '',
  email: '',
  phone: '',
  place: '',
  class_type: '',
};

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [addFormVisible, setAddFormVisible] = useState(false);
  const [addFormData, setAddFormData] = useState({ ...initialIndividual });
  const [searchTerm, setSearchTerm] = useState('');
  const [classTypeFilter, setClassTypeFilter] = useState('');

  // **Add edit states**
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    fetchStudents();
  }, []);

  async function fetchStudents() {
    const { data, error } = await supabase.from('student_list').select('*');
    if (!error) {
      setStudents(data || []);
      setFilteredStudents(data || []);
    }
  }

  function handleSearch() {
    let result = students;
    const term = searchTerm.trim().toLowerCase();
    if (classTypeFilter) {
      result = result.filter(
        (stu) => (stu.class_type || '').toLowerCase() === classTypeFilter
      );
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

  function handleAddInputChange(e) {
    const { name, value } = e.target;
    if (name === 'class_type' && value === 'Group') {
      setAddFormData({
        class_type: 'Group',
        group_name: '',
        members: [{ name: '', reg_no: '', dob: '', email: '', phone: '', place: '' }],
      });
      return;
    }
    if (name === 'class_type' && value === 'Individual') {
      setAddFormData({ ...initialIndividual, class_type: 'Individual' });
      return;
    }
    setAddFormData((prev) => {
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
    setAddFormData((prev) => ({
      ...prev,
      members: prev.members.map((m, i) => (i === idx ? { ...m, [name]: value } : m)),
    }));
  }

  function handleAddMember() {
    setAddFormData((prev) => ({
      ...prev,
      members: [...prev.members, { name: '', reg_no: '', dob: '', email: '', phone: '', place: '' }],
    }));
  }

  function handleRemoveMember(idx) {
    setAddFormData((prev) => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== idx),
    }));
  }

  async function handleAddSubmit(e) {
    e.preventDefault();
    if (addFormData.class_type === 'Individual') {
      const reg_no = addFormData.reg_no || generateRegNo();
      const insertData = { ...addFormData, reg_no };
      const { error } = await supabase.from('student_list').insert([insertData]);
      if (error) {
        alert('Insert failed: ' + error.message);
      } else {
        setAddFormVisible(false);
        setAddFormData({ ...initialIndividual });
        fetchStudents();
      }
    } else {
      const members = addFormData.members.map((m) => ({
        ...m,
        reg_no: m.reg_no || generateRegNo(),
        class_type: 'Group',
        group_name: addFormData.group_name,
      }));
      const membersToSave = members.filter((m) => m.name);
      if (membersToSave.length === 0) {
        alert('Please enter at least one member with a name.');
        return;
      }
      const { error } = await supabase.from('student_list').insert(membersToSave);
      if (error) {
        alert('Insert failed: ' + error.message);
      } else {
        setAddFormVisible(false);
        setAddFormData({ ...initialStudent });
        fetchStudents();
      }
    }
  }

  // **Edit related functions**

  function startEdit(student) {
    setEditingStudentId(student.id);
    setEditFormData(student);
  }

  function cancelEdit() {
    setEditingStudentId(null);
    setEditFormData({});
  }

  function handleEditInputChange(e) {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function saveEdit() {
    const { id, ...updates } = editFormData;
    if (!editFormData.name) {
      alert("Name is required");
      return;
    }
    const { error } = await supabase.from('student_list').update(updates).eq('id', id);
    if (error) {
      alert("Update failed: " + error.message);
    } else {
      setEditingStudentId(null);
      setEditFormData({});
      fetchStudents();
    }
  }

  async function deleteStudent(id) {
    if (!confirm("Are you sure to delete this student?")) return;
    const { error } = await supabase.from('student_list').delete().eq('id', id);
    if (error) {
      alert("Delete failed: " + error.message);
    } else {
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
            <FormControl
              placeholder="Search by name, email, class or group"
              value={searchTerm}
              onChange={handleSearchInput}
              style={{ borderRadius: '6px' }}
            />
            <Button
              variant="primary"
              onClick={handleSearch}
              style={{ minWidth: '85px', maxWidth: '100px', borderRadius: '6px' }}
            >
              Search
            </Button>
          </InputGroup>
        </Col>
        <Col md={3} className="text-end">
          <Button variant="success" onClick={() => setAddFormVisible(true)}>
            + Add Student
          </Button>
        </Col>
      </Row>

      {addFormVisible && (
        <Card className="mb-4 p-3">
          <Form onSubmit={handleAddSubmit}>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-2">
                  <Form.Label>Class Type</Form.Label>
                  <Form.Select name="class_type" value={addFormData.class_type || ''} onChange={handleAddInputChange} required>
                    <option value="">Select</option>
                    <option value="Individual">Individual</option>
                    <option value="Group">Group</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            {addFormData.class_type === 'Group' && (
              <>
                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-2">
                      <Form.Label>Group Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="group_name"
                        value={addFormData.group_name || ''}
                        onChange={handleAddInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={12}>
                    <div className="mb-2" style={{ fontWeight: '500' }}>
                      Group Members
                    </div>
                    <div className="bg-light rounded p-3">
                      {addFormData.members.map((member, idx) => (
                        <Row key={idx} className="mb-2">
                          <Col md={2}>
                            <Form.Control
                              placeholder="Name"
                              name="name"
                              value={member.name}
                              onChange={(e) => handleMemberChange(idx, e)}
                              required
                            />
                          </Col>
                          <Col md={2}>
                            <Form.Control placeholder="Reg No (auto)" name="reg_no" value={member.reg_no || generateRegNo()} disabled />
                          </Col>
                          <Col md={2}>
                            <Form.Control type="date" name="dob" value={member.dob} onChange={(e) => handleMemberChange(idx, e)} />
                          </Col>
                          <Col md={2}>
                            <Form.Control type="email" placeholder="Email" name="email" value={member.email} onChange={(e) => handleMemberChange(idx, e)} />
                          </Col>
                          <Col md={2}>
                            <Form.Control type="text" placeholder="Phone" name="phone" value={member.phone} onChange={(e) => handleMemberChange(idx, e)} />
                          </Col>
                          <Col md={1}>
                            <Form.Control type="text" placeholder="Place" name="place" value={member.place} onChange={(e) => handleMemberChange(idx, e)} />
                          </Col>
                          <Col md={1} className="d-flex align-items-center">
                            {addFormData.members.length > 1 && (
                              <Button variant="danger" onClick={() => handleRemoveMember(idx)} size="sm" className="ms-1">
                                Remove
                              </Button>
                            )}
                          </Col>
                        </Row>
                      ))}
                      <Button variant="primary" size="sm" className="me-2 mt-2" onClick={handleAddMember}>
                        Add Member
                      </Button>
                    </div>
                  </Col>
                </Row>
              </>
            )}
            {addFormData.class_type === 'Individual' && (
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-2">
                    <Form.Label>Name</Form.Label>
                    <Form.Control name="name" value={addFormData.name} onChange={handleAddInputChange} required />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-2">
                    <Form.Label>Reg No</Form.Label>
                    <Form.Control name="reg_no" value={addFormData.reg_no || generateRegNo()} onChange={handleAddInputChange} required />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-2">
                    <Form.Label>DOB</Form.Label>
                    <Form.Control type="date" name="dob" value={addFormData.dob} onChange={handleAddInputChange} />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-2">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" name="email" value={addFormData.email} onChange={handleAddInputChange} />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-2">
                    <Form.Label>Phone</Form.Label>
                    <Form.Control type="text" name="phone" value={addFormData.phone} onChange={handleAddInputChange} />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-2">
                    <Form.Label>Place</Form.Label>
                    <Form.Control type="text" name="place" value={addFormData.place} onChange={handleAddInputChange} />
                  </Form.Group>
                </Col>
              </Row>
            )}
            <div className="mt-4">
              <Button variant="success" type="submit" className="me-2">
                Save
              </Button>
              <Button variant="secondary" onClick={() => setAddFormVisible(false)}>
                Cancel
              </Button>
            </div>
          </Form>
        </Card>
      )}

      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>Reg No</th>
            <th>Name</th>
            <th>DOB</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Place</th>
            <th>Class Type</th>
            <th>Group Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.length === 0 && (
            <tr>
              <td colSpan="9" className="text-center">
                No students found.
              </td>
            </tr>
          )}
          {filteredStudents.map((student) => (
            <tr key={student.id}>
              <td>{student.reg_no}</td>
              <td>{student.name}</td>
              <td>{student.dob}</td>
              <td>{student.email}</td>
              <td>{student.phone}</td>
              <td>{student.place}</td>
              <td>{student.class_type}</td>
              <td>{student.group_name}</td>
              <td>
                <Button
                  variant="warning"
                  size="sm"
                  className="me-1"
                  onClick={() => {
                    setEditingStudentId(student.id);
                    setEditFormData(student);
                  }}>
                  Edit
                </Button>
                <Button variant="danger" size="sm" onClick={() => deleteStudent(student.id)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
