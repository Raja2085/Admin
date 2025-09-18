'use client';

import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Form,
  Row,
  Col,
  Card,
  InputGroup,
  FormControl,
} from "react-bootstrap";
import { supabase } from "../../lib/supabaseClient";

function generateRegNo() {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

const initialStudent = {
  class_type: "",
  group_name: "",
  members: [{ name: "", reg_no: "", dob: "", email: "", phone: "", place: "" }],
};

const initialIndividual = {
  name: "",
  reg_no: "",
  dob: "",
  email: "",
  phone: "",
  place: "",
  class_type: "",
};

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [addFormVisible, setAddFormVisible] = useState(false);
  const [addFormData, setAddFormData] = useState({ ...initialIndividual });
  const [searchTerm, setSearchTerm] = useState("");
  const [classTypeFilter, setClassTypeFilter] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    // Apply filters and search
    let data = [...students];
    if (classTypeFilter) {
      data = data.filter(
        (item) =>
          (item.class_type || "").toLowerCase() ===
          classTypeFilter.toLowerCase()
      );
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      data = data.filter((item) =>
        ["name", "email", "class_type", "group_name", "place"].some((key) =>
          (item[key] || "").toLowerCase().includes(term)
        )
      );
    }
    setFilteredStudents(data);
  }, [students, searchTerm, classTypeFilter]);

  async function fetchStudents() {
    const { data, error } = await supabase.from("student_list").select("*");
    if (error) {
      alert("Fetch error: " + error.message);
      return;
    }
    setStudents(data || []);
  }

  function handleSearch(e) {
    setSearchTerm(e.target.value);
  }

  function handleFilter(e) {
    setClassTypeFilter(e.target.value);
  }

  const handleAddInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "class_type" && value === "Group") {
      setAddFormData({
        class_type: "Group",
        group_name: "",
        members: [{ name: "", reg_no: "", dob: "", email: "", phone: "", place: "" }],
      });
      return;
    }
    if (name === "class_type" && value === "Individual") {
      setAddFormData({ ...initialIndividual, class_type: "Individual" });
      return;
    }
    setAddFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMemberChange = (index, e) => {
    const { name, value } = e.target;
    setAddFormData((prev) => ({
      ...prev,
      members: prev.members.map((m, i) =>
        i === index ? { ...m, [name]: value } : m
      ),
    }));
  };

  const addMember = () => {
    setAddFormData((prev) => ({
      ...prev,
      members: [
        ...prev.members,
        { name: "", reg_no: "", dob: "", email: "", phone: "", place: "" },
      ],
    }));
  };

  const removeMember = (index) => {
    setAddFormData((prev) => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index),
    }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (addFormData.class_type === "Individual") {
      const reg_no = addFormData.reg_no || generateRegNo();
      const { error } = await supabase
        .from("student_list")
        .insert([{ ...addFormData, reg_no }]);
      if (error) {
        alert("Insert error: " + error.message);
        return;
      }
    } else if (addFormData.class_type === "Group") {
      const membersToSave = addFormData.members
        .filter((m) => m.name)
        .map((m) => ({
          ...m,
          reg_no: m.reg_no || generateRegNo(),
          class_type: "Group",
          group_name: addFormData.group_name,
        }));

      if (membersToSave.length === 0) {
        alert("Please enter at least one member.");
        return;
      }

      const { error } = await supabase
        .from("student_list")
        .insert(membersToSave);
      if (error) {
        alert("Insert error: " + error.message);
        return;
      }
    }
    setAddFormVisible(false);
    setAddFormData({ ...initialIndividual });
    fetchStudents();
  };

  const startEdit = (student) => {
    setEditingId(student.id);
    setEditFormData(student);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const saveEdit = async () => {
    const { id, ...updated } = editFormData;
    if (!editFormData.name) {
      alert("Name is required");
      return;
    }
    const { error } = await supabase
      .from("student_list")
      .update(updated)
      .eq("id", id);
    if (error) {
      alert("Update error: " + error.message);
      return;
    }
    setEditingId(null);
    setEditFormData({});
    fetchStudents();
  };

  const deleteStudent = async (id) => {
    if (!confirm("Are you sure?")) return;
    const { error } = await supabase.from("student_list").delete().eq("id", id);
    if (error) {
      alert("Delete error: " + error.message);
      return;
    }
    fetchStudents();
  };

  return (
    <div className="container mt-4">
      <h2>Student List</h2>
      <Row className="align-items-center mb-3">
        <Col md={2}>
          <Form.Select value={classTypeFilter} onChange={handleFilter}>
            <option value="">All Types</option>
            <option value="individual">Individual</option>
            <option value="group">Group</option>
          </Form.Select>
        </Col>
        <Col md={7}>
          <InputGroup>
            <FormControl
              placeholder="Search by name, email, group, place..."
              value={searchTerm}
              onChange={handleSearch}
              style={{ borderRadius: "6px" }}
              onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
            />
            <Button variant="primary" onClick={() => {}}>
              Search
            </Button>
          </InputGroup>
        </Col>
        <Col md={3} className="text-end">
          <Button onClick={() => setAddFormVisible(true)} variant="success" disabled={editingId !== null}>
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
                  <Form.Select
                    name="class_type"
                    value={addFormData.class_type || ""}
                    onChange={handleAddInputChange}
                    required
                  >
                    <option value="">Select</option>
                    <option value="Individual">Individual</option>
                    <option value="Group">Group</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {addFormData.class_type === "Group" && (
              <>
                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-2">
                      <Form.Label>Group Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="group_name"
                        value={addFormData.group_name}
                        onChange={handleAddInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <div className="mb-2" style={{ fontWeight: 500 }}>
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
                            <Form.Control
                              placeholder="Reg No (auto)"
                              name="reg_no"
                              value={member.reg_no || generateRegNo()}
                              disabled
                            />
                          </Col>
                          <Col md={2}>
                            <Form.Control
                              type="date"
                              name="dob"
                              value={member.dob}
                              onChange={(e) => handleMemberChange(idx, e)}
                            />
                          </Col>
                          <Col md={2}>
                            <Form.Control
                              type="email"
                              name="email"
                              value={member.email}
                              onChange={(e) => handleMemberChange(idx, e)}
                            />
                          </Col>
                          <Col md={2}>
                            <Form.Control
                              type="text"
                              name="phone"
                              value={member.phone}
                              onChange={(e) => handleMemberChange(idx, e)}
                            />
                          </Col>
                          <Col md={1}>
                            <Form.Control
                              type="text"
                              name="place"
                              value={member.place}
                              onChange={(e) => handleMemberChange(idx, e)}
                            />
                          </Col>
                          <Col md={1} className="d-flex align-items-center">
                            {addFormData.members.length > 1 && (
                              <Button
                                variant="danger"
                                onClick={() => removeMember(idx)}
                                size="sm"
                                className="ms-1"
                              >
                                Remove
                              </Button>
                            )}
                          </Col>
                        </Row>
                      ))}
                      <Button
                        variant="primary"
                        size="sm"
                        className="me-2 mt-2"
                        onClick={addMember}
                      >
                        Add
                      </Button>
                    </div>
                  </Col>
                </Row>
              </>
            )}

            {addFormData.class_type === "Individual" && (
              <>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-2">
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={addFormData.name}
                        onChange={handleAddInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-2">
                      <Form.Label>Reg No</Form.Label>
                      <Form.Control
                        type="text"
                        name="reg_no"
                        value={addFormData.reg_no || generateRegNo()}
                        onChange={handleAddInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-2">
                      <Form.Label>DOB</Form.Label>
                      <Form.Control
                        type="date"
                        name="dob"
                        value={addFormData.dob}
                        onChange={handleAddInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-2">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={addFormData.email}
                        onChange={handleAddInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-2">
                      <Form.Label>Phone</Form.Label>
                      <Form.Control
                        type="text"
                        name="phone"
                        value={addFormData.phone}
                        onChange={handleAddInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-2">
                      <Form.Label>Place</Form.Label>
                      <Form.Control
                        type="text"
                        name="place"
                        value={addFormData.place}
                        onChange={handleAddInputChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </>
            )}
            <div className="mt-4">
              <Button variant="primary" type="submit">
                Save
              </Button>
              <Button
                variant="secondary"
                type="button"
                onClick={() => setAddFormVisible(false)}
              >
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
          {filteredStudents.length === 0 ? (
            <tr>
              <td colSpan={9} className="text-center">
                No students found.
              </td>
            </tr>
          ) : (
            filteredStudents.map((student) =>
              editingId === student.id ? (
                <tr key={student.id}>
                  <td>
                    <Form.Control
                      name="reg_no"
                      value={editFormData.reg_no || ""}
                      onChange={handleEditChange}
                    />
                  </td>
                  <td>
                    <Form.Control
                      name="name"
                      value={editFormData.name || ""}
                      onChange={handleEditChange}
                    />
                  </td>
                  <td>
                    <Form.Control
                      name="dob"
                      type="date"
                      value={editFormData.dob || ""}
                      onChange={handleEditChange}
                    />
                  </td>
                  <td>
                    <Form.Control
                      name="email"
                      type="email"
                      value={editFormData.email || ""}
                      onChange={handleEditChange}
                    />
                  </td>
                  <td>
                    <Form.Control
                      name="phone"
                      value={editFormData.phone || ""}
                      onChange={handleEditChange}
                    />
                  </td>
                  <td>
                    <Form.Control
                      name="place"
                      value={editFormData.place || ""}
                      onChange={handleEditChange}
                    />
                  </td>
                  <td>
                    <Form.Select
                      name="class_type"
                      value={editFormData.class_type || ""}
                      onChange={handleEditChange}
                    >
                      <option value="">Select</option>
                      <option value="Individual">Individual</option>
                      <option value="Group">Group</option>
                    </Form.Select>
                  </td>
                  <td>
                    <Form.Control
                      name="group_name"
                      value={editFormData.group_name || ""}
                      onChange={handleEditChange}
                    />
                  </td>
                  <td>
                    <Button variant="primary" onClick={saveEdit} className="me-2">
                      Save
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </Button>
                  </td>
                </tr>
              ) : (
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
                      className="me-2"
                      onClick={() => {
                        setEditingId(student.id);
                        setEditFormData(student);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => {
                        if (confirm("Are you sure?")) {
                          deleteStudent(student.id);
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              )
            )
          )}
        </tbody>
      </Table>
    </div>
  );
}
