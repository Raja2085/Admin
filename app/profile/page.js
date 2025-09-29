'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Container, Row, Col, Form, Card, Button, Alert } from 'react-bootstrap'

export default function Profile() {
  const router = useRouter()
  const [profileName, setProfileName] = useState('')
  const [profileEmail, setProfileEmail] = useState('')
  const [userId, setUserId] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true)
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (!user || userError) {
        router.push('/Authentication/sign-in')
        setLoading(false)
        return
      }
      setUserId(user.id)
      setProfileEmail(user.email)
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()
      if (profileError) setError('Failed to load profile')
      else setProfileName(data.full_name || '')
      setLoading(false)
    }
    fetchProfile()
  }, [router])

  const handleUpdate = async () => {
    setError('')
    setMessage('')
    if (!userId) {
      setError('User not found')
      return
    }

    // Password change only; name/email are read-only and not updated

    if (newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        setError('Passwords do not match')
        return
      }
      if (!currentPassword || currentPassword.length < 6) {
        setError('Enter your current password')
        return
      }
      const { error: passwordError } = await supabase.auth.updateUser({ password: newPassword })
      if (passwordError) {
        setError('Failed to update password')
        return
      }
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }

    setMessage('Profile updated successfully')
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
                  readOnly
                />
              </Form.Group>
              <Form.Group controlId="profileEmail" className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={profileEmail}
                  readOnly
                />
              </Form.Group>
              <Form.Group controlId="currentPassword" className="mb-3">
                <Form.Label>Current Password</Form.Label>
                <Form.Control
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
              </Form.Group>
              <Form.Group controlId="newPassword" className="mb-3">
                <Form.Label>New Password</Form.Label>
                <Form.Control
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </Form.Group>
              <Form.Group controlId="confirmPassword" className="mb-3">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </Form.Group>
              <Button variant="primary" onClick={handleUpdate}>Save Changes</Button>
            </Form>
          </Col>
        </Row>
      </Card>
    </Container>
  )
}
