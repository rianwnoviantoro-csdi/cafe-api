import mongoose from 'mongoose'
import Logging from '../libraries/logging.js'

export const DBConnect = async () => {
  try {
    await mongoose.connect(process.env.APP_DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
  } catch (err) {
    Logging.error(err.message)
  }
}
