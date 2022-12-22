import mongoose from 'mongoose'

const productSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    name: { type: String, required: [true, 'Please enter a name'], trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    sku: { type: String, required: true, default: 'SKU', trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, required: false, ref: 'Category' },
    quantity: { type: String, required: [true, 'Please enter a quantity'], trim: true },
    price: { type: String, required: [true, 'Please enter a price'], trim: true },
    description: { type: String, required: [true, 'Please enter a description'], trim: true },
    image: [{ type: String, default: 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png?format=jpg&quality=90&v=1530129081' }]
  },
  { timestamps: true }
)

export default mongoose.model('Product', productSchema)
