import Joi from 'joi'

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().lowercase().required()
})

export default forgotPasswordSchema
