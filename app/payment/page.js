'use client';

import { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Card, Button, Badge, Modal, Form } from 'react-bootstrap';
import { FaCreditCard, FaCheckCircle, FaTimesCircle, FaMoneyBillWave, FaUser, FaPlus } from 'react-icons/fa';
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

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('Pending');
  const [date, setDate] = useState('');

  // Fetch payments & students
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

  // Modal submit handler
  const handleAddPayment = async (e) => {
    e.preventDefault();

    if (!selectedStudentId || !paymentMethod || !amount || !status || !date) {
      alert('Please fill all fields');
      return;
    }

    const { error } = await supabase
      .from('payments')
      .insert([{
        student_id: selectedStudentId,
        method: paymentMethod,
        amount: parseFloat(amount),
        status,
        date
      }]);

    if (error) {
      alert('Failed to add payment: ' + error.message);
    } else {
      // Refresh data
      setShowModal(false);
      setSelectedStudentId('');
      setPaymentMethod('');
      setAmount('');
      setStatus('Pending');
      setDate('');

      // Fetch updated data (simplified: just re-run fetch)
      const { data: updatedPayments } = await supabase
        .from('payments')
        .select(`
          id,
          method,
          amount,
          status,
          date,
          student_list (id, name)
        `)
        .order('date', { ascending: false });
      setPayments(updatedPayments);

      const paidStudentIds = new Set(updatedPayments.map(p => p.student_list.id));
      setUnpaidStudents(students.filter(s => !paidStudentIds.has(s.id)));
    }
  };

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
        <Col md={3} className="text-end">
          <Button variant="primary" onClick={() => setShowModal(true)}><FaPlus /> Add Payment</Button>
        </Col>
      </Row>

      <Row>
        <Col>
          {loading ? (
            <p>Loading payments...</p>
          ) : (
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
                {payments.map(({ id, method, amount, status, date, student_list }) => (
                  <tr key={id}>
                    <td>{id}</td>
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

      {/* Add Payment Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Payment</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddPayment}>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="formStudent">
              <Form.Label>Student</Form.Label>
              <Form.Select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                required
              >
                <option value="">Select a student</option>
                {unpaidStudents.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
            
<Form.Group className="mb-3" controlId="formMethod">
  <Form.Label>Payment Method</Form.Label>
  <Form.Select
    value={paymentMethod}
    onChange={(e) => setPaymentMethod(e.target.value)}
    required
  >
    <option value="">Select a method</option>
    <option value="Credit Card">Credit Card</option>
    <option value="UPI">UPI</option>
    <option value="Net Banking">Net Banking</option>
    <option value="Cash">Cash</option>
    {/* Add more options as needed */}
  </Form.Select>
</Form.Group>


            <Form.Group className="mb-3" controlId="formAmount">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formStatus">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                required
              >
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Failed">Failed</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formDate">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Add Payment</Button>
          </Modal.Footer>
        </Form>
      </Modal>

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