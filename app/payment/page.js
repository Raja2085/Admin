'use client';

import { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Card, Badge, Button } from 'react-bootstrap';
import { FaCreditCard, FaCheckCircle, FaTimesCircle, FaMoneyBillWave, FaUser } from 'react-icons/fa';
import { supabase } from '../../lib/supabaseClient';

const statusBadge = (status) => {
  switch(status) {
    case 'Completed':
      return <Badge bg="success"><FaCheckCircle /> {status}</Badge>;
    case 'Pending':
      return <Badge bg="warning" text="dark">{status}</Badge>;
    case 'Failed':
      return <Badge bg="danger"><FaTimesCircle /> {status}</Badge>;
    default:
      return <Badge bg="secondary">{status}</Badge>;
  }
};

const PaymentDashboard = () => {
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [unpaidStudents, setUnpaidStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Fetch payments joined with student names
      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .select(`
          id,
          method,
          amount,
          status,
          date,
          student_list (
            id,
            name
          )
        `)
        .order('date', { ascending: false });

      if (paymentError) {
        console.error('Error fetching payments:', paymentError);
      } else {
        setPayments(paymentData);
      }

      // Fetch all students
      const { data: studentData, error: studentError } = await supabase
        .from('student_list')
        .select('id, name')
        .order('name', { ascending: true });

      if (studentError) {
        console.error('Error fetching students:', studentError);
      } else {
        setStudents(studentData);

        // Calculate unpaid students by filtering out students who already have payments
        const paidStudentIds = new Set(paymentData.map(p => p.student_list.id));
        setUnpaidStudents(studentData.filter(s => !paidStudentIds.has(s.id)));
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const totalCollected = payments
    .filter(p => p.status === 'Completed')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <Container fluid className="p-4">
      <h2 className="mb-4"><FaMoneyBillWave /> Payment Dashboard</h2>

      <Row className="mb-4 align-items-center">
        <Col md={3}>
          <Card className="text-white bg-primary mb-3 shadow-sm">
            <Card.Body>
              <Card.Title><FaUser /> Total Students</Card.Title>
              <Card.Text style={{ fontSize: '2rem' }}>{students.length}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-white bg-success mb-3 shadow-sm">
            <Card.Body>
              <Card.Title><FaCreditCard /> Total Collection</Card.Title>
              <Card.Text style={{ fontSize: '2rem' }}>₹ {totalCollected}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-white bg-warning mb-3 shadow-sm">
            <Card.Body>
              <Card.Title>Pending Payments</Card.Title>
              <Card.Text style={{ fontSize: '2rem' }}>
                {payments.filter(p => p.status === 'Pending').length}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        {/* Add Payment button removed */}
      </Row>

      <Row>
        <Col>
          {loading ? (
            <p>Loading payments...</p>
          ) : (
            <Table responsive bordered hover className="shadow-sm">
              <thead className="table-dark">
                <tr>
                  <th>S.no</th>
                  <th>Student</th>
                  <th>Payment Method</th>
                  <th>Amount (₹)</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(({ id, method, amount, status, date, student_list }, idx) => (
                  <tr key={id}>
                    <td>{idx + 1}</td>
                    <td>{student_list?.name || 'Unknown'}</td>
                    <td>{method}</td>
                    <td>{amount}</td>
                    <td>{statusBadge(status)}</td>
                    <td>{date}</td>
                    <td>
                      <Button variant="outline-primary" size="sm">Details</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Col>
      </Row>

      <style jsx>{`
        h2 {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .badge {
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 0.4em 0.7em;
          border-radius: 8px;
        }
      `}</style>
    </Container>
  );
};

export default PaymentDashboard;