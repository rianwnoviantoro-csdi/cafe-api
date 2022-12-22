import bcrypt from 'bcrypt'
import Logging from '../libraries/logging.js'
import UserModel from '../models/UserModel.js'

// @desc Register new user
// @route POST /users
// @access Private
const createNew = async (req, res) => {
  const { name, username, email, password, roles } = req.body
  try {
    const duplicate = await UserModel.findOne({ $or: [({ username: username }, { email: email })] })
      .lean()
      .exec()

    if (duplicate) return res.status(409).json({ message: 'Duplicate username or email.' })

    // Create new user
    const user = await UserModel.create({ name, username, email, password, roles })

    if (user) {
      res.status(201).json({ message: `New user ${username} created.` })
    } else {
      res.status(400).json({ message: 'Invalid user data received.' })
    }
  } catch (err) {
    Logging.error(err)
    res.status(400).json({ message: 'Bad request.' })
  }
}

// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = async (req, res) => {
  try {
    // Get all users from MongoDB
    const users = await UserModel.find().select('-password').lean()

    // If no users
    if (!users?.length) {
      return res.status(400).json({ message: 'No users found' })
    }

    res.json(users)
  } catch (err) {
    Logging.error(err)
    res.status(400).json({ message: 'Bad request.' })
  }
}

// @desc Update a user
// @route PATCH /update-profile
// @access Private
const updateProfile = async (req, res) => {
  try {
    const user = await UserModel.findOne({ username: req.user })

    if (!user) return res.status(404).json({ message: 'User not found.' })

    const { name, username, email, roles, isActive, photo, phone } = user

    user.email = email
    user.username = username
    user.name = req.body.name || name
    user.phone = req.body.phone || phone
    user.photo = req.body.photo || photo
    user.roles = req.body.roles || roles
    user.isActive = req.body.isActive || isActive

    const updatedUser = await user.save()

    res.json({ message: `${updatedUser.username} updated.` })
  } catch (err) {
    Logging.error(err)
    res.status(400).json({ message: 'Bad request.' })
  }
}

// @desc Update user password
// @route PATCH /change-password
// @access Private
const changePassword = async (req, res) => {
  const { oldPassword, password } = req.body

  try {
    const user = await UserModel.findOne({ username: req.user })

    if (!user) return res.status(404).json({ message: 'User not found.' })

    // check if old password matches password in DB
    const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password)

    // Save new password
    if (!passwordIsCorrect) return res.status(400).json({ message: 'Old password is incorrect.' })

    user.password = password

    await user.save()

    const cookies = req.cookies

    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })

    res.status(200).send({ message: 'Password change successful.' })
  } catch (err) {
    Logging.error(err)
    res.status(400).json({ message: 'Bad request.' })
  }
}

export default {
  getAllUsers,
  createNew,
  updateProfile,
  changePassword
}
