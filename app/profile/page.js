'use client'

import { useState, useEffect } from 'react'
import { Container, Row, Col, Form, Card } from 'react-bootstrap'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Profile() {
  const router = useRouter()
  const [profileName, setProfileName] = useState('')
  const [profileEmail, setProfileEmail] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true)
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        router.push('/auth/signin') // redirect if not signed in
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error loading profile:', error.message)
      } else if (data) {
        setProfileName(data.full_name || '')
        setProfileEmail(data.email || '')
      }
      setLoading(false)
    }
    fetchProfile()
  }, [router])

  if (loading) return <div>Loading profile...</div>

  return (
    <Container fluid className="p-6">
      <Card className="mb-4 p-4 shadow-sm">
        <Row className="align-items-center">
          <Col xs={12} md={12}>
            <h4>Profile Details</h4>
            <Form>
              <Form.Group controlId="profileName" className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control type="text" value={profileName} disabled />
              </Form.Group>

              <Form.Group controlId="profileEmail" className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" value={profileEmail} disabled />
              </Form.Group>
            </Form>
          </Col>
        </Row>
      </Card>
    </Container>
  )
}
