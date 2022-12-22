import Joi from 'joi'

const createCategorySchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow(''),
  image: Joi.any().allow('')
}).options({ abortEarly: false })

export default createCategorySchema
