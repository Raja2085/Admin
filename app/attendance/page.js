'use client';
import { useState } from 'react';
import { Container, Row, Col, Table, Card, Form } from 'react-bootstrap';
import { FaUserCheck, FaUserTimes, FaUsers, FaCalendarAlt } from 'react-icons/fa';

// Attendance dataset (date-wise) with Reg No added
const initialData = [
  { id: 1, regNo: '2025000001', student: 'John Doe', class: 'Java', attendance: { '2025-09-12': 'P', '2025-09-13': 'P', '2025-09-14': 'A', '2025-09-15': 'P', '2025-09-16': 'P' } },
  { id: 2, regNo: '2025000002', student: 'Jane Smith', class: 'Python', attendance: { '2025-09-12': 'A', '2025-09-13': 'P', '2025-09-14': 'P', '2025-09-15': 'A', '2025-09-16': 'P' } },
  { id: 3, regNo: '2025000003', student: 'Bob Johnson', class: 'C++', attendance: { '2025-09-12': 'P', '2025-09-13': 'A', '2025-09-14': 'P', '2025-09-15': 'P', '2025-09-16': 'A' } },
  { id: 4, regNo: '2025000004', student: 'Alice Brown', class: 'Java', attendance: { '2025-09-12': 'P', '2025-09-13': 'A', '2025-09-14': 'A', '2025-09-15': 'P', '2025-09-16': 'P' } },
  { id: 5, regNo: '2025000005', student: 'Mike Wilson', class: 'Python', attendance: { '2025-09-12': 'P', '2025-09-13': 'P', '2025-09-14': 'P', '2025-09-15': 'A', '2025-09-16': 'P' } },
];

// Dates to show as columns
const dateRange = ['2025-09-12', '2025-09-13', '2025-09-14', '2025-09-15', '2025-09-16'];

const AttendancePage = () => {
  const [records, setRecords] = useState(initialData);
  const [filterClass, setFilterClass] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const handleAttendanceChange = (studentId, date, value) => {
    setRecords(prev =>
      prev.map(r =>
        r.id === studentId
          ? { ...r, attendance: { ...r.attendance, [date]: value } }
          : r
      )
    );
  };

  // Filter students by class + search
  const filteredRecords = records.filter(r =>
    (filterClass === 'All' || r.class === filterClass) &&
    (r.student.toLowerCase().includes(searchQuery.toLowerCase()) || r.regNo.includes(searchQuery))
  );

  // Stats
  const totalStudents = filteredRecords.length;
  const lastDate = dateRange[dateRange.length - 1];
  const totalPresentLastDate = filteredRecords.filter(r => r.attendance[lastDate] === 'P').length;
  const totalAbsentLastDate = filteredRecords.filter(r => r.attendance[lastDate] === 'A').length;

  return (
    <Container fluid className="p-4">
      <h2 className="mb-4"><FaCalendarAlt /> Attendance Management</h2>

      {/* Filter + Search */}
      <Row className="mb-3">
        <Col md={3}>
          <Form.Select value={filterClass} onChange={(e) => setFilterClass(e.target.value)}>
            <option value="All">All Classes</option>
            <option value="Java">Java</option>
            <option value="Python">Python</option>
            <option value="C++">C++</option>
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Control
            type="text"
            placeholder="Search student or Reg No..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Col>
      </Row>

      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-white bg-primary mb-3 shadow-sm">
            <Card.Body>
              <Card.Title><FaUsers /> Total Students</Card.Title>
              <Card.Text style={{ fontSize: '2rem' }}>{totalStudents}</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="text-white bg-success mb-3 shadow-sm">
            <Card.Body>
              <Card.Title><FaUserCheck /> Present ({new Date(lastDate).toLocaleDateString('en-GB')})</Card.Title>
              <Card.Text style={{ fontSize: '2rem' }}>{totalPresentLastDate}</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="text-white bg-danger mb-3 shadow-sm">
            <Card.Body>
              <Card.Title><FaUserTimes /> Absent ({new Date(lastDate).toLocaleDateString('en-GB')})</Card.Title>
              <Card.Text style={{ fontSize: '2rem' }}>{totalAbsentLastDate}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Attendance Matrix Table */}
      <Row>
        <Col>
          <Table responsive bordered hover className="shadow-sm text-center align-middle">
            <thead className="table-dark">
              <tr>
                <th>S.No</th>
                <th>Reg No</th>
                <th>Student Name</th>
                {filterClass === 'All' && <th>Class</th>}
                {dateRange.map(date => (
                  <th key={date}>{new Date(date).toLocaleDateString('en-GB')}</th>
                ))}
                <th><FaUserCheck /> Present</th>
                <th><FaUserTimes /> Absent</th>
                <th>% Attendance</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map(({ id, regNo, student, class: className, attendance }, index) => {
                const totalPresent = Object.values(attendance).filter(v => v === 'P').length;
                const totalAbsent = Object.values(attendance).filter(v => v === 'A').length;
                const percentage = ((totalPresent / dateRange.length) * 100).toFixed(1);

                return (
                  <tr key={id}>
                    <td>{index + 1}</td>
                    <td>{regNo}</td>
                    <td>{student}</td>
                    {filterClass === 'All' && <td>{className}</td>}
                    {dateRange.map(date => (
                      <td key={date}>
                        <Form.Select
                          size="sm"
                          value={attendance[date]}
                          onChange={(e) => handleAttendanceChange(id, date, e.target.value)}
                        >
                          <option value="P">P</option>
                          <option value="A">A</option>
                        </Form.Select>
                      </td>
                    ))}
                    <td className="fw-bold text-success">{totalPresent}</td>
                    <td className="fw-bold text-danger">{totalAbsent}</td>
                    <td className="fw-bold">{percentage}%</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Col>
      </Row>

      <style jsx>{`
        h2 {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        select.form-select {
          font-size: 0.85rem;
          padding: 0.2em;
        }
      `}</style>
    </Container>
  );
};

export default AttendancePage;
