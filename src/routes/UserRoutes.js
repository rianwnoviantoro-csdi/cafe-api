import express from 'express'
import UserController from '../controllers/UserController.js'
import verifyJWT from '../middlewares/VerifyJWT.js'
import validator from '../middlewares/Validator.js'

const router = express.Router()

router.use(verifyJWT)

router.get('/', UserController.getAllUsers)
router.post('/', validator('register'), UserController.createNew)
router.patch('/update-profile', validator('updateProfile'), UserController.updateProfile)
router.patch('/change-password', validator('changePassword'), UserController.changePassword)

export default router
