import UserModel from '../models/UserModel.js'
import CategoryModel from '../models/CategoryModel.js'
import ProductModel from '../models/ProductModel.js'
import Logging from '../libraries/logging.js'

const getAnalytics = async (req, res) => {
  let { year } = req.query

  try {
    const month = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

    const groupBy = {
      _id: { $month: '$createdAt' },
      count: { $sum: 1 }
    }

    const project = {
      _id: true,
      month: {
        $arrayElemAt: [month, '$_id']
      },
      count: true
    }

    let filterDate = {
      createdAt: {
        $gte: new Date(year, 1, 1),
        $lte: new Date(year, 12, 31)
      }
    }

    if (!year) {
      filterDate = {
        createdAt: {
          $gte: new Date(2022, 1, 1),
          $lte: new Date(2022, 12, 31)
        }
      }
    }
    const userCount = await UserModel.count(filterDate)
    const newUserPerMonth = await UserModel.aggregate([{ $match: filterDate }, { $group: groupBy }, { $project: project }])
    const productsCount = await ProductModel.count(filterDate)
    const newProductPerMonth = await ProductModel.aggregate([{ $match: filterDate }, { $group: groupBy }, { $project: project }])
    const categoryCount = await CategoryModel.count(filterDate)
    const newCategoryPerMonth = await CategoryModel.aggregate([{ $match: filterDate }, { $group: groupBy }, { $project: project }])

    res.status(200).json({
      users: {
        count: userCount,
        userPerMonth: newUserPerMonth
      },
      products: {
        count: productsCount,
        productPerMonth: newProductPerMonth
      },
      categories: {
        count: categoryCount,
        categoryPerMonth: newCategoryPerMonth
      }
    })
  } catch (err) {
    Logging.error(err.message)
    res.status(400).json({ message: 'Bad request.' })
  }
}

export default {
  getAnalytics
}
