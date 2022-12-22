import express from 'express'
import verifyJWT from '../middlewares/VerifyJWT.js'
import AnalyticController from '../controllers/AnalyticController.js'

const router = express.Router()

router.use(verifyJWT)

router.get('/', AnalyticController.getAnalytics)

export default router
