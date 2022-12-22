import Joi from 'joi'

const loginSchema = Joi.object({
  usernameOrEmail: Joi.string().min(4).lowercase().required(),
  password: Joi.string().min(6).required()
}).options({ abortEarly: false })

export default loginSchema
