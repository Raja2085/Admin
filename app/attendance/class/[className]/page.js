'use client';

import { useSearchParams, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Container, Row, Col, Table, Card } from 'react-bootstrap';
import { FaUserCheck, FaUserTimes, FaUsers } from 'react-icons/fa';
import { supabase } from '../../../../lib/supabaseClient';

const StudentTable = () => {
  const params = useParams();
  const searchParams = useSearchParams();

  const selectedDate = searchParams.get('date');
  const className = decodeURIComponent(params.className);

  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [attendanceDates, setAttendanceDates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Get students for selected class
        const { data: studentData, error: studentError } = await supabase
          .from('student_list')
          .select('id, name, reg_no')
          .eq('class_type', className);

        if (studentError) throw studentError;

        setStudents(studentData || []);

        if (!studentData || studentData.length === 0) {
          setAttendanceMap({});
          setAttendanceDates([]);
          setLoading(false);
          return;
        }

        // Get attendance records for students filtered by selectedDate if set
        const studentIds = studentData.map(s => s.id);
        let attendanceQuery = supabase
          .from('attendance')
          .select('student_id, attendance_date, status')
          .eq('class_type', className)
          .in('student_id', studentIds);

        if (selectedDate) {
          attendanceQuery = attendanceQuery.eq('attendance_date', selectedDate);
        }

        const { data: attendanceData, error: attendanceError } = await attendanceQuery;
        if (attendanceError) throw attendanceError;


        
        // Extract unique attendance dates for table headings
        let uniqueDates = [];
        if (selectedDate) {
          uniqueDates = [selectedDate];
        } else {
          uniqueDates = Array.from(new Set(attendanceData?.map(a => a.attendance_date) || [])).sort();
        }
        setAttendanceDates(uniqueDates);

        // Map attendance: {student_id: {date: status}}
        const amap = {};
        (attendanceData || []).forEach(({ student_id, attendance_date, status }) => {
          if (!amap[student_id]) amap[student_id] = {};
          amap[student_id][attendance_date] = status;
        });
        setAttendanceMap(amap);
      } catch (error) {
        console.error('Error loading data:', error.message);
        setStudents([]);
        setAttendanceMap({});
        setAttendanceDates([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [className, selectedDate]);

  // Calculate present and absent students for summary cards
  let totalPresent = 0, totalAbsent = 0;
  students.forEach(s => {
    totalPresent += attendanceDates.filter(date => attendanceMap[s.id]?.[date] === 'P').length;
    totalAbsent += attendanceDates.filter(date => attendanceMap[s.id]?.[date] === 'A').length;
  });

  return (
    <Container fluid className="p-4">
      <h3 className="mb-4">{className} Attendance Details {selectedDate ? `(${new Date(selectedDate).toLocaleDateString('en-GB')})` : ''}</h3>
      {loading ? <p>Loading...</p> : (
        <>
          <Row className="mb-4">
            <Col md={4}>
              <Card className="bg-primary text-white mb-3 shadow-sm">
                <Card.Body>
                  <Card.Title><FaUsers /> Total Students</Card.Title>
                  <Card.Text style={{ fontSize: '2rem' }}>{students.length}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="bg-success text-white mb-3 shadow-sm">
                <Card.Body>
                  <Card.Title><FaUserCheck /> Present</Card.Title>
                  <Card.Text style={{ fontSize: '2rem' }}>{totalPresent}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="bg-danger text-white mb-3 shadow-sm">
                <Card.Body>
                  <Card.Title><FaUserTimes /> Absent</Card.Title>
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
                {attendanceDates.map(date => (
                  <th key={date}>
                    Status<br />({new Date(date).toLocaleDateString('en-GB')})
                  </th>
                ))}
                {attendanceDates.length > 1 && <th>Attendance %</th>}
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr><td colSpan={3 + attendanceDates.length + (attendanceDates.length > 1 ? 1 : 0)} className="text-center">No students found for {className}</td></tr>
              ) : (
                students.map((s, idx) => {
                  const presentDays = attendanceDates.filter(date => attendanceMap[s.id]?.[date] === 'P').length;
                  const attendancePercentage = attendanceDates.length > 0
                    ? ((presentDays / attendanceDates.length) * 100).toFixed(1)
                    : '0.0';

                  return (
                    <tr key={s.id}>
                      <td>{idx + 1}</td>
                      <td>{s.reg_no}</td>
                      <td>{s.name}</td>
                      {attendanceDates.map(date => (
                        <td key={date} className={
                          attendanceMap[s.id]?.[date] === 'P' ? 'text-success' :
                          attendanceMap[s.id]?.[date] === 'A' ? 'text-danger' : ''
                        }>
                          {attendanceMap[s.id]?.[date] === 'P' ? 'Present' :
                           attendanceMap[s.id]?.[date] === 'A' ? 'Absent' : '-'}
                        </td>
                      ))}
                      {attendanceDates.length > 1 && <td>{attendancePercentage}%</td>}
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </>
      )}
    </Container>
  );
};

export default StudentTable;
