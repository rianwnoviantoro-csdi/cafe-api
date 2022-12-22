import slugify from 'slugify'
import Logging from '../libraries/logging.js'
import ProductModel from '../models/ProductModel.js'
import UserModel from '../models/UserModel.js'
import { uploadStream } from '../utils/cloudinary.js'

// @desc Create a new product
// @route POST /products
// @access Private
const createProduct = async (req, res) => {
  const { name, sku, category, quantity, price, description } = req.body
  try {
    let images = []

    if (req.files) {
      const rawImages = req.files

      let uploadedImage

      for (const rawImage of rawImages) {
        uploadedImage = await uploadStream(rawImage.buffer, 'products', 640)

        images.push(uploadedImage.secure_url)
      }
    }

    const user = await UserModel.findOne({ username: req.user })

    // Create Product
    const product = await ProductModel.create({
      user: user._id,
      name,
      slug: slugify(name).toLowerCase(),
      sku,
      category,
      quantity,
      price,
      description,
      image: images
    })

    if (product) {
      res.status(201).json({ message: `New product ${name} created.` })
    } else {
      res.status(400).json({ message: 'Invalid product data received.' })
    }
  } catch (err) {
    Logging.error(err)
    res.status(400).json({ message: 'Bad request.' })
  }
}

// @desc Get all products
// @route GET /products
// @access Public
const getProducts = async (req, res) => {
  const { page = 1, limit = 10, search = '', sortBy = 'createdAt', orderBy = 'desc' } = req.query
  try {
    let nextPage
    let prevPage
    const filter = { $or: [{ name: { $regex: '.*' + search + '.*', $options: 'i' } }, { sku: { $regex: '.*' + search + '.*', $options: 'i' } }] }
    const offset = (page - 1) * limit
    const productsCount = await ProductModel.find(filter).count().lean()
    const totalPage = Math.ceil(parseInt(productsCount) / parseInt(limit))

    if (totalPage > 1 && parseInt(page) !== totalPage) {
      nextPage = parseInt(page) + 1
    } else {
      nextPage = null
    }

    if (parseInt(page) !== 1) {
      prevPage = parseInt(page) - 1
    } else {
      prevPage = null
    }

    let sorting = {}

    sorting[sortBy] = orderBy

    const products = await ProductModel.find(filter)
      .limit(limit)
      .skip(offset)
      .sort(sorting)
      .populate([
        { path: 'user', select: 'name' },
        { path: 'category', select: 'name image' }
      ])
      .lean()

    if (!products?.length) return res.status(404).json({ message: 'Not found.' })

    res.status(200).json({
      message: 'Success.',
      total: productsCount,
      data: products,
      totalPage: totalPage,
      currentPage: parseInt(page),
      nextPage: nextPage,
      prevPage: prevPage
    })
  } catch (err) {
    Logging.error(err)
    res.status(400).json({ message: 'Bad request.' })
  }
}

export default {
  createProduct,
  getProducts
}
