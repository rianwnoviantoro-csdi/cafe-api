import Joi from 'joi'

const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().min(6).required(),
  password: Joi.string().min(6).required()
})

export default changePasswordSchema
