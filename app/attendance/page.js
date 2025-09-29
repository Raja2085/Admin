'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Card, Form, Button } from 'react-bootstrap';
import { FaUserCheck, FaUserTimes, FaUsers, FaCalendarAlt, FaEye } from 'react-icons/fa';
import { supabase } from '../../lib/supabaseClient';

const AttendanceClassSummary = () => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [filterParams, setFilterParams] = useState({ searchTerm: '', from: '', to: '' });
  const [records, setRecords] = useState([]);
  const [totalStudentsCount, setTotalStudentsCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch total unique student count
  useEffect(() => {
    async function fetchTotalStudents() {
      try {
        const { count, error } = await supabase
          .from('student_list')
          .select('id', { count: 'exact', head: true });
        if (error) throw error;
        setTotalStudentsCount(count || 0);
      } catch (e) {
        setTotalStudentsCount(0);
      }
    }
    fetchTotalStudents();
  }, []);

  // Fetch attendance records based on filters
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        let query = supabase.from('attendance').select('student_id, attendance_date, status, class_type');
        if (filterParams.from) query = query.gte('attendance_date', filterParams.from);
        if (filterParams.to) query = query.lte('attendance_date', filterParams.to);

        const { data, error } = await query;
        if (error) throw error;

        let filtered = data || [];
        if (filterParams.searchTerm) {
          filtered = filtered.filter(
            r => r.class_type && r.class_type.toLowerCase().includes(filterParams.searchTerm.toLowerCase())
          );
        }
        setRecords(filtered);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [filterParams]);

  // Attendance summary
  const totalPresent = records.filter(r => r.status === 'P').length;
  const totalAbsent = records.filter(r => r.status === 'A').length;

  const allClasses = Array.from(new Set(records.map(r => r.class_type)));
  const classGroups = allClasses.map(className => {
    const classRecords = records.filter(r => r.class_type === className);
    const studentIds = new Set(classRecords.map(r => r.student_id));
    const present = classRecords.filter(r => r.status === 'P').length;
    const absent = classRecords.filter(r => r.status === 'A').length;
    const percentage = present + absent > 0 ? ((present / (present + absent)) * 100).toFixed(1) : '0.0';
    return { className, total: studentIds.size, present, absent, percentage };
  });

  return (
    <Container fluid className="p-4">
      <h2 className="mb-4"><FaCalendarAlt /> Attendance Management</h2>
      {error && <p className="text-danger">{error}</p>}
      {loading && <p>Loading...</p>}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="shadow" style={{ background: '#6C63FF', color: '#fff' }}>
            <Card.Body>
              <Card.Title><FaUsers /> Total Students</Card.Title>
              <Card.Text style={{ fontSize: 32, fontWeight: 700 }}>{totalStudentsCount}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow" style={{ background: '#27ae60', color: '#fff' }}>
            <Card.Body>
              <Card.Title><FaUserCheck /> Present</Card.Title>
              <Card.Text style={{ fontSize: 32, fontWeight: 700 }}>{totalPresent}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow" style={{ background: '#e74c3c', color: '#fff' }}>
            <Card.Body>
              <Card.Title><FaUserTimes /> Absent</Card.Title>
              <Card.Text style={{ fontSize: 32, fontWeight: 700 }}>{totalAbsent}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-3" style={{ gap: 10 }}>
        <Col md={3}>
          <Form.Control type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} max={toDate} />
        </Col>
        <Col md={3}>
          <Form.Control type="date" value={toDate} onChange={e => setToDate(e.target.value)} min={fromDate} />
        </Col>
        <Col md={3}>
          <Form.Control type="text" placeholder="Search class" value={search} onChange={e => setSearch(e.target.value)} />
        </Col>
        <Col md={1}>
          <Button
            variant="primary"
            onClick={() => setFilterParams({ searchTerm: search, from: fromDate, to: toDate })}
            style={{ width: '100%' }}
          >
            Search
          </Button>
        </Col>
        <Col md={2}>
          <Button
            variant="success"
            onClick={() => router.push('/attendance/add')}
            style={{ width: '100%' }}
          >
            + Add Attendance
          </Button>
        </Col>
      </Row>

      <Table bordered hover responsive className="shadow-sm text-center align-middle">
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>Class</th>
            <th>Total Students</th>
            <th><FaUserCheck /> Present</th>
            <th><FaUserTimes /> Absent</th>
            <th>Attendance %</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {classGroups.length === 0 && !loading && (
            <tr><td colSpan={7} className="text-center">No classes found.</td></tr>
          )}
          {classGroups.map((g, idx) => (
            <tr key={g.className}>
              <td>{idx + 1}</td>
              <td>{g.className}</td>
              <td>{g.total}</td>
              <td className="fw-bold text-success">{g.present}</td>
              <td className="fw-bold text-danger">{g.absent}</td>
              <td className="fw-bold">{g.percentage}%</td>
              <td>
                <Button
                  size="sm"
                  variant="info"
                  onClick={() => {
                    let url = `/attendance/class/${encodeURIComponent(g.className)}`;
                    const params = [];
                    if (fromDate) params.push(`from=${fromDate}`);
                    if (toDate) params.push(`to=${toDate}`);
                    if (params.length > 0) url += `?${params.join('&')}`;
                    router.push(url);
                  }}
                >
                  <FaEye /> View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default AttendanceClassSummary;
