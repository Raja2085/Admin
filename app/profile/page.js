'use client'

import { useState, useEffect } from 'react'
import { Container, Row, Col, Form, Card, Button, Alert } from 'react-bootstrap'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Profile() {
  const router = useRouter()
  const [profileName, setProfileName] = useState('')
  const [profileEmail, setProfileEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true)
      const isAuthenticated = localStorage.getItem('isAuthenticated')
      const userEmail = localStorage.getItem('userEmail')

      if (!isAuthenticated || !userEmail) {
        router.push('/Authentication/sign-in')
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('email', userEmail)
        .single()

      if (error) {
        console.error('Error loading profile:', error.message)
        setError('Failed to load profile')
      } else if (data) {
        setProfileName(data.full_name || '')
        setProfileEmail(data.email || '')
      }
      setLoading(false)
    }
    fetchProfile()
  }, [router])

  const handleUpdate = async () => {
    setMessage('')
    setError('')
    const userEmail = localStorage.getItem('userEmail')
    if (!userEmail) {
      setError('User not found')
      return
    }

    // Update profile name
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ full_name: profileName })
      .eq('email', userEmail)

    if (updateError) {
      setError('Failed to update profile name')
      return
    }

    // Password change validation and update
    if (newPassword.trim() !== '' || confirmPassword.trim() !== '') {
      if (newPassword !== confirmPassword) {
        setError('New password and confirm password do not match')
        return
      }
      if (currentPassword.trim() === '') {
        setError('Please enter your current password')
        return
      }

      // Verify current password
      const { data, error: passCheckError } = await supabase
        .from('signin')
        .select('password')
        .eq('email', userEmail)
        .single()

      if (passCheckError) {
        setError('Failed to verify current password')
        return
      }

      if (!data || data.password !== currentPassword) {
        setError('Current password is incorrect')
        return
      }

      // Update to new password
      const { error: passError } = await supabase
        .from('signin')
        .update({ password: newPassword })
        .eq('email', userEmail)

      if (passError) {
        setError('Failed to update password')
        return
      }
    }

    setMessage('Profile updated successfully')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  if (loading) return <div>Loading profile...</div>

  return (
    <Container fluid className="p-6">
      <Card className="mb-4 p-4 shadow-sm">
        <Row className="align-items-center">
          <Col xs={12} md={6}>
            <h4>Profile Details</h4>
            {message && <Alert variant="success">{message}</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}
            <Form>
              <Form.Group controlId="profileName" className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                />
              </Form.Group>

              <Form.Group controlId="profileEmail" className="mb-3">
                <Form.Label>Email (readonly)</Form.Label>
                <Form.Control type="email" value={profileEmail} disabled />
              </Form.Group>

              <Form.Group controlId="currentPassword" className="mb-3">
                <Form.Label>Current Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </Form.Group>

              <Form.Group controlId="newPassword" className="mb-3">
                <Form.Label>New Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </Form.Group>

              <Form.Group controlId="confirmPassword" className="mb-3">
                <Form.Label>Confirm New Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </Form.Group>

              <Button variant="primary" onClick={handleUpdate}>
                Save Changes
              </Button>
            </Form>
          </Col>
        </Row>
      </Card>
    </Container>
  )
}
