import dotenv from 'dotenv'
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'

import { DBConnect } from './src/configs/Database.js'
import { corsOption } from './src/configs/CorsOption.js'
import { logger, logEvents } from './src/middlewares/Logger.js'
import { errorHandler } from './src/middlewares/ErrorHandler.js'
import Logging from './src/libraries/logging.js'
import userRoute from './src/routes/UserRoutes.js'
import authRoute from './src/routes/AuthRoutes.js'
import categoryRoute from './src/routes/CategoryRoutes.js'
import productRoute from './src/routes/ProductRoutes.js'
import analyticRoute from './src/routes/AnalyticRoutes.js'

dotenv.config()

const app = express()
const PORT = process.env.APP_PORT || 3500

DBConnect()

// Middlweare
app.use(logger)
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors(corsOption))

// Error middleware
app.use(errorHandler)

mongoose.connection.once('open', () => {
  Logging.info(process.env.APP_ENV)
  Logging.info('MongoDB Connected')
  startServer()
})

mongoose.connection.on('error', (error) => {
  Logging.error(error)
  logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
})

const startServer = () => {
  app.use((req, res, next) => {
    // Log the request
    Logging.info(`Incoming -> Method: [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}]`)

    res.on('finish', () => {
      // Log the response
      Logging.info(`Incoming -> Method: [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}] - Status: [${res.statusCode}]`)
    })

    next()
  })

  // Health check
  app.get('/', (req, res) => {
    res.send('Ok')
  })

  // Route middleware
  app.use('/api/users', userRoute)
  app.use('/api/categories', categoryRoute)
  app.use('/api/products', productRoute)
  app.use('/api/analytics', analyticRoute)
  app.use('/api/auth', authRoute)

  app.listen(PORT, () => Logging.info(`Server running on port ${PORT}`))
}
