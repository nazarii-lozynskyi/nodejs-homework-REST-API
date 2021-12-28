const { Schema, model } = require('mongoose');
const Joi = require('joi');

const contactSchema = Schema(
  {
    name: { type: String, required: true, minlength: 2 },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    favorite: {
      type: Boolean,
      default: false,
    },
  },
  { versionKey: false, timestamps: true }
);

const joiSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().required(),
  phone: Joi.string().required(),
});

const Contact = model('contact', contactSchema);

module.exports = { Contact, joiSchema };
