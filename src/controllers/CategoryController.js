import { uploadStream } from '../utils/cloudinary.js'
import CategoryModel from '../models/CategoryModel.js'
import Logging from '../libraries/logging.js'
import slugify from 'slugify'
import UserModel from '../models/UserModel.js'

// @desc Create a new category
// @route POST /categories
// @access Private
const createCategory = async (req, res) => {
  const { name, description } = req.body
  try {
    // Handle image upload
    let image
    if (req.file) {
      // Upload image to cloudinary
      let uploadedFile
      uploadedFile = await uploadStream(req.file.buffer, 'categories', 480)

      if (uploadedFile) {
        image = uploadedFile.secure_url
      }
    }

    const user = await UserModel.findOne({ username: req.user })

    // Create category
    const category = await CategoryModel.create({
      user: user._id,
      name,
      slug: slugify(name).toLowerCase(),
      description,
      image: image
    })

    if (category) {
      res.status(201).json({ message: `New category ${name} created.` })
    } else {
      res.status(400).json({ message: 'Invalid category data received.' })
    }
  } catch (err) {
    Logging.error(err)
    res.status(400).json({ message: 'Bad request.' })
  }
}

export default {
  createCategory
}
