import Validators from '../validators/index.js'
import Logging from '../libraries/logging.js'
import { logEvents } from './Logger.js'

export default function (validator) {
  //! If validator is not exist, throw err
  if (!Validators.hasOwnProperty(validator)) {
    Logging.error(`'${validator}' validator is not exist`)
    throw new Error(`'${validator}' validator is not exist`)
  }

  return async function (req, res, next) {
    try {
      const validated = await Validators[validator].validateAsync(req.body)
      req.body = validated
      next()
    } catch (err) {
      logEvents(`${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, 'errLog.log')
      Logging.error(err.stack)
      if (err.isJoi)
        return res.status(422).json({
          message: err.message,
          stack: process.env.APP_ENV === 'development' ? err.stack : null
        })

      return res.status(500).json({
        message: err.message,
        stack: process.env.APP_ENV === 'development' ? err.stack : null
      })
    }
  }
}
