'use client';

import { useRouter } from 'next/navigation'; // <-- Import router
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Container, Form, Button, Alert, Table } from 'react-bootstrap';

const CLASS_OPTIONS = ['Java', 'Python', 'C++'];

export default function AttendancePage() {
  const router = useRouter(); // <-- Initialize router
  const [students, setStudents] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [attendanceData, setAttendanceData] = useState({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchStudents() {
      const { data, error } = await supabase
        .from('student_list')
        .select('id, name');
      if (error) setError(error.message);
      else setStudents(data || []);
    }
    fetchStudents();
  }, []);

  const handleStatusChange = (studentId, status) => {
    setAttendanceData((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!selectedDate) {
      setError('Select a date');
      return;
    }
    if (!selectedClass) {
      setError('Select a class');
      return;
    }
    setSaving(true);
    const records = students.map((stu) => ({
      student_id: stu.id,
      attendance_date: selectedDate,
      status: attendanceData[stu.id] || 'A',
      class_type: selectedClass,
    }));

    const { error } = await supabase
      .from('attendance')
      .upsert(records, { onConflict: ['student_id', 'attendance_date', 'class_type'] });

    setSaving(false);

    if (error) {
      setError(error.message);
    } else {
      router.push('/attendance'); // <-- Redirect to summary page
    }
  };

  return (
    <Container className="p-4">
      <h2>Mark Attendance</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Select Date</Form.Label>
          <Form.Control
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Select Class</Form.Label>
          <Form.Select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            required
          >
            <option value="">-- Select Class --</option>
            {CLASS_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
        <Table bordered hover responsive>
          <thead>
            <tr>
              <th>Name</th>
              <th>Status (Present/Absent)</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 && (
              <tr>
                <td colSpan="2" className="text-center">
                  Loading students...
                </td>
              </tr>
            )}
            {students.map((stu) => (
              <tr key={stu.id}>
                <td>{stu.name}</td>
                <td>
                  <Form.Check
                    inline
                    label="Present"
                    type="radio"
                    name={`status-${stu.id}`}
                    checked={attendanceData[stu.id] === 'P'}
                    onChange={() => handleStatusChange(stu.id, 'P')}
                  />
                  <Form.Check
                    inline
                    label="Absent"
                    type="radio"
                    name={`status-${stu.id}`}
                    checked={attendanceData[stu.id] === 'A' || !attendanceData[stu.id]}
                    onChange={() => handleStatusChange(stu.id, 'A')}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Attendance'}
        </Button>
      </Form>
    </Container>
  );
}
