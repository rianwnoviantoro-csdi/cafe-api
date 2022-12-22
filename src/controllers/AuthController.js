import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import Logging from '../libraries/logging.js'
import TokenModel from '../models/TokenModel.js'
import UserModel from '../models/UserModel.js'
import { sendEmail } from '../utils/sendEmail.js'

// @desc Login
// @route POST /auth
// @access Public
const login = async (req, res) => {
  const { usernameOrEmail, password } = req.body

  try {
    const foundUser = await UserModel.findOne({ $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }] })

    if (!foundUser || !foundUser.isActive) return res.status(401).json({ message: 'Wrong credential.' })

    const match = await bcrypt.compare(password, foundUser.password)

    if (!match) return res.status(401).json({ message: 'Wrong credential.' })

    const accessToken = jwt.sign(
      {
        UserInfo: {
          id: foundUser._id,
          name: foundUser.name,
          username: foundUser.username,
          roles: foundUser.roles
        }
      },
      process.env.APP_ACCESS_SECRET,
      { expiresIn: '10m' }
    )

    const refreshToken = jwt.sign(
      {
        id: foundUser._id,
        name: foundUser.name,
        username: foundUser.username,
        roles: foundUser.roles
      },
      process.env.APP_REFRESH_SECRET,
      { expiresIn: '7d' }
    )

    // Create secure cookie with refresh token
    res.cookie('jwt', refreshToken, {
      path: '/',
      httpOnly: true, //accessible only by web server
      secure: false, //https
      sameSite: 'None', //cross-site cookie
      maxAge: 7 * 24 * 60 * 60 * 1000 //cookie expiry: set to match rT
    })

    // Send accessToken containing id, name, username and roles
    res.json({ accessToken })
  } catch (err) {
    Logging.error(err)
    res.status(400).json({ message: 'Bad request.' })
  }
}

// @desc Get user data
// @route GET /
// @access Private
const profile = async (req, res) => {
  try {
    const user = await UserModel.findOne({ username: req.user }).select('-password')

    if (!user) return res.status(404).json({ message: 'User not found.' })

    return res.status(200).json({
      user
    })
  } catch (err) {
    Logging.error(err)
    res.status(400).json({ message: 'Bad request.' })
  }
}

// @desc Refresh
// @route GET /auth/refresh
// @access Public - because access token has expired
const refresh = (req, res) => {
  const cookies = req.cookies
  console.log('cookies:', cookies)

  if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized' })

  const refreshToken = cookies.jwt

  jwt.verify(refreshToken, process.env.APP_REFRESH_SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Forbidden' })

    const foundUser = await UserModel.findOne({ username: decoded.username }).exec()

    if (!foundUser) return res.status(401).json({ message: 'Unauthorized' })

    const accessToken = jwt.sign(
      {
        UserInfo: {
          username: foundUser.username,
          roles: foundUser.roles
        }
      },
      process.env.APP_ACCESS_SECRET,
      { expiresIn: '15m' }
    )

    res.json({ accessToken })
  })
}

// @desc Forgot Password
// @route GET /auth/forgot-password
// @access Public - because user forger their password
const forgotPassword = async (req, res) => {
  const { email } = req.body
  const user = await UserModel.findOne({ email })

  if (!user) return res.status(404).json({ message: 'User does not exist.' })

  // Delete token if it exists in database
  let token = await TokenModel.findOne({ userId: user._id })

  if (token) await token.deleteOne()

  // Create Reste Token
  let resetToken = crypto.randomBytes(32).toString('hex') + user._id

  // Hash token before saving to DB
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')

  // Save Token to DB
  await new TokenModel({
    userId: user._id,
    token: hashedToken,
    createdAt: Date.now(),
    expiredAt: Date.now() + 30 * (60 * 1000) // Thirty minutes
  }).save()

  // Construct Reset Url
  const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`

  // Reset Email
  const message = `
      <h2>Hello ${user.name}</h2>
      <p>Please use the url below to reset your password</p>
      <p>This reset link is valid for only 30minutes.</p>
      <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
      <p>Regards...</p>
      <p>Pinvent Team</p>
    `

  const subject = 'Password Reset Request'
  const sendTo = user.email
  const sentFrom = process.env.EMAIL_USER

  try {
    await sendEmail(subject, message, sendTo, sentFrom)
    res.status(200).json({ message: 'Reset Email Sent.' })
  } catch (err) {
    Logging.error(err)
    res.status(500).json({ message: 'Email not sent, please try again.' })
  }
}

// @desc Reset Password
// @route GET /auth/reset-password
// @access Public - because user forger their password
const resetPassword = async (req, res) => {
  const { password } = req.body
  const { resetToken } = req.params

  try {
    // Hash token, then compare to Token in DB
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    // Find token in database
    const userToken = await TokenModel.findOne({
      token: hashedToken,
      expiredAt: { $gt: Date.now() }
    })

    if (!userToken) return res.status(404).json({ message: 'Invalid or Expired tokenModel.' })

    // Find user
    const user = await UserModel.findOne({ _id: userToken.userId })

    user.password = password

    await user.save()

    res.status(200).json({
      message: 'Password Reset Successful, Please Login.'
    })
  } catch (err) {
    Logging.error(err)
    res.status(400).json({ message: 'Bad request.' })
  }
}

// @desc Logout
// @route POST /auth/logout
// @access Public - just to clear cookie if exists
const logout = (req, res) => {
  const cookies = req.cookies
  try {
    if (!cookies?.jwt) return res.sendStatus(204) //No content
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
    res.json({ message: 'Cookie cleared.' })
  } catch (err) {
    Logging.error(err)
    res.status(400).json({ message: 'Bad request.' })
  }
}

export default {
  login,
  profile,
  refresh,
  forgotPassword,
  resetPassword,
  logout
}
