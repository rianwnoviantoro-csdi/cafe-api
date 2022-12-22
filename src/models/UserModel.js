import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      minLength: [4, 'name must be at least 4 characters']
    },
    username: {
      type: String,
      required: [true, 'Please add a username'],
      minLength: [4, 'Username must be at least 4 characters'],
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please add a email'],
      unique: true,
      trim: true,
      match: [/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please enter a valid emaial']
    },
    password: { type: String, required: [true, 'Please enter a password'], minLength: [6, 'Password must be at least 6 characters'] },
    avatar: { type: String, required: [true, 'Please enter a avatar'], default: 'https://www.treasury.gov.ph/wp-content/uploads/2022/01/male-placeholder-image.jpeg' },
    phone: { type: String, default: '+62' },
    roles: [{ type: String, required: true, default: 'Employee' }],
    isActive: { type: Boolean, required: true, default: true }
  },
  { timestamps: true }
)

// Encrypt password before saving to database
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next()
  }

  // Hash password
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(this.password, salt)
  this.password = hashedPassword
  next()
})

export default mongoose.model('User', userSchema)
