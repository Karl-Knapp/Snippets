import express from 'express'
const router = express.Router()
import jwt from 'jsonwebtoken'
import keys from '../config/keys'
import { User, Post } from '../models'
import { requireAuth } from '../middleware'

// /api/posts
router.get('/', async (request, response) => {
  const populateQuery = [
    { path: 'author', select: ['username', 'profile_image'] },
    {
      path: 'comments',
      populate: { path: 'author', select: ['username', 'profile_image'] },
      select: ['created',],
    },
    {
      path: 'likes',
      select: 'username',
    },
  ];
  const posts = await Post.find({})
    .sort({ created: -1 })
    .populate(populateQuery)
    .exec()

  response.json(posts.map((post) => {
    const postObject = post.toJSON()
    postObject.likes = post.likes.map((user) => user.username)
    return postObject
  }))
})

router.get('/hello/:name', (req, res) => {
  const { name } = req.params;

  if (!name) {
    return res.status(400).json({ error: 'Name is required'})
  }

  const message = `Hello ${name}!`
  res.json({ message })
})

router.post('/', requireAuth, async (request, response, next) => {
  const { text } = request.body
  const { user } = request

  const post = new Post({
    text: text,
    author: user._id,
  })

  try {
    const savedPost = await post.save()
    user.posts = user.posts.concat(savedPost._id)

    await user.save()

    response.json(savedPost.toJSON())
  } catch (error) {
    next(error)
  }
})

router.get('/:id', async (request, response) => {
  const populateQuery = [
    { path: 'author', select: ['username', 'profile_image'] },
    {
      path: 'comments',
      populate: { path: 'author', select: ['username', 'profile_image'] },
    },
  ]
  const post = await Post.findById(request.params.id)
    .populate(populateQuery)
    .exec()
  if (post) {
    response.json(post.toJSON())
  } else {
    response.status(404).end()
  }
})

router.delete('/:id', requireAuth, async (request, response, next) => {
  const { userId } = request.query
  const { id } = request.params
  const post = await Post.findById({ _id: id })
  

  if (!post) {
    return response.status(422).json({ error: 'Cannot find post' })
  }
  
  if (post.author._id.toString() === userId.toString()) {
    try {
      const removedPost = await Post.findByIdAndDelete(id)

      const userUpdate = await User.updateOne(
        { _id: userId },
        { $pull: { posts: id } }
      )

      response.json(removedPost)
    } catch (err) {
      next(err)
    }
  }
})

router.all('/like/:postId', requireAuth, async (request, response) => {
  const { postId } = request.params
  const { user } = request
  const post = await Post.findOne({ _id: postId })

  if (!post) {
    return response.status(422).json({ error: 'Cannot find post' })
  }
  try {
    if (post.likes.includes(user.id)) {
      const result = await post.updateOne({
        $pull: { likes: user.id },
      })

      response.json(result)
    } else {
      const result = await post.updateOne({
        $push: { likes: user.id },
      })

      response.json(result)
    }
  } catch (err) {
    return response.status(422).json({ error: err })
  }
})

router.put('/comments', async (request, response, next) => {
  const { text, userId, postId } = request.body
  const comment = {
    text: text,
    author: userId,
  }
  const populateQuery = [
    { path: 'comments.author', select: ['username', 'profile_image'] },
  ]
  Post.findByIdAndUpdate(
    postId,
    {
      $push: { comments: comment },
    },
    {
      new: true,
    }
  )
    .populate(populateQuery)
    .exec((err, result) => {
      if (err) {
        next(err)
      } else {
        response.json(result)
      }
    })
})



module.exports = router
