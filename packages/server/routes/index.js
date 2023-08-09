import express from 'express'
import authRouter from './auth'
import userRouter from './users'
import postRouter from './posts'
const listEndpoints = require('express-list-endpoints');


const router = express.Router()


router.get('/', (req, res, next) => {
  res.status(200).send('api endpoint')
})

router.use('/auth', authRouter)
router.use('/users', userRouter)
router.use('/posts', postRouter)

router.get('/hello/:name?', (req, res) => {
    const { name } = req.params;
  
    if (!name) {
      return res.status(400).json({ error: 'Please provide a name'})
    }
  
    const message = `Hello ${name}!`
    res.json({ message })
  })

router.get('/add/:x?/:y?', (req, res) => {
  const { x, y } = req.params;
  
  if (!x || !y) {
    return res.status(400).json({ error: 'Please provide two numbers. (/add/x/y)'})
  }

  const sum = parseInt(x) + parseInt(y)
  res.json({ sum })
})

router.get('/teapot', (req, res) => {
  res.status(418).json({ error: 'Use a post request.' })
})

router.post('/teapot', (req, res) => {
  const { areYouATeapot } = req.body

  if (areYouATeapot) {
    res.status(418).json({ amIATeapot: 'yes' })
  } else {
    res.status(200).json({ amIATeapot: 'no' })
  }
})

module.exports = router
