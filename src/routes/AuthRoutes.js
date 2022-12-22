import express from 'express'
import verifyJWT from '../middlewares/VerifyJWT.js'
import AuthController from '../controllers/AuthController.js'
import loginLimiter from '../middlewares/LoginLimiter.js'
import validator from '../middlewares/Validator.js'

const router = express.Router()

router.post('/', loginLimiter, validator('login'), AuthController.login)
router.get('/profile', verifyJWT, AuthController.profile)
router.get('/refresh', AuthController.refresh)
router.post('/forgot-password', validator('forgotPassword'), AuthController.forgotPassword)
router.put('/reset-password/:resetToken', AuthController.resetPassword)
router.post('/logout', AuthController.logout)

export default router
