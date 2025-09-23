'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Container, Row, Col, Table, Card, Form, Button } from 'react-bootstrap';
import { FaUserCheck, FaUserTimes, FaUsers, FaCalendarAlt, FaEye } from 'react-icons/fa';

// Initial attendance data
const initialData = [
  { id: 1, student: 'John Doe', class: 'Java', regNo: '2025000001', attendance: { '2025-09-12': 'P', '2025-09-13': 'P', '2025-09-14': 'A', '2025-09-15': 'P', '2025-09-16': 'P' } },
  { id: 2, student: 'Jane Smith', class: 'Python', regNo: '2025000002', attendance: { '2025-09-12': 'A', '2025-09-13': 'P', '2025-09-14': 'P', '2025-09-15': 'A', '2025-09-16': 'P' } },
  { id: 3, student: 'Bob Johnson', class: 'C++', regNo: '2025000003', attendance: { '2025-09-12': 'P', '2025-09-13': 'A', '2025-09-14': 'P', '2025-09-15': 'P', '2025-09-16': 'A' } },
  { id: 4, student: 'Alice Brown', class: 'Java', regNo: '2025000004', attendance: { '2025-09-12': 'P', '2025-09-13': 'A', '2025-09-14': 'A', '2025-09-15': 'P', '2025-09-16': 'P' } },
  { id: 5, student: 'Mike Wilson', class: 'Python', regNo: '2025000005', attendance: { '2025-09-12': 'P', '2025-09-13': 'P', '2025-09-14': 'P', '2025-09-15': 'A', '2025-09-16': 'P' } },
];

// Get all classes and all dates for reference
const allClasses = Array.from(new Set(initialData.map(item => item.class)));
const allDates = ['2025-09-12', '2025-09-13', '2025-09-14', '2025-09-15', '2025-09-16'];

const AttendanceClassSummary = () => {
  const router = useRouter();
  // States for search terms and date filters
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  // State that triggers filtering on Search button click
  const [filterParams, setFilterParams] = useState({ searchTerm: '', from: '', to: '' });

  const records = initialData;

  // Compute filtered dates within range, or all dates if none
  const getFilteredDates = () => {
    if (!filterParams.from && !filterParams.to) return allDates;
    return allDates.filter(
      d => (!filterParams.from || d >= filterParams.from) && (!filterParams.to || d <= filterParams.to)
    );
  };

  const filteredDates = getFilteredDates();

  // Filter classes by search term in class name
  const filteredClasses = allClasses.filter(c =>
    c.toLowerCase().includes(filterParams.searchTerm.toLowerCase())
  );

  // Group data by class, calculate present, absent counts within filtered dates
  const classGroups = filteredClasses.map(className => {
    const filtered = records.filter(r => r.class === className);
    const present = filtered.reduce(
      (sum, r) => sum + filteredDates.filter(date => r.attendance[date] === 'P').length,
      0
    );
    const absent = filtered.reduce(
      (sum, r) => sum + filteredDates.filter(date => r.attendance[date] === 'A').length,
      0
    );
    const totalStudents = filtered.length;
    const percentage = present + absent > 0 ? ((present / (present + absent)) * 100).toFixed(1) : '0.0';

    return {
      className,
      total: totalStudents,
      present,
      absent,
      percentage,
      students: filtered,
    };
  });

  // Compute summary totals for the boxes above the table
  const summaryTotal = classGroups.reduce((sum, g) => sum + g.total, 0);
  const summaryPresent = classGroups.reduce((sum, g) => sum + g.present, 0);
  const summaryAbsent = classGroups.reduce((sum, g) => sum + g.absent, 0);

  return (
    <Container fluid className="p-4">
      <h2 className="mb-4"><FaCalendarAlt /> Attendance Management</h2>

      <Row className="mb-4">
        <Col md={4} className="mb-3">
          <Card className="shadow" style={{ background: '#6C63FF', color: '#fff' }}>
            <Card.Body>
              <Card.Title><FaUsers /> Total Students</Card.Title>
              <Card.Text style={{ fontSize: 32, fontWeight: 700 }}>{summaryTotal}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="shadow" style={{ background: '#27ae60', color: '#fff' }}>
            <Card.Body>
              <Card.Title><FaUserCheck /> Present</Card.Title>
              <Card.Text style={{ fontSize: 32, fontWeight: 700 }}>{summaryPresent}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="shadow" style={{ background: '#e74c3c', color: '#fff' }}>
            <Card.Body>
              <Card.Title><FaUserTimes /> Absent</Card.Title>
              <Card.Text style={{ fontSize: 32, fontWeight: 700 }}>{summaryAbsent}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-3" style={{ gap: 10 }}>
        <Col md={3}>
          <Form.Control
            type="date"
            placeholder="From"
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
            max={toDate || allDates[allDates.length - 1]}
          />
        </Col>
        <Col md={3}>
          <Form.Control
            type="date"
            placeholder="To"
            value={toDate}
            onChange={e => setToDate(e.target.value)}
            min={fromDate}
            max={allDates[allDates.length - 1]}
          />
        </Col>
        <Col md={3}>
          <Form.Control
            type="text"
            placeholder="Search class"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </Col>
        <Col md={2}>
          <Button
            variant="primary"
            onClick={() => setFilterParams({ searchTerm: search, from: fromDate, to: toDate })}
          >
            Search
          </Button>
        </Col>
      </Row>

      <Table bordered hover responsive className="shadow-sm text-center align-middle">
        <thead className="table-dark">
          <tr>
            <th>S.No</th>
            <th>Class</th>
            <th>Total Students</th>
            <th><FaUserCheck /> Present</th>
            <th><FaUserTimes /> Absent</th>
            <th>Attendance %</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
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
                  onClick={() => router.push(`/attendance/class/${g.className}${filterParams.from ? `?date=${filterParams.from}` : ''}`)}
                >
                  <FaEye /> View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <style jsx>{`
        h2 { display: flex; align-items: center; gap: 10px; }
      `}</style>
    </Container>
  );
};

export default AttendanceClassSummary;
