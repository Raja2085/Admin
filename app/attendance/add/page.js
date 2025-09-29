'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Container, Form, Button, Alert, Table } from 'react-bootstrap';
import { useRouter } from 'next/navigation';

export default function AttendancePage() {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [classOptions, setClassOptions] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [attendanceData, setAttendanceData] = useState({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Fetch distinct classes dynamically from student_list table
    const fetchDistinctClasses = async () => {
      setError('');
      let { data, error } = await supabase
        .from('student_list')
        .select('course')
        .neq('course', '') // omit empty courses if any
        .order('course', { ascending: true })
        .limit(1000);

      if (error) {
        setError(error.message);
      } else {
        // Extract unique courses only
        const distinctCourses = [...new Set(data.map((record) => record.course))];
        setClassOptions(distinctCourses);
      }
    };

    fetchDistinctClasses();
  }, []); // Run on mount only

  useEffect(() => {
    // Fetch students filtered by selected class dynamically
    const fetchStudentsByClass = async () => {
      setError('');
      if (!selectedClass) {
        setStudents([]);
        return;
      }
      const { data, error } = await supabase
        .from('student_list')
        .select('id, name')
        .eq('course', selectedClass);

      if (error) setError(error.message);
      else setStudents(data || []);
    };
    fetchStudentsByClass();
  }, [selectedClass]);

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
    if (students.length === 0) {
      setError('No students found for the selected class');
      return;
    }

    setSaving(true);

    const records = students.map((stu) => ({
      student_id: stu.id,
      attendance_date: selectedDate,
      status: attendanceData[stu.id] || 'A', // Default Absent
      class_type: selectedClass,
    }));

    const { error: upsertError } = await supabase
      .from('attendance')
      .upsert(records, { onConflict: ['student_id', 'attendance_date', 'class_type'] });

    setSaving(false);

    if (upsertError) {
      setError(upsertError.message);
    } else {
      router.push('/attendance'); // Redirect after saving
    }
  };

  return (
    <Container className="p-4">
      <h2>Mark Attendance</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Select Date</Form.Label>
          <Form.Control type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Select Class</Form.Label>
          <Form.Select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} required>
            <option value="">-- Select Class --</option>
            {classOptions.map((c) => (
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
            {selectedClass && students.length === 0 && (
              <tr>
                <td colSpan="2" className="text-center">
                  No students found for this class.
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
