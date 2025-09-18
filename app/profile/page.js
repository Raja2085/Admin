'use client';
import { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Image, Alert, Modal } from 'react-bootstrap';
import LogoutButton from '../logout/LogoutButton';


function ProfilePage() {
  // other profile components

  return (
    <>
      {/* profile info components */}
      <LogoutButton />
    </>
  );
}


export default function Settings() {
  const [profileImage, setProfileImage] = useState(null);
  const [profileName, setProfileName] = useState("John Doe");
  const [newName, setNewName] = useState(profileName);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleImageChange = (e) => {
    if(e.target.files && e.target.files[0]) {
      setProfileImage(URL.createObjectURL(e.target.files[0]));
      setUploadSuccess(true);
    }
  };

  const handleNameUpdate = (e) => {
    e.preventDefault();
    setProfileName(newName);
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 3000);
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);
    if(newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }
    // TODO: Add backend API integration here
    setPasswordSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleLogout = () => {
    // TODO: Add actual logout logic here
    setShowLogoutModal(false);
    alert("Logged out successfully");
  };

  return (
    <Container fluid className="p-6">
      {/* Profile Section */}
      <Card className="mb-4 p-4 shadow-sm">
        <Row className="align-items-center">
          <Col xs={12} md={3} className="text-center">
            <Image
              src={profileImage || "/default-profile.png"}
              roundedCircle
              fluid
              alt="Profile Image"
              style={{ width: '150px', height: '150px', objectFit: 'cover' }}
              className="mb-3"
            />
            <Form.Group controlId="formFile" className="mb-0">
              <Form.Label className="btn btn-outline-primary cursor-pointer">
                Change Profile Image
                <Form.Control type="file" accept="image/*" hidden onChange={handleImageChange} />
              </Form.Label>
            </Form.Group>
            {uploadSuccess && <Alert variant="success" className="mt-2">Profile image updated!</Alert>}
          </Col>

          <Col xs={12} md={9}>
            <h4>Profile Details</h4>
            <Form onSubmit={handleNameUpdate} className="mb-4">
              <Form.Group controlId="profileName" className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                />
              </Form.Group>
              <Button variant="primary" type="submit">Update Name</Button>
            </Form>

            <hr />

            <h4>Change Password</h4>
            <Form onSubmit={handlePasswordChange}>
              {passwordError && <Alert variant="danger">{passwordError}</Alert>}
              {passwordSuccess && <Alert variant="success">Password changed successfully!</Alert>}

              <Form.Group controlId="currentPassword" className="mb-3">
                <Form.Label>Current Password</Form.Label>
                <Form.Control
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group controlId="newPassword" className="mb-3">
                <Form.Label>New Password</Form.Label>
                <Form.Control
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group controlId="confirmPassword" className="mb-3">
                <Form.Label>Confirm New Password</Form.Label>
                <Form.Control
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <Button variant="warning" type="submit" className="mb-4">Change Password</Button>
            </Form>

            <Button variant="danger" onClick={() => setShowLogoutModal(true)}>
              Logout
            </Button>

            {/* Logout Confirmation Modal */}
            <Modal show={showLogoutModal} onHide={() => setShowLogoutModal(false)} centered>
              <Modal.Header closeButton>
                <Modal.Title>Confirm Logout</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                Are you sure you want to logout?
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowLogoutModal(false)}>Cancel</Button>
                <Button variant="danger" onClick={handleLogout}>Logout</Button>
              </Modal.Footer>
            </Modal>
          </Col>
        </Row>
      </Card>
    </Container>
  );
}