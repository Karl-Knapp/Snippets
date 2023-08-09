import React from 'react'
import { Navbar, Nav, Button, Figure } from 'react-bootstrap'
import { useProvideAuth } from 'hooks/useAuth'

export default function Header() {
  const {
    state: { user },
    signout,
  } = useProvideAuth()

  if (!user) {
    return null
  }
  return (
    <Navbar bg='header' expand='lg'>
      <Navbar.Brand style={{marginLeft:'50px'}}>
          <Nav.Link href={'/'}>
            <img src='/logo.png' alt='logo' width='180px'/>
          </Nav.Link>
      </Navbar.Brand>
      <Navbar.Toggle aria-controls='basic-navbar-nav' />
      <Navbar.Collapse id='basic-navbar-nav'>
        {user && (
          <>
            <Nav className='ml-auto mr-2'>
                <Nav.Link className='d-flex align-items-end'
                href={`/u/${user.username}`}>
                  <Figure
                    className='bg-border-color rounded-circle overflow-hidden my-auto ml-2 p-1'
                    style={{ height: '35px', width: '35px', background: 'white'}}
                  >
                    <Figure.Image
                      src={user.profile_image}
                      className='w-100 h-100'
                    />
                  </Figure>
                </Nav.Link>
            </Nav>
            <Button variant='outline-info' onClick={() => signout()}
              style={{border:'none', marginRight: '50px', color: '#E5E1DF'}}
              >
              Sign Out
            </Button>
          </>
        )}
      </Navbar.Collapse>
    </Navbar>
  )
}
