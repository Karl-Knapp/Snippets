import express from 'express'
import bcrypt from 'bcryptjs'
import { User } from '../models'
import { requireAuth } from '../middleware'
import path from 'path'
//const fileUpload = require('express-fileupload');

const router = express.Router()
//router.use(fileUpload({ createParentPath: true }));

router.post('/upload-avatar', async (req, res) => { 
  try {
    if(!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: "No files uploaded." })
    }

    const postImage = req.files.postImage

    const uploadPath = path.join(__dirname, "../public/images", postImage.name)
    
    postImage.mv(uploadPath, function (err) {
      if (err) {
        return res.sendStatus(500)
      } 
    }) 

    res.json({ path: "/images/" + postImage.name })
  } catch (error) {
    res.status(500).send(error.message);
  }
});



/*router.get('/top', async (req, res) => {
  try {
    const result = await User.aggregate([
      {
        $project: {
          username: 1,
          postCount: { $size: '$posts' },
        },
      },
      {
        $group: {
          _id: '$_id',
          username: { $first: '$username' },
          postCount: { $sum: '$postCount' },
        },
      },
      {
        $sort: { postCount: -1 },
      },
      {
        $limit: 3,
      },
    ]);
    
    const users = result.map(user => {
      return {
        username: user,
        postCount: user.postCount
      }
    });
    
    res.json({ users });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get('/alice', async (req, res) => {
  try {
    const user = await User.findOne({ username: 'alice' });
    if (user) {
      res.status(200).json(user.toJSON());
    } else {
      res.status(404).end();
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});*/



router
  .route('/:id')
  .get(async (request, response) => {
    const populateQuery = [
      {
        path: 'posts',
        populate: { path: 'author', select: ['username', 'profile_image'] },
      },
    ]

    const user = await User.findOne({ username: request.params.id })
      .populate(populateQuery)
      .exec()
    if (user) {
      response.json(user.toJSON())
    } else {
      response.status(404).end()
    }
  })
  .put(requireAuth, async (request, response) => {
    const { password, profile_image, current_password } = request.body
    const { id } = request.params
    const updateFields = {}
    const getUser = await User.findById(id)

    if (password) {
      if (!(password.length >= 8) && !(password.length <= 20)){
        const user = await User.findById(id)
        const passwordsMatch = await bcrypt.compare(current_password, getUser.passwordHash)
        if (passwordsMatch === true) {
          const hashedpassword = await bcrypt.hash(password, 12)
          updateFields.passwordHash = hashedpassword
        } else {
          response.status(401).end()
        }
      } else {
        response.status(400) 
        response.send('Password must be between 8 and 20 characters.')
      }
    }
    if (profile_image) {
        updateFields.profile_image = profile_image
        console.log(profile_image)
    }
    
    try {
        const userUpdate = await User.findByIdAndUpdate(
            id,
            updateFields,
            { new: true }
        )
    
        response.json(userUpdate.toJSON())
    } catch (error) {
        response.status(404).end()
    }
})




module.exports = router