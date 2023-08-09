import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Container } from 'react-bootstrap'
import { LoadingSpinner, Post } from 'components'
import { useRequireAuth } from 'hooks/useRequireAuth'
import axios from 'utils/axiosConfig.js'

const PostDetailPage = () => {
  const [post, setPost] = useState()
  const [loading, setLoading] = useState(true)

  let navigate = useNavigate();
  let params = useParams();

  const {
    state: { isAuthenticated },
  } = useRequireAuth()

  useEffect(() => {
    const getPost = async () => {
      try {
        const postDetail = await axios.get(`posts/${params.pid}`)
        setPost(postDetail.data)
        setLoading(false)
      } catch (err) {
        console.error(err.message)
      }
    }
    isAuthenticated && getPost()
  }, [params.pid, isAuthenticated])

  if (!isAuthenticated) {
    return <LoadingSpinner full />
  }

  if (loading) {
    return <LoadingSpinner full />
  }

  return (
    <Container>
      <Button variant='outline-info' onClick={()=>{navigate(-1)}}
        style={{border:'none', color: '#E5E1DF'}}
        className="mt-3"
        >
        Go Back
      </Button>
      <Post post={post} detail />
    </Container>
  )
}

export default PostDetailPage