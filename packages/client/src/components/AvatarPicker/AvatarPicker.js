import { useState } from 'react';
import { Container, Modal, Row, Figure, Form, Button, Image } from 'react-bootstrap';
import './AvatarPicker.css'
import axios from "utils/axiosConfig.js";



const avatars = require.context('../../../public/', false, /\.svg$/)
const imageArray = avatars.keys().map((path) => ({ path: path.substring(1) }));


function AvatarPicker({ avatar, onChange }) {
  let initialAvatarProp;

  if (avatars.keys().includes(`.${avatar}`)) {
    initialAvatarProp = avatars(`.${avatar}`);
  } else {
    initialAvatarProp = avatar;
  }
  const [avatarProp, setAvatarProp] = useState(initialAvatarProp)
  const [selectedAvatar, setSelectedAvatar] = useState()//(imageArray.find(ava => ava.path === `.${avatar}`))
  const [showModal, setShowModal] = useState(false);
  const [selection, setSelection] = useState(null)
  const [file, setFile] = useState();
  const [fileUploading, setFileUploading] = useState(false)
  const [data, setData] = useState(null);

  const handleClick = () => {
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
  };

  function handleImageSelect(option, index) {
    setSelectedAvatar(option);
    setSelection(index);
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (data !== null) {
      setAvatarProp(`http://localhost:3001${data.data.path}`)
      onChange(`http://localhost:3001${data.data.path}`)
    } else {
      setAvatarProp(selectedAvatar.path)
      onChange(selectedAvatar.path)
    }
}

const handleUpload = async (e) => {
    e.preventDefault()

    const formData = new FormData()

    formData.append("postImage", file)
    const response = await axios.post("users/upload-avatar", formData)
    setData(response)
    setSelection(null)
    setFileUploading(false)
}

const handleFileChange = (e) => {
    setFile(e.target.files[0])
    setFileUploading(true)
}

  return (
    <div>
      <Figure
        className="bg-border-color rounded-circle overflow-hidden my-auto ml-2 p-1"
        style={{
          height: "50px",
          width: "50px",
          backgroundColor: "white",
        }}
      >
        <Figure.Image src={avatarProp} className="w-100 h-100" onClick={handleClick} />
      </Figure>     
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Select Avatar</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <p style={{ color: 'black' }}>Current Avatar:</p>
            <img src={avatarProp} alt="Avatar" style={{ width: '100px', height: '100px' }}/>
            <p style={{ color: 'black' }}>Choose an Avatar:</p>   
          </Row>
          <Row>
            {imageArray.map((option, index) => (
                <img 
                  key={index} 
                  src={option.path} 
                  alt="Avatar" 
                  style={{ width: '100px', height: '100px' }}
                  className={`item ${selection === index ? 'active' : ''}`}
                  onClick={() => handleImageSelect(option, index)}
                />
                
            ))}
            
          </Row>
          <Row style={{ color: 'black' }}>______________________________________________________</Row>
          <Row>
            {/* Upload Avatar */}
            {data && (
              <Image
                src={`${data.data.path}`}
                alt="Uploaded file"
                fluid
                style={{ width: '100px', height: '100px' }}
              />
            )}
            <Container style={{ color: 'black' }}>
              <Form onSubmit={handleSubmit}>
                  <Form.Group>
                      <Form.Label>Upload Image:</Form.Label>
                      <Form.Control
                      type="file"
                      name="postImage"
                      onChange={handleFileChange}
                      />
                      <Button type="button" variant="secondary" onClick={handleUpload}>
                          Upload Selected Image
                      </Button>
                  </Form.Group>
              </Form>
            </Container>
          </Row>
        </Modal.Body>
        <Modal.Footer>
            <Button type="submit" disabled={fileUploading} variant="primary" onClick={(e) => {
                handleSubmit(e);
                handleClose();
            }}>
                Select
            </Button>
            <Button onClick={handleClose}>
                Close
            </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default AvatarPicker;