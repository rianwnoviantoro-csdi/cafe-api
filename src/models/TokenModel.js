import mongoose from 'mongoose'

const tokenSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  token: { type: String, required: true },
  createdAt: { type: Date, required: true },
  expiredAt: { type: Date, required: true }
})

export default mongoose.model('Token', tokenSchema)
