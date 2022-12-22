import Joi from 'joi'

const registerSchema = Joi.object({
  name: Joi.string().min(4).required(),
  username: Joi.string().min(4).required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(6).required(),
  roles: Joi.array()
})

export default registerSchema
