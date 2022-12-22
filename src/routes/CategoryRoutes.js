import express from 'express'
import verifyJWT from '../middlewares/VerifyJWT.js'
import CategoryController from '../controllers/CategoryController.js'
import validator from '../middlewares/Validator.js'
import fileUpload from '../utils/fileUpload.js'

const router = express.Router()

router.post('/', verifyJWT, fileUpload.upload.single('image'), validator('createCategory'), CategoryController.createCategory)

export default router
