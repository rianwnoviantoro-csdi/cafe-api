import mongoose from 'mongoose'

const categorySchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    name: { type: String, required: [true, 'Please enter a name'], trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: false, trim: true },
    image: { type: String, default: 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png?format=jpg&quality=90&v=1530129081' }
  },
  { timestamps: true }
)

export default mongoose.model('Category', categorySchema)
