'use client';
import { useSearchParams, useParams } from 'next/navigation';
import { Container, Row, Col, Table, Card } from 'react-bootstrap';
import { FaUserCheck, FaUserTimes, FaUsers } from 'react-icons/fa';

const initialData = [
  { id: 1, student: 'John Doe', class: 'Java', regNo: '2025000001', attendance: { '2025-09-12': 'P', '2025-09-13': 'P', '2025-09-14': 'A', '2025-09-15': 'P', '2025-09-16': 'P' } },
  { id: 2, student: 'Jane Smith', class: 'Python', regNo: '2025000002', attendance: { '2025-09-12': 'A', '2025-09-13': 'P', '2025-09-14': 'P', '2025-09-15': 'A', '2025-09-16': 'P' } },
  { id: 3, student: 'Bob Johnson', class: 'C++', regNo: '2025000003', attendance: { '2025-09-12': 'P', '2025-09-13': 'A', '2025-09-14': 'P', '2025-09-15': 'P', '2025-09-16': 'A' } },
  { id: 4, student: 'Alice Brown', class: 'Java', regNo: '2025000004', attendance: { '2025-09-12': 'P', '2025-09-13': 'A', '2025-09-14': 'A', '2025-09-15': 'P', '2025-09-16': 'P' } },
  { id: 5, student: 'Mike Wilson', class: 'Python', regNo: '2025000005', attendance: { '2025-09-12': 'P', '2025-09-13': 'P', '2025-09-14': 'P', '2025-09-15': 'A', '2025-09-16': 'P' } },
];

const allDates = ['2025-09-12', '2025-09-13', '2025-09-14', '2025-09-15', '2025-09-16'];

const StudentTable = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const selectedDate = searchParams.get('date');
  const className = decodeURIComponent(params.className);

  const students = initialData.filter(s => s.class === className);

  let totalPresent = 0;
  let totalAbsent = 0;

  if (selectedDate) {
    totalPresent = students.filter(s => s.attendance[selectedDate] === 'P').length;
    totalAbsent = students.filter(s => s.attendance[selectedDate] === 'A').length;
  } else {
    totalPresent = students.reduce(
      (sum, s) => sum + Object.values(s.attendance).filter(v => v === 'P').length,
      0
    );
    totalAbsent = students.reduce(
      (sum, s) => sum + Object.values(s.attendance).filter(v => v === 'A').length,
      0
    );
  }

  return (
    <Container fluid className="p-4">
      <h3 className="mb-4">{className} Attendance Details</h3>
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-white bg-primary mb-3 shadow-sm">
            <Card.Body>
              <Card.Title><FaUsers /> Total Students</Card.Title>
              <Card.Text style={{ fontSize: '2rem' }}>{students.length}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-white bg-success mb-3 shadow-sm">
            <Card.Body>
              <Card.Title>
                <FaUserCheck /> Present
                {selectedDate && <> ({new Date(selectedDate).toLocaleDateString('en-GB')})</>}
              </Card.Title>
              <Card.Text style={{ fontSize: '2rem' }}>{totalPresent}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-white bg-danger mb-3 shadow-sm">
            <Card.Body>
              <Card.Title>
                <FaUserTimes /> Absent
                {selectedDate && <> ({new Date(selectedDate).toLocaleDateString('en-GB')})</>}
              </Card.Title>
              <Card.Text style={{ fontSize: '2rem' }}>{totalAbsent}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Table bordered hover responsive className="shadow-sm text-center align-middle">
        <thead className="table-dark">
          <tr>
            <th>S.No</th>
            <th>Reg No</th>
            <th>Student Name</th>
            {selectedDate ? (
              <th>{new Date(selectedDate).toLocaleDateString('en-GB')}</th>
            ) : (
              allDates.map(date => (
                <th key={date}>{new Date(date).toLocaleDateString('en-GB')}</th>
              ))
            )}
            {!selectedDate && <th>Attendance %</th>}
          </tr>
        </thead>
        <tbody>
          {students.map((s, idx) => {
            const datesToCheck = selectedDate ? [selectedDate] : allDates;
            const presentDays = datesToCheck.reduce(
              (count, date) => count + (s.attendance[date] === 'P' ? 1 : 0),
              0
            );
            const attendancePercentage = ((presentDays / datesToCheck.length) * 100).toFixed(1);

            return (
              <tr key={s.id}>
                <td>{idx + 1}</td>
                <td>{s.regNo}</td>
                <td>{s.student}</td>
                {selectedDate ? (
                  <td className={s.attendance[selectedDate] === 'P' ? 'text-success' : 'text-danger'}>
                    {s.attendance[selectedDate]}
                  </td>
                ) : (
                  allDates.map(date => (
                    <td key={date} className={s.attendance[date] === 'P' ? 'text-success' : 'text-danger'}>
                      {s.attendance[date]}
                    </td>
                  ))
                )}
                {!selectedDate && <td>{attendancePercentage}%</td>}
              </tr>
            );
          })}
        </tbody>
      </Table>
      <style jsx>{`
        h3 { font-weight: 700; }
      `}</style>
    </Container>
  );
};

export default StudentTable;
