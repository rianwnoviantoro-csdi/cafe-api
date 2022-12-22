import Logging from '../libraries/logging.js'
import { logEvents } from './Logger.js'

export const errorHandler = (err, req, res, next) => {
  logEvents(`${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, 'errLog.log')
  Logging.error(err.stack)

  const status = res.statusCode ? res.statuseCode : 500

  res.status(status).json({
    message: err.message,
    stack: process.env.APP_ENV === 'development' ? err.stack : null
  })
}
