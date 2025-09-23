'use client';

import { useSearchParams, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Container, Row, Col, Table, Card } from 'react-bootstrap';
import { FaUserCheck, FaUserTimes, FaUsers } from 'react-icons/fa';
import { supabase } from '../../../../lib/supabaseClient';

const StudentTable = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const selectedDate = searchParams.get('date'); // can be null or empty
  const className = decodeURIComponent(params.className);

  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [attendanceDates, setAttendanceDates] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchStudentsAndAttendance() {
      setLoading(true);

      // Get all students for this class
      const { data: studentsData, error: studentsError } = await supabase
        .from('student_list')
        .select('id, name, reg_no, class_type')
        .eq('class_type', className);

      if (studentsError) {
        setStudents([]);
        setAttendanceMap({});
        setAttendanceDates([]);
        setLoading(false);
        return;
      }

      setStudents(studentsData || []);

      const studentIds = (studentsData || []).map(s => s.id);
      if (studentIds.length === 0) {
        setAttendanceMap({});
        setAttendanceDates([]);
        setLoading(false);
        return;
      }

      // Fetch attendance records
      let attendanceQuery = supabase
        .from('attendance')
        .select('student_id, attendance_date, status')
        .eq('class_type', className)
        .in('student_id', studentIds);

      if (selectedDate) {
        attendanceQuery = attendanceQuery.eq('attendance_date', selectedDate);
      }

      const { data: attendanceData, error: attendanceError } = await attendanceQuery;
      if (attendanceError) {
        setAttendanceMap({});
        setAttendanceDates([]);
        setLoading(false);
        return;
      }

      // Gather wanted date(s)
      let uniqueDates = [];
      if (selectedDate && attendanceData?.length) {
        uniqueDates = [selectedDate];
      } else if (attendanceData?.length) {
        uniqueDates = Array.from(
          new Set(attendanceData.map(row => row.attendance_date))
        ).sort();
      }
      setAttendanceDates(uniqueDates);

      // Build student attendance map
      const aMap = {};
      (attendanceData || []).forEach(({ student_id, attendance_date, status }) => {
        if (!aMap[student_id]) aMap[student_id] = {};
        aMap[student_id][attendance_date] = status;
      });
      setAttendanceMap(aMap);

      setLoading(false);
    }

    fetchStudentsAndAttendance();
  }, [className, selectedDate]);

  // Present and absent summary
  let totalPresent = 0, totalAbsent = 0;
  if (attendanceDates.length > 0) {
    totalPresent = students.reduce(
      (sum, s) => sum + attendanceDates.filter(date => attendanceMap[s.id]?.[date] === 'P').length,
      0
    );
    totalAbsent = students.reduce(
      (sum, s) => sum + attendanceDates.filter(date => attendanceMap[s.id]?.[date] === 'A').length,
      0
    );
  }

  return (
    <Container fluid className="p-4">
      <h3 className="mb-4">{className} Attendance Details</h3>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
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
                    <FaUserCheck /> Present{attendanceDates.length === 1 && ` (${new Date(attendanceDates[0]).toLocaleDateString('en-GB')})`}
                  </Card.Title>
                  <Card.Text style={{ fontSize: '2rem' }}>{totalPresent}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="text-white bg-danger mb-3 shadow-sm">
                <Card.Body>
                  <Card.Title>
                    <FaUserTimes /> Absent{attendanceDates.length === 1 && ` (${new Date(attendanceDates[0]).toLocaleDateString('en-GB')})`}
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
                {attendanceDates.map(date => (
                  <th key={date}>{new Date(date).toLocaleDateString('en-GB')}</th>
                ))}
                {attendanceDates.length > 1 && <th>Attendance %</th>}
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={3 + attendanceDates.length + (attendanceDates.length > 1 ? 1 : 0)}>
                    No students found for {className}
                  </td>
                </tr>
              ) : (
                students.map((s, idx) => {
                  const presentDays = attendanceDates.filter(date => attendanceMap[s.id]?.[date] === 'P').length;
                  const attendancePercentage =
                    attendanceDates.length > 0
                      ? ((presentDays / attendanceDates.length) * 100).toFixed(1)
                      : '0.0';
                  return (
                    <tr key={s.id}>
                      <td>{idx + 1}</td>
                      <td>{s.reg_no}</td>
                      <td>{s.name}</td>
                      {attendanceDates.map(date => (
                        <td key={date}
                            className={
                              attendanceMap[s.id]?.[date] === 'P'
                                ? 'text-success'
                                : attendanceMap[s.id]?.[date] === 'A'
                                ? 'text-danger'
                                : ''
                            }>
                          {attendanceMap[s.id]?.[date] || '-'}
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
