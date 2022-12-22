import Joi from 'joi'

const updateProfileSchema = Joi.object({
  name: Joi.string().min(4).required(),
  phone: Joi.string().min(4).required(),
  isActive: Joi.boolean().required(),
  roles: Joi.array()
})

export default updateProfileSchema
