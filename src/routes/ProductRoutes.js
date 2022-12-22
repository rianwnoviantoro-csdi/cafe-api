import express from 'express'
import verifyJWT from '../middlewares/VerifyJWT.js'
import validator from '../middlewares/Validator.js'
import fileUpload from '../utils/fileUpload.js'
import ProductController from '../controllers/ProductController.js'

const router = express.Router()

router.post('/', verifyJWT, fileUpload.upload.array('images', 6), ProductController.createProduct)
router.get('/', ProductController.getProducts)

export default router
