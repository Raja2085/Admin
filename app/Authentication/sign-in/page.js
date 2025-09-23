'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Form, Button, Alert } from 'react-bootstrap'
import { supabase } from '../../../lib/supabaseClient'

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSignIn = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    // Query signin table for matching credentials
    const { data, error } = await supabase
      .from('signin')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single()

    if (error || !data) {
      setErrorMsg('Invalid email or password')
      return
    }

    // Success: redirect or load next page
    router.push('/dashboard')
  }

  return (
    <>
      <h2 className="mb-4 text-center">Sign In</h2>
      {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
      <Form onSubmit={handleSignIn}>
        <Form.Group className="mb-3" controlId="formEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
        </Form.Group>
        <Form.Group className="mb-4" controlId="formPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
        <Button variant="primary" type="submit" className="w-100">
          Sign In
        </Button>
      </Form>
    </>
  )
}
