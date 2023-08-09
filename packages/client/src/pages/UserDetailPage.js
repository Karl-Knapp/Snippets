import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Figure,
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { LoadingSpinner, Post } from "components";
import { useProvideAuth } from "hooks/useAuth";
import { useRequireAuth } from "hooks/useRequireAuth";
import axios from "utils/axiosConfig.js";
import AvatarPicker from 'components/AvatarPicker/AvatarPicker'
import { toast } from 'react-toastify';


const UserDetailPage = () => {
  const { state } = useProvideAuth();
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(true);
  const [validated, setValidated] = useState(false);
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
    isSubmitting: false,
    errorMessage: null,
  })
  const [passwordCheck, setPasswordCheck] = useState({
    match: false,
    stringLength: 0
  })

  let navigate = useNavigate();
  let params = useParams();
  const {
    state: { isAuthenticated },
  } = useRequireAuth();

  useEffect(() => {
    const getUser = async () => {
      try {
        const userResponse = await axios.get(`users/${params.uid}`);
        setUser(userResponse.data);
        setLoading(false);
      } catch (err) {
        console.error(err.message);
      }
    };
    isAuthenticated && getUser();
  }, [params.uid, isAuthenticated]);

  const handleInputChange = (event) => {
    setData({
      ...data,
      [event.target.name]: event.target.value,
    });
  };

  const handleAvatarChange = (src) => {

    /*setUser({
      ...user,
      profile_image2: src
    });*/

    const id = user._id
    if (data !== null) {
      axios.put(`/users/${id}`, { profile_image: src }).then(response => {
        console.log('Updated successfully', response.data)
        })
        .catch(error => {
        console.log("Error:", error)
        })
    }
  }

  const handleUpdatePassword = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    const form = event.currentTarget;
    // handle invalid or empty form
    if (form.checkValidity() === false) {
      setValidated(true);
      return;
    }
    setData({
      ...data,
      isSubmitting: true,
      errorMessage: null,
    });
    try {
      // write code to call edit user endpoint 'users/:id'
      const {
        user: { uid, username },
      } = state;
      console.log(data.password, uid, username);
      setValidated(false);
      //const password
      if (passwordCheck.match === true /*&& passwordCheck.stringLength >= 8 && passwordCheck.stringLength <= 20*/) { //To be reactivated after assessment to have both front end and back end checks.
        axios.put(`/users/${uid}`, { password: data.password, current_password: data.currentPassword, }).then(response => {
          console.log('Updated successfully', response.data)
          setData({
            ...data,
            isSubmitting: false,
          });
        })
        .catch(error => {
          setData({
            ...data,
            isSubmitting: false,
          });
          toast.error(`${error.response.status}: ${error.response.data}`)
        })
      } /*else if (!(passwordCheck.stringLength >= 8)) { //To be activated after assessment to have both frontend and backend restrictions.
        toast.error('Password too short!')
        setData({
          ...data,
          isSubmitting: false,
        });
      } else if (!(passwordCheck.stringLength <= 20)) {
        toast.error('Password too long!')
        setData({
          ...data,
          isSubmitting: false,
        });
      }*/ else {
        toast.error('Confirmation password does not match!')
        setData({
          ...data,
          isSubmitting: false,
        });
      }
      // don't forget to update loading state and alert success
    } catch (error) {
      setData({
        ...data,
        isSubmitting: false,
        errorMessage: error.message,
      });
      toast.error(`${error.status}: ${error.message}`)
    }
  };

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

  if (!isAuthenticated) {
    return <LoadingSpinner full />;
  }

  if (loading) {
    return <LoadingSpinner full />;
  }

  return (
    <>
      <Container className="clearfix">
        <Button
          variant="outline-info"
          onClick={() => {
            navigate(-1);
          }}
          style={{ border: "none", color: "#E5E1DF" }}
          className="mt-3 mb-3"
        >
          Go Back
        </Button>
        <Card bg="header" className="text-center">
          <Card.Body>
            <AvatarPicker avatar={user.profile_image} onChange={handleAvatarChange}/>
            <Card.Title>{params.uid}</Card.Title>
            <p>{user.email || 'Please update user to add email'}</p>
            {state.user.username === params.uid && (
              <div
                onClick={() => setOpen(!open)}
                style={{ cursor: "pointer", color: "#BFBFBF" }}
              >
                Edit Password
              </div>
            )}
            {open && (
              <Container animation="false">
                <div className="row justify-content-center p-4">
                  <div className="col text-center">
                    <Form
                      noValidate
                      validated={validated}
                      onSubmit={handleUpdatePassword}
                    >
                      <Form.Group>
                        <Form.Label htmlFor="password">New Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="password"
                          required
                          //minLength={8} //Reactivated later
                          //maxLength={20}
                          //pattern=".{8,20}"
                          value={data.password}
                          onChange={handleInputChange}
                        />
                        <Form.Control.Feedback type="invalid">
                          New Password is required
                        </Form.Control.Feedback>
                        <Form.Text id="passwordHelpBlock" muted>
                          Must be 8-20 characters long.
                        </Form.Text>
                      </Form.Group>

                      <Form.Group>
                        <Form.Label htmlFor="passwordConfirm">Confirm New Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="passwordConfirm"
                          required
                          //minLength={8}
                          //maxLength={20}
                          //pattern=".{8,20}"
                          value={data.passwordConfirm}
                          onChange={handleInputChange}
                        />
                        <Form.Control.Feedback type="invalid">
                          Please confirm your new password
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group>
                        <Form.Label htmlFor="currentPassword">Current Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="currentPassword"
                          required
                          value={data.currentPassword}
                          onChange={handleInputChange}
                        />
                        <Form.Control.Feedback type="invalid">
                          Current Password is required
                        </Form.Control.Feedback>
                      </Form.Group>

                      {data.errorMessage && (
                        <span className="form-error">{data.errorMessage}</span>
                      )}
                      <Button type="submit" disabled={data.isSubmitting}>
                        {data.isSubmitting ? <LoadingSpinner /> : "Update"}
                      </Button>
                    </Form>
                  </div>
                </div>
              </Container>
            )}
          </Card.Body>
        </Card>
      </Container>
      <Container className="pt-3 pb-3">
        {user.posts.length !== 0 ? (
          user.posts.map((post) => (
            <Post key={post._id} post={post} userDetail />
          ))
        ) : (
          <div
            style={{
              marginTop: "75px",
              textAlign: "center",
            }}
          >
            No User Posts
          </div>
        )}
      </Container>
    </>
  );
};

export default UserDetailPage;
