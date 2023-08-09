import React, { useState, useEffect } from 'react'
import {
  Container,
  Row,
  Col,
  InputGroup,
  Form,
  Button,
} from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useProvideAuth } from 'hooks/useAuth'
import { LandingHeader, LoadingSpinner } from 'components'
import { setAuthToken } from 'utils/axiosConfig'
import AvatarPicker from 'components/AvatarPicker/AvatarPicker'
import { toast } from 'react-toastify';

const initialState = {
  username: '',
  email: '',
  password: '',
  passwordConfirm: '',
  isSubmitting: false,
  errorMessage: null,
}

export default function RegisterPage() {
  const [data, setData] = useState(initialState)
  const auth = useProvideAuth()
  
  let navigate = useNavigate();

  const [profileImage, setProfileImage] = useState(getRandomProfileUrl())
  const [passwordCheck, setPasswordCheck] = useState({
    match: false,
    stringLength: 0
  })

  function getRandomProfileUrl() {
    //geneartes random pic in img
    let imgs = [
      'bird.svg',
      'dog.svg',
      'fox.svg',
      'frog.svg',
      'lion.svg',
      'owl.svg',
      'tiger.svg',
      'whale.svg',
    ]
    let img = imgs[Math.floor(Math.random() * imgs.length)]
    return `/${img}`
  }

  const handleImageChange = (src) => {
    setProfileImage(src)
  }

  const handleInputChange = (event) => {
    setData({
      ...data,
      [event.target.name]: event.target.value,
    })
  }


  const handleSignup = async (event) => {
    const form = event.currentTarget
    event.preventDefault()
    event.stopPropagation()

    if (passwordCheck.match === true && passwordCheck.stringLength >= 8 && passwordCheck.stringLength <= 20) {
      if (form.checkValidity() === false) {
        // handle invalid form submission here
      }
    
      setData({
        ...data,
        isSubmitting: true,
        errorMessage: null,
      })

      try {
        const res = await auth.signup(data.username, data.password, profileImage, data.email)
        setData({
          ...data,
          isSubmitting: false,
          errorMessage: null,
        })
        setAuthToken(res.token)
        navigate('/')
      } catch (error) {
        setData({
          ...data,
          isSubmitting: false,
          errorMessage: error ? error.message || error.statusText : null,
        })
      }
    } else if (!(passwordCheck.stringLength >= 8)) {
      toast.error('Password too short!')
    } else if (!(passwordCheck.stringLength <= 20)) {
      toast.error('Password too long!')
    } else {
      toast.error('Confirmation password does not match!')
    }
  }

  useEffect(() => {
    if (data.password && data.passwordConfirm) {
      if (data.password === data.passwordConfirm) {
        setPasswordCheck({
          match: true,
          stringLength: data.password.length,
        });
      } else {
        setPasswordCheck({
          match: false,
          stringLength: data.password.length,
        });
      }
    }
  }, [data]);


  return (
    <div style={{overflow: "auto", height: "100vh"}}>
      <LandingHeader/>
      <Container className='mb-5'>
        <Row className='pt-5 justify-content-center'>
            <Form
                noValidate
                validated
                style={{ width: '350px' }}
                onSubmit={handleSignup}
            >
                <h3 className="mb-3">Join Us!</h3>
                <p>Select Avatar:</p>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <AvatarPicker avatar={profileImage} onChange={handleImageChange} />
                </div>
                <Form.Group controlId='username-register'>
                <Form.Label>Username</Form.Label>
                <InputGroup>
                    <InputGroup.Prepend>
                    <InputGroup.Text id='inputGroupPrepend'>@</InputGroup.Text>
                    </InputGroup.Prepend>
                    <Form.Control
                    type='text'
                    name='username'
                    placeholder='Username'
                    aria-describedby='inputGroupPrepend'
                    required
                    value={data.username}
                    onChange={handleInputChange}
                    />
                </InputGroup>
                </Form.Group>
                <Form.Group controlId='email-register'>
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type='email'
                    name='email'
                    placeholder='Enter email'
                    required
                    value={data.email}
                    onChange={handleInputChange}
                  />
                  <Form.Control.Feedback type='invalid'>
                    Please provide a valid email address.
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group>
                <Form.Label htmlFor='Register'>Password</Form.Label>
                <Form.Control
                    type='password'
                    name='password'
                    required
                    minLength={8}
                    maxLength={20}
                    pattern=".{8,20}"
                    id='inputPasswordRegister'
                    value={data.password}
                    onChange={handleInputChange}
                />
                </Form.Group>

                <Form.Group>
                        <Form.Label htmlFor="passwordConfirm">Confirm New Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="passwordConfirm"
                          required
                          minLength={8}
                          maxLength={20}
                          pattern=".{8,20}"
                          value={data.passwordConfirm}
                          onChange={handleInputChange}
                        />
                        <Form.Control.Feedback type="invalid">
                          Please confirm your new password
                        </Form.Control.Feedback>
                      </Form.Group>


                {data.errorMessage && (
                <span className='form-error text-warning'>{data.errorMessage}</span>
                )}
                <Row className='mr-0'>
                <Col>
                    Already Registered?
                    <Button
                    as='a'
                    variant='link'
                    onClick={() => navigate("/login")}
                    >
                    Login
                    </Button>
                </Col>
                <Button type='submit' disabled={data.isSubmitting}>
                    {data.isSubmitting ? <LoadingSpinner /> : 'Sign up'}
                </Button>
                </Row>
            </Form>
        </Row>
      </Container>
    </div>
  )
}
