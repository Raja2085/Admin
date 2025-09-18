'use client';

import { useState } from 'react';
import { Container, Row, Col, Table, Card, Button, Badge } from 'react-bootstrap';
import { FaCreditCard, FaCheckCircle, FaTimesCircle, FaMoneyBillWave, FaUser } from 'react-icons/fa';

const paymentsData = [
  { id: 1, student: 'John Doe', method: 'Credit Card', amount: 250, status: 'Completed', date: '2025-09-01' },
  { id: 2, student: 'Jane Smith', method: 'UPI', amount: 500, status: 'Pending', date: '2025-09-03' },
  { id: 3, student: 'Bob Johnson', method: 'Net Banking', amount: 100, status: 'Failed', date: '2025-09-05' },
  // Add more entries as needed
];

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
  const [payments, setPayments] = useState(paymentsData);

  // Example total collections
  const totalCollected = payments.filter(p => p.status === 'Completed').reduce((sum, p) => sum + p.amount, 0);

  return (
    <Container fluid className="p-4">
      <h2 className="mb-4"><FaMoneyBillWave /> Payment Dashboard</h2>

      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-white bg-primary mb-3 shadow-sm">
            <Card.Body>
              <Card.Title><FaUser /> Total Students</Card.Title>
              <Card.Text style={{ fontSize: '2rem' }}>150</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-white bg-success mb-3 shadow-sm">
            <Card.Body>
              <Card.Title><FaCreditCard /> Total Collection</Card.Title>
              <Card.Text style={{ fontSize: '2rem' }}>₹ {totalCollected}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-white bg-warning mb-3 shadow-sm">
            <Card.Body>
              <Card.Title>Pending Payments</Card.Title>
              <Card.Text style={{ fontSize: '2rem' }}>
                {payments.filter(p=>p.status==='Pending').length}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Table responsive bordered hover className="shadow-sm">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Student</th>
                <th>Payment Method</th>
                <th>Amount (₹)</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(({id, student, method, amount, status, date}) => (
                <tr key={id}>
                  <td>{id}</td>
                  <td>{student}</td>
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
        </Col>
      </Row>

      {/* Add custom styles inline or import a CSS/SCSS file */}
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
