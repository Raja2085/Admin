'use client';

import { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, Modal } from 'react-bootstrap';
import { FaCalendarAlt, FaFilter, FaPlusCircle } from 'react-icons/fa';

const sampleEvents = [
  {
    id: 1,
    title: "Math Workshop",
    date: "2025-09-20",
    time: "10:00 AM - 12:00 PM",
    description: "Interactive math problem-solving session.",
    location: "Room 101",
    type: "Workshop",
  },
  {
    id: 2,
    title: "Science Quiz",
    date: "2025-09-23",
    time: "2:00 PM - 3:30 PM",
    description: "Participate in the monthly science quiz competition.",
    location: "Auditorium",
    type: "Competition",
  },
  {
    id: 3,
    title: "Parent-Teacher Meeting",
    date: "2025-09-25",
    time: "4:00 PM - 5:00 PM",
    description: "Discuss progress with your teachers.",
    location: "Conference Hall",
    type: "Meeting",
  },
];

export default function StudentEvents() {
  const [events, setEvents] = useState(sampleEvents);
  const [filter, setFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);

  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    description: '',
    location: '',
    type: ''
  });

  const eventTypes = [...new Set(events.map(e => e.type))];

  const filteredEvents = filter === "All" ? events : events.filter(event => event.type === filter);

  const handleNewEventChange = (e) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date || !newEvent.type) {
      alert("Please fill at least title, date, and type");
      return;
    }
    setEvents(prev => [...prev, { ...newEvent, id: prev.length + 1 }]);
    setNewEvent({ title: '', date: '', time: '', description: '', location: '', type: '' });
    setShowModal(false);
  };

  return (
    <Container fluid className="p-4 bg-white rounded shadow-sm max-w-7xl mx-auto">
      <Row className="align-items-center mb-4">
        <Col>
          <h2 className="d-flex align-items-center gap-2">
            <FaCalendarAlt /> Student Events
          </h2>
        </Col>
        <Col xs="auto">
          <Button variant="primary" className="d-flex align-items-center gap-2" onClick={() => setShowModal(true)}>
            <FaPlusCircle /> Add New Event
          </Button>
        </Col>
      </Row>

      <Row className="mb-3 align-items-center">
        <Col xs="auto" className="d-flex align-items-center gap-2">
          <FaFilter />
          <Form.Select
            aria-label="Filter events by type"
            style={{ maxWidth: "200px" }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All Events</option>
            {eventTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      <Row xs={1} md={2} lg={3} className="g-4">
        {filteredEvents.length === 0 ? (
          <p className="text-center w-100">No events found for the selected filter.</p>
        ) : (
          filteredEvents.map((event) => (
            <Col key={event.id}>
              <Card className="h-100 shadow-sm border-0">
                <Card.Body>
                  <Card.Title>{event.title}</Card.Title>
                  <Badge bg="info" className="mb-2">{event.type}</Badge>
                  <Card.Text>{event.description}</Card.Text>
                  <Card.Text>
                    <strong>Date:</strong> {event.date}<br />
                    <strong>Time:</strong> {event.time}<br />
                    <strong>Location:</strong> {event.location}
                  </Card.Text>
                </Card.Body>
                <Card.Footer className="d-flex justify-content-end">
                  <Button variant="outline-primary" size="sm">Details</Button>
                </Card.Footer>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* Modal for Adding New Event */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Event</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddEvent}>
            <Form.Group className="mb-3" controlId="eventTitle">
              <Form.Label>Title*</Form.Label>
              <Form.Control
                name="title"
                type="text"
                placeholder="Enter event title"
                value={newEvent.title}
                onChange={handleNewEventChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="eventDate">
              <Form.Label>Date*</Form.Label>
              <Form.Control
                name="date"
                type="date"
                value={newEvent.date}
                onChange={handleNewEventChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="eventTime">
              <Form.Label>Time</Form.Label>
              <Form.Control
                name="time"
                type="text"
                placeholder="Enter event time (optional)"
                value={newEvent.time}
                onChange={handleNewEventChange}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="eventLocation">
              <Form.Label>Location</Form.Label>
              <Form.Control
                name="location"
                type="text"
                placeholder="Enter location (optional)"
                value={newEvent.location}
                onChange={handleNewEventChange}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="eventType">
              <Form.Label>Type*</Form.Label>
              <Form.Control
                name="type"
                as="select"
                value={newEvent.type}
                onChange={handleNewEventChange}
                required
              >
                <option value="">Select event type</option>
                <option value="Workshop">Workshop</option>
                <option value="Competition">Competition</option>
                <option value="Meeting">Meeting</option>
                <option value="Other">Other</option>
              </Form.Control>
            </Form.Group>

            <Form.Group className="mb-3" controlId="eventDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                name="description"
                as="textarea"
                rows={3}
                placeholder="Add event description (optional)"
                value={newEvent.description}
                onChange={handleNewEventChange}
              />
            </Form.Group>

            <Button variant="primary" type="submit">
              Add Event
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}
